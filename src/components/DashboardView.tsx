import React from "react";
import { Occurrence, Pending } from "../types";
import { FileText } from "lucide-react";

interface DashboardViewProps {
  occurrences: Occurrence[];
  pendings: Pending[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ occurrences, pendings }) => {
  // Compute top occurrence origins/categories
  const categoryCounts = occurrences.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const rankedCategories = Object.entries(categoryCounts)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 5);

  const totalOccurrences = occurrences.length;
  const criticalCount = occurrences.filter((o) => o.impact === "Crítico").length;
  const topCategoryName = rankedCategories[0] ? rankedCategories[0][0] : "Pendência documental";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0f49c6] block mb-1">
            VISÃO GERENCIAL
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Dashboard Operacional
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Resumo automático dos registros de ocorrências e lembretes operacionais.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-[#0f49c6] hover:bg-blue-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-sm shrink-0 self-start sm:self-auto"
        >
          <FileText className="w-4 h-4" />
          <span>Baixar Relatório</span>
        </button>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Occurrence Categories */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Principais origens de ocorrência
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Classificação mais recorrente nos registros realizados.
            </p>
          </div>

          <div className="space-y-2 mt-4">
            {rankedCategories.length > 0 ? (
              rankedCategories.map(([category, count]) => (
                <div
                  key={category}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 border border-slate-100"
                >
                  <span className="text-sm font-medium text-slate-700">{category}</span>
                  <span className="text-base font-bold text-[#0f49c6]">
                    {count}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
                <span className="text-sm font-medium text-slate-700">Pendência documental</span>
                <span className="text-base font-bold text-[#0f49c6]">0</span>
              </div>
            )}
          </div>
        </div>

        {/* Operational Executive Summary */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Relatório operacional
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Leitura rápida para acompanhamento da supervisão.
            </p>
          </div>

          <div className="space-y-2 mt-4">
            <strong className="block text-slate-900 text-lg font-bold">
              {totalOccurrences} ocorrência(s) registrada(s)
            </strong>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              A categoria mais recorrente é <b className="text-slate-700">{topCategoryName}</b>. Existem{" "}
              <b className="text-slate-700">{criticalCount}</b> ocorrência(s) crítica(s) que exigem atenção.
            </p>
          </div>
        </div>

        {/* Pending Tasks Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">Pendências a tratar</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Lembretes criados pela equipe operacional.
            </p>
          </div>

          <div className="mt-4">
            {pendings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pendings.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="text-xs font-bold text-slate-800">{item.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">{item.text}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-3 font-medium">
                      Criado em {item.createdAt}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-medium py-2">
                Nenhuma pendência aberta.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

