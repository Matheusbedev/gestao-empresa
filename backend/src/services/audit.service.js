const logger = require('../utils/logger');

class AuditService {
  static logAction(userId, action, resource, resourceId, details = {}, status = 'SUCCESS') {
    const auditLog = {
      timestamp: new Date().toISOString(),
      userId,
      action,
      resource,
      resourceId,
      details,
      status,
      ip: details.ip || 'unknown',
    };

    if (status === 'SUCCESS') {
      logger.info(`[AUDIT] ${action} ${resource}#${resourceId} by ${userId}`, auditLog);
    } else {
      logger.warn(`[AUDIT] ${action} ${resource}#${resourceId} by ${userId} - ${status}`, auditLog);
    }

    return auditLog;
  }

  static logLogin(userId, email, status = 'SUCCESS', ip = 'unknown') {
    const log = {
      timestamp: new Date().toISOString(),
      userId,
      email,
      action: 'LOGIN',
      status,
      ip,
    };

    if (status === 'SUCCESS') {
      logger.info(`[AUTH] Login successful for ${email}`, log);
    } else {
      logger.warn(`[AUTH] Login failed for ${email} - ${status}`, log);
    }

    return log;
  }

  static logPermissionDenied(userId, action, resource, ip = 'unknown') {
    const log = {
      timestamp: new Date().toISOString(),
      userId,
      action,
      resource,
      status: 'PERMISSION_DENIED',
      ip,
    };

    logger.warn(`[SECURITY] Permission denied for ${userId} on ${action} ${resource}`, log);
    return log;
  }

  static logSecurityEvent(eventType, details = {}) {
    const log = {
      timestamp: new Date().toISOString(),
      eventType,
      details,
    };

    logger.error(`[SECURITY] ${eventType}`, log);
    return log;
  }
}

module.exports = AuditService;
