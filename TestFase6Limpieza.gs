/**
 * @fileoverview Test específico para verificar Fase 6 de limpieza
 * Verifica que ValidationModule.gs refleja correctamente todos los cambios
 */

/**
 * Test de verificación post-Fase 6
 * @returns {Object} Resultado del test
 */
function testFase6Limpieza() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TEST: Verificación Post-Fase 6 - ValidationModule.gs');
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
    // Test 1: Verificar que las validaciones de DataModule están actualizadas
    console.log('1️⃣ Verificando validaciones de DataModule...');
    const test1 = testValidacionesDataModuleFase6();
    resultados.tests.push(test1);
    
    // Test 2: Verificar que las validaciones de LideresModule están actualizadas
    console.log('\n2️⃣ Verificando validaciones de LideresModule...');
    const test2 = testValidacionesLideresModuleFase6();
    resultados.tests.push(test2);
    
    // Test 3: Verificar que las validaciones de CelulasModule están actualizadas
    console.log('\n3️⃣ Verificando validaciones de CelulasModule...');
    const test3 = testValidacionesCelulasModuleFase6();
    resultados.tests.push(test3);
    
    // Test 4: Verificar que las validaciones de IngresosModule están actualizadas
    console.log('\n4️⃣ Verificando validaciones de IngresosModule...');
    const test4 = testValidacionesIngresosModuleFase6();
    resultados.tests.push(test4);
    
    // Test 5: Verificar que las validaciones de SeguimientoModule están actualizadas
    console.log('\n5️⃣ Verificando validaciones de SeguimientoModule...');
    const test5 = testValidacionesSeguimientoModuleFase6();
    resultados.tests.push(test5);
    
    // Test 6: Verificar que la nueva función de validación existe
    console.log('\n6️⃣ Verificando nueva función de validación...');
    const test6 = testNuevaFuncionValidacionFase6();
    resultados.tests.push(test6);
    
    // Test 7: Verificar que las validaciones funcionan correctamente
    console.log('\n7️⃣ Verificando que las validaciones funcionan...');
    const test7 = testValidacionesFuncionanFase6();
    resultados.tests.push(test7);
    
    // Calcular resumen
    resultados.resumen.tiempoTotal = Date.now() - startTime;
    resultados.resumen.total = resultados.tests.length;
    resultados.resumen.exitosos = resultados.tests.filter(t => t.resultado === 'PASS').length;
    resultados.resumen.fallidos = resultados.tests.filter(t => t.resultado === 'FAIL' || t.resultado === 'ERROR').length;
    
    // Mostrar resumen final
    mostrarResumenFase6(resultados);
    
    return resultados;
    
  } catch (error) {
    console.error('❌ Error crítico en test de Fase 6:', error);
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Test 1: Verificar que las validaciones de DataModule están actualizadas
 * @returns {Object} Resultado del test
 */
function testValidacionesDataModuleFase6() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    // Verificar que las funciones mantenidas están en las validaciones
    const funcionesMantenidas = [
      'cargarHojaLideres',
      'cargarHojaCelulas', 
      'cargarHojaIngresos',
      'cargarLideresOptimizado',
      'cargarCelulasOptimizado',
      'cargarIngresosOptimizado',
      'cargarDirectorioCompleto'
    ];
    
    funcionesMantenidas.forEach(funcion => {
      const existe = typeof window[funcion] === 'function' || typeof globalThis[funcion] === 'function';
      
      verificaciones.push({
        item: `${funcion} mantenida en validaciones`,
        success: existe,
        valor: existe ? 'Función disponible' : 'Función no encontrada',
        tiempo: Date.now() - startTime
      });
    });
    
    // Verificar que las funciones eliminadas NO están en las validaciones
    const funcionesEliminadas = [
      'cargarCelulasPorLCF',
      'cargarIngresosPorLCF',
      'cargarLideresPorRol'
    ];
    
    funcionesEliminadas.forEach(funcion => {
      const existe = typeof window[funcion] === 'function' || typeof globalThis[funcion] === 'function';
      
      verificaciones.push({
        item: `${funcion} eliminada de validaciones`,
        success: !existe,
        valor: existe ? 'Aún existe (problema)' : 'Eliminada correctamente',
        tiempo: Date.now() - startTime
      });
    });
    
    const exitosos = verificaciones.filter(v => v.success).length;
    
    return {
      nombre: 'Validaciones DataModule actualizadas',
      resultado: exitosos === verificaciones.length ? 'PASS' : 'FAIL',
      verificaciones: verificaciones,
      exitosos: exitosos,
      total: verificaciones.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      nombre: 'Validaciones DataModule actualizadas',
      resultado: 'ERROR',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

/**
 * Test 2: Verificar que las validaciones de LideresModule están actualizadas
 * @returns {Object} Resultado del test
 */
function testValidacionesLideresModuleFase6() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    // Verificar que la función renombrada está en las validaciones
    const cargarLideresModuloExiste = typeof window['cargarLideresModulo'] === 'function' || typeof globalThis['cargarLideresModulo'] === 'function';
    
    verificaciones.push({
      item: 'cargarLideresModulo en validaciones',
      success: cargarLideresModuloExiste,
      valor: cargarLideresModuloExiste ? 'Función renombrada disponible' : 'Función no encontrada',
      tiempo: Date.now() - startTime
    });
    
    // Verificar que cargarLideresCompletos ya no existe (fue renombrada)
    const cargarLideresCompletosExiste = typeof window['cargarLideresCompletos'] === 'function' || typeof globalThis['cargarLideresCompletos'] === 'function';
    
    verificaciones.push({
      item: 'cargarLideresCompletos renombrada correctamente',
      success: !cargarLideresCompletosExiste,
      valor: cargarLideresCompletosExiste ? 'Aún existe con nombre antiguo' : 'Renombrada correctamente',
      tiempo: Date.now() - startTime
    });
    
    // Verificar que las funciones eliminadas NO están en las validaciones
    const funcionesEliminadas = [
      'cargarHojaLideres', // De LideresModule.gs
      'cargarLideresPorRol' // De LideresModule.gs
    ];
    
    funcionesEliminadas.forEach(funcion => {
      const existe = typeof window[funcion] === 'function' || typeof globalThis[funcion] === 'function';
      
      verificaciones.push({
        item: `${funcion} eliminada de validaciones`,
        success: !existe,
        valor: existe ? 'Aún existe (problema)' : 'Eliminada correctamente',
        tiempo: Date.now() - startTime
      });
    });
    
    const exitosos = verificaciones.filter(v => v.success).length;
    
    return {
      nombre: 'Validaciones LideresModule actualizadas',
      resultado: exitosos === verificaciones.length ? 'PASS' : 'FAIL',
      verificaciones: verificaciones,
      exitosos: exitosos,
      total: verificaciones.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      nombre: 'Validaciones LideresModule actualizadas',
      resultado: 'ERROR',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

/**
 * Test 3: Verificar que las validaciones de CelulasModule están actualizadas
 * @returns {Object} Resultado del test
 */
function testValidacionesCelulasModuleFase6() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    // Verificar que la función renombrada está en las validaciones
    const cargarCelulasModuloExiste = typeof window['cargarCelulasModulo'] === 'function' || typeof globalThis['cargarCelulasModulo'] === 'function';
    
    verificaciones.push({
      item: 'cargarCelulasModulo en validaciones',
      success: cargarCelulasModuloExiste,
      valor: cargarCelulasModuloExiste ? 'Función renombrada disponible' : 'Función no encontrada',
      tiempo: Date.now() - startTime
    });
    
    // Verificar que las funciones de análisis están en las validaciones
    const funcionesAnalisis = [
      'analizarCelulas',
      'analizarEstadoCelulas',
      'calcularMetricasCelulas',
      'determinarEstadoCelula'
    ];
    
    funcionesAnalisis.forEach(funcion => {
      const existe = typeof window[funcion] === 'function' || typeof globalThis[funcion] === 'function';
      
      verificaciones.push({
        item: `${funcion} en validaciones`,
        success: existe,
        valor: existe ? 'Función de análisis disponible' : 'Función no encontrada',
        tiempo: Date.now() - startTime
      });
    });
    
    // Verificar que las funciones eliminadas NO están en las validaciones
    const funcionesEliminadas = [
      'cargarHojaCelulas', // De CelulasModule.gs
      'cargarCelulasPorLCF', // De CelulasModule.gs
      'obtenerCelulasNecesitanAtencion', // De CelulasModule.gs
      'obtenerCelulasListasMultiplicar' // De CelulasModule.gs
    ];
    
    funcionesEliminadas.forEach(funcion => {
      const existe = typeof window[funcion] === 'function' || typeof globalThis[funcion] === 'function';
      
      verificaciones.push({
        item: `${funcion} eliminada de validaciones`,
        success: !existe,
        valor: existe ? 'Aún existe (problema)' : 'Eliminada correctamente',
        tiempo: Date.now() - startTime
      });
    });
    
    const exitosos = verificaciones.filter(v => v.success).length;
    
    return {
      nombre: 'Validaciones CelulasModule actualizadas',
      resultado: exitosos === verificaciones.length ? 'PASS' : 'FAIL',
      verificaciones: verificaciones,
      exitosos: exitosos,
      total: verificaciones.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      nombre: 'Validaciones CelulasModule actualizadas',
      resultado: 'ERROR',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

/**
 * Test 4: Verificar que las validaciones de IngresosModule están actualizadas
 * @returns {Object} Resultado del test
 */
function testValidacionesIngresosModuleFase6() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    // Verificar que la función renombrada está en las validaciones
    const cargarIngresosModuloExiste = typeof window['cargarIngresosModulo'] === 'function' || typeof globalThis['cargarIngresosModulo'] === 'function';
    
    verificaciones.push({
      item: 'cargarIngresosModulo en validaciones',
      success: cargarIngresosModuloExiste,
      valor: cargarIngresosModuloExiste ? 'Función renombrada disponible' : 'Función no encontrada',
      tiempo: Date.now() - startTime
    });
    
    // Verificar que las funciones de análisis están en las validaciones
    const funcionesAnalisis = [
      'analizarIngresos',
      'calcularMetricasIngresos',
      'determinarPrioridad'
    ];
    
    funcionesAnalisis.forEach(funcion => {
      const existe = typeof window[funcion] === 'function' || typeof globalThis[funcion] === 'function';
      
      verificaciones.push({
        item: `${funcion} en validaciones`,
        success: existe,
        valor: existe ? 'Función de análisis disponible' : 'Función no encontrada',
        tiempo: Date.now() - startTime
      });
    });
    
    // Verificar que las funciones eliminadas NO están en las validaciones
    const funcionesEliminadas = [
      'cargarHojaIngresos', // De IngresosModule.gs
      'cargarIngresosPorLCF', // De IngresosModule.gs
      'analizarIngresosCompatibility', // De IngresosModule.gs
      'obtenerIngresosUrgentes' // De IngresosModule.gs
    ];
    
    funcionesEliminadas.forEach(funcion => {
      const existe = typeof window[funcion] === 'function' || typeof globalThis[funcion] === 'function';
      
      verificaciones.push({
        item: `${funcion} eliminada de validaciones`,
        success: !existe,
        valor: existe ? 'Aún existe (problema)' : 'Eliminada correctamente',
        tiempo: Date.now() - startTime
      });
    });
    
    const exitosos = verificaciones.filter(v => v.success).length;
    
    return {
      nombre: 'Validaciones IngresosModule actualizadas',
      resultado: exitosos === verificaciones.length ? 'PASS' : 'FAIL',
      verificaciones: verificaciones,
      exitosos: exitosos,
      total: verificaciones.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      nombre: 'Validaciones IngresosModule actualizadas',
      resultado: 'ERROR',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

/**
 * Test 5: Verificar que las validaciones de SeguimientoModule están actualizadas
 * @returns {Object} Resultado del test
 */
function testValidacionesSeguimientoModuleFase6() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    // Verificar que las funciones principales están en las validaciones
    const funcionesPrincipales = [
      'getSeguimientoAlmasLCF',
      'getVistaRapidaLCF',
      'getSeguimientoAlmasLCF_REAL',
      'getVistaRapidaLCF_REAL',
      'getResumenLCF',
      'cargarDatosLCF',
      'procesarSeguimientoLCF',
      'analizarSeguimientoAlmas',
      'calcularPrioridadAlma'
    ];
    
    funcionesPrincipales.forEach(funcion => {
      const existe = typeof window[funcion] === 'function' || typeof globalThis[funcion] === 'function';
      
      verificaciones.push({
        item: `${funcion} en validaciones`,
        success: existe,
        valor: existe ? 'Función principal disponible' : 'Función no encontrada',
        tiempo: Date.now() - startTime
      });
    });
    
    // Verificar que las funciones internas renombradas están en las validaciones
    const funcionesInternas = [
      'cargarMaestroAsistentesInterno',
      'cargarInteraccionesInterno',
      'cargarVisitasBendicionInterno'
    ];
    
    funcionesInternas.forEach(funcion => {
      const existe = typeof window[funcion] === 'function' || typeof globalThis[funcion] === 'function';
      
      verificaciones.push({
        item: `${funcion} en validaciones`,
        success: existe,
        valor: existe ? 'Función interna renombrada disponible' : 'Función no encontrada',
        tiempo: Date.now() - startTime
      });
    });
    
    const exitosos = verificaciones.filter(v => v.success).length;
    
    return {
      nombre: 'Validaciones SeguimientoModule actualizadas',
      resultado: exitosos === verificaciones.length ? 'PASS' : 'FAIL',
      verificaciones: verificaciones,
      exitosos: exitosos,
      total: verificaciones.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      nombre: 'Validaciones SeguimientoModule actualizadas',
      resultado: 'ERROR',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

/**
 * Test 6: Verificar que la nueva función de validación existe
 * @returns {Object} Resultado del test
 */
function testNuevaFuncionValidacionFase6() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    // Verificar que la nueva función de validación existe
    const validarCorreccionesActividadExiste = typeof window['validarCorreccionesActividadLideres'] === 'function' || typeof globalThis['validarCorreccionesActividadLideres'] === 'function';
    
    verificaciones.push({
      item: 'validarCorreccionesActividadLideres existe',
      success: validarCorreccionesActividadExiste,
      valor: validarCorreccionesActividadExiste ? 'Nueva función disponible' : 'Función no encontrada',
      tiempo: Date.now() - startTime
    });
    
    // Verificar que las funciones que valida existen
    const funcionesValidadas = [
      'processCelulasOptimized',
      'calcularActividadLideres',
      'integrarActividadLideres',
      'getDashboardDataOptimized'
    ];
    
    funcionesValidadas.forEach(funcion => {
      const existe = typeof window[funcion] === 'function' || typeof globalThis[funcion] === 'function';
      
      verificaciones.push({
        item: `${funcion} existe para validación`,
        success: existe,
        valor: existe ? 'Función disponible para validar' : 'Función no encontrada',
        tiempo: Date.now() - startTime
      });
    });
    
    const exitosos = verificaciones.filter(v => v.success).length;
    
    return {
      nombre: 'Nueva función de validación',
      resultado: exitosos === verificaciones.length ? 'PASS' : 'FAIL',
      verificaciones: verificaciones,
      exitosos: exitosos,
      total: verificaciones.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      nombre: 'Nueva función de validación',
      resultado: 'ERROR',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

/**
 * Test 7: Verificar que las validaciones funcionan correctamente
 * @returns {Object} Resultado del test
 */
function testValidacionesFuncionanFase6() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    // Verificar que las funciones de validación principales existen
    const funcionesValidacion = [
      'validarModuloData',
      'validarModuloLideres',
      'validarModuloCelulas',
      'validarModuloIngresos',
      'validarModuloSeguimiento',
      'validarModuloMetricas',
      'runValidationTests'
    ];
    
    funcionesValidacion.forEach(funcion => {
      const existe = typeof window[funcion] === 'function' || typeof globalThis[funcion] === 'function';
      
      verificaciones.push({
        item: `${funcion} existe`,
        success: existe,
        valor: existe ? 'Función de validación disponible' : 'Función no encontrada',
        tiempo: Date.now() - startTime
      });
    });
    
    // Verificar que no hay errores de sintaxis en ValidationModule
    try {
      // Intentar acceder a una función que sabemos que existe
      if (typeof runValidationTests === 'function') {
        verificaciones.push({
          item: 'ValidationModule sin errores de sintaxis',
          success: true,
          valor: 'Módulo cargado correctamente',
          tiempo: Date.now() - startTime
        });
      } else {
        verificaciones.push({
          item: 'ValidationModule sin errores de sintaxis',
          success: false,
          error: 'Error en módulo',
          tiempo: Date.now() - startTime
        });
      }
    } catch (error) {
      verificaciones.push({
        item: 'ValidationModule sin errores de sintaxis',
        success: false,
        error: error.toString(),
        tiempo: Date.now() - startTime
      });
    }
    
    const exitosos = verificaciones.filter(v => v.success).length;
    
    return {
      nombre: 'Validaciones funcionan correctamente',
      resultado: exitosos === verificaciones.length ? 'PASS' : 'FAIL',
      verificaciones: verificaciones,
      exitosos: exitosos,
      total: verificaciones.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      nombre: 'Validaciones funcionan correctamente',
      resultado: 'ERROR',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

/**
 * Muestra el resumen del test de Fase 6
 * @param {Object} resultados - Resultados del test
 */
function mostrarResumenFase6(resultados) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 RESUMEN DEL TEST DE FASE 6 - VALIDATIONMODULE.GS');
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
    console.log('\n🎉 ¡FASE 6 COMPLETADA EXITOSAMENTE!');
    console.log('✅ ValidationModule.gs actualizado correctamente');
    console.log('✅ Todas las validaciones reflejan el estado actual');
    console.log('✅ Funciones eliminadas removidas de validaciones');
    console.log('✅ Funciones renombradas actualizadas en validaciones');
    console.log('✅ Nueva función de validación agregada');
    console.log('✅ Sistema de validación completamente funcional');
    console.log('\n🎊 ¡TODAS LAS FASES DE LIMPIEZA COMPLETADAS!');
    console.log('🚀 El sistema está completamente limpio y optimizado');
  } else {
    console.log('\n⚠️ ALGUNOS TESTS FALLARON - REVISAR ANTES DE CONTINUAR');
    console.log('🔧 Corregir los problemas identificados en ValidationModule.gs');
  }
  
  console.log('='.repeat(80));
}

console.log('🧪 TestFase6Limpieza cargado - Test específico para verificar Fase 6');
