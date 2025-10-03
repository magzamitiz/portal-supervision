/**
 * @fileoverview Módulo unificado de utilidades y funciones auxiliares.
 * Combina GlobalHelpers, NormalizacionModule y UtilityModule en un solo módulo optimizado.
 */

// ==================== CONSTANTES Y VARIABLES GLOBALES ====================

// SCRIPT_START_TIME y MAX_EXECUTION_TIME ya están declarados en TimeoutModule.gs
// CACHE_KEY ya está declarado en CacheModule.gs

// ==================== FUNCIONES AUXILIARES GLOBALES ====================

/**
 * Función helper optimizada para leer rangos de hojas de forma eficiente
 * Evita leer filas vacías y optimiza el rendimiento
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Hoja de cálculo
 * @param {number} maxRows - Número máximo de filas a leer (default: 10000)
 * @param {number} startRow - Fila de inicio (default: 1)
 * @param {number} startCol - Columna de inicio (default: 1)
 * @param {number} endCol - Columna final (default: null = todas)
 * @returns {Array} Datos optimizados de la hoja
 */
function getOptimizedRange(sheet, maxRows = 10000, startRow = 1, startCol = 1, endCol = null) {
  try {
    // Verificar que la hoja existe
    if (!sheet) {
      console.warn('[getOptimizedRange] Hoja no proporcionada');
      return [];
    }
    
    // Obtener dimensiones reales de la hoja
    const lastRow = Math.min(sheet.getLastRow(), maxRows);
    const lastCol = endCol || sheet.getLastColumn();
    
    // Verificar que hay datos
    if (lastRow === 0 || lastCol === 0) {
      console.log('[getOptimizedRange] Hoja vacía, retornando array vacío');
      return [];
    }
    
    // Ajustar rangos para evitar errores
    const actualStartRow = Math.max(1, startRow);
    const actualEndRow = Math.min(lastRow, actualStartRow + maxRows - 1);
    const actualStartCol = Math.max(1, startCol);
    const actualEndCol = Math.min(lastCol, endCol || lastCol);
    
    if (actualEndRow < actualStartRow || actualEndCol < actualStartCol) {
      console.warn('[getOptimizedRange] Rango inválido:', {
        startRow: actualStartRow,
        endRow: actualEndRow,
        startCol: actualStartCol,
        endCol: actualEndCol
      });
      return [];
    }
    
    // Leer datos del rango calculado
    const range = sheet.getRange(
      actualStartRow, 
      actualStartCol, 
      actualEndRow - actualStartRow + 1, 
      actualEndCol - actualStartCol + 1
    );
    
    const data = range.getValues();
    
    // Encontrar la última fila real con datos (no vacía)
    let realLastRow = data.length - 1;
    while (realLastRow >= 0) {
      // Verificar si la fila tiene al menos una celda no vacía
      const hasData = data[realLastRow].some(cell => 
        cell !== '' && cell !== null && cell !== undefined
      );
      if (hasData) break;
      realLastRow--;
    }
    
    // Retornar solo las filas con datos reales
    const optimizedData = data.slice(0, realLastRow + 1);
    
    console.log(`[getOptimizedRange] Optimizado: ${data.length} → ${optimizedData.length} filas (${((1 - optimizedData.length/data.length) * 100).toFixed(1)}% reducción)`);
    
    return optimizedData;
    
  } catch (error) {
    console.error('[getOptimizedRange] Error:', error);
    return [];
  }
}

/**
 * Función helper para obtener solo los headers de una hoja de forma optimizada
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Hoja de cálculo
 * @param {number} maxCols - Número máximo de columnas a leer (default: 50)
 * @returns {Array} Array de headers limpios
 */
function getOptimizedHeaders(sheet, maxCols = 50) {
  try {
    if (!sheet) return [];
    
    const lastCol = Math.min(sheet.getLastColumn(), maxCols);
    if (lastCol === 0) return [];
    
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    return headers.map(header => 
      header ? header.toString().trim() : ''
    ).filter(header => header !== '');
    
  } catch (error) {
    console.error('[getOptimizedHeaders] Error:', error);
    return [];
  }
}

/**
 * Función helper para obtener datos de una hoja con headers de forma optimizada
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Hoja de cálculo
 * @param {Object} options - Opciones de lectura
 * @returns {Object} Objeto con headers y datos optimizados
 */
function getOptimizedSheetData(sheet, options = {}) {
  const {
    maxRows = 10000,
    startRow = 1,
    startCol = 1,
    endCol = null,
    includeHeaders = true
  } = options;
  
  try {
    const headers = getOptimizedHeaders(sheet, endCol || 50);
    const data = getOptimizedRange(sheet, maxRows, startRow, startCol, endCol);
    
    if (includeHeaders && data.length > 0) {
      return {
        headers: headers,
        data: data,
        rowCount: data.length
      };
    } else {
      return {
        headers: [],
        data: data.slice(1), // Excluir fila de headers
        rowCount: data.length - 1
      };
    }
    
  } catch (error) {
    console.error('[getOptimizedSheetData] Error:', error);
    return { headers: [], data: [], rowCount: 0 };
  }
}

/**
 * Función helper para obtener el total de miembros de una célula
 * Compatible con ambas estructuras (antigua con Total_Miembros y nueva con Miembros array)
 * @param {Object} celula - Objeto de célula
 * @returns {number} Total de miembros de la célula
 */
function obtenerTotalMiembros(celula) {
  if (!celula) return 0;
  
  // Prioridad 1: Total_Miembros si existe (estructura antigua)
  if (typeof celula.Total_Miembros === 'number') {
    return celula.Total_Miembros;
  }
  
  // Prioridad 2: Miembros como array (estructura nueva correcta)
  if (Array.isArray(celula.Miembros)) {
    return celula.Miembros.length;
  }
  
  // Prioridad 3: Miembros como número (estructura errónea temporal)
  if (typeof celula.Miembros === 'number') {
    console.warn(`[Helper] Célula ${celula.ID_Celula} tiene Miembros como número, debe ser array`);
    return celula.Miembros;
  }
  
  // Default
  return 0;
}

/**
 * Helper global para búsqueda flexible de columnas.
 * Busca una columna en los headers que contenga cualquiera de los nombres especificados.
 * @param {Array<string>} headers - Array de nombres de columnas
 * @param {Array<string>} names - Array de nombres a buscar
 * @returns {number} Índice de la columna encontrada o -1 si no se encuentra
 * 
 * NOTA: Esta función ya está declarada en DataModule.gs
 */

/**
 * Helper global para verificar timeout de ejecución.
 * @throws {Error} Si el tiempo de ejecución excede MAX_EXECUTION_TIME
 * 
 * NOTA: Esta función ya está declarada en TimeoutModule.gs
 */

/**
 * Helper global para limpiar caché.
 * 
 * NOTA: Esta función ya está declarada en CacheModule.gs
 */

/**
 * Helper global para obtener datos de caché.
 * @returns {Object|null} Datos de caché o null
 * 
 * NOTA: Esta función ya está declarada en CacheModule.gs
 */

/**
 * Helper global para guardar datos en caché.
 * @param {Object} data - Datos a guardar
 * 
 * NOTA: Esta función ya está declarada en CacheModule.gs
 */

// ==================== FUNCIONES DE NORMALIZACIÓN ====================

/**
 * Normaliza valores de Sí/No a formato estándar.
 * @param {*} input - Valor de entrada a normalizar
 * @returns {string} Valor normalizado: 'SI', 'NO', o valor original
 */
function normalizeYesNo(input) {
  if (!input) return 'NO_DATA';
  const normalized = String(input).trim().toUpperCase();
  if (normalized === 'SÍ' || normalized === 'SI' || normalized === 'YES') {
    return 'SI';
  }
  if (normalized === 'NO') {
    return 'NO';
  }
  return normalized;
}

/**
 * Determina la prioridad de un ingreso basándose en decisiones espirituales.
 * @param {string} deseaVisita - Si desea visita (normalizado)
 * @param {string} aceptoJesus - Si aceptó a Jesús (normalizado)
 * @returns {string} Prioridad: 'Alta', 'Media', 'Normal'
 */
function determinarPrioridad(deseaVisita, aceptoJesus) {
  if (aceptoJesus === 'SI' && deseaVisita === 'SI') {
    return 'Alta';
  } else if (aceptoJesus === 'SI' || deseaVisita === 'SI') {
    return 'Media';
  }
  return 'Normal';
}

/**
 * Normaliza nombres de personas.
 * @param {string} nombre - Nombre a normalizar
 * @returns {string} Nombre normalizado
 */
function normalizarNombre(nombre) {
  if (!nombre) return '';
  return String(nombre).trim().replace(/\s+/g, ' ');
}

/**
 * Normaliza números de teléfono.
 * @param {string} telefono - Teléfono a normalizar
 * @returns {string} Teléfono normalizado
 */
function normalizarTelefono(telefono) {
  if (!telefono) return '';
  return String(telefono).replace(/\D/g, ''); // Solo números
}

/**
 * Normaliza fechas a formato ISO.
 * @param {*} fecha - Fecha a normalizar
 * @returns {string|null} Fecha en formato ISO o null
 */
function normalizarFecha(fecha) {
  if (!fecha) return null;
  
  try {
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) return null;
    return fechaObj.toISOString();
  } catch (error) {
    return null;
  }
}

/**
 * Normaliza IDs eliminando espacios y convirtiendo a mayúsculas.
 * @param {string} id - ID a normalizar
 * @returns {string} ID normalizado
 */
function normalizarId(id) {
  if (!id) return '';
  return String(id).trim().toUpperCase();
}

/**
 * Normaliza texto general eliminando espacios extra.
 * @param {string} texto - Texto a normalizar
 * @returns {string} Texto normalizado
 */
function normalizarTexto(texto) {
  if (!texto) return '';
  return String(texto).trim().replace(/\s+/g, ' ');
}

/**
 * Normaliza estado de actividad.
 * @param {string} estado - Estado a normalizar
 * @returns {string} Estado normalizado
 */
function normalizarEstadoActividad(estado) {
  if (!estado) return 'Sin Datos';
  
  const estadoNormalizado = String(estado).trim().toLowerCase();
  
  if (estadoNormalizado.includes('activo')) return 'Activo';
  if (estadoNormalizado.includes('alerta')) return 'Alerta';
  if (estadoNormalizado.includes('inactivo')) return 'Inactivo';
  
  return 'Sin Datos';
}

/**
 * Normaliza rol de líder.
 * @param {string} rol - Rol a normalizar
 * @returns {string} Rol normalizado
 */
function normalizarRol(rol) {
  if (!rol) return '';
  
  const rolNormalizado = String(rol).trim().toUpperCase();
  
  if (rolNormalizado.includes('LD')) return 'LD';
  if (rolNormalizado.includes('LCF')) return 'LCF';
  
  return rolNormalizado;
}

/**
 * Normaliza estado de asignación.
 * @param {string} estado - Estado a normalizar
 * @returns {string} Estado normalizado
 */
function normalizarEstadoAsignacion(estado) {
  if (!estado) return 'Pendiente';
  
  const estadoNormalizado = String(estado).trim().toLowerCase();
  
  if (estadoNormalizado.includes('asignad')) return 'Asignado';
  if (estadoNormalizado.includes('pendient')) return 'Pendiente';
  if (estadoNormalizado.includes('baja')) return 'Baja';
  
  return 'Pendiente';
}

// ==================== FUNCIONES DE MAPEO Y INTEGRACIÓN ====================

/**
 * Mapea almas a células para integración
 * @param {Array} celulas - Array de células
 * @returns {Map} Mapa de ID_Alma -> ID_Celula
 * 
 * NOTA: Esta función ya está declarada en ActividadModule.gs
 */

/**
 * Integra la información de la célula en la lista de ingresos (almas)
 * @param {Array} ingresos - Array de ingresos
 * @param {Map} almasEnCelulasMap - Mapa de almas a células
 * 
 * NOTA: Esta función ya está declarada en ActividadModule.gs
 */

/**
 * Calcula resumen de seguimiento para un LCF
 * @param {Array} almasConSeguimiento - Array de almas con seguimiento
 * @param {Object} lcf - Información del LCF
 * @returns {Object} Resumen del seguimiento
 * 
 * NOTA: Esta función ya está declarada en SeguimientoSeguro.gs
 */

/**
 * Procesa un alma de forma segura
 * @param {Object} alma - Datos del alma
 * @param {Array} data - Datos adicionales
 * @param {Object} lcf - Información del LCF
 * @returns {Object} Alma procesada
 * 
 * NOTA: Esta función ya está declarada en SeguimientoSeguro.gs
 */

// ==================== FUNCIONES DE CÁLCULO DE ACTIVIDAD ====================

/**
 * Calcula actividad de líderes con mapeo de células
 * @param {Array} celulas - Array de células
 * @returns {Map} Mapa de actividad de líderes
 * 
 * NOTA: Esta función ya está declarada en ActividadModule.gs
 */

/**
 * Procesa una hoja de actividad externa
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
      console.warn(`En la hoja "${sheet.getName()}", no se encontró una de las columnas requeridas (Timestamp o ID).`);
      return;
    }

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      let idInicial = String(row[idIndex] || '').trim();
      const timestamp = row[timestampIndex];
      
      const leaderId = idLookupMap ? idLookupMap.get(idInicial) : idInicial;

      if (leaderId && timestamp instanceof Date && !isNaN(timestamp.getTime())) {
        const currentDate = timestamp;
        const existingDate = actividadMap.get(leaderId);

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
 * Integra actividad de líderes en la lista de líderes
 * @param {Array} lideres - Array de líderes
 * @param {Map} actividadMap - Mapa de actividad
 * @returns {Array} Líderes con actividad integrada
 * 
 * NOTA: Esta función ya está declarada en ActividadModule.gs
 */

/**
 * Cuenta las células activas
 * @param {Array} celulas - Array de células
 * @returns {number} Número de células activas
 */
function contarCelulasActivas(celulas) {
  return celulas.filter(c => 
    c.Estado === 'Activo' || 
    c.Estado === 'Saludable' || 
    c.Estado === 'En Crecimiento'
  ).length;
}

/**
 * Verifica si un alma está en alguna célula
 * @param {string} idAlma - ID del alma
 * @param {Array} celulas - Array de células
 * @returns {boolean} True si está en alguna célula
 */
function verificarEnCelula(idAlma, celulas) {
  return celulas.some(celula => 
    celula.Miembros.some(m => m.ID_Miembro === idAlma)
  );
}

console.log('🛠️ UtilsModule cargado - Funciones auxiliares unificadas disponibles');
