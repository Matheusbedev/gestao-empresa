const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/relatorios.advanced.controller');
const auth = require('../middleware/auth.middleware');

// Relatórios com filtros avançados
router.get('/ponto/avancado', auth, ctrl.getPontoAvancado);
router.get('/faltas/avancado', auth, ctrl.getFaltasAvancado);
router.get('/folha/avancado', auth, ctrl.getFolhaAvancado);
router.get('/financeiro/avancado', auth, ctrl.getFinanceiroAvancado);

// Gerar relatórios em diferentes formatos
router.get('/gerar/pdf', auth, ctrl.gerarRelatorioPDF);
router.get('/gerar/excel', auth, ctrl.gerarRelatorioExcel);

// Histórico de relatórios
router.get('/historico', auth, ctrl.getHistoricoRelatorios);

module.exports = router;
