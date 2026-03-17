-- Migration: adiciona campos de período de férias ao funcionário
ALTER TABLE funcionarios
  ADD COLUMN IF NOT EXISTS "inicioFerias" TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "fimFerias"    TIMESTAMP;
