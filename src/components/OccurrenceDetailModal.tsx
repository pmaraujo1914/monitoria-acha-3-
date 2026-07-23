import React from "react";
import { Occurrence } from "../types";
import { generateOccurrencePDF } from "../lib/pdf";
import { X, FileText } from "lucide-react";

interface OccurrenceDetailModalProps {
  occurrence: Occurrence | null;
  onClose: () => void;
}

export const OccurrenceDetailModal: React.FC<OccurrenceDetailModalProps> = ({
  occurrence,
  onClose,
}) => {
  if (!occurrence) return null;

  const fields = [
    { label: "Identificação", value: occurrence.id },
    {
      label: "Data / Hora",
      value: `${new Date(occurrence.date + "T12:00").toLocaleDateString("pt-BR")} às ${occurrence.time}`,
    },
    { label: "Setor", value: occurrence.sector },
    { label: "Responsável", value: occurrence.responsible },
    { label: "Envolvido (Operador)", value: occurrence.monitor },
    { label: "Supervisor", value: occurrence.supervisor },
    { label: "Processo(s) Envolvido(s)", value: occurrence.process },
    { label: "Cliente", value: occurrence.client },
    { label: "Número do Bem", value: occurrence.assetNumber },
    { label: "Categoria", value: occurrence.category },
    { label: "Impacto", value: occurrence.impact },
    { label: "Status", value: occurrence.status },
    { label: "Descrição da Situação", value: occurrence.description, full: true },
    { label: "Causa Identificada", value: occurrence.cause, full: true },
    { label: "Impacto Observado", value: occurrence.observedImpact, full: true },
    { label: "Ação Tomada", value: occurrence.actionTaken, full: true },
    { label: "Encaminhamento", value: occurrence.forwardingOwner, full: true },
    { label: "Descrição da Resolução", value: occurrence.resolution, full: true },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
              Detalhes do registro
            </span>
            <h2 className="text-xl font-bold text-slate-900">{occurrence.id}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((f, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg bg-slate-50 border border-slate-100 ${
                  f.full ? "col-span-full" : ""
                }`}
              >
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  {f.label}
                </span>
                <p className="text-xs font-semibold text-slate-800 whitespace-pre-wrap">
                  {f.value || "Não informado"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => generateOccurrencePDF(occurrence)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-xl transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Baixar PDF</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
