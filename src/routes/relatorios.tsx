import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PanelCard } from "@/components/Primitives";
import { FileDown, FileText, FileSpreadsheet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export const Route = createFileRoute("/relatorios")({
  component: Relatorios,
});

const compare = [
  { m: "Jan", atual: 42000, anterior: 31000 },
  { m: "Fev", atual: 48500, anterior: 35000 },
  { m: "Mar", atual: 52000, anterior: 39000 },
  { m: "Abr", atual: 58200, anterior: 41200 },
  { m: "Mai", atual: 64800, anterior: 45800 },
  { m: "Jun", atual: 71200, anterior: 50100 },
  { m: "Jul", atual: 78500, anterior: 56300 },
];

const reports = [
  { t: "Relatório financeiro mensal",       desc: "Entradas, saídas e lucro consolidado", icon: FileText },
  { t: "Relatório logístico de entregas",   desc: "Envios, prazos e desempenho por rota", icon: FileText },
  { t: "Relatório de cobranças",             desc: "Inadimplência, prazos e títulos abertos", icon: FileText },
  { t: "Comparativo anual",                  desc: "Performance vs. ano anterior", icon: FileText },
];

function Relatorios() {
  return (
    <AppShell title="Relatórios" subtitle="Exportação, comparativos e análises">
      <PanelCard title="Comparativo mensal · faturamento"
        action={
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-input/40 px-3 py-1.5 text-xs hover:text-gold"><FileSpreadsheet className="h-3 w-3" /> Excel</button>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-gold px-3 py-1.5 text-xs font-medium text-primary-foreground"><FileDown className="h-3 w-3" /> PDF</button>
          </div>
        }>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={compare} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 6%)" vertical={false} />
              <XAxis dataKey="m" stroke="oklch(0.7 0.02 120)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="oklch(0.7 0.02 120)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
              <Tooltip contentStyle={{ background: "oklch(0.20 0.028 155)", border: "1px solid oklch(1 0 0 / 8%)", borderRadius: 12, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="anterior" name="Ano anterior" fill="oklch(0.45 0.06 155)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="atual"    name="Ano atual"    fill="oklch(0.78 0.13 80)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </PanelCard>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {reports.map((r, i) => {
          const Icon = r.icon;
          return (
            <div key={i} className="group glass-card flex items-center gap-4 rounded-2xl p-5 transition hover:shadow-gold">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 ring-1 ring-gold/30 text-gold">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{r.t}</p>
                <p className="text-xs text-muted-foreground">{r.desc}</p>
              </div>
              <button className="rounded-lg border border-border bg-input/40 p-2 text-muted-foreground transition group-hover:text-gold">
                <FileDown className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
