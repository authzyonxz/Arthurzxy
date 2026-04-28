import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2, Lock, User, Zap } from "lucide-react";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      toast.success(`Bem-vindo, ${data.username}!`);
      if (data.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/reseller/dashboard");
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Preencha usuário e senha.");
      return;
    }
    loginMutation.mutate({ username: username.trim(), password });
  };

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, oklch(0.75 0.2 160), transparent)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, oklch(0.7 0.22 195), transparent)" }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-8 h-8" style={{ color: "oklch(0.75 0.2 160)", filter: "drop-shadow(0 0 8px oklch(0.75 0.2 160 / 0.8))" }} />
            <h1 className="text-4xl font-bold tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              <span style={{ color: "oklch(0.92 0.05 160)" }}>AUTH</span>{" "}
              <span style={{ color: "oklch(0.75 0.2 160)", textShadow: "0 0 15px oklch(0.75 0.2 160 / 0.7)" }}>
                Arthurzxy
              </span>
            </h1>
          </div>
          <p className="text-sm tracking-widest uppercase" style={{ color: "oklch(0.55 0.05 200)" }}>
            Sistema de Gerenciamento de Keys
          </p>
        </div>

        {/* Login card */}
        <div className="neon-card rounded-lg p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold tracking-wider uppercase" style={{ color: "oklch(0.85 0.25 160)", fontFamily: "'Rajdhani', sans-serif" }}>
              Acesso ao Sistema
            </h2>
            <p className="text-xs mt-1" style={{ color: "oklch(0.45 0.04 200)" }}>
              Insira suas credenciais para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "oklch(0.55 0.05 200)" }}>
                Usuário
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "oklch(0.55 0.05 200)" }} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite seu usuário"
                  className="w-full pl-10 pr-4 py-3 rounded text-sm outline-none transition-all"
                  style={{
                    background: "oklch(0.09 0.02 240)",
                    border: "1px solid oklch(0.22 0.04 240)",
                    color: "oklch(0.92 0.05 160)",
                    fontFamily: "'Share Tech Mono', monospace",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "oklch(0.75 0.2 160)"; e.target.style.boxShadow = "0 0 8px oklch(0.75 0.2 160 / 0.3)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "oklch(0.22 0.04 240)"; e.target.style.boxShadow = "none"; }}
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "oklch(0.55 0.05 200)" }}>
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "oklch(0.55 0.05 200)" }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full pl-10 pr-4 py-3 rounded text-sm outline-none transition-all"
                  style={{
                    background: "oklch(0.09 0.02 240)",
                    border: "1px solid oklch(0.22 0.04 240)",
                    color: "oklch(0.92 0.05 160)",
                    fontFamily: "'Share Tech Mono', monospace",
                  }}
                  onFocus={(e) => { e.target.style.borderColor = "oklch(0.75 0.2 160)"; e.target.style.boxShadow = "0 0 8px oklch(0.75 0.2 160 / 0.3)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "oklch(0.22 0.04 240)"; e.target.style.boxShadow = "none"; }}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-3 rounded font-bold text-sm tracking-widest uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, oklch(0.75 0.2 160 / 0.2), oklch(0.7 0.22 195 / 0.15))",
                border: "1px solid oklch(0.75 0.2 160)",
                color: "oklch(0.85 0.25 160)",
                textShadow: "0 0 8px oklch(0.75 0.25 160 / 0.6)",
                boxShadow: "0 0 15px oklch(0.75 0.2 160 / 0.3)",
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: "1rem",
              }}
            >
              {loginMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Autenticando...</>
              ) : (
                <><Zap className="w-4 h-4" /> ENTRAR NO SISTEMA</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "oklch(0.35 0.03 200)" }}>
          © {new Date().getFullYear()} AUTH Arthurzxy. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
