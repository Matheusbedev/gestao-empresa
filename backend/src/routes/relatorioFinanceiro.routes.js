const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const ctrl = require('../controllers/relatorioFinanceiro.controller');

router.use(auth);
router.get('/pdf', ctrl.financeiroPDF);
router.get('/excel', ctrl.financeiroExcel);
router.get('/word', ctrl.financeiroWord);

module.exports = router;
