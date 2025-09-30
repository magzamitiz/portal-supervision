/**
 * LIDERES MODULE - GESTIÓN DE LÍDERES
 * Etapa 2 - Semana 2: Separación en módulos
 * 
 * Este módulo contiene toda la lógica relacionada con la gestión
 * de líderes (LD, LCF, LM, SG) manteniendo 100% compatibilidad.
 */

// ==================== CONFIGURACIÓN DEL MÓDULO ====================

// Función auxiliar findCol ya está declarada en DataModule.gs

const LIDERES_CONFIG = {
  ROLES: {
    LD: 'LD',
    LCF: 'LCF', 
    LM: 'LM',
    SG: 'SG',
    SMALL_GROUP: 'SMALL GROUP'
  },
  
  ESTADOS_ACTIVIDAD: {
    ACTIVO: 'Activo',
    ALERTA: 'Alerta', 
    INACTIVO: 'Inactivo',
    SIN_DATOS: 'Sin Datos'
  },
  
  DIAS_INACTIVO: {
    ACTIVO: 7,
    ALERTA: 14,
    INACTIVO: 30
  }
};

// ==================== FUNCIONES DE CARGA DE LÍDERES ====================

/**
 * Carga todos los líderes con datos completos (compatible con código original)
 * @param {Object} spreadsheet - Objeto spreadsheet de Google Apps Script
 * @returns {Array} Array de líderes completos
 */
function cargarLideresCompletos(spreadsheet) {
  try {
    console.log('[LideresModule] Cargando líderes completos...');
    
    const sheet = spreadsheet.getSheetByName(CONFIG.TABS.LIDERES);
    if (!sheet) return [];

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];

    const headers = data[0].map(h => h.toString().trim());
    const lideres = [];
    
    // Mapear columnas
    const columnas = mapearColumnasLideres(headers);
    
    if (columnas.idLider === -1 || columnas.rol === -1) {
      console.error('Faltan columnas críticas (ID o Rol) en la hoja de Líderes.');
      return [];
    }
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const lider = procesarFilaLider(row, columnas, headers);
      
      if (lider && lider.ID_Lider) {
        lideres.push(lider);
      }
    }
    
    console.log(`[LideresModule] ${lideres.length} líderes cargados`);
    return lideres;
    
  } catch (error) {
    console.error('[LideresModule] Error cargando líderes completos:', error);
    return [];
  }
}

/**
 * Carga solo líderes LD para menús (ultra optimizado)
 * @param {Object} spreadsheet - Objeto spreadsheet de Google Apps Script
 * @param {string} sheetName - Nombre de la hoja
 * @returns {Array} Array de líderes LD
 */
function cargarLideresLD(spreadsheet, sheetName) {
  try {
    console.log('[LideresModule] Cargando líderes LD...');
    
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) return [];

    // Validar que hay al menos 2 filas (header + datos)
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      console.log('[LideresModule] Hoja vacía o solo con headers');
      return [];
    }

    const data = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
    
    const lideresLD = [];
    for (const row of data) {
      const [id, nombre, rol] = row;
      
      if (id && rol && rol.toString().trim().toUpperCase() === LIDERES_CONFIG.ROLES.LD) {
        lideresLD.push({
          ID_Lider: id.toString().trim(),
          Nombre_Lider: nombre ? nombre.toString().trim() : ''
        });
      }
    }
    
    console.log(`[LideresModule] ${lideresLD.length} líderes LD cargados`);
    return lideresLD;
    
  } catch (error) {
    console.error('[LideresModule] Error cargando líderes LD:', error);
    return [];
  }
}

/**
 * Carga líderes por rol específico
 * @param {Object} spreadsheet - Objeto spreadsheet de Google Apps Script
 * @param {string} sheetName - Nombre de la hoja
 * @param {string} rol - Rol a filtrar
 * @returns {Array} Array de líderes del rol especificado
 */
function cargarLideresPorRol(spreadsheet, sheetName, rol) {
  try {
    console.log(`[LideresModule] Cargando líderes con rol: ${rol}`);
    
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) return [];

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];

    const headers = data[0].map(h => h.toString().trim());
    const columnas = mapearColumnasLideres(headers);
    const rolIndex = columnas.rol;
    
    if (rolIndex === -1) {
      console.warn('[LideresModule] Columna de rol no encontrada');
      return [];
    }
    
    const lideres = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rolFila = row[rolIndex];
      
      if (rolFila && rolFila.toString().trim().toUpperCase() === rol.toUpperCase()) {
        const lider = procesarFilaLider(row, columnas, headers);
        if (lider && lider.ID_Lider) {
          lideres.push(lider);
        }
      }
    }
    
    console.log(`[LideresModule] ${lideres.length} líderes con rol ${rol} cargados`);
    return lideres;
    
  } catch (error) {
    console.error(`[LideresModule] Error cargando líderes por rol ${rol}:`, error);
    return [];
  }
}

// ==================== FUNCIONES DE ANÁLISIS DE LÍDERES ====================

/**
 * Analiza la estructura jerárquica de líderes
 * @param {Array} lideres - Array de líderes
 * @returns {Object} Análisis de la estructura jerárquica
 */
function analizarEstructuraLideres(lideres) {
  try {
    console.log('[LideresModule] Analizando estructura jerárquica...');
    
    const analisis = {
      total_lideres: lideres.length,
      por_rol: {},
      jerarquia: {
        ld: [],
        lcf: [],
        lm: [],
        sg: []
      },
      supervision: {
        sin_supervisor: [],
        con_supervisor: []
      },
      actividad: {
        activos: 0,
        alerta: 0,
        inactivos: 0,
        sin_datos: 0
      }
    };
    
    // Contar por rol
    lideres.forEach(lider => {
      const rol = lider.Rol || 'Sin Rol';
      analisis.por_rol[rol] = (analisis.por_rol[rol] || 0) + 1;
      
      // Agrupar por rol en jerarquía
      if (rol === LIDERES_CONFIG.ROLES.LD) {
        analisis.jerarquia.ld.push(lider);
      } else if (rol === LIDERES_CONFIG.ROLES.LCF) {
        analisis.jerarquia.lcf.push(lider);
      } else if (rol === LIDERES_CONFIG.ROLES.LM) {
        analisis.jerarquia.lm.push(lider);
      } else if (rol === LIDERES_CONFIG.ROLES.SG || rol === LIDERES_CONFIG.ROLES.SMALL_GROUP) {
        analisis.jerarquia.sg.push(lider);
      }
      
      // Analizar supervisión
      if (lider.ID_Lider_Directo) {
        analisis.supervision.con_supervisor.push(lider);
      } else {
        analisis.supervision.sin_supervisor.push(lider);
      }
      
      // Analizar actividad
      const estado = lider.Estado_Actividad || LIDERES_CONFIG.ESTADOS_ACTIVIDAD.SIN_DATOS;
      switch (estado) {
        case LIDERES_CONFIG.ESTADOS_ACTIVIDAD.ACTIVO:
          analisis.actividad.activos++;
          break;
        case LIDERES_CONFIG.ESTADOS_ACTIVIDAD.ALERTA:
          analisis.actividad.alerta++;
          break;
        case LIDERES_CONFIG.ESTADOS_ACTIVIDAD.INACTIVO:
          analisis.actividad.inactivos++;
          break;
        default:
          analisis.actividad.sin_datos++;
      }
    });
    
    console.log('[LideresModule] Análisis de estructura completado');
    return analisis;
    
  } catch (error) {
    console.error('[LideresModule] Error analizando estructura:', error);
    return {
      total_lideres: 0,
      por_rol: {},
      jerarquia: { ld: [], lcf: [], lm: [], sg: [] },
      supervision: { sin_supervisor: [], con_supervisor: [] },
      actividad: { activos: 0, alerta: 0, inactivos: 0, sin_datos: 0 }
    };
  }
}

/**
 * Calcula métricas de líderes
 * @param {Array} lideres - Array de líderes
 * @returns {Object} Métricas calculadas
 */
function calcularMetricasLideres(lideres) {
  try {
    console.log('[LideresModule] Calculando métricas de líderes...');
    
    const totalLideres = lideres.length;
    const ldCount = lideres.filter(l => l.Rol === LIDERES_CONFIG.ROLES.LD).length;
    const lcfCount = lideres.filter(l => l.Rol === LIDERES_CONFIG.ROLES.LCF).length;
    const lmCount = lideres.filter(l => l.Rol === LIDERES_CONFIG.ROLES.LM).length;
    const sgCount = lideres.filter(l => l.Rol === LIDERES_CONFIG.ROLES.SG || l.Rol === LIDERES_CONFIG.ROLES.SMALL_GROUP).length;
    
    const activos = lideres.filter(l => l.Estado_Actividad === LIDERES_CONFIG.ESTADOS_ACTIVIDAD.ACTIVO).length;
    const inactivos = lideres.filter(l => l.Estado_Actividad === LIDERES_CONFIG.ESTADOS_ACTIVIDAD.INACTIVO).length;
    
    const metricas = {
      total_lideres: totalLideres,
      total_LD: ldCount,
      total_LCF: lcfCount,
      total_LM: lmCount,
      total_SG: sgCount,
      promedio_lcf_por_ld: ldCount > 0 ? (lcfCount / ldCount).toFixed(1) : 0,
      tasa_actividad: totalLideres > 0 ? ((activos / totalLideres) * 100).toFixed(1) : 0,
      tasa_inactividad: totalLideres > 0 ? ((inactivos / totalLideres) * 100).toFixed(1) : 0
    };
    
    console.log('[LideresModule] Métricas calculadas:', metricas);
    return metricas;
    
  } catch (error) {
    console.error('[LideresModule] Error calculando métricas:', error);
    return {
      total_lideres: 0,
      total_LD: 0,
      total_LCF: 0,
      total_LM: 0,
      total_SG: 0,
      promedio_lcf_por_ld: 0,
      tasa_actividad: 0,
      tasa_inactividad: 0
    };
  }
}

// ==================== FUNCIONES DE BÚSQUEDA Y FILTRADO ====================

/**
 * Busca un líder por ID
 * @param {Array} lideres - Array de líderes
 * @param {string} idLider - ID del líder a buscar
 * @returns {Object|null} Líder encontrado o null
 */
function buscarLiderPorId(lideres, idLider) {
  try {
    return lideres.find(lider => lider.ID_Lider === idLider) || null;
  } catch (error) {
    console.error('[LideresModule] Error buscando líder por ID:', error);
    return null;
  }
}

/**
 * Busca líderes por nombre (búsqueda parcial)
 * @param {Array} lideres - Array de líderes
 * @param {string} nombre - Nombre a buscar
 * @returns {Array} Array de líderes que coinciden
 */
function buscarLideresPorNombre(lideres, nombre) {
  try {
    const nombreBusqueda = nombre.toLowerCase().trim();
    return lideres.filter(lider => 
      lider.Nombre_Lider && 
      lider.Nombre_Lider.toLowerCase().includes(nombreBusqueda)
    );
  } catch (error) {
    console.error('[LideresModule] Error buscando líderes por nombre:', error);
    return [];
  }
}

/**
 * Obtiene subordinados de un líder
 * @param {Array} lideres - Array de líderes
 * @param {string} idSupervisor - ID del supervisor
 * @returns {Array} Array de subordinados
 */
function obtenerSubordinados(lideres, idSupervisor) {
  try {
    return lideres.filter(lider => lider.ID_Lider_Directo === idSupervisor);
  } catch (error) {
    console.error('[LideresModule] Error obteniendo subordinados:', error);
    return [];
  }
}

/**
 * Obtiene la jerarquía completa de un líder (recursivo)
 * @param {Array} lideres - Array de líderes
 * @param {string} idLider - ID del líder
 * @param {Set} visitados - IDs ya visitados (para evitar ciclos)
 * @returns {Array} Array con toda la jerarquía
 */
function obtenerJerarquiaCompleta(lideres, idLider, visitados = new Set()) {
  try {
    if (visitados.has(idLider)) {
      return []; // Evitar ciclos infinitos
    }
    
    visitados.add(idLider);
    const subordinados = obtenerSubordinados(lideres, idLider);
    const jerarquia = [...subordinados];
    
    // Recursivamente obtener subordinados de subordinados
    subordinados.forEach(sub => {
      const subJerarquia = obtenerJerarquiaCompleta(lideres, sub.ID_Lider, visitados);
      jerarquia.push(...subJerarquia);
    });
    
    return jerarquia;
  } catch (error) {
    console.error('[LideresModule] Error obteniendo jerarquía completa:', error);
    return [];
  }
}

// ==================== FUNCIONES DE UTILIDAD ====================

/**
 * Mapea las columnas de la hoja de líderes
 * @param {Array} headers - Encabezados de la hoja
 * @returns {Object} Mapeo de columnas
 */
function mapearColumnasLideres(headers) {
  return {
    idLider: findCol(headers, ['ID_Lider', 'ID Líder', 'ID']),
    nombreLider: findCol(headers, ['Nombre_Lider', 'Nombre Líder', 'Nombre']),
    rol: findCol(headers, ['Rol', 'Tipo']),
    idLiderDirecto: findCol(headers, ['ID_Lider_Directo', 'Supervisor', 'ID LD']),
    congregacion: findCol(headers, ['Congregación', 'Congregacion']),
    estadoActividad: findCol(headers, ['Estado_Actividad', 'Estado Actividad']),
    diasInactivo: findCol(headers, ['Dias_Inactivo', 'Días Inactivo']),
    ultimaActividad: findCol(headers, ['Ultima_Actividad', 'Última Actividad'])
  };
}

/**
 * Procesa una fila de líder
 * @param {Array} row - Fila de datos
 * @param {Object} columnas - Mapeo de columnas
 * @param {Array} headers - Encabezados
 * @returns {Object|null} Líder procesado o null
 */
function procesarFilaLider(row, columnas, headers) {
  try {
    const idLider = row[columnas.idLider];
    
    if (!idLider) {
      return null; // Saltar filas sin ID
    }
    
    const lider = {
      ID_Lider: idLider.toString().trim(),
      Nombre_Lider: row[columnas.nombreLider] ? row[columnas.nombreLider].toString().trim() : '',
      Rol: row[columnas.rol] ? row[columnas.rol].toString().trim().toUpperCase() : '',
      ID_Lider_Directo: row[columnas.idLiderDirecto] ? row[columnas.idLiderDirecto].toString().trim() : '',
      Congregacion: row[columnas.congregacion] ? row[columnas.congregacion].toString().trim() : '',
      Estado_Actividad: row[columnas.estadoActividad] ? row[columnas.estadoActividad].toString().trim() : LIDERES_CONFIG.ESTADOS_ACTIVIDAD.SIN_DATOS,
      Dias_Inactivo: row[columnas.diasInactivo] ? parseInt(row[columnas.diasInactivo]) : null,
      Ultima_Actividad: row[columnas.ultimaActividad] ? row[columnas.ultimaActividad] : null
    };
    
    return lider;
    
  } catch (error) {
    console.error('[LideresModule] Error procesando fila de líder:', error);
    return null;
  }
}

// ==================== FUNCIONES DE COMPATIBILIDAD ====================

/**
 * Función de compatibilidad para cargar líderes (wrapper)
 * @param {Object} spreadsheet - Objeto spreadsheet de Google Apps Script
 * @returns {Array} Array de líderes
 */
function cargarHojaLideres(spreadsheet) {
  return cargarLideresCompletos(spreadsheet);
}

// ============================================
// NOTA: getListaDeLideres() eliminada
// ============================================
// Esta función estaba duplicada y causaba conflictos.
// La versión oficial está en CoreModule.gs
// Eliminada en optimización de performance
// Fecha: 29 de septiembre de 2025
// Mejora esperada: De 192s a <5s

console.log('👥 LideresModule cargado - Gestión de líderes modularizada');
