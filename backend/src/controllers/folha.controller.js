const { PrismaClient } = require('@prisma/client');
const { startOfMonth, endOfMonth } = require('date-fns');
const prisma = new PrismaClient();

// Tabela INSS simplificada 2024
function calcularINSS(salarioBruto) {
  if (salarioBruto <= 1412.00) return salarioBruto * 0.075;
  if (salarioBruto <= 2666.68) return salarioBruto * 0.09;
  if (salarioBruto <= 4000.03) return salarioBruto * 0.12;
  if (salarioBruto <= 7786.02) return salarioBruto * 0.14;
  return 908.86; // teto INSS
}

exports.listar = async (req, res) => {
  try {
    const { mes, ano, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (mes) where.mes = parseInt(mes);
    if (ano) where.ano = parseInt(ano);

    const [folhas, total] = await Promise.all([
      prisma.folhaPagamento.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: [{ ano: 'desc' }, { mes: 'desc' }],
        include: { funcionario: { select: { nome: true, cargo: true, departamento: true } } },
      }),
      prisma.folhaPagamento.count({ where }),
    ]);

    res.json({ data: folhas, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch {
    res.status(500).json({ error: 'Erro ao listar folhas' });
  }
};

exports.buscarPorId = async (req, res) => {
  try {
    const folha = await prisma.folhaPagamento.findUnique({
      where: { id: req.params.id },
      include: { funcionario: true },
    });
    if (!folha) return res.status(404).json({ error: 'Folha não encontrada' });
    res.json(folha);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar folha' });
  }
};

exports.gerarFolha = async (req, res) => {
  try {
    const { mes, ano, funcionarioId } = req.body;
    const mesInt = parseInt(mes);
    const anoInt = parseInt(ano);
    const dataRef = new Date(anoInt, mesInt - 1, 1);

    const where = { status: 'ATIVO' };
    if (funcionarioId) where.id = funcionarioId;

    const funcionarios = await prisma.funcionario.findMany({ where });
    const folhasGeradas = [];

    for (const func of funcionarios) {
      // Busca pontos do mês
      const pontos = await prisma.ponto.findMany({
        where: {
          funcionarioId: func.id,
          data: { gte: startOfMonth(dataRef), lte: endOfMonth(dataRef) },
        },
      });

      // Busca faltas do mês
      const faltas = await prisma.falta.findMany({
        where: {
          funcionarioId: func.id,
          data: { gte: startOfMonth(dataRef), lte: endOfMonth(dataRef) },
          tipo: 'NAO_JUSTIFICADA',
        },
      });

      const totalHorasExtras = pontos.reduce((acc, p) => acc + parseFloat(p.horasExtras || 0), 0);
      const totalFaltas = faltas.length;

      const salarioBase = parseFloat(func.salarioBase);
      const valorHora = salarioBase / 220;

      // H.E. 50% = primeiras 2h extras por dia somadas; H.E. 100% = acima de 2h extras por dia
      let totalHE50 = 0, totalHE100 = 0;
      for (const p of pontos) {
        const extras = parseFloat(p.horasExtras || 0);
        totalHE50 += Math.min(extras, 2);
        totalHE100 += Math.max(0, extras - 2);
      }

      const horasExtras50 = totalHE50 * valorHora * 0.5;
      const horasExtras100 = totalHE100 * valorHora * 1.0;

      const descontoFaltas = totalFaltas * (salarioBase / 30);
      const valeTransporte = parseFloat(func.valeTransporte);
      const valeAlimentacao = parseFloat(func.valeAlimentacao);
      const bonus = parseFloat(func.bonus);

      const salarioBruto = salarioBase + horasExtras50 + horasExtras100 + bonus;
      const inss = calcularINSS(salarioBruto);
      const salarioLiquido = salarioBruto - inss - descontoFaltas + valeTransporte + valeAlimentacao;

      const folha = await prisma.folhaPagamento.upsert({
        where: { funcionarioId_mes_ano: { funcionarioId: func.id, mes: mesInt, ano: anoInt } },
        update: {
          salarioBase,
          horasExtras50,
          horasExtras100,
          descontoFaltas,
          valeTransporte,
          valeAlimentacao,
          bonus,
          inss,
          salarioLiquido,
          totalHorasExtras,
          totalFaltas,
          status: 'PROCESSADA',
        },
        create: {
          funcionarioId: func.id,
          mes: mesInt,
          ano: anoInt,
          salarioBase,
          horasExtras50,
          horasExtras100,
          descontoFaltas,
          valeTransporte,
          valeAlimentacao,
          bonus,
          inss,
          salarioLiquido,
          totalHorasExtras,
          totalFaltas,
          status: 'PROCESSADA',
        },
        include: { funcionario: { select: { nome: true, cargo: true } } },
      });

      folhasGeradas.push(folha);
    }

    res.json({ message: `${folhasGeradas.length} folhas geradas com sucesso`, folhas: folhasGeradas });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao gerar folha de pagamento' });
  }
};

exports.atualizarStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const folha = await prisma.folhaPagamento.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(folha);
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar status da folha' });
  }
};
