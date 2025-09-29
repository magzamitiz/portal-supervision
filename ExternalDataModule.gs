/**
 * @fileoverview Módulo para carga de datos externos.
 * Implementa las funciones de carga de datos externos exactas del código original.
 */

// ==================== CONFIGURACIÓN DEL MÓDULO ====================

const CONFIG_SEGUIMIENTO = {
  SHEETS: {
    DIRECTORIO: '1dwuqpyMXWHJvnJHwDHCqFMvgdYhypE2W1giH6bRZMKc',
    REPORTE_CELULAS: '18wOkxTauLETdpkEy5qsd0shlZUf8FsfQg9oCN8-pCxI',
    REGISTRO_INTERACCIONES: '1Rzx4k6ipkFvVpTYdisjAYSwGuIgyWiYFBsYu4RHFWPs',
    VISITAS_BENDICION: '1md72JN8LOJCpBLrPIGP9HQG8GQ1RzFFE-hAOlawQ2eg'
  },
  TABS: {
    MAESTRO_ASISTENTES: 'Maestro_Asistentes',
    REGISTRO_INTERACCIONES: 'Registro de Interacciones',
    REGISTRO_VISITAS: 'Registro de Visitas'
  }
};

// ==================== FUNCIONES DE CARGA EXTERNA ====================

/**
 * Carga maestro de asistentes (progreso en células)
 * @returns {Array} Array de asistentes
 */
function cargarMaestroAsistentes() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG_SEGUIMIENTO.SHEETS.REPORTE_CELULAS);
    const sheet = ss.getSheetByName(CONFIG_SEGUIMIENTO.TABS.MAESTRO_ASISTENTES);
    
    if (!sheet) {
      console.warn('No se encontró la hoja Maestro_Asistentes');
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];
    
    const headers = data[0];
    const asistentes = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const asistente = {
        ID_Asistente: String(row[0] || '').trim(),
        Nombre: String(row[1] || '').trim(),
        Temas_Completados: String(row[2] || '0'),
        Temas_Faltantes: String(row[3] || '12'),
        Porcentaje: parseFloat(row[4] || 0),
        Estado: String(row[5] || 'Sin datos').trim(),
        Fecha_Primer_Tema: row[6],
        Fecha_Ultimo_Tema: row[7],
        Dias_Inactivo: parseInt(row[8] || 0),
        Celula_Principal: String(row[9] || '').trim(),
        // Temas individuales
        temas: {
          tema1: String(row[10] || ''),
          tema2: String(row[11] || ''),
          tema3: String(row[12] || ''),
          tema4: String(row[13] || ''),
          tema5: String(row[14] || ''),
          tema6: String(row[15] || ''),
          tema7: String(row[16] || ''),
          tema8: String(row[17] || ''),
          tema9: String(row[18] || ''),
          tema10: String(row[19] || ''),
          tema11: String(row[20] || ''),
          tema12: String(row[21] || '')
        }
      };
      
      if (asistente.ID_Asistente) {
        asistentes.push(asistente);
      }
    }
    
    console.log(`[ExternalDataModule] ${asistentes.length} asistentes cargados`);
    return asistentes;
    
  } catch (error) {
    console.error('[ExternalDataModule] Error cargando maestro de asistentes:', error);
    return [];
  }
}

/**
 * Carga interacciones de seguimiento
 * @returns {Array} Array de interacciones
 */
function cargarInteracciones() {
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
