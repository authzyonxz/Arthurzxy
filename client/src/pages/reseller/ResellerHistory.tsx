import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { History, Loader2, Copy, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const TYPE_COLORS: Record<string, string> = {
  "1h": "oklch(0.7 0.22 195)", "1d": "oklch(0.75 0.2 160)", "7d": "oklch(0.7 0.18 280)", "30d": "oklch(0.75 0.18 80)", "999d": "oklch(0.65 0.25 25)",
};

export default function ResellerHistory() {
  const { data: keys, isLoading } = trpc.reseller.myKeys.useQuery(undefined, { refetchInterval: 15000 });
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (id: number, value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedId(id);
      toast.success("Key copiada!");
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-wider" style={{ fontFamily: "'Rajdhani', sans-serif", color: "oklch(0.92 0.05 160)" }}>
          MINHAS <span style={{ color: "oklch(0.7 0.18 280)", textShadow: "0 0 12px oklch(0.7 0.18 280 / 0.6)" }}>KEYS</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: "oklch(0.45 0.04 200)" }}>Histórico completo de keys geradas por você</p>
      </div>

      <div className="neon-card rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold tracking-wider flex items-center gap-2" style={{ fontFamily: "'Rajdhani', sans-serif", color: "oklch(0.85 0.25 160)" }}>
            <History className="w-5 h-5" /> HISTÓRICO COMPLETO
          </h2>
          {keys && (
            <span className="text-xs px-2 py-0.5 rounded badge-cyan font-bold" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
              {keys.length} keys
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
                  {["#", "Key", "Tipo", "Data"].map(h => (
                    <th key={h} className="text-left pb-3 px-2 text-xs font-bold tracking-widest uppercase" style={{ color: "oklch(0.45 0.04 200)", fontFamily: "'Rajdhani', sans-serif" }}>{h}</th>
                  ))}
                  <th className="text-right pb-3 px-2 text-xs font-bold tracking-widest uppercase" style={{ color: "oklch(0.45 0.04 200)", fontFamily: "'Rajdhani', sans-serif" }}>Copiar</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k, i) => (
                  <tr key={k.id} style={{ borderBottom: "1px solid oklch(0.13 0.025 240)" }}>
                    <td className="py-3 px-2 text-xs" style={{ color: "oklch(0.45 0.04 200)", fontFamily: "'Share Tech Mono', monospace" }}>{i + 1}</td>
                    <td className="py-3 px-2">
                      <code className="text-sm font-bold" style={{ color: "oklch(0.75 0.2 160)", fontFamily: "'Share Tech Mono', monospace" }}>{k.keyValue}</code>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-xs px-2 py-0.5 rounded font-bold"
                        style={{ background: `${TYPE_COLORS[k.keyType] ?? "oklch(0.55 0.05 200)"}20`, border: `1px solid ${TYPE_COLORS[k.keyType] ?? "oklch(0.55 0.05 200)"}40`, color: TYPE_COLORS[k.keyType] ?? "oklch(0.55 0.05 200)", fontFamily: "'Share Tech Mono', monospace" }}>
                        {k.keyType.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-xs" style={{ color: "oklch(0.55 0.05 200)", fontFamily: "'Share Tech Mono', monospace" }}>
                      {new Date(k.generatedAt).toLocaleString("pt-BR")}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button onClick={() => handleCopy(k.id, k.keyValue)}
                        className="p-1.5 rounded transition-all"
                        style={{ background: "oklch(0.75 0.2 160 / 0.1)", border: "1px solid oklch(0.75 0.2 160 / 0.3)", color: "oklch(0.75 0.2 160)" }}>
                        {copiedId === k.id ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
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
