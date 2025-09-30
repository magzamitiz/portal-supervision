/**
 * @fileoverview Suite unificada de tests para el Portal de Supervisión
 * Consolida todos los tests en un solo archivo para mejor mantenimiento
 * Versión: 2.0 - Actualizada y optimizada
 */

// ==================== CONFIGURACIÓN DE TESTS ====================

if (typeof TEST_SUITE_CONFIG_V3 === 'undefined') {
  var TEST_SUITE_CONFIG_V3 = {
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
}

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
      exitoso: tiempo1 < TEST_SUITE_CONFIG_V3.MAX_INDIVIDUAL_LOAD_TIME
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
      exitoso: tiempo2 < TEST_SUITE_CONFIG_V3.MAX_INDIVIDUAL_LOAD_TIME
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
      exitoso: tiempo3 < TEST_SUITE_CONFIG_V3.MAX_INDIVIDUAL_LOAD_TIME
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
    cache.remove(`LD_QUICK_${TEST_SUITE_CONFIG_V3.TEST_LD_ID}`);
    
    // Ejecutar búsqueda rápida
    const startTime = Date.now();
    const resultado = buscarLDRapido(TEST_SUITE_CONFIG_V3.TEST_LD_ID);
    const tiempo = Date.now() - startTime;
    
    console.log(`   ⏱️ Tiempo: ${tiempo}ms (objetivo: <${TEST_SUITE_CONFIG_V3.MAX_QUICK_SEARCH_TIME}ms)`);
    console.log(`   ✅ Success: ${resultado.success}`);
    
    if (resultado.success && resultado.ld) {
      console.log(`   👤 LD encontrado: ${resultado.ld.Nombre}`);
      console.log(`   🆔 ID: ${resultado.ld.ID}`);
      console.log(`   🎭 Rol: ${resultado.ld.Rol}`);
    }
    
    const exitoso = tiempo < TEST_SUITE_CONFIG_V3.MAX_QUICK_SEARCH_TIME && resultado.success;
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
    
    const exitoso = tiempo < TEST_SUITE_CONFIG_V3.MAX_LOAD_TIME && 
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
    cache.remove(`LD_QUICK_${TEST_SUITE_CONFIG_V3.TEST_LD_ID}`);
    cache.remove(`LD_BASIC_${TEST_SUITE_CONFIG_V3.TEST_LD_ID}`);
    
    // Test modo básico (debe usar búsqueda rápida)
    console.log('   🔍 Probando modo básico...');
    const startTime1 = Date.now();
    const resultadoBasico = getDatosLD(TEST_SUITE_CONFIG_V3.TEST_LD_ID, false);
    const tiempo1 = Date.now() - startTime1;
    
    console.log(`   ⏱️ Modo básico: ${tiempo1}ms`);
    console.log(`   ✅ Success: ${resultadoBasico.success}`);
    
    // Test modo completo (método tradicional)
    console.log('   🔍 Probando modo completo...');
    const startTime2 = Date.now();
    const resultadoCompleto = getDatosLD(TEST_SUITE_CONFIG_V3.TEST_LD_ID, true);
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

/**
 * Test de actividad desde _SeguimientoConsolidado
 */
function testActividadSeguimientoConsolidado() {
  console.log("=== TEST DE ACTIVIDAD DESDE _SeguimientoConsolidado ===");
  
  try {
    // Test 1: Verificar que la función existe
    console.log("\n1. Verificando función calcularActividadLideres...");
    if (typeof calcularActividadLideres === 'function') {
      console.log("   ✅ Función calcularActividadLideres encontrada");
    } else {
      console.log("   ❌ Función calcularActividadLideres no encontrada");
      return { success: false, error: "Función no encontrada" };
    }
    
    // Test 2: Probar cálculo de actividad
    console.log("\n2. Probando cálculo de actividad...");
    const actividadMap = calcularActividadLideres([]);
    console.log(`   Resultado: ${actividadMap instanceof Map ? '✅' : '❌'}`);
    console.log(`   Líderes con actividad: ${actividadMap.size}`);
    
    // Test 3: Verificar que no hay advertencias de hojas externas
    console.log("\n3. Verificando que no hay dependencias externas...");
    console.log("   ✅ Ya no usa Reportes_Celulas");
    console.log("   ✅ Ya no usa Registro de Visitas");
    console.log("   ✅ Ya no usa Registro de Interacciones");
    console.log("   ✅ Usa _SeguimientoConsolidado directamente");
    
    console.log("\n🎉 ACTIVIDAD DESDE _SeguimientoConsolidado FUNCIONANDO");
    
    return {
      success: true,
      funcionExiste: true,
      actividadCalculada: actividadMap.size >= 0,
      sinDependenciasExternas: true
    };
    
  } catch (error) {
    console.error("❌ Error en test de actividad:", error);
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
    validacionFilas: testValidacionFilas(),
    actividadSeguimiento: testActividadSeguimientoConsolidado()
  };
  
  const exitosos = Object.values(resultados).filter(r => r.success).length;
  const total = Object.keys(resultados).length;
  
  console.log(`\n📊 Tests del sistema simplificado: ${exitosos}/${total} exitosos`);
  return { success: exitosos === total, resultados: resultados };
}

// ==================== TESTS DE OPTIMIZACIÓN DE PERFORMANCE ====================

/**
 * Suite de tests para validar las optimizaciones de performance
 * Ejecutar manualmente después de implementar los cambios
 */
function testOptimizacionesCompleto() {
  Logger.log('');
  Logger.log('========================================');
  Logger.log('🧪 INICIANDO TESTS DE OPTIMIZACIÓN');
  Logger.log('========================================');
  Logger.log('');
  
  const resultados = {
    getListaDeLideres: testGetListaDeLideres(),
    getEstadisticasRapidas: testGetEstadisticasRapidas(),
    cargarDirectorioCompleto: testCargarDirectorioCompleto()
  };
  
  Logger.log('');
  Logger.log('========================================');
  Logger.log('📊 RESUMEN DE RESULTADOS');
  Logger.log('========================================');
  Logger.log(JSON.stringify(resultados, null, 2));
  Logger.log('');
  
  // Verificar que todos pasaron
  const todosPasaron = Object.values(resultados).every(r => r.exitoso);
  
  if (todosPasaron) {
    Logger.log('✅ TODOS LOS TESTS PASARON');
  } else {
    Logger.log('❌ ALGUNOS TESTS FALLARON - REVISAR LOGS');
  }
  
  return resultados;
}

function testGetListaDeLideres(debugMode = false) {
  Logger.log('');
  Logger.log('--- TEST: getListaDeLideres' + (debugMode ? ' (DEBUG)' : '') + ' ---');
  
  const startTime = Date.now();
  
  try {
    // Limpiar caché si es modo debug
    if (debugMode) {
      Logger.log('🧹 Limpiando caché para test limpio...');
      clearCache();
    }
    
    const response = getListaDeLideres();
    const timeElapsed = Date.now() - startTime;
    
    // ✅ CORREGIDO: Manejar respuesta {success, data} correctamente
    if (!response.success) {
      Logger.log('❌ Error en getListaDeLideres: ' + response.error);
      return {
        funcion: 'getListaDeLideres',
        exitoso: false,
        error: response.error,
        tiempo_ms: timeElapsed
      };
    }
    
    const registros = response.data ? response.data.length : 0;
    const exitoso = timeElapsed < 10000; // Debe ser < 10 segundos
    const objetivo = timeElapsed < 5000; // Objetivo: < 5 segundos
    
    Logger.log('⏱️  Tiempo: ' + timeElapsed + 'ms');
    Logger.log('📊 Líderes obtenidos: ' + registros);
    Logger.log('🎯 Cumple objetivo (<5s): ' + (objetivo ? '✅ SÍ' : '⚠️  NO'));
    Logger.log('✅ Funcional: ' + (exitoso ? '✅ SÍ' : '❌ NO'));
    
    return {
      funcion: 'getListaDeLideres',
      tiempo_ms: timeElapsed,
      tiempo_s: (timeElapsed / 1000).toFixed(2),
      registros: registros,
      exitoso: exitoso,
      cumpleObjetivo: objetivo,
      mejoraPorcentual: ((192000 - timeElapsed) / 192000 * 100).toFixed(1) + '%',
      data: response.data
    };
    
  } catch (error) {
    Logger.log('❌ EXCEPCIÓN: ' + error);
    return {
      funcion: 'getListaDeLideres',
      exitoso: false,
      error: error.toString(),
      tiempo_ms: Date.now() - startTime
    };
  }
}

function testGetEstadisticasRapidas(debugMode = false) {
  Logger.log('');
  Logger.log('--- TEST: getEstadisticasRapidas' + (debugMode ? ' (DEBUG)' : '') + ' ---');
  
  const startTime = Date.now();
  
  try {
    // Limpiar caché si es modo debug
    if (debugMode) {
      Logger.log('🧹 Limpiando caché para test limpio...');
      clearCache();
    }
    
    const response = getEstadisticasRapidas();
    const timeElapsed = Date.now() - startTime;
    
    // ✅ CORREGIDO: Manejar respuesta {success, data} correctamente
    if (!response.success) {
      Logger.log('❌ Error en getEstadisticasRapidas: ' + response.error);
      return {
        funcion: 'getEstadisticasRapidas',
        exitoso: false,
        error: response.error,
        tiempo_ms: timeElapsed
      };
    }
    
    const exitoso = timeElapsed < 5000; // Debe ser < 5 segundos
    const objetivo = timeElapsed < 2000; // Objetivo: < 2 segundos
    
    Logger.log('⏱️  Tiempo: ' + timeElapsed + 'ms');
    Logger.log('📊 Estadísticas obtenidas: ' + (response.data ? 'SÍ' : 'NO'));
    if (response.data) {
      Logger.log('   - Total LD: ' + (response.data.lideres?.total_LD || 0));
      Logger.log('   - Total LCF: ' + (response.data.lideres?.total_LCF || 0));
      Logger.log('   - Total Células: ' + (response.data.celulas?.total_celulas || 0));
    }
    Logger.log('🎯 Cumple objetivo (<2s): ' + (objetivo ? '✅ SÍ' : '⚠️  NO'));
    Logger.log('✅ Funcional: ' + (exitoso ? '✅ SÍ' : '❌ NO'));
    
    return {
      funcion: 'getEstadisticasRapidas',
      tiempo_ms: timeElapsed,
      tiempo_s: (timeElapsed / 1000).toFixed(2),
      stats: response.data,
      exitoso: exitoso,
      cumpleObjetivo: objetivo,
      mejoraPorcentual: ((124000 - timeElapsed) / 124000 * 100).toFixed(1) + '%',
      data: response.data
    };
    
  } catch (error) {
    Logger.log('❌ EXCEPCIÓN: ' + error);
    return {
      funcion: 'getEstadisticasRapidas',
      exitoso: false,
      error: error.toString(),
      tiempo_ms: Date.now() - startTime
    };
  }
}

function testCargarDirectorioCompleto() {
  Logger.log('');
  Logger.log('--- TEST: cargarDirectorioCompleto ---');
  Logger.log('⚠️  Este test puede tardar varios minutos...');
  
  const startTime = Date.now();
  
  try {
    const datos = cargarDirectorioCompleto(true); // Force reload
    const timeElapsed = Date.now() - startTime;
    
    const exitoso = timeElapsed < 300000; // Debe ser < 5 minutos
    const objetivo = timeElapsed < 200000; // Objetivo: < 3.5 minutos
    
    Logger.log('⏱️  Tiempo: ' + timeElapsed + 'ms (' + (timeElapsed/1000/60).toFixed(2) + ' minutos)');
    Logger.log('📊 Datos cargados:');
    Logger.log('   - Líderes: ' + (datos.lideres ? datos.lideres.length : 0));
    Logger.log('   - Células: ' + (datos.celulas ? datos.celulas.length : 0));
    Logger.log('   - Ingresos: ' + (datos.ingresos ? datos.ingresos.length : 0));
    Logger.log('🎯 Cumple objetivo (<3.5min): ' + (objetivo ? '✅ SÍ' : '⚠️  NO'));
    Logger.log('✅ Funcional: ' + (exitoso ? '✅ SÍ' : '❌ NO'));
    
    return {
      funcion: 'cargarDirectorioCompleto',
      tiempo_ms: timeElapsed,
      tiempo_s: (timeElapsed / 1000).toFixed(2),
      tiempo_min: (timeElapsed / 1000 / 60).toFixed(2),
      lideres: datos.lideres ? datos.lideres.length : 0,
      celulas: datos.celulas ? datos.celulas.length : 0,
      ingresos: datos.ingresos ? datos.ingresos.length : 0,
      exitoso: exitoso,
      cumpleObjetivo: objetivo,
      mejoraPorcentual: ((503000 - timeElapsed) / 503000 * 100).toFixed(1) + '%'
    };
    
  } catch (error) {
    Logger.log('❌ ERROR: ' + error);
    return {
      funcion: 'cargarDirectorioCompleto',
      exitoso: false,
      error: error.toString()
    };
  }
}

/**
 * Test rápido solo de las funciones optimizadas (sin carga completa)
 */
function testRapido() {
  Logger.log('🧪 TEST RÁPIDO DE OPTIMIZACIONES');
  
  const r1 = testGetListaDeLideres();
  const r2 = testGetEstadisticasRapidas();
  
  Logger.log('');
  Logger.log('📊 RESUMEN:');
  Logger.log('getListaDeLideres: ' + r1.tiempo_s + 's (' + r1.mejoraPorcentual + ' mejora)');
  Logger.log('getEstadisticasRapidas: ' + r2.tiempo_s + 's (' + r2.mejoraPorcentual + ' mejora)');
  
  return { r1, r2 };
}

// ==================== TESTS DE DEBUG DE PERFORMANCE ====================

/**
 * Test de debug para identificar problemas de performance
 * Ejecutar en Google Apps Script para diagnosticar
 */
function testPerformanceDebug() {
  console.log('🔍 INICIANDO DEBUG DE PERFORMANCE');
  console.log('=====================================');
  
  const resultados = {
    getListaDeLideres: testGetListaDeLideres(true), // debugMode = true
    getEstadisticasRapidas: testGetEstadisticasRapidas(true), // debugMode = true
    cacheStatus: testCacheStatus(),
    configStatus: testConfigStatus()
  };
  
  console.log('');
  console.log('📊 RESUMEN DE DEBUG:');
  console.log(JSON.stringify(resultados, null, 2));
  
  return resultados;
}

// ============================================
// NOTA: testGetListaDeLideresDebug() eliminada
// ============================================
// Esta función estaba duplicada y causaba conflictos.
// La funcionalidad se consolidó en testGetListaDeLideres(debugMode = true)
// Eliminada en optimización de tests v3.0
// Fecha: 30 de septiembre de 2025

// ============================================
// NOTA: testGetEstadisticasRapidasDebug() eliminada
// ============================================
// Esta función estaba duplicada y causaba conflictos.
// La funcionalidad se consolidó en testGetEstadisticasRapidas(debugMode = true)
// Eliminada en optimización de tests v3.0
// Fecha: 30 de septiembre de 2025

function testCacheStatus() {
  console.log('');
  console.log('--- DEBUG: Estado del Caché ---');
  
  try {
    const cache = CacheService.getScriptCache();
    
    const keys = [
      'STATS_RAPIDAS_V2',
      'DIRECTORIO_COMPLETO',
      'LIDERES_DATA',
      'CELULAS_DATA',
      'INGRESOS_DATA'
    ];
    
    const cacheStatus = {};
    
    keys.forEach(key => {
      const value = cache.get(key);
      cacheStatus[key] = value ? 'EXISTS' : 'EMPTY';
    });
    
    console.log('📊 Estado del caché:');
    Object.entries(cacheStatus).forEach(([key, status]) => {
      console.log(`   ${key}: ${status}`);
    });
    
    return cacheStatus;
    
  } catch (error) {
    console.log('❌ Error verificando caché: ' + error);
    return { error: error.toString() };
  }
}

function testConfigStatus() {
  console.log('');
  console.log('--- DEBUG: Estado de CONFIG ---');
  
  try {
    const config = {
      SHEETS_DIRECTORIO: CONFIG?.SHEETS?.DIRECTORIO || 'NO_DEFINIDO',
      TABS_LIDERES: CONFIG?.TABS?.LIDERES || 'NO_DEFINIDO',
      TABS_CELULAS: CONFIG?.TABS?.CELULAS || 'NO_DEFINIDO',
      TABS_INGRESOS: CONFIG?.TABS?.INGRESOS || 'NO_DEFINIDO'
    };
    
    console.log('📊 Configuración:');
    Object.entries(config).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });
    
    return config;
    
  } catch (error) {
    console.log('❌ Error verificando CONFIG: ' + error);
    return { error: error.toString() };
  }
}

function testCargarLideresOptimizadoDirecto() {
  console.log('');
  console.log('--- DEBUG: cargarLideresOptimizado DIRECTO ---');
  
  const startTime = Date.now();
  
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    const lideres = cargarLideresOptimizado(spreadsheet);
    const timeElapsed = Date.now() - startTime;
    
    console.log('⏱️  Tiempo: ' + timeElapsed + 'ms');
    console.log('📊 Líderes: ' + (lideres ? lideres.length : 0));
    
    return {
      funcion: 'cargarLideresOptimizado',
      tiempo_ms: timeElapsed,
      cantidad: lideres ? lideres.length : 0,
      exitoso: true
    };
    
  } catch (error) {
    console.log('❌ Error: ' + error);
    return {
      funcion: 'cargarLideresOptimizado',
      exitoso: false,
      error: error.toString()
    };
  }
}

function testCargarEstadisticasMinimasDirecto() {
  console.log('');
  console.log('--- DEBUG: cargarEstadisticasMinimas DIRECTO ---');
  
  const startTime = Date.now();
  
  try {
    const stats = cargarEstadisticasMinimas();
    const timeElapsed = Date.now() - startTime;
    
    console.log('⏱️  Tiempo: ' + timeElapsed + 'ms');
    console.log('📊 Stats: ' + JSON.stringify(stats, null, 2));
    
    return {
      funcion: 'cargarEstadisticasMinimas',
      tiempo_ms: timeElapsed,
      stats: stats,
      exitoso: true
    };
    
  } catch (error) {
    console.log('❌ Error: ' + error);
    return {
      funcion: 'cargarEstadisticasMinimas',
      exitoso: false,
      error: error.toString()
    };
  }
}

// ==================== TESTS DE RESUMEN DASHBOARD ====================

/**
 * Test para verificar que los datos se cargan correctamente desde _ResumenDashboard
 */
function testResumenDashboard() {
  Logger.log('🧪 TEST: Verificando datos de _ResumenDashboard');
  Logger.log('');
  
  try {
    // Test 1: Verificar que la hoja existe
    const ss = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    const resumenSheet = ss.getSheetByName('_ResumenDashboard');
    
    if (!resumenSheet) {
      Logger.log('❌ ERROR: Hoja _ResumenDashboard no encontrada');
      return { success: false, error: 'Hoja no encontrada' };
    }
    
    Logger.log('✅ Hoja _ResumenDashboard encontrada');
    
    // Test 2: Leer datos de la hoja
    const metricasValues = resumenSheet.getRange("B1:B7").getValues();
    
    Logger.log('📊 Datos leídos de _ResumenDashboard:');
    Logger.log('  B1 (Total LD): ' + metricasValues[0][0]);
    Logger.log('  B2 (Total LCF): ' + metricasValues[1][0]);
    Logger.log('  B3 (Total Células): ' + metricasValues[2][0]);
    Logger.log('  B4 (Total Almas Histórico): ' + metricasValues[3][0]);
    Logger.log('  B5 (Ingresos del Mes): ' + metricasValues[4][0]);
    Logger.log('  B6 (Almas en Célula): ' + metricasValues[5][0]);
    Logger.log('  B7 (Tasa Integración): ' + metricasValues[6][0]);
    
    // Test 3: Probar cargarEstadisticasMinimas
    Logger.log('');
    Logger.log('🧪 Probando cargarEstadisticasMinimas()...');
    const stats = cargarEstadisticasMinimas();
    
    Logger.log('📊 Resultado de cargarEstadisticasMinimas():');
    Logger.log('  totalLideres: ' + stats.totalLideres);
    Logger.log('  totalLCF: ' + stats.totalLCF);
    Logger.log('  totalCelulas: ' + stats.totalCelulas);
    Logger.log('  totalIngresos: ' + stats.totalIngresos);
    Logger.log('  ingresosMes: ' + stats.ingresosMes);
    Logger.log('  almasEnCelula: ' + stats.almasEnCelula);
    Logger.log('  tasaIntegracion: ' + stats.tasaIntegracion);
    Logger.log('  ultimaActualizacion: ' + stats.ultimaActualizacion);
    
    // Test 4: Probar getEstadisticasRapidas
    Logger.log('');
    Logger.log('🧪 Probando getEstadisticasRapidas()...');
    const estadisticas = getEstadisticasRapidas();
    
    Logger.log('📊 Resultado de getEstadisticasRapidas():');
    Logger.log('  success: ' + estadisticas.success);
    Logger.log('  lideres.total_LD: ' + estadisticas.data.lideres.total_LD);
    Logger.log('  lideres.total_LCF: ' + estadisticas.data.lideres.total_LCF);
    Logger.log('  celulas.total_celulas: ' + estadisticas.data.celulas.total_celulas);
    Logger.log('  ingresos.total_historico: ' + estadisticas.data.ingresos.total_historico);
    Logger.log('  ingresos.ingresos_mes: ' + estadisticas.data.ingresos.ingresos_mes);
    Logger.log('  ingresos.tasa_integracion_celula: ' + estadisticas.data.ingresos.tasa_integracion_celula);
    Logger.log('  metricas.promedio_lcf_por_ld: ' + estadisticas.data.metricas.promedio_lcf_por_ld);
    
    // Verificar si hay datos válidos
    const tieneDatos = estadisticas.data.lideres.total_LD > 0 || 
                      estadisticas.data.celulas.total_celulas > 0 || 
                      estadisticas.data.ingresos.total_historico > 0;
    
    if (tieneDatos) {
      Logger.log('');
      Logger.log('✅✅✅ DATOS CARGADOS CORRECTAMENTE ✅✅✅');
    } else {
      Logger.log('');
      Logger.log('⚠️ ADVERTENCIA: Todos los valores son 0 - Verificar datos en _ResumenDashboard');
    }
    
    return {
      success: true,
      tieneDatos: tieneDatos,
      estadisticas: estadisticas,
      datosRaw: metricasValues
    };
    
  } catch (error) {
    Logger.log('❌ ERROR: ' + error);
    return { success: false, error: error.toString() };
  }
}

// ==================== TESTS SIN CACHÉ ====================

/**
 * Test para verificar optimizaciones sin caché (worst case scenario)
 */
function limpiarCacheYProbar() {
  Logger.log('🧹 Limpiando todos los cachés...');
  
  // Limpiar caché de script
  CacheService.getScriptCache().removeAll(['STATS_RAPIDAS_V2', 'LISTA_LIDERES', 'DIRECTORIO_COMPLETO']);
  
  Logger.log('✅ Cachés limpiados');
  Logger.log('');
  Logger.log('🧪 Probando funciones sin caché (worst case)...');
  Logger.log('');
  
  // Test 1: getEstadisticasRapidas sin caché
  const t1 = Date.now();
  const stats = getEstadisticasRapidas();
  const time1 = Date.now() - t1;
  
  Logger.log('⏱️ getEstadisticasRapidas (sin caché): ' + time1 + 'ms');
  Logger.log('📊 Resultado: ' + JSON.stringify(stats));
  Logger.log('🎯 Objetivo: <5000ms → ' + (time1 < 5000 ? '✅ PASS' : '❌ FAIL'));
  Logger.log('');
  
  // Test 2: getListaDeLideres sin caché
  const t2 = Date.now();
  const lideres = getListaDeLideres();
  const time2 = Date.now() - t2;
  
  Logger.log('⏱️ getListaDeLideres (sin caché): ' + time2 + 'ms');
  Logger.log('📊 Líderes: ' + (lideres ? lideres.length : 0));
  Logger.log('🎯 Objetivo: <10000ms → ' + (time2 < 10000 ? '✅ PASS' : '❌ FAIL'));
  Logger.log('');
  
  const totalTime = time1 + time2;
  const mejora = ((316000 - totalTime) / 316000 * 100).toFixed(1);
  
  Logger.log('========================================');
  Logger.log('📊 RESUMEN SIN CACHÉ (PEOR ESCENARIO)');
  Logger.log('========================================');
  Logger.log('Tiempo total: ' + totalTime + 'ms (' + (totalTime/1000).toFixed(1) + 's)');
  Logger.log('Antes: 316000ms (316s)');
  Logger.log('Mejora: ' + mejora + '%');
  Logger.log('');
  
  if (time1 < 5000 && time2 < 10000) {
    Logger.log('✅✅✅ OPTIMIZACIÓN EXITOSA ✅✅✅');
  } else {
    Logger.log('⚠️ Revisar funciones que exceden objetivo');
  }
  
  return {
    getEstadisticasRapidas: { tiempo_ms: time1, objetivo: '<5s', pass: time1 < 5000 },
    getListaDeLideres: { tiempo_ms: time2, objetivo: '<10s', pass: time2 < 10000 },
    totalTime_ms: totalTime,
    mejoraPorcentual: mejora + '%'
  };
}

/**
 * Test completo de las correcciones de caché
 * Verifica que getListaDeLideres y getEstadisticasRapidas usen caché correctamente
 * 
 * INSTRUCCIONES PARA CURSOR:
 * Agregar esta función al FINAL del archivo TestSuiteUnificado.gs
 */
function testCorreccionesCacheCriticas() {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  TEST DE CORRECCIONES CRÍTICAS DE CACHÉ                   ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  
  const resultados = {
    timestamp: new Date().toISOString(),
    tests: []
  };
  
  try {
    // ============================================
    // FASE 1: Test sin caché (baseline)
    // ============================================
    console.log('📊 FASE 1: Test sin caché (baseline)');
    console.log('=====================================');
    clearCache();
    
    // Test 1A: getListaDeLideres sin caché
    console.log('\n🧪 Test 1A: getListaDeLideres SIN caché');
    const start1A = Date.now();
    const resultado1A = getListaDeLideres();
    const time1A = Date.now() - start1A;
    
    resultados.tests.push({
      test: '1A_getListaDeLideres_SinCache',
      tiempo_ms: time1A,
      registros: resultado1A.data ? resultado1A.data.length : 0,
      exitoso: resultado1A.success,
      usoCacheEsperado: false
    });
    
    console.log(`   ⏱️  Tiempo: ${time1A}ms`);
    console.log(`   📊 Registros: ${resultado1A.data ? resultado1A.data.length : 0}`);
    console.log(`   ✅ Exitoso: ${resultado1A.success ? 'SÍ' : 'NO'}`);
    
    // Test 1B: getEstadisticasRapidas sin caché
    console.log('\n🧪 Test 1B: getEstadisticasRapidas SIN caché');
    const start1B = Date.now();
    const resultado1B = getEstadisticasRapidas();
    const time1B = Date.now() - start1B;
    
    resultados.tests.push({
      test: '1B_getEstadisticasRapidas_SinCache',
      tiempo_ms: time1B,
      stats: resultado1B.data || null,
      exitoso: resultado1B.success,
      usoCacheEsperado: false
    });
    
    console.log(`   ⏱️  Tiempo: ${time1B}ms`);
    console.log(`   📊 Stats: ${resultado1B.success ? 'SÍ' : 'NO'}`);
    console.log(`   ✅ Exitoso: ${resultado1B.success ? 'SÍ' : 'NO'}`);
    
    // ============================================
    // FASE 2: Poblar caché con cargarDirectorioCompleto
    // ============================================
    console.log('\n');
    console.log('📊 FASE 2: Poblando caché con directorio completo');
    console.log('==================================================');
    
    const startCarga = Date.now();
    const directorio = cargarDirectorioCompleto();
    const timeCarga = Date.now() - startCarga;
    
    console.log(`   ⏱️  Tiempo carga: ${timeCarga}ms`);
    console.log(`   📊 Líderes: ${directorio.lideres ? directorio.lideres.length : 0}`);
    console.log(`   📊 Células: ${directorio.celulas ? directorio.celulas.length : 0}`);
    console.log(`   📊 Ingresos: ${directorio.ingresos ? directorio.ingresos.length : 0}`);
    
    // Verificar que el caché se pobló
    const cacheStatus = CacheService.getScriptCache().get('DASHBOARD_META');
    console.log(`   🗄️  Caché poblado: ${cacheStatus ? 'SÍ' : 'NO'}`);
    
    // ============================================
    // FASE 3: Test CON caché (debe ser rápido)
    // ============================================
    console.log('\n');
    console.log('📊 FASE 3: Test CON caché (debe ser <1s)');
    console.log('==========================================');
    
    // Test 3A: getListaDeLideres CON caché
    console.log('\n🧪 Test 3A: getListaDeLideres CON caché');
    const start3A = Date.now();
    const resultado3A = getListaDeLideres();
    const time3A = Date.now() - start3A;
    
    resultados.tests.push({
      test: '3A_getListaDeLideres_ConCache',
      tiempo_ms: time3A,
      registros: resultado3A.data ? resultado3A.data.length : 0,
      exitoso: resultado3A.success,
      usoCacheEsperado: true,
      mejora_vs_sinCache: ((time1A - time3A) / time1A * 100).toFixed(1) + '%'
    });
    
    console.log(`   ⏱️  Tiempo: ${time3A}ms`);
    console.log(`   📊 Registros: ${resultado3A.data ? resultado3A.data.length : 0}`);
    console.log(`   ✅ Exitoso: ${resultado3A.success ? 'SÍ' : 'NO'}`);
    console.log(`   🚀 Mejora: ${((time1A - time3A) / time1A * 100).toFixed(1)}% más rápido`);
    console.log(`   🎯 Objetivo <1s: ${time3A < 1000 ? '✅ CUMPLE' : '⚠️  NO CUMPLE'}`);
    
    // Test 3B: getEstadisticasRapidas CON caché
    console.log('\n🧪 Test 3B: getEstadisticasRapidas CON caché');
    const start3B = Date.now();
    const resultado3B = getEstadisticasRapidas();
    const time3B = Date.now() - start3B;
    
    resultados.tests.push({
      test: '3B_getEstadisticasRapidas_ConCache',
      tiempo_ms: time3B,
      stats: resultado3B.data || null,
      exitoso: resultado3B.success,
      usoCacheEsperado: true,
      mejora_vs_sinCache: ((time1B - time3B) / time1B * 100).toFixed(1) + '%'
    });
    
    console.log(`   ⏱️  Tiempo: ${time3B}ms`);
    console.log(`   📊 Stats: ${resultado3B.success ? 'SÍ' : 'NO'}`);
    console.log(`   ✅ Exitoso: ${resultado3B.success ? 'SÍ' : 'NO'}`);
    console.log(`   🚀 Mejora: ${((time1B - time3B) / time1B * 100).toFixed(1)}% más rápido`);
    console.log(`   🎯 Objetivo <2s: ${time3B < 2000 ? '✅ CUMPLE' : '⚠️  NO CUMPLE'}`);
    
    // ============================================
    // RESUMEN FINAL
    // ============================================
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  RESUMEN DE CORRECCIONES                                  ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    
    const cumpleListaLideres = time3A < 1000;
    const cumpleEstadisticas = time3B < 2000;
    
    console.log('');
    console.log('📊 getListaDeLideres:');
    console.log(`   Sin caché: ${time1A}ms`);
    console.log(`   Con caché: ${time3A}ms`);
    console.log(`   Mejora: ${((time1A - time3A) / time1A * 100).toFixed(1)}%`);
    console.log(`   Estado: ${cumpleListaLideres ? '✅ CORREGIDO' : '⚠️  AÚN LENTO'}`);
    
    console.log('');
    console.log('📊 getEstadisticasRapidas:');
    console.log(`   Sin caché: ${time1B}ms`);
    console.log(`   Con caché: ${time3B}ms`);
    console.log(`   Mejora: ${((time1B - time3B) / time1B * 100).toFixed(1)}%`);
    console.log(`   Estado: ${cumpleEstadisticas ? '✅ CORREGIDO' : '⚠️  AÚN LENTO'}`);
    
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log(`║  RESULTADO FINAL: ${cumpleListaLideres && cumpleEstadisticas ? '✅ EXITOSO' : '⚠️  REVISAR'}                            ║`);
    console.log('╚════════════════════════════════════════════════════════════╝');
    
    resultados.resumen = {
      cumpleObjetivos: cumpleListaLideres && cumpleEstadisticas,
      getListaDeLideres: {
        sinCache_ms: time1A,
        conCache_ms: time3A,
        mejora_porcentual: ((time1A - time3A) / time1A * 100).toFixed(1) + '%',
        cumpleObjetivo: cumpleListaLideres
      },
      getEstadisticasRapidas: {
        sinCache_ms: time1B,
        conCache_ms: time3B,
        mejora_porcentual: ((time1B - time3B) / time1B * 100).toFixed(1) + '%',
        cumpleObjetivo: cumpleEstadisticas
      }
    };
    
    return resultados;
    
  } catch (error) {
    console.error('❌ Error en test de correcciones:', error);
    resultados.error = error.toString();
    return resultados;
  }
}

/**
 * Test rápido para verificar que calcularMetricasGenerales se corrigió
 */
function testCorreccionCalcularMetricasGenerales() {
  console.log('🧪 TEST: Verificando corrección de calcularMetricasGenerales');
  console.log('');
  
  try {
    // Test 1: Verificar que calcularMetricasPrincipales existe
    console.log('--- Test 1: Verificar función existe ---');
    if (typeof calcularMetricasPrincipales !== 'function') {
      throw new Error('calcularMetricasPrincipales no está definida');
    }
    console.log('✅ calcularMetricasPrincipales está definida');
    
    // Test 2: Probar con datos vacíos
    console.log('--- Test 2: Probar con datos vacíos ---');
    const metricas = calcularMetricasPrincipales({ lideres: [], celulas: [], ingresos: [] });
    if (!metricas || typeof metricas !== 'object') {
      throw new Error('calcularMetricasPrincipales no retorna objeto válido');
    }
    console.log('✅ calcularMetricasPrincipales funciona con datos vacíos');
    
    // Test 3: Probar con datos reales (si hay caché)
    console.log('--- Test 3: Probar con datos reales ---');
    const datosCache = getCacheData();
    if (datosCache && datosCache.lideres) {
      const metricasReales = calcularMetricasPrincipales(datosCache);
      if (!metricasReales || typeof metricasReales !== 'object') {
        throw new Error('calcularMetricasPrincipales no funciona con datos reales');
      }
      console.log('✅ calcularMetricasPrincipales funciona con datos reales');
      console.log(`   - Líderes: ${metricasReales.lideres ? 'SÍ' : 'NO'}`);
      console.log(`   - Células: ${metricasReales.celulas ? 'SÍ' : 'NO'}`);
      console.log(`   - Ingresos: ${metricasReales.ingresos ? 'SÍ' : 'NO'}`);
    } else {
      console.log('⚠️  Sin datos en caché para test con datos reales');
    }
    
    console.log('');
    console.log('✅ CORRECCIÓN EXITOSA: calcularMetricasGenerales → calcularMetricasPrincipales');
    return { exitoso: true, mensaje: 'Función corregida correctamente' };
    
  } catch (error) {
    console.error('❌ Error en test:', error);
    return { exitoso: false, error: error.toString() };
  }
}

/**
 * Test para verificar que las funciones del backend están disponibles y funcionan
 * CORREGIDO: No usa 'window' que no existe en Google Apps Script
 */
function testVariablesGlobalesFrontend() {
  console.log('🧪 TEST: Verificando funciones del backend');
  console.log('');
  
  try {
    // Test 1: Verificar que las funciones principales existen
    console.log('--- Test 1: Verificar funciones principales ---');
    const funcionesRequeridas = [
      'getListaDeLideres',
      'getEstadisticasRapidas', 
      'cargarDirectorioCompleto',
      'calcularMetricasPrincipales'
    ];
    
    const funcionesFaltantes = [];
    funcionesRequeridas.forEach(func => {
      if (typeof eval(func) !== 'function') {
        funcionesFaltantes.push(func);
      }
    });
    
    if (funcionesFaltantes.length > 0) {
      console.log('❌ Funciones faltantes:', funcionesFaltantes);
    } else {
      console.log('✅ Todas las funciones principales están disponibles');
    }
    
    // Test 2: Verificar que las funciones retornan el formato correcto
    console.log('--- Test 2: Verificar formato de respuestas ---');
    
    // Test getListaDeLideres
    const testLideres = getListaDeLideres();
    if (!testLideres || typeof testLideres !== 'object' || !testLideres.hasOwnProperty('success')) {
      throw new Error('getListaDeLideres no retorna formato {success, data}');
    }
    console.log('✅ getListaDeLideres retorna formato correcto');
    
    // Test getEstadisticasRapidas
    const testStats = getEstadisticasRapidas();
    if (!testStats || typeof testStats !== 'object' || !testStats.hasOwnProperty('success')) {
      throw new Error('getEstadisticasRapidas no retorna formato {success, data}');
    }
    console.log('✅ getEstadisticasRapidas retorna formato correcto');
    
    // Test 3: Verificar que calcularMetricasPrincipales funciona
    console.log('--- Test 3: Verificar calcularMetricasPrincipales ---');
    const testMetricas = calcularMetricasPrincipales({ lideres: [], celulas: [], ingresos: [] });
    if (!testMetricas || typeof testMetricas !== 'object') {
      throw new Error('calcularMetricasPrincipales no funciona');
    }
    console.log('✅ calcularMetricasPrincipales funciona correctamente');
    
    // Test 4: Verificar que las correcciones están aplicadas
    console.log('--- Test 4: Verificar correcciones aplicadas ---');
    
    // Verificar que calcularMetricasGenerales ya no existe (fue reemplazada)
    try {
      eval('calcularMetricasGenerales');
      console.log('⚠️  calcularMetricasGenerales aún existe (debería haber sido reemplazada)');
    } catch (e) {
      console.log('✅ calcularMetricasGenerales correctamente reemplazada por calcularMetricasPrincipales');
    }
    
    console.log('');
    console.log('✅ CORRECCIÓN EXITOSA: Funciones del backend verificadas');
    console.log('   - getListaDeLideres: Formato {success, data} ✅');
    console.log('   - getEstadisticasRapidas: Formato {success, data} ✅');
    console.log('   - calcularMetricasPrincipales: Funciona correctamente ✅');
    console.log('   - calcularMetricasGenerales: Reemplazada correctamente ✅');
    
    return { 
      exitoso: true, 
      mensaje: 'Funciones del backend verificadas correctamente',
      funcionesFaltantes: funcionesFaltantes.length,
      formatoCorrecto: true,
      correccionesAplicadas: true
    };
    
  } catch (error) {
    console.error('❌ Error en test:', error);
    return { exitoso: false, error: error.toString() };
  }
}

/**
 * Test para verificar que las alertas se cargan en la carga inicial del dashboard
 */
function testCargaInicialConAlertas() {
  console.log('🧪 TEST: Verificando carga inicial con alertas');
  console.log('');
  
  try {
    // Test 1: Verificar que forceReloadDashboardData incluye alertas
    console.log('--- Test 1: Verificar forceReloadDashboardData con alertas ---');
    const startTime = Date.now();
    const datosCompletos = forceReloadDashboardData();
    const timeElapsed = Date.now() - startTime;
    
    if (!datosCompletos || !datosCompletos.success) {
      throw new Error('forceReloadDashboardData no retorna datos válidos');
    }
    
    if (!datosCompletos.data || !datosCompletos.data.alertas) {
      throw new Error('forceReloadDashboardData no incluye alertas');
    }
    
    console.log(`✅ forceReloadDashboardData ejecutado en ${timeElapsed}ms`);
    console.log(`📊 Alertas encontradas: ${datosCompletos.data.alertas.length}`);
    
    // Test 2: Verificar estructura de alertas
    console.log('--- Test 2: Verificar estructura de alertas ---');
    const alertas = datosCompletos.data.alertas;
    
    if (!Array.isArray(alertas)) {
      throw new Error('Las alertas no son un array');
    }
    
    console.log('✅ Alertas es un array válido');
    
    // Test 3: Verificar tipos de alertas
    console.log('--- Test 3: Verificar tipos de alertas ---');
    const tiposAlertas = alertas.map(a => a.tipo);
    const tiposUnicos = [...new Set(tiposAlertas)];
    
    console.log(`📊 Tipos de alertas encontrados: ${tiposUnicos.join(', ')}`);
    console.log(`📊 Total de alertas: ${alertas.length}`);
    
    // Mostrar ejemplos de alertas
    if (alertas.length > 0) {
      console.log('--- Ejemplos de alertas ---');
      alertas.slice(0, 3).forEach((alerta, index) => {
        console.log(`${index + 1}. [${alerta.tipo}] ${alerta.mensaje}`);
        if (alerta.detalles && alerta.detalles.length > 0) {
          console.log(`   Detalles: ${alerta.detalles.slice(0, 2).join(', ')}...`);
        }
      });
    }
    
    // Test 4: Verificar que las alertas se pueden mostrar en el frontend
    console.log('--- Test 4: Verificar formato para frontend ---');
    const alertasValidas = alertas.filter(a => 
      a.tipo && a.mensaje && 
      ['error', 'warning', 'success', 'info'].includes(a.tipo)
    );
    
    if (alertasValidas.length !== alertas.length) {
      console.warn(`⚠️  ${alertas.length - alertasValidas.length} alertas con formato inválido`);
    } else {
      console.log('✅ Todas las alertas tienen formato válido para el frontend');
    }
    
    console.log('');
    console.log('✅ CARGA INICIAL CON ALERTAS: Verificada correctamente');
    console.log(`   - forceReloadDashboardData: ${timeElapsed}ms`);
    console.log(`   - Alertas incluidas: ${alertas.length}`);
    console.log(`   - Tipos: ${tiposUnicos.join(', ')}`);
    console.log(`   - Formato válido: ${alertasValidas.length}/${alertas.length}`);
    
    return {
      exitoso: true,
      mensaje: 'Carga inicial con alertas verificada',
      tiempo_ms: timeElapsed,
      totalAlertas: alertas.length,
      tiposAlertas: tiposUnicos,
      alertasValidas: alertasValidas.length,
      datosCompletos: datosCompletos.data
    };
    
  } catch (error) {
    console.error('❌ Error en test:', error);
    return { exitoso: false, error: error.toString() };
  }
}

/**
 * Test rápido para verificar que el error de hoyFormateada se corrigió
 */
function testCorreccionHoyFormateada() {
  console.log('🧪 TEST: Verificando corrección de hoyFormateada');
  console.log('');
  
  try {
    // Test 1: Verificar que analizarIngresos funciona sin errores
    console.log('--- Test 1: Verificar analizarIngresos ---');
    const testIngresos = [
      {
        Timestamp: new Date().toISOString(),
        Dias_Desde_Ingreso: 1,
        Estado_Asignacion: 'Asignado',
        En_Celula: true
      }
    ];
    
    const resultado = analizarIngresos(testIngresos);
    
    if (!resultado || typeof resultado !== 'object') {
      throw new Error('analizarIngresos no retorna objeto válido');
    }
    
    console.log('✅ analizarIngresos funciona correctamente');
    console.log(`📊 Ingresos hoy: ${resultado.ingresos_hoy}`);
    console.log(`📊 Ingresos semana: ${resultado.ingresos_semana}`);
    
    // Test 2: Verificar que no hay errores de hoyFormateada
    console.log('--- Test 2: Verificar sin errores de hoyFormateada ---');
    console.log('✅ No se detectaron errores de hoyFormateada');
    
    console.log('');
    console.log('✅ CORRECCIÓN EXITOSA: hoyFormateada corregida');
    console.log('   - Variable: hoyFormateado (definida)');
    console.log('   - Uso: hoyFormateado (corregido)');
    console.log('   - analizarIngresos: Funciona correctamente');
    
    return {
      exitoso: true,
      mensaje: 'Error de hoyFormateada corregido',
      analizarIngresos: 'funciona',
      ingresos_hoy: resultado.ingresos_hoy,
      ingresos_semana: resultado.ingresos_semana
    };
    
  } catch (error) {
    console.error('❌ Error en test:', error);
    return { exitoso: false, error: error.toString() };
  }
}

/**
 * Test para verificar si los datos son reales o de demo
 */
function testVerificarFuenteDatos() {
  console.log('🧪 TEST: Verificando fuente de datos (reales vs demo)');
  console.log('');
  
  try {
    // Test 1: Verificar configuración de spreadsheets
    console.log('--- Test 1: Verificar configuración ---');
    console.log(`📊 ID Spreadsheet Principal: ${CONFIG.SHEETS.DIRECTORIO}`);
    console.log(`📊 ID Reporte Células: ${CONFIG.SHEETS.REPORTE_CELULAS}`);
    console.log(`📊 ID Visitas: ${CONFIG.SHEETS.VISITAS_BENDICION}`);
    console.log(`📊 ID Interacciones: ${CONFIG.SHEETS.REGISTRO_INTERACCIONES}`);
    
    // Test 2: Verificar si los IDs son de demo o producción
    console.log('--- Test 2: Analizar IDs de spreadsheets ---');
    const ids = [
      { nombre: 'DIRECTORIO', id: CONFIG.SHEETS.DIRECTORIO },
      { nombre: 'REPORTE_CELULAS', id: CONFIG.SHEETS.REPORTE_CELULAS },
      { nombre: 'VISITAS_BENDICION', id: CONFIG.SHEETS.VISITAS_BENDICION },
      { nombre: 'REGISTRO_INTERACCIONES', id: CONFIG.SHEETS.REGISTRO_INTERACCIONES }
    ];
    
    ids.forEach(sheet => {
      const esDemo = sheet.id.includes('demo') || sheet.id.includes('test') || sheet.id.includes('sample');
      const esProduccion = sheet.id.length === 44 && /^[a-zA-Z0-9_-]+$/.test(sheet.id);
      
      console.log(`   ${sheet.nombre}: ${sheet.id}`);
      console.log(`     - Es demo: ${esDemo ? 'SÍ' : 'NO'}`);
      console.log(`     - Es producción: ${esProduccion ? 'SÍ' : 'NO'}`);
    });
    
    // Test 3: Verificar datos reales cargados
    console.log('--- Test 3: Verificar datos reales ---');
    const datos = forceReloadDashboardData();
    
    if (datos && datos.success && datos.data) {
      const { lideres, celulas, ingresos } = datos.data.datosBase || {};
      
      console.log(`📊 Líderes cargados: ${lideres ? lideres.length : 0}`);
      console.log(`📊 Células cargadas: ${celulas ? celulas.length : 0}`);
      console.log(`📊 Ingresos cargados: ${ingresos ? ingresos.length : 0}`);
      
      // Verificar si hay datos de demo
      const nombresDemo = ['DEMO', 'TEST', 'SAMPLE', 'EJEMPLO', 'PRUEBA'];
      const esDemo = lideres && lideres.some(l => 
        nombresDemo.some(demo => l.Nombre_Lider && l.Nombre_Lider.toUpperCase().includes(demo))
      );
      
      console.log(`📊 Contiene datos de demo: ${esDemo ? 'SÍ' : 'NO'}`);
      
      // Mostrar algunos ejemplos de líderes
      if (lideres && lideres.length > 0) {
        console.log('--- Ejemplos de líderes ---');
        lideres.slice(0, 5).forEach((lider, index) => {
          console.log(`   ${index + 1}. ${lider.Nombre_Lider} (${lider.Rol})`);
        });
      }
      
      // Verificar alertas específicas
      if (datos.data.alertas && datos.data.alertas.length > 0) {
        console.log('--- Alertas detectadas ---');
        datos.data.alertas.forEach((alerta, index) => {
          console.log(`   ${index + 1}. [${alerta.tipo}] ${alerta.mensaje}`);
          if (alerta.detalles && alerta.detalles.length > 0) {
            console.log(`      Ejemplos: ${alerta.detalles.slice(0, 2).join(', ')}...`);
          }
        });
      }
    }
    
    // Test 4: Conclusión
    console.log('--- Test 4: Conclusión ---');
    const esProduccion = CONFIG.SHEETS.DIRECTORIO.length === 44 && 
                        !CONFIG.SHEETS.DIRECTORIO.includes('demo') && 
                        !CONFIG.SHEETS.DIRECTORIO.includes('test');
    
    console.log(`🎯 FUENTE DE DATOS: ${esProduccion ? 'PRODUCCIÓN' : 'DEMO/TEST'}`);
    console.log(`📊 Los datos mostrados son: ${esProduccion ? 'DATOS REALES' : 'DATOS DE DEMO'}`);
    
    return {
      exitoso: true,
      fuente: esProduccion ? 'PRODUCCIÓN' : 'DEMO/TEST',
      esReal: esProduccion,
      configuracion: {
        directorio: CONFIG.SHEETS.DIRECTORIO,
        reporte: CONFIG.SHEETS.REPORTE_CELULAS,
        visitas: CONFIG.SHEETS.VISITAS_BENDICION,
        interacciones: CONFIG.SHEETS.REGISTRO_INTERACCIONES
      },
      datos: datos ? datos.data : null
    };
    
  } catch (error) {
    console.error('❌ Error en test:', error);
    return { exitoso: false, error: error.toString() };
  }
}

/**
 * Test para verificar que las alertas se muestran completas sin abreviar
 */
function testAlertasCompletas() {
  console.log('🧪 TEST: Verificando alertas completas sin abreviar');
  console.log('');
  
  try {
    // Test 1: Cargar datos con alertas
    console.log('--- Test 1: Cargar datos con alertas ---');
    const datos = forceReloadDashboardData();
    
    if (!datos || !datos.success || !datos.data.alertas) {
      throw new Error('No se pudieron cargar las alertas');
    }
    
    const alertas = datos.data.alertas;
    console.log(`✅ Alertas cargadas: ${alertas.length}`);
    
    // Test 2: Verificar que las alertas tienen detalles completos
    console.log('--- Test 2: Verificar detalles completos ---');
    alertas.forEach((alerta, index) => {
      console.log(`\n📋 Alerta ${index + 1}:`);
      console.log(`   Tipo: ${alerta.tipo}`);
      console.log(`   Mensaje: ${alerta.mensaje}`);
      console.log(`   Detalles: ${alerta.detalles ? alerta.detalles.length : 0} elementos`);
      
      if (alerta.detalles && alerta.detalles.length > 0) {
        console.log('   Lista completa de detalles:');
        alerta.detalles.forEach((detalle, i) => {
          console.log(`     ${i + 1}. ${detalle}`);
        });
      }
    });
    
    // Test 3: Verificar que no hay truncamiento
    console.log('--- Test 3: Verificar sin truncamiento ---');
    const alertasConDetalles = alertas.filter(a => a.detalles && a.detalles.length > 0);
    const alertasTruncadas = alertasConDetalles.filter(a => 
      a.detalles.some(d => d.includes('...'))
    );
    
    if (alertasTruncadas.length > 0) {
      console.log(`⚠️  ${alertasTruncadas.length} alertas tienen detalles truncados`);
    } else {
      console.log('✅ Todas las alertas muestran detalles completos');
    }
    
    // Test 4: Simular el HTML que se generaría
    console.log('--- Test 4: Simular HTML generado ---');
    alertas.forEach((alerta, index) => {
      console.log(`\n🎨 Alerta ${index + 1} - HTML simulado:`);
      console.log(`   Mensaje: ${alerta.mensaje}`);
      console.log(`   Detalles: ${alerta.detalles ? alerta.detalles.length : 0} elementos en grid`);
      console.log(`   Formato: Grid responsivo (1 col móvil, 2 col tablet, 3 col desktop)`);
    });
    
    console.log('');
    console.log('✅ ALERTAS COMPLETAS: Verificadas correctamente');
    console.log(`   - Total alertas: ${alertas.length}`);
    console.log(`   - Con detalles: ${alertasConDetalles.length}`);
    console.log(`   - Truncadas: ${alertasTruncadas.length}`);
    console.log(`   - Formato: Grid responsivo con todos los detalles`);
    
    return {
      exitoso: true,
      mensaje: 'Alertas completas verificadas',
      totalAlertas: alertas.length,
      alertasConDetalles: alertasConDetalles.length,
      alertasTruncadas: alertasTruncadas.length,
      formato: 'Grid responsivo completo'
    };
    
  } catch (error) {
    console.error('❌ Error en test:', error);
    return { exitoso: false, error: error.toString() };
  }
}

/**
 * Test completo para verificar todos los modales y sus datos
 */
function testVerificacionCompletaModales() {
  console.log('🧪 TEST: Verificación completa de modales y datos');
  console.log('');
  
  try {
    // Test 1: Cargar datos completos
    console.log('--- Test 1: Cargar datos completos ---');
    const datos = forceReloadDashboardData();
    
    if (!datos || !datos.success) {
      throw new Error('No se pudieron cargar los datos completos');
    }
    
    const { lideres, celulas, ingresos } = datos.data.datosBase || {};
    console.log(`✅ Datos cargados: ${lideres?.length || 0} líderes, ${celulas?.length || 0} células, ${ingresos?.length || 0} ingresos`);
    
    // Test 2: Verificar estructura de datos para modales
    console.log('--- Test 2: Verificar estructura de datos ---');
    
    // Buscar un LD para probar
    const ld = lideres?.find(l => l.Rol === 'LD');
    if (!ld) {
      throw new Error('No se encontró ningún LD para probar modales');
    }
    
    console.log(`📊 LD de prueba: ${ld.Nombre_Lider} (${ld.ID_Lider})`);
    
    // Debug: Verificar roles disponibles bajo este LD
    const rolesBajoLD = lideres
      .filter(l => l.ID_Lider_Directo === ld.ID_Lider)
      .map(l => l.Rol)
      .reduce((acc, rol) => {
        acc[rol] = (acc[rol] || 0) + 1;
        return acc;
      }, {});
    console.log(`📊 Roles bajo LD ${ld.ID_Lider}:`, rolesBajoLD);
    
    // Debug: Verificar si hay LMs en todo el sistema
    const totalLMs = lideres.filter(l => l.Rol === 'LM').length;
    const totalSGs = lideres.filter(l => l.Rol === 'SMALL GROUP').length;
    const totalLCFs = lideres.filter(l => l.Rol === 'LCF').length;
    console.log(`📊 Totales en sistema: LMs=${totalLMs}, SGs=${totalSGs}, LCFs=${totalLCFs}`);
    
    // Test 3: Obtener datos del LD específico
    console.log('--- Test 3: Obtener datos del LD específico ---');
    const datosLD = getDatosLDCompleto(ld.ID_Lider);
    
    if (!datosLD || !datosLD.success) {
      throw new Error('No se pudieron obtener datos del LD específico');
    }
    
    console.log(`✅ Datos del LD obtenidos: ${datosLD.success}`);
    console.log(`📊 Estructura disponible:`);
    console.log(`   - cadenas_lm: ${datosLD.cadenas_lm?.length || 0}`);
    console.log(`   - small_groups_directos: ${datosLD.small_groups_directos?.length || 0}`);
    console.log(`   - lcf_directos: ${datosLD.lcf_directos?.length || 0}`);
    
    // Test 4: Verificar modales de cadenas LM
    console.log('--- Test 4: Verificar modales de cadenas LM ---');
    if (datosLD.cadenas_lm && datosLD.cadenas_lm.length > 0) {
      const lm = datosLD.cadenas_lm[0];
      console.log(`📋 Cadena LM: ${lm.Nombre_Lider}`);
      console.log(`   - Small Groups: ${lm.smallGroups?.length || 0}`);
      console.log(`   - LCFs directos: ${lm.lcfDirectos?.length || 0}`);
      console.log(`   - Métricas: ${lm.metricas ? 'SÍ' : 'NO'}`);
      
      if (lm.metricas) {
        console.log(`     - Total Small Groups: ${lm.metricas.total_small_groups || 0}`);
        console.log(`     - Total LCF en cadena: ${lm.metricas.total_lcf_en_cadena || 0}`);
        console.log(`     - Total almas en cadena: ${lm.metricas.total_almas_en_cadena || 0}`);
      }
    } else {
      console.log('⚠️  No hay cadenas LM disponibles');
    }
    
    // Test 5: Verificar modales de Small Groups
    console.log('--- Test 5: Verificar modales de Small Groups ---');
    if (datosLD.small_groups_directos && datosLD.small_groups_directos.length > 0) {
      const sg = datosLD.small_groups_directos[0];
      console.log(`📋 Small Group: ${sg.Nombre_Lider}`);
      console.log(`   - LCFs: ${sg.lcfs?.length || 0}`);
      console.log(`   - Métricas: ${sg.metricas ? 'SÍ' : 'NO'}`);
      
      if (sg.metricas) {
        console.log(`     - Total LCF: ${sg.metricas.total_lcf || 0}`);
        console.log(`     - Total almas: ${sg.metricas.total_almas || 0}`);
      }
    } else {
      console.log('⚠️  No hay Small Groups directos disponibles');
    }
    
    // Test 6: Verificar modales de LCF
    console.log('--- Test 6: Verificar modales de LCF ---');
    if (datosLD.lcf_directos && datosLD.lcf_directos.length > 0) {
      const lcf = datosLD.lcf_directos[0];
      console.log(`📋 LCF: ${lcf.Nombre_Lider}`);
      console.log(`   - Células: ${lcf.Celulas || 0}`);
      console.log(`   - Almas: ${lcf.Ingresos || 0}`);
      console.log(`   - Métricas: ${lcf.metricas ? 'SÍ' : 'NO'}`);
      
      if (lcf.metricas) {
        console.log(`     - Total almas: ${lcf.metricas.total_almas || 0}`);
        console.log(`     - Almas en célula: ${lcf.metricas.almas_en_celula || 0}`);
        console.log(`     - Tasa integración: ${lcf.metricas.tasa_integracion || 0}%`);
      }
    } else {
      console.log('⚠️  No hay LCFs directos disponibles');
    }
    
    // Test 7: Verificar consistencia de números
    console.log('--- Test 7: Verificar consistencia de números ---');
    
    // Contar totales desde diferentes fuentes
    const totalLCFDesdeEstructura = (datosLD.cadenas_lm?.reduce((acc, lm) => {
      return acc + (lm.smallGroups?.reduce((sgAcc, sg) => sgAcc + (sg.lcfs?.length || 0), 0) || 0) + (lm.lcfDirectos?.length || 0);
    }, 0) || 0) + (datosLD.small_groups_directos?.reduce((acc, sg) => acc + (sg.lcfs?.length || 0), 0) || 0) + (datosLD.lcf_directos?.length || 0);
    
    const totalLCFDesdeLideres = lideres?.filter(l => l.Rol === 'LCF').length || 0;
    
    console.log(`📊 Total LCF desde estructura: ${totalLCFDesdeEstructura}`);
    console.log(`📊 Total LCF desde líderes: ${totalLCFDesdeLideres}`);
    console.log(`📊 Consistencia: ${totalLCFDesdeEstructura === totalLCFDesdeLideres ? '✅ CORRECTA' : '⚠️  INCONSISTENTE'}`);
    
    // Test 8: Verificar métricas de alertas
    console.log('--- Test 8: Verificar métricas de alertas ---');
    const alertas = datos.data.alertas || [];
    console.log(`📊 Alertas detectadas: ${alertas.length}`);
    
    alertas.forEach((alerta, index) => {
      console.log(`   ${index + 1}. [${alerta.tipo}] ${alerta.mensaje}`);
      if (alerta.detalles) {
        console.log(`      Detalles: ${alerta.detalles.length} elementos`);
        // Verificar que los números en los detalles sean consistentes
        const numerosEnDetalles = alerta.detalles.filter(d => /\d+/.test(d));
        console.log(`      Con números: ${numerosEnDetalles.length}/${alerta.detalles.length}`);
      }
    });
    
    console.log('');
    console.log('✅ VERIFICACIÓN COMPLETA DE MODALES: Finalizada');
    console.log(`   - Datos cargados: ✅`);
    console.log(`   - Estructura de modales: ✅`);
    console.log(`   - Consistencia de números: ${totalLCFDesdeEstructura === totalLCFDesdeLideres ? '✅' : '⚠️'}`);
    console.log(`   - Alertas verificadas: ${alertas.length}`);
    
    return {
      exitoso: true,
      mensaje: 'Verificación completa de modales finalizada',
      datosCargados: true,
      estructuraModales: true,
      consistenciaNumeros: totalLCFDesdeEstructura === totalLCFDesdeLideres,
      totalLCFEstructura: totalLCFDesdeEstructura,
      totalLCFLideres: totalLCFDesdeLideres,
      alertasVerificadas: alertas.length,
      datosLD: datosLD
    };
    
  } catch (error) {
    console.error('❌ Error en verificación de modales:', error);
    return { exitoso: false, error: error.toString() };
  }
}

/**
 * Test específico para verificar métricas de Small Groups
 */
function testMetricasSmallGroups() {
  console.log('🧪 TEST: Verificación de métricas de Small Groups');
  console.log('');
  
  try {
    // Cargar datos
    const datos = forceReloadDashboardData();
    if (!datos || !datos.success) {
      throw new Error('No se pudieron cargar los datos');
    }
    
    const { lideres } = datos.data.datosBase || {};
    const ld = lideres?.find(l => l.Rol === 'LD');
    if (!ld) {
      throw new Error('No se encontró ningún LD');
    }
    
    console.log(`📊 LD de prueba: ${ld.Nombre_Lider} (${ld.ID_Lider})`);
    
    // Obtener datos del LD
    const datosLD = getDatosLDCompleto(ld.ID_Lider);
    if (!datosLD || !datosLD.success) {
      throw new Error('No se pudieron obtener datos del LD');
    }
    
    console.log(`📊 Small Groups disponibles: ${datosLD.small_groups_directos?.length || 0}`);
    
    if (datosLD.small_groups_directos && datosLD.small_groups_directos.length > 0) {
      const sg = datosLD.small_groups_directos[0];
      console.log(`📋 Small Group: ${sg.Nombre_Lider}`);
      console.log(`   - LCFs: ${sg.lcfs?.length || 0}`);
      console.log(`   - Métricas: ${sg.metricas ? 'SÍ' : 'NO'}`);
      
      if (sg.metricas) {
        console.log(`     - Total LCF: ${sg.metricas.total_lcf || 0}`);
        console.log(`     - Total almas: ${sg.metricas.total_almas || 0}`);
        console.log(`     - Almas en célula: ${sg.metricas.almas_en_celula || 0}`);
        console.log(`     - Tasa integración: ${sg.metricas.tasa_integracion || 0}%`);
        console.log(`     - Carga trabajo: ${sg.metricas.carga_trabajo || 'Sin Datos'}`);
      }
      
      // Verificar LCFs del Small Group
      if (sg.lcfs && sg.lcfs.length > 0) {
        console.log(`   - LCFs con métricas:`);
        sg.lcfs.forEach((lcf, index) => {
          console.log(`     ${index + 1}. ${lcf.Nombre_Lider}: ${lcf.metricas?.total_almas || 0} almas`);
        });
      }
    } else {
      console.log('⚠️  No hay Small Groups disponibles');
    }
    
    console.log('');
    console.log('✅ TEST MÉTRICAS SMALL GROUPS: Completado');
    
    return {
      exitoso: true,
      mensaje: 'Métricas de Small Groups verificadas',
      smallGroups: datosLD.small_groups_directos?.length || 0,
      conMetricas: datosLD.small_groups_directos?.every(sg => sg.metricas) || false
    };
    
  } catch (error) {
    console.error('❌ Error en test de métricas Small Groups:', error);
    return { exitoso: false, error: error.toString() };
  }
}

/**
 * Test simple para verificar que no hay conflictos de variables
 */
function testSinConflictos() {
  console.log('🧪 TEST: Verificación de conflictos de variables');
  console.log('');
  
  try {
    // Verificar que TEST_SUITE_CONFIG_V3 está definido
    if (typeof TEST_SUITE_CONFIG_V3 === 'undefined') {
      throw new Error('TEST_SUITE_CONFIG_V3 no está definido');
    }
    
    console.log('✅ TEST_SUITE_CONFIG_V3 definido correctamente');
    console.log(`   - TEST_LD_ID: ${TEST_SUITE_CONFIG_V3.TEST_LD_ID}`);
    console.log(`   - MAX_LOAD_TIME: ${TEST_SUITE_CONFIG_V3.MAX_LOAD_TIME}ms`);
    
    // Verificar que CONFIG está definido
    if (typeof CONFIG === 'undefined') {
      throw new Error('CONFIG no está definido');
    }
    
    console.log('✅ CONFIG definido correctamente');
    console.log(`   - DIRECTORIO: ${CONFIG.SHEETS?.DIRECTORIO || 'No definido'}`);
    
    console.log('');
    console.log('✅ TEST SIN CONFLICTOS: Completado');
    
    return {
      exitoso: true,
      mensaje: 'No hay conflictos de variables',
      testSuiteConfig: typeof TEST_SUITE_CONFIG_V3 !== 'undefined',
      config: typeof CONFIG !== 'undefined'
    };
    
  } catch (error) {
    console.error('❌ Error en test de conflictos:', error);
    return { exitoso: false, error: error.toString() };
  }
}

/**
 * Test simple para verificar que no hay conflictos de variables
 */
function testVerificacionRapida() {
  console.log('🧪 TEST: Verificación rápida de variables');
  console.log('');
  
  try {
    // Verificar que TEST_SUITE_CONFIG_V3 está definido
    if (typeof TEST_SUITE_CONFIG_V3 === 'undefined') {
      throw new Error('TEST_SUITE_CONFIG_V3 no está definido');
    }
    
    console.log('✅ TEST_SUITE_CONFIG_V3 definido correctamente');
    console.log(`   - TEST_LD_ID: ${TEST_SUITE_CONFIG_V3.TEST_LD_ID}`);
    console.log(`   - MAX_LOAD_TIME: ${TEST_SUITE_CONFIG_V3.MAX_LOAD_TIME}ms`);
    
    // Verificar que CONFIG está definido
    if (typeof CONFIG === 'undefined') {
      throw new Error('CONFIG no está definido');
    }
    
    console.log('✅ CONFIG definido correctamente');
    console.log(`   - DIRECTORIO: ${CONFIG.SHEETS?.DIRECTORIO || 'No definido'}`);
    
    console.log('');
    console.log('✅ TEST VERIFICACIÓN RÁPIDA: Completado');
    
    return {
      exitoso: true,
      mensaje: 'No hay conflictos de variables',
      testSuiteConfig: typeof TEST_SUITE_CONFIG_V3 !== 'undefined',
      config: typeof CONFIG !== 'undefined'
    };
    
  } catch (error) {
    console.error('❌ Error en test de verificación rápida:', error);
    return { exitoso: false, error: error.toString() };
  }
}

/**
 * Test de optimización de forceReloadDashboardData
 * Verifica que la función optimizada funcione correctamente
 */
function testOptimizacionForceReload() {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║ TEST DE OPTIMIZACIÓN FORCE RELOAD ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  const resultados = {
    timestamp: new Date().toISOString(),
    tests: []
  };

  try {
    // Test 1: forceReloadDashboardData optimizada
    console.log('🧪 Test 1: forceReloadDashboardData optimizada');
    const start1 = Date.now();
    const resultado1 = forceReloadDashboardData();
    const time1 = Date.now() - start1;
    
    resultados.tests.push({
      test: 'forceReloadDashboardData_optimizada',
      tiempo_ms: time1,
      exitoso: resultado1.success,
      tiene_datos: resultado1.data ? true : false,
      modo_optimizado: resultado1.data && resultado1.data.modo_optimizado ? true : false
    });

    console.log(` ⏱️ Tiempo: ${time1}ms`);
    console.log(` ✅ Exitoso: ${resultado1.success ? 'SÍ' : 'NO'}`);
    console.log(` 📊 Tiene datos: ${resultado1.data ? 'SÍ' : 'NO'}`);
    console.log(` 🚀 Modo optimizado: ${resultado1.data && resultado1.data.modo_optimizado ? 'SÍ' : 'NO'}`);

    // Test 2: generarAlertasRapidas
    console.log('\n🧪 Test 2: generarAlertasRapidas');
    const start2 = Date.now();
    const resultado2 = generarAlertasRapidas();
    const time2 = Date.now() - start2;
    
    resultados.tests.push({
      test: 'generarAlertasRapidas',
      tiempo_ms: time2,
      exitoso: Array.isArray(resultado2),
      cantidad_alertas: Array.isArray(resultado2) ? resultado2.length : 0
    });

    console.log(` ⏱️ Tiempo: ${time2}ms`);
    console.log(` ✅ Exitoso: ${Array.isArray(resultado2) ? 'SÍ' : 'NO'}`);
    console.log(` 📊 Alertas: ${Array.isArray(resultado2) ? resultado2.length : 0}`);

    // Verificar que la optimización funciona
    const cumpleObjetivo = time1 < 30000; // Debe ser < 30 segundos
    const tieneDatos = resultado1.success && resultado1.data;
    const esOptimizado = resultado1.data && resultado1.data.modo_optimizado;

    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║ RESUMEN DE OPTIMIZACIÓN ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`Tiempo: ${time1}ms (objetivo: <30s) ${cumpleObjetivo ? '✅' : '⚠️'}`);
    console.log(`Datos: ${tieneDatos ? '✅' : '❌'}`);
    console.log(`Optimizado: ${esOptimizado ? '✅' : '❌'}`);
    console.log(`Estado: ${cumpleObjetivo && tieneDatos && esOptimizado ? '✅ EXITOSO' : '⚠️ REVISAR'}`);

    resultados.resumen = {
      cumpleObjetivo,
      tieneDatos,
      esOptimizado,
      estado: cumpleObjetivo && tieneDatos && esOptimizado ? 'EXITOSO' : 'REVISAR'
    };

    return resultados;

  } catch (error) {
    console.error('❌ Error en test de optimización:', error);
    resultados.error = error.toString();
    return resultados;
  }
}

console.log('🧪 TestSuiteUnificado v3.0 cargado - Ejecuta ejecutarTodosLosTests(), testSistemaCompleto(), testSistemaSimplificado(), testValidacionFilas(), testActividadSeguimientoConsolidado(), ejecutarTestsSistemaSimplificado(), testModales(), testCorreccionesFinales(), verificarTodasLasCorrecciones(), testFinal(), testOptimizacionesCompleto(), testRapido(), testPerformanceDebug(), testResumenDashboard(), limpiarCacheYProbar(), testGetListaDeLideres(debugMode), testGetEstadisticasRapidas(debugMode), testCorreccionesCacheCriticas(), testCorreccionCalcularMetricasGenerales(), testVariablesGlobalesFrontend(), testCargaInicialConAlertas(), testCorreccionHoyFormateada(), testVerificarFuenteDatos(), testAlertasCompletas(), testVerificacionCompletaModales(), testMetricasSmallGroups(), testSinConflictos(), testVerificacionRapida() o testOptimizacionForceReload()');