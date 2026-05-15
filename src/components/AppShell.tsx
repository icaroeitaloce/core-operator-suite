import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Wallet, Truck, FileBarChart2, CalendarCheck,
  Bell, Search, LogOut, Settings, KanbanSquare,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { ReactNode } from "react";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/logistica", label: "Logística", icon: Truck },
  { to: "/relatorios", label: "Relatórios", icon: FileBarChart2 },
  { to: "/operacional", label: "Operacional", icon: CalendarCheck },
] as const;

export function AppShell({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-sidebar-border bg-sidebar/80 backdrop-blur-xl lg:flex lg:flex-col">
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gold/30 blur-md" />
            <img src={logo} alt="Logo" className="relative h-11 w-11 rounded-full ring-1 ring-gold/40" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-gold/80">Central</p>
            <p className="text-sm font-medium text-sidebar-foreground">Gestão Operacional</p>
          </div>
        </div>

        <div className="px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-sidebar-border to-transparent" />
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          <p className="mb-2 px-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Operação</p>
          {nav.map((item) => {
            const active = path.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                  active
                    ? "bg-sidebar-accent text-gold shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="active-pill"
                    className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-r bg-gold"
                  />
                )}
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="glass rounded-xl p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-gold text-xs font-semibold text-primary-foreground">
                AD
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm text-sidebar-foreground">Administrador</p>
                <p className="truncate text-xs text-muted-foreground">Sócio</p>
              </div>
              <Link to="/" className="text-muted-foreground hover:text-gold">
                <LogOut className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-border/60 bg-background/70 backdrop-blur-xl">
          <div className="flex items-center gap-4 px-6 py-4 lg:px-10">
            <div className="flex items-center gap-3 lg:hidden">
              <img src={logo} alt="Logo" className="h-9 w-9 rounded-full ring-1 ring-gold/40" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-[0.25em] text-gold/70">Painel privado</p>
              <h1 className="truncate text-lg font-medium text-foreground">{title}</h1>
            </div>
            <div className="hidden items-center gap-2 rounded-xl border border-border bg-input/40 px-3 py-2 md:flex md:w-72">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Buscar pedidos, clientes, lançamentos..."
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <button className="relative rounded-xl border border-border bg-input/40 p-2.5 text-muted-foreground hover:text-gold">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gold ring-2 ring-background" />
            </button>
            <button className="rounded-xl border border-border bg-input/40 p-2.5 text-muted-foreground hover:text-gold">
              <Settings className="h-4 w-4" />
            </button>
          </div>
          {subtitle && (
            <div className="border-t border-border/40 px-6 py-2 text-xs text-muted-foreground lg:px-10">{subtitle}</div>
          )}
        </header>

        <main className="flex-1 px-6 py-8 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="sticky bottom-0 z-10 flex border-t border-border bg-background/90 backdrop-blur-xl lg:hidden">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = path.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] ${active ? "text-gold" : "text-muted-foreground"}`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
