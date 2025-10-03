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
    'CacheModule',
    'FinalOptimizations', // ✅ AGREGADO: Módulo de optimizaciones finales
    'ProductionMonitoring' // ✅ AGREGADO: Módulo de monitoreo de producción
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

// ==================== VALIDACIONES ESPECÍFICAS PARA NUEVAS FUNCIONES ====================

/**
 * Valida las funciones de actividad de líderes
 * @returns {Object} Resultado de la validación
 */
function validarFuncionesActividad() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    console.log('[ValidationModule] Validando funciones de actividad...');
    
    // Verificar que calcularActividadLideres existe
    if (typeof calcularActividadLideres === 'function') {
      verificaciones.push({
        item: 'calcularActividadLideres existe',
        success: true,
        tiempo: Date.now() - startTime
      });
      
      // Probar con datos de prueba
      try {
        const celulasPrueba = [
          { ID_Lider: 'LD-001', Estado: 'Activa', Miembros: [{ ID_Miembro: 'A001' }] },
          { ID_Lider: 'LD-001', Estado: 'Inactiva', Miembros: [] },
          { ID_Lider: 'LD-002', Estado: 'Activa', Miembros: [{ ID_Miembro: 'A002' }] }
        ];
        
        const actividad = calcularActividadLideres(celulasPrueba);
        
        verificaciones.push({
          item: 'calcularActividadLideres funciona',
          success: actividad instanceof Map && actividad.size > 0,
          valor: `${actividad.size} líderes procesados`,
          tiempo: Date.now() - startTime
        });
      } catch (error) {
        verificaciones.push({
          item: 'calcularActividadLideres funciona',
          success: false,
          error: error.toString(),
          tiempo: Date.now() - startTime
        });
      }
    } else {
      verificaciones.push({
        item: 'calcularActividadLideres existe',
        success: false,
        error: 'Función no encontrada',
        tiempo: Date.now() - startTime
      });
    }
    
    // Verificar que integrarActividadLideres existe
    if (typeof integrarActividadLideres === 'function') {
      verificaciones.push({
        item: 'integrarActividadLideres existe',
        success: true,
        tiempo: Date.now() - startTime
      });
      
      // Probar con datos de prueba
      try {
        const lideresPrueba = [
          { ID_Lider: 'LD-001', Nombre_Lider: 'Test LD 1' },
          { ID_Lider: 'LD-002', Nombre_Lider: 'Test LD 2' }
        ];
        const actividadMap = new Map();
        actividadMap.set('LD-001', { totalCelulas: 2, celulasActivas: 1 });
        
        const resultado = integrarActividadLideres(lideresPrueba, actividadMap);
        
        verificaciones.push({
          item: 'integrarActividadLideres funciona',
          success: Array.isArray(resultado) && resultado.length === 2,
          valor: `${resultado.length} líderes procesados`,
          tiempo: Date.now() - startTime
        });
      } catch (error) {
        verificaciones.push({
          item: 'integrarActividadLideres funciona',
          success: false,
          error: error.toString(),
          tiempo: Date.now() - startTime
        });
      }
    } else {
      verificaciones.push({
        item: 'integrarActividadLideres existe',
        success: false,
        error: 'Función no encontrada',
        tiempo: Date.now() - startTime
      });
    }
    
    const exitosos = verificaciones.filter(v => v.success).length;
    
    return {
      success: exitosos === verificaciones.length,
      nombre: 'Funciones de Actividad',
      verificaciones: verificaciones,
      exitosos: exitosos,
      total: verificaciones.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      success: false,
      nombre: 'Funciones de Actividad',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

/**
 * Valida las funciones de caché inteligente
 * @returns {Object} Resultado de la validación
 */
function validarCacheInteligente() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    console.log('[ValidationModule] Validando sistema de caché inteligente...');
    
    // Verificar que limpiarCacheInteligente existe
    if (typeof limpiarCacheInteligente === 'function') {
      verificaciones.push({
        item: 'limpiarCacheInteligente existe',
        success: true,
        tiempo: Date.now() - startTime
      });
      
      // Probar la función
      try {
        const resultado = limpiarCacheInteligente();
        
        verificaciones.push({
          item: 'limpiarCacheInteligente funciona',
          success: resultado.success === true,
          valor: `${resultado.cleanedCount || 0} elementos limpiados`,
          tiempo: Date.now() - startTime
        });
      } catch (error) {
        verificaciones.push({
          item: 'limpiarCacheInteligente funciona',
          success: false,
          error: error.toString(),
          tiempo: Date.now() - startTime
        });
      }
    } else {
      verificaciones.push({
        item: 'limpiarCacheInteligente existe',
        success: false,
        error: 'Función no encontrada',
        tiempo: Date.now() - startTime
      });
    }
    
    // Verificar que registrarClaveCache existe
    if (typeof registrarClaveCache === 'function') {
      verificaciones.push({
        item: 'registrarClaveCache existe',
        success: true,
        tiempo: Date.now() - startTime
      });
      
      // Probar la función
      try {
        registrarClaveCache('TEST_KEY_' + Date.now());
        
        verificaciones.push({
          item: 'registrarClaveCache funciona',
          success: true,
          valor: 'Clave registrada correctamente',
          tiempo: Date.now() - startTime
        });
      } catch (error) {
        verificaciones.push({
          item: 'registrarClaveCache funciona',
          success: false,
          error: error.toString(),
          tiempo: Date.now() - startTime
        });
      }
    } else {
      verificaciones.push({
        item: 'registrarClaveCache existe',
        success: false,
        error: 'Función no encontrada',
        tiempo: Date.now() - startTime
      });
    }
    
    // Verificar que getEstadoCacheDetallado existe
    if (typeof getEstadoCacheDetallado === 'function') {
      verificaciones.push({
        item: 'getEstadoCacheDetallado existe',
        success: true,
        tiempo: Date.now() - startTime
      });
      
      // Probar la función
      try {
        const estado = getEstadoCacheDetallado();
        
        verificaciones.push({
          item: 'getEstadoCacheDetallado funciona',
          success: estado.success === true,
          valor: `${estado.data?.totalKeys || 0} claves registradas`,
          tiempo: Date.now() - startTime
        });
      } catch (error) {
        verificaciones.push({
          item: 'getEstadoCacheDetallado funciona',
          success: false,
          error: error.toString(),
          tiempo: Date.now() - startTime
        });
      }
    } else {
      verificaciones.push({
        item: 'getEstadoCacheDetallado existe',
        success: false,
        error: 'Función no encontrada',
        tiempo: Date.now() - startTime
      });
    }
    
    const exitosos = verificaciones.filter(v => v.success).length;
    
    return {
      success: exitosos === verificaciones.length,
      nombre: 'Sistema de Caché Inteligente',
      verificaciones: verificaciones,
      exitosos: exitosos,
      total: verificaciones.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      success: false,
      nombre: 'Sistema de Caché Inteligente',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

/**
 * Valida las funciones de monitoreo de producción
 * @returns {Object} Resultado de la validación
 */
function validarMonitoreoProduccion() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    console.log('[ValidationModule] Validando monitoreo de producción...');
    
    // Verificar que ejecutarMonitoreoProduccion existe
    if (typeof ejecutarMonitoreoProduccion === 'function') {
      verificaciones.push({
        item: 'ejecutarMonitoreoProduccion existe',
        success: true,
        tiempo: Date.now() - startTime
      });
    } else {
      verificaciones.push({
        item: 'ejecutarMonitoreoProduccion existe',
        success: false,
        error: 'Función no encontrada',
        tiempo: Date.now() - startTime
      });
    }
    
    // Verificar que verificarEstadoCache existe (versión actualizada)
    if (typeof verificarEstadoCache === 'function') {
      verificaciones.push({
        item: 'verificarEstadoCache existe',
        success: true,
        tiempo: Date.now() - startTime
      });
      
      // Probar la función
      try {
        const estado = verificarEstadoCache();
        
        verificaciones.push({
          item: 'verificarEstadoCache funciona',
          success: estado.success !== undefined,
          valor: estado.nombre || 'Función ejecutada',
          tiempo: Date.now() - startTime
        });
      } catch (error) {
        verificaciones.push({
          item: 'verificarEstadoCache funciona',
          success: false,
          error: error.toString(),
          tiempo: Date.now() - startTime
        });
      }
    } else {
      verificaciones.push({
        item: 'verificarEstadoCache existe',
        success: false,
        error: 'Función no encontrada',
        tiempo: Date.now() - startTime
      });
    }
    
    // Verificar que generarReporteEstadoStakeholders existe
    if (typeof generarReporteEstadoStakeholders === 'function') {
      verificaciones.push({
        item: 'generarReporteEstadoStakeholders existe',
        success: true,
        tiempo: Date.now() - startTime
      });
    } else {
      verificaciones.push({
        item: 'generarReporteEstadoStakeholders existe',
        success: false,
        error: 'Función no encontrada',
        tiempo: Date.now() - startTime
      });
    }
    
    const exitosos = verificaciones.filter(v => v.success).length;
    
    return {
      success: exitosos === verificaciones.length,
      nombre: 'Monitoreo de Producción',
      verificaciones: verificaciones,
      exitosos: exitosos,
      total: verificaciones.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      success: false,
      nombre: 'Monitoreo de Producción',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

/**
 * Valida que las correcciones de processCelulasOptimized funcionan correctamente
 * @returns {Object} Resultado de la validación
 */
function validarCorreccionesActividadLideres() {
  const startTime = Date.now();
  const verificaciones = [];
  
  try {
    console.log('[ValidationModule] Validando correcciones de actividad de líderes...');
    
    // 1. Verificar que processCelulasOptimized incluye campos de líder
    console.log('   🔍 Probando processCelulasOptimized con datos de prueba...');
    
    // Crear datos de prueba que simulen la hoja de Google Sheets
    const datosPruebaCelulas = [
      ['ID Célula', 'Nombre Célula', 'ID Líder', 'Estado', 'Congregación', 'ID LCF', 'Nombre LCF', 'ID Miembro', 'Nombre Miembro'],
      ['C-001', 'Célula Test 1', 'LD-001', 'Activa', 'Norte', 'LCF-001', 'Test LCF 1', 'A-001', 'Alma Test 1'],
      ['C-002', 'Célula Test 2', 'LD-002', 'Inactiva', 'Sur', 'LCF-002', 'Test LCF 2', 'A-002', 'Alma Test 2'],
      ['C-003', 'Célula Test 3', 'LD-001', 'Activa', 'Norte', 'LCF-001', 'Test LCF 1', 'A-003', 'Alma Test 3']
    ];
    
    try {
      const celulasProcesadas = processCelulasOptimized(datosPruebaCelulas);
      
      // Verificar que se procesaron las células
      verificaciones.push({
        item: 'processCelulasOptimized procesa células',
        success: celulasProcesadas.length > 0,
        valor: `${celulasProcesadas.length} células procesadas`,
        tiempo: Date.now() - startTime
      });
      
      // Verificar que las células tienen campos de líder
      const primeraCelula = celulasProcesadas[0];
      const tieneIDLider = primeraCelula && primeraCelula.ID_Lider !== undefined;
      const tieneEstado = primeraCelula && primeraCelula.Estado !== undefined;
      const tieneCongregacion = primeraCelula && primeraCelula.Congregacion !== undefined;
      
      verificaciones.push({
        item: 'Células tienen ID_Lider',
        success: tieneIDLider,
        valor: tieneIDLider ? `ID: ${primeraCelula.ID_Lider}` : 'Campo faltante',
        tiempo: Date.now() - startTime
      });
      
      verificaciones.push({
        item: 'Células tienen Estado',
        success: tieneEstado,
        valor: tieneEstado ? `Estado: ${primeraCelula.Estado}` : 'Campo faltante',
        tiempo: Date.now() - startTime
      });
      
      verificaciones.push({
        item: 'Células tienen Congregacion',
        success: tieneCongregacion,
        valor: tieneCongregacion ? `Congregación: ${primeraCelula.Congregacion}` : 'Campo faltante',
        tiempo: Date.now() - startTime
      });
      
    } catch (error) {
      verificaciones.push({
        item: 'processCelulasOptimized funciona',
        success: false,
        error: error.toString(),
        tiempo: Date.now() - startTime
      });
    }
    
    // 2. Verificar que calcularActividadLideres funciona con los datos corregidos
    console.log('   🔍 Probando calcularActividadLideres con datos corregidos...');
    
    try {
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
      
      const actividadMap = calcularActividadLideres(celulasConLider);
      
      verificaciones.push({
        item: 'calcularActividadLideres genera mapa',
        success: actividadMap instanceof Map && actividadMap.size > 0,
        valor: `${actividadMap.size} líderes en el mapa`,
        tiempo: Date.now() - startTime
      });
      
      // Verificar métricas específicas
      if (actividadMap.has('LD-001')) {
        const actividadLD001 = actividadMap.get('LD-001');
        verificaciones.push({
          item: 'LD-001 tiene métricas correctas',
          success: actividadLD001.totalCelulas === 2 && actividadLD001.celulasActivas === 2,
          valor: `Total: ${actividadLD001.totalCelulas}, Activas: ${actividadLD001.celulasActivas}`,
          tiempo: Date.now() - startTime
        });
      }
      
      if (actividadMap.has('LD-002')) {
        const actividadLD002 = actividadMap.get('LD-002');
        verificaciones.push({
          item: 'LD-002 tiene métricas correctas',
          success: actividadLD002.totalCelulas === 1 && actividadLD002.celulasActivas === 0,
          valor: `Total: ${actividadLD002.totalCelulas}, Activas: ${actividadLD002.celulasActivas}`,
          tiempo: Date.now() - startTime
        });
      }
      
    } catch (error) {
      verificaciones.push({
        item: 'calcularActividadLideres funciona',
        success: false,
        error: error.toString(),
        tiempo: Date.now() - startTime
      });
    }
    
    // 3. Verificar integración completa
    console.log('   🔍 Probando integración completa...');
    
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
      
      const actividadMap = calcularActividadLideres(celulasConLider);
      const lideresConActividad = integrarActividadLideres(lideresPrueba, actividadMap);
      
      verificaciones.push({
        item: 'Integración completa funciona',
        success: lideresConActividad.length === 2 && lideresConActividad[0].actividad,
        valor: `${lideresConActividad.length} líderes con actividad integrada`,
        tiempo: Date.now() - startTime
      });
      
      // Verificar que los líderes tienen métricas de actividad
      const tieneMetricas = lideresConActividad.every(l => l.actividad && typeof l.actividad.totalCelulas === 'number');
      verificaciones.push({
        item: 'Líderes tienen métricas de actividad',
        success: tieneMetricas,
        valor: tieneMetricas ? 'Todos los líderes tienen métricas' : 'Faltan métricas',
        tiempo: Date.now() - startTime
      });
      
    } catch (error) {
      verificaciones.push({
        item: 'Integración completa funciona',
        success: false,
        error: error.toString(),
        tiempo: Date.now() - startTime
      });
    }
    
    const exitosos = verificaciones.filter(v => v.success).length;
    
    return {
      nombre: 'Correcciones de Actividad de Líderes',
      resultado: exitosos === verificaciones.length ? 'PASS' : 'FAIL',
      verificaciones: verificaciones,
      exitosos: exitosos,
      total: verificaciones.length,
      tiempo: Date.now() - startTime
    };
    
  } catch (error) {
    return {
      nombre: 'Correcciones de Actividad de Líderes',
      resultado: 'ERROR',
      error: error.toString(),
      tiempo: Date.now() - startTime
    };
  }
}

console.log('✅ ValidationModule cargado - Sistema de validación unificado + Nuevas funciones');
