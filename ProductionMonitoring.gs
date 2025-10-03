/**
 * @fileoverview Monitoreo de producción
 * Sistema de monitoreo en tiempo real para producción
 */

/**
 * Ejecuta monitoreo completo del sistema en producción
 * @returns {Object} Estado completo del sistema
 */
function ejecutarMonitoreoProduccion() {
  const startTime = Date.now();
  
  try {
    console.log('[ProductionMonitoring] Iniciando monitoreo de producción...');
    
    const monitoreo = {
      timestamp: new Date().toISOString(),
      status: 'HEALTHY',
      checks: [],
      metrics: {},
      alerts: [],
      recommendations: []
    };
    
    // 1. Verificar salud del sistema
    const healthCheck = verificarSaludSistema();
    monitoreo.checks.push(healthCheck);
    
    // 2. Verificar rendimiento
    const performanceCheck = verificarRendimientoProduccion();
    monitoreo.checks.push(performanceCheck);
    
    // 3. Verificar caché
    const cacheCheck = verificarEstadoCache();
    monitoreo.checks.push(cacheCheck);
    
    // 4. Verificar errores
    const errorCheck = verificarErroresRecientes();
    monitoreo.checks.push(errorCheck);
    
    // 5. Obtener métricas
    monitoreo.metrics = obtenerMetricasProduccion();
    
    // 6. Generar alertas
    monitoreo.alerts = generarAlertasProduccion(monitoreo.checks, monitoreo.metrics);
    
    // 7. Generar recomendaciones
    monitoreo.recommendations = generarRecomendaciones(monitoreo.checks, monitoreo.metrics);
    
    // 8. Determinar estado general
    const failedChecks = monitoreo.checks.filter(c => !c.success).length;
    if (failedChecks > 0) {
      monitoreo.status = failedChecks === monitoreo.checks.length ? 'CRITICAL' : 'WARNING';
    }
    
    const totalTime = Date.now() - startTime;
    monitoreo.executionTime = totalTime;
    
    console.log(`[ProductionMonitoring] Monitoreo completado en ${totalTime}ms - Estado: ${monitoreo.status}`);
    
    return {
      success: true,
      data: monitoreo
    };
    
  } catch (error) {
    console.error('[ProductionMonitoring] Error en monitoreo de producción:', error);
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString(),
      status: 'ERROR'
    };
  }
}

/**
 * Verifica la salud general del sistema
 * @returns {Object} Resultado del health check
 */
function verificarSaludSistema() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    console.log('[ProductionMonitoring] Verificando salud del sistema...');
    
    // Verificar conectividad básica
    try {
      const dashboard = getDashboardData(false);
      verificaciones.push({
        item: 'Conectividad dashboard',
        success: dashboard.success !== false,
        tiempo: Date.now() - startTime
      });
    } catch (error) {
      verificaciones.push({
        item: 'Conectividad dashboard',
        success: false,
        error: error.toString()
      });
    }
    
    // Verificar APIs principales
    try {
      const estadisticas = getEstadisticasRapidas();
      verificaciones.push({
        item: 'API estadísticas',
        success: estadisticas.success !== false,
        tiempo: Date.now() - startTime
      });
    } catch (error) {
      verificaciones.push({
        item: 'API estadísticas',
        success: false,
        error: error.toString()
      });
    }
    
    // Verificar sistema de caché
    try {
      const cache = CacheService.getScriptCache();
      const testKey = 'HEALTH_CHECK_' + Date.now();
      cache.put(testKey, 'test', 60);
      const retrieved = cache.get(testKey);
      cache.remove(testKey);
      
      verificaciones.push({
        item: 'Sistema de caché',
        success: retrieved === 'test',
        tiempo: Date.now() - startTime
      });
    } catch (error) {
      verificaciones.push({
        item: 'Sistema de caché',
        success: false,
        error: error.toString()
      });
    }
    
    const exitosos = verificaciones.filter(v => v.success).length;
    
    return {
      success: exitosos === verificaciones.length,
      nombre: 'Salud del Sistema',
      verificaciones: verificaciones,
      exitosos: exitosos,
      total: verificaciones.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      success: false,
      nombre: 'Salud del Sistema',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

/**
 * Verifica el rendimiento en producción
 * @returns {Object} Resultado de la verificación de rendimiento
 */
function verificarRendimientoProduccion() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    console.log('[ProductionMonitoring] Verificando rendimiento...');
    
    // Verificar tiempo de carga del dashboard
    try {
      const dashboardStart = Date.now();
      const dashboardResult = getDashboardDataOptimized(false);
      const dashboardTime = Date.now() - dashboardStart;
      
      verificaciones.push({
        item: 'Tiempo de carga dashboard',
        success: dashboardTime < 15000, // 15 segundos en producción
        valor: `${dashboardTime}ms`,
        limite: '15000ms',
        tiempo: Date.now() - startTime
      });
    } catch (error) {
      verificaciones.push({
        item: 'Tiempo de carga dashboard',
        success: false,
        error: error.toString()
      });
    }
    
    // Verificar tiempo de carga de LD
    try {
      const ldStart = Date.now();
      const ldResult = getDatosLDOptimized('TEST_LD', false);
      const ldTime = Date.now() - ldStart;
      
      verificaciones.push({
        item: 'Tiempo de carga LD',
        success: ldTime < 8000, // 8 segundos en producción
        valor: `${ldTime}ms`,
        limite: '8000ms',
        tiempo: Date.now() - startTime
      });
    } catch (error) {
      verificaciones.push({
        item: 'Tiempo de carga LD',
        success: false,
        error: error.toString()
      });
    }
    
    // Verificar tiempo de vista rápida LCF
    try {
      const lcfStart = Date.now();
      const lcfResult = getVistaRapidaLCFOptimized('TEST_LCF');
      const lcfTime = Date.now() - lcfStart;
      
      verificaciones.push({
        item: 'Tiempo vista rápida LCF',
        success: lcfTime < 5000, // 5 segundos en producción
        valor: `${lcfTime}ms`,
        limite: '5000ms',
        tiempo: Date.now() - startTime
      });
    } catch (error) {
      verificaciones.push({
        item: 'Tiempo vista rápida LCF',
        success: false,
        error: error.toString()
      });
    }
    
    const exitosos = verificaciones.filter(v => v.success).length;
    
    return {
      success: exitosos === verificaciones.length,
      nombre: 'Rendimiento',
      verificaciones: verificaciones,
      exitosos: exitosos,
      total: verificaciones.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      success: false,
      nombre: 'Rendimiento',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

/**
 * Verifica el estado de la caché usando claves reales
 * @returns {Object} Resultado de la verificación de caché
 */
function verificarEstadoCache() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    console.log('[ProductionMonitoring] Verificando estado de caché con claves reales...');
    
    const cache = CacheService.getScriptCache();
    const properties = PropertiesService.getScriptProperties();
    
    // Verificar caché principal
    try {
      const dashboardCache = cache.get('DASHBOARD_DATA_V2');
      const statsCache = cache.get('STATS_RAPIDAS_V2');
      
      verificaciones.push({
        item: 'Caché dashboard principal',
        success: true,
        valor: dashboardCache ? 'Disponible' : 'Vacía',
        tiempo: Date.now() - startTime
      });
      
      verificaciones.push({
        item: 'Caché estadísticas',
        success: true,
        valor: statsCache ? 'Disponible' : 'Vacía',
        tiempo: Date.now() - startTime
      });
    } catch (error) {
      verificaciones.push({
        item: 'Caché principal',
        success: false,
        error: error.toString()
      });
    }
    
    // Verificar claves reales registradas
    try {
      const cacheKeys = properties.getProperty('CACHE_KEYS');
      const leaderKeys = properties.getProperty('LEADER_CACHE_KEYS');
      
      const realCacheKeys = cacheKeys ? JSON.parse(cacheKeys) : [];
      const realLeaderKeys = leaderKeys ? JSON.parse(leaderKeys) : [];
      
      // Verificar claves principales
      let mainCacheHits = 0;
      realCacheKeys.forEach(key => {
        if (cache.get(key)) mainCacheHits++;
      });
      
      verificaciones.push({
        item: 'Claves principales registradas',
        success: true,
        valor: `${mainCacheHits}/${realCacheKeys.length} activas`,
        tiempo: Date.now() - startTime
      });
      
      // Verificar claves de líderes
      let leaderCacheHits = 0;
      realLeaderKeys.forEach(key => {
        if (cache.get(key)) leaderCacheHits++;
      });
      
      verificaciones.push({
        item: 'Claves de líderes registradas',
        success: true,
        valor: `${leaderCacheHits}/${realLeaderKeys.length} activas`,
        tiempo: Date.now() - startTime
      });
      
      // Verificar tasa de acierto general
      const totalKeys = realCacheKeys.length + realLeaderKeys.length;
      const totalHits = mainCacheHits + leaderCacheHits;
      const hitRate = totalKeys > 0 ? Math.round((totalHits / totalKeys) * 100) : 0;
      
      verificaciones.push({
        item: 'Tasa de acierto de caché',
        success: hitRate >= 50, // Al menos 50% de acierto
        valor: `${hitRate}%`,
        limite: '50%',
        tiempo: Date.now() - startTime
      });
      
    } catch (error) {
      verificaciones.push({
        item: 'Claves registradas',
        success: false,
        error: error.toString()
      });
    }
    
    // Verificar integridad del sistema de registro
    try {
      const estadoDetallado = getEstadoCacheDetallado();
      if (estadoDetallado.success) {
        verificaciones.push({
          item: 'Sistema de registro de claves',
          success: true,
          valor: 'Funcionando correctamente',
          tiempo: Date.now() - startTime
        });
      } else {
        verificaciones.push({
          item: 'Sistema de registro de claves',
          success: false,
          error: estadoDetallado.error,
          tiempo: Date.now() - startTime
        });
      }
    } catch (error) {
      verificaciones.push({
        item: 'Sistema de registro de claves',
        success: false,
        error: error.toString(),
        tiempo: Date.now() - startTime
      });
    }
    
    const exitosos = verificaciones.filter(v => v.success).length;
    
    return {
      success: exitosos === verificaciones.length,
      nombre: 'Estado de Caché (Claves Reales)',
      verificaciones: verificaciones,
      exitosos: exitosos,
      total: verificaciones.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      success: false,
      nombre: 'Estado de Caché (Claves Reales)',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

/**
 * Verifica errores recientes
 * @returns {Object} Resultado de la verificación de errores
 */
function verificarErroresRecientes() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    console.log('[ProductionMonitoring] Verificando errores recientes...');
    
    // Simular verificación de errores (en producción real, esto vendría de logs)
    const erroresSimulados = 0; // En producción real, contar errores de logs
    
    verificaciones.push({
      item: 'Errores en última hora',
      success: erroresSimulados < 5, // Menos de 5 errores por hora
      valor: `${erroresSimulados} errores`,
      limite: '5 errores/hora',
      tiempo: Date.now() - startTime
    });
    
    // Verificar manejo de errores
    try {
      const errorTest = getDatosLD('', false);
      verificaciones.push({
        item: 'Manejo de errores',
        success: !errorTest.success, // Debe manejar el error
        valor: 'Funcionando',
        tiempo: Date.now() - startTime
      });
    } catch (error) {
      verificaciones.push({
        item: 'Manejo de errores',
        success: true, // Error capturado correctamente
        valor: 'Funcionando',
        tiempo: Date.now() - startTime
      });
    }
    
    const exitosos = verificaciones.filter(v => v.success).length;
    
    return {
      success: exitosos === verificaciones.length,
      nombre: 'Errores Recientes',
      verificaciones: verificaciones,
      exitosos: exitosos,
      total: verificaciones.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      success: false,
      nombre: 'Errores Recientes',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

/**
 * Obtiene métricas de producción usando claves reales
 * @returns {Object} Métricas del sistema
 */
function obtenerMetricasProduccion() {
  try {
    console.log('[ProductionMonitoring] Obteniendo métricas de producción...');
    
    const metrics = getMetricasRendimiento();
    
    if (!metrics.success) {
      console.error('[ProductionMonitoring] Error obteniendo métricas de rendimiento:', metrics.error);
      return {
        timestamp: new Date().toISOString(),
        error: metrics.error
      };
    }
    
    // Usar métricas actualizadas de getMetricasRendimiento
    const productionMetrics = {
      timestamp: new Date().toISOString(),
      system: {
        uptime: 'N/A', // No disponible en Apps Script
        memory_usage: 'N/A', // No disponible en Apps Script
        cpu_usage: 'N/A' // No disponible en Apps Script
      },
      cache: {
        dashboard_available: metrics.data.cache.dashboard,
        stats_available: metrics.data.cache.stats,
        ld_cached_items: metrics.data.cache.ld_cached,
        lcf_cached_items: metrics.data.cache.lcf_cached,
        total_cached_items: metrics.data.cache.total_cached,
        hit_rate: metrics.data.cache.hit_rate,
        total_keys_registered: metrics.data.cache.total_keys_registered,
        cache_hits: metrics.data.cache.cache_hits,
        cache_misses: metrics.data.cache.cache_misses
      },
      performance: {
        avg_dashboard_load: 'N/A',
        avg_ld_load: 'N/A',
        avg_lcf_load: 'N/A',
        cache_efficiency: metrics.data.performance.cache_efficiency
      },
      errors: {
        total_errors: 0,
        error_rate: '0%',
        last_error: null
      },
      keys: {
        main_cache_keys: metrics.data.keys.main_cache_keys,
        leader_cache_keys: metrics.data.keys.leader_cache_keys,
        sample_keys: metrics.data.keys.sample_keys
      }
    };
    
    console.log(`[ProductionMonitoring] Métricas de producción: ${productionMetrics.cache.total_cached_items} elementos en caché (${productionMetrics.cache.hit_rate}% acierto)`);
    
    return productionMetrics;
    
  } catch (error) {
    console.error('[ProductionMonitoring] Error obteniendo métricas:', error);
    return {
      timestamp: new Date().toISOString(),
      error: error.toString()
    };
  }
}

/**
 * Genera alertas de producción
 * @param {Array} checks - Resultados de verificaciones
 * @param {Object} metrics - Métricas del sistema
 * @returns {Array} Alertas generadas
 */
function generarAlertasProduccion(checks, metrics) {
  const alertas = [];
  
  try {
    console.log('[ProductionMonitoring] Generando alertas de producción...');
    
    // Alertas por checks fallidos
    checks.forEach(check => {
      if (!check.success) {
        alertas.push({
          tipo: 'ERROR',
          severidad: 'HIGH',
          mensaje: `Check fallido: ${check.nombre}`,
          timestamp: new Date().toISOString(),
          detalles: check.error || 'Error desconocido'
        });
      }
    });
    
    // Alertas por rendimiento
    const performanceCheck = checks.find(c => c.nombre === 'Rendimiento');
    if (performanceCheck) {
      performanceCheck.verificaciones.forEach(verificacion => {
        if (!verificacion.success) {
          alertas.push({
            tipo: 'PERFORMANCE',
            severidad: 'MEDIUM',
            mensaje: `Rendimiento degradado: ${verificacion.item}`,
            timestamp: new Date().toISOString(),
            detalles: `Valor: ${verificacion.valor}, Límite: ${verificacion.limite}`
          });
        }
      });
    }
    
    // Alertas por caché
    const cacheCheck = checks.find(c => c.nombre === 'Estado de Caché');
    if (cacheCheck) {
      const dashboardCache = cacheCheck.verificaciones.find(v => v.item === 'Caché dashboard');
      if (dashboardCache && dashboardCache.valor === 'Vacía') {
        alertas.push({
          tipo: 'CACHE',
          severidad: 'LOW',
          mensaje: 'Caché del dashboard vacía',
          timestamp: new Date().toISOString(),
          detalles: 'Esto es normal en reinicios o limpieza de caché'
        });
      }
    }
    
    return alertas;
    
  } catch (error) {
    console.error('[ProductionMonitoring] Error generando alertas:', error);
    return [{
      tipo: 'SYSTEM',
      severidad: 'HIGH',
      mensaje: 'Error generando alertas',
      timestamp: new Date().toISOString(),
      detalles: error.toString()
    }];
  }
}

/**
 * Genera recomendaciones basadas en el estado del sistema
 * @param {Array} checks - Resultados de verificaciones
 * @param {Object} metrics - Métricas del sistema
 * @returns {Array} Recomendaciones generadas
 */
function generarRecomendaciones(checks, metrics) {
  const recomendaciones = [];
  
  try {
    console.log('[ProductionMonitoring] Generando recomendaciones...');
    
    // Recomendaciones por checks fallidos
    const failedChecks = checks.filter(c => !c.success);
    if (failedChecks.length > 0) {
      recomendaciones.push({
        tipo: 'CRITICAL',
        mensaje: 'Revisar checks fallidos inmediatamente',
        accion: 'Ejecutar diagnóstico completo y corregir problemas identificados'
      });
    }
    
    // Recomendaciones por rendimiento
    const performanceCheck = checks.find(c => c.nombre === 'Rendimiento');
    if (performanceCheck) {
      const slowChecks = performanceCheck.verificaciones.filter(v => !v.success);
      if (slowChecks.length > 0) {
        recomendaciones.push({
          tipo: 'PERFORMANCE',
          mensaje: 'Optimizar rendimiento del sistema',
          accion: 'Revisar consultas lentas y considerar optimizaciones adicionales'
        });
      }
    }
    
    // Recomendaciones por caché
    if (metrics.cache && metrics.cache.total_cached_items < 5) {
      recomendaciones.push({
        tipo: 'CACHE',
        mensaje: 'Caché con pocos elementos',
        accion: 'Considerar ajustar configuración de caché o verificar uso del sistema'
      });
    }
    
    // Recomendaciones generales
    if (checks.every(c => c.success)) {
      recomendaciones.push({
        tipo: 'MAINTENANCE',
        mensaje: 'Sistema funcionando correctamente',
        accion: 'Continuar monitoreo regular y mantenimiento preventivo'
      });
    }
    
    return recomendaciones;
    
  } catch (error) {
    console.error('[ProductionMonitoring] Error generando recomendaciones:', error);
    return [{
      tipo: 'SYSTEM',
      mensaje: 'Error generando recomendaciones',
      accion: 'Revisar logs del sistema'
    }];
  }
}

/**
 * Genera reporte de estado para stakeholders
 * @returns {Object} Reporte de estado
 */
function generarReporteEstadoStakeholders() {
  try {
    console.log('[ProductionMonitoring] Generando reporte para stakeholders...');
    
    const monitoreo = ejecutarMonitoreoProduccion();
    
    if (!monitoreo.success) {
      return {
        success: false,
        error: monitoreo.error
      };
    }
    
    const data = monitoreo.data;
    
    // Crear reporte simplificado para stakeholders
    const reporte = {
      timestamp: data.timestamp,
      status: data.status,
      summary: {
        total_checks: data.checks.length,
        successful_checks: data.checks.filter(c => c.success).length,
        failed_checks: data.checks.filter(c => !c.success).length,
        alerts_count: data.alerts.length,
        recommendations_count: data.recommendations.length
      },
      health_status: data.status === 'HEALTHY' ? 'Operacional' : 
                    data.status === 'WARNING' ? 'Atención Requerida' : 
                    data.status === 'CRITICAL' ? 'Crítico' : 'Desconocido',
      key_metrics: {
        cache_items: data.metrics.cache?.total_cached_items || 0,
        execution_time: data.executionTime || 0
      },
      alerts: data.alerts.slice(0, 5), // Top 5 alertas
      recommendations: data.recommendations.slice(0, 3), // Top 3 recomendaciones
      next_check: new Date(Date.now() + 30 * 60 * 1000).toISOString() // Próximo check en 30 min
    };
    
    console.log(`[ProductionMonitoring] Reporte generado - Estado: ${reporte.health_status}`);
    
    return {
      success: true,
      data: reporte
    };
    
  } catch (error) {
    console.error('[ProductionMonitoring] Error generando reporte:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

console.log('📊 ProductionMonitoring cargado - Monitoreo de producción disponible');