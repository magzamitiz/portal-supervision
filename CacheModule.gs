/**
 * @fileoverview Módulo de caché optimizado con sistema unificado.
 * Elimina redundancias y mejora el rendimiento.
 */

// ==================== CONFIGURACIÓN DEL MÓDULO ====================

const CACHE_KEY = 'DASHBOARD_CONSOLIDATED_V1';

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
    // Usar sistema unificado si está disponible
    if (typeof setUnifiedCache === 'function') {
      return setUnifiedCache('DASHBOARD', data);
    }
    
    // Fallback al sistema corregido
    const cache = CacheService.getScriptCache();
    const jsonString = JSON.stringify(data);
    const sizeBytes = jsonString.length;
    const sizeKB = Math.round(sizeBytes / 1024);
    
    console.log(`[Cache] 💾 Guardando datos: ${sizeKB}KB`);
    
    // Decisión: Fragmentar si supera 50KB (más conservador que 95KB)
    const FRAGMENT_THRESHOLD = 50000; // 50KB en bytes
    
    if (sizeBytes > FRAGMENT_THRESHOLD) {
      console.log('[Cache] 📦 Fragmentando datos grandes...');
      
      const FRAGMENT_SIZE = 50000; // 50KB por fragmento
      const fragments = [];
      
      // Dividir en fragmentos de 50KB
      for (let i = 0; i < jsonString.length; i += FRAGMENT_SIZE) {
        fragments.push(jsonString.slice(i, i + FRAGMENT_SIZE));
      }
      
      // Guardar cada fragmento con índice
      for (let i = 0; i < fragments.length; i++) {
        const fragmentKey = `${CACHE_KEY}_${i}`;
        const success = cache.put(fragmentKey, fragments[i], ttl);
        
        if (!success) {
          console.error(`[Cache] ❌ Error guardando fragmento ${i}`);
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
      
      cache.put('DASHBOARD_DATA_META', JSON.stringify(metadata), ttl);
      console.log(`[Cache] ✅ Fragmentado exitoso: ${fragments.length} fragmentos (${sizeKB}KB total)`);
      
      return true;
      
    } else {
      // Datos pequeños: guardar directamente SIN fragmentación
      console.log('[Cache] 💾 Guardando datos sin fragmentar...');
      
      const success = cache.put(CACHE_KEY, jsonString, ttl);
      
      if (!success) {
        console.error('[Cache] ❌ Error guardando datos simples');
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
      
      cache.put('DASHBOARD_DATA_META', JSON.stringify(metadata), ttl);
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
    const cache = CacheService.getScriptCache();
    
    // PASO 1: Buscar metadata para determinar tipo de caché
    console.log('[CacheModule] Verificando metadata de caché...');
    const metadataStr = cache.get('DASHBOARD_DATA_META');
    
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
          const cached = cache.get(CACHE_KEY);
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
          const fragment = cache.get(fragmentKey);
          
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
    const cached = cache.get(CACHE_KEY);
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
 * Limpia la caché inteligentemente, incluyendo fragmentos y metadata.
 */
function clearCache() {
  try {
    const cache = CacheService.getScriptCache();
    let fragmentsRemoved = 0;
    let cacheType = 'unknown';
    
    console.log('[CacheModule] Iniciando limpieza inteligente de caché...');
    
    // PASO 1: Leer metadata para saber cuántos fragmentos existen
    const metadataStr = cache.get('DASHBOARD_DATA_META');
    if (metadataStr) {
      try {
        const metadata = JSON.parse(metadataStr);
        cacheType = 'fragmented';
        const expectedFragments = metadata.fragments || 0;
        
        console.log(`[CacheModule] Metadata encontrada: ${expectedFragments} fragmentos esperados`);
        
        // PASO 2: Eliminar todos los fragmentos basados en CACHE_KEY
        const keysToRemove = [];
        
        // Eliminar fragmentos específicos basados en metadata
        for (let i = 0; i < expectedFragments; i++) {
          const fragmentKey = `${CACHE_KEY}_${i}`;
          if (cache.get(fragmentKey)) {
            keysToRemove.push(fragmentKey);
            fragmentsRemoved++;
          }
        }
        
        // Eliminar en lote si hay fragmentos
        if (keysToRemove.length > 0) {
          cache.removeAll(keysToRemove);
          console.log(`[CacheModule] ${fragmentsRemoved} fragmentos eliminados (basado en metadata)`);
        }
        
        // PASO 3: Eliminar metadata y clave principal
        cache.remove('DASHBOARD_META');
        cache.remove(CACHE_KEY);
        
        console.log(`[CacheModule] ✅ Caché fragmentada limpiada: ${fragmentsRemoved} fragmentos + metadata`);
        
      } catch (metadataError) {
        console.warn('[CacheModule] Error leyendo metadata, ejecutando limpieza de emergencia...');
        cacheType = 'emergency';
        fragmentsRemoved = clearCacheEmergency(cache);
      }
    } else {
      // No hay metadata, limpieza simple
      cacheType = 'simple';
      const hadSimpleData = !!cache.get(CACHE_KEY);
      cache.remove(CACHE_KEY);
      
      if (hadSimpleData) {
        console.log('[CacheModule] ✅ Caché simple limpiada');
      } else {
        console.log('[CacheModule] No había datos en caché');
      }
    }
    
    return {
      success: true,
      cacheType: cacheType,
      fragmentsRemoved: fragmentsRemoved,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('[CacheModule] Error crítico al limpiar caché:', error);
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Limpieza de emergencia cuando no se puede leer metadata.
 * @param {CacheService} cache - Instancia del servicio de caché
 * @returns {number} Número de fragmentos eliminados
 */
function clearCacheEmergency(cache) {
  console.log('[CacheModule] Ejecutando limpieza de emergencia (0-20 fragmentos)...');
  
  const keysToRemove = [];
  let fragmentsFound = 0;
  
  // Buscar fragmentos del 0 al 20
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
    console.log(`[CacheModule] Limpieza de emergencia: ${fragmentsFound} fragmentos eliminados`);
  }
  
  // Limpiar también metadata y caché simple por seguridad
  cache.remove('DASHBOARD_META');
  cache.remove(CACHE_KEY);
  
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

console.log('📦 CacheModule cargado - Sistema de caché con fragmentación automática');
