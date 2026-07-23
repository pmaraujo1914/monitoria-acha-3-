import { Occurrence, Pending, Ticket, UserAccount, SyncData } from "../types";

export async function fetchSyncState(): Promise<SyncData> {
  const res = await fetch("/api/sync");
  if (!res.ok) throw new Error("Falha ao carregar dados sincronizados");
  return res.json();
}

export async function loginUser(email: string, password?: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function setupPassword(email: string, password: string) {
  const res = await fetch("/api/auth/setup-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function inviteUser(email: string) {
  const res = await fetch("/api/users/invite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

export async function saveOccurrence(occurrence: Occurrence) {
  const res = await fetch("/api/occurrences", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(occurrence),
  });
  return res.json();
}

export async function deleteOccurrence(id: string) {
  const res = await fetch(`/api/occurrences/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  return res.json();
}

export async function savePending(pending: Pending) {
  const res = await fetch("/api/pendings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pending),
  });
  return res.json();
}

export async function deletePending(id: string) {
  const res = await fetch(`/api/pendings/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  return res.json();
}

export async function saveTicket(ticket: Ticket) {
  const res = await fetch("/api/tickets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ticket),
  });
  return res.json();
}

export function subscribeToRealtimeUpdates(onData: (data: SyncData) => void): () => void {
  const eventSource = new EventSource("/api/events");

  eventSource.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data);
      if (parsed.data) {
        onData(parsed.data);
      }
    } catch (err) {
      console.error("Erro ao processar atualização em tempo real:", err);
    }
  };

  eventSource.onerror = (err) => {
    console.warn("Conexão de tempo real reconectando...", err);
  };

  return () => {
    eventSource.close();
  };
}
