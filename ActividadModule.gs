/**
 * @fileoverview Módulo para procesamiento de actividad.
 * ✅ SIMPLIFICADO: Ya no se calculan semáforos, solo mapeo de almas a células
 */

// ==================== FUNCIONES DE PROCESAMIENTO ====================

/**
 * Mapea los IDs de almas a sus respectivas células
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
 * Integra la información de la célula en la lista de ingresos (almas)
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

console.log('📊 ActividadModule cargado (versión simplificada) - Solo mapeo de almas a células');