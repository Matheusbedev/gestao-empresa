# RH System — Sistema de Gestão de Pessoas

Sistema web completo para gestão de funcionários, controle de ponto e folha de pagamento.

## Tecnologias

**Frontend:** Next.js 14, React, Tailwind CSS, Recharts, TypeScript  
**Backend:** Node.js, Express.js, Prisma ORM  
**Banco de dados:** PostgreSQL  
**Extras:** JWT, bcrypt, Docker, Swagger, PDFKit, ExcelJS

## Funcionalidades

- Dashboard com métricas e gráficos em tempo real
- CRUD completo de funcionários com busca e filtros
- Controle de ponto com botão "Bater Ponto" e registro manual
- Gestão de faltas (justificadas, não justificadas, atestado)
- Folha de pagamento automática com cálculo de INSS, horas extras e descontos
- Exportação em PDF e Excel
- Modo claro/escuro
- Interface responsiva (mobile e desktop)
- Autenticação JWT com proteção de rotas

## Instalação

### Pré-requisitos
- Node.js 20+
- Docker e Docker Compose (recomendado)
- PostgreSQL (se rodar sem Docker)

### Com Docker (recomendado)

```bash
docker-compose up -d
```

Acesse:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Swagger: http://localhost:3001/api-docs

### Sem Docker

**Backend:**
```bash
cd backend
npm install
# Configure o .env com sua DATABASE_URL
npx prisma migrate dev
npx prisma db seed
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Credenciais de Acesso

```
Email: admin@empresa.com
Senha: admin123
```

## Estrutura do Projeto

```
/backend
  /src
    /controllers   - Lógica de negócio
    /routes        - Rotas da API
    /middleware    - Auth JWT
    /utils         - Logger
    /tests         - Testes
  /prisma          - Schema e migrations
/frontend
  /src
    /app           - Páginas (Next.js App Router)
    /components    - Componentes reutilizáveis
    /contexts      - Context API (Auth)
    /lib           - Axios config
/docker-compose.yml
```

## API Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/auth/login | Login |
| GET | /api/funcionarios | Listar funcionários |
| POST | /api/funcionarios | Criar funcionário |
| GET | /api/pontos/hoje | Pontos do dia |
| POST | /api/pontos/bater | Bater ponto |
| GET | /api/faltas | Listar faltas |
| POST | /api/folhas/gerar | Gerar folha do mês |
| GET | /api/dashboard | Dados do dashboard |
| GET | /api/relatorios/folha/excel | Exportar Excel |

Documentação completa: http://localhost:3001/api-docs
