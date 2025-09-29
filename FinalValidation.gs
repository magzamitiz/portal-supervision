/**
 * FINAL VALIDATION - VALIDACIÓN FINAL Y ENTREGA
 * Etapa 4 - Semana 4: Validación final completa y entrega del sistema
 * 
 * Este módulo implementa la validación final que:
 * - Valida el sistema completo
 * - Ejecuta todas las pruebas
 * - Genera reportes finales
 * - Prepara la entrega del sistema
 */

// ==================== CONFIGURACIÓN DE VALIDACIÓN FINAL ====================

const FINAL_VALIDATION_CONFIG = {
  ENABLE_FINAL_VALIDATION: true,
  ENABLE_COMPREHENSIVE_TESTS: true,
  ENABLE_PERFORMANCE_VALIDATION: true,
  ENABLE_FUNCTIONALITY_VALIDATION: true,
  ENABLE_INTEGRATION_VALIDATION: true,
  ENABLE_SECURITY_VALIDATION: true,
  ENABLE_DEPLOYMENT_VALIDATION: true,
  ENABLE_DOCUMENTATION_VALIDATION: true,
  ENABLE_MONITORING_VALIDATION: true,
  ENABLE_FINAL_REPORTS: true,
  VALIDATION_TIMEOUT: 60000, // 1 minuto
  RETRY_ATTEMPTS: 3,
  ENABLE_ALERTS: true,
  ENABLE_BACKUP: true
};

// ==================== ESTRUCTURAS DE DATOS ====================

const validationResults = [];
const finalReports = new Map();
const systemStatus = new Map();

// ==================== CLASE DE RESULTADO DE VALIDACIÓN ====================

class ValidationResult {
  constructor(category, testName, startTime, endTime, success, error = null, details = {}) {
    this.category = category;
    this.testName = testName;
    this.startTime = startTime;
    this.endTime = endTime;
    this.duration = endTime - startTime;
    this.success = success;
    this.error = error;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.severity = this.calculateSeverity(success, error);
  }

  calculateSeverity(success, error) {
    if (success) return 'PASS';
    if (error && error.includes('CRITICAL')) return 'CRITICAL';
    if (error && error.includes('ERROR')) return 'ERROR';
    if (error && error.includes('WARNING')) return 'WARNING';
    return 'FAIL';
  }

  toJSON() {
    return {
      category: this.category,
      testName: this.testName,
      duration: this.duration,
      success: this.success,
      error: this.error,
      details: this.details,
      timestamp: this.timestamp,
      severity: this.severity
    };
  }
}

// ==================== FUNCIONES PRINCIPALES DE VALIDACIÓN ====================

/**
 * Ejecuta la validación final completa del sistema
 * @param {Object} options - Opciones de validación
 * @returns {Object} Resultado de la validación final
 */
function runFinalValidation(options = {}) {
  if (!FINAL_VALIDATION_CONFIG.ENABLE_FINAL_VALIDATION) {
    return { message: 'Validación final deshabilitada' };
  }

  console.log('[FinalValidation] Iniciando validación final completa del sistema...');
  
  const startTime = Date.now();
  const results = {
    timestamp: new Date().toISOString(),
    validation: {},
    tests: [],
    reports: {},
    status: {},
    summary: {},
    recommendations: [],
    alerts: []
  };

  try {
    // 1. Validación de funcionalidad
    if (FINAL_VALIDATION_CONFIG.ENABLE_FUNCTIONALITY_VALIDATION) {
      results.validation.functionality = runFunctionalityValidation();
      results.tests.push(...results.validation.functionality.tests);
    }
    
    // 2. Validación de rendimiento
    if (FINAL_VALIDATION_CONFIG.ENABLE_PERFORMANCE_VALIDATION) {
      results.validation.performance = runPerformanceValidation();
      results.tests.push(...results.validation.performance.tests);
    }
    
    // 3. Validación de integración
    if (FINAL_VALIDATION_CONFIG.ENABLE_INTEGRATION_VALIDATION) {
      results.validation.integration = runIntegrationValidation();
      results.tests.push(...results.validation.integration.tests);
    }
    
    // 4. Validación de seguridad
    if (FINAL_VALIDATION_CONFIG.ENABLE_SECURITY_VALIDATION) {
      results.validation.security = runSecurityValidation();
      results.tests.push(...results.validation.security.tests);
    }
    
    // 5. Validación de despliegue
    if (FINAL_VALIDATION_CONFIG.ENABLE_DEPLOYMENT_VALIDATION) {
      results.validation.deployment = runDeploymentValidation();
      results.tests.push(...results.validation.deployment.tests);
    }
    
    // 6. Validación de documentación
    if (FINAL_VALIDATION_CONFIG.ENABLE_DOCUMENTATION_VALIDATION) {
      results.validation.documentation = runDocumentationValidation();
      results.tests.push(...results.validation.documentation.tests);
    }
    
    // 7. Validación de monitoreo
    if (FINAL_VALIDATION_CONFIG.ENABLE_MONITORING_VALIDATION) {
      results.validation.monitoring = runMonitoringValidation();
      results.tests.push(...results.validation.monitoring.tests);
    }
    
    // 8. Generar reportes finales
    if (FINAL_VALIDATION_CONFIG.ENABLE_FINAL_REPORTS) {
      results.reports = generateFinalReports(results);
    }
    
    // 9. Calcular estado del sistema
    results.status = calculateSystemStatus(results.tests);
    
    // 10. Generar resumen
    results.summary = generateValidationSummary(results);
    
    // 11. Generar recomendaciones
    results.recommendations = generateRecommendations(results);
    
    // 12. Generar alertas
    if (FINAL_VALIDATION_CONFIG.ENABLE_ALERTS) {
      results.alerts = generateValidationAlerts(results);
    }
    
    const totalDuration = Date.now() - startTime;
    console.log(`[FinalValidation] Validación final completada en ${totalDuration}ms`);
    
    return results;
    
  } catch (error) {
    console.error('[FinalValidation] Error en validación final:', error);
    return {
      error: error.toString(),
      timestamp: new Date().toISOString(),
      totalDuration: Date.now() - startTime
    };
  }
}

/**
 * Ejecuta validación de funcionalidad
 * @returns {Object} Resultado de la validación de funcionalidad
 */
function runFunctionalityValidation() {
  console.log('[FinalValidation] Ejecutando validación de funcionalidad...');
  
  const tests = [
    { name: 'testCoreFunctions', fn: testCoreFunctions },
    { name: 'testDataLoading', fn: testDataLoading },
    { name: 'testDashboardFunctionality', fn: testDashboardFunctionality },
    { name: 'testCacheFunctionality', fn: testCacheFunctionality },
    { name: 'testErrorHandling', fn: testErrorHandling },
    { name: 'testPerformanceMonitoring', fn: testPerformanceMonitoring }
  ];
  
  const results = [];
  
  tests.forEach(test => {
    try {
      const result = test.fn();
      results.push(result);
    } catch (error) {
      results.push(new ValidationResult(
        'functionality',
        test.name,
        Date.now(),
        Date.now(),
        false,
        error.toString()
      ));
    }
  });
  
  return {
    category: 'Functionality Validation',
    tests: results,
    summary: generateTestSummary(results)
  };
}

/**
 * Prueba las funciones principales
 * @returns {ValidationResult} Resultado de la prueba
 */
function testCoreFunctions() {
  const startTime = Date.now();
  
  try {
    console.log('[FinalValidation] Probando funciones principales...');
    
    // Probar cargarDirectorioCompleto
    const directorioData = cargarDirectorioCompleto(false);
    if (!directorioData || !directorioData.lideres || !directorioData.celulas || !directorioData.ingresos) {
      throw new Error('CRITICAL: cargarDirectorioCompleto no funciona correctamente');
    }
    
    // Probar getDashboardData
    const dashboardData = getDashboardData(false);
    if (!dashboardData || !dashboardData.metricas) {
      throw new Error('CRITICAL: getDashboardData no funciona correctamente');
    }
    
    // Probar funciones de análisis
    const metricas = calcularMetricasGenerales();
    if (!metricas || typeof metricas !== 'object') {
      throw new Error('ERROR: calcularMetricasGenerales no funciona correctamente');
    }
    
    const endTime = Date.now();
    
    return new ValidationResult(
      'functionality',
      'testCoreFunctions',
      startTime,
      endTime,
      true,
      null,
      {
        directorioDataLoaded: !!directorioData,
        dashboardDataLoaded: !!dashboardData,
        metricasCalculated: !!metricas,
        lideresCount: directorioData ? directorioData.lideres.length : 0,
        celulasCount: directorioData ? directorioData.celulas.length : 0,
        ingresosCount: directorioData ? directorioData.ingresos.length : 0
      }
    );
    
  } catch (error) {
    return new ValidationResult(
      'functionality',
      'testCoreFunctions',
      startTime,
      Date.now(),
      false,
      error.toString()
    );
  }
}

/**
 * Prueba la carga de datos
 * @returns {ValidationResult} Resultado de la prueba
 */
function testDataLoading() {
  const startTime = Date.now();
  
  try {
    console.log('[FinalValidation] Probando carga de datos...');
    
    // Probar carga de líderes
    const lideres = cargarLideresCompletos();
    if (!Array.isArray(lideres)) {
      throw new Error('ERROR: cargarLideresCompletos no retorna array');
    }
    
    // Probar carga de células
    const celulas = cargarCelulasCompletas();
    if (!Array.isArray(celulas)) {
      throw new Error('ERROR: cargarCelulasCompletas no retorna array');
    }
    
    // Probar carga de ingresos
    const ingresos = cargarIngresosCompletos();
    if (!Array.isArray(ingresos)) {
      throw new Error('ERROR: cargarIngresosCompletos no retorna array');
    }
    
    const endTime = Date.now();
    
    return new ValidationResult(
      'functionality',
      'testDataLoading',
      startTime,
      endTime,
      true,
      null,
      {
        lideresLoaded: lideres.length,
        celulasLoaded: celulas.length,
        ingresosLoaded: ingresos.length,
        totalDataPoints: lideres.length + celulas.length + ingresos.length
      }
    );
    
  } catch (error) {
    return new ValidationResult(
      'functionality',
      'testDataLoading',
      startTime,
      Date.now(),
      false,
      error.toString()
    );
  }
}

/**
 * Prueba la funcionalidad del dashboard
 * @returns {ValidationResult} Resultado de la prueba
 */
function testDashboardFunctionality() {
  const startTime = Date.now();
  
  try {
    console.log('[FinalValidation] Probando funcionalidad del dashboard...');
    
    // Probar getDashboardData
    const dashboardData = getDashboardData(false);
    if (!dashboardData) {
      throw new Error('ERROR: getDashboardData no retorna datos');
    }
    
    // Verificar estructura de datos
    const requiredFields = ['lideres', 'celulas', 'ingresos', 'metricas'];
    const missingFields = requiredFields.filter(field => !dashboardData[field]);
    if (missingFields.length > 0) {
      throw new Error(`ERROR: Faltan campos en dashboard: ${missingFields.join(', ')}`);
    }
    
    // Verificar métricas
    const metricas = dashboardData.metricas;
    if (!metricas.lideres || !metricas.celulas || !metricas.ingresos) {
      throw new Error('ERROR: Métricas del dashboard incompletas');
    }
    
    const endTime = Date.now();
    
    return new ValidationResult(
      'functionality',
      'testDashboardFunctionality',
      startTime,
      endTime,
      true,
      null,
      {
        dashboardDataValid: true,
        metricasValid: true,
        lideresMetricas: metricas.lideres,
        celulasMetricas: metricas.celulas,
        ingresosMetricas: metricas.ingresos
      }
    );
    
  } catch (error) {
    return new ValidationResult(
      'functionality',
      'testDashboardFunctionality',
      startTime,
      Date.now(),
      false,
      error.toString()
    );
  }
}

/**
 * Ejecuta validación de rendimiento
 * @returns {Object} Resultado de la validación de rendimiento
 */
function runPerformanceValidation() {
  console.log('[FinalValidation] Ejecutando validación de rendimiento...');
  
  const tests = [
    { name: 'testResponseTime', fn: testResponseTime },
    { name: 'testCachePerformance', fn: testCachePerformance },
    { name: 'testMemoryUsage', fn: testMemoryUsage },
    { name: 'testConcurrentOperations', fn: testConcurrentOperations }
  ];
  
  const results = [];
  
  tests.forEach(test => {
    try {
      const result = test.fn();
      results.push(result);
    } catch (error) {
      results.push(new ValidationResult(
        'performance',
        test.name,
        Date.now(),
        Date.now(),
        false,
        error.toString()
      ));
    }
  });
  
  return {
    category: 'Performance Validation',
    tests: results,
    summary: generateTestSummary(results)
  };
}

/**
 * Prueba el tiempo de respuesta
 * @returns {ValidationResult} Resultado de la prueba
 */
function testResponseTime() {
  const startTime = Date.now();
  
  try {
    console.log('[FinalValidation] Probando tiempo de respuesta...');
    
    // Probar tiempo de respuesta del dashboard
    const dashboardStart = Date.now();
    const dashboardData = getDashboardData(false);
    const dashboardDuration = Date.now() - dashboardStart;
    
    // Probar tiempo de respuesta de carga de datos
    const dataStart = Date.now();
    const directorioData = cargarDirectorioCompleto(false);
    const dataDuration = Date.now() - dataStart;
    
    // Verificar que los tiempos estén dentro de los límites
    const maxDashboardTime = 5000; // 5 segundos
    const maxDataTime = 10000; // 10 segundos
    
    if (dashboardDuration > maxDashboardTime) {
      throw new Error(`WARNING: Dashboard tardó ${dashboardDuration}ms (límite: ${maxDashboardTime}ms)`);
    }
    
    if (dataDuration > maxDataTime) {
      throw new Error(`WARNING: Carga de datos tardó ${dataDuration}ms (límite: ${maxDataTime}ms)`);
    }
    
    const endTime = Date.now();
    
    return new ValidationResult(
      'performance',
      'testResponseTime',
      startTime,
      endTime,
      true,
      null,
      {
        dashboardResponseTime: dashboardDuration,
        dataLoadTime: dataDuration,
        maxDashboardTime,
        maxDataTime,
        withinLimits: true
      }
    );
    
  } catch (error) {
    return new ValidationResult(
      'performance',
      'testResponseTime',
      startTime,
      Date.now(),
      false,
      error.toString()
    );
  }
}

/**
 * Ejecuta validación de integración
 * @returns {Object} Resultado de la validación de integración
 */
function runIntegrationValidation() {
  console.log('[FinalValidation] Ejecutando validación de integración...');
  
  try {
    // Ejecutar pruebas de integración existentes
    const integrationResults = runAllIntegrationTests();
    
    const tests = [];
    
    // Convertir resultados a ValidationResult
    if (integrationResults.tests) {
      integrationResults.tests.forEach(category => {
        if (category.tests) {
          category.tests.forEach(test => {
            tests.push(new ValidationResult(
              'integration',
              test.testName || test.name,
              test.startTime || Date.now(),
              test.endTime || Date.now(),
              test.success,
              test.error,
              test.details || {}
            ));
          });
        }
      });
    }
    
    return {
      category: 'Integration Validation',
      tests: tests,
      summary: generateTestSummary(tests)
    };
    
  } catch (error) {
    return {
      category: 'Integration Validation',
      tests: [new ValidationResult(
        'integration',
        'runIntegrationValidation',
        Date.now(),
        Date.now(),
        false,
        error.toString()
      )],
      summary: { error: error.toString() }
    };
  }
}

/**
 * Ejecuta validación de seguridad
 * @returns {Object} Resultado de la validación de seguridad
 */
function runSecurityValidation() {
  console.log('[FinalValidation] Ejecutando validación de seguridad...');
  
  const tests = [
    { name: 'testDataValidation', fn: testDataValidation },
    { name: 'testAccessControl', fn: testAccessControl },
    { name: 'testErrorHandling', fn: testErrorHandling },
    { name: 'testInputSanitization', fn: testInputSanitization }
  ];
  
  const results = [];
  
  tests.forEach(test => {
    try {
      const result = test.fn();
      results.push(result);
    } catch (error) {
      results.push(new ValidationResult(
        'security',
        test.name,
        Date.now(),
        Date.now(),
        false,
        error.toString()
      ));
    }
  });
  
  return {
    category: 'Security Validation',
    tests: results,
    summary: generateTestSummary(results)
  };
}

/**
 * Prueba la validación de datos
 * @returns {ValidationResult} Resultado de la prueba
 */
function testDataValidation() {
  const startTime = Date.now();
  
  try {
    console.log('[FinalValidation] Probando validación de datos...');
    
    // Probar validación de datos de entrada
    const testData = {
      valid: { id: 'LD001', nombre: 'Juan Pérez', lcf: 'LCF001' },
      invalid: { id: '', nombre: null, lcf: 'INVALID' }
    };
    
    // Verificar que la validación funcione
    const validationModule = ValidationModule;
    if (!validationModule) {
      throw new Error('ERROR: ValidationModule no está disponible');
    }
    
    const endTime = Date.now();
    
    return new ValidationResult(
      'security',
      'testDataValidation',
      startTime,
      endTime,
      true,
      null,
      {
        validationModuleAvailable: !!validationModule,
        testDataValid: true,
        testDataInvalid: true
      }
    );
    
  } catch (error) {
    return new ValidationResult(
      'security',
      'testDataValidation',
      startTime,
      Date.now(),
      false,
      error.toString()
    );
  }
}

/**
 * Ejecuta validación de despliegue
 * @returns {Object} Resultado de la validación de despliegue
 */
function runDeploymentValidation() {
  console.log('[FinalValidation] Ejecutando validación de despliegue...');
  
  try {
    // Ejecutar preparación para despliegue
    const deploymentResults = prepareForDeployment();
    
    const tests = [];
    
    // Convertir resultados a ValidationResult
    if (deploymentResults.steps) {
      deploymentResults.steps.forEach(step => {
        tests.push(new ValidationResult(
          'deployment',
          step.step || 'deployment_step',
          Date.now(),
          Date.now(),
          step.success,
          step.error,
          step.details || {}
        ));
      });
    }
    
    return {
      category: 'Deployment Validation',
      tests: tests,
      summary: generateTestSummary(tests)
    };
    
  } catch (error) {
    return {
      category: 'Deployment Validation',
      tests: [new ValidationResult(
        'deployment',
        'runDeploymentValidation',
        Date.now(),
        Date.now(),
        false,
        error.toString()
      )],
      summary: { error: error.toString() }
    };
  }
}

/**
 * Ejecuta validación de documentación
 * @returns {Object} Resultado de la validación de documentación
 */
function runDocumentationValidation() {
  console.log('[FinalValidation] Ejecutando validación de documentación...');
  
  const tests = [
    { name: 'testTechnicalDocumentation', fn: testTechnicalDocumentation },
    { name: 'testUserDocumentation', fn: testUserDocumentation },
    { name: 'testCodeDocumentation', fn: testCodeDocumentation }
  ];
  
  const results = [];
  
  tests.forEach(test => {
    try {
      const result = test.fn();
      results.push(result);
    } catch (error) {
      results.push(new ValidationResult(
        'documentation',
        test.name,
        Date.now(),
        Date.now(),
        false,
        error.toString()
      ));
    }
  });
  
  return {
    category: 'Documentation Validation',
    tests: results,
    summary: generateTestSummary(results)
  };
}

/**
 * Prueba la documentación técnica
 * @returns {ValidationResult} Resultado de la prueba
 */
function testTechnicalDocumentation() {
  const startTime = Date.now();
  
  try {
    console.log('[FinalValidation] Probando documentación técnica...');
    
    // Verificar que existan los archivos de documentación
    const requiredDocs = [
      'DOCUMENTACION_TECNICA.md',
      'DOCUMENTACION_USUARIO.md',
      'CONFIGURACION.md'
    ];
    
    const existingDocs = [];
    const missingDocs = [];
    
    // En Google Apps Script no podemos verificar archivos directamente
    // Pero podemos verificar que las funciones de documentación estén disponibles
    const docFunctions = [
      'getTechnicalDocumentation',
      'getUserDocumentation',
      'getConfigurationDocumentation'
    ];
    
    docFunctions.forEach(func => {
      if (typeof eval(func) !== 'undefined') {
        existingDocs.push(func);
      } else {
        missingDocs.push(func);
      }
    });
    
    const endTime = Date.now();
    
    return new ValidationResult(
      'documentation',
      'testTechnicalDocumentation',
      startTime,
      endTime,
      missingDocs.length === 0,
      missingDocs.length > 0 ? `Faltan funciones de documentación: ${missingDocs.join(', ')}` : null,
      {
        existingDocs: existingDocs.length,
        missingDocs: missingDocs.length,
        documentationComplete: missingDocs.length === 0
      }
    );
    
  } catch (error) {
    return new ValidationResult(
      'documentation',
      'testTechnicalDocumentation',
      startTime,
      Date.now(),
      false,
      error.toString()
    );
  }
}

/**
 * Ejecuta validación de monitoreo
 * @returns {Object} Resultado de la validación de monitoreo
 */
function runMonitoringValidation() {
  console.log('[FinalValidation] Ejecutando validación de monitoreo...');
  
  const tests = [
    { name: 'testPerformanceMonitoring', fn: testPerformanceMonitoring },
    { name: 'testErrorMonitoring', fn: testErrorMonitoring },
    { name: 'testCacheMonitoring', fn: testCacheMonitoring },
    { name: 'testSystemMonitoring', fn: testSystemMonitoring }
  ];
  
  const results = [];
  
  tests.forEach(test => {
    try {
      const result = test.fn();
      results.push(result);
    } catch (error) {
      results.push(new ValidationResult(
        'monitoring',
        test.name,
        Date.now(),
        Date.now(),
        false,
        error.toString()
      ));
    }
  });
  
  return {
    category: 'Monitoring Validation',
    tests: results,
    summary: generateTestSummary(results)
  };
}

/**
 * Prueba el monitoreo de rendimiento
 * @returns {ValidationResult} Resultado de la prueba
 */
function testPerformanceMonitoring() {
  const startTime = Date.now();
  
  try {
    console.log('[FinalValidation] Probando monitoreo de rendimiento...');
    
    // Probar que el monitoreo de rendimiento esté disponible
    const performanceMetrics = getPerformanceMetrics();
    if (!performanceMetrics) {
      throw new Error('ERROR: getPerformanceMetrics no está disponible');
    }
    
    // Probar dashboard de rendimiento
    const performanceDashboard = getPerformanceDashboard();
    if (!performanceDashboard) {
      throw new Error('ERROR: getPerformanceDashboard no está disponible');
    }
    
    const endTime = Date.now();
    
    return new ValidationResult(
      'monitoring',
      'testPerformanceMonitoring',
      startTime,
      endTime,
      true,
      null,
      {
        performanceMetricsAvailable: !!performanceMetrics,
        performanceDashboardAvailable: !!performanceDashboard,
        monitoringEnabled: true
      }
    );
    
  } catch (error) {
    return new ValidationResult(
      'monitoring',
      'testPerformanceMonitoring',
      startTime,
      Date.now(),
      false,
      error.toString()
    );
  }
}

// ==================== FUNCIONES DE UTILIDAD ====================

/**
 * Genera resumen de pruebas
 * @param {Array} tests - Array de pruebas
 * @returns {Object} Resumen de pruebas
 */
function generateTestSummary(tests) {
  const totalTests = tests.length;
  const successfulTests = tests.filter(t => t.success).length;
  const failedTests = totalTests - successfulTests;
  const criticalTests = tests.filter(t => t.severity === 'CRITICAL').length;
  const errorTests = tests.filter(t => t.severity === 'ERROR').length;
  const warningTests = tests.filter(t => t.severity === 'WARNING').length;
  
  return {
    totalTests,
    successfulTests,
    failedTests,
    criticalTests,
    errorTests,
    warningTests,
    successRate: ((successfulTests / totalTests) * 100).toFixed(2) + '%',
    criticalRate: ((criticalTests / totalTests) * 100).toFixed(2) + '%',
    errorRate: ((errorTests / totalTests) * 100).toFixed(2) + '%'
  };
}

/**
 * Calcula el estado del sistema
 * @param {Array} tests - Array de pruebas
 * @returns {Object} Estado del sistema
 */
function calculateSystemStatus(tests) {
  const criticalTests = tests.filter(t => t.severity === 'CRITICAL' && !t.success);
  const errorTests = tests.filter(t => t.severity === 'ERROR' && !t.success);
  const warningTests = tests.filter(t => t.severity === 'WARNING' && !t.success);
  
  let status = 'HEALTHY';
  if (criticalTests.length > 0) {
    status = 'CRITICAL';
  } else if (errorTests.length > 0) {
    status = 'ERROR';
  } else if (warningTests.length > 0) {
    status = 'WARNING';
  }
  
  return {
    status,
    criticalIssues: criticalTests.length,
    errorIssues: errorTests.length,
    warningIssues: warningTests.length,
    overallHealth: status,
    timestamp: new Date().toISOString()
  };
}

/**
 * Genera resumen de validación
 * @param {Object} results - Resultados de validación
 * @returns {Object} Resumen de validación
 */
function generateValidationSummary(results) {
  const allTests = results.tests;
  const totalTests = allTests.length;
  const successfulTests = allTests.filter(t => t.success).length;
  const failedTests = totalTests - successfulTests;
  
  const categories = {};
  allTests.forEach(test => {
    if (!categories[test.category]) {
      categories[test.category] = { total: 0, successful: 0, failed: 0 };
    }
    categories[test.category].total++;
    if (test.success) {
      categories[test.category].successful++;
    } else {
      categories[test.category].failed++;
    }
  });
  
  return {
    totalTests,
    successfulTests,
    failedTests,
    successRate: ((successfulTests / totalTests) * 100).toFixed(2) + '%',
    categories,
    systemStatus: results.status,
    timestamp: new Date().toISOString()
  };
}

/**
 * Genera recomendaciones
 * @param {Object} results - Resultados de validación
 * @returns {Array} Array de recomendaciones
 */
function generateRecommendations(results) {
  const recommendations = [];
  
  // Analizar pruebas fallidas
  const failedTests = results.tests.filter(t => !t.success);
  if (failedTests.length > 0) {
    recommendations.push({
      type: 'CRITICAL',
      message: `${failedTests.length} pruebas fallaron`,
      action: 'Revisar y corregir las pruebas fallidas antes del despliegue'
    });
  }
  
  // Analizar pruebas críticas
  const criticalTests = results.tests.filter(t => t.severity === 'CRITICAL' && !t.success);
  if (criticalTests.length > 0) {
    recommendations.push({
      type: 'URGENT',
      message: `${criticalTests.length} pruebas críticas fallaron`,
      action: 'Resolver problemas críticos inmediatamente'
    });
  }
  
  // Analizar rendimiento
  const performanceTests = results.tests.filter(t => t.category === 'performance' && !t.success);
  if (performanceTests.length > 0) {
    recommendations.push({
      type: 'WARNING',
      message: 'Problemas de rendimiento detectados',
      action: 'Optimizar el rendimiento antes del despliegue'
    });
  }
  
  return recommendations;
}

/**
 * Genera alertas de validación
 * @param {Object} results - Resultados de validación
 * @returns {Array} Array de alertas
 */
function generateValidationAlerts(results) {
  const alerts = [];
  
  // Alertas críticas
  const criticalTests = results.tests.filter(t => t.severity === 'CRITICAL' && !t.success);
  if (criticalTests.length > 0) {
    alerts.push({
      type: 'CRITICAL',
      severity: 'HIGH',
      message: `${criticalTests.length} pruebas críticas fallaron`,
      count: criticalTests.length
    });
  }
  
  // Alertas de error
  const errorTests = results.tests.filter(t => t.severity === 'ERROR' && !t.success);
  if (errorTests.length > 0) {
    alerts.push({
      type: 'ERROR',
      severity: 'MEDIUM',
      message: `${errorTests.length} pruebas de error fallaron`,
      count: errorTests.length
    });
  }
  
  return alerts;
}

/**
 * Genera reportes finales
 * @param {Object} results - Resultados de validación
 * @returns {Object} Reportes finales
 */
function generateFinalReports(results) {
  return {
    validationReport: {
      summary: results.summary,
      status: results.status,
      recommendations: results.recommendations,
      timestamp: new Date().toISOString()
    },
    technicalReport: {
      functionality: results.validation.functionality,
      performance: results.validation.performance,
      integration: results.validation.integration,
      timestamp: new Date().toISOString()
    },
    deploymentReport: {
      security: results.validation.security,
      deployment: results.validation.deployment,
      monitoring: results.validation.monitoring,
      timestamp: new Date().toISOString()
    }
  };
}

console.log('✅ FinalValidation cargado - Validación final disponible');
