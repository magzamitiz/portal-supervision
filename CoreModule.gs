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
    Nombre_Lider: lmRow[1],
    Rol: lmRow[2],
    Estado_Actividad: lmRow[4] || 'Sin Datos'
  }));
  
  const smallGroups = misSG.map(sgRow => ({
    ID_Lider: sgRow[0],
    Nombre_Lider: sgRow[1],
    Rol: sgRow[2],
    Estado_Actividad: sgRow[4] || 'Sin Datos'
  }));
  
  const lcfDirectos = misLCF.map(lcfRow => ({
    ID_Lider: lcfRow[0],
    Nombre_Lider: lcfRow[1],
    Rol: lcfRow[2],
    Estado_Actividad: lcfRow[4] || 'Sin Datos'
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
function construirEstructuraCompleta(idLD, lideres, dataCompleta) {
  const { celulas, ingresos } = dataCompleta;
  
  const lcfBajoLD = lideres.filter(l => l.ID_Lider_Directo === idLD && l.Rol === 'LCF');
  
  const estructuraCompleta = lcfBajoLD.map(lcf => {
    const celulasDelLCF = celulas.filter(c => c.ID_LCF_Responsable === lcf.ID_Lider);
    const ingresosDelLCF = ingresos.filter(i => i.ID_LCF === lcf.ID_Lider);
    
    return {
      ID_Lider: lcf.ID_Lider,
      Nombre_Lider: lcf.Nombre_Lider,
      Rol: lcf.Rol,
      Estado_Actividad: lcf.Estado_Actividad,
      Celulas: celulasDelLCF.length,
      Miembros: celulasDelLCF.reduce((sum, c) => sum + c.Total_Miembros, 0),
      Ingresos: ingresosDelLCF.length,
      Ingresos_Asignados: ingresosDelLCF.filter(i => i.Estado_Asignacion === 'Asignado').length,
      Ingresos_En_Celula: ingresosDelLCF.filter(i => i.En_Celula).length
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
  console.log('[CoreModule] Debug - cargarDirectorioCompleto iniciado, forceReload:', forceReload);
  
  if (forceReload) {
    console.log('[CoreModule] Debug - Limpiando caché...');
    clearCache();
  } else {
    console.log('[CoreModule] Debug - Verificando caché...');
    const cachedData = getCacheData();
    if (cachedData) {
      console.log('[CoreModule] Directorio completo obtenido de caché.');
      return cachedData;
    }
    console.log('[CoreModule] Debug - No hay datos en caché, cargando desde Sheets...');
  }

  console.log('[CoreModule] Cargando datos de DIRECTORIO desde Google Sheets...');
  try {
    checkTimeout();
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    console.log('[CoreModule] Debug - Spreadsheet abierto correctamente');
    
    // Usar las funciones que sabemos que funcionan
    const lideres = cargarLideresCompletos(spreadsheet);
    console.log(`[CoreModule] Debug - Líderes cargados: ${lideres ? lideres.length : 0}`);
    
    const celulas = cargarCelulasCompletas(spreadsheet, CONFIG.TABS.CELULAS);
    console.log(`[CoreModule] Debug - Células cargadas: ${celulas ? celulas.length : 0}`);
    
    const ingresos = cargarIngresosCompletos(spreadsheet, CONFIG.TABS.INGRESOS);
    console.log(`[CoreModule] Debug - Ingresos cargados: ${ingresos ? ingresos.length : 0}`);

    const actividadMap = calcularActividadLideres(celulas);
    const lideresConActividad = integrarActividadLideres(lideres, actividadMap);
    
    const almasEnCelulasMap = mapearAlmasACelulas(celulas);
    integrarAlmasACelulas(ingresos, almasEnCelulasMap);

    const data = {
      lideres: lideresConActividad,
      celulas: celulas,
      ingresos: ingresos,
      timestamp: new Date().toISOString()
    };

    setCacheData(data);
    console.log('[CoreModule] Directorio completo cargado y cacheado.');
    return data;

  } catch (error) {
    console.error('[CoreModule] ❌ Error cargando directorio completo:', error);
    return { lideres: [], celulas: [], ingresos: [], error: error.toString() };
  }
}

/**
 * Obtiene una lista de líderes (solo LDs) para selectores de UI.
 * @returns {Object} Objeto con éxito y datos de líderes
 */
function getListaDeLideres() {
  try {
    console.log('[CoreModule] Obteniendo lista de líderes para selector...');
    const spreadsheetId = (typeof CONFIG !== 'undefined' && CONFIG.SHEETS && CONFIG.SHEETS.DIRECTORIO) ? CONFIG.SHEETS.DIRECTORIO : '1dwuqpyMXWHJvnJHwDHCqFMvgdYhypE2W1giH6bRZMKc';
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheetName = (typeof CONFIG !== 'undefined' && CONFIG.TABS && CONFIG.TABS.LIDERES) ? CONFIG.TABS.LIDERES : 'Líderes';
    const sheetLideres = spreadsheet.getSheetByName(sheetName);
    if (!sheetLideres) {
      return { success: false, error: 'Hoja de líderes no encontrada', data: [] };
    }

    const dataLideres = sheetLideres.getRange(2, 1, sheetLideres.getLastRow() - 1, 3).getValues();
    const lideresParaSelector = dataLideres
      .filter(row => row[2] === 'LD' && row[0])
      .map(row => ({ ID_Lider: String(row[0]).trim(), Nombre_Lider: String(row[1]).trim() }));

    console.log(`[CoreModule] ${lideresParaSelector.length} líderes LD encontrados.`);
    return { success: true, data: lideresParaSelector };
  } catch (error) {
    console.error(`[CoreModule] Error en getListaDeLideres: ${error}`);
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
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
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
      checkTimeout();
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
  checkTimeout();
  if (!idsAlmas || idsAlmas.size === 0) return [];
  
  try {
    console.log('[CoreModule] Cargando Maestro_Asistentes selectivamente...');
    const cache = CacheService.getScriptCache();
    const cacheKey = 'MAESTRO_SELECTIVO_' + Array.from(idsAlmas).sort().slice(0, 10).join('_');
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('[CoreModule] Maestro_Asistentes selectivo obtenido de caché.');
      return JSON.parse(cached);
    }
    
    const reporteCelulasId = (typeof CONFIG !== 'undefined' && CONFIG.SHEETS && CONFIG.SHEETS.REPORTE_CELULAS) ? CONFIG.SHEETS.REPORTE_CELULAS : '18wOkxTauLETdpkEy5qsd0shlZUf8FsfQg9oCN8-pCxI';
    const ss = SpreadsheetApp.openById(reporteCelulasId);
    const sheetName = (typeof CONFIG_SEGUIMIENTO !== 'undefined' && CONFIG_SEGUIMIENTO.TABS && CONFIG_SEGUIMIENTO.TABS.MAESTRO_ASISTENTES) ? CONFIG_SEGUIMIENTO.TABS.MAESTRO_ASISTENTES : 'Maestro_Asistentes';
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      console.warn(`[CoreModule] Hoja '${sheetName}' no encontrada.`);
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];

    const resultado = [];
    for (let i = 1; i < data.length; i++) {
      checkTimeout();
      const idAsistente = String(data[i][0] || '').trim();
      if (idsAlmas.has(idAsistente)) {
        resultado.push({
          ID_Asistente: idAsistente,
          Nombre: String(data[i][1] || '').trim(),
          Temas_Completados: String(data[i][2] || '0/12'),
          Porcentaje: parseFloat(data[i][4] || 0),
          Estado: String(data[i][5] || 'Sin datos')
        });
      }
    }
    
    cache.put(cacheKey, JSON.stringify(resultado), 300);
    console.log(`[CoreModule] ${resultado.length} asistentes selectivos cargados.`);
    return resultado;
    
  } catch (e) {
    console.error('[CoreModule] Error cargando Maestro_Asistentes selectivo:', e);
    return [];
  }
}

/**
 * Carga interacciones de seguimiento de forma selectiva por IDs de almas.
 * @param {Set<string>} idsAlmas - Conjunto de IDs de almas para filtrar
 * @returns {Array<Object>} Lista de objetos de interacciones
 */
function cargarInteraccionesSelectivo(idsAlmas) {
  checkTimeout();
  if (!idsAlmas || idsAlmas.size === 0) return [];
  
  try {
    console.log('[CoreModule] Cargando interacciones selectivamente...');
    const cache = CacheService.getScriptCache();
    const cacheKey = 'INTERACCIONES_SELECTIVO_' + Array.from(idsAlmas).sort().slice(0, 10).join('_');
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('[CoreModule] Interacciones selectivas obtenidas de caché.');
      return JSON.parse(cached);
    }

    const interaccionesId = (typeof CONFIG !== 'undefined' && CONFIG.SHEETS && CONFIG.SHEETS.REGISTRO_INTERACCIONES) ? CONFIG.SHEETS.REGISTRO_INTERACCIONES : '1Rzx4k6ipkFvVpTYdisjAYSwGuIgyWiYFBsYu4RHFWPs';
    const ss = SpreadsheetApp.openById(interaccionesId);
    const sheetName = (typeof CONFIG_SEGUIMIENTO !== 'undefined' && CONFIG_SEGUIMIENTO.TABS && CONFIG_SEGUIMIENTO.TABS.REGISTRO_INTERACCIONES) ? CONFIG_SEGUIMIENTO.TABS.REGISTRO_INTERACCIONES : 'Registro de Interacciones';
    const sheet = ss.getSheetByName(sheetName) || ss.getSheets()[0];
    if (!sheet) {
      console.warn(`[CoreModule] Hoja '${sheetName}' no encontrada.`);
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];

    const resultado = [];
    for (let i = 1; i < data.length; i++) {
      checkTimeout();
      const idAlma = String(data[i][1] || '').trim();
      if (idsAlmas.has(idAlma)) {
        resultado.push({
          ID_Alma: idAlma,
          Nombre_Alma: String(data[i][2] || '').trim(),
          Timestamp_Interaccion: data[i][3],
          Resultado: String(data[i][13] || '').trim(),
          Medio_Contacto: String(data[i][12] || '').trim()
        });
      }
    }
    
    cache.put(cacheKey, JSON.stringify(resultado), 300);
    console.log(`[CoreModule] ${resultado.length} interacciones selectivas cargadas.`);
    return resultado;
    
  } catch (e) {
    console.error('[CoreModule] Error cargando interacciones selectivas:', e);
    return [];
  }
}

/**
 * Carga visitas de bendición de forma selectiva por IDs de almas.
 * @param {Set<string>} idsAlmas - Conjunto de IDs de almas para filtrar
 * @returns {Array<Object>} Lista de objetos de visitas
 */
function cargarVisitasBendicionSelectivo(idsAlmas) {
  checkTimeout();
  if (!idsAlmas || idsAlmas.size === 0) return [];
  
  try {
    console.log('[CoreModule] Cargando visitas de bendición selectivamente...');
    const cache = CacheService.getScriptCache();
    const cacheKey = 'VISITAS_SELECTIVO_' + Array.from(idsAlmas).sort().slice(0, 10).join('_');
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('[CoreModule] Visitas selectivas obtenidas de caché.');
      return JSON.parse(cached);
    }

    const visitasId = (typeof CONFIG !== 'undefined' && CONFIG.SHEETS && CONFIG.SHEETS.VISITAS_BENDICION) ? CONFIG.SHEETS.VISITAS_BENDICION : '1md72JN8LOJCpBLrPIGP9HQG8GQ1RzFFE-hAOlawQ2eg';
    const ss = SpreadsheetApp.openById(visitasId);
    const sheetName = (typeof CONFIG_SEGUIMIENTO !== 'undefined' && CONFIG_SEGUIMIENTO.TABS && CONFIG_SEGUIMIENTO.TABS.REGISTRO_VISITAS) ? CONFIG_SEGUIMIENTO.TABS.REGISTRO_VISITAS : 'Registro de Visitas';
    const sheet = ss.getSheetByName(sheetName) || ss.getSheets()[0];
    if (!sheet) {
      console.warn(`[CoreModule] Hoja '${sheetName}' no encontrada.`);
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];

    const resultado = [];
    for (let i = 1; i < data.length; i++) {
      checkTimeout();
      const idAlma = String(data[i][1] || '').trim();
      if (idsAlmas.has(idAlma)) {
        resultado.push({
          ID_Visita: String(data[i][0] || '').trim(),
          ID_Alma: idAlma,
          Timestamp_Visita: data[i][2],
          Nombre_Agente: String(data[i][3] || '').trim(),
          Estatus_Visita: String(data[i][12] || '').trim(),
          Resultado_Visita: String(data[i][13] || '').trim()
        });
      }
    }
    
    cache.put(cacheKey, JSON.stringify(resultado), 300);
    console.log(`[CoreModule] ${resultado.length} visitas selectivas cargadas.`);
    return resultado;
    
  } catch (e) {
    console.error('[CoreModule] Error cargando visitas de bendición selectivas:', e);
    return [];
  }
}

// ==================== GESTIÓN DE DATOS DE LD ====================

/**
 * Obtiene los datos de un Líder de Discípulos (LD) en modo básico o completo.
 * @param {string} idLD - ID del LD
 * @param {boolean} modoCompleto - Si es true, carga datos completos
 * @returns {Object} Objeto con los datos del LD
 */
function getDatosLD(idLD, modoCompleto = false) {
  try {
    checkTimeout();
    if (!idLD) {
      console.log('[CoreModule] getDatosLD llamado sin ID');
      return { success: false, error: 'No se proporcionó ID del LD' };
    }
    
    console.log(`[CoreModule] getDatosLD para: ${idLD}, modoCompleto: ${modoCompleto}`);
    
    const cache = CacheService.getScriptCache();
    const cacheKey = `LD_${modoCompleto ? 'FULL' : 'BASIC'}_${idLD}`;
    
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('[CoreModule] Datos de LD obtenidos de caché.');
      return JSON.parse(cached);
    }
    
    let result;
    if (modoCompleto) {
      result = getDatosLDCompleto(idLD);
    } else {
      result = getDatosLDBasico(idLD);
    }
    
    if (result.success) {
      const tiempoCache = modoCompleto ? 600 : 300; // 10 min completo, 5 min básico
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
  
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
  const sheet = spreadsheet.getSheetByName(CONFIG.TABS.LIDERES);
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();
  
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
  console.log('[CoreModule] Debug - getDatosLDCompleto iniciado para LD:', idLD);
  checkTimeout();
  console.log('[CoreModule] Cargando modo completo para LD:', idLD);
  
  console.log('[CoreModule] Debug - Llamando a cargarDirectorioCompleto...');
  const dataCompleta = cargarDirectorioCompleto();
  console.log('[CoreModule] Debug - cargarDirectorioCompleto retornó:', dataCompleta ? 'datos' : 'null/undefined');
  if (!dataCompleta || !dataCompleta.lideres || dataCompleta.success === false) {
    return { success: false, error: 'Datos del directorio no válidos o error en carga' };
  }
  
  const { lideres, ingresos, celulas } = dataCompleta;
  
  // Debug: verificar datos cargados
  console.log(`[CoreModule] Debug - Total líderes cargados: ${lideres ? lideres.length : 0}`);
  console.log(`[CoreModule] Debug - Buscando LD: ${idLD}`);
  if (lideres && lideres.length > 0) {
    console.log(`[CoreModule] Debug - Primeros 3 IDs de líderes:`, lideres.slice(0, 3).map(l => l.ID_Lider));
  }
  
  const ld = lideres.find(l => l?.ID_Lider === idLD && l?.Rol === 'LD');
  if (!ld) {
    console.log(`[CoreModule] Debug - LD ${idLD} no encontrado. Líderes disponibles:`, lideres.map(l => `${l.ID_Lider}(${l.Rol})`));
    return { success: false, error: `LD ${idLD} no encontrado` };
  }

  const almasPorLCF = new Map();
  for (const ingreso of ingresos) {
    checkTimeout();
    if (ingreso.ID_LCF) {
      if (!almasPorLCF.has(ingreso.ID_LCF)) {
        almasPorLCF.set(ingreso.ID_LCF, []);
      }
      almasPorLCF.get(ingreso.ID_LCF).push(ingreso);
    }
  }

  const celulasPorLCF = new Map();
  for (const celula of celulas) {
    checkTimeout();
    if (celula.ID_LCF_Responsable) {
      if (!celulasPorLCF.has(celula.ID_LCF_Responsable)) {
        celulasPorLCF.set(celula.ID_LCF_Responsable, []);
      }
      celulasPorLCF.get(celula.ID_LCF_Responsable).push(celula);
    }
  }
  
  const lcfBajoLD = lideres
    .filter(l => l.ID_Lider_Directo === idLD && l.Rol === 'LCF')
    .map(lcf => {
      checkTimeout();
      const susCelulas = celulasPorLCF.get(lcf.ID_Lider) || [];
      const susIngresos = almasPorLCF.get(lcf.ID_Lider) || [];
      
      return {
        ID: lcf.ID_Lider,
        Nombre: lcf.Nombre_Lider,
        Estado: lcf.Estado_Actividad,
        Celulas: susCelulas.length,
        Miembros: susCelulas.reduce((sum, c) => sum + c.Total_Miembros, 0),
        Ingresos: susIngresos.length,
        Ingresos_Asignados: susIngresos.filter(i => i.Estado_Asignacion === 'Asignado').length,
        Ingresos_En_Celula: susIngresos.filter(i => i.En_Celula).length
      };
    });

  return { success: true, ld: ld, lcfBajoLD: lcfBajoLD };
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

    const ss = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    const sheet = ss.getSheetByName(CONFIG.TABS.INGRESOS);
    
    if (!sheet) {
      throw new Error(`La hoja '${CONFIG.TABS.INGRESOS}' no fue encontrada.`);
    }

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => String(h).trim());
    const idAlmaColIndex = headers.indexOf('ID_Alma');
    const estadoColIndex = headers.indexOf('Estado');

    if (idAlmaColIndex === -1 || estadoColIndex === -1) {
      throw new Error("Columnas 'ID_Alma' o 'Estado' no encontradas en la hoja de Ingresos.");
    }

    const idColumnValues = sheet.getRange(2, idAlmaColIndex + 1, sheet.getLastRow() - 1, 1).getValues();
    const idMap = new Map();
    idColumnValues.forEach((row, index) => {
      checkTimeout();
      if (row[0]) {
        idMap.set(String(row[0]).trim(), index + 2);
      }
    });

    const rangesToUpdate = [];
    const idsParaBajaSet = new Set(idAlmasArray.map(id => String(id).trim()));
    
    idsParaBajaSet.forEach(id => {
      checkTimeout();
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

console.log('🏗️ CoreModule cargado - Funciones críticas y estructuras centralizadas');
