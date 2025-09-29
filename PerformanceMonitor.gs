/**
 * PERFORMANCE MONITOR - SISTEMA DE MONITOREO DE RENDIMIENTO
 * Etapa 3 - Semana 3: Monitoreo avanzado de rendimiento y métricas
 * 
 * Este módulo implementa un sistema completo de monitoreo que:
 * - Registra métricas de rendimiento en tiempo real
 * - Detecta cuellos de botella automáticamente
 * - Genera alertas de rendimiento
 * - Proporciona dashboards de métricas
 */

// ==================== CONFIGURACIÓN DEL MONITOR ====================

const PERFORMANCE_MONITOR_CONFIG = {
  ENABLE_MONITORING: true,
  ENABLE_ALERTS: true,
  ENABLE_DASHBOARD: true,
  METRICS_RETENTION: 24 * 60 * 60 * 1000, // 24 horas
  ALERT_THRESHOLDS: {
    SLOW_OPERATION: 5000, // 5 segundos
    HIGH_MEMORY_USAGE: 80, // 80%
    HIGH_ERROR_RATE: 10, // 10%
    LOW_CACHE_HIT_RATE: 70 // 70%
  },
  CLEANUP_INTERVAL: 60 * 60 * 1000, // 1 hora
  DASHBOARD_REFRESH: 30 * 1000 // 30 segundos
};

// ==================== ESTRUCTURAS DE DATOS ====================

const performanceMetrics = new Map();
const performanceAlerts = [];
const performanceHistory = [];

// ==================== CLASE DE MÉTRICA DE RENDIMIENTO ====================

class PerformanceMetric {
  constructor(operation, startTime, endTime, metadata = {}) {
    this.operation = operation;
    this.startTime = startTime;
    this.endTime = endTime;
    this.duration = endTime - startTime;
    this.metadata = metadata;
    this.timestamp = new Date().toISOString();
    this.success = true;
    this.error = null;
  }

  setError(error) {
    this.success = false;
    this.error = error.toString();
  }

  toJSON() {
    return {
      operation: this.operation,
      duration: this.duration,
      success: this.success,
      error: this.error,
      metadata: this.metadata,
      timestamp: this.timestamp
    };
  }
}

// ==================== CLASE DE ALERTA DE RENDIMIENTO ====================

class PerformanceAlert {
  constructor(type, message, severity, metric, threshold) {
    this.type = type;
    this.message = message;
    this.severity = severity; // 'low', 'medium', 'high', 'critical'
    this.metric = metric;
    this.threshold = threshold;
    this.timestamp = new Date().toISOString();
    this.acknowledged = false;
    this.resolved = false;
  }

  toJSON() {
    return {
      type: this.type,
      message: this.message,
      severity: this.severity,
      metric: this.metric,
      threshold: this.threshold,
      timestamp: this.timestamp,
      acknowledged: this.acknowledged,
      resolved: this.resolved
    };
  }
}

// ==================== FUNCIONES PRINCIPALES DEL MONITOR ====================

/**
 * Inicia el monitoreo de una operación
 * @param {string} operation - Nombre de la operación
 * @param {Object} metadata - Metadatos adicionales
 * @returns {string} ID de la operación para finalizar
 */
function startPerformanceMonitoring(operation, metadata = {}) {
  if (!PERFORMANCE_MONITOR_CONFIG.ENABLE_MONITORING) {
    return null;
  }

  const operationId = `${operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();
  
  performanceMetrics.set(operationId, {
    operation,
    startTime,
    metadata,
    status: 'running'
  });
  
  return operationId;
}

/**
 * Finaliza el monitoreo de una operación
 * @param {string} operationId - ID de la operación
 * @param {Error} error - Error si ocurrió
 * @returns {PerformanceMetric} Métrica de rendimiento
 */
function endPerformanceMonitoring(operationId, error = null) {
  if (!PERFORMANCE_MONITOR_CONFIG.ENABLE_MONITORING || !operationId) {
    return null;
  }

  const operation = performanceMetrics.get(operationId);
  if (!operation) {
    console.warn('[PerformanceMonitor] Operación no encontrada:', operationId);
    return null;
  }

  const endTime = Date.now();
  const metric = new PerformanceMetric(
    operation.operation,
    operation.startTime,
    endTime,
    operation.metadata
  );

  if (error) {
    metric.setError(error);
  }

  // Registrar la métrica
  recordPerformanceMetric(metric);
  
  // Verificar alertas
  if (PERFORMANCE_MONITOR_CONFIG.ENABLE_ALERTS) {
    checkPerformanceAlerts(metric);
  }

  // Limpiar la operación en curso
  performanceMetrics.delete(operationId);
  
  return metric;
}

/**
 * Registra una métrica de rendimiento
 * @param {PerformanceMetric} metric - Métrica a registrar
 */
function recordPerformanceMetric(metric) {
  try {
    // Agregar a la historia
    performanceHistory.push(metric);
    
    // Limpiar historia antigua
    cleanupPerformanceHistory();
    
    // Actualizar estadísticas por operación
    updateOperationStats(metric);
    
    console.log(`[PerformanceMonitor] Métrica registrada: ${metric.operation} (${metric.duration}ms)`);
    
  } catch (error) {
    console.error('[PerformanceMonitor] Error registrando métrica:', error);
  }
}

/**
 * Actualiza estadísticas por operación
 * @param {PerformanceMetric} metric - Métrica a procesar
 */
function updateOperationStats(metric) {
  const operation = metric.operation;
  
  if (!performanceMetrics.has(operation)) {
    performanceMetrics.set(operation, {
      totalCalls: 0,
      totalDuration: 0,
      averageDuration: 0,
      minDuration: Infinity,
      maxDuration: 0,
      successCount: 0,
      errorCount: 0,
      lastCall: null,
      recentCalls: []
    });
  }
  
  const stats = performanceMetrics.get(operation);
  stats.totalCalls++;
  stats.totalDuration += metric.duration;
  stats.averageDuration = stats.totalDuration / stats.totalCalls;
  stats.minDuration = Math.min(stats.minDuration, metric.duration);
  stats.maxDuration = Math.max(stats.maxDuration, metric.duration);
  stats.lastCall = metric.timestamp;
  
  if (metric.success) {
    stats.successCount++;
  } else {
    stats.errorCount++;
  }
  
  // Mantener historial reciente (últimas 100 llamadas)
  stats.recentCalls.push(metric);
  if (stats.recentCalls.length > 100) {
    stats.recentCalls.shift();
  }
  
  performanceMetrics.set(operation, stats);
}

// ==================== SISTEMA DE ALERTAS ====================

/**
 * Verifica alertas de rendimiento
 * @param {PerformanceMetric} metric - Métrica a verificar
 */
function checkPerformanceAlerts(metric) {
  try {
    // Alerta de operación lenta
    if (metric.duration > PERFORMANCE_MONITOR_CONFIG.ALERT_THRESHOLDS.SLOW_OPERATION) {
      createPerformanceAlert(
        'SLOW_OPERATION',
        `Operación lenta detectada: ${metric.operation} (${metric.duration}ms)`,
        'medium',
        metric,
        PERFORMANCE_MONITOR_CONFIG.ALERT_THRESHOLDS.SLOW_OPERATION
      );
    }
    
    // Alerta de error
    if (!metric.success) {
      createPerformanceAlert(
        'OPERATION_ERROR',
        `Error en operación: ${metric.operation} - ${metric.error}`,
        'high',
        metric,
        0
      );
    }
    
    // Verificar tasa de error por operación
    const stats = performanceMetrics.get(metric.operation);
    if (stats && stats.totalCalls > 10) {
      const errorRate = (stats.errorCount / stats.totalCalls) * 100;
      if (errorRate > PERFORMANCE_MONITOR_CONFIG.ALERT_THRESHOLDS.HIGH_ERROR_RATE) {
        createPerformanceAlert(
          'HIGH_ERROR_RATE',
          `Alta tasa de error en ${metric.operation}: ${errorRate.toFixed(1)}%`,
          'high',
          metric,
          PERFORMANCE_MONITOR_CONFIG.ALERT_THRESHOLDS.HIGH_ERROR_RATE
        );
      }
    }
    
  } catch (error) {
    console.error('[PerformanceMonitor] Error verificando alertas:', error);
  }
}

/**
 * Crea una alerta de rendimiento
 * @param {string} type - Tipo de alerta
 * @param {string} message - Mensaje de la alerta
 * @param {string} severity - Severidad de la alerta
 * @param {PerformanceMetric} metric - Métrica relacionada
 * @param {number} threshold - Umbral que se superó
 */
function createPerformanceAlert(type, message, severity, metric, threshold) {
  const alert = new PerformanceAlert(type, message, severity, metric, threshold);
  performanceAlerts.push(alert);
  
  console.warn(`[PerformanceMonitor] ALERTA ${severity.toUpperCase()}: ${message}`);
  
  // Limpiar alertas antiguas
  cleanupPerformanceAlerts();
}

// ==================== DASHBOARD DE RENDIMIENTO ====================

/**
 * Obtiene el dashboard de rendimiento
 * @returns {Object} Dashboard de rendimiento
 */
function getPerformanceDashboard() {
  if (!PERFORMANCE_MONITOR_CONFIG.ENABLE_DASHBOARD) {
    return { message: 'Dashboard deshabilitado' };
  }

  try {
    const now = Date.now();
    const oneHourAgo = now - (60 * 60 * 1000);
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    // Filtrar métricas recientes
    const recentMetrics = performanceHistory.filter(m => 
      new Date(m.timestamp).getTime() > oneHourAgo
    );
    
    const dailyMetrics = performanceHistory.filter(m => 
      new Date(m.timestamp).getTime() > oneDayAgo
    );
    
    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalOperations: performanceMetrics.size,
        recentCalls: recentMetrics.length,
        dailyCalls: dailyMetrics.length,
        activeAlerts: performanceAlerts.filter(a => !a.resolved).length
      },
      performance: {
        averageResponseTime: calculateAverageResponseTime(recentMetrics),
        successRate: calculateSuccessRate(recentMetrics),
        topSlowOperations: getTopSlowOperations(10),
        errorRate: calculateErrorRate(recentMetrics)
      },
      alerts: {
        active: performanceAlerts.filter(a => !a.resolved).slice(-10),
        recent: performanceAlerts.slice(-20)
      },
      operations: getOperationSummary(),
      trends: calculateTrends(dailyMetrics)
    };
    
  } catch (error) {
    console.error('[PerformanceMonitor] Error generando dashboard:', error);
    return { error: error.toString() };
  }
}

/**
 * Calcula el tiempo de respuesta promedio
 * @param {Array} metrics - Métricas a analizar
 * @returns {number} Tiempo promedio en ms
 */
function calculateAverageResponseTime(metrics) {
  if (metrics.length === 0) return 0;
  
  const totalDuration = metrics.reduce((sum, m) => sum + m.duration, 0);
  return Math.round(totalDuration / metrics.length);
}

/**
 * Calcula la tasa de éxito
 * @param {Array} metrics - Métricas a analizar
 * @returns {number} Tasa de éxito en porcentaje
 */
function calculateSuccessRate(metrics) {
  if (metrics.length === 0) return 0;
  
  const successCount = metrics.filter(m => m.success).length;
  return Math.round((successCount / metrics.length) * 100);
}

/**
 * Calcula la tasa de error
 * @param {Array} metrics - Métricas a analizar
 * @returns {number} Tasa de error en porcentaje
 */
function calculateErrorRate(metrics) {
  if (metrics.length === 0) return 0;
  
  const errorCount = metrics.filter(m => !m.success).length;
  return Math.round((errorCount / metrics.length) * 100);
}

/**
 * Obtiene las operaciones más lentas
 * @param {number} limit - Número máximo de operaciones
 * @returns {Array} Operaciones más lentas
 */
function getTopSlowOperations(limit = 10) {
  const operations = Array.from(performanceMetrics.entries())
    .map(([operation, stats]) => ({
      operation,
      averageDuration: stats.averageDuration,
      maxDuration: stats.maxDuration,
      totalCalls: stats.totalCalls
    }))
    .sort((a, b) => b.averageDuration - a.averageDuration)
    .slice(0, limit);
  
  return operations;
}

/**
 * Obtiene resumen de operaciones
 * @returns {Object} Resumen de operaciones
 */
function getOperationSummary() {
  const operations = {};
  
  for (const [operation, stats] of performanceMetrics) {
    operations[operation] = {
      totalCalls: stats.totalCalls,
      averageDuration: Math.round(stats.averageDuration),
      minDuration: stats.minDuration === Infinity ? 0 : stats.minDuration,
      maxDuration: stats.maxDuration,
      successRate: Math.round((stats.successCount / stats.totalCalls) * 100),
      lastCall: stats.lastCall
    };
  }
  
  return operations;
}

/**
 * Calcula tendencias de rendimiento
 * @param {Array} metrics - Métricas diarias
 * @returns {Object} Tendencias calculadas
 */
function calculateTrends(metrics) {
  if (metrics.length < 2) {
    return { message: 'Datos insuficientes para calcular tendencias' };
  }
  
  // Agrupar por hora
  const hourlyData = {};
  metrics.forEach(metric => {
    const hour = new Date(metric.timestamp).getHours();
    if (!hourlyData[hour]) {
      hourlyData[hour] = [];
    }
    hourlyData[hour].push(metric);
  });
  
  // Calcular promedios por hora
  const hourlyAverages = {};
  Object.keys(hourlyData).forEach(hour => {
    const hourMetrics = hourlyData[hour];
    const avgDuration = hourMetrics.reduce((sum, m) => sum + m.duration, 0) / hourMetrics.length;
    const successRate = (hourMetrics.filter(m => m.success).length / hourMetrics.length) * 100;
    
    hourlyAverages[hour] = {
      averageDuration: Math.round(avgDuration),
      successRate: Math.round(successRate),
      callCount: hourMetrics.length
    };
  });
  
  return {
    hourly: hourlyAverages,
    peakHour: Object.keys(hourlyAverages).reduce((a, b) => 
      hourlyAverages[a].callCount > hourlyAverages[b].callCount ? a : b
    ),
    averageCallsPerHour: Math.round(metrics.length / 24)
  };
}

// ==================== FUNCIONES DE LIMPIEZA ====================

/**
 * Limpia el historial de rendimiento
 */
function cleanupPerformanceHistory() {
  const cutoff = Date.now() - PERFORMANCE_MONITOR_CONFIG.METRICS_RETENTION;
  
  const initialLength = performanceHistory.length;
  const filtered = performanceHistory.filter(metric => 
    new Date(metric.timestamp).getTime() > cutoff
  );
  
  performanceHistory.length = 0;
  performanceHistory.push(...filtered);
  
  if (initialLength !== filtered.length) {
    console.log(`[PerformanceMonitor] ${initialLength - filtered.length} métricas antiguas eliminadas`);
  }
}

/**
 * Limpia alertas antiguas
 */
function cleanupPerformanceAlerts() {
  const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 horas
  
  const initialLength = performanceAlerts.length;
  const filtered = performanceAlerts.filter(alert => 
    new Date(alert.timestamp).getTime() > cutoff
  );
  
  performanceAlerts.length = 0;
  performanceAlerts.push(...filtered);
  
  if (initialLength !== filtered.length) {
    console.log(`[PerformanceMonitor] ${initialLength - filtered.length} alertas antiguas eliminadas`);
  }
}

// ==================== FUNCIONES DE UTILIDAD ====================

/**
 * Obtiene métricas de rendimiento
 * @returns {Object} Métricas de rendimiento
 */
function getPerformanceMetrics() {
  return {
    operations: Object.fromEntries(performanceMetrics),
    alerts: performanceAlerts.map(a => a.toJSON()),
    history: performanceHistory.slice(-100), // Últimas 100 métricas
    summary: {
      totalOperations: performanceMetrics.size,
      totalAlerts: performanceAlerts.length,
      activeAlerts: performanceAlerts.filter(a => !a.resolved).length,
      historySize: performanceHistory.length
    }
  };
}

/**
 * Limpia todas las métricas de rendimiento
 */
function clearPerformanceMetrics() {
  performanceMetrics.clear();
  performanceAlerts.length = 0;
  performanceHistory.length = 0;
  
  console.log('[PerformanceMonitor] Todas las métricas limpiadas');
}

/**
 * Configura el monitor de rendimiento
 * @param {Object} config - Configuración del monitor
 */
function configurePerformanceMonitor(config) {
  Object.assign(PERFORMANCE_MONITOR_CONFIG, config);
  console.log('[PerformanceMonitor] Configuración actualizada:', config);
}

/**
 * Programa la limpieza automática
 */
function schedulePerformanceCleanup() {
  cleanupPerformanceHistory();
  cleanupPerformanceAlerts();
}

console.log('📊 PerformanceMonitor cargado - Sistema de monitoreo disponible');
