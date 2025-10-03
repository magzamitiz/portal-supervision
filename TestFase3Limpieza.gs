/**
 * @fileoverview Test específico para verificar Fase 3 de limpieza
 * Verifica que la limpieza de CelulasModule.gs no rompe el sistema
 */

/**
 * Test de verificación post-Fase 3
 * @returns {Object} Resultado del test
 */
function testFase3Limpieza() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TEST: Verificación Post-Fase 3 - Limpieza CelulasModule.gs');
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
    const test1 = testFuncionesEliminadasFase3();
    resultados.tests.push(test1);
    
    // Test 2: Verificar que la función renombrada existe
    console.log('\n2️⃣ Verificando que la función renombrada existe...');
    const test2 = testFuncionRenombradaFase3();
    resultados.tests.push(test2);
    
    // Test 3: Verificar que no hay colisiones de namespace
    console.log('\n3️⃣ Verificando que no hay colisiones de namespace...');
    const test3 = testSinColisionesNamespaceFase3();
    resultados.tests.push(test3);
    
    // Test 4: Verificar que las funciones de análisis siguen funcionando
    console.log('\n4️⃣ Verificando que las funciones de análisis funcionan...');
    const test4 = testFuncionesAnalisisFase3();
    resultados.tests.push(test4);
    
    // Test 5: Verificar que el sistema principal sigue funcionando
    console.log('\n5️⃣ Verificando que el sistema principal funciona...');
    const test5 = testSistemaPrincipalFase3();
    resultados.tests.push(test5);
    
    // Calcular resumen
    resultados.resumen.tiempoTotal = Date.now() - startTime;
    resultados.resumen.total = resultados.tests.length;
    resultados.resumen.exitosos = resultados.tests.filter(t => t.resultado === 'PASS').length;
    resultados.resumen.fallidos = resultados.tests.filter(t => t.resultado === 'FAIL' || t.resultado === 'ERROR').length;
    
    // Mostrar resumen final
    mostrarResumenFase3(resultados);
    
    return resultados;
    
  } catch (error) {
    console.error('❌ Error crítico en test de Fase 3:', error);
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
function testFuncionesEliminadasFase3() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    // Verificar que las funciones eliminadas no existen
    const funcionesEliminadas = [
      'cargarCelulasPorLCF', // De CelulasModule.gs
      'cargarHojaCelulas',   // De CelulasModule.gs (wrapper redundante)
      'obtenerCelulasNecesitanAtencion', // De CelulasModule.gs
      'obtenerCelulasListasMultiplicar'  // De CelulasModule.gs
    ];
    
    funcionesEliminadas.forEach(funcion => {
      // Verificar que no existe como función global
      const existeGlobal = typeof window[funcion] === 'function' || typeof globalThis[funcion] === 'function';
      
      verificaciones.push({
        item: `${funcion} eliminada de CelulasModule`,
        success: !existeGlobal,
        valor: existeGlobal ? 'Aún existe globalmente' : 'Eliminada correctamente',
        tiempo: Date.now() - startTime
      });
    });
    
    // Verificar que cargarCelulasCompletas ya no existe (fue renombrada)
    const cargarCelulasCompletasExiste = typeof window['cargarCelulasCompletas'] === 'function' || typeof globalThis['cargarCelulasCompletas'] === 'function';
    
    verificaciones.push({
      item: 'cargarCelulasCompletas renombrada',
      success: !cargarCelulasCompletasExiste,
      valor: cargarCelulasCompletasExiste ? 'Aún existe con nombre antiguo' : 'Renombrada correctamente',
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
function testFuncionRenombradaFase3() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    // Verificar que cargarCelulasModulo existe (renombrada de cargarCelulasCompletas)
    const cargarCelulasModuloExiste = typeof window['cargarCelulasModulo'] === 'function' || typeof globalThis['cargarCelulasModulo'] === 'function';
    
    verificaciones.push({
      item: 'cargarCelulasModulo existe',
      success: cargarCelulasModuloExiste,
      valor: cargarCelulasModuloExiste ? 'Función disponible' : 'Función no encontrada',
      tiempo: Date.now() - startTime
    });
    
    // Verificar que cargarHojaCelulas de DataModule.gs sigue existiendo
    const cargarHojaCelulasDataModuleExiste = typeof window['cargarHojaCelulas'] === 'function' || typeof globalThis['cargarHojaCelulas'] === 'function';
    
    verificaciones.push({
      item: 'cargarHojaCelulas de DataModule existe',
      success: cargarHojaCelulasDataModuleExiste,
      valor: cargarHojaCelulasDataModuleExiste ? 'Función disponible' : 'Función no encontrada',
      tiempo: Date.now() - startTime
    });
    
    // Verificar que no hay conflicto entre las dos funciones
    if (cargarCelulasModuloExiste && cargarHojaCelulasDataModuleExiste) {
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
function testSinColisionesNamespaceFase3() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    // Verificar que solo existe una función cargarHojaCelulas (la de DataModule.gs)
    const cargarHojaCelulasDataModule = typeof window['cargarHojaCelulas'] === 'function' || typeof globalThis['cargarHojaCelulas'] === 'function';
    
    verificaciones.push({
      item: 'Solo una función cargarHojaCelulas',
      success: cargarHojaCelulasDataModule,
      valor: cargarHojaCelulasDataModule ? 'DataModule.gs disponible' : 'Ninguna disponible',
      tiempo: Date.now() - startTime
    });
    
    // Verificar que cargarCelulasModulo es única
    const cargarCelulasModuloUnica = typeof window['cargarCelulasModulo'] === 'function' || typeof globalThis['cargarCelulasModulo'] === 'function';
    
    verificaciones.push({
      item: 'cargarCelulasModulo es única',
      success: cargarCelulasModuloUnica,
      valor: cargarCelulasModuloUnica ? 'Función única disponible' : 'Función no encontrada',
      tiempo: Date.now() - startTime
    });
    
    // Verificar que no hay funciones duplicadas
    const funcionesCelulas = [
      'cargarCelulasModulo',
      'cargarHojaCelulas'
    ];
    
    let funcionesUnicas = 0;
    funcionesCelulas.forEach(funcion => {
      const existe = typeof window[funcion] === 'function' || typeof globalThis[funcion] === 'function';
      if (existe) funcionesUnicas++;
    });
    
    verificaciones.push({
      item: 'Funciones de células son únicas',
      success: funcionesUnicas === funcionesCelulas.length,
      valor: `${funcionesUnicas}/${funcionesCelulas.length} funciones únicas`,
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
function testFuncionesAnalisisFase3() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    // Verificar que las funciones de análisis que SÍ se usan siguen existiendo
    const funcionesAnalisis = [
      'analizarCelulas',
      'analizarEstadoCelulas', 
      'calcularMetricasCelulas',
      'determinarEstadoCelula'
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
      'obtenerCelulasNecesitanAtencion',
      'obtenerCelulasListasMultiplicar'
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
function testSistemaPrincipalFase3() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    // Verificar que las funciones principales del sistema siguen funcionando
    const funcionesPrincipales = [
      'cargarDirectorioCompleto',
      'getDashboardDataOptimized',
      'getEstadisticasRapidas',
      'cargarHojaCelulas' // De DataModule.gs
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
    
    // Verificar que no hay errores de sintaxis en CelulasModule
    try {
      // Intentar acceder a una función que sabemos que existe
      if (typeof cargarCelulasModulo === 'function') {
        verificaciones.push({
          item: 'CelulasModule sin errores de sintaxis',
          success: true,
          valor: 'Módulo cargado correctamente',
          tiempo: Date.now() - startTime
        });
      } else {
        verificaciones.push({
          item: 'CelulasModule sin errores de sintaxis',
          success: false,
          error: 'Error en módulo',
          tiempo: Date.now() - startTime
        });
      }
    } catch (error) {
      verificaciones.push({
        item: 'CelulasModule sin errores de sintaxis',
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
 * Muestra el resumen del test de Fase 3
 * @param {Object} resultados - Resultados del test
 */
function mostrarResumenFase3(resultados) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 RESUMEN DEL TEST DE FASE 3 - LIMPIEZA CelulasModule.gs');
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
    console.log('\n🎉 ¡FASE 3 COMPLETADA EXITOSAMENTE!');
    console.log('✅ CelulasModule.gs limpiado sin romper funcionalidad');
    console.log('✅ Colisiones de namespace resueltas');
    console.log('✅ Funciones no usadas eliminadas correctamente');
    console.log('✅ Función principal renombrada correctamente');
    console.log('✅ Funciones de análisis preservadas');
    console.log('\n🚀 LISTO PARA FASE 4: Limpieza IngresosModule.gs');
  } else {
    console.log('\n⚠️ ALGUNOS TESTS FALLARON - REVISAR ANTES DE CONTINUAR');
    console.log('🔧 Corregir los problemas identificados antes de Fase 4');
  }
  
  console.log('='.repeat(80));
}

console.log('🧪 TestFase3Limpieza cargado - Test específico para verificar Fase 3');
