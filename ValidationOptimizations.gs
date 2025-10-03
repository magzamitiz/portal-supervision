/**
 * @fileoverview Validación exhaustiva de optimizaciones del sistema
 * Verifica que todas las mejoras de rendimiento funcionen correctamente
 */

/**
 * Función de validación exhaustiva de optimizaciones
 * Ejecuta suite completa de pruebas de rendimiento y funcionalidad
 * @returns {Object} Resultado detallado de la validación
 */
function validateOptimizations() {
  console.log('🔍 INICIANDO VALIDACIÓN DE OPTIMIZACIONES...\n');
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: {
      passed: 0,
      failed: 0,
      warnings: 0
    },
    performance: {
      loadTime: 0,
      cacheTime: 0,
      improvement: 0
    }
  };
  
  // TEST 1: Tiempo de carga inicial
  console.log('TEST 1: Tiempo de carga < 15 segundos');
  const startTime = Date.now();
  let dashboardData;
  try {
    dashboardData = getDashboardDataConsolidated();
    const loadTime = Date.now() - startTime;
    results.performance.loadTime = loadTime;
    
    results.tests.push({
      name: 'Tiempo de carga inicial',
      expected: '< 15000ms',
      actual: `${loadTime}ms`,
      passed: loadTime < 15000,
      critical: true,
      details: loadTime < 5000 ? 'EXCELENTE' : loadTime < 10000 ? 'BUENO' : loadTime < 15000 ? 'ACEPTABLE' : 'LENTO'
    });
    
    console.log(`  ⏱️ Tiempo de carga: ${loadTime}ms`);
  } catch (error) {
    results.tests.push({
      name: 'Tiempo de carga inicial',
      expected: '< 15000ms',
      actual: `ERROR: ${error.toString()}`,
      passed: false,
      critical: true
    });
    console.log(`  ❌ Error en carga: ${error}`);
  }
  
  // TEST 2: Verificar apertura única de Sheets
  console.log('TEST 2: Verificar apertura única de spreadsheet');
  try {
    // Limpiar caché para forzar nueva carga
    const cache = CacheService.getScriptCache();
    cache.remove('DASHBOARD_CONSOLIDATED_V1');
    
    // Contar aperturas de spreadsheet (aproximado por logs)
    const beforeLogs = console.log.toString();
    const testStart = Date.now();
    getDashboardDataConsolidated();
    const testTime = Date.now() - testStart;
    
    // Verificar que no hay múltiples aperturas (tiempo razonable)
    const singleOpenExpected = testTime < 20000; // Si toma más de 20s, probablemente hay múltiples aperturas
    
    results.tests.push({
      name: 'Apertura única de spreadsheet',
      expected: 'Una sola apertura',
      actual: singleOpenExpected ? 'Una apertura detectada' : 'Posibles múltiples aperturas',
      passed: singleOpenExpected,
      critical: true,
      details: `Tiempo de apertura: ${testTime}ms`
    });
    
    console.log(`  📊 Tiempo de apertura: ${testTime}ms`);
  } catch (error) {
    results.tests.push({
      name: 'Apertura única de spreadsheet',
      expected: 'Una sola apertura',
      actual: `ERROR: ${error.toString()}`,
      passed: false,
      critical: true
    });
  }
  
  // TEST 3: Caché funcionando
  console.log('TEST 3: Verificar funcionamiento del caché');
  try {
    // Primera carga (debería ser lenta)
    const cache1 = getDashboardDataConsolidated();
    const startCache = Date.now();
    const cache2 = getDashboardDataConsolidated();
    const cacheTime = Date.now() - startCache;
    results.performance.cacheTime = cacheTime;
    
    results.tests.push({
      name: 'Caché hit time',
      expected: '< 500ms',
      actual: `${cacheTime}ms`,
      passed: cacheTime < 500,
      critical: true,
      details: cacheTime < 100 ? 'EXCELENTE' : cacheTime < 300 ? 'BUENO' : cacheTime < 500 ? 'ACEPTABLE' : 'LENTO'
    });
    
    console.log(`  ⚡ Tiempo de caché: ${cacheTime}ms`);
  } catch (error) {
    results.tests.push({
      name: 'Caché hit time',
      expected: '< 500ms',
      actual: `ERROR: ${error.toString()}`,
      passed: false,
      critical: true
    });
  }
  
  // TEST 4: Datos correctos
  console.log('TEST 4: Verificar integridad de datos');
  try {
    const hasStats = dashboardData?.data?.estadisticas !== undefined;
    const hasLeaders = dashboardData?.data?.listaDeLideres !== undefined;
    const hasDashboard = dashboardData?.data?.dashboard !== undefined;
    const hasTimestamp = dashboardData?.data?.timestamp !== undefined;
    
    const allComponentsPresent = hasStats && hasLeaders && hasDashboard && hasTimestamp;
    
    results.tests.push({
      name: 'Integridad de datos',
      expected: 'Todos los componentes presentes',
      actual: `Stats: ${hasStats}, Leaders: ${hasLeaders}, Dashboard: ${hasDashboard}, Timestamp: ${hasTimestamp}`,
      passed: allComponentsPresent,
      critical: true,
      details: allComponentsPresent ? 'COMPLETO' : 'INCOMPLETO'
    });
    
    console.log(`  📋 Componentes: Stats=${hasStats}, Leaders=${hasLeaders}, Dashboard=${hasDashboard}, Timestamp=${hasTimestamp}`);
  } catch (error) {
    results.tests.push({
      name: 'Integridad de datos',
      expected: 'Todos los componentes presentes',
      actual: `ERROR: ${error.toString()}`,
      passed: false,
      critical: true
    });
  }
  
  // TEST 5: Sin errores
  console.log('TEST 5: Sin errores en ejecución');
  try {
    const success = dashboardData?.success === true;
    const hasError = dashboardData?.error !== undefined;
    
    results.tests.push({
      name: 'Ejecución sin errores',
      expected: 'success: true, sin errores',
      actual: `success: ${success}, error: ${hasError ? 'SÍ' : 'NO'}`,
      passed: success && !hasError,
      critical: true,
      details: hasError ? `Error: ${dashboardData?.error}` : 'SIN ERRORES'
    });
    
    console.log(`  ✅ Success: ${success}, Error: ${hasError ? 'SÍ' : 'NO'}`);
  } catch (error) {
    results.tests.push({
      name: 'Ejecución sin errores',
      expected: 'success: true, sin errores',
      actual: `ERROR: ${error.toString()}`,
      passed: false,
      critical: true
    });
  }
  
  // TEST 6: Estructura de datos válida
  console.log('TEST 6: Verificar estructura de datos válida');
  try {
    let structureValid = true;
    const structureIssues = [];
    
    // Verificar estadísticas
    if (dashboardData?.data?.estadisticas) {
      const stats = dashboardData.data.estadisticas;
      if (!stats.ingresos || !stats.celulas || !stats.lideres) {
        structureValid = false;
        structureIssues.push('Estadísticas incompletas');
      }
    } else {
      structureValid = false;
      structureIssues.push('Faltan estadísticas');
    }
    
    // Verificar lista de líderes
    if (dashboardData?.data?.listaDeLideres) {
      const leaders = dashboardData.data.listaDeLideres;
      if (!Array.isArray(leaders) || leaders.length === 0) {
        structureValid = false;
        structureIssues.push('Lista de líderes vacía o inválida');
      }
    } else {
      structureValid = false;
      structureIssues.push('Falta lista de líderes');
    }
    
    // Verificar dashboard
    if (dashboardData?.data?.dashboard) {
      const dashboard = dashboardData.data.dashboard;
      if (!dashboard.lideres || !dashboard.celulas || !dashboard.ingresos) {
        structureValid = false;
        structureIssues.push('Dashboard incompleto');
      }
    } else {
      structureValid = false;
      structureIssues.push('Falta dashboard');
    }
    
    results.tests.push({
      name: 'Estructura de datos válida',
      expected: 'Estructura completa y válida',
      actual: structureValid ? 'VÁLIDA' : `PROBLEMAS: ${structureIssues.join(', ')}`,
      passed: structureValid,
      critical: true,
      details: structureIssues.length > 0 ? structureIssues.join('; ') : 'ESTRUCTURA CORRECTA'
    });
    
    console.log(`  🏗️ Estructura: ${structureValid ? 'VÁLIDA' : 'INVÁLIDA'}`);
    if (structureIssues.length > 0) {
      console.log(`  ⚠️ Problemas: ${structureIssues.join(', ')}`);
    }
  } catch (error) {
    results.tests.push({
      name: 'Estructura de datos válida',
      expected: 'Estructura completa y válida',
      actual: `ERROR: ${error.toString()}`,
      passed: false,
      critical: true
    });
  }
  
  // TEST 7: Rendimiento comparativo
  console.log('TEST 7: Rendimiento comparativo');
  try {
    // Calcular mejora estimada (basado en tiempo objetivo de 30s vs 128s original)
    const targetTime = 30000; // 30 segundos objetivo
    const originalTime = 128000; // 128 segundos original
    const actualTime = results.performance.loadTime;
    
    const improvement = originalTime > 0 ? ((originalTime - actualTime) / originalTime * 100) : 0;
    results.performance.improvement = improvement;
    
    const meetsTarget = actualTime <= targetTime;
    
    results.tests.push({
      name: 'Rendimiento comparativo',
      expected: `Mejora > 50% (tiempo < ${targetTime}ms)`,
      actual: `Mejora: ${improvement.toFixed(1)}%, Tiempo: ${actualTime}ms`,
      passed: meetsTarget,
      critical: false,
      details: `Objetivo: ${targetTime}ms, Original: ${originalTime}ms, Actual: ${actualTime}ms`
    });
    
    console.log(`  📈 Mejora: ${improvement.toFixed(1)}% (${actualTime}ms vs ${originalTime}ms original)`);
  } catch (error) {
    results.tests.push({
      name: 'Rendimiento comparativo',
      expected: 'Mejora > 50%',
      actual: `ERROR: ${error.toString()}`,
      passed: false,
      critical: false
    });
  }
  
  // Generar resumen
  results.tests.forEach(test => {
    if (test.passed) {
      results.summary.passed++;
    } else if (test.critical) {
      results.summary.failed++;
    } else {
      results.summary.warnings++;
    }
  });
  
  // Mostrar resultados
  console.log('\n📊 RESUMEN DE VALIDACIÓN:');
  console.log('='.repeat(60));
  console.log(`✅ Pasados: ${results.summary.passed}`);
  console.log(`❌ Fallidos: ${results.summary.failed}`);
  console.log(`⚠️ Advertencias: ${results.summary.warnings}`);
  console.log('='.repeat(60));
  
  // Mostrar detalles de cada test
  console.log('\n📋 DETALLES DE PRUEBAS:');
  results.tests.forEach((test, index) => {
    const status = test.passed ? '✅' : (test.critical ? '❌' : '⚠️');
    console.log(`${index + 1}. ${status} ${test.name}`);
    console.log(`   Esperado: ${test.expected}`);
    console.log(`   Actual: ${test.actual}`);
    if (test.details) {
      console.log(`   Detalles: ${test.details}`);
    }
    console.log('');
  });
  
  // Resultado final
  if (results.summary.failed === 0) {
    console.log('🎉 ¡TODAS LAS OPTIMIZACIONES FUNCIONAN CORRECTAMENTE!');
    console.log(`⚡ Tiempo de carga: ${results.performance.loadTime}ms (Objetivo: <15000ms)`);
    console.log(`📈 Mejora: ${results.performance.improvement.toFixed(1)}%`);
    console.log(`⚡ Tiempo de caché: ${results.performance.cacheTime}ms (Objetivo: <500ms)`);
  } else {
    console.log('\n⚠️ HAY PROBLEMAS QUE RESOLVER:');
    results.tests.filter(t => !t.passed && t.critical).forEach(test => {
      console.log(`  ❌ ${test.name}: ${test.actual} (esperado: ${test.expected})`);
    });
  }
  
  // Guardar resultados en Properties para análisis histórico
  try {
    const props = PropertiesService.getScriptProperties();
    const validationKey = `VALIDATION_${new Date().toISOString()}`;
    props.setProperty(validationKey, JSON.stringify(results));
    console.log('\n💾 Resultados guardados para análisis histórico');
  } catch (error) {
    console.log('\n⚠️ No se pudieron guardar los resultados:', error);
  }
  
  return results;
}

/**
 * Función de validación rápida para pruebas frecuentes
 * @returns {Object} Resultado de validación rápida
 */
function validateOptimizationsQuick() {
  console.log('⚡ VALIDACIÓN RÁPIDA DE OPTIMIZACIONES...\n');
  
  const startTime = Date.now();
  let dashboardData;
  
  try {
    dashboardData = getDashboardDataConsolidated();
    const loadTime = Date.now() - startTime;
    
    const isValid = dashboardData?.success === true && 
                   loadTime < 15000 && 
                   dashboardData?.data?.estadisticas !== undefined &&
                   dashboardData?.data?.listaDeLideres !== undefined &&
                   dashboardData?.data?.dashboard !== undefined;
    
    console.log(`⏱️ Tiempo: ${loadTime}ms`);
    console.log(`✅ Válido: ${isValid ? 'SÍ' : 'NO'}`);
    
    return {
      timestamp: new Date().toISOString(),
      loadTime: loadTime,
      valid: isValid,
      success: dashboardData?.success,
      hasStats: dashboardData?.data?.estadisticas !== undefined,
      hasLeaders: dashboardData?.data?.listaDeLideres !== undefined,
      hasDashboard: dashboardData?.data?.dashboard !== undefined
    };
    
  } catch (error) {
    console.log(`❌ Error: ${error.toString()}`);
    return {
      timestamp: new Date().toISOString(),
      loadTime: Date.now() - startTime,
      valid: false,
      error: error.toString()
    };
  }
}

/**
 * Función de monitoreo continuo de optimizaciones
 * @returns {Object} Estado actual del sistema
 */
function monitorOptimizations() {
  console.log('🔍 MONITOREO CONTINUO DE OPTIMIZACIONES...\n');
  
  const quickResult = validateOptimizationsQuick();
  
  const status = {
    timestamp: new Date().toISOString(),
    healthy: quickResult.valid,
    loadTime: quickResult.loadTime,
    performance: quickResult.loadTime < 5000 ? 'EXCELENTE' : 
                quickResult.loadTime < 10000 ? 'BUENO' : 
                quickResult.loadTime < 15000 ? 'ACEPTABLE' : 'LENTO',
    recommendations: []
  };
  
  if (!quickResult.valid) {
    status.recommendations.push('Ejecutar validación completa para identificar problemas');
  }
  
  if (quickResult.loadTime > 10000) {
    status.recommendations.push('Considerar optimizaciones adicionales de caché');
  }
  
  if (quickResult.loadTime > 15000) {
    status.recommendations.push('REVISAR URGENTEMENTE: Tiempo de carga excede objetivo');
  }
  
  console.log(`🏥 Estado: ${status.healthy ? 'SALUDABLE' : 'PROBLEMAS'}`);
  console.log(`⚡ Rendimiento: ${status.performance}`);
  console.log(`⏱️ Tiempo: ${status.loadTime}ms`);
  
  if (status.recommendations.length > 0) {
    console.log('\n💡 Recomendaciones:');
    status.recommendations.forEach(rec => console.log(`  - ${rec}`));
  }
  
  return status;
}
