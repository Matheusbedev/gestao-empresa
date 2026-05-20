// Middleware para verificar permissões por role
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Autenticação necessária.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Você não tem permissão para acessar este recurso.' });
    }

    next();
  };
};

// Middleware para verificar se é o próprio usuário ou admin
const requireOwnerOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Autenticação necessária.' });
  }

  const targetId = req.params.id || req.body.id;
  const isOwner = req.user.id === targetId;
  const isAdmin = req.user.role === 'ADMIN';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: 'Você não tem permissão para acessar este recurso.' });
  }

  next();
};

module.exports = { requireRole, requireOwnerOrAdmin };
