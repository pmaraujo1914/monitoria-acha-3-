import React, { useState, useEffect } from "react";
import { Occurrence, Sector, Category, Impact, OccurrenceStatus } from "../types";
import { CATEGORIES, OPERATORS_BY_SECTOR, SUPERVISORS_BY_SECTOR } from "../data/constants";
import { generateOccurrencePDF } from "../lib/pdf";
import { X, FileText, Save, Info } from "lucide-react";

interface OccurrenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (occurrence: Occurrence) => void;
  editingOccurrence?: Occurrence | null;
  currentUserEmail: string;
}

export const OccurrenceModal: React.FC<OccurrenceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingOccurrence,
  currentUserEmail,
}) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [sector, setSector] = useState<Sector | "">("Intermediação");
  const [responsible, setResponsible] = useState("");
  const [monitor, setMonitor] = useState("");
  const [supervisor, setSupervisor] = useState("");
  const [process, setProcess] = useState("");
  const [client, setClient] = useState("");
  const [assetNumber, setAssetNumber] = useState("");
  const [category, setCategory] = useState<Category | "">("Processo parado");
  const [impact, setImpact] = useState<Impact | "">("Médio");
  const [description, setDescription] = useState("");
  const [cause, setCause] = useState("");
  const [observedImpact, setObservedImpact] = useState("");
  const [actionTaken, setActionTaken] = useState("");
  const [forwardingOwner, setForwardingOwner] = useState("");
  const [status, setStatus] = useState<OccurrenceStatus>("Em andamento");
  const [resolution, setResolution] = useState("");

  const isPersonal = category === "Pessoal";

  useEffect(() => {
    if (editingOccurrence) {
      setDate(editingOccurrence.date);
      setTime(editingOccurrence.time);
      setSector(editingOccurrence.sector);
      setResponsible(editingOccurrence.responsible);
      setMonitor(editingOccurrence.monitor);
      setSupervisor(editingOccurrence.supervisor);
      setProcess(editingOccurrence.process);
      setClient(editingOccurrence.client);
      setAssetNumber(editingOccurrence.assetNumber);
      setCategory(editingOccurrence.category);
      setImpact(editingOccurrence.impact);
      setDescription(editingOccurrence.description);
      setCause(editingOccurrence.cause);
      setObservedImpact(editingOccurrence.observedImpact);
      setActionTaken(editingOccurrence.actionTaken);
      setForwardingOwner(editingOccurrence.forwardingOwner);
      setStatus(editingOccurrence.status);
      setResolution(editingOccurrence.resolution);
    } else {
      const now = new Date();
      const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);
      const localTime = now.toTimeString().slice(0, 5);

      setDate(localDate);
      setTime(localTime);
      setSector("Intermediação");
      setResponsible(currentUserEmail || "Monitor de Operações");
      setMonitor("");
      setSupervisor("");
      setProcess("");
      setClient("");
      setAssetNumber("");
      setCategory("Processo parado");
      setImpact("Médio");
      setDescription("");
      setCause("");
      setObservedImpact("");
      setActionTaken("");
      setForwardingOwner("");
      setStatus("Em andamento");
      setResolution("");
    }
  }, [editingOccurrence, isOpen, currentUserEmail]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dateKey = date.replace(/-/g, "");
    const operatorKey = (monitor || "OPERADOR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const generatedId = editingOccurrence?.id || `ACHA-${dateKey}-${operatorKey}`;

    const occurrenceData: Occurrence = {
      id: generatedId,
      date,
      time,
      sector: sector as Sector,
      responsible: responsible.trim(),
      monitor,
      supervisor,
      process: isPersonal ? "Não se aplica" : process.trim(),
      client: isPersonal ? "Não se aplica" : client.trim(),
      assetNumber: isPersonal ? "Não se aplica" : assetNumber.trim(),
      category: category as Category,
      impact: impact as Impact,
      description: description.trim(),
      cause: cause.trim(),
      observedImpact: observedImpact.trim(),
      actionTaken: actionTaken.trim(),
      forwardingOwner: forwardingOwner.trim(),
      status,
      resolution: status === "Resolvido" ? resolution.trim() : "",
      createdAt: editingOccurrence?.createdAt || new Date().toISOString(),
      resolvedAt:
        status === "Resolvido"
          ? editingOccurrence?.resolvedAt || new Date().toISOString()
          : null,
    };

    onSave(occurrenceData);
  };

  const availableOperators = sector ? OPERATORS_BY_SECTOR[sector] : [];
  const availableSupervisors = sector ? SUPERVISORS_BY_SECTOR[sector] : [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
              Registro operacional
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              {editingOccurrence ? `Editar Ocorrência ${editingOccurrence.id}` : "Nova Ocorrência"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form id="occurrence-form" onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Section 1: General Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider border-b border-slate-100 pb-1">
              Informações Gerais
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Data da identificação</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hora da identificação</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Setor</label>
                <select
                  required
                  value={sector}
                  onChange={(e) => {
                    const newSector = e.target.value as Sector;
                    setSector(newSector);
                    setMonitor("");
                    setSupervisor("");
                  }}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                >
                  <option value="">Selecione</option>
                  <option value="Intermediação">Intermediação</option>
                  <option value="Despesas">Despesas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Responsável (Quem abriu)</label>
                <input
                  type="text"
                  required
                  value={responsible}
                  onChange={(e) => setResponsible(e.target.value)}
                  placeholder="Seu nome ou cargo"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Envolvido (Operador)</label>
                <select
                  required
                  value={monitor}
                  onChange={(e) => setMonitor(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                >
                  <option value="">{sector ? "Selecione o operador" : "Selecione o setor primeiro"}</option>
                  {availableOperators.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Supervisor</label>
                <select
                  required
                  value={supervisor}
                  onChange={(e) => setSupervisor(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                >
                  <option value="">{sector ? "Selecione o supervisor" : "Selecione o setor primeiro"}</option>
                  {availableSupervisors.map((sup) => (
                    <option key={sup} value={sup}>
                      {sup}
                    </option>
                  ))}
                </select>
              </div>

              {!isPersonal && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Processo(s) envolvido(s)</label>
                    <input
                      type="text"
                      required
                      value={process}
                      onChange={(e) => setProcess(e.target.value)}
                      placeholder="Ex: PROC-2026-001"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Cliente</label>
                    <input
                      type="text"
                      required
                      value={client}
                      onChange={(e) => setClient(e.target.value)}
                      placeholder="Nome do cliente"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Número do bem</label>
                    <input
                      type="text"
                      value={assetNumber}
                      onChange={(e) => setAssetNumber(e.target.value)}
                      placeholder="Ex: 005874"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                    />
                  </div>
                </>
              )}
            </div>

            {isPersonal && (
              <p className="flex items-center gap-1.5 text-xs text-slate-600 bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Para motivo pessoal, processo, cliente e número do bem ficam como “Não se aplica”.</span>
              </p>
            )}
          </div>

          {/* Section 2: Classification */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider border-b border-slate-100 pb-1">
              Classificação
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Categoria</label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                >
                  <option value="">Selecione a categoria</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Impacto</label>
                <select
                  required
                  value={impact}
                  onChange={(e) => setImpact(e.target.value as Impact)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                >
                  <option value="">Selecione o nível de impacto</option>
                  <option value="Baixo">Baixo</option>
                  <option value="Médio">Médio</option>
                  <option value="Alto">Alto</option>
                  <option value="Crítico">Crítico</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider border-b border-slate-100 pb-1">
              Registro da Ocorrência
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Descrição objetiva da situação</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva de forma clara e objetiva a situação identificada..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Causa identificada</label>
                <textarea
                  rows={2}
                  value={cause}
                  onChange={(e) => setCause(e.target.value)}
                  placeholder="Informe a causa identificada, se houver..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Impacto observado ou potencial</label>
                <textarea
                  rows={2}
                  value={observedImpact}
                  onChange={(e) => setObservedImpact(e.target.value)}
                  placeholder="Descreva os riscos ou impactos gerados..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Resolution & Status */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-blue-700 uppercase tracking-wider border-b border-slate-100 pb-1">
              Tratativa
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ação tomada</label>
                <textarea
                  rows={2}
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  placeholder="Registre as ações já realizadas..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Responsável pelo encaminhamento</label>
                  <input
                    type="text"
                    value={forwardingOwner}
                    onChange={(e) => setForwardingOwner(e.target.value)}
                    placeholder="Nome do responsável"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    required
                    value={status}
                    onChange={(e) => setStatus(e.target.value as OccurrenceStatus)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  >
                    <option value="Em andamento">Em andamento</option>
                    <option value="Resolvido">Resolvido</option>
                    <option value="Escalado">Escalado</option>
                  </select>
                </div>
              </div>

              {status === "Resolvido" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Descrição da resolução</label>
                  <textarea
                    required
                    rows={3}
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="Descreva como a ocorrência foi resolvida..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2">
            {editingOccurrence && (
              <button
                type="button"
                onClick={() => generateOccurrencePDF(editingOccurrence)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                <span>Baixar PDF</span>
              </button>
            )}

            <button
              type="submit"
              form="occurrence-form"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-all shadow-sm shadow-blue-600/30"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Ocorrência</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
