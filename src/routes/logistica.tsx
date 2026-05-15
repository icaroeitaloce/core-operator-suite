import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatCard, PanelCard, StatusBadge } from "@/components/Primitives";
import { Truck, Package, MapPin, CheckCircle2, Search, Plus } from "lucide-react";

export const Route = createFileRoute("/logistica")({
  component: Logistica,
});

const orders = [
  { id: "ENV-2841", cli: "Distribuidora Norte", cod: "BR47829121", origem: "Galpão A", dest: "São Paulo, SP", st: "Em rota" as const, prev: "14/05" },
  { id: "ENV-2840", cli: "Atacadão Premium",    cod: "BR47829120", origem: "Galpão B", dest: "Rio de Janeiro, RJ", st: "Entregue" as const, prev: "12/05" },
  { id: "ENV-2839", cli: "Logística Verde",      cod: "BR47829119", origem: "Galpão A", dest: "Curitiba, PR", st: "Coletando" as const, prev: "16/05" },
  { id: "ENV-2838", cli: "Mercantil Sul",        cod: "BR47829118", origem: "Galpão C", dest: "Porto Alegre, RS", st: "Atrasado" as const, prev: "11/05" },
  { id: "ENV-2837", cli: "Comercial Aurora",     cod: "BR47829117", origem: "Galpão B", dest: "Belo Horizonte, MG", st: "Entregue" as const, prev: "10/05" },
  { id: "ENV-2836", cli: "Distribuidora Leste",  cod: "BR47829116", origem: "Galpão A", dest: "Salvador, BA", st: "Em rota" as const, prev: "17/05" },
];

const movements = [
  { h: "08:42", t: "ENV-2841 saiu do centro de distribuição (SP)" },
  { h: "08:15", t: "ENV-2840 marcado como entregue (RJ)" },
  { h: "07:50", t: "ENV-2839 coletado no cliente origem" },
  { h: "ontem", t: "ENV-2838 reportou atraso na rota Sul" },
  { h: "ontem", t: "ENV-2837 entregue ao destinatário (BH)" },
];

function Logistica() {
  return (
    <AppShell title="Módulo Logístico" subtitle="Controle de envios, rastreamento e operação em campo">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Envios ativos"      value="38" delta={{ value: "+5 hoje", positive: true }}  icon={Truck} accent="gold" />
        <StatCard label="Pedidos do mês"     value="287" delta={{ value: "+11%", positive: true }}    icon={Package} accent="green" delay={0.05} />
        <StatCard label="Em trânsito"         value="22" delta={{ value: "média 2,4 dias", positive: true }} icon={MapPin} accent="muted" delay={0.1} />
        <StatCard label="Taxa de entrega"     value="96,4%" delta={{ value: "+1,8 p.p.", positive: true }} icon={CheckCircle2} accent="gold" delay={0.15} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <PanelCard title="Pedidos e envios" className="lg:col-span-2"
          action={
            <div className="flex gap-2">
              <div className="hidden items-center gap-2 rounded-lg border border-border bg-input/40 px-2.5 py-1.5 sm:flex">
                <Search className="h-3 w-3 text-muted-foreground" />
                <input placeholder="Buscar código..." className="w-32 bg-transparent text-xs focus:outline-none" />
              </div>
              <button className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-gold px-3 py-1.5 text-xs font-medium text-primary-foreground"><Plus className="h-3 w-3" /> Novo envio</button>
            </div>
          }>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 font-medium">Pedido</th>
                  <th className="pb-3 font-medium">Cliente</th>
                  <th className="pb-3 font-medium">Rastreamento</th>
                  <th className="pb-3 font-medium">Destino</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Previsão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-accent/30">
                    <td className="py-3 font-mono text-xs text-gold">{o.id}</td>
                    <td className="py-3">{o.cli}</td>
                    <td className="py-3 font-mono text-xs text-muted-foreground">{o.cod}</td>
                    <td className="py-3 text-muted-foreground">{o.dest}</td>
                    <td className="py-3"><StatusBadge status={o.st} /></td>
                    <td className="py-3 text-right text-muted-foreground">{o.prev}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelCard>

        <PanelCard title="Histórico de movimentações">
          <ul className="space-y-4">
            {movements.map((m, i) => (
              <li key={i} className="relative pl-5">
                <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-gold ring-4 ring-gold/15" />
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{m.h}</p>
                <p className="text-sm text-foreground/90">{m.t}</p>
              </li>
            ))}
          </ul>
        </PanelCard>
      </div>
    </AppShell>
  );
}
