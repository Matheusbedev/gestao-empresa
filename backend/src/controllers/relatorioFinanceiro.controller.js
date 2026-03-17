const { PrismaClient } = require('@prisma/client');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, AlignmentType, WidthType, BorderStyle } = require('docx');
const { format } = require('date-fns');
const { ptBR } = require('date-fns/locale');
const prisma = new PrismaClient();

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(v) || 0);
const fmtDate = (d) => { try { return format(new Date(d), 'dd/MM/yyyy'); } catch { return '—'; } };

const statusLabel = { PENDENTE: 'Pendente', PAGA: 'Paga', VENCIDA: 'Vencida', CANCELADA: 'Cancelada' };
const tipoLabel = { DESPESA: 'Despesa', INVESTIMENTO: 'Investimento', IMPOSTO: 'Imposto' };

async function getDados(mes, ano) {
  const mesInt = parseInt(mes); const anoInt = parseInt(ano);
  const inicio = new Date(anoInt, mesInt - 1, 1);
  const fim = new Date(anoInt, mesInt, 0);
  const [contas, receitas] = await Promise.all([
    prisma.conta.findMany({ where: { vencimento: { gte: inicio, lte: fim } }, orderBy: { vencimento: 'asc' } }),
    prisma.receita.findMany({ where: { data: { gte: inicio, lte: fim } }, orderBy: { data: 'asc' } }),
  ]);
  const totalDespesas = contas.filter(c => c.status !== 'CANCELADA').reduce((a, c) => a + parseFloat(c.valor), 0);
  const totalReceitas = receitas.reduce((a, r) => a + parseFloat(r.valor), 0);
  return { contas, receitas, totalDespesas, totalReceitas, saldo: totalReceitas - totalDespesas, mesInt, anoInt };
}

// ── PDF ──────────────────────────────────────────────────────
exports.financeiroPDF = async (req, res) => {
  try {
    const { mes, ano } = req.query;
    const { contas, receitas, totalDespesas, totalReceitas, saldo, mesInt, anoInt } = await getDados(mes, ano);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=financeiro-${mes}-${ano}.pdf`);
    doc.pipe(res);

    // Header
    doc.rect(0, 0, doc.page.width, 80).fill('#1e3a8a');
    doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold')
      .text('RELATÓRIO FINANCEIRO', 50, 25, { align: 'center' });
    doc.fontSize(11).font('Helvetica')
      .text(`Período: ${mesInt.toString().padStart(2,'0')}/${anoInt}`, 50, 52, { align: 'center' });
    doc.fillColor('#000000').moveDown(3);

    // Resumo
    const resumoY = 100;
    const boxW = (doc.page.width - 100) / 3;
    [
      { label: 'Total Receitas', value: fmt(totalReceitas), color: '#059669' },
      { label: 'Total Despesas', value: fmt(totalDespesas), color: '#dc2626' },
      { label: 'Saldo', value: fmt(saldo), color: saldo >= 0 ? '#2563eb' : '#dc2626' },
    ].forEach((item, i) => {
      const x = 50 + i * (boxW + 10);
      doc.rect(x, resumoY, boxW, 55).fillAndStroke('#f8fafc', '#e2e8f0');
      doc.fillColor('#64748b').fontSize(9).font('Helvetica').text(item.label, x + 8, resumoY + 8);
      doc.fillColor(item.color).fontSize(14).font('Helvetica-Bold').text(item.value, x + 8, resumoY + 24);
    });

    doc.fillColor('#000').moveDown(5);
    let y = resumoY + 75;

    // Receitas
    if (receitas.length > 0) {
      doc.fontSize(13).font('Helvetica-Bold').fillColor('#1e3a8a').text('RECEITAS', 50, y);
      y += 20;
      doc.rect(50, y, doc.page.width - 100, 18).fill('#1e3a8a');
      doc.fillColor('#fff').fontSize(9).font('Helvetica-Bold');
      doc.text('Descrição', 55, y + 4); doc.text('Categoria', 230, y + 4);
      doc.text('Data', 360, y + 4); doc.text('Valor', 450, y + 4);
      y += 18;
      receitas.forEach((r, idx) => {
        if (y > 720) { doc.addPage(); y = 50; }
        doc.rect(50, y, doc.page.width - 100, 16).fill(idx % 2 === 0 ? '#f0fdf4' : '#ffffff');
        doc.fillColor('#111').fontSize(8).font('Helvetica');
        doc.text(r.descricao.substring(0, 28), 55, y + 3);
        doc.text(r.categoria, 230, y + 3);
        doc.text(fmtDate(r.data), 360, y + 3);
        doc.fillColor('#059669').text(fmt(r.valor), 450, y + 3);
        y += 16;
      });
      y += 10;
    }

    // Contas
    if (contas.length > 0) {
      if (y > 650) { doc.addPage(); y = 50; }
      doc.fontSize(13).font('Helvetica-Bold').fillColor('#1e3a8a').text('CONTAS / DESPESAS', 50, y);
      y += 20;
      doc.rect(50, y, doc.page.width - 100, 18).fill('#1e3a8a');
      doc.fillColor('#fff').fontSize(9).font('Helvetica-Bold');
      doc.text('Descrição', 55, y + 4); doc.text('Categoria', 200, y + 4);
      doc.text('Vencimento', 310, y + 4); doc.text('Valor', 400, y + 4); doc.text('Status', 470, y + 4);
      y += 18;
      contas.forEach((c, idx) => {
        if (y > 720) { doc.addPage(); y = 50; }
        const bg = c.status === 'VENCIDA' ? '#fff1f2' : c.status === 'PAGA' ? '#f0fdf4' : idx % 2 === 0 ? '#f8fafc' : '#ffffff';
        doc.rect(50, y, doc.page.width - 100, 16).fill(bg);
        doc.fillColor('#111').fontSize(8).font('Helvetica');
        doc.text(c.descricao.substring(0, 22), 55, y + 3);
        doc.text(c.categoria, 200, y + 3);
        doc.text(fmtDate(c.vencimento), 310, y + 3);
        doc.fillColor('#dc2626').text(fmt(c.valor), 400, y + 3);
        const sc = c.status === 'PAGA' ? '#059669' : c.status === 'VENCIDA' ? '#dc2626' : '#d97706';
        doc.fillColor(sc).text(statusLabel[c.status] || c.status, 470, y + 3);
        y += 16;
      });
    }

    // Footer
    doc.fontSize(8).fillColor('#94a3b8').font('Helvetica')
      .text('Desenvolvido por Matheus Augusto · dev.matheusaugustoo@gmail.com · (43) 999555-144',
        50, doc.page.height - 30, { align: 'center' });

    doc.end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao gerar PDF financeiro' });
  }
};

// ── EXCEL ────────────────────────────────────────────────────
exports.financeiroExcel = async (req, res) => {
  try {
    const { mes, ano } = req.query;
    const { contas, receitas, totalDespesas, totalReceitas, saldo } = await getDados(mes, ano);

    const wb = new ExcelJS.Workbook();
    wb.creator = 'RH System — Matheus Augusto';

    // Aba Resumo
    const wsResumo = wb.addWorksheet('Resumo');
    wsResumo.mergeCells('A1:D1');
    wsResumo.getCell('A1').value = `Relatório Financeiro — ${mes}/${ano}`;
    wsResumo.getCell('A1').font = { bold: true, size: 14, color: { argb: 'FF1E3A8A' } };
    wsResumo.getCell('A1').alignment = { horizontal: 'center' };
    wsResumo.addRow([]);
    wsResumo.addRow(['Indicador', 'Valor']);
    wsResumo.getRow(3).font = { bold: true };
    wsResumo.addRow(['Total Receitas', totalReceitas]);
    wsResumo.addRow(['Total Despesas', totalDespesas]);
    wsResumo.addRow(['Saldo', saldo]);
    wsResumo.getColumn(2).numFmt = 'R$ #,##0.00';
    wsResumo.getColumn(1).width = 25; wsResumo.getColumn(2).width = 18;

    // Aba Receitas
    const wsRec = wb.addWorksheet('Receitas');
    wsRec.columns = [
      { header: 'Descrição', key: 'descricao', width: 30 },
      { header: 'Categoria', key: 'categoria', width: 18 },
      { header: 'Origem', key: 'origem', width: 20 },
      { header: 'Data', key: 'data', width: 14 },
      { header: 'Valor', key: 'valor', width: 16 },
      { header: 'Observação', key: 'observacao', width: 30 },
    ];
    wsRec.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    wsRec.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
    receitas.forEach(r => wsRec.addRow({
      descricao: r.descricao, categoria: r.categoria, origem: r.origem || '',
      data: fmtDate(r.data), valor: parseFloat(r.valor), observacao: r.observacao || '',
    }));
    wsRec.getColumn('valor').numFmt = 'R$ #,##0.00';

    // Aba Contas
    const wsCon = wb.addWorksheet('Contas e Despesas');
    wsCon.columns = [
      { header: 'Descrição', key: 'descricao', width: 30 },
      { header: 'Categoria', key: 'categoria', width: 18 },
      { header: 'Tipo', key: 'tipo', width: 14 },
      { header: 'Vencimento', key: 'vencimento', width: 14 },
      { header: 'Valor', key: 'valor', width: 16 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Pago em', key: 'pagoEm', width: 14 },
      { header: 'Observação', key: 'observacao', width: 30 },
    ];
    wsCon.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    wsCon.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
    contas.forEach((c, i) => {
      const row = wsCon.addRow({
        descricao: c.descricao, categoria: c.categoria, tipo: tipoLabel[c.tipo] || c.tipo,
        vencimento: fmtDate(c.vencimento), valor: parseFloat(c.valor),
        status: statusLabel[c.status] || c.status,
        pagoEm: c.pagoEm ? fmtDate(c.pagoEm) : '',
        observacao: c.observacao || '',
      });
      if (c.status === 'VENCIDA') row.getCell('status').font = { color: { argb: 'FFDC2626' }, bold: true };
      if (c.status === 'PAGA') row.getCell('status').font = { color: { argb: 'FF059669' }, bold: true };
    });
    wsCon.getColumn('valor').numFmt = 'R$ #,##0.00';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=financeiro-${mes}-${ano}.xlsx`);
    await wb.xlsx.write(res);
    res.end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao gerar Excel financeiro' });
  }
};

// ── WORD ─────────────────────────────────────────────────────
exports.financeiroWord = async (req, res) => {
  try {
    const { mes, ano } = req.query;
    const { contas, receitas, totalDespesas, totalReceitas, saldo } = await getDados(mes, ano);

    const border = { style: BorderStyle.SINGLE, size: 1, color: 'e2e8f0' };
    const cellBorder = { top: border, bottom: border, left: border, right: border };

    const headerCell = (text) => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: 'FFFFFF', size: 18 })], alignment: AlignmentType.CENTER })],
      shading: { fill: '1e3a8a' }, borders: cellBorder,
    });
    const dataCell = (text, color) => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: String(text), size: 16, color: color || '111827' })] })],
      borders: cellBorder,
    });

    const receitasRows = [
      new TableRow({ children: ['Descrição','Categoria','Data','Valor'].map(headerCell) }),
      ...receitas.map(r => new TableRow({ children: [
        dataCell(r.descricao), dataCell(r.categoria),
        dataCell(fmtDate(r.data)), dataCell(fmt(r.valor), '059669'),
      ]})),
    ];

    const contasRows = [
      new TableRow({ children: ['Descrição','Categoria','Vencimento','Valor','Status'].map(headerCell) }),
      ...contas.map(c => new TableRow({ children: [
        dataCell(c.descricao), dataCell(c.categoria), dataCell(fmtDate(c.vencimento)),
        dataCell(fmt(c.valor), 'dc2626'),
        dataCell(statusLabel[c.status] || c.status, c.status === 'PAGA' ? '059669' : c.status === 'VENCIDA' ? 'dc2626' : 'd97706'),
      ]})),
    ];

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ text: `Relatório Financeiro — ${mes}/${ano}`, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
          new Paragraph({ text: `Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, alignment: AlignmentType.CENTER }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: 'Resumo', heading: HeadingLevel.HEADING_2 }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({ children: ['Indicador','Valor'].map(headerCell) }),
              new TableRow({ children: [dataCell('Total Receitas'), dataCell(fmt(totalReceitas), '059669')] }),
              new TableRow({ children: [dataCell('Total Despesas'), dataCell(fmt(totalDespesas), 'dc2626')] }),
              new TableRow({ children: [dataCell('Saldo'), dataCell(fmt(saldo), saldo >= 0 ? '2563eb' : 'dc2626')] }),
            ],
          }),
          new Paragraph({ text: '' }),
          ...(receitas.length > 0 ? [
            new Paragraph({ text: 'Receitas', heading: HeadingLevel.HEADING_2 }),
            new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: receitasRows }),
            new Paragraph({ text: '' }),
          ] : []),
          ...(contas.length > 0 ? [
            new Paragraph({ text: 'Contas e Despesas', heading: HeadingLevel.HEADING_2 }),
            new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: contasRows }),
            new Paragraph({ text: '' }),
          ] : []),
          new Paragraph({
            children: [new TextRun({ text: 'Desenvolvido por Matheus Augusto · dev.matheusaugustoo@gmail.com · (43) 999555-144', size: 16, color: '94a3b8' })],
            alignment: AlignmentType.CENTER,
          }),
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=financeiro-${mes}-${ano}.docx`);
    res.send(buffer);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao gerar Word financeiro' });
  }
};
