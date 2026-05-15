import { createServerFn } from "@tanstack/react-start";

function env() {
  const url = process.env.EVOLUTION_API_URL;
  const key = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE_NAME;
  if (!url || !key || !instance) {
    throw new Error("Evolution API não configurada (URL, KEY, INSTANCE).");
  }
  return { url: url.replace(/\/$/, ""), key, instance };
}

async function evo(path: string, init: RequestInit = {}) {
  const { url, key } = env();
  const res = await fetch(`${url}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    throw new Error(`Evolution ${res.status}: ${typeof data === "string" ? data : JSON.stringify(data)}`);
  }
  return data;
}

export const getInstanceStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { instance } = env();
  try {
    const data = await evo(`/instance/connectionState/${instance}`);
    const state = data?.instance?.state ?? data?.state ?? "unknown";
    return { connected: state === "open", state };
  } catch (e: any) {
    return { connected: false, state: "error", error: e.message };
  }
});

export const connectInstance = createServerFn({ method: "POST" }).handler(async () => {
  const { instance } = env();
  // Tenta criar instância (ignora erro se já existe)
  try {
    await evo(`/instance/create`, {
      method: "POST",
      body: JSON.stringify({ instanceName: instance, qrcode: true, integration: "WHATSAPP-BAILEYS" }),
    });
  } catch { /* já existe */ }
  const data = await evo(`/instance/connect/${instance}`);
  const qr = data?.base64 || data?.qrcode?.base64 || data?.qr || null;
  const code = data?.code || data?.pairingCode || null;
  return { qr, code, raw: data };
});

export const logoutInstance = createServerFn({ method: "POST" }).handler(async () => {
  const { instance } = env();
  await evo(`/instance/logout/${instance}`, { method: "DELETE" });
  return { ok: true };
});

export const fetchContacts = createServerFn({ method: "GET" }).handler(async () => {
  const { instance } = env();
  try {
    const data = await evo(`/chat/findContacts/${instance}`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    const list = Array.isArray(data) ? data : data?.contacts ?? [];
    return list
      .map((c: any) => ({
        id: c.id || c.remoteJid || c.jid,
        name: c.pushName || c.name || c.notify || c.id?.split("@")[0] || "Sem nome",
        number: (c.id || c.remoteJid || "").split("@")[0],
      }))
      .filter((c: any) => c.id && !c.id.includes("@g.us"))
      .slice(0, 200);
  } catch (e: any) {
    return [];
  }
});
