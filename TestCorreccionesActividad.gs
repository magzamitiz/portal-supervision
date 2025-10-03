/**
 * @fileoverview Test específico para verificar las correcciones de actividad de líderes
 * Verifica que processCelulasOptimized ahora incluye campos de líder correctamente
 */

/**
 * Test específico para verificar las correcciones implementadas
 * @returns {Object} Resultado del test
 */
function testCorreccionesActividadLideres() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TEST: Verificando Correcciones de Actividad de Líderes');
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
    // Test 1: Verificar que processCelulasOptimized incluye campos de líder
    console.log('1️⃣ Probando processCelulasOptimized con campos de líder...');
    const test1 = testProcessCelulasOptimized();
    resultados.tests.push(test1);
    
    // Test 2: Verificar que calcularActividadLideres funciona con datos corregidos
    console.log('\n2️⃣ Probando calcularActividadLideres con datos corregidos...');
    const test2 = testCalcularActividadLideres();
    resultados.tests.push(test2);
    
    // Test 3: Verificar integración completa
    console.log('\n3️⃣ Probando integración completa...');
    const test3 = testIntegracionCompleta();
    resultados.tests.push(test3);
    
    // Test 4: Verificar flujo optimizado completo
    console.log('\n4️⃣ Probando flujo optimizado completo...');
    const test4 = testFlujoOptimizadoCompleto();
    resultados.tests.push(test4);
    
    // Calcular resumen
    resultados.resumen.tiempoTotal = Date.now() - startTime;
    resultados.resumen.total = resultados.tests.length;
    resultados.resumen.exitosos = resultados.tests.filter(t => t.resultado === 'PASS').length;
    resultados.resumen.fallidos = resultados.tests.filter(t => t.resultado === 'FAIL' || t.resultado === 'ERROR').length;
    
    // Mostrar resumen final
    mostrarResumenTest(resultados);
    
    return resultados;
    
  } catch (error) {
    console.error('❌ Error crítico en test de correcciones:', error);
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Test 1: Verificar processCelulasOptimized
 * @returns {Object} Resultado del test
 */
function testProcessCelulasOptimized() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    // Crear datos de prueba que simulen la hoja de Google Sheets
    const datosPrueba = [
      ['ID Célula', 'Nombre Célula', 'ID Líder', 'Estado', 'Congregación', 'ID LCF', 'Nombre LCF', 'ID Miembro', 'Nombre Miembro'],
      ['C-001', 'Célula Test 1', 'LD-001', 'Activa', 'Norte', 'LCF-001', 'Test LCF 1', 'A-001', 'Alma Test 1'],
      ['C-002', 'Célula Test 2', 'LD-002', 'Inactiva', 'Sur', 'LCF-002', 'Test LCF 2', 'A-002', 'Alma Test 2'],
      ['C-003', 'Célula Test 3', 'LD-001', 'Activa', 'Norte', 'LCF-001', 'Test LCF 1', 'A-003', 'Alma Test 3']
    ];
    
    console.log('   🔍 Ejecutando processCelulasOptimized...');
    const celulasProcesadas = processCelulasOptimized(datosPrueba);
    
    // Verificar que se procesaron las células
    verificaciones.push({
      item: 'Se procesaron células',
      success: celulasProcesadas.length > 0,
      valor: `${celulasProcesadas.length} células procesadas`,
      tiempo: Date.now() - startTime
    });
    
    if (celulasProcesadas.length > 0) {
      const primeraCelula = celulasProcesadas[0];
      
      // Verificar campos de líder
      verificaciones.push({
        item: 'Tiene ID_Lider',
        success: primeraCelula.ID_Lider !== undefined && primeraCelula.ID_Lider !== '',
        valor: primeraCelula.ID_Lider || 'Faltante',
        tiempo: Date.now() - startTime
      });
      
      verificaciones.push({
        item: 'Tiene Estado',
        success: primeraCelula.Estado !== undefined && primeraCelula.Estado !== '',
        valor: primeraCelula.Estado || 'Faltante',
        tiempo: Date.now() - startTime
      });
      
      verificaciones.push({
        item: 'Tiene Congregacion',
        success: primeraCelula.Congregacion !== undefined,
        valor: primeraCelula.Congregacion || 'Faltante',
        tiempo: Date.now() - startTime
      });
      
      // Verificar que los datos son correctos
      verificaciones.push({
        item: 'ID_Lider correcto',
        success: primeraCelula.ID_Lider === 'LD-001',
        valor: primeraCelula.ID_Lider,
        tiempo: Date.now() - startTime
      });
      
      verificaciones.push({
        item: 'Estado correcto',
        success: primeraCelula.Estado === 'Activa',
        valor: primeraCelula.Estado,
        tiempo: Date.now() - startTime
      });
      
      verificaciones.push({
        item: 'Congregacion correcta',
        success: primeraCelula.Congregacion === 'Norte',
        valor: primeraCelula.Congregacion,
        tiempo: Date.now() - startTime
      });
    }
    
    const exitosos = verificaciones.filter(v => v.success).length;
    
    return {
      nombre: 'processCelulasOptimized con campos de líder',
      resultado: exitosos === verificaciones.length ? 'PASS' : 'FAIL',
      verificaciones: verificaciones,
      exitosos: exitosos,
      total: verificaciones.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      nombre: 'processCelulasOptimized con campos de líder',
      resultado: 'ERROR',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

/**
 * Test 2: Verificar calcularActividadLideres
 * @returns {Object} Resultado del test
 */
function testCalcularActividadLideres() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    // Crear células con datos de líder (simulando el resultado corregido)
    const celulasConLider = [
      {
        ID_Celula: 'C-001',
        ID_Lider: 'LD-001',
        Estado: 'Activa',
        Congregacion: 'Norte',
        Miembros: [{ ID_Miembro: 'A-001' }]
      },
      {
        ID_Celula: 'C-002',
        ID_Lider: 'LD-002',
        Estado: 'Inactiva',
        Congregacion: 'Sur',
        Miembros: []
      },
      {
        ID_Celula: 'C-003',
        ID_Lider: 'LD-001',
        Estado: 'Activa',
        Congregacion: 'Norte',
        Miembros: [{ ID_Miembro: 'A-003' }]
      }
    ];
    
    console.log('   🔍 Ejecutando calcularActividadLideres...');
    const actividadMap = calcularActividadLideres(celulasConLider);
    
    // Verificar que se generó el mapa
    verificaciones.push({
      item: 'Se generó mapa de actividad',
      success: actividadMap instanceof Map && actividadMap.size > 0,
      valor: `${actividadMap.size} líderes en el mapa`,
      tiempo: Date.now() - startTime
    });
    
    // Verificar métricas específicas
    if (actividadMap.has('LD-001')) {
      const actividadLD001 = actividadMap.get('LD-001');
      
      verificaciones.push({
        item: 'LD-001 tiene métricas',
        success: actividadLD001.totalCelulas === 2,
        valor: `Total células: ${actividadLD001.totalCelulas}`,
        tiempo: Date.now() - startTime
      });
      
      verificaciones.push({
        item: 'LD-001 células activas correctas',
        success: actividadLD001.celulasActivas === 2,
        valor: `Células activas: ${actividadLD001.celulasActivas}`,
        tiempo: Date.now() - startTime
      });
      
      verificaciones.push({
        item: 'LD-001 congregación correcta',
        success: actividadLD001.congregacion === 'Norte',
        valor: `Congregación: ${actividadLD001.congregacion}`,
        tiempo: Date.now() - startTime
      });
    } else {
      verificaciones.push({
        item: 'LD-001 en el mapa',
        success: false,
        error: 'LD-001 no encontrado en el mapa',
        tiempo: Date.now() - startTime
      });
    }
    
    if (actividadMap.has('LD-002')) {
      const actividadLD002 = actividadMap.get('LD-002');
      
      verificaciones.push({
        item: 'LD-002 tiene métricas',
        success: actividadLD002.totalCelulas === 1,
        valor: `Total células: ${actividadLD002.totalCelulas}`,
        tiempo: Date.now() - startTime
      });
      
      verificaciones.push({
        item: 'LD-002 células activas correctas',
        success: actividadLD002.celulasActivas === 0,
        valor: `Células activas: ${actividadLD002.celulasActivas}`,
        tiempo: Date.now() - startTime
      });
    } else {
      verificaciones.push({
        item: 'LD-002 en el mapa',
        success: false,
        error: 'LD-002 no encontrado en el mapa',
        tiempo: Date.now() - startTime
      });
    }
    
    const exitosos = verificaciones.filter(v => v.success).length;
    
    return {
      nombre: 'calcularActividadLideres con datos corregidos',
      resultado: exitosos === verificaciones.length ? 'PASS' : 'FAIL',
      verificaciones: verificaciones,
      exitosos: exitosos,
      total: verificaciones.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      nombre: 'calcularActividadLideres con datos corregidos',
      resultado: 'ERROR',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

/**
 * Test 3: Verificar integración completa
 * @returns {Object} Resultado del test
 */
function testIntegracionCompleta() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    const lideresPrueba = [
      { ID_Lider: 'LD-001', Nombre_Lider: 'Test LD 1' },
      { ID_Lider: 'LD-002', Nombre_Lider: 'Test LD 2' }
    ];
    
    const celulasConLider = [
      {
        ID_Celula: 'C-001',
        ID_Lider: 'LD-001',
        Estado: 'Activa',
        Congregacion: 'Norte',
        Miembros: [{ ID_Miembro: 'A-001' }]
      },
      {
        ID_Celula: 'C-002',
        ID_Lider: 'LD-002',
        Estado: 'Inactiva',
        Congregacion: 'Sur',
        Miembros: []
      }
    ];
    
    console.log('   🔍 Ejecutando integración completa...');
    const actividadMap = calcularActividadLideres(celulasConLider);
    const lideresConActividad = integrarActividadLideres(lideresPrueba, actividadMap);
    
    // Verificar que se integró correctamente
    verificaciones.push({
      item: 'Se integró actividad a líderes',
      success: lideresConActividad.length === 2,
      valor: `${lideresConActividad.length} líderes procesados`,
      tiempo: Date.now() - startTime
    });
    
    // Verificar que los líderes tienen métricas
    const tieneMetricas = lideresConActividad.every(l => l.actividad && typeof l.actividad.totalCelulas === 'number');
    verificaciones.push({
      item: 'Líderes tienen métricas de actividad',
      success: tieneMetricas,
      valor: tieneMetricas ? 'Todos tienen métricas' : 'Faltan métricas',
      tiempo: Date.now() - startTime
    });
    
    // Verificar métricas específicas
    const ld001 = lideresConActividad.find(l => l.ID_Lider === 'LD-001');
    if (ld001 && ld001.actividad) {
      verificaciones.push({
        item: 'LD-001 tiene actividad integrada',
        success: ld001.actividad.totalCelulas === 1,
        valor: `Total: ${ld001.actividad.totalCelulas}, Activas: ${ld001.actividad.celulasActivas}`,
        tiempo: Date.now() - startTime
      });
    }
    
    const ld002 = lideresConActividad.find(l => l.ID_Lider === 'LD-002');
    if (ld002 && ld002.actividad) {
      verificaciones.push({
        item: 'LD-002 tiene actividad integrada',
        success: ld002.actividad.totalCelulas === 1,
        valor: `Total: ${ld002.actividad.totalCelulas}, Activas: ${ld002.actividad.celulasActivas}`,
        tiempo: Date.now() - startTime
      });
    }
    
    const exitosos = verificaciones.filter(v => v.success).length;
    
    return {
      nombre: 'Integración completa actividad-líderes',
      resultado: exitosos === verificaciones.length ? 'PASS' : 'FAIL',
      verificaciones: verificaciones,
      exitosos: exitosos,
      total: verificaciones.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      nombre: 'Integración completa actividad-líderes',
      resultado: 'ERROR',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

/**
 * Test 4: Verificar flujo optimizado completo
 * @returns {Object} Resultado del test
 */
function testFlujoOptimizadoCompleto() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    console.log('   🔍 Ejecutando flujo optimizado completo...');
    
    // Simular datos de Google Sheets
    const datosSimulados = {
      lideres: [
        ['ID_Lider', 'Nombre_Lider', 'Rol', 'Congregacion'],
        ['LD-001', 'Test LD 1', 'LD', 'Norte'],
        ['LD-002', 'Test LD 2', 'LD', 'Sur']
      ],
      celulas: [
        ['ID Célula', 'Nombre Célula', 'ID Líder', 'Estado', 'Congregación', 'ID LCF', 'Nombre LCF', 'ID Miembro', 'Nombre Miembro'],
        ['C-001', 'Célula Test 1', 'LD-001', 'Activa', 'Norte', 'LCF-001', 'Test LCF 1', 'A-001', 'Alma Test 1'],
        ['C-002', 'Célula Test 2', 'LD-002', 'Inactiva', 'Sur', 'LCF-002', 'Test LCF 2', 'A-002', 'Alma Test 2']
      ],
      ingresos: [
        ['ID_Alma', 'Nombre_Alma', 'Fecha_Ingreso'],
        ['A-001', 'Alma Test 1', '2024-01-01'],
        ['A-002', 'Alma Test 2', '2024-01-02']
      ]
    };
    
    // Procesar datos como lo haría getDashboardDataOptimized
    const lideres = processLideresOptimized(datosSimulados.lideres);
    const celulas = processCelulasOptimized(datosSimulados.celulas);
    const ingresos = processIngresosOptimized(datosSimulados.ingresos);
    
    // Verificar que se procesaron los datos
    verificaciones.push({
      item: 'Líderes procesados',
      success: lideres.length > 0,
      valor: `${lideres.length} líderes`,
      tiempo: Date.now() - startTime
    });
    
    verificaciones.push({
      item: 'Células procesadas',
      success: celulas.length > 0,
      valor: `${celulas.length} células`,
      tiempo: Date.now() - startTime
    });
    
    verificaciones.push({
      item: 'Ingresos procesados',
      success: ingresos.length > 0,
      valor: `${ingresos.length} ingresos`,
      tiempo: Date.now() - startTime
    });
    
    // Verificar que las células tienen campos de líder
    const celulasConLider = celulas.filter(c => c.ID_Lider && c.ID_Lider !== '');
    verificaciones.push({
      item: 'Células tienen ID_Lider',
      success: celulasConLider.length > 0,
      valor: `${celulasConLider.length} células con líder`,
      tiempo: Date.now() - startTime
    });
    
    // Calcular actividad
    const actividadMap = calcularActividadLideres(celulas);
    const lideresConActividad = integrarActividadLideres(lideres, actividadMap);
    
    // Verificar que se calculó actividad
    verificaciones.push({
      item: 'Actividad calculada',
      success: actividadMap.size > 0,
      valor: `${actividadMap.size} líderes con actividad`,
      tiempo: Date.now() - startTime
    });
    
    // Verificar que los líderes tienen métricas
    const lideresConMetricas = lideresConActividad.filter(l => l.actividad && l.actividad.totalCelulas > 0);
    verificaciones.push({
      item: 'Líderes con métricas',
      success: lideresConMetricas.length > 0,
      valor: `${lideresConMetricas.length} líderes con métricas`,
      tiempo: Date.now() - startTime
    });
    
    const exitosos = verificaciones.filter(v => v.success).length;
    
    return {
      nombre: 'Flujo optimizado completo',
      resultado: exitosos === verificaciones.length ? 'PASS' : 'FAIL',
      verificaciones: verificaciones,
      exitosos: exitosos,
      total: verificaciones.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      nombre: 'Flujo optimizado completo',
      resultado: 'ERROR',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

/**
 * Muestra el resumen del test
 * @param {Object} resultados - Resultados del test
 */
function mostrarResumenTest(resultados) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 RESUMEN DEL TEST DE CORRECCIONES');
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
    console.log('\n🎉 ¡TODAS LAS CORRECCIONES FUNCIONAN CORRECTAMENTE!');
    console.log('✅ El sistema de actividad de líderes está completamente operativo');
  } else {
    console.log('\n⚠️ ALGUNAS CORRECCIONES FALLARON - REVISAR ERRORES ARRIBA');
    console.log('🔧 Corregir los problemas identificados');
  }
  
  console.log('='.repeat(80));
}

console.log('🧪 TestCorreccionesActividad cargado - Test específico para verificar correcciones');
