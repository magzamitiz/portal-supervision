/**
 * QUERY OPTIMIZER - OPTIMIZACIÓN DE CONSULTAS
 * Etapa 3 - Semana 3: Optimización avanzada de consultas a Google Sheets
 * 
 * Este módulo implementa técnicas avanzadas de optimización de consultas
 * usando getRangeList y otras técnicas para maximizar el rendimiento.
 */

// ==================== CONFIGURACIÓN DEL OPTIMIZADOR ====================

const QUERY_OPTIMIZER_CONFIG = {
  BATCH_SIZE: 10, // Tamaño de lote para operaciones masivas
  MAX_RANGES_PER_BATCH: 50, // Máximo de rangos por lote
  CACHE_DURATION: 300, // 5 minutos de caché para consultas
  RETRY_ATTEMPTS: 3, // Intentos de reintento
  RETRY_DELAY: 1000 // Delay entre reintentos en ms
};

// ==================== CACHÉ DE CONSULTAS ====================

const queryCache = new Map();

/**
 * Genera una clave de caché para una consulta
 * @param {string} spreadsheetId - ID del spreadsheet
 * @param {string} sheetName - Nombre de la hoja
 * @param {Array} ranges - Rangos de la consulta
 * @returns {string} Clave de caché
 */
function generateCacheKey(spreadsheetId, sheetName, ranges) {
  const rangesStr = ranges.map(r => `${r.startRow}-${r.endRow}-${r.startCol}-${r.endCol}`).join('|');
  return `${spreadsheetId}_${sheetName}_${rangesStr}`;
}

/**
 * Obtiene datos de caché
 * @param {string} cacheKey - Clave de caché
 * @returns {Array|null} Datos en caché o null
 */
function getCachedQuery(cacheKey) {
  const cached = queryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < QUERY_OPTIMIZER_CONFIG.CACHE_DURATION * 1000) {
    console.log(`[QueryOptimizer] Cache hit para: ${cacheKey}`);
    return cached.data;
  }
  return null;
}

/**
 * Guarda datos en caché
 * @param {string} cacheKey - Clave de caché
 * @param {Array} data - Datos a cachear
 */
function setCachedQuery(cacheKey, data) {
  queryCache.set(cacheKey, {
    data: data,
    timestamp: Date.now()
  });
}

// ==================== CONSULTAS OPTIMIZADAS ====================

/**
 * Obtiene datos de múltiples rangos de forma optimizada
 * @param {string} spreadsheetId - ID del spreadsheet
 * @param {string} sheetName - Nombre de la hoja
 * @param {Array<Object>} ranges - Array de rangos {startRow, endRow, startCol, endCol}
 * @param {boolean} useCache - Si usar caché (default: true)
 * @returns {Array} Array de datos de cada rango
 */
function getOptimizedRanges(spreadsheetId, sheetName, ranges, useCache = true) {
  const startTime = Date.now();
  
  try {
    // Verificar caché si está habilitado
    if (useCache) {
      const cacheKey = generateCacheKey(spreadsheetId, sheetName, ranges);
      const cachedData = getCachedQuery(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }
    
    // Validar rangos
    if (!ranges || ranges.length === 0) {
      console.warn('[QueryOptimizer] No se proporcionaron rangos');
      return [];
    }
    
    // Dividir en lotes si es necesario
    const batches = splitIntoBatches(ranges, QUERY_OPTIMIZER_CONFIG.MAX_RANGES_PER_BATCH);
    const allResults = [];
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`[QueryOptimizer] Procesando lote ${i + 1}/${batches.length} con ${batch.length} rangos`);
      
      const batchResults = processBatch(spreadsheetId, sheetName, batch);
      allResults.push(...batchResults);
      
      // Pausa entre lotes para evitar límites de API
      if (i < batches.length - 1) {
        Utilities.sleep(100);
      }
    }
    
    // Guardar en caché si está habilitado
    if (useCache) {
      const cacheKey = generateCacheKey(spreadsheetId, sheetName, ranges);
      setCachedQuery(cacheKey, allResults);
    }
    
    const duration = Date.now() - startTime;
    console.log(`[QueryOptimizer] ${ranges.length} rangos procesados en ${duration}ms`);
    
    return allResults;
    
  } catch (error) {
    console.error('[QueryOptimizer] Error en getOptimizedRanges:', error);
    throw new Error(`Error obteniendo rangos optimizados: ${error.message}`);
  }
}

/**
 * Procesa un lote de rangos
 * @param {string} spreadsheetId - ID del spreadsheet
 * @param {string} sheetName - Nombre de la hoja
 * @param {Array<Object>} ranges - Rangos del lote
 * @returns {Array} Datos del lote
 */
function processBatch(spreadsheetId, sheetName, ranges) {
  const sm = getSpreadsheetManagerInstance();
  const sheet = sm.getSheet(spreadsheetId, sheetName);
  
  // Convertir rangos a notación A1
  const rangeList = ranges.map(range => {
    const { startRow, endRow, startCol, endCol } = range;
    return sheet.getRange(startRow, startCol, endRow - startRow + 1, endCol - startCol + 1).getA1Notation();
  });
  
  // Obtener datos usando getRangeList
  const rangeListObj = sheet.getRangeList(rangeList);
  const allData = rangeListObj.getValues();
  
  // Dividir los datos por rango
  const results = [];
  let dataIndex = 0;
  
  ranges.forEach(range => {
    const { startRow, endRow, startCol, endCol } = range;
    const rowCount = endRow - startRow + 1;
    const rangeData = allData.slice(dataIndex, dataIndex + rowCount);
    results.push(rangeData);
    dataIndex += rowCount;
  });
  
  return results;
}

/**
 * Divide un array en lotes
 * @param {Array} array - Array a dividir
 * @param {number} batchSize - Tamaño del lote
 * @returns {Array<Array>} Array de lotes
 */
function splitIntoBatches(array, batchSize) {
  const batches = [];
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }
  return batches;
}

// ==================== CONSULTAS ESPECIALIZADAS ====================

/**
 * Obtiene datos de líderes de forma optimizada
 * @param {string} spreadsheetId - ID del spreadsheet
 * @param {string} sheetName - Nombre de la hoja
 * @param {Array<string>} leaderIds - IDs de líderes específicos
 * @returns {Array} Datos de líderes
 */
function getLeadersOptimized(spreadsheetId, sheetName, leaderIds = null) {
  try {
    const sm = getSpreadsheetManagerInstance();
    const sheet = sm.getSheet(spreadsheetId, sheetName);
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    
    if (lastRow < 2) return [];
    
    // Si se especifican IDs específicos, usar consulta optimizada
    if (leaderIds && leaderIds.length > 0) {
      return getLeadersByIds(spreadsheetId, sheetName, leaderIds);
    }
    
    // Consulta completa optimizada
    const ranges = [{
      startRow: 1,
      endRow: lastRow,
      startCol: 1,
      endCol: lastCol
    }];
    
    const results = getOptimizedRanges(spreadsheetId, sheetName, ranges);
    return results[0] || [];
    
  } catch (error) {
    console.error('[QueryOptimizer] Error obteniendo líderes optimizados:', error);
    return [];
  }
}

/**
 * Obtiene líderes por IDs específicos
 * @param {string} spreadsheetId - ID del spreadsheet
 * @param {string} sheetName - Nombre de la hoja
 * @param {Array<string>} leaderIds - IDs de líderes
 * @returns {Array} Datos de líderes
 */
function getLeadersByIds(spreadsheetId, sheetName, leaderIds) {
  try {
    const sm = getSpreadsheetManagerInstance();
    const sheet = sm.getSheet(spreadsheetId, sheetName);
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    
    if (lastRow < 2) return [];
    
    // Obtener todos los datos
    const allData = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const headers = allData[0];
    const idColumnIndex = headers.findIndex(h => h.toString().toLowerCase().includes('id'));
    
    if (idColumnIndex === -1) {
      console.warn('[QueryOptimizer] No se encontró columna de ID');
      return allData;
    }
    
    // Filtrar por IDs específicos
    const filteredData = allData.filter((row, index) => {
      if (index === 0) return true; // Incluir headers
      const rowId = String(row[idColumnIndex] || '').trim();
      return leaderIds.includes(rowId);
    });
    
    return filteredData;
    
  } catch (error) {
    console.error('[QueryOptimizer] Error obteniendo líderes por IDs:', error);
    return [];
  }
}

/**
 * Obtiene datos de células de forma optimizada
 * @param {string} spreadsheetId - ID del spreadsheet
 * @param {string} sheetName - Nombre de la hoja
 * @param {string} lcfId - ID del LCF (opcional)
 * @returns {Array} Datos de células
 */
function getCellsOptimized(spreadsheetId, sheetName, lcfId = null) {
  try {
    const sm = getSpreadsheetManagerInstance();
    const sheet = sm.getSheet(spreadsheetId, sheetName);
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    
    if (lastRow < 2) return [];
    
    // Si se especifica LCF, usar consulta optimizada
    if (lcfId) {
      return getCellsByLCF(spreadsheetId, sheetName, lcfId);
    }
    
    // Consulta completa optimizada
    const ranges = [{
      startRow: 1,
      endRow: lastRow,
      startCol: 1,
      endCol: lastCol
    }];
    
    const results = getOptimizedRanges(spreadsheetId, sheetName, ranges);
    return results[0] || [];
    
  } catch (error) {
    console.error('[QueryOptimizer] Error obteniendo células optimizadas:', error);
    return [];
  }
}

/**
 * Obtiene células por LCF específico
 * @param {string} spreadsheetId - ID del spreadsheet
 * @param {string} sheetName - Nombre de la hoja
 * @param {string} lcfId - ID del LCF
 * @returns {Array} Datos de células
 */
function getCellsByLCF(spreadsheetId, sheetName, lcfId) {
  try {
    const sm = getSpreadsheetManagerInstance();
    const sheet = sm.getSheet(spreadsheetId, sheetName);
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    
    if (lastRow < 2) return [];
    
    // Obtener todos los datos
    const allData = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const headers = allData[0];
    const lcfColumnIndex = headers.findIndex(h => h.toString().toLowerCase().includes('lcf'));
    
    if (lcfColumnIndex === -1) {
      console.warn('[QueryOptimizer] No se encontró columna de LCF');
      return allData;
    }
    
    // Filtrar por LCF específico
    const filteredData = allData.filter((row, index) => {
      if (index === 0) return true; // Incluir headers
      const rowLCF = String(row[lcfColumnIndex] || '').trim();
      return rowLCF === lcfId;
    });
    
    return filteredData;
    
  } catch (error) {
    console.error('[QueryOptimizer] Error obteniendo células por LCF:', error);
    return [];
  }
}

/**
 * Obtiene datos de ingresos de forma optimizada
 * @param {string} spreadsheetId - ID del spreadsheet
 * @param {string} sheetName - Nombre de la hoja
 * @param {string} lcfId - ID del LCF (opcional)
 * @returns {Array} Datos de ingresos
 */
function getIncomeOptimized(spreadsheetId, sheetName, lcfId = null) {
  try {
    const sm = getSpreadsheetManagerInstance();
    const sheet = sm.getSheet(spreadsheetId, sheetName);
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    
    if (lastRow < 2) return [];
    
    // Si se especifica LCF, usar consulta optimizada
    if (lcfId) {
      return getIncomeByLCF(spreadsheetId, sheetName, lcfId);
    }
    
    // Consulta completa optimizada
    const ranges = [{
      startRow: 1,
      endRow: lastRow,
      startCol: 1,
      endCol: lastCol
    }];
    
    const results = getOptimizedRanges(spreadsheetId, sheetName, ranges);
    return results[0] || [];
    
  } catch (error) {
    console.error('[QueryOptimizer] Error obteniendo ingresos optimizados:', error);
    return [];
  }
}

/**
 * Obtiene ingresos por LCF específico
 * @param {string} spreadsheetId - ID del spreadsheet
 * @param {string} sheetName - Nombre de la hoja
 * @param {string} lcfId - ID del LCF
 * @returns {Array} Datos de ingresos
 */
function getIncomeByLCF(spreadsheetId, sheetName, lcfId) {
  try {
    const sm = getSpreadsheetManagerInstance();
    const sheet = sm.getSheet(spreadsheetId, sheetName);
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    
    if (lastRow < 2) return [];
    
    // Obtener todos los datos
    const allData = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const headers = allData[0];
    const lcfColumnIndex = headers.findIndex(h => h.toString().toLowerCase().includes('lcf'));
    
    if (lcfColumnIndex === -1) {
      console.warn('[QueryOptimizer] No se encontró columna de LCF');
      return allData;
    }
    
    // Filtrar por LCF específico
    const filteredData = allData.filter((row, index) => {
      if (index === 0) return true; // Incluir headers
      const rowLCF = String(row[lcfColumnIndex] || '').trim();
      return rowLCF === lcfId;
    });
    
    return filteredData;
    
  } catch (error) {
    console.error('[QueryOptimizer] Error obteniendo ingresos por LCF:', error);
    return [];
  }
}

// ==================== UTILIDADES DE OPTIMIZACIÓN ====================

/**
 * Limpia la caché de consultas
 */
function clearQueryCache() {
  queryCache.clear();
  console.log('[QueryOptimizer] Caché de consultas limpiada');
}

/**
 * Obtiene estadísticas de la caché de consultas
 * @returns {Object} Estadísticas de caché
 */
function getQueryCacheStats() {
  return {
    cacheSize: queryCache.size,
    maxCacheDuration: QUERY_OPTIMIZER_CONFIG.CACHE_DURATION,
    batchSize: QUERY_OPTIMIZER_CONFIG.BATCH_SIZE,
    maxRangesPerBatch: QUERY_OPTIMIZER_CONFIG.MAX_RANGES_PER_BATCH
  };
}

/**
 * Obtiene el SpreadsheetManager como singleton
 * @returns {SpreadsheetManager} Instancia del SpreadsheetManager
 */
function getSpreadsheetManagerInstance() {
  if (!SpreadsheetManager.instance) {
    SpreadsheetManager.instance = new SpreadsheetManager();
  }
  return SpreadsheetManager.instance;
}

console.log('⚡ QueryOptimizer cargado - Optimización de consultas disponible');
