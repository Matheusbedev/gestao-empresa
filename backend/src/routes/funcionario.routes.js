const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth.middleware');
const ctrl = require('../controllers/funcionario.controller');

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Apenas administradores podem realizar esta ação.' });
  }
  next();
};

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Tipo de arquivo não permitido. Use JPG, PNG, WEBP ou PDF.'));
  },
});

router.use(auth);

router.get('/', ctrl.listar);
router.get('/:id', ctrl.buscarPorId);
router.post('/', upload.single('foto'), ctrl.criar);
router.put('/:id', upload.single('foto'), ctrl.atualizar);
router.delete('/:id', requireAdmin, ctrl.deletar);
router.patch('/:id/reativar', requireAdmin, ctrl.reativar);
router.delete('/:id/permanente', requireAdmin, ctrl.excluirPermanente);
router.post('/:id/documentos', upload.array('documentos', 5), ctrl.uploadDocumentos);

module.exports = router;
