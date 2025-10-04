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
 * ✅ FUNCIÓN REUTILIZABLE: Transforma métricas planas a estructura del frontend
 * @param {Object} metricas - Métricas en formato plano
 * @returns {Object} Estructura {fila1, fila2, calculadas} que espera el frontend
 */
function transformarMetricasParaFrontend(metricas) {
  const fila1 = {
    activos_recibiendo_celula: metricas.activosRecibiendoCelula || 0,
    lideres_hibernando: metricas.lideresInactivos || 0,
    total_lideres: metricas.totalLideres || 0,
    total_asistencia_celulas: metricas.totalRecibiendoCelulas || 0
  };
  
  const fila2 = {
    alerta_2_3_semanas: metricas.alerta2_3Semanas || 0,
    critico_mas_1_mes: metricas.criticoMas1Mes || 0,
    total_celulas: metricas.totalCelulas || 0,
    total_ingresos: metricas.totalIngresos || 0
  };
  
  const calculadas = {
    porcentaje_activos: (metricas.totalLideres || 0) > 0 ? 
      Math.round(((metricas.activosRecibiendoCelula || 0) / (metricas.totalLideres || 1)) * 100) : 0,
    porcentaje_alerta: (metricas.totalLideres || 0) > 0 ? 
      Math.round(((metricas.alerta2_3Semanas || 0) / (metricas.totalLideres || 1)) * 100) : 0,
    porcentaje_critico: (metricas.totalLideres || 0) > 0 ? 
      Math.round(((metricas.criticoMas1Mes || 0) / (metricas.totalLideres || 1)) * 100) : 0
  };
  
  return { fila1, fila2, calculadas };
}

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
    
    // ✅ DEBUG: Verificar valores leídos
    console.log('[MetricasModule] Valores leídos de _ResumenDashboard:');
    console.log('B1 (totalRecibiendoCelulas):', metricasValues[0][0]);
    console.log('B2 (activosRecibiendoCelula):', metricasValues[1][0]);
    console.log('B3 (alerta2_3Semanas):', metricasValues[2][0]);
    console.log('B4 (criticoMas1Mes):', metricasValues[3][0]);
    console.log('B5 (lideresInactivos):', metricasValues[4][0]);
    console.log('B6 (totalLideres):', metricasValues[5][0]);
    console.log('B7 (totalCelulas):', metricasValues[6][0]);
    console.log('B8 (totalIngresos):', metricasValues[7][0]);
    
    // ✅ USAR DATOS REALES DE LA HOJA (confirmados por diagnóstico)
    const stats = {
      totalRecibiendoCelulas: metricasValues[0][0] || 0, // 87
      activosRecibiendoCelula: metricasValues[1][0] || 0, // 58
      alerta2_3Semanas: metricasValues[2][0] || 0, // 17
      criticoMas1Mes: metricasValues[3][0] || 0, // 11
      lideresInactivos: metricasValues[4][0] || 0, // 16
      totalLideres: metricasValues[5][0] || 0, // 68
      totalCelulas: metricasValues[6][0] || 0, // 46
      totalIngresos: metricasValues[7][0] || 0, // 1784
      timestamp: new Date().toISOString()
    };
    
    console.log('[MetricasModule] ✅ Usando datos reales de _ResumenDashboard');
    
    // ✅ DEBUG: Verificar stats construidos
    console.log('[MetricasModule] Stats construidos:', stats);
    
    // ✅ NORMALIZACIÓN: Transformar a estructura que espera el frontend
    const { fila1, fila2, calculadas } = transformarMetricasParaFrontend(stats);
    
    return {
      success: true,
      data: {
        // ✅ ESTRUCTURA QUE ESPERA EL FRONTEND
        fila1: fila1,
        fila2: fila2,
        calculadas: calculadas,
        
        // ✅ MANTENER COMPATIBILIDAD CON CÓDIGO EXISTENTE
        totales: stats,
        timestamp: stats.timestamp
      }
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
        // ✅ ESTRUCTURA NORMALIZADA: Exponer estructura anidada
        resumen: {
          fila1: stats.data.fila1,
          fila2: stats.data.fila2,
          calculadas: stats.data.calculadas,
          totales: stats.data.totales, // Mantener compatibilidad
          timestamp: stats.data.timestamp
        },
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

/**
 * 🔍 FUNCIÓN DE DIAGNÓSTICO REAL: Verificar toda la cadena de datos
 * @returns {Object} Diagnóstico completo de la cadena
 */
function diagnosticarCadenaCompleta() {
  try {
    console.log('🔍 DIAGNÓSTICO COMPLETO: Verificando toda la cadena de datos...');
    
    // 1. Verificar _ResumenDashboard
    const ss = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    const resumenSheet = ss.getSheetByName('_ResumenDashboard');
    
    if (!resumenSheet) {
      console.error('❌ Hoja _ResumenDashboard no encontrada');
      return { error: 'Hoja no encontrada' };
    }
    
    const metricasValues = resumenSheet.getRange('B1:B10').getValues();
    console.log('📊 Datos de _ResumenDashboard:', metricasValues);
    
    // 2. Simular getEstadisticasRapidas()
    const stats = {
      totalRecibiendoCelulas: metricasValues[0][0] || 0,
      activosRecibiendoCelula: metricasValues[1][0] || 0,
      alerta2_3Semanas: metricasValues[2][0] || 0,
      criticoMas1Mes: metricasValues[3][0] || 0,
      lideresInactivos: metricasValues[4][0] || 0,
      totalLideres: metricasValues[5][0] || 0,
      totalCelulas: metricasValues[6][0] || 0,
      totalIngresos: metricasValues[7][0] || 0,
      timestamp: new Date().toISOString()
    };
    
    console.log('📊 Stats construidos:', stats);
    
    // 3. Simular transformarMetricasParaFrontend()
    const fila1 = {
      activos_recibiendo_celula: stats.activosRecibiendoCelula || 0,
      lideres_hibernando: stats.lideresInactivos || 0,
      total_lideres: stats.totalLideres || 0,
      total_asistencia_celulas: stats.totalRecibiendoCelulas || 0
    };
    
    const fila2 = {
      alerta_2_3_semanas: stats.alerta2_3Semanas || 0,
      critico_mas_1_mes: stats.criticoMas1Mes || 0,
      total_celulas: stats.totalCelulas || 0,
      total_ingresos: stats.totalIngresos || 0
    };
    
    const calculadas = {
      porcentaje_activos: (stats.totalLideres || 0) > 0 ? 
        Math.round(((stats.activosRecibiendoCelula || 0) / (stats.totalLideres || 1)) * 100) : 0,
      porcentaje_alerta: (stats.totalLideres || 0) > 0 ? 
        Math.round(((stats.alerta2_3Semanas || 0) / (stats.totalLideres || 1)) * 100) : 0,
      porcentaje_critico: (stats.totalLideres || 0) > 0 ? 
        Math.round(((stats.criticoMas1Mes || 0) / (stats.totalLideres || 1)) * 100) : 0
    };
    
    console.log('📊 Fila1 (para frontend):', fila1);
    console.log('📊 Fila2 (para frontend):', fila2);
    console.log('📊 Calculadas (para frontend):', calculadas);
    
    // 4. Simular respuesta final
    const respuestaFinal = {
      success: true,
      data: {
        fila1: fila1,
        fila2: fila2,
        calculadas: calculadas,
        totales: stats,
        timestamp: stats.timestamp
      }
    };
    
    console.log('📊 Respuesta final completa:', respuestaFinal);
    
    return {
      success: true,
      datosOriginales: metricasValues,
      stats: stats,
      fila1: fila1,
      fila2: fila2,
      calculadas: calculadas,
      respuestaFinal: respuestaFinal
    };
    
  } catch (error) {
    console.error('❌ Error en diagnóstico completo:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}