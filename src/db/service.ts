import { getDb } from './index.js';
import * as schema from './schema.js';
import { eq, sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

let tablesInitialized = false;

export async function ensureTablesExist() {
  if (tablesInitialized || !process.env.DATABASE_URL) return;
  try {
    console.log("[SUPABASE DB] Ensuring tables exist in Supabase PostgreSQL...");
    const db = getDb();
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        email TEXT PRIMARY KEY,
        password TEXT,
        status TEXT NOT NULL DEFAULT 'Aguardando criar senha',
        is_admin BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TEXT NOT NULL
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS occurrences (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        sector TEXT NOT NULL,
        responsible TEXT NOT NULL,
        monitor TEXT NOT NULL,
        supervisor TEXT NOT NULL,
        process TEXT NOT NULL,
        client TEXT NOT NULL,
        asset_number TEXT NOT NULL,
        category TEXT NOT NULL,
        impact TEXT NOT NULL,
        description TEXT NOT NULL,
        cause TEXT NOT NULL,
        observed_impact TEXT NOT NULL,
        action_taken TEXT NOT NULL,
        forwarding_owner TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Em andamento',
        resolution TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        resolved_at TEXT
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS pendings (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        text TEXT NOT NULL,
        priority TEXT NOT NULL,
        created_at TEXT NOT NULL,
        created_by TEXT
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS tickets (
        id TEXT PRIMARY KEY,
        requester TEXT NOT NULL,
        person TEXT NOT NULL,
        asset TEXT NOT NULL,
        stopped TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Aberto',
        created_at TEXT NOT NULL
      )
    `);
    tablesInitialized = true;
    console.log("[SUPABASE DB] Supabase tables verified/created successfully!");
  } catch (err) {
    console.error("[SUPABASE DB ERROR] Error creating tables automatically in Supabase:", err);
    throw err;
  }
}

const DATA_FILE = path.join(process.cwd(), "data-store.json");

export interface Occurrence {
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

export interface Pending {
  id: string;
  title: string;
  text: string;
  priority: "Baixa" | "Média" | "Alta";
  createdAt: string;
  createdBy?: string;
}

export interface Ticket {
  id: string;
  requester: string;
  person: string;
  asset: string;
  stopped: string;
  description: string;
  status: string;
  createdAt: string;
}

export interface UserAccount {
  email: string;
  password?: string;
  status: "Ativo" | "Aguardando criar senha";
  isAdmin: boolean;
  createdAt?: string;
}

export interface StoreData {
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

function loadFromFile(): StoreData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Error reading JSON data file:", err);
  }
  return defaultData;
}

function saveToFile(data: StoreData) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing JSON data file:", err);
  }
}

export async function fetchStoreData(): Promise<StoreData> {
  if (!process.env.DATABASE_URL) {
    return loadFromFile();
  }

  try {
    await ensureTablesExist();
    const db = getDb();

    // Check if users table is populated
    const dbUsers = await db.select().from(schema.users);
    if (dbUsers.length === 0) {
      // Seed initial data
      const initial = loadFromFile();
      for (const u of initial.users) {
        await db.insert(schema.users).values({
          email: u.email,
          password: u.password || null,
          status: u.status,
          isAdmin: u.isAdmin,
          createdAt: u.createdAt || new Date().toISOString(),
        }).onConflictDoNothing();
      }
      for (const o of initial.occurrences) {
        await db.insert(schema.occurrences).values({
          id: o.id,
          date: o.date,
          time: o.time,
          sector: o.sector,
          responsible: o.responsible,
          monitor: o.monitor,
          supervisor: o.supervisor,
          process: o.process,
          client: o.client,
          assetNumber: o.assetNumber,
          category: o.category,
          impact: o.impact,
          description: o.description,
          cause: o.cause,
          observedImpact: o.observedImpact,
          actionTaken: o.actionTaken,
          forwardingOwner: o.forwardingOwner,
          status: o.status,
          resolution: o.resolution || "",
          createdAt: o.createdAt,
          resolvedAt: o.resolvedAt || null,
        }).onConflictDoNothing();
      }
      for (const p of initial.pendings) {
        await db.insert(schema.pendings).values({
          id: p.id,
          title: p.title,
          text: p.text,
          priority: p.priority,
          createdAt: p.createdAt,
          createdBy: p.createdBy || null,
        }).onConflictDoNothing();
      }
      for (const t of initial.tickets) {
        await db.insert(schema.tickets).values({
          id: t.id,
          requester: t.requester,
          person: t.person,
          asset: t.asset,
          stopped: t.stopped,
          description: t.description,
          status: t.status,
          createdAt: t.createdAt,
        }).onConflictDoNothing();
      }
    }

    const [uList, oList, pList, tList] = await Promise.all([
      db.select().from(schema.users),
      db.select().from(schema.occurrences),
      db.select().from(schema.pendings),
      db.select().from(schema.tickets),
    ]);

    const users: UserAccount[] = uList.map(u => ({
      email: u.email,
      password: u.password || undefined,
      status: u.status as any,
      isAdmin: u.isAdmin,
      createdAt: u.createdAt,
    }));

    const occurrences: Occurrence[] = oList.map(o => ({
      id: o.id,
      date: o.date,
      time: o.time,
      sector: o.sector as any,
      responsible: o.responsible,
      monitor: o.monitor,
      supervisor: o.supervisor,
      process: o.process,
      client: o.client,
      assetNumber: o.assetNumber,
      category: o.category,
      impact: o.impact as any,
      description: o.description,
      cause: o.cause,
      observedImpact: o.observedImpact,
      actionTaken: o.actionTaken,
      forwardingOwner: o.forwardingOwner,
      status: o.status as any,
      resolution: o.resolution,
      createdAt: o.createdAt,
      resolvedAt: o.resolvedAt,
    }));

    const pendings: Pending[] = pList.map(p => ({
      id: p.id,
      title: p.title,
      text: p.text,
      priority: p.priority as any,
      createdAt: p.createdAt,
      createdBy: p.createdBy || undefined,
    }));

    const tickets: Ticket[] = tList.map(t => ({
      id: t.id,
      requester: t.requester,
      person: t.person,
      asset: t.asset,
      stopped: t.stopped,
      description: t.description,
      status: t.status,
      createdAt: t.createdAt,
    }));

    return { users, occurrences, pendings, tickets };
  } catch (err) {
    console.error("Cloud SQL fetch failed, falling back to local file:", err);
    return loadFromFile();
  }
}

export async function saveUserInDb(user: UserAccount): Promise<void> {
  if (!process.env.DATABASE_URL) {
    const fileData = loadFromFile();
    const idx = fileData.users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (idx !== -1) {
      fileData.users[idx] = { ...fileData.users[idx], ...user };
    } else {
      fileData.users.push(user);
    }
    saveToFile(fileData);
    return;
  }

  try {
    await ensureTablesExist();
    const db = getDb();
    const existing = await db.select().from(schema.users).where(eq(schema.users.email, user.email.toLowerCase()));
    if (existing.length > 0) {
      await db.update(schema.users).set({
        password: user.password || existing[0].password,
        status: user.status,
        isAdmin: user.isAdmin,
      }).where(eq(schema.users.email, user.email.toLowerCase()));
    } else {
      await db.insert(schema.users).values({
        email: user.email.toLowerCase(),
        password: user.password || null,
        status: user.status,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt || new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error("[SUPABASE DB ERROR] saveUser failed:", err);
    throw err;
  }
}

export async function saveOccurrenceInDb(o: Occurrence): Promise<void> {
  if (!process.env.DATABASE_URL) {
    const fileData = loadFromFile();
    const idx = fileData.occurrences.findIndex(x => x.id === o.id);
    if (idx !== -1) fileData.occurrences[idx] = o;
    else fileData.occurrences.unshift(o);
    saveToFile(fileData);
    return;
  }

  try {
    await ensureTablesExist();
    const db = getDb();
    console.log(`[SUPABASE DB] Saving occurrence ID: ${o.id} to PostgreSQL...`);
    
    const occurrenceValues = {
      id: o.id,
      date: o.date || new Date().toISOString().split('T')[0],
      time: o.time || '00:00',
      sector: o.sector || 'Intermediação',
      responsible: o.responsible || '',
      monitor: o.monitor || '',
      supervisor: o.supervisor || '',
      process: o.process || '',
      client: o.client || '',
      assetNumber: o.assetNumber || '',
      category: o.category || '',
      impact: o.impact || 'Médio',
      description: o.description || '',
      cause: o.cause || '',
      observedImpact: o.observedImpact || '',
      actionTaken: o.actionTaken || '',
      forwardingOwner: o.forwardingOwner || '',
      status: o.status || 'Em andamento',
      resolution: o.resolution || '',
      createdAt: o.createdAt || new Date().toISOString(),
      resolvedAt: o.resolvedAt || null,
    };

    const existing = await db.select().from(schema.occurrences).where(eq(schema.occurrences.id, o.id));
    if (existing.length > 0) {
      await db.update(schema.occurrences).set(occurrenceValues).where(eq(schema.occurrences.id, o.id));
      console.log(`[SUPABASE DB SUCCESS] Occurrence ${o.id} updated in PostgreSQL.`);
    } else {
      await db.insert(schema.occurrences).values(occurrenceValues);
      console.log(`[SUPABASE DB SUCCESS] Occurrence ${o.id} inserted into PostgreSQL.`);
    }
  } catch (err) {
    console.error(`[SUPABASE DB ERROR] saveOccurrence for ${o.id} failed:`, err);
    throw err;
  }
}

export async function deleteOccurrenceInDb(id: string): Promise<void> {
  if (!process.env.DATABASE_URL) {
    const fileData = loadFromFile();
    fileData.occurrences = fileData.occurrences.filter(x => x.id !== id);
    saveToFile(fileData);
    return;
  }

  try {
    await ensureTablesExist();
    const db = getDb();
    console.log(`[SUPABASE DB] Deleting occurrence ID: ${id}...`);
    await db.delete(schema.occurrences).where(eq(schema.occurrences.id, id));
    console.log(`[SUPABASE DB SUCCESS] Occurrence ${id} deleted.`);
  } catch (err) {
    console.error(`[SUPABASE DB ERROR] deleteOccurrence for ${id} failed:`, err);
    throw err;
  }
}

export async function savePendingInDb(p: Pending): Promise<void> {
  if (!process.env.DATABASE_URL) {
    const fileData = loadFromFile();
    const idx = fileData.pendings.findIndex(x => x.id === p.id);
    if (idx !== -1) fileData.pendings[idx] = p;
    else fileData.pendings.unshift(p);
    saveToFile(fileData);
    return;
  }

  try {
    await ensureTablesExist();
    const db = getDb();
    console.log(`[SUPABASE DB] Saving pending ID: ${p.id}...`);

    const pendingValues = {
      id: p.id,
      title: p.title || '',
      text: p.text || '',
      priority: p.priority || 'Média',
      createdAt: p.createdAt || new Date().toISOString(),
      createdBy: p.createdBy || null,
    };

    const existing = await db.select().from(schema.pendings).where(eq(schema.pendings.id, p.id));
    if (existing.length > 0) {
      await db.update(schema.pendings).set(pendingValues).where(eq(schema.pendings.id, p.id));
      console.log(`[SUPABASE DB SUCCESS] Pending ${p.id} updated.`);
    } else {
      await db.insert(schema.pendings).values(pendingValues);
      console.log(`[SUPABASE DB SUCCESS] Pending ${p.id} inserted.`);
    }
  } catch (err) {
    console.error(`[SUPABASE DB ERROR] savePending for ${p.id} failed:`, err);
    throw err;
  }
}

export async function deletePendingInDb(id: string): Promise<void> {
  if (!process.env.DATABASE_URL) {
    const fileData = loadFromFile();
    fileData.pendings = fileData.pendings.filter(x => x.id !== id);
    saveToFile(fileData);
    return;
  }

  try {
    await ensureTablesExist();
    const db = getDb();
    console.log(`[SUPABASE DB] Deleting pending ID: ${id}...`);
    await db.delete(schema.pendings).where(eq(schema.pendings.id, id));
    console.log(`[SUPABASE DB SUCCESS] Pending ${id} deleted.`);
  } catch (err) {
    console.error(`[SUPABASE DB ERROR] deletePending for ${id} failed:`, err);
    throw err;
  }
}

export async function saveTicketInDb(t: Ticket): Promise<void> {
  if (!process.env.DATABASE_URL) {
    const fileData = loadFromFile();
    fileData.tickets.unshift(t);
    saveToFile(fileData);
    return;
  }

  try {
    await ensureTablesExist();
    const db = getDb();
    console.log(`[SUPABASE DB] Saving ticket ID: ${t.id}...`);

    const ticketValues = {
      id: t.id,
      requester: t.requester || '',
      person: t.person || '',
      asset: t.asset || '',
      stopped: t.stopped || '',
      description: t.description || '',
      status: t.status || 'Aberto',
      createdAt: t.createdAt || new Date().toISOString(),
    };

    await db.insert(schema.tickets).values(ticketValues);
    console.log(`[SUPABASE DB SUCCESS] Ticket ${t.id} inserted.`);
  } catch (err) {
    console.error(`[SUPABASE DB ERROR] saveTicket for ${t.id} failed:`, err);
    throw err;
  }
}
