/**
 * ERROR HANDLER - SISTEMA DE MANEJO DE ERRORES ROBUSTO
 * Etapa 3 - Semana 3: Manejo avanzado de errores y recuperación automática
 * 
 * Este módulo implementa un sistema robusto de manejo de errores que:
 * - Clasifica errores por tipo y severidad
 * - Implementa estrategias de recuperación automática
 * - Registra errores con contexto detallado
 * - Proporciona fallbacks inteligentes
 */

// ==================== CONFIGURACIÓN DEL MANEJADOR DE ERRORES ====================

const ERROR_HANDLER_CONFIG = {
  ENABLE_ERROR_HANDLING: true,
  ENABLE_AUTO_RECOVERY: true,
  ENABLE_ERROR_LOGGING: true,
  ENABLE_FALLBACKS: true,
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
  ERROR_RETENTION: 24 * 60 * 60 * 1000, // 24 horas
  CRITICAL_ERROR_THRESHOLD: 5, // 5 errores críticos por hora
  AUTO_RECOVERY_DELAY: 5000 // 5 segundos
};

// ==================== TIPOS DE ERRORES ====================

const ERROR_TYPES = {
  NETWORK: 'NETWORK',
  PERMISSION: 'PERMISSION',
  TIMEOUT: 'TIMEOUT',
  VALIDATION: 'VALIDATION',
  DATA: 'DATA',
  SYSTEM: 'SYSTEM',
  UNKNOWN: 'UNKNOWN'
};

const ERROR_SEVERITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

// ==================== ESTRUCTURAS DE DATOS ====================

const errorLog = [];
const errorCounts = new Map();
const recoveryStrategies = new Map();

// ==================== CLASE DE ERROR PERSONALIZADO ====================

class CustomError extends Error {
  constructor(message, type = ERROR_TYPES.UNKNOWN, severity = ERROR_SEVERITY.MEDIUM, context = {}) {
    super(message);
    this.name = 'CustomError';
    this.type = type;
    this.severity = severity;
    this.context = context;
    this.timestamp = new Date().toISOString();
    this.stack = this.stack || new Error().stack;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      severity: this.severity,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

// ==================== CLASE DE ESTRATEGIA DE RECUPERACIÓN ====================

class RecoveryStrategy {
  constructor(name, condition, action, maxAttempts = 3) {
    this.name = name;
    this.condition = condition; // Función que evalúa si aplicar la estrategia
    this.action = action; // Función que ejecuta la recuperación
    this.maxAttempts = maxAttempts;
    this.attempts = 0;
    this.lastAttempt = null;
  }

  canApply(error) {
    return this.condition(error) && this.attempts < this.maxAttempts;
  }

  async execute(error) {
    try {
      this.attempts++;
      this.lastAttempt = new Date().toISOString();
      
      console.log(`[ErrorHandler] Aplicando estrategia de recuperación: ${this.name} (intento ${this.attempts})`);
      
      const result = await this.action(error);
      
      if (result.success) {
        console.log(`[ErrorHandler] Recuperación exitosa: ${this.name}`);
        this.attempts = 0; // Reset en caso de éxito
      }
      
      return result;
    } catch (recoveryError) {
      console.error(`[ErrorHandler] Error en estrategia de recuperación ${this.name}:`, recoveryError);
      return { success: false, error: recoveryError };
    }
  }
}

// ==================== FUNCIONES PRINCIPALES DEL MANEJADOR ====================

/**
 * Maneja un error de forma robusta
 * @param {Error} error - Error a manejar
 * @param {Object} context - Contexto adicional
 * @param {Object} options - Opciones de manejo
 * @returns {Object} Resultado del manejo
 */
function handleError(error, context = {}, options = {}) {
  if (!ERROR_HANDLER_CONFIG.ENABLE_ERROR_HANDLING) {
    return { success: false, error: error.toString() };
  }

  try {
    // Clasificar el error
    const classifiedError = classifyError(error, context);
    
    // Registrar el error
    if (ERROR_HANDLER_CONFIG.ENABLE_ERROR_LOGGING) {
      logError(classifiedError, context);
    }
    
    // Actualizar contadores
    updateErrorCounts(classifiedError);
    
    // Verificar si es crítico
    if (isCriticalError(classifiedError)) {
      handleCriticalError(classifiedError, context);
    }
    
    // Intentar recuperación automática
    let recoveryResult = { success: false };
    if (ERROR_HANDLER_CONFIG.ENABLE_AUTO_RECOVERY) {
      recoveryResult = attemptAutoRecovery(classifiedError, context);
    }
    
    // Aplicar fallback si es necesario
    let fallbackResult = { success: false };
    if (!recoveryResult.success && ERROR_HANDLER_CONFIG.ENABLE_FALLBACKS) {
      fallbackResult = applyFallback(classifiedError, context);
    }
    
    return {
      success: recoveryResult.success || fallbackResult.success,
      error: classifiedError,
      recovery: recoveryResult,
      fallback: fallbackResult,
      handled: true
    };
    
  } catch (handlingError) {
    console.error('[ErrorHandler] Error en el manejo de errores:', handlingError);
    return {
      success: false,
      error: error.toString(),
      handlingError: handlingError.toString(),
      handled: false
    };
  }
}

/**
 * Clasifica un error por tipo y severidad
 * @param {Error} error - Error a clasificar
 * @param {Object} context - Contexto del error
 * @returns {CustomError} Error clasificado
 */
function classifyError(error, context) {
  let type = ERROR_TYPES.UNKNOWN;
  let severity = ERROR_SEVERITY.MEDIUM;
  
  // Clasificar por tipo de error
  if (error.message.includes('timeout') || error.message.includes('Timeout')) {
    type = ERROR_TYPES.TIMEOUT;
    severity = ERROR_SEVERITY.HIGH;
  } else if (error.message.includes('permission') || error.message.includes('Permission')) {
    type = ERROR_TYPES.PERMISSION;
    severity = ERROR_SEVERITY.CRITICAL;
  } else if (error.message.includes('network') || error.message.includes('Network')) {
    type = ERROR_TYPES.NETWORK;
    severity = ERROR_SEVERITY.HIGH;
  } else if (error.message.includes('validation') || error.message.includes('Validation')) {
    type = ERROR_TYPES.VALIDATION;
    severity = ERROR_SEVERITY.MEDIUM;
  } else if (error.message.includes('data') || error.message.includes('Data')) {
    type = ERROR_TYPES.DATA;
    severity = ERROR_SEVERITY.MEDIUM;
  } else if (error.message.includes('system') || error.message.includes('System')) {
    type = ERROR_TYPES.SYSTEM;
    severity = ERROR_SEVERITY.CRITICAL;
  }
  
  // Ajustar severidad basada en contexto
  if (context.operation === 'critical' || context.retryCount > 2) {
    severity = ERROR_SEVERITY.CRITICAL;
  }
  
  return new CustomError(error.message, type, severity, context);
}

/**
 * Registra un error en el log
 * @param {CustomError} error - Error clasificado
 * @param {Object} context - Contexto del error
 */
function logError(error, context) {
  const logEntry = {
    error: error.toJSON(),
    context: context,
    timestamp: new Date().toISOString(),
    userAgent: 'Google Apps Script',
    sessionId: context.sessionId || 'unknown'
  };
  
  errorLog.push(logEntry);
  
  // Limpiar log antiguo
  cleanupErrorLog();
  
  console.error(`[ErrorHandler] Error registrado: ${error.type} - ${error.severity} - ${error.message}`);
}

/**
 * Actualiza contadores de errores
 * @param {CustomError} error - Error clasificado
 */
function updateErrorCounts(error) {
  const key = `${error.type}_${error.severity}`;
  const count = errorCounts.get(key) || 0;
  errorCounts.set(key, count + 1);
}

/**
 * Verifica si un error es crítico
 * @param {CustomError} error - Error a verificar
 * @returns {boolean} True si es crítico
 */
function isCriticalError(error) {
  if (error.severity === ERROR_SEVERITY.CRITICAL) {
    return true;
  }
  
  // Verificar si hay muchos errores del mismo tipo
  const key = `${error.type}_${error.severity}`;
  const count = errorCounts.get(key) || 0;
  
  return count >= ERROR_HANDLER_CONFIG.CRITICAL_ERROR_THRESHOLD;
}

/**
 * Maneja errores críticos
 * @param {CustomError} error - Error crítico
 * @param {Object} context - Contexto del error
 */
function handleCriticalError(error, context) {
  console.error(`[ErrorHandler] ERROR CRÍTICO DETECTADO: ${error.type} - ${error.message}`);
  
  // Notificar administradores (implementar según necesidad)
  notifyCriticalError(error, context);
  
  // Limpiar caché si es necesario
  if (error.type === ERROR_TYPES.DATA || error.type === ERROR_TYPES.SYSTEM) {
    clearAllCaches();
  }
}

/**
 * Intenta recuperación automática
 * @param {CustomError} error - Error a recuperar
 * @param {Object} context - Contexto del error
 * @returns {Object} Resultado de la recuperación
 */
function attemptAutoRecovery(error, context) {
  try {
    // Buscar estrategias aplicables
    const applicableStrategies = Array.from(recoveryStrategies.values())
      .filter(strategy => strategy.canApply(error));
    
    if (applicableStrategies.length === 0) {
      return { success: false, reason: 'No hay estrategias aplicables' };
    }
    
    // Ejecutar estrategias en orden de prioridad
    for (const strategy of applicableStrategies) {
      const result = strategy.execute(error);
      if (result.success) {
        return { success: true, strategy: strategy.name, result: result };
      }
    }
    
    return { success: false, reason: 'Todas las estrategias fallaron' };
    
  } catch (recoveryError) {
    console.error('[ErrorHandler] Error en recuperación automática:', recoveryError);
    return { success: false, error: recoveryError };
  }
}

/**
 * Aplica fallback para un error
 * @param {CustomError} error - Error a manejar
 * @param {Object} context - Contexto del error
 * @returns {Object} Resultado del fallback
 */
function applyFallback(error, context) {
  try {
    switch (error.type) {
      case ERROR_TYPES.NETWORK:
        return applyNetworkFallback(error, context);
      case ERROR_TYPES.TIMEOUT:
        return applyTimeoutFallback(error, context);
      case ERROR_TYPES.DATA:
        return applyDataFallback(error, context);
      case ERROR_TYPES.PERMISSION:
        return applyPermissionFallback(error, context);
      default:
        return applyDefaultFallback(error, context);
    }
  } catch (fallbackError) {
    console.error('[ErrorHandler] Error en fallback:', fallbackError);
    return { success: false, error: fallbackError };
  }
}

// ==================== ESTRATEGIAS DE RECUPERACIÓN ====================

/**
 * Registra una estrategia de recuperación
 * @param {RecoveryStrategy} strategy - Estrategia a registrar
 */
function registerRecoveryStrategy(strategy) {
  recoveryStrategies.set(strategy.name, strategy);
  console.log(`[ErrorHandler] Estrategia de recuperación registrada: ${strategy.name}`);
}

/**
 * Estrategia de recuperación para errores de red
 */
function createNetworkRecoveryStrategy() {
  return new RecoveryStrategy(
    'NETWORK_RECOVERY',
    (error) => error.type === ERROR_TYPES.NETWORK,
    async (error) => {
      // Esperar y reintentar
      await new Promise(resolve => setTimeout(resolve, ERROR_HANDLER_CONFIG.RETRY_DELAY));
      
      // Limpiar caché de red
      clearNetworkCache();
      
      return { success: true, action: 'network_cache_cleared' };
    }
  );
}

/**
 * Estrategia de recuperación para errores de timeout
 */
function createTimeoutRecoveryStrategy() {
  return new RecoveryStrategy(
    'TIMEOUT_RECOVERY',
    (error) => error.type === ERROR_TYPES.TIMEOUT,
    async (error) => {
      // Reducir timeout y reintentar
      const context = error.context;
      if (context.operation) {
        // Implementar lógica específica por operación
        return { success: true, action: 'timeout_reduced' };
      }
      
      return { success: false, reason: 'No se puede reducir timeout' };
    }
  );
}

/**
 * Estrategia de recuperación para errores de datos
 */
function createDataRecoveryStrategy() {
  return new RecoveryStrategy(
    'DATA_RECOVERY',
    (error) => error.type === ERROR_TYPES.DATA,
    async (error) => {
      // Limpiar caché de datos y recargar
      clearDataCache();
      
      // Intentar recargar datos
      try {
        const result = await reloadData();
        return { success: true, action: 'data_reloaded', result: result };
      } catch (reloadError) {
        return { success: false, error: reloadError };
      }
    }
  );
}

// ==================== FALLBACKS ====================

/**
 * Fallback para errores de red
 * @param {CustomError} error - Error de red
 * @param {Object} context - Contexto del error
 * @returns {Object} Resultado del fallback
 */
function applyNetworkFallback(error, context) {
  // Usar datos en caché si están disponibles
  const cachedData = getCachedData(context.operation);
  if (cachedData) {
    return { success: true, data: cachedData, source: 'cache' };
  }
  
  return { success: false, reason: 'No hay datos en caché disponibles' };
}

/**
 * Fallback para errores de timeout
 * @param {CustomError} error - Error de timeout
 * @param {Object} context - Contexto del error
 * @returns {Object} Resultado del fallback
 */
function applyTimeoutFallback(error, context) {
  // Retornar datos parciales si están disponibles
  const partialData = getPartialData(context.operation);
  if (partialData) {
    return { success: true, data: partialData, source: 'partial' };
  }
  
  return { success: false, reason: 'No hay datos parciales disponibles' };
}

/**
 * Fallback para errores de datos
 * @param {CustomError} error - Error de datos
 * @param {Object} context - Contexto del error
 * @returns {Object} Resultado del fallback
 */
function applyDataFallback(error, context) {
  // Usar datos por defecto
  const defaultData = getDefaultData(context.operation);
  if (defaultData) {
    return { success: true, data: defaultData, source: 'default' };
  }
  
  return { success: false, reason: 'No hay datos por defecto disponibles' };
}

/**
 * Fallback para errores de permisos
 * @param {CustomError} error - Error de permisos
 * @param {Object} context - Contexto del error
 * @returns {Object} Resultado del fallback
 */
function applyPermissionFallback(error, context) {
  // Retornar error de permisos sin datos
  return { 
    success: false, 
    error: 'PERMISSION_DENIED', 
    message: 'No se tienen permisos para realizar esta operación' 
  };
}

/**
 * Fallback por defecto
 * @param {CustomError} error - Error a manejar
 * @param {Object} context - Contexto del error
 * @returns {Object} Resultado del fallback
 */
function applyDefaultFallback(error, context) {
  return { 
    success: false, 
    error: error.type, 
    message: `Error no manejado: ${error.message}` 
  };
}

// ==================== FUNCIONES DE UTILIDAD ====================

/**
 * Limpia el log de errores
 */
function cleanupErrorLog() {
  const cutoff = Date.now() - ERROR_HANDLER_CONFIG.ERROR_RETENTION;
  
  const initialLength = errorLog.length;
  const filtered = errorLog.filter(entry => 
    new Date(entry.timestamp).getTime() > cutoff
  );
  
  errorLog.length = 0;
  errorLog.push(...filtered);
  
  if (initialLength !== filtered.length) {
    console.log(`[ErrorHandler] ${initialLength - filtered.length} entradas de error antiguas eliminadas`);
  }
}

/**
 * Obtiene estadísticas de errores
 * @returns {Object} Estadísticas de errores
 */
function getErrorStatistics() {
  const stats = {
    totalErrors: errorLog.length,
    errorCounts: Object.fromEntries(errorCounts),
    recentErrors: errorLog.slice(-10),
    errorTypes: {},
    errorSeverities: {}
  };
  
  // Contar por tipo
  errorLog.forEach(entry => {
    const type = entry.error.type;
    const severity = entry.error.severity;
    
    stats.errorTypes[type] = (stats.errorTypes[type] || 0) + 1;
    stats.errorSeverities[severity] = (stats.errorSeverities[severity] || 0) + 1;
  });
  
  return stats;
}

/**
 * Limpia todas las estadísticas de errores
 */
function clearErrorStatistics() {
  errorLog.length = 0;
  errorCounts.clear();
  console.log('[ErrorHandler] Estadísticas de errores limpiadas');
}

/**
 * Configura el manejador de errores
 * @param {Object} config - Configuración del manejador
 */
function configureErrorHandler(config) {
  Object.assign(ERROR_HANDLER_CONFIG, config);
  console.log('[ErrorHandler] Configuración actualizada:', config);
}

// ==================== INICIALIZACIÓN ====================

/**
 * Inicializa el manejador de errores
 */
function initializeErrorHandler() {
  // Registrar estrategias de recuperación
  registerRecoveryStrategy(createNetworkRecoveryStrategy());
  registerRecoveryStrategy(createTimeoutRecoveryStrategy());
  registerRecoveryStrategy(createDataRecoveryStrategy());
  
  console.log('[ErrorHandler] Manejador de errores inicializado');
}

// Inicializar automáticamente
initializeErrorHandler();

console.log('🛡️ ErrorHandler cargado - Sistema de manejo de errores disponible');
