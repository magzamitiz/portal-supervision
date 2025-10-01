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
  let totalMiembros = 0;
  
  celulas.forEach(celula => {
    if (celula.Miembros && celula.Miembros.length > 0) {
      celula.Miembros.forEach(miembro => {
        // ✅ FIX: Buscar el ID en cualquier campo posible
        const idMiembro = miembro.ID_Miembro || miembro.ID_Alma || miembro.id_miembro || miembro.id_alma;
        if (idMiembro) {
          const idLimpio = String(idMiembro).trim();
          if (idLimpio) {
            mapa.set(idLimpio, celula.ID_Celula);
            totalMiembros++;
          }
        }
      });
    }
  });
  
  console.log(`[ActividadModule] ✅ Mapeadas ${totalMiembros} almas a células (${mapa.size} únicas)`);
  return mapa;
}

/**
 * Integra la información de la célula en la lista de ingresos (almas)
 * @param {Array<Object>} ingresos - Array de ingresos
 * @param {Map<string, string>} almasEnCelulasMap - Mapa de ID_Alma a ID_Celula
 */
function integrarAlmasACelulas(ingresos, almasEnCelulasMap) {
  let almasAsignadas = 0;
  
  ingresos.forEach(ingreso => {
    // ✅ FIX: Limpiar el ID antes de buscar en el mapa
    const idAlma = ingreso.ID_Alma ? String(ingreso.ID_Alma).trim() : null;
    const idCelula = idAlma ? almasEnCelulasMap.get(idAlma) : null;
    
    ingreso.ID_Celula = idCelula || null;
    ingreso.En_Celula = !!idCelula;
    
    if (idCelula) almasAsignadas++;
  });
  
  console.log(`[ActividadModule] ✅ ${almasAsignadas} de ${ingresos.length} almas asignadas a células (${((almasAsignadas/ingresos.length)*100).toFixed(1)}%)`);
}

console.log('📊 ActividadModule cargado (versión simplificada) - Solo mapeo de almas a células');