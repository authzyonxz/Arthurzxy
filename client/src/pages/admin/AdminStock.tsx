import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Package, Plus, Trash2, Loader2, Key } from "lucide-react";

const KEY_TYPES = ["1h", "1d", "7d", "30d", "999d"] as const;
type KeyType = typeof KEY_TYPES[number];

const TYPE_LABELS: Record<KeyType, string> = {
  "1h": "1 HORA", "1d": "1 DIA", "7d": "7 DIAS", "30d": "30 DIAS", "999d": "999 DIAS",
};
const TYPE_COLORS: Record<KeyType, string> = {
  "1h": "oklch(0.7 0.22 195)", "1d": "oklch(0.75 0.2 160)", "7d": "oklch(0.7 0.18 280)", "30d": "oklch(0.75 0.18 80)", "999d": "oklch(0.65 0.25 25)",
};

export default function AdminStock() {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.getStock.useQuery(undefined, { refetchInterval: 10000 });
  const [selectedType, setSelectedType] = useState<KeyType>("1h");
  const [keysText, setKeysText] = useState("");

  const addMutation = trpc.admin.addStock.useMutation({
    onSuccess: (res) => {
      toast.success(`${res.count} key(s) adicionada(s) ao estoque!`);
      setKeysText("");
      utils.admin.getStock.invalidate();
      utils.admin.dashboard.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const clearMutation = trpc.admin.clearStock.useMutation({
    onSuccess: () => { toast.success("Estoque limpo!"); utils.admin.getStock.invalidate(); utils.admin.dashboard.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keysText.trim()) { toast.error("Digite pelo menos uma key."); return; }
    addMutation.mutate({ keyType: selectedType, keys: keysText });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-wider" style={{ fontFamily: "'Rajdhani', sans-serif", color: "oklch(0.92 0.05 160)" }}>
          ESTOQUE <span style={{ color: "oklch(0.75 0.2 160)", textShadow: "0 0 12px oklch(0.75 0.2 160 / 0.6)" }}>GERAL</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: "oklch(0.45 0.04 200)" }}>Envie keys manualmente para o estoque dos revendedores</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add form */}
        <div className="neon-card rounded-lg p-5">
          <h2 className="text-lg font-bold tracking-wider mb-4 flex items-center gap-2" style={{ fontFamily: "'Rajdhani', sans-serif", color: "oklch(0.85 0.25 160)" }}>
            <Plus className="w-5 h-5" /> ENVIAR KEYS
          </h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color: "oklch(0.55 0.05 200)" }}>Tipo de Key</label>
              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value as KeyType)}
                className="w-full px-3 py-2.5 rounded text-sm outline-none transition-all"
                style={{ background: "oklch(0.09 0.02 240)", border: "1px solid oklch(0.22 0.04 240)", color: "oklch(0.92 0.05 160)", fontFamily: "'Share Tech Mono', monospace" }}>
                {KEY_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color: "oklch(0.55 0.05 200)" }}>Keys (uma por linha)</label>
              <textarea value={keysText} onChange={(e) => setKeysText(e.target.value)}
                placeholder={"KEY-XXXX-XXXX\nKEY-YYYY-YYYY"} rows={8}
                className="w-full px-3 py-2.5 rounded text-sm outline-none transition-all resize-none"
                style={{ background: "oklch(0.09 0.02 240)", border: "1px solid oklch(0.22 0.04 240)", color: "oklch(0.92 0.05 160)", fontFamily: "'Share Tech Mono', monospace" }}
                onFocus={(e) => { e.target.style.borderColor = "oklch(0.75 0.2 160)"; }}
                onBlur={(e) => { e.target.style.borderColor = "oklch(0.22 0.04 240)"; }} />
            </div>
            <button type="submit" disabled={addMutation.isPending}
              className="w-full py-2.5 rounded font-bold text-sm tracking-widest uppercase transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, oklch(0.75 0.2 160 / 0.2), oklch(0.7 0.22 195 / 0.15))", border: "1px solid oklch(0.75 0.2 160)", color: "oklch(0.85 0.25 160)", boxShadow: "0 0 12px oklch(0.75 0.2 160 / 0.3)", fontFamily: "'Rajdhani', sans-serif", fontSize: "0.95rem" }}>
              {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              ADICIONAR AO ESTOQUE
            </button>
          </form>
        </div>

        {/* Stock by type */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {KEY_TYPES.map((type) => {
              const count = (data?.counts as Record<string, number>)?.[type] ?? 0;
              const color = TYPE_COLORS[type];
              return (
                <div key={type} className="neon-card rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold tracking-widest" style={{ color: "oklch(0.55 0.05 200)", fontFamily: "'Share Tech Mono', monospace" }}>{TYPE_LABELS[type]}</span>
                    <Key className="w-4 h-4" style={{ color }} />
                  </div>
                  <p className="text-3xl font-bold" style={{ fontFamily: "'Rajdhani', sans-serif", color: count > 0 ? color : "oklch(0.35 0.03 200)" }}>
                    {isLoading ? "..." : count}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "oklch(0.45 0.04 200)" }}>disponíveis</p>
                  <button
                    onClick={() => { if (confirm(`Limpar todo o estoque de ${TYPE_LABELS[type]}?`)) clearMutation.mutate({ keyType: type }); }}
                    disabled={clearMutation.isPending || count === 0}
                    className="mt-3 w-full py-1.5 rounded text-xs font-bold tracking-wider uppercase transition-all disabled:opacity-30"
                    style={{ background: "oklch(0.65 0.25 25 / 0.1)", border: "1px solid oklch(0.65 0.25 25 / 0.3)", color: "oklch(0.65 0.25 25)", fontFamily: "'Rajdhani', sans-serif" }}>
                    <Trash2 className="w-3 h-3 inline mr-1" />LIMPAR
                  </button>
                </div>
              );
            })}
          </div>

          {/* Recent keys */}
          <div className="neon-card rounded-lg p-5">
            <h2 className="text-lg font-bold tracking-wider mb-4 flex items-center gap-2" style={{ fontFamily: "'Rajdhani', sans-serif", color: "oklch(0.85 0.25 160)" }}>
              <Package className="w-5 h-5" /> ÚLTIMAS KEYS ADICIONADAS
            </h2>
            {isLoading ? (
              <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin" style={{ color: "oklch(0.75 0.2 160)" }} /></div>
            ) : !data?.recent || data.recent.length === 0 ? (
              <p className="text-center py-6 text-sm" style={{ color: "oklch(0.45 0.04 200)" }}>Nenhuma key no estoque.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid oklch(0.2 0.04 240)" }}>
                      {["Key", "Tipo", "Status", "Data"].map(h => (
                        <th key={h} className="text-left pb-3 px-2 text-xs font-bold tracking-widest uppercase" style={{ color: "oklch(0.45 0.04 200)", fontFamily: "'Rajdhani', sans-serif" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent.map((k) => (
                      <tr key={k.id} style={{ borderBottom: "1px solid oklch(0.13 0.025 240)" }}>
                        <td className="py-2 px-2 font-mono text-xs" style={{ color: "oklch(0.75 0.2 160)" }}>{k.keyValue}</td>
                        <td className="py-2 px-2">
                          <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ background: `${TYPE_COLORS[k.keyType as KeyType]}20`, border: `1px solid ${TYPE_COLORS[k.keyType as KeyType]}40`, color: TYPE_COLORS[k.keyType as KeyType], fontFamily: "'Share Tech Mono', monospace" }}>
                            {k.keyType.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2 px-2">
                          <span className={`text-xs px-2 py-0.5 rounded font-bold ${k.isUsed ? "badge-red" : "badge-green"}`}>
                            {k.isUsed ? "USADA" : "DISPONÍVEL"}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-xs" style={{ color: "oklch(0.55 0.05 200)", fontFamily: "'Share Tech Mono', monospace" }}>
                          {new Date(k.addedAt).toLocaleString("pt-BR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
