const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const AuditService = require('../services/audit.service');

const prisma = new PrismaClient();

// Listar descontos
exports.listarDescontos = async (req, res) => {
  try {
    const { funcionarioId, mes, ano, status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (funcionarioId) where.funcionarioId = funcionarioId;
    if (mes) where.mes = parseInt(mes);
    if (ano) where.ano = parseInt(ano);
    if (status) where.status = status;

    const [descontos, total] = await Promise.all([
      prisma.desconto.findMany({
        where,
        orderBy: { criadoEm: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.desconto.count({ where }),
    ]);

    res.json({
      data: descontos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar descontos' });
  }
};

// Criar desconto
exports.criarDesconto = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  try {
    const { funcionarioId, mes, ano, valor, motivo, observacao, tipo } = req.body;

    // Validar se já existe desconto com mesmo motivo no mesmo mês
    const existe = await prisma.desconto.findUnique({
      where: {
        funcionarioId_mes_ano_motivo: {
          funcionarioId,
          mes: parseInt(mes),
          ano: parseInt(ano),
          motivo,
        },
      },
    });

    if (existe) {
      return res.status(400).json({ error: 'Desconto com este motivo já existe para este período' });
    }

    const desconto = await prisma.desconto.create({
      data: {
        funcionarioId,
        mes: parseInt(mes),
        ano: parseInt(ano),
        valor: parseFloat(valor),
        motivo: motivo.trim(),
        observacao: observacao?.trim(),
        tipo: tipo || 'OUTRO',
        status: 'PENDENTE',
        criadoPor: req.user.id,
      },
    });

    AuditService.logAction(req.user.id, 'CREATE_DESCONTO', 'Desconto', desconto.id, { funcionarioId, mes, ano }, 'SUCCESS');

    res.status(201).json(desconto);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar desconto' });
  }
};

// Aprovar desconto
exports.aprovarDesconto = async (req, res) => {
  try {
    const { id } = req.params;

    const desconto = await prisma.desconto.update({
      where: { id },
      data: {
        status: 'APROVADO',
        aprovadoPor: req.user.id,
        aprovadoEm: new Date(),
      },
    });

    AuditService.logAction(req.user.id, 'APPROVE_DESCONTO', 'Desconto', id, {}, 'SUCCESS');

    res.json(desconto);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao aprovar desconto' });
  }
};

// Rejeitar desconto
exports.rejeitarDesconto = async (req, res) => {
  try {
    const { id } = req.params;

    const desconto = await prisma.desconto.update({
      where: { id },
      data: {
        status: 'REJEITADO',
        aprovadoPor: req.user.id,
        aprovadoEm: new Date(),
      },
    });

    AuditService.logAction(req.user.id, 'REJECT_DESCONTO', 'Desconto', id, {}, 'SUCCESS');

    res.json(desconto);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao rejeitar desconto' });
  }
};

// Atualizar desconto
exports.atualizarDesconto = async (req, res) => {
  try {
    const { id } = req.params;
    const { valor, motivo, observacao, tipo } = req.body;

    const desconto = await prisma.desconto.update({
      where: { id },
      data: {
        ...(valor && { valor: parseFloat(valor) }),
        ...(motivo && { motivo: motivo.trim() }),
        ...(observacao && { observacao: observacao.trim() }),
        ...(tipo && { tipo }),
      },
    });

    AuditService.logAction(req.user.id, 'UPDATE_DESCONTO', 'Desconto', id, {}, 'SUCCESS');

    res.json(desconto);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar desconto' });
  }
};

// Deletar desconto
exports.deletarDesconto = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.desconto.delete({ where: { id } });

    AuditService.logAction(req.user.id, 'DELETE_DESCONTO', 'Desconto', id, {}, 'SUCCESS');

    res.json({ message: 'Desconto deletado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar desconto' });
  }
};

// Obter descontos de um funcionário em um período
exports.getDescontosFuncionario = async (req, res) => {
  try {
    const { funcionarioId, mes, ano } = req.query;

    const descontos = await prisma.desconto.findMany({
      where: {
        funcionarioId,
        mes: parseInt(mes),
        ano: parseInt(ano),
      },
    });

    const totalDescontos = descontos.reduce((sum, d) => sum + parseFloat(d.valor), 0);

    res.json({
      descontos,
      total: totalDescontos,
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar descontos' });
  }
};
