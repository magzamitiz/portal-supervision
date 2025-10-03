/**
 * METRICAS MODULE - CÁLCULO DE MÉTRICAS
 * Etapa 2 - Semana 2: Separación en módulos
 * 
 * Este módulo contiene toda la lógica relacionada con el cálculo
 * de métricas y KPIs manteniendo 100% compatibilidad.
 */

// ==================== CONFIGURACIÓN DEL MÓDULO ====================

const METRICAS_CONFIG = {
  UMBRALES: {
    LCF_POR_LD: {
      OPTIMO: 10,
      MODERADO: 20,
      ALTO: 30
    },
    CELULAS_POR_LCF: {
      OPTIMO: 3,
      MODERADO: 5,
      ALTO: 8
    },
    MIEMBROS_POR_CELULA: {
      MINIMO: 3,
      IDEAL: 8,
      MAXIMO: 12
    },
    TASA_INTEGRACION: {
      EXCELENTE: 80,
      BUENA: 60,
      REGULAR: 40
    }
  },
  
  PERIODOS: {
    HOY: 0,
    SEMANA: 7,
    MES: 30,
    TRIMESTRE: 90,
    AÑO: 365
  }
};

// ==================== FUNCIONES DE CÁLCULO DE MÉTRICAS ====================

/**
 * Calcula métricas principales del dashboard
 * @param {Object} datos - Datos consolidados
 * @returns {Object} Métricas calculadas
 */
function calcularMetricasPrincipales(datos) {
  try {
    console.log('[MetricasModule] Calculando métricas principales...');
    
    const { lideres, celulas, ingresos } = datos;
    
    // Métricas de líderes
    const metricasLideres = calcularMetricasLideres(lideres);
    
    // Métricas de células
    const metricasCelulas = calcularMetricasCelulas(celulas);
    
    // Métricas de ingresos
    const metricasIngresos = calcularMetricasIngresos(ingresos);
    
    // Métricas consolidadas
    const metricas = {
      lideres: metricasLideres,
      celulas: metricasCelulas,
      ingresos: metricasIngresos,
      consolidadas: calcularMetricasConsolidadas(metricasLideres, metricasCelulas, metricasIngresos)
    };
    
    console.log('[MetricasModule] Métricas principales calculadas');
    return metricas;
    
  } catch (error) {
    console.error('[MetricasModule] Error calculando métricas principales:', error);
    return {
      lideres: {},
      celulas: {},
      ingresos: {},
      consolidadas: {}
    };
  }
}

/**
 * Calcula métricas de líderes
 * @param {Array} lideres - Array de líderes
 * @returns {Object} Métricas de líderes
 */
function calcularMetricasLideres(lideres) {
  try {
    const totalLideres = lideres.length;
    const ldCount = lideres.filter(l => l.Rol === 'LD').length;
    const lcfCount = lideres.filter(l => l.Rol === 'LCF').length;
    const lmCount = lideres.filter(l => l.Rol === 'LM').length;
    const sgCount = lideres.filter(l => l.Rol === 'SG' || l.Rol === 'SMALL GROUP').length;
    
    const activos = lideres.filter(l => l.Estado_Actividad === 'Activo').length;
    const inactivos = lideres.filter(l => l.Estado_Actividad === 'Inactivo').length;
    
    return {
      total_lideres: totalLideres,
      total_LD: ldCount,
      total_LCF: lcfCount,
      total_LM: lmCount,
      total_SG: sgCount,
      promedio_lcf_por_ld: ldCount > 0 ? (lcfCount / ldCount).toFixed(1) : 0,
      tasa_actividad: totalLideres > 0 ? ((activos / totalLideres) * 100).toFixed(1) : 0,
      tasa_inactividad: totalLideres > 0 ? ((inactivos / totalLideres) * 100).toFixed(1) : 0,
      carga_lcf_ld: ldCount > 0 ? evaluarCargaLCF(ldCount, lcfCount) : 'Sin datos'
    };
    
  } catch (error) {
    console.error('[MetricasModule] Error calculando métricas de líderes:', error);
    return {};
  }
}

/**
 * Calcula métricas de células
 * @param {Array} celulas - Array de células
 * @returns {Object} Métricas de células
 */
function calcularMetricasCelulas(celulas) {
  try {
    const totalCelulas = celulas.length;
    const celulasActivas = celulas.filter(c => c.Estado !== 'Vacía').length;
    const celulasVacias = totalCelulas - celulasActivas;
    const celulasListasMultiplicar = celulas.filter(c => c.Estado === 'Lista para Multiplicar').length;
    
    const totalMiembros = celulas.reduce((sum, celula) => sum + obtenerTotalMiembros(celula), 0);
    const promedioMiembros = totalCelulas > 0 ? (totalMiembros / totalCelulas).toFixed(1) : 0;
    
    return {
      total_celulas: totalCelulas,
      celulas_activas: celulasActivas,
      celulas_vacias: celulasVacias,
      celulas_listas_multiplicar: celulasListasMultiplicar,
      tasa_ocupacion: totalCelulas > 0 ? ((celulasActivas / totalCelulas) * 100).toFixed(1) : 0,
      total_miembros: totalMiembros,
      promedio_miembros: promedioMiembros,
      salud_celulas: evaluarSaludCelulas(celulas)
    };
    
  } catch (error) {
    console.error('[MetricasModule] Error calculando métricas de células:', error);
    return {};
  }
}

/**
 * Calcula métricas de ingresos
 * @param {Array} ingresos - Array de ingresos
 * @returns {Object} Métricas de ingresos
 */
function calcularMetricasIngresos(ingresos) {
  try {
    const totalIngresos = ingresos.length;
    
    // ✅ OPTIMIZACIÓN: Un solo pase por el array para calcular todas las métricas
    const hoy = new Date();
    const hoyFormatted = Utilities.formatDate(hoy, CONFIG.TIMEZONE, 'yyyy-MM-dd');
    
    let asignados = 0;
    let enCelula = 0;
    let aceptaronJesus = 0;
    let deseanVisita = 0;
    let ingresosHoy = 0;
    let ingresosSemana = 0;
    let ingresosMes = 0;
    
    // Procesar todos los ingresos en un solo bucle
    ingresos.forEach(ingreso => {
      // Estados de asignación
      if (ingreso.Estado_Asignacion === 'Asignado') asignados++;
      if (ingreso.En_Celula) enCelula++;
      
      // Decisiones espirituales
      if (ingreso.Acepto_Jesus === 'SI' || ingreso.Acepto_Jesus === 'SÍ') aceptaronJesus++;
      if (ingreso.Desea_Visita === 'SI' || ingreso.Desea_Visita === 'SÍ') deseanVisita++;
      
      // Análisis temporal
      if (ingreso.Timestamp) {
        const fechaIngreso = new Date(ingreso.Timestamp);
        const fechaFormatted = Utilities.formatDate(fechaIngreso, CONFIG.TIMEZONE, 'yyyy-MM-dd');
        const diasDiferencia = Math.floor((hoy - fechaIngreso) / (1000 * 60 * 60 * 24));
        
        if (fechaFormatted === hoyFormatted) ingresosHoy++;
        if (diasDiferencia <= 7) ingresosSemana++;
        if (diasDiferencia <= 30) ingresosMes++;
      }
    });
    
    return {
      total_historico: totalIngresos,
      ingresos_hoy: ingresosHoy,
      ingresos_semana: ingresosSemana,
      ingresos_mes: ingresosMes,
      asignados: asignados,
      pendientes: totalIngresos - asignados,
      en_celula: enCelula,
      sin_celula: totalIngresos - enCelula,
      aceptaron_jesus: aceptaronJesus,
      desean_visita: deseanVisita,
      tasa_asignacion: totalIngresos > 0 ? ((asignados / totalIngresos) * 100).toFixed(1) : 0,
      tasa_integracion: totalIngresos > 0 ? ((enCelula / totalIngresos) * 100).toFixed(1) : 0,
      tasa_aceptacion_jesus: totalIngresos > 0 ? ((aceptaronJesus / totalIngresos) * 100).toFixed(1) : 0,
      tasa_desean_visita: totalIngresos > 0 ? ((deseanVisita / totalIngresos) * 100).toFixed(1) : 0
    };
    
  } catch (error) {
    console.error('[MetricasModule] Error calculando métricas de ingresos:', error);
    return {};
  }
}

/**
 * Calcula métricas consolidadas
 * @param {Object} metricasLideres - Métricas de líderes
 * @param {Object} metricasCelulas - Métricas de células
 * @param {Object} metricasIngresos - Métricas de ingresos
 * @returns {Object} Métricas consolidadas
 */
function calcularMetricasConsolidadas(metricasLideres, metricasCelulas, metricasIngresos) {
  try {
    const totalLideres = metricasLideres.total_lideres || 0;
    const totalCelulas = metricasCelulas.total_celulas || 0;
    const totalIngresos = metricasIngresos.total_historico || 0;
    
    return {
      total_lideres: totalLideres,
      total_celulas: totalCelulas,
      total_ingresos: totalIngresos,
      promedio_celulas_por_ld: totalLideres > 0 ? (totalCelulas / totalLideres).toFixed(1) : 0,
      promedio_ingresos_por_ld: totalLideres > 0 ? (totalIngresos / totalLideres).toFixed(1) : 0,
      salud_general: evaluarSaludGeneral(metricasLideres, metricasCelulas, metricasIngresos),
      tendencias: calcularTendencias(metricasIngresos)
    };
    
  } catch (error) {
    console.error('[MetricasModule] Error calculando métricas consolidadas:', error);
    return {};
  }
}

// ==================== FUNCIONES DE EVALUACIÓN ====================

/**
 * Evalúa la carga de LCF por LD
 * @param {number} ldCount - Cantidad de LD
 * @param {number} lcfCount - Cantidad de LCF
 * @returns {string} Evaluación de la carga
 */
function evaluarCargaLCF(ldCount, lcfCount) {
  const promedio = ldCount > 0 ? lcfCount / ldCount : 0;
  
  if (promedio <= METRICAS_CONFIG.UMBRALES.LCF_POR_LD.OPTIMO) {
    return 'Óptima';
  } else if (promedio <= METRICAS_CONFIG.UMBRALES.LCF_POR_LD.MODERADO) {
    return 'Moderada';
  } else if (promedio <= METRICAS_CONFIG.UMBRALES.LCF_POR_LD.ALTO) {
    return 'Alta';
  } else {
    return 'Crítica';
  }
}

/**
 * Evalúa la salud de las células
 * @param {Array} celulas - Array de células
 * @returns {string} Evaluación de la salud
 */
function evaluarSaludCelulas(celulas) {
  const totalCelulas = celulas.length;
  if (totalCelulas === 0) return 'Sin datos';
  
  const celulasSaludables = celulas.filter(c => 
    c.Estado === 'Saludable' || c.Estado === 'En Crecimiento'
  ).length;
  
  const porcentajeSaludables = (celulasSaludables / totalCelulas) * 100;
  
  if (porcentajeSaludables >= 70) {
    return 'Excelente';
  } else if (porcentajeSaludables >= 50) {
    return 'Buena';
  } else if (porcentajeSaludables >= 30) {
    return 'Regular';
  } else {
    return 'Crítica';
  }
}

/**
 * Evalúa la salud general del sistema
 * @param {Object} metricasLideres - Métricas de líderes
 * @param {Object} metricasCelulas - Métricas de células
 * @param {Object} metricasIngresos - Métricas de ingresos
 * @returns {string} Evaluación de la salud general
 */
function evaluarSaludGeneral(metricasLideres, metricasCelulas, metricasIngresos) {
  try {
    const indicadores = [];
    
    // Indicador de actividad de líderes
    const tasaActividad = parseFloat(metricasLideres.tasa_actividad || 0);
    if (tasaActividad >= 80) indicadores.push('Líderes activos');
    else if (tasaActividad < 50) indicadores.push('Líderes inactivos');
    
    // Indicador de ocupación de células
    const tasaOcupacion = parseFloat(metricasCelulas.tasa_ocupacion || 0);
    if (tasaOcupacion >= 80) indicadores.push('Células ocupadas');
    else if (tasaOcupacion < 50) indicadores.push('Células vacías');
    
    // Indicador de integración de ingresos
    const tasaIntegracion = parseFloat(metricasIngresos.tasa_integracion || 0);
    if (tasaIntegracion >= 60) indicadores.push('Buena integración');
    else if (tasaIntegracion < 30) indicadores.push('Baja integración');
    
    // Determinar salud general
    const indicadoresPositivos = indicadores.filter(i => 
      i.includes('activos') || i.includes('ocupadas') || i.includes('Buena')
    ).length;
    
    const totalIndicadores = indicadores.length;
    
    if (totalIndicadores === 0) return 'Sin datos';
    
    const porcentajePositivo = (indicadoresPositivos / totalIndicadores) * 100;
    
    if (porcentajePositivo >= 80) {
      return 'Excelente';
    } else if (porcentajePositivo >= 60) {
      return 'Buena';
    } else if (porcentajePositivo >= 40) {
      return 'Regular';
    } else {
      return 'Necesita atención';
    }
    
  } catch (error) {
    console.error('[MetricasModule] Error evaluando salud general:', error);
    return 'Error en evaluación';
  }
}

/**
 * Calcula tendencias de ingresos
 * @param {Object} metricasIngresos - Métricas de ingresos
 * @returns {Object} Tendencias calculadas
 */
function calcularTendencias(metricasIngresos) {
  try {
    const ingresosHoy = metricasIngresos.ingresos_hoy || 0;
    const ingresosSemana = metricasIngresos.ingresos_semana || 0;
    const ingresosMes = metricasIngresos.ingresos_mes || 0;
    
    // Calcular promedios
    const promedioDiario = ingresosSemana / 7;
    const promedioSemanal = ingresosMes / 4;
    
    // Determinar tendencias
    const tendenciaDiaria = ingresosHoy > promedioDiario ? 'Alza' : 
                           ingresosHoy < promedioDiario ? 'Baja' : 'Estable';
    
    const tendenciaSemanal = ingresosSemana > promedioSemanal ? 'Alza' : 
                            ingresosSemana < promedioSemanal ? 'Baja' : 'Estable';
    
    return {
      promedio_diario: promedioDiario.toFixed(1),
      promedio_semanal: promedioSemanal.toFixed(1),
      tendencia_diaria: tendenciaDiaria,
      tendencia_semanal: tendenciaSemanal,
      proyeccion_mensual: (promedioDiario * 30).toFixed(0)
    };
    
  } catch (error) {
    console.error('[MetricasModule] Error calculando tendencias:', error);
    return {
      promedio_diario: 0,
      promedio_semanal: 0,
      tendencia_diaria: 'Sin datos',
      tendencia_semanal: 'Sin datos',
      proyeccion_mensual: 0
    };
  }
}

// ==================== FUNCIONES DE ANÁLISIS TEMPORAL ====================

/**
 * Analiza métricas por período
 * @param {Array} datos - Datos históricos
 * @param {string} periodo - Período a analizar
 * @returns {Object} Análisis del período
 */
function analizarMetricasPorPeriodo(datos, periodo) {
  try {
    const hoy = new Date();
    let fechaInicio;
    
    switch (periodo) {
      case 'hoy':
        fechaInicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        break;
      case 'semana':
        fechaInicio = new Date(hoy.getTime() - (7 * 24 * 60 * 60 * 1000));
        break;
      case 'mes':
        fechaInicio = new Date(hoy.getTime() - (30 * 24 * 60 * 60 * 1000));
        break;
      case 'trimestre':
        fechaInicio = new Date(hoy.getTime() - (90 * 24 * 60 * 60 * 1000));
        break;
      default:
        fechaInicio = new Date(0); // Desde el inicio
    }
    
    const datosFiltrados = datos.filter(d => {
      if (!d.Timestamp) return false;
      const fechaDato = new Date(d.Timestamp);
      return fechaDato >= fechaInicio;
    });
    
    return {
      periodo: periodo,
      fecha_inicio: fechaInicio,
      total_registros: datosFiltrados.length,
      datos: datosFiltrados
    };
    
  } catch (error) {
    console.error('[MetricasModule] Error analizando métricas por período:', error);
    return {
      periodo: periodo,
      fecha_inicio: null,
      total_registros: 0,
      datos: []
    };
  }
}

// ==================== FUNCIONES DE COMPATIBILIDAD ====================

/**
 * Función de compatibilidad para estadísticas rápidas (usa hoja _ResumenDashboard como original)
 * @returns {Object} Estadísticas rápidas
 */
/**
 * Obtiene estadísticas rápidas sin cargar todo el directorio
 * Usa caché agresivo de 30 segundos para máxima velocidad
 */
/**
 * Obtiene estadísticas rápidas sin cargar todo el directorio
 * Usa caché agresivo de 30 segundos para máxima velocidad
 * VERSIÓN CORREGIDA: Usa getCacheData() para acceder a DASHBOARD_DATA_V2
 */
function getEstadisticasRapidas() {
  Logger.log('[getEstadisticasRapidas] 🚀 Iniciando con sistema unificado V3...');
  const startTime = Date.now();
  
  try {
    // ✅ NIVEL 1: Usar nuevo sistema unificado V3
    const cached = UnifiedCache.get(UnifiedCache.getKEYS().STATS);
    if (cached) {
      const timeElapsed = Date.now() - startTime;
      Logger.log('[getEstadisticasRapidas] ✅ Cache HIT unificado V3 - ' + timeElapsed + 'ms');
      return cached;
    }
    
    // ✅ NIVEL 2: Fallback al sistema anterior (compatibilidad)
    const cache = CacheService.getScriptCache();
    const cachedLegacy = cache.get('STATS_RAPIDAS_V2');
    if (cachedLegacy) {
      const timeElapsed = Date.now() - startTime;
      Logger.log('[getEstadisticasRapidas] ✅ Cache HIT legacy - ' + timeElapsed + 'ms');
      return JSON.parse(cachedLegacy);
    }
    
    Logger.log('[getEstadisticasRapidas] ⚠️ Cache MISS - Buscando en directorio...');
    
    // ✅ NIVEL 3: Usar getCacheData() que maneja DASHBOARD_DATA_V2 correctamente
    const datos = getCacheData();
    
    if (datos && datos.lideres) {
      Logger.log('[getEstadisticasRapidas] ✅ Datos encontrados en DASHBOARD_DATA_V2');
      
      // ✅ ACTUALIZADO: Leer desde _ResumenDashboard para obtener las nuevas métricas
      Logger.log('[getEstadisticasRapidas] 📊 Leyendo métricas desde _ResumenDashboard...');
      
      let nuevasMetricas = null;
      try {
        const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
        const resumenSheet = spreadsheet.getSheetByName('_ResumenDashboard');
        
        if (resumenSheet) {
          const valores = resumenSheet.getRange('B1:B5').getValues();
          nuevasMetricas = {
            total_recibiendo_celulas: parseInt(valores[0][0]) || 0,
            activos_recibiendo_celula: parseInt(valores[1][0]) || 0,
            alerta_2_3_semanas: parseInt(valores[2][0]) || 0,
            critico_mas_1_mes: parseInt(valores[3][0]) || 0,
            lideres_inactivos: parseInt(valores[4][0]) || 0
          };
          Logger.log('[getEstadisticasRapidas] ✅ Métricas leídas desde _ResumenDashboard:', nuevasMetricas);
        }
      } catch (error) {
        Logger.log('[getEstadisticasRapidas] ⚠️ Error leyendo _ResumenDashboard:', error);
      }
      
      const stats = {
        success: true,
        data: {
          actividad: nuevasMetricas || {
            total_recibiendo_celulas: 0,
            activos_recibiendo_celula: 0,
            alerta_2_3_semanas: 0,
            critico_mas_1_mes: 0,
            lideres_inactivos: 0
          },
          metricas: nuevasMetricas ? {
            porcentaje_activos: nuevasMetricas.total_recibiendo_celulas > 0 ? 
              ((nuevasMetricas.activos_recibiendo_celula / nuevasMetricas.total_recibiendo_celulas) * 100).toFixed(1) : 0,
            porcentaje_alerta: nuevasMetricas.total_recibiendo_celulas > 0 ? 
              ((nuevasMetricas.alerta_2_3_semanas / nuevasMetricas.total_recibiendo_celulas) * 100).toFixed(1) : 0,
            porcentaje_critico: nuevasMetricas.total_recibiendo_celulas > 0 ? 
              ((nuevasMetricas.critico_mas_1_mes / nuevasMetricas.total_recibiendo_celulas) * 100).toFixed(1) : 0
          } : {},
          timestamp: new Date().toISOString()
        }
      };
      
      // Cachear stats en sistema unificado (5 minutos)
      UnifiedCache.set(UnifiedCache.getKEYS().STATS, stats, UnifiedCache.getTTL().STATS);
      
      const timeElapsed = Date.now() - startTime;
      Logger.log('[getEstadisticasRapidas] ✅ Completado desde caché - ' + timeElapsed + 'ms');
      return stats;
    }
    
    // ✅ NIVEL 3: Fallback a _ResumenDashboard solo si realmente no hay datos en caché
    Logger.log('[getEstadisticasRapidas] ⚠️ Sin caché ni memoria, usando conteos mínimos');
    Logger.log('[getEstadisticasRapidas] Cargando estadísticas mínimas desde _ResumenDashboard...');
    
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    const resumenSheet = spreadsheet.getSheetByName('_ResumenDashboard');
    
    if (!resumenSheet) {
      Logger.log('[getEstadisticasRapidas] ❌ Hoja _ResumenDashboard no encontrada');
      return { 
        success: false, 
        error: 'Hoja _ResumenDashboard no encontrada',
        data: null 
      };
    }
    
    const startMinimal = Date.now();
    const valores = resumenSheet.getRange('B1:B5').getValues();
    const timeMinimal = Date.now() - startMinimal;
    
    Logger.log(`[getEstadisticasRapidas] ✅ Nuevas métricas cargadas desde _ResumenDashboard en ${timeMinimal}ms`);
    
    const result = {
      success: true,
      data: {
        actividad: {
          total_recibiendo_celulas: parseInt(valores[0][0]) || 0,
          activos_recibiendo_celula: parseInt(valores[1][0]) || 0,
          alerta_2_3_semanas: parseInt(valores[2][0]) || 0,
          critico_mas_1_mes: parseInt(valores[3][0]) || 0,
          lideres_inactivos: parseInt(valores[4][0]) || 0
        },
        // Métricas calculadas
        metricas: {
          porcentaje_activos: valores[0][0] > 0 ? ((parseInt(valores[1][0]) / parseInt(valores[0][0])) * 100).toFixed(1) : 0,
          porcentaje_alerta: valores[0][0] > 0 ? ((parseInt(valores[2][0]) / parseInt(valores[0][0])) * 100).toFixed(1) : 0,
          porcentaje_critico: valores[0][0] > 0 ? ((parseInt(valores[3][0]) / parseInt(valores[0][0])) * 100).toFixed(1) : 0
        },
        timestamp: new Date().toISOString()
      }
    };
    
    // Cachear en sistema unificado (5 minutos)
    UnifiedCache.set(UnifiedCache.getKEYS().STATS, result, UnifiedCache.getTTL().STATS);
    
    const timeElapsed = Date.now() - startTime;
    Logger.log(`[getEstadisticasRapidas] ✅ Completado - ${timeElapsed}ms`);
    
    return result;
    
  } catch (error) {
    const timeElapsed = Date.now() - startTime;
    Logger.log(`[getEstadisticasRapidas] ❌ Error: ${error} (${timeElapsed}ms)`);
    return {
      success: false,
      error: error.toString(),
      data: null
    };
  }
}

/**
 * Carga solo los conteos básicos sin procesar datos completos
 * Usa getLastRow() que es mucho más rápido que cargar todo
 */
function cargarEstadisticasMinimas() {
  Logger.log('[getEstadisticasRapidas] Cargando estadísticas mínimas desde _ResumenDashboard...');
  const startTime = Date.now();
  
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    const resumenSheet = ss.getSheetByName('_ResumenDashboard');
    
    if (!resumenSheet) {
      throw new Error("La hoja de resumen '_ResumenDashboard' no fue encontrada.");
    }
    
    // Leer datos de la hoja _ResumenDashboard (muy rápido)
    const metricasValues = resumenSheet.getRange("B1:B5").getValues();
    
    const stats = {
      totalRecibiendoCelulas: metricasValues[0][0] || 0, // Total Recibiendo Células (B1)
      activosRecibiendoCelula: metricasValues[1][0] || 0, // Activos recibiendo célula (B2)
      alerta2_3Semanas: metricasValues[2][0] || 0, // 2 a 3 semanas sin recibir célula (B3)
      criticoMas1Mes: metricasValues[3][0] || 0, // Más de 1 mes sin recibir célula (B4)
      lideresInactivos: metricasValues[4][0] || 0, // Líderes Inactivos (B5)
      ultimaActualizacion: new Date().toISOString()
    };
    
    const timeElapsed = Date.now() - startTime;
    Logger.log('[getEstadisticasRapidas] ✅ Mínimas cargadas desde _ResumenDashboard en ' + timeElapsed + 'ms');
    
    return stats;
    
  } catch (error) {
    Logger.log('[getEstadisticasRapidas] ❌ Error en mínimas: ' + error);
    throw error;
  }
}

/**
 * Función de compatibilidad para métricas de LCF
 * @param {string} idLCF - ID del LCF
 * @returns {Object} Métricas del LCF
 */
function calcularMetricasLCF(idLCF) {
  try {
    console.log(`[MetricasModule] Calculando métricas para LCF: ${idLCF}`);
    
    // Obtener datos del LCF
    const seguimiento = getSeguimientoAlmasLCF_REAL(idLCF);
    if (!seguimiento.success) {
      return seguimiento;
    }
    
    const almas = seguimiento.almas;
    const totalAlmas = almas.length;
    
    // Calcular métricas específicas del LCF
    const bienvenidasCompletadas = almas.filter(a => a.Bienvenida && a.Bienvenida.completado).length;
    const visitasCompletadas = almas.filter(a => a.Visita_Bendicion && a.Visita_Bendicion.completado).length;
    const enCelula = almas.filter(a => a.En_Celula).length;
    const diasSinSeguimiento = almas.reduce((sum, a) => sum + (a.Dias_Sin_Seguimiento || 0), 0);
    
    return {
      success: true,
      lcf: seguimiento.lcf,
      metricas: {
        total_almas: totalAlmas,
        bienvenidas_completadas: bienvenidasCompletadas,
        visitas_completadas: visitasCompletadas,
        en_celula: enCelula,
        tasa_bienvenida: totalAlmas > 0 ? ((bienvenidasCompletadas / totalAlmas) * 100).toFixed(1) : 0,
        tasa_visita: totalAlmas > 0 ? ((visitasCompletadas / totalAlmas) * 100).toFixed(1) : 0,
        tasa_integracion: totalAlmas > 0 ? ((enCelula / totalAlmas) * 100).toFixed(1) : 0,
        promedio_dias_sin_seguimiento: totalAlmas > 0 ? (diasSinSeguimiento / totalAlmas).toFixed(1) : 0
      }
    };
    
  } catch (error) {
    console.error('[MetricasModule] Error calculando métricas LCF:', error);
    return {
      success: false,
      error: error.toString(),
      lcf: null,
      metricas: {}
    };
  }
}

/**
 * Test esencial para verificar funcionamiento de estadísticas
 */
function testEstadisticasEsencial() {
  Logger.log('🧪 TEST: Verificando corrección de getEstadisticasRapidas');
  Logger.log('');
  
  // Test 1: Limpiar caché y probar fallback
  Logger.log('--- Test 1: Sin caché (fallback a _ResumenDashboard) ---');
  clearCache();
  const t1 = Date.now();
  const resultado1 = getEstadisticasRapidas();
  const time1 = Date.now() - t1;
  
  Logger.log(`⏱️ Tiempo Test 1: ${time1}ms`);
  Logger.log(`📊 Resultado: ${resultado1.success ? '✅' : '❌'}`);
  if (resultado1.data) {
    Logger.log(`   - LD: ${resultado1.data.lideres?.total_LD || 0}`);
    Logger.log(`   - LCF: ${resultado1.data.lideres?.total_LCF || 0}`);
  }
  
  // Test 2: Cargar directorio completo
  Logger.log('');
  Logger.log('--- Test 2: Cargando directorio completo... ---');
  const t2 = Date.now();
  cargarDirectorioCompleto();
  const time2 = Date.now() - t2;
  Logger.log(`⏱️ Tiempo carga directorio: ${time2}ms`);
  
  // Test 3: Probar con caché poblado
  Logger.log('');
  Logger.log('--- Test 3: Con caché poblado (DASHBOARD_DATA_V2) ---');
  const t3 = Date.now();
  const resultado2 = getEstadisticasRapidas();
  const time3 = Date.now() - t3;
  
  Logger.log(`⏱️ Tiempo Test 3: ${time3}ms`);
  Logger.log(`📊 Resultado: ${resultado2.success ? '✅' : '❌'}`);
  if (resultado2.data) {
    Logger.log(`   - LD: ${resultado2.data.lideres?.total_LD || 0}`);
    Logger.log(`   - LCF: ${resultado2.data.lideres?.total_LCF || 0}`);
  }
  
  // Resumen
  Logger.log('');
  Logger.log('📊 RESUMEN:');
  Logger.log(`Test 1 (sin caché): ${time1}ms - ${time1 < 5000 ? '✅ RÁPIDO' : '⚠️ LENTO'}`);
  Logger.log(`Test 3 (con caché): ${time3}ms - ${time3 < 1000 ? '✅ RÁPIDO' : '⚠️ LENTO'}`);
  
  const mejora = time1 > 0 ? ((time1 - time3) / time1 * 100).toFixed(1) : 0;
  Logger.log(`Mejora con caché: ${mejora}%`);
  
  return {
    test1: { tiempo: time1, exitoso: resultado1.success },
    test3: { tiempo: time3, exitoso: resultado2.success },
    mejora: mejora + '%'
  };
}

/**
 * Test rápido para verificar nuevas métricas de actividad
 */
function testNuevasMetricas() {
  console.log('🧪 TEST: Probando getEstadisticasRapidas()');
  
  try {
    const resultado = getEstadisticasRapidas();
    console.log('✅ Resultado completo:', JSON.stringify(resultado, null, 2));
    
    if (resultado.success) {
      console.log('✅ SUCCESS: true');
      console.log('📊 Datos recibidos:', resultado.data);
      
      if (resultado.data.actividad) {
        console.log('✅ Estructura actividad encontrada:', resultado.data.actividad);
      } else {
        console.log('❌ No se encontró estructura actividad');
      }
      
      if (resultado.data.metricas) {
        console.log('✅ Estructura metricas encontrada:', resultado.data.metricas);
      } else {
        console.log('❌ No se encontró estructura metricas');
      }
    } else {
      console.log('❌ SUCCESS: false');
      console.log('❌ Error:', resultado.error);
    }
    
    return resultado;
    
  } catch (error) {
    console.error('❌ ERROR en test:', error);
    return { success: false, error: error.toString() };
  }
}

console.log('📊 MetricasModule cargado - Cálculo de métricas modularizado');
