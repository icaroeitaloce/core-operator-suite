import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatCard, PanelCard, StatusBadge } from "@/components/Primitives";
import { ArrowDownCircle, Wallet, Receipt, Package } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useShipments, formatBRL } from "@/lib/shipmentsStore";
import { useMemo } from "react";

export const Route = createFileRoute("/financeiro")({
  component: Financeiro,
});

const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function Financeiro() {
  const shipments = useShipments();

  const { total, units, monthData, monthTotal } = useMemo(() => {
    const total = shipments.reduce((s, x) => s + x.total, 0);
    const units = shipments.reduce((s, x) => s + x.qty, 0);
    const now = new Date();
    const md = MONTHS.map((m) => ({ m, lucro: 0 }));
    let monthTotal = 0;
    for (const s of shipments) {
      const dt = new Date(s.createdAt);
      md[dt.getMonth()].lucro += s.total;
      if (dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear()) {
        monthTotal += s.total;
      }
    }
    return { total, units, monthData: md, monthTotal };
  }, [shipments]);

  return (
    <AppShell title="Módulo Financeiro" subtitle="Entradas geradas automaticamente pelos envios do CRM">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Entradas (mês)" value={formatBRL(monthTotal)} icon={ArrowDownCircle} accent="green" />
        <StatCard label="Faturamento total" value={formatBRL(total)} icon={Wallet} accent="gold" delay={0.05} />
        <StatCard label="Unidades vendidas" value={String(units)} icon={Package} accent="muted" delay={0.1} />
        <StatCard label="Pedidos" value={String(shipments.length)} icon={Receipt} accent="gold" delay={0.15} />
      </div>

      <div className="mt-6">
        <PanelCard title="Evolução do faturamento">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
        action={<span className="text-xs text-muted-foreground">Gerados a partir do CRM</span>}>
        {shipments.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Sem lançamentos. Mova um lead para "Enviados" no CRM para gerar entradas.</p>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 font-medium">Data</th>
                  <th className="pb-3 font-medium">Cliente</th>
                  <th className="pb-3 font-medium">Unidades</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {shipments.map((s) => (
                  <tr key={s.id} className="hover:bg-accent/30">
                    <td className="py-3 text-muted-foreground">{new Date(s.createdAt).toLocaleDateString("pt-BR")}</td>
                    <td className="py-3">{s.name}</td>
                    <td className="py-3 font-mono text-gold">{s.qty}×</td>
                    <td className="py-3"><StatusBadge status={s.status === "Pago" ? "Entregue" : "Entregue"} /></td>
                    <td className="py-3 text-right font-mono tabular-nums text-success">+ {formatBRL(s.total)}</td>
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
