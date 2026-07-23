import React, { useState } from "react";
import { loginUser, setupPassword } from "../services/api";
import { ShieldCheck, Lock, Mail, Key, ArrowRight, ArrowLeft } from "lucide-react";

interface AuthGateProps {
  onLoginSuccess: (user: { email: string; isAdmin: boolean }) => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<"login" | "setup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Setup view states
  const [setupEmail, setSetupEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setFeedback(null);

    try {
      const res = await loginUser(email.trim(), password.trim());
      if (res.requiresPasswordSetup) {
        setSetupEmail(res.email);
        setView("setup");
      } else if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setFeedback(res.message || "Erro na autenticação.");
      }
    } catch {
      setFeedback("Erro ao conectar ao servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setFeedback("As senhas não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      setFeedback("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const res = await setupPassword(setupEmail, newPassword);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setFeedback(res.message || "Erro ao configurar senha.");
      }
    } catch {
      setFeedback("Erro ao conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-900/40 via-slate-900/60 to-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-blue-700 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
            A
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-blue-700 leading-tight">
              Monitoramento Operacional
            </h1>
            <span className="text-xs font-semibold text-slate-500 block">
              ACHA Imóveis · Sistema Interno
            </span>
          </div>
        </div>

        {view === "login" ? (
          /* Login Form */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                Acesso ao sistema
              </span>
              <h2 className="text-xl font-bold text-slate-900">Entrar na Conta</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Informe seu e-mail corporativo e sua senha.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">E-mail</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome@achaimoveis.com.br"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Senha</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha de acesso"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {feedback && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
                {feedback}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-blue-600/30 disabled:opacity-50"
            >
              <span>{loading ? "Entrando..." : "Entrar no Sistema"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Password Setup Form */
          <form onSubmit={handleSetupSubmit} className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                Primeiro acesso
              </span>
              <h2 className="text-xl font-bold text-slate-900">Crie sua Senha</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Defina uma senha pessoal para <b>{setupEmail}</b>
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nova senha</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo de 6 caracteres"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Confirmar nova senha
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Digite a senha novamente"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {feedback && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
                {feedback}
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-blue-600/30 disabled:opacity-50"
              >
                <span>{loading ? "Salvando..." : "Salvar Senha e Entrar"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setView("login");
                  setFeedback(null);
                }}
                className="w-full inline-flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-800 font-bold text-xs py-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar ao login</span>
              </button>
            </div>
          </form>
        )}

        <div className="pt-2 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Rede operacional privada ACHA Imóveis</span>
          </p>
        </div>
      </div>
    </div>
  );
};
