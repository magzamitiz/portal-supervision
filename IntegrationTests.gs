/**
 * @fileoverview Pruebas de integración del sistema
 * Validación completa de todas las funcionalidades
 */

/**
 * Ejecuta todas las pruebas de integración
 * @returns {Object} Resultado de todas las pruebas
 */
function ejecutarTodasLasPruebas() {
  const startTime = Date.now();
  const resultados = [];
  
  try {
    console.log('[IntegrationTests] Iniciando pruebas de integración completas...');
    
    // 1. Pruebas de módulos básicos
    resultados.push(probarModulosBasicos());
    
    // 2. Pruebas de carga de datos
    resultados.push(probarCargaDeDatos());
    
    // 3. Pruebas de caché
    resultados.push(probarSistemaCache());
    
    // 4. Pruebas de reportes
    resultados.push(probarSistemaReportes());
    
    // 5. Pruebas de seguimiento
    resultados.push(probarSistemaSeguimiento());
    
    // 6. Pruebas de rendimiento
    resultados.push(probarRendimiento());
    
    // 7. Pruebas de manejo de errores
    resultados.push(probarManejoErrores());
    
    const totalTime = Date.now() - startTime;
    const exitosas = resultados.filter(r => r.success).length;
    const fallidas = resultados.filter(r => !r.success).length;
    
    const resumen = {
      success: fallidas === 0,
      totalTests: resultados.length,
      exitosas: exitosas,
      fallidas: fallidas,
      totalTime: totalTime,
      resultados: resultados,
      timestamp: new Date().toISOString()
    };
    
    console.log(`[IntegrationTests] Pruebas completadas: ${exitosas}/${resultados.length} exitosas en ${totalTime}ms`);
    
    return resumen;
    
  } catch (error) {
    console.error('[IntegrationTests] Error en pruebas de integración:', error);
    return {
      success: false,
      error: error.toString(),
      totalTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Prueba módulos básicos del sistema
 * @returns {Object} Resultado de la prueba
 */
function probarModulosBasicos() {
  const startTime = Date.now();
  const pruebas = [];
  
  try {
    console.log('[IntegrationTests] Probando módulos básicos...');
    
    // Probar doGet
    try {
      const doGetResult = doGet({});
      pruebas.push({
        nombre: 'doGet',
        success: !!doGetResult,
        tiempo: Date.now() - startTime
      });
    } catch (error) {
      pruebas.push({
        nombre: 'doGet',
        success: false,
        error: error.toString()
      });
    }
    
    // Probar getDashboardData
    try {
      const dashboardResult = getDashboardData(false);
      pruebas.push({
        nombre: 'getDashboardData',
        success: dashboardResult.success !== false,
        tiempo: Date.now() - startTime
      });
    } catch (error) {
      pruebas.push({
        nombre: 'getDashboardData',
        success: false,
        error: error.toString()
      });
    }
    
    // Probar forceReloadDashboardData
    try {
      const reloadResult = forceReloadDashboardData();
      pruebas.push({
        nombre: 'forceReloadDashboardData',
        success: reloadResult.success !== false,
        tiempo: Date.now() - startTime
      });
    } catch (error) {
      pruebas.push({
        nombre: 'forceReloadDashboardData',
        success: false,
        error: error.toString()
      });
    }
    
    const exitosas = pruebas.filter(p => p.success).length;
    
    return {
      success: exitosas === pruebas.length,
      nombre: 'Módulos Básicos',
      pruebas: pruebas,
      exitosas: exitosas,
      total: pruebas.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      success: false,
      nombre: 'Módulos Básicos',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

/**
 * Prueba carga de datos del sistema
 * @returns {Object} Resultado de la prueba
 */
function probarCargaDeDatos() {
  const startTime = Date.now();
  const pruebas = [];
  
  try {
    console.log('[IntegrationTests] Probando carga de datos...');
    
    // Probar cargarDirectorioCompleto
    try {
      const directorioResult = cargarDirectorioCompleto(false);
      pruebas.push({
        nombre: 'cargarDirectorioCompleto',
        success: !!directorioResult && directorioResult.lideres,
        tiempo: Date.now() - startTime
      });
    } catch (error) {
      pruebas.push({
        nombre: 'cargarDirectorioCompleto',
        success: false,
        error: error.toString()
      });
    }
    
    // Probar getEstadisticasRapidas
    try {
      const estadisticasResult = getEstadisticasRapidas();
      pruebas.push({
        nombre: 'getEstadisticasRapidas',
        success: estadisticasResult.success !== false,
        tiempo: Date.now() - startTime
      });
    } catch (error) {
      pruebas.push({
        nombre: 'getEstadisticasRapidas',
        success: false,
        error: error.toString()
      });
    }
    
    // Probar getListaDeLideres
    try {
      const listaResult = getListaDeLideres();
      pruebas.push({
        nombre: 'getListaDeLideres',
        success: listaResult.success !== false,
        tiempo: Date.now() - startTime
      });
    } catch (error) {
      pruebas.push({
        nombre: 'getListaDeLideres',
        success: false,
        error: error.toString()
      });
    }
    
    const exitosas = pruebas.filter(p => p.success).length;
    
    return {
      success: exitosas === pruebas.length,
      nombre: 'Carga de Datos',
      pruebas: pruebas,
      exitosas: exitosas,
      total: pruebas.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      success: false,
      nombre: 'Carga de Datos',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

/**
 * Prueba sistema de caché
 * @returns {Object} Resultado de la prueba
 */
function probarSistemaCache() {
  const startTime = Date.now();
  const pruebas = [];
  
  try {
    console.log('[IntegrationTests] Probando sistema de caché...');
    
    // Probar setCacheData
    try {
      const testData = { test: 'data', timestamp: new Date().toISOString() };
      setCacheData(testData);
      pruebas.push({
        nombre: 'setCacheData',
        success: true,
        tiempo: Date.now() - startTime
      });
    } catch (error) {
      pruebas.push({
        nombre: 'setCacheData',
        success: false,
        error: error.toString()
      });
    }
    
    // Probar getCacheData
    try {
      const cachedData = getCacheData();
      pruebas.push({
        nombre: 'getCacheData',
        success: cachedData !== null,
        tiempo: Date.now() - startTime
      });
    } catch (error) {
      pruebas.push({
        nombre: 'getCacheData',
        success: false,
        error: error.toString()
      });
    }
    
    // Probar clearCache
    try {
      clearCache();
      pruebas.push({
        nombre: 'clearCache',
        success: true,
        tiempo: Date.now() - startTime
      });
    } catch (error) {
      pruebas.push({
        nombre: 'clearCache',
        success: false,
        error: error.toString()
      });
    }
    
    // Probar limpiarCacheManualmente
    try {
      const limpiarResult = limpiarCacheManualmente();
      pruebas.push({
        nombre: 'limpiarCacheManualmente',
        success: limpiarResult.success !== false,
        tiempo: Date.now() - startTime
      });
    } catch (error) {
      pruebas.push({
        nombre: 'limpiarCacheManualmente',
        success: false,
        error: error.toString()
      });
    }
    
    const exitosas = pruebas.filter(p => p.success).length;
    
    return {
      success: exitosas === pruebas.length,
      nombre: 'Sistema de Caché',
      pruebas: pruebas,
      exitosas: exitosas,
      total: pruebas.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      success: false,
      nombre: 'Sistema de Caché',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

/**
 * Prueba sistema de reportes
 * @returns {Object} Resultado de la prueba
 */
function probarSistemaReportes() {
  const startTime = Date.now();
  const pruebas = [];
  
  try {
    console.log('[IntegrationTests] Probando sistema de reportes...');
    
    // Probar getListaLDs
    try {
      const ldsResult = getListaLDs();
      pruebas.push({
        nombre: 'getListaLDs',
        success: ldsResult.success !== false,
        tiempo: Date.now() - startTime
      });
    } catch (error) {
      pruebas.push({
        nombre: 'getListaLDs',
        success: false,
        error: error.toString()
      });
    }
    
    // Probar generarReporteLCF (con ID de prueba)
    try {
      const reporteResult = generarReporteLCF('TEST_LCF');
      pruebas.push({
        nombre: 'generarReporteLCF',
        success: reporteResult.success !== false,
        tiempo: Date.now() - startTime
      });
    } catch (error) {
      pruebas.push({
        nombre: 'generarReporteLCF',
        success: false,
        error: error.toString()
      });
    }
    
    const exitosas = pruebas.filter(p => p.success).length;
    
    return {
      success: exitosas === pruebas.length,
      nombre: 'Sistema de Reportes',
      pruebas: pruebas,
      exitosas: exitosas,
      total: pruebas.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      success: false,
      nombre: 'Sistema de Reportes',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

/**
 * Prueba sistema de seguimiento
 * @returns {Object} Resultado de la prueba
 */
function probarSistemaSeguimiento() {
  const startTime = Date.now();
  const pruebas = [];
  
  try {
    console.log('[IntegrationTests] Probando sistema de seguimiento...');
    
    // Probar getVistaRapidaLCF
    try {
      const vistaResult = getVistaRapidaLCF('TEST_LCF');
      pruebas.push({
        nombre: 'getVistaRapidaLCF',
        success: vistaResult.success !== false,
        tiempo: Date.now() - startTime
      });
    } catch (error) {
      pruebas.push({
        nombre: 'getVistaRapidaLCF',
        success: false,
        error: error.toString()
      });
    }
    
    // Probar getSeguimientoAlmasLCF
    try {
      const seguimientoResult = getSeguimientoAlmasLCF('TEST_LCF');
      pruebas.push({
        nombre: 'getSeguimientoAlmasLCF',
        success: seguimientoResult.success !== false,
        tiempo: Date.now() - startTime
      });
    } catch (error) {
      pruebas.push({
        nombre: 'getSeguimientoAlmasLCF',
        success: false,
        error: error.toString()
      });
    }
    
    // Probar funciones de seguimiento seguro
    try {
      const buscarResult = buscarBienvenida('TEST_ALMA', 'Test Name', []);
      pruebas.push({
        nombre: 'buscarBienvenida',
        success: buscarResult !== undefined,
        tiempo: Date.now() - startTime
      });
    } catch (error) {
      pruebas.push({
        nombre: 'buscarBienvenida',
        success: false,
        error: error.toString()
      });
    }
    
    const exitosas = pruebas.filter(p => p.success).length;
    
    return {
      success: exitosas === pruebas.length,
      nombre: 'Sistema de Seguimiento',
      pruebas: pruebas,
      exitosas: exitosas,
      total: pruebas.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      success: false,
      nombre: 'Sistema de Seguimiento',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

/**
 * Prueba rendimiento del sistema
 * @returns {Object} Resultado de la prueba
 */
function probarRendimiento() {
  const startTime = Date.now();
  const pruebas = [];
  
  try {
    console.log('[IntegrationTests] Probando rendimiento...');
    
    // Probar carga optimizada del dashboard
    try {
      const dashboardStart = Date.now();
      const dashboardResult = getDashboardDataOptimized(false);
      const dashboardTime = Date.now() - dashboardStart;
      
      pruebas.push({
        nombre: 'getDashboardDataOptimized',
        success: dashboardResult.success !== false,
        tiempo: dashboardTime,
        optimizado: dashboardTime < 5000 // Menos de 5 segundos
      });
    } catch (error) {
      pruebas.push({
        nombre: 'getDashboardDataOptimized',
        success: false,
        error: error.toString()
      });
    }
    
    // Probar carga optimizada de LD
    try {
      const ldStart = Date.now();
      const ldResult = getDatosLDOptimized('TEST_LD', false);
      const ldTime = Date.now() - ldStart;
      
      pruebas.push({
        nombre: 'getDatosLDOptimized',
        success: ldResult.success !== false,
        tiempo: ldTime,
        optimizado: ldTime < 3000 // Menos de 3 segundos
      });
    } catch (error) {
      pruebas.push({
        nombre: 'getDatosLDOptimized',
        success: false,
        error: error.toString()
      });
    }
    
    // Probar métricas de rendimiento
    try {
      const metricsResult = getMetricasRendimiento();
      pruebas.push({
        nombre: 'getMetricasRendimiento',
        success: metricsResult.success !== false,
        tiempo: Date.now() - startTime
      });
    } catch (error) {
      pruebas.push({
        nombre: 'getMetricasRendimiento',
        success: false,
        error: error.toString()
      });
    }
    
    const exitosas = pruebas.filter(p => p.success).length;
    
    return {
      success: exitosas === pruebas.length,
      nombre: 'Rendimiento',
      pruebas: pruebas,
      exitosas: exitosas,
      total: pruebas.length,
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
 * Prueba manejo de errores
 * @returns {Object} Resultado de la prueba
 */
function probarManejoErrores() {
  const startTime = Date.now();
  const pruebas = [];
  
  try {
    console.log('[IntegrationTests] Probando manejo de errores...');
    
    // Probar con ID inválido
    try {
      const invalidResult = getDatosLD('', false);
      pruebas.push({
        nombre: 'getDatosLD con ID vacío',
        success: !invalidResult.success, // Debe fallar
        tiempo: Date.now() - startTime
      });
    } catch (error) {
      pruebas.push({
        nombre: 'getDatosLD con ID vacío',
        success: true, // Error capturado correctamente
        tiempo: Date.now() - startTime
      });
    }
    
    // Probar con parámetros inválidos
    try {
      const invalidParams = getVistaRapidaLCF('');
      pruebas.push({
        nombre: 'getVistaRapidaLCF con ID vacío',
        success: !invalidParams.success, // Debe fallar
        tiempo: Date.now() - startTime
      });
    } catch (error) {
      pruebas.push({
        nombre: 'getVistaRapidaLCF con ID vacío',
        success: true, // Error capturado correctamente
        tiempo: Date.now() - startTime
      });
    }
    
    // Probar limpieza de caché con errores
    try {
      const cleanResult = limpiarCacheInteligente();
      pruebas.push({
        nombre: 'limpiarCacheInteligente',
        success: cleanResult.success !== false,
        tiempo: Date.now() - startTime
      });
    } catch (error) {
      pruebas.push({
        nombre: 'limpiarCacheInteligente',
        success: false,
        error: error.toString()
      });
    }
    
    const exitosas = pruebas.filter(p => p.success).length;
    
    return {
      success: exitosas === pruebas.length,
      nombre: 'Manejo de Errores',
      pruebas: pruebas,
      exitosas: exitosas,
      total: pruebas.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      success: false,
      nombre: 'Manejo de Errores',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

console.log('🧪 IntegrationTests cargado - Pruebas de integración disponibles');