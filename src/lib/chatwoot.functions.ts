import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const CHATWOOT_LABELS = {
  to_send: "pedido-a-enviar",
  sent: "pedido-enviado",
  to_charge: "pedido-a-cobrar",
  paid: "pedido-pago",
} as const;

type ColumnKey = keyof typeof CHATWOOT_LABELS;

function getConfig() {
  const raw = process.env.CHATWOOT_BASE_URL || "";
  // Normalize: keep only origin (strip /app/... paths)
  let baseUrl = raw;
  try {
    const u = new URL(raw);
    baseUrl = `${u.protocol}//${u.host}`;
  } catch {}
  const token = process.env.CHATWOOT_API_ACCESS_TOKEN || "";
  const accountId = process.env.CHATWOOT_ACCOUNT_ID || "";
  const inboxId = process.env.CHATWOOT_INBOX_ID || "";
  if (!baseUrl || !token || !accountId) {
    throw new Error("Chatwoot não configurado (verifique CHATWOOT_BASE_URL, TOKEN, ACCOUNT_ID).");
  }
  return { baseUrl, token, accountId, inboxId };
}

async function cw(path: string, init: RequestInit = {}) {
  const { baseUrl, token } = getConfig();
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      api_access_token: token,
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Chatwoot ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

export const testChatwootConnection = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { accountId, baseUrl } = getConfig();
    const data = await cw(`/api/v1/accounts/${accountId}/labels`);
    return { ok: true, baseUrl, labelsCount: Array.isArray(data?.payload) ? data.payload.length : 0 };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
});

export const fetchChatwootBoard = createServerFn({ method: "GET" }).handler(async () => {
  const { accountId } = getConfig();
  const result: Record<ColumnKey, Array<{ id: string; conversationId: number; name: string; number: string; note?: string; createdAt: number }>> = {
    to_send: [],
    sent: [],
    to_charge: [],
    paid: [],
  };

  for (const [col, label] of Object.entries(CHATWOOT_LABELS) as [ColumnKey, string][]) {
    try {
      const data = await cw(
        `/api/v1/accounts/${accountId}/conversations?labels[]=${encodeURIComponent(label)}&status=open&page=1`
      );
      const items = data?.data?.payload || data?.payload || [];
      result[col] = items.map((c: any) => {
        const contact = c?.meta?.sender || {};
        const last = c?.messages?.[c.messages.length - 1]?.content || c?.last_non_activity_message?.content;
        return {
          id: `cw-${c.id}`,
          conversationId: c.id,
          name: contact.name || contact.phone_number || `#${c.id}`,
          number: (contact.phone_number || "").replace(/\D/g, ""),
          note: last ? String(last).slice(0, 80) : undefined,
          createdAt: (c.created_at || 0) * 1000 || Date.now(),
        };
      });
    } catch (e) {
      // Skip column on error; surface via testConnection
    }
  }
  return result;
});

export const moveConversationLabel = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      conversationId: z.number(),
      from: z.enum(["to_send", "sent", "to_charge", "paid"]).nullable(),
      to: z.enum(["to_send", "sent", "to_charge", "paid"]),
    })
  )
  .handler(async ({ data }) => {
    const { accountId } = getConfig();
    // Get current labels
    const current = await cw(`/api/v1/accounts/${accountId}/conversations/${data.conversationId}/labels`);
    const existing: string[] = current?.payload || [];
    const removed = data.from ? CHATWOOT_LABELS[data.from] : null;
    const next = Array.from(
      new Set([...existing.filter((l) => l !== removed), CHATWOOT_LABELS[data.to]])
    );
    await cw(`/api/v1/accounts/${accountId}/conversations/${data.conversationId}/labels`, {
      method: "POST",
      body: JSON.stringify({ labels: next }),
    });
    return { ok: true, labels: next };
  });
