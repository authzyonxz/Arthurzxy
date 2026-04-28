import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Key, Diamond, Zap, Loader2, Copy, CheckCircle, X } from "lucide-react";

const KEY_TYPES = ["1h", "1d", "7d", "30d", "999d"] as const;
type KeyType = typeof KEY_TYPES[number];

const TYPE_LABELS: Record<KeyType, string> = {
  "1h": "1 HORA", "1d": "1 DIA", "7d": "7 DIAS", "30d": "30 DIAS", "999d": "999 DIAS",
};
const TYPE_COLORS: Record<KeyType, string> = {
  "1h": "oklch(0.7 0.22 195)", "1d": "oklch(0.75 0.2 160)", "7d": "oklch(0.7 0.18 280)", "30d": "oklch(0.75 0.18 80)", "999d": "oklch(0.65 0.25 25)",
};

export default function ResellerDashboard() {
  const utils = trpc.useUtils();
  const { data: me, isLoading: meLoading } = trpc.reseller.me.useQuery(undefined, { refetchInterval: 10000 });
  const { data: myKeys } = trpc.reseller.myKeys.useQuery(undefined, { refetchInterval: 10000 });
  const { data: stock } = trpc.reseller.getStockAvailable.useQuery(undefined, { refetchInterval: 10000 });

  const [selectedType, setSelectedType] = useState<KeyType>("1d");
  const [quantity, setQuantity] = useState(1);
  const [lastGenerated, setLastGenerated] = useState<string | null>(null);
  const [generatedKeys, setGeneratedKeys] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateMutation = trpc.reseller.generateKey.useMutation({
    onSuccess: (data) => {
      toast.success(`Key gerada: ${data.keyValue}`);
      setLastGenerated(data.keyValue);
      utils.reseller.me.invalidate();
      utils.reseller.myKeys.invalidate();
      utils.reseller.getStockAvailable.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const generateMultipleMutation = trpc.reseller.generateMultipleKeys.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.quantity} keys geradas com sucesso!`);
      setGeneratedKeys(data.keys);
      setShowModal(true);
      utils.reseller.me.invalidate();
      utils.reseller.myKeys.invalidate();
      utils.reseller.getStockAvailable.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success("Key copiada!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCopyAll = () => {
    const allKeys = generatedKeys.join("\n");
    navigator.clipboard.writeText(allKeys).then(() => {
      toast.success(`${generatedKeys.length} keys copiadas!`);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-wider" style={{ fontFamily: "'Rajdhani', sans-serif", color: "oklch(0.92 0.05 160)" }}>
          PAINEL DO <span style={{ color: "oklch(0.7 0.22 195)", textShadow: "0 0 12px oklch(0.7 0.22 195 / 0.6)" }}>REVENDEDOR</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: "oklch(0.45 0.04 200)" }}>
          Bem-vindo, <span style={{ color: "oklch(0.75 0.2 160)" }}>{me?.username}</span>
        </p>
      </div>

      {/* Credits card */}
      <div className="neon-card rounded-lg p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "oklch(0.7 0.22 195 / 0.15)", border: "1px solid oklch(0.7 0.22 195 / 0.4)" }}>
          <Diamond className="w-7 h-7" style={{ color: "oklch(0.7 0.22 195)" }} />
        </div>
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "oklch(0.45 0.04 200)" }}>Saldo de Créditos</p>
          {meLoading ? (
            <Loader2 className="w-6 h-6 animate-spin mt-1" style={{ color: "oklch(0.7 0.22 195)" }} />
          ) : (
            <p className="text-4xl font-bold mt-0.5" style={{ fontFamily: "'Rajdhani', sans-serif", color: "oklch(0.7 0.22 195)", textShadow: "0 0 12px oklch(0.7 0.22 195 / 0.5)" }}>
              {me?.credits?.toLocaleString() ?? 0}
            </p>
          )}
          <p className="text-xs mt-0.5" style={{ color: "oklch(0.45 0.04 200)" }}>1 crédito = 1 key gerada</p>
        </div>
      </div>

      {/* Stock Available */}
      <div className="neon-card rounded-lg p-5">
        <h2 className="text-lg font-bold tracking-wider mb-4" style={{ fontFamily: "'Rajdhani', sans-serif", color: "oklch(0.85 0.25 160)" }}>
          📦 ESTOQUE DISPONÍVEL
        </h2>
        <div className="grid grid-cols-5 gap-3">
          {KEY_TYPES.map((type) => (
            <div key={type} className="rounded p-3 text-center" style={{ background: "oklch(0.09 0.02 240)", border: `1px solid ${TYPE_COLORS[type]}40` }}>
              <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: "oklch(0.55 0.05 200)" }}>{type}</p>
              <p className="text-2xl font-bold" style={{ color: TYPE_COLORS[type], fontFamily: "'Rajdhani', sans-serif" }}>
                {stock?.[type] ?? 0}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generate key */}
        <div className="neon-card rounded-lg p-5">
          <h2 className="text-lg font-bold tracking-wider mb-4 flex items-center gap-2" style={{ fontFamily: "'Rajdhani', sans-serif", color: "oklch(0.85 0.25 160)" }}>
            <Zap className="w-5 h-5" /> GERAR KEY
          </h2>

          <div className="mb-4">
            <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "oklch(0.55 0.05 200)" }}>Tipo de Key</label>
            <div className="grid grid-cols-5 gap-2">
              {KEY_TYPES.map((type) => {
                const color = TYPE_COLORS[type];
                const isSelected = selectedType === type;
                return (
                  <button key={type} onClick={() => setSelectedType(type)}
                    className="py-2 rounded text-xs font-bold tracking-wider transition-all"
                    style={{
                      background: isSelected ? `${color}20` : "oklch(0.09 0.02 240)",
                      border: `1px solid ${isSelected ? color : "oklch(0.2 0.04 240)"}`,
                      color: isSelected ? color : "oklch(0.55 0.05 200)",
                      fontFamily: "'Share Tech Mono', monospace",
                      boxShadow: isSelected ? `0 0 8px ${color}40` : "none",
                    }}>
                    {type.toUpperCase()}
                  </button>
                );
              })}
            </div>
            <p className="text-xs mt-2 text-center" style={{ color: "oklch(0.45 0.04 200)" }}>
              Tipo selecionado: <span style={{ color: TYPE_COLORS[selectedType] }}>{TYPE_LABELS[selectedType]}</span>
            </p>
          </div>

          {/* Quantity input for multiple keys */}
          <div className="mb-4">
            <label className="block text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "oklch(0.55 0.05 200)" }}>Quantidade (1-50)</label>
            <input
              type="number"
              min="1"
              max="50"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
              className="w-full px-3 py-2 rounded text-sm font-bold"
              style={{
                background: "oklch(0.09 0.02 240)",
                border: "1px solid oklch(0.2 0.04 240)",
                color: "oklch(0.75 0.2 160)",
                fontFamily: "'Share Tech Mono', monospace",
              }}
            />
            <p className="text-xs mt-1" style={{ color: "oklch(0.45 0.04 200)" }}>
              Custo: <span style={{ color: "oklch(0.7 0.22 195)" }}>{quantity} créditos</span>
            </p>
          </div>

          {/* Multiple keys button */}
          <button
            onClick={() => generateMultipleMutation.mutate({ keyType: selectedType, quantity })}
            disabled={generateMultipleMutation.isPending || (me?.credits ?? 0) < quantity}
            className="w-full py-2.5 rounded font-bold text-sm tracking-widest uppercase transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, oklch(0.75 0.2 160 / 0.3), oklch(0.7 0.22 195 / 0.2))",
              border: "2px solid oklch(0.75 0.2 160)",
              color: "oklch(0.92 0.05 160)",
              textShadow: "0 0 10px oklch(0.75 0.25 160 / 0.7)",
              boxShadow: "0 0 20px oklch(0.75 0.2 160 / 0.5)",
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: "0.9rem",
            }}>
            {generateMultipleMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
            {quantity === 1 ? 'GERAR KEY' : `GERAR ${quantity} KEYS`}
          </button>

          {(me?.credits ?? 0) < Math.max(1, quantity) && (
            <p className="text-xs text-center mt-2" style={{ color: "oklch(0.65 0.25 25)" }}>
              Créditos insuficientes. Contate o administrador.
            </p>
          )}

          {/* Last generated key */}
          {lastGenerated && (
            <div className="mt-4 p-3 rounded" style={{ background: "oklch(0.75 0.2 160 / 0.08)", border: "1px solid oklch(0.75 0.2 160 / 0.3)" }}>
              <p className="text-xs font-bold tracking-widest uppercase mb-1.5" style={{ color: "oklch(0.55 0.05 200)" }}>Última Key Gerada</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-bold" style={{ color: "oklch(0.85 0.25 160)", fontFamily: "'Share Tech Mono', monospace", textShadow: "0 0 8px oklch(0.75 0.25 160 / 0.5)" }}>
                  {lastGenerated}
                </code>
                <button onClick={() => handleCopy(lastGenerated)} className="p-1.5 rounded transition-all"
                  style={{ background: "oklch(0.75 0.2 160 / 0.15)", border: "1px solid oklch(0.75 0.2 160 / 0.4)", color: "oklch(0.75 0.2 160)" }}>
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Recent keys */}
        <div className="neon-card rounded-lg p-5">
          <h2 className="text-lg font-bold tracking-wider mb-4 flex items-center gap-2" style={{ fontFamily: "'Rajdhani', sans-serif", color: "oklch(0.85 0.25 160)" }}>
            <Key className="w-5 h-5" /> ÚLTIMAS KEYS
          </h2>
          {!myKeys || myKeys.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: "oklch(0.45 0.04 200)" }}>Nenhuma key gerada ainda.</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {myKeys.slice(0, 10).map((k) => (
                <div key={k.id} className="flex items-center gap-2 px-3 py-2 rounded" style={{ background: "oklch(0.09 0.02 240)", border: "1px solid oklch(0.18 0.03 240)" }}>
                  <code className="flex-1 text-xs" style={{ color: "oklch(0.75 0.2 160)", fontFamily: "'Share Tech Mono', monospace" }}>{k.keyValue}</code>
                  <span className="text-xs px-1.5 py-0.5 rounded font-bold flex-shrink-0"
                    style={{ background: `${TYPE_COLORS[k.keyType as KeyType] ?? "oklch(0.55 0.05 200)"}20`, border: `1px solid ${TYPE_COLORS[k.keyType as KeyType] ?? "oklch(0.55 0.05 200)"}40`, color: TYPE_COLORS[k.keyType as KeyType] ?? "oklch(0.55 0.05 200)", fontFamily: "'Share Tech Mono', monospace" }}>
                    {k.keyType.toUpperCase()}
                  </span>
                  <button onClick={() => handleCopy(k.keyValue)} className="p-1 rounded flex-shrink-0"
                    style={{ color: "oklch(0.45 0.04 200)" }}>
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal for multiple generated keys */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-black rounded-lg max-w-2xl w-full p-6" style={{ border: "2px solid oklch(0.75 0.2 160)", boxShadow: "0 0 30px oklch(0.75 0.2 160 / 0.4)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold tracking-wider" style={{ fontFamily: "'Rajdhani', sans-serif", color: "oklch(0.92 0.05 160)" }}>
                ✨ {generatedKeys.length} KEYS GERADAS
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1" style={{ color: "oklch(0.45 0.04 200)" }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Keys list */}
            <div className="bg-black rounded p-4 mb-4 max-h-96 overflow-y-auto" style={{ border: "1px solid oklch(0.75 0.2 160 / 0.3)" }}>
              <div className="space-y-2">
                {generatedKeys.map((key, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded" style={{ background: "oklch(0.09 0.02 240)", border: "1px solid oklch(0.18 0.03 240)" }}>
                    <code className="flex-1 text-sm font-bold" style={{ color: "oklch(0.75 0.2 160)", fontFamily: "'Share Tech Mono', monospace" }}>
                      {key}
                    </code>
                    <button onClick={() => handleCopy(key)} className="p-1 rounded flex-shrink-0" style={{ color: "oklch(0.45 0.04 200)" }}>
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCopyAll}
                className="flex-1 py-3 rounded font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, oklch(0.75 0.2 160 / 0.3), oklch(0.7 0.22 195 / 0.2))",
                  border: "2px solid oklch(0.75 0.2 160)",
                  color: "oklch(0.92 0.05 160)",
                  textShadow: "0 0 10px oklch(0.75 0.25 160 / 0.7)",
                  boxShadow: "0 0 20px oklch(0.75 0.2 160 / 0.5)",
                  fontFamily: "'Rajdhani', sans-serif",
                }}>
                <Copy className="w-4 h-4" />
                COPIAR TODAS
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded font-bold tracking-widest uppercase transition-all"
                style={{
                  background: "oklch(0.09 0.02 240)",
                  border: "1px solid oklch(0.2 0.04 240)",
                  color: "oklch(0.55 0.05 200)",
                  fontFamily: "'Rajdhani', sans-serif",
                }}>
                FECHAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
