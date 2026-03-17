const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(v) || 0);

// ── CONTAS ────────────────────────────────────────────────────

exports.listarContas = async (req, res) => {
  try {
    const { status, tipo, mes, ano, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (status) where.status = status;
    if (tipo) where.tipo = tipo;
    if (mes && ano) {
      const inicio = new Date(parseInt(ano), parseInt(mes) - 1, 1);
      const fim = new Date(parseInt(ano), parseInt(mes), 0);
      where.vencimento = { gte: inicio, lte: fim };
    }
    const [contas, total] = await Promise.all([
      prisma.conta.findMany({ where, skip, take: parseInt(limit), orderBy: { vencimento: 'asc' } }),
      prisma.conta.count({ where }),
    ]);
    // Atualiza status VENCIDA automaticamente
    const hoje = new Date(); hoje.setHours(0,0,0,0);
    const atualizarVencidas = contas
      .filter(c => c.status === 'PENDENTE' && new Date(c.vencimento) < hoje)
      .map(c => prisma.conta.update({ where: { id: c.id }, data: { status: 'VENCIDA' } }));
    if (atualizarVencidas.length) await Promise.all(atualizarVencidas);

    res.json({ data: contas, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (e) { res.status(500).json({ error: 'Erro ao listar contas' }); }
};

exports.criarConta = async (req, res) => {
  try {
    const { descricao, valor, vencimento, categoria, tipo, lembrete, lembreteAntecedencia, observacao } = req.body;
    const conta = await prisma.conta.create({
      data: {
        descricao, valor: parseFloat(valor),
        vencimento: new Date(vencimento),
        categoria: categoria || 'Outros',
        tipo: tipo || 'DESPESA',
        lembrete: !!lembrete,
        lembreteAntecedencia: parseInt(lembreteAntecedencia) || 3,
        observacao,
      },
    });
    res.status(201).json(conta);
  } catch (e) { res.status(500).json({ error: 'Erro ao criar conta' }); }
};

exports.atualizarConta = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.valor) data.valor = parseFloat(data.valor);
    if (data.vencimento) data.vencimento = new Date(data.vencimento);
    if (data.lembreteAntecedencia) data.lembreteAntecedencia = parseInt(data.lembreteAntecedencia);
    const conta = await prisma.conta.update({ where: { id: req.params.id }, data });
    res.json(conta);
  } catch { res.status(500).json({ error: 'Erro ao atualizar conta' }); }
};

exports.marcarPaga = async (req, res) => {
  try {
    const conta = await prisma.conta.update({
      where: { id: req.params.id },
      data: { status: 'PAGA', pagoEm: new Date() },
    });
    res.json(conta);
  } catch { res.status(500).json({ error: 'Erro ao marcar como paga' }); }
};

exports.desmarcarPaga = async (req, res) => {
  try {
    const conta = await prisma.conta.update({
      where: { id: req.params.id },
      data: { status: 'PENDENTE', pagoEm: null },
    });
    res.json(conta);
  } catch { res.status(500).json({ error: 'Erro ao desmarcar pagamento' }); }
};

exports.deletarConta = async (req, res) => {
  try {
    await prisma.conta.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch { res.status(500).json({ error: 'Erro ao deletar conta' }); }
};

// ── RECEITAS ──────────────────────────────────────────────────

exports.listarReceitas = async (req, res) => {
  try {
    const { mes, ano, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (mes && ano) {
      const inicio = new Date(parseInt(ano), parseInt(mes) - 1, 1);
      const fim = new Date(parseInt(ano), parseInt(mes), 0);
      where.data = { gte: inicio, lte: fim };
    }
    const [receitas, total] = await Promise.all([
      prisma.receita.findMany({ where, skip, take: parseInt(limit), orderBy: { data: 'desc' } }),
      prisma.receita.count({ where }),
    ]);
    res.json({ data: receitas, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch { res.status(500).json({ error: 'Erro ao listar receitas' }); }
};

exports.criarReceita = async (req, res) => {
  try {
    const { descricao, valor, data, categoria, origem, observacao } = req.body;
    const receita = await prisma.receita.create({
      data: {
        descricao, valor: parseFloat(valor),
        data: new Date(data),
        categoria: categoria || 'Outros',
        origem, observacao,
      },
    });
    res.status(201).json(receita);
  } catch { res.status(500).json({ error: 'Erro ao criar receita' }); }
};

exports.atualizarReceita = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.valor) data.valor = parseFloat(data.valor);
    if (data.data) data.data = new Date(data.data);
    const receita = await prisma.receita.update({ where: { id: req.params.id }, data });
    res.json(receita);
  } catch { res.status(500).json({ error: 'Erro ao atualizar receita' }); }
};

exports.deletarReceita = async (req, res) => {
  try {
    await prisma.receita.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch { res.status(500).json({ error: 'Erro ao deletar receita' }); }
};

// ── RESUMO / DASHBOARD FINANCEIRO ────────────────────────────

exports.resumo = async (req, res) => {
  try {
    const { mes, ano } = req.query;
    const mesInt = parseInt(mes) || new Date().getMonth() + 1;
    const anoInt = parseInt(ano) || new Date().getFullYear();
    const inicio = new Date(anoInt, mesInt - 1, 1);
    const fim = new Date(anoInt, mesInt, 0);

    const [contas, receitas, contasVencendo] = await Promise.all([
      prisma.conta.findMany({ where: { vencimento: { gte: inicio, lte: fim } } }),
      prisma.receita.findMany({ where: { data: { gte: inicio, lte: fim } } }),
      prisma.conta.findMany({
        where: {
          status: 'PENDENTE',
          vencimento: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: { vencimento: 'asc' },
      }),
    ]);

    const totalDespesas = contas.filter(c => c.status !== 'CANCELADA').reduce((a, c) => a + parseFloat(c.valor), 0);
    const totalPago = contas.filter(c => c.status === 'PAGA').reduce((a, c) => a + parseFloat(c.valor), 0);
    const totalPendente = contas.filter(c => c.status === 'PENDENTE').reduce((a, c) => a + parseFloat(c.valor), 0);
    const totalVencido = contas.filter(c => c.status === 'VENCIDA').reduce((a, c) => a + parseFloat(c.valor), 0);
    const totalReceitas = receitas.reduce((a, r) => a + parseFloat(r.valor), 0);
    const saldo = totalReceitas - totalDespesas;

    res.json({
      totalDespesas, totalPago, totalPendente, totalVencido,
      totalReceitas, saldo,
      qtdContas: contas.length,
      qtdReceitas: receitas.length,
      contasVencendo,
    });
  } catch { res.status(500).json({ error: 'Erro ao gerar resumo financeiro' }); }
};
