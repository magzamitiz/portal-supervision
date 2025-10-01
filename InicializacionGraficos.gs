/**
 * @fileoverview Script de inicialización completa del sistema de gráficos
 * Integra todos los módulos y configura el sistema completo
 */

// ==================== FUNCIÓN PRINCIPAL DE INICIALIZACIÓN ====================

/**
 * Inicializa completamente el sistema de gráficos del dashboard
 * Esta es la función principal que debe ejecutarse una sola vez
 * @returns {Object} Resultado completo de la inicialización
 */
function inicializarSistemaCompletoGraficos() {
  try {
    console.log('🚀 INICIANDO CONFIGURACIÓN COMPLETA DEL SISTEMA DE GRÁFICOS');
    console.log('=' .repeat(60));
    
    const inicio = Date.now();
    const resultados = {};
    
    // PASO 1: Crear hojas de datos
    console.log('📊 PASO 1: Creando hojas de datos...');
    resultados.hojas = {
      graficos: crearHojaGraficosDashboard(),
      historico: crearHojaMetricasHistoricas()
    };
    
    if (!resultados.hojas.graficos || !resultados.hojas.historico) {
      throw new Error('No se pudieron crear las hojas necesarias');
    }
    console.log('✅ Hojas de datos creadas exitosamente');
    
    // PASO 2: Poblar datos iniciales
    console.log('📈 PASO 2: Poblando datos iniciales...');
    resultados.datosIniciales = {
      graficos: poblarDatosGraficos(true),
      historico: poblarDatosHistoricos()
    };
    
    if (!resultados.datosIniciales.graficos.success) {
      throw new Error('No se pudieron poblar los datos de gráficos');
    }
    console.log('✅ Datos iniciales poblados exitosamente');
    
    // PASO 3: Configurar triggers automáticos
    console.log('⏰ PASO 3: Configurando triggers automáticos...');
    resultados.triggers = configurarTriggersCompletos();
    
    if (!resultados.triggers.success) {
      console.warn('⚠️ Los triggers no se configuraron completamente');
    }
    console.log('✅ Triggers configurados exitosamente');
    
    // PASO 4: Verificar sistema
    console.log('🔍 PASO 4: Verificando sistema...');
    resultados.verificacion = verificarEstadoSistema();
    
    if (!resultados.verificacion.success) {
      console.warn('⚠️ La verificación del sistema encontró problemas');
    }
    console.log('✅ Verificación del sistema completada');
    
    // PASO 5: Generar código de integración
    console.log('💻 PASO 5: Generando código de integración...');
    resultados.codigoIntegracion = generarCodigoJavaScriptGraficos();
    console.log('✅ Código de integración generado');
    
    const tiempoTotal = Date.now() - inicio;
    
    const resultadoFinal = {
      success: true,
      mensaje: 'Sistema de gráficos inicializado completamente',
      tiempoEjecucion: `${tiempoTotal}ms`,
      resultados: resultados,
      proximosPasos: [
        '1. Los datos se actualizarán automáticamente cada 30 minutos',
        '2. Los datos históricos se actualizarán diariamente a las 6:00 AM',
        '3. El caché se limpiará semanalmente los domingos a las 2:00 AM',
        '4. Usa las funciones de integración para actualizar los gráficos en el frontend'
      ],
      funcionesDisponibles: [
        'actualizarGraficoActividadEquipo(idLD)',
        'actualizarGraficoSaludCelulas(idLD)',
        'obtenerDatosMatrizEfectividad(idLD)',
        'obtenerDatosFlujoTransicion(meses)',
        'actualizarTodosLosGraficos(idLD)',
        'verificarEstadoSistema()'
      ],
      timestamp: new Date().toISOString()
    };
    
    console.log('=' .repeat(60));
    console.log('🎉 SISTEMA DE GRÁFICOS INICIALIZADO EXITOSAMENTE');
    console.log(`⏱️ Tiempo total: ${tiempoTotal}ms`);
    console.log('=' .repeat(60));
    
    return resultadoFinal;
    
  } catch (error) {
    console.error('❌ ERROR CRÍTICO EN LA INICIALIZACIÓN:', error);
    return {
      success: false,
      error: error.toString(),
      mensaje: 'La inicialización falló. Revisa los logs para más detalles.',
      timestamp: new Date().toISOString()
    };
  }
}

// ==================== FUNCIONES DE MANTENIMIENTO ====================

/**
 * Ejecuta mantenimiento completo del sistema de gráficos
 * @returns {Object} Resultado del mantenimiento
 */
function ejecutarMantenimientoCompleto() {
  try {
    console.log('🔧 Ejecutando mantenimiento completo del sistema...');
    
    const inicio = Date.now();
    const resultados = {};
    
    // 1. Limpiar caché
    console.log('🧹 Limpiando caché...');
    resultados.limpiezaCache = limpiarCacheGraficos();
    
    // 2. Actualizar datos
    console.log('📊 Actualizando datos...');
    resultados.actualizacionDatos = {
      graficos: poblarDatosGraficos(true),
      historico: poblarDatosHistoricos()
    };
    
    // 3. Verificar triggers
    console.log('⏰ Verificando triggers...');
    const triggersActivos = obtenerTriggersActivos();
    resultados.triggers = {
      total: triggersActivos.length,
      activos: triggersActivos
    };
    
    // 4. Verificar estado general
    console.log('🔍 Verificando estado general...');
    resultados.estadoGeneral = verificarEstadoSistema();
    
    const tiempoTotal = Date.now() - inicio;
    
    console.log(`✅ Mantenimiento completado en ${tiempoTotal}ms`);
    
    return {
      success: true,
      tiempoEjecucion: `${tiempoTotal}ms`,
      resultados: resultados,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error en mantenimiento:', error);
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Resetea completamente el sistema de gráficos
 * ⚠️ ADVERTENCIA: Esto eliminará todos los datos y configuración
 * @returns {Object} Resultado del reset
 */
function resetearSistemaGraficos() {
  try {
    console.log('⚠️ RESETEANDO SISTEMA DE GRÁFICOS - ESTO ELIMINARÁ TODOS LOS DATOS');
    
    // 1. Desactivar todos los triggers
    const desactivacion = desactivarTriggersGraficos();
    
    // 2. Eliminar hojas de datos
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    
    try {
      const sheetGraficos = spreadsheet.getSheetByName(GRAFICOS_CONFIG.SHEET_GRAFICOS);
      if (sheetGraficos) {
        spreadsheet.deleteSheet(sheetGraficos);
        console.log('🗑️ Hoja de gráficos eliminada');
      }
    } catch (e) {
      console.log('ℹ️ Hoja de gráficos no existía');
    }
    
    try {
      const sheetHistorico = spreadsheet.getSheetByName(GRAFICOS_CONFIG.SHEET_HISTORICO);
      if (sheetHistorico) {
        spreadsheet.deleteSheet(sheetHistorico);
        console.log('🗑️ Hoja histórica eliminada');
      }
    } catch (e) {
      console.log('ℹ️ Hoja histórica no existía');
    }
    
    // 3. Limpiar caché
    clearCache();
    
    console.log('✅ Sistema de gráficos reseteado completamente');
    
    return {
      success: true,
      mensaje: 'Sistema reseteado. Ejecuta inicializarSistemaCompletoGraficos() para reconfigurar.',
      desactivacion: desactivacion,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error reseteando sistema:', error);
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

// ==================== FUNCIONES DE DIAGNÓSTICO ====================

/**
 * Genera un reporte completo del estado del sistema
 * @returns {Object} Reporte detallado del sistema
 */
function generarReporteSistema() {
  try {
    console.log('📋 Generando reporte del sistema...');
    
    const estado = verificarEstadoSistema();
    const triggers = obtenerTriggersActivos();
    
    // Obtener estadísticas de datos
    const datosGraficos = obtenerDatosGraficos();
    const datosHistoricos = obtenerDatosHistoricos(12); // Últimos 12 meses
    
    const reporte = {
      timestamp: new Date().toISOString(),
      estadoGeneral: estado.success ? 'OPERATIVO' : 'CON PROBLEMAS',
      triggers: {
        total: triggers.length,
        configuracionCorrecta: triggers.length >= 3,
        detalle: triggers
      },
      datos: {
        graficos: {
          disponibles: datosGraficos.success,
          totalLCF: datosGraficos.total || 0,
          ultimaActualizacion: datosGraficos.timestamp
        },
        historico: {
          disponibles: datosHistoricos.success,
          totalMeses: datosHistoricos.total || 0,
          ultimaActualizacion: datosHistoricos.timestamp
        }
      },
      recomendaciones: []
    };
    
    // Generar recomendaciones
    if (triggers.length < 3) {
      reporte.recomendaciones.push('Configurar triggers faltantes ejecutando configurarTriggersCompletos()');
    }
    
    if (!datosGraficos.success) {
      reporte.recomendaciones.push('Actualizar datos de gráficos ejecutando poblarDatosGraficos(true)');
    }
    
    if (!datosHistoricos.success) {
      reporte.recomendaciones.push('Actualizar datos históricos ejecutando poblarDatosHistoricos()');
    }
    
    if (reporte.recomendaciones.length === 0) {
      reporte.recomendaciones.push('Sistema funcionando correctamente. No se requieren acciones.');
    }
    
    console.log('✅ Reporte del sistema generado');
    return reporte;
    
  } catch (error) {
    console.error('❌ Error generando reporte:', error);
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

// ==================== FUNCIONES DE UTILIDAD ====================

/**
 * Función de prueba para verificar que todo funciona correctamente
 * @returns {Object} Resultado de las pruebas
 */
function ejecutarPruebasSistema() {
  try {
    console.log('🧪 Ejecutando pruebas del sistema...');
    
    const pruebas = {
      hojasExisten: false,
      datosDisponibles: false,
      triggersActivos: false,
      funcionesIntegracion: false
    };
    
    // Prueba 1: Verificar hojas
    try {
      const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
      const sheetGraficos = spreadsheet.getSheetByName(GRAFICOS_CONFIG.SHEET_GRAFICOS);
      const sheetHistorico = spreadsheet.getSheetByName(GRAFICOS_CONFIG.SHEET_HISTORICO);
      pruebas.hojasExisten = !!(sheetGraficos && sheetHistorico);
    } catch (e) {
      console.log('❌ Prueba de hojas falló:', e.message);
    }
    
    // Prueba 2: Verificar datos
    try {
      const datos = obtenerDatosGraficos();
      pruebas.datosDisponibles = datos.success && datos.total > 0;
    } catch (e) {
      console.log('❌ Prueba de datos falló:', e.message);
    }
    
    // Prueba 3: Verificar triggers
    try {
      const triggers = obtenerTriggersActivos();
      pruebas.triggersActivos = triggers.length >= 3;
    } catch (e) {
      console.log('❌ Prueba de triggers falló:', e.message);
    }
    
    // Prueba 4: Verificar funciones de integración
    try {
      const resultado = actualizarTodosLosGraficos();
      pruebas.funcionesIntegracion = resultado.success;
    } catch (e) {
      console.log('❌ Prueba de funciones de integración falló:', e.message);
    }
    
    const todasLasPruebas = Object.values(pruebas).every(p => p === true);
    
    console.log(todasLasPruebas ? '✅ Todas las pruebas pasaron' : '⚠️ Algunas pruebas fallaron');
    
    return {
      success: todasLasPruebas,
      pruebas: pruebas,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error ejecutando pruebas:', error);
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}
