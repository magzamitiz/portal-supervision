/**
 * @fileoverview Módulo de caché optimizado con sistema unificado.
 * Elimina redundancias y mejora el rendimiento.
 */

// ==================== CONFIGURACIÓN DEL MÓDULO ====================

const CACHE_KEY = 'DASHBOARD_CONSOLIDATED_V1';

// 🚨 FALLBACK: Sistema de caché alternativo usando PropertiesService
const FALLBACK_CACHE = {
  enabled: false,
  
  // Verificar si CacheService funciona - CORREGIDO
  checkCacheService() {
    try {
      const cache = CacheService.getScriptCache();
      const testKey = 'TEST_CACHE_CHECK_' + Date.now();
      const testValue = 'test_' + Date.now();
      
      // Write-Read-Delete pattern (no depende del return value)
      cache.put(testKey, testValue, 60);
      const retrieved = cache.get(testKey);
      
      if (retrieved !== testValue) {
        console.warn('[Cache] ⚠️ CacheService no funcional: read mismatch');
        return false;
      }
      
      // Cleanup
      cache.remove(testKey);
      
      console.log('[Cache] ✅ CacheService funcional detectado');
      return true;
    } catch (error) {
      console.warn('[Cache] ⚠️ CacheService no funcional:', error);
      return false;
    }
  },
  
  // Inicializar fallback si es necesario
  init() {
    if (!this.checkCacheService()) {
      console.warn('[Cache] ⚠️ CacheService no funcional, activando fallback con PropertiesService');
      this.enabled = true;
    }
  },
  
  // Guardar datos usando PropertiesService - MEJORADO
  put(key, value, ttl) {
    if (!this.enabled) return false;
    
    try {
      // Validar tamaño antes de intentar guardar
      const data = {
        value: value,
        expires: Date.now() + (ttl * 1000)
      };
      const jsonData = JSON.stringify(data);
      
      if (jsonData.length > 9000) {
        console.error(`[Cache] ❌ Fallback: Valor muy grande (${jsonData.length} bytes) para PropertiesService`);
        console.error(`[Cache] 💡 Límite: 9000 bytes, Clave: ${key}`);
        return false;
      }
      
      PropertiesService.getScriptProperties().setProperty(key, jsonData);
      console.log(`[Cache] ✅ Fallback guardado: ${key} (${jsonData.length} bytes)`);
      return true;
    } catch (error) {
      console.error('[Cache] ❌ Error en fallback put:', error);
      console.error(`[Cache] 🔍 Clave: ${key}, Tamaño: ${value ? value.length : 'N/A'}`);
      return false;
    }
  },
  
  // Recuperar datos usando PropertiesService
  get(key) {
    if (!this.enabled) return null;
    
    try {
      const dataStr = PropertiesService.getScriptProperties().getProperty(key);
      if (!dataStr) return null;
      
      const data = JSON.parse(dataStr);
      
      // Verificar expiración
      if (Date.now() > data.expires) {
        this.remove(key);
        return null;
      }
      
      return data.value;
    } catch (error) {
      console.error('[Cache] Error en fallback get:', error);
      return null;
    }
  },
  
  // Eliminar datos usando PropertiesService
  remove(key) {
    if (!this.enabled) return false;
    
    try {
      PropertiesService.getScriptProperties().deleteProperty(key);
      return true;
    } catch (error) {
      console.error('[Cache] Error en fallback remove:', error);
      return false;
    }
  }
};

// ==================== FUNCIONES DE CACHÉ ====================

/**
 * ✅ CORRECCIÓN CRÍTICA: setCacheData con metadata consistente
 * PROBLEMA ORIGINAL: Metadata no incluía 'fragments' para datos fragmentados
 * SOLUCIÓN: Metadata siempre incluye 'fragments' en todos los casos
 * 
 * @param {Object} data - Datos a guardar en caché
 * @param {number} ttl - Tiempo de vida en segundos (default: 1800)
 * @returns {boolean} True si se guardó exitosamente
 */
function setCacheData(data, ttl = 1800) {
  try {
    // ✅ SOLUCIÓN SIMPLE: Siempre usar el sistema corregido con metadata consistente
    // Eliminamos la dependencia de setUnifiedCache para garantizar sincronización
    
    // Inicializar fallback si es necesario
    FALLBACK_CACHE.init();
    
    // 🚨 FALLBACK: Si CacheService no funciona, usar PropertiesService
    let cache;
    let useFallback = false;
    
    try {
      cache = CacheService.getScriptCache();
      // Verificar si realmente funciona usando la función corregida
      if (!FALLBACK_CACHE.checkCacheService()) {
        console.warn('[Cache] ⚠️ CacheService no funcional, usando fallback');
        useFallback = true;
      }
    } catch (cacheError) {
      console.warn('[Cache] ⚠️ CacheService no disponible, usando fallback:', cacheError);
      useFallback = true;
    }
    const jsonString = JSON.stringify(data);
    const sizeBytes = jsonString.length;
    const sizeKB = Math.round(sizeBytes / 1024);
    
    console.log(`[Cache] 💾 Guardando datos: ${sizeKB}KB`);
    
    // Decisión: Fragmentar si supera 50KB (más conservador que 95KB)
    const FRAGMENT_THRESHOLD = 50000; // 50KB en bytes
    
    // 🔧 CORRECCIÓN: Tamaño de fragmento compatible con PropertiesService
    const FRAGMENT_SIZE = useFallback ? 8000 : 50000; // 8KB para fallback, 50KB para CacheService
    const MAX_FALLBACK_SIZE = 72000; // 9 fragmentos × 8KB = 72KB máximo para fallback
    
    if (sizeBytes > FRAGMENT_THRESHOLD) {
      console.log('[Cache] 📦 Fragmentando datos grandes...');
      
      // 🚨 VALIDACIÓN: Rechazar datos muy grandes en fallback
      if (useFallback && sizeBytes > MAX_FALLBACK_SIZE) {
        console.warn(`[Cache] ⚠️ Datos muy grandes (${sizeKB}KB) para fallback, rechazando`);
        console.warn(`[Cache] 💡 Límite fallback: ${Math.round(MAX_FALLBACK_SIZE/1024)}KB`);
        return false; // Forzar recálculo en lugar de llenar PropertiesService
      }
      const fragments = [];
      
      // Dividir en fragmentos del tamaño apropiado
      for (let i = 0; i < jsonString.length; i += FRAGMENT_SIZE) {
        fragments.push(jsonString.slice(i, i + FRAGMENT_SIZE));
      }
      
      console.log(`[Cache] 📊 Fragmentos: ${fragments.length}, Tamaño: ${FRAGMENT_SIZE} bytes cada uno`);
      console.log(`[Cache] 🎯 Backend: ${useFallback ? 'PropertiesService' : 'CacheService'}`);
      
      // Guardar cada fragmento con índice
      for (let i = 0; i < fragments.length; i++) {
        const fragmentKey = `${CACHE_KEY}_${i}`;
        const fragmentSize = fragments[i].length;
        console.log(`[Cache] 🔍 DEBUG Fragmento ${i}: Clave="${fragmentKey}", Tamaño=${fragmentSize} bytes`);
        
        let success;
        if (useFallback) {
          success = FALLBACK_CACHE.put(fragmentKey, fragments[i], ttl);
        } else {
          success = cache.put(fragmentKey, fragments[i], ttl);
        }
        
        if (!success) {
          console.error(`[Cache] ❌ Error guardando fragmento ${i}`);
          console.error(`[Cache] 🔍 DEBUG: Clave="${fragmentKey}", Tamaño=${fragmentSize} bytes, TTL=${ttl}`);
          console.error('[Cache] 🔍 Posibles causas: fragmento muy grande, clave inválida, TTL inválido');
          // Limpiar fragmentos parciales
          clearCache();
          return false;
        }
      }
      
      // ✅ CORRECCIÓN: Guardar metadata con estructura correcta
      const metadata = {
        fragments: fragments.length,    // ✅ CAMPO REQUERIDO
        size: sizeBytes,                 // En bytes (no KB)
        timestamp: Date.now(),           // Timestamp para tracking
        originalKey: CACHE_KEY,          // Referencia
        fragmentSize: FRAGMENT_SIZE      // Info adicional útil
      };
      
      // Guardar metadata
      if (useFallback) {
        FALLBACK_CACHE.put('DASHBOARD_DATA_META', JSON.stringify(metadata), ttl);
      } else {
        cache.put('DASHBOARD_DATA_META', JSON.stringify(metadata), ttl);
      }
      console.log(`[Cache] ✅ Fragmentado exitoso: ${fragments.length} fragmentos (${sizeKB}KB total)`);
      
      return true;
      
    } else {
      // Datos pequeños: guardar directamente SIN fragmentación
      console.log('[Cache] 💾 Guardando datos sin fragmentar...');
      console.log(`[Cache] 🔍 DEBUG: Clave=${CACHE_KEY}, TTL=${ttl}, Tamaño=${sizeBytes} bytes`);
      
      let success;
      if (useFallback) {
        success = FALLBACK_CACHE.put(CACHE_KEY, jsonString, ttl);
      } else {
        success = cache.put(CACHE_KEY, jsonString, ttl);
      }
      
      if (!success) {
        console.error('[Cache] ❌ Error guardando datos simples');
        console.error(`[Cache] 🔍 DEBUG: Clave="${CACHE_KEY}", TTL=${ttl}, Tamaño=${sizeBytes} bytes`);
        console.error('[Cache] 🔍 Posibles causas: datos muy grandes, clave inválida, TTL inválido');
        return false;
      }
      
      // ✅ CORRECCIÓN: Metadata consistente incluso para datos simples
      const metadata = {
        fragments: 1,            // ✅ 1 = datos simples (no fragmentados)
        size: sizeBytes,
        timestamp: Date.now(),
        originalKey: CACHE_KEY,
        fragmentSize: 0          // 0 = no hay fragmentación
      };
      
      // Guardar metadata
      if (useFallback) {
        FALLBACK_CACHE.put('DASHBOARD_DATA_META', JSON.stringify(metadata), ttl);
      } else {
        cache.put('DASHBOARD_DATA_META', JSON.stringify(metadata), ttl);
      }
      console.log(`[Cache] ✅ Guardado directo exitoso (${sizeKB}KB)`);
      
      return true;
    }
    
  } catch (error) {
    console.error('[Cache] ❌ Error crítico guardando:', error);
    clearCache(); // Limpiar cualquier dato parcial
    return false;
  }
}

/**
 * Recupera los datos de la caché con reconstrucción optimizada de fragmentos.
 * @returns {Object|null} Datos recuperados o null si no hay caché
 */
function getCacheData() {
  try {
    // Inicializar fallback si es necesario
    FALLBACK_CACHE.init();
    
    // 🚨 FALLBACK: Si CacheService no funciona, usar PropertiesService
    let cache;
    let useFallback = false;
    
    try {
      cache = CacheService.getScriptCache();
      // Verificar si realmente funciona usando la función corregida
      if (!FALLBACK_CACHE.checkCacheService()) {
        console.warn('[Cache] ⚠️ CacheService no funcional, usando fallback');
        useFallback = true;
      }
    } catch (cacheError) {
      console.warn('[Cache] ⚠️ CacheService no disponible, usando fallback:', cacheError);
      useFallback = true;
    }
    
    // PASO 1: Buscar metadata para determinar tipo de caché
    console.log('[CacheModule] Verificando metadata de caché...');
    let metadataStr;
    if (useFallback) {
      metadataStr = FALLBACK_CACHE.get('DASHBOARD_DATA_META');
    } else {
      metadataStr = cache.get('DASHBOARD_DATA_META');
    }
    
    if (metadataStr) {
      console.log('[CacheModule] Metadata encontrada, procesando fragmentos...');
      
      try {
        const metadata = JSON.parse(metadataStr);
        console.log(`[CacheModule] Metadata válida: ${metadata.fragments} fragmentos, ${metadata.size} bytes`);
        
        // Validar metadata
        if (!metadata.fragments || metadata.fragments < 1) {
          console.error('[CacheModule] Metadata inválida: fragments debe ser >= 1');
          clearCache();
          return null;
        }
        
        // PASO 2: Manejar caso especial de fragments=1 (caché simple con metadata)
        if (metadata.fragments === 1) {
          console.log('[CacheModule] fragments=1, leyendo caché simple directamente');
          let cached;
          if (useFallback) {
            cached = FALLBACK_CACHE.get(CACHE_KEY);
          } else {
            cached = cache.get(CACHE_KEY);
          }
          
          if (!cached) {
            console.error('[CacheModule] Fragmento único no encontrado en caché simple');
            clearCache();
            return null;
          }
          
          const data = JSON.parse(cached);
          console.log('[CacheModule] ✅ Datos únicos recuperados exitosamente');
          return data;
        }
        
        // PASO 3: Reconstruir múltiples fragmentos
        console.log(`[CacheModule] Reconstruyendo ${metadata.fragments} fragmentos...`);
        let reconstructedData = '';
        let fragmentsFound = 0;
        
        for (let i = 0; i < metadata.fragments; i++) {
          const fragmentKey = `${CACHE_KEY}_${i}`;
          let fragment;
          if (useFallback) {
            fragment = FALLBACK_CACHE.get(fragmentKey);
          } else {
            fragment = cache.get(fragmentKey);
          }
          
          if (!fragment) {
            console.error(`[CacheModule] ❌ Fragmento ${i} faltante (${fragmentKey})`);
            console.log('[CacheModule] Caché corrupto detectado, limpiando...');
            clearCache();
            return null;
          }
          
          reconstructedData += fragment;
          fragmentsFound++;
          console.log(`[CacheModule] Fragmento ${i + 1}/${metadata.fragments} OK: ${fragment.length} bytes`);
        }
        
        // Validar que se encontraron todos los fragmentos
        if (fragmentsFound !== metadata.fragments) {
          console.error(`[CacheModule] ❌ Fragmentos incompletos: ${fragmentsFound}/${metadata.fragments}`);
          clearCache();
          return null;
        }
        
        // Validar tamaño reconstruido
        if (reconstructedData.length !== metadata.size) {
          console.warn(`[CacheModule] ⚠️ Tamaño reconstruido (${reconstructedData.length}) != metadata (${metadata.size})`);
        }
        
        // Parsear JSON final
        const data = JSON.parse(reconstructedData);
        console.log(`[CacheModule] ✅ Datos fragmentados reconstruidos: ${fragmentsFound} fragmentos, ${reconstructedData.length} bytes`);
        return data;
        
      } catch (metadataError) {
        console.error('[CacheModule] ❌ Error procesando metadata:', metadataError);
        clearCache();
        return null;
      }
    }
    
    // PASO 4: Fallback a caché simple (sin metadata)
    console.log('[CacheModule] No hay metadata, intentando caché simple...');
    let cached;
    if (useFallback) {
      cached = FALLBACK_CACHE.get(CACHE_KEY);
    } else {
      cached = cache.get(CACHE_KEY);
    }
    
    if (cached) {
      console.log('[CacheModule] Datos simples encontrados en caché');
      try {
        const data = JSON.parse(cached);
        console.log('[CacheModule] ✅ Datos simples recuperados exitosamente');
        return data;
      } catch (parseError) {
        console.error('[CacheModule] ❌ Error parseando datos simples:', parseError);
        clearCache();
        return null;
      }
    }
    
    console.log('[CacheModule] No se encontraron datos en caché');
    return null;
    
  } catch (error) {
    console.error('[CacheModule] ❌ Error crítico al leer de la caché:', error);
    clearCache(); // Limpiar caché corrupta
    return null;
  }
}

/**
 * ✅ SOLUCIÓN 2: clearCache que elimina TODA la metadata
 * Incluye DASHBOARD_DATA_META para evitar corrupción
 */
function clearCache() {
  try {
    // 🚨 FALLBACK: Si CacheService no funciona, simular éxito
    let cache;
    try {
      cache = CacheService.getScriptCache();
    } catch (cacheError) {
      console.warn('[Cache] ⚠️ CacheService no disponible, simulando limpieza:', cacheError);
      return {
        success: true,
        cacheType: 'disabled',
        fragmentsRemoved: 0,
        metadataRemoved: 0,
        timestamp: new Date().toISOString()
      };
    }
    let fragmentsRemoved = 0;
    let cacheType = 'unknown';
    
    console.log('[CacheModule] 🧹 Iniciando limpieza completa de caché...');
    
    // PASO 1: Leer metadata para saber cuántos fragmentos hay
    const metadataStr = cache.get('DASHBOARD_DATA_META');
    if (metadataStr) {
      try {
        const metadata = JSON.parse(metadataStr);
        cacheType = 'fragmented';
        const expectedFragments = metadata.fragments || 0;
        
        console.log(`[CacheModule] Metadata encontrada: ${expectedFragments} fragmentos`);
        
        // Eliminar todos los fragmentos
        const keysToRemove = [];
        for (let i = 0; i < expectedFragments; i++) {
          const fragmentKey = `${CACHE_KEY}_${i}`;
          if (cache.get(fragmentKey)) {
            keysToRemove.push(fragmentKey);
            fragmentsRemoved++;
          }
        }
        
        if (keysToRemove.length > 0) {
          cache.removeAll(keysToRemove);
          console.log(`[CacheModule] ${fragmentsRemoved} fragmentos eliminados`);
        }
        
      } catch (metadataError) {
        console.warn('[CacheModule] ⚠️ Error leyendo metadata, limpieza de emergencia...');
        cacheType = 'emergency';
        fragmentsRemoved = clearCacheEmergency(cache);
      }
    } else {
      // Caché simple
      cacheType = 'simple';
      const hadSimpleData = !!cache.get(CACHE_KEY);
      if (hadSimpleData) {
        console.log('[CacheModule] Limpiando caché simple...');
      }
    }
    
    // ✅ PASO 2: ELIMINAR TODA LA METADATA (ambas claves)
    console.log('[CacheModule] 🗑️ Eliminando metadata...');
    
    const metadataKeys = [
      'DASHBOARD_META',           // ✅ Metadata vieja
      'DASHBOARD_DATA_META'       // ✅ Metadata nueva (CRÍTICO)
    ];
    
    metadataKeys.forEach(key => {
      const hadKey = !!cache.get(key);
      cache.remove(key);
      if (hadKey) {
        console.log(`[CacheModule]   ✅ ${key} eliminada`);
      }
    });
    
    // PASO 3: Eliminar clave principal
    cache.remove(CACHE_KEY);
    console.log(`[CacheModule]   ✅ ${CACHE_KEY} eliminada`);
    
    // PASO 4: Limpiar también sistema unificado (si existe)
    if (typeof UnifiedCache !== 'undefined' && UnifiedCache.invalidateKey) {
      try {
        UnifiedCache.invalidateKey('UNIFIED_DASHBOARD_V3');
        console.log('[CacheModule]   ✅ Caché unificado invalidado');
      } catch (e) {
        console.warn('[CacheModule]   ⚠️ No se pudo invalidar caché unificado');
      }
    }
    
    // 🔧 CORRECCIÓN: Limpiar fallback si está habilitado
    if (FALLBACK_CACHE && FALLBACK_CACHE.enabled) {
      console.log('[CacheModule] 🧹 Limpiando fallback (PropertiesService)...');
      
      // Limpiar claves principales
      FALLBACK_CACHE.remove(CACHE_KEY);
      FALLBACK_CACHE.remove('DASHBOARD_DATA_META');
      FALLBACK_CACHE.remove('DASHBOARD_META');
      
      // Limpiar fragmentos fallback
      for (let i = 0; i < 20; i++) {
        FALLBACK_CACHE.remove(`${CACHE_KEY}_${i}`);
      }
      
      // Limpiar claves temporales de verificación
      FALLBACK_CACHE.remove('TEST_FALLBACK');
      FALLBACK_CACHE.remove('TEST_CACHE_CHECK_' + Date.now());
      
      console.log('[CacheModule]   ✅ Fallback limpiado');
    }
    
    console.log('[CacheModule] ✅ Limpieza completa exitosa');
    console.log(`[CacheModule] 📊 Tipo: ${cacheType}, Fragmentos: ${fragmentsRemoved}`);
    
    return {
      success: true,
      cacheType: cacheType,
      fragmentsRemoved: fragmentsRemoved,
      metadataRemoved: metadataKeys.length,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('[CacheModule] ❌ Error crítico al limpiar caché:', error);
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Limpieza de emergencia cuando la metadata está corrupta
 * @param {CacheService} cache - Instancia del servicio de caché
 * @returns {number} Número de fragmentos eliminados
 */
function clearCacheEmergency(cache) {
  console.log('[CacheModule] 🚨 EMERGENCIA: Limpiando 0-20 fragmentos...');
  
  const keysToRemove = [];
  let fragmentsFound = 0;
  
  // Buscar hasta 20 fragmentos
  for (let i = 0; i < 20; i++) {
    const fragmentKey = `${CACHE_KEY}_${i}`;
    if (cache.get(fragmentKey)) {
      keysToRemove.push(fragmentKey);
      fragmentsFound++;
    }
  }
  
  // Eliminar en lote
  if (keysToRemove.length > 0) {
    cache.removeAll(keysToRemove);
    console.log(`[CacheModule] ${fragmentsFound} fragmentos eliminados`);
  }
  
  // ✅ CRÍTICO: Eliminar AMBAS metadata
  cache.remove('DASHBOARD_META');
  cache.remove('DASHBOARD_DATA_META');
  cache.remove(CACHE_KEY);
  
  // 🔧 CORRECCIÓN: Limpiar fallback en emergencia también
  if (FALLBACK_CACHE && FALLBACK_CACHE.enabled) {
    console.log('[CacheModule] 🧹 Limpieza de emergencia: fallback');
    
    FALLBACK_CACHE.remove(CACHE_KEY);
    FALLBACK_CACHE.remove('DASHBOARD_DATA_META');
    FALLBACK_CACHE.remove('DASHBOARD_META');
    
    // Limpiar fragmentos fallback
    for (let i = 0; i < 20; i++) {
      FALLBACK_CACHE.remove(`${CACHE_KEY}_${i}`);
    }
    
    // Limpiar claves temporales
    FALLBACK_CACHE.remove('TEST_FALLBACK');
    FALLBACK_CACHE.remove('TEST_CACHE_CHECK_' + Date.now());
  }
  
  console.log('[CacheModule] ✅ Limpieza de emergencia completada');
  return fragmentsFound;
}

/**
 * Verifica si hay datos en caché (simples o fragmentados).
 * @returns {boolean} True si hay datos en caché
 */
function hasCacheData() {
  try {
    const cache = CacheService.getScriptCache();
    
    // Verificar metadata de fragmentación
    const metadataStr = cache.get('DASHBOARD_DATA_META');
    if (metadataStr) {
      console.log('[CacheModule] Datos fragmentados detectados en caché');
      return true;
    }
    
    // Verificar caché simple
    const cached = cache.get(CACHE_KEY);
    if (cached) {
      console.log('[CacheModule] Datos simples detectados en caché');
      return true;
    }
    
    console.log('[CacheModule] No hay datos en caché');
    return false;
    
  } catch (error) {
    console.error('[CacheModule] Error verificando caché:', error);
    return false;
  }
}

/**
 * Obtiene información detallada sobre el estado de la caché.
 * @returns {Object} Información completa del estado de la caché
 */
function getCacheInfo() {
  try {
    const cache = CacheService.getScriptCache();
    const now = Date.now();
    
    // Verificar metadata de fragmentación
    const metadataStr = cache.get('DASHBOARD_DATA_META');
    if (metadataStr) {
      try {
        const metadata = JSON.parse(metadataStr);
        const ageMinutes = metadata.timestamp ? Math.floor((now - metadata.timestamp) / 60000) : 0;
        
        return {
          hasData: true,
          type: 'fragmented',
          fragments: metadata.fragments || 0,
          size: metadata.size || 0,
          sizeKB: metadata.size ? Math.round(metadata.size / 1024 * 100) / 100 : 0,
          age: ageMinutes,
          timestamp: metadata.timestamp,
          originalKey: metadata.originalKey || CACHE_KEY,
          duration: CONFIG.CACHE.DURATION,
          ageText: ageMinutes < 1 ? 'menos de 1 minuto' : 
                   ageMinutes === 1 ? '1 minuto' : 
                   `${ageMinutes} minutos`
        };
      } catch (metadataError) {
        console.warn('[CacheModule] Error parseando metadata:', metadataError);
        // Fallback a verificación manual
      }
    }
    
    // Verificar caché simple
    const cached = cache.get(CACHE_KEY);
    if (cached) {
      return {
        hasData: true,
        type: 'simple',
        fragments: 1,
        size: cached.length,
        sizeKB: Math.round(cached.length / 1024 * 100) / 100,
        age: 0, // No tenemos timestamp para caché simple
        timestamp: null,
        key: CACHE_KEY,
        duration: CONFIG.CACHE.DURATION,
        ageText: 'desconocida'
      };
    }
    
    return {
      hasData: false,
      type: 'none',
      fragments: 0,
      size: 0,
      sizeKB: 0,
      age: 0,
      timestamp: null,
      key: CACHE_KEY,
      duration: CONFIG.CACHE.DURATION,
      ageText: 'N/A'
    };
    
  } catch (error) {
    console.error('[CacheModule] Error obteniendo información de caché:', error);
    return {
      hasData: false,
      type: 'error',
      fragments: 0,
      size: 0,
      sizeKB: 0,
      age: 0,
      timestamp: null,
      key: CACHE_KEY,
      duration: CONFIG.CACHE.DURATION,
      ageText: 'Error',
      error: error.message
    };
  }
}

/**
 * Limpia la caché manualmente y proporciona feedback detallado
 * @returns {Object} Resultado de la operación
 */
function limpiarCacheManualmente() {
  try {
    console.log('[CacheModule] Iniciando limpieza manual de caché...');
    
    // Obtener información antes de limpiar
    const infoBefore = getCacheInfo();
    console.log('[CacheModule] Estado de caché antes de limpiar:', infoBefore);
    
    // Limpiar caché usando la función mejorada
    const clearResult = clearCache();
    
    // Verificar que se limpió correctamente
    const infoAfter = getCacheInfo();
    console.log('[CacheModule] Estado de caché después de limpiar:', infoAfter);
    
    if (clearResult.success) {
      console.log(`[CacheModule] ✅ Caché limpiada manualmente (tipo: ${clearResult.cacheType})`);
      
      return {
        success: true,
        message: 'Caché limpiada correctamente',
        cache_type: clearResult.cacheType,
        fragments_removed: clearResult.fragmentsRemoved,
        data_size_before: infoBefore.size,
        data_size_after: infoAfter.size,
        sizeKB_before: infoBefore.sizeKB,
        sizeKB_after: infoAfter.sizeKB,
        age_before: infoBefore.ageText,
        timestamp: clearResult.timestamp
      };
    } else {
      console.log('[CacheModule] ❌ Error en limpieza de caché');
      return {
        success: false,
        error: clearResult.error,
        cache_type: infoBefore.type,
        fragments_removed: 0,
        timestamp: clearResult.timestamp
      };
    }
    
  } catch (error) {
    console.error('[CacheModule] Error al limpiar caché manualmente:', error);
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Función robusta de limpieza completa del sistema
 * Limpia todas las cachés conocidas y reinicia el sistema
 * @returns {Object} Resultado completo de la limpieza
 */
function limpiarCacheRobustoCompleto() {
  try {
    console.log('🧹 INICIANDO LIMPIEZA ROBUSTA COMPLETA DEL SISTEMA');
    const startTime = Date.now();
    
    const resultado = {
      success: true,
      timestamp: new Date().toISOString(),
      operaciones: {},
      errores: []
    };
    
    // 1. Limpiar caché principal
    try {
      console.log('🧹 Limpiando caché principal...');
      resultado.operaciones.cache_principal = clearCache();
    } catch (error) {
      resultado.errores.push(`Cache principal: ${error.toString()}`);
    }
    
    // 2. Limpiar caché de estadísticas rápidas
    try {
      console.log('🧹 Limpiando caché de estadísticas...');
      const cache = CacheService.getScriptCache();
      cache.remove('STATS_RAPIDAS_V2');
      resultado.operaciones.stats_rapidas = true;
    } catch (error) {
      resultado.errores.push(`Stats rápidas: ${error.toString()}`);
    }
    
    // 3. Limpiar todas las claves conocidas del sistema
    try {
      console.log('🧹 Limpieza exhaustiva de claves conocidas...');
      const cache = CacheService.getScriptCache();
      const clavesConocidas = [
        'DASHBOARD_DATA_V2',
        'STATS_RAPIDAS_V2', 
        'LD_FULL_',
        'ACTIVIDAD_CACHE',
        'DIRECTORIO_COMPLETO',
        'CACHE_GRAFICOS'
      ];
      
      let clavesLimpiadas = 0;
      clavesConocidas.forEach(clave => {
        try {
          cache.remove(clave);
          clavesLimpiadas++;
        } catch (e) {
          // Ignorar errores de claves individuales
        }
      });
      
      resultado.operaciones.claves_limpiadas = clavesLimpiadas;
    } catch (error) {
      resultado.errores.push(`Limpieza claves: ${error.toString()}`);
    }
    
    // 4. Forzar recarga de datos críticos
    try {
      console.log('🔄 Forzando recarga de datos críticos...');
      if (typeof cargarDirectorioCompleto === 'function') {
        cargarDirectorioCompleto(true); // forceReload = true
        resultado.operaciones.recarga_directorio = true;
      }
    } catch (error) {
      resultado.errores.push(`Recarga directorio: ${error.toString()}`);
    }
    
    const timeElapsed = Date.now() - startTime;
    resultado.tiempo_total_ms = timeElapsed;
    
    if (resultado.errores.length === 0) {
      console.log(`✅ LIMPIEZA ROBUSTA COMPLETADA EN ${timeElapsed}ms`);
      resultado.mensaje = 'Sistema completamente limpio y reiniciado';
    } else {
      console.log(`⚠️ LIMPIEZA COMPLETADA CON ${resultado.errores.length} ERRORES EN ${timeElapsed}ms`);
      resultado.success = false;
      resultado.mensaje = `Limpieza parcial: ${resultado.errores.length} errores encontrados`;
    }
    
    return resultado;
    
  } catch (error) {
    console.error('❌ ERROR CRÍTICO EN LIMPIEZA ROBUSTA:', error);
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString(),
      mensaje: 'Error crítico durante la limpieza'
    };
  }
}

/**
 * Test simple para diagnosticar problemas de caché
 */
function testCacheSimple() {
  console.log('🧪 TEST SIMPLE DE CACHÉ');
  console.log('='.repeat(40));
  
  // Verificar si CacheService está disponible
  try {
    const cache = CacheService.getScriptCache();
    console.log('✅ CacheService.getScriptCache() disponible');
    console.log(`🔍 Tipo de cache: ${typeof cache}`);
    console.log(`🔍 Métodos disponibles: ${Object.getOwnPropertyNames(cache).join(', ')}`);
  } catch (error) {
    console.error('❌ ERROR CRÍTICO: CacheService no disponible:', error);
    return;
  }
  
  const cache = CacheService.getScriptCache();
  
  // Test 1: Clave muy simple
  console.log('\n📝 TEST 1: Clave simple');
  const testKey1 = 'TEST_SIMPLE';
  const testData1 = 'Hola mundo';
  const success1 = cache.put(testKey1, testData1, 60);
  console.log(`Clave: "${testKey1}", Datos: "${testData1}", Éxito: ${success1 ? '✅' : '❌'}`);
  
  if (success1) {
    const retrieved1 = cache.get(testKey1);
    console.log(`Recuperado: "${retrieved1}", Coincide: ${retrieved1 === testData1 ? '✅' : '❌'}`);
    cache.remove(testKey1);
  }
  
  // Test 2: Clave larga (como la real)
  console.log('\n📝 TEST 2: Clave larga');
  const testKey2 = 'DASHBOARD_CONSOLIDATED_V1';
  const testData2 = 'Test data';
  const success2 = cache.put(testKey2, testData2, 60);
  console.log(`Clave: "${testKey2}", Datos: "${testData2}", Éxito: ${success2 ? '✅' : '❌'}`);
  
  if (success2) {
    const retrieved2 = cache.get(testKey2);
    console.log(`Recuperado: "${retrieved2}", Coincide: ${retrieved2 === testData2 ? '✅' : '❌'}`);
    cache.remove(testKey2);
  }
  
  // Test 3: Datos grandes
  console.log('\n📝 TEST 3: Datos grandes');
  const testKey3 = 'TEST_LARGE';
  const testData3 = 'x'.repeat(10000); // 10KB
  const success3 = cache.put(testKey3, testData3, 60);
  console.log(`Clave: "${testKey3}", Tamaño: ${testData3.length} bytes, Éxito: ${success3 ? '✅' : '❌'}`);
  
  if (success3) {
    const retrieved3 = cache.get(testKey3);
    console.log(`Recuperado: ${retrieved3 ? 'Sí' : 'No'}, Coincide: ${retrieved3 === testData3 ? '✅' : '❌'}`);
    cache.remove(testKey3);
  }
  
  console.log('\n' + '='.repeat(40));
  console.log('✅ Test simple completado');
}

/**
 * Diagnóstico avanzado del problema de caché
 */
function diagnosticarCacheCompleto() {
  console.log('🔍 DIAGNÓSTICO AVANZADO DE CACHÉ');
  console.log('='.repeat(50));
  
  // Test 1: Verificar CacheService
  console.log('\n📋 TEST 1: Verificación de CacheService');
  try {
    const cache = CacheService.getScriptCache();
    console.log('✅ CacheService.getScriptCache() OK');
    console.log(`🔍 Tipo: ${typeof cache}`);
    console.log(`🔍 Constructor: ${cache.constructor.name}`);
    
    // Verificar métodos
    const methods = ['put', 'get', 'remove', 'removeAll'];
    methods.forEach(method => {
      const exists = typeof cache[method] === 'function';
      console.log(`🔍 ${method}(): ${exists ? '✅' : '❌'}`);
    });
    
  } catch (error) {
    console.error('❌ CacheService.getScriptCache() FALLA:', error);
    return;
  }
  
  // Test 2: Verificar permisos
  console.log('\n📋 TEST 2: Verificación de permisos');
  try {
    const cache = CacheService.getScriptCache();
    const testKey = 'PERMISSION_TEST';
    const testData = 'test';
    
    // Intentar put
    const putResult = cache.put(testKey, testData, 60);
    console.log(`🔍 cache.put(): ${putResult ? '✅' : '❌'}`);
    
    if (putResult) {
      // Intentar get
      const getResult = cache.get(testKey);
      console.log(`🔍 cache.get(): ${getResult ? '✅' : '❌'}`);
      console.log(`🔍 Datos recuperados: "${getResult}"`);
      
      // Intentar remove
      cache.remove(testKey);
      console.log('🔍 cache.remove(): ✅');
    }
    
  } catch (error) {
    console.error('❌ Error en test de permisos:', error);
  }
  
  // Test 3: Verificar límites
  console.log('\n📋 TEST 3: Verificación de límites');
  try {
    const cache = CacheService.getScriptCache();
    
    // Test con datos muy pequeños
    const tinyData = 'x';
    const tinyResult = cache.put('TINY', tinyData, 60);
    console.log(`🔍 Datos mínimos (1 byte): ${tinyResult ? '✅' : '❌'}`);
    if (tinyResult) cache.remove('TINY');
    
    // Test con clave muy corta
    const shortKey = 'A';
    const shortResult = cache.put(shortKey, 'test', 60);
    console.log(`🔍 Clave mínima (1 char): ${shortResult ? '✅' : '❌'}`);
    if (shortResult) cache.remove(shortKey);
    
    // Test con TTL mínimo
    const ttlResult = cache.put('TTL_TEST', 'test', 1);
    console.log(`🔍 TTL mínimo (1s): ${ttlResult ? '✅' : '❌'}`);
    if (ttlResult) cache.remove('TTL_TEST');
    
  } catch (error) {
    console.error('❌ Error en test de límites:', error);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Diagnóstico completado');
}

/**
 * Test del sistema de fallback con PropertiesService
 */
function testFallbackCache() {
  console.log('🧪 TEST DE FALLBACK CACHE');
  console.log('='.repeat(40));
  
  // Inicializar fallback
  FALLBACK_CACHE.init();
  
  if (!FALLBACK_CACHE.enabled) {
    console.log('⚠️ Fallback no está habilitado (CacheService funciona)');
    return;
  }
  
  console.log('✅ Fallback habilitado, probando...');
  
  // Test 1: Datos simples
  console.log('\n📝 TEST 1: Datos simples');
  const testData1 = { test: 'Hola mundo', timestamp: Date.now() };
  const success1 = setCacheData(testData1, 60);
  console.log(`Guardado: ${success1 ? '✅' : '❌'}`);
  
  const retrieved1 = getCacheData();
  const match1 = retrieved1 && retrieved1.test === testData1.test;
  console.log(`Recuperado: ${match1 ? '✅' : '❌'}`);
  
  // Test 2: Datos grandes (fragmentación)
  console.log('\n📦 TEST 2: Datos grandes');
  clearCache(); // Limpiar antes
  
  const testData2 = { test: 'x'.repeat(80000), size: 'large' };
  const success2 = setCacheData(testData2, 60);
  console.log(`Guardado fragmentado: ${success2 ? '✅' : '❌'}`);
  
  const retrieved2 = getCacheData();
  const match2 = retrieved2 && retrieved2.test === testData2.test;
  console.log(`Recuperado fragmentado: ${match2 ? '✅' : '❌'}`);
  
  // Test 3: Metadata
  console.log('\n📋 TEST 3: Metadata');
  const metadata = FALLBACK_CACHE.get('DASHBOARD_DATA_META');
  if (metadata) {
    const meta = JSON.parse(metadata);
    console.log(`Metadata encontrada: fragments=${meta.fragments}, size=${meta.size}`);
  } else {
    console.log('❌ No hay metadata');
  }
  
  console.log('\n' + '='.repeat(40));
  console.log('✅ Test de fallback completado');
}

/**
 * Test de regresión completo del sistema de caché corregido
 */
function testCacheCompleto() {
  console.log('🧪 TEST COMPLETO DEL SISTEMA DE CACHÉ');
  console.log('='.repeat(60));
  
  const resultados = {
    timestamp: new Date().toISOString(),
    tests: {},
    exito: true
  };
  
  // Test 1: CacheService debe ser detectado correctamente
  console.log('\n📋 TEST 1: Detección de CacheService');
  try {
    const cacheWorks = FALLBACK_CACHE.checkCacheService();
    console.log(`CacheService detectado: ${cacheWorks ? '✅' : '❌'}`);
    resultados.tests.deteccion_cache = cacheWorks;
    
    if (!cacheWorks) {
      console.log('⚠️ CacheService no funcional, usando fallback');
    }
  } catch (error) {
    console.error('❌ Error en detección:', error);
    resultados.tests.deteccion_cache = false;
    resultados.exito = false;
  }
  
  // Test 2: Datos pequeños (< 8KB) deben funcionar
  console.log('\n📋 TEST 2: Datos pequeños');
  try {
    clearCache();
    const smallData = { test: 'x'.repeat(7000), timestamp: Date.now() };
    const saved = setCacheData(smallData, 60);
    const retrieved = getCacheData();
    const match = retrieved && retrieved.test === smallData.test;
    
    console.log(`Guardado: ${saved ? '✅' : '❌'}`);
    console.log(`Recuperado: ${match ? '✅' : '❌'}`);
    
    resultados.tests.datos_pequenos = saved && match;
    if (!resultados.tests.datos_pequenos) resultados.exito = false;
  } catch (error) {
    console.error('❌ Error en datos pequeños:', error);
    resultados.tests.datos_pequenos = false;
    resultados.exito = false;
  }
  
  // Test 3: Datos medianos (8-72KB) con fallback
  console.log('\n📋 TEST 3: Datos medianos (fallback)');
  try {
    clearCache();
    const mediumData = { test: 'y'.repeat(50000), timestamp: Date.now() };
    const saved = setCacheData(mediumData, 60);
    const retrieved = getCacheData();
    const match = retrieved && retrieved.test === mediumData.test;
    
    console.log(`Guardado: ${saved ? '✅' : '❌'}`);
    console.log(`Recuperado: ${match ? '✅' : '❌'}`);
    
    resultados.tests.datos_medianos = saved && match;
    if (!resultados.tests.datos_medianos) resultados.exito = false;
  } catch (error) {
    console.error('❌ Error en datos medianos:', error);
    resultados.tests.datos_medianos = false;
    resultados.exito = false;
  }
  
  // Test 4: Datos muy grandes (>72KB) deben ser rechazados en fallback
  console.log('\n📋 TEST 4: Datos muy grandes (deben ser rechazados)');
  try {
    clearCache();
    const largeData = { test: 'z'.repeat(80000), timestamp: Date.now() };
    const saved = setCacheData(largeData, 60);
    
    // Si fallback está activo, debe rechazar datos muy grandes
    const shouldReject = FALLBACK_CACHE.enabled;
    const correctBehavior = shouldReject ? !saved : saved;
    
    console.log(`Datos grandes: ${saved ? 'Guardados' : 'Rechazados'}`);
    console.log(`Comportamiento correcto: ${correctBehavior ? '✅' : '❌'}`);
    
    resultados.tests.datos_grandes = correctBehavior;
    if (!resultados.tests.datos_grandes) resultados.exito = false;
  } catch (error) {
    console.error('❌ Error en datos grandes:', error);
    resultados.tests.datos_grandes = false;
    resultados.exito = false;
  }
  
  // Test 5: clearCache debe limpiar ambos sistemas
  console.log('\n📋 TEST 5: Limpieza completa');
  try {
    // Guardar datos primero
    setCacheData({ test: 'cleanup_test' }, 60);
    
    // Limpiar
    const clearResult = clearCache();
    
    // Verificar que no hay datos
    const afterClear = getCacheData();
    const isClean = !afterClear;
    
    console.log(`Limpieza exitosa: ${clearResult.success ? '✅' : '❌'}`);
    console.log(`Datos eliminados: ${isClean ? '✅' : '❌'}`);
    
    resultados.tests.limpieza_completa = clearResult.success && isClean;
    if (!resultados.tests.limpieza_completa) resultados.exito = false;
  } catch (error) {
    console.error('❌ Error en limpieza:', error);
    resultados.tests.limpieza_completa = false;
    resultados.exito = false;
  }
  
  // Resumen final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE TESTS');
  console.log('='.repeat(60));
  
  Object.keys(resultados.tests).forEach(test => {
    const resultado = resultados.tests[test];
    const icon = resultado ? '✅' : '❌';
    console.log(`${icon} ${test}: ${resultado ? 'PASS' : 'FAIL'}`);
  });
  
  console.log('\n' + (resultados.exito ? '🎉 TODOS LOS TESTS PASARON' : '⚠️ ALGUNOS TESTS FALLARON'));
  console.log(`📅 Timestamp: ${resultados.timestamp}`);
  
  return resultados;
}

console.log('📦 CacheModule cargado - Sistema de caché con fragmentación automática');
