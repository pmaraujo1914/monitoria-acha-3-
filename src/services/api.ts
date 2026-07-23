import { Occurrence, Pending, Ticket, UserAccount, SyncData } from "../types";

const LOCAL_STORAGE_KEY = "acha_app_data_v1";

const defaultData: SyncData = {
  occurrences: [
    {
      id: "ACHA-20260723-LIGIA-SAMPAIO",
      date: "2026-07-23",
      time: "09:30",
      sector: "Intermediação",
      responsible: "Lígia Sampaio",
      monitor: "Janine Sarquis",
      supervisor: "Mikaela",
      process: "PROC-2026-089",
      client: "Carlos Eduardo Silva",
      assetNumber: "005874",
      category: "Processo parado",
      impact: "Alto",
      description: "Aguardando certidão de ônus do 2º Cartório de Imóveis há mais de 5 dias.",
      cause: "Demora na emissão pelo cartório de registro.",
      observedImpact: "Risco de atrasar a assinatura do financiamento Caixa.",
      actionTaken: "Cobrança realizada por telefone ao despachante.",
      forwardingOwner: "Lígia Sampaio",
      status: "Em andamento",
      resolution: "",
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    },
    {
      id: "ACHA-20260722-CLEDSON-SANTOS",
      date: "2026-07-22",
      time: "14:15",
      sector: "Despesas",
      responsible: "Cledson Santos",
      monitor: "Deizilane Nunes",
      supervisor: "Lídia",
      process: "PROC-2026-042",
      client: "Mariana Costa",
      assetNumber: "003120",
      category: "Pendência documental",
      impact: "Baixo",
      description: "Comprovante de pagamento do ITBI não anexado à pasta digital.",
      cause: "Cliente enviou apenas a guia sem o comprovante bancário.",
      observedImpact: "Impossibilidade de solicitar minuta.",
      actionTaken: "Solicitado comprovante atualizado ao cliente via WhatsApp.",
      forwardingOwner: "Cledson Santos",
      status: "Resolvido",
      resolution: "Cliente enviou o comprovante e a taxa foi compensada com sucesso.",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      resolvedAt: new Date().toISOString(),
    }
  ],
  pendings: [
    {
      id: "p1",
      title: "Verificar minuta do cartório com a Lídia",
      text: "Conferir cláusula de alienação fiduciária no contrato do imóvel 005874.",
      priority: "Alta",
      createdAt: "23/07/2026",
      createdBy: "pedromceara@hotmail.com"
    }
  ],
  tickets: [
    {
      id: "CH-2026-0001",
      requester: "Lígia Sampaio",
      person: "Carlos Eduardo Silva",
      asset: "005874",
      stopped: "Aguardando aprovação de crédito na Caixa Econômica",
      description: "Solicitado apoio da supervisão para destravar com o gerente de conta.",
      status: "Em acompanhamento",
      createdAt: "23/07/2026"
    }
  ],
  users: [
    {
      email: "pedromceara@gmail.com",
      password: "Gl@diador45",
      status: "Ativo",
      isAdmin: true,
      createdAt: new Date().toISOString()
    },
    {
      email: "pedromceara@hotmail.com",
      password: "Gl@diador45",
      status: "Ativo",
      isAdmin: true,
      createdAt: new Date().toISOString()
    }
  ]
};

function getLocalStore(): SyncData {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  saveLocalStore(defaultData);
  return defaultData;
}

function saveLocalStore(data: SyncData) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export async function fetchSyncState(): Promise<SyncData> {
  try {
    const res = await fetch("/api/sync");
    if (!res.ok) throw new Error("API não disponível");
    const data = await res.json();
    saveLocalStore(data);
    return data;
  } catch {
    return getLocalStore();
  }
}

export async function loginUser(email: string, password?: string) {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) return await res.json();
  } catch {}

  // Fallback Local Storage
  const store = getLocalStore();
  const cleanEmail = email.toLowerCase().trim();
  let user = store.users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    const isAdminEmail = cleanEmail === "pedromceara@gmail.com" || cleanEmail === "pedromceara@hotmail.com";
    user = {
      email: cleanEmail,
      status: "Aguardando criar senha",
      isAdmin: isAdminEmail,
      createdAt: new Date().toISOString()
    };
    store.users.push(user);
    saveLocalStore(store);
  }

  if (user.status === "Aguardando criar senha" || !user.password) {
    return { success: false, requiresPasswordSetup: true, email: user.email };
  }

  if (user.password !== password) {
    return { success: false, message: "Senha incorreta." };
  }

  return { success: true, user: { email: user.email, isAdmin: user.isAdmin } };
}

export async function setupPassword(email: string, password: string) {
  try {
    const res = await fetch("/api/auth/setup-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) return await res.json();
  } catch {}

  const store = getLocalStore();
  const cleanEmail = email.toLowerCase().trim();
  const user = store.users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (!user) {
    return { success: false, message: "Usuário não encontrado." };
  }

  user.password = password;
  user.status = "Ativo";
  saveLocalStore(store);

  return { success: true, user: { email: user.email, isAdmin: user.isAdmin } };
}

export async function inviteUser(email: string) {
  try {
    const res = await fetch("/api/users/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) return await res.json();
  } catch {}

  const store = getLocalStore();
  const cleanEmail = email.toLowerCase().trim();
  const existing = store.users.find((u) => u.email.toLowerCase() === cleanEmail);

  if (existing) {
    return { success: false, message: "Este e-mail já possui acesso cadastrado." };
  }

  const newUser: UserAccount = {
    email: cleanEmail,
    status: "Aguardando criar senha",
    isAdmin: false,
    createdAt: new Date().toISOString(),
  };

  store.users.push(newUser);
  saveLocalStore(store);

  return { success: true, user: newUser };
}

export async function saveOccurrence(occurrence: Occurrence) {
  try {
    const res = await fetch("/api/occurrences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(occurrence),
    });
    if (res.ok) return await res.json();
  } catch {}

  const store = getLocalStore();
  const idx = store.occurrences.findIndex((o) => o.id === occurrence.id);
  if (idx >= 0) {
    store.occurrences[idx] = occurrence;
  } else {
    store.occurrences.unshift(occurrence);
  }
  saveLocalStore(store);
  return { success: true, occurrences: store.occurrences };
}

export async function deleteOccurrence(id: string) {
  try {
    const res = await fetch(`/api/occurrences/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) return await res.json();
  } catch {}

  const store = getLocalStore();
  store.occurrences = store.occurrences.filter((o) => o.id !== id);
  saveLocalStore(store);
  return { success: true, occurrences: store.occurrences };
}

export async function savePending(pending: Pending) {
  try {
    const res = await fetch("/api/pendings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pending),
    });
    if (res.ok) return await res.json();
  } catch {}

  const store = getLocalStore();
  const idx = store.pendings.findIndex((p) => p.id === pending.id);
  if (idx >= 0) {
    store.pendings[idx] = pending;
  } else {
    store.pendings.unshift(pending);
  }
  saveLocalStore(store);
  return { success: true, pendings: store.pendings };
}

export async function deletePending(id: string) {
  try {
    const res = await fetch(`/api/pendings/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (res.ok) return await res.json();
  } catch {}

  const store = getLocalStore();
  store.pendings = store.pendings.filter((p) => p.id !== id);
  saveLocalStore(store);
  return { success: true, pendings: store.pendings };
}

export async function saveTicket(ticket: Ticket) {
  try {
    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ticket),
    });
    if (res.ok) return await res.json();
  } catch {}

  const store = getLocalStore();
  const idx = store.tickets.findIndex((t) => t.id === ticket.id);
  if (idx >= 0) {
    store.tickets[idx] = ticket;
  } else {
    store.tickets.unshift(ticket);
  }
  saveLocalStore(store);
  return { success: true, tickets: store.tickets };
}

export function subscribeToRealtimeUpdates(onData: (data: SyncData) => void): () => void {
  try {
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

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  } catch {
    return () => {};
  }
}
