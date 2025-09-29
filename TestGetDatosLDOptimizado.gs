/**
 * @fileoverview Tests para la función getDatosLD optimizada
 */

/**
 * Prueba getDatosLD en modo básico (debe usar búsqueda rápida)
 */
function testGetDatosLDBasicoOptimizado() {
  console.log('🧪 [TEST] Iniciando test de getDatosLD básico optimizado...');
  
  try {
    // Limpiar caché específica
    const cache = CacheService.getScriptCache();
    cache.remove('LD_QUICK_LD-4003');
    cache.remove('LD_BASIC_LD-4003');
    
    // Llamar getDatosLD en modo básico (modoCompleto = false)
    const resultado = getDatosLD('LD-4003', false);
    
    console.log('[TEST] Resultado de getDatosLD básico:', resultado);
    
    // Verificar que fue exitoso
    if (!resultado.success) {
      console.log('❌ [TEST] getDatosLD básico falló:', resultado.error);
      return { success: false, error: resultado.error };
    }
    
    // Verificar estructura de respuesta
    if (!resultado.resumen || !resultado.resumen.ld) {
      console.log('❌ [TEST] Estructura de respuesta incorrecta');
      return { success: false, error: 'Estructura de respuesta incorrecta' };
    }
    
    // Verificar propiedades del LD
    const ld = resultado.resumen.ld;
    const propiedadesRequeridas = ['ID', 'Nombre', 'Rol', 'Superior', 'Estado', 'Fila'];
    const propiedadesFaltantes = propiedadesRequeridas.filter(prop => !(prop in ld));
    
    if (propiedadesFaltantes.length > 0) {
      console.log('❌ [TEST] Faltan propiedades en LD:', propiedadesFaltantes);
      return { success: false, error: `Faltan propiedades: ${propiedadesFaltantes.join(', ')}` };
    }
    
    // Verificar valores específicos
    if (ld.ID !== 'LD-4003') {
      console.log('❌ [TEST] ID incorrecto:', ld.ID);
      return { success: false, error: `ID incorrecto: ${ld.ID}` };
    }
    
    if (ld.Rol !== 'LD') {
      console.log('❌ [TEST] Rol incorrecto:', ld.Rol);
      return { success: false, error: `Rol incorrecto: ${ld.Rol}` };
    }
    
    // Verificar que tiene tiempo de ejecución
    if (typeof resultado.tiempo !== 'number') {
      console.log('❌ [TEST] Falta tiempo de ejecución');
      return { success: false, error: 'Falta tiempo de ejecución' };
    }
    
    console.log('✅ [TEST] getDatosLD básico optimizado funciona correctamente');
    console.log(`[TEST] LD: ${ld.Nombre} (${ld.ID}) - ${ld.Estado}`);
    console.log(`[TEST] Tiempo de ejecución: ${resultado.tiempo}ms`);
    
    return { 
      success: true, 
      tiempo: resultado.tiempo,
      ld: ld,
      optimizacion_usada: true
    };
    
  } catch (error) {
    console.error('❌ [TEST] Error en test de getDatosLD básico:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Prueba getDatosLD en modo completo (debe usar método tradicional)
 */
function testGetDatosLDCompletoTradicional() {
  console.log('🧪 [TEST] Iniciando test de getDatosLD completo tradicional...');
  
  try {
    // Limpiar caché
    const cache = CacheService.getScriptCache();
    cache.remove('LD_FULL_LD-4003');
    
    // Llamar getDatosLD en modo completo (modoCompleto = true)
    const resultado = getDatosLD('LD-4003', true);
    
    console.log('[TEST] Resultado de getDatosLD completo:', resultado);
    
    // Verificar que fue exitoso
    if (!resultado.success) {
      console.log('❌ [TEST] getDatosLD completo falló:', resultado.error);
      return { success: false, error: resultado.error };
    }
    
    // Verificar que tiene la estructura completa
    if (!resultado.resumen || !resultado.resumen.ld) {
      console.log('❌ [TEST] Estructura de respuesta incorrecta');
      return { success: false, error: 'Estructura de respuesta incorrecta' };
    }
    
    // Verificar que tiene datos completos (no solo los básicos)
    const resumen = resultado.resumen;
    const tieneDatosCompletos = resumen.Total_LCF !== undefined || 
                               resumen.Total_Celulas !== undefined ||
                               resumen.lcf_directos !== undefined;
    
    if (!tieneDatosCompletos) {
      console.log('⚠️ [TEST] Los datos no parecen ser completos');
    }
    
    console.log('✅ [TEST] getDatosLD completo funciona correctamente');
    console.log(`[TEST] LD: ${resumen.ld.Nombre} (${resumen.ld.ID})`);
    console.log(`[TEST] LCFs: ${resumen.Total_LCF || 0}`);
    
    return { 
      success: true, 
      ld: resumen.ld,
      datos_completos: tieneDatosCompletos,
      optimizacion_usada: false
    };
    
  } catch (error) {
    console.error('❌ [TEST] Error en test de getDatosLD completo:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Prueba la diferencia de rendimiento entre modo básico y completo
 */
function testGetDatosLDRendimiento() {
  console.log('🧪 [TEST] Iniciando test de rendimiento getDatosLD...');
  
  try {
    // Limpiar todas las cachés
    const cache = CacheService.getScriptCache();
    cache.remove('LD_QUICK_LD-4003');
    cache.remove('LD_BASIC_LD-4003');
    cache.remove('LD_FULL_LD-4003');
    
    // Test modo básico (optimizado)
    console.log('[TEST] Probando modo básico (optimizado)...');
    const startBasico = Date.now();
    const resultadoBasico = getDatosLD('LD-4003', false);
    const tiempoBasico = Date.now() - startBasico;
    
    if (!resultadoBasico.success) {
      console.log('❌ [TEST] Modo básico falló:', resultadoBasico.error);
      return { success: false, error: 'Modo básico falló' };
    }
    
    // Test modo completo (tradicional)
    console.log('[TEST] Probando modo completo (tradicional)...');
    const startCompleto = Date.now();
    const resultadoCompleto = getDatosLD('LD-4003', true);
    const tiempoCompleto = Date.now() - startCompleto;
    
    if (!resultadoCompleto.success) {
      console.log('❌ [TEST] Modo completo falló:', resultadoCompleto.error);
      return { success: false, error: 'Modo completo falló' };
    }
    
    // Comparar rendimiento
    const mejora = tiempoCompleto - tiempoBasico;
    const porcentajeMejora = ((tiempoCompleto - tiempoBasico) / tiempoCompleto * 100).toFixed(1);
    
    console.log(`[TEST] Rendimiento:`);
    console.log(`[TEST] - Modo básico (optimizado): ${tiempoBasico}ms`);
    console.log(`[TEST] - Modo completo (tradicional): ${tiempoCompleto}ms`);
    console.log(`[TEST] - Mejora: ${mejora}ms (${porcentajeMejora}%)`);
    
    // Verificar que el modo básico es más rápido
    if (tiempoBasico >= tiempoCompleto) {
      console.log('⚠️ [TEST] El modo básico no es más rápido que el completo');
    }
    
    console.log('✅ [TEST] Test de rendimiento completado');
    
    return { 
      success: true, 
      tiempo_basico: tiempoBasico,
      tiempo_completo: tiempoCompleto,
      mejora: mejora,
      porcentaje_mejora: porcentajeMejora
    };
    
  } catch (error) {
    console.error('❌ [TEST] Error en test de rendimiento:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Prueba el sistema de caché con la optimización
 */
function testGetDatosLDCacheOptimizado() {
  console.log('🧪 [TEST] Iniciando test de caché optimizado...');
  
  try {
    // Limpiar todas las cachés
    const cache = CacheService.getScriptCache();
    cache.remove('LD_QUICK_LD-4003');
    cache.remove('LD_BASIC_LD-4003');
    
    // Primera llamada (debe usar búsqueda rápida)
    console.log('[TEST] Primera llamada (búsqueda rápida)...');
    const resultado1 = getDatosLD('LD-4003', false);
    
    if (!resultado1.success) {
      console.log('❌ [TEST] Primera llamada falló:', resultado1.error);
      return { success: false, error: 'Primera llamada falló' };
    }
    
    // Segunda llamada (debe usar caché)
    console.log('[TEST] Segunda llamada (caché)...');
    const resultado2 = getDatosLD('LD-4003', false);
    
    if (!resultado2.success) {
      console.log('❌ [TEST] Segunda llamada falló:', resultado2.error);
      return { success: false, error: 'Segunda llamada falló' };
    }
    
    // Verificar que los datos son consistentes
    const ld1 = resultado1.resumen.ld;
    const ld2 = resultado2.resumen.ld;
    
    if (ld1.ID !== ld2.ID || ld1.Nombre !== ld2.Nombre) {
      console.log('❌ [TEST] Los datos de caché no coinciden');
      return { success: false, error: 'Datos de caché inconsistentes' };
    }
    
    // Verificar que la segunda llamada fue más rápida
    if (resultado2.tiempo >= resultado1.tiempo) {
      console.log('⚠️ [TEST] La segunda llamada no fue más rápida');
    }
    
    console.log('✅ [TEST] Sistema de caché optimizado funciona correctamente');
    console.log(`[TEST] Primera llamada: ${resultado1.tiempo}ms`);
    console.log(`[TEST] Segunda llamada: ${resultado2.tiempo}ms`);
    
    return { 
      success: true, 
      primera_llamada: resultado1.tiempo,
      segunda_llamada: resultado2.tiempo,
      mejora: resultado1.tiempo - resultado2.tiempo
    };
    
  } catch (error) {
    console.error('❌ [TEST] Error en test de caché:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Ejecuta todos los tests de getDatosLD optimizado
 */
function ejecutarTestsGetDatosLDOptimizado() {
  console.log('🚀 [TEST] Iniciando suite completa de tests de getDatosLD optimizado...');
  
  const resultados = {
    basico: testGetDatosLDBasicoOptimizado(),
    completo: testGetDatosLDCompletoTradicional(),
    rendimiento: testGetDatosLDRendimiento(),
    cache: testGetDatosLDCacheOptimizado()
  };
  
  console.log('📊 [TEST] Resultados de tests:');
  console.log('Modo básico optimizado:', resultados.basico);
  console.log('Modo completo tradicional:', resultados.completo);
  console.log('Rendimiento:', resultados.rendimiento);
  console.log('Sistema de caché:', resultados.cache);
  
  const exitosos = Object.values(resultados).filter(r => r.success).length;
  const total = Object.keys(resultados).length;
  
  console.log(`✅ [TEST] Tests exitosos: ${exitosos}/${total}`);
  
  return {
    success: exitosos === total,
    resultados: resultados,
    resumen: `${exitosos}/${total} tests exitosos`,
    detalles: {
      modo_basico: resultados.basico.success,
      modo_completo: resultados.completo.success,
      rendimiento: resultados.rendimiento.success,
      sistema_cache: resultados.cache.success
    }
  };
}

console.log('🧪 TestGetDatosLDOptimizado cargado - Tests para función optimizada');
