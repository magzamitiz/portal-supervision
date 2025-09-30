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
        'DataQueries', 
        'LideresModule',
        'CelulasModule',
        'IngresosModule',
        'SeguimientoModule',
        'MetricasModule',
        'AlertasModule',
        'CacheModule',
        'TimeoutModule',
        'ExternalDataModule',
        'UtilityModule',
        'NormalizacionModule',
        'AnalisisModule',
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
      'DataQueries',
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
    console.log('[MainModule] Obteniendo datos del dashboard...');
    
    // Cargar datos del directorio
    const directorioData = cargarDirectorioCompleto(forceReload);
    
    if (!directorioData || (!directorioData.lideres.length && !directorioData.celulas.length && !directorioData.ingresos.length)) {
      console.log('[MainModule] No hay datos disponibles, retornando análisis vacío');
      return { success: true, data: createEmptyAnalysis() };
    }

    // Realizar análisis completo
    const analisis = {
      lideres: analizarLideres(directorioData.lideres || []),
      celulas: analizarCelulas(directorioData.celulas || []),
      ingresos: analizarIngresos(directorioData.ingresos || []),
      datosBase: directorioData,
      metricas: calcularMetricasPrincipales(directorioData),
      alertas: generarAlertas(directorioData),
      timestamp: directorioData.timestamp 
    };

    console.log('[MainModule] Datos del dashboard obtenidos exitosamente');
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
        const ss = SpreadsheetApp.openById(sheets.DIRECTORIO);
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
        const ss = SpreadsheetApp.openById(sheets.REPORTE_CELULAS);
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
 * Fuerza la recarga completa de datos del dashboard
 * @returns {Object} Respuesta con análisis completo
 */
function forceReloadDashboardData() {
  try {
    console.log('[MainModule] Solicitud de recarga forzada recibida desde el Frontend.');
    
    // Forzar la carga desde Sheets (ignora y sobrescribe la caché)
    const directorioData = cargarDirectorioCompleto(true);

    // Realizar el análisis (mismo proceso que getDashboardData)
    if (!directorioData || (!directorioData.lideres.length && !directorioData.celulas.length && !directorioData.ingresos.length)) {
      return { success: true, data: createEmptyAnalysis() };
    }

    const analisis = {
      lideres: analizarLideres(directorioData.lideres || []),
      celulas: analizarCelulas(directorioData.celulas || []),
      ingresos: analizarIngresos(directorioData.ingresos || []),
      datosBase: directorioData,
      metricas: calcularMetricasPrincipales(directorioData),
      alertas: generarAlertas(directorioData),
      timestamp: directorioData.timestamp 
    };

    return {
      success: true,
      data: analisis
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

console.log('🏠 MainModule cargado - Aplicación principal lista');
