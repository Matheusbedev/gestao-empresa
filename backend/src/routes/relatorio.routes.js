const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const ctrl = require('../controllers/relatorio.controller');

router.use(authMiddleware);

router.get('/ponto/pdf', ctrl.pontoPDF);
router.get('/faltas/pdf', ctrl.faltasPDF);
router.get('/folha/pdf/:id', ctrl.folhaPDF);
router.get('/folha/excel', ctrl.folhaExcel);

module.exports = router;
