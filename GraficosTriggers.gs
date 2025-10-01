/**
 * @fileoverview Configuración y gestión de triggers automáticos para gráficos
 * Maneja la actualización automática de datos de gráficos del dashboard
 */

// ==================== CONFIGURACIÓN DE TRIGGERS ====================

const TRIGGERS_CONFIG = {
  // Intervalos de actualización
  GRAFICOS_INTERVAL: 30, // minutos
  HISTORICO_HOUR: 6,     // hora del día (24h)
  
  // Nombres de funciones
  FUNCIONES: {
    GRAFICOS: 'poblarDatosGraficos',
    HISTORICO: 'poblarDatosHistoricos',
    LIMPIEZA: 'limpiarCacheGraficos'
  }
};

// ==================== FUNCIONES DE GESTIÓN DE TRIGGERS ====================

/**
 * Configura todos los triggers necesarios para el sistema de gráficos
 * @returns {Object} Resultado de la configuración
 */
function configurarTriggersCompletos() {
  try {
    console.log('🔧 Configurando triggers automáticos para gráficos...');
    
    // Limpiar triggers existentes
    const limpiezaExitosa = limpiarTriggersExistentes();
    if (!limpiezaExitosa) {
      console.warn('⚠️ No se pudieron limpiar todos los triggers existentes');
    }
    
    // Configurar trigger para datos de gráficos (cada 30 minutos)
    const triggerGraficos = configurarTriggerGraficos();
    
    // Configurar trigger para datos históricos (diario a las 6 AM)
    const triggerHistorico = configurarTriggerHistorico();
    
    // Configurar trigger de limpieza de caché (semanal)
    const triggerLimpieza = configurarTriggerLimpieza();
    
    // Verificar configuración
    const triggersActivos = obtenerTriggersActivos();
    
    const resultado = {
      success: true,
      triggers: {
        graficos: triggerGraficos,
        historico: triggerHistorico,
        limpieza: triggerLimpieza
      },
      totalActivos: triggersActivos.length,
      timestamp: new Date().toISOString()
    };
    
    console.log(`✅ Triggers configurados exitosamente: ${triggersActivos.length} activos`);
    return resultado;
    
  } catch (error) {
    console.error('❌ Error configurando triggers:', error);
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Configura trigger para actualización de datos de gráficos
 * @returns {Object} Información del trigger creado
 */
function configurarTriggerGraficos() {
  try {
    const trigger = ScriptApp.newTrigger(TRIGGERS_CONFIG.FUNCIONES.GRAFICOS)
                           .timeBased()
                           .everyMinutes(TRIGGERS_CONFIG.GRAFICOS_INTERVAL)
                           .create();
    
    console.log(`✅ Trigger de gráficos configurado: cada ${TRIGGERS_CONFIG.GRAFICOS_INTERVAL} minutos`);
    
    return {
      success: true,
      triggerId: trigger.getUniqueId(),
      funcion: TRIGGERS_CONFIG.FUNCIONES.GRAFICOS,
      intervalo: `${TRIGGERS_CONFIG.GRAFICOS_INTERVAL} minutos`,
      tipo: 'timeBased'
    };
    
  } catch (error) {
    console.error('❌ Error configurando trigger de gráficos:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Configura trigger para actualización de datos históricos
 * @returns {Object} Información del trigger creado
 */
function configurarTriggerHistorico() {
  try {
    const trigger = ScriptApp.newTrigger(TRIGGERS_CONFIG.FUNCIONES.HISTORICO)
                           .timeBased()
                           .everyDays(1)
                           .atHour(TRIGGERS_CONFIG.HISTORICO_HOUR)
                           .create();
    
    console.log(`✅ Trigger histórico configurado: diario a las ${TRIGGERS_CONFIG.HISTORICO_HOUR}:00`);
    
    return {
      success: true,
      triggerId: trigger.getUniqueId(),
      funcion: TRIGGERS_CONFIG.FUNCIONES.HISTORICO,
      horario: `${TRIGGERS_CONFIG.HISTORICO_HOUR}:00 diario`,
      tipo: 'timeBased'
    };
    
  } catch (error) {
    console.error('❌ Error configurando trigger histórico:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Configura trigger para limpieza de caché (semanal)
 * @returns {Object} Información del trigger creado
 */
function configurarTriggerLimpieza() {
  try {
    const trigger = ScriptApp.newTrigger(TRIGGERS_CONFIG.FUNCIONES.LIMPIEZA)
                           .timeBased()
                           .everyWeeks(1)
                           .onWeekDay(ScriptApp.WeekDay.SUNDAY)
                           .atHour(2)
                           .create();
    
    console.log('✅ Trigger de limpieza configurado: domingos a las 2:00 AM');
    
    return {
      success: true,
      triggerId: trigger.getUniqueId(),
      funcion: TRIGGERS_CONFIG.FUNCIONES.LIMPIEZA,
      horario: 'Domingos a las 2:00 AM',
      tipo: 'timeBased'
    };
    
  } catch (error) {
    console.error('❌ Error configurando trigger de limpieza:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Limpia todos los triggers existentes relacionados con gráficos
 * @returns {boolean} True si se limpiaron exitosamente
 */
function limpiarTriggersExistentes() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    let eliminados = 0;
    
    triggers.forEach(trigger => {
      const funcion = trigger.getHandlerFunction();
      if (Object.values(TRIGGERS_CONFIG.FUNCIONES).includes(funcion)) {
        ScriptApp.deleteTrigger(trigger);
        eliminados++;
        console.log(`🗑️ Trigger eliminado: ${funcion}`);
      }
    });
    
    console.log(`✅ ${eliminados} triggers existentes eliminados`);
    return true;
    
  } catch (error) {
    console.error('❌ Error limpiando triggers existentes:', error);
    return false;
  }
}

/**
 * Obtiene lista de triggers activos relacionados con gráficos
 * @returns {Array} Lista de triggers activos
 */
function obtenerTriggersActivos() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    const triggersGraficos = triggers.filter(trigger => {
      const funcion = trigger.getHandlerFunction();
      return Object.values(TRIGGERS_CONFIG.FUNCIONES).includes(funcion);
    });
    
    return triggersGraficos.map(trigger => ({
      id: trigger.getUniqueId(),
      funcion: trigger.getHandlerFunction(),
      tipo: trigger.getEventType().toString(),
      creado: trigger.getCreationDate()
    }));
    
  } catch (error) {
    console.error('❌ Error obteniendo triggers activos:', error);
    return [];
  }
}

// ==================== FUNCIONES DE MANTENIMIENTO ====================

/**
 * Función de limpieza de caché para gráficos (ejecutada por trigger)
 * @returns {Object} Resultado de la limpieza
 */
function limpiarCacheGraficos() {
  try {
    console.log('🧹 Iniciando limpieza de caché de gráficos...');
    
    // Limpiar caché principal
    const cacheLimpio = clearCache();
    
    // Forzar actualización de datos de gráficos
    const actualizacionGraficos = poblarDatosGraficos(true);
    
    // Forzar actualización de datos históricos
    const actualizacionHistorico = poblarDatosHistoricos();
    
    const resultado = {
      success: true,
      cacheLimpio: cacheLimpio,
      graficosActualizados: actualizacionGraficos.success,
      historicoActualizado: actualizacionHistorico.success,
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ Limpieza de caché completada');
    return resultado;
    
  } catch (error) {
    console.error('❌ Error en limpieza de caché:', error);
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Verifica el estado de todos los triggers y datos
 * @returns {Object} Estado completo del sistema
 */
function verificarEstadoSistema() {
  try {
    console.log('🔍 Verificando estado del sistema de gráficos...');
    
    // Verificar triggers
    const triggersActivos = obtenerTriggersActivos();
    
    // Verificar hojas de datos
    const hojaGraficos = verificarHojaGraficos();
    const hojaHistorico = verificarHojaHistorico();
    
    // Verificar datos recientes
    const datosGraficos = obtenerDatosGraficos();
    const datosHistoricos = obtenerDatosHistoricos(1);
    
    // Verificar caché
    const cacheData = getCacheData();
    
    const estado = {
      success: true,
      triggers: {
        total: triggersActivos.length,
        activos: triggersActivos,
        configuracionCorrecta: triggersActivos.length >= 3
      },
      hojas: {
        graficos: hojaGraficos,
        historico: hojaHistorico
      },
      datos: {
        graficos: {
          disponibles: datosGraficos.success,
          total: datosGraficos.total || 0
        },
        historico: {
          disponibles: datosHistoricos.success,
          total: datosHistoricos.total || 0
        }
      },
      cache: {
        disponible: cacheData !== null,
        timestamp: cacheData?.timestamp || null
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ Verificación del sistema completada');
    return estado;
    
  } catch (error) {
    console.error('❌ Error verificando estado del sistema:', error);
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Verifica si la hoja de gráficos existe y tiene datos
 * @returns {Object} Estado de la hoja
 */
function verificarHojaGraficos() {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    const sheet = spreadsheet.getSheetByName(GRAFICOS_CONFIG.SHEET_GRAFICOS);
    
    if (!sheet) {
      return { existe: false, filas: 0, error: 'Hoja no encontrada' };
    }
    
    const lastRow = sheet.getLastRow();
    return {
      existe: true,
      filas: lastRow - 1, // Excluir encabezado
      ultimaActualizacion: lastRow > 1 ? sheet.getRange(lastRow, 14).getValue() : null
    };
    
  } catch (error) {
    return { existe: false, filas: 0, error: error.toString() };
  }
}

/**
 * Verifica si la hoja de histórico existe y tiene datos
 * @returns {Object} Estado de la hoja
 */
function verificarHojaHistorico() {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    const sheet = spreadsheet.getSheetByName(GRAFICOS_CONFIG.SHEET_HISTORICO);
    
    if (!sheet) {
      return { existe: false, filas: 0, error: 'Hoja no encontrada' };
    }
    
    const lastRow = sheet.getLastRow();
    return {
      existe: true,
      filas: lastRow - 1, // Excluir encabezado
      ultimaActualizacion: lastRow > 1 ? sheet.getRange(lastRow, 1).getValue() : null
    };
    
  } catch (error) {
    return { existe: false, filas: 0, error: error.toString() };
  }
}

// ==================== FUNCIONES DE UTILIDAD ====================

/**
 * Desactiva todos los triggers de gráficos
 * @returns {Object} Resultado de la desactivación
 */
function desactivarTriggersGraficos() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    let desactivados = 0;
    
    triggers.forEach(trigger => {
      const funcion = trigger.getHandlerFunction();
      if (Object.values(TRIGGERS_CONFIG.FUNCIONES).includes(funcion)) {
        ScriptApp.deleteTrigger(trigger);
        desactivados++;
      }
    });
    
    console.log(`✅ ${desactivados} triggers desactivados`);
    return {
      success: true,
      desactivados: desactivados,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error desactivando triggers:', error);
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Reinicia completamente el sistema de triggers
 * @returns {Object} Resultado del reinicio
 */
function reiniciarSistemaTriggers() {
  try {
    console.log('🔄 Reiniciando sistema de triggers...');
    
    // Desactivar triggers existentes
    const desactivacion = desactivarTriggersGraficos();
    
    // Esperar un momento
    Utilities.sleep(1000);
    
    // Configurar triggers nuevos
    const configuracion = configurarTriggersCompletos();
    
    return {
      success: true,
      desactivacion: desactivacion,
      configuracion: configuracion,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error reiniciando sistema de triggers:', error);
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}
