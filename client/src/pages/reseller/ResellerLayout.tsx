import { ReactNode, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useCustomAuth } from "@/hooks/useCustomAuth";
import { LayoutDashboard, History, LogOut, Zap, Menu } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const navItems = [
  { href: "/reseller/dashboard", icon: LayoutDashboard, label: "Painel" },
  { href: "/reseller/history", icon: History, label: "Minhas Keys" },
];

export default function ResellerLayout({ children }: { children: ReactNode }) {
  const [location, navigate] = useLocation();
  const { session, isLoading, isReseller, logout } = useCustomAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isReseller) {
      navigate("/login");
    }
  }, [isLoading, isReseller, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center">
        <div className="text-center">
          <Zap className="w-10 h-10 mx-auto mb-3 animate-pulse" style={{ color: "oklch(0.75 0.2 160)" }} />
          <p className="text-sm tracking-widest uppercase" style={{ color: "oklch(0.55 0.05 200)" }}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isReseller) return null;

  const handleLogout = () => {
    logout();
    toast.success("Sessão encerrada.");
  };

  return (
    <div className="min-h-screen grid-bg flex">
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-56 flex flex-col
        transition-transform duration-300 lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `} style={{ background: "oklch(0.09 0.025 240)", borderRight: "1px solid oklch(0.2 0.04 240)" }}>
        {/* Logo */}
        <div className="p-5 border-b" style={{ borderColor: "oklch(0.2 0.04 240)" }}>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5" style={{ color: "oklch(0.75 0.2 160)", filter: "drop-shadow(0 0 6px oklch(0.75 0.2 160 / 0.8))" }} />
            <span className="font-bold text-lg tracking-wider" style={{ fontFamily: "'Rajdhani', sans-serif", color: "oklch(0.92 0.05 160)" }}>
              AUTH <span style={{ color: "oklch(0.75 0.2 160)" }}>Arthurzxy</span>
            </span>
          </div>
          <div className="mt-1 text-xs tracking-widest uppercase" style={{ color: "oklch(0.7 0.22 195)", fontFamily: "'Share Tech Mono', monospace" }}>
            {(session as { username?: string })?.username ?? "REVENDEDOR"}
          </div>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = location === href || (href === "/reseller/dashboard" && location === "/reseller");
            return (
              <Link key={href} href={href} onClick={() => setSidebarOpen(false)}>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium tracking-wide cursor-pointer transition-all"
                  style={{
                    color: isActive ? "oklch(0.85 0.25 160)" : "oklch(0.65 0.05 200)",
                    background: isActive ? "oklch(0.75 0.2 160 / 0.1)" : "transparent",
                    borderLeft: isActive ? "3px solid oklch(0.75 0.2 160)" : "3px solid transparent",
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: "0.95rem",
                  }}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: "oklch(0.2 0.04 240)" }}>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium tracking-wide transition-all"
            style={{ color: "oklch(0.65 0.2 25)", fontFamily: "'Rajdhani', sans-serif", fontSize: "0.95rem" }}>
            <LogOut className="w-4 h-4" />
            Sair do Sistema
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b" style={{ background: "oklch(0.09 0.025 240)", borderColor: "oklch(0.2 0.04 240)" }}>
          <button onClick={() => setSidebarOpen(true)} style={{ color: "oklch(0.75 0.2 160)" }}>
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold tracking-wider" style={{ fontFamily: "'Rajdhani', sans-serif", color: "oklch(0.92 0.05 160)" }}>
            AUTH <span style={{ color: "oklch(0.75 0.2 160)" }}>Arthurzxy</span>
          </span>
          <div />
        </header>

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
