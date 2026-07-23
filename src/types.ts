export type Sector = 'Intermediação' | 'Despesas';

export type Category = 
  | 'Processo parado'
  | 'Risco de prazo'
  | 'Pendência documental'
  | 'Cartório'
  | 'Prefeitura'
  | 'Caixa'
  | 'Condomínio'
  | 'Cliente'
  | 'Erro Operacional'
  | 'Falha de Comunicação'
  | 'Melhoria Identificada'
  | 'Pessoal'
  | 'Outro';

export type Impact = 'Baixo' | 'Médio' | 'Alto' | 'Crítico';

export type OccurrenceStatus = 'Em andamento' | 'Resolvido' | 'Escalado';

export interface Occurrence {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  sector: Sector;
  responsible: string; // Who opened it
  monitor: string; // Envolvido
  supervisor: string; // Supervisor
  process: string;
  client: string;
  assetNumber: string;
  category: Category;
  impact: Impact;
  description: string;
  cause: string;
  observedImpact: string;
  actionTaken: string;
  forwardingOwner: string;
  status: OccurrenceStatus;
  resolution: string;
  createdAt: string;
  resolvedAt?: string | null;
}

export type Priority = 'Baixa' | 'Média' | 'Alta';

export interface Pending {
  id: string;
  title: string;
  text: string;
  priority: Priority;
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
  status: 'Aberto' | 'Em acompanhamento' | 'Concluído';
  createdAt: string;
}

export interface UserAccount {
  email: string;
  password?: string;
  status: 'Ativo' | 'Aguardando criar senha';
  isAdmin: boolean;
  createdAt?: string;
}

export interface SyncData {
  occurrences: Occurrence[];
  pendings: Pending[];
  tickets: Ticket[];
  users: UserAccount[];
}
