require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const logger = require('./utils/logger');

const authRoutes = require('./routes/auth.routes');
const funcionarioRoutes = require('./routes/funcionario.routes');
const pontoRoutes = require('./routes/ponto.routes');
const faltaRoutes = require('./routes/falta.routes');
const folhaRoutes = require('./routes/folha.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const relatorioRoutes = require('./routes/relatorio.routes');
const financeiroRoutes = require('./routes/financeiro.routes');
const relatorioFinanceiroRoutes = require('./routes/relatorioFinanceiro.routes');
const relatoriosAdvancedRoutes = require('./routes/relatorios.advanced.routes');

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Origem não permitida'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use('/uploads', express.static('uploads'));

// Rate limit geral
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

// Rate limit específico para login
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Muitas tentativas de login. Aguarde 15 minutos.' },
}));

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} — ${req.ip}`);
  next();
});

if (process.env.NODE_ENV !== 'test') {
  const swaggerSpec = require('./config/swagger');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

app.use('/api/auth', authRoutes);
app.use('/api/funcionarios', funcionarioRoutes);
app.use('/api/pontos', pontoRoutes);
app.use('/api/faltas', faltaRoutes);
app.use('/api/folhas', folhaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/relatorios', relatorioRoutes);
app.use('/api/financeiro', financeiroRoutes);
app.use('/api/relatorios/financeiro', relatorioFinanceiroRoutes);
app.use('/api/relatorios/avancado', relatoriosAdvancedRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

app.use((req, res) => res.status(404).json({ error: 'Rota não encontrada.' }));

app.use((err, req, res, next) => {
  logger.error(`${err.message} — ${req.method} ${req.path}`);
  const status = err.status || 500;
  const message = status < 500 ? err.message : 'Erro interno. Tente novamente.';
  res.status(status).json({ error: message });
});

module.exports = app;
