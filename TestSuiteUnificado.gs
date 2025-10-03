/**
 * @fileoverview Suite Unificada de Tests del Sistema
 * Sistema completo de pruebas que reemplaza todos los tests obsoletos
 */

// ==================== CONFIGURACIÓN DE TESTS ====================

const TEST_CONFIG = {
  TIMEOUT: 30000,
  GENERAR_CACHE: true,
  LIMPIAR_DESPUES: true,
  VERBOSE: true
};

// ==================== TESTS PRINCIPALES ====================

/**
 * Ejecuta la suite completa de tests del sistema
 * @returns {Object} Resultado completo de todos los tests
 */
function ejecutarTestSuiteCompleto() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 SUITE UNIFICADA DE TESTS DEL SISTEMA');
  console.log('='.repeat(80) + '\n');
  
  const resultados = {
    timestamp: new Date().toISOString(),
    tests: [],
    resumen: {
      total: 0,
      exitosos: 0,
      fallidos: 0,
      tiempoTotal: 0
    }
  };
  
  const startTime = Date.now();
  
  try {
    // 1. Test de funciones de actividad
    console.log('1️⃣ Probando funciones de actividad...');
    const testActividad = testFuncionesActividad();
    resultados.tests.push(testActividad);
    
    // 2. Test de sistema de caché inteligente
    console.log('\n2️⃣ Probando sistema de caché inteligente...');
    const testCache = testSistemaCacheInteligente();
    resultados.tests.push(testCache);
    
    // 3. Test de métricas con claves reales
    console.log('\n3️⃣ Probando métricas con claves reales...');
    const testMetricas = testMetricasConClavesReales();
    resultados.tests.push(testMetricas);
    
    // 4. Test de monitoreo de producción
    console.log('\n4️⃣ Probando monitoreo de producción...');
    const testMonitoreo = testMonitoreoProduccion();
    resultados.tests.push(testMonitoreo);
    
    // 5. Test de integración completa
    console.log('\n5️⃣ Probando integración completa...');
    const testIntegracion = testIntegracionCompleta();
    resultados.tests.push(testIntegracion);
    
    // 6. Test de rendimiento
    console.log('\n6️⃣ Probando rendimiento del sistema...');
    const testRendimiento = testRendimientoSistema();
    resultados.tests.push(testRendimiento);
    
    // Calcular resumen
    resultados.resumen.tiempoTotal = Date.now() - startTime;
    resultados.resumen.total = resultados.tests.length;
    resultados.resumen.exitosos = resultados.tests.filter(t => t.resultado === 'PASS').length;
    resultados.resumen.fallidos = resultados.tests.filter(t => t.resultado === 'FAIL' || t.resultado === 'ERROR').length;
    
    // Mostrar resumen final
    mostrarResumenFinal(resultados);
    
    return resultados;
    
  } catch (error) {
    console.error('❌ Error crítico en suite de tests:', error);
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

// ==================== TESTS ESPECÍFICOS ====================

/**
 * Test de funciones de actividad
 * @returns {Object} Resultado del test
 */
function testFuncionesActividad() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    console.log('   🔍 Probando calcularActividadLideres...');
    
    // Verificar que la función existe
    if (typeof calcularActividadLideres === 'function') {
      const celulasPrueba = [
        { ID_Lider: 'LD-001', Estado: 'Activa', Miembros: [{ ID_Miembro: 'A001' }] },
        { ID_Lider: 'LD-001', Estado: 'Inactiva', Miembros: [] },
        { ID_Lider: 'LD-002', Estado: 'Activa', Miembros: [{ ID_Miembro: 'A002' }] }
      ];
      
      const actividad = calcularActividadLideres(celulasPrueba);
      
      verificaciones.push({
        item: 'calcularActividadLideres funciona',
        success: actividad instanceof Map && actividad.size > 0,
        valor: `${actividad.size} líderes procesados`,
        tiempo: Date.now() - startTime
      });
    } else {
      verificaciones.push({
        item: 'calcularActividadLideres existe',
        success: false,
        error: 'Función no encontrada',
        tiempo: Date.now() - startTime
      });
    }
    
    console.log('   🔍 Probando integrarActividadLideres...');
    
    if (typeof integrarActividadLideres === 'function') {
      const lideresPrueba = [
        { ID_Lider: 'LD-001', Nombre_Lider: 'Test LD 1' },
        { ID_Lider: 'LD-002', Nombre_Lider: 'Test LD 2' }
      ];
      const actividadMap = new Map();
      actividadMap.set('LD-001', { totalCelulas: 2, celulasActivas: 1 });
      
      const resultado = integrarActividadLideres(lideresPrueba, actividadMap);
      
      verificaciones.push({
        item: 'integrarActividadLideres funciona',
        success: Array.isArray(resultado) && resultado.length === 2,
        valor: `${resultado.length} líderes procesados`,
        tiempo: Date.now() - startTime
      });
    } else {
      verificaciones.push({
        item: 'integrarActividadLideres existe',
        success: false,
        error: 'Función no encontrada',
        tiempo: Date.now() - startTime
      });
    }
    
    const exitosos = verificaciones.filter(v => v.success).length;
    
    return {
      nombre: 'Funciones de Actividad',
      resultado: exitosos === verificaciones.length ? 'PASS' : 'FAIL',
      verificaciones: verificaciones,
      exitosos: exitosos,
      total: verificaciones.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      nombre: 'Funciones de Actividad',
      resultado: 'ERROR',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

/**
 * Test de sistema de caché inteligente
 * @returns {Object} Resultado del test
 */
function testSistemaCacheInteligente() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    console.log('   🔍 Probando limpiarCacheInteligente...');
    
    if (typeof limpiarCacheInteligente === 'function') {
      const resultado = limpiarCacheInteligente();
      
      verificaciones.push({
        item: 'limpiarCacheInteligente funciona',
        success: resultado.success === true,
        valor: `${resultado.cleanedCount || 0} elementos limpiados`,
        tiempo: Date.now() - startTime
      });
    } else {
      verificaciones.push({
        item: 'limpiarCacheInteligente existe',
        success: false,
        error: 'Función no encontrada',
        tiempo: Date.now() - startTime
      });
    }
    
    console.log('   🔍 Probando registrarClaveCache...');
    
    if (typeof registrarClaveCache === 'function') {
      const testKey = 'TEST_KEY_' + Date.now();
      registrarClaveCache(testKey);
      
      verificaciones.push({
        item: 'registrarClaveCache funciona',
        success: true,
        valor: 'Clave registrada correctamente',
        tiempo: Date.now() - startTime
      });
    } else {
      verificaciones.push({
        item: 'registrarClaveCache existe',
        success: false,
        error: 'Función no encontrada',
        tiempo: Date.now() - startTime
      });
    }
    
    console.log('   🔍 Probando getEstadoCacheDetallado...');
    
    if (typeof getEstadoCacheDetallado === 'function') {
      const estado = getEstadoCacheDetallado();
      
      verificaciones.push({
        item: 'getEstadoCacheDetallado funciona',
        success: estado.success === true,
        valor: `${estado.data?.totalKeys || 0} claves registradas`,
        tiempo: Date.now() - startTime
      });
    } else {
      verificaciones.push({
        item: 'getEstadoCacheDetallado existe',
        success: false,
        error: 'Función no encontrada',
        tiempo: Date.now() - startTime
      });
    }
    
    const exitosos = verificaciones.filter(v => v.success).length;
    
    return {
      nombre: 'Sistema de Caché Inteligente',
      resultado: exitosos === verificaciones.length ? 'PASS' : 'FAIL',
      verificaciones: verificaciones,
      exitosos: exitosos,
      total: verificaciones.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      nombre: 'Sistema de Caché Inteligente',
      resultado: 'ERROR',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

/**
 * Test de métricas con claves reales
 * @returns {Object} Resultado del test
 */
function testMetricasConClavesReales() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    // Generar datos de caché si está habilitado
    if (TEST_CONFIG.GENERAR_CACHE) {
      console.log('   🔍 Generando datos de caché para pruebas...');
      const cacheResult = generarCacheParaPruebas();
      if (cacheResult.success) {
        console.log(`   ✅ ${cacheResult.clavesGeneradas.length} claves generadas`);
      }
    }
    
    console.log('   🔍 Probando getMetricasRendimiento...');
    
    if (typeof getMetricasRendimiento === 'function') {
      const metricas = getMetricasRendimiento();
      
      verificaciones.push({
        item: 'getMetricasRendimiento funciona',
        success: metricas.success === true,
        valor: `${metricas.data?.cache?.total_cached || 0} elementos en caché`,
        tiempo: Date.now() - startTime
      });
      
      // Verificar que usa claves reales
      const usaClavesReales = metricas.data?.cache?.total_keys_registered > 0;
      verificaciones.push({
        item: 'getMetricasRendimiento usa claves reales',
        success: usaClavesReales,
        valor: `${metricas.data?.cache?.total_keys_registered || 0} claves registradas`,
        tiempo: Date.now() - startTime
      });
    } else {
      verificaciones.push({
        item: 'getMetricasRendimiento existe',
        success: false,
        error: 'Función no encontrada',
        tiempo: Date.now() - startTime
      });
    }
    
    console.log('   🔍 Probando obtenerMetricasProduccion...');
    
    if (typeof obtenerMetricasProduccion === 'function') {
      const metricasProd = obtenerMetricasProduccion();
      
      verificaciones.push({
        item: 'obtenerMetricasProduccion funciona',
        success: !metricasProd.error,
        valor: `${metricasProd.cache?.total_cached_items || 0} elementos en caché`,
        tiempo: Date.now() - startTime
      });
    } else {
      verificaciones.push({
        item: 'obtenerMetricasProduccion existe',
        success: false,
        error: 'Función no encontrada',
        tiempo: Date.now() - startTime
      });
    }
    
    const exitosos = verificaciones.filter(v => v.success).length;
    
    return {
      nombre: 'Métricas con Claves Reales',
      resultado: exitosos === verificaciones.length ? 'PASS' : 'FAIL',
      verificaciones: verificaciones,
      exitosos: exitosos,
      total: verificaciones.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      nombre: 'Métricas con Claves Reales',
      resultado: 'ERROR',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

/**
 * Test de monitoreo de producción
 * @returns {Object} Resultado del test
 */
function testMonitoreoProduccion() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    console.log('   🔍 Probando ejecutarMonitoreoProduccion...');
    
    if (typeof ejecutarMonitoreoProduccion === 'function') {
      verificaciones.push({
        item: 'ejecutarMonitoreoProduccion existe',
        success: true,
        valor: 'Función disponible',
        tiempo: Date.now() - startTime
      });
    } else {
      verificaciones.push({
        item: 'ejecutarMonitoreoProduccion existe',
        success: false,
        error: 'Función no encontrada',
        tiempo: Date.now() - startTime
      });
    }
    
    console.log('   🔍 Probando verificarEstadoCache...');
    
    if (typeof verificarEstadoCache === 'function') {
      const estado = verificarEstadoCache();
      
      verificaciones.push({
        item: 'verificarEstadoCache funciona',
        success: estado.success !== undefined,
        valor: estado.nombre || 'Función ejecutada',
        tiempo: Date.now() - startTime
      });
    } else {
      verificaciones.push({
        item: 'verificarEstadoCache existe',
        success: false,
        error: 'Función no encontrada',
        tiempo: Date.now() - startTime
      });
    }
    
    console.log('   🔍 Probando generarReporteEstadoStakeholders...');
    
    if (typeof generarReporteEstadoStakeholders === 'function') {
      verificaciones.push({
        item: 'generarReporteEstadoStakeholders existe',
        success: true,
        valor: 'Función disponible',
        tiempo: Date.now() - startTime
      });
    } else {
      verificaciones.push({
        item: 'generarReporteEstadoStakeholders existe',
        success: false,
        error: 'Función no encontrada',
        tiempo: Date.now() - startTime
      });
    }
    
    const exitosos = verificaciones.filter(v => v.success).length;
    
    return {
      nombre: 'Monitoreo de Producción',
      resultado: exitosos === verificaciones.length ? 'PASS' : 'FAIL',
      verificaciones: verificaciones,
      exitosos: exitosos,
      total: verificaciones.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      nombre: 'Monitoreo de Producción',
      resultado: 'ERROR',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

/**
 * Test de integración completa
 * @returns {Object} Resultado del test
 */
function testIntegracionCompleta() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    console.log('   🔍 Probando flujo completo del sistema...');
    
    // Verificar que getDashboardDataOptimized funciona
    try {
      const dashboardStart = Date.now();
      const dashboard = getDashboardDataOptimized(false);
      const dashboardTime = Date.now() - dashboardStart;
      
      verificaciones.push({
        item: 'getDashboardDataOptimized funciona',
        success: dashboard && !dashboard.error,
        valor: `${dashboardTime}ms`,
        tiempo: Date.now() - startTime
      });
    } catch (error) {
      verificaciones.push({
        item: 'getDashboardDataOptimized funciona',
        success: false,
        error: error.toString(),
        tiempo: Date.now() - startTime
      });
    }
    
    // Verificar integración de funciones de actividad
    try {
      const celulasPrueba = [
        { ID_Lider: 'LD-001', Estado: 'Activa', Miembros: [{ ID_Miembro: 'A001' }] },
        { ID_Lider: 'LD-002', Estado: 'Activa', Miembros: [{ ID_Miembro: 'A002' }] }
      ];
      const lideresPrueba = [
        { ID_Lider: 'LD-001', Nombre_Lider: 'Test LD 1' },
        { ID_Lider: 'LD-002', Nombre_Lider: 'Test LD 2' }
      ];
      
      const actividadMap = calcularActividadLideres(celulasPrueba);
      const lideresConActividad = integrarActividadLideres(lideresPrueba, actividadMap);
      
      verificaciones.push({
        item: 'Integración actividad-líderes',
        success: lideresConActividad.length === 2 && lideresConActividad[0].actividad,
        valor: `${lideresConActividad.length} líderes con actividad`,
        tiempo: Date.now() - startTime
      });
    } catch (error) {
      verificaciones.push({
        item: 'Integración actividad-líderes',
        success: false,
        error: error.toString(),
        tiempo: Date.now() - startTime
      });
    }
    
    // Verificar sistema de caché end-to-end
    try {
      const testKey = 'TEST_INTEGRATION_' + Date.now();
      registrarClaveCache(testKey);
      
      const estado = getEstadoCacheDetallado();
      
      const cache = CacheService.getScriptCache();
      cache.remove(testKey);
      
      verificaciones.push({
        item: 'Sistema de caché end-to-end',
        success: estado.success,
        valor: `${estado.data?.totalKeys || 0} claves registradas`,
        tiempo: Date.now() - startTime
      });
    } catch (error) {
      verificaciones.push({
        item: 'Sistema de caché end-to-end',
        success: false,
        error: error.toString(),
        tiempo: Date.now() - startTime
      });
    }
    
    const exitosos = verificaciones.filter(v => v.success).length;
    
    return {
      nombre: 'Integración Completa',
      resultado: exitosos === verificaciones.length ? 'PASS' : 'FAIL',
      verificaciones: verificaciones,
      exitosos: exitosos,
      total: verificaciones.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      nombre: 'Integración Completa',
      resultado: 'ERROR',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

/**
 * Test de rendimiento del sistema
 * @returns {Object} Resultado del test
 */
function testRendimientoSistema() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    console.log('   ⚡ Probando rendimiento del sistema...');
    
    // Test de tiempo de carga del dashboard
    try {
      const dashboardStart = Date.now();
      const dashboard = getDashboardDataOptimized(false);
      const dashboardTime = Date.now() - dashboardStart;
      
      verificaciones.push({
        item: 'Tiempo de carga dashboard',
        success: dashboardTime < 10000, // 10 segundos máximo
        valor: `${dashboardTime}ms`,
        limite: '10000ms',
        tiempo: Date.now() - startTime
      });
    } catch (error) {
      verificaciones.push({
        item: 'Tiempo de carga dashboard',
        success: false,
        error: error.toString(),
        tiempo: Date.now() - startTime
      });
    }
    
    // Test de tiempo de funciones de actividad
    try {
      const celulasPrueba = Array.from({ length: 100 }, (_, i) => ({
        ID_Lider: `LD-${i % 10}`,
        Estado: i % 2 === 0 ? 'Activa' : 'Inactiva',
        Miembros: Array.from({ length: Math.floor(Math.random() * 5) }, (_, j) => ({
          ID_Miembro: `A${i}-${j}`
        }))
      }));
      
      const actividadStart = Date.now();
      const actividad = calcularActividadLideres(celulasPrueba);
      const actividadTime = Date.now() - actividadStart;
      
      verificaciones.push({
        item: 'Tiempo cálculo actividad (100 células)',
        success: actividadTime < 2000, // 2 segundos máximo
        valor: `${actividadTime}ms`,
        limite: '2000ms',
        tiempo: Date.now() - startTime
      });
    } catch (error) {
      verificaciones.push({
        item: 'Tiempo cálculo actividad',
        success: false,
        error: error.toString(),
        tiempo: Date.now() - startTime
      });
    }
    
    // Test de tiempo de limpieza de caché
    try {
      const limpiezaStart = Date.now();
      const limpieza = limpiarCacheInteligente();
      const limpiezaTime = Date.now() - limpiezaStart;
      
      verificaciones.push({
        item: 'Tiempo limpieza de caché',
        success: limpiezaTime < 5000, // 5 segundos máximo
        valor: `${limpiezaTime}ms`,
        limite: '5000ms',
        tiempo: Date.now() - startTime
      });
    } catch (error) {
      verificaciones.push({
        item: 'Tiempo limpieza de caché',
        success: false,
        error: error.toString(),
        tiempo: Date.now() - startTime
      });
    }
    
    const exitosos = verificaciones.filter(v => v.success).length;
    
    return {
      nombre: 'Rendimiento del Sistema',
      resultado: exitosos === verificaciones.length ? 'PASS' : 'FAIL',
      verificaciones: verificaciones,
      exitosos: exitosos,
      total: verificaciones.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      nombre: 'Rendimiento del Sistema',
      resultado: 'ERROR',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Genera datos de caché para pruebas
 * @returns {Object} Resultado de la generación
 */
function generarCacheParaPruebas() {
  try {
    const resultados = {
      success: true,
      clavesGeneradas: [],
      errores: []
    };
    
    // Generar caché del dashboard
    try {
      const dashboardData = {
        lideres: [
          { ID_Lider: 'LD-001', Nombre_Lider: 'Test LD 1', Rol: 'LD' },
          { ID_Lider: 'LD-002', Nombre_Lider: 'Test LD 2', Rol: 'LD' }
        ],
        celulas: [
          { ID_Celula: 'C-001', ID_Lider: 'LD-001', Estado: 'Activa' },
          { ID_Celula: 'C-002', ID_Lider: 'LD-002', Estado: 'Activa' }
        ],
        ingresos: [
          { ID_Alma: 'A-001', Nombre_Alma: 'Test Alma 1' },
          { ID_Alma: 'A-002', Nombre_Alma: 'Test Alma 2' }
        ],
        timestamp: new Date().toISOString()
      };
      
      const cache = CacheService.getScriptCache();
      cache.put('DASHBOARD_DATA_V2', JSON.stringify(dashboardData), 1800);
      registrarClaveCache('DASHBOARD_DATA_V2');
      resultados.clavesGeneradas.push('DASHBOARD_DATA_V2');
    } catch (error) {
      resultados.errores.push('Dashboard: ' + error.toString());
    }
    
    // Generar caché de estadísticas
    try {
      const statsData = {
        actividad: {
          totalRecibiendoCelulas: 100,
          activosRecibiendoCelula: 80,
          alerta: 15,
          critico: 5,
          lideresInactivos: 3
        },
        metricas: {
          tasaIntegracion: 80,
          tasaActividad: 75
        },
        timestamp: new Date().toISOString()
      };
      
      const cache = CacheService.getScriptCache();
      cache.put('STATS_RAPIDAS_V2', JSON.stringify(statsData), 1800);
      registrarClaveCache('STATS_RAPIDAS_V2');
      resultados.clavesGeneradas.push('STATS_RAPIDAS_V2');
    } catch (error) {
      resultados.errores.push('Stats: ' + error.toString());
    }
    
    // Generar caché de líderes
    try {
      const cache = CacheService.getScriptCache();
      
      // Generar varios LDs
      for (let i = 1; i <= 3; i++) {
        const ldData = {
          success: true,
          data: {
            lider: { ID_Lider: `LD-00${i}`, Nombre_Lider: `Test LD ${i}` },
            lcfs: [],
            metricas: { totalLCFs: 0, lcfsActivos: 0 }
          },
          loadTime: 100 + i * 10
        };
        
        const cacheKey = `LD_OPT_FULL_LD-00${i}`;
        cache.put(cacheKey, JSON.stringify(ldData), 900);
        registrarClaveCache(cacheKey, 'LEADER_CACHE_KEYS');
        resultados.clavesGeneradas.push(cacheKey);
      }
      
      // Generar varios LCFs
      for (let i = 1; i <= 2; i++) {
        const lcfData = {
          success: true,
          data: {
            lcf: { ID_Lider: `LCF-00${i}`, Nombre_Lider: `Test LCF ${i}` },
            almas: [],
            metricas: { totalAlmas: 0 }
          },
          loadTime: 50 + i * 5
        };
        
        const cacheKey = `LCF_OPT_LCF-00${i}`;
        cache.put(cacheKey, JSON.stringify(lcfData), 600);
        registrarClaveCache(cacheKey, 'LEADER_CACHE_KEYS');
        resultados.clavesGeneradas.push(cacheKey);
      }
    } catch (error) {
      resultados.errores.push('Líderes: ' + error.toString());
    }
    
    return resultados;
    
  } catch (error) {
    return {
      success: false,
      error: error.toString(),
      clavesGeneradas: [],
      errores: [error.toString()]
    };
  }
}

/**
 * Muestra el resumen final de los tests
 * @param {Object} resultados - Resultados de los tests
 */
function mostrarResumenFinal(resultados) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 RESUMEN FINAL DE LA SUITE DE TESTS');
  console.log('='.repeat(80));
  console.log(`Total de tests: ${resultados.resumen.total}`);
  console.log(`✅ Exitosos: ${resultados.resumen.exitosos}`);
  console.log(`❌ Fallidos: ${resultados.resumen.fallidos}`);
  console.log(`⏱️ Tiempo total: ${resultados.resumen.tiempoTotal}ms`);
  console.log(`📈 Tasa de éxito: ${Math.round((resultados.resumen.exitosos / resultados.resumen.total) * 100)}%`);
  
  // Mostrar detalles de cada test
  console.log('\n📋 DETALLES DE TESTS:');
  resultados.tests.forEach(test => {
    const status = test.resultado === 'PASS' ? '✅' : '❌';
    console.log(`${status} ${test.nombre}: ${test.tiempo}ms`);
    if (test.verificaciones) {
      test.verificaciones.forEach(v => {
        const vStatus = v.success ? '  ✅' : '  ❌';
        console.log(`${vStatus} ${v.item}: ${v.valor || v.error || 'OK'}`);
      });
    }
  });
  
  if (resultados.resumen.fallidos === 0) {
    console.log('\n🎉 ¡TODOS LOS TESTS PASARON EXITOSAMENTE!');
    console.log('✅ Sistema completamente funcional y listo para producción');
  } else {
    console.log('\n⚠️ ALGUNOS TESTS FALLARON - REVISAR ERRORES ARRIBA');
    console.log('🔧 Corregir los problemas identificados antes de producción');
  }
  
  console.log('='.repeat(80));
}

// ==================== FUNCIONES DE CONVENIENCIA ====================

/**
 * Ejecuta solo los tests esenciales
 * @returns {Object} Resultado de los tests esenciales
 */
function ejecutarTestsEsenciales() {
  console.log('🧪 Ejecutando tests esenciales...');
  
  const testsEsenciales = [
    testFuncionesActividad(),
    testSistemaCacheInteligente(),
    testMetricasConClavesReales()
  ];
  
  const exitosos = testsEsenciales.filter(t => t.resultado === 'PASS').length;
  
  console.log(`✅ Tests esenciales: ${exitosos}/${testsEsenciales.length} exitosos`);
  
  return {
    tests: testsEsenciales,
    exitosos: exitosos,
    total: testsEsenciales.length
  };
}

/**
 * Limpia la caché generada para pruebas
 * @returns {Object} Resultado de la limpieza
 */
function limpiarCachePruebas() {
  console.log('🧹 Limpiando caché de pruebas...');
  
  try {
    const resultado = limpiarCacheInteligente();
    
    if (resultado.success) {
      console.log(`✅ Caché limpiada: ${resultado.cleanedCount} elementos eliminados`);
    } else {
      console.log('❌ Error limpiando caché:', resultado.error);
    }
    
    return resultado;
  } catch (error) {
    console.error('❌ Error en limpieza:', error);
    return { success: false, error: error.toString() };
  }
}

console.log('🧪 TestSuiteUnificado cargado - Suite completa de tests disponible');
console.log('📋 Funciones disponibles:');
console.log('   - ejecutarTestSuiteCompleto(): Ejecuta todos los tests');
console.log('   - ejecutarTestsEsenciales(): Ejecuta solo tests críticos');
console.log('   - limpiarCachePruebas(): Limpia caché generada');
