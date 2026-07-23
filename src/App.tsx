import React, { useState, useEffect } from "react";
import { Occurrence, Pending, Ticket, UserAccount, Priority } from "./types";
import {
  fetchSyncState,
  subscribeToRealtimeUpdates,
  saveOccurrence,
  deleteOccurrence,
  savePending,
  deletePending,
  saveTicket,
  inviteUser,
} from "./services/api";

import { Sidebar } from "./components/Sidebar";
import { DashboardView } from "./components/DashboardView";
import { OccurrencesView } from "./components/OccurrencesView";
import { PendingsView } from "./components/PendingsView";
import { TicketsView } from "./components/TicketsView";
import { AccessView } from "./components/AccessView";
import { AuthGate } from "./components/AuthGate";

import { OccurrenceModal } from "./components/OccurrenceModal";
import { OccurrenceDetailModal } from "./components/OccurrenceDetailModal";
import { ResolveModal } from "./components/ResolveModal";
import { PendingModal } from "./components/PendingModal";
import { PendingDetailModal } from "./components/PendingDetailModal";
import { TicketModal } from "./components/TicketModal";

export default function App() {
  // Authentication & Session
  const [currentUser, setCurrentUser] = useState<{ email: string; isAdmin: boolean } | null>(() => {
    try {
      const saved = localStorage.getItem("acha-session");
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState("dashboard");

  // Shared Data State
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [pendings, setPendings] = useState<Pending[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);

  // Live SSE Connection Status
  const [isLiveConnected, setIsLiveConnected] = useState(true);

  // Toast Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Modals visibility
  const [isOccurrenceModalOpen, setIsOccurrenceModalOpen] = useState(false);
  const [editingOccurrence, setEditingOccurrence] = useState<Occurrence | null>(null);

  const [selectedOccurrenceDetail, setSelectedOccurrenceDetail] = useState<Occurrence | null>(null);
  const [selectedOccurrenceResolve, setSelectedOccurrenceResolve] = useState<Occurrence | null>(null);

  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const [selectedPendingDetail, setSelectedPendingDetail] = useState<Pending | null>(null);

  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Load initial data and subscribe to SSE live updates
  useEffect(() => {
    fetchSyncState()
      .then((data) => {
        setOccurrences(data.occurrences || []);
        setPendings(data.pendings || []);
        setTickets(data.tickets || []);
        setUsers(data.users || []);
      })
      .catch((err) => console.error("Erro ao sincronizar dados iniciais:", err));

    const unsubscribe = subscribeToRealtimeUpdates((data) => {
      setIsLiveConnected(true);
      if (data.occurrences) setOccurrences(data.occurrences);
      if (data.pendings) setPendings(data.pendings);
      if (data.tickets) setTickets(data.tickets);
      if (data.users) setUsers(data.users);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleLoginSuccess = (user: { email: string; isAdmin: boolean }) => {
    setCurrentUser(user);
    try {
      localStorage.setItem("acha-session", JSON.stringify(user));
    } catch {}
    showToast(`Bem-vindo, ${user.email}`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem("acha-session");
    } catch {}
  };

  // Occurrence Handlers
  const handleSaveOccurrence = async (occurrence: Occurrence) => {
    try {
      await saveOccurrence(occurrence);
      setIsOccurrenceModalOpen(false);
      setEditingOccurrence(null);
      showToast(editingOccurrence ? "Ocorrência atualizada com sucesso!" : "Nova ocorrência registrada!");
    } catch {
      showToast("Erro ao salvar ocorrência.");
    }
  };

  const handleDeleteOccurrence = async (id: string) => {
    if (!confirm("Deseja realmente excluir esta ocorrência?")) return;
    try {
      await deleteOccurrence(id);
      showToast("Ocorrência excluída com sucesso!");
    } catch {
      showToast("Erro ao excluir ocorrência.");
    }
  };

  const handleToggleOccurrenceStatus = (id: string) => {
    const item = occurrences.find((o) => o.id === id);
    if (!item) return;

    if (item.status === "Resolvido") {
      // Reopen
      const updated: Occurrence = {
        ...item,
        status: "Em andamento",
        resolvedAt: null,
      };
      saveOccurrence(updated);
      showToast("Ocorrência reaberta.");
    } else {
      // Open quick resolve modal
      setSelectedOccurrenceResolve(item);
    }
  };

  const handleConfirmResolve = async (id: string, resolution: string) => {
    const item = occurrences.find((o) => o.id === id);
    if (!item) return;

    const updated: Occurrence = {
      ...item,
      status: "Resolvido",
      resolution,
      resolvedAt: new Date().toISOString(),
    };

    try {
      await saveOccurrence(updated);
      setSelectedOccurrenceResolve(null);
      showToast("Ocorrência concluída com sucesso!");
    } catch {
      showToast("Erro ao concluir ocorrência.");
    }
  };

  // Pending Handlers
  const handleSavePending = async (title: string, text: string, priority: Priority) => {
    const newPending: Pending = {
      id: `p_${Date.now()}`,
      title,
      text,
      priority,
      createdAt: new Date().toLocaleDateString("pt-BR"),
      createdBy: currentUser?.email,
    };

    try {
      await savePending(newPending);
      setIsPendingModalOpen(false);
      showToast("Pendência criada com sucesso!");
    } catch {
      showToast("Erro ao salvar pendência.");
    }
  };

  const handleDeletePending = async (id: string) => {
    try {
      await deletePending(id);
      showToast("Pendência removida.");
    } catch {
      showToast("Erro ao remover pendência.");
    }
  };

  // Ticket Handlers
  const handleSaveTicket = async (
    person: string,
    asset: string,
    stopped: string,
    description: string
  ) => {
    const newTicket: Ticket = {
      id: `CH-${new Date().getFullYear()}-${String(tickets.length + 1).padStart(4, "0")}`,
      requester: currentUser?.email || "Operador",
      person,
      asset,
      stopped,
      description,
      status: "Aberto",
      createdAt: new Date().toLocaleDateString("pt-BR"),
    };

    try {
      await saveTicket(newTicket);
      setIsTicketModalOpen(false);
      showToast("Chamado aberto para a supervisão!");
    } catch {
      showToast("Erro ao abrir chamado.");
    }
  };

  if (!currentUser) {
    return <AuthGate onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        isLiveConnected={isLiveConnected}
      />

      {/* Main Screen Content */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {activeTab === "dashboard" && (
            <DashboardView occurrences={occurrences} pendings={pendings} />
          )}

          {activeTab === "ocorrencias" && (
            <OccurrencesView
              occurrences={occurrences}
              onOpenNewModal={() => {
                setEditingOccurrence(null);
                setIsOccurrenceModalOpen(true);
              }}
              onOpenEditModal={(id) => {
                const item = occurrences.find((o) => o.id === id);
                if (item) {
                  setEditingOccurrence(item);
                  setIsOccurrenceModalOpen(true);
                }
              }}
              onOpenViewModal={(id) => {
                const item = occurrences.find((o) => o.id === id);
                if (item) setSelectedOccurrenceDetail(item);
              }}
              onToggleStatus={handleToggleOccurrenceStatus}
              onDelete={handleDeleteOccurrence}
            />
          )}

          {activeTab === "pendencias" && (
            <PendingsView
              pendings={pendings}
              onOpenNewModal={() => setIsPendingModalOpen(true)}
              onOpenViewModal={(item) => setSelectedPendingDetail(item)}
              onDelete={handleDeletePending}
            />
          )}

          {activeTab === "chamados" && (
            <TicketsView
              tickets={tickets}
              onOpenNewModal={() => setIsTicketModalOpen(true)}
            />
          )}

          {activeTab === "acessos" && currentUser.isAdmin && (
            <AccessView users={users} onInviteUser={inviteUser} />
          )}
        </div>
      </main>

      {/* Interactive Modals */}
      <OccurrenceModal
        isOpen={isOccurrenceModalOpen}
        onClose={() => {
          setIsOccurrenceModalOpen(false);
          setEditingOccurrence(null);
        }}
        onSave={handleSaveOccurrence}
        editingOccurrence={editingOccurrence}
        currentUserEmail={currentUser.email}
      />

      <OccurrenceDetailModal
        occurrence={selectedOccurrenceDetail}
        onClose={() => setSelectedOccurrenceDetail(null)}
      />

      <ResolveModal
        occurrence={selectedOccurrenceResolve}
        onClose={() => setSelectedOccurrenceResolve(null)}
        onConfirm={handleConfirmResolve}
      />

      <PendingModal
        isOpen={isPendingModalOpen}
        onClose={() => setIsPendingModalOpen(false)}
        onSave={handleSavePending}
      />

      <PendingDetailModal
        pending={selectedPendingDetail}
        onClose={() => setSelectedPendingDetail(null)}
        onDelete={handleDeletePending}
      />

      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        onSave={handleSaveTicket}
      />

      {/* Live Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
