# Atualizacoes do Projeto

## 2026-03-17

### Frontend

- Migracao para Next.js 16.1.7.
- Ajuste de compatibilidade de imagens para `remotePatterns`.
- Substituicao de `middleware.ts` por `proxy.ts` (padrao Next 16).
- Refinamento visual global (`globals.css`) com tema profissional.
- Melhoria da tela de login:
  - validacao de sessao inicial;
  - tratamento mais claro de erros;
  - fluxo de submit mais robusto.
- Melhoria do dashboard:
  - estados de erro e vazio;
  - cards adicionais;
  - resiliencia para ausencia de dados em graficos.

### Backend

- Mantida compatibilidade funcional com testes passando.
- Ajuste em `src/app.js` para nao carregar Swagger no ambiente de teste, removendo warning deprecado em execucao de Jest.

### Seguranca e qualidade

- Frontend sem vulnerabilidades no `npm audit`.
- Backend sem vulnerabilidades no `npm audit`.
- Build de producao do frontend validado.
- Suite de testes do backend validada.

## Como visualizar rapidamente

- Status dos containers: `docker compose ps`
- Logs do frontend: `docker compose logs -f frontend`
- Logs do backend: `docker compose logs -f backend`
- API docs: http://localhost:3001/api-docs
- Frontend login: http://localhost:3000/login
