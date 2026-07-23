import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import {
  fetchStoreData,
  ensureTablesExist,
  saveUserInDb,
  saveOccurrenceInDb,
  deleteOccurrenceInDb,
  savePendingInDb,
  deletePendingInDb,
  saveTicketInDb,
  Occurrence,
  Pending,
  Ticket,
  UserAccount
} from "./src/db/service";

const app = express();
const PORT = 3000;

app.use(express.json());

// Endpoint to download source code zip
app.get("/api/download-zip", (req, res) => {
  const zipPath = path.join(process.cwd(), "codigo_fonte_projeto.zip");
  if (fs.existsSync(zipPath)) {
    res.download(zipPath, "codigo_fonte_achaimoveis.zip");
  } else {
    res.status(404).send("Arquivo zip não encontrado");
  }
});

// SSE clients for real-time streaming
const sseClients: express.Response[] = [];

async function broadcastUpdate(type: string, payload?: any) {
  const currentData = await fetchStoreData();
  const message = `data: ${JSON.stringify({ type, payload, data: currentData })}\n\n`;
  sseClients.forEach((client) => client.write(message));
}

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", hasDatabaseUrl: !!process.env.DATABASE_URL });
});

app.get("/api/init-db", async (_req, res) => {
  if (!process.env.DATABASE_URL) {
    return res.status(400).json({
      success: false,
      error: "DATABASE_URL não está configurada nas Variáveis de Ambiente da Vercel."
    });
  }
  try {
    console.log("[INIT-DB] Initializing database tables...");
    await ensureTablesExist();
    const data = await fetchStoreData();
    res.json({
      success: true,
      message: "Tabelas conectadas e verificadas no Supabase com sucesso!",
      hasDatabaseUrl: true,
      stats: {
        users: data.users.length,
        occurrences: data.occurrences.length,
        pendings: data.pendings.length,
        tickets: data.tickets.length
      }
    });
  } catch (err: any) {
    console.error("[INIT-DB ERROR] Failed to initialize database:", err);
    res.status(500).json({
      success: false,
      error: err.message || String(err),
      stack: err.stack
    });
  }
});

// SSE Endpoint for Live Updates across all users
app.get("/api/events", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  sseClients.push(res);

  const initialData = await fetchStoreData();
  // Send initial data snapshot
  res.write(`data: ${JSON.stringify({ type: "INIT", data: initialData })}\n\n`);

  req.on("close", () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// Get full sync state
app.get("/api/sync", async (_req, res) => {
  const data = await fetchStoreData();
  res.json(data);
});

// Authentication routes
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const normEmail = String(email || "").trim().toLowerCase();
  const db = await fetchStoreData();

  if (normEmail === "pedromceara@hotmail.com" && password === "Gl@diador45") {
    let admin = db.users.find(u => u.email.toLowerCase() === normEmail);
    if (!admin) {
      admin = { email: normEmail, password, status: "Ativo", isAdmin: true, createdAt: new Date().toISOString() };
      await saveUserInDb(admin);
    }
    return res.json({ success: true, user: { email: normEmail, isAdmin: true } });
  }

  let user = db.users.find(u => u.email.toLowerCase() === normEmail);
  if (!user) {
    const isAdminEmail = normEmail === "pedromceara@gmail.com" || normEmail === "pedromceara@hotmail.com";
    user = {
      email: normEmail,
      status: "Aguardando criar senha",
      isAdmin: isAdminEmail,
      createdAt: new Date().toISOString()
    };
    await saveUserInDb(user);
  }

  if (user.status === "Aguardando criar senha" || !user.password) {
    return res.json({ success: true, requiresPasswordSetup: true, email: user.email });
  }

  if (user.password !== password) {
    return res.status(401).json({ success: false, message: "Senha incorreta." });
  }

  return res.json({ success: true, user: { email: user.email, isAdmin: user.isAdmin } });
});

app.post("/api/auth/setup-password", async (req, res) => {
  const { email, password } = req.body;
  const normEmail = String(email || "").trim().toLowerCase();
  const db = await fetchStoreData();
  const user = db.users.find(u => u.email.toLowerCase() === normEmail);

  if (!user) {
    return res.status(404).json({ success: false, message: "Usuário não encontrado." });
  }

  const updatedUser: UserAccount = {
    ...user,
    password,
    status: "Ativo"
  };

  await saveUserInDb(updatedUser);
  const updatedDb = await fetchStoreData();
  broadcastUpdate("USERS_UPDATED", updatedDb.users);

  res.json({ success: true, user: { email: updatedUser.email, isAdmin: updatedUser.isAdmin } });
});

// User invites
app.post("/api/users/invite", async (req, res) => {
  const { email } = req.body;
  const normEmail = String(email || "").trim().toLowerCase();
  const db = await fetchStoreData();

  const existing = db.users.find(u => u.email.toLowerCase() === normEmail);
  if (existing) {
    return res.json({ success: true, user: existing });
  }

  const newUser: UserAccount = {
    email: normEmail,
    status: "Aguardando criar senha",
    isAdmin: false,
    createdAt: new Date().toISOString()
  };

  await saveUserInDb(newUser);
  const updatedDb = await fetchStoreData();
  broadcastUpdate("USERS_UPDATED", updatedDb.users);

  res.json({ success: true, user: newUser });
});

// Occurrences CRUD
app.post("/api/occurrences", async (req, res) => {
  try {
    const occurrence: Occurrence = req.body;
    console.log(`[API POST /api/occurrences] Saving occurrence ID: ${occurrence?.id}`);
    await saveOccurrenceInDb(occurrence);
    const updatedDb = await fetchStoreData();
    broadcastUpdate("OCCURRENCES_UPDATED", updatedDb.occurrences);
    res.json({ success: true, occurrence });
  } catch (err: any) {
    console.error("[API ERROR POST /api/occurrences]:", err);
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

app.delete("/api/occurrences/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[API DELETE /api/occurrences/${id}] Deleting occurrence`);
    await deleteOccurrenceInDb(id);
    const updatedDb = await fetchStoreData();
    broadcastUpdate("OCCURRENCES_UPDATED", updatedDb.occurrences);
    res.json({ success: true });
  } catch (err: any) {
    console.error(`[API ERROR DELETE /api/occurrences/${req.params.id}]:`, err);
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// Pendings CRUD
app.post("/api/pendings", async (req, res) => {
  try {
    const pending: Pending = req.body;
    console.log(`[API POST /api/pendings] Saving pending ID: ${pending?.id}`);
    await savePendingInDb(pending);
    const updatedDb = await fetchStoreData();
    broadcastUpdate("PENDINGS_UPDATED", updatedDb.pendings);
    res.json({ success: true, pending });
  } catch (err: any) {
    console.error("[API ERROR POST /api/pendings]:", err);
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

app.delete("/api/pendings/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[API DELETE /api/pendings/${id}] Deleting pending`);
    await deletePendingInDb(id);
    const updatedDb = await fetchStoreData();
    broadcastUpdate("PENDINGS_UPDATED", updatedDb.pendings);
    res.json({ success: true });
  } catch (err: any) {
    console.error(`[API ERROR DELETE /api/pendings/${req.params.id}]:`, err);
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

// Tickets CRUD
app.post("/api/tickets", async (req, res) => {
  try {
    const ticket: Ticket = req.body;
    console.log(`[API POST /api/tickets] Saving ticket ID: ${ticket?.id}`);
    await saveTicketInDb(ticket);
    const updatedDb = await fetchStoreData();
    broadcastUpdate("TICKETS_UPDATED", updatedDb.tickets);
    res.json({ success: true, ticket });
  } catch (err: any) {
    console.error("[API ERROR POST /api/tickets]:", err);
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
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

export default app;

if (process.env.VERCEL !== "1") {
  startServer();
}

