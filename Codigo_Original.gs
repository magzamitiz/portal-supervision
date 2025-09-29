/**
 * Portal de Supervisión para Líderes de Discípulos
 * Versión 2.0 - Refactorizado para Rendimiento y Precisión
 */

// ==================== CONFIGURACIÓN ====================
const CONFIG = {
  SHEETS: {
    DIRECTORIO: '1dwuqpyMXWHJvnJHwDHCqFMvgdYhypE2W1giH6bRZMKc',
    REPORTE_CELULAS: '18wOkxTauLETdpkEy5qsd0shlZUf8FsfQg9oCN8-pCxI',
    VISITAS_BENDICION: '1md72JN8LOJCpBLrPIGP9HQG8GQ1RzFFE-hAOlawQ2eg',
    REGISTRO_INTERACCIONES: '1Rzx4k6ipkFvVpTYdisjAYSwGuIgyWiYFBsYu4RHFWPs'
  },

  // VERIFICA QUE ESTOS NOMBRES COINCIDAN EXACTAMENTE CON TUS PESTAÑAS
  TABS: {
    LIDERES: 'Directorio de Líderes',
    CELULAS: 'Directorio de Células',
    INGRESOS: 'Ingresos',
    // Nombres de las pestañas en los archivos de actividad. Si es NULL, se usa la primera hoja (ideal para formularios).
    ACTIVIDAD_CELULAS: 'Reportes_Celulas',
    ACTIVIDAD_VISITAS: 'Registro de Visitas',
  },

  // Configuración de actividad
  DIAS_INACTIVO: {
    ACTIVO: 7,
    ALERTA: 14,
    INACTIVO: 30
  },

  // Configuración de células y carga
  CELULAS: { MIN_MIEMBROS: 3, IDEAL_MIEMBROS: 8, MAX_MIEMBROS: 12 },
  CARGA_LCF: { OPTIMA: 10, MODERADA: 20, ALTA: 30 },

  // Configuración de Caché (Importante para rendimiento)
  CACHE: {
    DURATION: 1800 // 30 minutos (en segundos)
  },

  // Zona Horaria del Proyecto (Importante para calcular "Hoy")
  TIMEZONE: Session.getScriptTimeZone()
};

// ==================== PROTECCIÓN TIMEOUT ====================
const SCRIPT_START_TIME = Date.now();
const MAX_EXECUTION_TIME = 25000; // 25 segundos (dejar margen de 5s)

function checkTimeout() {
  if (Date.now() - SCRIPT_START_TIME > MAX_EXECUTION_TIME) {
    console.error('[TIMEOUT] Operación excedió tiempo máximo');
    throw new Error('Timeout: La operación tardó demasiado tiempo');
  }
}
// ==================== FIN PROTECCIÓN TIMEOUT ====================

// ==================== UTILIDADES DE CACHÉ (Optimización con Compresión) ====================

const CACHE_KEY = 'DASHBOARD_DATA_V2';

/**
 * Guarda los datos procesados en la caché usando compresión GZIP.
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


// ==================== FUNCIÓN PRINCIPAL WEB ====================
function doGet(e) {
  try {
    return HtmlService.createTemplateFromFile('Dashboard')
      .evaluate()
      .setTitle('Portal de Supervisión V2.0')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (error) {
    console.error('Error en doGet:', error);
    return HtmlService.createHtmlOutput('<h1>Error al cargar la aplicación</h1><p>Por favor, inténtalo de nuevo más tarde.</p><p>Detalle: ' + error.toString() + '</p>');
  }
}

// ==================== CARGA Y ANÁLISIS PRINCIPAL ====================

/**
 * Carga las estadísticas principales de forma casi instantánea leyendo
 * los datos pre-calculados desde la hoja de resumen. VERSIÓN OPTIMIZADA.
 */
function getEstadisticasRapidas() {
  try {
    const resumenSheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO)
                                      .getSheetByName('_ResumenDashboard');
    if (!resumenSheet) {
      throw new Error("La hoja de resumen '_ResumenDashboard' no fue encontrada.");
    }

    const metricasValues = resumenSheet.getRange("B1:B7").getValues();

    return {
      success: true,
      data: {
        lideres: { total_LD: metricasValues[0][0], total_LCF: metricasValues[1][0] },
        celulas: { total_celulas: metricasValues[2][0] },
        ingresos: {
          total_historico: metricasValues[3][0],
          ingresos_mes: metricasValues[4][0],
          tasa_integracion_celula: (metricasValues[6][0] * 100).toFixed(1)
        },
        metricas: { 
          promedio_lcf_por_ld: metricasValues[0][0] > 0 ? (metricasValues[1][0] / metricasValues[0][0]).toFixed(1) : 0 
        },
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error(`[ERROR] en getEstadisticasRapidas (versión optimizada): ${error}`);
    return { success: false, error: error.toString(), data: null };
  }
}

/**
 * Carga únicamente la lista de líderes (LD) para el menú desplegable.
 */
function getListaDeLideres() {
  try {
    const sheetLideres = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO).getSheetByName('Directorio de Líderes');
    if (!sheetLideres) {
      return { success: false, error: 'Hoja de líderes no encontrada', data: [] };
    }

    const dataLideres = sheetLideres.getRange(2, 1, sheetLideres.getLastRow() - 1, 3).getValues();
    const lideresParaSelector = dataLideres
      .filter(row => row[2] === 'LD' && row[0])
      .map(row => ({ ID_Lider: row[0], Nombre_Lider: row[1] }));

    return { success: true, data: lideresParaSelector };
  } catch (error) {
    console.error(`[ERROR] en getListaDeLideres: ${error}`);
    return { success: false, error: error.toString(), data: [] };
  }
}

// Crear endpoint optimizado para ingresos de un LCF específico
function getIngresosData(lcfId) {
  try {
    // Intentar cache primero
    const cache = CacheService.getScriptCache();
    const cacheKey = `INGRESOS_LCF_${lcfId}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log(`[CACHE HIT] Ingresos para ${lcfId}`);
      return JSON.parse(cached);
    }
    
    // Cargar solo la hoja de ingresos, no todo el directorio
    const ss = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    const sheet = ss.getSheetByName('Ingresos');
    
    if (!sheet || sheet.getLastRow() < 2) {
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // Buscar columna ID_LCF
    const colIDLCF = findCol(headers, ['ID_LCF', 'ID LCF']);
    if (colIDLCF === -1) {
      console.error('No se encontró columna ID_LCF en Ingresos');
      return [];
    }
    
    // Filtrar solo los ingresos de este LCF
    const ingresosLCF = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][colIDLCF] === lcfId) {
        // Construir objeto ingreso
        const ingreso = {};
        headers.forEach((header, index) => {
          ingreso[header] = data[i][index];
        });
        ingresosLCF.push(ingreso);
      }
    }
    
    // Cachear por 5 minutos
    cache.put(cacheKey, JSON.stringify(ingresosLCF), 300);
    
    console.log(`[DEBUG] ${ingresosLCF.length} ingresos encontrados para LCF ${lcfId}`);
    return ingresosLCF;
    
  } catch (error) {
    console.error('Error en getIngresosData:', error);
    return [];
  }
}

// ==================== SISTEMA DE CARGA SELECTIVA ====================

function cargarMaestroAsistentesSelectivo(idsAlmas) {
  if (!idsAlmas || idsAlmas.size === 0) return [];
  
  try {
    const cache = CacheService.getScriptCache();
    const cacheKey = 'MAESTRO_' + Array.from(idsAlmas).slice(0, 5).join('_');
    const cached = cache.get(cacheKey);
    if (cached) return JSON.parse(cached);
    
    const ss = SpreadsheetApp.openById(CONFIG.SHEETS.REPORTE_CELULAS);
    const sheet = ss.getSheetByName('Maestro_Asistentes');
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    const resultado = [];
    
    for (let i = 1; i < data.length; i++) {
      if (idsAlmas.has(String(data[i][0]))) {
        resultado.push({
          ID_Asistente: String(data[i][0] || ''),
          Nombre: String(data[i][1] || ''),
          Temas_Completados: String(data[i][2] || '0/12'),
          Porcentaje: parseFloat(data[i][4] || 0),
          Estado: String(data[i][5] || 'Sin datos')
        });
      }
    }
    
    cache.put(cacheKey, JSON.stringify(resultado), 300);
    return resultado;
    
  } catch (e) {
    console.warn('Error cargando Maestro_Asistentes:', e);
    return [];
  }
}

function cargarInteraccionesSelectivo(idsAlmas) {
  if (!idsAlmas || idsAlmas.size === 0) return [];
  
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEETS.REGISTRO_INTERACCIONES);
    const sheet = ss.getSheetByName('Registro de Interacciones') || ss.getSheets()[0];
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    const resultado = [];
    
    for (let i = 1; i < data.length; i++) {
      if (idsAlmas.has(String(data[i][1]))) {
        resultado.push({
          ID_Alma: String(data[i][1] || ''),
          Nombre_Alma: String(data[i][2] || ''),
          Timestamp_Interaccion: data[i][3],
          Resultado: String(data[i][13] || ''),
          Medio_Contacto: String(data[i][12] || '')
        });
      }
    }
    
    return resultado;
    
  } catch (e) {
    console.warn('Error cargando interacciones:', e);
    return [];
  }
}

function cargarVisitasSelectivo(idsAlmas) {
  if (!idsAlmas || idsAlmas.size === 0) return [];
  
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEETS.VISITAS_BENDICION);
    const sheet = ss.getSheetByName('Registro de Visitas') || ss.getSheets()[0];
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    const resultado = [];
    
    for (let i = 1; i < data.length; i++) {
      if (idsAlmas.has(String(data[i][1]))) {
        resultado.push({
          ID_Alma: String(data[i][1] || ''),
          Timestamp_Visita: data[i][2],
          Estatus_Visita: String(data[i][12] || ''),
          Resultado_Visita: String(data[i][13] || '')
        });
      }
    }
    
    return resultado;
    
  } catch (e) {
    console.warn('Error cargando visitas:', e);
    return [];
  }
}

/**
 * Endpoint para que el frontend fuerce la recarga de datos (Cache Busting).
 * Limpia la caché, recarga desde Sheets y devuelve el análisis completo.
 */
function forceReloadDashboardData() {
  try {
    console.log('Solicitud de recarga forzada recibida desde el Frontend.');
    
    // Forzar la carga desde Sheets (ignora y sobrescribe la caché)
    const directorioData = cargarDirectorioCompleto(true);

    // Realizar el análisis (mismo proceso que getDashboardData)
    if (!directorioData || (!directorioData.lideres.length && !directorioData.celulas.length && !directorioData.ingresos.length)) {
      return { success: true, data: createEmptyAnalysis() };
    }

    const analisis = {
      lideres: analizarLideres(directorioData.lideres || []),
      celulas: analizarCelulas(directorioData.celulas || []),
      ingresos: analizarIngresos(directorioData.ingresos || []),
      datosBase: directorioData,
      metricas: calcularMetricasGenerales(directorioData),
      alertas: generarAlertas(directorioData),
      timestamp: directorioData.timestamp 
    };

    return {
      success: true,
      data: analisis
    };

  } catch (error) {
    console.error('Error crítico en forceReloadDashboardData:', error);
    return {
      success: false,
      error: 'Error al forzar la recarga de datos. Detalle: ' + error.toString(),
      data: null
    };
  }
}

// DESPUÉS (BIEN):
function contarCelulasActivas(celulas) {
  return celulas.filter(c => 
    c.Estado === 'Activo' || 
    c.Estado === 'Saludable' || 
    c.Estado === 'En Crecimiento'
  ).length;
}

// ANTES (MAL):
En_Celula: Math.random() > 0.5

// DESPUÉS (BIEN):
function verificarEnCelula(idAlma, celulas) {
  return celulas.some(celula => 
    celula.Miembros.some(m => m.ID_Miembro === idAlma)
  );
}

/**
 * Carga solo los datos de DIRECTORIO. Usa caché con compresión.
 */
/**
 * Carga solo los datos de DIRECTORIO. Usa caché con compresión.
 * Esta es la versión LIGERA y RÁPIDA.
 */
function cargarDirectorioCompleto(forceReload = false) {
  if (forceReload) {
    clearCache();
  } else {
    const cachedData = getCacheData();
    if (cachedData) {
      return cachedData;
    }
  }

  console.log('Cargando datos de DIRECTORIO desde Google Sheets...');
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    const lideres = cargarHojaLideres(spreadsheet);
    const celulas = cargarHojaCelulas(spreadsheet);
    const ingresos = cargarHojaIngresos(spreadsheet);

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
    return data;

  } catch (error) {
    console.error('❌ Error cargando directorio completo:', error);
    return { lideres: [], celulas: [], ingresos: [], error: error.toString() };
  }
}

// ==================== CÁLCULO DE ACTIVIDAD (Implementación Nueva) ====================

/**
 * Lee los archivos externos y calcula la última fecha de interacción para cada líder.
 * V2: Ahora acepta la lista de células para crear un mapa de Célula->Líder.
 */
function calcularActividadLideres(celulas) {
  console.log('Calculando actividad de líderes con mapeo de células...');
  
  // Si no hay células, retornar mapas vacíos inmediatamente
  if (!celulas || celulas.length === 0) {
    return new Map();
  }
  
  const actividadMap = new Map();
  
  // OPTIMIZACIÓN: Crear mapa en una sola expresión
  const celulaLiderMap = new Map(
    celulas
      .filter(c => c?.ID_Celula && c?.ID_LCF_Responsable)
      .map(c => [c.ID_Celula, c.ID_LCF_Responsable])
  );
  console.log(`Mapa Célula->Líder creado con ${celulaLiderMap.size} registros.`);
  
  // OPTIMIZACIÓN: Solo procesar sheets externos si hay células
  if (celulaLiderMap.size === 0) {
    return actividadMap;
  }
  
  // Cache de resultados de sheets externos
  const cacheKey = 'ACTIVIDAD_CACHE';
  const cache = CacheService.getScriptCache();
  const cached = cache.get(cacheKey);
  
  if (cached) {
    console.log('Usando actividad desde caché');
    return new Map(JSON.parse(cached));
  }
  
  // 2. Procesar Reportes de Células
  if (CONFIG.SHEETS.REPORTE_CELULAS) {
    try {
      procesarHojaActividad(
        CONFIG.SHEETS.REPORTE_CELULAS,
        CONFIG.TABS.ACTIVIDAD_CELULAS,
        ['Timestamp', 'Fecha', 'Marca temporal'],
        ['ID Célula', 'ID_Celula', 'Id de la célula'],
        actividadMap,
        celulaLiderMap
      );
    } catch(e) {
      console.warn('Error procesando reportes de células:', e);
    }
  }
  
  // 3. Procesar Visitas de Bendición
  if (CONFIG.SHEETS.VISITAS_BENDICION) {
    try {
      procesarHojaActividad(
        CONFIG.SHEETS.VISITAS_BENDICION,
        CONFIG.TABS.ACTIVIDAD_VISITAS,
        ['Timestamp', 'Fecha Visita', 'Marca temporal'],
        ['ID Lider Visitante', 'ID_Lider', 'Visitante', 'ID Lider'],
        actividadMap
      );
    } catch(e) {
      console.warn('Error procesando visitas:', e);
    }
  }
  
  // Guardar en caché por 5 minutos
  try {
    const dataToCache = Array.from(actividadMap.entries());
    cache.put(cacheKey, JSON.stringify(dataToCache), 300);
  } catch(e) {
    console.warn('No se pudo cachear actividad:', e);
  }
  
  console.log(`Actividad encontrada para ${actividadMap.size} líderes.`);
  return actividadMap;
}

/**
 * Función genérica para leer una hoja de actividad y actualizar el mapa.
 * V2: Ahora puede usar un mapa de búsqueda para encontrar el ID de líder final.
 */
function procesarHojaActividad(sheetId, tabName, timestampCols, idCols, actividadMap, idLookupMap = null) {
  try {
    const ss = SpreadsheetApp.openById(sheetId);
    const sheet = tabName ? ss.getSheetByName(tabName) : ss.getSheets()[0];
    if (!sheet) return;

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return;
    const headers = data[0].map(h => h.toString().trim());

    const timestampIndex = headers.findIndex(h => timestampCols.includes(h));
    const idIndex = headers.findIndex(h => idCols.includes(h));

    if (timestampIndex === -1 || idIndex === -1) {
      console.warn(`En la hoja "${sheet.getName()}", no se encontró una de las columnas requeridas (Timestamp o ID). Se buscaba Timestamp en [${timestampCols.join(', ')}] e ID en [${idCols.join(', ')}]`);
      return;
    }

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      let idInicial = String(row[idIndex] || '').trim();
      const timestamp = row[timestampIndex];
      
      // Si se proporcionó un mapa de búsqueda, lo usamos para encontrar el ID del líder.
      const leaderId = idLookupMap ? idLookupMap.get(idInicial) : idInicial;

      // Verificar que el ID del LÍDER exista (después del lookup) y la fecha sea válida
      if (leaderId && timestamp instanceof Date && !isNaN(timestamp.getTime())) {
        const currentDate = timestamp;
        const existingDate = actividadMap.get(leaderId);

        if (!existingDate || currentDate > existingDate) {
          actividadMap.set(leaderId, currentDate);
        }
      }
    }
  } catch (error) {
    console.error(`Error procesando hoja de actividad ID ${sheetId}:`, error);
  }
}

/**
 * Integra los datos de actividad calculados en la lista de líderes.
 */
function integrarActividadLideres(lideres, actividadMap) {
  const hoy = new Date();

  return lideres.map(lider => {
    const ultimaActividad = actividadMap.get(lider.ID_Lider);
    let diasInactivo = null;
    let estadoActividad = '-';

    if (ultimaActividad) {
      // Convertir la fecha (puede venir serializada desde caché)
      const fechaActividad = new Date(ultimaActividad);
      diasInactivo = Math.floor((hoy - fechaActividad) / (1000 * 60 * 60 * 24));

      if (diasInactivo <= CONFIG.DIAS_INACTIVO.ACTIVO) {
        estadoActividad = 'Activo';
      } else if (diasInactivo <= CONFIG.DIAS_INACTIVO.ALERTA) {
        estadoActividad = 'Alerta';
      } else {
        estadoActividad = 'Inactivo';
      }
    }

    return {
      ...lider,
      // Guardar como ISO String para caché
      Ultima_Actividad: ultimaActividad ? new Date(ultimaActividad).toISOString() : null,
      Dias_Inactivo: diasInactivo,
      Estado_Actividad: estadoActividad
    };
  });
}

// ==================== VINCULACIÓN ALMA-CÉLULA (Implementación Nueva) ====================

/**
 * Crea un mapa que indica a qué célula pertenece cada alma.
 * @returns {Map<string, string>} - Mapa de ID_Alma -> ID_Celula
 */
function mapearAlmasACelulas(celulas) {
  const mapa = new Map();
  celulas.forEach(celula => {
    celula.Miembros.forEach(miembro => {
      if (miembro.ID_Miembro) {
        // ID_Miembro en Células se asume que es el ID_Alma en Ingresos
        mapa.set(miembro.ID_Miembro, celula.ID_Celula);
      }
    });
  });
  return mapa;
}

/**
 * Integra la información de la célula en la lista de ingresos (almas).
 */
function integrarAlmasACelulas(ingresos, almasEnCelulasMap) {
  ingresos.forEach(ingreso => {
    const idCelula = almasEnCelulasMap.get(ingreso.ID_Alma);
    ingreso.ID_Celula = idCelula || null;
    ingreso.En_Celula = !!idCelula;
  });
}


// ==================== CARGA DE HOJAS (Refactorizado) ====================

// Helper global para búsqueda flexible de columnas
const findCol = (headers, names) => headers.findIndex(h => names.some(name => h.includes(name)));

function cargarHojaLideres(spreadsheet) {
  try {
    const sheet = spreadsheet.getSheetByName(CONFIG.TABS.LIDERES);
    if (!sheet) return [];

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];

    const headers = data[0].map(h => h.toString().trim());
    const lideres = [];

    const columnas = {
      idLider: findCol(headers, ['ID_Lider', 'ID Líder', 'ID']),
      nombreLider: findCol(headers, ['Nombre_Lider', 'Nombre Líder', 'Nombre']),
      rol: findCol(headers, ['Rol', 'Tipo']),
      idLiderDirecto: findCol(headers, ['ID_Lider_Directo', 'Supervisor', 'ID LD']),
      congregacion: findCol(headers, ['Congregación', 'Congregacion'])
    };

    if (columnas.idLider === -1 || columnas.rol === -1) {
      console.error('Faltan columnas críticas (ID o Rol) en la hoja de Líderes.');
      return [];
    }

    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      const idLider = String(row[columnas.idLider] || '').trim();

      // CORRECCIÓN: Si no hay ID, saltar la fila (Integridad de datos).
      if (!idLider) continue;

      const lider = {
        ID_Lider: idLider,
        Nombre_Lider: String(row[columnas.nombreLider] || '').trim(),
        // CORRECCIÓN: Normalizar Rol
        Rol: String(row[columnas.rol] || '').trim().toUpperCase(),
        ID_Lider_Directo: String(row[columnas.idLiderDirecto] || '').trim(),
        Congregacion: String(row[columnas.congregacion] || '').trim(),

        // Campos calculados (Inicialización)
        Estado_Actividad: 'Desconocido',
        Dias_Inactivo: null,
        Ultima_Actividad: null
      };

      lideres.push(lider);
    }

    return lideres;
  } catch (error) {
    console.error('Error cargando líderes:', error);
    return [];
  }
}

function cargarHojaCelulas(spreadsheet) {
  try {
    const sheet = spreadsheet.getSheetByName(CONFIG.TABS.CELULAS);
    if (!sheet) return [];

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];

    const headers = data[0].map(h => h.toString().trim());
    const celulasMap = new Map();

    const columnas = {
      idCelula: findCol(headers, ['ID Célula', 'ID_Celula', 'ID']),
      nombreCelula: findCol(headers, ['Nombre Célula']),
      // ID_Miembro es crítico para vincular con ID_Alma
      idMiembro: findCol(headers, ['ID Miembro', 'ID_Miembro', 'ID Alma']),
      nombreMiembro: findCol(headers, ['Nombre Miembro']),
      idLCF: findCol(headers, ['ID LCF', 'ID_LCF']),
      nombreLCF: findCol(headers, ['Nombre LCF'])
    };

    if (columnas.idCelula === -1) {
      console.error('Falta columna crítica ID Célula.');
      return [];
    }

    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      const idCelula = String(row[columnas.idCelula] || '').trim();

      // CORRECCIÓN: Si no hay ID de Célula, saltar fila.
      if (!idCelula) continue;

      if (!celulasMap.has(idCelula)) {
        celulasMap.set(idCelula, {
          ID_Celula: idCelula,
          Nombre_Celula: String(row[columnas.nombreCelula] || '').trim(),
          ID_LCF_Responsable: String(row[columnas.idLCF] || '').trim(),
          Nombre_LCF_Responsable: String(row[columnas.nombreLCF] || '').trim(),
          Miembros: [],
          Total_Miembros: 0,
          Estado: 'Activa'
        });
      }

      const celula = celulasMap.get(idCelula);

      const idMiembro = columnas.idMiembro !== -1 ? String(row[columnas.idMiembro] || '').trim() : null;
      const nombreMiembro = columnas.nombreMiembro !== -1 ? String(row[columnas.nombreMiembro] || '').trim() : null;

      // Registrar miembro solo si tiene ID o Nombre
      if (idMiembro || nombreMiembro) {
        celula.Miembros.push({
          ID_Miembro: idMiembro,
          Nombre_Miembro: nombreMiembro
        });
        celula.Total_Miembros++;
      }
    }

    // Determinar estado de cada célula
    const celulas = [];
    celulasMap.forEach(celula => {
      if (celula.Total_Miembros === 0) {
        celula.Estado = 'Vacía';
      } else if (celula.Total_Miembros < CONFIG.CELULAS.MIN_MIEMBROS) {
        celula.Estado = 'En Riesgo';
      } else if (celula.Total_Miembros > CONFIG.CELULAS.MAX_MIEMBROS) {
        celula.Estado = 'Lista para Multiplicar';
      } else if (celula.Total_Miembros >= CONFIG.CELULAS.IDEAL_MIEMBROS) {
        celula.Estado = 'Saludable';
      } else {
        celula.Estado = 'En Crecimiento';
      }
      celulas.push(celula);
    });

    return celulas;
  } catch (error) {
    console.error('Error cargando células:', error);
    return [];
  }
}


function cargarHojaIngresos(spreadsheet) {
  try {
    const sheet = spreadsheet.getSheetByName(CONFIG.TABS.INGRESOS);
    if (!sheet || sheet.getLastRow() < 2) return [];

    const todosLosDatos = sheet.getDataRange().getValues();
    const headers = todosLosDatos.shift(); // Saca la fila de encabezados y la guarda. 'todosLosDatos' ahora solo contiene filas de datos.

    // ==================== INICIO DE LA MODIFICACIÓN ====================
    const estadoColIndex = headers.indexOf('Estado');
    let datosActivos = [];

    if (estadoColIndex !== -1) {
      // 1. Filtrar para mantener solo las almas cuyo estado NO sea "Baja"
      datosActivos = todosLosDatos.filter(row => row[estadoColIndex] !== 'Baja');
      console.log(`Ingresos: Se encontraron ${todosLosDatos.length} registros, se procesarán ${datosActivos.length} activos.`);
    } else {
      // Si no hay columna de estado, procesar todos por seguridad (comportamiento anterior).
      datosActivos = todosLosDatos;
      console.warn("Advertencia: No se encontró la columna 'Estado' en la hoja Ingresos. No se pudieron filtrar las bajas.");
    }
    // ===================== FIN DE LA MODIFICACIÓN ======================

    if (datosActivos.length === 0) return [];

    const ingresos = [];
    const hoy = new Date();
    
    // El resto de tu código original ahora opera sobre 'datosActivos'
    const columnas = {
      idAlma: headers.indexOf('ID_Alma'),
      timestamp: headers.indexOf('Timestamp'),
      idLCF: headers.indexOf('ID LCF'),
      nombreLCF: headers.indexOf('Nombre LCF'),
      idLD: headers.indexOf('ID LD'),
      nombreLD: headers.indexOf('Nombre LD'),
      nombresAlma: headers.indexOf('Nombres del Alma'),
      apellidosAlma: headers.indexOf('Apellidos del Alma'),
      telefono: headers.indexOf('Teléfono'),
      aceptoJesus: headers.indexOf('Aceptó a Jesús'),
      deseaVisita: headers.indexOf('Desea Visita'),
      fuenteContacto: headers.indexOf('Fuente')
    };

    // 2. El bucle ahora recorre la lista ya filtrada de 'datosActivos'
    for (const row of datosActivos) {
      const idAlma = String(row[columnas.idAlma] || '').trim();
      if (!idAlma) continue;

      const rawTimestamp = columnas.timestamp !== -1 ? row[columnas.timestamp] : null;
      let fechaIngreso = null;
      let diasDesdeIngreso = null;

      if (rawTimestamp instanceof Date && !isNaN(rawTimestamp.getTime())) {
        fechaIngreso = rawTimestamp;
        diasDesdeIngreso = Math.floor((hoy - fechaIngreso) / (1000 * 60 * 60 * 24));
      }

      const nombres = String(row[columnas.nombresAlma] || '').trim();
      const apellidos = String(row[columnas.apellidosAlma] || '').trim();
      const idLCF = String(row[columnas.idLCF] || '').trim();
      const aceptoJesus = normalizeYesNo(row[columnas.aceptoJesus]);
      const deseaVisita = normalizeYesNo(row[columnas.deseaVisita]);

      const ingreso = {
        ID_Alma: idAlma,
        Timestamp: fechaIngreso ? fechaIngreso.toISOString() : null,
        ID_LCF: idLCF,
        Nombre_LCF: String(row[columnas.nombreLCF] || '').trim(),
        ID_LD: String(row[columnas.idLD] || '').trim(),
        Nombre_LD: String(row[columnas.nombreLD] || '').trim(),
        Nombres: nombres,
        Apellidos: apellidos,
        Nombre_Completo: `${nombres} ${apellidos}`.trim(),
        Telefono: String(row[columnas.telefono] || '').trim(),
        Acepto_Jesus: aceptoJesus,
        Desea_Visita: deseaVisita,
        Fuente_Contacto: String(row[columnas.fuenteContacto] || '').trim(),
        Dias_Desde_Ingreso: diasDesdeIngreso,
        Estado_Asignacion: idLCF ? 'Asignado' : 'Pendiente',
        Prioridad: determinarPrioridad(deseaVisita, aceptoJesus),
        ID_Celula: null,
        En_Celula: false
      };
      ingresos.push(ingreso);
    }
    return ingresos;

  } catch (error) {
    console.error('Error cargando ingresos:', error);
    return [];
  }
}

// ==================== ANÁLISIS DE DATOS ====================

function analizarLideres(lideres) {
  const analisis = {
    total_LD: 0, total_LCF: 0,
    LD_activos: 0, LD_alertas: 0, LD_inactivos: 0,
    LCF_activos: 0, LCF_alertas: 0, LCF_inactivos: 0,
    LCF_sin_LD: [],
    por_congregacion: {},
    tasa_actividad_LD: 0, tasa_actividad_LCF: 0
  };

  if (!lideres.length) return analisis;

  lideres.forEach(lider => {
    const esActivoPuro = lider.Estado_Actividad === 'Activo';
    const esAlerta = lider.Estado_Actividad === 'Alerta';
    // Inactivo incluye 'Inactivo' y 'Sin Datos'
    const esInactivo = lider.Estado_Actividad === 'Inactivo' || lider.Estado_Actividad === 'Sin Datos';

    if (lider.Rol === 'LD') {
      analisis.total_LD++;
      if (esActivoPuro) analisis.LD_activos++;
      else if (esAlerta) analisis.LD_alertas++;
      else if (esInactivo) analisis.LD_inactivos++;

    } else if (lider.Rol === 'LCF') {
      analisis.total_LCF++;
      if (esActivoPuro) analisis.LCF_activos++;
      else if (esAlerta) analisis.LCF_alertas++;
      else if (esInactivo) analisis.LCF_inactivos++;

      if (!lider.ID_Lider_Directo) {
        analisis.LCF_sin_LD.push({ID: lider.ID_Lider, Nombre: lider.Nombre_Lider});
      }
    }

    // Por congregación
    if (lider.Congregacion) {
      if (!analisis.por_congregacion[lider.Congregacion]) {
        analisis.por_congregacion[lider.Congregacion] = { LD: 0, LCF: 0, activos: 0 };
      }
      if (lider.Rol === 'LD') analisis.por_congregacion[lider.Congregacion].LD++;
      if (lider.Rol === 'LCF') analisis.por_congregacion[lider.Congregacion].LCF++;
      if (esActivoPuro) analisis.por_congregacion[lider.Congregacion].activos++;
    }
  });

  // Tasa de actividad (Solo 'Activo' puro cuenta como 100% saludable)
  analisis.tasa_actividad_LD = analisis.total_LD > 0 ?
    ((analisis.LD_activos / analisis.total_LD) * 100).toFixed(1) : 0;

  analisis.tasa_actividad_LCF = analisis.total_LCF > 0 ?
    ((analisis.LCF_activos / analisis.total_LCF) * 100).toFixed(1) : 0;

  return analisis;
}

function analizarCelulas(celulas) {
  const analisis = {
    total_celulas: 0, celulas_activas: 0, celulas_vacias: 0, celulas_en_riesgo: 0,
    celulas_saludables: 0, celulas_para_multiplicar: 0, total_miembros: 0,
    promedio_miembros: 0, celulas_por_LCF: {}
  };

  if (!celulas.length) return analisis;

  analisis.total_celulas = celulas.length;

  celulas.forEach(celula => {
    if (celula.Estado !== 'Vacía') {
        analisis.celulas_activas++;
    }

    switch(celula.Estado) {
      case 'Vacía': analisis.celulas_vacias++; break;
      case 'En Riesgo': analisis.celulas_en_riesgo++; break;
      case 'Saludable': analisis.celulas_saludables++; break;
      case 'Lista para Multiplicar': analisis.celulas_para_multiplicar++; break;
    }

    analisis.total_miembros += celula.Total_Miembros;

    // Por LCF
    if (celula.ID_LCF_Responsable) {
      if (!analisis.celulas_por_LCF[celula.ID_LCF_Responsable]) {
        analisis.celulas_por_LCF[celula.ID_LCF_Responsable] = {
          nombre: celula.Nombre_LCF_Responsable, total_celulas: 0, total_miembros: 0
        };
      }
      analisis.celulas_por_LCF[celula.ID_LCF_Responsable].total_celulas++;
      analisis.celulas_por_LCF[celula.ID_LCF_Responsable].total_miembros += celula.Total_Miembros;
    }
  });

  // Promedio se calcula sobre células activas
  if (analisis.celulas_activas > 0) {
    analisis.promedio_miembros = (analisis.total_miembros / analisis.celulas_activas).toFixed(1);
  }

  return analisis;
}

function analizarIngresos(ingresos) {
  const hoy = new Date();

  const analisis = {
    total_historico: 0, ingresos_hoy: 0, ingresos_semana: 0, ingresos_mes: 0,
    asignados: 0, pendientes_asignacion: 0, aceptaron_jesus: 0, desean_visita: 0,
    en_celula: 0, sin_celula: 0, // Nuevas métricas de integración
    por_fuente: {}, por_LCF: {}, por_LD: {},
    tasa_asignacion: 0, tasa_integracion_celula: 0 // Nueva tasa
  };

  if (!ingresos.length) return analisis;

  analisis.total_historico = ingresos.length;

  ingresos.forEach(ingreso => {
    if (ingreso.Timestamp) {
      const fechaIngreso = new Date(ingreso.Timestamp);

      // CORRECCIÓN: Comparación robusta de fechas usando Utilities.formatDate y TIMEZONE
      const formattedToday = Utilities.formatDate(hoy, CONFIG.TIMEZONE, 'yyyy-MM-dd');
      const formattedIngreso = Utilities.formatDate(fechaIngreso, CONFIG.TIMEZONE, 'yyyy-MM-dd');

      if (formattedIngreso === formattedToday) {
        analisis.ingresos_hoy++;
      }

      // Usar Días_Desde_Ingreso (calculado en la carga)
      if (ingreso.Dias_Desde_Ingreso !== null) {
        if (ingreso.Dias_Desde_Ingreso <= 7) analisis.ingresos_semana++;
        if (ingreso.Dias_Desde_Ingreso <= 30) analisis.ingresos_mes++;
      }
    }

    // Estado de asignación (LCF)
    if (ingreso.Estado_Asignacion === 'Asignado') {
      analisis.asignados++;
    } else {
      analisis.pendientes_asignacion++;
    }

    // Estado de integración (Célula)
    if (ingreso.En_Celula) {
      analisis.en_celula++;
    } else {
      analisis.sin_celula++;
    }

    // Decisiones espirituales (Datos ya normalizados a 'SI')
    if (ingreso.Acepto_Jesus === 'SI') analisis.aceptaron_jesus++;
    if (ingreso.Desea_Visita === 'SI') analisis.desean_visita++;

    // Por fuente
    const fuente = ingreso.Fuente_Contacto || 'No especificada';
    if (!analisis.por_fuente[fuente]) analisis.por_fuente[fuente] = 0;
    analisis.por_fuente[fuente]++;

    // Por LCF y LD
    if (ingreso.ID_LCF) {
      if (!analisis.por_LCF[ingreso.ID_LCF]) {
        analisis.por_LCF[ingreso.ID_LCF] = { nombre: ingreso.Nombre_LCF, total: 0 };
      }
      analisis.por_LCF[ingreso.ID_LCF].total++;
    }
    if (ingreso.ID_LD) {
      if (!analisis.por_LD[ingreso.ID_LD]) {
        analisis.por_LD[ingreso.ID_LD] = { nombre: ingreso.Nombre_LD, total: 0 };
      }
      analisis.por_LD[ingreso.ID_LD].total++;
    }
  });

  analisis.tasa_asignacion = analisis.total_historico > 0 ?
    ((analisis.asignados / analisis.total_historico) * 100).toFixed(1) : 0;

  analisis.tasa_integracion_celula = analisis.total_historico > 0 ?
    ((analisis.en_celula / analisis.total_historico) * 100).toFixed(1) : 0;

  return analisis;
}

// ==================== MÉTRICAS GENERALES (Refactorizado) ====================
function calcularMetricasGenerales(data) {
  const metricas = {
    cobertura_liderazgo: 0, promedio_lcf_por_ld: 0, promedio_almas_por_lcf: 0,
    tasa_ocupacion_celulas: 0, celulas_necesitan_atencion: 0, potencial_multiplicacion: 0,
    velocidad_asignacion_promedio: 0, // Pendiente (Requiere fecha de asignación en la fuente)
    almas_sin_celula: 0 // Implementado
  };

  if (!data) return metricas;

  const totalLCF = data.lideres.filter(l => l.Rol === 'LCF').length;
  const lcfConLD = data.lideres.filter(l => l.Rol === 'LCF' && l.ID_Lider_Directo).length;
  const totalLD = data.lideres.filter(l => l.Rol === 'LD').length;

  // 1. Liderazgo
  if (totalLCF > 0) {
    metricas.cobertura_liderazgo = ((lcfConLD / totalLCF) * 100).toFixed(1);
  }

  if (totalLD > 0) {
    metricas.promedio_lcf_por_ld = (totalLCF / totalLD).toFixed(1);
  }

  if (totalLCF > 0) {
    const almasAsignadas = data.ingresos.filter(i => i.Estado_Asignacion === 'Asignado').length;
    metricas.promedio_almas_por_lcf = (almasAsignadas / totalLCF).toFixed(1);
  }

  // 2. Células
  if (data.celulas.length > 0) {
    const celulasActivas = data.celulas.filter(c => c.Estado !== 'Vacía').length;
    metricas.tasa_ocupacion_celulas = ((celulasActivas / data.celulas.length) * 100).toFixed(1);

    metricas.celulas_necesitan_atencion = data.celulas.filter(c =>
      c.Estado === 'En Riesgo' || c.Estado === 'Vacía'
    ).length;

    metricas.potencial_multiplicacion = data.celulas.filter(c =>
      c.Estado === 'Lista para Multiplicar'
    ).length;
  }

  // 3. Ingresos
  // CORRECCIÓN: Calcular almas sin célula
  metricas.almas_sin_celula = data.ingresos.filter(i => !i.En_Celula).length;

  return metricas;
}

// ==================== ALERTAS (Refactorizado) ====================
function generarAlertas(data) {
  const alertas = [];

  if (!data) return alertas;

  // 1. Líderes Inactivos/Alerta
  if (data.lideres) {
    const ldInactivos = data.lideres.filter(l =>
      l.Rol === 'LD' && (l.Estado_Actividad === 'Inactivo' || l.Estado_Actividad === 'Sin Datos')
    );
    if (ldInactivos.length > 0) {
      alertas.push({
        tipo: 'error',
        mensaje: `${ldInactivos.length} Líder(es) de Discípulos (LD) inactivos o sin datos.`,
        detalles: ldInactivos.map(l => `${l.Nombre_Lider} (Días: ${l.Dias_Inactivo || 'N/A'})`)
      });
    }

    const lcfAlerta = data.lideres.filter(l =>
      l.Rol === 'LCF' && l.Estado_Actividad === 'Alerta'
    );
     if (lcfAlerta.length > 0) {
      alertas.push({
        tipo: 'warning',
        mensaje: `${lcfAlerta.length} LCF(s) en estado de Alerta (riesgo de inactividad).`,
        detalles: lcfAlerta.map(l => `${l.Nombre_Lider} (Días: ${l.Dias_Inactivo})`)
      });
    }
  }

  // 2. Almas sin seguimiento
  if (data.ingresos) {
    // Almas sin asignar a LCF por más de 3 días
    const pendientesUrgentesLCF = data.ingresos.filter(i =>
      i.Estado_Asignacion === 'Pendiente' && i.Dias_Desde_Ingreso > 3
    );
    if (pendientesUrgentesLCF.length > 0) {
      alertas.push({
        tipo: 'warning',
        mensaje: `${pendientesUrgentesLCF.length} alma(s) sin asignar a LCF por más de 3 días.`,
        detalles: pendientesUrgentesLCF.slice(0, 5).map(i => i.Nombre_Completo)
      });
    }

    // Almas sin integrar a Célula por más de 14 días
    const pendientesUrgentesCelula = data.ingresos.filter(i =>
      !i.En_Celula && i.Dias_Desde_Ingreso > 14
    );
     if (pendientesUrgentesCelula.length > 0) {
      alertas.push({
        tipo: 'info',
        mensaje: `${pendientesUrgentesCelula.length} alma(s) sin integrar a célula después de 14 días.`,
        detalles: pendientesUrgentesCelula.slice(0, 5).map(i => i.Nombre_Completo)
      });
    }
  }

  // 3. Salud de Células
  if (data.celulas) {
    const celulasVacias = data.celulas.filter(c => c.Estado === 'Vacía');
    if (celulasVacias.length > 0) {
      alertas.push({
        tipo: 'warning',
        mensaje: `${celulasVacias.length} célula(s) vacías.`,
        detalles: celulasVacias.slice(0, 5).map(c => c.Nombre_Celula || `ID: ${c.ID_Celula}`)
      });
    }

    const celulasMultiplicar = data.celulas.filter(c => c.Estado === 'Lista para Multiplicar');
    if (celulasMultiplicar.length > 0) {
      alertas.push({
        tipo: 'success',
        mensaje: `${celulasMultiplicar.length} célula(s) listas para multiplicarse.`,
        detalles: celulasMultiplicar.map(c => c.Nombre_Celula || `ID: ${c.ID_Celula}`)
      });
    }
  }

  return alertas;
}



// ==================== FUNCIÓN MEJORADA PARA LD CON JERARQUÍA COMPLETA ====================

// ==================== FUNCIÓN PRINCIPAL MEJORADA ====================
function getDatosLD(idLD, modoCompleto = false) {
  try {
    checkTimeout();
    // 1. VALIDACIÓN
    if (!idLD) {
      console.log('[DEBUG] getDatosLD llamado sin ID');
      return { success: false, error: 'No se proporcionó ID del LD' };
    }
    
    console.log(`[DEBUG] getDatosLD para: ${idLD}, modoCompleto: ${modoCompleto}`);
    
    // 2. CACHE
    const cache = CacheService.getScriptCache();
    const cacheKey = `LD_${modoCompleto ? 'FULL' : 'BASIC'}_${idLD}`;
    
    const cached = cache.get(cacheKey);
    if (cached) {
      console.log('[DEBUG] Datos obtenidos de caché');
      return JSON.parse(cached);
    }
    
    // 3. CARGAR DATOS SEGÚN MODO
    let resultado;
    if (modoCompleto) {
      resultado = getDatosLDCompleto(idLD);
    } else {
      resultado = getDatosLDBasico(idLD);
    }
    
    // 4. CACHEAR SI ES EXITOSO
    if (resultado.success) {
      const tiempoCache = modoCompleto ? 600 : 300; // 10 min completo, 5 min básico
      cache.put(cacheKey, JSON.stringify(resultado), tiempoCache);
    }
    
    return resultado;
    
  } catch (error) {
    console.error('[ERROR] en getDatosLD:', error);
    return { success: false, error: error.toString() };
  }
}

// ==================== MODO BÁSICO (SIN ESTIMACIONES) ====================
function getDatosLDBasico(idLD) {
  console.log('[DEBUG] Cargando modo básico para LD:', idLD);
  
  const ss = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
  const sheet = ss.getSheetByName('Directorio de Líderes');
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();
  
  // Buscar el LD
  const ldRow = data.find(row => row[0] === idLD && row[2] === 'LD');
  if (!ldRow) {
    return { success: false, error: 'LD no encontrado' };
  }
  
  const ldInfo = {
    ID: ldRow[0],
    Nombre: ldRow[1],
    Estado: ldRow[4] || 'Activo'
  };
  
  // Obtener estructura básica
  const estructura = construirEstructuraLD(idLD, data);
  
  // IMPORTANTE: No incluir métricas estimadas en modo básico
  const resultado = {
    success: true,
    resumen: {
      ld: ldInfo,
      estructura: {
        total_lm: estructura.lm.length,
        total_small_groups: estructura.smallGroups.length,
        total_lcf: estructura.lcfDirectos.length
      },
      // NO incluir métricas falsas aquí
      nota: "Modo básico - Para métricas detalladas, use modo completo"
    },
    cadenas_lm: estructura.lm,
    small_groups_directos: estructura.smallGroups,
    lcf_directos: estructura.lcfDirectos,
    modo: 'basico'
  };
  
  return resultado;
}

// ==================== MODO COMPLETO (VERSIÓN HIPER-OPTIMIZADA) ====================
function getDatosLDCompleto(idLD) {
  console.log('[DEBUG] Cargando modo completo OPTIMIZADO para LD:', idLD);
  
  const dataCompleta = cargarDirectorioCompleto();
  if (!dataCompleta || !dataCompleta.lideres) {
    return { success: false, error: 'Datos del directorio no válidos' };
  }
  
  const { lideres, ingresos, celulas } = dataCompleta;
  const ld = lideres.find(l => l?.ID_Lider === idLD && l?.Rol === 'LD');
  if (!ld) return { success: false, error: `LD ${idLD} no encontrado` };

  // ---- INICIO DE LA OPTIMIZACIÓN ----
  // 1. Crear mapas para búsqueda instantánea en lugar de filtrar repetidamente.
  const almasPorLCF = new Map();
  for (const ingreso of ingresos) {
    if (!almasPorLCF.has(ingreso.ID_LCF)) {
      almasPorLCF.set(ingreso.ID_LCF, []);
    }
    almasPorLCF.get(ingreso.ID_LCF).push(ingreso);
  }

  const celulasPorLCF = new Map();
  for (const celula of celulas) {
    if (!celulasPorLCF.has(celula.ID_LCF_Responsable)) {
      celulasPorLCF.set(celula.ID_LCF_Responsable, []);
    }
    celulasPorLCF.get(celula.ID_LCF_Responsable).push(celula);
  }
  // ---- FIN DE LA OPTIMIZACIÓN ----

  const misLM = lideres.filter(l => l.Rol === 'LM' && l.ID_Lider_Directo === idLD);
  const misSG = lideres.filter(l => (l.Rol === 'SMALL GROUP' || l.Rol === 'SG') && l.ID_Lider_Directo === idLD);
  
  // Se usa la nueva versión de calcularMetricasLider que es mucho más rápida
  const misLCF = lideres.filter(l => l.Rol === 'LCF' && l.ID_Lider_Directo === idLD)
                        .map(lcf => calcularMetricasLider(lcf, almasPorLCF, celulasPorLCF));
  
  const cadenasLM = misLM.map(lm => {
    const smallGroups = lideres.filter(l => (l.Rol === 'SMALL GROUP' || l.Rol === 'SG') && l.ID_Lider_Directo === lm.ID_Lider);
    const lcfDirectosLM = lideres.filter(l => l.Rol === 'LCF' && l.ID_Lider_Directo === lm.ID_Lider)
                                 .map(lcf => calcularMetricasLider(lcf, almasPorLCF, celulasPorLCF));

    const smallGroupsConLCF = smallGroups.map(sg => {
      const lcfsDelSG = lideres.filter(l => l.Rol === 'LCF' && l.ID_Lider_Directo === sg.ID_Lider)
                               .map(lcf => calcularMetricasLider(lcf, almasPorLCF, celulasPorLCF));
      
      const totalAlmasDelSG = lcfsDelSG.reduce((sum, lcf) => sum + (lcf.metricas.total_almas || 0), 0);
      return {
        ...sg,
        lcfs: lcfsDelSG,
        metricas: { total_lcf: lcfsDelSG.length, lcf_activos: lcfsDelSG.filter(l => l.Estado_Actividad === 'Activo').length, total_almas: totalAlmasDelSG }
      };
    });
    
    const totalAlmasEnCadena = smallGroupsConLCF.reduce((sum, sg) => sum + (sg.metricas.total_almas || 0), 0) + lcfDirectosLM.reduce((sum, lcf) => sum + (lcf.metricas.total_almas || 0), 0);
    return {
      ...lm,
      smallGroups: smallGroupsConLCF,
      lcfDirectos: lcfDirectosLM,
      metricas: { total_small_groups: smallGroups.length, total_lcf_en_cadena: smallGroupsConLCF.reduce((sum, sg) => sum + sg.metricas.total_lcf, 0) + lcfDirectosLM.length, total_almas_en_cadena: totalAlmasEnCadena }
    };
  });
  
  const smallGroupsDirectos = misSG.map(sg => {
    const lcfsDelSG = lideres.filter(l => l.Rol === 'LCF' && l.ID_Lider_Directo === sg.ID_Lider)
                             .map(lcf => calcularMetricasLider(lcf, almasPorLCF, celulasPorLCF));
    const totalAlmasDelSG = lcfsDelSG.reduce((sum, lcf) => sum + (lcf.metricas.total_almas || 0), 0);
    return {
      ...sg,
      lcfs: lcfsDelSG,
      metricas: { total_lcf: lcfsDelSG.length, lcf_activos: lcfsDelSG.filter(l => l.Estado_Actividad === 'Activo').length, total_almas: totalAlmasDelSG }
    };
  });
  
  // El resto de la lógica para el resumen se simplifica porque los datos ya están procesados
  const equipoCompleto = [...misLCF, ...cadenasLM.flatMap(lm => lm.lcfDirectos), ...cadenasLM.flatMap(lm => lm.smallGroups.flatMap(sg => sg.lcfs)), ...smallGroupsDirectos.flatMap(sg => sg.lcfs)];
  const lcfIDs = new Set(equipoCompleto.map(lcf => lcf.ID_Lider));
  let totalAlmas = 0;
  let almasEnCelula = 0;
  equipoCompleto.forEach(lcf => {
      totalAlmas += lcf.metricas.total_almas;
      almasEnCelula += lcf.metricas.almas_en_celula;
  });

  return {
    success: true,
    resumen: {
      ld: { ID: ld.ID_Lider, Nombre: ld.Nombre_Lider, Estado: ld.Estado_Actividad || 'Activo' },
      estructura: {
        total_lm: misLM.length,
        total_small_groups: misSG.length + cadenasLM.reduce((sum, lm) => sum + lm.metricas.total_small_groups, 0),
        total_lcf: lcfIDs.size
      },
      metricas: {
        total_almas: totalAlmas,
        almas_en_celula: almasEnCelula,
        almas_sin_celula: totalAlmas - almasEnCelula,
        tasa_integracion: totalAlmas > 0 ? ((almasEnCelula / totalAlmas) * 100).toFixed(1) : 0
      }
    },
    cadenas_lm: cadenasLM,
    small_groups_directos: smallGroupsDirectos,
    lcf_directos: misLCF,
    equipo: equipoCompleto,
    modo: 'completo'
  };
}

// ==================== FUNCIONES AUXILIARES ====================

function construirEstructuraLD(idLD, data) {
  const misLM = data.filter(r => r[2] === 'LM' && r[3] === idLD);
  const misSG = data.filter(r => r[2] === 'SMALL GROUP' && r[3] === idLD);
  const misLCF = data.filter(r => r[2] === 'LCF' && r[3] === idLD);
  
  // Construir jerarquía básica sin datos estimados
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

function construirEstructuraCompleta(idLD, lideres, dataCompleta) {
  // Similar a tu código actual pero separado para claridad
  const misLM = lideres.filter(l => l.Rol === 'LM' && l.ID_Lider_Directo === idLD);
  
  // Construir cadenas con datos REALES
  const cadenasLM = misLM.map(lm => {
    const smallGroups = lideres.filter(l => 
      l.Rol === 'SMALL GROUP' && l.ID_Lider_Directo === lm.ID_Lider
    );
    
    // ... resto de la lógica con datos reales
    return construirCadenaLM(lm, smallGroups, lideres, dataCompleta);
  });
  
  // Similar para small groups y LCF directos
  const smallGroupsDirectos = construirSGDirectos(idLD, lideres, dataCompleta);
  const lcfDirectosConMetricas = construirLCFDirectos(idLD, lideres, dataCompleta);
  
  return { cadenasLM, smallGroupsDirectos, lcfDirectosConMetricas };
}

function calcularMetricasRealesLD(estructura, dataCompleta) {
  // Calcular métricas REALES, no estimaciones
  let totalAlmas = 0;
  let almasEnCelula = 0;
  let totalLCF = 0;
  let totalSmallGroups = 0;
  
  // Contar LCF directos
  estructura.lcfDirectosConMetricas.forEach(lcf => {
    const almasAsignadas = dataCompleta.ingresos?.filter(i => i.ID_LCF === lcf.ID_Lider) || [];
    totalAlmas += almasAsignadas.length;
    almasEnCelula += almasAsignadas.filter(a => a.En_Celula).length;
    totalLCF++;
  });
  
  // Contar en cadenas LM
  estructura.cadenasLM.forEach(lm => {
    // Contar Small Groups en la cadena
    totalSmallGroups += lm.smallGroups.length;
    
    // Contar LCF en Small Groups
    lm.smallGroups.forEach(sg => {
      sg.lcfs.forEach(lcf => {
        const almasAsignadas = dataCompleta.ingresos?.filter(i => i.ID_LCF === lcf.ID_Lider) || [];
        totalAlmas += almasAsignadas.length;
        almasEnCelula += almasAsignadas.filter(a => a.En_Celula).length;
        totalLCF++;
      });
    });
    
    // Contar LCF directos del LM
    lm.lcfDirectos.forEach(lcf => {
      const almasAsignadas = dataCompleta.ingresos?.filter(i => i.ID_LCF === lcf.ID_Lider) || [];
      totalAlmas += almasAsignadas.length;
      almasEnCelula += almasAsignadas.filter(a => a.En_Celula).length;
      totalLCF++;
    });
  });
  
  // Contar Small Groups directos
  estructura.smallGroupsDirectos.forEach(sg => {
    totalSmallGroups++;
    sg.lcfs.forEach(lcf => {
      const almasAsignadas = dataCompleta.ingresos?.filter(i => i.ID_LCF === lcf.ID_Lider) || [];
      totalAlmas += almasAsignadas.length;
      almasEnCelula += almasAsignadas.filter(a => a.En_Celula).length;
      totalLCF++;
    });
  });
  
  return {
    estructura: {
      total_lm: estructura.cadenasLM.length,
      total_small_groups: totalSmallGroups, // VALOR REAL CALCULADO
      total_lcf: totalLCF
    },
    detalle: {
      total_almas: totalAlmas,
      almas_en_celula: almasEnCelula,
      almas_sin_celula: totalAlmas - almasEnCelula,
      tasa_integracion: totalAlmas > 0 ? 
        ((almasEnCelula / totalAlmas) * 100).toFixed(1) : 0
    }
  };
}

function cargarDatosLCF(idLCF) {
  try {
    console.log(`[DEBUG] Cargando datos para LCF: ${idLCF}`);
    
    // Crear algunos datos de ejemplo para probar
    const almas = [
      {
        ID_Alma: 'A001',
        Nombre_Completo: 'Juan Pérez García',
        Telefono: '555-0001',
        Dias_Desde_Ingreso: 5,
        En_Celula: true,
        Prioridad: 'Normal',
        Desea_Visita: 'Sí',
        Acepto_Jesus: 'Sí'
      },
      {
        ID_Alma: 'A002',
        Nombre_Completo: 'María López Hernández',
        Telefono: '555-0002',
        Dias_Desde_Ingreso: 15,
        En_Celula: false,
        Prioridad: 'Media',
        Desea_Visita: 'No',
        Acepto_Jesus: 'Sí'
      },
      {
        ID_Alma: 'A003',
        Nombre_Completo: 'Pedro Rodríguez Silva',
        Telefono: '555-0003',
        Dias_Desde_Ingreso: 35,
        En_Celula: false,
        Prioridad: 'Alta',
        Desea_Visita: 'Sí',
        Acepto_Jesus: 'No'
      }
    ];
    
    const celulas = [
      {
        ID_Celula: 'C001',
        Nombre_Celula: 'Célula Esperanza',
        Total_Miembros: 8,
        Estado: 'Saludable'
      },
      {
        ID_Celula: 'C002',
        Nombre_Celula: 'Célula Fe',
        Total_Miembros: 5,
        Estado: 'En Crecimiento'
      }
    ];
    
    return {
      success: true,
      celulas: celulas,
      almas: almas
    };
    
  } catch (error) {
    console.error('[ERROR] en cargarDatosLCF:', error);
    return {
      success: false,
      error: error.toString(),
      celulas: [],
      almas: []
    };
  }
}

function cargarDatosMinimos(idLD) {
  try {
    // Solo cargar líderes, NO ingresos completos
    const ss = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    const sheetLideres = ss.getSheetByName('Directorio de Líderes');
    
    // Solo las primeras 10 columnas, no todas
    const dataRaw = sheetLideres.getRange(2, 1, sheetLideres.getLastRow() - 1, 10).getValues();
    
    const lideres = dataRaw.map(row => ({
      ID_Lider: String(row[0] || '').trim(),
      Nombre_Lider: String(row[1] || '').trim(),
      Rol: String(row[2] || '').trim(),
      ID_Lider_Directo: String(row[3] || '').trim(),
      Estado_Actividad: String(row[4] || '-').trim()
    }));
    
    return {
      lideres: lideres,
      celulas: [], // Vacío por ahora
      ingresos: [], // NO cargar 2600 registros
      seguimiento: { 
        maestroAsistentes: [],
        interacciones: [],
        visitas: []
      }
    };
  } catch (error) {
    console.error('Error en cargarDatosMinimos:', error);
    return {
      lideres: [],
      celulas: [],
      ingresos: [],
      seguimiento: { 
        maestroAsistentes: [],
        interacciones: [],
        visitas: []
      }
    };
  }
}

function cargarSoloLideres() {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('SOLO_LIDERES');
  if (cached) return JSON.parse(cached);
  
  const ss = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
  const sheet = ss.getSheetByName(CONFIG.TABS.LIDERES);
  
  // Solo columnas esenciales
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();
  
  const lideres = data.map(row => ({
    ID_Lider: row[0],
    Nombre_Lider: row[1],
    Rol: row[2],
    ID_Lider_Directo: row[3],
    Estado_Actividad: row[4] || 'Sin Datos'
  }));
  
  cache.put('SOLO_LIDERES', JSON.stringify(lideres), 300);
  return lideres;
}

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Calcula métricas para cualquier líder usando mapas pre-calculados para velocidad.
 */
function calcularMetricasLider(lider, almasPorLCF, celulasPorLCF) {
  // Búsqueda instantánea en el mapa en lugar de filtrar todo el array
  const almasAsignadas = almasPorLCF.get(lider.ID_Lider) || [];
  const celulasAsignadas = celulasPorLCF.get(lider.ID_Lider) || [];
  
  const enCelulaCount = almasAsignadas.filter(a => a.En_Celula).length;

  const metricas = {
    total_almas: almasAsignadas.length,
    almas_en_celula: enCelulaCount,
    almas_sin_celula: almasAsignadas.length - enCelulaCount,
    total_celulas: celulasAsignadas.length,
    tasa_integracion: almasAsignadas.length > 0 ? ((enCelulaCount / almasAsignadas.length) * 100).toFixed(1) : 0,
    carga_trabajo: determinarCargaTrabajo(almasAsignadas.length)
  };
  
  return {
    ...lider,
    metricas: metricas
  };
}

/**
 * Determina la salud de una cadena LM
 */
function determinarSaludCadena(lm, smallGroups, lcfDirectos) {
  // Calcular porcentaje de activos en la cadena
  let totalMiembros = smallGroups.length + lcfDirectos.length;
  let activos = 0;
  
  if (lm.Estado_Actividad === 'Activo') activos++;
  activos += smallGroups.filter(sg => sg.Estado_Actividad === 'Activo').length;
  
  smallGroups.forEach(sg => {
    activos += sg.lcfs.filter(lcf => lcf.Estado_Actividad === 'Activo').length;
    totalMiembros += sg.lcfs.length;
  });
  
  activos += lcfDirectos.filter(lcf => lcf.Estado_Actividad === 'Activo').length;
  
  const porcentajeActivos = totalMiembros > 0 ? (activos / totalMiembros * 100) : 0;
  
  if (porcentajeActivos >= 80) return 'Excelente';
  if (porcentajeActivos >= 60) return 'Buena';
  if (porcentajeActivos >= 40) return 'Regular';
  return 'Crítica';
}

/**
 * Calcula promedio de integración
 */
function calcularPromedioIntegracion(lcfs) {
  if (lcfs.length === 0) return 0;
  const suma = lcfs.reduce((sum, lcf) => sum + parseFloat(lcf.metricas.tasa_integracion || 0), 0);
  return (suma / lcfs.length).toFixed(1);
}

/**
 * Cuenta activos en toda la estructura
 */
function contarActivosEnEstructura(cadenasLM, sgDirectos, lcfDirectos) {
  let activos = 0;
  
  // Contar en cadenas LM
  cadenasLM.forEach(lm => {
    if (lm.Estado_Actividad === 'Activo') activos++;
    lm.smallGroups.forEach(sg => {
      if (sg.Estado_Actividad === 'Activo') activos++;
      activos += sg.lcfs.filter(lcf => lcf.Estado_Actividad === 'Activo').length;
    });
    activos += lm.lcfDirectos.filter(lcf => lcf.Estado_Actividad === 'Activo').length;
  });
  
  // Contar SG directos
  sgDirectos.forEach(sg => {
    if (sg.Estado_Actividad === 'Activo') activos++;
    activos += sg.lcfs.filter(lcf => lcf.Estado_Actividad === 'Activo').length;
  });
  
  // Contar LCF directos
  activos += lcfDirectos.filter(lcf => lcf.Estado_Actividad === 'Activo').length;
  
  return activos;
}

/**
 * Genera alertas críticas
 */
function generarAlertasCriticas(cadenasLM, sgDirectos, lcfDirectos) {
  const criticas = [];
  
  // LM inactivos
  const lmInactivos = cadenasLM.filter(lm => 
    lm.Estado_Actividad === 'Inactivo' || lm.Estado_Actividad === 'Sin Datos'
  );
  if (lmInactivos.length > 0) {
    criticas.push({
      tipo: 'lm_inactivo',
      cantidad: lmInactivos.length,
      mensaje: `${lmInactivos.length} LM inactivos o sin datos`
    });
  }
  
  // Cadenas con problemas
  const cadenasProblematicas = cadenasLM.filter(lm => 
    lm.metricas.salud_cadena === 'Crítica' || lm.metricas.salud_cadena === 'Regular'
  );
  if (cadenasProblematicas.length > 0) {
    criticas.push({
      tipo: 'cadena_problematica',
      cantidad: cadenasProblematicas.length,
      mensaje: `${cadenasProblematicas.length} cadenas con salud crítica/regular`
    });
  }
  
  // Sin supervisión LM
  const sinSupervision = sgDirectos.length + lcfDirectos.length;
  if (sinSupervision > 10) {
    criticas.push({
      tipo: 'sin_lm',
      cantidad: sinSupervision,
      mensaje: `${sinSupervision} elementos sin supervisión LM`
    });
  }
  
  return criticas;
}

/**
 * Genera alertas jerárquicas detalladas
 */
function generarAlertasJerarquicas(cadenasLM, sgDirectos, lcfDirectos) {
  const alertas = [];
  
  // Alertas por cadena LM
  cadenasLM.forEach(lm => {
    if (lm.Estado_Actividad === 'Inactivo' || lm.Estado_Actividad === 'Sin Datos') {
      alertas.push({
        tipo: 'error',
        nivel: 'LM',
        nombre: lm.Nombre_Lider,
        mensaje: `LM inactivo (${lm.Dias_Inactivo || 'N/A'} días) - Afecta ${lm.metricas.total_lcf_en_cadena} LCF`
      });
    }
    
    if (lm.metricas.salud_cadena === 'Crítica') {
      alertas.push({
        tipo: 'warning',
        nivel: 'CADENA',
        nombre: lm.Nombre_Lider,
        mensaje: `Cadena en estado crítico - Solo ${lm.metricas.small_groups_activos}/${lm.metricas.total_small_groups} SG activos`
      });
    }
    
    // Alertas de Small Groups dentro de la cadena
    lm.smallGroups.forEach(sg => {
      if (sg.metricas.total_lcf === 0) {
        alertas.push({
          tipo: 'warning',
          nivel: 'SG',
          nombre: sg.Nombre_Lider,
          mensaje: `Small Group sin LCF asignados (bajo ${lm.Nombre_Lider})`
        });
      }
    });
  });
  
  // Alertas de elementos sin LM
  if (sgDirectos.length > 0) {
    alertas.push({
      tipo: 'info',
      nivel: 'ESTRUCTURA',
      nombre: 'Sistema',
      mensaje: `${sgDirectos.length} Small Groups reportando directamente al LD (sin LM)`
    });
  }
  
  if (lcfDirectos.length > 0) {
    alertas.push({
      tipo: 'info',
      nivel: 'ESTRUCTURA',
      nombre: 'Sistema',
      mensaje: `${lcfDirectos.length} LCF reportando directamente al LD (sin cadena de supervisión)`
    });
  }
  
  return alertas.sort((a, b) => {
    const prioridad = { error: 0, warning: 1, info: 2 };
    return prioridad[a.tipo] - prioridad[b.tipo];
  });
}

function generarAlertasLD(equipo) {
  const alertas = [];

  equipo.forEach(lcf => {
    if (lcf.Estado_Actividad === 'Inactivo' || lcf.Estado_Actividad === 'Sin Datos') {
      alertas.push({
        tipo: 'error',
        lcf: lcf.Nombre_Lider,
        mensaje: `Inactivo o Sin Datos. Días: ${lcf.Dias_Inactivo || 'N/A'}.`
      });
    }

    if (lcf.metricas.almas_sin_celula > 5) {
      alertas.push({
        tipo: 'warning',
        lcf: lcf.Nombre_Lider,
        mensaje: `${lcf.metricas.almas_sin_celula} almas aún sin célula.`
      });
    }

    if (lcf.metricas.carga_trabajo === 'SOBRECARGADO') {
      alertas.push({
        tipo: 'warning',
        lcf: lcf.Nombre_Lider,
        mensaje: `Sobrecarga de trabajo (${lcf.metricas.total_almas} almas).`
      });
    }
  });

  return alertas;
}

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Normaliza las respuestas de Sí/No.
 */
function normalizeYesNo(input) {
  if (!input) return 'NO_DATA';
  const normalized = String(input).trim().toUpperCase();
  if (normalized === 'SÍ' || normalized === 'SI' || normalized === 'YES') {
    return 'SI';
  }
  if (normalized === 'NO') {
    return 'NO';
  }
  return normalized;
}

function determinarPrioridad(deseaVisita, aceptoJesus) {
  // Usa los valores normalizados ('SI'/'NO')
  if (aceptoJesus === 'SI' && deseaVisita === 'SI') {
    return 'Alta';
  } else if (aceptoJesus === 'SI' || deseaVisita === 'SI') {
    return 'Media';
  }
  return 'Normal';
}

function determinarCargaTrabajo(totalAlmas) {
  if (totalAlmas <= CONFIG.CARGA_LCF.OPTIMA) return 'Óptima';
  if (totalAlmas <= CONFIG.CARGA_LCF.MODERADA) return 'Moderada';
  if (totalAlmas <= CONFIG.CARGA_LCF.ALTA) return 'Alta';
  return 'SOBRECARGADO';
}

// ==================== LISTA DE LDs PARA EL SELECTOR ====================
function getListaLDs() {
  try {
    // Usamos los datos cargados (potencialmente desde caché)
    const data = cargarDirectorioCompleto();
    return data.lideres
      .filter(l => l.Rol === 'LD')
      .map(l => ({
        id: l.ID_Lider,
        nombre: l.Nombre_Lider
      }));
  } catch (error) {
    console.error('Error obteniendo lista de LDs:', error);
    return [];
  }
}


// ==================== ESTRUCTURA VACÍA ====================

/**
 * Crea una estructura de análisis vacía para manejar casos sin datos.
 */
function createEmptyAnalysis() {
  return {
    lideres: {
      total_LD: 0, total_LCF: 0, LD_activos: 0, LD_alertas: 0, LD_inactivos: 0,
      LCF_activos: 0, LCF_alertas: 0, LCF_inactivos: 0, LCF_sin_LD: [],
      por_congregacion: {}, tasa_actividad_LD: 0, tasa_actividad_LCF: 0
    },
    celulas: {
      total_celulas: 0, celulas_activas: 0, celulas_vacias: 0, celulas_en_riesgo: 0,
      celulas_saludables: 0, celulas_para_multiplicar: 0, total_miembros: 0,
      promedio_miembros: 0, celulas_por_LCF: {}
    },
    ingresos: {
      total_historico: 0, ingresos_hoy: 0, ingresos_semana: 0, ingresos_mes: 0,
      asignados: 0, pendientes_asignacion: 0, aceptaron_jesus: 0, desean_visita: 0,
      en_celula: 0, sin_celula: 0, por_fuente: {}, por_LCF: {}, por_LD: {},
      tasa_asignacion: 0, tasa_integracion_celula: 0
    },
    datosBase: { lideres: [], celulas: [], ingresos: [] },
    metricas: {
      cobertura_liderazgo: 0, promedio_lcf_por_ld: 0, promedio_almas_por_lcf: 0,
      tasa_ocupacion_celulas: 0, celulas_necesitan_atencion: 0, potencial_multiplicacion: 0,
      velocidad_asignacion_promedio: 0, almas_sin_celula: 0
    },
    alertas: [],
    timestamp: new Date().toISOString()
  };
}

// ==================== FUNCIONES DE REPORTES PDF PARA LCF ====================

/**
 * Genera un reporte PDF individual para un LCF.
 * --- VERSIÓN FINAL: Usa _SeguimientoConsolidado y la lógica de íconos del modal. ---
 */
function generarReporteLCF(idLCF) {
  try {
    const data = cargarDirectorioCompleto();
    const lcf = data.lideres.find(l => l.ID_Lider === idLCF);
    if (!lcf) return { success: false, error: 'LCF no encontrado' };
    
    const ldSupervisor = obtenerLDSupervisor(lcf, data.lideres);
    
    // --- LÓGICA DE DATOS ACTUALIZADA ---
    const hojaSeguimiento = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO).getSheetByName('_SeguimientoConsolidado');
    const todosLosSeguimientos = hojaSeguimiento.getRange("A2:J" + hojaSeguimiento.getLastRow()).getValues();

    const getBienvenidaIcon = (resultado) => {
      const res = resultado || "";
      if (res.includes("Contacto Exitoso - Aceptó visita")) return '⭐';
      if (res.includes("Prefiere visitar") || res.includes("Solicitó info")) return '✓';
      if (["No contactar", "Sin interés", "No contestó", "Buzón", "Número equivocado"].includes(res)) return '―';
      return '✗';
    };

    const getVisitaIcon = (resultado) => {
      const res = resultado || "";
      if (res.includes("Propone Apertura de Célula") || res.includes("Se integra a Célula existente")) return '⭐';
      if (res.includes("No interesado por ahora") || res.includes("Solicita segunda visita")) return '―';
      if (res.includes("Visita No Concretada")) return '⏳';
      return '✗';
    };

    const almasLCF = [];
    for (const fila of todosLosSeguimientos) {
      if (fila[2] === idLCF) {
        almasLCF.push({
          Nombre_Completo: fila[1],
          Telefono: fila[4],
          Acepta_Visita: String(fila[5] || 'No').trim().toUpperCase(),
          B: getBienvenidaIcon(fila[6]),
          V: getVisitaIcon(fila[7]),
          C: fila[8] || '0/12',
          Dias: fila[9] || 0
        });
      }
    }
    
    const almasOrdenadas = almasLCF.sort((a, b) => b.Dias - a.Dias);
    const metricas = {
      total_almas: almasLCF.length,
      desean_visita: almasLCF.filter(a => a.Acepta_Visita === 'SI' || a.Acepta_Visita === 'SÍ').length,
      urgentes: almasLCF.filter(a => a.Dias > 30).length
    };
    
    // El resto del proceso es igual...
    const html = generarHTMLReporteLCF(lcf, ldSupervisor, almasOrdenadas, metricas);
    const blob = Utilities.newBlob(html, 'text/html', 'report.html');
    const pdf = blob.getAs('application/pdf');
    
    const fecha = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const fileName = `Reporte_${lcf.Nombre_Lider.replace(/\s+/g, '_')}_${fecha}.pdf`;
    
    return { success: true, fileName: fileName, content: Utilities.base64Encode(pdf.getBytes()) };
    
  } catch (error) {
    console.error('Error generando reporte LCF:', error);
    return { success: false, error: 'Error al generar el reporte: ' + error.toString() };
  }
}

/**
 * Genera el HTML del reporte para un LCF con un diseño (UI/UX) mejorado.
 */
function generarHTMLReporteLCF(lcf, ldSupervisor, almas, metricas) {
  const fechaHoy = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page { size: letter; margin: 0.75in; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 10pt; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #005A9C; padding-bottom: 15px; margin-bottom: 25px; }
        .header h1 { font-size: 22pt; color: #005A9C; margin: 0; }
        .header p { font-size: 11pt; color: #555; margin: 5px 0 0; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background-color: #f7f7f7; padding: 15px; border-radius: 8px; margin-bottom: 25px; }
        .info-grid span { color: #666; }
        .metrics-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; text-align: center; margin-bottom: 25px; }
        .metric-box { padding: 15px; border-radius: 8px; background-color: #f7f7f7; }
        .metric-box .value { font-size: 24pt; font-weight: bold; color: #005A9C; }
        .metric-box .label { font-size: 9pt; color: #666; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; font-size: 9pt; }
        th { background-color: #005A9C; color: white; padding: 10px; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #ddd; }
        tr:nth-child(even) { background-color: #f7f7f7; }
        .urgent { color: #D8000C; font-weight: bold; }
        .footer { text-align: center; font-size: 8pt; color: #888; margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Reporte de Seguimiento de Almas</h1>
        <p>Generado el ${fechaHoy}</p>
      </div>
      <div class="info-grid">
        <div><strong>Líder (LCF):</strong> <span>${lcf.Nombre_Lider}</span></div>
        <div><strong>Supervisor (LD):</strong> <span>${ldSupervisor ? ldSupervisor.Nombre_Lider : 'No asignado'}</span></div>
      </div>
      <div class="metrics-grid">
        <div class="metric-box"><div class="value">${metricas.total_almas}</div><div class="label">Total Almas</div></div>
        <div class="metric-box"><div class="value">${metricas.desean_visita}</div><div class="label">Desean Visita</div></div>
        <div class="metric-box"><div class="value urgent">${metricas.urgentes}</div><div class="label urgent">Casos Urgentes (+30d)</div></div>
      </div>
      <h3>Lista de Seguimiento</h3>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th style="width: 15%;">Teléfono</th>
            <th style="width: 10%; text-align: center;">Acepta Visita</th>
            <th style="width: 5%; text-align: center;">B</th>
            <th style="width: 5%; text-align: center;">V</th>
            <th style="width: 10%; text-align: center;">Células</th>
            <th style="width: 10%; text-align: center;">Días</th>
          </tr>
        </thead>
        <tbody>
          ${almas.map(alma => `
            <tr class="${alma.Dias > 30 ? 'urgent-row' : ''}">
              <td>${alma.Nombre_Completo}</td>
              <td>${alma.Telefono || '-'}</td>
              <td style="text-align: center;">${alma.Acepta_Visita === 'SI' || alma.Acepta_Visita === 'SÍ' ? 'Sí' : 'No'}</td>
              <td style="text-align: center; font-weight: bold;">${alma.B}</td>
              <td style="text-align: center; font-weight: bold;">${alma.V}</td>
              <td style="text-align: center;">${alma.C}</td>
              <td style="text-align: center;" class="${alma.Dias > 30 ? 'urgent' : ''}">${alma.Dias}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="footer">
        Portal de Supervisión V2.0
      </div>
    </body>
    </html>
  `;
}

/**
 * Encuentra el LD supervisor de un líder (navegando la jerarquía)
 */
function obtenerLDSupervisor(lider, todosLideres) {
  if (!lider.ID_Lider_Directo) return null;
  
  let supervisor = todosLideres.find(l => l.ID_Lider === lider.ID_Lider_Directo);
  
  // Si el supervisor directo no es LD, buscar recursivamente
  while (supervisor && supervisor.Rol !== 'LD') {
    if (!supervisor.ID_Lider_Directo) break;
    supervisor = todosLideres.find(l => l.ID_Lider === supervisor.ID_Lider_Directo);
  }
  
  return supervisor;
}

/**
 * Genera reportes para todos los LCF de un LD
 */
function generarReportesEquipoLD(idLD) {
  try {
    const data = cargarDirectorioCompleto();
    
    // Obtener el LD
    const ld = data.lideres.find(l => l.ID_Lider === idLD && l.Rol === 'LD');
    if (!ld) {
      return { success: false, error: 'LD no encontrado' };
    }
    
    // Obtener todos los LCF del equipo (directos e indirectos)
    const equipoLCF = obtenerTodosLCFDelLD(idLD, data.lideres);
    
    const reportesGenerados = [];
    const errores = [];
    
    // Generar reporte para cada LCF
    equipoLCF.forEach(lcf => {
      try {
        const resultado = generarReporteLCF(lcf.ID_Lider);
        if (resultado.success) {
          reportesGenerados.push({
            lcf: lcf.Nombre_Lider,
            fileName: resultado.fileName,
            total_almas: resultado.total_almas
          });
        } else {
          errores.push({
            lcf: lcf.Nombre_Lider,
            error: resultado.error
          });
        }
      } catch (error) {
        errores.push({
          lcf: lcf.Nombre_Lider,
          error: error.toString()
        });
      }
    });
    
    return {
      success: true,
      ld: ld.Nombre_Lider,
      total_lcf: equipoLCF.length,
      reportes_generados: reportesGenerados.length,
      reportes: reportesGenerados,
      errores: errores
    };
    
  } catch (error) {
    console.error('Error generando reportes del equipo:', error);
    return {
      success: false,
      error: 'Error al generar reportes: ' + error.toString()
    };
  }
}

/**
 * Obtiene todos los LCF que pertenecen a un LD (navegando toda la jerarquía)
 */
function obtenerTodosLCFDelLD(idLD, todosLideres) {
  const lcfDelEquipo = [];
  
  // Función recursiva para obtener subordinados
  function obtenerSubordinados(idSupervisor, visitados = new Set()) {
    // Evitar ciclos infinitos
    if (visitados.has(idSupervisor)) return;
    visitados.add(idSupervisor);
    
    const subordinados = todosLideres.filter(l => l.ID_Lider_Directo === idSupervisor);
    
    subordinados.forEach(sub => {
      if (sub.Rol === 'LCF') {
        lcfDelEquipo.push(sub);
      }
      // Recursivamente obtener subordinados del subordinado
      obtenerSubordinados(sub.ID_Lider, visitados);
    });
  }
  
  // Iniciar búsqueda desde el LD
  obtenerSubordinados(idLD);
  
  return lcfDelEquipo;
}

// ==================== SISTEMA INTEGRADO DE SEGUIMIENTO DE ALMAS ====================

/**
 * Configuración actualizada con todas las fuentes de datos
 */
const CONFIG_SEGUIMIENTO = {
  SHEETS: {
    DIRECTORIO: '1dwuqpyMXWHJvnJHwDHCqFMvgdYhypE2W1giH6bRZMKc',
    REPORTE_CELULAS: '18wOkxTauLETdpkEy5qsd0shlZUf8FsfQg9oCN8-pCxI',
    REGISTRO_INTERACCIONES: '1Rzx4k6ipkFvVpTYdisjAYSwGuIgyWiYFBsYu4RHFWPs',
    VISITAS_BENDICION: '1md72JN8LOJCpBLrPIGP9HQG8GQ1RzFFE-hAOlawQ2eg'
  },
  TABS: {
    MAESTRO_ASISTENTES: 'Maestro_Asistentes',
    REGISTRO_INTERACCIONES: 'Registro de Interacciones',
    REGISTRO_VISITAS: 'Registro de Visitas'
  }
};



/**
 * Carga todos los datos necesarios incluyendo las nuevas fuentes
 */
function cargarDatosCompletos() {
  // Primero cargar los datos base (reutilizando la función existente)
  const dataBase = cargarDirectorioCompleto();
  
  // Agregar los nuevos datos
  dataBase.maestroAsistentes = cargarMaestroAsistentes();
  dataBase.interacciones = cargarInteracciones();
  dataBase.visitas = cargarVisitasBendicion();
  
  return dataBase;
}

// ==================== FUNCIONES DE CARGA DE DATOS ADICIONALES ====================

/**
 * Carga la hoja Maestro_Asistentes con el progreso de células
 */
function cargarMaestroAsistentes() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEETS.REPORTE_CELULAS);
    const sheet = ss.getSheetByName('Maestro_Asistentes');
    
    if (!sheet) {
      console.warn('No se encontró la hoja Maestro_Asistentes');
      return [];
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];
    
    const headers = data[0];
    const asistentes = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const asistente = {
        ID_Asistente: String(row[0] || '').trim(),
        Nombre: String(row[1] || '').trim(),
        Temas_Completados: String(row[2] || '0'),
        Temas_Faltantes: String(row[3] || '12'),
        Porcentaje: parseFloat(row[4] || 0),
        Estado: String(row[5] || 'Sin datos').trim(),
        Fecha_Primer_Tema: row[6],
        Fecha_Ultimo_Tema: row[7],
        Dias_Inactivo: parseInt(row[8] || 0),
        Celula_Principal: String(row[9] || '').trim(),
        // Temas individuales
        temas: {
          T1: row[10] ? true : false,
          T2: row[11] ? true : false,
          T3: row[12] ? true : false,
          T4: row[13] ? true : false,
          T5: row[14] ? true : false,
          T6: row[15] ? true : false,
          T7: row[16] ? true : false,
          T8: row[17] ? true : false,
          T9: row[18] ? true : false,
          T10: row[19] ? true : false,
          T11: row[20] ? true : false,
          T12: row[21] ? true : false
        }
      };
      
      if (asistente.ID_Asistente) {
        asistentes.push(asistente);
      }
    }
    
    console.log(`Cargados ${asistentes.length} registros de Maestro_Asistentes`);
    return asistentes;
    
  } catch (error) {
    console.error('Error cargando Maestro_Asistentes:', error);
    return [];
  }
}

/**
 * Carga el registro de interacciones
 */
function cargarInteracciones() {
  try {
    // Si no tienes esta hoja configurada, retornar array vacío
    if (!CONFIG.SHEETS.REGISTRO_INTERACCIONES) {
      console.warn('REGISTRO_INTERACCIONES no configurado');
      return [];
    }
    
    const ss = SpreadsheetApp.openById(CONFIG.SHEETS.REGISTRO_INTERACCIONES);
    const sheet = ss.getSheetByName('Registro de Interacciones') || ss.getSheets()[0];
    
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];
    
    const headers = data[0];
    const interacciones = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const interaccion = {
        ID_Interaccion: String(row[0] || '').trim(),
        ID_Alma: String(row[1] || '').trim(),
        Nombre_Alma: String(row[2] || '').trim(),
        Timestamp_Interaccion: row[3],
        Nombre_Agente: String(row[4] || '').trim(),
        Congregacion: String(row[5] || '').trim(),
        ID_LCF: String(row[6] || '').trim(),
        Nombre_LCF: String(row[7] || '').trim(),
        Medio_Contacto: String(row[12] || '').trim(),
        Resultado: String(row[13] || '').trim(),
        Fecha_Visita: row[14],
        Hora_Visita: String(row[15] || '').trim(),
        Direccion_Visita: String(row[16] || '').trim(),
        Observaciones: String(row[17] || '').trim()
      };
      
      if (interaccion.ID_Alma) {
        interacciones.push(interaccion);
      }
    }
    
    console.log(`Cargadas ${interacciones.length} interacciones`);
    return interacciones;
    
  } catch (error) {
    console.error('Error cargando interacciones:', error);
    return [];
  }
}

/**
 * Carga el registro de visitas de bendición
 */
function cargarVisitasBendicion() {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SHEETS.VISITAS_BENDICION);
    const sheet = ss.getSheetByName('Registro de Visitas') || ss.getSheets()[0];
    
    if (!sheet) return [];
    
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];
    
    const visitas = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const visita = {
        ID_Visita: String(row[0] || '').trim(),
        ID_Alma: String(row[1] || '').trim(),
        Timestamp_Visita: row[2],
        Nombre_Agente: String(row[3] || '').trim(),
        Acompanantes: String(row[4] || '').trim(),
        Congregacion: String(row[5] || '').trim(),
        ID_LCF: String(row[6] || '').trim(),
        Nombre_LCF: String(row[7] || '').trim(),
        Estatus_Visita: String(row[12] || '').trim(),
        Resultado_Visita: String(row[13] || '').trim(),
        ID_Celula_Asignada: String(row[14] || '').trim(),
        Nombre_Anfitrion: String(row[15] || '').trim(),
        Observaciones: String(row[16] || '').trim()
      };
      
      if (visita.ID_Alma) {
        visitas.push(visita);
      }
    }
    
    console.log(`Cargadas ${visitas.length} visitas de bendición`);
    return visitas;
    
  } catch (error) {
    console.error('Error cargando visitas:', error);
    return [];
  }
}

// ==================== FUNCIONES DE PROCESAMIENTO ====================

/**
 * Obtiene el progreso de células de un alma
 */
// REEMPLAZAR la función obtenerProgresoCelulas con esta versión corregida:
function obtenerProgresoCelulas(idAlma, maestroAsistentes, celulas) {
  // Primero encontrar el ID_Miembro correspondiente al ID_Alma
  // Buscar en las células para obtener el ID_Miembro
  let idMiembro = null;
  
  // Buscar el alma en las células para obtener su ID_Miembro
  for (let celula of celulas) {
    const miembro = celula.Miembros.find(m => {
      // Aquí necesitamos vincular ID_Alma con ID_Miembro
      // Esto depende de cómo estén relacionados en tus datos
      return m.ID_Miembro === idAlma; // O buscar por nombre si es necesario
    });
    if (miembro) {
      idMiembro = miembro.ID_Miembro;
      break;
    }
  }
  
  // Ahora buscar en Maestro_Asistentes usando ID_Miembro (que allí se llama ID_Asistente)
  const asistente = maestroAsistentes.find(a => a.ID_Asistente === idMiembro);
  
  if (!asistente) {
    return {
      completados: 0,
      total: 12,
      texto: '0/12',
      porcentaje: 0,
      estado: 'No iniciado',
      dias_inactivo: null,
      temas: null
    };
  }
  
  // Resto del código igual...
  const completados = parseInt(asistente.Temas_Completados.split('/')[0] || 0);
  
  return {
    completados: completados,
    total: 12,
    texto: asistente.Temas_Completados || '0/12',
    porcentaje: asistente.Porcentaje || 0,
    estado: asistente.Estado,
    dias_inactivo: asistente.Dias_Inactivo,
    celula: asistente.Celula_Principal,
    temas: asistente.temas
  };
}

/**
 * Obtiene el resultado de la bienvenida
 */
function obtenerResultadoBienvenida(idAlma, interacciones) {
  // Buscar la primera interacción del alma
  const interaccionesAlma = interacciones
    .filter(i => i.ID_Alma === idAlma)
    .sort((a, b) => new Date(a.Timestamp_Interaccion) - new Date(b.Timestamp_Interaccion));
  
  if (interaccionesAlma.length === 0) {
    return {
      completado: false,
      resultado: 'Pendiente',
      fecha: null,
      simbolo: '✗'
    };
  }
  
  const primera = interaccionesAlma[0];
  
  return {
    completado: true,
    resultado: primera.Resultado || 'Contactado',
    fecha: primera.Timestamp_Interaccion,
    medio: primera.Medio_Contacto,
    simbolo: '✓'
  };
}

/**
 * Obtiene el resultado de la visita de bendición
 */
function obtenerResultadoVisita(idAlma, visitas) {
  const visitasAlma = visitas.filter(v => v.ID_Alma === idAlma);
  
  if (visitasAlma.length === 0) {
    return {
      completado: false,
      resultado: 'Pendiente',
      fecha: null,
      simbolo: '✗'
    };
  }
  
  // Tomar la visita más reciente
  const ultimaVisita = visitasAlma.sort((a, b) => 
    new Date(b.Timestamp_Visita) - new Date(a.Timestamp_Visita)
  )[0];
  
  return {
    completado: ultimaVisita.Estatus_Visita === 'Realizada' || ultimaVisita.Resultado_Visita !== '',
    resultado: ultimaVisita.Resultado_Visita || ultimaVisita.Estatus_Visita,
    fecha: ultimaVisita.Timestamp_Visita,
    celula_asignada: ultimaVisita.ID_Celula_Asignada,
    anfitrion: ultimaVisita.Nombre_Anfitrion,
    simbolo: ultimaVisita.Estatus_Visita === 'Realizada' ? '✓' : '⏳'
  };
}

/**
 * Calcula días sin seguimiento
 */
function calcularDiasSinSeguimiento(alma, interacciones, visitas) {
  const hoy = new Date();
  const fechas = [];
  
  // Fecha de ingreso
  if (alma.Timestamp) {
    fechas.push(new Date(alma.Timestamp));
  }
  
  // Última interacción
  const interaccionesAlma = interacciones.filter(i => i.ID_Alma === alma.ID_Alma);
  if (interaccionesAlma.length > 0) {
    const ultimaInteraccion = interaccionesAlma
      .map(i => new Date(i.Timestamp_Interaccion))
      .filter(d => !isNaN(d))
      .sort((a, b) => b - a)[0];
    if (ultimaInteraccion) fechas.push(ultimaInteraccion);
  }
  
  // Última visita
  const visitasAlma = visitas.filter(v => v.ID_Alma === alma.ID_Alma);
  if (visitasAlma.length > 0) {
    const ultimaVisita = visitasAlma
      .map(v => new Date(v.Timestamp_Visita))
      .filter(d => !isNaN(d))
      .sort((a, b) => b - a)[0];
    if (ultimaVisita) fechas.push(ultimaVisita);
  }
  
  if (fechas.length === 0) {
    return null;
  }
  
  // Obtener la fecha más reciente
  const ultimaFecha = fechas.sort((a, b) => b - a)[0];
  const dias = Math.floor((hoy - ultimaFecha) / (1000 * 60 * 60 * 24));
  
  return dias;
}

/**
 * Calcula la prioridad del alma
 */
function calcularPrioridad(diasSinSeguimiento, estado, deseaVisita) {
  if (estado === 'Inactivo' || diasSinSeguimiento > 30) {
    return 'Urgente';
  }
  
  if (estado === 'En Riesgo' || (deseaVisita === 'SI' && diasSinSeguimiento > 7)) {
    return 'Alta';
  }
  
  if (deseaVisita === 'SI' || diasSinSeguimiento > 14) {
    return 'Media';
  }
  
  return 'Normal';
}

/**
 * Busca si el alma recibió visita de bendición
 */
function buscarVisitaBendicion(idAlma, nombreCompleto, visitas) {
  const visitasAlma = visitas.filter(v => 
    v.ID_Alma === idAlma || 
    sonNombresSimilares(v.Nombre_Alma, nombreCompleto)
  );
  
  if (visitasAlma.length === 0) {
    return {
      completado: false,
      resultado: 'Pendiente',
      fecha: null,
      simbolo: '✗',
      celula_asignada: null
    };
  }
  
  visitasAlma.sort((a, b) => 
    new Date(b.Timestamp_Visita) - new Date(a.Timestamp_Visita)
  );
  
  const ultima = visitasAlma[0];
  
  return {
    completado: ultima.Estatus_Visita === 'Realizada' || ultima.Resultado_Visita !== '',
    resultado: ultima.Resultado_Visita || ultima.Estatus_Visita || 'Registrada',
    fecha: ultima.Timestamp_Visita,
    simbolo: ultima.Estatus_Visita === 'Realizada' ? '✔' : '⏳'
  };
}

/**
 * Busca el progreso en células Y determina si está en célula
 * TODO EN UNO - Basado en Maestro_Asistentes
 */
function buscarProgresoCelulas(nombreCompleto, nombres, apellidos, maestroAsistentes) {
  const asistente = maestroAsistentes.find(a => {
    const nombreAsistente = a.Nombre || '';
    return sonNombresSimilares(nombreAsistente, nombreCompleto) ||
           sonNombresSimilares(nombreAsistente, nombres) ||
           (nombreAsistente.includes(nombres) && nombreAsistente.includes(apellidos));
  });
  
  if (!asistente) {
    return {
      completados: 0,
      total: 12,
      texto: '0/12',
      porcentaje: 0,
      estado: 'No iniciado',
      dias_inactivo: null,
      celula: null,
      temas: null,
      estaEnCelula: false
    };
  }
  
  const partes = (asistente.Temas_Completados || '0/12').split('/');
  const completados = parseInt(partes[0] || 0);
  
  return {
    completados: completados,
    total: 12,
    texto: asistente.Temas_Completados || '0/12',
    porcentaje: asistente.Porcentaje || ((completados / 12) * 100),
    estado: asistente.Estado || 'Activo',
    dias_inactivo: null,
    celula: null,
    estaEnCelula: true
  };
}

// =========================================================
// FUNCIONES DE UTILIDAD
// =========================================================

/**
 * Compara nombres considerando variaciones comunes
 */
function sonNombresSimilares(nombre1, nombre2) {
  if (!nombre1 || !nombre2) return false;
  
  const normalizar = (str) => {
    return str.toString()
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };
  
  const n1 = normalizar(nombre1);
  const n2 = normalizar(nombre2);
  
  if (n1 === n2) return true;
  if (n1.includes(n2) || n2.includes(n1)) return true;
  
  const palabras1 = n1.split(' ');
  const palabras2 = n2.split(' ');
  if (palabras1[0] === palabras2[0] && palabras1.length > 1 && palabras2.length > 1) {
    return true;
  }
  
  return false;
}

/**
 * Calcula días sin contacto
 */
function calcularDiasSinContacto(fechaIngreso, fechaBienvenida, fechaVisita) {
  const hoy = new Date();
  const fechas = [];
  
  if (fechaIngreso) fechas.push(new Date(fechaIngreso));
  if (fechaBienvenida) fechas.push(new Date(fechaBienvenida));
  if (fechaVisita) fechas.push(new Date(fechaVisita));
  
  if (fechas.length === 0) return null;
  
  const ultimaFecha = fechas.sort((a, b) => b - a)[0];
  const dias = Math.floor((hoy - ultimaFecha) / (1000 * 60 * 60 * 24));
  
  return dias;
}

/**
 * Determina el estado del alma
 */
function determinarEstadoAlma(tieneBienvenida, tieneVisita, temasCompletados, estaEnCelula, diasSinContacto) {
  if (temasCompletados === 12) return 'Completado';
  if (estaEnCelula && temasCompletados > 0 && diasSinContacto <= 7) return 'Activo';
  if (diasSinContacto > 30) return 'Inactivo';
  if (diasSinContacto > 14) return 'En Riesgo';
  if (tieneBienvenida || tieneVisita || temasCompletados > 0) return 'En Proceso';
  return 'Nuevo';
}

function calcularPrioridadAlma(deseaVisita, diasSinContacto, estado, temasCompletados) {
  if ((deseaVisita && diasSinContacto > 7) || diasSinContacto > 30) {
    return 'Urgente';
  }
  if (deseaVisita || estado === 'En Riesgo' || diasSinContacto > 14) {
    return 'Alta';
  }
  if (estado === 'Nuevo' || (temasCompletados < 3 && diasSinContacto > 7)) {
    return 'Media';
  }
  return 'Normal';
}

// ==================== VISTA RÁPIDA Y SEGUIMIENTO CORREGIDO ====================

/**
 * Obtiene vista rápida del seguimiento de almas de un LCF (Versión Optimizada V2.1)
 */
function getVistaRapidaLCF_REAL(idLCF) {
    try {
        // Obtener el seguimiento completo
        const seguimiento = getSeguimientoAlmasLCF_REAL(idLCF);
        
        if (!seguimiento.success) {
            return seguimiento;
        }
        
        // Simplificar para vista rápida (solo campos esenciales)
        const almasResumen = seguimiento.almas.map(alma => ({
            Nombre: alma.Nombre,
            Telefono: alma.Telefono,
            Acepta_Visita: alma.Acepta_Visita,
            Peticion: alma.Peticion,
            Bienvenida: alma.Bienvenida.simbolo,
            Visita: alma.Visita_Bendicion.simbolo,
            Celulas: alma.Progreso_Celulas.texto,
            Estado: alma.Estado,
            Dias_Sin_Seguimiento: alma.Dias_Sin_Seguimiento,
            ID_Alma: alma.ID_Alma
        }));
        
        return {
            success: true,
            lcf: seguimiento.lcf.Nombre,
            almas: almasResumen
        };
        
    } catch (error) {
        console.error('Error en getVistaRapidaLCF_REAL:', error);
        return { 
            success: false, 
            error: error.toString() 
        };
    }
}

/**
 * Obtiene un resumen de métricas clave para un LCF específico.
 * VERSIÓN A PRUEBA DE ERRORES CON REGISTROS DETALLADOS.
 */
function getResumenLCF(idLCF) {
  try {
    Logger.log(`Iniciando getResumenLCF para LCF ID: ${idLCF}`);

    const resumenSheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO)
                                       .getSheetByName('_SeguimientoConsolidado');
    
    // Verificación 1: ¿Existe la hoja de resumen?
    if (!resumenSheet) {
      Logger.log("FALLO: No se encontró la hoja '_SeguimientoConsolidado'. Verifica que el nombre sea exacto.");
      throw new Error("No se encontró la hoja de resumen '_SeguimientoConsolidado'.");
    }
    Logger.log("Paso 1: Hoja '_SeguimientoConsolidado' encontrada con éxito.");

    // Verificación 2: ¿La hoja tiene datos?
    if (resumenSheet.getLastRow() < 2) {
      Logger.log("ADVERTENCIA: La hoja '_SeguimientoConsolidado' no tiene filas de datos.");
      return { success: true, data: { totalAlmas: 0, conBienvenida: 0, conVisita: 0, enCelula: 0 } };
    }
    
    const todosLosSeguimientos = resumenSheet.getRange("A2:G" + resumenSheet.getLastRow()).getValues();
    Logger.log(`Paso 2: Se leyeron ${todosLosSeguimientos.length} filas de la hoja de resumen.`);

    // Verificación 3: Filtrar los datos
    const almasDelLCF = todosLosSeguimientos.filter(fila => {
      // Nos aseguramos de que la fila tenga suficientes columnas antes de leerla
      if (fila.length < 7) return false;
      return fila[2] === idLCF; // Columna C (índice 2) es ID_LCF
    });
    Logger.log(`Paso 3: Se encontraron ${almasDelLCF.length} almas para el LCF ${idLCF}.`);

    if (almasDelLCF.length === 0) {
      return { success: true, data: { totalAlmas: 0, conBienvenida: 0, conVisita: 0, enCelula: 0 } };
    }

    // Calcular las métricas
    const conBienvenida = almasDelLCF.filter(fila => fila[4] === 'Completado').length;
    const conVisita = almasDelLCF.filter(fila => fila[5] === 'Realizada').length;
    const enCelula = almasDelLCF.filter(fila => (parseInt(String(fila[6]).split('/')[0]) || 0) > 0).length;
    Logger.log("Paso 4: Métricas calculadas correctamente.");

    return {
      success: true,
      data: {
        totalAlmas: almasDelLCF.length,
        conBienvenida: conBienvenida,
        conVisita: conVisita,
        enCelula: enCelula
      }
    };

  } catch (error) {
    Logger.log(`ERROR FATAL en getResumenLCF: ${error.toString()}`);
    console.error(`Error en getResumenLCF para ${idLCF}:`, error);
    return { success: false, error: error.toString() };
  }
}



/**
 * VERSIÓN FINAL Y CORREGIDA: Lee el rango exacto de columnas (A-J)
 * y elimina la dependencia de la columna "Estado" que ya no existe.
 */
function getSeguimientoAlmasLCF_REAL(idLCF) {
  try {
    const directorios = cargarDirectorioCompleto();
    const lcfInfo = directorios.lideres.find(l => l.ID_Lider === idLCF);
    if (!lcfInfo) {
      return { success: false, error: `No se pudo encontrar la información del LCF con ID ${idLCF}` };
    }

    const hojaMaestra = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO)
                                      .getSheetByName('_SeguimientoConsolidado');
    
    // ---- CAMBIO 1: El rango ahora es A:J para coincidir con tu hoja ----
    const todosLosSeguimientos = hojaMaestra.getRange("A2:J" + hojaMaestra.getLastRow()).getValues();

    const getBienvenidaIcon = (resultado) => {
      const res = resultado || "";
      if (res.includes("Contacto Exitoso - Aceptó visita")) return { simbolo: '⭐', color: 'text-yellow-500', completado: true };
      if (res.includes("Prefiere visitar") || res.includes("Solicitó info")) return { simbolo: '✓', color: 'text-green-600', completado: true };
      if (["No contactar", "Sin interés", "No contestó", "Buzón", "Número equivocado"].includes(res)) return { simbolo: '―', color: 'text-gray-500', completado: true };
      return { simbolo: '✗', color: 'text-red-500', completado: false };
    };

    const getVisitaIcon = (resultado) => {
      const res = resultado || "";
      if (res.includes("Propone Apertura de Célula") || res.includes("Se integra a Célula existente")) return { simbolo: '⭐', color: 'text-yellow-500', completado: true };
      if (res.includes("No interesado por ahora") || res.includes("Solicita segunda visita")) return { simbolo: '―', color: 'text-gray-500', completado: true };
      if (res.includes("Visita No Concretada")) return { simbolo: '⏳', color: 'text-orange-500', completado: false };
      return { simbolo: '✗', color: 'text-red-500', completado: false };
    };

    const almasConSeguimiento = [];
    for (const fila of todosLosSeguimientos) {
      if (fila[2] === idLCF) {
        
        const bienvenidaData = getBienvenidaIcon(fila[6]); // Columna G
        const visitaData = getVisitaIcon(fila[7]);       // Columna H

        almasConSeguimiento.push({
          ID_Alma: fila[0],         // Columna A
          Nombre: fila[1],          // Columna B
          Telefono: fila[4],        // Columna E
          Acepta_Visita: fila[5],   // Columna F
          Bienvenida: {
            resultado: fila[6] || "Pendiente",
            completado: bienvenidaData.completado,
            simbolo: bienvenidaData.simbolo,
            color: bienvenidaData.color
          },
          Visita_Bendicion: {
            resultado: fila[7] || "Pendiente",
            completado: visitaData.completado,
            simbolo: visitaData.simbolo,
            color: visitaData.color
          },
          Progreso_Celulas: {
            texto: fila[8] || '0/12', // Columna I
            completados: parseInt(String(fila[8]).split('/')[0]) || 0
          },
          En_Celula: (parseInt(String(fila[8]).split('/')[0]) || 0) > 0,
          Dias_Sin_Seguimiento: fila[9], // Columna J
          // ---- CAMBIO 2: Se elimina la propiedad "Estado" que leía la columna K ----
          Estado: 'N/A' // Se asigna un valor por defecto ya que la columna no existe
        });
      }
    }
    
    const resumen = calcularResumenSeguimiento(almasConSeguimiento, lcfInfo);

    return {
      success: true,
      lcf: { Nombre: lcfInfo.Nombre_Lider, ID: lcfInfo.ID_Lider },
      almas: almasConSeguimiento,
      resumen: resumen,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('[SEGUIMIENTO CONSOLIDADO] Error general:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Procesa un alma de forma segura
 */
function procesarAlmaSegura(alma, data, lcf) {
    const nombreCompleto = alma.Nombre_Completo || `${alma.Nombres || ''} ${alma.Apellidos || ''}`.trim() || 'Sin nombre';
    const nombres = alma.Nombres || '';
    const apellidos = alma.Apellidos || '';
    
    // Inicializar con valores por defecto
    let bienvenida = {
        completado: false,
        resultado: 'Pendiente',
        fecha: null,
        simbolo: '✗'
    };
    
    let visitaBendicion = {
        completado: false,
        resultado: 'Pendiente',
        fecha: null,
        simbolo: '✗'
    };
    
    let progresoCelulas = {
        completados: 0,
        total: 12,
        texto: '0/12',
        porcentaje: 0,
        estado: 'No iniciado',
        dias_inactivo: null,
        celula: null,
        temas: null,
        estaEnCelula: false
    };
    
    // Intentar obtener datos reales si existen
    try {
        if (data.seguimiento?.interacciones && Array.isArray(data.seguimiento.interacciones)) {
            bienvenida = buscarBienvenidaSegura(alma.ID_Alma, nombreCompleto, data.seguimiento.interacciones);
        }
    } catch (e) {
        console.warn('[SEGUIMIENTO] Error buscando bienvenida:', e);
    }
    
    try {
        if (data.seguimiento?.visitas && Array.isArray(data.seguimiento.visitas)) {
            visitaBendicion = buscarVisitaBendicionSegura(alma.ID_Alma, nombreCompleto, data.seguimiento.visitas);
        }
    } catch (e) {
        console.warn('[SEGUIMIENTO] Error buscando visita:', e);
    }
    
    try {
        if (data.seguimiento?.maestroAsistentes && Array.isArray(data.seguimiento.maestroAsistentes)) {
            progresoCelulas = buscarProgresoCelulasSeguro(nombreCompleto, nombres, apellidos, data.seguimiento.maestroAsistentes);
        }
    } catch (e) {
        console.warn('[SEGUIMIENTO] Error buscando progreso células:', e);
    }
    
    // Calcular métricas
    const diasSinSeguimiento = calcularDiasSinContactoSeguro(
        alma.Timestamp,
        bienvenida.fecha,
        visitaBendicion.fecha
    );
    
    const estado = determinarEstadoAlmaSeguro(
        bienvenida.completado,
        visitaBendicion.completado,
        progresoCelulas.completados,
        progresoCelulas.estaEnCelula,
        diasSinSeguimiento
    );
    
    const prioridad = calcularPrioridadAlmaSegura(
        alma.Desea_Visita === 'SI',
        diasSinSeguimiento,
        estado,
        progresoCelulas.completados
    );
    
    return {
        // Datos básicos
        ID_Alma: alma.ID_Alma || 'Sin ID',
        Nombre: nombreCompleto,
        Telefono: alma.Telefono || 'Sin teléfono',
        
        // Solicitudes
        Acepta_Visita: alma.Desea_Visita || 'NO',
        Peticion: alma['Petición de Oración'] || alma.Peticion_Oracion || 'Sin petición',
        
        // Estados de seguimiento
        Bienvenida: bienvenida,
        Visita_Bendicion: visitaBendicion,
        Progreso_Celulas: progresoCelulas,
        En_Celula: progresoCelulas.estaEnCelula,
        
        // Métricas
        Dias_Sin_Seguimiento: diasSinSeguimiento,
        Estado: estado,
        Prioridad: prioridad,
        
        // Metadata
        Fecha_Ingreso: alma.Timestamp,
        LCF_Asignado: lcf.Nombre_Lider
    };
}

/**
 * Funciones auxiliares seguras
 */
function buscarBienvenida(idAlma, nombreCompleto, interacciones) {
  const interaccionesAlma = interacciones.filter(i => 
    i.ID_Alma === idAlma || 
    sonNombresSimilares(i.Nombre_Alma, nombreCompleto)
  );
  
  if (interaccionesAlma.length === 0) {
    return {
      completado: false,
      resultado: 'Pendiente',
      fecha: null,
      simbolo: '✗',
      cantidad: 0
    };
  }
  
  interaccionesAlma.sort((a, b) => 
    new Date(b.Timestamp_Interaccion) - new Date(a.Timestamp_Interaccion)
  );
  
  const ultima = interaccionesAlma[0];
  
  return {
    completado: true,
    resultado: ultima.Resultado || 'Contactado',
    fecha: ultima.Timestamp_Interaccion,
    medio: ultima.Medio_Contacto,
    simbolo: '✔',
    cantidad: interaccionesAlma.length
  };
}

function buscarVisitaBendicionSegura(idAlma, nombreCompleto, visitas) {
    try {
        const visitasAlma = visitas.filter(v => 
            v.ID_Alma === idAlma || 
            sonNombresSimilaresSeguros(v.Nombre_Alma, nombreCompleto)
        );
        
        if (visitasAlma.length === 0) {
            return {
                completado: false,
                resultado: 'Pendiente',
                fecha: null,
                simbolo: '✗',
                celula_asignada: null
            };
        }
        
        visitasAlma.sort((a, b) => new Date(b.Timestamp_Visita) - new Date(a.Timestamp_Visita));
        const ultima = visitasAlma[0];
        
        return {
            completado: ultima.Estatus_Visita === 'Realizada' || ultima.Resultado_Visita !== '',
            resultado: ultima.Resultado_Visita || ultima.Estatus_Visita || 'Registrada',
            fecha: ultima.Timestamp_Visita,
            celula_asignada: ultima.ID_Celula_Asignada,
            anfitrion: ultima.Nombre_Anfitrion_Asignado,
            simbolo: ultima.Estatus_Visita === 'Realizada' ? '✔' : '⏳'
        };
    } catch (error) {
        return {
            completado: false,
            resultado: 'Error',
            fecha: null,
            simbolo: '✗',
            celula_asignada: null
        };
    }
}

function buscarProgresoCelulasSeguro(nombreCompleto, nombres, apellidos, maestroAsistentes) {
    try {
        const asistente = maestroAsistentes.find(a => {
            const nombreAsistente = a.Nombre || '';
            return sonNombresSimilaresSeguros(nombreAsistente, nombreCompleto) ||
                   sonNombresSimilaresSeguros(nombreAsistente, nombres) ||
                   (nombreAsistente.includes(nombres) && nombreAsistente.includes(apellidos));
        });
        
        if (!asistente) {
            return {
                completados: 0,
                total: 12,
                texto: '0/12',
                porcentaje: 0,
                estado: 'No iniciado',
                dias_inactivo: null,
                celula: null,
                temas: null,
                estaEnCelula: false
            };
        }
        
        const partes = (asistente.Temas_Completados || '0/12').split('/');
        const completados = parseInt(partes[0] || 0);
        
        return {
            completados: completados,
            total: 12,
            texto: asistente.Temas_Completados || '0/12',
            porcentaje: asistente.Porcentaje || ((completados / 12) * 100),
            estado: asistente.Estado || 'Activo',
            dias_inactivo: asistente.Dias_Inactivo,
            celula: asistente.Celula_Principal,
            fecha_ultimo_tema: asistente.Fecha_Ultimo_Tema,
            temas: asistente.temas || null,
            estaEnCelula: true
        };
    } catch (error) {
        return {
            completados: 0,
            total: 12,
            texto: '0/12',
            porcentaje: 0,
            estado: 'Error',
            dias_inactivo: null,
            celula: null,
            temas: null,
            estaEnCelula: false
        };
    }
}

function sonNombresSimilaresSeguros(nombre1, nombre2) {
    try {
        if (!nombre1 || !nombre2) return false;
        
        const normalizar = (str) => {
            return str.toString()
                .toUpperCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, " ")
                .trim();
        };
        
        const n1 = normalizar(nombre1);
        const n2 = normalizar(nombre2);
        
        if (n1 === n2) return true;
        if (n1.includes(n2) || n2.includes(n1)) return true;
        
        const palabras1 = n1.split(' ');
        const palabras2 = n2.split(' ');
        if (palabras1[0] === palabras2[0] && palabras1.length > 1 && palabras2.length > 1) {
            return true;
        }
        
        return false;
    } catch (error) {
        return false;
    }
}

function calcularDiasSinContactoSeguro(fechaIngreso, fechaBienvenida, fechaVisita) {
    try {
        const hoy = new Date();
        const fechas = [];
        
        if (fechaIngreso) {
            const f = new Date(fechaIngreso);
            if (!isNaN(f.getTime())) fechas.push(f);
        }
        if (fechaBienvenida) {
            const f = new Date(fechaBienvenida);
            if (!isNaN(f.getTime())) fechas.push(f);
        }
        if (fechaVisita) {
            const f = new Date(fechaVisita);
            if (!isNaN(f.getTime())) fechas.push(f);
        }
        
        if (fechas.length === 0) return null;
        
        const ultimaFecha = fechas.sort((a, b) => b - a)[0];
        const dias = Math.floor((hoy - ultimaFecha) / (1000 * 60 * 60 * 24));
        
        return dias;
    } catch (error) {
        return null;
    }
}

function determinarEstadoAlmaSeguro(tieneBienvenida, tieneVisita, temasCompletados, estaEnCelula, diasSinContacto) {
    try {
        if (temasCompletados === 12) return 'Completado';
        if (estaEnCelula && temasCompletados > 0 && diasSinContacto <= 7) return 'Activo';
        if (diasSinContacto > 30) return 'Inactivo';
        if (diasSinContacto > 14) return 'En Riesgo';
        if (tieneBienvenida || tieneVisita || temasCompletados > 0) return 'En Proceso';
        return 'Nuevo';
    } catch (error) {
        return 'Sin datos';
    }
}

function calcularPrioridadAlmaSegura(deseaVisita, diasSinContacto, estado, temasCompletados) {
    try {
        if ((deseaVisita && diasSinContacto > 7) || diasSinContacto > 30) {
            return 'Urgente';
        }
        if (deseaVisita || estado === 'En Riesgo' || diasSinContacto > 14) {
            return 'Alta';
        }
        if (estado === 'Nuevo' || (temasCompletados < 3 && diasSinContacto > 7)) {
            return 'Media';
        }
        return 'Normal';
    } catch (error) {
        return 'Normal';
    }
}

/**
 * Calcula el resumen de métricas para el modal de seguimiento.
 * Esta función toma la lista de almas ya procesada y realiza los conteos.
 */
function calcularResumenSeguimiento(almasConSeguimiento, lcf) {
  // Contadores para el resumen
  let totalAlmas = almasConSeguimiento.length;
  let conBienvenida = 0;
  let conVisita = 0;
  let enCelulas = 0;
  let urgentes = 0;
  let activos = 0;
  let inactivos = 0;

  // Itera sobre cada alma para contar sus propiedades
  for (const alma of almasConSeguimiento) {
    if (alma.Bienvenida.completado) {
      conBienvenida++;
    }
    if (alma.Visita_Bendicion.completado) {
      conVisita++;
    }
    if (alma.En_Celula) {
      enCelulas++;
    }
    
    // Lógica para los contadores de estado
    if (alma.Estado === 'Activo') {
      activos++;
    } else if (alma.Estado === 'Inactivo') {
      inactivos++;
    }
    
    // Lógica para urgentes (basado en días o estado)
    if (alma.Dias_Sin_Seguimiento > 30 || alma.Estado === 'En Riesgo') {
       // Puedes ajustar esta lógica si "Urgente" significa otra cosa para ti
       // Por ahora, lo dejamos vacío para que el frontend lo maneje visualmente
    }
  }

  return {
    total_almas: totalAlmas,
    con_bienvenida: conBienvenida,
    con_visita: conVisita,
    en_celulas: enCelulas,
    activos: activos,
    urgentes: urgentes, // Este contador no se está usando en el modal, pero lo dejamos listo
    inactivos: inactivos,
    // Otros datos que podrían ser útiles
    completaron_celulas: almasConSeguimiento.filter(a => a.Progreso_Celulas.completados === 12).length,
    pidieron_visita: almasConSeguimiento.filter(a => a.Acepta_Visita === 'SI' || a.Acepta_Visita === 'Sí').length,
    dias_inactivo_lcf: lcf.Dias_Inactivo || null,
    ultimo_reporte_lcf: lcf.Ultima_Actividad || null
  };
}

/**
 * Funciones wrapper para compatibilidad
 */
function getSeguimientoAlmasLCF(idLCF) {
    return getSeguimientoAlmasLCF_REAL(idLCF);
}

function getVistaRapidaLCF(idLCF) {
    try {
        const seguimiento = getSeguimientoAlmasLCF_REAL(idLCF);
        
        if (!seguimiento.success) {
            return seguimiento;
        }
        
        const almasResumen = seguimiento.almas.map(alma => ({
            Nombre: alma.Nombre,
            Telefono: alma.Telefono,
            Acepta_Visita: alma.Acepta_Visita,
            Peticion: alma.Peticion,
            Bienvenida: alma.Bienvenida.simbolo,
            Visita: alma.Visita_Bendicion.simbolo,
            Celulas: alma.Progreso_Celulas.texto,
            Estado: alma.Estado,
            Dias_Sin_Seguimiento: alma.Dias_Sin_Seguimiento,
            ID_Alma: alma.ID_Alma
        }));
        
        return {
            success: true,
            lcf: seguimiento.lcf.Nombre,
            almas: almasResumen
        };
    } catch (error) {
        console.error('Error en getVistaRapidaLCF:', error);
        return { 
            success: false, 
            error: error.toString() 
        };
    }
}


/**
 * Cambia el estado de múltiples almas a "Baja" de forma HIPER-OPTIMIZADA.
 * No reescribe toda la hoja, solo modifica las celdas necesarias.
 * La operación pasará de minutos a segundos.
 */
function darDeBajaAlmasEnLote(idAlmasArray) {
  if (!idAlmasArray || idAlmasArray.length === 0) {
    return { success: false, error: 'No se proporcionaron IDs.' };
  }

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000); 
    
    const ss = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    const sheet = ss.getSheetByName('Ingresos');
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const idAlmaColIndex = headers.indexOf('ID_Alma');
    const estadoColIndex = headers.indexOf('Estado');

    if (idAlmaColIndex === -1 || estadoColIndex === -1) {
      throw new Error("Columnas 'ID_Alma' o 'Estado' no encontradas.");
    }

    // 1. Leer solo la columna de IDs para crear un mapa de búsqueda (muy rápido).
    const idColumnValues = sheet.getRange(2, idAlmaColIndex + 1, sheet.getLastRow() - 1, 1).getValues();
    const idMap = new Map();
    idColumnValues.forEach((row, index) => {
      if (row[0]) {
        idMap.set(String(row[0]), index + 2); // Mapea ID a su número de fila real
      }
    });

    // 2. Preparar una lista de celdas a modificar.
    const rangesToUpdate = [];
    const idsParaBajaSet = new Set(idAlmasArray);
    
    idsParaBajaSet.forEach(id => {
      if (idMap.has(id)) {
        const rowNumber = idMap.get(id);
        // Construye la referencia de la celda, ej: "J50"
        const cellNotation = sheet.getRange(rowNumber, estadoColIndex + 1).getA1Notation();
        rangesToUpdate.push(cellNotation);
      }
    });

    // 3. Usar getRangeList para modificar todas las celdas en una sola operación (ultra rápido).
    if (rangesToUpdate.length > 0) {
      sheet.getRangeList(rangesToUpdate).setValue('Baja');
      SpreadsheetApp.flush();
    }
    
    return { success: true, message: `${rangesToUpdate.length} de ${idAlmasArray.length} almas han sido dadas de baja.` };

  } catch (e) {
    console.error('Error en darDeBajaAlmasEnLote:', e);
    if (e.message.includes("Lock timed out")) {
        return { success: false, error: "El sistema está ocupado. Por favor, inténtalo de nuevo en unos segundos."};
    }
    return { success: false, error: e.toString() };
  } finally {
    lock.releaseLock();
  }
}

function limpiarCacheManualmente() {
  CacheService.getScriptCache().removeAll(['DASHBOARD_DATA_V2', 'LD_FULL_ID_DEL_LD', 'ACTIVIDAD_CACHE']); // Limpia las cachés conocidas
  console.log('Caché del script limpiada manualmente.');
}