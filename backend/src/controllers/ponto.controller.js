const { PrismaClient } = require('@prisma/client');
const { startOfDay, endOfDay, startOfMonth, endOfMonth, differenceInMinutes } = require('date-fns');
const prisma = new PrismaClient();

function calcularHoras(ponto) {
  if (!ponto.entrada || !ponto.saida) return { horasTrabalhadas: 0, horasExtras: 0 };

  let minutos = differenceInMinutes(new Date(ponto.saida), new Date(ponto.entrada));

  // Desconta almoço
  if (ponto.saidaAlmoco && ponto.retornoAlmoco) {
    minutos -= differenceInMinutes(new Date(ponto.retornoAlmoco), new Date(ponto.saidaAlmoco));
  }

  const horasTrabalhadas = Math.max(0, minutos / 60);
  const horasExtras = Math.max(0, horasTrabalhadas - 8);

  return {
    horasTrabalhadas: parseFloat(horasTrabalhadas.toFixed(2)),
    horasExtras: parseFloat(horasExtras.toFixed(2)),
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
      const { horasTrabalhadas, horasExtras } = calcularHoras(pontoAtual);
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
    const dataObj = new Date(data);

    const pontoData = {
      funcionarioId,
      data: startOfDay(dataObj),
      observacao,
    };

    if (entrada) pontoData.entrada = new Date(entrada);
    if (saidaAlmoco) pontoData.saidaAlmoco = new Date(saidaAlmoco);
    if (retornoAlmoco) pontoData.retornoAlmoco = new Date(retornoAlmoco);
    if (saida) {
      pontoData.saida = new Date(saida);
      const { horasTrabalhadas, horasExtras } = calcularHoras(pontoData);
      pontoData.horasTrabalhadas = horasTrabalhadas;
      pontoData.horasExtras = horasExtras;
    }

    const ponto = await prisma.ponto.upsert({
      where: { funcionarioId_data: { funcionarioId, data: startOfDay(dataObj) } },
      update: pontoData,
      create: pontoData,
    });

    res.json(ponto);
  } catch {
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
      const { horasTrabalhadas, horasExtras } = calcularHoras(data);
      data.horasTrabalhadas = horasTrabalhadas;
      data.horasExtras = horasExtras;
    }

    const ponto = await prisma.ponto.update({ where: { id: req.params.id }, data });
    res.json(ponto);
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar ponto' });
  }
};
