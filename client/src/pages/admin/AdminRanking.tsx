import { trpc } from "@/lib/trpc";
import { Trophy, Loader2, Diamond } from "lucide-react";

export default function AdminRanking() {
  const { data: ranking, isLoading } = trpc.admin.ranking.useQuery(undefined, { refetchInterval: 15000 });

  const medalColors = [
    "oklch(0.85 0.18 80)",   // gold
    "oklch(0.75 0.05 200)",  // silver
    "oklch(0.65 0.1 50)",    // bronze
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-wider" style={{ fontFamily: "'Rajdhani', sans-serif", color: "oklch(0.92 0.05 160)" }}>
          RANKING DE <span style={{ color: "oklch(0.75 0.18 80)", textShadow: "0 0 12px oklch(0.75 0.18 80 / 0.6)" }}>VENDAS</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: "oklch(0.45 0.04 200)" }}>Veja quem são os revendedores mais ativos do sistema</p>
      </div>

      <div className="neon-card rounded-lg p-5">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" style={{ color: "oklch(0.75 0.2 160)" }} /></div>
        ) : !ranking || ranking.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: "oklch(0.75 0.18 80)" }} />
            <p className="text-sm" style={{ color: "oklch(0.45 0.04 200)" }}>Nenhum revendedor no ranking ainda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ranking.map((r, i) => {
              const medalColor = i < 3 ? medalColors[i] : "oklch(0.45 0.04 200)";
              return (
                <div key={r.id} className="flex items-center gap-4 px-4 py-3 rounded transition-all"
                  style={{ background: i === 0 ? "oklch(0.85 0.18 80 / 0.06)" : "oklch(0.09 0.02 240)", border: `1px solid ${i === 0 ? "oklch(0.85 0.18 80 / 0.2)" : "oklch(0.18 0.03 240)"}` }}>
                  {/* Position */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
                    style={{ background: `${medalColor}20`, border: `1px solid ${medalColor}40`, color: medalColor, fontFamily: "'Share Tech Mono', monospace" }}>
                    {i + 1}
                  </div>
                  {/* Trophy for top 3 */}
                  {i < 3 && <Trophy className="w-4 h-4 flex-shrink-0" style={{ color: medalColor }} />}
                  {/* Name */}
                  <span className="flex-1 font-bold text-lg" style={{ fontFamily: "'Rajdhani', sans-serif", color: "oklch(0.88 0.05 160)" }}>{r.username}</span>
                  {/* Keys badge */}
                  <span className="px-3 py-1 rounded text-sm font-bold" style={{ background: "oklch(0.75 0.2 160 / 0.1)", border: "1px solid oklch(0.75 0.2 160 / 0.3)", color: "oklch(0.75 0.2 160)", fontFamily: "'Share Tech Mono', monospace" }}>
                    {r.totalKeysGenerated} keys
                  </span>
                  {/* Credits */}
                  <span className="flex items-center gap-1 text-sm font-bold" style={{ color: "oklch(0.7 0.22 195)", fontFamily: "'Share Tech Mono', monospace" }}>
                    <Diamond className="w-3.5 h-3.5" /> {r.credits.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
