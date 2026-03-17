const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const ctrl = require('../controllers/dashboard.controller');

router.use(authMiddleware);

router.get('/', ctrl.getDashboard);

module.exports = router;
