const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const ctrl = require('../controllers/falta.controller');

router.use(authMiddleware);

router.get('/', ctrl.listar);
router.get('/funcionario/:funcionarioId', ctrl.porFuncionario);
router.post('/', ctrl.criar);
router.put('/:id', ctrl.atualizar);
router.delete('/:id', ctrl.deletar);

module.exports = router;
