import React from "react";
import { 
  LayoutDashboard, 
  ListTodo, 
  AlertTriangle, 
  Headset, 
  UserPlus, 
  ShieldCheck, 
  LogOut, 
  Radio 
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: { email: string; isAdmin: boolean } | null;
  onLogout: () => void;
  isLiveConnected: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  isLiveConnected,
}) => {
  const userInitials = currentUser?.email
    ? currentUser.email.substring(0, 2).toUpperCase()
    : "MO";

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "pendencias", label: "Pendências", icon: ListTodo },
    { id: "ocorrencias", label: "Ocorrências", icon: AlertTriangle },
    { id: "chamados", label: "Chamados", icon: Headset },
  ];

  if (currentUser?.isAdmin) {
    navItems.push({ id: "acessos", label: "Criar acesso", icon: UserPlus });
  }

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col h-auto md:h-screen sticky top-0 z-30 shrink-0">
      {/* Brand Header */}
      <div className="p-4 md:p-5 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
            A
          </div>
          <div>
            <span className="block font-extrabold text-blue-700 text-base leading-tight">
              ACHA Imóveis
            </span>
            <small className="text-slate-500 text-xs font-medium">
              CRM documental interno
            </small>
          </div>
        </div>
      </div>

      {/* User Info Card */}
      <div className="p-3 mx-4 my-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
            {userInitials}
          </div>
          <div className="truncate">
            <strong className="block text-xs font-bold text-slate-800 truncate">
              {currentUser?.email || "Monitor de Operações"}
            </strong>
            <span className="text-[10px] text-slate-500 font-medium block">
              {currentUser?.isAdmin ? "Administrador" : "Operador"}
            </span>
          </div>
        </div>
        <button
          onClick={onLogout}
          title="Sair da conta"
          className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Live Sync Status */}
      <div className="px-4 mb-2 flex items-center gap-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50/80 border border-emerald-200 mx-4 py-1.5 px-2.5 rounded-lg">
        <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
        <span>{isLiveConnected ? "Sincronizado em tempo real" : "Reconectando..."}</span>
      </div>

      {/* Main Navigation */}
      <nav className="px-3 py-2 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-blue-700 text-white shadow-sm shadow-blue-600/30"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Note */}
      <div className="mt-auto p-4 hidden md:block">
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-xs flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
          <span className="leading-tight text-[11px] font-medium">
            Ambiente operante em rede <br />
            <strong>ACHA Imóveis Multi-usuário</strong>
          </span>
        </div>
      </div>
    </aside>
  );
};
