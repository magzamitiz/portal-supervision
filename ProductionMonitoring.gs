/**
 * @fileoverview Sistema de monitoreo de producción
 * Monitorea rendimiento, salud del sistema y genera alertas
 */

/**
 * Monitorea el rendimiento del dashboard en tiempo real
 * @returns {Object} Estadísticas de rendimiento
 */
function monitorDashboardPerformance() {
  const props = PropertiesService.getScriptProperties();
  
  try {
    // Obtener últimas 10 mediciones
    const metrics = [];
    const keys = props.getKeys().filter(k => k.startsWith('METRIC_'));
    
    // Ordenar por timestamp y tomar las últimas 10
    const sortedKeys = keys.sort((a, b) => {
      const timestampA = a.split('_').pop();
      const timestampB = b.split('_').pop();
      return new Date(timestampA) - new Date(timestampB);
    });
    
    sortedKeys.slice(-10).forEach(key => {
      try {
        const metric = JSON.parse(props.getProperty(key));
        if (metric && metric.duration) {
          metrics.push(metric);
        }
      } catch(e) {
        // Ignorar métricas corruptas
        console.warn('[MONITOR] Métrica corrupta ignorada:', key);
      }
    });
    
    if (metrics.length === 0) {
      console.log('📊 MÉTRICAS: No hay datos suficientes para análisis');
      return { status: 'NO_DATA', message: 'No hay métricas disponibles' };
    }
    
    // Calcular estadísticas
    const durations = metrics.map(m => m.duration);
    const avg = durations.reduce((a,b) => a+b, 0) / durations.length;
    const max = Math.max(...durations);
    const min = Math.min(...durations);
    const median = durations.sort((a,b) => a-b)[Math.floor(durations.length/2)];
    
    console.log('📊 MÉTRICAS DE RENDIMIENTO (últimas 10):');
    console.log(`  Promedio: ${Math.round(avg)}ms`);
    console.log(`  Mínimo: ${min}ms`);
    console.log(`  Máximo: ${max}ms`);
    console.log(`  Mediana: ${median}ms`);
    console.log(`  Objetivo: <15000ms`);
    
    // Detectar degradación de rendimiento
    const alerts = [];
    if (avg > 20000) {
      alerts.push({
        type: 'CRITICAL',
        message: 'Rendimiento crítico: promedio > 20s',
        value: avg,
        threshold: 20000
      });
    } else if (avg > 15000) {
      alerts.push({
        type: 'WARNING',
        message: 'Rendimiento degradado: promedio > 15s',
        value: avg,
        threshold: 15000
      });
    }
    
    // Mostrar alertas
    if (alerts.length > 0) {
      console.log('\n⚠️ ALERTAS DE RENDIMIENTO:');
      alerts.forEach(alert => {
        const emoji = alert.type === 'CRITICAL' ? '🚨' : '⚠️';
        console.log(`  ${emoji} ${alert.message}`);
      });
    } else {
      console.log('\n✅ RENDIMIENTO SALUDABLE');
    }
    
    return {
      status: 'HEALTHY',
      summary: {
        average: Math.round(avg),
        min: min,
        max: max,
        median: median,
        sampleSize: metrics.length
      },
      alerts: alerts,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('[MONITOR] Error en monitoreo:', error);
    return {
      status: 'ERROR',
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Monitoreo de salud general del sistema
 * @returns {Object} Estado de salud del sistema
 */
function monitorSystemHealth() {
  console.log('\n🏥 MONITOREO DE SALUD DEL SISTEMA...\n');
  
  const health = {
    timestamp: new Date().toISOString(),
    overall: 'HEALTHY',
    checks: [],
    alerts: [],
    recommendations: []
  };
  
  // CHECK 1: Verificar funciones críticas
  console.log('1️⃣ Verificando funciones críticas...');
  const criticalFunctions = [
    'getDashboardDataConsolidated',
    'getEstadisticasRapidas',
    'getListaDeLideres',
    'cargarDirectorioCompleto'
  ];
  
  let functionsOk = 0;
  criticalFunctions.forEach(funcName => {
    try {
      if (typeof eval(funcName) === 'function') {
        health.checks.push({
          name: `Función ${funcName}`,
          status: 'OK',
          message: 'Disponible'
        });
        functionsOk++;
      } else {
        health.checks.push({
          name: `Función ${funcName}`,
          status: 'ERROR',
          message: 'No encontrada'
        });
        health.alerts.push({
          type: 'CRITICAL',
          message: `Función crítica no encontrada: ${funcName}`
        });
      }
    } catch (error) {
      health.checks.push({
        name: `Función ${funcName}`,
        status: 'ERROR',
        message: error.toString()
      });
    }
  });
  
  console.log(`  ✅ Funciones críticas: ${functionsOk}/${criticalFunctions.length}`);
  
  // CHECK 2: Verificar caché
  console.log('2️⃣ Verificando sistema de caché...');
  try {
    const cache = CacheService.getScriptCache();
    cache.put('HEALTH_CHECK', 'OK', 60);
    const testValue = cache.get('HEALTH_CHECK');
    
    if (testValue === 'OK') {
      health.checks.push({
        name: 'Sistema de caché',
        status: 'OK',
        message: 'Funcionando correctamente'
      });
      cache.remove('HEALTH_CHECK');
    } else {
      health.checks.push({
        name: 'Sistema de caché',
        status: 'ERROR',
        message: 'No almacena/recupera datos correctamente'
      });
      health.alerts.push({
        type: 'WARNING',
        message: 'Problemas con el sistema de caché'
      });
    }
  } catch (error) {
    health.checks.push({
      name: 'Sistema de caché',
      status: 'ERROR',
      message: error.toString()
    });
    health.alerts.push({
      type: 'CRITICAL',
      message: 'Error crítico en sistema de caché'
    });
  }
  
  // Determinar salud general
  const errorCount = health.checks.filter(c => c.status === 'ERROR').length;
  const warningCount = health.checks.filter(c => c.status === 'WARNING').length;
  
  if (errorCount > 0) {
    health.overall = 'UNHEALTHY';
  } else if (warningCount > 0) {
    health.overall = 'DEGRADED';
  } else {
    health.overall = 'HEALTHY';
  }
  
  // Mostrar resumen
  console.log('\n📊 RESUMEN DE SALUD:');
  console.log('='.repeat(50));
  console.log(`Estado General: ${health.overall}`);
  console.log(`✅ OK: ${health.checks.filter(c => c.status === 'OK').length}`);
  console.log(`⚠️ WARNING: ${warningCount}`);
  console.log(`❌ ERROR: ${errorCount}`);
  console.log('='.repeat(50));
  
  return health;
}

/**
 * Genera reporte de estado para administradores
 * @returns {Object} Reporte completo del sistema
 */
function generateSystemReport() {
  console.log('\n📋 GENERANDO REPORTE DE SISTEMA...\n');
  
  const report = {
    timestamp: new Date().toISOString(),
    health: monitorSystemHealth(),
    performance: monitorDashboardPerformance(),
    recommendations: []
  };
  
  // Generar recomendaciones basadas en el estado
  if (report.health.overall === 'UNHEALTHY') {
    report.recommendations.push('REVISIÓN URGENTE: El sistema tiene errores críticos');
  }
  
  if (report.performance.status === 'HEALTHY' && report.performance.summary.average > 10000) {
    report.recommendations.push('Optimizar rendimiento: tiempo promedio > 10s');
  }
  
  if (report.health.alerts.length > 0) {
    report.recommendations.push(`Resolver ${report.health.alerts.length} alertas activas`);
  }
  
  // Mostrar reporte
  console.log('📊 REPORTE COMPLETO DEL SISTEMA:');
  console.log('='.repeat(60));
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`Salud General: ${report.health.overall}`);
  console.log(`Rendimiento: ${report.performance.status}`);
  console.log(`Recomendaciones: ${report.recommendations.length}`);
  console.log('='.repeat(60));
  
  if (report.recommendations.length > 0) {
    console.log('\n💡 ACCIONES RECOMENDADAS:');
    report.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec}`);
    });
  }
  
  return report;
}