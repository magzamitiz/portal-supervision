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
  let miembrosConID = 0;
  let miembrosSinID = 0;
  
  console.log(`[ActividadModule] 🔍 Iniciando mapeo de ${celulas.length} células...`);
  
  celulas.forEach((celula, indexCelula) => {
    if (celula.Miembros && celula.Miembros.length > 0) {
      celula.Miembros.forEach((miembro, indexMiembro) => {
        totalMiembros++;
        
        // ✅ MEJORADO: Buscar el ID en cualquier campo posible con más debug
        const idMiembro = miembro.ID_Miembro || miembro.ID_Alma || miembro.id_miembro || miembro.id_alma;
        
        if (idMiembro) {
          const idLimpio = String(idMiembro).trim();
          if (idLimpio && idLimpio !== '' && idLimpio !== 'null' && idLimpio !== 'undefined') {
            mapa.set(idLimpio, celula.ID_Celula);
            miembrosConID++;
            
          }
        } else {
          miembrosSinID++;
          if (miembrosSinID <= 3) {
            console.log(`[ActividadModule] ⚠️ Miembro sin ID en célula ${celula.ID_Celula}: ${miembro.Nombre_Miembro || 'Sin nombre'}`);
          }
        }
      });
    }
  });
  
  console.log(`[ActividadModule] ✅ RESULTADO DEL MAPEO:`);
  console.log(`   - Total miembros procesados: ${totalMiembros}`);
  console.log(`   - Con ID válido: ${miembrosConID}`);
  console.log(`   - Sin ID: ${miembrosSinID}`);
  console.log(`   - Almas únicas mapeadas: ${mapa.size}`);
  
  // Mostrar algunos ejemplos del mapa final
  if (mapa.size > 0) {
    console.log(`[ActividadModule] 📋 Ejemplos del mapa final:`);
    let contador = 0;
    for (const [idAlma, idCelula] of mapa) {
      if (contador < 3) {
        console.log(`   - "${idAlma}" → ${idCelula}`);
        contador++;
      }
    }
  }
  
  return mapa;
}

/**
 * Integra la información de la célula en la lista de ingresos (almas)
 * @param {Array<Object>} ingresos - Array de ingresos
 * @param {Map<string, string>} almasEnCelulasMap - Mapa de ID_Alma a ID_Celula
 */
function integrarAlmasACelulas(ingresos, almasEnCelulasMap) {
  let almasAsignadas = 0;
  let erroresEncontrados = 0;
  
  console.log(`[ActividadModule] 🔍 Iniciando integración de ${ingresos.length} ingresos con mapa de ${almasEnCelulasMap.size} almas`);
  
  ingresos.forEach((ingreso, index) => {
    try {
      // ✅ MEJORADO: Manejo más robusto de IDs
      let idAlma = null;
      
      if (ingreso.ID_Alma !== null && ingreso.ID_Alma !== undefined) {
        // Convertir a string y limpiar
        idAlma = String(ingreso.ID_Alma).trim();
        
        // Verificar que no esté vacío después de limpiar
        if (idAlma === '' || idAlma === 'null' || idAlma === 'undefined') {
          idAlma = null;
        }
      }
      
      const idCelula = idAlma ? almasEnCelulasMap.get(idAlma) : null;
      
      ingreso.ID_Celula = idCelula || null;
      ingreso.En_Celula = !!idCelula;
      
      if (idCelula) {
        almasAsignadas++;
      } else if (idAlma) {
        erroresEncontrados++;
      }
      
    } catch (error) {
      console.error(`[ActividadModule] ❌ Error procesando ingreso ${index}:`, error);
      ingreso.ID_Celula = null;
      ingreso.En_Celula = false;
    }
  });
  
  const porcentaje = ingresos.length > 0 ? ((almasAsignadas/ingresos.length)*100).toFixed(1) : 0;
  console.log(`[ActividadModule] ✅ RESULTADO: ${almasAsignadas} de ${ingresos.length} almas asignadas a células (${porcentaje}%)`);
  
  // ⚠️ ALERTA si 0 almas asignadas
  if (almasAsignadas === 0 && ingresos.length > 0 && almasEnCelulasMap.size > 0) {
    console.warn(`[ActividadModule] ⚠️ PROBLEMA: 0 almas asignadas cuando hay ${almasEnCelulasMap.size} en el mapa`);
    console.warn(`[ActividadModule] 🔍 Ejecutar diagnosticoUrgente() para más detalles`);
  }
}

console.log('📊 ActividadModule cargado (versión simplificada) - Solo mapeo de almas a células');