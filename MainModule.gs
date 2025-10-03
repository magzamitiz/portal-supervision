/**
 * @fileoverview Módulo principal de la aplicación.
 * Contiene la función de entrada principal y funciones de configuración.
 */

// ==================== FUNCIÓN PRINCIPAL DE ENTRADA ====================

/**
 * Función principal de entrada para la aplicación web.
 * @param {GoogleAppsScript.Events.DoGet} e - Objeto de evento doGet
 * @returns {GoogleAppsScript.HTML.HtmlOutput} Contenido HTML de la aplicación
 */
function doGet(e) {
  try {
    return HtmlService.createTemplateFromFile('Dashboard_Original')
      .evaluate()
      .setTitle('Portal de Supervisión V2.0')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (error) {
    console.error('Error en doGet:', error);
    return HtmlService.createHtmlOutput('<h1>Error al cargar la aplicación</h1><p>Por favor, inténtalo de nuevo más tarde.</p><p>Detalle: ' + error.toString() + '</p>');
  }
}

// ==================== FUNCIONES DE CONFIGURACIÓN ====================

/**
 * Obtiene la configuración de la aplicación.
 * @returns {Object} Configuración completa
 */
function getConfiguracion() {
  return {
    version: '2.0',
    nombre: 'Portal de Supervisión',
    timezone: CONFIG.TIMEZONE || 'America/Mexico_City',
    cache_duration: CONFIG.CACHE.DURATION || 1800,
    dias_inactivo: CONFIG.DIAS_INACTIVO || { ACTIVO: 7, ALERTA: 14 },
    sheets: CONFIG.SHEETS || {},
    tabs: CONFIG.TABS || {}
  };
}

/**
 * Verifica el estado de la aplicación.
 * @returns {Object} Estado de la aplicación
 */
function getEstadoAplicacion() {
  try {
    const estado = {
      timestamp: new Date().toISOString(),
      version: '2.0',
      status: 'OK',
      modulos_cargados: [
        'SpreadsheetManager',
        'DataModule', // ✅ CORREGIDO: DataQueries → DataModule
        'LideresModule',
        'CelulasModule',
        'IngresosModule',
        'SeguimientoModule',
        'MetricasModule',
        // 'AlertasModule', // ✅ ELIMINADO: Módulo innecesario removido
        'CacheModule',
        'TimeoutModule',
        'ExternalDataModule',
        'UtilsModule', // ✅ CORREGIDO: UtilityModule → UtilsModule
        // 'NormalizacionModule', // ✅ ELIMINADO: Funciones están en UtilsModule
        // 'AnalisisModule', // ✅ ELIMINADO: Módulo no existe
        'MainModule'
      ],
      configuracion: getConfiguracion(),
      cache_info: getCacheInfo ? getCacheInfo() : { status: 'No disponible' }
    };

    console.log('[MainModule] Estado de aplicación obtenido');
    return estado;

  } catch (error) {
    console.error('[MainModule] Error obteniendo estado:', error);
    return {
      timestamp: new Date().toISOString(),
      version: '2.0',
      status: 'ERROR',
      error: error.toString()
    };
  }
}

/**
 * Inicializa la aplicación.
 * @returns {Object} Resultado de la inicialización
 */
function inicializarAplicacion() {
  try {
    console.log('[MainModule] Inicializando aplicación...');

    // Verificar configuración
    if (!CONFIG) {
      throw new Error('CONFIG no está definido');
    }

    // Obtener el scope global correcto para Google Apps Script
    const scope = typeof globalThis !== 'undefined' ? globalThis : this;
    
    // Verificar módulos críticos
    const modulosCriticos = [
      'SpreadsheetManager',
      'DataModule', // ✅ CORREGIDO: DataQueries → DataModule
      'LideresModule',
      'CelulasModule',
      'IngresosModule'
    ];

    for (const modulo of modulosCriticos) {
      if (typeof scope[modulo] === 'undefined') {
        console.warn(`[MainModule] Módulo crítico ${modulo} no está disponible`);
      }
    }

    // Limpiar caché si es necesario
    if (clearCache) {
      clearCache();
    }

    const resultado = {
      success: true,
      timestamp: new Date().toISOString(),
      mensaje: 'Aplicación inicializada correctamente',
      modulos_verificados: modulosCriticos.length
    };

    console.log('[MainModule] Aplicación inicializada correctamente');
    return resultado;

  } catch (error) {
    console.error('[MainModule] Error inicializando aplicación:', error);
    return {
      success: false,
      timestamp: new Date().toISOString(),
      error: error.toString()
    };
  }
}

/**
 * Reinicia la aplicación.
 * @returns {Object} Resultado del reinicio
 */
function reiniciarAplicacion() {
  try {
    console.log('[MainModule] Reiniciando aplicación...');

    // Limpiar caché
    if (clearCache) {
      clearCache();
    }

    // Reinicializar
    const resultado = inicializarAplicacion();
    resultado.mensaje = 'Aplicación reiniciada correctamente';

    console.log('[MainModule] Aplicación reiniciada');
    return resultado;

  } catch (error) {
    console.error('[MainModule] Error reiniciando aplicación:', error);
    return {
      success: false,
      timestamp: new Date().toISOString(),
      error: error.toString()
    };
  }
}

// ==================== FUNCIÓN PRINCIPAL DEL DASHBOARD ====================

/**
 * Función principal del dashboard - Obtiene todos los datos consolidados
 * @param {boolean} forceReload - Si true, ignora caché y recarga datos
 * @returns {Object} Datos completos del dashboard
 */
function getDashboardData(forceReload = false) {
  try {
    const modo = forceReload ? 'FORZADA (sin caché)' : 'CACHÉ (optimizada)';
    console.log(`[MainModule] Obteniendo datos del dashboard - Modo: ${modo}`);
    
    // Cargar datos del directorio
    const directorioData = cargarDirectorioCompleto(forceReload);
    
    if (!directorioData || (!directorioData.lideres.length && !directorioData.celulas.length && !directorioData.ingresos.length)) {
      console.log('[MainModule] No hay datos disponibles, retornando análisis vacío');
      return { success: true, data: createEmptyAnalysis() };
    }

    // Realizar análisis completo
    const analisis = {
      celulas: analizarCelulas(directorioData.celulas || []),
      ingresos: analizarIngresos(directorioData.ingresos || []),
      datosBase: directorioData,
      metricas: calcularMetricasPrincipales(directorioData),
      alertas: [],
      timestamp: directorioData.timestamp,
      modo_carga: modo
    };

    console.log(`[MainModule] Datos del dashboard obtenidos exitosamente - Modo: ${modo}`);
    return {
      success: true,
      data: analisis
    };

  } catch (error) {
    console.error('[MainModule] Error crítico en getDashboardData:', error);
    return {
      success: false,
      error: 'Error al obtener datos del dashboard. Detalle: ' + error.toString(),
      data: null
    };
  }
}

/**
 * Crea un análisis vacío cuando no hay datos
 * @returns {Object} Análisis vacío
 */
function createEmptyAnalysis() {
  return {
    lideres: {
      total_LD: 0, total_LCF: 0,
      LD_activos: 0, LD_alertas: 0, LD_inactivos: 0,
      LCF_activos: 0, LCF_alertas: 0, LCF_inactivos: 0,
      LCF_sin_LD: [],
      por_congregacion: {},
      tasa_actividad_LD: 0, tasa_actividad_LCF: 0
    },
    celulas: {
      total_celulas: 0, celulas_activas: 0, celulas_vacias: 0, celulas_en_riesgo: 0,
      celulas_saludables: 0, celulas_para_multiplicar: 0, total_miembros: 0,
      promedio_miembros: 0, celulas_por_LCF: {}
    },
    ingresos: {
      total_historico: 0, ingresos_hoy: 0, ingresos_semana: 0, ingresos_mes: 0,
      asignados: 0, pendientes_asignacion: 0, aceptaron_jesus: 0, desean_visita: 0,
      en_celula: 0, sin_celula: 0,
      por_fuente: {}, por_LCF: {}, por_LD: {},
      tasa_asignacion: 0, tasa_integracion_celula: 0
    },
    metricas: {
      cobertura_liderazgo: 0, promedio_lcf_por_ld: 0, promedio_almas_por_lcf: 0,
      tasa_ocupacion_celulas: 0, celulas_necesitan_atencion: 0, potencial_multiplicacion: 0,
      velocidad_asignacion_promedio: 0, almas_sin_celula: 0
    },
    alertas: [],
    timestamp: new Date().toISOString()
  };
}

/**
 * Función consolidada que reemplaza 3 llamadas RPC con 1 sola
 * Objetivo: Reducir tiempo de 128s a 30s
 * @returns {Object} Datos completos del dashboard
 */
function getDashboardDataConsolidated() {
  // 🚀 INICIAR MÉTRICAS DE RENDIMIENTO
  if (typeof PerformanceMetrics !== 'undefined') {
    PerformanceMetrics.start('TOTAL_DASHBOARD_LOAD');
  }
  
  const startTime = Date.now();
  console.log('[CONSOLIDATED] Iniciando carga unificada...');
  
  // PASO 1: Verificar caché unificado
  if (typeof PerformanceMetrics !== 'undefined') {
    PerformanceMetrics.start('CACHE_CHECK');
  }
  
  const cachedData = UnifiedCache.get(UnifiedCache.getKEYS().DASHBOARD);
  
  if (cachedData) {
    const cacheTime = Date.now() - startTime;
    console.log('[CONSOLIDATED] Cache HIT (Unified) - tiempo:', cacheTime, 'ms');
    
    if (typeof PerformanceMetrics !== 'undefined') {
      PerformanceMetrics.end('CACHE_CHECK');
      PerformanceMetrics.end('TOTAL_DASHBOARD_LOAD');
    }
    
    // Incluir métricas en respuesta
    if (cachedData.data) {
      cachedData.data.performance = {
        loadTime: cacheTime,
        cacheHit: true,
        timestamp: new Date().toISOString()
      };
    }
    
    return cachedData;
  }
  
  if (typeof PerformanceMetrics !== 'undefined') {
    PerformanceMetrics.end('CACHE_CHECK');
  }
  
  console.log('[CONSOLIDATED] Cache MISS - cargando desde Sheets...');
  
  try {
    // PASO 2: UNA SOLA apertura del spreadsheet usando Singleton
    if (typeof PerformanceMetrics !== 'undefined') {
      PerformanceMetrics.start('SPREADSHEET_OPEN');
    }
    
    const spreadsheet = getSpreadsheetManager().getSpreadsheet(CONFIG.SHEETS.DIRECTORIO);
    const spreadsheetTime = Date.now() - startTime;
    console.log('[CONSOLIDATED] Spreadsheet abierto (Singleton):', spreadsheetTime, 'ms');
    
    if (typeof PerformanceMetrics !== 'undefined') {
      PerformanceMetrics.end('SPREADSHEET_OPEN');
    }
    
    // PASO 3: Cargar TODAS las hojas necesarias de una vez
    if (typeof PerformanceMetrics !== 'undefined') {
      PerformanceMetrics.start('SHEETS_LOAD');
    }
    
    const batchData = {};
    
    // Cargar líderes
    const lideresSheet = spreadsheet.getSheetByName(CONFIG.TABS.LIDERES);
    if (lideresSheet) {
      const lastRow = Math.min(lideresSheet.getLastRow(), 5000); // Límite de seguridad
      if (lastRow > 0) {
        batchData.lideres = lideresSheet.getRange(1, 1, lastRow, 5).getValues();
      }
    }
    
    // Cargar células
    const celulasSheet = spreadsheet.getSheetByName(CONFIG.TABS.CELULAS);
    if (celulasSheet) {
      const lastRow = Math.min(celulasSheet.getLastRow(), 5000);
      if (lastRow > 0) {
        batchData.celulas = celulasSheet.getRange(1, 1, lastRow, 8).getValues();
      }
    }
    
    // Cargar ingresos
    const ingresosSheet = spreadsheet.getSheetByName(CONFIG.TABS.INGRESOS);
    if (ingresosSheet) {
      const lastRow = Math.min(ingresosSheet.getLastRow(), 10000);
      if (lastRow > 0) {
        batchData.ingresos = ingresosSheet.getRange(1, 1, lastRow, 10).getValues();
      }
    }
    
    // Cargar resumen para estadísticas
    const resumenSheet = spreadsheet.getSheetByName('_ResumenDashboard');
    if (resumenSheet) {
      batchData.resumen = resumenSheet.getRange("B1:B7").getValues();
    }
    
    const sheetsLoadTime = Date.now() - startTime;
    console.log('[CONSOLIDATED] Datos cargados:', sheetsLoadTime, 'ms');
    
    if (typeof PerformanceMetrics !== 'undefined') {
      PerformanceMetrics.end('SHEETS_LOAD');
    }
    
    // PASO 4: Procesar todo en memoria
    if (typeof PerformanceMetrics !== 'undefined') {
      PerformanceMetrics.start('DATA_PROCESSING');
    }
    
    const result = {
      success: true,
      data: {
        // Procesar estadísticas desde resumen
        estadisticas: processEstadisticasFromBatch(batchData),
        
        // Procesar lista de líderes
        listaDeLideres: processLideresFromBatch(batchData.lideres),
        
        // Procesar datos completos del dashboard
        dashboard: processDashboardFromBatch(batchData),
        
        // Metadata
        timestamp: new Date().toISOString(),
        loadTime: Date.now() - startTime,
        
        // Métricas de rendimiento
        performance: {
          loadTime: Date.now() - startTime,
          cacheHit: false,
          spreadsheetTime: spreadsheetTime,
          sheetsLoadTime: sheetsLoadTime,
          timestamp: new Date().toISOString()
        }
      }
    };
    
    if (typeof PerformanceMetrics !== 'undefined') {
      PerformanceMetrics.end('DATA_PROCESSING');
    }
    
    // PASO 5: Guardar en caché unificado (30 minutos)
    if (typeof PerformanceMetrics !== 'undefined') {
      PerformanceMetrics.start('CACHE_SAVE');
    }
    
    UnifiedCache.set(UnifiedCache.getKEYS().DASHBOARD, result, UnifiedCache.getTTL().DASHBOARD);
    
    if (typeof PerformanceMetrics !== 'undefined') {
      PerformanceMetrics.end('CACHE_SAVE');
      PerformanceMetrics.end('TOTAL_DASHBOARD_LOAD');
    }
    
    const totalTime = Date.now() - startTime;
    console.log('[CONSOLIDATED] ✅ Proceso completado:', totalTime, 'ms');
    
    // Monitoreo de rendimiento
    if (typeof monitorDashboardPerformance === 'function') {
      monitorDashboardPerformance();
    }
    
    return result;
    
  } catch (error) {
    console.error('[CONSOLIDATED] ❌ Error:', error);
    
    if (typeof PerformanceMetrics !== 'undefined') {
      PerformanceMetrics.end('TOTAL_DASHBOARD_LOAD');
    }
    
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString(),
      performance: {
        loadTime: Date.now() - startTime,
        cacheHit: false,
        error: true,
        timestamp: new Date().toISOString()
      }
    };
  }
}

/**
 * Procesa estadísticas desde datos de resumen
 * @param {Object} batchData - Datos cargados en lote
 * @returns {Object} Estadísticas procesadas
 */
function processEstadisticasFromBatch(batchData) {
  try {
    if (!batchData.resumen || batchData.resumen.length < 7) {
      return {
        lideres: { total_LD: 0, total_LCF: 0 },
        celulas: { total_celulas: 0 },
        ingresos: { total_historico: 0, ingresos_mes: 0, tasa_integracion_celula: "0.0" },
        metricas: { promedio_lcf_por_ld: "0.0" },
        timestamp: new Date().toISOString()
      };
    }
    
    const metricasValues = batchData.resumen;
    
    return {
      lideres: { 
        total_LD: metricasValues[0][0] || 0, 
        total_LCF: metricasValues[1][0] || 0 
      },
      celulas: { 
        total_celulas: metricasValues[2][0] || 0 
      },
      ingresos: {
        total_historico: metricasValues[3][0] || 0,
        ingresos_mes: metricasValues[4][0] || 0,
        tasa_integracion_celula: ((metricasValues[6][0] || 0) * 100).toFixed(1)
      },
      metricas: { 
        promedio_lcf_por_ld: metricasValues[0][0] > 0 ? 
          ((metricasValues[1][0] || 0) / metricasValues[0][0]).toFixed(1) : "0.0"
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[CONSOLIDATED] Error procesando estadísticas:', error);
    return {
      lideres: { total_LD: 0, total_LCF: 0 },
      celulas: { total_celulas: 0 },
      ingresos: { total_historico: 0, ingresos_mes: 0, tasa_integracion_celula: "0.0" },
      metricas: { promedio_lcf_por_ld: "0.0" },
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Procesa lista de líderes desde datos en lote
 * @param {Array} lideresData - Datos de líderes
 * @returns {Array} Lista de líderes LD
 */
function processLideresFromBatch(lideresData) {
  try {
    if (!lideresData || lideresData.length < 2) {
      return [];
    }
    
    const headers = lideresData[0].map(h => h.toString().trim());
    const lideres = [];
    
    const columnas = {
      idLider: headers.findIndex(h => h.includes('ID_Lider') || h.includes('ID Líder') || h.includes('ID')),
      nombreLider: headers.findIndex(h => h.includes('Nombre_Lider') || h.includes('Nombre Líder') || h.includes('Nombre')),
      rol: headers.findIndex(h => h.includes('Rol') || h.includes('Tipo'))
    };
    
    if (columnas.idLider === -1 || columnas.rol === -1) {
      console.error('[CONSOLIDATED] Faltan columnas críticas en líderes');
      return [];
    }
    
    for (let i = 1; i < lideresData.length; i++) {
      const row = lideresData[i];
      const idLider = String(row[columnas.idLider] || '').trim();
      const rol = String(row[columnas.rol] || '').trim().toUpperCase();
      
      if (idLider && rol === 'LD') {
        lideres.push({
          ID_Lider: idLider,
          Nombre_Lider: String(row[columnas.nombreLider] || '').trim()
        });
      }
    }
    
    return lideres;
  } catch (error) {
    console.error('[CONSOLIDATED] Error procesando líderes:', error);
    return [];
  }
}

/**
 * Procesa datos completos del dashboard desde datos en lote
 * @param {Object} batchData - Datos cargados en lote
 * @returns {Object} Datos del dashboard procesados
 */
function processDashboardFromBatch(batchData) {
  try {
    // Procesar líderes completos
    const lideres = processLideresCompletosFromBatch(batchData.lideres);
    
    // Procesar células completas
    const celulas = processCelulasCompletasFromBatch(batchData.celulas);
    
    // Procesar ingresos completos
    const ingresos = processIngresosCompletosFromBatch(batchData.ingresos);
    
    // Calcular actividad de líderes
    const actividadMap = calcularActividadLideres(celulas);
    const lideresConActividad = integrarActividadLideres(lideres, actividadMap);
    
    // Mapear almas a células
    const almasEnCelulasMap = mapearAlmasACelulas(celulas);
    integrarAlmasACelulas(ingresos, almasEnCelulasMap);
    
    return {
      celulas: analizarCelulas(celulas),
      ingresos: analizarIngresos(ingresos),
      datosBase: {
        lideres: lideresConActividad,
        celulas: celulas,
        ingresos: ingresos,
        timestamp: new Date().toISOString()
      },
      metricas: calcularMetricasPrincipales({
        lideres: lideresConActividad,
        celulas: celulas,
        ingresos: ingresos
      }),
      alertas: [],
      timestamp: new Date().toISOString(),
      modo_carga: 'CONSOLIDATED'
    };
  } catch (error) {
    console.error('[CONSOLIDATED] Error procesando dashboard:', error);
    return createEmptyAnalysis();
  }
}

/**
 * Procesa líderes completos desde datos en lote
 * @param {Array} lideresData - Datos de líderes
 * @returns {Array} Líderes procesados
 */
function processLideresCompletosFromBatch(lideresData) {
  try {
    if (!lideresData || lideresData.length < 2) return [];
    
    const headers = lideresData[0].map(h => h.toString().trim());
    
    const columnas = {
      idLider: headers.findIndex(h => h.includes('ID_Lider') || h.includes('ID Líder') || h.includes('ID')),
      nombreLider: headers.findIndex(h => h.includes('Nombre_Lider') || h.includes('Nombre Líder') || h.includes('Nombre')),
      rol: headers.findIndex(h => h.includes('Rol') || h.includes('Tipo')),
      idLiderDirecto: headers.findIndex(h => h.includes('ID_Lider_Directo') || h.includes('Supervisor') || h.includes('ID LD')),
      congregacion: headers.findIndex(h => h.includes('Congregación') || h.includes('Congregacion'))
    };
    
    if (columnas.idLider === -1 || columnas.rol === -1) return [];
    
    // Preparar datos para batch processing (excluir header)
    const dataRows = lideresData.slice(1);
    
    // Función de procesamiento para cada líder
    const processLider = (row, index) => {
      const idLider = String(row[columnas.idLider] || '').trim();
      
      if (!idLider) return null;
      
      return {
        ID_Lider: idLider,
        Nombre_Lider: String(row[columnas.nombreLider] || '').trim(),
        Rol: String(row[columnas.rol] || '').trim().toUpperCase(),
        ID_Lider_Directo: String(row[columnas.idLiderDirecto] || '').trim(),
        Congregacion: String(row[columnas.congregacion] || '').trim(),
        Estado_Actividad: 'Desconocido',
        Dias_Inactivo: null,
        Ultima_Actividad: null
      };
    };
    
    // Procesar en lotes usando batch processing
    const lideres = processBatchLDs(dataRows, processLider).filter(l => l !== null);
    
    console.log(`[CONSOLIDATED] ✅ ${lideres.length} líderes procesados en batch`);
    return lideres;
    
  } catch (error) {
    console.error('[CONSOLIDATED] Error procesando líderes completos:', error);
    return [];
  }
}

/**
 * Procesa células completas desde datos en lote
 * @param {Array} celulasData - Datos de células
 * @returns {Array} Células procesadas
 */
function processCelulasCompletasFromBatch(celulasData) {
  try {
    if (!celulasData || celulasData.length < 2) return [];
    
    const headers = celulasData[0].map(h => h.toString().trim());
    const celulasMap = new Map();
    
    const columnas = {
      idCelula: headers.findIndex(h => h.includes('ID Célula') || h.includes('ID_Celula') || h.includes('ID')),
      nombreCelula: headers.findIndex(h => h.includes('Nombre Célula')),
      idMiembro: headers.findIndex(h => h.includes('ID Miembro') || h.includes('ID_Miembro') || h.includes('ID Alma')),
      nombreMiembro: headers.findIndex(h => h.includes('Nombre Miembro')),
      idLCF: headers.findIndex(h => h.includes('ID LCF') || h.includes('ID_LCF')),
      nombreLCF: headers.findIndex(h => h.includes('Nombre LCF')),
      idLider: headers.findIndex(h => h.includes('ID_Lider') || h.includes('ID Líder') || h.includes('ID LD')),
      estado: headers.findIndex(h => h.includes('Estado') || h.includes('Estado Célula')),
      congregacion: headers.findIndex(h => h.includes('Congregación') || h.includes('Congregacion')),
      ultimaActividad: headers.findIndex(h => h.includes('Ultima_Actividad') || h.includes('Última Actividad'))
    };
    
    if (columnas.idCelula === -1) return [];
    
    // Preparar datos para batch processing (excluir header)
    const dataRows = celulasData.slice(1);
    
    // Función de procesamiento para cada fila de célula
    const processCelulaRow = (row, index) => {
      const idCelula = String(row[columnas.idCelula] || '').trim();
      
      if (!idCelula) return null;
      
      const idMiembro = String(row[columnas.idMiembro] || '').trim();
      
      return {
        idCelula: idCelula,
        nombreCelula: String(row[columnas.nombreCelula] || '').trim(),
        idLCF: String(row[columnas.idLCF] || '').trim(),
        nombreLCF: String(row[columnas.nombreLCF] || '').trim(),
        idLider: String(row[columnas.idLider] || '').trim(),
        estado: String(row[columnas.estado] || 'Activo').trim(),
        congregacion: String(row[columnas.congregacion] || '').trim(),
        ultimaActividad: row[columnas.ultimaActividad] || null,
        miembro: idMiembro ? {
          ID_Miembro: idMiembro,
          Nombre_Miembro: String(row[columnas.nombreMiembro] || '').trim()
        } : null
      };
    };
    
    // Procesar en lotes usando batch processing
    const processedRows = processBatchCelulas(dataRows, processCelulaRow).filter(r => r !== null);
    
    // Agrupar por ID de célula
    processedRows.forEach(row => {
      if (!celulasMap.has(row.idCelula)) {
        celulasMap.set(row.idCelula, {
          ID_Celula: row.idCelula,
          Nombre_Celula: row.nombreCelula,
          ID_LCF: row.idLCF,
          Nombre_LCF: row.nombreLCF,
          ID_Lider: row.idLider,
          Estado: row.estado,
          Congregacion: row.congregacion,
          Ultima_Actividad: row.ultimaActividad,
          Miembros: []
        });
      }
      
      if (row.miembro) {
        celulasMap.get(row.idCelula).Miembros.push(row.miembro);
      }
    });
    
    const celulas = Array.from(celulasMap.values());
    console.log(`[CONSOLIDATED] ✅ ${celulas.length} células procesadas en batch`);
    return celulas;
    
  } catch (error) {
    console.error('[CONSOLIDATED] Error procesando células:', error);
    return [];
  }
}

/**
 * Procesa ingresos completos desde datos en lote
 * @param {Array} ingresosData - Datos de ingresos
 * @returns {Array} Ingresos procesados
 */
function processIngresosCompletosFromBatch(ingresosData) {
  try {
    if (!ingresosData || ingresosData.length < 2) return [];
    
    const headers = ingresosData[0].map(h => h.toString().trim());
    
    const columnas = {
      idAlma: headers.findIndex(h => h.includes('ID_Alma') || h.includes('ID Alma') || h.includes('ID')),
      nombreCompleto: headers.findIndex(h => h.includes('Nombre_Completo') || h.includes('Nombre Completo')),
      telefono: headers.findIndex(h => h.includes('Telefono') || h.includes('Teléfono')),
      idLCF: headers.findIndex(h => h.includes('ID_LCF') || h.includes('ID LCF')),
      nombreLCF: headers.findIndex(h => h.includes('Nombre_LCF') || h.includes('Nombre LCF')),
      fechaIngreso: headers.findIndex(h => h.includes('Fecha_Ingreso') || h.includes('Fecha Ingreso')),
      aceptoJesus: headers.findIndex(h => h.includes('Acepto_Jesus') || h.includes('Aceptó Jesús')),
      deseaVisita: headers.findIndex(h => h.includes('Desea_Visita') || h.includes('Desea Visita')),
      estadoAsignacion: headers.findIndex(h => h.includes('Estado_Asignacion') || h.includes('Estado Asignación'))
    };
    
    if (columnas.idAlma === -1) return [];
    
    // Preparar datos para batch processing (excluir header)
    const dataRows = ingresosData.slice(1);
    
    // Función de procesamiento para cada ingreso
    const processIngreso = (row, index) => {
      const idAlma = String(row[columnas.idAlma] || '').trim();
      
      if (!idAlma) return null;
      
      return {
        ID_Alma: idAlma,
        Nombre_Completo: String(row[columnas.nombreCompleto] || '').trim(),
        Telefono: String(row[columnas.telefono] || '').trim(),
        ID_LCF: String(row[columnas.idLCF] || '').trim(),
        Nombre_LCF: String(row[columnas.nombreLCF] || '').trim(),
        Fecha_Ingreso: row[columnas.fechaIngreso] || null,
        Acepto_Jesus: String(row[columnas.aceptoJesus] || '').trim(),
        Desea_Visita: String(row[columnas.deseaVisita] || '').trim(),
        Estado_Asignacion: String(row[columnas.estadoAsignacion] || '').trim(),
        En_Celula: false,
        Dias_Desde_Ingreso: 0
      };
    };
    
    // Procesar en lotes usando batch processing
    const ingresos = processBatchIngresos(dataRows, processIngreso).filter(i => i !== null);
    
    console.log(`[CONSOLIDATED] ✅ ${ingresos.length} ingresos procesados en batch`);
    return ingresos;
    
  } catch (error) {
    console.error('[CONSOLIDATED] Error procesando ingresos:', error);
    return [];
  }
}

// ==================== FUNCIONES DE UTILIDAD ====================

/**
 * Obtiene información del sistema.
 * @returns {Object} Información del sistema
 */
function getInfoSistema() {
  try {
    return {
      timestamp: new Date().toISOString(),
      user_email: Session.getActiveUser().getEmail(),
      timezone: Session.getScriptTimeZone(),
      locale: Session.getActiveUserLocale(),
      version_apps_script: 'N/A', // No disponible en Apps Script
      memoria_disponible: 'N/A', // No disponible en Apps Script
      configuracion: getConfiguracion()
    };
  } catch (error) {
    console.error('[MainModule] Error obteniendo info del sistema:', error);
    return {
      timestamp: new Date().toISOString(),
      error: error.toString()
    };
  }
}

/**
 * Valida la conectividad con las hojas de cálculo.
 * @returns {Object} Resultado de la validación
 */
function validarConectividad() {
  try {
    console.log('[MainModule] Validando conectividad...');

    const resultados = {};
    const sheets = CONFIG.SHEETS || {};

    // Validar hoja principal
    if (sheets.DIRECTORIO) {
      try {
        const ss = getSpreadsheetManager().getSpreadsheet(sheets.DIRECTORIO);
        resultados.directorio = {
          status: 'OK',
          titulo: ss.getName(),
          hojas: ss.getSheets().map(s => s.getName())
        };
      } catch (error) {
        resultados.directorio = {
          status: 'ERROR',
          error: error.toString()
        };
      }
    }

    // Validar hojas externas si están configuradas
    if (sheets.REPORTE_CELULAS) {
      try {
        const ss = getSpreadsheetManager().getSpreadsheet(sheets.REPORTE_CELULAS);
        resultados.reporte_celulas = {
          status: 'OK',
          titulo: ss.getName()
        };
      } catch (error) {
        resultados.reporte_celulas = {
          status: 'ERROR',
          error: error.toString()
        };
      }
    }

    console.log('[MainModule] Validación de conectividad completada');
    return {
      success: true,
      timestamp: new Date().toISOString(),
      resultados: resultados
    };

  } catch (error) {
    console.error('[MainModule] Error validando conectividad:', error);
    return {
      success: false,
      timestamp: new Date().toISOString(),
      error: error.toString()
    };
  }
}

/**
 * Limpia el caché específico de todos los líderes
 * @param {Array} lideres - Array de líderes para limpiar sus cachés
 */
function clearLeaderDetailCache(lideres) {
  try {
    console.log('[MainModule] 🧹 Limpiando caché específico de líderes...');
    const cache = CacheService.getScriptCache();
    let clavesLimpiadas = 0;
    
    if (!lideres || lideres.length === 0) {
      console.log('[MainModule] ⚠️ No hay líderes para limpiar caché');
      return;
    }
    
    // Limpiar caché de cada líder
    lideres.forEach(lider => {
      const idLider = lider.ID_Lider;
      if (idLider) {
        // Limpiar todos los tipos de caché por LD
        const clavesLD = [
          `LD_QUICK_${idLider}`,
          `LD_FULL_${idLider}`,
          `LD_BASIC_${idLider}`,
          `LD_OPT_FULL_${idLider}`,
          `LD_OPT_BASIC_${idLider}`
        ];
        
        clavesLD.forEach(clave => {
          try {
            cache.remove(clave);
            clavesLimpiadas++;
          } catch (error) {
            // Ignorar errores de claves individuales
          }
        });
      }
    });
    
    console.log(`[MainModule] ✅ ${clavesLimpiadas} claves de caché de líderes limpiadas`);
    return clavesLimpiadas;
    
  } catch (error) {
    console.error('[MainModule] Error limpiando caché de líderes:', error);
    return 0;
  }
}

/**
 * Fuerza la recarga completa de datos del dashboard
 * VERSIÓN OPTIMIZADA: Carga solo datos esenciales para evitar timeout
 * @returns {Object} Respuesta con análisis completo
 */
function forceReloadDashboardData() {
  try {
    console.log('[MainModule] 🔄 RECARGA FORZADA solicitada desde el Frontend');
    const startTime = Date.now();
    
    // ✅ CORRECCIÓN: Limpiar caché antes de cargar datos frescos
    console.log('[MainModule] Limpiando caché para forzar recarga desde Google Sheets...');
    clearCache();
    
    // Limpiar caché específico de estadísticas
    const cache = CacheService.getScriptCache();
    cache.remove('STATS_RAPIDAS_V2');
    
    // ✅ CORRECCIÓN: Cargar directorio completo desde Google Sheets
    console.log('[MainModule] Cargando directorio completo desde Google Sheets...');
    const directorioCompleto = cargarDirectorioCompleto(true); // forceReload = true
    if (!directorioCompleto || !directorioCompleto.lideres) {
      throw new Error('Error cargando directorio completo desde Google Sheets');
    }
    
    // ✅ CORRECCIÓN: Limpiar caché específico de todos los líderes
    const clavesLimpiadas = clearLeaderDetailCache(directorioCompleto.lideres);
    console.log(`[MainModule] 🧹 ${clavesLimpiadas} claves de caché de líderes eliminadas`);
    
    // 1. Filtrar líderes LD desde datos frescos
    const lideresLD = directorioCompleto.lideres.filter(l => l.Rol === 'LD');
    console.log(`[MainModule] ✅ ${lideresLD.length} LDs cargados desde Google Sheets`);
    
    // 2. Obtener estadísticas frescas (después de limpiar caché)
    const stats = getEstadisticasRapidas();
    if (!stats.success) {
      throw new Error('Error obteniendo estadísticas: ' + stats.error);
    }
    
    // 3. Crear análisis con datos frescos desde Google Sheets
    const analisis = {
      // Usar datos de actividad (estructura real de getEstadisticasRapidas)
      actividad: stats.data.actividad || {},
      metricas: stats.data.metricas || {},
      lideres: {
        lista: lideresLD // ✅ Datos frescos desde Google Sheets
      },
      alertas: [],
      timestamp: stats.data.timestamp,
      modo_optimizado: true,
      modo_carga: 'RECARGA FORZADA (datos frescos desde Google Sheets)'
    };

    const timeElapsed = Date.now() - startTime;
    console.log(`[MainModule] ✅ Recarga forzada completada en ${timeElapsed}ms`);
    console.log(`[MainModule] 📊 Datos frescos cargados: ${lideresLD.length} LDs, ${stats.data.actividad?.total_recibiendo_celulas || 0} almas`);
    console.log(`[MainModule] 🧹 Caché limpiado: ${clavesLimpiadas} claves de líderes eliminadas`);

    return {
      success: true,
      data: analisis,
      tiempo_ms: timeElapsed,
      modo: 'RECARGA_FORZADA_DATOS_FRESCOS'
    };

  } catch (error) {
    console.error('[MainModule] Error crítico en forceReloadDashboardData:', error);
    return {
      success: false,
      error: 'Error al forzar la recarga de datos. Detalle: ' + error.toString(),
      data: null
    };
  }
}

// ✅ ALERTAS ELIMINADAS: Sistema de alertas innecesario removido para mejorar rendimiento




/**
 * Función de prueba para verificar la limpieza de caché de líderes
 * @param {string} idLD - ID del líder para probar
 * @returns {Object} Resultado de la prueba
 */
function testClearLeaderCache(idLD = 'LD-4001') {
  try {
    console.log(`🧪 TEST: Probando limpieza de caché para LD ${idLD}`);
    
    // Simular datos de líder
    const lideresTest = [{ ID_Lider: idLD, Nombre_Lider: 'Test LD' }];
    
    // Limpiar caché
    const clavesLimpiadas = clearLeaderDetailCache(lideresTest);
    
    console.log(`✅ Test completado: ${clavesLimpiadas} claves limpiadas`);
    return {
      success: true,
      claves_limpiadas: clavesLimpiadas,
      ld_probado: idLD
    };
    
  } catch (error) {
    console.error('❌ Error en test:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

console.log('🏠 MainModule cargado - Aplicación principal lista');
