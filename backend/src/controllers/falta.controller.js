const { PrismaClient } = require('@prisma/client');
const { startOfMonth, endOfMonth } = require('date-fns');
const prisma = new PrismaClient();

exports.listar = async (req, res) => {
  try {
    const { page = 1, limit = 20, mes, ano, tipo, funcionarioId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (funcionarioId) where.funcionarioId = funcionarioId;
    if (tipo) where.tipo = tipo;
    if (mes && ano) {
      const dataRef = new Date(parseInt(ano), parseInt(mes) - 1, 1);
      where.data = { gte: startOfMonth(dataRef), lte: endOfMonth(dataRef) };
    }

    const [faltas, total] = await Promise.all([
      prisma.falta.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { data: 'desc' },
        include: { funcionario: { select: { nome: true, cargo: true } } },
      }),
      prisma.falta.count({ where }),
    ]);

    res.json({ data: faltas, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch {
    res.status(500).json({ error: 'Erro ao listar faltas' });
  }
};

exports.porFuncionario = async (req, res) => {
  try {
    const { mes, ano } = req.query;
    const dataRef = new Date(parseInt(ano), parseInt(mes) - 1, 1);

    const faltas = await prisma.falta.findMany({
      where: {
        funcionarioId: req.params.funcionarioId,
        data: { gte: startOfMonth(dataRef), lte: endOfMonth(dataRef) },
      },
      orderBy: { data: 'asc' },
    });
    res.json(faltas);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar faltas' });
  }
};

exports.criar = async (req, res) => {
  try {
    const { funcionarioId, data, tipo, motivo } = req.body;
    const falta = await prisma.falta.create({
      data: { funcionarioId, data: new Date(data), tipo, motivo },
      include: { funcionario: { select: { nome: true } } },
    });
    res.status(201).json(falta);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Falta já registrada nesta data' });
    res.status(500).json({ error: 'Erro ao registrar falta' });
  }
};

exports.atualizar = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.data) data.data = new Date(data.data);
    const falta = await prisma.falta.update({ where: { id: req.params.id }, data });
    res.json(falta);
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar falta' });
  }
};

exports.deletar = async (req, res) => {
  try {
    await prisma.falta.delete({ where: { id: req.params.id } });
    res.json({ message: 'Falta removida com sucesso' });
  } catch {
    res.status(500).json({ error: 'Erro ao deletar falta' });
  }
};
