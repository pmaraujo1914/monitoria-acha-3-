import { Category, Sector } from '../types';

export const CATEGORIES: Category[] = [
  'Processo parado',
  'Risco de prazo',
  'Pendência documental',
  'Cartório',
  'Prefeitura',
  'Caixa',
  'Condomínio',
  'Cliente',
  'Erro Operacional',
  'Falha de Comunicação',
  'Melhoria Identificada',
  'Pessoal',
  'Outro'
];

export const OPERATORS_BY_SECTOR: Record<Sector, string[]> = {
  'Intermediação': [
    'Lígia Sampaio',
    'Janine Sarquis',
    'Arielly Castro',
    'Paulo Sérgio',
    'Marcos Pimentel',
    'Lean Fernandes',
    'Wladson Souza',
    'Lorena Tomé',
    'Crislayne Vieira',
    'Paula Oliveira',
    'Carlos Kilmer',
    'Larissa da Frota',
    'Tahyane Santos',
    'Julianne Santos',
    'Ivina Chaves',
    'Elaine Franco',
    'Alexandra Freire',
    'Alberto Cedro',
    'Flávia Felix',
    'Pedro Matos'
  ],
  'Despesas': [
    'Cledson Santos',
    'Deizilane Nunes',
    'Clara Luiza',
    'Vitória Moreira',
    'Cristian Davi',
    'Ana Júlia',
    'Thiago Geraldo'
  ]
};

export const SUPERVISORS_BY_SECTOR: Record<Sector, string[]> = {
  'Intermediação': ['Mikaela', 'Hugo', 'Paula', 'Marcos'],
  'Despesas': ['Lídia']
};

export const ADMIN_USER = {
  email: 'pedromceara@hotmail.com',
  password: 'Gl@diador45',
  isAdmin: true
};
