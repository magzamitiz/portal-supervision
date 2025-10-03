/**
 * INGRESOS MODULE - GESTIÓN DE INGRESOS
 * Etapa 2 - Semana 2: Separación en módulos
 * 
 * Este módulo contiene toda la lógica relacionada con la gestión
 * de ingresos (almas) manteniendo 100% compatibilidad.
 */

// ==================== CONFIGURACIÓN DEL MÓDULO ====================

// Función auxiliar findCol ya está declarada en DataModule.gs

const INGRESOS_CONFIG = {
  ESTADOS_ASIGNACION: {
    ASIGNADO: 'Asignado',
    PENDIENTE: 'Pendiente',
    BAJA: 'Baja'
  },
  
  DECISIONES_ESPIRITUALES: {
    SI: 'SI',
    SÍ: 'SÍ',
    NO: 'NO'
  },
  
  FUENTES_CONTACTO: {
    REDES_SOCIALES: 'Redes Sociales',
    REFERIDO: 'Referido',
    EVENTO: 'Evento',
    OTRO: 'Otro'
  },
  
  PRIORIDADES: {
    URGENTE: 'Urgente',
    ALTA: 'Alta',
    MEDIA: 'Media',
    NORMAL: 'Normal'
  }
};

// ==================== FUNCIONES DE CARGA DE INGRESOS ====================

/**
 * Carga todos los ingresos con datos completos (compatible con código original)
 * @param {Object} spreadsheet - Objeto spreadsheet de Google Apps Script
 * @param {string} sheetName - Nombre de la hoja
 * @returns {Array} Array de ingresos completos
 */
function cargarIngresosModulo(spreadsheet, sheetName) {
  try {
    console.log('[IngresosModule] Cargando ingresos completos...');
    
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) return [];

    const todosLosDatos = sheet.getDataRange().getValues();
    const headers = todosLosDatos.shift(); // Saca la fila de encabezados

    // ==================== FILTRADO POR ESTADO "BAJA" ====================
    const estadoColIndex = headers.indexOf('Estado');
    let datosActivos = [];

    if (estadoColIndex !== -1) {
      // Filtrar para mantener solo las almas cuyo estado NO sea "Baja"
      datosActivos = todosLosDatos.filter(row => row[estadoColIndex] !== 'Baja');
      console.log(`[IngresosModule] Se encontraron ${todosLosDatos.length} registros, se procesarán ${datosActivos.length} activos.`);
    } else {
      // Si no hay columna de estado, procesar todos por seguridad
      datosActivos = todosLosDatos;
      console.warn("[IngresosModule] No se encontró la columna 'Estado' en la hoja Ingresos. No se pudieron filtrar las bajas.");
    }
    // ===================== FIN DEL FILTRADO ======================

    if (datosActivos.length === 0) return [];

    const ingresos = [];
    const hoy = new Date();
    
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

    // Procesar solo los datos activos (ya filtrados)
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
    
    console.log(`[IngresosModule] ${ingresos.length} ingresos cargados`);
    return ingresos;
    
  } catch (error) {
    console.error('[IngresosModule] Error cargando ingresos completos:', error);
    return [];
  }
}

/**
 * Carga ingresos con solo datos esenciales (optimizado)
 * @param {Object} spreadsheet - Objeto spreadsheet de Google Apps Script
 * @param {string} sheetName - Nombre de la hoja
 * @param {string} lcfId - ID del LCF para filtrar (opcional)
 * @returns {Array} Array de ingresos optimizados
 */
function cargarIngresosOptimizados(spreadsheet, sheetName, lcfId = null) {
  try {
    console.log('[IngresosModule] Cargando ingresos optimizados...');
    
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) return [];

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];

    const headers = data[0].map(h => h.toString().trim());
    
    // Encontrar columnas esenciales
    const columnas = mapearColumnasIngresos(headers);
    
    if (columnas.idAlma === -1) {
      console.warn('[IngresosModule] Columna ID_Alma no encontrada');
      return [];
    }
    
    const ingresos = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const idAlma = row[columnas.idAlma];
      
      if (!idAlma) continue;
      
      // Si se especifica LCF, filtrar
      if (lcfId && columnas.idLCF !== -1) {
        const rowLCF = row[columnas.idLCF];
        if (rowLCF && rowLCF.toString().trim() !== lcfId) {
          continue;
        }
      }
      
      const ingreso = {
        ID_Alma: idAlma.toString().trim(),
        Nombre_Completo: columnas.nombre !== -1 ? (row[columnas.nombre] || '').toString().trim() : '',
        Telefono: columnas.telefono !== -1 ? (row[columnas.telefono] || '').toString().trim() : '',
        ID_LCF: columnas.idLCF !== -1 ? (row[columnas.idLCF] || '').toString().trim() : '',
        Nombre_LCF: columnas.nombreLCF !== -1 ? (row[columnas.nombreLCF] || '').toString().trim() : '',
        Estado_Asignacion: columnas.estadoAsignacion !== -1 ? (row[columnas.estadoAsignacion] || '').toString().trim() : INGRESOS_CONFIG.ESTADOS_ASIGNACION.PENDIENTE,
        En_Celula: columnas.enCelula !== -1 ? Boolean(row[columnas.enCelula]) : false,
        Timestamp: columnas.timestamp !== -1 ? row[columnas.timestamp] : null,
        Acepto_Jesus: columnas.aceptoJesus !== -1 ? (row[columnas.aceptoJesus] || '').toString().trim() : '',
        Desea_Visita: columnas.deseaVisita !== -1 ? (row[columnas.deseaVisita] || '').toString().trim() : '',
        Fuente_Contacto: columnas.fuenteContacto !== -1 ? (row[columnas.fuenteContacto] || '').toString().trim() : ''
      };
      
      // Calcular días desde ingreso
      if (ingreso.Timestamp) {
        const fechaIngreso = new Date(ingreso.Timestamp);
        const hoy = new Date();
        ingreso.Dias_Desde_Ingreso = Math.floor((hoy - fechaIngreso) / (1000 * 60 * 60 * 24));
      } else {
        ingreso.Dias_Desde_Ingreso = null;
      }
      
      ingresos.push(ingreso);
    }
    
    console.log(`[IngresosModule] ${ingresos.length} ingresos optimizados cargados${lcfId ? ` para LCF ${lcfId}` : ''}`);
    return ingresos;
    
  } catch (error) {
    console.error('[IngresosModule] Error cargando ingresos optimizados:', error);
    return [];
  }
}

/**
 * Carga ingresos por LCF específico
 * @param {Object} spreadsheet - Objeto spreadsheet de Google Apps Script
 * @param {string} sheetName - Nombre de la hoja
 * @param {string} idLCF - ID del LCF
 * @returns {Array} Array de ingresos del LCF
 */
// ❌ ELIMINADA: cargarIngresosPorLCF - No se usa en ningún lugar
// Esta función era un wrapper simple que solo filtraba datos ya cargados
// y no aportaba valor al sistema. El filtrado se hace directamente donde se necesita.

// ==================== FUNCIONES DE ANÁLISIS DE INGRESOS ====================

/**
 * Analiza los ingresos por diferentes criterios
 * @param {Array} ingresos - Array de ingresos
 * @returns {Object} Análisis completo de ingresos
 */
function analizarIngresos(ingresos) {
  try {
    console.log('[IngresosModule] Analizando ingresos...');
    
    const analisis = {
      total_historico: ingresos.length,
      ingresos_hoy: 0,
      ingresos_semana: 0,
      ingresos_mes: 0,
      por_estado_asignacion: {},
      por_fuente: {},
      por_LCF: {},
      por_LD: {},
      decisiones_espirituales: {
        aceptaron_jesus: 0,
        desean_visita: 0
      },
      integracion_celula: {
        en_celula: 0,
        sin_celula: 0
      },
      tasas: {
        asignacion: 0,
        integracion_celula: 0
      }
    };
    
    const hoy = new Date();
    const hoyFormateada = Utilities.formatDate(hoy, CONFIG.TIMEZONE || Session.getScriptTimeZone(), 'yyyy-MM-dd');
    
    ingresos.forEach(ingreso => {
      // Análisis temporal
      if (ingreso.Timestamp) {
        const fechaIngreso = new Date(ingreso.Timestamp);
        const fechaFormateada = Utilities.formatDate(fechaIngreso, CONFIG.TIMEZONE || Session.getScriptTimeZone(), 'yyyy-MM-dd');
        
        if (fechaFormateada === hoyFormateada) {
          analisis.ingresos_hoy++;
        }
        
        if (ingreso.Dias_Desde_Ingreso !== null) {
          if (ingreso.Dias_Desde_Ingreso <= 7) analisis.ingresos_semana++;
          if (ingreso.Dias_Desde_Ingreso <= 30) analisis.ingresos_mes++;
        }
      }
      
      // Estado de asignación
      const estado = ingreso.Estado_Asignacion || INGRESOS_CONFIG.ESTADOS_ASIGNACION.PENDIENTE;
      analisis.por_estado_asignacion[estado] = (analisis.por_estado_asignacion[estado] || 0) + 1;
      
      // Estado de integración (Célula)
      if (ingreso.En_Celula) {
        analisis.integracion_celula.en_celula++;
      } else {
        analisis.integracion_celula.sin_celula++;
      }
      
      // Decisiones espirituales
      if (ingreso.Acepto_Jesus === INGRESOS_CONFIG.DECISIONES_ESPIRITUALES.SI || 
          ingreso.Acepto_Jesus === INGRESOS_CONFIG.DECISIONES_ESPIRITUALES.SÍ) {
        analisis.decisiones_espirituales.aceptaron_jesus++;
      }
      
      if (ingreso.Desea_Visita === INGRESOS_CONFIG.DECISIONES_ESPIRITUALES.SI || 
          ingreso.Desea_Visita === INGRESOS_CONFIG.DECISIONES_ESPIRITUALES.SÍ) {
        analisis.decisiones_espirituales.desean_visita++;
      }
      
      // Por fuente
      const fuente = ingreso.Fuente_Contacto || 'No especificada';
      analisis.por_fuente[fuente] = (analisis.por_fuente[fuente] || 0) + 1;
      
      // Por LCF y LD
      if (ingreso.ID_LCF) {
        if (!analisis.por_LCF[ingreso.ID_LCF]) {
          analisis.por_LCF[ingreso.ID_LCF] = { 
            nombre: ingreso.Nombre_LCF || 'Sin nombre', 
            total: 0 
          };
        }
        analisis.por_LCF[ingreso.ID_LCF].total++;
      }
    });
    
    // Calcular tasas
    analisis.tasas.asignacion = analisis.total_historico > 0 ?
      ((analisis.por_estado_asignacion[INGRESOS_CONFIG.ESTADOS_ASIGNACION.ASIGNADO] || 0) / analisis.total_historico * 100).toFixed(1) : 0;
    
    analisis.tasas.integracion_celula = analisis.total_historico > 0 ?
      ((analisis.integracion_celula.en_celula / analisis.total_historico) * 100).toFixed(1) : 0;
    
    console.log('[IngresosModule] Análisis de ingresos completado');
    return analisis;
    
  } catch (error) {
    console.error('[IngresosModule] Error analizando ingresos:', error);
    return {
      total_historico: 0,
      ingresos_hoy: 0,
      ingresos_semana: 0,
      ingresos_mes: 0,
      por_estado_asignacion: {},
      por_fuente: {},
      por_LCF: {},
      por_LD: {},
      decisiones_espirituales: { aceptaron_jesus: 0, desean_visita: 0 },
      integracion_celula: { en_celula: 0, sin_celula: 0 },
      tasas: { asignacion: 0, integracion_celula: 0 }
    };
  }
}

/**
 * Calcula métricas de ingresos
 * @param {Array} ingresos - Array de ingresos
 * @returns {Object} Métricas calculadas
 */
function calcularMetricasIngresos(ingresos) {
  try {
    console.log('[IngresosModule] Calculando métricas de ingresos...');
    
    const totalIngresos = ingresos.length;
    const asignados = ingresos.filter(i => i.Estado_Asignacion === INGRESOS_CONFIG.ESTADOS_ASIGNACION.ASIGNADO).length;
    const enCelula = ingresos.filter(i => i.En_Celula).length;
    const aceptaronJesus = ingresos.filter(i => 
      i.Acepto_Jesus === INGRESOS_CONFIG.DECISIONES_ESPIRITUALES.SI || 
      i.Acepto_Jesus === INGRESOS_CONFIG.DECISIONES_ESPIRITUALES.SÍ
    ).length;
    const deseanVisita = ingresos.filter(i => 
      i.Desea_Visita === INGRESOS_CONFIG.DECISIONES_ESPIRITUALES.SI || 
      i.Desea_Visita === INGRESOS_CONFIG.DECISIONES_ESPIRITUALES.SÍ
    ).length;
    
    const metricas = {
      total_ingresos: totalIngresos,
      asignados: asignados,
      pendientes: totalIngresos - asignados,
      en_celula: enCelula,
      sin_celula: totalIngresos - enCelula,
      aceptaron_jesus: aceptaronJesus,
      desean_visita: deseanVisita,
      tasa_asignacion: totalIngresos > 0 ? ((asignados / totalIngresos) * 100).toFixed(1) : 0,
      tasa_integracion: totalIngresos > 0 ? ((enCelula / totalIngresos) * 100).toFixed(1) : 0,
      tasa_aceptacion_jesus: totalIngresos > 0 ? ((aceptaronJesus / totalIngresos) * 100).toFixed(1) : 0,
      tasa_desean_visita: totalIngresos > 0 ? ((deseanVisita / totalIngresos) * 100).toFixed(1) : 0
    };
    
    console.log('[IngresosModule] Métricas calculadas:', metricas);
    return metricas;
    
  } catch (error) {
    console.error('[IngresosModule] Error calculando métricas:', error);
    return {
      total_ingresos: 0,
      asignados: 0,
      pendientes: 0,
      en_celula: 0,
      sin_celula: 0,
      aceptaron_jesus: 0,
      desean_visita: 0,
      tasa_asignacion: 0,
      tasa_integracion: 0,
      tasa_aceptacion_jesus: 0,
      tasa_desean_visita: 0
    };
  }
}

// ==================== FUNCIONES DE BÚSQUEDA Y FILTRADO ====================

/**
 * Busca un ingreso por ID de alma
 * @param {Array} ingresos - Array de ingresos
 * @param {string} idAlma - ID del alma a buscar
 * @returns {Object|null} Ingreso encontrado o null
 */
function buscarIngresoPorIdAlma(ingresos, idAlma) {
  try {
    return ingresos.find(ingreso => ingreso.ID_Alma === idAlma) || null;
  } catch (error) {
    console.error('[IngresosModule] Error buscando ingreso por ID de alma:', error);
    return null;
  }
}

/**
 * Busca ingresos por nombre (búsqueda parcial)
 * @param {Array} ingresos - Array de ingresos
 * @param {string} nombre - Nombre a buscar
 * @returns {Array} Array de ingresos que coinciden
 */
function buscarIngresosPorNombre(ingresos, nombre) {
  try {
    const nombreBusqueda = nombre.toLowerCase().trim();
    return ingresos.filter(ingreso => 
      ingreso.Nombre_Completo && 
      ingreso.Nombre_Completo.toLowerCase().includes(nombreBusqueda)
    );
  } catch (error) {
    console.error('[IngresosModule] Error buscando ingresos por nombre:', error);
    return [];
  }
}

/**
 * Filtra ingresos por LCF
 * @param {Array} ingresos - Array de ingresos
 * @param {string} idLCF - ID del LCF
 * @returns {Array} Array de ingresos del LCF
 */
function filtrarIngresosPorLCF(ingresos, idLCF) {
  try {
    return ingresos.filter(ingreso => ingreso.ID_LCF === idLCF);
  } catch (error) {
    console.error('[IngresosModule] Error filtrando ingresos por LCF:', error);
    return [];
  }
}

/**
 * Filtra ingresos por estado de asignación
 * @param {Array} ingresos - Array de ingresos
 * @param {string} estado - Estado de asignación
 * @returns {Array} Array de ingresos con el estado especificado
 */
function filtrarIngresosPorEstado(ingresos, estado) {
  try {
    return ingresos.filter(ingreso => ingreso.Estado_Asignacion === estado);
  } catch (error) {
    console.error('[IngresosModule] Error filtrando ingresos por estado:', error);
    return [];
  }
}

/**
 * Filtra ingresos por integración en célula
 * @param {Array} ingresos - Array de ingresos
 * @param {boolean} enCelula - Si está en célula o no
 * @returns {Array} Array de ingresos filtrados
 */
function filtrarIngresosPorIntegracion(ingresos, enCelula) {
  try {
    return ingresos.filter(ingreso => ingreso.En_Celula === enCelula);
  } catch (error) {
    console.error('[IngresosModule] Error filtrando ingresos por integración:', error);
    return [];
  }
}

// ❌ ELIMINADA: obtenerIngresosUrgentes - No se usa en ningún lugar
// Esta función era un filtro simple que no aportaba valor al sistema

// ==================== FUNCIONES DE UTILIDAD ====================

/**
 * Mapea las columnas de la hoja de ingresos
 * @param {Array} headers - Encabezados de la hoja
 * @returns {Object} Mapeo de columnas
 */
function mapearColumnasIngresos(headers) {
  return {
    idAlma: findCol(headers, ['ID_Alma', 'ID Alma']),
    nombre: findCol(headers, ['Nombre_Completo', 'Nombre Completo', 'Nombre']),
    telefono: findCol(headers, ['Telefono', 'Teléfono']),
    idLCF: findCol(headers, ['ID_LCF', 'ID LCF']),
    nombreLCF: findCol(headers, ['Nombre_LCF', 'Nombre LCF']),
    estadoAsignacion: findCol(headers, ['Estado_Asignacion', 'Estado Asignación']),
    enCelula: findCol(headers, ['En_Celula', 'En Célula']),
    timestamp: findCol(headers, ['Timestamp', 'Fecha_Ingreso', 'Fecha Ingreso']),
    aceptoJesus: findCol(headers, ['Acepto_Jesus', 'Aceptó Jesús']),
    deseaVisita: findCol(headers, ['Desea_Visita', 'Desea Visita']),
    fuenteContacto: findCol(headers, ['Fuente_Contacto', 'Fuente Contacto'])
  };
}

/**
 * Procesa una fila de ingreso
 * @param {Array} row - Fila de datos
 * @param {Object} columnas - Mapeo de columnas
 * @param {Array} headers - Encabezados
 * @returns {Object|null} Ingreso procesado o null
 */
function procesarFilaIngreso(row, columnas, headers) {
  try {
    const idAlma = row[columnas.idAlma];
    
    if (!idAlma) {
      return null; // Saltar filas sin ID
    }
    
    const ingreso = {
      ID_Alma: idAlma.toString().trim(),
      Nombre_Completo: columnas.nombre !== -1 ? (row[columnas.nombre] || '').toString().trim() : '',
      Telefono: columnas.telefono !== -1 ? (row[columnas.telefono] || '').toString().trim() : '',
      ID_LCF: columnas.idLCF !== -1 ? (row[columnas.idLCF] || '').toString().trim() : '',
      Nombre_LCF: columnas.nombreLCF !== -1 ? (row[columnas.nombreLCF] || '').toString().trim() : '',
      Estado_Asignacion: columnas.estadoAsignacion !== -1 ? (row[columnas.estadoAsignacion] || '').toString().trim() : INGRESOS_CONFIG.ESTADOS_ASIGNACION.PENDIENTE,
      En_Celula: columnas.enCelula !== -1 ? Boolean(row[columnas.enCelula]) : false,
      Timestamp: columnas.timestamp !== -1 ? row[columnas.timestamp] : null,
      Acepto_Jesus: columnas.aceptoJesus !== -1 ? (row[columnas.aceptoJesus] || '').toString().trim() : '',
      Desea_Visita: columnas.deseaVisita !== -1 ? (row[columnas.deseaVisita] || '').toString().trim() : '',
      Fuente_Contacto: columnas.fuenteContacto !== -1 ? (row[columnas.fuenteContacto] || '').toString().trim() : ''
    };
    
    // Calcular días desde ingreso
    if (ingreso.Timestamp) {
      const fechaIngreso = new Date(ingreso.Timestamp);
      const hoy = new Date();
      ingreso.Dias_Desde_Ingreso = Math.floor((hoy - fechaIngreso) / (1000 * 60 * 60 * 24));
    } else {
      ingreso.Dias_Desde_Ingreso = null;
    }
    
    return ingreso;
    
  } catch (error) {
    console.error('[IngresosModule] Error procesando fila de ingreso:', error);
    return null;
  }
}

// ==================== FUNCIONES DE COMPATIBILIDAD ====================

// ❌ ELIMINADA: cargarHojaIngresos - Wrapper redundante que causaba colisión de namespace
// Esta función causaba conflicto con cargarHojaIngresos en DataModule.gs
// La funcionalidad se mantiene en cargarIngresosModulo() (antes cargarIngresosCompletos)

// ❌ ELIMINADA: analizarIngresosCompatibility - Wrapper redundante
// Esta función era un wrapper simple que no aportaba valor al sistema
// La funcionalidad se mantiene en analizarIngresos()

console.log('👥 IngresosModule cargado - Gestión de ingresos modularizada');
