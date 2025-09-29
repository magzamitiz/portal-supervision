/**
 * INTELLIGENT CACHE - SISTEMA DE CACHÉ INTELIGENTE
 * Etapa 3 - Semana 3: Sistema de caché avanzado con invalidación inteligente
 * 
 * Este módulo implementa un sistema de caché inteligente que:
 * - Invalida automáticamente datos obsoletos
 * - Comprime datos para optimizar espacio
 * - Gestiona dependencias entre datos
 * - Proporciona métricas de rendimiento
 */

// ==================== CONFIGURACIÓN DEL CACHÉ INTELIGENTE ====================

const INTELLIGENT_CACHE_CONFIG = {
  DEFAULT_TTL: 1800, // 30 minutos por defecto
  COMPRESSION_THRESHOLD: 1024, // Comprimir si > 1KB
  MAX_CACHE_SIZE: 100 * 1024, // 100KB máximo
  CLEANUP_INTERVAL: 300, // Limpiar cada 5 minutos
  DEPENDENCY_CHECK_INTERVAL: 60, // Verificar dependencias cada minuto
  COMPRESSION_LEVEL: 6, // Nivel de compresión GZIP (1-9)
  ENABLE_METRICS: true,
  ENABLE_DEPENDENCIES: true
};

// ==================== ESTRUCTURAS DE DATOS ====================

const intelligentCache = new Map();
const cacheDependencies = new Map();
const cacheMetrics = {
  hits: 0,
  misses: 0,
  evictions: 0,
  compressions: 0,
  totalSize: 0,
  lastCleanup: Date.now()
};

// ==================== CLASE DE ENTRADA DE CACHÉ ====================

class CacheEntry {
  constructor(key, data, ttl = INTELLIGENT_CACHE_CONFIG.DEFAULT_TTL, dependencies = []) {
    this.key = key;
    this.data = data;
    this.ttl = ttl;
    this.createdAt = Date.now();
    this.lastAccessed = Date.now();
    this.accessCount = 0;
    this.dependencies = dependencies;
    this.isCompressed = false;
    this.originalSize = 0;
    this.compressedSize = 0;
    this.priority = 1; // 1 = baja, 2 = media, 3 = alta
  }

  isExpired() {
    return Date.now() - this.createdAt > this.ttl * 1000;
  }

  isStale() {
    // Considerar stale si no se ha accedido en la mitad del TTL
    return Date.now() - this.lastAccessed > (this.ttl * 1000) / 2;
  }

  getSize() {
    return this.isCompressed ? this.compressedSize : this.originalSize;
  }

  updateAccess() {
    this.lastAccessed = Date.now();
    this.accessCount++;
  }

  compress() {
    if (this.isCompressed) return;
    
    try {
      const dataStr = JSON.stringify(this.data);
      this.originalSize = dataStr.length;
      
      if (this.originalSize > INTELLIGENT_CACHE_CONFIG.COMPRESSION_THRESHOLD) {
        const compressed = Utilities.gzip(Utilities.newBlob(dataStr));
        this.data = Utilities.base64Encode(compressed.getBytes());
        this.compressedSize = this.data.length;
        this.isCompressed = true;
        cacheMetrics.compressions++;
      }
    } catch (error) {
      console.warn('[IntelligentCache] Error comprimiendo datos:', error);
    }
  }

  decompress() {
    if (!this.isCompressed) return this.data;
    
    try {
      const compressedBlob = Utilities.newBlob(Utilities.base64Decode(this.data), 'application/x-gzip');
      const decompressedBlob = compressedBlob.unzip();
      const dataStr = decompressedBlob.getDataAsString();
      this.data = JSON.parse(dataStr);
      this.isCompressed = false;
      return this.data;
    } catch (error) {
      console.warn('[IntelligentCache] Error descomprimiendo datos:', error);
      return null;
    }
  }
}

// ==================== FUNCIONES PRINCIPALES DEL CACHÉ ====================

/**
 * Obtiene datos del caché inteligente
 * @param {string} key - Clave del caché
 * @param {boolean} updateAccess - Si actualizar el contador de acceso
 * @returns {*} Datos del caché o null
 */
function getIntelligentCache(key, updateAccess = true) {
  try {
    const entry = intelligentCache.get(key);
    
    if (!entry) {
      cacheMetrics.misses++;
      return null;
    }
    
    // Verificar si está expirado
    if (entry.isExpired()) {
      intelligentCache.delete(key);
      cacheMetrics.evictions++;
      cacheMetrics.misses++;
      return null;
    }
    
    // Verificar dependencias
    if (INTELLIGENT_CACHE_CONFIG.ENABLE_DEPENDENCIES && !checkDependencies(entry)) {
      intelligentCache.delete(key);
      cacheMetrics.evictions++;
      cacheMetrics.misses++;
      return null;
    }
    
    // Actualizar acceso
    if (updateAccess) {
      entry.updateAccess();
    }
    
    cacheMetrics.hits++;
    
    // Descomprimir si es necesario
    const data = entry.decompress();
    if (data === null) {
      intelligentCache.delete(key);
      cacheMetrics.evictions++;
      cacheMetrics.misses++;
      return null;
    }
    
    return data;
    
  } catch (error) {
    console.error('[IntelligentCache] Error obteniendo del caché:', error);
    cacheMetrics.misses++;
    return null;
  }
}

/**
 * Guarda datos en el caché inteligente
 * @param {string} key - Clave del caché
 * @param {*} data - Datos a guardar
 * @param {number} ttl - Tiempo de vida en segundos
 * @param {Array<string>} dependencies - Dependencias del caché
 * @param {number} priority - Prioridad del caché (1-3)
 * @returns {boolean} True si se guardó exitosamente
 */
function setIntelligentCache(key, data, ttl = INTELLIGENT_CACHE_CONFIG.DEFAULT_TTL, dependencies = [], priority = 1) {
  try {
    // Verificar tamaño máximo
    if (intelligentCache.size >= INTELLIGENT_CACHE_CONFIG.MAX_CACHE_SIZE / 1024) {
      evictLeastUsed();
    }
    
    // Crear entrada de caché
    const entry = new CacheEntry(key, data, ttl, dependencies);
    entry.priority = priority;
    
    // Comprimir si es necesario
    entry.compress();
    
    // Guardar en caché
    intelligentCache.set(key, entry);
    
    // Registrar dependencias
    if (INTELLIGENT_CACHE_CONFIG.ENABLE_DEPENDENCIES && dependencies.length > 0) {
      registerDependencies(key, dependencies);
    }
    
    // Actualizar métricas
    cacheMetrics.totalSize += entry.getSize();
    
    console.log(`[IntelligentCache] Datos guardados: ${key} (${entry.getSize()} bytes)`);
    return true;
    
  } catch (error) {
    console.error('[IntelligentCache] Error guardando en caché:', error);
    return false;
  }
}

/**
 * Elimina datos del caché inteligente
 * @param {string} key - Clave del caché
 * @returns {boolean} True si se eliminó exitosamente
 */
function deleteIntelligentCache(key) {
  try {
    const entry = intelligentCache.get(key);
    if (entry) {
      cacheMetrics.totalSize -= entry.getSize();
      intelligentCache.delete(key);
      
      // Limpiar dependencias
      if (INTELLIGENT_CACHE_CONFIG.ENABLE_DEPENDENCIES) {
        clearDependencies(key);
      }
      
      console.log(`[IntelligentCache] Datos eliminados: ${key}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('[IntelligentCache] Error eliminando del caché:', error);
    return false;
  }
}

// ==================== GESTIÓN DE DEPENDENCIAS ====================

/**
 * Registra dependencias para una clave de caché
 * @param {string} key - Clave del caché
 * @param {Array<string>} dependencies - Dependencias
 */
function registerDependencies(key, dependencies) {
  dependencies.forEach(dep => {
    if (!cacheDependencies.has(dep)) {
      cacheDependencies.set(dep, new Set());
    }
    cacheDependencies.get(dep).add(key);
  });
}

/**
 * Verifica si las dependencias de una entrada son válidas
 * @param {CacheEntry} entry - Entrada del caché
 * @returns {boolean} True si las dependencias son válidas
 */
function checkDependencies(entry) {
  if (!INTELLIGENT_CACHE_CONFIG.ENABLE_DEPENDENCIES || !entry.dependencies.length) {
    return true;
  }
  
  return entry.dependencies.every(dep => {
    const depEntry = intelligentCache.get(dep);
    return depEntry && !depEntry.isExpired();
  });
}

/**
 * Limpia las dependencias de una clave
 * @param {string} key - Clave del caché
 */
function clearDependencies(key) {
  for (const [dep, keys] of cacheDependencies) {
    keys.delete(key);
    if (keys.size === 0) {
      cacheDependencies.delete(dep);
    }
  }
}

// ==================== GESTIÓN DE MEMORIA ====================

/**
 * Elimina las entradas menos utilizadas
 */
function evictLeastUsed() {
  try {
    const entries = Array.from(intelligentCache.entries());
    
    // Ordenar por prioridad y frecuencia de acceso
    entries.sort((a, b) => {
      const [keyA, entryA] = a;
      const [keyB, entryB] = b;
      
      // Primero por prioridad (menor = más probable de eliminar)
      if (entryA.priority !== entryB.priority) {
        return entryA.priority - entryB.priority;
      }
      
      // Luego por frecuencia de acceso
      return entryA.accessCount - entryB.accessCount;
    });
    
    // Eliminar el 20% de las entradas menos utilizadas
    const toEvict = Math.ceil(entries.length * 0.2);
    
    for (let i = 0; i < toEvict; i++) {
      const [key, entry] = entries[i];
      intelligentCache.delete(key);
      cacheMetrics.totalSize -= entry.getSize();
      cacheMetrics.evictions++;
      
      // Limpiar dependencias
      if (INTELLIGENT_CACHE_CONFIG.ENABLE_DEPENDENCIES) {
        clearDependencies(key);
      }
    }
    
    console.log(`[IntelligentCache] ${toEvict} entradas eliminadas por falta de espacio`);
    
  } catch (error) {
    console.error('[IntelligentCache] Error en evictLeastUsed:', error);
  }
}

/**
 * Limpia entradas expiradas y obsoletas
 */
function cleanupIntelligentCache() {
  try {
    const now = Date.now();
    const entries = Array.from(intelligentCache.entries());
    let cleaned = 0;
    
    entries.forEach(([key, entry]) => {
      if (entry.isExpired() || entry.isStale()) {
        intelligentCache.delete(key);
        cacheMetrics.totalSize -= entry.getSize();
        cacheMetrics.evictions++;
        cleaned++;
        
        // Limpiar dependencias
        if (INTELLIGENT_CACHE_CONFIG.ENABLE_DEPENDENCIES) {
          clearDependencies(key);
        }
      }
    });
    
    if (cleaned > 0) {
      console.log(`[IntelligentCache] ${cleaned} entradas limpiadas`);
    }
    
    cacheMetrics.lastCleanup = now;
    
  } catch (error) {
    console.error('[IntelligentCache] Error en cleanup:', error);
  }
}

// ==================== MÉTRICAS Y MONITOREO ====================

/**
 * Obtiene métricas del caché inteligente
 * @returns {Object} Métricas del caché
 */
function getIntelligentCacheMetrics() {
  const hitRate = cacheMetrics.hits + cacheMetrics.misses > 0 ? 
    (cacheMetrics.hits / (cacheMetrics.hits + cacheMetrics.misses) * 100).toFixed(2) : 0;
  
  return {
    ...cacheMetrics,
    hitRate: `${hitRate}%`,
    cacheSize: intelligentCache.size,
    averageEntrySize: intelligentCache.size > 0 ? 
      Math.round(cacheMetrics.totalSize / intelligentCache.size) : 0,
    compressionRatio: cacheMetrics.compressions > 0 ? 
      (cacheMetrics.compressions / intelligentCache.size * 100).toFixed(2) : 0,
    dependencies: cacheDependencies.size,
    lastCleanup: new Date(cacheMetrics.lastCleanup).toISOString()
  };
}

/**
 * Obtiene estadísticas detalladas del caché
 * @returns {Object} Estadísticas detalladas
 */
function getIntelligentCacheStats() {
  const entries = Array.from(intelligentCache.values());
  const now = Date.now();
  
  const stats = {
    totalEntries: entries.length,
    expiredEntries: entries.filter(e => e.isExpired()).length,
    staleEntries: entries.filter(e => e.isStale()).length,
    compressedEntries: entries.filter(e => e.isCompressed).length,
    averageAge: entries.length > 0 ? 
      Math.round(entries.reduce((sum, e) => sum + (now - e.createdAt), 0) / entries.length / 1000) : 0,
    averageAccessCount: entries.length > 0 ? 
      Math.round(entries.reduce((sum, e) => sum + e.accessCount, 0) / entries.length) : 0,
    priorityDistribution: {
      low: entries.filter(e => e.priority === 1).length,
      medium: entries.filter(e => e.priority === 2).length,
      high: entries.filter(e => e.priority === 3).length
    }
  };
  
  return stats;
}

// ==================== FUNCIONES DE UTILIDAD ====================

/**
 * Limpia completamente el caché inteligente
 */
function clearIntelligentCache() {
  intelligentCache.clear();
  cacheDependencies.clear();
  cacheMetrics.hits = 0;
  cacheMetrics.misses = 0;
  cacheMetrics.evictions = 0;
  cacheMetrics.compressions = 0;
  cacheMetrics.totalSize = 0;
  cacheMetrics.lastCleanup = Date.now();
  
  console.log('[IntelligentCache] Caché completamente limpiado');
}

/**
 * Configura el caché inteligente
 * @param {Object} config - Configuración del caché
 */
function configureIntelligentCache(config) {
  Object.assign(INTELLIGENT_CACHE_CONFIG, config);
  console.log('[IntelligentCache] Configuración actualizada:', config);
}

/**
 * Programa la limpieza automática del caché
 */
function scheduleIntelligentCacheCleanup() {
  // Esta función se llamaría desde un trigger temporal
  cleanupIntelligentCache();
}

console.log('🧠 IntelligentCache cargado - Sistema de caché inteligente disponible');
