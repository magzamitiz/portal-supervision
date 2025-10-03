/**
 * @fileoverview Módulo unificado de validación del sistema.
 * Combina Validacion_Semana1 y Validacion_Semana2 en un solo módulo de pruebas.
 */

// ==================== CONFIGURACIÓN DE VALIDACIÓN ====================

const VALIDACION_CONFIG = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  MODULOS: [
    'UtilsModule',
    'DataModule',
    'CoreModule',
    'LideresModule',
    'CelulasModule', 
    'IngresosModule',
    'SeguimientoModule',
    'MetricasModule',
    // 'AlertasModule', // ✅ ELIMINADO: Módulo innecesario removido
    // 'AnalisisModule', // ✅ ELIMINADO: Módulo no existe
    'MainModule',
    'ActividadModule',
    'ExternalDataModule',
    'TimeoutModule',
    'CacheModule'
  ]
};

// ==================== FUNCIONES DE VALIDACIÓN GENERALES ====================

/**
 * Ejecuta todas las validaciones del sistema
 */
function runValidationTests() {
  console.log("🔍 INICIANDO VALIDACIÓN COMPLETA DEL SISTEMA");
  console.log("=" .repeat(70));
  
  const resultados = {
    timestamp: new Date().toISOString(),
    tests: [],
    modulos: {},
    compatibilidad: {},
    rendimiento: {},
    resumen: {
      total: 0,
      exitosos: 0,
      fallidos: 0,
      mejoras: []
    },
    errores: []
  };
  
  try {
    // Validaciones de módulos principales
    resultados.modulos.utils = validarModuloUtils();
    resultados.modulos.data = validarModuloData();
    resultados.modulos.core = validarModuloCore();
    resultados.modulos.lideres = validarModuloLideres();
    resultados.modulos.celulas = validarModuloCelulas();
    resultados.modulos.ingresos = validarModuloIngresos();
    resultados.modulos.seguimiento = validarModuloSeguimiento();
    resultados.modulos.metricas = validarModuloMetricas();
    // resultados.modulos.alertas = validarModuloAlertas(); // ✅ ELIMINADO: Validación innecesaria removida
    
    // Validaciones de compatibilidad
    resultados.compatibilidad = validarCompatibilidadAPI();
    
    // Validaciones de rendimiento
    resultados.rendimiento = validarRendimiento();
    
    // Tests específicos de funcionalidad
    resultados.tests.push(validarGetEstadisticasRapidas());
    resultados.tests.push(validarGetListaDeLideres());
    resultados.tests.push(validarCargarDirectorioCompleto());
    resultados.tests.push(validarGetVistaRapidaLCF());
    resultados.tests.push(validarSpreadsheetManager());
    
    // Calcular resumen
    resultados.resumen.total = Object.keys(resultados.modulos).length + resultados.tests.length;
    resultados.resumen.exitosos = Object.values(resultados.modulos).filter(m => m.exitoso).length + 
                                  resultados.tests.filter(t => t.exitoso).length;
    resultados.resumen.fallidos = resultados.resumen.total - resultados.resumen.exitosos;
    
    generarReporteValidacion(resultados);
    
  } catch (error) {
    console.error("❌ Error general en la validación:", error);
    resultados.errores.push(`Error general: ${error.message}`);
  }
  
  console.log("--- Validación Completa del Sistema Completada ---");
  return resultados;
}

/**
 * Valida el módulo de utilidades (UtilsModule)
 */
function validarModuloUtils() {
  console.log('[ValidationModule] Validando UtilsModule...');
  
  const resultado = {
    nombre: 'UtilsModule',
    exitoso: true,
    funciones: [],
    errores: []
  };
  
  try {
    // Validar funciones principales
    resultado.funciones.push(validarFuncion('findCol', typeof findCol === 'function'));
    resultado.funciones.push(validarFuncion('normalizeYesNo', typeof normalizeYesNo === 'function'));
    resultado.funciones.push(validarFuncion('determinarPrioridad', typeof determinarPrioridad === 'function'));
    resultado.funciones.push(validarFuncion('mapearAlmasACelulas', typeof mapearAlmasACelulas === 'function'));
    resultado.funciones.push(validarFuncion('integrarAlmasACelulas', typeof integrarAlmasACelulas === 'function'));
    resultado.funciones.push(validarFuncion('calcularActividadLideres', typeof calcularActividadLideres === 'function'));
    
    // Validar funciones de caché
    resultado.funciones.push(validarFuncion('getCacheData', typeof getCacheData === 'function'));
    resultado.funciones.push(validarFuncion('setCacheData', typeof setCacheData === 'function'));
    resultado.funciones.push(validarFuncion('clearCache', typeof clearCache === 'function'));
    
    // Validar funciones de timeout
    resultado.funciones.push(validarFuncion('checkTimeout', typeof checkTimeout === 'function'));
    
    resultado.exitoso = resultado.funciones.every(f => f.exitoso);
    
  } catch (error) {
    resultado.exitoso = false;
    resultado.errores.push(error.message);
  }
  
  return resultado;
}

/**
 * Valida el módulo de datos (DataModule)
 */
function validarModuloData() {
  console.log('[ValidationModule] Validando DataModule...');
  
  const resultado = {
    nombre: 'DataModule',
    exitoso: true,
    funciones: [],
    errores: []
  };
  
  try {
    resultado.funciones.push(validarFuncion('cargarHojaLideres', typeof cargarHojaLideres === 'function'));
    resultado.funciones.push(validarFuncion('cargarHojaCelulas', typeof cargarHojaCelulas === 'function'));
    resultado.funciones.push(validarFuncion('cargarHojaIngresos', typeof cargarHojaIngresos === 'function'));
    resultado.funciones.push(validarFuncion('cargarLideresOptimizado', typeof cargarLideresOptimizado === 'function'));
    resultado.funciones.push(validarFuncion('cargarCelulasOptimizado', typeof cargarCelulasOptimizado === 'function'));
    resultado.funciones.push(validarFuncion('cargarIngresosOptimizado', typeof cargarIngresosOptimizado === 'function'));
    
    resultado.exitoso = resultado.funciones.every(f => f.exitoso);
    
  } catch (error) {
    resultado.exitoso = false;
    resultado.errores.push(error.message);
  }
  
  return resultado;
}

/**
 * Valida el módulo core (CoreModule)
 */
function validarModuloCore() {
  console.log('[ValidationModule] Validando CoreModule...');
  
  const resultado = {
    nombre: 'CoreModule',
    exitoso: true,
    funciones: [],
    errores: []
  };
  
  try {
    resultado.funciones.push(validarFuncion('construirEstructuraLD', typeof construirEstructuraLD === 'function'));
    resultado.funciones.push(validarFuncion('construirEstructuraCompleta', typeof construirEstructuraCompleta === 'function'));
    resultado.funciones.push(validarFuncion('calcularMetricasRealesLD', typeof calcularMetricasRealesLD === 'function'));
    resultado.funciones.push(validarFuncion('cargarDirectorioCompleto', typeof cargarDirectorioCompleto === 'function'));
    resultado.funciones.push(validarFuncion('getListaDeLideres', typeof getListaDeLideres === 'function'));
    resultado.funciones.push(validarFuncion('getIngresosData', typeof getIngresosData === 'function'));
    resultado.funciones.push(validarFuncion('getDatosLD', typeof getDatosLD === 'function'));
    resultado.funciones.push(validarFuncion('darDeBajaAlmasEnLote', typeof darDeBajaAlmasEnLote === 'function'));
    
    resultado.exitoso = resultado.funciones.every(f => f.exitoso);
    
  } catch (error) {
    resultado.exitoso = false;
    resultado.errores.push(error.message);
  }
  
  return resultado;
}

/**
 * Valida el módulo de líderes
 */
function validarModuloLideres() {
  console.log('[ValidationModule] Validando LideresModule...');
  
  const resultado = {
    nombre: 'LideresModule',
    exitoso: true,
    funciones: [],
    errores: []
  };
  
  try {
    resultado.funciones.push(validarFuncion('cargarHojaLideres', typeof cargarHojaLideres === 'function'));
    resultado.funciones.push(validarFuncion('cargarLideresOptimizado', typeof cargarLideresOptimizado === 'function'));
    resultado.funciones.push(validarFuncion('cargarLideresPorRol', typeof cargarLideresPorRol === 'function'));
    
    resultado.exitoso = resultado.funciones.every(f => f.exitoso);
    
  } catch (error) {
    resultado.exitoso = false;
    resultado.errores.push(error.message);
  }
  
  return resultado;
}

/**
 * Valida el módulo de células
 */
function validarModuloCelulas() {
  console.log('[ValidationModule] Validando CelulasModule...');
  
  const resultado = {
    nombre: 'CelulasModule',
    exitoso: true,
    funciones: [],
    errores: []
  };
  
  try {
    resultado.funciones.push(validarFuncion('cargarHojaCelulas', typeof cargarHojaCelulas === 'function'));
    resultado.funciones.push(validarFuncion('cargarCelulasOptimizado', typeof cargarCelulasOptimizado === 'function'));
    resultado.funciones.push(validarFuncion('cargarCelulasPorLCF', typeof cargarCelulasPorLCF === 'function'));
    
    resultado.exitoso = resultado.funciones.every(f => f.exitoso);
    
  } catch (error) {
    resultado.exitoso = false;
    resultado.errores.push(error.message);
  }
  
  return resultado;
}

/**
 * Valida el módulo de ingresos
 */
function validarModuloIngresos() {
  console.log('[ValidationModule] Validando IngresosModule...');
  
  const resultado = {
    nombre: 'IngresosModule',
    exitoso: true,
    funciones: [],
    errores: []
  };
  
  try {
    resultado.funciones.push(validarFuncion('cargarHojaIngresos', typeof cargarHojaIngresos === 'function'));
    resultado.funciones.push(validarFuncion('cargarIngresosOptimizado', typeof cargarIngresosOptimizado === 'function'));
    resultado.funciones.push(validarFuncion('cargarIngresosPorLCF', typeof cargarIngresosPorLCF === 'function'));
    
    resultado.exitoso = resultado.funciones.every(f => f.exitoso);
    
  } catch (error) {
    resultado.exitoso = false;
    resultado.errores.push(error.message);
  }
  
  return resultado;
}

/**
 * Valida el módulo de seguimiento
 */
function validarModuloSeguimiento() {
  console.log('[ValidationModule] Validando SeguimientoModule...');
  
  const resultado = {
    nombre: 'SeguimientoModule',
    exitoso: true,
    funciones: [],
    errores: []
  };
  
  try {
    resultado.funciones.push(validarFuncion('getSeguimientoAlmasLCF', typeof getSeguimientoAlmasLCF === 'function'));
    resultado.funciones.push(validarFuncion('getVistaRapidaLCF', typeof getVistaRapidaLCF === 'function'));
    resultado.funciones.push(validarFuncion('getSeguimientoAlmasLCF_REAL', typeof getSeguimientoAlmasLCF_REAL === 'function'));
    resultado.funciones.push(validarFuncion('getVistaRapidaLCF_REAL', typeof getVistaRapidaLCF_REAL === 'function'));
    
    resultado.exitoso = resultado.funciones.every(f => f.exitoso);
    
  } catch (error) {
    resultado.exitoso = false;
    resultado.errores.push(error.message);
  }
  
  return resultado;
}

/**
 * Valida el módulo de métricas
 */
function validarModuloMetricas() {
  console.log('[ValidationModule] Validando MetricasModule...');
  
  const resultado = {
    nombre: 'MetricasModule',
    exitoso: true,
    funciones: [],
    errores: []
  };
  
  try {
    resultado.funciones.push(validarFuncion('getEstadisticasRapidas', typeof getEstadisticasRapidas === 'function'));
    
    resultado.exitoso = resultado.funciones.every(f => f.exitoso);
    
  } catch (error) {
    resultado.exitoso = false;
    resultado.errores.push(error.message);
  }
  
  return resultado;
}

// ✅ ALERTAS ELIMINADAS: Validación de AlertasModule innecesaria removida para mejorar rendimiento

// ==================== VALIDACIONES DE COMPATIBILIDAD ====================

/**
 * Valida la compatibilidad de la API
 */
function validarCompatibilidadAPI() {
  console.log('[ValidationModule] Validando compatibilidad de API...');
  
  const resultado = {
    exitoso: true,
    tests: [],
    errores: []
  };
  
  try {
    // Test 1: Verificar que las funciones principales existan
    resultado.tests.push(validarFuncion('getEstadisticasRapidas', typeof getEstadisticasRapidas === 'function'));
    resultado.tests.push(validarFuncion('getListaDeLideres', typeof getListaDeLideres === 'function'));
    resultado.tests.push(validarFuncion('cargarDirectorioCompleto', typeof cargarDirectorioCompleto === 'function'));
    resultado.tests.push(validarFuncion('getVistaRapidaLCF', typeof getVistaRapidaLCF === 'function'));
    resultado.tests.push(validarFuncion('getSeguimientoAlmasLCF', typeof getSeguimientoAlmasLCF === 'function'));
    
    resultado.exitoso = resultado.tests.every(t => t.exitoso);
    
  } catch (error) {
    resultado.exitoso = false;
    resultado.errores.push(error.message);
  }
  
  return resultado;
}

// ==================== VALIDACIONES DE RENDIMIENTO ====================

/**
 * Valida el rendimiento del sistema
 */
function validarRendimiento() {
  console.log('[ValidationModule] Validando rendimiento...');
  
  const resultado = {
    exitoso: true,
    tests: [],
    errores: []
  };
  
  try {
    // Test 1: Tiempo de carga de directorio completo
    const startTime = Date.now();
    const directorio = cargarDirectorioCompleto();
    const endTime = Date.now();
    const tiempoCarga = endTime - startTime;
    
    resultado.tests.push({
      nombre: 'Tiempo de carga directorio completo',
      exitoso: tiempoCarga < 10000, // Menos de 10 segundos
      tiempo: tiempoCarga,
      detalle: `${tiempoCarga}ms`
    });
    
    // Test 2: Tiempo de estadísticas rápidas
    const startTime2 = Date.now();
    const estadisticas = getEstadisticasRapidas();
    const endTime2 = Date.now();
    const tiempoEstadisticas = endTime2 - startTime2;
    
    resultado.tests.push({
      nombre: 'Tiempo de estadísticas rápidas',
      exitoso: tiempoEstadisticas < 5000, // Menos de 5 segundos
      tiempo: tiempoEstadisticas,
      detalle: `${tiempoEstadisticas}ms`
    });
    
    resultado.exitoso = resultado.tests.every(t => t.exitoso);
    
  } catch (error) {
    resultado.exitoso = false;
    resultado.errores.push(error.message);
  }
  
  return resultado;
}

// ==================== TESTS ESPECÍFICOS DE FUNCIONALIDAD ====================

/**
 * Valida la función getEstadisticasRapidas
 */
function validarGetEstadisticasRapidas() {
  const startTime = Date.now();
  let exitoso = true;
  let error = null;
  let resultado = null;

  try {
    resultado = getEstadisticasRapidas();
    if (!resultado.success || !resultado.data || !resultado.data.lideres) {
      throw new Error("Estructura de datos inválida.");
    }
  } catch (e) {
    exitoso = false;
    error = e.message;
  }
  
  const endTime = Date.now();
  return {
    nombre: "getEstadisticasRapidas",
    exitoso: exitoso,
    tiempo: endTime - startTime,
    error: error,
    resultado: resultado
  };
}

/**
 * Valida la función getListaDeLideres
 */
function validarGetListaDeLideres() {
  const startTime = Date.now();
  let exitoso = true;
  let error = null;
  let resultado = null;

  try {
    resultado = getListaDeLideres();
    if (!resultado.success || !Array.isArray(resultado.data)) {
      throw new Error("Estructura de datos inválida.");
    }
  } catch (e) {
    exitoso = false;
    error = e.message;
  }
  
  const endTime = Date.now();
  return {
    nombre: "getListaDeLideres",
    exitoso: exitoso,
    tiempo: endTime - startTime,
    error: error,
    resultado: resultado
  };
}

/**
 * Valida la función cargarDirectorioCompleto
 */
function validarCargarDirectorioCompleto() {
  const startTime = Date.now();
  let exitoso = true;
  let error = null;
  let resultado = null;

  try {
    resultado = cargarDirectorioCompleto();
    if (!resultado.lideres || !resultado.celulas || !resultado.ingresos) {
      throw new Error("Estructura de datos inválida.");
    }
  } catch (e) {
    exitoso = false;
    error = e.message;
  }
  
  const endTime = Date.now();
  return {
    nombre: "cargarDirectorioCompleto",
    exitoso: exitoso,
    tiempo: endTime - startTime,
    error: error,
    resultado: resultado
  };
}

/**
 * Valida la función getVistaRapidaLCF
 */
function validarGetVistaRapidaLCF() {
  const startTime = Date.now();
  let exitoso = true;
  let error = null;
  let resultado = null;

  try {
    resultado = getVistaRapidaLCF("LCF001"); // ID de prueba
    if (!resultado || typeof resultado !== 'object') {
      throw new Error("Estructura de datos inválida.");
    }
  } catch (e) {
    exitoso = false;
    error = e.message;
  }
  
  const endTime = Date.now();
  return {
    nombre: "getVistaRapidaLCF",
    exitoso: exitoso,
    tiempo: endTime - startTime,
    error: error,
    resultado: resultado
  };
}

/**
 * Valida el SpreadsheetManager
 */
function validarSpreadsheetManager() {
  const startTime = Date.now();
  let exitoso = true;
  let error = null;
  let resultado = null;

  try {
    if (typeof SpreadsheetManager === 'undefined') {
      throw new Error("SpreadsheetManager no está definido.");
    }
    resultado = "SpreadsheetManager disponible";
  } catch (e) {
    exitoso = false;
    error = e.message;
  }
  
  const endTime = Date.now();
  return {
    nombre: "SpreadsheetManager",
    exitoso: exitoso,
    tiempo: endTime - startTime,
    error: error,
    resultado: resultado
  };
}

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Valida una función individual
 */
function validarFuncion(nombre, condicion) {
  return {
    nombre: nombre,
    exitoso: condicion,
    tiempo: 0,
    error: condicion ? null : `Función ${nombre} no encontrada`,
    resultado: condicion ? "Función encontrada" : "Función no encontrada"
  };
}

/**
 * Genera reporte de validación
 */
function generarReporteValidacion(resultados) {
  console.log("\n📊 REPORTE DE VALIDACIÓN COMPLETA");
  console.log("=" .repeat(70));
  console.log(`📅 Fecha: ${resultados.timestamp}`);
  console.log(`✅ Tests exitosos: ${resultados.resumen.exitosos}`);
  console.log(`❌ Tests fallidos: ${resultados.resumen.fallidos}`);
  console.log(`📈 Total de tests: ${resultados.resumen.total}`);
  console.log(`🎯 Tasa de éxito: ${((resultados.resumen.exitosos / resultados.resumen.total) * 100).toFixed(1)}%`);
  
  // Reporte de módulos
  console.log("\n📦 VALIDACIÓN DE MÓDULOS:");
  Object.values(resultados.modulos).forEach(modulo => {
    const status = modulo.exitoso ? '✅' : '❌';
    console.log(`${status} ${modulo.nombre}: ${modulo.funciones.length} funciones`);
    if (!modulo.exitoso && modulo.errores.length > 0) {
      modulo.errores.forEach(error => console.log(`   ⚠️ ${error}`));
    }
  });
  
  // Reporte de tests específicos
  console.log("\n🧪 TESTS ESPECÍFICOS:");
  resultados.tests.forEach(test => {
    const status = test.exitoso ? '✅' : '❌';
    console.log(`${status} ${test.nombre}: ${test.tiempo}ms`);
    if (!test.exitoso && test.error) {
      console.log(`   ⚠️ ${test.error}`);
    }
  });
  
  // Reporte de rendimiento
  if (resultados.rendimiento.tests) {
    console.log("\n⚡ RENDIMIENTO:");
    resultados.rendimiento.tests.forEach(test => {
      const status = test.exitoso ? '✅' : '❌';
      console.log(`${status} ${test.nombre}: ${test.tiempo}ms`);
    });
  }
  
  console.log("\n" + "=" .repeat(70));
  
  if (resultados.resumen.fallidos === 0) {
    console.log("🎉 ¡TODAS LAS VALIDACIONES PASARON EXITOSAMENTE!");
  } else {
    console.log("⚠️ ALGUNAS VALIDACIONES FALLARON - REVISAR ERRORES ARRIBA");
  }
}

console.log('✅ ValidationModule cargado - Sistema de validación unificado');
