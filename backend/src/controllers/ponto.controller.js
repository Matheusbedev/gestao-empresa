const { PrismaClient } = require('@prisma/client');
const { startOfDay, endOfDay, startOfMonth, endOfMonth, differenceInMinutes, eachDayOfInterval, isWeekend, format } = require('date-fns');
const prisma = new PrismaClient();

// Feriados nacionais + estaduais/municipais de Cambé-PR 2026
const FERIADOS_2026 = new Set([
  '2026-01-01', // Confraternização Universal
  '2026-02-16', // Carnaval (segunda)
  '2026-02-17', // Carnaval (terça)
  '2026-02-18', // Quarta de Cinzas (meio dia)
  '2026-04-03', // Sexta-feira Santa
  '2026-04-05', // Páscoa
  '2026-04-21', // Tiradentes
  '2026-05-01', // Dia do Trabalho
  '2026-06-04', // Corpus Christi
  '2026-07-09', // Revolução Constitucionalista (SP/PR regional)
  '2026-09-07', // Independência do Brasil
  '2026-10-12', // Nossa Senhora Aparecida
  '2026-10-28', // Aniversário de Cambé-PR
  '2026-11-02', // Finados
  '2026-11-15', // Proclamação da República
  '2026-11-20', // Consciência Negra
  '2026-12-08', // Nossa Senhora da Conceição (Cambé)
  '2026-12-25', // Natal
]);

function isFeriado(dataStr) {
  return FERIADOS_2026.has(dataStr);
}

// Regra:
//  - Feriado: tudo que trabalhou = 100%
//  - Dia útil: extras = sempre 50% (sem limite de 2h para virar 100%)
function calcularHoras(ponto, cargaHoraria = 8, dataStr = null) {
  if (!ponto.entrada || !ponto.saida) return { horasTrabalhadas: 0, horasExtras: 0, horasExtras50: 0, horasExtras100: 0 };

  let minutos = differenceInMinutes(new Date(ponto.saida), new Date(ponto.entrada));
  if (ponto.saidaAlmoco && ponto.retornoAlmoco) {
    minutos -= differenceInMinutes(new Date(ponto.retornoAlmoco), new Date(ponto.saidaAlmoco));
  }

  const horasTrabalhadas = Math.max(0, minutos / 60);

  // Se for feriado: tudo é 100%
  if (dataStr && isFeriado(dataStr)) {
    return {
      horasTrabalhadas: parseFloat(horasTrabalhadas.toFixed(2)),
      horasExtras: parseFloat(horasTrabalhadas.toFixed(2)),
      horasExtras50: 0,
      horasExtras100: parseFloat(horasTrabalhadas.toFixed(2)),
    };
  }

  // Dia útil de semana: extras sempre 50% (sem escalonamento para 100%)
  const extras = Math.max(0, horasTrabalhadas - cargaHoraria);
  return {
    horasTrabalhadas: parseFloat(horasTrabalhadas.toFixed(2)),
    horasExtras: parseFloat(extras.toFixed(2)),
    horasExtras50: parseFloat(extras.toFixed(2)),
    horasExtras100: 0,
  };
}

exports.listar = async (req, res) => {
  try {
    const { page = 1, limit = 20, dataInicio, dataFim, funcionarioId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (funcionarioId) where.funcionarioId = funcionarioId;
    if (dataInicio || dataFim) {
      where.data = {};
      if (dataInicio) where.data.gte = new Date(dataInicio);
      if (dataFim) where.data.lte = new Date(dataFim);
    }

    const [pontos, total] = await Promise.all([
      prisma.ponto.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { data: 'desc' },
        include: { funcionario: { select: { nome: true, cargo: true } } },
      }),
      prisma.ponto.count({ where }),
    ]);

    res.json({ data: pontos, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch {
    res.status(500).json({ error: 'Erro ao listar pontos' });
  }
};

exports.hoje = async (req, res) => {
  try {
    const hoje = new Date();
    const pontos = await prisma.ponto.findMany({
      where: {
        data: { gte: startOfDay(hoje), lte: endOfDay(hoje) },
      },
      include: { funcionario: { select: { id: true, nome: true, cargo: true, foto: true } } },
    });
    res.json(pontos);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar pontos de hoje' });
  }
};

exports.porFuncionario = async (req, res) => {
  try {
    const { mes, ano } = req.query;
    const dataRef = new Date(parseInt(ano), parseInt(mes) - 1, 1);

    const pontos = await prisma.ponto.findMany({
      where: {
        funcionarioId: req.params.funcionarioId,
        data: { gte: startOfMonth(dataRef), lte: endOfMonth(dataRef) },
      },
      orderBy: { data: 'asc' },
    });
    res.json(pontos);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar pontos do funcionário' });
  }
};

exports.resumoMensal = async (req, res) => {
  try {
    const { mes, ano, cargaHoraria = 8 } = req.query;
    const carga = parseFloat(cargaHoraria);
    const dataRef = new Date(parseInt(ano), parseInt(mes) - 1, 1);
    const inicio = startOfMonth(dataRef);
    const fim = endOfMonth(dataRef);

    const funcionario = await prisma.funcionario.findUnique({
      where: { id: req.params.funcionarioId },
      select: { id: true, nome: true, cargo: true, salarioBase: true },
    });
    if (!funcionario) return res.status(404).json({ error: 'Funcionário não encontrado' });

    const pontos = await prisma.ponto.findMany({
      where: { funcionarioId: req.params.funcionarioId, data: { gte: inicio, lte: fim } },
      orderBy: { data: 'asc' },
    });

    const diasUteis = eachDayOfInterval({ start: inicio, end: fim }).filter(d => !isWeekend(d));
    const pontoMap = Object.fromEntries(pontos.map(p => [format(new Date(p.data), 'yyyy-MM-dd'), p]));

    let totalHoras = 0, totalExtras50 = 0, totalExtras100 = 0, totalExtras = 0;

    const dias = diasUteis.map(dia => {
      const key = format(dia, 'yyyy-MM-dd');
      const ponto = pontoMap[key] || null;
      const calc = ponto ? calcularHoras(ponto, carga, key) : { horasTrabalhadas: 0, horasExtras: 0, horasExtras50: 0, horasExtras100: 0 };
      totalHoras += calc.horasTrabalhadas;
      totalExtras += calc.horasExtras;
      totalExtras50 += calc.horasExtras50;
      totalExtras100 += calc.horasExtras100;
      return { data: key, diaSemana: format(dia, 'EEE'), ponto, ...calc };
    });

    res.json({
      funcionario,
      mes: parseInt(mes),
      ano: parseInt(ano),
      cargaHoraria: carga,
      dias,
      totais: {
        horasTrabalhadas: parseFloat(totalHoras.toFixed(2)),
        horasExtras: parseFloat(totalExtras.toFixed(2)),
        horasExtras50: parseFloat(totalExtras50.toFixed(2)),
        horasExtras100: parseFloat(totalExtras100.toFixed(2)),
        diasTrabalhados: dias.filter(d => d.ponto?.entrada).length,
        diasUteis: diasUteis.length,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao gerar resumo mensal' });
  }
};

exports.baterPonto = async (req, res) => {
  try {
    const { funcionarioId, tipo } = req.body; // tipo: entrada | saida_almoco | retorno_almoco | saida
    const agora = new Date();
    const hoje = startOfDay(agora);

    let ponto = await prisma.ponto.findUnique({
      where: { funcionarioId_data: { funcionarioId, data: hoje } },
    });

    const updateData = {};
    if (tipo === 'entrada') updateData.entrada = agora;
    else if (tipo === 'saida_almoco') updateData.saidaAlmoco = agora;
    else if (tipo === 'retorno_almoco') updateData.retornoAlmoco = agora;
    else if (tipo === 'saida') {
      updateData.saida = agora;
      const pontoAtual = { ...ponto, saida: agora };
      const dataStr = format(hoje, 'yyyy-MM-dd');
      const { horasTrabalhadas, horasExtras } = calcularHoras(pontoAtual, 8, dataStr);
      updateData.horasTrabalhadas = horasTrabalhadas;
      updateData.horasExtras = horasExtras;
    }
    if (ponto) {
      ponto = await prisma.ponto.update({ where: { id: ponto.id }, data: updateData });
    } else {
      ponto = await prisma.ponto.create({
        data: { funcionarioId, data: hoje, ...updateData },
      });
    }

    res.json(ponto);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao bater ponto' });
  }
};

exports.registroManual = async (req, res) => {
  try {
    const { funcionarioId, data, entrada, saidaAlmoco, retornoAlmoco, saida, observacao } = req.body;

    // Parsear data como local (evita problema de timezone UTC)
    const [anoD, mesD, diaD] = data.split('-').map(Number);
    const dataLocal = new Date(anoD, mesD - 1, diaD, 0, 0, 0);
    const dataStr = data; // já está no formato yyyy-MM-dd

    const pontoData: any = {
      funcionarioId,
      data: dataLocal,
      observacao: observacao || null,
    };

    if (entrada)       pontoData.entrada       = new Date(entrada);
    if (saidaAlmoco)   pontoData.saidaAlmoco   = new Date(saidaAlmoco);
    if (retornoAlmoco) pontoData.retornoAlmoco = new Date(retornoAlmoco);
    if (saida) {
      pontoData.saida = new Date(saida);
      const { horasTrabalhadas, horasExtras } = calcularHoras(pontoData, 8, dataStr);
      pontoData.horasTrabalhadas = horasTrabalhadas;
      pontoData.horasExtras = horasExtras;
    }

    const ponto = await prisma.ponto.upsert({
      where: { funcionarioId_data: { funcionarioId, data: dataLocal } },
      update: pontoData,
      create: pontoData,
    });

    res.json(ponto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar ponto manual' });
  }
};

exports.atualizar = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.entrada) data.entrada = new Date(data.entrada);
    if (data.saida) data.saida = new Date(data.saida);
    if (data.saidaAlmoco) data.saidaAlmoco = new Date(data.saidaAlmoco);
    if (data.retornoAlmoco) data.retornoAlmoco = new Date(data.retornoAlmoco);

    if (data.entrada && data.saida) {
      const pontoExistente = await prisma.ponto.findUnique({ where: { id: req.params.id } });
      const dataStr = pontoExistente ? format(new Date(pontoExistente.data), 'yyyy-MM-dd') : null;
      const { horasTrabalhadas, horasExtras } = calcularHoras(data, 8, dataStr);
      data.horasTrabalhadas = horasTrabalhadas;
      data.horasExtras = horasExtras;
    }

    const ponto = await prisma.ponto.update({ where: { id: req.params.id }, data });
    res.json(ponto);
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar ponto' });
  }
};
