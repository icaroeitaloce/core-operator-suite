import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatCard, PanelCard, StatusBadge } from "@/components/Primitives";
import { ArrowDownCircle, ArrowUpCircle, Wallet, Receipt, Package, TrendingUp, Plus, Trash2 } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend } from "recharts";
import { useShipments, formatBRL } from "@/lib/shipmentsStore";
import { useManualEntries, addManualEntry, removeManualEntry, PROFIT_PER_UNIT } from "@/lib/financeStore";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/financeiro")({
  component: Financeiro,
});

const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function Financeiro() {
  const shipments = useShipments();
  const manuals = useManualEntries();

  const [type, setType] = useState<"in" | "out">("in");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");

  const data = useMemo(() => {
    const grossShipments = shipments.reduce((s, x) => s + x.total, 0);
    const units = shipments.reduce((s, x) => s + x.qty, 0);
    const profit = units * PROFIT_PER_UNIT;
    const manualIn = manuals.filter((m) => m.type === "in").reduce((s, m) => s + m.amount, 0);
    const manualOut = manuals.filter((m) => m.type === "out").reduce((s, m) => s + m.amount, 0);
    const grossTotal = grossShipments + manualIn - manualOut;
    const netCash = grossTotal;

    const now = new Date();
    const md = MONTHS.map((m) => ({ m, bruto: 0, lucro: 0 }));
    let monthGross = 0;
    for (const s of shipments) {
      const dt = new Date(s.createdAt);
      md[dt.getMonth()].bruto += s.total;
      md[dt.getMonth()].lucro += s.qty * PROFIT_PER_UNIT;
      if (dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear()) {
        monthGross += s.total;
      }
    }
    for (const m of manuals) {
      const dt = new Date(m.createdAt);
      if (m.type === "in") md[dt.getMonth()].bruto += m.amount;
    }
    return { grossShipments, grossTotal, units, profit, manualIn, manualOut, netCash, monthData: md, monthGross };
  }, [shipments, manuals]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(amount.replace(",", "."));
    if (!description.trim() || !value || value <= 0) return;
    addManualEntry({ type, description: description.trim(), category: category.trim() || (type === "in" ? "Outros" : "Despesa"), amount: value });
    setDescription(""); setCategory(""); setAmount("");
  }

  // Combined ledger
  const ledger = useMemo(() => {
    const a = shipments.map((s) => ({
      id: s.id, kind: "ship" as const, date: s.createdAt, label: s.name,
      detail: `${s.qty}× unidade(s)`, status: s.status, amount: s.total, sign: 1,
    }));
    const b = manuals.map((m) => ({
      id: m.id, kind: "manual" as const, date: m.createdAt, label: m.description,
      detail: m.category, status: m.type === "in" ? "Entrada" : "Saída", amount: m.amount, sign: m.type === "in" ? 1 : -1,
    }));
    return [...a, ...b].sort((x, y) => y.date - x.date);
  }, [shipments, manuals]);

  return (
    <AppShell title="Módulo Financeiro" subtitle="Entradas automáticas pelo CRM + lançamentos manuais">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Entradas brutas" value={formatBRL(data.grossTotal)} icon={ArrowDownCircle} accent="green" />
        <StatCard label="Lucro (R$32/un)" value={formatBRL(data.profit)} icon={TrendingUp} accent="gold" delay={0.05} />
        <StatCard label="Unidades vendidas" value={String(data.units)} icon={Package} accent="muted" delay={0.1} />
        <StatCard label="Saídas manuais" value={formatBRL(data.manualOut)} icon={ArrowUpCircle} accent="muted" delay={0.15} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <PanelCard title="Bruto vs Lucro · mensal" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" vertical={false} />
                <XAxis dataKey="m" stroke="oklch(0.7 0.02 120)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.7 0.02 120)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip
                  contentStyle={{ background: "oklch(0.20 0.028 155)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number) => formatBRL(v)}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="bruto" name="Bruto" fill="oklch(0.55 0.08 155)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lucro" name="Lucro" fill="oklch(0.78 0.13 80)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PanelCard>

        <PanelCard title="Lançamento manual">
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setType("in")}
                className={`rounded-lg px-3 py-2 text-sm ring-1 transition ${type === "in" ? "bg-success/15 text-success ring-success/40" : "bg-input/40 text-muted-foreground ring-border"}`}>
                Entrada
              </button>
              <button type="button" onClick={() => setType("out")}
                className={`rounded-lg px-3 py-2 text-sm ring-1 transition ${type === "out" ? "bg-destructive/15 text-destructive ring-destructive/40" : "bg-input/40 text-muted-foreground ring-border"}`}>
                Saída
              </button>
            </div>
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição"
              className="w-full rounded-lg border border-border bg-input/40 px-3 py-2 text-sm outline-none focus:border-gold/50" />
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder={type === "in" ? "Categoria (Outros)" : "Categoria (ex: Tráfego pago)"}
              className="w-full rounded-lg border border-border bg-input/40 px-3 py-2 text-sm outline-none focus:border-gold/50" />
            <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Valor (R$)" inputMode="decimal"
              className="w-full rounded-lg border border-border bg-input/40 px-3 py-2 text-sm outline-none focus:border-gold/50" />
            <button type="submit" className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-gold px-3 py-2 text-sm font-medium text-primary-foreground">
              <Plus className="h-4 w-4" /> Lançar
            </button>
            <p className="pt-1 text-[11px] text-muted-foreground">
              Lucro é calculado por unidade vendida (R$ {PROFIT_PER_UNIT}/un) e não é afetado pelas saídas (tráfego pago etc).
            </p>
          </form>
        </PanelCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <PanelCard title="Relatório de lucro" className="lg:col-span-1">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl border border-border/40 bg-input/30 p-3">
              <span className="text-muted-foreground">Unidades</span>
              <span className="font-mono text-gold">{data.units}×</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/40 bg-input/30 p-3">
              <span className="text-muted-foreground">Bruto (envios)</span>
              <span className="font-mono">{formatBRL(data.grossShipments)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-success/30 bg-success/10 p-3">
              <span className="text-success">Lucro líquido</span>
              <span className="font-mono text-success">{formatBRL(data.profit)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border/40 bg-input/30 p-3">
              <span className="text-muted-foreground">Caixa após saídas</span>
              <span className="font-mono">{formatBRL(data.netCash)}</span>
            </div>
          </div>
        </PanelCard>

        <PanelCard title="Evolução do lucro" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" vertical={false} />
                <XAxis dataKey="m" stroke="oklch(0.7 0.02 120)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.7 0.02 120)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip
                  contentStyle={{ background: "oklch(0.20 0.028 155)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number) => formatBRL(v)}
                />
                <Line type="monotone" dataKey="lucro" stroke="oklch(0.78 0.13 80)" strokeWidth={2.5} dot={{ fill: "oklch(0.78 0.13 80)", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </PanelCard>
      </div>

      <PanelCard title="Histórico de lançamentos" className="mt-6"
        action={<span className="text-xs text-muted-foreground">CRM + manuais</span>}>
        {ledger.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Sem lançamentos ainda.</p>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 font-medium">Data</th>
                  <th className="pb-3 font-medium">Descrição</th>
                  <th className="pb-3 font-medium">Categoria</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Valor</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {ledger.map((row) => (
                  <tr key={row.id} className="hover:bg-accent/30">
                    <td className="py-3 text-muted-foreground">{new Date(row.date).toLocaleDateString("pt-BR")}</td>
                    <td className="py-3">{row.label}</td>
                    <td className="py-3 text-muted-foreground">{row.detail}</td>
                    <td className="py-3">
                      {row.kind === "ship" ? (
                        <StatusBadge status={row.status === "Pago" ? "Entregue" : "Em rota"} />
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${row.sign > 0 ? "bg-success/15 text-success ring-success/30" : "bg-destructive/15 text-destructive ring-destructive/30"}`}>
                          {row.status}
                        </span>
                      )}
                    </td>
                    <td className={`py-3 text-right font-mono tabular-nums ${row.sign > 0 ? "text-success" : "text-destructive"}`}>
                      {row.sign > 0 ? "+" : "-"} {formatBRL(row.amount)}
                    </td>
                    <td className="py-3 text-right">
                      {row.kind === "manual" && (
                        <button onClick={() => removeManualEntry(row.id)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PanelCard>
    </AppShell>
  );
}
