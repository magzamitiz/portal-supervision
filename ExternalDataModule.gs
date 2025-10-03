/**
 * @fileoverview Módulo para carga de datos externos.
 * ⚠️ DESACTIVADO: Este módulo no se usa en el dashboard principal para optimizar rendimiento.
 * Solo se mantiene DIRECTORIO activo, los demás sheets causan lentitud innecesaria.
 */

// ==================== CONFIGURACIÓN DEL MÓDULO ====================

const CONFIG_SEGUIMIENTO = {
  SHEETS: {
    DIRECTORIO: '1dwuqpyMXWHJvnJHwDHCqFMvgdYhypE2W1giH6bRZMKc'
    // ✅ OPTIMIZADO: Solo DIRECTORIO activo para máximo rendimiento
    // Los demás sheets no se usan en el dashboard principal
  },
  TABS: {
    // ✅ OPTIMIZADO: Solo tabs de DIRECTORIO se usan
  }
};

// ==================== FUNCIONES DE CARGA EXTERNA ====================

/**
 * ⚠️ DESACTIVADO: No se usa en el dashboard principal
 * Carga maestro de asistentes (progreso en células)
 * @returns {Array} Array de asistentes
 */
function cargarMaestroAsistentes() {
  // ✅ DESACTIVADO: Función no se usa en el dashboard principal para optimizar rendimiento
  console.warn('[ExternalDataModule] cargarMaestroAsistentes desactivada - no se usa en dashboard principal');
  return [];
}

/**
 * Carga interacciones de seguimiento
 * @returns {Array} Array de interacciones
 */
function cargarInteracciones() {
  // ⚠️ DESACTIVADO: No se usa en el dashboard principal
  return { success: false, data: [], error: 'Función desactivada para optimizar rendimiento' };
  try {
    // Si no tienes esta hoja configurada, retornar array vacío
    if (!CONFIG_SEGUIMIENTO.SHEETS.REGISTRO_INTERACCIONES) {
      console.warn('REGISTRO_INTERACCIONES no configurado');
      return [];
    }
    
    const ss = SpreadsheetApp.openById(CONFIG_SEGUIMIENTO.SHEETS.REGISTRO_INTERACCIONES);
    const sheet = ss.getSheetByName(CONFIG_SEGUIMIENTO.TABS.REGISTRO_INTERACCIONES) || ss.getSheets()[0];
    
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];
    
    const headers = data[0];
    const interacciones = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const interaccion = {
        ID_Interaccion: String(row[0] || '').trim(),
        ID_Alma: String(row[1] || '').trim(),
        Nombre_Alma: String(row[2] || '').trim(),
        Timestamp_Interaccion: row[3],
        Nombre_Agente: String(row[4] || '').trim(),
        Congregacion: String(row[5] || '').trim(),
        ID_LCF: String(row[6] || '').trim(),
        Nombre_LCF: String(row[7] || '').trim(),
        Medio_Contacto: String(row[12] || '').trim(),
        Resultado: String(row[13] || '').trim(),
        Observaciones: String(row[14] || '').trim()
      };
      
      if (interaccion.ID_Alma) {
        interacciones.push(interaccion);
      }
    }
    
    console.log(`[ExternalDataModule] ${interacciones.length} interacciones cargadas`);
    return interacciones;
    
  } catch (error) {
    console.error('[ExternalDataModule] Error cargando interacciones:', error);
    return [];
  }
}

/**
 * Carga visitas de bendición
 * @returns {Array} Array de visitas
 */
function cargarVisitasBendicion() {
  // ⚠️ DESACTIVADO: No se usa en el dashboard principal
  return { success: false, data: [], error: 'Función desactivada para optimizar rendimiento' };
  try {
    const ss = SpreadsheetApp.openById(CONFIG_SEGUIMIENTO.SHEETS.VISITAS_BENDICION);
    const sheet = ss.getSheetByName(CONFIG_SEGUIMIENTO.TABS.REGISTRO_VISITAS) || ss.getSheets()[0];
    
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];
    
    const visitas = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const visita = {
        ID_Visita: String(row[0] || '').trim(),
        ID_Alma: String(row[1] || '').trim(),
        Timestamp_Visita: row[2],
        Nombre_Agente: String(row[3] || '').trim(),
        Acompanantes: String(row[4] || '').trim(),
        Congregacion: String(row[5] || '').trim(),
        ID_LCF: String(row[6] || '').trim(),
        Nombre_LCF: String(row[7] || '').trim(),
        Estatus_Visita: String(row[12] || '').trim(),
        Resultado_Visita: String(row[13] || '').trim(),
        ID_Celula_Asignada: String(row[14] || '').trim(),
        Nombre_Anfitrion: String(row[15] || '').trim(),
        Observaciones: String(row[16] || '').trim()
      };
      
      if (visita.ID_Alma) {
        visitas.push(visita);
      }
    }
    
    console.log(`[ExternalDataModule] ${visitas.length} visitas cargadas`);
    return visitas;
    
  } catch (error) {
    console.error('[ExternalDataModule] Error cargando visitas de bendición:', error);
    return [];
  }
}

/**
 * Carga todos los datos externos necesarios
 * @returns {Object} Objeto con todos los datos externos
 */
function cargarDatosExternos() {
  // ⚠️ DESACTIVADO: No se usa en el dashboard principal
  return { success: false, data: [], error: 'Función desactivada para optimizar rendimiento' };
  try {
    console.log('[ExternalDataModule] Cargando datos externos...');
    
    const datosExternos = {
      maestroAsistentes: cargarMaestroAsistentes(),
      interacciones: cargarInteracciones(),
      visitas: cargarVisitasBendicion(),
      timestamp: new Date().toISOString()
    };
    
    console.log('[ExternalDataModule] Datos externos cargados exitosamente');
    return datosExternos;
    
  } catch (error) {
    console.error('[ExternalDataModule] Error cargando datos externos:', error);
    return {
      maestroAsistentes: [],
      interacciones: [],
      visitas: [],
      error: error.toString()
    };
  }
}

console.log('🌐 ExternalDataModule cargado - Carga de datos externos');
