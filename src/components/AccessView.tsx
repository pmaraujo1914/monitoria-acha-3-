import React, { useState } from "react";
import { UserAccount } from "../types";
import { UserPlus, Mail, CheckCircle2, Clock } from "lucide-react";

interface AccessViewProps {
  users: UserAccount[];
  onInviteUser: (email: string) => Promise<{ success: boolean; message?: string }>;
}

export const AccessView: React.FC<AccessViewProps> = ({ users, onInviteUser }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedInfo, setGeneratedInfo] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMessage(null);
    setGeneratedInfo(null);

    try {
      const res = await onInviteUser(email.trim());
      if (res.success) {
        setGeneratedInfo(email.trim().toLowerCase());
        setEmail("");
      } else {
        setErrorMessage(res.message || "Não foi possível criar o acesso.");
      }
    } catch {
      setErrorMessage("Erro ao conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  const nonAdminUsers = users.filter((u) => !u.isAdmin);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-2 border-b border-slate-200">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
          Administração local e remota
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Criar Acesso
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
          Cadastre novos e-mails da equipe. A pessoa criará a própria senha no primeiro acesso.
        </p>
      </div>

      {/* Invite Form Card */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Novo acesso de operador</h2>
          <p className="text-xs text-slate-500">Informe o e-mail corporativo da pessoa.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-end gap-3">
          <div className="flex-1 w-full">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              E-mail do operador
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@achaimoveis.com.br"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-all shadow-sm shadow-blue-600/20 disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? "Criando..." : "Criar Acesso"}</span>
          </button>
        </form>

        {errorMessage && (
          <p className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-lg">
            {errorMessage}
          </p>
        )}

        {generatedInfo && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs leading-relaxed">
            <strong className="block text-sm font-extrabold text-blue-700 mb-0.5">
              Acesso criado com sucesso!
            </strong>
            O e-mail <b>{generatedInfo}</b> foi cadastrado. Ao acessar a aplicação, a pessoa informará este e-mail e definirá sua própria senha pessoal no primeiro login.
          </div>
        )}
      </div>

      {/* Created Users List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-5">
        <div>
          <h2 className="text-base font-bold text-slate-900">Operadores cadastrados</h2>
          <p className="text-xs text-slate-500">Acompanhe o status de ativação dos acessos criados.</p>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">E-mail</th>
                <th className="py-3 px-4">Perfil</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {nonAdminUsers.length > 0 ? (
                nonAdminUsers.map((u) => {
                  const isActive = u.status === "Ativo" || Boolean(u.password);
                  return (
                    <tr key={u.email} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">{u.email}</td>
                      <td className="py-3 px-4 text-slate-600 font-medium">Operador</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Ativo</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>Aguardando criar senha</span>
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400 italic">
                    Nenhum operador cadastrado além do administrador.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
