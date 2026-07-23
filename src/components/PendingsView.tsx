import React from "react";
import { Pending, Priority } from "../types";
import { Plus, CheckSquare, Trash2, ChevronRight } from "lucide-react";

interface PendingsViewProps {
  pendings: Pending[];
  onOpenNewModal: () => void;
  onOpenViewModal: (pending: Pending) => void;
  onDelete: (id: string) => void;
}

export const PendingsView: React.FC<PendingsViewProps> = ({
  pendings,
  onOpenNewModal,
  onOpenViewModal,
  onDelete,
}) => {
  const getPriorityBadge = (priority: Priority) => {
    const styles = {
      Baixa: "bg-emerald-100 text-emerald-800 border-emerald-200",
      Média: "bg-amber-100 text-amber-800 border-amber-200",
      Alta: "bg-rose-100 text-rose-800 border-rose-200",
    }[priority];

    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${styles}`}>
        {priority}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Organização operacional
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Pendências
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Crie lembretes de tarefas e defina a prioridade de acompanhamento para a equipe.
          </p>
        </div>
        <button
          onClick={onOpenNewModal}
          className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-blue-600/30 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Pendência</span>
        </button>
      </div>

      {/* Cards Grid */}
      {pendings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendings.map((item) => (
            <div
              key={item.id}
              onClick={() => onOpenViewModal(item)}
              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  {getPriorityBadge(item.priority)}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Deseja excluir esta pendência?")) onDelete(item.id);
                    }}
                    className="text-slate-300 hover:text-rose-600 p-1 rounded transition-colors"
                    title="Excluir pendência"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium line-clamp-3 mt-1.5 leading-relaxed">
                  {item.text}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                <span>Criada em {item.createdAt}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 space-y-3">
          <CheckSquare className="w-10 h-10 mx-auto text-slate-300" />
          <strong className="block text-slate-800 text-sm font-bold">
            Nenhuma pendência criada
          </strong>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Utilize o botão "Nova Pendência" acima para registrar um lembrete operacional.
          </p>
        </div>
      )}
    </div>
  );
};
