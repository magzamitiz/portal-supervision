/**
 * @fileoverview Script temporal para limpiar caché y probar carga de datos
 */

/**
 * Limpia el caché y fuerza recarga de datos
 */
function testLimpiarCacheYRecargar() {
  console.log('🧹 Limpiando caché...');
  
  // Limpiar caché
  clearCache();
  console.log('✅ Caché limpiado');
  
  // Forzar recarga
  console.log('🔄 Forzando recarga de datos...');
  const datos = cargarDirectorioCompleto(true);
  
  console.log('📊 Resultado de recarga:');
  console.log(`  - Líderes: ${datos.lideres ? datos.lideres.length : 0}`);
  console.log(`  - Células: ${datos.celulas ? datos.celulas.length : 0}`);
  console.log(`  - Ingresos: ${datos.ingresos ? datos.ingresos.length : 0}`);
  console.log(`  - Error: ${datos.error || 'Ninguno'}`);
  
  return datos;
}

/**
 * Limpia todo el caché del script (incluyendo caché de LDs individuales)
 */
function limpiarTodoElCache() {
  console.log('🧹 Limpiando TODO el caché...');
  
  try {
    const cache = CacheService.getScriptCache();
    
    // Limpiar keys específicos conocidos
    cache.removeAll([
      'DASHBOARD_DATA_V2',
      'LD_FULL_LD-4003',
      'LD_FULL_LD-4001',
      'LD_BASIC_LD-4003',
      'LD_BASIC_LD-4001'
    ]);
    
    console.log('✅ Caché de LDs limpiado');
    
    // También limpiar el caché de cargarDirectorioCompleto
    clearCache();
    
    console.log('✅ TODO el caché ha sido limpiado');
    
    return { success: true, message: 'Caché limpiado completamente' };
    
  } catch (error) {
    console.error('❌ Error limpiando caché:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Test para verificar que LD-4003 se puede encontrar después de limpiar caché
 */
function testBuscarLD4003() {
  console.log('🔍 Test: Buscando LD-4003...');
  
  // Limpiar TODO el caché primero
  limpiarTodoElCache();
  
  // Intentar obtener datos del LD
  const resultado = getDatosLD('LD-4003', true);
  
  console.log('📊 Resultado:');
  console.log(`  - Success: ${resultado.success}`);
  console.log(`  - Tiene resumen: ${!!resultado.resumen}`);
  console.log(`  - Error: ${resultado.error || 'Ninguno'}`);
  
  if (resultado.success && resultado.resumen) {
    console.log('✅ LD-4003 encontrado con estructura correcta');
    console.log(`  - Nombre: ${resultado.resumen.ld?.Nombre_Lider || 'N/A'}`);
    console.log(`  - Total LCF: ${resultado.resumen.Total_LCF || 0}`);
    console.log(`  - Total Células: ${resultado.resumen.Total_Celulas || 0}`);
    console.log(`  - Total Miembros: ${resultado.resumen.Total_Miembros || 0}`);
    console.log(`  - Total Ingresos: ${resultado.resumen.Total_Ingresos || 0}`);
  } else {
    console.log('❌ LD-4003 NO encontrado o estructura incorrecta');
  }
  
  return resultado;
}

/**
 * Test completo del sistema optimizado
 * Incluye fragmentación de caché, búsqueda rápida y recuperación
 */
function testSistemaCompleto() {
  console.log('🚀 ===========================================');
  console.log('🧪 INICIANDO TEST COMPLETO DEL SISTEMA');
  console.log('🚀 ===========================================');
  
  const resultados = {
    fragmentacion: null,
    busquedaRapida: null,
    recuperacionCache: null,
    busquedaCompleta: null
  };
  
  let tiempoTotal = Date.now();
  
  try {
    // ===========================================
    // TEST 1: FRAGMENTACIÓN DE CACHÉ
    // ===========================================
    console.log('\n📦 TEST 1: FRAGMENTACIÓN DE CACHÉ');
    console.log('-----------------------------------');
    
    const test1Start = Date.now();
    
    // Limpiar caché completamente
    console.log('🧹 Limpiando caché completamente...');
    clearCache();
    
    // Cargar directorio completo
    console.log('📊 Cargando directorio completo...');
    const directorio = cargarDirectorioCompleto(true);
    
    const test1Time = Date.now() - test1Start;
    const test1TimeSeconds = (test1Time / 1000).toFixed(1);
    
    // Verificar información de caché
    const cacheInfo = getCacheInfo();
    console.log('📈 Información de caché:');
    console.log(`  - Tipo: ${cacheInfo.type}`);
    console.log(`  - Fragmentos: ${cacheInfo.fragments}`);
    console.log(`  - Tamaño: ${cacheInfo.sizeKB}KB`);
    console.log(`  - Tiempo: ${test1TimeSeconds}s`);
    
    // Verificar datos cargados
    const tieneDatos = directorio.lideres && directorio.lideres.length > 0;
    const cumpleObjetivo = test1Time < 30000; // < 30 segundos
    
    resultados.fragmentacion = {
      success: tieneDatos && cumpleObjetivo,
      tiempo: test1Time,
      tiempoSegundos: test1TimeSeconds,
      cumpleObjetivo: cumpleObjetivo,
      tipo: cacheInfo.type,
      fragmentos: cacheInfo.fragments,
      tamañoKB: cacheInfo.sizeKB,
      lideres: directorio.lideres ? directorio.lideres.length : 0,
      celulas: directorio.celulas ? directorio.celulas.length : 0,
      ingresos: directorio.ingresos ? directorio.ingresos.length : 0
    };
    
    if (resultados.fragmentacion.success) {
      console.log('✅ TEST 1 EXITOSO: Fragmentación funcionando correctamente');
    } else {
      console.log('❌ TEST 1 FALLÓ: Problemas con fragmentación o tiempo');
    }
    
    // ===========================================
    // TEST 2: BÚSQUEDA RÁPIDA
    // ===========================================
    console.log('\n⚡ TEST 2: BÚSQUEDA RÁPIDA');
    console.log('----------------------------');
    
    const test2Start = Date.now();
    
    // Limpiar caché específica de LD
    const cache = CacheService.getScriptCache();
    cache.remove('LD_QUICK_LD-4003');
    
    console.log('🔍 Ejecutando buscarLDRapido("LD-4003")...');
    const busquedaRapida = buscarLDRapido('LD-4003');
    
    const test2Time = Date.now() - test2Start;
    const test2TimeMs = test2Time;
    
    console.log('📊 Resultado de búsqueda rápida:');
    console.log(`  - Success: ${busquedaRapida.success}`);
    console.log(`  - Tiempo: ${test2TimeMs}ms`);
    console.log(`  - Error: ${busquedaRapida.error || 'Ninguno'}`);
    
    if (busquedaRapida.success) {
      console.log('📋 Datos del LD:');
      console.log(`  - ID: ${busquedaRapida.ld.ID}`);
      console.log(`  - Nombre: ${busquedaRapida.ld.Nombre}`);
      console.log(`  - Rol: ${busquedaRapida.ld.Rol}`);
      console.log(`  - Estado: ${busquedaRapida.ld.Estado}`);
      console.log(`  - Fila: ${busquedaRapida.ld.Fila}`);
    }
    
    const cumpleTiempoRapido = test2TimeMs < 1000;
    
    resultados.busquedaRapida = {
      success: busquedaRapida.success && cumpleTiempoRapido,
      tiempo: test2TimeMs,
      cumpleTiempo: cumpleTiempoRapido,
      ld: busquedaRapida.ld,
      error: busquedaRapida.error
    };
    
    if (resultados.busquedaRapida.success) {
      console.log('✅ TEST 2 EXITOSO: Búsqueda rápida funcionando correctamente');
    } else {
      console.log('❌ TEST 2 FALLÓ: Problemas con búsqueda rápida');
    }
    
    // ===========================================
    // TEST 3: RECUPERACIÓN DESDE CACHÉ
    // ===========================================
    console.log('\n💾 TEST 3: RECUPERACIÓN DESDE CACHÉ');
    console.log('------------------------------------');
    
    const test3Start = Date.now();
    
    console.log('🔄 Cargando directorio desde caché...');
    const directorioCache = cargarDirectorioCompleto(false); // forceReload = false
    
    const test3Time = Date.now() - test3Start;
    const test3TimeMs = test3Time;
    
    console.log('📊 Resultado de recuperación:');
    console.log(`  - Tiempo: ${test3TimeMs}ms`);
    console.log(`  - Líderes: ${directorioCache.lideres ? directorioCache.lideres.length : 0}`);
    console.log(`  - Células: ${directorioCache.celulas ? directorioCache.celulas.length : 0}`);
    console.log(`  - Ingresos: ${directorioCache.ingresos ? directorioCache.ingresos.length : 0}`);
    
    const cumpleTiempoCache = test3TimeMs < 1000;
    const datosConsistentes = directorioCache.lideres && 
                             directorioCache.lideres.length === resultados.fragmentacion.lideres;
    
    resultados.recuperacionCache = {
      success: cumpleTiempoCache && datosConsistentes,
      tiempo: test3TimeMs,
      cumpleTiempo: cumpleTiempoCache,
      datosConsistentes: datosConsistentes,
      lideres: directorioCache.lideres ? directorioCache.lideres.length : 0
    };
    
    if (resultados.recuperacionCache.success) {
      console.log('✅ TEST 3 EXITOSO: Recuperación desde caché funcionando correctamente');
    } else {
      console.log('❌ TEST 3 FALLÓ: Problemas con recuperación desde caché');
    }
    
    // ===========================================
    // TEST 4: BÚSQUEDA COMPLETA DE LD-4003
    // ===========================================
    console.log('\n🔍 TEST 4: BÚSQUEDA COMPLETA DE LD-4003');
    console.log('----------------------------------------');
    
    const test4Start = Date.now();
    
    console.log('🔍 Buscando LD-4003 en datos completos...');
    const ldEncontrado = directorioCache.lideres.find(l => 
      l.ID_Lider === 'LD-4003' && l.Rol === 'LD'
    );
    
    const test4Time = Date.now() - test4Start;
    const test4TimeMs = test4Time;
    
    console.log('📊 Resultado de búsqueda completa:');
    console.log(`  - Encontrado: ${!!ldEncontrado}`);
    console.log(`  - Tiempo: ${test4TimeMs}ms`);
    
    if (ldEncontrado) {
      console.log('📋 Datos completos del LD:');
      console.log(`  - ID: ${ldEncontrado.ID_Lider}`);
      console.log(`  - Nombre: ${ldEncontrado.Nombre_Lider}`);
      console.log(`  - Rol: ${ldEncontrado.Rol}`);
      console.log(`  - Estado: ${ldEncontrado.Estado_Actividad || 'N/A'}`);
      console.log(`  - Superior: ${ldEncontrado.ID_Lider_Directo || 'N/A'}`);
    }
    
    resultados.busquedaCompleta = {
      success: !!ldEncontrado,
      tiempo: test4TimeMs,
      ld: ldEncontrado
    };
    
    if (resultados.busquedaCompleta.success) {
      console.log('✅ TEST 4 EXITOSO: LD-4003 encontrado en datos completos');
    } else {
      console.log('❌ TEST 4 FALLÓ: LD-4003 no encontrado en datos completos');
    }
    
    // ===========================================
    // RESUMEN FINAL
    // ===========================================
    const tiempoTotalMs = Date.now() - tiempoTotal;
    const tiempoTotalSeconds = (tiempoTotalMs / 1000).toFixed(1);
    
    console.log('\n🎯 ===========================================');
    console.log('📊 RESUMEN FINAL DEL TEST COMPLETO');
    console.log('🎯 ===========================================');
    
    const testsExitosos = Object.values(resultados).filter(r => r.success).length;
    const totalTests = Object.keys(resultados).length;
    
    console.log(`⏱️  Tiempo total: ${tiempoTotalSeconds}s`);
    console.log(`✅ Tests exitosos: ${testsExitosos}/${totalTests}`);
    console.log('');
    
    // Detalle de cada test
    console.log('📋 DETALLE DE RESULTADOS:');
    console.log('');
    
    console.log('1️⃣  FRAGMENTACIÓN DE CACHÉ:');
    console.log(`   ${resultados.fragmentacion.success ? '✅' : '❌'} ${resultados.fragmentacion.success ? 'EXITOSO' : 'FALLÓ'}`);
    console.log(`   ⏱️  Tiempo: ${resultados.fragmentacion.tiempoSegundos}s (objetivo: <30s)`);
    console.log(`   📦 Tipo: ${resultados.fragmentacion.tipo}`);
    console.log(`   🔢 Fragmentos: ${resultados.fragmentacion.fragmentos}`);
    console.log(`   💾 Tamaño: ${resultados.fragmentacion.tamañoKB}KB`);
    console.log(`   📊 Datos: ${resultados.fragmentacion.lideres} líderes, ${resultados.fragmentacion.celulas} células, ${resultados.fragmentacion.ingresos} ingresos`);
    console.log('');
    
    console.log('2️⃣  BÚSQUEDA RÁPIDA:');
    console.log(`   ${resultados.busquedaRapida.success ? '✅' : '❌'} ${resultados.busquedaRapida.success ? 'EXITOSO' : 'FALLÓ'}`);
    console.log(`   ⏱️  Tiempo: ${resultados.busquedaRapida.tiempo}ms (objetivo: <1000ms)`);
    if (resultados.busquedaRapida.ld) {
      console.log(`   👤 LD: ${resultados.busquedaRapida.ld.Nombre} (${resultados.busquedaRapida.ld.ID})`);
    }
    if (resultados.busquedaRapida.error) {
      console.log(`   ❌ Error: ${resultados.busquedaRapida.error}`);
    }
    console.log('');
    
    console.log('3️⃣  RECUPERACIÓN DESDE CACHÉ:');
    console.log(`   ${resultados.recuperacionCache.success ? '✅' : '❌'} ${resultados.recuperacionCache.success ? 'EXITOSO' : 'FALLÓ'}`);
    console.log(`   ⏱️  Tiempo: ${resultados.recuperacionCache.tiempo}ms (objetivo: <1000ms)`);
    console.log(`   🔄 Datos consistentes: ${resultados.recuperacionCache.datosConsistentes ? 'SÍ' : 'NO'}`);
    console.log(`   📊 Líderes recuperados: ${resultados.recuperacionCache.lideres}`);
    console.log('');
    
    console.log('4️⃣  BÚSQUEDA COMPLETA:');
    console.log(`   ${resultados.busquedaCompleta.success ? '✅' : '❌'} ${resultados.busquedaCompleta.success ? 'EXITOSO' : 'FALLÓ'}`);
    console.log(`   ⏱️  Tiempo: ${resultados.busquedaCompleta.tiempo}ms`);
    if (resultados.busquedaCompleta.ld) {
      console.log(`   👤 LD: ${resultados.busquedaCompleta.ld.Nombre_Lider} (${resultados.busquedaCompleta.ld.ID_Lider})`);
    }
    console.log('');
    
    // Conclusión final
    if (testsExitosos === totalTests) {
      console.log('🎉 ¡TODOS LOS TESTS EXITOSOS!');
      console.log('🚀 El sistema optimizado está funcionando perfectamente');
    } else {
      console.log('⚠️  ALGUNOS TESTS FALLARON');
      console.log('🔧 Revisar los resultados para identificar problemas');
    }
    
    console.log('🎯 ===========================================');
    
    return {
      success: testsExitosos === totalTests,
      testsExitosos: testsExitosos,
      totalTests: totalTests,
      tiempoTotal: tiempoTotalMs,
      resultados: resultados
    };
    
  } catch (error) {
    const tiempoTotalMs = Date.now() - tiempoTotal;
    console.error('\n❌ ERROR CRÍTICO EN TEST COMPLETO:', error);
    console.log(`⏱️  Tiempo transcurrido: ${(tiempoTotalMs / 1000).toFixed(1)}s`);
    
    return {
      success: false,
      error: error.toString(),
      tiempoTotal: tiempoTotalMs,
      resultados: resultados
    };
  }
}

console.log('🧪 TestCacheClear cargado - Ejecuta testLimpiarCacheYRecargar(), testBuscarLD4003() o testSistemaCompleto()');
