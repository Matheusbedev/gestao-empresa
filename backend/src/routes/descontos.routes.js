const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/descontos.controller');
const auth = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/permissions.middleware');

const createValidation = [
  body('funcionarioId').notEmpty().withMessage('ID do funcionário é obrigatório'),
  body('mes').isInt({ min: 1, max: 12 }).withMessage('Mês inválido'),
  body('ano').isInt({ min: 2020 }).withMessage('Ano inválido'),
  body('valor').isFloat({ min: 0 }).withMessage('Valor deve ser maior que 0'),
  body('motivo').trim().notEmpty().withMessage('Motivo é obrigatório'),
];

router.get('/', auth, ctrl.listarDescontos);
router.get('/funcionario/:funcionarioId', auth, ctrl.getDescontosFuncionario);
router.post('/', auth, requireRole('ADMIN'), createValidation, ctrl.criarDesconto);
router.put('/:id', auth, requireRole('ADMIN'), ctrl.atualizarDesconto);
router.patch('/:id/aprovar', auth, requireRole('ADMIN'), ctrl.aprovarDesconto);
router.patch('/:id/rejeitar', auth, requireRole('ADMIN'), ctrl.rejeitarDesconto);
router.delete('/:id', auth, requireRole('ADMIN'), ctrl.deletarDesconto);

module.exports = router;
