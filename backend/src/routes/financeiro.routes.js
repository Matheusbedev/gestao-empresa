const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const ctrl = require('../controllers/financeiro.controller');

router.use(auth);

// Resumo
router.get('/resumo', ctrl.resumo);

// Contas
router.get('/contas', ctrl.listarContas);
router.post('/contas', ctrl.criarConta);
router.put('/contas/:id', ctrl.atualizarConta);
router.patch('/contas/:id/pagar', ctrl.marcarPaga);
router.patch('/contas/:id/desmarcar', ctrl.desmarcarPaga);
router.delete('/contas/:id', ctrl.deletarConta);

// Receitas
router.get('/receitas', ctrl.listarReceitas);
router.post('/receitas', ctrl.criarReceita);
router.put('/receitas/:id', ctrl.atualizarReceita);
router.delete('/receitas/:id', ctrl.deletarReceita);

module.exports = router;
