import React, { useState } from "react";
import { X, Headset } from "lucide-react";

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (person: string, asset: string, stopped: string, description: string) => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [person, setPerson] = useState("");
  const [asset, setAsset] = useState("");
  const [stopped, setStopped] = useState("");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!person.trim() || !asset.trim() || !stopped.trim()) return;
    onSave(person.trim(), asset.trim(), stopped.trim(), description.trim());
    setPerson("");
    setAsset("");
    setStopped("");
    setDescription("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
              Supervisão
            </span>
            <h2 className="text-lg font-bold text-slate-900">Abrir Chamado de Processo</h2>
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
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nome da pessoa / Cliente
            </label>
            <input
              type="text"
              required
              value={person}
              onChange={(e) => setPerson(e.target.value)}
              placeholder="Ex: Carlos Eduardo Silva"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Número do bem
            </label>
            <input
              type="text"
              required
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              placeholder="Ex: 005874"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Onde o processo está parado
            </label>
            <textarea
              required
              rows={3}
              value={stopped}
              onChange={(e) => setStopped(e.target.value)}
              placeholder="Ex: Aguardando assinatura no 2º Cartório / Análise de crédito na Caixa"
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Descrição para a supervisão (Opcional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contexto adicional e apoio necessário..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
            />
          </div>

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
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-all shadow-sm shadow-blue-600/30"
            >
              <Headset className="w-4 h-4" />
              <span>Abrir Chamado</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
