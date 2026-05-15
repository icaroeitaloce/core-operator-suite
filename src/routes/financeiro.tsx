import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatCard, PanelCard, StatusBadge } from "@/components/Primitives";
import { ArrowDownCircle, ArrowUpCircle, Wallet, Receipt, Plus, Filter } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/financeiro")({
  component: Financeiro,
});

const data = [
  { m: "Jan", lucro: 14000 }, { m: "Fev", lucro: 17300 }, { m: "Mar", lucro: 18500 },
  { m: "Abr", lucro: 22400 }, { m: "Mai", lucro: 25900 }, { m: "Jun", lucro: 30700 }, { m: "Jul", lucro: 35700 },
];

const transactions = [
  { d: "12/05", desc: "Pagamento Distribuidora Norte", tipo: "Entrada", valor: "+ R$ 4.820,00", status: "Entregue" as const },
  { d: "11/05", desc: "Combustível frota",             tipo: "Saída",   valor: "- R$ 1.230,00", status: "Pendente" as const },
  { d: "10/05", desc: "Atacadão Premium",              tipo: "Entrada", valor: "+ R$ 12.300,00", status: "Entregue" as const },
  { d: "09/05", desc: "Manutenção veículo VW-3402",    tipo: "Saída",   valor: "- R$ 3.450,00", status: "Entregue" as const },
  { d: "08/05", desc: "Logística Verde",                tipo: "Entrada", valor: "+ R$ 2.150,00", status: "Pendente" as const },
  { d: "07/05", desc: "Folha de pagamento",            tipo: "Saída",   valor: "- R$ 18.900,00", status: "Entregue" as const },
];

const cobrancas = [
  { c: "Mercantil Sul",    venc: "15/05", val: "R$ 7.640,00", st: "Atrasado" as const },
  { c: "Comercial Aurora", venc: "18/05", val: "R$ 3.980,00", st: "Pendente" as const },
  { c: "Atacadão Premium", venc: "22/05", val: "R$ 12.300,00", st: "Pendente" as const },
];

function Financeiro() {
  return (
    <AppShell title="Módulo Financeiro" subtitle="Entradas, saídas, lucro e gestão de cobranças">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Entradas (mês)" value="R$ 78.500" delta={{ value: "+18%", positive: true }} icon={ArrowDownCircle} accent="green" />
        <StatCard label="Saídas (mês)"   value="R$ 42.800" delta={{ value: "+6%", positive: false }} icon={ArrowUpCircle} accent="muted" delay={0.05} />
        <StatCard label="Lucro líquido"  value="R$ 35.700" delta={{ value: "+24%", positive: true }} icon={Wallet} accent="gold" delay={0.1} />
        <StatCard label="A receber"      value="R$ 64.380" delta={{ value: "12 títulos", positive: false }} icon={Receipt} accent="muted" delay={0.15} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <PanelCard title="Evolução do lucro" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" vertical={false} />
                <XAxis dataKey="m" stroke="oklch(0.7 0.02 120)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.7 0.02 120)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip contentStyle={{ background: "oklch(0.20 0.028 155)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="lucro" stroke="oklch(0.78 0.13 80)" strokeWidth={2.5} dot={{ fill: "oklch(0.78 0.13 80)", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </PanelCard>

        <PanelCard title="Clientes a cobrar">
          <ul className="space-y-3">
            {cobrancas.map((c, i) => (
              <li key={i} className="rounded-xl border border-border/40 bg-input/30 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{c.c}</p>
                  <StatusBadge status={c.st} />
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Vence {c.venc}</span>
                  <span className="font-mono text-gold">{c.val}</span>
                </div>
              </li>
            ))}
          </ul>
        </PanelCard>
      </div>

      <PanelCard title="Histórico financeiro" className="mt-6"
        action={
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-input/40 px-3 py-1.5 text-xs text-muted-foreground hover:text-gold"><Filter className="h-3 w-3" /> Filtrar</button>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-gold px-3 py-1.5 text-xs font-medium text-primary-foreground"><Plus className="h-3 w-3" /> Novo lançamento</button>
          </div>
        }>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 font-medium">Data</th>
                <th className="pb-3 font-medium">Descrição</th>
                <th className="pb-3 font-medium">Tipo</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {transactions.map((t, i) => (
                <tr key={i} className="hover:bg-accent/30">
                  <td className="py-3 text-muted-foreground">{t.d}</td>
                  <td className="py-3">{t.desc}</td>
                  <td className="py-3">
                    <span className={`text-xs ${t.tipo === "Entrada" ? "text-success" : "text-muted-foreground"}`}>{t.tipo}</span>
                  </td>
                  <td className="py-3"><StatusBadge status={t.status} /></td>
                  <td className={`py-3 text-right font-mono tabular-nums ${t.tipo === "Entrada" ? "text-success" : "text-foreground"}`}>{t.valor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelCard>
    </AppShell>
  );
}
