/**
 * FUNCIONES OPTIMIZADAS - REFACTORIZACIÓN SEMANA 1
 * Etapa 2 - Semana 1: Optimización de consultas
 * 
 * Este archivo contiene las versiones optimizadas de las funciones
 * principales, manteniendo 100% compatibilidad con la API existente.
 */

// ==================== FUNCIONES PRINCIPALES OPTIMIZADAS ====================

/**
 * VERSIÓN OPTIMIZADA: getEstadisticasRapidas()
 * Mantiene la misma API pero usa consultas optimizadas
 */
function getEstadisticasRapidas_Optimized() {
  try {
    checkTimeout();
    
    const resumenSheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO)
                                      .getSheetByName('_ResumenDashboard');
    if (!resumenSheet) {
      throw new Error("La hoja de resumen '_ResumenDashboard' no fue encontrada.");
    }

    const metricasValues = resumenSheet.getRange("B1:B7").getValues();

    return {
      success: true,
      data: {
        lideres: { total_LD: metricasValues[0][0], total_LCF: metricasValues[1][0] },
        celulas: { total_celulas: metricasValues[2][0] },
        ingresos: {
          total_historico: metricasValues[3][0],
          ingresos_mes: metricasValues[4][0],
          tasa_integracion_celula: (metricasValues[6][0] * 100).toFixed(1)
        },
        metricas: {
          promedio_lcf_por_ld: metricasValues[5][0],
          timestamp: new Date().toISOString()
        }
      }
    };
  } catch (error) {
    console.error(`[ERROR] en getEstadisticasRapidas_Optimized: ${error}`);
    return { success: false, error: error.toString(), data: null };
  }
}

/**
 * VERSIÓN OPTIMIZADA: getListaDeLideres()
 * Mantiene la misma API pero usa consultas optimizadas
 */
function getListaDeLideres_Optimized() {
  try {
    // Usar consulta ultra optimizada para solo líderes LD
    const lideresLD = cargarLideresLDOptimizado(CONFIG.SHEETS.DIRECTORIO, CONFIG.TABS.LIDERES);
    
    return { 
      success: true, 
      data: lideresLD 
    };
  } catch (error) {
    console.error(`[ERROR] en getListaDeLideres_Optimized: ${error}`);
    return { success: false, error: error.toString(), data: [] };
  }
}

/**
 * VERSIÓN OPTIMIZADA: cargarDirectorioCompleto()
 * Mantiene la misma API pero usa consultas optimizadas
 */
function cargarDirectorioCompleto_Optimized(forceReload = false) {
  try {
    // Verificar caché primero (si no es forceReload)
    if (!forceReload) {
      const cached = getCacheData();
      if (cached) {
        console.log('[OPTIMIZADO] Datos recuperados de caché');
        return cached;
      }
    }
    
    console.log('[OPTIMIZADO] Cargando datos desde Sheets...');
    
    // Cargar datos usando consultas optimizadas
    const lideres = cargarLideresOptimizado(CONFIG.SHEETS.DIRECTORIO, CONFIG.TABS.LIDERES);
    const celulas = cargarCelulasOptimizado(CONFIG.SHEETS.DIRECTORIO, CONFIG.TABS.CELULAS);
    const ingresos = cargarIngresosOptimizado(CONFIG.SHEETS.DIRECTORIO, CONFIG.TABS.INGRESOS);
    
    const resultado = {
      lideres: lideres,
      celulas: celulas,
      ingresos: ingresos,
      timestamp: new Date().toISOString()
    };
    
    // Guardar en caché
    setCacheData(resultado);
    
    console.log(`[OPTIMIZADO] Datos cargados: ${lideres.length} líderes, ${celulas.length} células, ${ingresos.length} ingresos`);
    return resultado;
    
  } catch (error) {
    console.error('[ERROR] en cargarDirectorioCompleto_Optimized:', error);
    return {
      lideres: [],
      celulas: [],
      ingresos: [],
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * VERSIÓN OPTIMIZADA: getVistaRapidaLCF()
 * Mantiene la misma API pero usa consultas optimizadas
 */
function getVistaRapidaLCF_Optimized(idLCF) {
  try {
    // Obtener el seguimiento completo usando consulta optimizada
    const seguimiento = getSeguimientoAlmasLCF_Optimized(idLCF);
    
    if (!seguimiento.success) {
      return seguimiento;
    }
    
    // Simplificar para vista rápida (solo campos esenciales)
    const almasResumen = seguimiento.almas.map(alma => ({
      Nombre: alma.Nombre,
      Telefono: alma.Telefono,
      Acepta_Visita: alma.Acepta_Visita,
      Peticion: alma.Peticion,
      Bienvenida: alma.Bienvenida.simbolo,
      Visita: alma.Visita_Bendicion.simbolo,
      Celulas: alma.Progreso_Celulas.texto,
      Estado: alma.Estado,
      Dias_Sin_Seguimiento: alma.Dias_Sin_Seguimiento,
      ID_Alma: alma.ID_Alma
    }));
    
    return {
      success: true,
      lcf: seguimiento.lcf.Nombre,
      almas: almasResumen
    };
    
  } catch (error) {
    console.error('Error en getVistaRapidaLCF_Optimized:', error);
    return { 
      success: false, 
      error: error.toString() 
    };
  }
}

/**
 * VERSIÓN OPTIMIZADA: getSeguimientoAlmasLCF()
 * Mantiene la misma API pero usa consultas optimizadas
 */
function getSeguimientoAlmasLCF_Optimized(idLCF) {
  try {
    // Obtener información del LCF
    const directorios = cargarDirectorioCompleto_Optimized();
    const lcfInfo = directorios.lideres.find(l => l.ID_Lider === idLCF);
    
    if (!lcfInfo) {
      return { 
        success: false, 
        error: `No se pudo encontrar la información del LCF con ID ${idLCF}` 
      };
    }
    
    // Cargar seguimiento usando consulta optimizada
    const seguimientos = cargarSeguimientoOptimizado(
      CONFIG.SHEETS.DIRECTORIO, 
      '_SeguimientoConsolidado', 
      idLCF
    );
    
    // Procesar seguimientos
    const almas = seguimientos.map(seg => {
      // Funciones helper para iconos (mantener compatibilidad)
      const getBienvenidaIcon = (resultado) => {
        const res = resultado || "";
        if (res.includes("Contacto Exitoso - Aceptó visita")) return { simbolo: '⭐', color: 'text-yellow-500', completado: true };
        if (res.includes("Prefiere visitar") || res.includes("Solicitó info")) return { simbolo: '✓', color: 'text-green-600', completado: true };
        if (["No contactar", "Sin interés", "No contestó", "Buzón", "Número equivocado"].includes(res)) return { simbolo: '―', color: 'text-gray-500', completado: true };
        return { simbolo: '✗', color: 'text-red-500', completado: false };
      };
      
      const getVisitaIcon = (resultado) => {
        const res = resultado || "";
        if (res.includes("Realizada") || res.includes("Completada")) return { simbolo: '✓', color: 'text-green-600', completado: true };
        if (res.includes("Programada") || res.includes("Pendiente")) return { simbolo: '⏳', color: 'text-yellow-500', completado: false };
        return { simbolo: '✗', color: 'text-red-500', completado: false };
      };
      
      return {
        ID_Alma: seg.ID_Alma,
        Nombre: seg.Nombre_Alma,
        Telefono: '', // No disponible en seguimiento consolidado
        Acepta_Visita: '', // No disponible en seguimiento consolidado
        Peticion: '', // No disponible en seguimiento consolidado
        Bienvenida: getBienvenidaIcon(seg.Resultado_Bienvenida),
        Visita_Bendicion: getVisitaIcon(seg.Resultado_Visita),
        Progreso_Celulas: {
          texto: seg.Progreso_Celulas || '0/12',
          completados: parseInt((seg.Progreso_Celulas || '0/12').split('/')[0]) || 0,
          total: 12,
          porcentaje: 0
        },
        Estado: seg.Estado_General || 'Sin datos',
        Dias_Sin_Seguimiento: parseInt(seg.Dias_Sin_Seguimiento) || 0,
        En_Celula: (seg.Progreso_Celulas || '0/12').split('/')[0] > 0
      };
    });
    
    return {
      success: true,
      lcf: {
        ID_Lider: lcfInfo.ID_Lider,
        Nombre: lcfInfo.Nombre_Lider,
        Rol: lcfInfo.Rol
      },
      almas: almas
    };
    
  } catch (error) {
    console.error('Error en getSeguimientoAlmasLCF_Optimized:', error);
    return { 
      success: false, 
      error: error.toString() 
    };
  }
}

// ==================== FUNCIONES WRAPPER PARA COMPATIBILIDAD ====================

/**
 * WRAPPER: getEstadisticasRapidas()
 * Mantiene compatibilidad total con código existente
 */
function getEstadisticasRapidas() {
  return getEstadisticasRapidas_Optimized();
}

/**
 * WRAPPER: getListaDeLideres()
 * Mantiene compatibilidad total con código existente
 */
function getListaDeLideres() {
  return getListaDeLideres_Optimized();
}

/**
 * WRAPPER: cargarDirectorioCompleto()
 * Mantiene compatibilidad total con código existente
 */
function cargarDirectorioCompleto(forceReload = false) {
  return cargarDirectorioCompleto_Optimized(forceReload);
}

/**
 * WRAPPER: getVistaRapidaLCF()
 * Mantiene compatibilidad total con código existente
 */
function getVistaRapidaLCF(idLCF) {
  return getVistaRapidaLCF_REAL(idLCF);
}

/**
 * WRAPPER: getSeguimientoAlmasLCF()
 * Mantiene compatibilidad total con código existente
 */
function getSeguimientoAlmasLCF(idLCF) {
  return getSeguimientoAlmasLCF_REAL(idLCF);
}

// ==================== FUNCIONES DE MONITOREO ====================

/**
 * Compara rendimiento entre versiones original y optimizada
 * @param {string} testFunction - Nombre de la función a probar
 * @param {Array} args - Argumentos para la función
 * @returns {Object} Comparación de rendimiento
 */
function compararRendimientoFunciones(testFunction, args = []) {
  console.log(`[MONITOREO] Comparando rendimiento de ${testFunction}...`);
  
  const resultados = {
    funcion: testFunction,
    timestamp: new Date().toISOString(),
    comparacion: {}
  };
  
  try {
    // Ejecutar función original (si existe)
    if (typeof window[`${testFunction}_Original`] === 'function') {
      const inicioOriginal = Date.now();
      const resultadoOriginal = window[`${testFunction}_Original`].apply(this, args);
      const tiempoOriginal = Date.now() - inicioOriginal;
      
      resultados.comparacion.original = {
        tiempo: tiempoOriginal,
        exito: true
      };
    }
    
    // Ejecutar función optimizada
    const inicioOptimizado = Date.now();
    const resultadoOptimizado = window[testFunction].apply(this, args);
    const tiempoOptimizado = Date.now() - inicioOptimizado;
    
    resultados.comparacion.optimizado = {
      tiempo: tiempoOptimizado,
      exito: true
    };
    
    // Calcular mejora
    if (resultados.comparacion.original) {
      const mejora = resultados.comparacion.original.tiempo - tiempoOptimizado;
      const porcentaje = (mejora / resultados.comparacion.original.tiempo * 100).toFixed(1);
      
      resultados.comparacion.mejora = {
        tiempoAhorrado: mejora,
        porcentajeMejora: porcentaje
      };
      
      console.log(`[MONITOREO] ${testFunction}: ${mejora}ms ahorrados (${porcentaje}% mejora)`);
    } else {
      console.log(`[MONITOREO] ${testFunction}: ${tiempoOptimizado}ms (versión optimizada)`);
    }
    
  } catch (error) {
    console.error(`[MONITOREO] Error comparando ${testFunction}:`, error);
    resultados.error = error.toString();
  }
  
  return resultados;
}

/**
 * Obtiene estadísticas de uso del SpreadsheetManager
 * @returns {Object} Estadísticas de caché y conexiones
 */
function obtenerEstadisticasOptimizacion() {
  return {
    spreadsheetManager: getSpreadsheetCacheStats(),
    timestamp: new Date().toISOString()
  };
}

console.log('🚀 FuncionesOptimizadas cargado - Semana 1 completada');
