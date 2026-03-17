const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  const { email, senha } = req.body;
  try {
    const usuario = await prisma.usuario.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, role: usuario.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      token,
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role },
    });
  } catch {
    res.status(500).json({ error: 'Não foi possível realizar o login. Tente novamente.' });
  }
};

exports.me = async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: { id: true, nome: true, email: true, role: true },
    });
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(usuario);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar usuário.' });
  }
};

exports.listarUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: { id: true, nome: true, email: true, role: true, ativo: true, criadoEm: true },
      orderBy: { criadoEm: 'asc' },
    });
    res.json(usuarios);
  } catch {
    res.status(500).json({ error: 'Erro ao listar usuários.' });
  }
};

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  const { nome, email, senha, role } = req.body;
  try {
    const existe = await prisma.usuario.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existe) return res.status(400).json({ error: 'Este e-mail já está cadastrado no sistema.' });

    const senhaHash = await bcrypt.hash(senha, 12);
    const usuario = await prisma.usuario.create({
      data: { nome: nome.trim(), email: email.toLowerCase().trim(), senha: senhaHash, role: role || 'ADMIN' },
      select: { id: true, nome: true, email: true, role: true },
    });
    res.status(201).json(usuario);
  } catch {
    res.status(500).json({ error: 'Não foi possível criar o usuário. Tente novamente.' });
  }
};

exports.removerUsuario = async (req, res) => {
  const { id } = req.params;
  if (id === req.user.id) {
    return res.status(400).json({ error: 'Você não pode remover sua própria conta.' });
  }
  try {
    await prisma.usuario.update({ where: { id }, data: { ativo: false } });
    res.json({ message: 'Usuário desativado com sucesso.' });
  } catch {
    res.status(500).json({ error: 'Não foi possível remover o usuário.' });
  }
};

exports.atualizarUsuario = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  const { id } = req.params;
  const { nome, email, senha, role } = req.body;
  try {
    const data = {};
    if (nome) data.nome = nome.trim();
    if (email) data.email = email.toLowerCase().trim();
    if (role) data.role = role;
    if (senha) data.senha = await bcrypt.hash(senha, 12);

    const usuario = await prisma.usuario.update({
      where: { id },
      data,
      select: { id: true, nome: true, email: true, role: true },
    });
    res.json(usuario);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Este e-mail já está em uso.' });
    res.status(500).json({ error: 'Não foi possível atualizar o usuário.' });
  }
};
