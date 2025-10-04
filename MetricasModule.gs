/**
 * ✅ MÓDULO DE MÉTRICAS OPTIMIZADO
 * Solo contiene las funciones que SÍ se usan en el sistema
 * Versión: 3.0 - Limpieza masiva de código no utilizado
 */

// ==================== CONFIGURACIÓN ====================

const METRICAS_CONFIG = {
  UMBRALES: {
    LCF_POR_LD: {
      OPTIMO: 3,
      MODERADO: 5,
      ALTO: 8
    }
  }
};

// ==================== FUNCIONES PRINCIPALES (USADAS) ====================

/**
 * Calcula métricas principales del sistema
 * @param {Object} datos - Datos del sistema
 * @returns {Object} Métricas principales
 */
function calcularMetricasPrincipales(datos) {
  try {
    const metricas = {
      lideres: calcularMetricasLideres(datos.lideres || []),
      celulas: calcularMetricasCelulas(datos.celulas || []),
      ingresos: calcularMetricasIngresos(datos.ingresos || []),
      consolidadas: {}
    };
    
    return {
      individuales: metricas,
      consolidadas: {}
    };
  } catch (error) {
    console.error('[MetricasModule] Error calculando métricas principales:', error);
    return {
      individuales: {},
      consolidadas: {}
    };
  }
}

// ==================== FUNCIONES DE ESTADÍSTICAS RÁPIDAS (USADAS) ====================

/**
 * ✅ FUNCIÓN USADA: Obtiene estadísticas rápidas del resumen
 * @returns {Object} Estadísticas del dashboard
 */
function getEstadisticasRapidas() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    const resumenSheet = ss.getSheetByName('_ResumenDashboard');
    
    if (!resumenSheet) {
      throw new Error('Hoja _ResumenDashboard no encontrada');
    }
    
    const metricasValues = resumenSheet.getRange('B1:B10').getValues();
    
    const stats = {
      totalRecibiendoCelulas: metricasValues[0][0] || 0, // Total Recibiendo Células (B1)
      activosRecibiendoCelula: metricasValues[1][0] || 0, // Activos recibiendo célula (B2)
      alerta2_3Semanas: metricasValues[2][0] || 0, // 2 a 3 semanas sin recibir célula (B3)
      criticoMas1Mes: metricasValues[3][0] || 0, // Más de 1 mes sin recibir célula (B4)
      lideresInactivos: metricasValues[4][0] || 0, // Líderes hibernando (B5)
      totalLideres: metricasValues[5][0] || 0, // Total Líderes (B6)
      totalCelulas: metricasValues[6][0] || 0, // Total Células (B7)
      totalIngresos: metricasValues[7][0] || 0, // Total Ingresos (B8)
      timestamp: new Date().toISOString()
    };
    
    return {
      success: true,
      data: stats
    };
    
  } catch (error) {
    console.error('[MetricasModule] Error obteniendo estadísticas rápidas:', error);
    return {
      success: false,
      error: error.toString(),
      data: {}
    };
  }
}

/**
 * ✅ FUNCIÓN USADA: Carga estadísticas mínimas
 * @returns {Object} Estadísticas mínimas
 */
function cargarEstadisticasMinimas() {
  try {
    const stats = getEstadisticasRapidas();
    
    if (!stats.success) {
      return {
        success: false,
        error: 'No se pudieron cargar estadísticas',
        data: {}
      };
    }
    
    return {
      success: true,
      data: {
        resumen: stats.data,
        timestamp: new Date().toISOString()
      }
    };
    
  } catch (error) {
    console.error('[MetricasModule] Error cargando estadísticas mínimas:', error);
    return {
      success: false,
      error: error.toString(),
      data: {}
    };
  }
}

// ==================== FUNCIONES DE VERIFICACIÓN (USADAS) ====================

/**
 * ✅ FUNCIÓN USADA: Verifica estructura del resumen dashboard
 * @returns {Object} Resultado de verificación
 */
function verificarEstructuraResumenDashboard() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    const resumenSheet = ss.getSheetByName('_ResumenDashboard');
    
    if (!resumenSheet) {
      return {
        success: false,
        error: 'Hoja _ResumenDashboard no encontrada'
      };
    }
    
    const data = resumenSheet.getRange('A1:B20').getValues();
    const metricas = {};
    
    data.forEach(row => {
      if (row[0] && row[0].toString().trim()) {
        metricas[row[0].toString().trim()] = row[1] || 0;
      }
    });
    
    const metricasEsperadas = [
      'Total Asistencia Células',
      'Activos recibiendo célula',
      '2 a 3 semanas sin recibir celula',
      'Más de 1 mes sin recibir celula',
      'Líderes hibernando',
      'Total Líderes',
      'Total Células',
      'Total Ingresos'
    ];
    
    const metricasFaltantes = metricasEsperadas.filter(m => !metricas[m]);
    
    return {
      success: metricasFaltantes.length === 0,
      metricas_encontradas: Object.keys(metricas).length,
      metricas_faltantes: metricasFaltantes,
      metricas: metricas
    };
    
  } catch (error) {
    console.error('[MetricasModule] Error verificando estructura:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ==================== FUNCIONES DE TEST (USADAS) ====================

/**
 * ✅ FUNCIÓN USADA: Test de estadísticas esenciales
 * @returns {Object} Resultado del test
 */
function testEstadisticasEsencial() {
  try {
    console.log('🧪 [MetricasModule] Iniciando test de estadísticas esenciales...');
    
    const stats = getEstadisticasRapidas();
    
    if (!stats.success) {
      return {
        success: false,
        error: 'No se pudieron obtener estadísticas',
        detalles: stats
      };
    }
    
    const data = stats.data;
    const verificaciones = {
      totalLideres: data.totalLideres > 0,
      totalCelulas: data.totalCelulas > 0,
      totalIngresos: data.totalIngresos >= 0,
      timestamp: data.timestamp ? true : false
    };
    
    const todasPasaron = Object.values(verificaciones).every(v => v === true);
    
    return {
      success: todasPasaron,
      verificaciones: verificaciones,
      datos: data,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('[MetricasModule] Error en test de estadísticas:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * ✅ FUNCIÓN USADA: Test completo de optimización
 * @returns {Object} Resultado del test
 */
function testCompletoOptimizacion() {
  try {
    console.log('🧪 [MetricasModule] Iniciando test completo de optimización...');
    
    const resultados = {
      estadisticas: testEstadisticasEsencial(),
      estructura: verificarEstructuraResumenDashboard(),
      timestamp: new Date().toISOString()
    };
    
    const exito = resultados.estadisticas.success && resultados.estructura.success;
    
    return {
      success: exito,
      resultados: resultados,
      resumen: {
        estadisticas_ok: resultados.estadisticas.success,
        estructura_ok: resultados.estructura.success,
        optimizacion_completa: exito
      }
    };
    
  } catch (error) {
    console.error('[MetricasModule] Error en test completo:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ==================== FUNCIONES DE RENDIMIENTO (USADAS) ====================

/**
 * ✅ FUNCIÓN USADA: Test de rendimiento general
 * @returns {Object} Resultado del test de rendimiento
 */
function testRendimientoGeneral() {
  try {
    console.log('🧪 [MetricasModule] Iniciando test de rendimiento...');
    
    const startTime = Date.now();
    
    // Test 1: Estadísticas rápidas
    const statsStart = Date.now();
    const stats = getEstadisticasRapidas();
    const statsTime = Date.now() - statsStart;
    
    // Test 2: Verificación de estructura
    const structStart = Date.now();
    const estructura = verificarEstructuraResumenDashboard();
    const structTime = Date.now() - structStart;
    
    const totalTime = Date.now() - startTime;
    
    return {
      success: stats.success && estructura.success,
      tiempos: {
        estadisticas_ms: statsTime,
        estructura_ms: structTime,
        total_ms: totalTime
      },
      resultados: {
        estadisticas: stats.success,
        estructura: estructura.success
      },
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('[MetricasModule] Error en test de rendimiento:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

console.log('📊 MetricasModule cargado - Módulo optimizado con solo funciones utilizadas');