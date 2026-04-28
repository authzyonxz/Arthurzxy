import { trpc } from "@/lib/trpc";
import { History, Loader2 } from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  "1h": "oklch(0.7 0.22 195)", "1d": "oklch(0.75 0.2 160)", "7d": "oklch(0.7 0.18 280)", "30d": "oklch(0.75 0.18 80)", "999d": "oklch(0.65 0.25 25)",
};

export default function AdminHistory() {
  const { data: keys, isLoading } = trpc.admin.allGeneratedKeys.useQuery(undefined, { refetchInterval: 15000 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-wider" style={{ fontFamily: "'Rajdhani', sans-serif", color: "oklch(0.92 0.05 160)" }}>
          HISTÓRICO DE <span style={{ color: "oklch(0.7 0.18 280)", textShadow: "0 0 12px oklch(0.7 0.18 280 / 0.6)" }}>KEYS</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: "oklch(0.45 0.04 200)" }}>Todas as keys geradas pelos revendedores</p>
      </div>

      <div className="neon-card rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold tracking-wider flex items-center gap-2" style={{ fontFamily: "'Rajdhani', sans-serif", color: "oklch(0.85 0.25 160)" }}>
            <History className="w-5 h-5" /> TODAS AS KEYS GERADAS
          </h2>
          {keys && (
            <span className="text-xs px-2 py-0.5 rounded badge-cyan font-bold" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
              {keys.length} total
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" style={{ color: "oklch(0.75 0.2 160)" }} /></div>
        ) : !keys || keys.length === 0 ? (
          <p className="text-center py-12 text-sm" style={{ color: "oklch(0.45 0.04 200)" }}>Nenhuma key gerada ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid oklch(0.2 0.04 240)" }}>
                  {["#", "Revendedor", "Key", "Tipo", "Data"].map(h => (
                    <th key={h} className="text-left pb-3 px-2 text-xs font-bold tracking-widest uppercase" style={{ color: "oklch(0.45 0.04 200)", fontFamily: "'Rajdhani', sans-serif" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {keys.map((k, i) => (
                  <tr key={k.id} style={{ borderBottom: "1px solid oklch(0.13 0.025 240)" }}>
                    <td className="py-2.5 px-2 text-xs" style={{ color: "oklch(0.45 0.04 200)", fontFamily: "'Share Tech Mono', monospace" }}>{i + 1}</td>
                    <td className="py-2.5 px-2 font-semibold" style={{ color: "oklch(0.85 0.05 160)", fontFamily: "'Rajdhani', sans-serif" }}>{k.resellerName ?? "—"}</td>
                    <td className="py-2.5 px-2 font-mono text-xs" style={{ color: "oklch(0.75 0.2 160)" }}>{k.keyValue}</td>
                    <td className="py-2.5 px-2">
                      <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ background: `${TYPE_COLORS[k.keyType] ?? "oklch(0.55 0.05 200)"}20`, border: `1px solid ${TYPE_COLORS[k.keyType] ?? "oklch(0.55 0.05 200)"}40`, color: TYPE_COLORS[k.keyType] ?? "oklch(0.55 0.05 200)", fontFamily: "'Share Tech Mono', monospace" }}>
                        {k.keyType.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-xs" style={{ color: "oklch(0.55 0.05 200)", fontFamily: "'Share Tech Mono', monospace" }}>
                      {new Date(k.generatedAt).toLocaleString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
