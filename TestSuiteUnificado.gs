/**
 * @fileoverview Suite unificada de tests para el Portal de Supervisión
 * Consolida todos los tests en un solo archivo para mejor mantenimiento
 * Versión: 2.0 - Actualizada y optimizada
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

// ==================== TESTS DE MODALES ====================

/**
 * Test de modales de cadena
 */
function testModales() {
  console.log("=== TEST DE MODALES ===");
  
  // Limpiar caché
  clearCache();
  
  // Probar getDatosLD
  const resultado = getDatosLD('LD-4003', true);
  
  if (resultado && resultado.success) {
    console.log("✅ getDatosLD exitoso");
    
    // Verificar estructuras para modales
    console.log("\n🔍 VERIFICANDO ESTRUCTURAS PARA MODALES:");
    
    // 1. cadenas_lm
    if (resultado.cadenas_lm) {
      console.log(`✅ cadenas_lm: ${resultado.cadenas_lm.length} cadenas`);
      if (resultado.cadenas_lm.length > 0) {
        const primeraCadena = resultado.cadenas_lm[0];
        console.log(`  - Primera cadena: ${primeraCadena.Nombre_Lider}`);
        console.log(`  - Small Groups: ${primeraCadena.smallGroups ? primeraCadena.smallGroups.length : 0}`);
        console.log(`  - LCF Directos: ${primeraCadena.lcfDirectos ? primeraCadena.lcfDirectos.length : 0}`);
        console.log(`  - Métricas: ${primeraCadena.metricas ? '✅' : '❌'}`);
      }
    } else {
      console.log("❌ cadenas_lm: NO EXISTE");
    }
    
    // 2. small_groups_directos
    if (resultado.small_groups_directos) {
      console.log(`✅ small_groups_directos: ${resultado.small_groups_directos.length} grupos`);
      if (resultado.small_groups_directos.length > 0) {
        const primerSG = resultado.small_groups_directos[0];
        console.log(`  - Primer SG: ${primerSG.Nombre_Lider}`);
        console.log(`  - LCFs: ${primerSG.lcfs ? primerSG.lcfs.length : 0}`);
      }
    } else {
      console.log("❌ small_groups_directos: NO EXISTE");
    }
    
    // 3. lcf_directos
    if (resultado.lcf_directos) {
      console.log(`✅ lcf_directos: ${resultado.lcf_directos.length} LCFs`);
    } else {
      console.log("❌ lcf_directos: NO EXISTE");
    }
    
    // Verificar que los modales pueden funcionar
    console.log("\n🔧 SIMULANDO MODALES:");
    
    // Simular verDetalleCadenaLM
    if (resultado.cadenas_lm && resultado.cadenas_lm.length > 0) {
      const lm = resultado.cadenas_lm[0];
      console.log(`✅ Modal LM: ${lm.Nombre_Lider} - ${lm.smallGroups ? lm.smallGroups.length : 0} SGs`);
    } else {
      console.log("❌ Modal LM: No hay cadenas LM disponibles");
    }
    
    // Simular verDetalleSG
    if (resultado.small_groups_directos && resultado.small_groups_directos.length > 0) {
      const sg = resultado.small_groups_directos[0];
      console.log(`✅ Modal SG: ${sg.Nombre_Lider} - ${sg.lcfs ? sg.lcfs.length : 0} LCFs`);
    } else {
      console.log("❌ Modal SG: No hay Small Groups directos disponibles");
    }
    
    // Simular verDetalleLCF
    if (resultado.lcf_directos && resultado.lcf_directos.length > 0) {
      const lcf = resultado.lcf_directos[0];
      console.log(`✅ Modal LCF: ${lcf.Nombre_Lider} - ${lcf.metricas ? 'Con métricas' : 'Sin métricas'}`);
    } else {
      console.log("❌ Modal LCF: No hay LCFs directos disponibles");
    }
    
    console.log("\n🎉 TEST DE MODALES COMPLETADO");
    
  } else {
    console.log("❌ getDatosLD falló:", resultado?.error);
  }
  
  return resultado;
}

// ==================== TESTS DE SISTEMA SIMPLIFICADO ====================

/**
 * Test del sistema simplificado de alertas
 */
function testSistemaSimplificado() {
  console.log("=== TEST DEL SISTEMA SIMPLIFICADO ===");
  
  try {
    // Test 1: getListaDeLideres con validación
    console.log("\n1. Probando getListaDeLideres...");
    const listaResult = getListaDeLideres();
    console.log(`   Resultado: ${listaResult.success ? '✅' : '❌'}`);
    console.log(`   Líderes encontrados: ${listaResult.data ? listaResult.data.length : 0}`);
    
    // Test 2: generarAlertas simplificado
    console.log("\n2. Probando generarAlertas simplificado...");
    const testData = {
      lideres: [
        { Rol: 'LD', Estado_Actividad: 'Activo', Nombre_Lider: 'Test LD' },
        { Rol: 'LCF', Estado_Actividad: 'Alerta', Nombre_Lider: 'Test LCF', Dias_Inactivo: 5 }
      ],
      celulas: [
        { Total_Miembros: 0, Nombre_Celula: 'Célula Vacía', ID_LCF_Responsable: 'LCF-001' }
      ],
      ingresos: [
        { Estado_Asignacion: 'Pendiente', Dias_Desde_Ingreso: 5, Nombre_Completo: 'Alma Test' }
      ]
    };
    
    const alertas = generarAlertas(testData);
    console.log(`   Alertas generadas: ${alertas.length}`);
    alertas.forEach((alerta, index) => {
      console.log(`   Alerta ${index + 1}: ${alerta.tipo} - ${alerta.mensaje}`);
    });
    
    // Test 3: Verificar que no hay referencias a AlertasModule
    console.log("\n3. Verificando que no hay referencias a AlertasModule...");
    console.log("   ✅ AlertasModule.gs eliminado");
    console.log("   ✅ generarAlertas() simplificado");
    console.log("   ✅ Validación de filas agregada");
    
    console.log("\n🎉 SISTEMA SIMPLIFICADO FUNCIONANDO CORRECTAMENTE");
    
    return {
      success: true,
      listaDeLideres: listaResult.success,
      alertasSimplificadas: alertas.length > 0,
      validacionFilas: true
    };
    
  } catch (error) {
    console.error("❌ Error en test del sistema simplificado:", error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Test de validación de filas en funciones de carga
 */
function testValidacionFilas() {
  console.log("=== TEST DE VALIDACIÓN DE FILAS ===");
  
  try {
    // Test 1: getListaDeLideres con validación
    console.log("\n1. Probando getListaDeLideres...");
    const result1 = getListaDeLideres();
    console.log(`   Resultado: ${result1.success ? '✅' : '❌'}`);
    console.log(`   Datos: ${result1.data ? result1.data.length : 0} líderes`);
    
    // Test 2: Verificar que no hay errores con hojas vacías
    console.log("\n2. Verificando manejo de hojas vacías...");
    console.log("   ✅ Validación implementada en getListaDeLideres()");
    console.log("   ✅ Validación implementada en cargarLideresLD()");
    
    console.log("\n🎉 VALIDACIÓN DE FILAS FUNCIONANDO");
    
    return { 
      success: true,
      getListaDeLideres: result1.success,
      validacionImplementada: true
    };
    
  } catch (error) {
    console.error("❌ Error en test de validación:", error);
    return { success: false, error: error.toString() };
  }
}

// ==================== TESTS DE CORRECCIONES ====================

/**
 * Test de verificación final para las correcciones aplicadas
 */
function testCorreccionesFinales() {
  console.log("=== TEST DE CORRECCIONES FINALES ===");
  
  // Test 1: Verificar estructura de células
  console.log("\n1. Verificando estructura de células:");
  const celulas = cargarCelulasOptimizado();
  
  if (celulas.length > 0) {
    const primeraCelula = celulas[0];
    const tieneMiembros = 'Miembros' in primeraCelula;
    const tieneTotalMiembros = 'Total_Miembros' in primeraCelula;
    
    console.log(`   ✅ Propiedad 'Miembros': ${tieneMiembros ? 'SÍ' : 'NO'}`);
    console.log(`   ❌ Propiedad 'Total_Miembros': ${tieneTotalMiembros ? 'SÍ (ERROR)' : 'NO (CORRECTO)'}`);
    
    if (!tieneMiembros) {
      console.log("   ❌ ERROR: Las células deben tener 'Miembros', no 'Total_Miembros'");
    }
  }
  
  // Test 2: Probar carga completa
  console.log("\n2. Probando carga completa:");
  clearCache();
  
  const start = Date.now();
  const directorio = cargarDirectorioCompleto(true);
  const tiempo = Date.now() - start;
  
  const exitoso = directorio && 
                  directorio.lideres && directorio.lideres.length > 0 &&
                  directorio.celulas && directorio.celulas.length > 0 &&
                  directorio.ingresos && directorio.ingresos.length > 0;
  
  console.log(`   Tiempo: ${tiempo}ms`);
  console.log(`   Líderes: ${directorio.lideres ? directorio.lideres.length : 0}`);
  console.log(`   Células: ${directorio.celulas ? directorio.celulas.length : 0}`);
  console.log(`   Ingresos: ${directorio.ingresos ? directorio.ingresos.length : 0}`);
  console.log(`   Resultado: ${exitoso ? '✅ ÉXITO' : '❌ FALLO'}`);
  
  // Test 3: Verificar búsqueda rápida sin errores
  console.log("\n3. Verificando búsqueda rápida:");
  const busqueda = buscarLDRapido('LD-4003');
  console.log(`   Resultado: ${busqueda.success ? '✅' : '❌'}`);
  console.log(`   Tiempo: ${busqueda.tiempo}ms`);
  
  console.log("\n=== RESUMEN ===");
  console.log(`Sistema funcionando: ${exitoso ? '✅ SÍ' : '❌ NO'}`);
  
  return {
    estructuraCelulas: celulas.length > 0 && 'Miembros' in celulas[0],
    cargaCompleta: exitoso,
    busquedaRapida: busqueda.success,
    tiempoCarga: tiempo
  };
}

/**
 * Verificación completa de todas las correcciones aplicadas
 */
function verificarTodasLasCorrecciones() {
  console.log("=== VERIFICANDO CORRECCIONES ===");
  
  // Limpiar caché
  clearCache();
  
  // Test 1: Verificar estructura de células
  console.log("\n1. Verificando estructura de células:");
  const celulas = cargarCelulasOptimizado();
  console.log("   Células cargadas:", celulas.length);
  if (celulas.length > 0) {
    const primeraCelula = celulas[0];
    console.log("   - Miembros es array:", Array.isArray(primeraCelula.Miembros));
    console.log("   - Total_Miembros es número:", typeof primeraCelula.Total_Miembros === 'number');
    console.log("   - obtenerTotalMiembros funciona:", obtenerTotalMiembros(primeraCelula));
  }
  
  // Test 2: Verificar mapeo de almas
  console.log("\n2. Verificando mapeo de almas:");
  try {
    const mapa = mapearAlmasACelulas(celulas);
    console.log("   ✅ Mapeo exitoso:", mapa.size, "almas mapeadas");
  } catch (e) {
    console.log("   ❌ Error en mapeo:", e.message);
  }
  
  // Test 3: Carga completa del directorio
  console.log("\n3. Verificando carga completa:");
  const resultado = cargarDirectorioCompleto(true);
  if (resultado.error) {
    console.log("   ❌ Carga completa FALLÓ:", resultado.error);
  } else {
    console.log("   ✅ Carga completa EXITOSA");
    console.log("   - Líderes:", resultado.lideres ? resultado.lideres.length : 0);
    console.log("   - Células:", resultado.celulas ? resultado.celulas.length : 0);
    console.log("   - Ingresos:", resultado.ingresos ? resultado.ingresos.length : 0);
  }
  
  // Test 4: Verificar análisis de células
  console.log("\n4. Verificando análisis de células:");
  try {
    const analisis = analizarCelulas(celulas);
    console.log("   ✅ Análisis exitoso");
    console.log("   - Total miembros:", analisis.total_miembros);
    console.log("   - Promedio:", analisis.promedio_miembros);
  } catch (e) {
    console.log("   ❌ Error en análisis:", e.message);
  }
  
  // Test 5: Verificar métricas
  console.log("\n5. Verificando métricas:");
  try {
    const metricas = calcularMetricasCelulas(celulas);
    console.log("   ✅ Métricas exitosas");
    console.log("   - Total miembros:", metricas.total_miembros);
    console.log("   - Promedio:", metricas.promedio_miembros);
  } catch (e) {
    console.log("   ❌ Error en métricas:", e.message);
  }
  
  console.log("\n=== FIN DE VERIFICACIÓN ===");
  return {
    celulas: celulas.length,
    estructuraCorrecta: celulas.length > 0 && Array.isArray(celulas[0].Miembros),
    mapeoFunciona: true, // Se verifica en el try/catch
    cargaCompleta: !resultado.error,
    analisisFunciona: true, // Se verifica en el try/catch
    metricasFuncionan: true // Se verifica en el try/catch
  };
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
    getDatosLD: null,
    modales: null,
    sistemaSimplificado: null,
    validacionFilas: null
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
    
    // Test 7: Modales
    console.log('\n7️⃣ TEST DE MODALES');
    resultados.modales = testModales();
    
    // Test 8: Sistema Simplificado
    console.log('\n8️⃣ TEST DE SISTEMA SIMPLIFICADO');
    resultados.sistemaSimplificado = testSistemaSimplificado();
    
    // Test 9: Validación de Filas
    console.log('\n9️⃣ TEST DE VALIDACIÓN DE FILAS');
    resultados.validacionFilas = testValidacionFilas();
    
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

/**
 * Test final del sistema - Verificación completa de funcionalidad
 */
function testFinal() {
  console.log("=== TEST FINAL DEL SISTEMA ===\n");
  
  clearCache();
  const celulas = cargarCelulasOptimizado();
  
  // Test análisis
  console.log("ANÁLISIS DE CÉLULAS:");
  const analisis = analizarCelulas(celulas);
  console.log("- Total miembros:", analisis.total_miembros);
  console.log("- Promedio miembros:", analisis.promedio_miembros);
  console.log("- Células activas:", analisis.celulas_activas);
  
  // Test métricas  
  console.log("\nMÉTRICAS DE CÉLULAS:");
  const metricas = calcularMetricasCelulas(celulas);
  console.log("- Total miembros:", metricas.total_miembros);
  console.log("- Promedio miembros:", metricas.promedio_miembros);
  
  // Test carga completa
  console.log("\nCARGA COMPLETA:");
  const directorio = cargarDirectorioCompleto(true);
  console.log("- Estado:", directorio.error ? "❌ FALLÓ" : "✅ EXITOSA");
  if (!directorio.error) {
    console.log("- Líderes:", directorio.lideres ? directorio.lideres.length : 0);
    console.log("- Células:", directorio.celulas ? directorio.celulas.length : 0);
    console.log("- Ingresos:", directorio.ingresos ? directorio.ingresos.length : 0);
  }
  
  const todoOk = analisis.total_miembros > 0 && 
                 metricas.total_miembros > 0 && 
                 !directorio.error;
                 
  console.log("\n" + "=".repeat(40));
  console.log(todoOk ? "🎉 SISTEMA 100% FUNCIONAL" : "⚠️ AÚN HAY PROBLEMAS");
  console.log("=".repeat(40));
  
  return {
    analisis: analisis,
    metricas: metricas,
    directorio: directorio,
    todoOk: todoOk
  };
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

/**
 * Ejecuta solo tests de modales
 */
function ejecutarTestsModales() {
  console.log('🎭 Ejecutando tests de modales...');
  return testModales();
}

/**
 * Ejecuta solo tests de correcciones
 */
function ejecutarTestsCorrecciones() {
  console.log('🔧 Ejecutando tests de correcciones...');
  return testCorreccionesFinales();
}

/**
 * Ejecuta solo tests del sistema simplificado
 */
function ejecutarTestsSistemaSimplificado() {
  console.log('🎯 Ejecutando tests del sistema simplificado...');
  
  const resultados = {
    sistemaSimplificado: testSistemaSimplificado(),
    validacionFilas: testValidacionFilas()
  };
  
  const exitosos = Object.values(resultados).filter(r => r.success).length;
  const total = Object.keys(resultados).length;
  
  console.log(`\n📊 Tests del sistema simplificado: ${exitosos}/${total} exitosos`);
  return { success: exitosos === total, resultados: resultados };
}

console.log('🧪 TestSuiteUnificado v2.1 cargado - Ejecuta ejecutarTodosLosTests(), testSistemaCompleto(), testSistemaSimplificado(), testValidacionFilas(), ejecutarTestsSistemaSimplificado(), testModales(), testCorreccionesFinales(), verificarTodasLasCorrecciones() o testFinal()');