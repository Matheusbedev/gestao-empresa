const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const ctrl = require('../controllers/folha.controller');

router.use(authMiddleware);

router.get('/', ctrl.listar);
router.get('/:id', ctrl.buscarPorId);
router.post('/gerar', ctrl.gerarFolha);
router.put('/:id/status', ctrl.atualizarStatus);

module.exports = router;
