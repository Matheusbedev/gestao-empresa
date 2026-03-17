const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/auth.middleware');
const ctrl = require('../controllers/funcionario.controller');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.use(authMiddleware);

/**
 * @swagger
 * /api/funcionarios:
 *   get:
 *     summary: Listar funcionários
 *     tags: [Funcionários]
 */
router.get('/', ctrl.listar);
router.get('/:id', ctrl.buscarPorId);
router.post('/', upload.single('foto'), ctrl.criar);
router.put('/:id', upload.single('foto'), ctrl.atualizar);
router.delete('/:id', ctrl.deletar);
router.post('/:id/documentos', upload.array('documentos', 5), ctrl.uploadDocumentos);

module.exports = router;
