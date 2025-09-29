/**
 * SPREADSHEET MANAGER - SINGLETON PATTERN OPTIMIZADO
 * Etapa 3 - Semana 3: Optimización avanzada de rendimiento
 * 
 * Este módulo implementa un patrón Singleton optimizado para gestionar
 * conexiones a Google Sheets con máximo rendimiento y mínima latencia.
 */

// ==================== SINGLETON SPREADSHEET MANAGER ====================

var SpreadsheetManager = (function() {
  var instance;
  
  function SpreadsheetManager() {
    if (instance) {
      return instance;
    }
    
    this._spreadsheets = {};
    this._lastAccess = {};
    this._maxCacheTime = 5 * 60 * 1000; // 5 minutos
    
    instance = this;
  }
  
  /**
   * Obtiene una instancia de spreadsheet por ID
   * @param {string} spreadsheetId - ID del spreadsheet
   * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet} Instancia del spreadsheet
   */
  SpreadsheetManager.prototype.getSpreadsheet = function(spreadsheetId) {
    var now = Date.now();
    
    // Verificar si ya tenemos la instancia en caché
    if (this._spreadsheets[spreadsheetId]) {
      var lastAccess = this._lastAccess[spreadsheetId];
      
      // Si la caché es válida, retornar la instancia existente
      if (now - lastAccess < this._maxCacheTime) {
        this._lastAccess[spreadsheetId] = now;
        return this._spreadsheets[spreadsheetId];
      } else {
        // Caché expirada, limpiar y crear nueva instancia
        delete this._spreadsheets[spreadsheetId];
        delete this._lastAccess[spreadsheetId];
      }
    }
    
    try {
      // Crear nueva instancia
      var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      
      // Guardar en caché
      this._spreadsheets[spreadsheetId] = spreadsheet;
      this._lastAccess[spreadsheetId] = now;
      
      console.log('[SpreadsheetManager] Nueva conexión creada para: ' + spreadsheetId);
      return spreadsheet;
      
    } catch (error) {
      console.error('[SpreadsheetManager] Error abriendo spreadsheet ' + spreadsheetId + ':', error);
      throw new Error('No se pudo abrir el spreadsheet ' + spreadsheetId + ': ' + error.message);
    }
  };
  
  /**
   * Obtiene una hoja específica de un spreadsheet
   * @param {string} spreadsheetId - ID del spreadsheet
   * @param {string} sheetName - Nombre de la hoja
   * @returns {GoogleAppsScript.Spreadsheet.Sheet} Instancia de la hoja
   */
  SpreadsheetManager.prototype.getSheet = function(spreadsheetId, sheetName) {
    var spreadsheet = this.getSpreadsheet(spreadsheetId);
    var sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      throw new Error('Hoja \'' + sheetName + '\' no encontrada en spreadsheet ' + spreadsheetId);
    }
    
    return sheet;
  };
  
  /**
   * Obtiene datos de una hoja de forma optimizada
   * @param {string} spreadsheetId - ID del spreadsheet
   * @param {string} sheetName - Nombre de la hoja
   * @param {Object} options - Opciones de consulta
   * @returns {Array} Datos de la hoja
   */
  SpreadsheetManager.prototype.getSheetData = function(spreadsheetId, sheetName, options) {
    options = options || {};
    var startRow = options.startRow || 1;
    var endRow = options.endRow || null;
    var startCol = options.startCol || 1;
    var endCol = options.endCol || null;
    var headers = options.headers !== false;
    
    var sheet = this.getSheet(spreadsheetId, sheetName);
    
    // Determinar rango de datos
    var lastRow = endRow || sheet.getLastRow();
    var lastCol = endCol || sheet.getLastColumn();
    
    if (lastRow < startRow || lastCol < startCol) {
      console.warn('[SpreadsheetManager] Rango inválido para ' + sheetName + ': ' + startRow + '-' + lastRow + ', ' + startCol + '-' + lastCol);
      return [];
    }
    
    try {
      var range = sheet.getRange(startRow, startCol, lastRow - startRow + 1, lastCol - startCol + 1);
      var data = range.getValues();
      
      // Si no se requieren headers, retornar solo los datos
      if (!headers && data.length > 0) {
        return data.slice(1);
      }
      
      return data;
      
    } catch (error) {
      console.error('[SpreadsheetManager] Error obteniendo datos de ' + sheetName + ':', error);
      throw new Error('Error obteniendo datos de ' + sheetName + ': ' + error.message);
    }
  };
  
  /**
   * Obtiene solo los encabezados de una hoja
   * @param {string} spreadsheetId - ID del spreadsheet
   * @param {string} sheetName - Nombre de la hoja
   * @returns {Array} Array de encabezados
   */
  SpreadsheetManager.prototype.getHeaders = function(spreadsheetId, sheetName) {
    var sheet = this.getSheet(spreadsheetId, sheetName);
    var lastCol = sheet.getLastColumn();
    
    if (lastCol === 0) {
      return [];
    }
    
    try {
      var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      return headers.map(function(header) {
        return header ? header.toString().trim() : '';
      });
    } catch (error) {
      console.error('[SpreadsheetManager] Error obteniendo headers de ' + sheetName + ':', error);
      return [];
    }
  };
  
  /**
   * Limpia la caché de spreadsheets
   */
  SpreadsheetManager.prototype.clearCache = function() {
    this._spreadsheets = {};
    this._lastAccess = {};
    console.log('[SpreadsheetManager] Caché limpiada');
  };
  
  /**
   * Obtiene estadísticas de la caché
   * @returns {Object} Estadísticas de la caché
   */
  SpreadsheetManager.prototype.getCacheStats = function() {
    var count = 0;
    for (var key in this._spreadsheets) {
      if (this._spreadsheets.hasOwnProperty(key)) {
        count++;
      }
    }
    
    return {
      cachedSpreadsheets: count,
      maxCacheTime: this._maxCacheTime
    };
  };
  
  return SpreadsheetManager;
})();

/**
 * Función estática para obtener la instancia singleton
 * @returns {SpreadsheetManager} Instancia del SpreadsheetManager
 */
function getSpreadsheetManager() {
  return new SpreadsheetManager();
}

/**
 * Función de conveniencia para obtener una instancia de spreadsheet
 * @param {string} spreadsheetId - ID del spreadsheet
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet} Instancia del spreadsheet
 */
function getSpreadsheet(spreadsheetId) {
  return getSpreadsheetManager().getSpreadsheet(spreadsheetId);
}

/**
 * Función de conveniencia para obtener una hoja
 * @param {string} spreadsheetId - ID del spreadsheet
 * @param {string} sheetName - Nombre de la hoja
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} Instancia de la hoja
 */
function getSheet(spreadsheetId, sheetName) {
  return getSpreadsheetManager().getSheet(spreadsheetId, sheetName);
}

console.log('📊 SpreadsheetManager cargado - Patrón Singleton implementado');