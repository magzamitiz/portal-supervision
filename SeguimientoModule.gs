/**
 * SEGUIMIENTO MODULE - GESTIÓN DE SEGUIMIENTO
 * Etapa 2 - Semana 2: Separación en módulos
 * 
 * Este módulo contiene toda la lógica relacionada con el seguimiento
 * de almas manteniendo 100% compatibilidad.
 */

// ==================== CONFIGURACIÓN DEL MÓDULO ====================

// Función auxiliar para encontrar columnas (compatible con código original)
const findCol = (headers, names) => headers.findIndex(h => names.some(name => h.includes(name)));

const SEGUIMIENTO_CONFIG = {
  ESTADOS_BIENVENIDA: {
    COMPLETADO: 'Completado',
    PENDIENTE: 'Pendiente',
    NO_CONTACTAR: 'No contactar'
  },
  
  ESTADOS_VISITA: {
    REALIZADA: 'Realizada',
    PROGRAMADA: 'Programada',
    PENDIENTE: 'Pendiente'
  },
  
  ESTADOS_CELULAS: {
    COMPLETADO: 'Completado',
    EN_PROCESO: 'En Proceso',
    NO_INICIADO: 'No iniciado'
  },
  
  ESTADOS_ALMA: {
    ACTIVO: 'Activo',
    EN_RIESGO: 'En Riesgo',
    INACTIVO: 'Inactivo',
    NUEVO: 'Nuevo',
    COMPLETADO: 'Completado'
  },
  
  PRIORIDADES: {
    URGENTE: 'Urgente',
    ALTA: 'Alta',
    MEDIA: 'Media',
    NORMAL: 'Normal'
  }
};

// ==================== FUNCIONES DE CARGA DE SEGUIMIENTO ====================

/**
 * Carga seguimiento consolidado de forma optimizada (compatible con código original)
 * @param {Object} spreadsheet - Objeto spreadsheet de Google Apps Script
 * @param {string} sheetName - Nombre de la hoja
 * @param {string} lcfId - ID del LCF para filtrar
 * @returns {Array} Array de datos de seguimiento
 */
function cargarSeguimientoConsolidado(spreadsheet, sheetName, lcfId) {
  try {
    console.log(`[SeguimientoModule] Cargando seguimiento consolidado para LCF: ${lcfId}`);
    
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) return [];

    // Solo cargar columnas A-J (rango específico)
    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 10).getValues();
    
    const seguimientos = [];
    for (const row of data) {
      // Columna C (índice 2) es ID_LCF
      if (row.length > 2 && row[2] === lcfId) {
        seguimientos.push({
          ID_Alma: row[0] || '',
          Nombre_Alma: row[1] || '',
          ID_LCF: row[2] || '',
          Resultado_Bienvenida: row[3] || '',
          Estado_Bienvenida: row[4] || '',
          Resultado_Visita: row[5] || '',
          Estado_Visita: row[6] || '',
          Progreso_Celulas: row[7] || '',
          Dias_Sin_Seguimiento: row[8] || 0,
          Estado_General: row[9] || ''
        });
      }
    }
    
    console.log(`[SeguimientoModule] ${seguimientos.length} seguimientos cargados para LCF ${lcfId}`);
    return seguimientos;
    
  } catch (error) {
    console.error('[SeguimientoModule] Error cargando seguimiento consolidado:', error);
    return [];
  }
}

/**
 * Carga maestro de asistentes (progreso en células)
 * @param {Object} spreadsheet - Objeto spreadsheet de Google Apps Script
 * @param {string} sheetName - Nombre de la hoja
 * @param {Set} idsAlmas - IDs de almas a cargar (opcional)
 * @returns {Array} Array de asistentes
 */
function cargarMaestroAsistentes(spreadsheet, sheetName, idsAlmas = null) {
  try {
    console.log('[SeguimientoModule] Cargando maestro de asistentes...');
    
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) return [];

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];

    const asistentes = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const idAsistente = row[0];
      
      // Si se especifican IDs, filtrar
      if (idsAlmas && !idsAlmas.has(String(idAsistente))) {
        continue;
      }
      
      const asistente = {
        ID_Asistente: String(idAsistente || ''),
        Nombre: String(row[1] || ''),
        Temas_Completados: String(row[2] || '0/12'),
        Temas_Faltantes: String(row[3] || '12'),
        Porcentaje: parseFloat(row[4] || 0),
        Estado: String(row[5] || 'Sin datos').trim(),
        Fecha_Primer_Tema: row[6],
        Fecha_Ultimo_Tema: row[7],
        Dias_Inactivo: parseInt(row[8] || 0),
        Celula_Principal: String(row[9] || '').trim()
      };
      
      asistentes.push(asistente);
    }
    
    console.log(`[SeguimientoModule] ${asistentes.length} asistentes cargados`);
    return asistentes;
    
  } catch (error) {
    console.error('[SeguimientoModule] Error cargando maestro de asistentes:', error);
    return [];
  }
}

/**
 * Carga interacciones de seguimiento
 * @param {Object} spreadsheet - Objeto spreadsheet de Google Apps Script
 * @param {string} sheetName - Nombre de la hoja
 * @param {Set} idsAlmas - IDs de almas a cargar (opcional)
 * @returns {Array} Array de interacciones
 */
function cargarInteracciones(spreadsheet, sheetName, idsAlmas = null) {
  try {
    console.log('[SeguimientoModule] Cargando interacciones...');
    
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) return [];

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];

    const interacciones = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const idAlma = row[1]; // Columna B es ID_Alma
      
      // Si se especifican IDs, filtrar
      if (idsAlmas && !idsAlmas.has(String(idAlma))) {
        continue;
      }
      
      const interaccion = {
        ID_Alma: String(idAlma || ''),
        Nombre_Alma: String(row[2] || ''),
        Timestamp_Interaccion: row[3],
        Resultado: String(row[13] || ''),
        Medio_Contacto: String(row[12] || '')
      };
      
      interacciones.push(interaccion);
    }
    
    console.log(`[SeguimientoModule] ${interacciones.length} interacciones cargadas`);
    return interacciones;
    
  } catch (error) {
    console.error('[SeguimientoModule] Error cargando interacciones:', error);
    return [];
  }
}

/**
 * Carga visitas de bendición
 * @param {Object} spreadsheet - Objeto spreadsheet de Google Apps Script
 * @param {string} sheetName - Nombre de la hoja
 * @param {Set} idsAlmas - IDs de almas a cargar (opcional)
 * @returns {Array} Array de visitas
 */
function cargarVisitasBendicion(spreadsheet, sheetName, idsAlmas = null) {
  try {
    console.log('[SeguimientoModule] Cargando visitas de bendición...');
    
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) return [];

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];

    const visitas = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const idAlma = row[1]; // Columna B es ID_Alma
      
      // Si se especifican IDs, filtrar
      if (idsAlmas && !idsAlmas.has(String(idAlma))) {
        continue;
      }
      
      const visita = {
        ID_Alma: String(idAlma || ''),
        Nombre_Alma: String(row[2] || ''),
        Timestamp_Visita: row[3],
        Estatus_Visita: String(row[4] || ''),
        Resultado_Visita: String(row[5] || ''),
        ID_Celula_Asignada: String(row[6] || ''),
        Nombre_Anfitrion: String(row[7] || '')
      };
      
      visitas.push(visita);
    }
    
    console.log(`[SeguimientoModule] ${visitas.length} visitas cargadas`);
    return visitas;
    
  } catch (error) {
    console.error('[SeguimientoModule] Error cargando visitas de bendición:', error);
    return [];
  }
}

// ==================== FUNCIONES DE PROCESAMIENTO DE SEGUIMIENTO ====================

/**
 * Procesa seguimiento completo para un LCF
 * @param {string} lcfId - ID del LCF
 * @param {Object} lcfInfo - Información del LCF
 * @returns {Object} Seguimiento procesado
 */
function procesarSeguimientoLCF(lcfId, lcfInfo) {
  try {
    console.log(`[SeguimientoModule] Procesando seguimiento para LCF: ${lcfId}`);
    
    // Cargar seguimiento consolidado
    const seguimientos = cargarSeguimientoConsolidado(
      CONFIG.SHEETS.DIRECTORIO, 
      '_SeguimientoConsolidado', 
      lcfId
    );
    
    // Procesar cada seguimiento
    const almas = seguimientos.map(seg => {
      return {
        ID_Alma: seg.ID_Alma,
        Nombre: seg.Nombre_Alma,
        Telefono: '', // No disponible en seguimiento consolidado
        Acepta_Visita: '', // No disponible en seguimiento consolidado
        Peticion: '', // No disponible en seguimiento consolidado
        Bienvenida: procesarBienvenida(seg.Resultado_Bienvenida, seg.Estado_Bienvenida),
        Visita_Bendicion: procesarVisita(seg.Resultado_Visita, seg.Estado_Visita),
        Progreso_Celulas: procesarProgresoCelulas(seg.Progreso_Celulas),
        Estado: seg.Estado_General || SEGUIMIENTO_CONFIG.ESTADOS_ALMA.NUEVO,
        Dias_Sin_Seguimiento: parseInt(seg.Dias_Sin_Seguimiento) || 0,
        En_Celula: (seg.Progreso_Celulas || '0/12').split('/')[0] > 0
      };
    });
    
    return {
      success: true,
      lcf: {
        ID_Lider: lcfInfo.ID_Lider,
        Nombre: lcfInfo.Nombre_Lider,
        Rol: lcfInfo.Rol
      },
      almas: almas
    };
    
  } catch (error) {
    console.error('[SeguimientoModule] Error procesando seguimiento LCF:', error);
    return {
      success: false,
      error: error.toString(),
      lcf: null,
      almas: []
    };
  }
}

/**
 * Procesa información de bienvenida
 * @param {string} resultado - Resultado de la bienvenida
 * @param {string} estado - Estado de la bienvenida
 * @returns {Object} Información procesada de bienvenida
 */
function procesarBienvenida(resultado, estado) {
  const res = resultado || "";
  const est = estado || "";
  
  if (res.includes("Contacto Exitoso - Aceptó visita")) {
    return { simbolo: '⭐', color: 'text-yellow-500', completado: true };
  }
  if (res.includes("Prefiere visitar") || res.includes("Solicitó info")) {
    return { simbolo: '✓', color: 'text-green-600', completado: true };
  }
  if (["No contactar", "Sin interés", "No contestó", "Buzón", "Número equivocado"].includes(res)) {
    return { simbolo: '―', color: 'text-gray-500', completado: true };
  }
  if (est === SEGUIMIENTO_CONFIG.ESTADOS_BIENVENIDA.COMPLETADO) {
    return { simbolo: '✓', color: 'text-green-600', completado: true };
  }
  
  return { simbolo: '✗', color: 'text-red-500', completado: false };
}

/**
 * Procesa información de visita
 * @param {string} resultado - Resultado de la visita
 * @param {string} estado - Estado de la visita
 * @returns {Object} Información procesada de visita
 */
function procesarVisita(resultado, estado) {
  const res = resultado || "";
  const est = estado || "";
  
  if (res.includes("Realizada") || res.includes("Completada") || est === SEGUIMIENTO_CONFIG.ESTADOS_VISITA.REALIZADA) {
    return { simbolo: '✓', color: 'text-green-600', completado: true };
  }
  if (res.includes("Programada") || res.includes("Pendiente") || est === SEGUIMIENTO_CONFIG.ESTADOS_VISITA.PROGRAMADA) {
    return { simbolo: '⏳', color: 'text-yellow-500', completado: false };
  }
  
  return { simbolo: '✗', color: 'text-red-500', completado: false };
}

/**
 * Procesa progreso en células
 * @param {string} progreso - Progreso en formato "X/12"
 * @returns {Object} Información procesada de progreso
 */
function procesarProgresoCelulas(progreso) {
  const prog = progreso || '0/12';
  const partes = prog.split('/');
  const completados = parseInt(partes[0] || 0);
  const total = parseInt(partes[1] || 12);
  
  return {
    texto: prog,
    completados: completados,
    total: total,
    porcentaje: total > 0 ? ((completados / total) * 100).toFixed(1) : 0
  };
}

// ==================== FUNCIONES DE ANÁLISIS DE SEGUIMIENTO ====================

/**
 * Analiza el seguimiento de almas
 * @param {Array} almas - Array de almas con seguimiento
 * @returns {Object} Análisis del seguimiento
 */
function analizarSeguimientoAlmas(almas) {
  try {
    console.log('[SeguimientoModule] Analizando seguimiento de almas...');
    
    const analisis = {
      total_almas: almas.length,
      bienvenida: {
        completada: 0,
        pendiente: 0
      },
      visita: {
        completada: 0,
        pendiente: 0
      },
      celulas: {
        en_proceso: 0,
        completadas: 0,
        no_iniciadas: 0
      },
      estado: {
        activos: 0,
        en_riesgo: 0,
        inactivos: 0,
        nuevos: 0,
        completados: 0
      },
      prioridad: {
        urgentes: 0,
        altas: 0,
        medias: 0,
        normales: 0
      }
    };
    
    almas.forEach(alma => {
      // Análisis de bienvenida
      if (alma.Bienvenida && alma.Bienvenida.completado) {
        analisis.bienvenida.completada++;
      } else {
        analisis.bienvenida.pendiente++;
      }
      
      // Análisis de visita
      if (alma.Visita_Bendicion && alma.Visita_Bendicion.completado) {
        analisis.visita.completada++;
      } else {
        analisis.visita.pendiente++;
      }
      
      // Análisis de células
      if (alma.Progreso_Celulas) {
        if (alma.Progreso_Celulas.completados === 0) {
          analisis.celulas.no_iniciadas++;
        } else if (alma.Progreso_Celulas.completados === 12) {
          analisis.celulas.completadas++;
        } else {
          analisis.celulas.en_proceso++;
        }
      }
      
      // Análisis de estado
      const estado = alma.Estado || SEGUIMIENTO_CONFIG.ESTADOS_ALMA.NUEVO;
      switch (estado) {
        case SEGUIMIENTO_CONFIG.ESTADOS_ALMA.ACTIVO:
          analisis.estado.activos++;
          break;
        case SEGUIMIENTO_CONFIG.ESTADOS_ALMA.EN_RIESGO:
          analisis.estado.en_riesgo++;
          break;
        case SEGUIMIENTO_CONFIG.ESTADOS_ALMA.INACTIVO:
          analisis.estado.inactivos++;
          break;
        case SEGUIMIENTO_CONFIG.ESTADOS_ALMA.NUEVO:
          analisis.estado.nuevos++;
          break;
        case SEGUIMIENTO_CONFIG.ESTADOS_ALMA.COMPLETADO:
          analisis.estado.completados++;
          break;
      }
      
      // Análisis de prioridad
      const prioridad = calcularPrioridadAlma(alma);
      switch (prioridad) {
        case SEGUIMIENTO_CONFIG.PRIORIDADES.URGENTE:
          analisis.prioridad.urgentes++;
          break;
        case SEGUIMIENTO_CONFIG.PRIORIDADES.ALTA:
          analisis.prioridad.altas++;
          break;
        case SEGUIMIENTO_CONFIG.PRIORIDADES.MEDIA:
          analisis.prioridad.medias++;
          break;
        case SEGUIMIENTO_CONFIG.PRIORIDADES.NORMAL:
          analisis.prioridad.normales++;
          break;
      }
    });
    
    console.log('[SeguimientoModule] Análisis de seguimiento completado');
    return analisis;
    
  } catch (error) {
    console.error('[SeguimientoModule] Error analizando seguimiento:', error);
    return {
      total_almas: 0,
      bienvenida: { completada: 0, pendiente: 0 },
      visita: { completada: 0, pendiente: 0 },
      celulas: { en_proceso: 0, completadas: 0, no_iniciadas: 0 },
      estado: { activos: 0, en_riesgo: 0, inactivos: 0, nuevos: 0, completados: 0 },
      prioridad: { urgentes: 0, altas: 0, medias: 0, normales: 0 }
    };
  }
}

/**
 * Calcula la prioridad de un alma
 * @param {Object} alma - Objeto de alma
 * @returns {string} Prioridad calculada
 */
function calcularPrioridadAlma(alma) {
  try {
    const diasSinSeguimiento = alma.Dias_Sin_Seguimiento || 0;
    const estado = alma.Estado || SEGUIMIENTO_CONFIG.ESTADOS_ALMA.NUEVO;
    const deseaVisita = alma.Acepta_Visita === 'SI' || alma.Acepta_Visita === 'SÍ';
    const temasCompletados = alma.Progreso_Celulas ? alma.Progreso_Celulas.completados : 0;
    
    if (estado === SEGUIMIENTO_CONFIG.ESTADOS_ALMA.INACTIVO || diasSinSeguimiento > 30) {
      return SEGUIMIENTO_CONFIG.PRIORIDADES.URGENTE;
    }
    
    if (estado === SEGUIMIENTO_CONFIG.ESTADOS_ALMA.EN_RIESGO || (deseaVisita && diasSinSeguimiento > 7)) {
      return SEGUIMIENTO_CONFIG.PRIORIDADES.ALTA;
    }
    
    if (deseaVisita || diasSinSeguimiento > 14) {
      return SEGUIMIENTO_CONFIG.PRIORIDADES.MEDIA;
    }
    
    if (estado === SEGUIMIENTO_CONFIG.ESTADOS_ALMA.NUEVO || (temasCompletados < 3 && diasSinSeguimiento > 7)) {
      return SEGUIMIENTO_CONFIG.PRIORIDADES.MEDIA;
    }
    
    return SEGUIMIENTO_CONFIG.PRIORIDADES.NORMAL;
    
  } catch (error) {
    console.error('[SeguimientoModule] Error calculando prioridad:', error);
    return SEGUIMIENTO_CONFIG.PRIORIDADES.NORMAL;
  }
}

// ==================== FUNCIONES DE COMPATIBILIDAD ====================

/**
 * Función principal para seguimiento de almas LCF (implementación real)
 * @param {string} idLCF - ID del LCF
 * @returns {Object} Seguimiento procesado
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
 * Función de compatibilidad para seguimiento de almas LCF (wrapper)
 * @param {string} idLCF - ID del LCF
 * @returns {Object} Seguimiento procesado
 */
function getSeguimientoAlmasLCF(idLCF) {
  return getSeguimientoAlmasLCF_REAL(idLCF);
}

/**
 * Función principal para vista rápida LCF (implementación real)
 * @param {string} idLCF - ID del LCF
 * @returns {Object} Vista rápida procesada
 */
function getVistaRapidaLCF_REAL(idLCF) {
  try {
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
    console.error('[SeguimientoModule] Error en getVistaRapidaLCF_REAL:', error);
    return { 
      success: false, 
      error: error.toString() 
    };
  }
}

/**
 * Función de compatibilidad para vista rápida LCF (wrapper)
 * @param {string} idLCF - ID del LCF
 * @returns {Object} Vista rápida procesada
 */
function getVistaRapidaLCF(idLCF) {
  return getVistaRapidaLCF_REAL(idLCF);
}

/**
 * Obtiene resumen de un LCF
 * @param {string} idLCF - ID del LCF
 * @returns {Object} Resumen del LCF
 */
function getResumenLCF(idLCF) {
  try {
    const seguimiento = getSeguimientoAlmasLCF_REAL(idLCF);
    
    if (!seguimiento.success) {
      return seguimiento;
    }
    
    const almas = seguimiento.data.almas || [];
    const resumen = calcularResumenSeguimiento(almas, seguimiento.data.lcf);
    
    return {
      success: true,
      data: {
        lcf: seguimiento.data.lcf,
        resumen: resumen,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('[SeguimientoModule] Error en getResumenLCF:', error);
    return { success: false, error: error.toString() };
  }
}

console.log('📋 SeguimientoModule cargado - Gestión de seguimiento modularizada');
