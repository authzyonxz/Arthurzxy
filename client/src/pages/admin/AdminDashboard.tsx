import { trpc } from "@/lib/trpc";
import { Users, Package, Key, Trophy, Zap, Plus, Loader2 } from "lucide-react";
import { Link } from "wouter";

const KEY_TYPES = ["1h", "1d", "7d", "30d", "999d"] as const;

const TYPE_LABELS: Record<string, string> = {
  "1h": "1 HORA", "1d": "1 DIA", "7d": "7 DIAS", "30d": "30 DIAS", "999d": "999 DIAS",
};

export default function AdminDashboard() {
  const { data, isLoading } = trpc.admin.dashboard.useQuery(undefined, { refetchInterval: 15000 });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "oklch(0.75 0.2 160)" }} />
      </div>
    );
  }

  const stats = [
    { label: "Total Revendedores", value: data?.totalResellers ?? 0, icon: Users, color: "oklch(0.7 0.22 195)" },
    { label: "Keys em Estoque", value: data?.totalStock ?? 0, icon: Package, color: "oklch(0.75 0.2 160)" },
    { label: "Keys Geradas", value: data?.totalGenerated ?? 0, icon: Key, color: "oklch(0.7 0.18 280)" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-wider" style={{ fontFamily: "'Rajdhani', sans-serif", color: "oklch(0.92 0.05 160)" }}>
          DASHBOARD <span style={{ color: "oklch(0.75 0.2 160)", textShadow: "0 0 12px oklch(0.75 0.2 160 / 0.6)" }}>ADMIN</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: "oklch(0.45 0.04 200)" }}>Visão geral do sistema</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="neon-card rounded-lg p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
              <Icon className="w-6 h-6" style={{ color }} />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "oklch(0.45 0.04 200)" }}>{label}</p>
              <p className="text-3xl font-bold mt-0.5" style={{ fontFamily: "'Rajdhani', sans-serif", color }}>{value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Stock by type */}
      <div className="neon-card rounded-lg p-5">
        <h2 className="text-lg font-bold tracking-wider mb-4 flex items-center gap-2" style={{ fontFamily: "'Rajdhani', sans-serif", color: "oklch(0.85 0.25 160)" }}>
          <Package className="w-5 h-5" /> ESTOQUE POR TIPO
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {KEY_TYPES.map((type) => {
            const count = (data?.stockByType as Record<string, number>)?.[type] ?? 0;
            return (
              <div key={type} className="rounded p-3 text-center" style={{ background: "oklch(0.09 0.02 240)", border: "1px solid oklch(0.2 0.04 240)" }}>
                <p className="text-xs font-bold tracking-widest" style={{ color: "oklch(0.55 0.05 200)", fontFamily: "'Share Tech Mono', monospace" }}>{TYPE_LABELS[type]}</p>
                <p className="text-2xl font-bold mt-1" style={{ fontFamily: "'Rajdhani', sans-serif", color: count > 0 ? "oklch(0.75 0.2 160)" : "oklch(0.45 0.04 200)" }}>{count}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Resellers */}
        <div className="neon-card rounded-lg p-5">
          <h2 className="text-lg font-bold tracking-wider mb-4 flex items-center gap-2" style={{ fontFamily: "'Rajdhani', sans-serif", color: "oklch(0.85 0.25 160)" }}>
            <Trophy className="w-5 h-5" style={{ color: "oklch(0.75 0.18 80)" }} /> TOP REVENDEDORES
          </h2>
          {(!data?.topResellers || data.topResellers.length === 0) ? (
            <p className="text-sm text-center py-6" style={{ color: "oklch(0.45 0.04 200)" }}>Nenhum revendedor cadastrado.</p>
          ) : (
            <div className="space-y-2">
              {data.topResellers.map((r, i) => (
                <div key={r.id} className="flex items-center gap-3 px-3 py-2 rounded" style={{ background: "oklch(0.09 0.02 240)" }}>
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: i === 0 ? "oklch(0.75 0.18 80 / 0.2)" : i === 1 ? "oklch(0.65 0.05 200 / 0.2)" : "oklch(0.55 0.1 50 / 0.2)",
                      color: i === 0 ? "oklch(0.85 0.18 80)" : i === 1 ? "oklch(0.75 0.05 200)" : "oklch(0.65 0.1 50)",
                      border: `1px solid ${i === 0 ? "oklch(0.75 0.18 80 / 0.4)" : i === 1 ? "oklch(0.65 0.05 200 / 0.4)" : "oklch(0.55 0.1 50 / 0.4)"}`,
                      fontFamily: "'Share Tech Mono', monospace",
                    }}>
                    {i + 1}
                  </span>
                  <span className="flex-1 font-semibold text-sm" style={{ fontFamily: "'Rajdhani', sans-serif", color: "oklch(0.85 0.05 160)" }}>{r.username}</span>
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: "oklch(0.75 0.2 160 / 0.1)", color: "oklch(0.75 0.2 160)", fontFamily: "'Share Tech Mono', monospace" }}>
                    {r.totalKeysGenerated} keys
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="neon-card rounded-lg p-5">
          <h2 className="text-lg font-bold tracking-wider mb-4 flex items-center gap-2" style={{ fontFamily: "'Rajdhani', sans-serif", color: "oklch(0.85 0.25 160)" }}>
            <Zap className="w-5 h-5" /> AÇÕES RÁPIDAS
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/resellers">
              <div className="p-4 rounded cursor-pointer transition-all text-center"
                style={{ background: "oklch(0.7 0.22 195 / 0.08)", border: "1px solid oklch(0.7 0.22 195 / 0.3)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "oklch(0.7 0.22 195 / 0.15)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "oklch(0.7 0.22 195 / 0.08)"; }}>
                <Plus className="w-6 h-6 mx-auto mb-2" style={{ color: "oklch(0.7 0.22 195)" }} />
                <p className="text-xs font-bold tracking-wider" style={{ color: "oklch(0.7 0.22 195)", fontFamily: "'Rajdhani', sans-serif" }}>NOVO REVENDEDOR</p>
              </div>
            </Link>
            <Link href="/admin/stock">
              <div className="p-4 rounded cursor-pointer transition-all text-center"
                style={{ background: "oklch(0.75 0.2 160 / 0.08)", border: "1px solid oklch(0.75 0.2 160 / 0.3)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "oklch(0.75 0.2 160 / 0.15)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "oklch(0.75 0.2 160 / 0.08)"; }}>
                <Package className="w-6 h-6 mx-auto mb-2" style={{ color: "oklch(0.75 0.2 160)" }} />
                <p className="text-xs font-bold tracking-wider" style={{ color: "oklch(0.75 0.2 160)", fontFamily: "'Rajdhani', sans-serif" }}>ADICIONAR ESTOQUE</p>
              </div>
            </Link>
            <Link href="/admin/ranking">
              <div className="p-4 rounded cursor-pointer transition-all text-center"
                style={{ background: "oklch(0.75 0.18 80 / 0.08)", border: "1px solid oklch(0.75 0.18 80 / 0.3)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "oklch(0.75 0.18 80 / 0.15)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "oklch(0.75 0.18 80 / 0.08)"; }}>
                <Trophy className="w-6 h-6 mx-auto mb-2" style={{ color: "oklch(0.75 0.18 80)" }} />
                <p className="text-xs font-bold tracking-wider" style={{ color: "oklch(0.75 0.18 80)", fontFamily: "'Rajdhani', sans-serif" }}>VER RANKING</p>
              </div>
            </Link>
            <Link href="/admin/history">
              <div className="p-4 rounded cursor-pointer transition-all text-center"
                style={{ background: "oklch(0.7 0.18 280 / 0.08)", border: "1px solid oklch(0.7 0.18 280 / 0.3)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "oklch(0.7 0.18 280 / 0.15)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "oklch(0.7 0.18 280 / 0.08)"; }}>
                <Key className="w-6 h-6 mx-auto mb-2" style={{ color: "oklch(0.7 0.18 280)" }} />
                <p className="text-xs font-bold tracking-wider" style={{ color: "oklch(0.7 0.18 280)", fontFamily: "'Rajdhani', sans-serif" }}>HISTÓRICO KEYS</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
