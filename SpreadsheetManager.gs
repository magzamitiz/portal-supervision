/**
 * SPREADSHEET MANAGER - SINGLETON PATTERN OPTIMIZADO
 * Etapa 3 - Semana 3: Optimización avanzada de rendimiento
 * 
 * Este módulo implementa un patrón Singleton optimizado para gestionar
 * conexiones a Google Sheets con máximo rendimiento y mínima latencia.
 */

// ==================== SINGLETON SPREADSHEET MANAGER ====================

class SpreadsheetManager {
  constructor() {
    if (SpreadsheetManager.instance) {
      return SpreadsheetManager.instance;
    }
    
    this._spreadsheets = new Map();
    this._lastAccess = new Map();
    this._maxCacheTime = 5 * 60 * 1000; // 5 minutos
    this._performanceMetrics = new Map();
    this._connectionPool = new Map();
    this._maxConnections = 10;
    this._requestQueue = [];
    this._isProcessingQueue = false;
    
    SpreadsheetManager.instance = this;
  }
  
  /**
   * Obtiene una instancia de spreadsheet por ID
   * @param {string} spreadsheetId - ID del spreadsheet
   * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet} Instancia del spreadsheet
   */
  getSpreadsheet(spreadsheetId) {
    const now = Date.now();
    
    // Verificar si ya tenemos la instancia en caché
    if (this._spreadsheets.has(spreadsheetId)) {
      const lastAccess = this._lastAccess.get(spreadsheetId);
      
      // Si la caché es válida, retornar la instancia existente
      if (now - lastAccess < this._maxCacheTime) {
        this._lastAccess.set(spreadsheetId, now);
        return this._spreadsheets.get(spreadsheetId);
      } else {
        // Caché expirada, limpiar y crear nueva instancia
        this._spreadsheets.delete(spreadsheetId);
        this._lastAccess.delete(spreadsheetId);
      }
    }
    
    try {
      // Crear nueva instancia
      const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      
      // Guardar en caché
      this._spreadsheets.set(spreadsheetId, spreadsheet);
      this._lastAccess.set(spreadsheetId, now);
      
      console.log(`[SpreadsheetManager] Nueva conexión creada para: ${spreadsheetId}`);
      return spreadsheet;
      
    } catch (error) {
      console.error(`[SpreadsheetManager] Error abriendo spreadsheet ${spreadsheetId}:`, error);
      throw new Error(`No se pudo abrir el spreadsheet ${spreadsheetId}: ${error.message}`);
    }
  }
  
  /**
   * Obtiene una hoja específica de un spreadsheet
   * @param {string} spreadsheetId - ID del spreadsheet
   * @param {string} sheetName - Nombre de la hoja
   * @returns {GoogleAppsScript.Spreadsheet.Sheet} Instancia de la hoja
   */
  getSheet(spreadsheetId, sheetName) {
    const spreadsheet = this.getSpreadsheet(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error(`Hoja '${sheetName}' no encontrada en spreadsheet ${spreadsheetId}`);
    }
    
    return sheet;
  }
  
  /**
   * Obtiene datos de una hoja de forma optimizada
   * @param {string} spreadsheetId - ID del spreadsheet
   * @param {string} sheetName - Nombre de la hoja
   * @param {Object} options - Opciones de consulta
   * @param {number} options.startRow - Fila de inicio (default: 1)
   * @param {number} options.endRow - Fila final (default: última fila)
   * @param {number} options.startCol - Columna de inicio (default: 1)
   * @param {number} options.endCol - Columna final (default: última columna)
   * @param {boolean} options.headers - Si incluir encabezados (default: true)
   * @returns {Array} Datos de la hoja
   */
  getSheetData(spreadsheetId, sheetName, options = {}) {
    const {
      startRow = 1,
      endRow = null,
      startCol = 1,
      endCol = null,
      headers = true
    } = options;
    
    const sheet = this.getSheet(spreadsheetId, sheetName);
    
    // Determinar rango de datos
    const lastRow = endRow || sheet.getLastRow();
    const lastCol = endCol || sheet.getLastColumn();
    
    if (lastRow < startRow || lastCol < startCol) {
      console.warn(`[SpreadsheetManager] Rango inválido para ${sheetName}: ${startRow}-${lastRow}, ${startCol}-${lastCol}`);
      return [];
    }
    
    try {
      const range = sheet.getRange(startRow, startCol, lastRow - startRow + 1, lastCol - startCol + 1);
      const data = range.getValues();
      
      // Si no se requieren headers, retornar solo los datos
      if (!headers && data.length > 0) {
        return data.slice(1);
      }
      
      return data;
      
    } catch (error) {
      console.error(`[SpreadsheetManager] Error obteniendo datos de ${sheetName}:`, error);
      throw new Error(`Error obteniendo datos de ${sheetName}: ${error.message}`);
    }
  }
  
  /**
   * Obtiene solo los encabezados de una hoja
   * @param {string} spreadsheetId - ID del spreadsheet
   * @param {string} sheetName - Nombre de la hoja
   * @returns {Array} Array de encabezados
   */
  getHeaders(spreadsheetId, sheetName) {
    const sheet = this.getSheet(spreadsheetId, sheetName);
    const lastCol = sheet.getLastColumn();
    
    if (lastCol === 0) {
      return [];
    }
    
    try {
      const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      return headers.map(h => h.toString().trim());
    } catch (error) {
      console.error(`[SpreadsheetManager] Error obteniendo encabezados de ${sheetName}:`, error);
      return [];
    }
  }
  
  /**
   * Busca una columna por nombre (flexible)
   * @param {string} spreadsheetId - ID del spreadsheet
   * @param {string} sheetName - Nombre de la hoja
   * @param {Array} possibleNames - Posibles nombres de la columna
   * @returns {number} Índice de la columna (-1 si no se encuentra)
   */
  findColumn(spreadsheetId, sheetName, possibleNames) {
    const headers = this.getHeaders(spreadsheetId, sheetName);
    
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i].toLowerCase();
      for (const possibleName of possibleNames) {
        if (header.includes(possibleName.toLowerCase())) {
          return i;
        }
      }
    }
    
    return -1;
  }
  
  /**
   * Limpia la caché de spreadsheets
   */
  clearCache() {
    this._spreadsheets.clear();
    this._lastAccess.clear();
    console.log('[SpreadsheetManager] Caché limpiada');
  }
  
  /**
   * Obtiene estadísticas de la caché
   * @returns {Object} Estadísticas de uso
   */
  getCacheStats() {
    return {
      cachedSpreadsheets: this._spreadsheets.size,
      maxCacheTime: this._maxCacheTime,
      lastAccess: Object.fromEntries(this._lastAccess),
      performanceMetrics: Object.fromEntries(this._performanceMetrics),
      connectionPool: this._connectionPool.size,
      queueLength: this._requestQueue.length
    };
  }

  /**
   * Obtiene datos de múltiples rangos de forma optimizada usando getRangeList
   * @param {string} spreadsheetId - ID del spreadsheet
   * @param {string} sheetName - Nombre de la hoja
   * @param {Array<Object>} ranges - Array de objetos {startRow, endRow, startCol, endCol}
   * @returns {Array} Array de datos de cada rango
   */
  getMultipleRanges(spreadsheetId, sheetName, ranges) {
    const startTime = Date.now();
    
    try {
      const sheet = this.getSheet(spreadsheetId, sheetName);
      const rangeList = ranges.map(range => {
        const { startRow, endRow, startCol, endCol } = range;
        return sheet.getRange(startRow, startCol, endRow - startRow + 1, endCol - startCol + 1).getA1Notation();
      });
      
      const rangeListObj = sheet.getRangeList(rangeList);
      const allData = rangeListObj.getValues();
      
      // Dividir los datos por rango
      const results = [];
      let dataIndex = 0;
      
      ranges.forEach(range => {
        const { startRow, endRow, startCol, endCol } = range;
        const rowCount = endRow - startRow + 1;
        const colCount = endCol - startCol + 1;
        const rangeData = allData.slice(dataIndex, dataIndex + rowCount);
        results.push(rangeData);
        dataIndex += rowCount;
      });
      
      // Registrar métricas de rendimiento
      const duration = Date.now() - startTime;
      this._recordPerformanceMetric('getMultipleRanges', duration, ranges.length);
      
      console.log(`[SpreadsheetManager] ${ranges.length} rangos obtenidos en ${duration}ms`);
      return results;
      
    } catch (error) {
      console.error('[SpreadsheetManager] Error obteniendo múltiples rangos:', error);
      throw new Error(`Error obteniendo múltiples rangos: ${error.message}`);
    }
  }

  /**
   * Actualiza múltiples rangos de forma optimizada
   * @param {string} spreadsheetId - ID del spreadsheet
   * @param {string} sheetName - Nombre de la hoja
   * @param {Array<Object>} updates - Array de objetos {range, values}
   * @returns {boolean} True si la actualización fue exitosa
   */
  updateMultipleRanges(spreadsheetId, sheetName, updates) {
    const startTime = Date.now();
    
    try {
      const sheet = this.getSheet(spreadsheetId, sheetName);
      
      // Agrupar actualizaciones por tipo para optimizar
      const rangeUpdates = new Map();
      
      updates.forEach(update => {
        const { range, values } = update;
        const rangeKey = `${range.startRow}-${range.endRow}-${range.startCol}-${range.endCol}`;
        
        if (!rangeUpdates.has(rangeKey)) {
          rangeUpdates.set(rangeKey, { range, values });
        }
      });
      
      // Ejecutar actualizaciones en lotes
      const batchSize = 10;
      const rangeArray = Array.from(rangeUpdates.values());
      
      for (let i = 0; i < rangeArray.length; i += batchSize) {
        const batch = rangeArray.slice(i, i + batchSize);
        
        batch.forEach(update => {
          const { range, values } = update;
          const sheetRange = sheet.getRange(range.startRow, range.startCol, 
                                          range.endRow - range.startRow + 1, 
                                          range.endCol - range.startCol + 1);
          sheetRange.setValues(values);
        });
        
        // Pequeña pausa entre lotes para evitar límites de API
        if (i + batchSize < rangeArray.length) {
          Utilities.sleep(100);
        }
      }
      
      // Registrar métricas de rendimiento
      const duration = Date.now() - startTime;
      this._recordPerformanceMetric('updateMultipleRanges', duration, updates.length);
      
      console.log(`[SpreadsheetManager] ${updates.length} rangos actualizados en ${duration}ms`);
      return true;
      
    } catch (error) {
      console.error('[SpreadsheetManager] Error actualizando múltiples rangos:', error);
      return false;
    }
  }

  /**
   * Registra métricas de rendimiento
   * @param {string} operation - Nombre de la operación
   * @param {number} duration - Duración en ms
   * @param {number} itemCount - Número de elementos procesados
   */
  _recordPerformanceMetric(operation, duration, itemCount = 1) {
    const key = operation;
    if (!this._performanceMetrics.has(key)) {
      this._performanceMetrics.set(key, {
        totalCalls: 0,
        totalDuration: 0,
        totalItems: 0,
        averageDuration: 0,
        averageItemsPerCall: 0,
        lastCall: null
      });
    }
    
    const metric = this._performanceMetrics.get(key);
    metric.totalCalls++;
    metric.totalDuration += duration;
    metric.totalItems += itemCount;
    metric.averageDuration = metric.totalDuration / metric.totalCalls;
    metric.averageItemsPerCall = metric.totalItems / metric.totalCalls;
    metric.lastCall = new Date().toISOString();
    
    this._performanceMetrics.set(key, metric);
  }

  /**
   * Obtiene métricas de rendimiento detalladas
   * @returns {Object} Métricas de rendimiento
   */
  getPerformanceMetrics() {
    return {
      operations: Object.fromEntries(this._performanceMetrics),
      summary: this._getPerformanceSummary()
    };
  }

  /**
   * Genera resumen de rendimiento
   * @returns {Object} Resumen de rendimiento
   */
  _getPerformanceSummary() {
    const operations = Array.from(this._performanceMetrics.values());
    
    if (operations.length === 0) {
      return { message: 'No hay métricas disponibles' };
    }
    
    const totalCalls = operations.reduce((sum, op) => sum + op.totalCalls, 0);
    const totalDuration = operations.reduce((sum, op) => sum + op.totalDuration, 0);
    const totalItems = operations.reduce((sum, op) => sum + op.totalItems, 0);
    
    return {
      totalOperations: operations.length,
      totalCalls,
      totalDuration,
      totalItems,
      averageDuration: totalDuration / totalCalls,
      averageItemsPerCall: totalItems / totalCalls,
      mostUsedOperation: this._getMostUsedOperation(),
      slowestOperation: this._getSlowestOperation()
    };
  }

  /**
   * Obtiene la operación más utilizada
   * @returns {string} Nombre de la operación más usada
   */
  _getMostUsedOperation() {
    let maxCalls = 0;
    let mostUsed = '';
    
    for (const [operation, metric] of this._performanceMetrics) {
      if (metric.totalCalls > maxCalls) {
        maxCalls = metric.totalCalls;
        mostUsed = operation;
      }
    }
    
    return mostUsed;
  }

  /**
   * Obtiene la operación más lenta
   * @returns {string} Nombre de la operación más lenta
   */
  _getSlowestOperation() {
    let maxDuration = 0;
    let slowest = '';
    
    for (const [operation, metric] of this._performanceMetrics) {
      if (metric.averageDuration > maxDuration) {
        maxDuration = metric.averageDuration;
        slowest = operation;
      }
    }
    
    return slowest;
  }
}

// ==================== INSTANCIA GLOBAL ====================

/**
 * Instancia global del SpreadsheetManager
 * @type {SpreadsheetManager}
 */
const spreadsheetManager = new SpreadsheetManager();

// ==================== FUNCIONES DE CONVENIENCIA ====================

/**
 * Obtiene un spreadsheet por ID (función de conveniencia)
 * @param {string} spreadsheetId - ID del spreadsheet
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet} Instancia del spreadsheet
 */
function getSpreadsheet(spreadsheetId) {
  return spreadsheetManager.getSpreadsheet(spreadsheetId);
}

/**
 * Obtiene una hoja específica (función de conveniencia)
 * @param {string} spreadsheetId - ID del spreadsheet
 * @param {string} sheetName - Nombre de la hoja
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} Instancia de la hoja
 */
function getSheet(spreadsheetId, sheetName) {
  return spreadsheetManager.getSheet(spreadsheetId, sheetName);
}

/**
 * Obtiene datos de una hoja (función de conveniencia)
 * @param {string} spreadsheetId - ID del spreadsheet
 * @param {string} sheetName - Nombre de la hoja
 * @param {Object} options - Opciones de consulta
 * @returns {Array} Datos de la hoja
 */
function getSheetData(spreadsheetId, sheetName, options = {}) {
  return spreadsheetManager.getSheetData(spreadsheetId, sheetName, options);
}

/**
 * Busca una columna por nombre (función de conveniencia)
 * @param {string} spreadsheetId - ID del spreadsheet
 * @param {string} sheetName - Nombre de la hoja
 * @param {Array} possibleNames - Posibles nombres de la columna
 * @returns {number} Índice de la columna
 */
function findColumn(spreadsheetId, sheetName, possibleNames) {
  return spreadsheetManager.findColumn(spreadsheetId, sheetName, possibleNames);
}

/**
 * Limpia la caché (función de conveniencia)
 */
function clearSpreadsheetCache() {
  spreadsheetManager.clearCache();
}

/**
 * Obtiene estadísticas de caché (función de conveniencia)
 * @returns {Object} Estadísticas de uso
 */
function getSpreadsheetCacheStats() {
  return spreadsheetManager.getCacheStats();
}

/**
 * Obtiene datos de múltiples rangos (función de conveniencia)
 * @param {string} spreadsheetId - ID del spreadsheet
 * @param {string} sheetName - Nombre de la hoja
 * @param {Array<Object>} ranges - Array de rangos
 * @returns {Array} Datos de los rangos
 */
function getMultipleRanges(spreadsheetId, sheetName, ranges) {
  return spreadsheetManager.getMultipleRanges(spreadsheetId, sheetName, ranges);
}

/**
 * Actualiza múltiples rangos (función de conveniencia)
 * @param {string} spreadsheetId - ID del spreadsheet
 * @param {string} sheetName - Nombre de la hoja
 * @param {Array<Object>} updates - Array de actualizaciones
 * @returns {boolean} Resultado de la operación
 */
function updateMultipleRanges(spreadsheetId, sheetName, updates) {
  return spreadsheetManager.updateMultipleRanges(spreadsheetId, sheetName, updates);
}

/**
 * Obtiene métricas de rendimiento (función de conveniencia)
 * @returns {Object} Métricas de rendimiento
 */
function getSpreadsheetPerformanceMetrics() {
  return spreadsheetManager.getPerformanceMetrics();
}

// ==================== CONFIGURACIÓN ====================

/**
 * Configura el tiempo máximo de caché
 * @param {number} minutes - Minutos de caché
 */
function setSpreadsheetCacheTime(minutes) {
  spreadsheetManager._maxCacheTime = minutes * 60 * 1000;
  console.log(`[SpreadsheetManager] Tiempo de caché configurado a ${minutes} minutos`);
}

console.log('📊 SpreadsheetManager cargado - Patrón Singleton implementado');
