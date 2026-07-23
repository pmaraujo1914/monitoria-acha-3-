import React from "react";
import { 
  LayoutDashboard, 
  ListTodo, 
  AlertTriangle, 
  Headset, 
  UserPlus, 
  LogOut,
  Download
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
    <aside className="w-full md:w-64 bg-white border-r border-slate-200/80 flex flex-col h-auto md:h-screen sticky top-0 z-30 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-700 flex items-center justify-center text-white font-extrabold text-base shadow-sm shrink-0">
            ▲
          </div>
          <div>
            <span className="block font-black text-blue-800 text-base leading-tight">
              ACHA Imóveis
            </span>
            <span className="text-slate-400 text-xs font-medium block">
              CRM documental interno
            </span>
          </div>
        </div>
      </div>

      {/* User Info Section */}
      <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#0f49c6] text-white font-bold text-xs flex items-center justify-center shrink-0">
            {userInitials}
          </div>
          <div className="truncate">
            <span className="block text-xs font-bold text-slate-900 truncate">
              {currentUser?.email || "operador@achaimoveis.com.br"}
            </span>
          </div>
        </div>
        <button
          onClick={onLogout}
          title="Sair da conta"
          className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="p-3 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-[#0f49c6] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Download ZIP Button */}
      <div className="mt-auto p-3 border-t border-slate-200/80 hidden md:block">
        <a
          href="/api/download-zip"
          download="codigo_fonte_achaimoveis.zip"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Baixar Projeto (.ZIP)</span>
        </a>
      </div>
    </aside>
  );
};

