const DashboardService = require('../services/dashboard.service');
const { startOfDay, endOfDay } = require('date-fns');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.getDashboard = async (req, res) => {
  try {
    const hoje = new Date();
    const inicioHoje = startOfDay(hoje);
    const fimHoje = endOfDay(hoje);

    // Obter KPIs otimizados
    const kpis = await DashboardService.getKPIs();

    // Obter tendência de gastos (últimos 6 meses)
    const gastosPorMes = await DashboardService.getExpenseTrend(6);

    // Obter ranking de faltas
    const faltasPorFuncionario = await DashboardService.getAbsenceRanking(5);

    // Obter funcionários ausentes hoje
    const ausentes = await DashboardService.getAbsentEmployees();

    // Obter pontos de hoje (últimos 10)
    const pontosHoje = await prisma.ponto.findMany({
      where: {
        data: {
          gte: inicioHoje,
          lte: fimHoje,
        },
      },
      include: {
        funcionario: {
          select: { nome: true, foto: true },
        },
      },
      orderBy: { criadoEm: 'desc' },
      take: 10,
    });

    res.json({
      cards: {
        totalFuncionarios: kpis.totalFuncionarios,
        funcionariosAtivos: kpis.funcionariosAtivos,
        presentesHoje: kpis.presentesToday,
        ausentesHoje: ausentes.length,
        faltasHoje: kpis.faltasHoje,
        faltasMes: kpis.faltasMes,
        horasExtrasMes: kpis.horasExtrasMes,
        folhasProcessadas: kpis.folhasProcessadas,
        folhasNaoProcessadas: kpis.folhasNaoProcessadas,
      },
      gastosPorMes,
      faltasPorFuncionario,
      ausentes,
      pontosHoje,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Erro ao carregar dashboard' });
  }
};
