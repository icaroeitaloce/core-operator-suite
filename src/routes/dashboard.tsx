import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatCard, PanelCard, StatusBadge } from "@/components/Primitives";
import { DollarSign, Package, Truck, Users, AlertTriangle } from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar,
} from "recharts";
import { useShipments, formatBRL } from "@/lib/shipmentsStore";
import { useMemo } from "react";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

const WEEK_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

function Dashboard() {
  const shipments = useShipments();

  const { total, units, customers, weekData, monthData, recent } = useMemo(() => {
    const total = shipments.reduce((s, x) => s + x.total, 0);
    const units = shipments.reduce((s, x) => s + x.qty, 0);
    const customers = new Set(shipments.map((s) => s.number)).size;

    const wk = WEEK_LABELS.map((d) => ({ d, v: 0 }));
    const mo = MONTHS.map((m) => ({ m, entrada: 0 }));
    for (const s of shipments) {
      const dt = new Date(s.createdAt);
      wk[dt.getDay()].v += s.qty;
      mo[dt.getMonth()].entrada += s.total;
    }
    return {
      total, units, customers,
      weekData: wk,
      monthData: mo,
      recent: shipments.slice(0, 6),
    };
  }, [shipments]);

  return (
    <AppShell title="Dashboard Operacional" subtitle="Visão geral da operação · dados em tempo real">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Faturamento total" value={formatBRL(total)} icon={DollarSign} accent="gold" />
        <StatCard label="Unidades enviadas" value={String(units)} icon={Package} accent="green" delay={0.05} />
        <StatCard label="Pedidos enviados"  value={String(shipments.length)} icon={Truck} accent="gold" delay={0.1} />
        <StatCard label="Clientes únicos"   value={String(customers)} icon={Users} accent="muted" delay={0.15} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <PanelCard title="Faturamento por mês" className="lg:col-span-2"
          action={<span className="text-xs text-muted-foreground">Ano corrente</span>}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.13 80)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.78 0.13 80)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" vertical={false} />
                <XAxis dataKey="m" stroke="oklch(0.7 0.02 120)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.7 0.02 120)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip
                  contentStyle={{ background: "oklch(0.20 0.028 155)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: 12, fontSize: 12 }}
                  formatter={(v: number) => formatBRL(v)}
                />
                <Area type="monotone" dataKey="entrada" stroke="oklch(0.78 0.13 80)" strokeWidth={2} fill="url(#gIn)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </PanelCard>

        <PanelCard title="Unidades por dia da semana">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" vertical={false} />
                <XAxis dataKey="d" stroke="oklch(0.7 0.02 120)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.7 0.02 120)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "oklch(0.20 0.028 155)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="v" fill="oklch(0.78 0.13 80)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PanelCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <PanelCard title="Últimos envios" className="lg:col-span-2">
          {recent.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Nenhum envio ainda. Arraste um lead para "Enviados" no CRM.</p>
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
                  {recent.map((s) => (
                    <tr key={s.id} className="hover:bg-accent/30">
                      <td className="py-3 text-muted-foreground">{new Date(s.createdAt).toLocaleDateString("pt-BR")}</td>
                      <td className="py-3">{s.name}</td>
                      <td className="py-3 font-mono text-gold">{s.qty}×</td>
                      <td className="py-3"><StatusBadge status="Em rota" /></td>
                      <td className="py-3 text-right tabular-nums">{formatBRL(s.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </PanelCard>

        <PanelCard title="Resumo" action={<AlertTriangle className="h-4 w-4 text-warning" />}>
          <ul className="space-y-3">
            <li className="rounded-xl border border-border/40 bg-input/30 p-3 text-sm">
              <p className="text-muted-foreground text-xs">Ticket médio</p>
              <p className="mt-1 font-display text-xl text-gold">
                {formatBRL(shipments.length ? total / shipments.length : 0)}
              </p>
            </li>
            <li className="rounded-xl border border-border/40 bg-input/30 p-3 text-sm">
              <p className="text-muted-foreground text-xs">Unidades por pedido</p>
              <p className="mt-1 font-display text-xl text-foreground">
                {shipments.length ? (units / shipments.length).toFixed(2) : "0,00"}
              </p>
            </li>
          </ul>
        </PanelCard>
      </div>
    </AppShell>
  );
}
