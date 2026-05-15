import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState, DragEvent } from "react";

import {
  PackageCheck, Send, Receipt, Plus, Smartphone, RefreshCw,
  CheckCircle2, AlertCircle, Search, Phone, User, Trash2, Download, Tag,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  getInstanceStatus, connectInstance, logoutInstance, fetchContacts,
} from "@/lib/evolution.functions";
import {
  fetchChatwootBoard, moveConversationLabel, testChatwootConnection,
} from "@/lib/chatwoot.functions";

export const Route = createFileRoute("/crm")({
  component: CRMPage,
});

type Card = { id: string; name: string; number: string; note?: string; createdAt: number; conversationId?: number };
type ColumnKey = "to_send" | "sent" | "to_charge";

const COLUMNS: { key: ColumnKey; title: string; subtitle: string; icon: any; accent: string }[] = [
  { key: "to_send",   title: "Pedidos a serem enviados", subtitle: "Aguardando despacho",  icon: PackageCheck, accent: "gold"   },
  { key: "sent",      title: "Pedidos enviados",          subtitle: "Em rota / entregues",  icon: Send,         accent: "green"  },
  { key: "to_charge", title: "Pedidos a cobrar",          subtitle: "Aguardando pagamento", icon: Receipt,      accent: "warn"   },
];

const STORAGE_KEY = "crm-board-v1";

const SEED: Record<ColumnKey, Card[]> = {
  to_send: [],
  sent: [],
  to_charge: [],
};

function CRMPage() {
  const [board, setBoard] = useState<Record<ColumnKey, Card[]>>(SEED);
  const [dragging, setDragging] = useState<{ id: string; from: ColumnKey } | null>(null);
  const [overCol, setOverCol] = useState<ColumnKey | null>(null);
  const [contactDrawer, setContactDrawer] = useState(false);
  const [search, setSearch] = useState("");

  // WhatsApp connection state
  const statusFn  = useServerFn(getInstanceStatus);
  const connectFn = useServerFn(connectInstance);
  const logoutFn  = useServerFn(logoutInstance);
  const contactsFn = useServerFn(fetchContacts);

  // Chatwoot
  const cwBoardFn = useServerFn(fetchChatwootBoard);
  const cwMoveFn = useServerFn(moveConversationLabel);
  const cwTestFn = useServerFn(testChatwootConnection);
  const [cwState, setCwState] = useState<{ ok: boolean; error?: string } | null>(null);
  const [cwSyncing, setCwSyncing] = useState(false);

  const [waState, setWaState] = useState<{ connected: boolean; state: string; error?: string }>({ connected: false, state: "loading" });
  const [qr, setQr] = useState<string | null>(null);
  const [pairCode, setPairCode] = useState<string | null>(null);
  const [contacts, setContacts] = useState<{ id: string; name: string; number: string }[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Persist board
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setBoard(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
  }, [board]);

  // Poll status
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const s = await statusFn();
        if (alive) setWaState(s);
        if (s.connected) setQr(null);
      } catch (e: any) {
        if (alive) setWaState({ connected: false, state: "error", error: e.message });
      }
    };
    tick();
    const id = setInterval(tick, 5000);
    return () => { alive = false; clearInterval(id); };
  }, [statusFn]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const r = await connectFn();
      setQr(r.qr || null);
      setPairCode(r.code || null);
    } catch (e: any) {
      alert("Erro: " + e.message);
    } finally {
      setConnecting(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm("Desconectar o WhatsApp?")) return;
    try { await logoutFn(); setQr(null); setPairCode(null); } catch (e: any) { alert(e.message); }
  };

  const loadContacts = async () => {
    setLoadingContacts(true);
    try {
      const c = await contactsFn();
      setContacts(c);
    } catch (e: any) { alert(e.message); }
    finally { setLoadingContacts(false); }
  };

  // DnD
  const onDragStart = (id: string, from: ColumnKey) => setDragging({ id, from });
  const onDragOver = (e: DragEvent, key: ColumnKey) => {
    e.preventDefault();
    setOverCol(key);
  };
  const syncChatwoot = async () => {
    setCwSyncing(true);
    try {
      const test = await cwTestFn();
      setCwState(test.ok ? { ok: true } : { ok: false, error: test.error });
      if (!test.ok) return;
      const remote = await cwBoardFn();
      // Merge: keep local-only cards (no conversationId), replace Chatwoot ones
      setBoard((b) => {
        const out: Record<ColumnKey, Card[]> = { to_send: [], sent: [], to_charge: [] };
        (Object.keys(out) as ColumnKey[]).forEach((k) => {
          const local = b[k].filter((c) => !c.conversationId);
          out[k] = [...remote[k], ...local];
        });
        return out;
      });
    } catch (e: any) {
      setCwState({ ok: false, error: e.message });
    } finally {
      setCwSyncing(false);
    }
  };

  const onDrop = (to: ColumnKey) => {
    if (!dragging) return;
    const from = dragging.from;
    const id = dragging.id;
    setBoard((b) => {
      if (from === to) return b;
      const card = b[from].find((c) => c.id === id);
      if (!card) return b;
      // Sync label to Chatwoot if this is a Chatwoot card
      if (card.conversationId) {
        cwMoveFn({ data: { conversationId: card.conversationId, from, to } }).catch((e) =>
          console.error("Chatwoot label sync failed:", e)
        );
      }
      return {
        ...b,
        [from]: b[from].filter((c) => c.id !== id),
        [to]: [card, ...b[to]],
      };
    });
    setDragging(null);
    setOverCol(null);
  };

  const addContactToColumn = (contact: { name: string; number: string }, col: ColumnKey) => {
    const card: Card = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: contact.name,
      number: contact.number,
      createdAt: Date.now(),
    };
    setBoard((b) => ({ ...b, [col]: [card, ...b[col]] }));
  };

  const removeCard = (col: ColumnKey, id: string) => {
    setBoard((b) => ({ ...b, [col]: b[col].filter((c) => c.id !== id) }));
  };

  const filteredContacts = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) => c.name.toLowerCase().includes(q) || c.number.includes(q));
  }, [contacts, search]);

  return (
    <AppShell title="CRM de Pedidos" subtitle="Gestão visual de envios, entregas e cobranças via WhatsApp">
      {/* Top: WA Status + actions */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass-card lg:col-span-2 flex items-center gap-4 rounded-2xl p-5">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ring-1 ${
            waState.connected ? "bg-success/10 text-success ring-success/30" : "bg-warning/10 text-warning ring-warning/30"
          }`}>
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground">WhatsApp · Evolution API</p>
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ring-1 ${
                waState.connected
                  ? "bg-success/15 text-success ring-success/30"
                  : "bg-warning/15 text-warning ring-warning/30"
              }`}>
                {waState.connected ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                {waState.connected ? "Conectado" : waState.state}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {waState.connected
                ? "Sessão ativa. Importe contatos para o quadro."
                : "Conecte sua conta para importar contatos como cards."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {waState.connected ? (
              <>
                <button
                  onClick={() => { setContactDrawer(true); if (contacts.length === 0) loadContacts(); }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-gold px-3 py-2 text-xs font-medium text-primary-foreground"
                >
                  <Download className="h-3.5 w-3.5" /> Importar contatos
                </button>
                <button
                  onClick={handleLogout}
                  className="rounded-lg border border-border bg-input/40 px-3 py-2 text-xs text-muted-foreground hover:text-destructive"
                >
                  Sair
                </button>
              </>
            ) : (
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-gold px-3 py-2 text-xs font-medium text-primary-foreground disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${connecting ? "animate-spin" : ""}`} />
                {connecting ? "Gerando QR..." : "Conectar WhatsApp"}
              </button>
            )}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Total de cards</p>
              <p className="mt-2 font-display text-3xl text-foreground">
                {board.to_send.length + board.sent.length + board.to_charge.length}
              </p>
            </div>
            <button
              onClick={syncChatwoot}
              disabled={cwSyncing}
              title="Sincronizar com Chatwoot"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-input/40 px-2.5 py-1.5 text-[11px] text-muted-foreground hover:text-gold disabled:opacity-50"
            >
              <Tag className={`h-3.5 w-3.5 ${cwSyncing ? "animate-pulse" : ""}`} />
              {cwSyncing ? "Sincronizando..." : "Sync Chatwoot"}
            </button>
          </div>
          <div className="mt-2 flex gap-3 text-[11px] text-muted-foreground">
            <span>A enviar <b className="text-gold">{board.to_send.length}</b></span>
            <span>Enviados <b className="text-success">{board.sent.length}</b></span>
            <span>A cobrar <b className="text-warning">{board.to_charge.length}</b></span>
          </div>
          {cwState && !cwState.ok && (
            <p className="mt-2 text-[10px] text-destructive truncate" title={cwState.error}>
              Chatwoot: {cwState.error}
            </p>
          )}
          {cwState?.ok && (
            <p className="mt-2 text-[10px] text-success">Chatwoot conectado</p>
          )}
        </div>
      </div>

      {/* QR */}
      
        {qr && !waState.connected && (
          <div
            
            className="mb-6 glass-card flex flex-col items-center gap-3 rounded-2xl p-6 sm:flex-row"
          >
            <img src={qr.startsWith("data:") ? qr : `data:image/png;base64,${qr}`} alt="QR" className="h-48 w-48 rounded-xl bg-white p-2" />
            <div>
              <p className="font-display text-lg text-foreground">Escaneie o QR no WhatsApp</p>
              <p className="mt-1 text-sm text-muted-foreground">Abra WhatsApp → Aparelhos conectados → Conectar aparelho.</p>
              {pairCode && (
                <p className="mt-3 text-sm">
                  Ou use código: <span className="font-mono text-gold">{pairCode}</span>
                </p>
              )}
            </div>
          </div>
        )}
      

      {/* Board */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {COLUMNS.map((col) => {
          const Icon = col.icon;
          const cards = board[col.key];
          const isOver = overCol === col.key;
          const accent =
            col.accent === "gold"  ? "from-gold/20 to-transparent ring-gold/30 text-gold"
            : col.accent === "green" ? "from-success/20 to-transparent ring-success/30 text-success"
            : "from-warning/20 to-transparent ring-warning/30 text-warning";
          return (
            <div
              key={col.key}
              onDragOver={(e) => onDragOver(e, col.key)}
              onDragLeave={() => setOverCol(null)}
              onDrop={() => onDrop(col.key)}
              className={`glass-card rounded-2xl p-4 transition ${isOver ? "ring-2 ring-gold/50" : ""}`}
            >
              <div className={`mb-4 flex items-center justify-between rounded-xl bg-gradient-to-r p-3 ring-1 ${accent}`}>
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  <div>
                    <p className="font-display text-sm text-foreground">{col.title}</p>
                    <p className="text-[11px] text-muted-foreground">{col.subtitle}</p>
                  </div>
                </div>
                <span className="rounded-full bg-background/40 px-2 py-0.5 text-xs font-mono">{cards.length}</span>
              </div>

              <div className="space-y-2.5 min-h-32">
                
                  {cards.map((c) => (
                    <div
                      key={c.id}
                      draggable
                      onDragStart={() => onDragStart(c.id, col.key)}
                      onDragEnd={() => { setDragging(null); setOverCol(null); }}
                      className="group cursor-grab rounded-xl border border-border/50 bg-input/40 p-3 hover:border-gold/40 hover:bg-input/60 active:cursor-grabbing"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-gold text-[10px] font-semibold text-primary-foreground">
                            {c.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{c.name}</p>
                            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Phone className="h-3 w-3" /> {formatPhone(c.number)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeCard(col.key, c.id)}
                          className="opacity-0 transition group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {c.note && (
                        <p className="mt-2 rounded-md border border-border/40 bg-background/40 px-2 py-1 text-[11px] text-muted-foreground">
                          {c.note}
                        </p>
                      )}
                    </div>
                  ))}
                

                {cards.length === 0 && (
                  <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border/60 text-xs text-muted-foreground">
                    Arraste cards para cá
                  </div>
                )}
              </div>

              <button
                onClick={() => { setContactDrawer(true); if (waState.connected && contacts.length === 0) loadContacts(); }}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/60 py-2 text-xs text-muted-foreground hover:border-gold/40 hover:text-gold"
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar contato
              </button>
            </div>
          );
        })}
      </div>

      {/* Contacts drawer */}
      
        {contactDrawer && (
          <div
            
            className="fixed inset-0 z-50 flex justify-end bg-background/70 backdrop-blur-sm"
            onClick={() => setContactDrawer(false)}
          >
            <div
              
              onClick={(e) => e.stopPropagation()}
              className="flex h-full w-full max-w-md flex-col border-l border-border bg-card"
            >
              <div className="flex items-center justify-between border-b border-border p-5">
                <div>
                  <p className="font-display text-lg text-foreground">Contatos WhatsApp</p>
                  <p className="text-xs text-muted-foreground">{contacts.length} importados</p>
                </div>
                <button onClick={loadContacts} className="rounded-lg border border-border bg-input/40 p-2 text-muted-foreground hover:text-gold">
                  <RefreshCw className={`h-4 w-4 ${loadingContacts ? "animate-spin" : ""}`} />
                </button>
              </div>

              <div className="border-b border-border p-4">
                <div className="flex items-center gap-2 rounded-xl border border-border bg-input/40 px-3 py-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar nome ou número..."
                    className="w-full bg-transparent text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-thin">
                {!waState.connected ? (
                  <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">
                    <AlertCircle className="h-6 w-6 text-warning" />
                    Conecte o WhatsApp para importar contatos.
                  </div>
                ) : loadingContacts ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">Carregando contatos...</div>
                ) : filteredContacts.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    Nenhum contato. Adicione manualmente abaixo.
                  </div>
                ) : (
                  <ul className="divide-y divide-border/50">
                    {filteredContacts.map((c) => (
                      <li key={c.id} className="flex items-center gap-3 p-3 hover:bg-accent/30">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-gold text-xs font-semibold text-primary-foreground">
                          {c.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-foreground">{c.name}</p>
                          <p className="text-[11px] text-muted-foreground">{formatPhone(c.number)}</p>
                        </div>
                        <ColumnPicker onPick={(col) => addContactToColumn(c, col)} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <ManualAddForm onAdd={(contact, col) => addContactToColumn(contact, col)} />
            </div>
          </div>
        )}
      
    </AppShell>
  );
}

function ColumnPicker({ onPick }: { onPick: (c: ColumnKey) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-lg bg-gradient-gold px-2 py-1 text-[10px] font-medium text-primary-foreground"
      >
        + Etiqueta
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-xl border border-border bg-popover p-1 shadow-xl">
          {COLUMNS.map((c) => (
            <button
              key={c.key}
              onClick={() => { onPick(c.key); setOpen(false); }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs hover:bg-accent"
            >
              <c.icon className="h-3.5 w-3.5 text-gold" />
              {c.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ManualAddForm({ onAdd }: { onAdd: (c: { name: string; number: string }, col: ColumnKey) => void }) {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [col, setCol] = useState<ColumnKey>("to_send");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!name || !number) return;
        onAdd({ name, number: number.replace(/\D/g, "") }, col);
        setName(""); setNumber("");
      }}
      className="border-t border-border p-4 space-y-2"
    >
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Adicionar manualmente</p>
      <div className="flex gap-2">
        <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-border bg-input/40 px-2 py-1.5">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" className="w-full bg-transparent text-xs focus:outline-none" />
        </div>
        <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-border bg-input/40 px-2 py-1.5">
          <Phone className="h-3.5 w-3.5 text-muted-foreground" />
          <input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="55119..." className="w-full bg-transparent text-xs focus:outline-none" />
        </div>
      </div>
      <div className="flex gap-2">
        <select value={col} onChange={(e) => setCol(e.target.value as ColumnKey)} className="flex-1 rounded-lg border border-border bg-input/40 px-2 py-1.5 text-xs">
          {COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.title}</option>)}
        </select>
        <button type="submit" className="rounded-lg bg-gradient-gold px-3 py-1.5 text-xs font-medium text-primary-foreground">
          Adicionar
        </button>
      </div>
    </form>
  );
}

function formatPhone(n: string) {
  const d = (n || "").replace(/\D/g, "");
  if (d.length === 13) return `+${d.slice(0,2)} (${d.slice(2,4)}) ${d.slice(4,9)}-${d.slice(9)}`;
  if (d.length === 12) return `+${d.slice(0,2)} (${d.slice(2,4)}) ${d.slice(4,8)}-${d.slice(8)}`;
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  return n;
}
