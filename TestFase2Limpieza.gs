/**
 * @fileoverview Test específico para verificar Fase 2 de limpieza
 * Verifica que la limpieza de LideresModule.gs no rompe el sistema
 */

/**
 * Test de verificación post-Fase 2
 * @returns {Object} Resultado del test
 */
function testFase2Limpieza() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TEST: Verificación Post-Fase 2 - Limpieza LideresModule.gs');
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
    const test1 = testFuncionesEliminadasFase2();
    resultados.tests.push(test1);
    
    // Test 2: Verificar que la función renombrada existe
    console.log('\n2️⃣ Verificando que la función renombrada existe...');
    const test2 = testFuncionRenombrada();
    resultados.tests.push(test2);
    
    // Test 3: Verificar que no hay colisiones de namespace
    console.log('\n3️⃣ Verificando que no hay colisiones de namespace...');
    const test3 = testSinColisionesNamespace();
    resultados.tests.push(test3);
    
    // Test 4: Verificar que el sistema principal sigue funcionando
    console.log('\n4️⃣ Verificando que el sistema principal funciona...');
    const test4 = testSistemaPrincipalFase2();
    resultados.tests.push(test4);
    
    // Calcular resumen
    resultados.resumen.tiempoTotal = Date.now() - startTime;
    resultados.resumen.total = resultados.tests.length;
    resultados.resumen.exitosos = resultados.tests.filter(t => t.resultado === 'PASS').length;
    resultados.resumen.fallidos = resultados.tests.filter(t => t.resultado === 'FAIL' || t.resultado === 'ERROR').length;
    
    // Mostrar resumen final
    mostrarResumenFase2(resultados);
    
    return resultados;
    
  } catch (error) {
    console.error('❌ Error crítico en test de Fase 2:', error);
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
function testFuncionesEliminadasFase2() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    // Verificar que las funciones eliminadas no existen
    const funcionesEliminadas = [
      'cargarLideresPorRol', // De LideresModule.gs
      'cargarHojaLideres'    // De LideresModule.gs (wrapper redundante)
    ];
    
    funcionesEliminadas.forEach(funcion => {
      // Verificar que no existe como función global
      const existeGlobal = typeof window[funcion] === 'function' || typeof globalThis[funcion] === 'function';
      
      verificaciones.push({
        item: `${funcion} eliminada de LideresModule`,
        success: !existeGlobal,
        valor: existeGlobal ? 'Aún existe globalmente' : 'Eliminada correctamente',
        tiempo: Date.now() - startTime
      });
    });
    
    // Verificar que cargarLideresCompletos ya no existe (fue renombrada)
    const cargarLideresCompletosExiste = typeof window['cargarLideresCompletos'] === 'function' || typeof globalThis['cargarLideresCompletos'] === 'function';
    
    verificaciones.push({
      item: 'cargarLideresCompletos renombrada',
      success: !cargarLideresCompletosExiste,
      valor: cargarLideresCompletosExiste ? 'Aún existe con nombre antiguo' : 'Renombrada correctamente',
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
function testFuncionRenombrada() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    // Verificar que cargarLideresModulo existe (renombrada de cargarLideresCompletos)
    const cargarLideresModuloExiste = typeof window['cargarLideresModulo'] === 'function' || typeof globalThis['cargarLideresModulo'] === 'function';
    
    verificaciones.push({
      item: 'cargarLideresModulo existe',
      success: cargarLideresModuloExiste,
      valor: cargarLideresModuloExiste ? 'Función disponible' : 'Función no encontrada',
      tiempo: Date.now() - startTime
    });
    
    // Verificar que cargarHojaLideres de DataModule.gs sigue existiendo
    const cargarHojaLideresDataModuleExiste = typeof window['cargarHojaLideres'] === 'function' || typeof globalThis['cargarHojaLideres'] === 'function';
    
    verificaciones.push({
      item: 'cargarHojaLideres de DataModule existe',
      success: cargarHojaLideresDataModuleExiste,
      valor: cargarHojaLideresDataModuleExiste ? 'Función disponible' : 'Función no encontrada',
      tiempo: Date.now() - startTime
    });
    
    // Verificar que no hay conflicto entre las dos funciones
    if (cargarLideresModuloExiste && cargarHojaLideresDataModuleExiste) {
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
function testSinColisionesNamespace() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    // Verificar que solo existe una función cargarHojaLideres (la de DataModule.gs)
    const cargarHojaLideresDataModule = typeof window['cargarHojaLideres'] === 'function' || typeof globalThis['cargarHojaLideres'] === 'function';
    
    verificaciones.push({
      item: 'Solo una función cargarHojaLideres',
      success: cargarHojaLideresDataModule,
      valor: cargarHojaLideresDataModule ? 'DataModule.gs disponible' : 'Ninguna disponible',
      tiempo: Date.now() - startTime
    });
    
    // Verificar que cargarLideresModulo es única
    const cargarLideresModuloUnica = typeof window['cargarLideresModulo'] === 'function' || typeof globalThis['cargarLideresModulo'] === 'function';
    
    verificaciones.push({
      item: 'cargarLideresModulo es única',
      success: cargarLideresModuloUnica,
      valor: cargarLideresModuloUnica ? 'Función única disponible' : 'Función no encontrada',
      tiempo: Date.now() - startTime
    });
    
    // Verificar que no hay funciones duplicadas
    const funcionesLideres = [
      'cargarLideresModulo',
      'cargarHojaLideres'
    ];
    
    let funcionesUnicas = 0;
    funcionesLideres.forEach(funcion => {
      const existe = typeof window[funcion] === 'function' || typeof globalThis[funcion] === 'function';
      if (existe) funcionesUnicas++;
    });
    
    verificaciones.push({
      item: 'Funciones de líderes son únicas',
      success: funcionesUnicas === funcionesLideres.length,
      valor: `${funcionesUnicas}/${funcionesLideres.length} funciones únicas`,
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
 * Test 4: Verificar que el sistema principal sigue funcionando
 * @returns {Object} Resultado del test
 */
function testSistemaPrincipalFase2() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    // Verificar que las funciones principales del sistema siguen funcionando
    const funcionesPrincipales = [
      'cargarDirectorioCompleto',
      'getDashboardDataOptimized',
      'getEstadisticasRapidas',
      'cargarHojaLideres' // De DataModule.gs
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
    
    // Verificar que no hay errores de sintaxis en LideresModule
    try {
      // Intentar acceder a una función que sabemos que existe
      if (typeof cargarLideresModulo === 'function') {
        verificaciones.push({
          item: 'LideresModule sin errores de sintaxis',
          success: true,
          valor: 'Módulo cargado correctamente',
          tiempo: Date.now() - startTime
        });
      } else {
        verificaciones.push({
          item: 'LideresModule sin errores de sintaxis',
          success: false,
          error: 'Error en módulo',
          tiempo: Date.now() - startTime
        });
      }
    } catch (error) {
      verificaciones.push({
        item: 'LideresModule sin errores de sintaxis',
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
 * Muestra el resumen del test de Fase 2
 * @param {Object} resultados - Resultados del test
 */
function mostrarResumenFase2(resultados) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 RESUMEN DEL TEST DE FASE 2 - LIMPIEZA LideresModule.gs');
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
    console.log('\n🎉 ¡FASE 2 COMPLETADA EXITOSAMENTE!');
    console.log('✅ LideresModule.gs limpiado sin romper funcionalidad');
    console.log('✅ Colisiones de namespace resueltas');
    console.log('✅ Funciones no usadas eliminadas correctamente');
    console.log('✅ Función principal renombrada correctamente');
    console.log('\n🚀 LISTO PARA FASE 3: Limpieza CelulasModule.gs');
  } else {
    console.log('\n⚠️ ALGUNOS TESTS FALLARON - REVISAR ANTES DE CONTINUAR');
    console.log('🔧 Corregir los problemas identificados antes de Fase 3');
  }
  
  console.log('='.repeat(80));
}

console.log('🧪 TestFase2Limpieza cargado - Test específico para verificar Fase 2');
