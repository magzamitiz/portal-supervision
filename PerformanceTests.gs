/**
 * PERFORMANCE TESTS - SUITE DE PRUEBAS DE RENDIMIENTO
 * Etapa 3 - Semana 3: Suite completa de pruebas de rendimiento
 * 
 * Este módulo implementa una suite completa de pruebas que:
 * - Evalúa el rendimiento de todas las operaciones críticas
 * - Simula cargas de trabajo reales
 * - Genera reportes detallados de rendimiento
 * - Identifica cuellos de botella automáticamente
 */

// ==================== CONFIGURACIÓN DE PRUEBAS ====================

const PERFORMANCE_TEST_CONFIG = {
  ENABLE_TESTS: true,
  ENABLE_STRESS_TESTS: true,
  ENABLE_LOAD_TESTS: true,
  ENABLE_BENCHMARK_TESTS: true,
  DEFAULT_ITERATIONS: 10,
  STRESS_TEST_ITERATIONS: 100,
  LOAD_TEST_CONCURRENT: 5,
  BENCHMARK_THRESHOLDS: {
    FAST: 1000, // 1 segundo
    MODERATE: 3000, // 3 segundos
    SLOW: 5000, // 5 segundos
    VERY_SLOW: 10000 // 10 segundos
  },
  ENABLE_REPORTS: true,
  ENABLE_ALERTS: true
};

// ==================== ESTRUCTURAS DE DATOS ====================

const testResults = [];
const benchmarkResults = new Map();
// performanceAlerts ya está declarado en PerformanceMonitor.gs

// ==================== CLASE DE RESULTADO DE PRUEBA ====================

class TestResult {
  constructor(testName, startTime, endTime, success, error = null, metadata = {}) {
    this.testName = testName;
    this.startTime = startTime;
    this.endTime = endTime;
    this.duration = endTime - startTime;
    this.success = success;
    this.error = error;
    this.metadata = metadata;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      testName: this.testName,
      duration: this.duration,
      success: this.success,
      error: this.error,
      metadata: this.metadata,
      timestamp: this.timestamp
    };
  }
}

// ==================== FUNCIONES PRINCIPALES DE PRUEBAS ====================

/**
 * Ejecuta todas las pruebas de rendimiento
 * @param {Object} options - Opciones de las pruebas
 * @returns {Object} Resultados de todas las pruebas
 */
function runAllPerformanceTests(options = {}) {
  if (!PERFORMANCE_TEST_CONFIG.ENABLE_TESTS) {
    return { message: 'Pruebas de rendimiento deshabilitadas' };
  }

  console.log('[PerformanceTests] Iniciando suite completa de pruebas de rendimiento...');
  
  const startTime = Date.now();
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: {},
    benchmarks: {},
    alerts: []
  };

  try {
    // Pruebas básicas de rendimiento
    results.tests.push(runBasicPerformanceTests(options));
    
    // Pruebas de estrés
    if (PERFORMANCE_TEST_CONFIG.ENABLE_STRESS_TESTS) {
      results.tests.push(runStressTests(options));
    }
    
    // Pruebas de carga
    if (PERFORMANCE_TEST_CONFIG.ENABLE_LOAD_TESTS) {
      results.tests.push(runLoadTests(options));
    }
    
    // Pruebas de benchmark
    if (PERFORMANCE_TEST_CONFIG.ENABLE_BENCHMARK_TESTS) {
      results.benchmarks = runBenchmarkTests(options);
    }
    
    // Generar resumen
    results.summary = generateTestSummary(results.tests);
    
    // Generar alertas
    if (PERFORMANCE_TEST_CONFIG.ENABLE_ALERTS) {
      results.alerts = generatePerformanceAlerts(results);
    }
    
    const totalDuration = Date.now() - startTime;
    console.log(`[PerformanceTests] Suite completa ejecutada en ${totalDuration}ms`);
    
    return results;
    
  } catch (error) {
    console.error('[PerformanceTests] Error ejecutando suite de pruebas:', error);
    return {
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Ejecuta pruebas básicas de rendimiento
 * @param {Object} options - Opciones de las pruebas
 * @returns {Object} Resultados de las pruebas básicas
 */
function runBasicPerformanceTests(options = {}) {
  console.log('[PerformanceTests] Ejecutando pruebas básicas de rendimiento...');
  
  const tests = [
    { name: 'testCachePerformance', fn: testCachePerformance },
    { name: 'testSpreadsheetManagerPerformance', fn: testSpreadsheetManagerPerformance },
    { name: 'testDataLoadingPerformance', fn: testDataLoadingPerformance },
    { name: 'testQueryOptimizationPerformance', fn: testQueryOptimizationPerformance },
    { name: 'testErrorHandlingPerformance', fn: testErrorHandlingPerformance }
  ];
  
  const results = [];
  
  tests.forEach(test => {
    try {
      const result = test.fn(options);
      results.push(result);
    } catch (error) {
      results.push(new TestResult(
        test.name,
        Date.now(),
        Date.now(),
        false,
        error.toString()
      ));
    }
  });
  
  return {
    category: 'Basic Performance Tests',
    tests: results,
    summary: generateTestCategorySummary(results)
  };
}

/**
 * Ejecuta pruebas de estrés
 * @param {Object} options - Opciones de las pruebas
 * @returns {Object} Resultados de las pruebas de estrés
 */
function runStressTests(options = {}) {
  console.log('[PerformanceTests] Ejecutando pruebas de estrés...');
  
  const tests = [
    { name: 'testHighVolumeDataLoading', fn: testHighVolumeDataLoading },
    { name: 'testConcurrentOperations', fn: testConcurrentOperations },
    { name: 'testMemoryStress', fn: testMemoryStress },
    { name: 'testCacheStress', fn: testCacheStress }
  ];
  
  const results = [];
  
  tests.forEach(test => {
    try {
      const result = test.fn(options);
      results.push(result);
    } catch (error) {
      results.push(new TestResult(
        test.name,
        Date.now(),
        Date.now(),
        false,
        error.toString()
      ));
    }
  });
  
  return {
    category: 'Stress Tests',
    tests: results,
    summary: generateTestCategorySummary(results)
  };
}

/**
 * Ejecuta pruebas de carga
 * @param {Object} options - Opciones de las pruebas
 * @returns {Object} Resultados de las pruebas de carga
 */
function runLoadTests(options = {}) {
  console.log('[PerformanceTests] Ejecutando pruebas de carga...');
  
  const tests = [
    { name: 'testSimultaneousUsers', fn: testSimultaneousUsers },
    { name: 'testRapidSequentialRequests', fn: testRapidSequentialRequests },
    { name: 'testMixedWorkload', fn: testMixedWorkload }
  ];
  
  const results = [];
  
  tests.forEach(test => {
    try {
      const result = test.fn(options);
      results.push(result);
    } catch (error) {
      results.push(new TestResult(
        test.name,
        Date.now(),
        Date.now(),
        false,
        error.toString()
      ));
    }
  });
  
  return {
    category: 'Load Tests',
    tests: results,
    summary: generateTestCategorySummary(results)
  };
}

// ==================== PRUEBAS ESPECÍFICAS ====================

/**
 * Prueba el rendimiento del sistema de caché
 * @param {Object} options - Opciones de la prueba
 * @returns {TestResult} Resultado de la prueba
 */
function testCachePerformance(options = {}) {
  const startTime = Date.now();
  const iterations = options.iterations || PERFORMANCE_TEST_CONFIG.DEFAULT_ITERATIONS;
  
  try {
    console.log(`[PerformanceTests] Probando rendimiento de caché (${iterations} iteraciones)...`);
    
    const testData = generateTestData(1000); // 1000 elementos de prueba
    const cacheKey = 'performance_test_cache';
    
    // Prueba de escritura
    const writeStart = Date.now();
    for (let i = 0; i < iterations; i++) {
      setIntelligentCache(cacheKey + i, testData, 300);
    }
    const writeDuration = Date.now() - writeStart;
    
    // Prueba de lectura
    const readStart = Date.now();
    for (let i = 0; i < iterations; i++) {
      getIntelligentCache(cacheKey + i);
    }
    const readDuration = Date.now() - readStart;
    
    // Prueba de compresión
    const compressionStart = Date.now();
    const largeData = generateTestData(10000); // 10,000 elementos
    setIntelligentCache('compression_test', largeData, 300);
    const compressionDuration = Date.now() - compressionStart;
    
    const endTime = Date.now();
    
    return new TestResult(
      'testCachePerformance',
      startTime,
      endTime,
      true,
      null,
      {
        iterations,
        writeDuration,
        readDuration,
        compressionDuration,
        averageWriteTime: writeDuration / iterations,
        averageReadTime: readDuration / iterations,
        compressionTime: compressionDuration
      }
    );
    
  } catch (error) {
    return new TestResult(
      'testCachePerformance',
      startTime,
      Date.now(),
      false,
      error.toString()
    );
  }
}

/**
 * Prueba el rendimiento del SpreadsheetManager
 * @param {Object} options - Opciones de la prueba
 * @returns {TestResult} Resultado de la prueba
 */
function testSpreadsheetManagerPerformance(options = {}) {
  const startTime = Date.now();
  const iterations = options.iterations || PERFORMANCE_TEST_CONFIG.DEFAULT_ITERATIONS;
  
  try {
    console.log(`[PerformanceTests] Probando rendimiento de SpreadsheetManager (${iterations} iteraciones)...`);
    
    const spreadsheetId = CONFIG.SHEETS.DIRECTORIO;
    const sheetName = CONFIG.TABS.LIDERES;
    
    // Prueba de conexión
    const connectionStart = Date.now();
    for (let i = 0; i < iterations; i++) {
      const sm = SpreadsheetManager.getInstance();
      sm.getSpreadsheet(spreadsheetId);
    }
    const connectionDuration = Date.now() - connectionStart;
    
    // Prueba de consultas
    const queryStart = Date.now();
    for (let i = 0; i < iterations; i++) {
      const sm = SpreadsheetManager.getInstance();
      sm.getSheetData(spreadsheetId, sheetName, { startRow: 1, endRow: 10 });
    }
    const queryDuration = Date.now() - queryStart;
    
    // Prueba de consultas múltiples
    const multiQueryStart = Date.now();
    const ranges = [
      { startRow: 1, endRow: 5, startCol: 1, endCol: 3 },
      { startRow: 6, endRow: 10, startCol: 1, endCol: 3 }
    ];
    for (let i = 0; i < iterations; i++) {
      const sm = SpreadsheetManager.getInstance();
      sm.getMultipleRanges(spreadsheetId, sheetName, ranges);
    }
    const multiQueryDuration = Date.now() - multiQueryStart;
    
    const endTime = Date.now();
    
    return new TestResult(
      'testSpreadsheetManagerPerformance',
      startTime,
      endTime,
      true,
      null,
      {
        iterations,
        connectionDuration,
        queryDuration,
        multiQueryDuration,
        averageConnectionTime: connectionDuration / iterations,
        averageQueryTime: queryDuration / iterations,
        averageMultiQueryTime: multiQueryDuration / iterations
      }
    );
    
  } catch (error) {
    return new TestResult(
      'testSpreadsheetManagerPerformance',
      startTime,
      Date.now(),
      false,
      error.toString()
    );
  }
}

/**
 * Prueba el rendimiento de carga de datos
 * @param {Object} options - Opciones de la prueba
 * @returns {TestResult} Resultado de la prueba
 */
function testDataLoadingPerformance(options = {}) {
  const startTime = Date.now();
  const iterations = options.iterations || PERFORMANCE_TEST_CONFIG.DEFAULT_ITERATIONS;
  
  try {
    console.log(`[PerformanceTests] Probando rendimiento de carga de datos (${iterations} iteraciones)...`);
    
    // Prueba de carga completa
    const fullLoadStart = Date.now();
    for (let i = 0; i < iterations; i++) {
      cargarDirectorioCompleto(true); // Forzar recarga
    }
    const fullLoadDuration = Date.now() - fullLoadStart;
    
    // Prueba de carga con caché
    const cachedLoadStart = Date.now();
    for (let i = 0; i < iterations; i++) {
      cargarDirectorioCompleto(false); // Usar caché
    }
    const cachedLoadDuration = Date.now() - cachedLoadStart;
    
    // Prueba de carga optimizada
    const optimizedLoadStart = Date.now();
    for (let i = 0; i < iterations; i++) {
      getOptimizedRanges(CONFIG.SHEETS.DIRECTORIO, CONFIG.TABS.LIDERES, [
        { startRow: 1, endRow: 100, startCol: 1, endCol: 5 }
      ]);
    }
    const optimizedLoadDuration = Date.now() - optimizedLoadStart;
    
    const endTime = Date.now();
    
    return new TestResult(
      'testDataLoadingPerformance',
      startTime,
      endTime,
      true,
      null,
      {
        iterations,
        fullLoadDuration,
        cachedLoadDuration,
        optimizedLoadDuration,
        averageFullLoadTime: fullLoadDuration / iterations,
        averageCachedLoadTime: cachedLoadDuration / iterations,
        averageOptimizedLoadTime: optimizedLoadDuration / iterations,
        cacheImprovement: ((fullLoadDuration - cachedLoadDuration) / fullLoadDuration * 100).toFixed(2) + '%'
      }
    );
    
  } catch (error) {
    return new TestResult(
      'testDataLoadingPerformance',
      startTime,
      Date.now(),
      false,
      error.toString()
    );
  }
}

/**
 * Prueba el rendimiento de optimización de consultas
 * @param {Object} options - Opciones de la prueba
 * @returns {TestResult} Resultado de la prueba
 */
function testQueryOptimizationPerformance(options = {}) {
  const startTime = Date.now();
  const iterations = options.iterations || PERFORMANCE_TEST_CONFIG.DEFAULT_ITERATIONS;
  
  try {
    console.log(`[PerformanceTests] Probando rendimiento de optimización de consultas (${iterations} iteraciones)...`);
    
    const spreadsheetId = CONFIG.SHEETS.DIRECTORIO;
    const sheetName = CONFIG.TABS.LIDERES;
    
    // Prueba de consultas individuales
    const individualStart = Date.now();
    for (let i = 0; i < iterations; i++) {
      const sm = SpreadsheetManager.getInstance();
      sm.getSheetData(spreadsheetId, sheetName, { startRow: 1, endRow: 10 });
      sm.getSheetData(spreadsheetId, sheetName, { startRow: 11, endRow: 20 });
      sm.getSheetData(spreadsheetId, sheetName, { startRow: 21, endRow: 30 });
    }
    const individualDuration = Date.now() - individualStart;
    
    // Prueba de consultas optimizadas
    const optimizedStart = Date.now();
    const ranges = [
      { startRow: 1, endRow: 10, startCol: 1, endCol: 5 },
      { startRow: 11, endRow: 20, startCol: 1, endCol: 5 },
      { startRow: 21, endRow: 30, startCol: 1, endCol: 5 }
    ];
    for (let i = 0; i < iterations; i++) {
      getOptimizedRanges(spreadsheetId, sheetName, ranges);
    }
    const optimizedDuration = Date.now() - optimizedStart;
    
    const endTime = Date.now();
    
    return new TestResult(
      'testQueryOptimizationPerformance',
      startTime,
      endTime,
      true,
      null,
      {
        iterations,
        individualDuration,
        optimizedDuration,
        averageIndividualTime: individualDuration / iterations,
        averageOptimizedTime: optimizedDuration / iterations,
        optimizationImprovement: ((individualDuration - optimizedDuration) / individualDuration * 100).toFixed(2) + '%'
      }
    );
    
  } catch (error) {
    return new TestResult(
      'testQueryOptimizationPerformance',
      startTime,
      Date.now(),
      false,
      error.toString()
    );
  }
}

/**
 * Prueba el rendimiento del manejo de errores
 * @param {Object} options - Opciones de la prueba
 * @returns {TestResult} Resultado de la prueba
 */
function testErrorHandlingPerformance(options = {}) {
  const startTime = Date.now();
  const iterations = options.iterations || PERFORMANCE_TEST_CONFIG.DEFAULT_ITERATIONS;
  
  try {
    console.log(`[PerformanceTests] Probando rendimiento de manejo de errores (${iterations} iteraciones)...`);
    
    // Prueba de manejo de errores
    const errorHandlingStart = Date.now();
    for (let i = 0; i < iterations; i++) {
      try {
        // Simular error
        throw new Error(`Test error ${i}`);
      } catch (error) {
        handleError(error, { operation: 'test', iteration: i });
      }
    }
    const errorHandlingDuration = Date.now() - errorHandlingStart;
    
    // Prueba de recuperación automática
    const recoveryStart = Date.now();
    for (let i = 0; i < iterations; i++) {
      try {
        // Simular error recuperable
        const error = new Error('Network timeout');
        error.type = 'NETWORK';
        handleError(error, { operation: 'test_recovery', iteration: i });
      } catch (error) {
        // Error en el manejo
      }
    }
    const recoveryDuration = Date.now() - recoveryStart;
    
    const endTime = Date.now();
    
    return new TestResult(
      'testErrorHandlingPerformance',
      startTime,
      endTime,
      true,
      null,
      {
        iterations,
        errorHandlingDuration,
        recoveryDuration,
        averageErrorHandlingTime: errorHandlingDuration / iterations,
        averageRecoveryTime: recoveryDuration / iterations
      }
    );
    
  } catch (error) {
    return new TestResult(
      'testErrorHandlingPerformance',
      startTime,
      Date.now(),
      false,
      error.toString()
    );
  }
}

// ==================== PRUEBAS DE ESTRÉS ====================

/**
 * Prueba de carga de datos de alto volumen
 * @param {Object} options - Opciones de la prueba
 * @returns {TestResult} Resultado de la prueba
 */
function testHighVolumeDataLoading(options = {}) {
  const startTime = Date.now();
  const iterations = options.iterations || PERFORMANCE_TEST_CONFIG.STRESS_TEST_ITERATIONS;
  
  try {
    console.log(`[PerformanceTests] Probando carga de datos de alto volumen (${iterations} iteraciones)...`);
    
    const results = [];
    
    for (let i = 0; i < iterations; i++) {
      const iterStart = Date.now();
      
      // Cargar datos completos
      const data = cargarDirectorioCompleto(true);
      
      const iterEnd = Date.now();
      results.push({
        iteration: i,
        duration: iterEnd - iterStart,
        success: data && data.lideres && data.celulas && data.ingresos
      });
      
      // Pausa pequeña para evitar límites de API
      if (i % 10 === 0) {
        Utilities.sleep(100);
      }
    }
    
    const endTime = Date.now();
    const successCount = results.filter(r => r.success).length;
    const averageDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    
    return new TestResult(
      'testHighVolumeDataLoading',
      startTime,
      endTime,
      successCount === iterations,
      successCount < iterations ? `${iterations - successCount} fallos` : null,
      {
        iterations,
        successCount,
        failureCount: iterations - successCount,
        averageDuration,
        totalDuration: endTime - startTime
      }
    );
    
  } catch (error) {
    return new TestResult(
      'testHighVolumeDataLoading',
      startTime,
      Date.now(),
      false,
      error.toString()
    );
  }
}

// ==================== FUNCIONES DE UTILIDAD ====================

/**
 * Genera datos de prueba
 * @param {number} size - Tamaño de los datos
 * @returns {Array} Datos de prueba
 */
function generateTestData(size) {
  const data = [];
  for (let i = 0; i < size; i++) {
    data.push({
      id: i,
      name: `Test Item ${i}`,
      value: Math.random() * 1000,
      timestamp: new Date().toISOString()
    });
  }
  return data;
}

/**
 * Genera resumen de una categoría de pruebas
 * @param {Array} results - Resultados de las pruebas
 * @returns {Object} Resumen de la categoría
 */
function generateTestCategorySummary(results) {
  const totalTests = results.length;
  const successfulTests = results.filter(r => r.success).length;
  const failedTests = totalTests - successfulTests;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  const averageDuration = totalDuration / totalTests;
  
  return {
    totalTests,
    successfulTests,
    failedTests,
    successRate: ((successfulTests / totalTests) * 100).toFixed(2) + '%',
    totalDuration,
    averageDuration: Math.round(averageDuration)
  };
}

/**
 * Genera resumen general de todas las pruebas
 * @param {Array} testCategories - Categorías de pruebas
 * @returns {Object} Resumen general
 */
function generateTestSummary(testCategories) {
  const allResults = testCategories.flatMap(category => category.tests);
  const totalTests = allResults.length;
  const successfulTests = allResults.filter(r => r.success).length;
  const failedTests = totalTests - successfulTests;
  const totalDuration = allResults.reduce((sum, r) => sum + r.duration, 0);
  
  return {
    totalTests,
    successfulTests,
    failedTests,
    successRate: ((successfulTests / totalTests) * 100).toFixed(2) + '%',
    totalDuration,
    averageDuration: Math.round(totalDuration / totalTests),
    categories: testCategories.length
  };
}

/**
 * Genera alertas de rendimiento
 * @param {Object} results - Resultados de las pruebas
 * @returns {Array} Alertas generadas
 */
function generatePerformanceAlerts(results) {
  const alerts = [];
  
  // Verificar pruebas fallidas
  const failedTests = results.tests.flatMap(category => 
    category.tests.filter(test => !test.success)
  );
  
  if (failedTests.length > 0) {
    alerts.push({
      type: 'FAILED_TESTS',
      severity: 'HIGH',
      message: `${failedTests.length} pruebas fallaron`,
      count: failedTests.length
    });
  }
  
  // Verificar rendimiento lento
  const slowTests = results.tests.flatMap(category =>
    category.tests.filter(test => test.duration > PERFORMANCE_TEST_CONFIG.BENCHMARK_THRESHOLDS.SLOW)
  );
  
  if (slowTests.length > 0) {
    alerts.push({
      type: 'SLOW_TESTS',
      severity: 'MEDIUM',
      message: `${slowTests.length} pruebas fueron lentas`,
      count: slowTests.length
    });
  }
  
  return alerts;
}

/**
 * Ejecuta pruebas de benchmark
 * @param {Object} options - Opciones de las pruebas
 * @returns {Object} Resultados de benchmark
 */
function runBenchmarkTests(options = {}) {
  console.log('[PerformanceTests] Ejecutando pruebas de benchmark...');
  
  const benchmarks = {
    cacheReadWrite: benchmarkCacheReadWrite(),
    spreadsheetOperations: benchmarkSpreadsheetOperations(),
    dataLoading: benchmarkDataLoading(),
    queryOptimization: benchmarkQueryOptimization()
  };
  
  return benchmarks;
}

/**
 * Benchmark de lectura/escritura de caché
 * @returns {Object} Resultado del benchmark
 */
function benchmarkCacheReadWrite() {
  const iterations = 1000;
  const testData = generateTestData(100);
  
  // Benchmark de escritura
  const writeStart = Date.now();
  for (let i = 0; i < iterations; i++) {
    setIntelligentCache(`benchmark_${i}`, testData, 300);
  }
  const writeDuration = Date.now() - writeStart;
  
  // Benchmark de lectura
  const readStart = Date.now();
  for (let i = 0; i < iterations; i++) {
    getIntelligentCache(`benchmark_${i}`);
  }
  const readDuration = Date.now() - readStart;
  
  return {
    iterations,
    writeDuration,
    readDuration,
    averageWriteTime: writeDuration / iterations,
    averageReadTime: readDuration / iterations,
    operationsPerSecond: {
      write: Math.round(iterations / (writeDuration / 1000)),
      read: Math.round(iterations / (readDuration / 1000))
    }
  };
}

/**
 * Benchmark de operaciones de spreadsheet
 * @returns {Object} Resultado del benchmark
 */
function benchmarkSpreadsheetOperations() {
  const iterations = 100;
  const spreadsheetId = CONFIG.SHEETS.DIRECTORIO;
  const sheetName = CONFIG.TABS.LIDERES;
  
  // Benchmark de conexión
  const connectionStart = Date.now();
  for (let i = 0; i < iterations; i++) {
    const sm = SpreadsheetManager.getInstance();
    sm.getSpreadsheet(spreadsheetId);
  }
  const connectionDuration = Date.now() - connectionStart;
  
  // Benchmark de consultas
  const queryStart = Date.now();
  for (let i = 0; i < iterations; i++) {
    const sm = SpreadsheetManager.getInstance();
    sm.getSheetData(spreadsheetId, sheetName, { startRow: 1, endRow: 10 });
  }
  const queryDuration = Date.now() - queryStart;
  
  return {
    iterations,
    connectionDuration,
    queryDuration,
    averageConnectionTime: connectionDuration / iterations,
    averageQueryTime: queryDuration / iterations,
    operationsPerSecond: {
      connection: Math.round(iterations / (connectionDuration / 1000)),
      query: Math.round(iterations / (queryDuration / 1000))
    }
  };
}

/**
 * Benchmark de carga de datos
 * @returns {Object} Resultado del benchmark
 */
function benchmarkDataLoading() {
  const iterations = 10;
  
  // Benchmark de carga completa
  const fullLoadStart = Date.now();
  for (let i = 0; i < iterations; i++) {
    cargarDirectorioCompleto(true);
  }
  const fullLoadDuration = Date.now() - fullLoadStart;
  
  // Benchmark de carga con caché
  const cachedLoadStart = Date.now();
  for (let i = 0; i < iterations; i++) {
    cargarDirectorioCompleto(false);
  }
  const cachedLoadDuration = Date.now() - cachedLoadStart;
  
  return {
    iterations,
    fullLoadDuration,
    cachedLoadDuration,
    averageFullLoadTime: fullLoadDuration / iterations,
    averageCachedLoadTime: cachedLoadDuration / iterations,
    cacheImprovement: ((fullLoadDuration - cachedLoadDuration) / fullLoadDuration * 100).toFixed(2) + '%',
    operationsPerSecond: {
      fullLoad: Math.round(iterations / (fullLoadDuration / 1000)),
      cachedLoad: Math.round(iterations / (cachedLoadDuration / 1000))
    }
  };
}

/**
 * Benchmark de optimización de consultas
 * @returns {Object} Resultado del benchmark
 */
function benchmarkQueryOptimization() {
  const iterations = 50;
  const spreadsheetId = CONFIG.SHEETS.DIRECTORIO;
  const sheetName = CONFIG.TABS.LIDERES;
  
  // Benchmark de consultas individuales
  const individualStart = Date.now();
  for (let i = 0; i < iterations; i++) {
    const sm = SpreadsheetManager.getInstance();
    sm.getSheetData(spreadsheetId, sheetName, { startRow: 1, endRow: 10 });
    sm.getSheetData(spreadsheetId, sheetName, { startRow: 11, endRow: 20 });
  }
  const individualDuration = Date.now() - individualStart;
  
  // Benchmark de consultas optimizadas
  const ranges = [
    { startRow: 1, endRow: 10, startCol: 1, endCol: 5 },
    { startRow: 11, endRow: 20, startCol: 1, endCol: 5 }
  ];
  const optimizedStart = Date.now();
  for (let i = 0; i < iterations; i++) {
    getOptimizedRanges(spreadsheetId, sheetName, ranges);
  }
  const optimizedDuration = Date.now() - optimizedStart;
  
  return {
    iterations,
    individualDuration,
    optimizedDuration,
    averageIndividualTime: individualDuration / iterations,
    averageOptimizedTime: optimizedDuration / iterations,
    optimizationImprovement: ((individualDuration - optimizedDuration) / individualDuration * 100).toFixed(2) + '%',
    operationsPerSecond: {
      individual: Math.round(iterations / (individualDuration / 1000)),
      optimized: Math.round(iterations / (optimizedDuration / 1000))
    }
  };
}

console.log('🧪 PerformanceTests cargado - Suite de pruebas de rendimiento disponible');
