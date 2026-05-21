const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/anotacoes.controller');
const auth = require('../middleware/auth.middleware');

const createValidation = [
  body('funcionarioId').notEmpty().withMessage('ID do funcionário é obrigatório'),
  body('titulo').trim().notEmpty().withMessage('Título é obrigatório'),
  body('conteudo').trim().notEmpty().withMessage('Conteúdo é obrigatório'),
];

router.get('/:funcionarioId', auth, ctrl.listarAnotacoes);
router.post('/', auth, createValidation, ctrl.criarAnotacao);
router.put('/:id', auth, ctrl.atualizarAnotacao);
router.delete('/:id', auth, ctrl.deletarAnotacao);

module.exports = router;
