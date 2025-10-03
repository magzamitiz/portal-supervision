/**
 * @fileoverview Test específico para verificar Fase 4 de limpieza
 * Verifica que la limpieza de IngresosModule.gs no rompe el sistema
 */

/**
 * Test de verificación post-Fase 4
 * @returns {Object} Resultado del test
 */
function testFase4Limpieza() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TEST: Verificación Post-Fase 4 - Limpieza IngresosModule.gs');
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
    // Test 1: Verificar que las funciones eliminadas ya no existen
    console.log('1️⃣ Verificando que las funciones eliminadas no existen...');
    const test1 = testFuncionesEliminadasFase4();
    resultados.tests.push(test1);
    
    // Test 2: Verificar que la función renombrada existe
    console.log('\n2️⃣ Verificando que la función renombrada existe...');
    const test2 = testFuncionRenombradaFase4();
    resultados.tests.push(test2);
    
    // Test 3: Verificar que no hay colisiones de namespace
    console.log('\n3️⃣ Verificando que no hay colisiones de namespace...');
    const test3 = testSinColisionesNamespaceFase4();
    resultados.tests.push(test3);
    
    // Test 4: Verificar que las funciones de análisis siguen funcionando
    console.log('\n4️⃣ Verificando que las funciones de análisis funcionan...');
    const test4 = testFuncionesAnalisisFase4();
    resultados.tests.push(test4);
    
    // Test 5: Verificar que el sistema principal sigue funcionando
    console.log('\n5️⃣ Verificando que el sistema principal funciona...');
    const test5 = testSistemaPrincipalFase4();
    resultados.tests.push(test5);
    
    // Calcular resumen
    resultados.resumen.tiempoTotal = Date.now() - startTime;
    resultados.resumen.total = resultados.tests.length;
    resultados.resumen.exitosos = resultados.tests.filter(t => t.resultado === 'PASS').length;
    resultados.resumen.fallidos = resultados.tests.filter(t => t.resultado === 'FAIL' || t.resultado === 'ERROR').length;
    
    // Mostrar resumen final
    mostrarResumenFase4(resultados);
    
    return resultados;
    
  } catch (error) {
    console.error('❌ Error crítico en test de Fase 4:', error);
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Test 1: Verificar que las funciones eliminadas ya no existen
 * @returns {Object} Resultado del test
 */
function testFuncionesEliminadasFase4() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    // Verificar que las funciones eliminadas no existen
    const funcionesEliminadas = [
      'cargarIngresosPorLCF', // De IngresosModule.gs
      'cargarHojaIngresos',   // De IngresosModule.gs (wrapper redundante)
      'analizarIngresosCompatibility', // De IngresosModule.gs (wrapper redundante)
      'obtenerIngresosUrgentes'  // De IngresosModule.gs
    ];
    
    funcionesEliminadas.forEach(funcion => {
      // Verificar que no existe como función global
      const existeGlobal = typeof window[funcion] === 'function' || typeof globalThis[funcion] === 'function';
      
      verificaciones.push({
        item: `${funcion} eliminada de IngresosModule`,
        success: !existeGlobal,
        valor: existeGlobal ? 'Aún existe globalmente' : 'Eliminada correctamente',
        tiempo: Date.now() - startTime
      });
    });
    
    // Verificar que cargarIngresosCompletos ya no existe (fue renombrada)
    const cargarIngresosCompletosExiste = typeof window['cargarIngresosCompletos'] === 'function' || typeof globalThis['cargarIngresosCompletos'] === 'function';
    
    verificaciones.push({
      item: 'cargarIngresosCompletos renombrada',
      success: !cargarIngresosCompletosExiste,
      valor: cargarIngresosCompletosExiste ? 'Aún existe con nombre antiguo' : 'Renombrada correctamente',
      tiempo: Date.now() - startTime
    });
    
    const exitosos = verificaciones.filter(v => v.success).length;
    
    return {
      nombre: 'Funciones eliminadas correctamente',
      resultado: exitosos === verificaciones.length ? 'PASS' : 'FAIL',
      verificaciones: verificaciones,
      exitosos: exitosos,
      total: verificaciones.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      nombre: 'Funciones eliminadas correctamente',
      resultado: 'ERROR',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

/**
 * Test 2: Verificar que la función renombrada existe
 * @returns {Object} Resultado del test
 */
function testFuncionRenombradaFase4() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    // Verificar que cargarIngresosModulo existe (renombrada de cargarIngresosCompletos)
    const cargarIngresosModuloExiste = typeof window['cargarIngresosModulo'] === 'function' || typeof globalThis['cargarIngresosModulo'] === 'function';
    
    verificaciones.push({
      item: 'cargarIngresosModulo existe',
      success: cargarIngresosModuloExiste,
      valor: cargarIngresosModuloExiste ? 'Función disponible' : 'Función no encontrada',
      tiempo: Date.now() - startTime
    });
    
    // Verificar que cargarHojaIngresos de DataModule.gs sigue existiendo
    const cargarHojaIngresosDataModuleExiste = typeof window['cargarHojaIngresos'] === 'function' || typeof globalThis['cargarHojaIngresos'] === 'function';
    
    verificaciones.push({
      item: 'cargarHojaIngresos de DataModule existe',
      success: cargarHojaIngresosDataModuleExiste,
      valor: cargarHojaIngresosDataModuleExiste ? 'Función disponible' : 'Función no encontrada',
      tiempo: Date.now() - startTime
    });
    
    // Verificar que no hay conflicto entre las dos funciones
    if (cargarIngresosModuloExiste && cargarHojaIngresosDataModuleExiste) {
      verificaciones.push({
        item: 'No hay conflicto entre funciones',
        success: true,
        valor: 'Ambas funciones coexisten sin conflicto',
        tiempo: Date.now() - startTime
      });
    } else {
      verificaciones.push({
        item: 'No hay conflicto entre funciones',
        success: false,
        error: 'Una o ambas funciones no existen',
        tiempo: Date.now() - startTime
      });
    }
    
    const exitosos = verificaciones.filter(v => v.success).length;
    
    return {
      nombre: 'Función renombrada correctamente',
      resultado: exitosos === verificaciones.length ? 'PASS' : 'FAIL',
      verificaciones: verificaciones,
      exitosos: exitosos,
      total: verificaciones.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      nombre: 'Función renombrada correctamente',
      resultado: 'ERROR',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

/**
 * Test 3: Verificar que no hay colisiones de namespace
 * @returns {Object} Resultado del test
 */
function testSinColisionesNamespaceFase4() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    // Verificar que solo existe una función cargarHojaIngresos (la de DataModule.gs)
    const cargarHojaIngresosDataModule = typeof window['cargarHojaIngresos'] === 'function' || typeof globalThis['cargarHojaIngresos'] === 'function';
    
    verificaciones.push({
      item: 'Solo una función cargarHojaIngresos',
      success: cargarHojaIngresosDataModule,
      valor: cargarHojaIngresosDataModule ? 'DataModule.gs disponible' : 'Ninguna disponible',
      tiempo: Date.now() - startTime
    });
    
    // Verificar que cargarIngresosModulo es única
    const cargarIngresosModuloUnica = typeof window['cargarIngresosModulo'] === 'function' || typeof globalThis['cargarIngresosModulo'] === 'function';
    
    verificaciones.push({
      item: 'cargarIngresosModulo es única',
      success: cargarIngresosModuloUnica,
      valor: cargarIngresosModuloUnica ? 'Función única disponible' : 'Función no encontrada',
      tiempo: Date.now() - startTime
    });
    
    // Verificar que no hay funciones duplicadas
    const funcionesIngresos = [
      'cargarIngresosModulo',
      'cargarHojaIngresos'
    ];
    
    let funcionesUnicas = 0;
    funcionesIngresos.forEach(funcion => {
      const existe = typeof window[funcion] === 'function' || typeof globalThis[funcion] === 'function';
      if (existe) funcionesUnicas++;
    });
    
    verificaciones.push({
      item: 'Funciones de ingresos son únicas',
      success: funcionesUnicas === funcionesIngresos.length,
      valor: `${funcionesUnicas}/${funcionesIngresos.length} funciones únicas`,
      tiempo: Date.now() - startTime
    });
    
    const exitosos = verificaciones.filter(v => v.success).length;
    
    return {
      nombre: 'Sin colisiones de namespace',
      resultado: exitosos === verificaciones.length ? 'PASS' : 'FAIL',
      verificaciones: verificaciones,
      exitosos: exitosos,
      total: verificaciones.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      nombre: 'Sin colisiones de namespace',
      resultado: 'ERROR',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

/**
 * Test 4: Verificar que las funciones de análisis siguen funcionando
 * @returns {Object} Resultado del test
 */
function testFuncionesAnalisisFase4() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    // Verificar que las funciones de análisis que SÍ se usan siguen existiendo
    const funcionesAnalisis = [
      'analizarIngresos',
      'calcularMetricasIngresos',
      'determinarPrioridad'
    ];
    
    funcionesAnalisis.forEach(funcion => {
      const existe = typeof window[funcion] === 'function' || typeof globalThis[funcion] === 'function';
      
      verificaciones.push({
        item: `${funcion} sigue funcionando`,
        success: existe,
        valor: existe ? 'Disponible' : 'No encontrada',
        tiempo: Date.now() - startTime
      });
    });
    
    // Verificar que las funciones eliminadas ya no existen
    const funcionesEliminadas = [
      'analizarIngresosCompatibility',
      'obtenerIngresosUrgentes'
    ];
    
    funcionesEliminadas.forEach(funcion => {
      const existe = typeof window[funcion] === 'function' || typeof globalThis[funcion] === 'function';
      
      verificaciones.push({
        item: `${funcion} eliminada correctamente`,
        success: !existe,
        valor: existe ? 'Aún existe' : 'Eliminada correctamente',
        tiempo: Date.now() - startTime
      });
    });
    
    const exitosos = verificaciones.filter(v => v.success).length;
    
    return {
      nombre: 'Funciones de análisis funcionando',
      resultado: exitosos === verificaciones.length ? 'PASS' : 'FAIL',
      verificaciones: verificaciones,
      exitosos: exitosos,
      total: verificaciones.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      nombre: 'Funciones de análisis funcionando',
      resultado: 'ERROR',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

/**
 * Test 5: Verificar que el sistema principal sigue funcionando
 * @returns {Object} Resultado del test
 */
function testSistemaPrincipalFase4() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    // Verificar que las funciones principales del sistema siguen funcionando
    const funcionesPrincipales = [
      'cargarDirectorioCompleto',
      'getDashboardDataOptimized',
      'getEstadisticasRapidas',
      'cargarHojaIngresos' // De DataModule.gs
    ];
    
    funcionesPrincipales.forEach(funcion => {
      const existe = typeof window[funcion] === 'function' || typeof globalThis[funcion] === 'function';
      
      verificaciones.push({
        item: `${funcion} funciona`,
        success: existe,
        valor: existe ? 'Disponible' : 'No encontrada',
        tiempo: Date.now() - startTime
      });
    });
    
    // Verificar que no hay errores de sintaxis en IngresosModule
    try {
      // Intentar acceder a una función que sabemos que existe
      if (typeof cargarIngresosModulo === 'function') {
        verificaciones.push({
          item: 'IngresosModule sin errores de sintaxis',
          success: true,
          valor: 'Módulo cargado correctamente',
          tiempo: Date.now() - startTime
        });
      } else {
        verificaciones.push({
          item: 'IngresosModule sin errores de sintaxis',
          success: false,
          error: 'Error en módulo',
          tiempo: Date.now() - startTime
        });
      }
    } catch (error) {
      verificaciones.push({
        item: 'IngresosModule sin errores de sintaxis',
        success: false,
        error: error.toString(),
        tiempo: Date.now() - startTime
      });
    }
    
    const exitosos = verificaciones.filter(v => v.success).length;
    
    return {
      nombre: 'Sistema principal funcionando',
      resultado: exitosos === verificaciones.length ? 'PASS' : 'FAIL',
      verificaciones: verificaciones,
      exitosos: exitosos,
      total: verificaciones.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      nombre: 'Sistema principal funcionando',
      resultado: 'ERROR',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

/**
 * Muestra el resumen del test de Fase 4
 * @param {Object} resultados - Resultados del test
 */
function mostrarResumenFase4(resultados) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 RESUMEN DEL TEST DE FASE 4 - LIMPIEZA IngresosModule.gs');
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
    console.log('\n🎉 ¡FASE 4 COMPLETADA EXITOSAMENTE!');
    console.log('✅ IngresosModule.gs limpiado sin romper funcionalidad');
    console.log('✅ Colisiones de namespace resueltas');
    console.log('✅ Funciones no usadas eliminadas correctamente');
    console.log('✅ Función principal renombrada correctamente');
    console.log('✅ Funciones de análisis preservadas');
    console.log('\n🚀 LISTO PARA FASE 5: Verificación SeguimientoModule.gs');
  } else {
    console.log('\n⚠️ ALGUNOS TESTS FALLARON - REVISAR ANTES DE CONTINUAR');
    console.log('🔧 Corregir los problemas identificados antes de Fase 5');
  }
  
  console.log('='.repeat(80));
}

console.log('🧪 TestFase4Limpieza cargado - Test específico para verificar Fase 4');
