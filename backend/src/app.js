const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const logger = require('./utils/logger');

const authRoutes = require('./routes/auth.routes');
const funcionarioRoutes = require('./routes/funcionario.routes');
const pontoRoutes = require('./routes/ponto.routes');
const faltaRoutes = require('./routes/falta.routes');
const folhaRoutes = require('./routes/folha.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const relatorioRoutes = require('./routes/relatorio.routes');

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/funcionarios', funcionarioRoutes);
app.use('/api/pontos', pontoRoutes);
app.use('/api/faltas', faltaRoutes);
app.use('/api/folhas', folhaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/relatorios', relatorioRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Error handler
app.use((err, req, res, next) => {
  logger.error(err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
  });
});

module.exports = app;
