import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatCard, PanelCard, StatusBadge } from "@/components/Primitives";
import { Truck, Package, CheckCircle2, Boxes, Trash2 } from "lucide-react";
import { useShipments, formatBRL, removeShipment } from "@/lib/shipmentsStore";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/logistica")({
  component: Logistica,
});

function Logistica() {
  const shipments = useShipments();

  const { units, today, movements } = useMemo(() => {
    const units = shipments.reduce((s, x) => s + x.qty, 0);
    const todayStr = new Date().toDateString();
    const today = shipments.filter((s) => new Date(s.createdAt).toDateString() === todayStr).length;
    const movements = shipments.slice(0, 8).map((s) => ({
      h: new Date(s.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }),
      t: `${s.qty}× unidade(s) enviada(s) para ${s.name} · ${formatBRL(s.total)}`,
    }));
    return { units, today, movements };
  }, [shipments]);

  return (
    <AppShell title="Módulo Logístico" subtitle="Envios registrados automaticamente pelo CRM">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Envios totais" value={String(shipments.length)} icon={Truck} accent="gold" />
        <StatCard label="Enviados hoje" value={String(today)} icon={CheckCircle2} accent="green" delay={0.05} />
        <StatCard label="Unidades despachadas" value={String(units)} icon={Boxes} accent="muted" delay={0.1} />
        <StatCard label="Pares (promo 2 un)" value={String(Math.floor(units / 2))} icon={Package} accent="gold" delay={0.15} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <PanelCard title="Pedidos enviados" className="lg:col-span-2">
          {shipments.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Nenhum envio registrado. Arraste um lead para "Enviados" no CRM.</p>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="pb-3 font-medium">Pedido</th>
                    <th className="pb-3 font-medium">Cliente</th>
                    <th className="pb-3 font-medium">WhatsApp</th>
                    <th className="pb-3 font-medium">Unidades</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Valor</th>
                    <th className="pb-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {shipments.map((s) => (
                    <tr key={s.id} className="hover:bg-accent/30">
                      <td className="py-3 font-mono text-xs text-gold">{s.id.slice(2, 10).toUpperCase()}</td>
                      <td className="py-3">{s.name}</td>
                      <td className="py-3 font-mono text-xs text-muted-foreground">{s.number}</td>
                      <td className="py-3 font-mono text-gold">{s.qty}×</td>
                      <td className="py-3"><StatusBadge status={s.status === "Pago" ? "Entregue" : "Em rota"} /></td>
                      <td className="py-3 text-right tabular-nums">{formatBRL(s.total)}</td>
                      <td className="py-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm(`Apagar pedido de ${s.name}?`)) removeShipment(s.id);
                          }}
                          aria-label="Apagar pedido"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </PanelCard>

        <PanelCard title="Movimentações recentes">
          {movements.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">Sem movimentações.</p>
          ) : (
            <ul className="space-y-4">
              {movements.map((m, i) => (
                <li key={i} className="relative pl-5">
                  <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-gold ring-4 ring-gold/15" />
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{m.h}</p>
                  <p className="text-sm text-foreground/90">{m.t}</p>
                </li>
              ))}
            </ul>
          )}
        </PanelCard>
      </div>
    </AppShell>
  );
}
