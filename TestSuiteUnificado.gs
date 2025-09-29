/**
 * @fileoverview Suite unificada de tests para el Portal de Supervisión
 * Consolida todos los tests en un solo archivo para mejor mantenimiento
 */

// ==================== CONFIGURACIÓN DE TESTS ====================

const TEST_SUITE_CONFIG = {
  // IDs de prueba (deben existir en los datos reales)
  TEST_LD_ID: 'LD-4003',
  TEST_LCF_ID: 'LCF-1010',
  TEST_ALMA_ID: 'A001',
  
  // Configuración de validación
  VALIDATE_STRUCTURE: true,
  VALIDATE_DATA_TYPES: true,
  VALIDATE_REQUIRED_FIELDS: true,
  
  // Límites de tiempo (en ms)
  MAX_LOAD_TIME: 30000,        // 30 segundos para carga completa
  MAX_QUICK_SEARCH_TIME: 1000, // 1 segundo para búsqueda rápida
  MAX_INDIVIDUAL_LOAD_TIME: 5000 // 5 segundos para funciones individuales
};

// ==================== TESTS DE CONFIGURACIÓN ====================

/**
 * Test de configuración básica
 */
function testConfiguracion() {
  console.log('🧪 [TEST] Iniciando test de configuración...');
  
  try {
    // Verificar que CONFIG existe
    if (typeof CONFIG === 'undefined') {
      throw new Error('CONFIG no está definido');
    }
    
    // Verificar propiedades básicas
    if (!CONFIG.SHEETS) {
      throw new Error('CONFIG.SHEETS no está definido');
    }
    
    if (!CONFIG.TABS) {
      throw new Error('CONFIG.TABS no está definido');
    }
    
    if (!CONFIG.CACHE) {
      throw new Error('CONFIG.CACHE no está definido');
    }
    
    console.log('✅ [TEST] Configuración básica correcta');
    console.log(`   - SHEETS: ${Object.keys(CONFIG.SHEETS).length} configurados`);
    console.log(`   - TABS: ${Object.keys(CONFIG.TABS).length} configurados`);
    console.log(`   - CACHE: ${CONFIG.CACHE.DURATION}s duración`);
    
    return { success: true, message: 'Configuración correcta' };
    
  } catch (error) {
    console.log('❌ [TEST] Error en configuración:', error.message);
    return { success: false, error: error.message };
  }
}

// ==================== TESTS DE FUNCIONES INDIVIDUALES ====================

/**
 * Test de funciones optimizadas individuales
 */
function testFuncionesOptimizadas() {
  console.log('🧪 [TEST] Iniciando test de funciones optimizadas...');
  
  const resultados = {
    lideres: null,
    celulas: null,
    ingresos: null
  };
  
  try {
    // Test cargarLideresOptimizado
    console.log('   📊 Probando cargarLideresOptimizado...');
    const t1 = Date.now();
    const lideres = cargarLideresOptimizado();
    const tiempo1 = Date.now() - t1;
    
    resultados.lideres = {
      cantidad: lideres.length,
      tiempo: tiempo1,
      exitoso: tiempo1 < TEST_SUITE_CONFIG.MAX_INDIVIDUAL_LOAD_TIME
    };
    
    console.log(`   ✅ Líderes: ${lideres.length} en ${tiempo1}ms`);
    
    // Test cargarCelulasOptimizado
    console.log('   📊 Probando cargarCelulasOptimizado...');
    const t2 = Date.now();
    const celulas = cargarCelulasOptimizado();
    const tiempo2 = Date.now() - t2;
    
    resultados.celulas = {
      cantidad: celulas.length,
      tiempo: tiempo2,
      exitoso: tiempo2 < TEST_SUITE_CONFIG.MAX_INDIVIDUAL_LOAD_TIME
    };
    
    console.log(`   ✅ Células: ${celulas.length} en ${tiempo2}ms`);
    
    // Test cargarIngresosOptimizado
    console.log('   📊 Probando cargarIngresosOptimizado...');
    const t3 = Date.now();
    const ingresos = cargarIngresosOptimizado();
    const tiempo3 = Date.now() - t3;
    
    resultados.ingresos = {
      cantidad: ingresos.length,
      tiempo: tiempo3,
      exitoso: tiempo3 < TEST_SUITE_CONFIG.MAX_INDIVIDUAL_LOAD_TIME
    };
    
    console.log(`   ✅ Ingresos: ${ingresos.length} en ${tiempo3}ms`);
    
    const todosExitosos = Object.values(resultados).every(r => r.exitoso);
    console.log(`\n📊 RESULTADO: ${todosExitosos ? '✅ TODAS LAS FUNCIONES OPTIMIZADAS' : '⚠️ ALGUNAS FUNCIONES LENTAS'}`);
    
    return { success: todosExitosos, resultados: resultados };
    
  } catch (error) {
    console.log('❌ [TEST] Error en funciones optimizadas:', error);
    return { success: false, error: error.toString(), resultados: resultados };
  }
}

// ==================== TESTS DE CACHÉ ====================

/**
 * Test de sistema de caché fragmentado
 */
function testCacheFragmentado() {
  console.log('🧪 [TEST] Iniciando test de caché fragmentado...');
  
  try {
    // Limpiar caché
    clearCache();
    
    // Crear datos de prueba
    const testData = {
      lideres: Array.from({length: 100}, (_, i) => ({
        ID_Lider: `LCF-${1000 + i}`,
        Nombre_Lider: `Líder ${i + 1}`,
        Rol: 'LCF',
        Estado_Actividad: 'Activo'
      })),
      celulas: Array.from({length: 50}, (_, i) => ({
        ID_Celula: `C-${2000 + i}`,
        ID_LCF_Responsable: `LCF-${1000 + (i % 100)}`,
        Total_Miembros: Math.floor(Math.random() * 10) + 1
      })),
      ingresos: Array.from({length: 200}, (_, i) => ({
        ID_Alma: `A-${3000 + i}`,
        ID_LCF: `LCF-${1000 + (i % 100)}`,
        Nombre: `Alma ${i + 1}`
      })),
      timestamp: new Date().toISOString()
    };
    
    // Guardar en caché
    console.log('   💾 Guardando datos en caché...');
    setCacheData(testData);
    
    // Verificar información de caché
    const cacheInfo = getCacheInfo();
    console.log(`   📊 Tipo de caché: ${cacheInfo.type}`);
    console.log(`   📊 Fragmentos: ${cacheInfo.fragments}`);
    console.log(`   📊 Tamaño: ${cacheInfo.sizeKB}KB`);
    
    // Recuperar de caché
    console.log('   🔄 Recuperando datos de caché...');
    const cachedData = getCacheData();
    
    const exitoso = cachedData && 
                   cachedData.lideres.length === testData.lideres.length &&
                   cachedData.celulas.length === testData.celulas.length &&
                   cachedData.ingresos.length === testData.ingresos.length;
    
    console.log(`\n📊 RESULTADO: ${exitoso ? '✅ CACHÉ FRAGMENTADO FUNCIONANDO' : '❌ PROBLEMA CON CACHÉ'}`);
    
    return { success: exitoso, cacheInfo: cacheInfo };
    
  } catch (error) {
    console.log('❌ [TEST] Error en caché fragmentado:', error);
    return { success: false, error: error.toString() };
  }
}

// ==================== TESTS DE BÚSQUEDA RÁPIDA ====================

/**
 * Test de búsqueda rápida de LD
 */
function testBusquedaRapida() {
  console.log('🧪 [TEST] Iniciando test de búsqueda rápida...');
  
  try {
    // Limpiar caché específica
    const cache = CacheService.getScriptCache();
    cache.remove(`LD_QUICK_${TEST_SUITE_CONFIG.TEST_LD_ID}`);
    
    // Ejecutar búsqueda rápida
    const startTime = Date.now();
    const resultado = buscarLDRapido(TEST_SUITE_CONFIG.TEST_LD_ID);
    const tiempo = Date.now() - startTime;
    
    console.log(`   ⏱️ Tiempo: ${tiempo}ms (objetivo: <${TEST_SUITE_CONFIG.MAX_QUICK_SEARCH_TIME}ms)`);
    console.log(`   ✅ Success: ${resultado.success}`);
    
    if (resultado.success && resultado.ld) {
      console.log(`   👤 LD encontrado: ${resultado.ld.Nombre}`);
      console.log(`   🆔 ID: ${resultado.ld.ID}`);
      console.log(`   🎭 Rol: ${resultado.ld.Rol}`);
    }
    
    const exitoso = tiempo < TEST_SUITE_CONFIG.MAX_QUICK_SEARCH_TIME && resultado.success;
    console.log(`\n📊 RESULTADO: ${exitoso ? '✅ BÚSQUEDA RÁPIDA FUNCIONANDO' : '❌ BÚSQUEDA LENTA O FALLIDA'}`);
    
    return { success: exitoso, tiempo: tiempo, resultado: resultado };
    
  } catch (error) {
    console.log('❌ [TEST] Error en búsqueda rápida:', error);
    return { success: false, error: error.toString() };
  }
}

// ==================== TESTS DE CARGA COMPLETA ====================

/**
 * Test de carga completa optimizada
 */
function testCargaCompleta() {
  console.log('🧪 [TEST] Iniciando test de carga completa...');
  
  try {
    // Limpiar caché
    clearCache();
    
    const startTime = Date.now();
    const directorio = cargarDirectorioCompleto(true); // forceReload = true
    const tiempo = Date.now() - startTime;
    
    console.log(`   ⏱️ Tiempo total: ${tiempo}ms (${(tiempo/1000).toFixed(1)}s)`);
    console.log(`   📊 Líderes: ${directorio.lideres ? directorio.lideres.length : 0}`);
    console.log(`   📊 Células: ${directorio.celulas ? directorio.celulas.length : 0}`);
    console.log(`   📊 Ingresos: ${directorio.ingresos ? directorio.ingresos.length : 0}`);
    
    const exitoso = tiempo < TEST_SUITE_CONFIG.MAX_LOAD_TIME && 
                   directorio.lideres && directorio.lideres.length > 0;
    
    console.log(`\n📊 RESULTADO: ${exitoso ? '✅ CARGA COMPLETA OPTIMIZADA' : '❌ CARGA AÚN LENTA'}`);
    
    return { 
      success: exitoso, 
      tiempo: tiempo, 
      datos: {
        lideres: directorio.lideres ? directorio.lideres.length : 0,
        celulas: directorio.celulas ? directorio.celulas.length : 0,
        ingresos: directorio.ingresos ? directorio.ingresos.length : 0
      }
    };
    
  } catch (error) {
    console.log('❌ [TEST] Error en carga completa:', error);
    return { success: false, error: error.toString() };
  }
}

// ==================== TESTS DE FUNCIONALIDAD ====================

/**
 * Test de getDatosLD optimizado
 */
function testGetDatosLDOptimizado() {
  console.log('🧪 [TEST] Iniciando test de getDatosLD optimizado...');
  
  try {
    // Limpiar caché específica
    const cache = CacheService.getScriptCache();
    cache.remove(`LD_QUICK_${TEST_SUITE_CONFIG.TEST_LD_ID}`);
    cache.remove(`LD_BASIC_${TEST_SUITE_CONFIG.TEST_LD_ID}`);
    
    // Test modo básico (debe usar búsqueda rápida)
    console.log('   🔍 Probando modo básico...');
    const startTime1 = Date.now();
    const resultadoBasico = getDatosLD(TEST_SUITE_CONFIG.TEST_LD_ID, false);
    const tiempo1 = Date.now() - startTime1;
    
    console.log(`   ⏱️ Modo básico: ${tiempo1}ms`);
    console.log(`   ✅ Success: ${resultadoBasico.success}`);
    
    // Test modo completo (método tradicional)
    console.log('   🔍 Probando modo completo...');
    const startTime2 = Date.now();
    const resultadoCompleto = getDatosLD(TEST_SUITE_CONFIG.TEST_LD_ID, true);
    const tiempo2 = Date.now() - startTime2;
    
    console.log(`   ⏱️ Modo completo: ${tiempo2}ms`);
    console.log(`   ✅ Success: ${resultadoCompleto.success}`);
    
    const exitoso = resultadoBasico.success && resultadoCompleto.success;
    console.log(`\n📊 RESULTADO: ${exitoso ? '✅ getDatosLD OPTIMIZADO FUNCIONANDO' : '❌ PROBLEMA CON getDatosLD'}`);
    
    return { 
      success: exitoso, 
      basico: { tiempo: tiempo1, resultado: resultadoBasico },
      completo: { tiempo: tiempo2, resultado: resultadoCompleto }
    };
    
  } catch (error) {
    console.log('❌ [TEST] Error en getDatosLD optimizado:', error);
    return { success: false, error: error.toString() };
  }
}

// ==================== TESTS INTEGRADOS ====================

/**
 * Test completo del sistema optimizado
 */
function testSistemaCompleto() {
  console.log('🚀 ===========================================');
  console.log('🧪 TEST COMPLETO DEL SISTEMA OPTIMIZADO');
  console.log('🚀 ===========================================');
  
  const resultados = {
    configuracion: null,
    funcionesOptimizadas: null,
    cacheFragmentado: null,
    busquedaRapida: null,
    cargaCompleta: null,
    getDatosLD: null
  };
  
  try {
    // Test 1: Configuración
    console.log('\n1️⃣ TEST DE CONFIGURACIÓN');
    resultados.configuracion = testConfiguracion();
    
    // Test 2: Funciones optimizadas
    console.log('\n2️⃣ TEST DE FUNCIONES OPTIMIZADAS');
    resultados.funcionesOptimizadas = testFuncionesOptimizadas();
    
    // Test 3: Caché fragmentado
    console.log('\n3️⃣ TEST DE CACHÉ FRAGMENTADO');
    resultados.cacheFragmentado = testCacheFragmentado();
    
    // Test 4: Búsqueda rápida
    console.log('\n4️⃣ TEST DE BÚSQUEDA RÁPIDA');
    resultados.busquedaRapida = testBusquedaRapida();
    
    // Test 5: Carga completa
    console.log('\n5️⃣ TEST DE CARGA COMPLETA');
    resultados.cargaCompleta = testCargaCompleta();
    
    // Test 6: getDatosLD optimizado
    console.log('\n6️⃣ TEST DE getDatosLD OPTIMIZADO');
    resultados.getDatosLD = testGetDatosLDOptimizado();
    
    // Resumen final
    const testsExitosos = Object.values(resultados).filter(r => r && r.success).length;
    const totalTests = Object.keys(resultados).length;
    
    console.log('\n🎯 ===========================================');
    console.log('📊 RESUMEN FINAL DEL TEST COMPLETO');
    console.log('🎯 ===========================================');
    console.log(`✅ Tests exitosos: ${testsExitosos}/${totalTests}`);
    
    // Detalle de resultados
    Object.entries(resultados).forEach(([test, resultado], index) => {
      if (resultado) {
        const status = resultado.success ? '✅' : '❌';
        console.log(`${index + 1}️⃣ ${test}: ${status} ${resultado.success ? 'EXITOSO' : 'FALLÓ'}`);
      }
    });
    
    const sistemaExitoso = testsExitosos === totalTests;
    console.log(`\n🎉 SISTEMA: ${sistemaExitoso ? '✅ COMPLETAMENTE OPTIMIZADO' : '⚠️ PARCIALMENTE OPTIMIZADO'}`);
    
    return {
      success: sistemaExitoso,
      testsExitosos: testsExitosos,
      totalTests: totalTests,
      resultados: resultados
    };
    
  } catch (error) {
    console.error('❌ ERROR CRÍTICO EN TEST COMPLETO:', error);
    return {
      success: false,
      error: error.toString(),
      resultados: resultados
    };
  }
}

// ==================== FUNCIONES DE UTILIDAD ====================

/**
 * Ejecuta todos los tests de forma rápida
 */
function ejecutarTodosLosTests() {
  console.log('🚀 Ejecutando todos los tests...');
  return testSistemaCompleto();
}

/**
 * Ejecuta solo tests de rendimiento
 */
function ejecutarTestsRendimiento() {
  console.log('⚡ Ejecutando tests de rendimiento...');
  
  const resultados = {
    funcionesOptimizadas: testFuncionesOptimizadas(),
    busquedaRapida: testBusquedaRapida(),
    cargaCompleta: testCargaCompleta()
  };
  
  const exitosos = Object.values(resultados).filter(r => r.success).length;
  const total = Object.keys(resultados).length;
  
  console.log(`\n📊 Tests de rendimiento: ${exitosos}/${total} exitosos`);
  return { success: exitosos === total, resultados: resultados };
}

console.log('🧪 TestSuiteUnificado cargado - Ejecuta ejecutarTodosLosTests() o testSistemaCompleto()');
