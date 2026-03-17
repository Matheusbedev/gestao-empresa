const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.listar = async (req, res) => {
  try {
    const { page = 1, limit = 10, busca, status, departamento } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (busca) {
      where.OR = [
        { nome: { contains: busca, mode: 'insensitive' } },
        { cpf: { contains: busca } },
        { cargo: { contains: busca, mode: 'insensitive' } },
      ];
    }
    if (status) where.status = status;
    if (departamento) where.departamento = { contains: departamento, mode: 'insensitive' };

    const [funcionarios, total] = await Promise.all([
      prisma.funcionario.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { nome: 'asc' },
      }),
      prisma.funcionario.count({ where }),
    ]);

    res.json({ data: funcionarios, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar funcionários' });
  }
};

exports.buscarPorId = async (req, res) => {
  try {
    const funcionario = await prisma.funcionario.findUnique({
      where: { id: req.params.id },
      include: {
        pontos: { orderBy: { data: 'desc' }, take: 30 },
        faltas: { orderBy: { data: 'desc' }, take: 10 },
        folhas: { orderBy: { ano: 'desc' }, take: 12 },
      },
    });
    if (!funcionario) return res.status(404).json({ error: 'Funcionário não encontrado' });
    res.json(funcionario);
  } catch {
    res.status(500).json({ error: 'Erro ao buscar funcionário' });
  }
};

exports.criar = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.foto = `/uploads/${req.file.filename}`;
    data.salarioBase = parseFloat(data.salarioBase);
    data.valeTransporte = parseFloat(data.valeTransporte || 0);
    data.valeAlimentacao = parseFloat(data.valeAlimentacao || 0);
    data.bonus = parseFloat(data.bonus || 0);
    data.dataAdmissao = new Date(data.dataAdmissao);

    const funcionario = await prisma.funcionario.create({ data });
    res.status(201).json(funcionario);
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'CPF ou e-mail já cadastrado no sistema.' });
    res.status(500).json({ error: 'Não foi possível cadastrar o funcionário. Tente novamente.' });
  }
};

exports.atualizar = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.foto = `/uploads/${req.file.filename}`;
    if (data.salarioBase) data.salarioBase = parseFloat(data.salarioBase);
    if (data.valeTransporte) data.valeTransporte = parseFloat(data.valeTransporte);
    if (data.valeAlimentacao) data.valeAlimentacao = parseFloat(data.valeAlimentacao);
    if (data.bonus) data.bonus = parseFloat(data.bonus);
    if (data.dataAdmissao) data.dataAdmissao = new Date(data.dataAdmissao);
    data.inicioFerias = data.inicioFerias ? new Date(data.inicioFerias) : null;
    data.fimFerias    = data.fimFerias    ? new Date(data.fimFerias)    : null;

    const funcionario = await prisma.funcionario.update({
      where: { id: req.params.id },
      data,
    });
    res.json(funcionario);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Funcionário não encontrado' });
    res.status(500).json({ error: 'Erro ao atualizar funcionário' });
  }
};

exports.deletar = async (req, res) => {
  try {
    await prisma.funcionario.update({
      where: { id: req.params.id },
      data: { status: 'INATIVO' },
    });
    res.json({ message: 'Funcionário desativado com sucesso' });
  } catch {
    res.status(500).json({ error: 'Erro ao deletar funcionário' });
  }
};

exports.reativar = async (req, res) => {
  try {
    await prisma.funcionario.update({
      where: { id: req.params.id },
      data: { status: 'ATIVO' },
    });
    res.json({ message: 'Funcionário reativado com sucesso' });
  } catch {
    res.status(500).json({ error: 'Erro ao reativar funcionário' });
  }
};

exports.excluirPermanente = async (req, res) => {
  try {
    const { id } = req.params;
    // Remove registros relacionados antes de excluir o funcionário
    await prisma.ponto.deleteMany({ where: { funcionarioId: id } });
    await prisma.falta.deleteMany({ where: { funcionarioId: id } });
    await prisma.folhaPagamento.deleteMany({ where: { funcionarioId: id } });
    await prisma.funcionario.delete({ where: { id } });
    res.json({ message: 'Funcionário excluído permanentemente' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir funcionário' });
  }
};

exports.uploadDocumentos = async (req, res) => {
  try {
    const funcionario = await prisma.funcionario.findUnique({ where: { id: req.params.id } });
    if (!funcionario) return res.status(404).json({ error: 'Funcionário não encontrado' });

    const novosDocumentos = req.files.map(f => `/uploads/${f.filename}`);
    const documentos = [...(funcionario.documentos || []), ...novosDocumentos];

    await prisma.funcionario.update({ where: { id: req.params.id }, data: { documentos } });
    res.json({ documentos });
  } catch {
    res.status(500).json({ error: 'Erro ao fazer upload de documentos' });
  }
};
