RH System - Sistema de Gestão de Pessoas

Aplicacao completa para operacao de RH com frontend Next.js, backend Node/Express, PostgreSQL e documentacao de API via Swagger.

## Stack

- Frontend: Next.js 16, React, TypeScript, Tailwind
- Backend: Node.js, Express, Prisma, Jest
- Banco: PostgreSQL 15
- Orquestracao: Docker Compose

## Atualizacoes recentes

- Frontend migrado para Next 16.1.7.
- Fluxo de autenticacao reforcado (cookie + protecao de rotas).
- Dashboard e tela de login modernizados.
- Middleware do Next migrado para proxy (compatibilidade Next 16).
- Build frontend e testes backend validados apos ajustes.

Mais detalhes em `docs/ATUALIZACOES.md`.

## Rodando com Docker (recomendado)

No diretorio raiz do projeto:

```bash
docker compose up -d --build
```

Para acompanhar status:

```bash
docker compose ps
```

Para visualizar logs:

```bash
docker compose logs -f frontend
docker compose logs -f backend
docker compose logs -f postgres
```

Para parar:

```bash
docker compose down
```

## Endpoints

- Frontend: http://localhost:3000/login
- Backend healthcheck: http://localhost:3001/health
- Swagger API docs: http://localhost:3001/api-docs

## Credencial demo

- Email: admin@empresa.com
- Senha: admin123

## Desenvolvimento local (sem Docker)

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
npm install
npm run dev
```

## Testes e validacao

Backend:

```bash
cd backend
npm test
```

Frontend build:

```bash
cd frontend
npm run build
```


