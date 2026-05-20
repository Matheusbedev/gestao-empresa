const { PrismaClient } = require('@prisma/client');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { Document, Packer, Paragraph, Table, TableCell, WidthType, BorderStyle } = require('docx');
const { format, startOfMonth, endOfMonth } = require('date-fns');

const prisma = new PrismaClient();

// Relatório de Ponto com Filtros Avançados
exports.getPontoAvancado = async (req, res) => {
  try {
    const { funcionarioId, dataInicio, dataFim, tipo, status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const where = {};
    if (funcionarioId) where.funcionarioId = funcionarioId;
    if (tipo) where.tipo = tipo;
    if (dataInicio || dataFim) {
      where.data = {};
      if (dataInicio) where.data.gte = new Date(dataInicio);
      if (dataFim) where.data.lte = new Date(dataFim);
    }

    const [pontos, total] = await Promise.all([
      prisma.ponto.findMany({
        where,
        include: { funcionario: { select: { nome: true, cargo: true } } },
        orderBy: { data: 'desc' },
        skip,
        take: limit,
      }),
      prisma.ponto.count({ where }),
    ]);

    res.json({
      data: pontos,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar relatório de ponto' });
  }
};

// Relatório de Faltas com Filtros
exports.getFaltasAvancado = async (req, res) => {
  try {
    const { funcionarioId, dataInicio, dataFim, tipo } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const where = {};
    if (funcionarioId) where.funcionarioId = funcionarioId;
    if (tipo) where.tipo = tipo;
    if (dataInicio || dataFim) {
      where.data = {};
      if (dataInicio) where.data.gte = new Date(dataInicio);
      if (dataFim) where.data.lte = new Date(dataFim);
    }

    const [faltas, total] = await Promise.all([
      prisma.falta.findMany({
        where,
        include: { funcionario: { select: { nome: true, cargo: true, departamento: true } } },
        orderBy: { data: 'desc' },
        skip,
        take: limit,
      }),
      prisma.falta.count({ where }),
    ]);

    res.json({
      data: faltas,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar relatório de faltas' });
  }
};

// Relatório de Folha com Filtros
exports.getFolhaAvancado = async (req, res) => {
  try {
    const { funcionarioId, mes, ano, status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const where = {};
    if (funcionarioId) where.funcionarioId = funcionarioId;
    if (mes) where.mes = parseInt(mes);
    if (ano) where.ano = parseInt(ano);
    if (status) where.status = status;

    const [folhas, total] = await Promise.all([
      prisma.folhaPagamento.findMany({
        where,
        include: { funcionario: { select: { nome: true, cargo: true, salarioBase: true } } },
        orderBy: { geradoEm: 'desc' },
        skip,
        take: limit,
      }),
      prisma.folhaPagamento.count({ where }),
    ]);

    res.json({
      data: folhas,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar relatório de folha' });
  }
};

// Relatório de Financeiro com Filtros
exports.getFinanceiroAvancado = async (req, res) => {
  try {
    const { tipo, status, dataInicio, dataFim, categoria } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (tipo === 'contas' || !tipo) {
      const where = {};
      if (status) where.status = status;
      if (categoria) where.categoria = categoria;
      if (dataInicio || dataFim) {
        where.vencimento = {};
        if (dataInicio) where.vencimento.gte = new Date(dataInicio);
        if (dataFim) where.vencimento.lte = new Date(dataFim);
      }

      const [contas, total] = await Promise.all([
        prisma.conta.findMany({
          where,
          orderBy: { vencimento: 'asc' },
          skip,
          take: limit,
        }),
        prisma.conta.count({ where }),
      ]);

      return res.json({
        tipo: 'contas',
        data: contas,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }

    if (tipo === 'receitas') {
      const where = {};
      if (categoria) where.categoria = categoria;
      if (dataInicio || dataFim) {
        where.data = {};
        if (dataInicio) where.data.gte = new Date(dataInicio);
        if (dataFim) where.data.lte = new Date(dataFim);
      }

      const [receitas, total] = await Promise.all([
        prisma.receita.findMany({
          where,
          orderBy: { data: 'desc' },
          skip,
          take: limit,
        }),
        prisma.receita.count({ where }),
      ]);

      return res.json({
        tipo: 'receitas',
        data: receitas,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar relatório financeiro' });
  }
};

// Gerar PDF de Relatório Customizado
exports.gerarRelatorioPDF = async (req, res) => {
  try {
    const { tipo, dataInicio, dataFim, funcionarioId } = req.query;

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="relatorio-${tipo}-${Date.now()}.pdf"`);

    doc.pipe(res);

    // Cabeçalho
    doc.fontSize(20).font('Helvetica-Bold').text('RH System - Relatório', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text(`Tipo: ${tipo}`, { align: 'center' });
    doc.fontSize(10).text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, { align: 'center' });
    doc.moveDown();

    if (tipo === 'ponto') {
      const where = {};
      if (funcionarioId) where.funcionarioId = funcionarioId;
      if (dataInicio || dataFim) {
        where.data = {};
        if (dataInicio) where.data.gte = new Date(dataInicio);
        if (dataFim) where.data.lte = new Date(dataFim);
      }

      const pontos = await prisma.ponto.findMany({
        where,
        include: { funcionario: { select: { nome: true } } },
        orderBy: { data: 'desc' },
        take: 100,
      });

      doc.fontSize(12).font('Helvetica-Bold').text('Registros de Ponto');
      doc.moveDown(0.5);

      pontos.forEach(p => {
        doc.fontSize(10).font('Helvetica').text(`${p.funcionario.nome} - ${format(new Date(p.data), 'dd/MM/yyyy')}`);
        if (p.entrada) doc.text(`  Entrada: ${format(new Date(p.entrada), 'HH:mm')}`);
        if (p.saida) doc.text(`  Saída: ${format(new Date(p.saida), 'HH:mm')}`);
        doc.moveDown(0.3);
      });
    }

    doc.end();
  } catch (err) {
    res.status(500).json({ error: 'Erro ao gerar PDF' });
  }
};

// Gerar Excel de Relatório
exports.gerarRelatorioExcel = async (req, res) => {
  try {
    const { tipo, dataInicio, dataFim } = req.query;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Relatório');

    if (tipo === 'folha') {
      const folhas = await prisma.folhaPagamento.findMany({
        include: { funcionario: { select: { nome: true, cargo: true } } },
        take: 1000,
      });

      worksheet.columns = [
        { header: 'Funcionário', key: 'nome', width: 25 },
        { header: 'Cargo', key: 'cargo', width: 20 },
        { header: 'Mês/Ano', key: 'mesAno', width: 12 },
        { header: 'Salário Base', key: 'salarioBase', width: 15 },
        { header: 'H.E. 50%', key: 'horasExtras50', width: 12 },
        { header: 'H.E. 100%', key: 'horasExtras100', width: 12 },
        { header: 'Desconto Faltas', key: 'descontoFaltas', width: 15 },
        { header: 'Salário Líquido', key: 'salarioLiquido', width: 15 },
        { header: 'Status', key: 'status', width: 12 },
      ];

      folhas.forEach(f => {
        worksheet.addRow({
          nome: f.funcionario.nome,
          cargo: f.funcionario.cargo,
          mesAno: `${f.mes}/${f.ano}`,
          salarioBase: parseFloat(f.salarioBase),
          horasExtras50: parseFloat(f.horasExtras50),
          horasExtras100: parseFloat(f.horasExtras100),
          descontoFaltas: parseFloat(f.descontoFaltas),
          salarioLiquido: parseFloat(f.salarioLiquido),
          status: f.status,
        });
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="relatorio-${tipo}-${Date.now()}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: 'Erro ao gerar Excel' });
  }
};

// Obter histórico de relatórios gerados
exports.getHistoricoRelatorios = async (req, res) => {
  try {
    // Simular histórico (em produção, seria armazenado no banco)
    const historico = [
      {
        id: '1',
        tipo: 'folha',
        dataGeracao: new Date(),
        usuario: req.user.email,
        status: 'concluído',
      },
    ];

    res.json(historico);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
};
