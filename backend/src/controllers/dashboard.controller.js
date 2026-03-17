const { PrismaClient } = require('@prisma/client');
const { startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths, format } = require('date-fns');
const prisma = new PrismaClient();

exports.getDashboard = async (req, res) => {
  try {
    const hoje = new Date();
    const inicioMes = startOfMonth(hoje);
    const fimMes = endOfMonth(hoje);

    const [
      totalFuncionarios,
      funcionariosAtivos,
      pontosHoje,
      faltasHoje,
      faltasMes,
      horasExtrasMes,
      folhaAtual,
    ] = await Promise.all([
      prisma.funcionario.count(),
      prisma.funcionario.count({ where: { status: 'ATIVO' } }),
      prisma.ponto.findMany({
        where: { data: { gte: startOfDay(hoje), lte: endOfDay(hoje) } },
        include: { funcionario: { select: { nome: true, foto: true } } },
      }),
      prisma.falta.count({
        where: { data: { gte: startOfDay(hoje), lte: endOfDay(hoje) } },
      }),
      prisma.falta.count({
        where: { data: { gte: inicioMes, lte: fimMes } },
      }),
      prisma.ponto.aggregate({
        where: { data: { gte: inicioMes, lte: fimMes } },
        _sum: { horasExtras: true },
      }),
      prisma.folhaPagamento.aggregate({
        where: { mes: hoje.getMonth() + 1, ano: hoje.getFullYear() },
        _sum: { salarioLiquido: true },
      }),
    ]);

    // Gastos por mês (últimos 6 meses)
    const gastosPorMes = [];
    for (let i = 5; i >= 0; i--) {
      const data = subMonths(hoje, i);
      const resultado = await prisma.folhaPagamento.aggregate({
        where: { mes: data.getMonth() + 1, ano: data.getFullYear() },
        _sum: { salarioLiquido: true },
      });
      gastosPorMes.push({
        mes: format(data, 'MMM/yy'),
        total: parseFloat(resultado._sum.salarioLiquido || 0),
      });
    }

    // Top faltas por funcionário no mês
    const faltasPorFuncionario = await prisma.falta.groupBy({
      by: ['funcionarioId'],
      where: { data: { gte: inicioMes, lte: fimMes } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    const faltasDetalhadas = await Promise.all(
      faltasPorFuncionario.map(async (f) => {
        const func = await prisma.funcionario.findUnique({
          where: { id: f.funcionarioId },
          select: { nome: true },
        });
        return { nome: func?.nome || 'N/A', faltas: f._count.id };
      })
    );

    // Funcionários ausentes hoje
    const funcionariosComPonto = pontosHoje.map(p => p.funcionarioId);
    const ausentes = await prisma.funcionario.findMany({
      where: {
        status: 'ATIVO',
        id: { notIn: funcionariosComPonto },
      },
      select: { id: true, nome: true, cargo: true, foto: true },
    });

    res.json({
      cards: {
        totalFuncionarios,
        funcionariosAtivos,
        presentesHoje: pontosHoje.length,
        ausentesHoje: ausentes.length,
        faltasHoje,
        faltasMes,
        horasExtrasMes: parseFloat(horasExtrasMes._sum.horasExtras || 0),
        custoFolha: parseFloat(folhaAtual._sum.salarioLiquido || 0),
      },
      gastosPorMes,
      faltasPorFuncionario: faltasDetalhadas,
      ausentes,
      pontosHoje: pontosHoje.slice(0, 10),
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao carregar dashboard' });
  }
};
