import React, { useState } from "react";
import { Occurrence, Category, Impact, OccurrenceStatus } from "../types";
import { CATEGORIES } from "../data/constants";
import { generateOccurrencePDF } from "../lib/pdf";
import { 
  Plus, 
  Search, 
  RotateCcw, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Clock, 
  FolderOpen 
} from "lucide-react";

interface OccurrencesViewProps {
  occurrences: Occurrence[];
  onOpenNewModal: () => void;
  onOpenEditModal: (id: string) => void;
  onOpenViewModal: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

export const OccurrencesView: React.FC<OccurrencesViewProps> = ({
  occurrences,
  onOpenNewModal,
  onOpenEditModal,
  onOpenViewModal,
  onToggleStatus,
  onDelete,
}) => {
  // Filter States
  const [filterClient, setFilterClient] = useState("");
  const [filterProcess, setFilterProcess] = useState("");
  const [filterOwner, setFilterOwner] = useState("");
  const [filterId, setFilterId] = useState("");
  const [filterAsset, setFilterAsset] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("");

  const clearFilters = () => {
    setFilterClient("");
    setFilterProcess("");
    setFilterOwner("");
    setFilterId("");
    setFilterAsset("");
    setFilterCategory("");
    setFilterStatus("");
    setFilterPeriod("");
  };

  const filtered = occurrences.filter((item) => {
    const matchClient = !filterClient || item.client.toLowerCase().includes(filterClient.toLowerCase());
    const matchProcess = !filterProcess || item.process.toLowerCase().includes(filterProcess.toLowerCase());
    const matchOwner = !filterOwner || item.responsible.toLowerCase().includes(filterOwner.toLowerCase());
    const matchId = !filterId || item.id.toLowerCase().includes(filterId.toLowerCase());
    const matchAsset = !filterAsset || item.assetNumber.toLowerCase().includes(filterAsset.toLowerCase());
    const matchCat = !filterCategory || item.category === filterCategory;
    const matchStat = !filterStatus || item.status === filterStatus;
    const matchPeriod = !filterPeriod || item.date === filterPeriod;

    return matchClient && matchProcess && matchOwner && matchId && matchAsset && matchCat && matchStat && matchPeriod;
  });

  const sortedOccurrences = [...filtered].sort((a, b) =>
    `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)
  );

  const openCount = occurrences.filter((o) => o.status === "Em andamento").length;
  const resolvedCount = occurrences.filter((o) => o.status === "Resolvido").length;
  const escalatedCount = occurrences.filter((o) => o.status === "Escalado").length;
  const criticalCount = occurrences.filter((o) => o.impact === "Crítico").length;

  const getImpactBadge = (impact: Impact) => {
    const styles = {
      Baixo: "bg-emerald-100 text-emerald-800 border-emerald-200",
      Médio: "bg-amber-100 text-amber-800 border-amber-200",
      Alto: "bg-orange-100 text-orange-800 border-orange-200",
      Crítico: "bg-rose-100 text-rose-800 border-rose-200",
    }[impact];
    return <span className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold border ${styles}`}>{impact}</span>;
  };

  const getStatusBadge = (status: OccurrenceStatus) => {
    const styles = {
      "Em andamento": "bg-blue-100 text-blue-800 border-blue-200",
      Resolvido: "bg-emerald-100 text-emerald-800 border-emerald-200",
      Escalado: "bg-purple-100 text-purple-800 border-purple-200",
    }[status];
    return <span className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold border ${styles}`}>{status}</span>;
  };

  const calculateDuration = (item: Occurrence) => {
    const start = new Date(item.createdAt || `${item.date}T${item.time || "00:00"}:00`);
    const end = item.status === "Resolvido" && item.resolvedAt ? new Date(item.resolvedAt) : new Date();
    const diffMs = Math.max(0, end.getTime() - start.getTime());
    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    return `${days}d ${hours}h`;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Monitoramento Operacional
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Registro de Ocorrências Operacionais
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Acompanhe, registre e trate situações identificadas nos processos em tempo real.
          </p>
        </div>
        <button
          onClick={onOpenNewModal}
          className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-blue-600/30 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Ocorrência</span>
        </button>
      </div>

      {/* Summary Stat Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Abertas</span>
            <strong className="text-xl font-black text-slate-900">{openCount}</strong>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Resolvidas</span>
            <strong className="text-xl font-black text-slate-900">{resolvedCount}</strong>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Escaladas</span>
            <strong className="text-xl font-black text-slate-900">{escalatedCount}</strong>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Críticas</span>
            <strong className="text-xl font-black text-slate-900">{criticalCount}</strong>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Filtrar ocorrências</h2>
            <p className="text-xs text-slate-500">Localize registros por cliente, processo, bem ou responsável.</p>
          </div>
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpar filtros</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Pesquisar cliente</label>
            <input
              type="text"
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
              placeholder="Nome do cliente"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Pesquisar processo</label>
            <input
              type="text"
              value={filterProcess}
              onChange={(e) => setFilterProcess(e.target.value)}
              placeholder="Número ou processo"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Responsável</label>
            <input
              type="text"
              value={filterOwner}
              onChange={(e) => setFilterOwner(e.target.value)}
              placeholder="Quem abriu"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">ID da Ocorrência</label>
            <input
              type="text"
              value={filterId}
              onChange={(e) => setFilterId(e.target.value)}
              placeholder="Ex: ACHA-2026..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Número do Bem</label>
            <input
              type="text"
              value={filterAsset}
              onChange={(e) => setFilterAsset(e.target.value)}
              placeholder="Ex: 005874"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Categoria</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            >
              <option value="">Todas as categorias</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            >
              <option value="">Todos os status</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Resolvido">Resolvido</option>
              <option value="Escalado">Escalado</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Período</label>
            <input
              type="date"
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Occurrences Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[980px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Data/Hora</th>
                <th className="py-3 px-4">Processo / Setor</th>
                <th className="py-3 px-4">Categoria</th>
                <th className="py-3 px-4">Impacto</th>
                <th className="py-3 px-4">Responsável / Operador</th>
                <th className="py-3 px-4">Tempo</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {sortedOccurrences.length > 0 ? (
                sortedOccurrences.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      <span className="bg-blue-50 px-2 py-1 rounded border border-blue-100 text-[11px]">
                        {item.id}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">
                      {new Date(item.date + "T12:00").toLocaleDateString("pt-BR")}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {item.time}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <strong className="block font-bold text-slate-900">{item.process}</strong>
                      <span className="text-[10px] font-semibold text-slate-500">{item.sector}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{item.category}</td>
                    <td className="py-3 px-4">{getImpactBadge(item.impact)}</td>
                    <td className="py-3 px-4">
                      <span className="block font-semibold text-slate-800">{item.responsible}</span>
                      <span className="text-[10px] text-slate-500">Envolvido: {item.monitor}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <strong className="block font-bold text-slate-800">
                        {calculateDuration(item)}
                      </strong>
                      <span className="text-[10px] text-slate-400">
                        {item.status === "Resolvido" ? "Concluído" : "Em aberto"}
                      </span>
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(item.status)}</td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => onToggleStatus(item.id)}
                          title={item.status === "Resolvido" ? "Reabrir Ocorrência" : "Concluir Ocorrência"}
                          className={`p-1.5 rounded-lg transition-colors ${
                            item.status === "Resolvido"
                              ? "text-blue-600 hover:bg-blue-50"
                              : "text-emerald-600 hover:bg-emerald-50"
                          }`}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => generateOccurrencePDF(item)}
                          title="Baixar Relatório PDF"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onOpenViewModal(item.id)}
                          title="Visualizar detalhes"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onOpenEditModal(item.id)}
                          title="Editar registro"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDelete(item.id)}
                          title="Excluir ocorrência"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <p className="text-sm font-semibold italic">
                      Nenhuma ocorrência encontrada para os filtros selecionados.
                    </p>
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
