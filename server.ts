import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// File path for persistence
const DATA_FILE = path.join(process.cwd(), "data-store.json");

interface Occurrence {
  id: string;
  date: string;
  time: string;
  sector: "Intermediação" | "Despesas";
  responsible: string;
  monitor: string;
  supervisor: string;
  process: string;
  client: string;
  assetNumber: string;
  category: string;
  impact: "Baixo" | "Médio" | "Alto" | "Crítico";
  description: string;
  cause: string;
  observedImpact: string;
  actionTaken: string;
  forwardingOwner: string;
  status: "Em andamento" | "Resolvido" | "Escalado";
  resolution: string;
  createdAt: string;
  resolvedAt?: string | null;
}

interface Pending {
  id: string;
  title: string;
  text: string;
  priority: "Baixa" | "Média" | "Alta";
  createdAt: string;
  createdBy?: string;
}

interface Ticket {
  id: string;
  requester: string;
  person: string;
  asset: string;
  stopped: string;
  description: string;
  status: string;
  createdAt: string;
}

interface UserAccount {
  email: string;
  password?: string;
  status: "Ativo" | "Aguardando criar senha";
  isAdmin: boolean;
  createdAt?: string;
}

interface StoreData {
  occurrences: Occurrence[];
  pendings: Pending[];
  tickets: Ticket[];
  users: UserAccount[];
}

const defaultData: StoreData = {
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
    },
    {
      id: "p2",
      title: "Cobrar certidão negativa de débitos do condomínio",
      text: "Unidade 402 do Edifício Solar das Acácias.",
      priority: "Média",
      createdAt: "22/07/2026",
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
      email: "pedromceara@hotmail.com",
      password: "Gl@diador45",
      status: "Ativo",
      isAdmin: true,
      createdAt: new Date().toISOString()
    }
  ]
};

// Helper to load store
function loadStore(): StoreData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading data file:", err);
  }
  return defaultData;
}

// Helper to save store
function saveStore(data: StoreData) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing data file:", err);
  }
}

let db = loadStore();

// SSE clients for real-time streaming
const sseClients: express.Response[] = [];

function broadcastUpdate(type: string, payload?: any) {
  const message = `data: ${JSON.stringify({ type, payload, data: db })}\n\n`;
  sseClients.forEach((client) => client.write(message));
}

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// SSE Endpoint for Live Updates across all users
app.get("/api/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  sseClients.push(res);

  // Send initial data snapshot
  res.write(`data: ${JSON.stringify({ type: "INIT", data: db })}\n\n`);

  req.on("close", () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// Get full sync state
app.get("/api/sync", (_req, res) => {
  res.json(db);
});

// Authentication routes
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const normEmail = String(email || "").trim().toLowerCase();
  
  if (normEmail === "pedromceara@hotmail.com" && password === "Gl@diador45") {
    let admin = db.users.find(u => u.email.toLowerCase() === normEmail);
    if (!admin) {
      admin = { email: normEmail, password, status: "Ativo", isAdmin: true };
      db.users.push(admin);
      saveStore(db);
    }
    return res.json({ success: true, user: { email: normEmail, isAdmin: true } });
  }

  const user = db.users.find(u => u.email.toLowerCase() === normEmail);
  if (!user) {
    return res.status(404).json({ success: false, message: "Este e-mail não foi cadastrado pelo administrador." });
  }

  if (!user.password) {
    return res.json({ success: true, requiresPasswordSetup: true, email: user.email });
  }

  if (user.password !== password) {
    return res.status(401).json({ success: false, message: "Senha incorreta." });
  }

  return res.json({ success: true, user: { email: user.email, isAdmin: user.isAdmin } });
});

app.post("/api/auth/setup-password", (req, res) => {
  const { email, password } = req.body;
  const normEmail = String(email || "").trim().toLowerCase();
  const userIdx = db.users.findIndex(u => u.email.toLowerCase() === normEmail);

  if (userIdx === -1) {
    return res.status(404).json({ success: false, message: "Usuário não encontrado." });
  }

  db.users[userIdx].password = password;
  db.users[userIdx].status = "Ativo";
  saveStore(db);
  broadcastUpdate("USERS_UPDATED", db.users);

  res.json({ success: true, user: { email: db.users[userIdx].email, isAdmin: db.users[userIdx].isAdmin } });
});

// User invites
app.post("/api/users/invite", (req, res) => {
  const { email } = req.body;
  const normEmail = String(email || "").trim().toLowerCase();

  if (db.users.some(u => u.email.toLowerCase() === normEmail)) {
    return res.status(400).json({ success: false, message: "Este e-mail já possui acesso." });
  }

  const newUser: UserAccount = {
    email: normEmail,
    status: "Aguardando criar senha",
    isAdmin: false,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveStore(db);
  broadcastUpdate("USERS_UPDATED", db.users);

  res.json({ success: true, user: newUser });
});

// Occurrences CRUD
app.post("/api/occurrences", (req, res) => {
  const occurrence: Occurrence = req.body;
  const idx = db.occurrences.findIndex(o => o.id === occurrence.id);

  if (idx !== -1) {
    db.occurrences[idx] = { ...db.occurrences[idx], ...occurrence };
  } else {
    db.occurrences.unshift(occurrence);
  }

  saveStore(db);
  broadcastUpdate("OCCURRENCES_UPDATED", db.occurrences);
  res.json({ success: true, occurrence });
});

app.delete("/api/occurrences/:id", (req, res) => {
  const { id } = req.params;
  db.occurrences = db.occurrences.filter(o => o.id !== id);
  saveStore(db);
  broadcastUpdate("OCCURRENCES_UPDATED", db.occurrences);
  res.json({ success: true });
});

// Pendings CRUD
app.post("/api/pendings", (req, res) => {
  const pending: Pending = req.body;
  const idx = db.pendings.findIndex(p => p.id === pending.id);

  if (idx !== -1) {
    db.pendings[idx] = pending;
  } else {
    db.pendings.unshift(pending);
  }

  saveStore(db);
  broadcastUpdate("PENDINGS_UPDATED", db.pendings);
  res.json({ success: true, pending });
});

app.delete("/api/pendings/:id", (req, res) => {
  const { id } = req.params;
  db.pendings = db.pendings.filter(p => p.id !== id);
  saveStore(db);
  broadcastUpdate("PENDINGS_UPDATED", db.pendings);
  res.json({ success: true });
});

// Tickets CRUD
app.post("/api/tickets", (req, res) => {
  const ticket: Ticket = req.body;
  db.tickets.unshift(ticket);
  saveStore(db);
  broadcastUpdate("TICKETS_UPDATED", db.tickets);
  res.json({ success: true, ticket });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
