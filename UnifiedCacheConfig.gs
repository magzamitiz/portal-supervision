/**
 * @fileoverview Configuración unificada de caché para optimización
 * Centraliza todas las claves de caché y elimina redundancias
 */

// ==================== CONFIGURACIÓN UNIFICADA DE CACHÉ ====================

const UNIFIED_CACHE = {
  // Clave principal consolidada (reemplaza múltiples claves obsoletas)
  DASHBOARD: {
    KEY: 'UNIFIED_DASHBOARD_V3',
    TTL: 1800,  // 30 minutos
    DESCRIPTION: 'Datos completos del dashboard (estadísticas + líderes + dashboard)',
    COMPRESS_THRESHOLD: 50000 // 50KB en bytes (más conservador)
  },
  
  // Estadísticas rápidas (TTL más corto para datos dinámicos)
  STATS: {
    KEY: 'UNIFIED_STATS_V3',
    TTL: 300,   // 5 minutos
    DESCRIPTION: 'Estadísticas rápidas del dashboard',
    COMPRESS_THRESHOLD: 50000  // 50KB en bytes
  },
  
  // Lista de líderes (TTL largo para datos estables)
  LEADERS: {
    KEY: 'UNIFIED_LEADERS_V3',
    TTL: 1800,  // 30 minutos
    DESCRIPTION: 'Lista completa de líderes',
    COMPRESS_THRESHOLD: 50000 // 50KB en bytes (más conservador)
  },
  
  // Claves específicas para casos especiales
  LEADER_DETAILS: {
    PREFIX: 'LD_DETAIL_',
    TTL: 900,   // 15 minutos
    DESCRIPTION: 'Detalles específicos de líderes'
  },
  
  LCF_DETAILS: {
    PREFIX: 'LCF_DETAIL_',
    TTL: 600,   // 10 minutos
    DESCRIPTION: 'Detalles específicos de LCFs'
  },
  
  INGRESOS_LCF: {
    PREFIX: 'INGRESOS_LCF_',
    TTL: 300,   // 5 minutos
    DESCRIPTION: 'Ingresos por LCF específico'
  },
  
  // Claves temporales para tests
  TEMPORAL: {
    PREFIX: 'TEMP_',
    TTL: 60,    // 1 minuto
    DESCRIPTION: 'Datos temporales para pruebas'
  },
  
  // Claves obsoletas a eliminar
  LEGACY_KEYS: [
    'STATS_RAPIDAS_V2',           // TTL 30s causa invalidación constante
    'DASHBOARD_DATA_V2',          // Redundante con DASHBOARD_CONSOLIDATED_V1
    'DASHBOARD_DATA_V3',          // Redundante
    'DASHBOARD_META',             // Metadata obsoleta
    'DASHBOARD_DATA_COMPRESSED',  // Solo para casos > 95KB
    'DIRECTORIO_COMPLETO',        // Reemplazado por DASHBOARD_CONSOLIDATED_V1
    'ESTADO_LIDERES_CACHE',       // Reemplazado por DASHBOARD_CONSOLIDATED_V1
    'datos_graficos_dashboard',   // Obsoleta
    'metricas_historicas'         // Obsoleta
  ],
  
  // Función para limpiar caché legacy
  cleanLegacyCache: function() {
    const cache = CacheService.getScriptCache();
    let cleanedCount = 0;
    
    console.log('[UnifiedCache] Limpiando claves obsoletas...');
    
    UNIFIED_CACHE.LEGACY_KEYS.forEach(key => {
      try {
        if (cache.get(key)) {
          cache.remove(key);
          cleanedCount++;
          console.log(`[UnifiedCache] ✅ Limpiado: ${key}`);
        }
      } catch(e) {
        // Ignorar errores de claves no existentes
      }
    });
    
    // Limpiar claves dinámicas obsoletas
    const dynamicKeys = [
      'LD_OPT_FULL_', 'LD_OPT_BASIC_', 'LCF_OPT_',
      'LD_FULL_', 'LD_BASIC_', 'LD_QUICK_'
    ];
    
    dynamicKeys.forEach(prefix => {
      for (let i = 0; i < 100; i++) {
        const key = `${prefix}LD-00${i}`;
        try {
          if (cache.get(key)) {
            cache.remove(key);
            cleanedCount++;
          }
        } catch(e) {
          // Ignorar errores
        }
      }
    });
    
    console.log(`[UnifiedCache] ✅ Limpieza completada: ${cleanedCount} claves eliminadas`);
    return cleanedCount;
  },
  
  // Función para obtener estadísticas del caché
  getCacheStats: function() {
    const cache = CacheService.getScriptCache();
    const stats = {
      totalKeys: 0,
      activeKeys: [],
      legacyKeys: [],
      totalSize: 0
    };
    
    // Verificar claves principales
    const mainKeys = [
      UNIFIED_CACHE.DASHBOARD.KEY,
      'DASHBOARD_DATA_META'
    ];
    
    mainKeys.forEach(key => {
      const data = cache.get(key);
      if (data) {
        stats.activeKeys.push({
          key: key,
          size: data.length,
          type: 'main'
        });
        stats.totalSize += data.length;
        stats.totalKeys++;
      }
    });
    
    // Verificar claves legacy
    UNIFIED_CACHE.LEGACY_KEYS.forEach(key => {
      const data = cache.get(key);
      if (data) {
        stats.legacyKeys.push({
          key: key,
          size: data.length,
          type: 'legacy'
        });
        stats.totalSize += data.length;
        stats.totalKeys++;
      }
    });
    
    return stats;
  }
};

// ==================== CLASE UNIFIED CACHE ====================

/**
 * Clase para manejo unificado de caché con optimizaciones
 */
class UnifiedCache {
  constructor() {
    // Inicializar propiedades estáticas si no existen
    if (!UnifiedCache.KEYS) {
      UnifiedCache.KEYS = {
        DASHBOARD: 'UNIFIED_DASHBOARD_V3',
        STATS: 'UNIFIED_STATS_V3',
        LEADERS: 'UNIFIED_LEADERS_V3'
      };
    }
    if (!UnifiedCache.TTL) {
      UnifiedCache.TTL = {
        DASHBOARD: 1800,  // 30 minutos
        STATS: 300,        // 5 minutos
        LEADERS: 1800      // 30 minutos
      };
    }
  }
  
  // Métodos estáticos getter
  static getKEYS() {
    if (!UnifiedCache.KEYS) {
      UnifiedCache.KEYS = {
        DASHBOARD: 'UNIFIED_DASHBOARD_V3',
        STATS: 'UNIFIED_STATS_V3',
        LEADERS: 'UNIFIED_LEADERS_V3'
      };
    }
    return UnifiedCache.KEYS;
  }
  
  static getTTL() {
    if (!UnifiedCache.TTL) {
      UnifiedCache.TTL = {
        DASHBOARD: 1800,  // 30 minutos
        STATS: 300,        // 5 minutos
        LEADERS: 1800      // 30 minutos
      };
    }
    return UnifiedCache.TTL;
  }
  
  /**
   * Obtiene datos del caché con fallback inteligente
   * @param {string} key - Clave del caché
   * @returns {Object|null} Datos recuperados o null
   */
  static get(key) {
    try {
      const cache = CacheService.getScriptCache();
      
      // Verificar si es un dato fragmentado
      const metadata = cache.get(`${key}_META`);
      if (metadata) {
        const meta = JSON.parse(metadata);
        if (meta.fragmented) {
          console.log(`[UnifiedCache] 🔄 Reconstruyendo datos fragmentados: ${key} (${meta.chunks} fragmentos)`);
          
          let reconstructedData = '';
          for (let i = 0; i < meta.chunks; i++) {
            const chunkKey = `${key}_CHUNK_${i}`;
            const chunk = cache.get(chunkKey);
            if (!chunk) {
              console.error(`[UnifiedCache] ❌ Fragmento ${i} no encontrado`);
              return null;
            }
            reconstructedData += chunk;
          }
          
          console.log(`[UnifiedCache] ✅ Reconstruido: ${key} (${Math.round(reconstructedData.length/1024)}KB)`);
          return JSON.parse(reconstructedData);
        }
      }
      
      // Datos normales (no fragmentados)
      const data = cache.get(key);
      if (!data) {
        console.log(`[UnifiedCache] ❌ No encontrado: ${key}`);
        return null;
      }
      
      console.log(`[UnifiedCache] ✅ Recuperado: ${key}`);
      return JSON.parse(data);
      
    } catch (error) {
      console.error(`[UnifiedCache] ❌ Error recuperando ${key}:`, error);
      return null;
    }
  }
  
  /**
   * Guarda datos en caché con compresión inteligente
   * @param {string} key - Clave del caché
   * @param {Object} data - Datos a guardar
   * @param {number} ttl - Tiempo de vida en segundos
   * @returns {boolean} True si se guardó exitosamente
   */
  static set(key, data, ttl) {
    try {
      const cache = CacheService.getScriptCache();
      const jsonString = JSON.stringify(data);
      const sizeBytes = jsonString.length;
      
      console.log(`[UnifiedCache] 💾 Guardando: ${key} (${Math.round(sizeBytes/1024)}KB)`);
      
      // Verificar límite de Google Apps Script (100KB por clave)
      if (sizeBytes > 100000) {
        console.log(`[UnifiedCache] ⚠️ Datos muy grandes (${sizeBytes} bytes), dividiendo...`);
        
        // ✅ SOLUCIÓN: Fragmentos de 50KB máximo (mitad del límite)
        const chunks = this._splitData(jsonString, 50000); // 50KB por fragmento (mitad del límite)
        let success = true;
        
        for (let i = 0; i < chunks.length; i++) {
          const chunkKey = `${key}_CHUNK_${i}`;
          const chunkSuccess = cache.put(chunkKey, chunks[i], ttl);
          if (!chunkSuccess) {
            console.error(`[UnifiedCache] ❌ Error guardando fragmento ${i}`);
            success = false;
          }
        }
        
        // Guardar metadatos del fragmentado
        const metadata = {
          fragmented: true,
          chunks: chunks.length,
          originalSize: sizeBytes
        };
        cache.put(`${key}_META`, JSON.stringify(metadata), ttl);
        
        console.log(`[UnifiedCache] ✅ Guardado fragmentado: ${key} (${chunks.length} fragmentos)`);
        return success;
      } else {
        console.log(`[UnifiedCache] ✅ Guardado directo: ${key}`);
        return cache.put(key, jsonString, ttl);
      }
      
    } catch (error) {
      console.error(`[UnifiedCache] ❌ Error guardando ${key}:`, error);
      return false;
    }
  }
  
  /**
   * ❌ DEPRECADO: Función original rota
   * ✅ REEMPLAZADA: Por invalidateKey() e invalidatePattern()
   * 
   * PROBLEMA: cache.getKeys() no existe en CacheService
   * SOLUCIÓN: Usar lista predefinida de claves conocidas
   */
  static invalidate_OLD_BROKEN(pattern) {
    // ❌ ESTA FUNCIÓN ESTÁ ROTA - NO USAR
    throw new Error('invalidate() está deprecada. Usar invalidateKey() o invalidatePattern()');
  }
  
  /**
   * ✅ NUEVO: Invalida una clave específica y sus fragmentos
   * Esto SÍ funciona porque no requiere getKeys()
   * 
   * @param {string} baseKey - Clave base a invalidar
   * @returns {Object} Resultado de la operación
   */
  static invalidateKey(baseKey) {
    try {
      const cache = CacheService.getScriptCache();
      let removedCount = 0;
      
      console.log(`[UnifiedCache] 🗑️ Invalidando clave: ${baseKey}`);
      
      // 1. Remover clave principal
      cache.remove(baseKey);
      removedCount++;
      
      // 2. Remover metadata
      cache.remove(`${baseKey}_META`);
      removedCount++;
      
      // 3. Remover fragmentos posibles (hasta 20 fragmentos)
      for (let i = 0; i < 20; i++) {
        cache.remove(`${baseKey}_${i}`);
        cache.remove(`${baseKey}_CHUNK_${i}`);
        removedCount += 2;
      }
      
      console.log(`[UnifiedCache] ✅ Invalidado: ${baseKey} (${removedCount} intentos de remoción)`);
      
      return {
        success: true,
        baseKey: baseKey,
        removedCount: removedCount
      };
      
    } catch (error) {
      console.error(`[UnifiedCache] ❌ Error invalidando ${baseKey}:`, error);
      return {
        success: false,
        baseKey: baseKey,
        error: error.toString()
      };
    }
  }
  
  /**
   * ✅ NUEVO: Invalida claves por patrón usando lista predefinida
   * No usa cache.getKeys() - usa lista conocida
   * 
   * @param {string} pattern - Patrón a buscar en claves conocidas
   * @returns {Object} Resultado de la operación
   */
  static invalidatePattern(pattern) {
    try {
      console.log(`[UnifiedCache] 🔍 Buscando claves que coincidan con: "${pattern}"`);
      
      // Lista de claves conocidas del sistema
      const knownKeys = this._getKnownCacheKeys();
      
      let matchedKeys = [];
      let removedCount = 0;
      
      // Buscar claves que coincidan con el patrón
      knownKeys.forEach(key => {
        if (key.includes(pattern)) {
          matchedKeys.push(key);
          const result = this.invalidateKey(key);
          if (result.success) {
            removedCount++;
          }
        }
      });
      
      console.log(`[UnifiedCache] ✅ Patrón "${pattern}": ${matchedKeys.length} claves encontradas, ${removedCount} invalidadas`);
      
      return {
        success: true,
        pattern: pattern,
        matchedKeys: matchedKeys,
        removedCount: removedCount
      };
      
    } catch (error) {
      console.error(`[UnifiedCache] ❌ Error con patrón ${pattern}:`, error);
      return {
        success: false,
        pattern: pattern,
        error: error.toString()
      };
    }
  }
  
  /**
   * ✅ NUEVO: Obtiene lista de claves conocidas del sistema
   * Esta lista debe mantenerse actualizada con las claves reales usadas
   * 
   * @returns {Array<string>} Array de claves conocidas
   */
  static _getKnownCacheKeys() {
    const keys = [
      // Claves principales
      'UNIFIED_DASHBOARD_V3',
      'UNIFIED_STATS_V3',
      'UNIFIED_LEADERS_V3',
      'DASHBOARD_CONSOLIDATED_V1',
      'DASHBOARD_DATA_V2',
      'STATS_RAPIDAS_V2',
      
      // Claves legacy
      'DIRECTORIO_COMPLETO',
      'ESTADO_LIDERES_CACHE',
      'datos_graficos_dashboard',
      'metricas_historicas'
    ];
    
    // Agregar claves dinámicas comunes (LDs)
    for (let i = 0; i < 100; i++) {
      const ldId = `LD-${String(i).padStart(3, '0')}`;
      keys.push(`LD_DETAIL_${ldId}`);
      keys.push(`LD_FULL_${ldId}`);
      keys.push(`LD_QUICK_${ldId}`);
    }
    
    // Agregar claves dinámicas comunes (LCFs)
    for (let i = 0; i < 200; i++) {
      const lcfId = `LCF-${String(i).padStart(3, '0')}`;
      keys.push(`LCF_DETAIL_${lcfId}`);
      keys.push(`INGRESOS_LCF_${lcfId}`);
    }
    
    return keys;
  }
  
  /**
   * ✅ NUEVO: Limpia TODO el caché del sistema
   * Útil para depuración o reset completo
   * 
   * @returns {Object} Resultado de la operación
   */
  static clearAll() {
    console.log('[UnifiedCache] 🧹 LIMPIEZA COMPLETA DE TODO EL CACHÉ');
    
    const allKeys = this._getKnownCacheKeys();
    let removedCount = 0;
    
    allKeys.forEach(key => {
      const result = this.invalidateKey(key);
      if (result.success) {
        removedCount++;
      }
    });
    
    console.log(`[UnifiedCache] ✅ Limpieza completa: ${removedCount} claves procesadas`);
    
    return {
      success: true,
      totalKeys: allKeys.length,
      removedCount: removedCount
    };
  }
  
  /**
   * Obtiene configuración para una clave específica
   * @param {string} key - Clave del caché
   * @returns {Object} Configuración de la clave
   */
  static getConfigForKey(key) {
    for (const [type, config] of Object.entries(UNIFIED_CACHE)) {
      if (config.KEY === key) {
        return config;
      }
    }
    return { COMPRESS_THRESHOLD: 50000 };
  }
  
  /**
   * Limpia todas las claves legacy
   * @returns {number} Número de claves limpiadas
   */
  static cleanLegacy() {
    return UNIFIED_CACHE.cleanLegacyCache();
  }
  
  /**
   * Obtiene estadísticas del caché
   * @returns {Object} Estadísticas del caché
   */
  static getStats() {
    return UNIFIED_CACHE.getCacheStats();
  }
  
  /**
   * Divide datos grandes en fragmentos más pequeños
   * @param {string} data - Datos a dividir
   * @param {number} maxChunkSize - Tamaño máximo por fragmento
   * @returns {Array} Array de fragmentos
   */
  static _splitData(data, maxChunkSize) {
    const chunks = [];
    for (let i = 0; i < data.length; i += maxChunkSize) {
      chunks.push(data.slice(i, i + maxChunkSize));
    }
    return chunks;
  }
}

// ==================== FUNCIONES DE UTILIDAD ====================

/**
 * Obtiene una clave de caché con prefijo y TTL apropiados
 * @param {string} type - Tipo de caché (DASHBOARD, LEADER_DETAILS, etc.)
 * @param {string} identifier - Identificador específico (opcional)
 * @returns {Object} Configuración de la clave
 */
function getCacheConfig(type, identifier = '') {
  const config = UNIFIED_CACHE[type];
  if (!config) {
    throw new Error(`Tipo de caché no válido: ${type}`);
  }
  
  const key = identifier ? `${config.PREFIX}${identifier}` : config.KEY;
  
  return {
    key: key,
    ttl: config.TTL,
    description: config.DESCRIPTION
  };
}

/**
 * Guarda datos en caché usando configuración unificada
 * @param {string} type - Tipo de caché
 * @param {Object} data - Datos a guardar
 * @param {string} identifier - Identificador específico (opcional)
 * @returns {boolean} True si se guardó exitosamente
 */
function setUnifiedCache(type, data, identifier = '') {
  try {
    const config = getCacheConfig(type, identifier);
    const cache = CacheService.getScriptCache();
    const jsonString = JSON.stringify(data);
    
    cache.put(config.key, jsonString, config.ttl);
    console.log(`[UnifiedCache] ✅ Guardado: ${config.key} (${config.ttl}s)`);
    return true;
  } catch (error) {
    console.error(`[UnifiedCache] ❌ Error guardando ${type}:`, error);
    return false;
  }
}

/**
 * Recupera datos del caché usando configuración unificada
 * @param {string} type - Tipo de caché
 * @param {string} identifier - Identificador específico (opcional)
 * @returns {Object|null} Datos recuperados o null
 */
function getUnifiedCache(type, identifier = '') {
  try {
    const config = getCacheConfig(type, identifier);
    const cache = CacheService.getScriptCache();
    const data = cache.get(config.key);
    
    if (data) {
      console.log(`[UnifiedCache] ✅ Recuperado: ${config.key}`);
      return JSON.parse(data);
    }
    
    console.log(`[UnifiedCache] ❌ No encontrado: ${config.key}`);
    return null;
  } catch (error) {
    console.error(`[UnifiedCache] ❌ Error recuperando ${type}:`, error);
    return null;
  }
}

/**
 * Limpia caché específico por tipo
 * @param {string} type - Tipo de caché a limpiar
 * @param {string} identifier - Identificador específico (opcional)
 * @returns {boolean} True si se limpió exitosamente
 */
function clearUnifiedCache(type, identifier = '') {
  try {
    const config = getCacheConfig(type, identifier);
    const cache = CacheService.getScriptCache();
    
    cache.remove(config.key);
    console.log(`[UnifiedCache] ✅ Limpiado: ${config.key}`);
    return true;
  } catch (error) {
    console.error(`[UnifiedCache] ❌ Error limpiando ${type}:`, error);
    return false;
  }
}
