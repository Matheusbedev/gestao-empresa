#!/usr/bin/env node
/**
 * Script de Manutenção — RH System
 * Uso:
 *   node scripts/manutencao.js remover-funcionario <id>
 *   node scripts/manutencao.js desmarcar-pago <folhaId>
 *   node scripts/manutencao.js listar-funcionarios
 *   node scripts/manutencao.js listar-folhas <mes> <ano>
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const [,, comando, arg1, arg2] = process.argv;

async function main() {
  switch (comando) {

    case 'remover-funcionario': {
      if (!arg1) { console.error('❌  Informe o ID do funcionário.'); process.exit(1); }
      const func = await prisma.funcionario.findUnique({ where: { id: arg1 } });
      if (!func) { console.error('❌  Funcionário não encontrado.'); process.exit(1); }
      await prisma.funcionario.delete({ where: { id: arg1 } });
      console.log(`✅  Funcionário "${func.nome}" removido permanentemente.`);
      break;
    }

    case 'desativar-funcionario': {
      if (!arg1) { console.error('❌  Informe o ID do funcionário.'); process.exit(1); }
      const func = await prisma.funcionario.update({
        where: { id: arg1 },
        data: { status: 'INATIVO' },
      });
      console.log(`✅  Funcionário "${func.nome}" desativado (status: INATIVO).`);
      break;
    }

    case 'desmarcar-pago': {
      if (!arg1) { console.error('❌  Informe o ID da folha.'); process.exit(1); }
      const folha = await prisma.folhaPagamento.update({
        where: { id: arg1 },
        data: { status: 'PROCESSADA' },
        include: { funcionario: { select: { nome: true } } },
      });
      console.log(`✅  Folha de "${folha.funcionario.nome}" (${folha.mes}/${folha.ano}) desmarcada — status: PROCESSADA.`);
      break;
    }

    case 'listar-funcionarios': {
      const lista = await prisma.funcionario.findMany({
        select: { id: true, nome: true, cargo: true, status: true },
        orderBy: { nome: 'asc' },
      });
      console.log('\n📋  Funcionários cadastrados:\n');
      lista.forEach(f => console.log(`  ${f.id}  |  ${f.nome.padEnd(30)}  |  ${f.cargo.padEnd(20)}  |  ${f.status}`));
      console.log(`\nTotal: ${lista.length}\n`);
      break;
    }

    case 'listar-folhas': {
      const mes = arg1 ? parseInt(arg1) : new Date().getMonth() + 1;
      const ano = arg2 ? parseInt(arg2) : new Date().getFullYear();
      const folhas = await prisma.folhaPagamento.findMany({
        where: { mes, ano },
        include: { funcionario: { select: { nome: true } } },
        orderBy: { funcionario: { nome: 'asc' } },
      });
      console.log(`\n💰  Folhas de ${mes}/${ano}:\n`);
      folhas.forEach(f => console.log(`  ${f.id}  |  ${f.funcionario.nome.padEnd(30)}  |  ${f.status}`));
      console.log(`\nTotal: ${folhas.length}\n`);
      break;
    }

    default:
      console.log(`
RH System — Script de Manutenção
─────────────────────────────────────────────────────────
Comandos disponíveis:

  listar-funcionarios
    Lista todos os funcionários com seus IDs.

  remover-funcionario <id>
    Remove permanentemente um funcionário do banco.

  desativar-funcionario <id>
    Marca o funcionário como INATIVO (mantém histórico).

  listar-folhas [mes] [ano]
    Lista folhas de pagamento do mês/ano informado.

  desmarcar-pago <folhaId>
    Reverte o status da folha de PAGA para PROCESSADA.

Exemplos:
  node scripts/manutencao.js listar-funcionarios
  node scripts/manutencao.js remover-funcionario abc123
  node scripts/manutencao.js listar-folhas 3 2026
  node scripts/manutencao.js desmarcar-pago xyz456
`);
  }
}

main()
  .catch(e => { console.error('❌  Erro:', e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
