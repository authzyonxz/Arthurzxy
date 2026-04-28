import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Users, Plus, Pause, Play, Trash2, CreditCard, Loader2, Diamond } from "lucide-react";

export default function AdminResellers() {
  const utils = trpc.useUtils();
  const { data: resellers, isLoading } = trpc.admin.listResellers.useQuery();

  const [newUser, setNewUser] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newCredits, setNewCredits] = useState(0);
  const [addCreditsId, setAddCreditsId] = useState<number | null>(null);
  const [addCreditsAmount, setAddCreditsAmount] = useState(100);

  const createMutation = trpc.admin.createReseller.useMutation({
    onSuccess: () => {
      toast.success("Revendedor criado com sucesso!");
      setNewUser(""); setNewPass(""); setNewCredits(0);
      utils.admin.listResellers.invalidate();
      utils.admin.dashboard.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const pauseMutation = trpc.admin.pauseReseller.useMutation({
    onSuccess: () => { toast.success("Status atualizado!"); utils.admin.listResellers.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.admin.deleteReseller.useMutation({
    onSuccess: () => { toast.success("Revendedor excluído."); utils.admin.listResellers.invalidate(); utils.admin.dashboard.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const addCreditsMutation = trpc.admin.addCredits.useMutation({
    onSuccess: () => { toast.success("Créditos adicionados!"); setAddCreditsId(null); utils.admin.listResellers.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.trim() || !newPass.trim()) { toast.error("Preencha usuário e senha."); return; }
    createMutation.mutate({ username: newUser.trim(), password: newPass, credits: newCredits });
  };

  const inputStyle = {
    background: "oklch(0.09 0.02 240)",
    border: "1px solid oklch(0.22 0.04 240)",
    color: "oklch(0.92 0.05 160)",
    fontFamily: "'Share Tech Mono', monospace",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-wider" style={{ fontFamily: "'Rajdhani', sans-serif", color: "oklch(0.92 0.05 160)" }}>
          GERENCIAR <span style={{ color: "oklch(0.7 0.22 195)", textShadow: "0 0 12px oklch(0.7 0.22 195 / 0.6)" }}>REVENDEDORES</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: "oklch(0.45 0.04 200)" }}>Crie e controle as contas dos seus revendedores</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create form */}
        <div className="neon-card rounded-lg p-5">
          <h2 className="text-lg font-bold tracking-wider mb-4 flex items-center gap-2" style={{ fontFamily: "'Rajdhani', sans-serif", color: "oklch(0.85 0.25 160)" }}>
            <Plus className="w-5 h-5" /> NOVO REVENDEDOR
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color: "oklch(0.55 0.05 200)" }}>Usuário</label>
              <input value={newUser} onChange={(e) => setNewUser(e.target.value)} placeholder="Nome de usuário"
                className="w-full px-3 py-2.5 rounded text-sm outline-none transition-all" style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "oklch(0.75 0.2 160)"; }}
                onBlur={(e) => { e.target.style.borderColor = "oklch(0.22 0.04 240)"; }} />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color: "oklch(0.55 0.05 200)" }}>Senha</label>
              <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Senha"
                className="w-full px-3 py-2.5 rounded text-sm outline-none transition-all" style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "oklch(0.75 0.2 160)"; }}
                onBlur={(e) => { e.target.style.borderColor = "oklch(0.22 0.04 240)"; }} />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase mb-1.5" style={{ color: "oklch(0.55 0.05 200)" }}>Créditos Iniciais</label>
              <input type="number" value={newCredits} onChange={(e) => setNewCredits(Number(e.target.value))} min={0}
                className="w-full px-3 py-2.5 rounded text-sm outline-none transition-all" style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "oklch(0.75 0.2 160)"; }}
                onBlur={(e) => { e.target.style.borderColor = "oklch(0.22 0.04 240)"; }} />
            </div>
            <button type="submit" disabled={createMutation.isPending}
              className="w-full py-2.5 rounded font-bold text-sm tracking-widest uppercase transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, oklch(0.75 0.2 160 / 0.2), oklch(0.7 0.22 195 / 0.15))", border: "1px solid oklch(0.75 0.2 160)", color: "oklch(0.85 0.25 160)", boxShadow: "0 0 12px oklch(0.75 0.2 160 / 0.3)", fontFamily: "'Rajdhani', sans-serif", fontSize: "0.95rem" }}>
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              CRIAR CONTA
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 neon-card rounded-lg p-5">
          <h2 className="text-lg font-bold tracking-wider mb-4 flex items-center gap-2" style={{ fontFamily: "'Rajdhani', sans-serif", color: "oklch(0.85 0.25 160)" }}>
            <Users className="w-5 h-5" /> REVENDEDORES CADASTRADOS
          </h2>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" style={{ color: "oklch(0.75 0.2 160)" }} /></div>
          ) : !resellers || resellers.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: "oklch(0.45 0.04 200)" }}>Nenhum revendedor cadastrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid oklch(0.2 0.04 240)" }}>
                    {["Usuário", "Créditos", "Status", "Ações"].map(h => (
                      <th key={h} className="text-left pb-3 px-2 text-xs font-bold tracking-widest uppercase" style={{ color: "oklch(0.45 0.04 200)", fontFamily: "'Rajdhani', sans-serif" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "oklch(0.15 0.03 240)" }}>
                  {resellers.map((r) => (
                    <tr key={r.id} style={{ borderColor: "oklch(0.15 0.03 240)" }}>
                      <td className="py-3 px-2 font-semibold" style={{ color: "oklch(0.85 0.05 160)", fontFamily: "'Rajdhani', sans-serif" }}>{r.username}</td>
                      <td className="py-3 px-2">
                        <span className="flex items-center gap-1 text-xs font-bold" style={{ color: "oklch(0.7 0.22 195)", fontFamily: "'Share Tech Mono', monospace" }}>
                          <Diamond className="w-3 h-3" /> {r.credits.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`text-xs px-2 py-0.5 rounded font-bold tracking-wider ${r.status === "active" ? "badge-green" : "badge-red"}`}>
                          {r.status === "active" ? "ATIVO" : "PAUSADO"}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1.5">
                          {/* Add credits */}
                          {addCreditsId === r.id ? (
                            <div className="flex items-center gap-1">
                              <input type="number" value={addCreditsAmount} onChange={(e) => setAddCreditsAmount(Number(e.target.value))} min={1}
                                className="w-20 px-2 py-1 rounded text-xs outline-none" style={{ ...inputStyle, border: "1px solid oklch(0.7 0.22 195 / 0.5)" }} />
                              <button onClick={() => addCreditsMutation.mutate({ id: r.id, amount: addCreditsAmount })}
                                disabled={addCreditsMutation.isPending}
                                className="px-2 py-1 rounded text-xs font-bold" style={{ background: "oklch(0.7 0.22 195 / 0.2)", border: "1px solid oklch(0.7 0.22 195 / 0.5)", color: "oklch(0.7 0.22 195)" }}>
                                OK
                              </button>
                              <button onClick={() => setAddCreditsId(null)} className="px-2 py-1 rounded text-xs" style={{ color: "oklch(0.55 0.05 200)" }}>✕</button>
                            </div>
                          ) : (
                            <button onClick={() => { setAddCreditsId(r.id); setAddCreditsAmount(100); }}
                              className="p-1.5 rounded transition-all" title="Adicionar Créditos"
                              style={{ background: "oklch(0.7 0.22 195 / 0.1)", border: "1px solid oklch(0.7 0.22 195 / 0.3)", color: "oklch(0.7 0.22 195)" }}>
                              <CreditCard className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {/* Pause/Resume */}
                          <button onClick={() => pauseMutation.mutate({ id: r.id, status: r.status === "active" ? "paused" : "active" })}
                            disabled={pauseMutation.isPending}
                            className="p-1.5 rounded transition-all" title={r.status === "active" ? "Pausar" : "Ativar"}
                            style={{ background: r.status === "active" ? "oklch(0.75 0.18 80 / 0.1)" : "oklch(0.75 0.2 160 / 0.1)", border: `1px solid ${r.status === "active" ? "oklch(0.75 0.18 80 / 0.3)" : "oklch(0.75 0.2 160 / 0.3)"}`, color: r.status === "active" ? "oklch(0.75 0.18 80)" : "oklch(0.75 0.2 160)" }}>
                            {r.status === "active" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          </button>
                          {/* Delete */}
                          <button onClick={() => { if (confirm(`Excluir revendedor "${r.username}"?`)) deleteMutation.mutate({ id: r.id }); }}
                            disabled={deleteMutation.isPending}
                            className="p-1.5 rounded transition-all" title="Excluir"
                            style={{ background: "oklch(0.65 0.25 25 / 0.1)", border: "1px solid oklch(0.65 0.25 25 / 0.3)", color: "oklch(0.65 0.25 25)" }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
  );
}
