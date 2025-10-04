/**
 * @fileoverview Módulo unificado del core del sistema.
 * Combina EstructuraModule y FuncionesCriticas en un solo módulo central.
 */

// ==================== FUNCIONES DE CONSTRUCCIÓN DE ESTRUCTURAS ====================

/**
 * Construye la estructura básica de un LD (implementación exacta del original).
 * @param {string} idLD - ID del LD
 * @param {Array} data - Datos de líderes
 * @returns {Object} Estructura básica del LD
 */
function construirEstructuraLD(idLD, data) {
  const misLM = data.filter(r => r[2] === 'LM' && r[3] === idLD);
  const misSG = data.filter(r => r[2] === 'SMALL GROUP' && r[3] === idLD);
  const misLCF = data.filter(r => r[2] === 'LCF' && r[3] === idLD);
  
  const lm = misLM.map(lmRow => ({
    ID_Lider: lmRow[0],
    Nombre_Lider: lmRow[1] || 'Sin Nombre',  // Validación para evitar undefined
    Rol: lmRow[2],
    Estado_Actividad: lmRow[4] || 'Sin Datos'
  }));
  
  const smallGroups = misSG.map(sgRow => ({
    ID_Lider: sgRow[0],
    Nombre_Lider: sgRow[1] || 'Sin Nombre',  // Validación para evitar undefined
    Rol: sgRow[2],
    Estado_Actividad: sgRow[4] || 'Sin Datos'
  }));
  
  const lcfDirectos = misLCF.map(lcfRow => ({
    ID_Lider: lcfRow[0],
    Nombre_Lider: lcfRow[1] || 'Sin Nombre',  // Validación para evitar undefined
    Rol: lcfRow[2],
    Estado_Actividad: 'Activo'  // No hay columna de estado en la hoja de líderes
  }));
  
  return { lm, smallGroups, lcfDirectos };
}

/**
 * Construye la estructura completa de un LD con datos reales.
 * @param {string} idLD - ID del LD
 * @param {Array} lideres - Array de líderes
 * @param {Object} dataCompleta - Datos completos del directorio
 * @returns {Object} Estructura completa del LD
 */
function construirEstructuraCompleta(idLD, lideres, dataCompleta, ingresosIndex) {
  const { celulas } = dataCompleta;
  
  const lcfBajoLD = lideres.filter(l => l.ID_Lider_Directo === idLD && l.Rol === 'LCF');
  
  const estructuraCompleta = lcfBajoLD.map(lcf => {
    const celulasDelLCF = celulas.filter(c => c.ID_LCF_Responsable === lcf.ID_Lider);
    const data = ingresosIndex[lcf.ID_Lider] || { ingresos: [], total: 0, cantidad: 0 };
    const ingresosAsignados = data.ingresos.filter(i => i.Estado_Asignacion === 'Asignado').length;
    const ingresosEnCelula = data.ingresos.filter(i => i.En_Celula).length;
    
    return {
      ID_Lider: lcf.ID_Lider,
      Nombre_Lider: lcf.Nombre_Lider,
      Rol: lcf.Rol,
      Estado_Actividad: lcf.Estado_Actividad,
      Celulas: celulasDelLCF.length,
      Miembros: celulasDelLCF.reduce((sum, c) => sum + obtenerTotalMiembros(c), 0),
      Ingresos: data.cantidad,
      Ingresos_Asignados: ingresosAsignados,
      Ingresos_En_Celula: ingresosEnCelula
    };
  });
  
  return estructuraCompleta;
}

/**
 * Calcula métricas reales para un LD basándose en datos reales.
 * @param {string} idLD - ID del LD
 * @param {Object} estructuraCompleta - Estructura completa del LD
 * @param {Object} dataCompleta - Datos completos del directorio
 * @returns {Object} Métricas calculadas
 */
function calcularMetricasRealesLD(idLD, estructuraCompleta, dataCompleta) {
  const { celulas, ingresos } = dataCompleta;
  
  const totalCelulas = estructuraCompleta.reduce((sum, lcf) => sum + lcf.Celulas, 0);
  const totalMiembros = estructuraCompleta.reduce((sum, lcf) => sum + lcf.Miembros, 0);
  const totalIngresos = estructuraCompleta.reduce((sum, lcf) => sum + lcf.Ingresos, 0);
  const totalIngresosAsignados = estructuraCompleta.reduce((sum, lcf) => sum + lcf.Ingresos_Asignados, 0);
  const totalIngresosEnCelula = estructuraCompleta.reduce((sum, lcf) => sum + lcf.Ingresos_En_Celula, 0);
  
  return {
    totalLCF: estructuraCompleta.length,
    totalCelulas: totalCelulas,
    totalMiembros: totalMiembros,
    totalIngresos: totalIngresos,
    totalIngresosAsignados: totalIngresosAsignados,
    totalIngresosEnCelula: totalIngresosEnCelula,
    promedioMiembrosPorCelula: totalCelulas > 0 ? (totalMiembros / totalCelulas).toFixed(1) : 0,
    tasaAsignacion: totalIngresos > 0 ? ((totalIngresosAsignados / totalIngresos) * 100).toFixed(1) : 0,
    tasaIntegracionCelula: totalIngresos > 0 ? ((totalIngresosEnCelula / totalIngresos) * 100).toFixed(1) : 0
  };
}

// ==================== FUNCIONES CRÍTICAS DE ALTO NIVEL ====================

/**
 * Carga el directorio completo con caché y procesamiento de actividad.
 * Esta es la función más crítica de toda la aplicación.
 * @param {boolean} forceReload - Si true, ignora caché y recarga datos
 * @returns {Object} Objeto con líderes, células, ingresos y timestamp
 */
function cargarDirectorioCompleto(forceReload = false) {
  const startTime = Date.now();
  console.log('[CoreModule] 🚀 cargarDirectorioCompleto OPTIMIZADO iniciado, forceReload:', forceReload);
  
  if (forceReload) {
    console.log('[CoreModule] Limpiando caché...');
    clearCache();
  } else {
    console.log('[CoreModule] Verificando caché fragmentada...');
    const cachedData = getCacheData();
    if (cachedData) {
      const cacheTime = Date.now() - startTime;
      console.log(`[CoreModule] ✅ Directorio completo obtenido de caché en ${cacheTime}ms`);
      return cachedData;
    }
    console.log('[CoreModule] No hay datos en caché, cargando desde Sheets...');
  }

  console.log('[CoreModule] Cargando datos de DIRECTORIO desde Google Sheets...');
  try {
    checkTimeout();
    
    // ✅ OPTIMIZACIÓN: Abrir spreadsheet UNA SOLA VEZ usando Singleton
    const spreadsheet = getSpreadsheetManager().getSpreadsheet(CONFIG.SHEETS.DIRECTORIO);
    const ssOpenTime = Date.now() - startTime;
    console.log(`[CoreModule] Spreadsheet abierto (Singleton) en ${ssOpenTime}ms`);
    
    // USAR FUNCIONES OPTIMIZADAS
    const lideresStart = Date.now();
    const lideres = cargarLideresOptimizado(spreadsheet);
    const lideresTime = Date.now() - lideresStart;
    console.log(`[CoreModule] ✅ Líderes cargados: ${lideres ? lideres.length : 0} en ${lideresTime}ms`);
    
    const celulasStart = Date.now();
    const celulas = cargarCelulasOptimizado(spreadsheet);
    const celulasTime = Date.now() - celulasStart;
    console.log(`[CoreModule] ✅ Células cargadas: ${celulas ? celulas.length : 0} en ${celulasTime}ms`);
    
    const ingresosStart = Date.now();
    const ingresos = cargarIngresosOptimizado(spreadsheet);
    const ingresosTime = Date.now() - ingresosStart;
    console.log(`[CoreModule] ✅ Ingresos cargados: ${ingresos ? ingresos.length : 0} en ${ingresosTime}ms`);

    // OPTIMIZACIÓN 2: Procesamiento mínimo y eficiente
    const procesamientoStart = Date.now();
    
    // ✅ NUEVO: Cargar estados y perfiles de líderes desde _EstadoLideres
    let lideresConPerfil = lideres || [];
    if (lideres && lideres.length > 0) {
      const estadosMap = cargarEstadoLideres(spreadsheet);
      lideresConPerfil = integrarPerfilesLideres(lideres, estadosMap);
    }
    
    if (celulas && ingresos && celulas.length > 0 && ingresos.length > 0) {
    const almasEnCelulasMap = mapearAlmasACelulas(celulas);
    integrarAlmasACelulas(ingresos, almasEnCelulasMap);
    }
    
    const procesamientoTime = Date.now() - procesamientoStart;
    console.log(`[CoreModule] ✅ Procesamiento completado en ${procesamientoTime}ms`);

    const data = {
      lideres: lideresConPerfil,
      celulas: celulas || [],
      ingresos: ingresos || [],
      timestamp: new Date().toISOString()
    };

    // OPTIMIZACIÓN 3: Usar sistema de caché fragmentado
    const cacheStart = Date.now();
    setCacheData(data);
    const cacheTime = Date.now() - cacheStart;
    console.log(`[CoreModule] ✅ Datos cacheados en ${cacheTime}ms`);
    
    const totalTime = Date.now() - startTime;
    console.log(`[CoreModule] 🎉 Directorio completo cargado en ${totalTime}ms`);
    console.log(`[CoreModule] 📊 Desglose: Líderes(${lideresTime}ms) + Células(${celulasTime}ms) + Ingresos(${ingresosTime}ms) + Procesamiento(${procesamientoTime}ms) + Caché(${cacheTime}ms)`);
    
    return data;

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[CoreModule] ❌ Error cargando directorio completo en ${totalTime}ms:`, error);
    return { 
      lideres: [], 
      celulas: [], 
      ingresos: [], 
      error: error.toString(),
      tiempo: totalTime
    };
  }
}

/**
 * Obtiene una lista de líderes (solo LDs) para selectores de UI.
 * VERSIÓN OPTIMIZADA: Intenta usar caché antes de abrir spreadsheet
 * @param {Object} spreadsheet - (Opcional) Objeto spreadsheet ya abierto para reutilizar
 * @returns {Object} Objeto con éxito y datos de líderes
 */
function getListaDeLideres(spreadsheet) {
  // 🚀 IMPLEMENTACIÓN OPTIMIZADA - Usar hoja de líderes existente
  const startTime = Date.now();
  console.log('[CoreModule] 🚀 getListaDeLideres OPTIMIZADO - Usando hoja existente...');
  
  try {
    // Verificar caché primero
    const cache = CacheService.getScriptCache();
    const cachedList = cache.get('LIDERES_OPTIMIZED_EXISTENTES_V1');
    
    if (cachedList) {
      const cacheTime = Date.now() - startTime;
      console.log(`[CoreModule] ✅ Cache HIT - ${cacheTime}ms`);
      return JSON.parse(cachedList);
    }
    
    // Usar la hoja de líderes EXISTENTE
    const ss = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    const sheet = ss.getSheetByName(CONFIG.TABS.LIDERES);
    
    if (!sheet) {
      throw new Error(`Hoja ${CONFIG.TABS.LIDERES} no encontrada`);
    }
    
    // Verificar que la hoja tiene datos
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      console.log('[CoreModule] ⚠️ No hay datos en la hoja de líderes');
      return { success: true, data: [] };
    }
    
    // Solo columnas A (ID) y B (Nombre), saltando el header
    // Asumiendo que la estructura es: A=ID_Lider, B=Nombre_Lider, C=Rol
    const datos = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
    
    const lista = datos
      .filter(row => row[0] && row[1] && row[2] === 'LD') // Solo líderes LD
      .map(row => ({
        ID_Lider: row[0],
        Nombre_Lider: row[1]
      }));
    
    const result = {
      success: true,
      data: lista,
      timestamp: new Date().toISOString()
    };
    
    // Caché por 15 minutos
    cache.put('LIDERES_OPTIMIZED_EXISTENTES_V1', JSON.stringify(result), 900);
    
    const totalTime = Date.now() - startTime;
    console.log(`[CoreModule] ✅ Completado en ${totalTime}ms - ${lista.length} líderes`);
    
    return result;
    
  } catch (error) {
    console.error(`[CoreModule] ❌ Error en getListaDeLideres: ${error}`);
    return { success: false, error: error.toString(), data: [] };
  }
}

/**
 * Obtiene datos de ingresos para un LCF específico, con caché.
 * @param {string} lcfId - ID del LCF
 * @returns {Array<Object>} Array de objetos de ingresos
 */
function getIngresosData(lcfId) {
  try {
    console.log(`[CoreModule] Obteniendo ingresos para LCF: ${lcfId}`);
    const cache = CacheService.getScriptCache();
    const cacheKey = `INGRESOS_LCF_${lcfId}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log(`[CoreModule] [CACHE HIT] Ingresos para ${lcfId}`);
      return JSON.parse(cached);
    }
    
    const spreadsheetId = (typeof CONFIG !== 'undefined' && CONFIG.SHEETS && CONFIG.SHEETS.DIRECTORIO) ? CONFIG.SHEETS.DIRECTORIO : '1dwuqpyMXWHJvnJHwDHCqFMvgdYhypE2W1giH6bRZMKc';
    const spreadsheet = getSpreadsheetManager().getSpreadsheet(spreadsheetId);
    const sheetName = (typeof CONFIG !== 'undefined' && CONFIG.TABS && CONFIG.TABS.INGRESOS) ? CONFIG.TABS.INGRESOS : 'Ingresos';
    const sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet || sheet.getLastRow() < 2) {
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0].map(h => h.toString().trim());
    
    const colIDLCF = findCol(headers, ['ID_LCF', 'ID LCF']);
    if (colIDLCF === -1) {
      console.error('[CoreModule] No se encontró columna ID_LCF en Ingresos');
      return [];
    }
    
    const ingresosLCF = [];
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][colIDLCF]).trim() === lcfId) {
        const ingreso = {};
        headers.forEach((header, index) => {
          ingreso[header] = data[i][index];
        });
        ingresosLCF.push(ingreso);
      }
    }
    
    cache.put(cacheKey, JSON.stringify(ingresosLCF), 300);
    
    console.log(`[CoreModule] ${ingresosLCF.length} ingresos encontrados para LCF ${lcfId}`);
    return ingresosLCF;
    
  } catch (error) {
    console.error('[CoreModule] Error en getIngresosData:', error);
    return [];
  }
}

// ==================== SISTEMA DE CARGA SELECTIVA (OPTIMIZADO) ====================

/**
 * Carga el maestro de asistentes de forma selectiva por IDs de almas.
 * @param {Set<string>} idsAlmas - Conjunto de IDs de almas para filtrar
 * @returns {Array<Object>} Lista de objetos de asistentes
 */
function cargarMaestroAsistentesSelectivo(idsAlmas) {
  console.log('[CoreModule] ⚠️ cargarMaestroAsistentesSelectivo simplificado - retornando array vacío');
  return []; // ✅ SIMPLIFICADO: No usamos libros externos
}

/**
 * Carga interacciones de seguimiento de forma selectiva por IDs de almas.
 * @param {Set<string>} idsAlmas - Conjunto de IDs de almas para filtrar
 * @returns {Array<Object>} Lista de objetos de interacciones
 */
function cargarInteraccionesSelectivo(idsAlmas) {
  console.log('[CoreModule] ⚠️ cargarInteraccionesSelectivo simplificado - retornando array vacío');
  return []; // ✅ SIMPLIFICADO: No usamos libros externos
}

/**
 * Carga visitas de bendición de forma selectiva por IDs de almas.
 * @param {Set<string>} idsAlmas - Conjunto de IDs de almas para filtrar
 * @returns {Array<Object>} Lista de objetos de visitas
 */
function cargarVisitasBendicionSelectivo(idsAlmas) {
  console.log('[CoreModule] ⚠️ cargarVisitasBendicionSelectivo simplificado - retornando array vacío');
  return []; // ✅ SIMPLIFICADO: No usamos libros externos
}

// ==================== CÁLCULO DE ACTIVIDAD DE LÍDERES ====================

/**
 * Calcula la actividad de líderes usando _SeguimientoConsolidado (versión optimizada).
 * @param {Array<Object>} celulas - Array de células (no se usa en esta versión)
 * @returns {Map<string, Date>} Mapa de ID_Lider a última fecha de actividad
 */
/**
 * Carga los estados y perfiles de líderes desde la hoja _EstadoLideres
 * ✅ OPTIMIZADO: Lee datos pre-calculados, sin procesamiento en tiempo real
 * @param {Object} spreadsheet - (Opcional) Objeto spreadsheet ya abierto
 * @returns {Map<string, Object>} Mapa de ID_Lider a datos de perfil
 */
function cargarEstadoLideres(spreadsheet) {
  console.log('[CoreModule] Cargando estados de líderes desde _EstadoLideres...');
  
  const estadosMap = new Map();
  
  // Cache de resultados
  const cacheKey = 'ESTADO_LIDERES_CACHE';
    const cache = CacheService.getScriptCache();
    const cached = cache.get(cacheKey);
  
    if (cached) {
    console.log('[CoreModule] ✅ Usando estados desde caché');
    const data = JSON.parse(cached);
    return new Map(data);
  }
  
  try {
    // Reutilizar spreadsheet si se proporcionó, sino abrir uno nuevo
    if (!spreadsheet) {
      spreadsheet = getSpreadsheetManager().getSpreadsheet(CONFIG.SHEETS.DIRECTORIO);
    }
    
    const sheet = spreadsheet.getSheetByName(CONFIG.TABS.ESTADO_LIDERES);
    
    if (!sheet) {
      console.warn('[CoreModule] ⚠️ Hoja _EstadoLideres no encontrada');
      return estadosMap;
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      console.log('[CoreModule] ⚠️ Hoja _EstadoLideres vacía');
      return estadosMap;
    }
    
    // Leer datos: A2:I (ID_Lider a Perfil_Lider) - ✅ TODAS las columnas
    const data = getOptimizedRange(sheet, 5000, 2, 1, 9);
    console.log(`[CoreModule] 📊 Procesando ${data.length} líderes de _EstadoLideres`);
    
    data.forEach(row => {
      const idLider = String(row[0] || '').trim(); // Columna A: ID_Lider
      
      if (idLider) {
        // ✅ CORRECCIÓN: Manejar correctamente el valor 0 (reportó hoy)
        const diasSinActividadRaw = row[2]; // Columna C: Días sin Actividad (REAL)
        let diasSinActividad = null;
        
        if (diasSinActividadRaw !== null && diasSinActividadRaw !== undefined && diasSinActividadRaw !== '') {
          diasSinActividad = parseInt(diasSinActividadRaw);
          // Si parseInt falla, será NaN, lo convertimos a null
          if (isNaN(diasSinActividad)) {
            diasSinActividad = null;
          }
        }
        
        // Calcular Ultima_Actividad basado en Días sin Actividad REALES
        let ultimaActividad = null;
        if (diasSinActividad !== null && diasSinActividad >= 0) {
          const hoy = new Date();
          ultimaActividad = new Date(hoy);
          ultimaActividad.setDate(hoy.getDate() - diasSinActividad);
        }
        
        estadosMap.set(idLider, {
          ID_Lider: idLider,
          Nombre_Lider: String(row[1] || '').trim(),
          Dias_Inactivo: diasSinActividad, // ✅ Columna C - DATO REAL
          Ultima_Actividad: ultimaActividad ? ultimaActividad.toISOString() : null,
          Recibiendo_Celula: parseInt(row[3]) || 0, // Columna D
          Visitas_Positivas: parseInt(row[4]) || 0, // Columna E
          Visitas_No_Positivas: parseInt(row[5]) || 0, // Columna F
          Llamadas_Realizadas: parseInt(row[6]) || 0, // Columna G
          IDP: parseInt(row[7]) || 0, // Columna H
          Perfil_Lider: String(row[8] || '🌱 EN DESARROLLO').trim() // Columna I
        });
      }
    });
    
    console.log(`[CoreModule] ✅ Estados cargados para ${estadosMap.size} líderes`);
    
    // Guardar en caché (convertir Map a Array para serialización)
    const estadosArray = Array.from(estadosMap.entries());
    cache.put(cacheKey, JSON.stringify(estadosArray), 600); // 10 minutos
    
  } catch (error) {
    console.error('[CoreModule] ❌ Error cargando estados de líderes:', error);
  }
  
  return estadosMap;
}

/**
 * Integra los perfiles de líderes en la lista de líderes
 * ✅ OPTIMIZADO: Usa datos pre-calculados de _EstadoLideres
 * @param {Array<Object>} lideres - Array de líderes
 * @param {Map<string, Object>} estadosMap - Mapa de estados de líderes
 * @returns {Array<Object>} Array de líderes con perfiles integrados
 */
function integrarPerfilesLideres(lideres, estadosMap) {
  return lideres.map(lider => {
    const estadoData = estadosMap.get(lider.ID_Lider);
    
    if (estadoData) {
      return {
        ...lider,
        Dias_Inactivo: estadoData.Dias_Inactivo, // ✅ Días sin actividad REALES
        Ultima_Actividad: estadoData.Ultima_Actividad, // ✅ Calculado desde días reales
        Recibiendo_Celula: estadoData.Recibiendo_Celula,
        Visitas_Positivas: estadoData.Visitas_Positivas,
        Visitas_No_Positivas: estadoData.Visitas_No_Positivas,
        Llamadas_Realizadas: estadoData.Llamadas_Realizadas,
        IDP: estadoData.IDP,
        Perfil_Lider: estadoData.Perfil_Lider,
        Estado_Actividad: estadoData.Perfil_Lider // Compatibilidad con código existente
      };
    } else {
      // Si no hay datos en _EstadoLideres, asignar perfil por defecto
      return {
        ...lider,
        Dias_Inactivo: null,
        Ultima_Actividad: null,
        Recibiendo_Celula: 0,
        Visitas_Positivas: 0,
        Visitas_No_Positivas: 0,
        Llamadas_Realizadas: 0,
        IDP: 0,
        Perfil_Lider: '🌱 EN DESARROLLO',
        Estado_Actividad: '🌱 EN DESARROLLO'
      };
    }
  });
}

// ✅ ELIMINADAS: calcularDiasInactividadEquipo() e integrarDiasInactividad()
// Ya no son necesarias porque TODO viene de _EstadoLideres con datos REALES

// ==================== GESTIÓN DE DATOS DE LD ====================

/**
 * Obtiene los datos de un Líder de Discípulos (LD) en modo básico o completo.
 * @param {string} idLD - ID del LD
 * @param {boolean} modoCompleto - Si es true, carga datos completos
 * @returns {Object} Objeto con los datos del LD
 */
function getDatosLD(idLD, modoCompleto = true) {
  try {
    // ❌ ELIMINADO: Rama modoCompleto=false - Nunca se ejecuta (siempre se pasa true)
    
    // Reiniciar timeout para operaciones largas
    resetTimeout();
    
    if (!idLD) {
      console.log('[CoreModule] getDatosLD llamado sin ID');
      return { success: false, error: 'No se proporcionó ID del LD' };
    }
    
    console.log(`[CoreModule] getDatosLD para: ${idLD} (modo completo)`);
    
    const cache = CacheService.getScriptCache();
    const cacheKey = `LD_FULL_${idLD}`;
    
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('[CoreModule] Datos de LD obtenidos de caché.');
      return JSON.parse(cached);
    }
    
    // ✅ SIMPLIFICADO: Solo modo completo (siempre se usa)
    const result = getDatosLDCompleto(idLD);
    
    if (result.success) {
      const tiempoCache = 600; // 10 min (solo modo completo)
      cache.put(cacheKey, JSON.stringify(result), tiempoCache);
    }
    
    return result;
    
  } catch (error) {
    console.error('[ERROR] en getDatosLD:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Obtiene los datos básicos de un LD.
 * @param {string} idLD - ID del LD
 * @returns {Object} Objeto con los datos básicos del LD
 */
function getDatosLDBasico(idLD) {
  checkTimeout();
  console.log('[CoreModule] Cargando modo básico para LD:', idLD);
  
  const spreadsheet = getSpreadsheetManager().getSpreadsheet(CONFIG.SHEETS.DIRECTORIO);
  const sheet = spreadsheet.getSheetByName(CONFIG.TABS.LIDERES);
    const data = getOptimizedRange(sheet, 5000, 2, 1, 5);
  
  const ldRow = data.find(row => String(row[0]).trim() === idLD && String(row[2]).trim() === 'LD');
  if (!ldRow) {
    return { success: false, error: 'LD no encontrado' };
  }
  
  const ldInfo = {
    ID: String(ldRow[0]).trim(),
    Nombre: String(ldRow[1]).trim(),
    Estado: String(ldRow[4] || 'Activo').trim()
  };
  
  const estructura = construirEstructuraLD(idLD, data);
  
  return {
    success: true,
    resumen: {
      ld: ldInfo,
      estructura: {
        total_lm: estructura.lm.length,
        total_small_groups: estructura.smallGroups.length,
        total_lcf: estructura.lcfDirectos.length
      }
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Obtiene los datos completos de un LD, incluyendo LCFs, células e ingresos.
 * @param {string} idLD - ID del LD
 * @returns {Object} Objeto con los datos completos del LD
 */
function getDatosLDCompleto(idLD) {
  checkTimeout();
  console.log('[CoreModule] Cargando modo completo para LD:', idLD);
  
  const dataCompleta = cargarDirectorioCompleto();
  if (!dataCompleta || !dataCompleta.lideres) {
    return { success: false, error: 'Datos del directorio no válidos o error en carga' };
  }
  
  const { lideres, ingresos, celulas } = dataCompleta;
  
  const ld = lideres.find(l => l?.ID_Lider === idLD && l?.Rol === 'LD');
  if (!ld) {
    return { success: false, error: `LD ${idLD} no encontrado` };
  }

  const almasPorLCF = new Map();
  for (const ingreso of ingresos) {
    if (ingreso.ID_LCF) {
      if (!almasPorLCF.has(ingreso.ID_LCF)) {
        almasPorLCF.set(ingreso.ID_LCF, []);
      }
      almasPorLCF.get(ingreso.ID_LCF).push(ingreso);
    }
  }

  const celulasPorLCF = new Map();
  for (const celula of celulas) {
    if (celula.ID_LCF_Responsable) {
      if (!celulasPorLCF.has(celula.ID_LCF_Responsable)) {
        celulasPorLCF.set(celula.ID_LCF_Responsable, []);
      }
      celulasPorLCF.get(celula.ID_LCF_Responsable).push(celula);
    }
  }
  
  // ✅ CORRECCIÓN: Obtener TODOS los LCF de la red completa (directos + en cadenas)
  // Función recursiva para obtener todos los LCF de la red
  function obtenerTodosLCFDeRed(idSuperior, lideresArray) {
    const lcfsEncontrados = [];
    
    // 1. LCF directos
    const lcfsDirectos = lideresArray.filter(l => l.ID_Lider_Directo === idSuperior && l.Rol === 'LCF');
    lcfsEncontrados.push(...lcfsDirectos);
    
    // 2. LM que reportan a este superior
    const lms = lideresArray.filter(l => l.ID_Lider_Directo === idSuperior && l.Rol === 'LM');
    lms.forEach(lm => {
      lcfsEncontrados.push(...obtenerTodosLCFDeRed(lm.ID_Lider, lideresArray));
    });
    
    // 3. Small Groups que reportan a este superior
    const sgs = lideresArray.filter(l => l.ID_Lider_Directo === idSuperior && l.Rol === 'SMALL GROUP');
    sgs.forEach(sg => {
      lcfsEncontrados.push(...obtenerTodosLCFDeRed(sg.ID_Lider, lideresArray));
    });
    
    return lcfsEncontrados;
  }
  
  // Obtener TODOS los LCF de toda la red del LD
  const todosLCFDeRed = obtenerTodosLCFDeRed(idLD, lideres);
  
  console.log(`[CoreModule] ✅ Total LCF en la red del LD: ${todosLCFDeRed.length}`);
  
  const lcfBajoLD = todosLCFDeRed
    .map(lcf => {
      const susCelulas = celulasPorLCF.get(lcf.ID_Lider) || [];
      const susIngresos = almasPorLCF.get(lcf.ID_Lider) || [];
      
      return {
        ID_Lider: lcf.ID_Lider,
        Nombre_Lider: lcf.Nombre_Lider || 'Sin Nombre',
        Rol: lcf.Rol,
        Estado_Actividad: (lcf.Estado_Actividad && lcf.Estado_Actividad !== '-') ? lcf.Estado_Actividad : lcf.Perfil_Lider || 'Activo',
        Perfil_Lider: lcf.Perfil_Lider || '🌱 EN DESARROLLO', // ✅ De _EstadoLideres
        IDP: lcf.IDP || 0, // ✅ De _EstadoLideres
        Dias_Inactivo: lcf.Dias_Inactivo, // ✅ De _EstadoLideres (DATO REAL)
        Ultima_Actividad: lcf.Ultima_Actividad, // ✅ De _EstadoLideres (calculado desde días reales)
        Recibiendo_Celula: lcf.Recibiendo_Celula || 0, // ✅ De _EstadoLideres
        Visitas_Positivas: lcf.Visitas_Positivas || 0, // ✅ De _EstadoLideres
        Visitas_No_Positivas: lcf.Visitas_No_Positivas || 0, // ✅ De _EstadoLideres
        Llamadas_Realizadas: lcf.Llamadas_Realizadas || 0, // ✅ De _EstadoLideres
        Celulas: susCelulas.length,
        Miembros: susCelulas.reduce((sum, c) => sum + obtenerTotalMiembros(c), 0),
        Ingresos: susIngresos.length,
        Ingresos_Asignados: susIngresos.filter(i => i.Estado_Asignacion === 'Asignado').length,
        Ingresos_En_Celula: susIngresos.filter(i => i.En_Celula).length,
        metricas: {
          total_almas: susIngresos.length,
          almas_en_celula: susIngresos.filter(i => i.En_Celula).length,
          almas_sin_celula: susIngresos.filter(i => !i.En_Celula).length,
          tasa_integracion: susIngresos.length > 0 ? ((susIngresos.filter(i => i.En_Celula).length / susIngresos.length) * 100).toFixed(1) : 0,
          carga_trabajo: susIngresos.length >= 36 ? 'Muy Alta' : susIngresos.length >= 26 ? 'Alta' : susIngresos.length >= 16 ? 'Media' : 'Baja'
        }
      };
    });

  // Calcular métricas totales
  const totalCelulas = lcfBajoLD.reduce((sum, lcf) => sum + lcf.Celulas, 0);
  const totalMiembros = lcfBajoLD.reduce((sum, lcf) => sum + lcf.Miembros, 0);
  const totalIngresos = lcfBajoLD.reduce((sum, lcf) => sum + lcf.Ingresos, 0);
  const totalIngresosAsignados = lcfBajoLD.reduce((sum, lcf) => sum + lcf.Ingresos_Asignados, 0);
  const totalIngresosEnCelula = lcfBajoLD.reduce((sum, lcf) => sum + lcf.Ingresos_En_Celula, 0);

  // Crear índice de ingresos para optimización
  const ingresosIndex = indexarIngresosPorLCF(ingresos);
  
  // ✅ SIMPLIFICADO: Los líderes YA tienen toda la información de _EstadoLideres
  // incluyendo Dias_Inactivo, IDP, Perfil_Lider, etc.
  // No necesitamos calcular nada más
  
  // Construir estructuras jerárquicas para modales (líderes ya tienen todo)
  const cadenasLM = construirCadenasLM(idLD, lideres, ingresosIndex);
  const smallGroupsDirectos = construirSmallGroupsDirectos(idLD, lideres, ingresosIndex);
  
  // ✅ CORRECCIÓN: Separar LCF directos (sin supervisión) de todos los LCF de la red
  const lcfDirectosSinSupervision = lideres
    .filter(l => l.ID_Lider_Directo === idLD && l.Rol === 'LCF')
    .map(lcf => {
      const susCelulas = celulasPorLCF.get(lcf.ID_Lider) || [];
      const susIngresos = almasPorLCF.get(lcf.ID_Lider) || [];
      
      return {
        ID_Lider: lcf.ID_Lider,
        Nombre_Lider: lcf.Nombre_Lider || 'Sin Nombre',
        Rol: lcf.Rol,
        Estado_Actividad: (lcf.Estado_Actividad && lcf.Estado_Actividad !== '-') ? lcf.Estado_Actividad : lcf.Perfil_Lider || 'Activo',
        Perfil_Lider: lcf.Perfil_Lider || '🌱 EN DESARROLLO',
        IDP: lcf.IDP || 0,
        Dias_Inactivo: lcf.Dias_Inactivo,
        Ultima_Actividad: lcf.Ultima_Actividad,
        Recibiendo_Celula: lcf.Recibiendo_Celula || 0,
        Visitas_Positivas: lcf.Visitas_Positivas || 0,
        Visitas_No_Positivas: lcf.Visitas_No_Positivas || 0,
        Llamadas_Realizadas: lcf.Llamadas_Realizadas || 0,
        Celulas: susCelulas.length,
        Miembros: susCelulas.reduce((sum, c) => sum + obtenerTotalMiembros(c), 0),
        Ingresos: susIngresos.length,
        Ingresos_Asignados: susIngresos.filter(i => i.Estado_Asignacion === 'Asignado').length,
        Ingresos_En_Celula: susIngresos.filter(i => i.En_Celula).length,
        metricas: {
          total_almas: susIngresos.length,
          almas_en_celula: susIngresos.filter(i => i.En_Celula).length,
          almas_sin_celula: susIngresos.filter(i => !i.En_Celula).length,
          tasa_integracion: susIngresos.length > 0 ? ((susIngresos.filter(i => i.En_Celula).length / susIngresos.length) * 100).toFixed(1) : 0,
          carga_trabajo: susIngresos.length >= 36 ? 'Muy Alta' : susIngresos.length >= 26 ? 'Alta' : susIngresos.length >= 16 ? 'Media' : 'Baja'
        }
      };
    });

  // Devolver estructura compatible con Dashboard
  return {
    success: true,
    resumen: {
      ld: ld,
      Total_LCF: lcfBajoLD.length, // Restaurado para la tarjeta del dashboard
      Total_Celulas: totalCelulas,
      Total_Miembros: totalMiembros,
      Total_Ingresos: totalIngresos,
      Ingresos_Asignados: totalIngresosAsignados,
      Ingresos_En_Celula: totalIngresosEnCelula,
      Tasa_Asignacion: totalIngresos > 0 ? ((totalIngresosAsignados / totalIngresos) * 100).toFixed(1) : 0,
      metricas: {
        total_almas: totalIngresos,
        almas_en_celula: totalIngresosEnCelula,
        almas_sin_celula: totalIngresos - totalIngresosEnCelula,
      }
    },
    lcf_directos: lcfDirectosSinSupervision, // ✅ Solo LCF directos al LD (sin LM/SG)
    equipo: lcfBajoLD, // ✅ TODOS los LCF de la red (para métricas)
    cadenas_lm: cadenasLM, // Para modales
    small_groups_directos: smallGroupsDirectos, // Para modales
    modo: 'completo'
  };
}

/**
 * Construye las cadenas LM para los modales
 */
function construirCadenasLM(idLD, lideres, ingresosIndex) {
  const misLM = lideres.filter(l => l.ID_Lider_Directo === idLD && l.Rol === 'LM');
  
  return misLM.map(lm => {
    const smallGroups = lideres.filter(l => l.ID_Lider_Directo === lm.ID_Lider && l.Rol === 'SMALL GROUP');
    
    // ✅ CORRECCIÓN: Obtener LCF en Small Groups
    const lcfsEnSG = [];
    smallGroups.forEach(sg => {
      const lcfs = lideres.filter(l => l.ID_Lider_Directo === sg.ID_Lider && l.Rol === 'LCF');
      lcfsEnSG.push(...lcfs);
    });
    
    // ✅ CORRECCIÓN: Obtener LCF directos (sin SG)
    const lcfsDirectosDelLM = lideres.filter(l => l.ID_Lider_Directo === lm.ID_Lider && l.Rol === 'LCF');
    
    // ✅ CORRECCIÓN: Unir TODOS los LCF (en SG + directos)
    const todosLosLCF = [...lcfsEnSG, ...lcfsDirectosDelLM];
    
    // Calcular métricas usando TODOS los LCF
    const totalAlmas = todosLosLCF.reduce((sum, lcf) => {
      const data = ingresosIndex[lcf.ID_Lider] || { cantidad: 0 };
      return sum + data.cantidad;
    }, 0);
    
    return {
      ID_Lider: lm.ID_Lider,
      Nombre_Lider: lm.Nombre_Lider,
      Rol: lm.Rol,
      Estado_Actividad: lm.Estado_Actividad,
      smallGroups: smallGroups.map(sg => ({
        ID_Lider: sg.ID_Lider,
        Nombre_Lider: sg.Nombre_Lider,
        Rol: sg.Rol,
        Estado_Actividad: sg.Estado_Actividad || sg.Perfil_Lider,
        Perfil_Lider: sg.Perfil_Lider || '🌱 EN DESARROLLO',
        IDP: sg.IDP || 0,
        Dias_Inactivo: sg.Dias_Inactivo,
        Ultima_Actividad: sg.Ultima_Actividad,
        lcfs: lideres.filter(l => l.ID_Lider_Directo === sg.ID_Lider && l.Rol === 'LCF').map(lcf => {
          const data = ingresosIndex[lcf.ID_Lider] || { ingresos: [], total: 0, cantidad: 0 };
          const almasEnCelula = data.ingresos.filter(i => i.En_Celula).length;
          const almasSinCelula = data.cantidad - almasEnCelula;
          
          return {
            ID_Lider: lcf.ID_Lider,
            Nombre_Lider: lcf.Nombre_Lider,
            Rol: lcf.Rol,
            Estado_Actividad: lcf.Estado_Actividad || lcf.Perfil_Lider,
            Perfil_Lider: lcf.Perfil_Lider || '🌱 EN DESARROLLO', // ✅ HYBRID: Perfil
            IDP: lcf.IDP || 0, // ✅ HYBRID: IDP
            Dias_Inactivo: lcf.Dias_Inactivo, // ✅ HYBRID: Días de inactividad
            Ultima_Actividad: lcf.Ultima_Actividad, // ✅ HYBRID: Última actividad
            Recibiendo_Celula: lcf.Recibiendo_Celula || 0, // ✅ FIX: Agregar campo de _EstadoLideres
            metricas: {
              total_almas: data.cantidad,
              almas_en_celula: almasEnCelula,
              almas_sin_celula: almasSinCelula,
              tasa_integracion: data.cantidad > 0 ? ((almasEnCelula / data.cantidad) * 100).toFixed(1) : 0,
              carga_trabajo: data.cantidad > 0 ? (data.cantidad >= 36 ? 'Muy Alta' : data.cantidad >= 26 ? 'Alta' : data.cantidad >= 16 ? 'Media' : 'Baja') : 'Sin Datos'
            }
          };
        })
      })),
      lcfDirectos: lideres.filter(l => l.ID_Lider_Directo === lm.ID_Lider && l.Rol === 'LCF').map(lcf => {
        const data = ingresosIndex[lcf.ID_Lider] || { ingresos: [], total: 0, cantidad: 0 };
        const almasEnCelula = data.ingresos.filter(i => i.En_Celula).length;
        const almasSinCelula = data.cantidad - almasEnCelula;
        
        return {
          ID_Lider: lcf.ID_Lider,
          Nombre_Lider: lcf.Nombre_Lider,
          Rol: lcf.Rol,
          Estado_Actividad: lcf.Estado_Actividad || lcf.Perfil_Lider,
          Perfil_Lider: lcf.Perfil_Lider || '🌱 EN DESARROLLO', // ✅ HYBRID: Perfil
          IDP: lcf.IDP || 0, // ✅ HYBRID: IDP
          Dias_Inactivo: lcf.Dias_Inactivo, // ✅ HYBRID: Días de inactividad
          Ultima_Actividad: lcf.Ultima_Actividad, // ✅ HYBRID: Última actividad
          Recibiendo_Celula: lcf.Recibiendo_Celula || 0, // ✅ FIX: Agregar campo de _EstadoLideres
          metricas: {
            total_almas: data.cantidad,
            almas_en_celula: almasEnCelula,
            almas_sin_celula: almasSinCelula,
            tasa_integracion: data.cantidad > 0 ? ((almasEnCelula / data.cantidad) * 100).toFixed(1) : 0,
            carga_trabajo: data.cantidad >= 36 ? 'Muy Alta' : data.cantidad >= 26 ? 'Alta' : data.cantidad >= 16 ? 'Media' : 'Baja'
          }
        };
      }),
      metricas: {
        total_small_groups: smallGroups.length,
        total_lcf_en_cadena: todosLosLCF.length, // ✅ CORREGIDO: Ahora incluye LCF directos también
        lcf_en_small_groups: lcfsEnSG.length, // ✅ NUEVO: LCF solo en SG
        lcf_directos: lcfsDirectosDelLM.length, // ✅ NUEVO: LCF directos al LM
        total_almas_en_cadena: totalAlmas
      }
    };
  });
}

/**
 * Construye los Small Groups directos para los modales
 */
function construirSmallGroupsDirectos(idLD, lideres, ingresosIndex) {
  const misSG = lideres.filter(l => l.ID_Lider_Directo === idLD && l.Rol === 'SMALL GROUP');
  
  return misSG.map(sg => {
    const lcfs = lideres.filter(l => l.ID_Lider_Directo === sg.ID_Lider && l.Rol === 'LCF');
    
    // Calcular métricas del Small Group
    const totalLCF = lcfs.length;
    const totalAlmas = lcfs.reduce((sum, lcf) => {
      const data = ingresosIndex[lcf.ID_Lider] || { cantidad: 0 };
      return sum + data.cantidad;
    }, 0);
    
    const almasEnCelula = lcfs.reduce((sum, lcf) => {
      const data = ingresosIndex[lcf.ID_Lider] || { ingresos: [] };
      return sum + data.ingresos.filter(i => i.En_Celula).length;
    }, 0);
    
    return {
      ID_Lider: sg.ID_Lider,
      Nombre_Lider: sg.Nombre_Lider,
      Rol: sg.Rol,
      Estado_Actividad: sg.Estado_Actividad || sg.Perfil_Lider,
      Perfil_Lider: sg.Perfil_Lider || '🌱 EN DESARROLLO', // ✅ HYBRID: Perfil
      IDP: sg.IDP || 0, // ✅ HYBRID: IDP
      Dias_Inactivo: sg.Dias_Inactivo, // ✅ HYBRID: Días de inactividad
      Ultima_Actividad: sg.Ultima_Actividad, // ✅ HYBRID: Última actividad
      metricas: {
        total_lcf: totalLCF,
        total_almas: totalAlmas,
        almas_en_celula: almasEnCelula,
        almas_sin_celula: totalAlmas - almasEnCelula,
        tasa_integracion: totalAlmas > 0 ? ((almasEnCelula / totalAlmas) * 100).toFixed(1) : 0,
        carga_trabajo: totalAlmas > 0 ? (totalAlmas >= 36 ? 'Muy Alta' : totalAlmas >= 26 ? 'Alta' : totalAlmas >= 16 ? 'Media' : 'Baja') : 'Sin Datos',
        lcf_activos: lcfs.filter(l => l.Dias_Inactivo !== null && l.Dias_Inactivo <= 7).length // ✅ Métrica de LCF activos
      },
      lcfs: lcfs.map(lcf => {
        const data = ingresosIndex[lcf.ID_Lider] || { ingresos: [], total: 0, cantidad: 0 };
        const almasEnCelula = data.ingresos.filter(i => i.En_Celula).length;
        const almasSinCelula = data.cantidad - almasEnCelula;
        
        return {
          ID_Lider: lcf.ID_Lider,
          Nombre_Lider: lcf.Nombre_Lider,
          Rol: lcf.Rol,
          Estado_Actividad: lcf.Estado_Actividad || lcf.Perfil_Lider,
          Perfil_Lider: lcf.Perfil_Lider || '🌱 EN DESARROLLO', // ✅ HYBRID: Perfil
          IDP: lcf.IDP || 0, // ✅ HYBRID: IDP
          Dias_Inactivo: lcf.Dias_Inactivo, // ✅ HYBRID: Días de inactividad
          Ultima_Actividad: lcf.Ultima_Actividad, // ✅ HYBRID: Última actividad
          Recibiendo_Celula: lcf.Recibiendo_Celula || 0, // ✅ FIX: Agregar campo de _EstadoLideres
          metricas: {
            total_almas: data.cantidad,
            almas_en_celula: almasEnCelula,
            almas_sin_celula: almasSinCelula,
            tasa_integracion: data.cantidad > 0 ? ((almasEnCelula / data.cantidad) * 100).toFixed(1) : 0,
            carga_trabajo: data.cantidad >= 36 ? 'Muy Alta' : data.cantidad >= 26 ? 'Alta' : data.cantidad >= 16 ? 'Media' : 'Baja'
          }
        };
      })
    };
  });
}

// ==================== OPERACIONES ADMINISTRATIVAS OPTIMIZADAS ====================

/**
 * Cambia el estado de múltiples almas a "Baja" de forma HIPER-OPTIMIZADA.
 * Utiliza LockService y getRangeList para un rendimiento superior.
 * @param {Array<string>} idAlmasArray - Array de IDs de almas a dar de baja
 * @returns {Object} Resultado de la operación
 */
function darDeBajaAlmasEnLote(idAlmasArray) {
  checkTimeout();
  if (!idAlmasArray || idAlmasArray.length === 0) {
    return { success: false, error: 'No se proporcionaron IDs de almas para dar de baja.' };
  }

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000); 
    
    console.log(`[CoreModule] Iniciando operación darDeBajaAlmasEnLote para ${idAlmasArray.length} almas.`);

    const ss = getSpreadsheetManager().getSpreadsheet(CONFIG.SHEETS.DIRECTORIO);
    const sheet = ss.getSheetByName(CONFIG.TABS.INGRESOS);
    
    if (!sheet) {
      throw new Error(`La hoja '${CONFIG.TABS.INGRESOS}' no fue encontrada.`);
    }

    const headers = getOptimizedHeaders(sheet, 20);
    const idAlmaColIndex = headers.indexOf('ID_Alma');
    const estadoColIndex = headers.indexOf('Estado');

    if (idAlmaColIndex === -1 || estadoColIndex === -1) {
      throw new Error("Columnas 'ID_Alma' o 'Estado' no encontradas en la hoja de Ingresos.");
    }

    const idColumnValues = getOptimizedRange(sheet, 10000, 2, idAlmaColIndex + 1, idAlmaColIndex + 1);
    const idMap = new Map();
    idColumnValues.forEach((row, index) => {
      if (row[0]) {
        idMap.set(String(row[0]).trim(), index + 2);
      }
    });

    const rangesToUpdate = [];
    const idsParaBajaSet = new Set(idAlmasArray.map(id => String(id).trim()));
    
    idsParaBajaSet.forEach(id => {
      if (idMap.has(id)) {
        const rowNumber = idMap.get(id);
        const cellNotation = sheet.getRange(rowNumber, estadoColIndex + 1).getA1Notation();
        rangesToUpdate.push(cellNotation);
      }
    });

    if (rangesToUpdate.length > 0) {
      sheet.getRangeList(rangesToUpdate).setValue('Baja');
      SpreadsheetApp.flush();
      console.log(`[CoreModule] ${rangesToUpdate.length} almas dadas de baja exitosamente.`);
    } else {
      console.log('[CoreModule] No se encontraron almas válidas para dar de baja.');
    }
    
    return { success: true, message: `${rangesToUpdate.length} de ${idAlmasArray.length} almas han sido dadas de baja.` };

  } catch (e) {
    console.error('[CoreModule] Error en darDeBajaAlmasEnLote:', e);
    if (e.message.includes("Lock timed out")) {
        return { success: false, error: "El sistema está ocupado. Por favor, inténtalo de nuevo en unos segundos."};
    }
    return { success: false, error: e.toString() };
  } finally {
    if (lock.hasLock()) {
      lock.releaseLock();
    }
  }
}

/**
 * Búsqueda directa y rápida de un LD específico
 * Función de optimización para evitar cargar todo el directorio
 * @param {string} idLD - ID del LD a buscar (ej: 'LD-4003')
 * @returns {Object} Objeto con la estructura de respuesta
 */
function buscarLDRapido(idLD) {
  // 1. Medir tiempo desde el inicio
  const startTime = Date.now();
  
  try {
    // 2. Verificar caché específico primero
    const cache = CacheService.getScriptCache();
    const cacheKey = `LD_QUICK_${idLD}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      console.log(`[CoreModule] LD ${idLD} encontrado en caché rápida`);
      const cachedData = JSON.parse(cached);
      cachedData.tiempo = Date.now() - startTime;
      return cachedData;
    }
    
    // 3. Si no está en caché, buscar en la hoja
    console.log(`[CoreModule] Buscando LD ${idLD} directamente en hoja...`);

    // Usar SpreadsheetManager si está disponible
    let spreadsheet;
    try {
      // Intentar usar SpreadsheetManager CON EL ID CORRECTO
      if (typeof SpreadsheetManager !== 'undefined' && SpreadsheetManager.getInstance) {
        // Pasar el ID del spreadsheet al SpreadsheetManager
        const sm = SpreadsheetManager.getInstance();
        spreadsheet = sm.getSpreadsheet(CONFIG.SHEETS.DIRECTORIO);
        console.log('[CoreModule] Usando SpreadsheetManager');
      }
    } catch (smError) {
      // Si falla, usar fallback
      console.log('[CoreModule] SpreadsheetManager falló, usando fallback');
    }

    // Si no se obtuvo por SpreadsheetManager, abrir directamente
    if (!spreadsheet) {
      spreadsheet = getSpreadsheetManager().getSpreadsheet(CONFIG.SHEETS.DIRECTORIO);
      console.log('[CoreModule] Abriendo spreadsheet directamente');
    }

    const sheet = spreadsheet.getSheetByName(CONFIG.TABS.LIDERES);
    if (!sheet) {
      return {
        success: false,
        error: `Hoja '${CONFIG.TABS.LIDERES}' no encontrada`,
        tiempo: Date.now() - startTime
      };
    }

    // Optimización: limitar búsqueda a las primeras 200 filas
    const data = getOptimizedRange(sheet, 200, 2, 1, 5);
    
    // 4. Buscar fila donde:
    // - Columna A (índice 0) = idLD
    // - Columna C (índice 2) = 'LD'
    let ldRow = null;
    let rowNumber = 0;
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (String(row[0]).trim() === idLD && String(row[2]).trim() === 'LD') {
        ldRow = row;
        rowNumber = i + 2; // +2 porque empezamos desde fila 2
        break;
      }
    }
    
    // 5. Si encuentra, crear objeto respuesta
    if (ldRow) {
      const resultado = {
        success: true,
        ld: {
          ID: String(ldRow[0]).trim(),
          Nombre: String(ldRow[1]).trim(),
          Rol: String(ldRow[2]).trim(),
          Superior: String(ldRow[3] || '').trim(),
          Estado: String(ldRow[4] || 'Activo').trim(),
          Fila: rowNumber
        },
        tiempo: Date.now() - startTime
      };
      
      // 6. Cachear si success=true (300 segundos = 5 minutos)
      try {
        cache.put(cacheKey, JSON.stringify(resultado), 300);
        console.log(`[CoreModule] LD ${idLD} cacheado por 5 minutos`);
      } catch (cacheError) {
        console.warn(`[CoreModule] No se pudo cachear LD ${idLD}:`, cacheError);
      }
      
      console.log(`[CoreModule] ✅ LD ${idLD} encontrado en ${resultado.tiempo}ms`);
      return resultado;
    }
    
    // 7. Si no encuentra, retornar error
    const tiempo = Date.now() - startTime;
    console.log(`[CoreModule] ❌ LD ${idLD} no encontrado en ${tiempo}ms`);
    
    return {
      success: false,
      error: `LD ${idLD} no encontrado`,
      tiempo: tiempo
    };
    
  } catch (error) {
    const tiempo = Date.now() - startTime;
    console.error(`[CoreModule] Error en buscarLDRapido para ${idLD}:`, error);
    
    return {
      success: false,
      error: `Error interno: ${error.toString()}`,
      tiempo: tiempo
    };
  }
}

/**
 * Test para verificar la corrección de getListaDeLideres con caché
 */
function testCorrecionListaLideres() {
  console.log('🧪 TEST: Verificando corrección de getListaDeLideres');
  console.log('');
  
  // Test 1: Sin caché (debe abrir spreadsheet)
  console.log('=== TEST 1: Sin caché ===');
  clearCache();
  const t1 = Date.now();
  const resultado1 = getListaDeLideres();
  const time1 = Date.now() - t1;
  
  console.log(`⏱️ Tiempo Test 1: ${time1}ms`);
  console.log(`📊 Resultado: ${resultado1.success ? '✅' : '❌'}`);
  console.log(`📊 Líderes: ${resultado1.data ? resultado1.data.length : 0}`);
  console.log('Tiempo esperado: ~117s');
  
  // Test 2: Poblar caché
  console.log('');
  console.log('=== Poblando caché ===');
  const t2 = Date.now();
  cargarDirectorioCompleto();
  const time2 = Date.now() - t2;
  console.log(`⏱️ Tiempo carga directorio: ${time2}ms`);
  
  // Test 3: Con caché (debe ser instantáneo)
  console.log('');
  console.log('=== TEST 2: Con caché ===');
  const t3 = Date.now();
  const resultado2 = getListaDeLideres();
  const time3 = Date.now() - t3;
  
  console.log(`⏱️ Tiempo Test 2: ${time3}ms`);
  console.log(`📊 Resultado: ${resultado2.success ? '✅' : '❌'}`);
  console.log(`📊 Líderes: ${resultado2.data ? resultado2.data.length : 0}`);
  console.log('Tiempo esperado: <1s');
  
  // Test 4: Reutilizando spreadsheet
  console.log('');
  console.log('=== TEST 3: Reutilizando spreadsheet ===');
  clearCache();
  const ss = getSpreadsheetManager().getSpreadsheet(CONFIG.SHEETS.DIRECTORIO);
  const t4 = Date.now();
  const resultado3 = getListaDeLideres(ss);
  const time4 = Date.now() - t4;
  
  console.log(`⏱️ Tiempo Test 3: ${time4}ms`);
  console.log(`📊 Resultado: ${resultado3.success ? '✅' : '❌'}`);
  console.log(`📊 Líderes: ${resultado3.data ? resultado3.data.length : 0}`);
  
  // Resumen
  console.log('');
  console.log('📊 RESUMEN:');
  console.log(`Test 1 (sin caché): ${time1}ms - ${time1 < 5000 ? '✅ RÁPIDO' : '⚠️ LENTO'}`);
  console.log(`Test 2 (con caché): ${time3}ms - ${time3 < 1000 ? '✅ RÁPIDO' : '⚠️ LENTO'}`);
  console.log(`Test 3 (reuso): ${time4}ms - ${time4 < 5000 ? '✅ RÁPIDO' : '⚠️ LENTO'}`);
  
  const mejora = time1 > 0 ? ((time1 - time3) / time1 * 100).toFixed(1) : 0;
  console.log(`Mejora con caché: ${mejora}%`);
  
  return {
    test1: { tiempo: time1, exitoso: resultado1.success, lideres: resultado1.data?.length || 0 },
    test2: { tiempo: time3, exitoso: resultado2.success, lideres: resultado2.data?.length || 0 },
    test3: { tiempo: time4, exitoso: resultado3.success, lideres: resultado3.data?.length || 0 },
    mejora: mejora + '%'
  };
}

console.log('🏗️ CoreModule cargado - Funciones críticas y estructuras centralizadas');
