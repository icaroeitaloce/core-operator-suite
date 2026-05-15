import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatCard, PanelCard, StatusBadge } from "@/components/Primitives";
import {
  DollarSign, Clock, Truck, Users, AlertTriangle, ArrowUpRight,
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar,
} from "recharts";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

const flowData = [
  { m: "Jan", entrada: 42000, saida: 28000 },
  { m: "Fev", entrada: 48500, saida: 31200 },
  { m: "Mar", entrada: 52000, saida: 33500 },
  { m: "Abr", entrada: 58200, saida: 35800 },
  { m: "Mai", entrada: 64800, saida: 38900 },
  { m: "Jun", entrada: 71200, saida: 40500 },
  { m: "Jul", entrada: 78500, saida: 42800 },
];

const weekData = [
  { d: "Seg", v: 24 }, { d: "Ter", v: 38 }, { d: "Qua", v: 31 },
  { d: "Qui", v: 42 }, { d: "Sex", v: 56 }, { d: "Sáb", v: 28 }, { d: "Dom", v: 14 },
];

const recentShipments = [
  { id: "ENV-2841", cliente: "Distribuidora Norte", destino: "São Paulo, SP", status: "Em rota" as const, valor: "R$ 4.820,00" },
  { id: "ENV-2840", cliente: "Atacadão Premium",   destino: "Rio de Janeiro, RJ", status: "Entregue" as const, valor: "R$ 12.300,00" },
  { id: "ENV-2839", cliente: "Logística Verde",     destino: "Curitiba, PR", status: "Coletando" as const, valor: "R$ 2.150,00" },
  { id: "ENV-2838", cliente: "Mercantil Sul",       destino: "Porto Alegre, RS", status: "Atrasado" as const, valor: "R$ 7.640,00" },
  { id: "ENV-2837", cliente: "Comercial Aurora",    destino: "Belo Horizonte, MG", status: "Entregue" as const, valor: "R$ 3.980,00" },
];

const alerts = [
  { t: "3 cobranças vencendo nas próximas 48h", level: "warning" },
  { t: "Entrega ENV-2838 com atraso de 2 dias", level: "danger" },
  { t: "Estoque baixo: pallets de embalagem", level: "warning" },
  { t: "Novo cliente cadastrado: Comercial Aurora", level: "info" },
];

function Dashboard() {
  return (
    <AppShell title="Dashboard Operacional" subtitle="Visão geral da operação · atualizado há 2 minutos">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Faturamento total"     value="R$ 487.250" delta={{ value: "+12,4% mês", positive: true }} icon={DollarSign} accent="gold" delay={0.0} />
        <StatCard label="Valores pendentes"     value="R$ 64.380"  delta={{ value: "8 cobranças", positive: false }} icon={Clock} accent="muted" delay={0.05} />
        <StatCard label="Entregas em andamento" value="38"          delta={{ value: "+5 hoje", positive: true }}     icon={Truck} accent="green" delay={0.1} />
        <StatCard label="Clientes ativos"       value="142"         delta={{ value: "+6 mês", positive: true }}      icon={Users} accent="gold" delay={0.15} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <PanelCard title="Fluxo financeiro" className="lg:col-span-2"
          action={<span className="text-xs text-muted-foreground">Últimos 7 meses</span>}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={flowData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.78 0.13 80)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.78 0.13 80)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.55 0.10 155)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="oklch(0.55 0.10 155)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" vertical={false} />
                <XAxis dataKey="m" stroke="oklch(0.7 0.02 120)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.7 0.02 120)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip
                  contentStyle={{ background: "oklch(0.20 0.028 155)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: "oklch(0.78 0.13 80)" }}
                />
                <Area type="monotone" dataKey="entrada" stroke="oklch(0.78 0.13 80)" strokeWidth={2} fill="url(#gIn)" />
                <Area type="monotone" dataKey="saida"   stroke="oklch(0.55 0.10 155)" strokeWidth={2} fill="url(#gOut)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </PanelCard>

        <PanelCard title="Resumo semanal" action={<span className="text-xs text-gold">+18%</span>}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" vertical={false} />
                <XAxis dataKey="d" stroke="oklch(0.7 0.02 120)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.7 0.02 120)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "oklch(0.20 0.028 155)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="v" fill="oklch(0.78 0.13 80)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PanelCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <PanelCard title="Últimos envios" className="lg:col-span-2"
          action={<button className="inline-flex items-center gap-1 text-xs text-gold hover:underline">Ver todos <ArrowUpRight className="h-3 w-3" /></button>}>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 font-medium">Pedido</th>
                  <th className="pb-3 font-medium">Cliente</th>
                  <th className="pb-3 font-medium">Destino</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {recentShipments.map((s) => (
                  <tr key={s.id} className="text-foreground hover:bg-accent/30">
                    <td className="py-3 font-mono text-xs text-gold">{s.id}</td>
                    <td className="py-3">{s.cliente}</td>
                    <td className="py-3 text-muted-foreground">{s.destino}</td>
                    <td className="py-3"><StatusBadge status={s.status} /></td>
                    <td className="py-3 text-right tabular-nums">{s.valor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelCard>

        <PanelCard title="Alertas operacionais"
          action={<AlertTriangle className="h-4 w-4 text-warning" />}>
          <ul className="space-y-3">
            {alerts.map((a, i) => (
              <li key={i} className="flex gap-3 rounded-xl border border-border/40 bg-input/30 p-3">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  a.level === "danger" ? "bg-destructive" : a.level === "warning" ? "bg-warning" : "bg-gold"
                }`} />
                <p className="text-sm text-foreground/90">{a.t}</p>
              </li>
            ))}
          </ul>
        </PanelCard>
      </div>
    </AppShell>
  );
}
