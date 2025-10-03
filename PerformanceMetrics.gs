/**
 * @fileoverview Sistema de métricas de rendimiento para validar optimizaciones
 * Mide y reporta tiempos de ejecución de operaciones críticas
 */

// ==================== CLASE DE MÉTRICAS DE RENDIMIENTO ====================

/**
 * Sistema de métricas de rendimiento
 * Permite medir, registrar y analizar tiempos de ejecución
 */
class PerformanceMetrics {
  constructor() {
    // Inicializar propiedades estáticas si no existen
    if (!PerformanceMetrics.measurements) {
      PerformanceMetrics.measurements = new Map();
    }
    if (!PerformanceMetrics.thresholds) {
      PerformanceMetrics.thresholds = {
        EXCELLENT: 1000,    // < 1 segundo
        GOOD: 3000,         // < 3 segundos
        ACCEPTABLE: 5000,   // < 5 segundos
        SLOW: 10000,        // < 10 segundos
        CRITICAL: 15000     // < 15 segundos
      };
    }
  }
  
  // Métodos estáticos
  static getMeasurements() {
    if (!PerformanceMetrics.measurements) {
      PerformanceMetrics.measurements = new Map();
    }
    return PerformanceMetrics.measurements;
  }
  
  static getThresholds() {
    if (!PerformanceMetrics.thresholds) {
      PerformanceMetrics.thresholds = {
        EXCELLENT: 1000,    // < 1 segundo
        GOOD: 3000,         // < 3 segundos
        ACCEPTABLE: 5000,   // < 5 segundos
        SLOW: 10000,        // < 10 segundos
        CRITICAL: 15000     // < 15 segundos
      };
    }
    return PerformanceMetrics.thresholds;
  }
  
  /**
   * Inicia medición de una operación
   * @param {string} operation - Nombre de la operación
   */
  static start(operation) {
    PerformanceMetrics.getMeasurements().set(operation, {
      start: Date.now(),
      operation: operation,
      status: 'running'
    });
    console.log(`[PERF] 🚀 Iniciando: ${operation}`);
  }
  
  /**
   * Finaliza medición de una operación
   * @param {string} operation - Nombre de la operación
   * @returns {number|null} Duración en milisegundos
   */
  static end(operation) {
    const measurement = PerformanceMetrics.getMeasurements().get(operation);
    if (!measurement) {
      console.warn(`[PERF] ⚠️ Operación no encontrada: ${operation}`);
      return null;
    }
    
    measurement.end = Date.now();
    measurement.duration = measurement.end - measurement.start;
    measurement.status = 'completed';
    
    // Determinar nivel de rendimiento
    const level = PerformanceMetrics.getPerformanceLevel(measurement.duration);
    const emoji = PerformanceMetrics.getPerformanceEmoji(measurement.duration);
    
    // Log automático con nivel de rendimiento
    console.log(`[PERF] ${emoji} ${operation}: ${measurement.duration}ms (${level})`);
    
    // Guardar en Properties para análisis histórico
    this.saveMetric(operation, measurement.duration, level);
    
    return measurement.duration;
  }
  
  /**
   * Determina el nivel de rendimiento basado en la duración
   * @param {number} duration - Duración en milisegundos
   * @returns {string} Nivel de rendimiento
   */
  static getPerformanceLevel(duration) {
    const thresholds = PerformanceMetrics.getThresholds();
    if (duration < thresholds.EXCELLENT) return 'EXCELLENT';
    if (duration < thresholds.GOOD) return 'GOOD';
    if (duration < thresholds.ACCEPTABLE) return 'ACCEPTABLE';
    if (duration < thresholds.SLOW) return 'SLOW';
    if (duration < thresholds.CRITICAL) return 'CRITICAL';
    return 'UNACCEPTABLE';
  }
  
  /**
   * Obtiene emoji basado en el rendimiento
   * @param {number} duration - Duración en milisegundos
   * @returns {string} Emoji representativo
   */
  static getPerformanceEmoji(duration) {
    const thresholds = PerformanceMetrics.getThresholds();
    if (duration < thresholds.EXCELLENT) return '🚀';
    if (duration < thresholds.GOOD) return '✅';
    if (duration < thresholds.ACCEPTABLE) return '👍';
    if (duration < thresholds.SLOW) return '⚠️';
    if (duration < thresholds.CRITICAL) return '🐌';
    return '❌';
  }
  
  /**
   * Guarda métrica en Properties para análisis histórico
   * @param {string} operation - Nombre de la operación
   * @param {number} duration - Duración en milisegundos
   * @param {string} level - Nivel de rendimiento
   */
  static saveMetric(operation, duration, level) {
    try {
      const props = PropertiesService.getScriptProperties();
      const timestamp = new Date().toISOString();
      const key = `METRIC_${operation}_${timestamp}`;
      
      const metricData = {
        operation: operation,
        duration: duration,
        level: level,
        timestamp: timestamp,
        date: new Date().toDateString()
      };
      
      props.setProperty(key, JSON.stringify(metricData));
      
      // Limpiar métricas antiguas (mantener solo últimas 100)
      this.cleanupOldMetrics();
      
    } catch(e) {
      console.warn('[PERF] ⚠️ No se pudo guardar métrica:', e);
    }
  }
  
  /**
   * Limpia métricas antiguas para evitar acumulación
   */
  static cleanupOldMetrics() {
    try {
      const props = PropertiesService.getScriptProperties();
      const allProps = props.getProperties();
      const metricKeys = Object.keys(allProps).filter(key => key.startsWith('METRIC_'));
      
      if (metricKeys.length > 100) {
        // Ordenar por timestamp y eliminar las más antiguas
        const sortedKeys = metricKeys.sort((a, b) => {
          const timestampA = a.split('_').pop();
          const timestampB = b.split('_').pop();
          return new Date(timestampA) - new Date(timestampB);
        });
        
        const keysToDelete = sortedKeys.slice(0, metricKeys.length - 100);
        keysToDelete.forEach(key => props.deleteProperty(key));
        
        console.log(`[PERF] 🧹 Limpiadas ${keysToDelete.length} métricas antiguas`);
      }
    } catch(e) {
      // No bloquear si falla la limpieza
    }
  }
  
  /**
   * Genera reporte de rendimiento actual
   * @returns {Array} Array de resultados de rendimiento
   */
  static report() {
    const results = [];
    PerformanceMetrics.getMeasurements().forEach((value, key) => {
      if (value.duration) {
        const level = PerformanceMetrics.getPerformanceLevel(value.duration);
        const emoji = PerformanceMetrics.getPerformanceEmoji(value.duration);
        
        results.push({
          operation: key,
          duration: value.duration,
          level: level,
          status: emoji,
          startTime: new Date(value.start).toLocaleTimeString(),
          endTime: new Date(value.end).toLocaleTimeString()
        });
      }
    });
    
    // Ordenar por duración (más lento primero)
    results.sort((a, b) => b.duration - a.duration);
    
    console.log('\n📊 REPORTE DE RENDIMIENTO:');
    console.table(results);
    
    return results;
  }
  
  /**
   * Genera reporte histórico de métricas
   * @param {string} operation - Operación específica (opcional)
   * @param {number} days - Días hacia atrás (default: 7)
   * @returns {Array} Métricas históricas
   */
  static getHistoricalReport(operation = null, days = 7) {
    try {
      const props = PropertiesService.getScriptProperties();
      const allProps = props.getProperties();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const metricKeys = Object.keys(allProps).filter(key => {
        if (!key.startsWith('METRIC_')) return false;
        if (operation && !key.includes(operation)) return false;
        
        const timestamp = key.split('_').pop();
        return new Date(timestamp) > cutoffDate;
      });
      
      const metrics = metricKeys.map(key => {
        try {
          return JSON.parse(allProps[key]);
        } catch(e) {
          return null;
        }
      }).filter(metric => metric !== null);
      
      // Agrupar por operación y calcular promedios
      const grouped = {};
      metrics.forEach(metric => {
        if (!grouped[metric.operation]) {
          grouped[metric.operation] = [];
        }
        grouped[metric.operation].push(metric.duration);
      });
      
      const summary = Object.keys(grouped).map(op => {
        const durations = grouped[op];
        const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
        const min = Math.min(...durations);
        const max = Math.max(...durations);
        
        return {
          operation: op,
          count: durations.length,
          average: Math.round(avg),
          min: min,
          max: max,
          level: this.getPerformanceLevel(avg)
        };
      });
      
      console.log(`\n📈 REPORTE HISTÓRICO (${days} días):`);
      console.table(summary);
      
      return summary;
    } catch(e) {
      console.error('[PERF] ❌ Error generando reporte histórico:', e);
      return [];
    }
  }
  
  /**
   * Valida si se cumplen los objetivos de rendimiento
   * @returns {Object} Resultado de validación
   */
  static validateObjectives() {
    const results = this.report();
    const objectives = {
      'TOTAL_DASHBOARD_LOAD': 15000,  // 15 segundos
      'CACHE_CHECK': 1000,           // 1 segundo
      'SHEETS_LOAD': 10000,          // 10 segundos
      'getEstadisticasRapidas': 5000, // 5 segundos
      'getListaDeLideres': 3000,     // 3 segundos
      'getDashboardDataConsolidated': 15000 // 15 segundos
    };
    
    const validation = {
      passed: 0,
      failed: 0,
      details: []
    };
    
    results.forEach(result => {
      const objective = objectives[result.operation];
      if (objective) {
        const passed = result.duration <= objective;
        validation.details.push({
          operation: result.operation,
          duration: result.duration,
          objective: objective,
          passed: passed,
          status: passed ? '✅' : '❌'
        });
        
        if (passed) validation.passed++;
        else validation.failed++;
      }
    });
    
    console.log('\n🎯 VALIDACIÓN DE OBJETIVOS:');
    console.table(validation.details);
    
    const totalTests = validation.passed + validation.failed;
    const successRate = totalTests > 0 ? (validation.passed / totalTests * 100).toFixed(1) : 0;
    
    console.log(`\n📊 RESUMEN: ${validation.passed}/${totalTests} objetivos cumplidos (${successRate}%)`);
    
    if (validation.failed === 0) {
      console.log('🎉 ¡TODOS LOS OBJETIVOS CUMPLIDOS!');
    } else {
      console.log('⚠️ Algunos objetivos necesitan optimización');
    }
    
    return validation;
  }
  
  /**
   * Limpia todas las mediciones actuales
   */
  static clear() {
    PerformanceMetrics.getMeasurements().clear();
    console.log('[PERF] 🧹 Mediciones limpiadas');
  }
}

// ==================== FUNCIONES DE PRUEBA Y VALIDACIÓN ====================

/**
 * Función de prueba completa del sistema de métricas
 * @returns {Array} Reporte de rendimiento
 */
function testPerformanceMetrics() {
  console.log('\n🧪 INICIANDO PRUEBA DE MÉTRICAS DE RENDIMIENTO...\n');
  
  PerformanceMetrics.clear();
  
  // Medir carga total del dashboard
  PerformanceMetrics.start('TOTAL_DASHBOARD_LOAD');
  
  // Medir verificación de caché
  PerformanceMetrics.start('CACHE_CHECK');
  try {
    const cache = CacheService.getScriptCache();
    const cached = cache.get('DASHBOARD_CONSOLIDATED_V1');
    if (cached) {
      console.log('[PERF] Cache HIT detectado');
    } else {
      console.log('[PERF] Cache MISS detectado');
    }
  } catch(e) {
    console.log('[PERF] Error verificando caché:', e);
  }
  PerformanceMetrics.end('CACHE_CHECK');
  
  // Medir carga desde Sheets
  PerformanceMetrics.start('SHEETS_LOAD');
  try {
    const result = getDashboardDataConsolidated();
    if (result && result.success) {
      console.log('[PERF] Dashboard cargado exitosamente');
    } else {
      console.log('[PERF] Error cargando dashboard:', result?.error);
    }
  } catch(e) {
    console.log('[PERF] Excepción cargando dashboard:', e);
  }
  PerformanceMetrics.end('SHEETS_LOAD');
  
  // Medir funciones individuales
  PerformanceMetrics.start('getEstadisticasRapidas');
  try {
    const stats = getEstadisticasRapidas();
    if (stats && stats.success) {
      console.log('[PERF] Estadísticas obtenidas');
    }
  } catch(e) {
    console.log('[PERF] Error obteniendo estadísticas:', e);
  }
  PerformanceMetrics.end('getEstadisticasRapidas');
  
  PerformanceMetrics.start('getListaDeLideres');
  try {
    const lideres = getListaDeLideres();
    if (lideres && lideres.success) {
      console.log('[PERF] Lista de líderes obtenida');
    }
  } catch(e) {
    console.log('[PERF] Error obteniendo líderes:', e);
  }
  PerformanceMetrics.end('getListaDeLideres');
  
  // Finalizar medición total
  PerformanceMetrics.end('TOTAL_DASHBOARD_LOAD');
  
  // Generar reportes
  const report = PerformanceMetrics.report();
  const validation = PerformanceMetrics.validateObjectives();
  
  return {
    report: report,
    validation: validation,
    summary: {
      totalOperations: report.length,
      averageTime: report.reduce((sum, r) => sum + r.duration, 0) / report.length,
      objectivesPassed: validation.passed,
      objectivesFailed: validation.failed
    }
  };
}

/**
 * Función de prueba de rendimiento comparativo
 * Compara rendimiento entre sistema antiguo y nuevo
 * @returns {Object} Comparación de rendimiento
 */
function comparePerformanceOldVsNew() {
  console.log('\n🔄 COMPARACIÓN DE RENDIMIENTO: ANTIGUO vs NUEVO\n');
  
  const results = {
    old: {},
    new: {},
    improvement: {}
  };
  
  // Probar sistema nuevo (consolidado)
  console.log('📊 Probando sistema NUEVO (consolidado)...');
  PerformanceMetrics.clear();
  
  PerformanceMetrics.start('NEW_TOTAL');
  try {
    const newResult = getDashboardDataConsolidated();
    PerformanceMetrics.end('NEW_TOTAL');
    
    if (newResult && newResult.success) {
      results.new.total = PerformanceMetrics.measurements.get('NEW_TOTAL')?.duration || 0;
      console.log(`✅ Sistema nuevo: ${results.new.total}ms`);
    }
  } catch(e) {
    console.log('❌ Error en sistema nuevo:', e);
  }
  
  // Probar sistema antiguo (múltiples llamadas)
  console.log('\n📊 Probando sistema ANTIGUO (múltiples llamadas)...');
  PerformanceMetrics.clear();
  
  PerformanceMetrics.start('OLD_TOTAL');
  try {
    // Simular llamadas múltiples del sistema antiguo
    PerformanceMetrics.start('OLD_STATS');
    getEstadisticasRapidas();
    PerformanceMetrics.end('OLD_STATS');
    
    PerformanceMetrics.start('OLD_LIDERES');
    getListaDeLideres();
    PerformanceMetrics.end('OLD_LIDERES');
    
    PerformanceMetrics.start('OLD_DASHBOARD');
    getDashboardData();
    PerformanceMetrics.end('OLD_DASHBOARD');
    
    PerformanceMetrics.end('OLD_TOTAL');
    
    results.old.total = PerformanceMetrics.measurements.get('OLD_TOTAL')?.duration || 0;
    results.old.stats = PerformanceMetrics.measurements.get('OLD_STATS')?.duration || 0;
    results.old.lideres = PerformanceMetrics.measurements.get('OLD_LIDERES')?.duration || 0;
    results.old.dashboard = PerformanceMetrics.measurements.get('OLD_DASHBOARD')?.duration || 0;
    
    console.log(`✅ Sistema antiguo: ${results.old.total}ms`);
  } catch(e) {
    console.log('❌ Error en sistema antiguo:', e);
  }
  
  // Calcular mejoras
  if (results.new.total && results.old.total) {
    results.improvement.absolute = results.old.total - results.new.total;
    results.improvement.percentage = ((results.old.total - results.new.total) / results.old.total * 100).toFixed(1);
    
    console.log('\n📈 RESULTADOS DE LA COMPARACIÓN:');
    console.log(`Sistema Antiguo: ${results.old.total}ms`);
    console.log(`Sistema Nuevo: ${results.new.total}ms`);
    console.log(`Mejora Absoluta: ${results.improvement.absolute}ms`);
    console.log(`Mejora Relativa: ${results.improvement.percentage}%`);
    
    if (results.improvement.percentage > 0) {
      console.log('🎉 ¡OPTIMIZACIÓN EXITOSA!');
    } else {
      console.log('⚠️ Necesita más optimización');
    }
  }
  
  return results;
}

/**
 * Función de monitoreo continuo
 * Ejecuta pruebas periódicas y genera alertas
 * @returns {Object} Estado del sistema
 */
function monitorSystemPerformance() {
  console.log('\n🔍 MONITOREO CONTINUO DEL SISTEMA...\n');
  
  const testResult = testPerformanceMetrics();
  const validation = testResult.validation;
  
  const status = {
    timestamp: new Date().toISOString(),
    overallHealth: validation.failed === 0 ? 'HEALTHY' : 'NEEDS_ATTENTION',
    criticalIssues: [],
    recommendations: []
  };
  
  // Identificar problemas críticos
  validation.details.forEach(detail => {
    if (!detail.passed) {
      status.criticalIssues.push({
        operation: detail.operation,
        duration: detail.duration,
        objective: detail.objective,
        excess: detail.duration - detail.objective
      });
    }
  });
  
  // Generar recomendaciones
  if (status.criticalIssues.length > 0) {
    status.recommendations.push('Revisar operaciones que exceden objetivos de rendimiento');
  }
  
  if (testResult.summary.averageTime > 10000) {
    status.recommendations.push('Considerar optimizaciones adicionales de caché');
  }
  
  if (validation.failed > validation.passed) {
    status.recommendations.push('Revisar arquitectura general del sistema');
  }
  
  console.log('\n🏥 ESTADO DEL SISTEMA:');
  console.log(`Salud General: ${status.overallHealth}`);
  console.log(`Problemas Críticos: ${status.criticalIssues.length}`);
  console.log(`Recomendaciones: ${status.recommendations.length}`);
  
  if (status.criticalIssues.length > 0) {
    console.log('\n⚠️ PROBLEMAS DETECTADOS:');
    status.criticalIssues.forEach(issue => {
      console.log(`- ${issue.operation}: ${issue.duration}ms (objetivo: ${issue.objective}ms, exceso: ${issue.excess}ms)`);
    });
  }
  
  if (status.recommendations.length > 0) {
    console.log('\n💡 RECOMENDACIONES:');
    status.recommendations.forEach(rec => {
      console.log(`- ${rec}`);
    });
  }
  
  return status;
}
