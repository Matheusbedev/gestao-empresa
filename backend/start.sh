#!/bin/sh
set -e

echo "Aguardando banco de dados..."
until npx prisma db push --accept-data-loss; do
  echo "Banco ainda não disponível, tentando novamente em 3s..."
  sleep 3
done

echo "Executando seed..."
node prisma/seed.js || echo "Seed já executado ou falhou (ignorando)"

echo "Iniciando servidor..."
exec node src/server.js
