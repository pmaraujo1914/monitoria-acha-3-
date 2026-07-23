import { pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  email: text('email').primaryKey(),
  password: text('password'),
  status: text('status').notNull().default('Aguardando criar senha'),
  isAdmin: boolean('is_admin').notNull().default(false),
  createdAt: text('created_at').notNull(),
});

export const occurrences = pgTable('occurrences', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  sector: text('sector').notNull(),
  responsible: text('responsible').notNull(),
  monitor: text('monitor').notNull(),
  supervisor: text('supervisor').notNull(),
  process: text('process').notNull(),
  client: text('client').notNull(),
  assetNumber: text('asset_number').notNull(),
  category: text('category').notNull(),
  impact: text('impact').notNull(),
  description: text('description').notNull(),
  cause: text('cause').notNull(),
  observedImpact: text('observed_impact').notNull(),
  actionTaken: text('action_taken').notNull(),
  forwardingOwner: text('forwarding_owner').notNull(),
  status: text('status').notNull().default('Em andamento'),
  resolution: text('resolution').notNull().default(''),
  createdAt: text('created_at').notNull(),
  resolvedAt: text('resolved_at'),
});

export const pendings = pgTable('pendings', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  text: text('text').notNull(),
  priority: text('priority').notNull(),
  createdAt: text('created_at').notNull(),
  createdBy: text('created_by'),
});

export const tickets = pgTable('tickets', {
  id: text('id').primaryKey(),
  requester: text('requester').notNull(),
  person: text('person').notNull(),
  asset: text('asset').notNull(),
  stopped: text('stopped').notNull(),
  description: text('description').notNull(),
  status: text('status').notNull().default('Aberto'),
  createdAt: text('created_at').notNull(),
});
