import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PanelCard } from "@/components/Primitives";
import { Bell, CheckSquare, Calendar, StickyNote, Plus } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/operacional")({
  component: Operacional,
});

const initialTasks = [
  { t: "Conferir notas fiscais do dia", done: false, prio: "alta" },
  { t: "Ligar para Mercantil Sul (cobrança)", done: false, prio: "alta" },
  { t: "Atualizar planilha de combustível", done: true, prio: "média" },
  { t: "Reunião com fornecedor de embalagens", done: false, prio: "média" },
  { t: "Conferir manutenção VW-3402", done: true, prio: "baixa" },
];

const agenda = [
  { d: "Hoje · 14:00",  t: "Reunião sócios",        loc: "Sala de reuniões" },
  { d: "Hoje · 16:30",  t: "Coleta Distribuidora Norte", loc: "Galpão A" },
  { d: "Amanhã · 09:00", t: "Auditoria fiscal",      loc: "Escritório" },
  { d: "Amanhã · 15:00", t: "Entrega prioridade RJ", loc: "Centro RJ" },
];

const notes = [
  "Renegociar contrato com transportadora parceira até fim do mês.",
  "Verificar disponibilidade de novo galpão em Campinas.",
  "Atualizar política de prazos para clientes do Sul.",
];

function Operacional() {
  const [tasks, setTasks] = useState(initialTasks);

  return (
    <AppShell title="Organização Operacional" subtitle="Tarefas internas, agenda, lembretes e notificações">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <PanelCard title="Tarefas internas" className="lg:col-span-2"
          action={
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-gold px-3 py-1.5 text-xs font-medium text-primary-foreground">
              <Plus className="h-3 w-3" /> Nova tarefa
            </button>
          }>
          <ul className="space-y-2">
            {tasks.map((task, i) => (
              <li
                key={i}
                onClick={() => setTasks(tasks.map((t, idx) => idx === i ? { ...t, done: !t.done } : t))}
                className={`group flex cursor-pointer items-center gap-3 rounded-xl border border-border/40 bg-input/30 p-3 transition hover:border-gold/40 ${task.done ? "opacity-60" : ""}`}
              >
                <span className={`flex h-5 w-5 items-center justify-center rounded-md border ${task.done ? "border-gold bg-gold text-primary-foreground" : "border-border"}`}>
                  {task.done && <CheckSquare className="h-3 w-3" />}
                </span>
                <p className={`flex-1 text-sm ${task.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{task.t}</p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${
                  task.prio === "alta" ? "bg-destructive/15 text-destructive" :
                  task.prio === "média" ? "bg-warning/15 text-warning" :
                  "bg-muted text-muted-foreground"
                }`}>{task.prio}</span>
              </li>
            ))}
          </ul>
        </PanelCard>

        <PanelCard title="Notificações" action={<Bell className="h-4 w-4 text-gold" />}>
          <ul className="space-y-3">
            {[
              "Pagamento recebido: R$ 4.820,00",
              "Novo pedido criado: ENV-2842",
              "Cliente respondeu: Mercantil Sul",
              "Backup diário concluído com sucesso",
            ].map((n, i) => (
              <li key={i} className="flex gap-3 rounded-xl border border-border/40 bg-input/30 p-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" />
                <p className="text-sm text-foreground/90">{n}</p>
              </li>
            ))}
          </ul>
        </PanelCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PanelCard title="Agenda operacional" action={<Calendar className="h-4 w-4 text-gold" />}>
          <ul className="space-y-3">
            {agenda.map((a, i) => (
              <li key={i} className="flex items-start gap-4 rounded-xl border border-border/40 bg-input/30 p-3">
                <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-gold/10 ring-1 ring-gold/30 text-gold">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] uppercase tracking-wider text-gold">{a.d}</p>
                  <p className="text-sm font-medium text-foreground">{a.t}</p>
                  <p className="text-xs text-muted-foreground">{a.loc}</p>
                </div>
              </li>
            ))}
          </ul>
        </PanelCard>

        <PanelCard title="Observações importantes" action={<StickyNote className="h-4 w-4 text-gold" />}>
          <ul className="space-y-3">
            {notes.map((n, i) => (
              <li key={i} className="rounded-xl border-l-2 border-gold bg-input/30 p-3 pl-4">
                <p className="text-sm text-foreground/90">{n}</p>
              </li>
            ))}
          </ul>
        </PanelCard>
      </div>
    </AppShell>
  );
}
