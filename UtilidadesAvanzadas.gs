/**
 * @fileoverview Módulo de utilidades avanzadas
 * Funciones auxiliares para seguimiento y análisis detallado
 */

/**
 * Carga datos completos del sistema
 * @returns {Object} Datos completos
 */
function cargarDatosCompletos() {
  try {
    const directorio = cargarDirectorioCompleto();
    const maestroAsistentes = cargarMaestroAsistentes();
    const interacciones = cargarInteracciones();
    const visitas = cargarVisitasBendicion();
    
    return {
      success: true,
      data: {
        directorio: directorio,
        maestroAsistentes: maestroAsistentes,
        interacciones: interacciones,
        visitas: visitas
      }
    };
  } catch (error) {
    console.error('[UtilidadesAvanzadas] Error cargando datos completos:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Carga maestro de asistentes
 * @returns {Array} Array de asistentes
 */
function cargarMaestroAsistentes() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEETS.REGISTRO_INTERACCIONES);
    const sheet = ss.getSheetByName(CONFIG.TABS.ACTIVIDAD_CELULAS);
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];
    
    const headers = data[0].map(h => h.toString().trim());
    const asistentes = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0]) { // ID_Alma
        asistentes.push({
          ID_Alma: row[0],
          Nombre_Alma: row[1],
          Fecha_Registro: row[2],
          Estado: row[3],
          Temas_Completados: row[4],
          Observaciones: row[5]
        });
      }
    }
    
    return asistentes;
  } catch (error) {
    console.error('[UtilidadesAvanzadas] Error cargando maestro asistentes:', error);
    return [];
  }
}

/**
 * Carga interacciones
 * @returns {Array} Array de interacciones
 */
function cargarInteracciones() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEETS.REGISTRO_INTERACCIONES);
    const sheet = ss.getSheetByName(CONFIG.TABS.ACTIVIDAD_VISITAS);
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];
    
    const headers = data[0].map(h => h.toString().trim());
    const interacciones = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0]) { // ID_Alma
        interacciones.push({
          ID_Alma: row[0],
          Nombre_Alma: row[1],
          Fecha_Interaccion: row[2],
          Tipo_Interaccion: row[3],
          Resultado: row[4],
          Observaciones: row[5]
        });
      }
    }
    
    return interacciones;
  } catch (error) {
    console.error('[UtilidadesAvanzadas] Error cargando interacciones:', error);
    return [];
  }
}

/**
 * Carga visitas de bendición
 * @returns {Array} Array de visitas
 */
function cargarVisitasBendicion() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEETS.VISITAS_BENDICION);
    const sheet = ss.getSheets()[0]; // Primera hoja
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];
    
    const headers = data[0].map(h => h.toString().trim());
    const visitas = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0]) { // ID_Alma
        visitas.push({
          ID_Alma: row[0],
          Nombre_Alma: row[1],
          Fecha_Visita: row[2],
          Resultado: row[3],
          Observaciones: row[4]
        });
      }
    }
    
    return visitas;
  } catch (error) {
    console.error('[UtilidadesAvanzadas] Error cargando visitas:', error);
    return [];
  }
}

/**
 * Obtiene progreso de células de un alma
 * @param {string} idAlma - ID del alma
 * @param {Array} maestroAsistentes - Array de asistentes
 * @param {Array} celulas - Array de células
 * @returns {Object} Progreso del alma
 */
function obtenerProgresoCelulas(idAlma, maestroAsistentes, celulas) {
  try {
    const asistente = maestroAsistentes.find(a => a.ID_Alma === idAlma);
    if (!asistente) return null;
    
    const estaEnCelula = verificarEnCelula(idAlma, celulas);
    
    return {
      ID_Alma: idAlma,
      Nombre_Alma: asistente.Nombre_Alma,
      Temas_Completados: asistente.Temas_Completados,
      Estado: asistente.Estado,
      Esta_En_Celula: estaEnCelula,
      Fecha_Registro: asistente.Fecha_Registro
    };
  } catch (error) {
    console.error('[UtilidadesAvanzadas] Error obteniendo progreso células:', error);
    return null;
  }
}

/**
 * Obtiene resultado de bienvenida de un alma
 * @param {string} idAlma - ID del alma
 * @param {Array} interacciones - Array de interacciones
 * @returns {Object} Resultado de bienvenida
 */
function obtenerResultadoBienvenida(idAlma, interacciones) {
  try {
    const bienvenida = interacciones.find(i => 
      i.ID_Alma === idAlma && i.Tipo_Interaccion === 'Bienvenida'
    );
    
    return bienvenida ? {
      ID_Alma: idAlma,
      Fecha_Interaccion: bienvenida.Fecha_Interaccion,
      Resultado: bienvenida.Resultado,
      Observaciones: bienvenida.Observaciones
    } : null;
  } catch (error) {
    console.error('[UtilidadesAvanzadas] Error obteniendo resultado bienvenida:', error);
    return null;
  }
}

/**
 * Obtiene resultado de visita de un alma
 * @param {string} idAlma - ID del alma
 * @param {Array} visitas - Array de visitas
 * @returns {Object} Resultado de visita
 */
function obtenerResultadoVisita(idAlma, visitas) {
  try {
    const visita = visitas.find(v => v.ID_Alma === idAlma);
    
    return visita ? {
      ID_Alma: idAlma,
      Fecha_Visita: visita.Fecha_Visita,
      Resultado: visita.Resultado,
      Observaciones: visita.Observaciones
    } : null;
  } catch (error) {
    console.error('[UtilidadesAvanzadas] Error obteniendo resultado visita:', error);
    return null;
  }
}

/**
 * Calcula días sin seguimiento de un alma
 * @param {Object} alma - Datos del alma
 * @param {Array} interacciones - Array de interacciones
 * @param {Array} visitas - Array de visitas
 * @returns {number} Días sin seguimiento
 */
function calcularDiasSinSeguimiento(alma, interacciones, visitas) {
  try {
    const hoy = new Date();
    let ultimaActividad = null;
    
    // Buscar última interacción
    const ultimaInteraccion = interacciones
      .filter(i => i.ID_Alma === alma.ID_Alma)
      .sort((a, b) => new Date(b.Fecha_Interaccion) - new Date(a.Fecha_Interaccion))[0];
    
    if (ultimaInteraccion) {
      ultimaActividad = new Date(ultimaInteraccion.Fecha_Interaccion);
    }
    
    // Buscar última visita
    const ultimaVisita = visitas
      .filter(v => v.ID_Alma === alma.ID_Alma)
      .sort((a, b) => new Date(b.Fecha_Visita) - new Date(a.Fecha_Visita))[0];
    
    if (ultimaVisita) {
      const fechaVisita = new Date(ultimaVisita.Fecha_Visita);
      if (!ultimaActividad || fechaVisita > ultimaActividad) {
        ultimaActividad = fechaVisita;
      }
    }
    
    if (!ultimaActividad) {
      // Si no hay actividad, usar fecha de ingreso
      ultimaActividad = new Date(alma.Fecha_Ingreso);
    }
    
    const diasDiferencia = Math.floor((hoy - ultimaActividad) / (1000 * 60 * 60 * 24));
    return Math.max(0, diasDiferencia);
  } catch (error) {
    console.error('[UtilidadesAvanzadas] Error calculando días sin seguimiento:', error);
    return 0;
  }
}

/**
 * Calcula prioridad de un alma
 * @param {number} diasSinSeguimiento - Días sin seguimiento
 * @param {string} estado - Estado del alma
 * @param {boolean} deseaVisita - Si desea visita
 * @returns {string} Prioridad del alma
 */
function calcularPrioridad(diasSinSeguimiento, estado, deseaVisita) {
  try {
    if (diasSinSeguimiento > 30) return 'Alta';
    if (diasSinSeguimiento > 14) return 'Media';
    if (deseaVisita) return 'Media';
    if (estado === 'Activo') return 'Baja';
    return 'Media';
  } catch (error) {
    console.error('[UtilidadesAvanzadas] Error calculando prioridad:', error);
    return 'Media';
  }
}

console.log('🔧 UtilidadesAvanzadas cargado - Funciones auxiliares avanzadas disponibles');
