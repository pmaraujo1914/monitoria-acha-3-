import React, { useState } from "react";
import { Occurrence } from "../types";
import { X, CheckCircle, Info } from "lucide-react";

interface ResolveModalProps {
  occurrence: Occurrence | null;
  onClose: () => void;
  onConfirm: (id: string, resolution: string) => void;
}

export const ResolveModal: React.FC<ResolveModalProps> = ({
  occurrence,
  onClose,
  onConfirm,
}) => {
  const [resolution, setResolution] = useState(occurrence?.resolution || "");

  if (!occurrence) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(occurrence.id, resolution.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Concluir Ocorrência
            </span>
            <h2 className="text-lg font-bold text-slate-900">Registrar Resolução</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <strong className="block text-xs font-bold text-slate-900">{occurrence.id}</strong>
              <span className="text-[11px] text-slate-500 font-medium">
                {occurrence.category} · Processo {occurrence.process}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Descrição da Resolução
            </label>
            <textarea
              required
              rows={4}
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Descreva detalhadamente como a situação foi resolvida e qual tratativa foi concluída..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            />
          </div>

          <p className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-blue-50 border border-blue-100 p-2.5 rounded-lg">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Ao concluir, a ocorrência será atualizada em tempo real para todos os usuários.</span>
          </p>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-sm shadow-emerald-600/30"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Concluir Ocorrência</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
