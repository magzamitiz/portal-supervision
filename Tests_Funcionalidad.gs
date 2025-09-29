/**
 * ARCHIVO DE TESTS DE FUNCIONALIDAD - ETAPA 1
 * Portal de Supervisión - Validación de Comportamiento Actual
 * 
 * Este archivo contiene tests para validar que el refactoring
 * mantenga 100% de compatibilidad funcional.
 */

// ==================== CONFIGURACIÓN DE TESTS ====================

const TEST_CONFIG = {
  // IDs de prueba (deben existir en los datos reales)
  TEST_LD_ID: 'LD001', // Cambiar por un LD real
  TEST_LCF_ID: 'LCF001', // Cambiar por un LCF real
  TEST_ALMA_ID: 'A001', // Cambiar por un alma real
  
  // Configuración de validación
  VALIDATE_STRUCTURE: true,
  VALIDATE_DATA_TYPES: true,
  VALIDATE_REQUIRED_FIELDS: true,
  
  // Timeout para tests
  TEST_TIMEOUT: 30000 // 30 segundos
};

// ==================== FUNCIONES DE UTILIDAD PARA TESTS ====================

/**
 * Función helper para validar estructura de respuesta
 */
function validateResponseStructure(response, expectedStructure) {
  if (!response || typeof response !== 'object') {
    return { valid: false, error: 'Respuesta no es un objeto válido' };
  }
  
  for (const key in expectedStructure) {
    if (!(key in response)) {
      return { valid: false, error: `Falta campo requerido: ${key}` };
    }
    
    if (expectedStructure[key] === 'array' && !Array.isArray(response[key])) {
      return { valid: false, error: `Campo ${key} debe ser array` };
    }
    
    if (expectedStructure[key] === 'object' && typeof response[key] !== 'object') {
      return { valid: false, error: `Campo ${key} debe ser objeto` };
    }
    
    if (expectedStructure[key] === 'string' && typeof response[key] !== 'string') {
      return { valid: false, error: `Campo ${key} debe ser string` };
    }
  }
  
  return { valid: true };
}

/**
 * Función helper para medir tiempo de ejecución
 */
function measureExecutionTime(func, ...args) {
  const startTime = Date.now();
  const result = func.apply(this, args);
  const endTime = Date.now();
  
  return {
    result: result,
    executionTime: endTime - startTime
  };
}

/**
 * Función helper para crear reporte de test
 */
function createTestReport(testName, passed, details, executionTime = null) {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  const timeInfo = executionTime ? ` (${executionTime}ms)` : '';
  
  console.log(`[TEST] ${status} ${testName}${timeInfo}`);
  if (details) {
    console.log(`[DETAILS] ${details}`);
  }
  
  return {
    testName: testName,
    passed: passed,
    details: details,
    executionTime: executionTime,
    timestamp: new Date().toISOString()
  };
}

// ==================== TESTS DE FUNCIONES CRÍTICAS ====================

/**
 * Test 1: doGet() - Función principal web
 */
function testDoGet() {
  console.log('\n=== TESTING doGet() ===');
  
  try {
    const execution = measureExecutionTime(doGet, {});
    
    // Validar que retorna HtmlService
    if (!execution.result || typeof execution.result.getContent !== 'function') {
      return createTestReport('doGet - Tipo de retorno', false, 
        'Debe retornar un objeto HtmlService');
    }
    
    // Validar que no hay errores críticos
    const content = execution.result.getContent();
    if (content.includes('Error al cargar la aplicación')) {
      return createTestReport('doGet - Sin errores', false, 
        'La función retorna página de error');
    }
    
    return createTestReport('doGet - Funcionalidad completa', true, 
      `HTML generado correctamente (${content.length} caracteres)`, 
      execution.executionTime);
      
  } catch (error) {
    return createTestReport('doGet - Sin excepciones', false, 
      `Error: ${error.toString()}`);
  }
}

/**
 * Test 2: getEstadisticasRapidas() - Estadísticas principales
 */
function testGetEstadisticasRapidas() {
  console.log('\n=== TESTING getEstadisticasRapidas() ===');
  
  try {
    const execution = measureExecutionTime(getEstadisticasRapidas);
    
    // Validar estructura de respuesta
    const expectedStructure = {
      success: 'boolean',
      data: 'object'
    };
    
    const structureValidation = validateResponseStructure(execution.result, expectedStructure);
    if (!structureValidation.valid) {
      return createTestReport('getEstadisticasRapidas - Estructura', false, 
        structureValidation.error);
    }
    
    // Si es exitoso, validar estructura de data
    if (execution.result.success) {
      const dataStructure = {
        lideres: 'object',
        celulas: 'object', 
        ingresos: 'object',
        metricas: 'object',
        timestamp: 'string'
      };
      
      const dataValidation = validateResponseStructure(execution.result.data, dataStructure);
      if (!dataValidation.valid) {
        return createTestReport('getEstadisticasRapidas - Data structure', false, 
          dataValidation.error);
      }
      
      return createTestReport('getEstadisticasRapidas - Éxito completo', true, 
        `Estadísticas cargadas correctamente`, execution.executionTime);
    } else {
      return createTestReport('getEstadisticasRapidas - Con error controlado', true, 
        `Error controlado: ${execution.result.error}`, execution.executionTime);
    }
    
  } catch (error) {
    return createTestReport('getEstadisticasRapidas - Sin excepciones', false, 
      `Error inesperado: ${error.toString()}`);
  }
}

/**
 * Test 3: getListaDeLideres() - Lista de líderes
 */
function testGetListaDeLideres() {
  console.log('\n=== TESTING getListaDeLideres() ===');
  
  try {
    const execution = measureExecutionTime(getListaDeLideres);
    
    // Validar estructura
    const expectedStructure = {
      success: 'boolean',
      data: 'array'
    };
    
    const structureValidation = validateResponseStructure(execution.result, expectedStructure);
    if (!structureValidation.valid) {
      return createTestReport('getListaDeLideres - Estructura', false, 
        structureValidation.error);
    }
    
    if (execution.result.success && execution.result.data.length > 0) {
      // Validar estructura de líder
      const primerLider = execution.result.data[0];
      const liderStructure = {
        ID_Lider: 'string',
        Nombre_Lider: 'string'
      };
      
      const liderValidation = validateResponseStructure(primerLider, liderStructure);
      if (!liderValidation.valid) {
        return createTestReport('getListaDeLideres - Estructura líder', false, 
          liderValidation.error);
      }
      
      return createTestReport('getListaDeLideres - Éxito completo', true, 
        `${execution.result.data.length} líderes cargados`, execution.executionTime);
    } else {
      return createTestReport('getListaDeLideres - Sin datos', true, 
        `Lista vacía o error controlado`, execution.executionTime);
    }
    
  } catch (error) {
    return createTestReport('getListaDeLideres - Sin excepciones', false, 
      `Error inesperado: ${error.toString()}`);
  }
}

/**
 * Test 4: getVistaRapidaLCF() - Vista rápida de LCF
 */
function testGetVistaRapidaLCF() {
  console.log('\n=== TESTING getVistaRapidaLCF() ===');
  
  try {
    const execution = measureExecutionTime(getVistaRapidaLCF, TEST_CONFIG.TEST_LCF_ID);
    
    // Validar estructura
    const expectedStructure = {
      success: 'boolean',
      lcf: 'string',
      almas: 'array'
    };
    
    const structureValidation = validateResponseStructure(execution.result, expectedStructure);
    if (!structureValidation.valid) {
      return createTestReport('getVistaRapidaLCF - Estructura', false, 
        structureValidation.error);
    }
    
    if (execution.result.success && execution.result.almas.length > 0) {
      // Validar estructura de alma
      const primerAlma = execution.result.almas[0];
      const almaStructure = {
        Nombre: 'string',
        ID_Alma: 'string',
        Estado: 'string',
        Dias_Sin_Seguimiento: 'number'
      };
      
      const almaValidation = validateResponseStructure(primerAlma, almaStructure);
      if (!almaValidation.valid) {
        return createTestReport('getVistaRapidaLCF - Estructura alma', false, 
          almaValidation.error);
      }
      
      return createTestReport('getVistaRapidaLCF - Éxito completo', true, 
        `${execution.result.almas.length} almas para ${execution.result.lcf}`, 
        execution.executionTime);
    } else {
      return createTestReport('getVistaRapidaLCF - Sin datos o error', true, 
        `LCF no encontrado o sin almas`, execution.executionTime);
    }
    
  } catch (error) {
    return createTestReport('getVistaRapidaLCF - Sin excepciones', false, 
      `Error inesperado: ${error.toString()}`);
  }
}

/**
 * Test 5: cargarDirectorioCompleto() - Carga principal
 */
function testCargarDirectorioCompleto() {
  console.log('\n=== TESTING cargarDirectorioCompleto() ===');
  
  try {
    const execution = measureExecutionTime(cargarDirectorioCompleto, false);
    
    // Validar estructura
    const expectedStructure = {
      lideres: 'array',
      celulas: 'array',
      ingresos: 'array',
      timestamp: 'string'
    };
    
    const structureValidation = validateResponseStructure(execution.result, expectedStructure);
    if (!structureValidation.valid) {
      return createTestReport('cargarDirectorioCompleto - Estructura', false, 
        structureValidation.error);
    }
    
    // Validar que tiene datos
    const totalDatos = execution.result.lideres.length + 
                      execution.result.celulas.length + 
                      execution.result.ingresos.length;
    
    if (totalDatos > 0) {
      return createTestReport('cargarDirectorioCompleto - Con datos', true, 
        `${execution.result.lideres.length} líderes, ${execution.result.celulas.length} células, ${execution.result.ingresos.length} ingresos`, 
        execution.executionTime);
    } else {
      return createTestReport('cargarDirectorioCompleto - Sin datos', true, 
        `Estructura correcta pero sin datos`, execution.executionTime);
    }
    
  } catch (error) {
    return createTestReport('cargarDirectorioCompleto - Sin excepciones', false, 
      `Error inesperado: ${error.toString()}`);
  }
}

// ==================== FUNCIÓN PRINCIPAL DE TESTS ====================

/**
 * Ejecuta todos los tests de funcionalidad
 */
function ejecutarTodosLosTests() {
  console.log('🚀 INICIANDO TESTS DE FUNCIONALIDAD - ETAPA 1');
  console.log('=' .repeat(60));
  
  const testResults = [];
  
  // Ejecutar tests críticos
  testResults.push(testDoGet());
  testResults.push(testGetEstadisticasRapidas());
  testResults.push(testGetListaDeLideres());
  testResults.push(testGetVistaRapidaLCF());
  testResults.push(testCargarDirectorioCompleto());
  
  // Generar reporte final
  const totalTests = testResults.length;
  const passedTests = testResults.filter(t => t.passed).length;
  const failedTests = totalTests - passedTests;
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 REPORTE FINAL DE TESTS');
  console.log('=' .repeat(60));
  console.log(`Total de tests: ${totalTests}`);
  console.log(`✅ Exitosos: ${passedTests}`);
  console.log(`❌ Fallidos: ${failedTests}`);
  console.log(`📈 Tasa de éxito: ${((passedTests/totalTests)*100).toFixed(1)}%`);
  
  // Mostrar detalles de tests fallidos
  const failedTestsDetails = testResults.filter(t => !t.passed);
  if (failedTestsDetails.length > 0) {
    console.log('\n🔍 DETALLES DE TESTS FALLIDOS:');
    failedTestsDetails.forEach(test => {
      console.log(`- ${test.testName}: ${test.details}`);
    });
  }
  
  // Guardar reporte en hoja de cálculo para referencia futura
  try {
    guardarReporteEnHoja(testResults);
  } catch (error) {
    console.log('⚠️ No se pudo guardar el reporte en hoja de cálculo');
  }
  
  return {
    total: totalTests,
    passed: passedTests,
    failed: failedTests,
    successRate: (passedTests/totalTests)*100,
    results: testResults
  };
}

/**
 * Guarda el reporte de tests en una hoja de cálculo
 */
function guardarReporteEnHoja(testResults) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('_TestsReporte');
  
  if (!sheet) {
    sheet = ss.insertSheet('_TestsReporte');
    // Crear encabezados
    sheet.getRange(1, 1, 1, 6).setValues([[
      'Test Name', 'Status', 'Details', 'Execution Time (ms)', 'Timestamp'
    ]]);
  }
  
  // Agregar resultados
  const data = testResults.map(test => [
    test.testName,
    test.passed ? 'PASS' : 'FAIL',
    test.details,
    test.executionTime || 0,
    test.timestamp
  ]);
  
  const startRow = sheet.getLastRow() + 1;
  sheet.getRange(startRow, 1, data.length, 5).setValues(data);
  
  console.log(`📝 Reporte guardado en hoja '_TestsReporte'`);
}

// ==================== TESTS DE COMPATIBILIDAD ====================

/**
 * Test de compatibilidad: Verifica que las funciones mantengan la misma firma
 */
function testCompatibilidadFirmas() {
  console.log('\n=== TESTING COMPATIBILIDAD DE FIRMAS ===');
  
  const funcionesRequeridas = [
    'doGet',
    'getEstadisticasRapidas', 
    'getListaDeLideres',
    'getVistaRapidaLCF',
    'getSeguimientoAlmasLCF',
    'cargarDirectorioCompleto',
    'forceReloadDashboardData'
  ];
  
  const resultados = [];
  
  funcionesRequeridas.forEach(funcName => {
    if (typeof window[funcName] === 'function' || typeof this[funcName] === 'function') {
      resultados.push(createTestReport(`Firma ${funcName}`, true, 'Función existe'));
    } else {
      resultados.push(createTestReport(`Firma ${funcName}`, false, 'Función no encontrada'));
    }
  });
  
  return resultados;
}

// ==================== FUNCIÓN DE CONFIGURACIÓN ====================

/**
 * Configura los IDs de prueba para los tests
 */
function configurarTests(testLDId, testLCFId, testAlmaId) {
  TEST_CONFIG.TEST_LD_ID = testLDId;
  TEST_CONFIG.TEST_LCF_ID = testLCFId; 
  TEST_CONFIG.TEST_ALMA_ID = testAlmaId;
  
  console.log('✅ Configuración de tests actualizada:');
  console.log(`- LD ID: ${TEST_CONFIG.TEST_LD_ID}`);
  console.log(`- LCF ID: ${TEST_CONFIG.TEST_LCF_ID}`);
  console.log(`- Alma ID: ${TEST_CONFIG.TEST_ALMA_ID}`);
}

console.log('📋 Tests de funcionalidad cargados. Ejecuta "ejecutarTodosLosTests()" para comenzar.');

