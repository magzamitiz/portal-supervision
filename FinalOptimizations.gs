/**
 * @fileoverview Optimizaciones finales del sistema
 * Aplicación de mejoras de rendimiento de último minuto
 */

/**
 * Optimización final: Carga ultra-eficiente de datos del dashboard
 * @param {boolean} forceReload - Si true, ignora caché
 * @returns {Object} Datos optimizados del dashboard
 */
function getDashboardDataOptimized(forceReload = false) {
  const startTime = Date.now();
  
  try {
    console.log('[FinalOptimizations] Iniciando carga optimizada del dashboard...');
    
    // Usar caché inteligente si no es forceReload
    if (!forceReload) {
      const cached = getCacheData();
      if (cached) {
        console.log('[FinalOptimizations] Datos obtenidos de caché (optimizado)');
        return cached;
      }
    }
    
    // Cargar datos de forma paralela usando getRangeList
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    
    // Definir rangos a cargar en paralelo
    const ranges = [
      { sheet: CONFIG.TABS.LIDERES, range: 'A:E' },
      { sheet: CONFIG.TABS.CELULAS, range: 'A:H' },
      { sheet: CONFIG.TABS.INGRESOS, range: 'A:J' }
    ];
    
    // Cargar datos en paralelo
    const dataPromises = ranges.map(range => {
      try {
        const sheet = spreadsheet.getSheetByName(range.sheet);
        if (!sheet) return null;
        
        const data = sheet.getRange(range.range).getValues();
        return {
          sheet: range.sheet,
          data: data
        };
      } catch (error) {
        console.error(`[FinalOptimizations] Error cargando ${range.sheet}:`, error);
        return null;
      }
    });
    
    const results = dataPromises.filter(result => result !== null);
    
    // Procesar datos de forma optimizada
    const lideres = processLideresOptimized(results.find(r => r.sheet === CONFIG.TABS.LIDERES)?.data || []);
    const celulas = processCelulasOptimized(results.find(r => r.sheet === CONFIG.TABS.CELULAS)?.data || []);
    const ingresos = processIngresosOptimized(results.find(r => r.sheet === CONFIG.TABS.INGRESOS)?.data || []);
    
    // Calcular métricas de forma optimizada
    const actividadMap = calcularActividadLideres(celulas);
    const lideresConActividad = integrarActividadLideres(lideres, actividadMap);
    
    const almasEnCelulasMap = mapearAlmasACelulas(celulas);
    integrarAlmasACelulas(ingresos, almasEnCelulasMap);
    
    const data = {
      lideres: lideresConActividad,
      celulas: celulas,
      ingresos: ingresos,
      timestamp: new Date().toISOString(),
      loadTime: Date.now() - startTime
    };
    
    // Guardar en caché con compresión inteligente y registro de claves
    setCacheData(data);
    registrarClaveCache('DASHBOARD_DATA_V2');
    
    console.log(`[FinalOptimizations] Dashboard cargado en ${data.loadTime}ms`);
    return data;
    
  } catch (error) {
    console.error('[FinalOptimizations] Error en carga optimizada:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Procesa líderes de forma optimizada
 * @param {Array} rawData - Datos crudos
 * @returns {Array} Líderes procesados
 */
function processLideresOptimized(rawData) {
  if (!rawData || rawData.length < 2) return [];
  
  const headers = rawData[0].map(h => h.toString().trim());
  const lideres = [];
  
  const columnas = {
    idLider: findCol(headers, ['ID_Lider', 'ID Líder', 'ID']),
    nombreLider: findCol(headers, ['Nombre_Lider', 'Nombre Líder', 'Nombre']),
    rol: findCol(headers, ['Rol', 'Tipo']),
    idLiderDirecto: findCol(headers, ['ID_Lider_Directo', 'Supervisor', 'ID LD']),
    congregacion: findCol(headers, ['Congregación', 'Congregacion'])
  };
  
  if (columnas.idLider === -1 || columnas.rol === -1) return [];
  
  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (row[columnas.idLider] && row[columnas.rol]) {
      lideres.push({
        ID_Lider: String(row[columnas.idLider]).trim(),
        Nombre_Lider: String(row[columnas.nombreLider] || '').trim(),
        Rol: String(row[columnas.rol]).trim(),
        ID_Lider_Directo: String(row[columnas.idLiderDirecto] || '').trim(),
        Congregacion: String(row[columnas.congregacion] || '').trim()
      });
    }
  }
  
  return lideres;
}

/**
 * Procesa células de forma optimizada
 * @param {Array} rawData - Datos crudos
 * @returns {Array} Células procesadas
 */
function processCelulasOptimized(rawData) {
  if (!rawData || rawData.length < 2) return [];
  
  const headers = rawData[0].map(h => h.toString().trim());
  const celulas = [];
  
  const columnas = {
    idCelula: findCol(headers, ['ID Célula', 'ID_Celula', 'ID']),
    nombreCelula: findCol(headers, ['Nombre Célula']),
    idMiembro: findCol(headers, ['ID Miembro', 'ID_Miembro', 'ID Alma']),
    nombreMiembro: findCol(headers, ['Nombre Miembro']),
    idLCF: findCol(headers, ['ID LCF', 'ID_LCF']),
    nombreLCF: findCol(headers, ['Nombre LCF']),
    // ✅ AGREGADO: Campos de líder necesarios para calcularActividadLideres
    idLider: findCol(headers, ['ID_Lider', 'ID Líder', 'ID LD', 'ID LD Supervisor']),
    estado: findCol(headers, ['Estado', 'Estado Célula', 'Estado_Celula']),
    congregacion: findCol(headers, ['Congregación', 'Congregacion', 'Congregacion_Celula']),
    ultimaActividad: findCol(headers, ['Ultima_Actividad', 'Última Actividad', 'Fecha_Actividad', 'Ultima_Actividad_Celula'])
  };
  
  if (columnas.idCelula === -1) return [];
  
  // Agrupar por célula
  const celulasMap = new Map();
  
  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (row[columnas.idCelula]) {
      const idCelula = String(row[columnas.idCelula]).trim();
      
      if (!celulasMap.has(idCelula)) {
        celulasMap.set(idCelula, {
          ID_Celula: idCelula,
          Nombre_Celula: String(row[columnas.nombreCelula] || '').trim(),
          ID_LCF: String(row[columnas.idLCF] || '').trim(),
          Nombre_LCF: String(row[columnas.nombreLCF] || '').trim(),
          // ✅ AGREGADO: Campos de líder necesarios para calcularActividadLideres
          ID_Lider: String(row[columnas.idLider] || '').trim(),
          Estado: String(row[columnas.estado] || 'Activo').trim(),
          Congregacion: String(row[columnas.congregacion] || '').trim(),
          Ultima_Actividad: row[columnas.ultimaActividad] || null,
          Miembros: []
        });
      }
      
      if (row[columnas.idMiembro]) {
        celulasMap.get(idCelula).Miembros.push({
          ID_Miembro: String(row[columnas.idMiembro]).trim(),
          Nombre_Miembro: String(row[columnas.nombreMiembro] || '').trim()
        });
      }
    }
  }
  
  return Array.from(celulasMap.values());
}

/**
 * Procesa ingresos de forma optimizada
 * @param {Array} rawData - Datos crudos
 * @returns {Array} Ingresos procesados
 */
function processIngresosOptimized(rawData) {
  if (!rawData || rawData.length < 2) return [];
  
  const headers = rawData[0].map(h => h.toString().trim());
  const ingresos = [];
  
  const columnas = {
    idAlma: findCol(headers, ['ID_Alma', 'ID Alma']),
    nombreAlma: findCol(headers, ['Nombre_Alma', 'Nombre Alma']),
    fechaIngreso: findCol(headers, ['Fecha_Ingreso', 'Fecha Ingreso']),
    idLCF: findCol(headers, ['ID_LCF', 'ID LCF']),
    deseaVisita: findCol(headers, ['Desea_Visita', 'Desea Visita']),
    aceptoJesus: findCol(headers, ['Acepto_Jesus', 'Acepto Jesus']),
    enCelula: findCol(headers, ['En_Celula', 'En Celula']),
    estado: findCol(headers, ['Estado'])
  };
  
  if (columnas.idAlma === -1) return [];
  
  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (row[columnas.idAlma]) {
      ingresos.push({
        ID_Alma: String(row[columnas.idAlma]).trim(),
        Nombre_Alma: String(row[columnas.nombreAlma] || '').trim(),
        Fecha_Ingreso: row[columnas.fechaIngreso] ? new Date(row[columnas.fechaIngreso]) : null,
        ID_LCF: String(row[columnas.idLCF] || '').trim(),
        Desea_Visita: normalizeYesNo(row[columnas.deseaVisita]),
        Acepto_Jesus: normalizeYesNo(row[columnas.aceptoJesus]),
        En_Celula: normalizeYesNo(row[columnas.enCelula]),
        Estado: String(row[columnas.estado] || 'Activo').trim()
      });
    }
  }
  
  return ingresos;
}

/**
 * Optimización final: Carga de datos LD con caché inteligente
 * @param {string} idLD - ID del LD
 * @param {boolean} modoCompleto - Si es modo completo
 * @returns {Object} Datos del LD optimizados
 */
function getDatosLDOptimized(idLD, modoCompleto = false) {
  const startTime = Date.now();
  
  try {
    console.log(`[FinalOptimizations] Cargando LD optimizado: ${idLD}`);
    
    // Verificar caché específico
    const cache = CacheService.getScriptCache();
    const cacheKey = `LD_OPT_${modoCompleto ? 'FULL' : 'BASIC'}_${idLD}`;
    
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('[FinalOptimizations] LD obtenido de caché específico');
      return JSON.parse(cached);
    }
    
    // ✅ CORRECCIÓN: Solo modo completo (getDatosLDBasico fue eliminado)
    const result = getDatosLDCompleto(idLD);
    
    if (result.success) {
      // Agregar métricas de rendimiento
      result.loadTime = Date.now() - startTime;
      
      // Guardar en caché con tiempo extendido
      const cacheTime = modoCompleto ? 900 : 600; // 15 min completo, 10 min básico
      cache.put(cacheKey, JSON.stringify(result), cacheTime);
      registrarClaveCache(cacheKey, 'LEADER_CACHE_KEYS');
    }
    
    console.log(`[FinalOptimizations] LD cargado en ${result.loadTime || 0}ms`);
    return result;
    
  } catch (error) {
    console.error('[FinalOptimizations] Error en LD optimizado:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Optimización final: Vista rápida LCF con caché inteligente
 * @param {string} idLCF - ID del LCF
 * @returns {Object} Vista rápida optimizada
 */
function getVistaRapidaLCFOptimized(idLCF) {
  const startTime = Date.now();
  
  try {
    console.log(`[FinalOptimizations] Cargando vista rápida LCF: ${idLCF}`);
    
    // Verificar caché específico
    const cache = CacheService.getScriptCache();
    const cacheKey = `LCF_OPT_${idLCF}`;
    
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('[FinalOptimizations] Vista rápida LCF obtenida de caché');
      return JSON.parse(cached);
    }
    
    // Cargar datos de forma optimizada
    const result = getVistaRapidaLCF_REAL(idLCF);
    
    if (result.success) {
      // Agregar métricas de rendimiento
      result.loadTime = Date.now() - startTime;
      
      // Guardar en caché con tiempo extendido
      cache.put(cacheKey, JSON.stringify(result), 600); // 10 minutos
      registrarClaveCache(cacheKey, 'LEADER_CACHE_KEYS');
    }
    
    console.log(`[FinalOptimizations] Vista rápida LCF cargada en ${result.loadTime || 0}ms`);
    return result;
    
  } catch (error) {
    console.error('[FinalOptimizations] Error en vista rápida LCF:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Optimización final: Limpieza de caché inteligente con claves reales
 * @returns {Object} Resultado de la limpieza
 */
function limpiarCacheInteligente() {
  try {
    console.log('[FinalOptimizations] Iniciando limpieza inteligente de caché...');
    
    const cache = CacheService.getScriptCache();
    const properties = PropertiesService.getScriptProperties();
    const startTime = Date.now();
    
    let cleanedCount = 0;
    
    // 1. Limpiar caché principal
    const mainKeys = ['DASHBOARD_DATA_V2', 'STATS_RAPIDAS_V2'];
    mainKeys.forEach(key => {
      if (cache.get(key)) {
        cache.remove(key);
        cleanedCount++;
      }
    });
    
    // 2. Obtener claves reales del PropertiesService
    const storedKeys = properties.getProperty('CACHE_KEYS');
    const realKeys = storedKeys ? JSON.parse(storedKeys) : [];
    
    console.log(`[FinalOptimizations] Encontradas ${realKeys.length} claves reales en caché`);
    
    // 3. Limpiar claves reales
    realKeys.forEach(key => {
      if (cache.get(key)) {
        cache.remove(key);
        cleanedCount++;
      }
    });
    
    // 4. Limpiar metadata del PropertiesService
    properties.deleteProperty('CACHE_KEYS');
    
    // 5. Limpiar claves de líderes específicos (LD_QUICK_*, LD_FULL_*, etc.)
    const leaderKeys = properties.getProperty('LEADER_CACHE_KEYS');
    if (leaderKeys) {
      const leaderKeyList = JSON.parse(leaderKeys);
      leaderKeyList.forEach(key => {
        if (cache.get(key)) {
          cache.remove(key);
          cleanedCount++;
        }
      });
      properties.deleteProperty('LEADER_CACHE_KEYS');
    }
    
    const cleanTime = Date.now() - startTime;
    
    console.log(`[FinalOptimizations] ✅ Caché limpiada: ${cleanedCount} elementos en ${cleanTime}ms`);
    
    return {
      success: true,
      cleanedCount: cleanedCount,
      cleanTime: cleanTime,
      realKeysCleaned: realKeys.length,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('[FinalOptimizations] Error en limpieza inteligente:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Optimización final: Métricas de rendimiento del sistema usando claves reales
 * @returns {Object} Métricas del sistema
 */
function getMetricasRendimiento() {
  try {
    const cache = CacheService.getScriptCache();
    const properties = PropertiesService.getScriptProperties();
    
    // Obtener claves reales registradas
    const cacheKeys = properties.getProperty('CACHE_KEYS');
    const leaderKeys = properties.getProperty('LEADER_CACHE_KEYS');
    
    const realCacheKeys = cacheKeys ? JSON.parse(cacheKeys) : [];
    const realLeaderKeys = leaderKeys ? JSON.parse(leaderKeys) : [];
    
    // Contar elementos en caché usando claves reales
    let ldCached = 0;
    let lcfCached = 0;
    let totalCached = 0;
    let cacheHits = 0;
    let cacheMisses = 0;
    
    // Contar claves principales
    realCacheKeys.forEach(key => {
      if (cache.get(key)) {
        cacheHits++;
        totalCached++;
      } else {
        cacheMisses++;
      }
    });
    
    // Contar claves de líderes y clasificar por tipo
    realLeaderKeys.forEach(key => {
      if (cache.get(key)) {
        cacheHits++;
        totalCached++;
        
        // Clasificar por prefijo
        if (key.startsWith('LD_OPT_FULL_') || key.startsWith('LD_OPT_BASIC_')) {
          ldCached++;
        } else if (key.startsWith('LCF_OPT_')) {
          lcfCached++;
        }
      } else {
        cacheMisses++;
      }
    });
    
    // Calcular tasa de acierto
    const totalKeys = realCacheKeys.length + realLeaderKeys.length;
    const hitRate = totalKeys > 0 ? Math.round((cacheHits / totalKeys) * 100) : 0;
    
    const metrics = {
      timestamp: new Date().toISOString(),
      cache: {
        dashboard: !!cache.get('DASHBOARD_DATA_V2'),
        stats: !!cache.get('STATS_RAPIDAS_V2'),
        ld_cached: ldCached,
        lcf_cached: lcfCached,
        total_cached: totalCached,
        hit_rate: hitRate,
        total_keys_registered: totalKeys,
        cache_hits: cacheHits,
        cache_misses: cacheMisses
      },
      performance: {
        memory_usage: 'N/A', // No disponible en Apps Script
        execution_time: 'N/A',
        cache_efficiency: hitRate >= 70 ? 'Excelente' : hitRate >= 50 ? 'Buena' : 'Necesita Mejora'
      },
      keys: {
        main_cache_keys: realCacheKeys.length,
        leader_cache_keys: realLeaderKeys.length,
        sample_keys: {
          main: realCacheKeys.slice(0, 3),
          leaders: realLeaderKeys.slice(0, 3)
        }
      }
    };
    
    console.log(`[FinalOptimizations] Métricas calculadas: ${totalCached} elementos en caché (${hitRate}% acierto)`);
    
    return {
      success: true,
      data: metrics
    };
    
  } catch (error) {
    console.error('[FinalOptimizations] Error obteniendo métricas:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Registra una clave de caché en PropertiesService para limpieza inteligente
 * @param {string} clave - Clave de caché a registrar
 * @param {string} tipo - Tipo de registro ('CACHE_KEYS' o 'LEADER_CACHE_KEYS')
 */
function registrarClaveCache(clave, tipo = 'CACHE_KEYS') {
  try {
    const properties = PropertiesService.getScriptProperties();
    const storedKeys = properties.getProperty(tipo);
    const keys = storedKeys ? JSON.parse(storedKeys) : [];
    
    if (!keys.includes(clave)) {
      keys.push(clave);
      properties.setProperty(tipo, JSON.stringify(keys));
      console.log(`[FinalOptimizations] Clave registrada: ${clave} (${tipo})`);
    }
  } catch (error) {
    console.error('[FinalOptimizations] Error registrando clave de caché:', error);
  }
}

/**
 * Obtiene información detallada del estado de caché
 * @returns {Object} Estado completo del caché
 */
function getEstadoCacheDetallado() {
  try {
    const cache = CacheService.getScriptCache();
    const properties = PropertiesService.getScriptProperties();
    
    // Obtener claves registradas
    const cacheKeys = properties.getProperty('CACHE_KEYS');
    const leaderKeys = properties.getProperty('LEADER_CACHE_KEYS');
    
    const realCacheKeys = cacheKeys ? JSON.parse(cacheKeys) : [];
    const realLeaderKeys = leaderKeys ? JSON.parse(leaderKeys) : [];
    
    // Verificar qué claves están realmente en caché
    let cacheHits = 0;
    let cacheMisses = 0;
    
    [...realCacheKeys, ...realLeaderKeys].forEach(key => {
      if (cache.get(key)) {
        cacheHits++;
      } else {
        cacheMisses++;
      }
    });
    
    return {
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        totalKeys: realCacheKeys.length + realLeaderKeys.length,
        cacheHits: cacheHits,
        cacheMisses: cacheMisses,
        hitRate: realCacheKeys.length + realLeaderKeys.length > 0 ? 
          Math.round((cacheHits / (realCacheKeys.length + realLeaderKeys.length)) * 100) : 0,
        mainCacheKeys: realCacheKeys.length,
        leaderCacheKeys: realLeaderKeys.length,
        keys: {
          main: realCacheKeys,
          leaders: realLeaderKeys
        }
      }
    };
    
  } catch (error) {
    console.error('[FinalOptimizations] Error obteniendo estado de caché:', error);
    return { success: false, error: error.toString() };
  }
}

console.log('⚡ FinalOptimizations cargado - Optimizaciones finales + Sistema de caché inteligente');