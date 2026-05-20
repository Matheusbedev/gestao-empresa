const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class DashboardService {
  static async getKPIs() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();

    // Usar Promise.all para paralelizar queries
    const [
      totalFuncionarios,
      funcionariosAtivos,
      presentesToday,
      faltasHoje,
      faltasMes,
      horasExtrasMes,
      folhasProcessadas,
      folhasNaoProcessadas,
    ] = await Promise.all([
      // Total de funcionários
      prisma.funcionario.count(),

      // Funcionários ativos
      prisma.funcionario.count({
        where: { status: 'ATIVO' },
      }),

      // Presentes hoje
      prisma.ponto.count({
        where: {
          data: {
            gte: new Date(hoje),
            lt: new Date(hoje.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Faltas hoje
      prisma.falta.count({
        where: {
          data: {
            gte: new Date(hoje),
            lt: new Date(hoje.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Faltas no mês
      prisma.falta.count({
        where: {
          data: {
            gte: new Date(anoAtual, mesAtual - 1, 1),
            lt: new Date(anoAtual, mesAtual, 1),
          },
        },
      }),

      // Horas extras no mês
      prisma.ponto.aggregate({
        _sum: { horasExtras: true },
        where: {
          data: {
            gte: new Date(anoAtual, mesAtual - 1, 1),
            lt: new Date(anoAtual, mesAtual, 1),
          },
        },
      }),

      // Folhas processadas
      prisma.folhaPagamento.count({
        where: {
          mes: mesAtual,
          ano: anoAtual,
          status: 'PROCESSADA',
        },
      }),

      // Folhas não processadas
      prisma.folhaPagamento.count({
        where: {
          mes: mesAtual,
          ano: anoAtual,
          status: 'PENDENTE',
        },
      }),
    ]);

    return {
      totalFuncionarios,
      funcionariosAtivos,
      presentesToday,
      faltasHoje,
      faltasMes,
      horasExtrasMes: horasExtrasMes._sum.horasExtras || 0,
      folhasProcessadas,
      folhasNaoProcessadas,
    };
  }

  static async getExpenseTrend(months = 6) {
    const hoje = new Date();
    const data = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const mes = date.getMonth() + 1;
      const ano = date.getFullYear();

      const [despesas, receitas] = await Promise.all([
        prisma.conta.aggregate({
          _sum: { valor: true },
          where: {
            vencimento: {
              gte: new Date(ano, mes - 1, 1),
              lt: new Date(ano, mes, 1),
            },
            status: 'PAGA',
          },
        }),
        prisma.receita.aggregate({
          _sum: { valor: true },
          where: {
            data: {
              gte: new Date(ano, mes - 1, 1),
              lt: new Date(ano, mes, 1),
            },
          },
        }),
      ]);

      data.push({
        mes: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        despesas: parseFloat(despesas._sum.valor || 0),
        receitas: parseFloat(receitas._sum.valor || 0),
      });
    }

    return data;
  }

  static async getAbsenceRanking(limit = 5) {
    const mesAtual = new Date().getMonth() + 1;
    const anoAtual = new Date().getFullYear();

    const ranking = await prisma.falta.groupBy({
      by: ['funcionarioId'],
      _count: true,
      where: {
        data: {
          gte: new Date(anoAtual, mesAtual - 1, 1),
          lt: new Date(anoAtual, mesAtual, 1),
        },
      },
      orderBy: {
        _count: 'desc',
      },
      take: limit,
    });

    // Buscar dados dos funcionários em uma única query
    const funcionarioIds = ranking.map(r => r.funcionarioId);
    const funcionarios = await prisma.funcionario.findMany({
      where: { id: { in: funcionarioIds } },
      select: { id: true, nome: true },
    });

    const funcionarioMap = new Map(funcionarios.map(f => [f.id, f.nome]));

    return ranking.map(r => ({
      funcionarioId: r.funcionarioId,
      nome: funcionarioMap.get(r.funcionarioId),
      faltas: r._count,
    }));
  }

  static async getAbsentEmployees() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const ausentes = await prisma.falta.findMany({
      where: {
        data: {
          gte: new Date(hoje),
          lt: new Date(hoje.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      include: {
        funcionario: {
          select: { id: true, nome: true, cargo: true },
        },
      },
    });

    return ausentes.map(a => ({
      funcionarioId: a.funcionario.id,
      nome: a.funcionario.nome,
      cargo: a.funcionario.cargo,
      tipo: a.tipo,
    }));
  }
}

module.exports = DashboardService;
