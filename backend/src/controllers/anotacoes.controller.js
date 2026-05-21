const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const AuditService = require('../services/audit.service');

const prisma = new PrismaClient();

// Listar anotações de um funcionário
exports.listarAnotacoes = async (req, res) => {
  try {
    const { funcionarioId } = req.params;
    const { tipo, prioridade, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = { funcionarioId };
    if (tipo) where.tipo = tipo;
    if (prioridade) where.prioridade = prioridade;

    const [anotacoes, total] = await Promise.all([
      prisma.anotacao.findMany({
        where,
        orderBy: { criadoEm: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.anotacao.count({ where }),
    ]);

    res.json({
      data: anotacoes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar anotações' });
  }
};

// Criar anotação
exports.criarAnotacao = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  try {
    const { funcionarioId, titulo, conteudo, tipo, prioridade } = req.body;

    const anotacao = await prisma.anotacao.create({
      data: {
        funcionarioId,
        titulo: titulo.trim(),
        conteudo: conteudo.trim(),
        tipo: tipo || 'GERAL',
        prioridade: prioridade || 'NORMAL',
        criadoPor: req.user.id,
      },
    });

    AuditService.logAction(req.user.id, 'CREATE_ANOTACAO', 'Anotacao', anotacao.id, { funcionarioId }, 'SUCCESS');

    res.status(201).json(anotacao);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar anotação' });
  }
};

// Atualizar anotação
exports.atualizarAnotacao = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, conteudo, tipo, prioridade } = req.body;

    const anotacao = await prisma.anotacao.update({
      where: { id },
      data: {
        ...(titulo && { titulo: titulo.trim() }),
        ...(conteudo && { conteudo: conteudo.trim() }),
        ...(tipo && { tipo }),
        ...(prioridade && { prioridade }),
      },
    });

    AuditService.logAction(req.user.id, 'UPDATE_ANOTACAO', 'Anotacao', id, {}, 'SUCCESS');

    res.json(anotacao);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar anotação' });
  }
};

// Deletar anotação
exports.deletarAnotacao = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.anotacao.delete({ where: { id } });

    AuditService.logAction(req.user.id, 'DELETE_ANOTACAO', 'Anotacao', id, {}, 'SUCCESS');

    res.json({ message: 'Anotação deletada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar anotação' });
  }
};
