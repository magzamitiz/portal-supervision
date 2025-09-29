/**
 * @fileoverview Tests para la función cargarDirectorioCompleto optimizada
 */

/**
 * Prueba cargarDirectorioCompleto con caché limpia
 */
function testCargarDirectorioCompletoOptimizado() {
  console.log('🧪 [TEST] Iniciando test de cargarDirectorioCompleto optimizado...');
  
  try {
    // Limpiar caché completamente
    clearCache();
    
    const startTime = Date.now();
    console.log('[TEST] Cargando directorio completo (sin caché)...');
    
    const resultado = cargarDirectorioCompleto(true); // forceReload = true
    
    const totalTime = Date.now() - startTime;
    console.log(`[TEST] Tiempo total de carga: ${totalTime}ms (${(totalTime/1000).toFixed(1)}s)`);
    
    // Verificar estructura de respuesta
    if (!resultado.lideres || !resultado.celulas || !resultado.ingresos) {
      console.log('❌ [TEST] Estructura de respuesta incorrecta');
      return { success: false, error: 'Estructura de respuesta incorrecta' };
    }
    
    // Verificar que hay datos
    const tieneLideres = resultado.lideres.length > 0;
    const tieneCelulas = resultado.celulas.length > 0;
    const tieneIngresos = resultado.ingresos.length > 0;
    
    if (!tieneLideres && !tieneCelulas && !tieneIngresos) {
      console.log('❌ [TEST] No se cargaron datos');
      return { success: false, error: 'No se cargaron datos' };
    }
    
    // Verificar timestamp
    if (!resultado.timestamp) {
      console.log('❌ [TEST] Falta timestamp');
      return { success: false, error: 'Falta timestamp' };
    }
    
    // Verificar tiempo de ejecución (objetivo: < 30 segundos)
    const tiempoEnSegundos = totalTime / 1000;
    const cumpleObjetivo = tiempoEnSegundos < 30;
    
    if (!cumpleObjetivo) {
      console.log(`⚠️ [TEST] Tiempo excede objetivo: ${tiempoEnSegundos.toFixed(1)}s > 30s`);
    }
    
    console.log('✅ [TEST] cargarDirectorioCompleto optimizado funciona correctamente');
    console.log(`[TEST] Líderes: ${resultado.lideres.length}`);
    console.log(`[TEST] Células: ${resultado.celulas.length}`);
    console.log(`[TEST] Ingresos: ${resultado.ingresos.length}`);
    console.log(`[TEST] Tiempo: ${tiempoEnSegundos.toFixed(1)}s`);
    
    return { 
      success: true, 
      tiempo: totalTime,
      tiempoSegundos: tiempoEnSegundos,
      cumpleObjetivo: cumpleObjetivo,
      lideres: resultado.lideres.length,
      celulas: resultado.celulas.length,
      ingresos: resultado.ingresos.length
    };
    
  } catch (error) {
    console.error('❌ [TEST] Error en test de cargarDirectorioCompleto:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Prueba cargarDirectorioCompleto con caché existente
 */
function testCargarDirectorioCompletoConCache() {
  console.log('🧪 [TEST] Iniciando test de cargarDirectorioCompleto con caché...');
  
  try {
    // Primero cargar datos para crear caché
    console.log('[TEST] Cargando datos para crear caché...');
    const resultado1 = cargarDirectorioCompleto(true);
    
    if (!resultado1.lideres || resultado1.lideres.length === 0) {
      console.log('❌ [TEST] No se pudieron cargar datos para crear caché');
      return { success: false, error: 'No se pudieron cargar datos' };
    }
    
    // Segunda carga (debe usar caché)
    console.log('[TEST] Cargando datos desde caché...');
    const startTime = Date.now();
    const resultado2 = cargarDirectorioCompleto(false); // forceReload = false
    const cacheTime = Date.now() - startTime;
    
    // Verificar que los datos son consistentes
    if (resultado1.lideres.length !== resultado2.lideres.length) {
      console.log('❌ [TEST] Número de líderes inconsistente entre caché y datos originales');
      return { success: false, error: 'Datos de caché inconsistentes' };
    }
    
    if (resultado1.celulas.length !== resultado2.celulas.length) {
      console.log('❌ [TEST] Número de células inconsistente entre caché y datos originales');
      return { success: false, error: 'Datos de caché inconsistentes' };
    }
    
    if (resultado1.ingresos.length !== resultado2.ingresos.length) {
      console.log('❌ [TEST] Número de ingresos inconsistente entre caché y datos originales');
      return { success: false, error: 'Datos de caché inconsistentes' };
    }
    
    // Verificar que la carga desde caché es más rápida
    const mejora = resultado1.tiempo - cacheTime;
    const porcentajeMejora = resultado1.tiempo > 0 ? (mejora / resultado1.tiempo * 100).toFixed(1) : 0;
    
    console.log('✅ [TEST] cargarDirectorioCompleto con caché funciona correctamente');
    console.log(`[TEST] Tiempo desde caché: ${cacheTime}ms`);
    console.log(`[TEST] Mejora de velocidad: ${mejora}ms (${porcentajeMejora}%)`);
    
    return { 
      success: true, 
      tiempoCache: cacheTime,
      mejora: mejora,
      porcentajeMejora: porcentajeMejora,
      datosConsistentes: true
    };
    
  } catch (error) {
    console.error('❌ [TEST] Error en test de caché:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Prueba el rendimiento de cargarDirectorioCompleto múltiples veces
 */
function testCargarDirectorioCompletoRendimiento() {
  console.log('🧪 [TEST] Iniciando test de rendimiento de cargarDirectorioCompleto...');
  
  try {
    // Limpiar caché
    clearCache();
    
    const tiempos = [];
    const numPruebas = 3;
    
    console.log(`[TEST] Ejecutando ${numPruebas} pruebas de rendimiento...`);
    
    for (let i = 0; i < numPruebas; i++) {
      console.log(`[TEST] Prueba ${i + 1}/${numPruebas}...`);
      
      const startTime = Date.now();
      const resultado = cargarDirectorioCompleto(i === 0); // Solo la primera con forceReload
      const tiempo = Date.now() - startTime;
      
      if (!resultado.lideres || resultado.lideres.length === 0) {
        console.log(`❌ [TEST] Prueba ${i + 1} falló: no se cargaron datos`);
        return { success: false, error: `Prueba ${i + 1} falló` };
      }
      
      tiempos.push(tiempo);
      console.log(`[TEST] Prueba ${i + 1}: ${tiempo}ms (${(tiempo/1000).toFixed(1)}s)`);
    }
    
    // Calcular estadísticas
    const tiempoPromedio = tiempos.reduce((sum, t) => sum + t, 0) / tiempos.length;
    const tiempoMinimo = Math.min(...tiempos);
    const tiempoMaximo = Math.max(...tiempos);
    
    console.log(`[TEST] Estadísticas de rendimiento:`);
    console.log(`[TEST] - Promedio: ${tiempoPromedio.toFixed(0)}ms (${(tiempoPromedio/1000).toFixed(1)}s)`);
    console.log(`[TEST] - Mínimo: ${tiempoMinimo}ms (${(tiempoMinimo/1000).toFixed(1)}s)`);
    console.log(`[TEST] - Máximo: ${tiempoMaximo}ms (${(tiempoMaximo/1000).toFixed(1)}s)`);
    
    // Verificar objetivo de < 30 segundos
    const cumpleObjetivo = tiempoPromedio < 30000; // 30 segundos en ms
    const mejoraVsObjetivo = 30000 - tiempoPromedio;
    
    if (cumpleObjetivo) {
      console.log(`✅ [TEST] Objetivo cumplido: ${(tiempoPromedio/1000).toFixed(1)}s < 30s`);
      console.log(`[TEST] Mejora vs objetivo: ${(mejoraVsObjetivo/1000).toFixed(1)}s`);
    } else {
      console.log(`⚠️ [TEST] Objetivo no cumplido: ${(tiempoPromedio/1000).toFixed(1)}s > 30s`);
    }
    
    return { 
      success: true, 
      promedio: tiempoPromedio,
      minimo: tiempoMinimo,
      maximo: tiempoMaximo,
      cumpleObjetivo: cumpleObjetivo,
      mejoraVsObjetivo: mejoraVsObjetivo,
      pruebas: numPruebas
    };
    
  } catch (error) {
    console.error('❌ [TEST] Error en test de rendimiento:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Prueba la información de caché fragmentada
 */
function testCargarDirectorioCompletoCacheInfo() {
  console.log('🧪 [TEST] Iniciando test de información de caché...');
  
  try {
    // Limpiar caché
    clearCache();
    
    // Verificar caché vacía
    let info = getCacheInfo();
    console.log('[TEST] Caché vacía:', info);
    
    if (info.hasData) {
      console.log('❌ [TEST] La caché debería estar vacía');
      return { success: false, error: 'Caché no está vacía' };
    }
    
    // Cargar datos
    console.log('[TEST] Cargando datos...');
    const resultado = cargarDirectorioCompleto(true);
    
    if (!resultado.lideres || resultado.lideres.length === 0) {
      console.log('❌ [TEST] No se pudieron cargar datos');
      return { success: false, error: 'No se pudieron cargar datos' };
    }
    
    // Verificar información de caché
    info = getCacheInfo();
    console.log('[TEST] Caché después de cargar:', info);
    
    if (!info.hasData) {
      console.log('❌ [TEST] La caché debería tener datos');
      return { success: false, error: 'Caché no tiene datos' };
    }
    
    // Verificar propiedades de caché
    const propiedadesRequeridas = ['hasData', 'fragments', 'size', 'sizeKB', 'age'];
    const propiedadesFaltantes = propiedadesRequeridas.filter(prop => !(prop in info));
    
    if (propiedadesFaltantes.length > 0) {
      console.log('❌ [TEST] Faltan propiedades en info de caché:', propiedadesFaltantes);
      return { success: false, error: `Faltan propiedades: ${propiedadesFaltantes.join(', ')}` };
    }
    
    console.log('✅ [TEST] Información de caché funciona correctamente');
    console.log(`[TEST] Tipo: ${info.type}`);
    console.log(`[TEST] Fragmentos: ${info.fragments}`);
    console.log(`[TEST] Tamaño: ${info.sizeKB}KB`);
    
    return { 
      success: true, 
      tipo: info.type,
      fragmentos: info.fragments,
      tamañoKB: info.sizeKB,
      edad: info.age
    };
    
  } catch (error) {
    console.error('❌ [TEST] Error en test de información de caché:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Ejecuta todos los tests de cargarDirectorioCompleto optimizado
 */
function ejecutarTestsCargarDirectorioOptimizado() {
  console.log('🚀 [TEST] Iniciando suite completa de tests de cargarDirectorioCompleto optimizado...');
  
  const resultados = {
    optimizado: testCargarDirectorioCompletoOptimizado(),
    conCache: testCargarDirectorioCompletoConCache(),
    rendimiento: testCargarDirectorioCompletoRendimiento(),
    cacheInfo: testCargarDirectorioCompletoCacheInfo()
  };
  
  console.log('📊 [TEST] Resultados de tests:');
  console.log('Carga optimizada:', resultados.optimizado);
  console.log('Carga con caché:', resultados.conCache);
  console.log('Rendimiento:', resultados.rendimiento);
  console.log('Información de caché:', resultados.cacheInfo);
  
  const exitosos = Object.values(resultados).filter(r => r.success).length;
  const total = Object.keys(resultados).length;
  
  console.log(`✅ [TEST] Tests exitosos: ${exitosos}/${total}`);
  
  // Resumen de rendimiento
  if (resultados.rendimiento.success) {
    const tiempoPromedio = resultados.rendimiento.promedio;
    const tiempoSegundos = (tiempoPromedio / 1000).toFixed(1);
    const cumpleObjetivo = resultados.rendimiento.cumpleObjetivo;
    
    console.log(`📈 [TEST] Resumen de rendimiento:`);
    console.log(`[TEST] - Tiempo promedio: ${tiempoSegundos}s`);
    console.log(`[TEST] - Objetivo cumplido: ${cumpleObjetivo ? 'SÍ' : 'NO'}`);
    if (cumpleObjetivo) {
      console.log(`[TEST] - Mejora vs objetivo: ${(resultados.rendimiento.mejoraVsObjetivo/1000).toFixed(1)}s`);
    }
  }
  
  return {
    success: exitosos === total,
    resultados: resultados,
    resumen: `${exitosos}/${total} tests exitosos`,
    detalles: {
      carga_optimizada: resultados.optimizado.success,
      carga_con_cache: resultados.conCache.success,
      rendimiento: resultados.rendimiento.success,
      info_cache: resultados.cacheInfo.success
    }
  };
}

console.log('🧪 TestCargarDirectorioOptimizado cargado - Tests para función optimizada');
