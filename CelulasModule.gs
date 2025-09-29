/**
 * CELULAS MODULE - GESTIÓN DE CÉLULAS
 * Etapa 2 - Semana 2: Separación en módulos
 * 
 * Este módulo contiene toda la lógica relacionada con la gestión
 * de células manteniendo 100% compatibilidad.
 */

// ==================== CONFIGURACIÓN DEL MÓDULO ====================

// Función auxiliar findCol ya está declarada en DataModule.gs

const CELULAS_CONFIG = {
  ESTADOS: {
    SALUDABLE: 'Saludable',
    EN_CRECIMIENTO: 'En Crecimiento',
    EN_RIESGO: 'En Riesgo',
    VACIA: 'Vacía',
    LISTA_MULTIPLICAR: 'Lista para Multiplicar'
  },
  
  MIEMBROS: {
    MIN_MIEMBROS: 3,
    IDEAL_MIEMBROS: 8,
    MAX_MIEMBROS: 12
  },
  
  CARGA_LCF: {
    OPTIMA: 10,
    MODERADA: 20,
    ALTA: 30
  }
};

// ==================== FUNCIONES DE CARGA DE CÉLULAS ====================

/**
 * Carga todas las células con datos completos (compatible con código original)
 * @param {Object} spreadsheet - Objeto spreadsheet de Google Apps Script
 * @param {string} sheetName - Nombre de la hoja
 * @returns {Array} Array de células completas
 */
function cargarCelulasCompletas(spreadsheet, sheetName) {
  try {
    console.log('[CelulasModule] Cargando células completas...');
    
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) return [];

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];

    const headers = data[0].map(h => h.toString().trim());
    const celulasMap = new Map();

    const columnas = {
      idCelula: findCol(headers, ['ID Célula', 'ID_Celula', 'ID']),
      nombreCelula: findCol(headers, ['Nombre Célula']),
      // ID_Miembro es crítico para vincular con ID_Alma
      idMiembro: findCol(headers, ['ID Miembro', 'ID_Miembro', 'ID Alma']),
      nombreMiembro: findCol(headers, ['Nombre Miembro']),
      idLCF: findCol(headers, ['ID LCF', 'ID_LCF']),
      nombreLCF: findCol(headers, ['Nombre LCF'])
    };

    if (columnas.idCelula === -1) {
      console.error('Falta columna crítica ID Célula.');
      return [];
    }

    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      const idCelula = String(row[columnas.idCelula] || '').trim();

      // CORRECCIÓN: Si no hay ID de Célula, saltar fila.
      if (!idCelula) continue;

      if (!celulasMap.has(idCelula)) {
        celulasMap.set(idCelula, {
          ID_Celula: idCelula,
          Nombre_Celula: String(row[columnas.nombreCelula] || '').trim(),
          ID_LCF_Responsable: String(row[columnas.idLCF] || '').trim(),
          Nombre_LCF_Responsable: String(row[columnas.nombreLCF] || '').trim(),
          Miembros: [],
          Total_Miembros: 0,
          Estado: 'Activa'
        });
      }

      const celula = celulasMap.get(idCelula);

      const idMiembro = columnas.idMiembro !== -1 ? String(row[columnas.idMiembro] || '').trim() : null;
      const nombreMiembro = columnas.nombreMiembro !== -1 ? String(row[columnas.nombreMiembro] || '').trim() : null;

      if (idMiembro) {
        celula.Miembros.push({
          ID_Miembro: idMiembro,
          Nombre_Miembro: nombreMiembro || '',
          ID_Celula: idCelula
        });
        celula.Total_Miembros = celula.Miembros.length;
      }
    }

    // Convertir Map a Array
    const celulas = Array.from(celulasMap.values());
    
    console.log(`[CelulasModule] ${celulas.length} células cargadas`);
    return celulas;
    
  } catch (error) {
    console.error('[CelulasModule] Error cargando células completas:', error);
    return [];
  }
}

/**
 * Carga células con solo datos esenciales (optimizado)
 * @param {Object} spreadsheet - Objeto spreadsheet de Google Apps Script
 * @param {string} sheetName - Nombre de la hoja
 * @returns {Array} Array de células optimizadas
 */
function cargarCelulasOptimizadas(spreadsheet, sheetName) {
  try {
    console.log('[CelulasModule] Cargando células optimizadas...');
    
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) return [];

    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).getValues();
    
    const celulas = [];
    for (const row of data) {
      const [id, nombre, lcfResponsable, estado, totalMiembros, miembros] = row;
      
      if (id) {
        celulas.push({
          ID_Celula: id.toString().trim(),
          Nombre_Celula: nombre ? nombre.toString().trim() : '',
          ID_LCF_Responsable: lcfResponsable ? lcfResponsable.toString().trim() : '',
          Estado: estado ? estado.toString().trim() : CELULAS_CONFIG.ESTADOS.VACIA,
          Total_Miembros: totalMiembros ? parseInt(totalMiembros) : 0,
          Miembros: miembros ? JSON.parse(miembros) : []
        });
      }
    }
    
    console.log(`[CelulasModule] ${celulas.length} células optimizadas cargadas`);
    return celulas;
    
  } catch (error) {
    console.error('[CelulasModule] Error cargando células optimizadas:', error);
    return [];
  }
}

/**
 * Carga células por LCF responsable
 * @param {Object} spreadsheet - Objeto spreadsheet de Google Apps Script
 * @param {string} sheetName - Nombre de la hoja
 * @param {string} idLCF - ID del LCF responsable
 * @returns {Array} Array de células del LCF
 */
function cargarCelulasPorLCF(spreadsheet, sheetName, idLCF) {
  try {
    console.log(`[CelulasModule] Cargando células para LCF: ${idLCF}`);
    
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) return [];

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];

    const headers = data[0].map(h => h.toString().trim());
    const columnas = mapearColumnasCelulas(headers);
    const lcfIndex = columnas.lcfResponsable;
    
    if (lcfIndex === -1) {
      console.warn('[CelulasModule] Columna LCF responsable no encontrada');
      return [];
    }
    
    const celulas = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const lcfFila = row[lcfIndex];
      
      if (lcfFila && lcfFila.toString().trim() === idLCF) {
        const celula = procesarFilaCelula(row, columnas, headers);
        if (celula && celula.ID_Celula) {
          celulas.push(celula);
        }
      }
    }
    
    console.log(`[CelulasModule] ${celulas.length} células cargadas para LCF ${idLCF}`);
    return celulas;
    
  } catch (error) {
    console.error(`[CelulasModule] Error cargando células por LCF ${idLCF}:`, error);
    return [];
  }
}

// ==================== FUNCIONES DE ANÁLISIS DE CÉLULAS ====================

/**
 * Analiza el estado de las células
 * @param {Array} celulas - Array de células
 * @returns {Object} Análisis del estado de células
 */
function analizarEstadoCelulas(celulas) {
  try {
    console.log('[CelulasModule] Analizando estado de células...');
    
    const analisis = {
      total_celulas: celulas.length,
      por_estado: {},
      por_tamaño: {
        vacias: 0,
        pequeñas: 0,
        ideales: 0,
        grandes: 0
      },
      salud_general: {
        saludables: 0,
        en_riesgo: 0,
        vacias: 0,
        listas_multiplicar: 0
      }
    };
    
    celulas.forEach(celula => {
      // Contar por estado
      const estado = celula.Estado || CELULAS_CONFIG.ESTADOS.VACIA;
      analisis.por_estado[estado] = (analisis.por_estado[estado] || 0) + 1;
      
      // Contar por tamaño
      const totalMiembros = celula.Total_Miembros || 0;
      if (totalMiembros === 0) {
        analisis.por_tamaño.vacias++;
      } else if (totalMiembros < CELULAS_CONFIG.MIEMBROS.MIN_MIEMBROS) {
        analisis.por_tamaño.pequeñas++;
      } else if (totalMiembros <= CELULAS_CONFIG.MIEMBROS.IDEAL_MIEMBROS) {
        analisis.por_tamaño.ideales++;
      } else {
        analisis.por_tamaño.grandes++;
      }
      
      // Contar por salud general
      switch (estado) {
        case CELULAS_CONFIG.ESTADOS.SALUDABLE:
          analisis.salud_general.saludables++;
          break;
        case CELULAS_CONFIG.ESTADOS.EN_RIESGO:
          analisis.salud_general.en_riesgo++;
          break;
        case CELULAS_CONFIG.ESTADOS.VACIA:
          analisis.salud_general.vacias++;
          break;
        case CELULAS_CONFIG.ESTADOS.LISTA_MULTIPLICAR:
          analisis.salud_general.listas_multiplicar++;
          break;
      }
    });
    
    console.log('[CelulasModule] Análisis de estado completado');
    return analisis;
    
  } catch (error) {
    console.error('[CelulasModule] Error analizando estado de células:', error);
    return {
      total_celulas: 0,
      por_estado: {},
      por_tamaño: { vacias: 0, pequeñas: 0, ideales: 0, grandes: 0 },
      salud_general: { saludables: 0, en_riesgo: 0, vacias: 0, listas_multiplicar: 0 }
    };
  }
}

/**
 * Calcula métricas de células
 * @param {Array} celulas - Array de células
 * @returns {Object} Métricas calculadas
 */
function calcularMetricasCelulas(celulas) {
  try {
    console.log('[CelulasModule] Calculando métricas de células...');
    
    const totalCelulas = celulas.length;
    const celulasActivas = celulas.filter(c => 
      c.Estado !== CELULAS_CONFIG.ESTADOS.VACIA
    ).length;
    
    const celulasNecesitanAtencion = celulas.filter(c =>
      c.Estado === CELULAS_CONFIG.ESTADOS.EN_RIESGO || 
      c.Estado === CELULAS_CONFIG.ESTADOS.VACIA
    ).length;
    
    const celulasListasMultiplicar = celulas.filter(c =>
      c.Estado === CELULAS_CONFIG.ESTADOS.LISTA_MULTIPLICAR
    ).length;
    
    const totalMiembros = celulas.reduce((sum, c) => sum + (c.Total_Miembros || 0), 0);
    const promedioMiembros = totalCelulas > 0 ? (totalMiembros / totalCelulas).toFixed(1) : 0;
    
    const metricas = {
      total_celulas: totalCelulas,
      celulas_activas: celulasActivas,
      celulas_vacias: totalCelulas - celulasActivas,
      tasa_ocupacion: totalCelulas > 0 ? ((celulasActivas / totalCelulas) * 100).toFixed(1) : 0,
      celulas_necesitan_atencion: celulasNecesitanAtencion,
      celulas_listas_multiplicar: celulasListasMultiplicar,
      total_miembros: totalMiembros,
      promedio_miembros: promedioMiembros
    };
    
    console.log('[CelulasModule] Métricas calculadas:', metricas);
    return metricas;
    
  } catch (error) {
    console.error('[CelulasModule] Error calculando métricas:', error);
    return {
      total_celulas: 0,
      celulas_activas: 0,
      celulas_vacias: 0,
      tasa_ocupacion: 0,
      celulas_necesitan_atencion: 0,
      celulas_listas_multiplicar: 0,
      total_miembros: 0,
      promedio_miembros: 0
    };
  }
}

/**
 * Determina el estado de una célula basado en sus miembros
 * @param {Object} celula - Objeto de célula
 * @returns {string} Estado calculado
 */
function determinarEstadoCelula(celula) {
  try {
    const totalMiembros = celula.Total_Miembros || 0;
    
    if (totalMiembros === 0) {
      return CELULAS_CONFIG.ESTADOS.VACIA;
    } else if (totalMiembros < CELULAS_CONFIG.MIEMBROS.MIN_MIEMBROS) {
      return CELULAS_CONFIG.ESTADOS.EN_RIESGO;
    } else if (totalMiembros <= CELULAS_CONFIG.MIEMBROS.IDEAL_MIEMBROS) {
      return CELULAS_CONFIG.ESTADOS.EN_CRECIMIENTO;
    } else if (totalMiembros <= CELULAS_CONFIG.MIEMBROS.MAX_MIEMBROS) {
      return CELULAS_CONFIG.ESTADOS.SALUDABLE;
    } else {
      return CELULAS_CONFIG.ESTADOS.LISTA_MULTIPLICAR;
    }
  } catch (error) {
    console.error('[CelulasModule] Error determinando estado de célula:', error);
    return CELULAS_CONFIG.ESTADOS.VACIA;
  }
}

// ==================== FUNCIONES DE BÚSQUEDA Y FILTRADO ====================

/**
 * Busca una célula por ID
 * @param {Array} celulas - Array de células
 * @param {string} idCelula - ID de la célula a buscar
 * @returns {Object|null} Célula encontrada o null
 */
function buscarCelulaPorId(celulas, idCelula) {
  try {
    return celulas.find(celula => celula.ID_Celula === idCelula) || null;
  } catch (error) {
    console.error('[CelulasModule] Error buscando célula por ID:', error);
    return null;
  }
}

/**
 * Busca células por nombre (búsqueda parcial)
 * @param {Array} celulas - Array de células
 * @param {string} nombre - Nombre a buscar
 * @returns {Array} Array de células que coinciden
 */
function buscarCelulasPorNombre(celulas, nombre) {
  try {
    const nombreBusqueda = nombre.toLowerCase().trim();
    return celulas.filter(celula => 
      celula.Nombre_Celula && 
      celula.Nombre_Celula.toLowerCase().includes(nombreBusqueda)
    );
  } catch (error) {
    console.error('[CelulasModule] Error buscando células por nombre:', error);
    return [];
  }
}

/**
 * Filtra células por estado
 * @param {Array} celulas - Array de células
 * @param {string} estado - Estado a filtrar
 * @returns {Array} Array de células con el estado especificado
 */
function filtrarCelulasPorEstado(celulas, estado) {
  try {
    return celulas.filter(celula => celula.Estado === estado);
  } catch (error) {
    console.error('[CelulasModule] Error filtrando células por estado:', error);
    return [];
  }
}

/**
 * Filtra células por LCF responsable
 * @param {Array} celulas - Array de células
 * @param {string} idLCF - ID del LCF responsable
 * @returns {Array} Array de células del LCF
 */
function filtrarCelulasPorLCF(celulas, idLCF) {
  try {
    return celulas.filter(celula => celula.ID_LCF_Responsable === idLCF);
  } catch (error) {
    console.error('[CelulasModule] Error filtrando células por LCF:', error);
    return [];
  }
}

/**
 * Obtiene células que necesitan atención
 * @param {Array} celulas - Array de células
 * @returns {Array} Array de células que necesitan atención
 */
function obtenerCelulasNecesitanAtencion(celulas) {
  try {
    return celulas.filter(celula => 
      celula.Estado === CELULAS_CONFIG.ESTADOS.EN_RIESGO || 
      celula.Estado === CELULAS_CONFIG.ESTADOS.VACIA
    );
  } catch (error) {
    console.error('[CelulasModule] Error obteniendo células que necesitan atención:', error);
    return [];
  }
}

/**
 * Obtiene células listas para multiplicar
 * @param {Array} celulas - Array de células
 * @returns {Array} Array de células listas para multiplicar
 */
function obtenerCelulasListasMultiplicar(celulas) {
  try {
    return celulas.filter(celula => 
      celula.Estado === CELULAS_CONFIG.ESTADOS.LISTA_MULTIPLICAR
    );
  } catch (error) {
    console.error('[CelulasModule] Error obteniendo células listas para multiplicar:', error);
    return [];
  }
}

// ==================== FUNCIONES DE UTILIDAD ====================

/**
 * Mapea las columnas de la hoja de células
 * @param {Array} headers - Encabezados de la hoja
 * @returns {Object} Mapeo de columnas
 */
function mapearColumnasCelulas(headers) {
  return {
    idCelula: findCol(headers, ['ID_Celula', 'ID Célula', 'ID']),
    nombreCelula: findCol(headers, ['Nombre_Celula', 'Nombre Célula', 'Nombre']),
    lcfResponsable: findCol(headers, ['ID_LCF_Responsable', 'LCF Responsable', 'LCF']),
    estado: findCol(headers, ['Estado', 'Estado_Celula']),
    totalMiembros: findCol(headers, ['Total_Miembros', 'Total Miembros', 'Miembros']),
    miembros: findCol(headers, ['Miembros', 'Lista_Miembros'])
  };
}

/**
 * Procesa una fila de célula
 * @param {Array} row - Fila de datos
 * @param {Object} columnas - Mapeo de columnas
 * @param {Array} headers - Encabezados
 * @returns {Object|null} Célula procesada o null
 */
function procesarFilaCelula(row, columnas, headers) {
  try {
    const idCelula = row[columnas.idCelula];
    
    if (!idCelula) {
      return null; // Saltar filas sin ID
    }
    
    const totalMiembros = row[columnas.totalMiembros] ? parseInt(row[columnas.totalMiembros]) : 0;
    const miembros = row[columnas.miembros] ? JSON.parse(row[columnas.miembros]) : [];
    
    const celula = {
      ID_Celula: idCelula.toString().trim(),
      Nombre_Celula: row[columnas.nombreCelula] ? row[columnas.nombreCelula].toString().trim() : '',
      ID_LCF_Responsable: row[columnas.lcfResponsable] ? row[columnas.lcfResponsable].toString().trim() : '',
      Estado: row[columnas.estado] ? row[columnas.estado].toString().trim() : CELULAS_CONFIG.ESTADOS.VACIA,
      Total_Miembros: totalMiembros,
      Miembros: miembros
    };
    
    // Determinar estado si no está especificado
    if (!row[columnas.estado]) {
      celula.Estado = determinarEstadoCelula(celula);
    }
    
    return celula;
    
  } catch (error) {
    console.error('[CelulasModule] Error procesando fila de célula:', error);
    return null;
  }
}

// ==================== FUNCIONES DE COMPATIBILIDAD ====================

/**
 * Función de compatibilidad para cargar células (wrapper)
 * @param {Object} spreadsheet - Objeto spreadsheet de Google Apps Script
 * @param {string} sheetName - Nombre de la hoja
 * @returns {Array} Array de células
 */
function cargarHojaCelulas(spreadsheet, sheetName) {
  return cargarCelulasCompletas(spreadsheet, sheetName);
}

/**
 * Función de compatibilidad para análisis de células
 * @param {Array} celulas - Array de células
 * @returns {Object} Análisis de células
 */
function analizarCelulas(celulas) {
  const analisis = analizarEstadoCelulas(celulas);
  const metricas = calcularMetricasCelulas(celulas);
  
  return {
    ...analisis,
    metricas: metricas
  };
}

console.log('🏠 CelulasModule cargado - Gestión de células modularizada');
