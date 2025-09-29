/**
 * @fileoverview Módulo de caché con compresión GZIP.
 * Implementa el sistema de caché exacto del código original.
 */

// ==================== CONFIGURACIÓN DEL MÓDULO ====================

const CACHE_KEY = 'DASHBOARD_DATA_V2';

// ==================== FUNCIONES DE CACHÉ ====================

/**
 * Guarda los datos procesados en la caché usando compresión GZIP.
 * @param {Object} data - Datos a guardar en caché
 */
function setCacheData(data) {
  try {
    const cache = CacheService.getScriptCache();
    // Comprimir datos para ahorrar espacio y evitar límites de tamaño de caché (100KB)
    const compressedData = Utilities.gzip(Utilities.newBlob(JSON.stringify(data)));
    cache.put(CACHE_KEY, Utilities.base64Encode(compressedData.getBytes()), CONFIG.CACHE.DURATION);
    console.log(`Datos guardados en caché (Comprimidos). Expiración en ${CONFIG.CACHE.DURATION} segundos.`);
  } catch (error) {
    console.error('Error al guardar en caché (Quizás los datos son muy grandes):', error);
  }
}

/**
 * Recupera y descomprime los datos de la caché.
 * @returns {Object|null} Datos descomprimidos o null si no hay caché
 */
function getCacheData() {
  try {
    const cache = CacheService.getScriptCache();
    const cached = cache.get(CACHE_KEY);
    if (cached) {
      // Descomprimir datos
      const compressedBlob = Utilities.newBlob(Utilities.base64Decode(cached), 'application/x-gzip');
      const decompressedBlob = compressedBlob.unzip();
      const data = JSON.parse(decompressedBlob.getDataAsString());
      console.log('Datos recuperados de la caché.');
      return data;
    }
  } catch (error) {
    console.error('Error al leer/descomprimir de la caché:', error);
    clearCache(); // Si hay error, limpiar la caché corrupta
  }
  return null;
}

/**
 * Limpia la caché manualmente.
 */
function clearCache() {
  CacheService.getScriptCache().remove(CACHE_KEY);
  console.log('Caché limpiada.');
}

/**
 * Verifica si hay datos en caché.
 * @returns {boolean} True si hay datos en caché
 */
function hasCacheData() {
  try {
    const cache = CacheService.getScriptCache();
    const cached = cache.get(CACHE_KEY);
    return cached !== null;
  } catch (error) {
    console.error('Error verificando caché:', error);
    return false;
  }
}

/**
 * Obtiene información sobre el estado de la caché.
 * @returns {Object} Información del estado de la caché
 */
function getCacheInfo() {
  try {
    const cache = CacheService.getScriptCache();
    const cached = cache.get(CACHE_KEY);
    return {
      hasData: cached !== null,
      size: cached ? cached.length : 0,
      key: CACHE_KEY,
      duration: CONFIG.CACHE.DURATION
    };
  } catch (error) {
    console.error('Error obteniendo información de caché:', error);
    return {
      hasData: false,
      size: 0,
      key: CACHE_KEY,
      duration: CONFIG.CACHE.DURATION,
      error: error.message
    };
  }
}

/**
 * Limpia la caché manualmente y proporciona feedback
 * @returns {Object} Resultado de la operación
 */
function limpiarCacheManualmente() {
  try {
    console.log('[CacheModule] Iniciando limpieza manual de caché...');
    
    const cache = CacheService.getScriptCache();
    
    // Verificar si hay datos en caché antes de limpiar
    const cached = cache.get(CACHE_KEY);
    const habiaDatos = !!cached;
    
    // Limpiar caché
    clearCache();
    
    console.log('[CacheModule] Caché limpiada manualmente');
    
    return {
      success: true,
      message: 'Caché limpiada correctamente',
      habia_datos: habiaDatos,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[CacheModule] Error al limpiar caché manualmente:', error);
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

console.log('📦 CacheModule cargado - Sistema de caché con compresión GZIP');
