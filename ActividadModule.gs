/**
 * @fileoverview Módulo para cálculo de actividad de líderes.
 * Contiene las funciones para calcular y procesar la actividad de líderes.
 */

// ==================== FUNCIONES DE CÁLCULO DE ACTIVIDAD ====================

/**
 * Calcula la actividad de líderes con mapeo de células (implementación exacta del original).
 * @param {Array<Object>} celulas - Array de células
 * @returns {Map<string, Date>} Mapa de ID_Lider a última fecha de actividad
 */
function calcularActividadLideres(celulas) {
  console.log('Calculando actividad de líderes con mapeo de células...');
  
  // Si no hay células, retornar mapas vacíos inmediatamente
  if (!celulas || celulas.length === 0) {
    return new Map();
  }
  
  const actividadMap = new Map();
  
  // OPTIMIZACIÓN: Crear mapa en una sola expresión
  const celulaLiderMap = new Map(
    celulas
      .filter(c => c?.ID_Celula && c?.ID_LCF_Responsable)
      .map(c => [c.ID_Celula, c.ID_LCF_Responsable])
  );
  console.log(`Mapa Célula->Líder creado con ${celulaLiderMap.size} registros.`);
  
  // OPTIMIZACIÓN: Solo procesar sheets externos si hay células
  if (celulaLiderMap.size === 0) {
    return actividadMap;
  }
  
  // Cache de resultados de sheets externos
  const cacheKey = 'ACTIVIDAD_CACHE';
  const cache = CacheService.getScriptCache();
  const cached = cache.get(cacheKey);
  
  if (cached) {
    console.log('Usando actividad desde caché');
    return new Map(JSON.parse(cached));
  }
  
  // 2. Procesar Reportes de Células
  if (CONFIG.SHEETS.REPORTE_CELULAS) {
    try {
      procesarHojaActividad(
        CONFIG.SHEETS.REPORTE_CELULAS,
        CONFIG.TABS.ACTIVIDAD_CELULAS,
        ['Timestamp', 'Fecha', 'Marca temporal'],
        ['ID Célula', 'ID_Celula', 'Id de la célula'],
        actividadMap,
        celulaLiderMap
      );
    } catch(e) {
      console.warn('Error procesando reportes de células:', e);
    }
  }
  
  // 3. Procesar Visitas de Bendición
  if (CONFIG.SHEETS.VISITAS_BENDICION) {
    try {
      procesarHojaActividad(
        CONFIG.SHEETS.VISITAS_BENDICION,
        CONFIG.TABS.ACTIVIDAD_VISITAS,
        ['Timestamp', 'Fecha', 'Marca temporal'],
        ['ID Célula', 'ID_Celula', 'Id de la célula'],
        actividadMap,
        celulaLiderMap
      );
    } catch(e) {
      console.warn('Error procesando visitas de bendición:', e);
    }
  }
  
  // 4. Procesar Registro de Interacciones
  if (CONFIG.SHEETS.REGISTRO_INTERACCIONES) {
    try {
      procesarHojaActividad(
        CONFIG.SHEETS.REGISTRO_INTERACCIONES,
        null, // Usar primera hoja
        ['Timestamp', 'Fecha', 'Marca temporal'],
        ['ID LCF', 'ID_LCF', 'ID Líder'],
        actividadMap
      );
    } catch(e) {
      console.warn('Error procesando registro de interacciones:', e);
    }
  }
  
  // 5. Guardar en caché (convertir Map a Array para serialización)
  try {
    const actividadArray = Array.from(actividadMap.entries());
    cache.put(cacheKey, JSON.stringify(actividadArray), 300); // 5 minutos
    console.log(`Actividad calculada y guardada en caché: ${actividadMap.size} líderes`);
  } catch(e) {
    console.warn('Error guardando actividad en caché:', e);
  }
  
  return actividadMap;
}

/**
 * Procesa una hoja de actividad externa (implementación exacta del original).
 * @param {string} sheetId - ID de la hoja
 * @param {string} tabName - Nombre de la pestaña
 * @param {Array<string>} timestampCols - Nombres de columnas de timestamp
 * @param {Array<string>} idCols - Nombres de columnas de ID
 * @param {Map} actividadMap - Mapa de actividad a actualizar
 * @param {Map} idLookupMap - Mapa de búsqueda de IDs (opcional)
 */
function procesarHojaActividad(sheetId, tabName, timestampCols, idCols, actividadMap, idLookupMap = null) {
  try {
    const ss = SpreadsheetApp.openById(sheetId);
    const sheet = tabName ? ss.getSheetByName(tabName) : ss.getSheets()[0];
    if (!sheet) return;

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return;
    const headers = data[0].map(h => h.toString().trim());

    const timestampIndex = headers.findIndex(h => timestampCols.includes(h));
    const idIndex = headers.findIndex(h => idCols.includes(h));

    if (timestampIndex === -1 || idIndex === -1) {
      console.warn(`En la hoja "${sheet.getName()}", no se encontró una de las columnas requeridas (Timestamp o ID). Se buscaba Timestamp en [${timestampCols.join(', ')}] e ID en [${idCols.join(', ')}]`);
      return;
    }

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      let idInicial = String(row[idIndex] || '').trim();
      const timestamp = row[timestampIndex];
      
      // Si se proporcionó un mapa de búsqueda, lo usamos para encontrar el ID del líder.
      const leaderId = idLookupMap ? idLookupMap.get(idInicial) : idInicial;

      // Verificar que el ID del LÍDER exista (después del lookup) y la fecha sea válida
      if (leaderId && timestamp instanceof Date && !isNaN(timestamp.getTime())) {
        const currentDate = timestamp;
        const existingDate = actividadMap.get(leaderId);

        // Solo actualizar si la fecha es más reciente
        if (!existingDate || currentDate > existingDate) {
          actividadMap.set(leaderId, currentDate);
        }
      }
    }

    console.log(`Procesada hoja "${sheet.getName()}": ${actividadMap.size} líderes con actividad`);
  } catch (error) {
    console.error(`Error procesando hoja de actividad ${sheetId}:`, error);
  }
}

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

console.log('📊 ActividadModule cargado - Funciones de cálculo de actividad disponibles');
