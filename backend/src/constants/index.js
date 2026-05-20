// Roles
const ROLES = {
  ADMIN: 'ADMIN',
  GESTOR: 'GESTOR',
};

// Status de Funcionário
const FUNCIONARIO_STATUS = {
  ATIVO: 'ATIVO',
  INATIVO: 'INATIVO',
  FERIAS: 'FERIAS',
  AFASTADO: 'AFASTADO',
};

// Tipos de Ponto
const PONTO_TIPO = {
  NORMAL: 'NORMAL',
  HOMEOFFICE: 'HOMEOFFICE',
  FERIADO: 'FERIADO',
};

// Tipos de Falta
const FALTA_TIPO = {
  JUSTIFICADA: 'JUSTIFICADA',
  NAO_JUSTIFICADA: 'NAO_JUSTIFICADA',
  ATESTADO: 'ATESTADO',
  FERIADO: 'FERIADO',
};

// Status de Folha
const FOLHA_STATUS = {
  PENDENTE: 'PENDENTE',
  PROCESSADA: 'PROCESSADA',
  PAGA: 'PAGA',
};

// Status de Conta
const CONTA_STATUS = {
  PENDENTE: 'PENDENTE',
  PAGA: 'PAGA',
  VENCIDA: 'VENCIDA',
  CANCELADA: 'CANCELADA',
};

// Tipos de Conta
const CONTA_TIPO = {
  DESPESA: 'DESPESA',
  INVESTIMENTO: 'INVESTIMENTO',
  IMPOSTO: 'IMPOSTO',
};

// Feriados Cambé-PR 2026
const FERIADOS_2026 = [
  new Date(2026, 0, 1),   // Ano Novo
  new Date(2026, 1, 13),  // Sexta-feira Santa
  new Date(2026, 3, 21),  // Tiradentes
  new Date(2026, 4, 1),   // Dia do Trabalho
  new Date(2026, 8, 7),   // Independência
  new Date(2026, 9, 12),  // Nossa Senhora Aparecida
  new Date(2026, 10, 2),  // Finados
  new Date(2026, 10, 20), // Consciência Negra
  new Date(2026, 11, 25), // Natal
];

// Configurações de Segurança
const SECURITY = {
  JWT_EXPIRY: '7d',
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_NUMBERS: true,
  PASSWORD_REQUIRE_SPECIAL: true,
  BCRYPT_ROUNDS: 12,
  RATE_LIMIT_LOGIN_WINDOW: 15 * 60 * 1000, // 15 minutos
  RATE_LIMIT_LOGIN_MAX: 10,
  RATE_LIMIT_GENERAL_WINDOW: 15 * 60 * 1000,
  RATE_LIMIT_GENERAL_MAX: 300,
};

// Configurações de Paginação
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

module.exports = {
  ROLES,
  FUNCIONARIO_STATUS,
  PONTO_TIPO,
  FALTA_TIPO,
  FOLHA_STATUS,
  CONTA_STATUS,
  CONTA_TIPO,
  FERIADOS_2026,
  SECURITY,
  PAGINATION,
};
