/**
 * @fileoverview Módulo para cálculo de actividad de líderes.
 * Contiene las funciones para calcular y procesar la actividad de líderes.
 */

// ==================== FUNCIONES DE CÁLCULO DE ACTIVIDAD ====================

/**
 * Calcula la actividad de líderes usando _SeguimientoConsolidado (versión optimizada).
 * @param {Array<Object>} celulas - Array de células (no se usa en esta versión)
 * @returns {Map<string, Date>} Mapa de ID_Lider a última fecha de actividad
 */
function calcularActividadLideres(celulas) {
  console.log('Calculando actividad de líderes desde _SeguimientoConsolidado...');
  
  const actividadMap = new Map();
  
  // Cache de resultados
  const cacheKey = 'ACTIVIDAD_CACHE_SEGUIMIENTO';
  const cache = CacheService.getScriptCache();
  const cached = cache.get(cacheKey);
  
  if (cached) {
    console.log('Usando actividad desde caché');
    return new Map(JSON.parse(cached));
  }
  
  try {
    // Acceder a la hoja _SeguimientoConsolidado
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    const sheet = spreadsheet.getSheetByName('_SeguimientoConsolidado');
    
    if (!sheet) {
      console.warn('Hoja _SeguimientoConsolidado no encontrada');
      return actividadMap;
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      console.log('Hoja _SeguimientoConsolidado vacía o solo con headers');
      return actividadMap;
    }
    
    // Leer datos: A2:J (ID_Alma, Nombre, ID_LCF, ..., Dias_Sin_Seguimiento)
    const data = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
    console.log(`Procesando ${data.length} registros de seguimiento`);
    
    data.forEach(row => {
      const idLCF = String(row[2] || '').trim(); // Columna C: ID_LCF
      const diasSinSeguimiento = parseInt(row[9]) || 0; // Columna J: Dias_Sin_Seguimiento
      
      if (idLCF && diasSinSeguimiento >= 0) {
        // Calcular última actividad basada en días sin seguimiento
        const hoy = new Date();
        const ultimaActividad = new Date(hoy);
        ultimaActividad.setDate(hoy.getDate() - diasSinSeguimiento);
        
        // Solo actualizar si es más reciente o no existe
        const actividadExistente = actividadMap.get(idLCF);
        if (!actividadExistente || ultimaActividad > actividadExistente) {
          actividadMap.set(idLCF, ultimaActividad);
        }
      }
    });
    
    console.log(`Actividad calculada para ${actividadMap.size} líderes desde _SeguimientoConsolidado`);
    
    // Guardar en caché (convertir Map a Array para serialización)
    const actividadArray = Array.from(actividadMap.entries());
    cache.put(cacheKey, JSON.stringify(actividadArray), 300); // 5 minutos
    
  } catch (error) {
    console.error('Error calculando actividad desde _SeguimientoConsolidado:', error);
  }
  
  return actividadMap;
}

// Función procesarHojaActividad eliminada - ya no se necesita
// Ahora usamos _SeguimientoConsolidado directamente

/**
 * Integra la información de actividad calculada en la lista de líderes (implementación exacta del original).
 * @param {Array<Object>} lideres - Array de líderes
 * @param {Map<string, Date>} actividadMap - Mapa de ID_Lider a última fecha de actividad
 * @returns {Array<Object>} Array de líderes con información de actividad integrada
 */
function integrarActividadLideres(lideres, actividadMap) {
  const hoy = new Date();

  return lideres.map(lider => {
    const ultimaActividad = actividadMap.get(lider.ID_Lider);
    let diasInactivo = null;
    let estadoActividad = '-';

    if (ultimaActividad) {
      // Convertir la fecha (puede venir serializada desde caché)
      const fechaActividad = new Date(ultimaActividad);
      diasInactivo = Math.floor((hoy - fechaActividad) / (1000 * 60 * 60 * 24));

      if (diasInactivo <= CONFIG.DIAS_INACTIVO.ACTIVO) {
        estadoActividad = 'Activo';
      } else if (diasInactivo <= CONFIG.DIAS_INACTIVO.ALERTA) {
        estadoActividad = 'Alerta';
      } else {
        estadoActividad = 'Inactivo';
      }
    }

    return {
      ...lider,
      // Guardar como ISO String para caché
      Ultima_Actividad: ultimaActividad ? new Date(ultimaActividad).toISOString() : null,
      Dias_Inactivo: diasInactivo,
      Estado_Actividad: estadoActividad
    };
  });
}

/**
 * Mapea los IDs de almas a sus respectivas células (implementación exacta del original).
 * @param {Array<Object>} celulas - Array de células
 * @returns {Map<string, string>} Mapa de ID_Miembro a ID_Celula
 */
function mapearAlmasACelulas(celulas) {
  const mapa = new Map();
  celulas.forEach(celula => {
    celula.Miembros.forEach(miembro => {
      if (miembro.ID_Miembro) {
        // ID_Miembro en Células se asume que es el ID_Alma en Ingresos
        mapa.set(miembro.ID_Miembro, celula.ID_Celula);
      }
    });
  });
  return mapa;
}

/**
 * Integra la información de la célula en la lista de ingresos (almas) (implementación exacta del original).
 * @param {Array<Object>} ingresos - Array de ingresos
 * @param {Map<string, string>} almasEnCelulasMap - Mapa de ID_Alma a ID_Celula
 */
function integrarAlmasACelulas(ingresos, almasEnCelulasMap) {
  ingresos.forEach(ingreso => {
    const idCelula = almasEnCelulasMap.get(ingreso.ID_Alma);
    ingreso.ID_Celula = idCelula || null;
    ingreso.En_Celula = !!idCelula;
  });
}

console.log('📊 ActividadModule cargado - Usando _SeguimientoConsolidado para cálculo de actividad');
