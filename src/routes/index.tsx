import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import logo from "@/assets/logo.png";
import { Lock, Mail, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => navigate({ to: "/dashboard" }), 600);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-gold/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.03),transparent_50%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="glass-card rounded-3xl p-10">
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="relative mb-6"
            >
              <div className="absolute inset-0 rounded-full bg-gold/30 blur-2xl" />
              <img src={logo} alt="Logo" className="relative h-20 w-20 rounded-full ring-1 ring-gold/40 shadow-gold" />
            </motion.div>

            <p className="text-xs uppercase tracking-[0.3em] text-gold/80">Acesso restrito</p>
            <h1 className="mt-2 text-center text-3xl font-light text-foreground">
              Central de <span className="text-gradient-gold font-medium">Gestão Operacional</span>
            </h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Plataforma interna privada
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  defaultValue="admin@empresa.com"
                  className="w-full rounded-xl border border-border bg-input/50 py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold/60 focus:outline-none focus:ring-2 focus:ring-ring transition"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Senha</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  required
                  defaultValue="••••••••"
                  className="w-full rounded-xl border border-border bg-input/50 py-3 pl-11 pr-4 text-sm text-foreground focus:border-gold/60 focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative mt-6 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-gold py-3.5 text-sm font-medium text-primary-foreground shadow-gold transition hover:shadow-[0_15px_50px_-10px_rgba(212,175,55,0.5)] disabled:opacity-70"
            >
              <span>{loading ? "Autenticando..." : "Acessar plataforma"}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Acesso autorizado apenas a sócios e equipe interna.
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} — Sistema privado · v1.0
        </p>
        <div className="mt-2 text-center">
          <Link to="/dashboard" className="text-xs text-gold/70 hover:text-gold underline-offset-4 hover:underline">
            Pular para o dashboard →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
