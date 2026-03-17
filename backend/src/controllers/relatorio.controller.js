const { PrismaClient } = require('@prisma/client');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { startOfMonth, endOfMonth, format } = require('date-fns');
const { ptBR } = require('date-fns/locale');
const prisma = new PrismaClient();

exports.pontoPDF = async (req, res) => {
  try {
    const { mes, ano, funcionarioId } = req.query;
    const dataRef = new Date(parseInt(ano), parseInt(mes) - 1, 1);

    const where = { data: { gte: startOfMonth(dataRef), lte: endOfMonth(dataRef) } };
    if (funcionarioId) where.funcionarioId = funcionarioId;

    const pontos = await prisma.ponto.findMany({
      where,
      include: { funcionario: { select: { nome: true, cargo: true } } },
      orderBy: [{ funcionario: { nome: 'asc' } }, { data: 'asc' }],
    });

    const doc = new PDFDocument({ margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ponto-${mes}-${ano}.pdf`);
    doc.pipe(res);

    doc.fontSize(18).text('Relatório de Ponto', { align: 'center' });
    doc.fontSize(12).text(`Período: ${mes}/${ano}`, { align: 'center' });
    doc.moveDown();

    for (const p of pontos) {
      doc.fontSize(10)
        .text(`${p.funcionario.nome} | ${format(new Date(p.data), 'dd/MM/yyyy')} | Entrada: ${p.entrada ? format(new Date(p.entrada), 'HH:mm') : '--'} | Saída: ${p.saida ? format(new Date(p.saida), 'HH:mm') : '--'} | Horas: ${p.horasTrabalhadas || 0}h | Extras: ${p.horasExtras || 0}h`);
    }

    doc.end();
  } catch {
    res.status(500).json({ error: 'Erro ao gerar PDF de ponto' });
  }
};

exports.faltasPDF = async (req, res) => {
  try {
    const { mes, ano } = req.query;
    const dataRef = new Date(parseInt(ano), parseInt(mes) - 1, 1);

    const faltas = await prisma.falta.findMany({
      where: { data: { gte: startOfMonth(dataRef), lte: endOfMonth(dataRef) } },
      include: { funcionario: { select: { nome: true, cargo: true } } },
      orderBy: { data: 'asc' },
    });

    const doc = new PDFDocument({ margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=faltas-${mes}-${ano}.pdf`);
    doc.pipe(res);

    doc.fontSize(18).text('Relatório de Faltas', { align: 'center' });
    doc.fontSize(12).text(`Período: ${mes}/${ano}`, { align: 'center' });
    doc.moveDown();

    for (const f of faltas) {
      doc.fontSize(10)
        .text(`${f.funcionario.nome} | ${format(new Date(f.data), 'dd/MM/yyyy')} | Tipo: ${f.tipo} | Motivo: ${f.motivo || 'N/A'}`);
    }

    doc.end();
  } catch {
    res.status(500).json({ error: 'Erro ao gerar PDF de faltas' });
  }
};

exports.folhaPDF = async (req, res) => {
  try {
    const folha = await prisma.folhaPagamento.findUnique({
      where: { id: req.params.id },
      include: { funcionario: true },
    });

    if (!folha) return res.status(404).json({ error: 'Folha não encontrada' });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=folha-${folha.funcionario.nome}-${folha.mes}-${folha.ano}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text('HOLERITE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Funcionário: ${folha.funcionario.nome}`);
    doc.text(`Cargo: ${folha.funcionario.cargo}`);
    doc.text(`Período: ${folha.mes}/${folha.ano}`);
    doc.moveDown();
    doc.fontSize(12).text('─'.repeat(60));
    doc.text(`Salário Base:          R$ ${parseFloat(folha.salarioBase).toFixed(2)}`);
    doc.text(`Horas Extras (50%):    R$ ${parseFloat(folha.horasExtras50).toFixed(2)}`);
    doc.text(`Horas Extras (100%):   R$ ${parseFloat(folha.horasExtras100).toFixed(2)}`);
    doc.text(`Bônus:                 R$ ${parseFloat(folha.bonus).toFixed(2)}`);
    doc.text(`Vale Transporte:       R$ ${parseFloat(folha.valeTransporte).toFixed(2)}`);
    doc.text(`Vale Alimentação:      R$ ${parseFloat(folha.valeAlimentacao).toFixed(2)}`);
    doc.text('─'.repeat(60));
    doc.text(`Desconto INSS:        -R$ ${parseFloat(folha.inss).toFixed(2)}`);
    doc.text(`Desconto Faltas:      -R$ ${parseFloat(folha.descontoFaltas).toFixed(2)}`);
    doc.text('─'.repeat(60));
    doc.fontSize(14).text(`SALÁRIO LÍQUIDO:       R$ ${parseFloat(folha.salarioLiquido).toFixed(2)}`);

    doc.end();
  } catch {
    res.status(500).json({ error: 'Erro ao gerar PDF da folha' });
  }
};

exports.folhaExcel = async (req, res) => {
  try {
    const { mes, ano } = req.query;

    const folhas = await prisma.folhaPagamento.findMany({
      where: { mes: parseInt(mes), ano: parseInt(ano) },
      include: { funcionario: { select: { nome: true, cargo: true, departamento: true } } },
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(`Folha ${mes}/${ano}`);

    sheet.columns = [
      { header: 'Funcionário', key: 'nome', width: 25 },
      { header: 'Cargo', key: 'cargo', width: 20 },
      { header: 'Departamento', key: 'departamento', width: 20 },
      { header: 'Salário Base', key: 'salarioBase', width: 15 },
      { header: 'H.E. 50%', key: 'horasExtras50', width: 12 },
      { header: 'H.E. 100%', key: 'horasExtras100', width: 12 },
      { header: 'Bônus', key: 'bonus', width: 12 },
      { header: 'V. Transporte', key: 'valeTransporte', width: 14 },
      { header: 'V. Alimentação', key: 'valeAlimentacao', width: 14 },
      { header: 'INSS', key: 'inss', width: 12 },
      { header: 'Desc. Faltas', key: 'descontoFaltas', width: 14 },
      { header: 'Salário Líquido', key: 'salarioLiquido', width: 16 },
    ];

    sheet.getRow(1).font = { bold: true };

    for (const f of folhas) {
      sheet.addRow({
        nome: f.funcionario.nome,
        cargo: f.funcionario.cargo,
        departamento: f.funcionario.departamento || '',
        salarioBase: parseFloat(f.salarioBase),
        horasExtras50: parseFloat(f.horasExtras50),
        horasExtras100: parseFloat(f.horasExtras100),
        bonus: parseFloat(f.bonus),
        valeTransporte: parseFloat(f.valeTransporte),
        valeAlimentacao: parseFloat(f.valeAlimentacao),
        inss: parseFloat(f.inss),
        descontoFaltas: parseFloat(f.descontoFaltas),
        salarioLiquido: parseFloat(f.salarioLiquido),
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=folha-${mes}-${ano}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch {
    res.status(500).json({ error: 'Erro ao gerar Excel' });
  }
};
