const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const ctrl = require('../controllers/ponto.controller');

router.use(authMiddleware);

router.get('/', ctrl.listar);
router.get('/hoje', ctrl.hoje);
router.get('/funcionario/:funcionarioId', ctrl.porFuncionario);
router.get('/funcionario/:funcionarioId/resumo', ctrl.resumoMensal);
router.post('/bater', ctrl.baterPonto);
router.post('/manual', ctrl.registroManual);
router.put('/:id', ctrl.atualizar);

module.exports = router;