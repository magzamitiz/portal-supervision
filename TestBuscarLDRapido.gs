/**
 * @fileoverview Tests para la función buscarLDRapido
 */

/**
 * Prueba la función buscarLDRapido con un LD existente
 */
function testBuscarLDRapidoExistente() {
  console.log('🧪 [TEST] Iniciando test de buscarLDRapido con LD existente...');
  
  try {
    // Limpiar caché específica primero
    const cache = CacheService.getScriptCache();
    cache.remove('LD_QUICK_LD-4003');
    
    // Buscar LD-4003 (que sabemos que existe)
    const resultado = buscarLDRapido('LD-4003');
    
    console.log('[TEST] Resultado de búsqueda:', resultado);
    
    // Verificar estructura de respuesta
    if (!resultado.success) {
      console.log('❌ [TEST] La búsqueda falló:', resultado.error);
      return { success: false, error: resultado.error };
    }
    
    // Verificar propiedades del LD
    const ld = resultado.ld;
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
    
    // Verificar tiempo de ejecución
    if (resultado.tiempo > 1000) {
      console.log('⚠️ [TEST] Tiempo de ejecución lento:', resultado.tiempo + 'ms');
    }
    
    console.log('✅ [TEST] LD encontrado correctamente');
    console.log(`[TEST] Tiempo de ejecución: ${resultado.tiempo}ms`);
    console.log(`[TEST] LD: ${ld.Nombre} (${ld.ID}) - ${ld.Estado}`);
    
    return { 
      success: true, 
      tiempo: resultado.tiempo,
      ld: ld
    };
    
  } catch (error) {
    console.error('❌ [TEST] Error en test de LD existente:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Prueba la función buscarLDRapido con un LD inexistente
 */
function testBuscarLDRapidoInexistente() {
  console.log('🧪 [TEST] Iniciando test de buscarLDRapido con LD inexistente...');
  
  try {
    // Buscar un LD que no existe
    const resultado = buscarLDRapido('LD-9999');
    
    console.log('[TEST] Resultado de búsqueda:', resultado);
    
    // Verificar que falló correctamente
    if (resultado.success) {
      console.log('❌ [TEST] La búsqueda debería haber fallado');
      return { success: false, error: 'La búsqueda no falló como se esperaba' };
    }
    
    // Verificar mensaje de error
    if (!resultado.error || !resultado.error.includes('no encontrado')) {
      console.log('❌ [TEST] Mensaje de error incorrecto:', resultado.error);
      return { success: false, error: `Mensaje de error incorrecto: ${resultado.error}` };
    }
    
    // Verificar tiempo de ejecución
    if (resultado.tiempo > 1000) {
      console.log('⚠️ [TEST] Tiempo de ejecución lento:', resultado.tiempo + 'ms');
    }
    
    console.log('✅ [TEST] LD inexistente manejado correctamente');
    console.log(`[TEST] Tiempo de ejecución: ${resultado.tiempo}ms`);
    
    return { 
      success: true, 
      tiempo: resultado.tiempo,
      error: resultado.error
    };
    
  } catch (error) {
    console.error('❌ [TEST] Error en test de LD inexistente:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Prueba el sistema de caché de buscarLDRapido
 */
function testBuscarLDRapidoCache() {
  console.log('🧪 [TEST] Iniciando test de caché de buscarLDRapido...');
  
  try {
    // Limpiar caché específica
    const cache = CacheService.getScriptCache();
    cache.remove('LD_QUICK_LD-4003');
    
    // Primera búsqueda (debe ir a la hoja)
    console.log('[TEST] Primera búsqueda (sin caché)...');
    const resultado1 = buscarLDRapido('LD-4003');
    
    if (!resultado1.success) {
      console.log('❌ [TEST] Primera búsqueda falló:', resultado1.error);
      return { success: false, error: 'Primera búsqueda falló' };
    }
    
    // Segunda búsqueda (debe usar caché)
    console.log('[TEST] Segunda búsqueda (con caché)...');
    const resultado2 = buscarLDRapido('LD-4003');
    
    if (!resultado2.success) {
      console.log('❌ [TEST] Segunda búsqueda falló:', resultado2.error);
      return { success: false, error: 'Segunda búsqueda falló' };
    }
    
    // Verificar que la segunda búsqueda fue más rápida
    if (resultado2.tiempo >= resultado1.tiempo) {
      console.log('⚠️ [TEST] La segunda búsqueda no fue más rápida');
      console.log(`[TEST] Primera: ${resultado1.tiempo}ms, Segunda: ${resultado2.tiempo}ms`);
    }
    
    // Verificar que los datos son idénticos
    const ld1 = resultado1.ld;
    const ld2 = resultado2.ld;
    
    if (ld1.ID !== ld2.ID || ld1.Nombre !== ld2.Nombre) {
      console.log('❌ [TEST] Los datos de caché no coinciden');
      return { success: false, error: 'Datos de caché inconsistentes' };
    }
    
    console.log('✅ [TEST] Sistema de caché funciona correctamente');
    console.log(`[TEST] Primera búsqueda: ${resultado1.tiempo}ms`);
    console.log(`[TEST] Segunda búsqueda: ${resultado2.tiempo}ms`);
    console.log(`[TEST] Mejora de velocidad: ${resultado1.tiempo - resultado2.tiempo}ms`);
    
    return { 
      success: true, 
      primera_busqueda: resultado1.tiempo,
      segunda_busqueda: resultado2.tiempo,
      mejora: resultado1.tiempo - resultado2.tiempo
    };
    
  } catch (error) {
    console.error('❌ [TEST] Error en test de caché:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Prueba el rendimiento de buscarLDRapido
 */
function testBuscarLDRapidoRendimiento() {
  console.log('🧪 [TEST] Iniciando test de rendimiento de buscarLDRapido...');
  
  try {
    // Limpiar caché
    const cache = CacheService.getScriptCache();
    cache.remove('LD_QUICK_LD-4003');
    
    const tiempos = [];
    const numPruebas = 5;
    
    // Ejecutar múltiples búsquedas
    for (let i = 0; i < numPruebas; i++) {
      const resultado = buscarLDRapido('LD-4003');
      
      if (!resultado.success) {
        console.log(`❌ [TEST] Búsqueda ${i + 1} falló:`, resultado.error);
        return { success: false, error: `Búsqueda ${i + 1} falló` };
      }
      
      tiempos.push(resultado.tiempo);
      console.log(`[TEST] Búsqueda ${i + 1}: ${resultado.tiempo}ms`);
    }
    
    // Calcular estadísticas
    const tiempoPromedio = tiempos.reduce((sum, t) => sum + t, 0) / tiempos.length;
    const tiempoMinimo = Math.min(...tiempos);
    const tiempoMaximo = Math.max(...tiempos);
    
    console.log(`[TEST] Estadísticas de rendimiento:`);
    console.log(`[TEST] - Promedio: ${tiempoPromedio.toFixed(2)}ms`);
    console.log(`[TEST] - Mínimo: ${tiempoMinimo}ms`);
    console.log(`[TEST] - Máximo: ${tiempoMaximo}ms`);
    
    // Verificar que el promedio es menor a 1 segundo
    if (tiempoPromedio > 1000) {
      console.log('⚠️ [TEST] Tiempo promedio excede 1 segundo');
    }
    
    console.log('✅ [TEST] Test de rendimiento completado');
    
    return { 
      success: true, 
      promedio: tiempoPromedio,
      minimo: tiempoMinimo,
      maximo: tiempoMaximo,
      pruebas: numPruebas
    };
    
  } catch (error) {
    console.error('❌ [TEST] Error en test de rendimiento:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Ejecuta todos los tests de buscarLDRapido
 */
function ejecutarTestsBuscarLDRapido() {
  console.log('🚀 [TEST] Iniciando suite completa de tests de buscarLDRapido...');
  
  const resultados = {
    existente: testBuscarLDRapidoExistente(),
    inexistente: testBuscarLDRapidoInexistente(),
    cache: testBuscarLDRapidoCache(),
    rendimiento: testBuscarLDRapidoRendimiento()
  };
  
  console.log('📊 [TEST] Resultados de tests:');
  console.log('LD existente:', resultados.existente);
  console.log('LD inexistente:', resultados.inexistente);
  console.log('Sistema de caché:', resultados.cache);
  console.log('Rendimiento:', resultados.rendimiento);
  
  const exitosos = Object.values(resultados).filter(r => r.success).length;
  const total = Object.keys(resultados).length;
  
  console.log(`✅ [TEST] Tests exitosos: ${exitosos}/${total}`);
  
  return {
    success: exitosos === total,
    resultados: resultados,
    resumen: `${exitosos}/${total} tests exitosos`,
    detalles: {
      ld_existente: resultados.existente.success,
      ld_inexistente: resultados.inexistente.success,
      sistema_cache: resultados.cache.success,
      rendimiento: resultados.rendimiento.success
    }
  };
}

console.log('🧪 TestBuscarLDRapido cargado - Tests para función de búsqueda rápida');
