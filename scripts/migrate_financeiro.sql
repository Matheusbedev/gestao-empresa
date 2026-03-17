DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TipoConta') THEN
    CREATE TYPE "TipoConta" AS ENUM ('DESPESA', 'INVESTIMENTO', 'IMPOSTO');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'StatusConta') THEN
    CREATE TYPE "StatusConta" AS ENUM ('PENDENTE', 'PAGA', 'VENCIDA', 'CANCELADA');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS contas (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  vencimento DATE NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'Outros',
  tipo "TipoConta" NOT NULL DEFAULT 'DESPESA',
  status "StatusConta" NOT NULL DEFAULT 'PENDENTE',
  lembrete BOOLEAN NOT NULL DEFAULT false,
  "lembreteAntecedencia" INTEGER NOT NULL DEFAULT 3,
  observacao TEXT,
  "pagoEm" TIMESTAMP,
  "criadoEm" TIMESTAMP NOT NULL DEFAULT NOW(),
  "atualizadoEm" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS receitas (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data DATE NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'Outros',
  origem TEXT,
  observacao TEXT,
  "criadoEm" TIMESTAMP NOT NULL DEFAULT NOW(),
  "atualizadoEm" TIMESTAMP NOT NULL DEFAULT NOW()
);
