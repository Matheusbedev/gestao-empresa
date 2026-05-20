const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/auth.controller');
const auth = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/permissions.middleware');

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Informe um e-mail válido.'),
  body('senha').notEmpty().withMessage('A senha é obrigatória.'),
];

const registerValidation = [
  body('nome').trim().notEmpty().withMessage('O nome é obrigatório.'),
  body('email').isEmail().normalizeEmail().withMessage('Informe um e-mail válido.'),
  body('senha').isLength({ min: 8 }).withMessage('A senha deve ter no mínimo 8 caracteres.'),
];

const updateValidation = [
  body('email').optional().isEmail().normalizeEmail().withMessage('Informe um e-mail válido.'),
  body('senha').optional().isLength({ min: 8 }).withMessage('A senha deve ter no mínimo 8 caracteres.'),
];

router.post('/login', loginValidation, ctrl.login);
router.get('/me', auth, ctrl.me);
router.get('/usuarios', auth, requireRole('ADMIN'), ctrl.listarUsuarios);
router.post('/register', auth, requireRole('ADMIN'), registerValidation, ctrl.register);
router.put('/usuarios/:id', auth, requireRole('ADMIN'), updateValidation, ctrl.atualizarUsuario);
router.delete('/usuarios/:id', auth, requireRole('ADMIN'), ctrl.removerUsuario);

module.exports = router;
