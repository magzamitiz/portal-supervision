/**
 * @fileoverview Módulo unificado de utilidades y funciones auxiliares.
 * Combina GlobalHelpers, NormalizacionModule y UtilityModule en un solo módulo optimizado.
 */

// ==================== CONSTANTES Y VARIABLES GLOBALES ====================

const SCRIPT_START_TIME = Date.now();
const MAX_EXECUTION_TIME = 25000; // 25 segundos
const CACHE_KEY = 'DASHBOARD_DATA_V2'; // Clave principal para la caché

// ==================== FUNCIONES AUXILIARES GLOBALES ====================

/**
 * Helper global para búsqueda flexible de columnas.
 * Busca una columna en los headers que contenga cualquiera de los nombres especificados.
 * @param {Array<string>} headers - Array de nombres de columnas
 * @param {Array<string>} names - Array de nombres a buscar
 * @returns {number} Índice de la columna encontrada o -1 si no se encuentra
 */
const findCol = (headers, names) => headers.findIndex(h => names.some(name => h.includes(name)));

/**
 * Helper global para verificar timeout de ejecución.
 * @throws {Error} Si el tiempo de ejecución excede MAX_EXECUTION_TIME
 */
const checkTimeout = () => {
  if (Date.now() - SCRIPT_START_TIME > MAX_EXECUTION_TIME) {
    console.error('[TIMEOUT] Operación excedió tiempo máximo');
    throw new Error('Timeout: La operación tardó demasiado tiempo');
  }
};

/**
 * Helper global para limpiar caché.
 */
const clearCache = () => {
  CacheService.getScriptCache().remove(CACHE_KEY);
  console.log('Caché limpiada.');
};

/**
 * Helper global para obtener datos de caché.
 * @returns {Object|null} Datos de caché o null
 */
const getCacheData = () => {
  try {
    const cache = CacheService.getScriptCache();
    const cached = cache.get(CACHE_KEY);
    if (cached) {
      const compressedBlob = Utilities.newBlob(Utilities.base64Decode(cached), 'application/x-gzip');
      const decompressedBlob = compressedBlob.unzip();
      const data = JSON.parse(decompressedBlob.getDataAsString());
      console.log('Datos recuperados de la caché.');
      return data;
    }
  } catch (error) {
    console.error('Error al leer/descomprimir de la caché:', error);
    clearCache();
  }
  return null;
};

/**
 * Helper global para guardar datos en caché.
 * @param {Object} data - Datos a guardar
 */
const setCacheData = (data) => {
  try {
    const cache = CacheService.getScriptCache();
    const compressedData = Utilities.gzip(Utilities.newBlob(JSON.stringify(data)));
    const cacheDuration = (typeof CONFIG !== 'undefined' && CONFIG.CACHE && CONFIG.CACHE.DURATION) ? CONFIG.CACHE.DURATION : 1800; // 30 minutos por defecto
    cache.put(CACHE_KEY, Utilities.base64Encode(compressedData.getBytes()), cacheDuration);
    console.log(`Datos guardados en caché (Comprimidos). Expiración en ${cacheDuration} segundos.`);
  } catch (error) {
    console.error('Error al guardar en caché (Quizás los datos son muy grandes):', error);
  }
};

// ==================== FUNCIONES DE NORMALIZACIÓN ====================

/**
 * Normaliza valores de Sí/No a formato estándar.
 * @param {*} input - Valor de entrada a normalizar
 * @returns {string} Valor normalizado: 'SI', 'NO', o valor original
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

/**
 * Determina la prioridad de un ingreso basándose en decisiones espirituales.
 * @param {string} deseaVisita - Si desea visita (normalizado)
 * @param {string} aceptoJesus - Si aceptó a Jesús (normalizado)
 * @returns {string} Prioridad: 'Alta', 'Media', 'Normal'
 */
function determinarPrioridad(deseaVisita, aceptoJesus) {
  if (aceptoJesus === 'SI' && deseaVisita === 'SI') {
    return 'Alta';
  } else if (aceptoJesus === 'SI' || deseaVisita === 'SI') {
    return 'Media';
  }
  return 'Normal';
}

/**
 * Normaliza nombres de personas.
 * @param {string} nombre - Nombre a normalizar
 * @returns {string} Nombre normalizado
 */
function normalizarNombre(nombre) {
  if (!nombre) return '';
  return String(nombre).trim().replace(/\s+/g, ' ');
}

/**
 * Normaliza números de teléfono.
 * @param {string} telefono - Teléfono a normalizar
 * @returns {string} Teléfono normalizado
 */
function normalizarTelefono(telefono) {
  if (!telefono) return '';
  return String(telefono).replace(/\D/g, ''); // Solo números
}

/**
 * Normaliza fechas a formato ISO.
 * @param {*} fecha - Fecha a normalizar
 * @returns {string|null} Fecha en formato ISO o null
 */
function normalizarFecha(fecha) {
  if (!fecha) return null;
  
  try {
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) return null;
    return fechaObj.toISOString();
  } catch (error) {
    return null;
  }
}

/**
 * Normaliza IDs eliminando espacios y convirtiendo a mayúsculas.
 * @param {string} id - ID a normalizar
 * @returns {string} ID normalizado
 */
function normalizarId(id) {
  if (!id) return '';
  return String(id).trim().toUpperCase();
}

/**
 * Normaliza texto general eliminando espacios extra.
 * @param {string} texto - Texto a normalizar
 * @returns {string} Texto normalizado
 */
function normalizarTexto(texto) {
  if (!texto) return '';
  return String(texto).trim().replace(/\s+/g, ' ');
}

/**
 * Normaliza estado de actividad.
 * @param {string} estado - Estado a normalizar
 * @returns {string} Estado normalizado
 */
function normalizarEstadoActividad(estado) {
  if (!estado) return 'Sin Datos';
  
  const estadoNormalizado = String(estado).trim().toLowerCase();
  
  if (estadoNormalizado.includes('activo')) return 'Activo';
  if (estadoNormalizado.includes('alerta')) return 'Alerta';
  if (estadoNormalizado.includes('inactivo')) return 'Inactivo';
  
  return 'Sin Datos';
}

/**
 * Normaliza rol de líder.
 * @param {string} rol - Rol a normalizar
 * @returns {string} Rol normalizado
 */
function normalizarRol(rol) {
  if (!rol) return '';
  
  const rolNormalizado = String(rol).trim().toUpperCase();
  
  if (rolNormalizado.includes('LD')) return 'LD';
  if (rolNormalizado.includes('LCF')) return 'LCF';
  
  return rolNormalizado;
}

/**
 * Normaliza estado de asignación.
 * @param {string} estado - Estado a normalizar
 * @returns {string} Estado normalizado
 */
function normalizarEstadoAsignacion(estado) {
  if (!estado) return 'Pendiente';
  
  const estadoNormalizado = String(estado).trim().toLowerCase();
  
  if (estadoNormalizado.includes('asignad')) return 'Asignado';
  if (estadoNormalizado.includes('pendient')) return 'Pendiente';
  if (estadoNormalizado.includes('baja')) return 'Baja';
  
  return 'Pendiente';
}

// ==================== FUNCIONES DE MAPEO Y INTEGRACIÓN ====================

/**
 * Mapea almas a células para integración
 * @param {Array} celulas - Array de células
 * @returns {Map} Mapa de ID_Alma -> ID_Celula
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
 * Integra la información de la célula en la lista de ingresos (almas)
 * @param {Array} ingresos - Array de ingresos
 * @param {Map} almasEnCelulasMap - Mapa de almas a células
 */
function integrarAlmasACelulas(ingresos, almasEnCelulasMap) {
  ingresos.forEach(ingreso => {
    const idCelula = almasEnCelulasMap.get(ingreso.ID_Alma);
    ingreso.ID_Celula = idCelula || null;
    ingreso.En_Celula = !!idCelula;
  });
}

/**
 * Calcula resumen de seguimiento para un LCF
 * @param {Array} almasConSeguimiento - Array de almas con seguimiento
 * @param {Object} lcf - Información del LCF
 * @returns {Object} Resumen del seguimiento
 */
function calcularResumenSeguimiento(almasConSeguimiento, lcf) {
  let totalAlmas = almasConSeguimiento.length;
  let conBienvenida = 0;
  let conVisita = 0;
  let enCelulas = 0;
  let urgentes = 0;
  let activos = 0;
  let inactivos = 0;

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
    
    if (alma.Estado === 'Activo') {
      activos++;
    } else if (alma.Estado === 'Inactivo') {
      inactivos++;
    }
    
    if (alma.Dias_Sin_Seguimiento > 30 || alma.Estado === 'En Riesgo') {
      urgentes++;
    }
  }

  return {
    totalAlmas: totalAlmas,
    conBienvenida: conBienvenida,
    conVisita: conVisita,
    enCelulas: enCelulas,
    urgentes: urgentes,
    activos: activos,
    inactivos: inactivos,
    porcentajeBienvenida: totalAlmas > 0 ? ((conBienvenida / totalAlmas) * 100).toFixed(1) : 0,
    porcentajeVisita: totalAlmas > 0 ? ((conVisita / totalAlmas) * 100).toFixed(1) : 0,
    porcentajeEnCelulas: totalAlmas > 0 ? ((enCelulas / totalAlmas) * 100).toFixed(1) : 0
  };
}

/**
 * Procesa un alma de forma segura
 * @param {Object} alma - Datos del alma
 * @param {Array} data - Datos adicionales
 * @param {Object} lcf - Información del LCF
 * @returns {Object} Alma procesada
 */
function procesarAlmaSegura(alma, data, lcf) {
  const nombreCompleto = alma.Nombre_Completo || `${alma.Nombres || ''} ${alma.Apellidos || ''}`.trim() || 'Sin nombre';
  
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
    texto: '0/12',
    completados: 0,
    total: 12,
    porcentaje: 0
  };
  
  return {
    ID_Alma: alma.ID_Alma || '',
    Nombre: nombreCompleto,
    Nombres: alma.Nombres || '',
    Apellidos: alma.Apellidos || '',
    Telefono: alma.Telefono || '',
    Acepta_Visita: alma.Acepta_Visita || false,
    Bienvenida: bienvenida,
    Visita_Bendicion: visitaBendicion,
    Progreso_Celulas: progresoCelulas,
    Estado: alma.Estado || 'Nuevo',
    Dias_Sin_Seguimiento: alma.Dias_Sin_Seguimiento || 0,
    En_Celula: progresoCelulas.completados > 0,
    LCF: {
      ID: lcf.ID_Lider || '',
      Nombre: lcf.Nombre_Lider || ''
    }
  };
}

// ==================== FUNCIONES DE CÁLCULO DE ACTIVIDAD ====================

/**
 * Calcula actividad de líderes con mapeo de células
 * @param {Array} celulas - Array de células
 * @returns {Map} Mapa de actividad de líderes
 */
function calcularActividadLideres(celulas) {
  console.log('Calculando actividad de líderes con mapeo de células...');
  
  if (!celulas || celulas.length === 0) {
    return new Map();
  }
  
  const actividadMap = new Map();
  
  const celulaLiderMap = new Map(
    celulas
      .filter(c => c?.ID_Celula && c?.ID_LCF_Responsable)
      .map(c => [c.ID_Celula, c.ID_LCF_Responsable])
  );
  
  if (celulaLiderMap.size === 0) {
    return actividadMap;
  }
  
  const cacheKey = 'ACTIVIDAD_CACHE';
  const cache = CacheService.getScriptCache();
  const cached = cache.get(cacheKey);
  
  if (cached) {
    console.log('Usando actividad desde caché');
    return new Map(JSON.parse(cached));
  }
  
  // Procesar sheets externos para calcular actividad
  try {
    // Verificar si CONFIG está disponible y tiene las propiedades necesarias
    if (typeof CONFIG !== 'undefined' && CONFIG.SHEETS && CONFIG.SHEETS.REPORTE_CELULAS && CONFIG.TABS && CONFIG.TABS.ACTIVIDAD_CELULAS) {
      procesarHojaActividad(
        CONFIG.SHEETS.REPORTE_CELULAS,
        CONFIG.TABS.ACTIVIDAD_CELULAS,
        ['Timestamp', 'Fecha', 'Marca temporal'],
        ['ID Célula', 'ID_Celula', 'Id de la célula'],
        actividadMap,
        celulaLiderMap
      );
    }
    
    if (typeof CONFIG !== 'undefined' && CONFIG.SHEETS && CONFIG.SHEETS.VISITAS_BENDICION && CONFIG.TABS && CONFIG.TABS.ACTIVIDAD_VISITAS) {
      procesarHojaActividad(
        CONFIG.SHEETS.VISITAS_BENDICION,
        CONFIG.TABS.ACTIVIDAD_VISITAS,
        ['Timestamp', 'Fecha', 'Marca temporal'],
        ['ID Célula', 'ID_Celula', 'Id de la célula'],
        actividadMap,
        celulaLiderMap
      );
    }
    
    if (typeof CONFIG !== 'undefined' && CONFIG.SHEETS && CONFIG.SHEETS.REGISTRO_INTERACCIONES) {
      procesarHojaActividad(
        CONFIG.SHEETS.REGISTRO_INTERACCIONES,
        null,
        ['Timestamp', 'Fecha', 'Marca temporal'],
        ['ID LCF', 'ID_LCF', 'ID Líder'],
        actividadMap
      );
    }
    
    const actividadArray = Array.from(actividadMap.entries());
    cache.put(cacheKey, JSON.stringify(actividadArray), 300);
    console.log(`Actividad calculada para ${actividadMap.size} líderes`);
    
  } catch (error) {
    console.error('Error calculando actividad:', error);
  }
  
  return actividadMap;
}

/**
 * Procesa una hoja de actividad externa
 * @param {string} sheetId - ID de la hoja
 * @param {string} tabName - Nombre de la pestaña
 * @param {Array<string>} timestampCols - Nombres de columnas de timestamp
 * @param {Array<string>} idCols - Nombres de columnas de ID
 * @param {Map} actividadMap - Mapa de actividad a actualizar
 * @param {Map} idLookupMap - Mapa de búsqueda de IDs (opcional)
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
      console.warn(`En la hoja "${sheet.getName()}", no se encontró una de las columnas requeridas (Timestamp o ID).`);
      return;
    }

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      let idInicial = String(row[idIndex] || '').trim();
      const timestamp = row[timestampIndex];
      
      const leaderId = idLookupMap ? idLookupMap.get(idInicial) : idInicial;

      if (leaderId && timestamp instanceof Date && !isNaN(timestamp.getTime())) {
        const currentDate = timestamp;
        const existingDate = actividadMap.get(leaderId);

        if (!existingDate || currentDate > existingDate) {
          actividadMap.set(leaderId, currentDate);
        }
      }
    }

    console.log(`Procesada hoja "${sheet.getName()}": ${actividadMap.size} líderes con actividad`);
  } catch (error) {
    console.error(`Error procesando hoja de actividad ${sheetId}:`, error);
  }
}

/**
 * Integra actividad de líderes en la lista de líderes
 * @param {Array} lideres - Array de líderes
 * @param {Map} actividadMap - Mapa de actividad
 * @returns {Array} Líderes con actividad integrada
 */
function integrarActividadLideres(lideres, actividadMap) {
  const hoy = new Date();

  return lideres.map(lider => {
    const ultimaActividad = actividadMap.get(lider.ID_Lider);
    let diasInactivo = null;
    let estadoActividad = '-';

    if (ultimaActividad) {
      const fechaActividad = new Date(ultimaActividad);
      diasInactivo = Math.floor((hoy - fechaActividad) / (1000 * 60 * 60 * 24));

      // Usar valores por defecto si CONFIG no está disponible
      const diasActivo = (typeof CONFIG !== 'undefined' && CONFIG.DIAS_INACTIVO && CONFIG.DIAS_INACTIVO.ACTIVO) ? CONFIG.DIAS_INACTIVO.ACTIVO : 7;
      const diasAlerta = (typeof CONFIG !== 'undefined' && CONFIG.DIAS_INACTIVO && CONFIG.DIAS_INACTIVO.ALERTA) ? CONFIG.DIAS_INACTIVO.ALERTA : 14;

      if (diasInactivo <= diasActivo) {
        estadoActividad = 'Activo';
      } else if (diasInactivo <= diasAlerta) {
        estadoActividad = 'Alerta';
      } else {
        estadoActividad = 'Inactivo';
      }
    }

    return {
      ...lider,
      Ultima_Actividad: ultimaActividad ? new Date(ultimaActividad).toISOString() : null,
      Dias_Inactivo: diasInactivo,
      Estado_Actividad: estadoActividad
    };
  });
}

/**
 * Cuenta las células activas
 * @param {Array} celulas - Array de células
 * @returns {number} Número de células activas
 */
function contarCelulasActivas(celulas) {
  return celulas.filter(c => 
    c.Estado === 'Activo' || 
    c.Estado === 'Saludable' || 
    c.Estado === 'En Crecimiento'
  ).length;
}

/**
 * Verifica si un alma está en alguna célula
 * @param {string} idAlma - ID del alma
 * @param {Array} celulas - Array de células
 * @returns {boolean} True si está en alguna célula
 */
function verificarEnCelula(idAlma, celulas) {
  return celulas.some(celula => 
    celula.Miembros.some(m => m.ID_Miembro === idAlma)
  );
}

console.log('🛠️ UtilsModule cargado - Funciones auxiliares unificadas disponibles');
