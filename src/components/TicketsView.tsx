import React from "react";
import { Ticket } from "../types";
import { Plus, Headset } from "lucide-react";

interface TicketsViewProps {
  tickets: Ticket[];
  onOpenNewModal: () => void;
}

export const TicketsView: React.FC<TicketsViewProps> = ({ tickets, onOpenNewModal }) => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Acompanhamento da supervisão
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Chamados de Processo
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Abra um chamado para a supervisão acompanhar e destravar um processo retido.
          </p>
        </div>
        <button
          onClick={onOpenNewModal}
          className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-blue-600/30 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Abrir Chamado</span>
        </button>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Nº do Chamado</th>
                <th className="py-3 px-4">Solicitante</th>
                <th className="py-3 px-4">Pessoa / Cliente</th>
                <th className="py-3 px-4">Número do Bem</th>
                <th className="py-3 px-4">Onde está parado</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {tickets.length > 0 ? (
                tickets.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{item.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{item.requester}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{item.person}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{item.asset}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{item.stopped}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                        {item.status || "Aberto"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Headset className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <strong className="block text-slate-800 text-sm font-bold">
                      Nenhum chamado aberto
                    </strong>
                    <p className="text-xs text-slate-500 mt-1">
                      Abra um chamado para a supervisão intervir em processos parados.
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
