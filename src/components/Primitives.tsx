import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export function StatCard({
  label, value, delta, icon: Icon, accent, delay = 0,
}: {
  label: string;
  value: string;
  delta?: { value: string; positive?: boolean };
  icon: React.ComponentType<{ className?: string }>;
  accent?: "gold" | "green" | "muted";
  delay?: number;
}) {
  const accentBg =
    accent === "gold" ? "bg-gold/10 text-gold ring-gold/30"
    : accent === "green" ? "bg-success/10 text-success ring-success/30"
    : "bg-muted text-muted-foreground ring-border";

  return (
    <div
      style={{ animationDelay: `${delay}s` }}
      className="group relative overflow-hidden rounded-2xl glass-card p-6 transition hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-3 font-display text-3xl text-foreground">{value}</p>
          {delta && (
            <div className={`mt-2 inline-flex items-center gap-1 text-xs ${delta.positive ? "text-success" : "text-destructive"}`}>
              {delta.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {delta.value}
            </div>
          )}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${accentBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function PanelCard({
  title, action, children, className = "",
}: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`glass-card rounded-2xl p-6 ${className}`}>
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-display text-lg text-foreground">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: "Entregue" | "Em rota" | "Coletando" | "Pendente" | "Atrasado" | "Pago" }) {
  const map: Record<string, string> = {
    "Entregue": "bg-success/15 text-success ring-success/30",
    "Em rota": "bg-gold/15 text-gold ring-gold/30",
    "Coletando": "bg-accent text-accent-foreground ring-border",
    "Pendente": "bg-warning/15 text-warning ring-warning/30",
    "Atrasado": "bg-destructive/15 text-destructive ring-destructive/30",
    "Pago": "bg-success/15 text-success ring-success/30",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${map[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
