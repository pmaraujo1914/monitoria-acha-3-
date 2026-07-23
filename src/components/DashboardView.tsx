import React from "react";
import { Occurrence, Pending } from "../types";
import { Printer, TrendingUp, AlertCircle, CheckCircle2, AlertOctagon } from "lucide-react";

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
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const totalOccurrences = occurrences.length;
  const criticalCount = occurrences.filter((o) => o.impact === "Crítico").length;
  const openCount = occurrences.filter((o) => o.status === "Em andamento").length;
  const resolvedCount = occurrences.filter((o) => o.status === "Resolvido").length;

  const topCategoryName = rankedCategories[0] ? rankedCategories[0][0] : "Nenhuma registrada";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Visão gerencial
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Dashboard Operacional
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Resumo automático dos registros de ocorrências, acompanhamento e lembretes operacionais.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-blue-600/30"
        >
          <Printer className="w-4 h-4" />
          <span>Baixar Relatório</span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-2xl font-black text-slate-900 leading-tight">
              {totalOccurrences}
            </span>
            <span className="text-xs text-slate-500 font-semibold">Total Ocorrências</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-lg shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-2xl font-black text-slate-900 leading-tight">
              {openCount}
            </span>
            <span className="text-xs text-slate-500 font-semibold">Em Andamento</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-2xl font-black text-slate-900 leading-tight">
              {resolvedCount}
            </span>
            <span className="text-xs text-slate-500 font-semibold">Resolvidas</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-lg shrink-0">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-2xl font-black text-slate-900 leading-tight">
              {criticalCount}
            </span>
            <span className="text-xs text-slate-500 font-semibold">Impacto Crítico</span>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Occurrence Categories */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h2 className="text-base font-bold text-slate-900">
              Principais origens de ocorrência
            </h2>
            <p className="text-xs text-slate-500">
              Classificação mais recorrente nos registros realizados.
            </p>
          </div>

          <div className="space-y-2.5">
            {rankedCategories.length > 0 ? (
              rankedCategories.map(([category, count]) => (
                <div
                  key={category}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <span className="text-xs font-bold text-slate-700">{category}</span>
                  <span className="text-sm font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                    {count}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic py-4 text-center">
                Ainda não há ocorrências registradas para analisar.
              </p>
            )}
          </div>
        </div>

        {/* Operational Executive Summary */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h2 className="text-base font-bold text-slate-900">
              Relatório operacional
            </h2>
            <p className="text-xs text-slate-500">
              Leitura rápida para acompanhamento da supervisão.
            </p>
          </div>

          <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-xl space-y-3">
            <strong className="block text-slate-900 text-sm font-bold">
              {totalOccurrences} ocorrência(s) registrada(s) no sistema
            </strong>
            <p className="text-xs text-slate-600 leading-relaxed">
              A categoria com maior incidência até o momento é{" "}
              <b className="text-blue-800">{topCategoryName}</b>. Atualmente existem{" "}
              <b className="text-amber-700">{openCount}</b> demanda(s) pendente(s) de resolução e{" "}
              <b className="text-rose-700">{criticalCount}</b> ocorrência(s) de impacto crítico exigindo tratativa prioritária.
            </p>
          </div>
        </div>

        {/* Pending Tasks Section */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Pendências a tratar</h2>
              <p className="text-xs text-slate-500">
                Lembretes criados pela equipe operacional para acompanhamento.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
              {pendings.length} pendências
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendings.length > 0 ? (
              pendings.slice(0, 6).map((item) => {
                const priorityStyles = {
                  Baixa: "bg-emerald-100 text-emerald-800 border-emerald-200",
                  Média: "bg-amber-100 text-amber-800 border-amber-200",
                  Alta: "bg-rose-100 text-rose-800 border-rose-200",
                }[item.priority] || "bg-slate-100 text-slate-800";

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col justify-between"
                  >
                    <div>
                      <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${priorityStyles} mb-2`}>
                        {item.priority}
                      </span>
                      <h3 className="text-xs font-bold text-slate-800 line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                        {item.text}
                      </p>
                    </div>
                    <small className="block text-[10px] text-slate-400 mt-2 font-medium">
                      Criado em {item.createdAt}
                    </small>
                  </div>
                );
              })
            ) : (
              <p className="col-span-full text-xs text-slate-500 italic py-6 text-center">
                Nenhuma pendência cadastrada no momento.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
