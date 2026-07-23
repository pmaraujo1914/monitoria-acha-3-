import React from "react";
import { Pending } from "../types";
import { X, Trash2 } from "lucide-react";

interface PendingDetailModalProps {
  pending: Pending | null;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const PendingDetailModal: React.FC<PendingDetailModalProps> = ({
  pending,
  onClose,
  onDelete,
}) => {
  if (!pending) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
              Detalhes da pendência
            </span>
            <h2 className="text-base font-bold text-slate-900 truncate max-w-xs">{pending.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <span className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Prioridade</span>
            <span className="font-extrabold text-xs text-slate-800">{pending.priority}</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
            <span className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Descrição</span>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{pending.text}</p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Criada em</span>
            <span className="font-bold text-slate-800">{pending.createdAt}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm("Deseja excluir esta pendência?")) {
                onDelete(pending.id);
                onClose();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Excluir</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
