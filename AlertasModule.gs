/**
 * ALERTAS MODULE - SISTEMA DE ALERTAS
 * Etapa 2 - Semana 2: Separación en módulos
 * 
 * Este módulo contiene toda la lógica relacionada con el sistema
 * de alertas y notificaciones manteniendo 100% compatibilidad.
 */

// ==================== CONFIGURACIÓN DEL MÓDULO ====================

// Función auxiliar findCol ya está declarada en DataModule.gs

const ALERTAS_CONFIG = {
  UMBRALES: {
    DIAS_INACTIVO: {
      ALERTA: 7,
      CRITICO: 14,
      URGENTE: 30
    },
    DIAS_SIN_SEGUIMIENTO: {
      ALERTA: 3,
      CRITICO: 7,
      URGENTE: 14
    },
    CELULAS_VACIAS: {
      ALERTA: 1,
      CRITICO: 3,
      URGENTE: 5
    },
    INGRESOS_PENDIENTES: {
      ALERTA: 1,
      CRITICO: 3,
      URGENTE: 7
    }
  },
  
  TIPOS_ALERTA: {
    LIDER_INACTIVO: 'Líder Inactivo',
    CELULA_VACIA: 'Célula Vacía',
    INGRESO_PENDIENTE: 'Ingreso Pendiente',
    SEGUIMIENTO_ATRASADO: 'Seguimiento Atrasado',
    CARGA_ALTA: 'Carga Alta',
    METRICA_BAJA: 'Métrica Baja'
  },
  
  PRIORIDADES: {
    URGENTE: 'Urgente',
    ALTA: 'Alta',
    MEDIA: 'Media',
    BAJA: 'Baja'
  },
  
  ESTADOS: {
    ACTIVA: 'Activa',
    RESUELTA: 'Resuelta',
    SUPRIMIDA: 'Suprimida'
  }
};

// ==================== FUNCIONES DE DETECCIÓN DE ALERTAS ====================

/**
 * Detecta todas las alertas del sistema
 * @param {Object} datos - Datos consolidados del sistema
 * @returns {Array} Array de alertas detectadas
 */
function detectarAlertasSistema(datos) {
  try {
    console.log('[AlertasModule] Detectando alertas del sistema...');
    
    const { lideres, celulas, ingresos } = datos;
    const alertas = [];
    
    // Detectar alertas de líderes
    const alertasLideres = detectarAlertasLideres(lideres);
    alertas.push(...alertasLideres);
    
    // Detectar alertas de células
    const alertasCelulas = detectarAlertasCelulas(celulas);
    alertas.push(...alertasCelulas);
    
    // Detectar alertas de ingresos
    const alertasIngresos = detectarAlertasIngresos(ingresos);
    alertas.push(...alertasIngresos);
    
    // Detectar alertas de métricas
    const alertasMetricas = detectarAlertasMetricas(datos);
    alertas.push(...alertasMetricas);
    
    // Ordenar por prioridad
    alertas.sort((a, b) => {
      const prioridades = { 'Urgente': 4, 'Alta': 3, 'Media': 2, 'Baja': 1 };
      return prioridades[b.prioridad] - prioridades[a.prioridad];
    });
    
    console.log(`[AlertasModule] ${alertas.length} alertas detectadas`);
    return alertas;
    
  } catch (error) {
    console.error('[AlertasModule] Error detectando alertas del sistema:', error);
    return [];
  }
}

/**
 * Detecta alertas relacionadas con líderes
 * @param {Array} lideres - Array de líderes
 * @returns {Array} Array de alertas de líderes
 */
function detectarAlertasLideres(lideres) {
  try {
    const alertas = [];
    
    lideres.forEach(lider => {
      // Alerta por líder inactivo
      if (lider.Estado_Actividad === 'Inactivo') {
        const diasInactivo = lider.Dias_Inactivo || 0;
        let prioridad = ALERTAS_CONFIG.PRIORIDADES.MEDIA;
        
        if (diasInactivo >= ALERTAS_CONFIG.UMBRALES.DIAS_INACTIVO.URGENTE) {
          prioridad = ALERTAS_CONFIG.PRIORIDADES.URGENTE;
        } else if (diasInactivo >= ALERTAS_CONFIG.UMBRALES.DIAS_INACTIVO.CRITICO) {
          prioridad = ALERTAS_CONFIG.PRIORIDADES.ALTA;
        }
        
        alertas.push({
          tipo: ALERTAS_CONFIG.TIPOS_ALERTA.LIDER_INACTIVO,
          prioridad: prioridad,
          titulo: `Líder ${lider.Nombre_Lider} inactivo`,
          descripcion: `El líder ${lider.Nombre_Lider} (${lider.Rol}) lleva ${diasInactivo} días inactivo`,
          entidad: {
            tipo: 'lider',
            id: lider.ID_Lider,
            nombre: lider.Nombre_Lider
          },
          fecha_deteccion: new Date(),
          estado: ALERTAS_CONFIG.ESTADOS.ACTIVA
        });
      }
      
      // Alerta por carga alta de LCF
      if (lider.Rol === 'LD') {
        const subordinados = lideres.filter(l => l.ID_Lider_Directo === lider.ID_Lider);
        const lcfCount = subordinados.filter(l => l.Rol === 'LCF').length;
        
        if (lcfCount > ALERTAS_CONFIG.UMBRALES.LCF_POR_LD.ALTO) {
          alertas.push({
            tipo: ALERTAS_CONFIG.TIPOS_ALERTA.CARGA_ALTA,
            prioridad: ALERTAS_CONFIG.PRIORIDADES.ALTA,
            titulo: `Carga alta de LCF para ${lider.Nombre_Lider}`,
            descripcion: `El LD ${lider.Nombre_Lider} tiene ${lcfCount} LCF bajo su supervisión`,
            entidad: {
              tipo: 'lider',
              id: lider.ID_Lider,
              nombre: lider.Nombre_Lider
            },
            fecha_deteccion: new Date(),
            estado: ALERTAS_CONFIG.ESTADOS.ACTIVA
          });
        }
      }
    });
    
    return alertas;
    
  } catch (error) {
    console.error('[AlertasModule] Error detectando alertas de líderes:', error);
    return [];
  }
}

/**
 * Detecta alertas relacionadas con células
 * @param {Array} celulas - Array de células
 * @returns {Array} Array de alertas de células
 */
function detectarAlertasCelulas(celulas) {
  try {
    const alertas = [];
    
    celulas.forEach(celula => {
      // Alerta por célula vacía
      if (celula.Estado === 'Vacía') {
        alertas.push({
          tipo: ALERTAS_CONFIG.TIPOS_ALERTA.CELULA_VACIA,
          prioridad: ALERTAS_CONFIG.PRIORIDADES.MEDIA,
          titulo: `Célula ${celula.Nombre_Celula} vacía`,
          descripcion: `La célula ${celula.Nombre_Celula} está vacía y necesita atención`,
          entidad: {
            tipo: 'celula',
            id: celula.ID_Celula,
            nombre: celula.Nombre_Celula
          },
          fecha_deteccion: new Date(),
          estado: ALERTAS_CONFIG.ESTADOS.ACTIVA
        });
      }
      
      // Alerta por célula lista para multiplicar
      if (celula.Estado === 'Lista para Multiplicar') {
        alertas.push({
          tipo: ALERTAS_CONFIG.TIPOS_ALERTA.CELULA_VACIA,
          prioridad: ALERTAS_CONFIG.PRIORIDADES.ALTA,
          titulo: `Célula ${celula.Nombre_Celula} lista para multiplicar`,
          descripcion: `La célula ${celula.Nombre_Celula} está lista para multiplicar con ${celula.Total_Miembros} miembros`,
          entidad: {
            tipo: 'celula',
            id: celula.ID_Celula,
            nombre: celula.Nombre_Celula
          },
          fecha_deteccion: new Date(),
          estado: ALERTAS_CONFIG.ESTADOS.ACTIVA
        });
      }
    });
    
    return alertas;
    
  } catch (error) {
    console.error('[AlertasModule] Error detectando alertas de células:', error);
    return [];
  }
}

/**
 * Detecta alertas relacionadas con ingresos
 * @param {Array} ingresos - Array de ingresos
 * @returns {Array} Array de alertas de ingresos
 */
function detectarAlertasIngresos(ingresos) {
  try {
    const alertas = [];
    
    ingresos.forEach(ingreso => {
      // Alerta por ingreso pendiente de asignación
      if (ingreso.Estado_Asignacion === 'Pendiente') {
        const diasPendiente = ingreso.Dias_Desde_Ingreso || 0;
        let prioridad = ALERTAS_CONFIG.PRIORIDADES.MEDIA;
        
        if (diasPendiente >= ALERTAS_CONFIG.UMBRALES.INGRESOS_PENDIENTES.URGENTE) {
          prioridad = ALERTAS_CONFIG.PRIORIDADES.URGENTE;
        } else if (diasPendiente >= ALERTAS_CONFIG.UMBRALES.INGRESOS_PENDIENTES.CRITICO) {
          prioridad = ALERTAS_CONFIG.PRIORIDADES.ALTA;
        }
        
        alertas.push({
          tipo: ALERTAS_CONFIG.TIPOS_ALERTA.INGRESO_PENDIENTE,
          prioridad: prioridad,
          titulo: `Ingreso pendiente: ${ingreso.Nombre_Completo}`,
          descripcion: `El ingreso de ${ingreso.Nombre_Completo} lleva ${diasPendiente} días sin asignar`,
          entidad: {
            tipo: 'ingreso',
            id: ingreso.ID_Alma,
            nombre: ingreso.Nombre_Completo
          },
          fecha_deteccion: new Date(),
          estado: ALERTAS_CONFIG.ESTADOS.ACTIVA
        });
      }
    });
    
    return alertas;
    
  } catch (error) {
    console.error('[AlertasModule] Error detectando alertas de ingresos:', error);
    return [];
  }
}

/**
 * Detecta alertas relacionadas con métricas
 * @param {Object} datos - Datos consolidados
 * @returns {Array} Array de alertas de métricas
 */
function detectarAlertasMetricas(datos) {
  try {
    const alertas = [];
    const { lideres, celulas, ingresos } = datos;
    
    // Calcular métricas
    const totalLideres = lideres.length;
    const totalCelulas = celulas.length;
    const totalIngresos = ingresos.length;
    
    const ldCount = lideres.filter(l => l.Rol === 'LD').length;
    const lcfCount = lideres.filter(l => l.Rol === 'LCF').length;
    const celulasVacias = celulas.filter(c => c.Estado === 'Vacía').length;
    const ingresosPendientes = ingresos.filter(i => i.Estado_Asignacion === 'Pendiente').length;
    
    // Alerta por baja tasa de actividad de líderes
    const lideresActivos = lideres.filter(l => l.Estado_Actividad === 'Activo').length;
    const tasaActividad = totalLideres > 0 ? (lideresActivos / totalLideres) * 100 : 0;
    
    if (tasaActividad < 50) {
      alertas.push({
        tipo: ALERTAS_CONFIG.TIPOS_ALERTA.METRICA_BAJA,
        prioridad: ALERTAS_CONFIG.PRIORIDADES.ALTA,
        titulo: 'Baja tasa de actividad de líderes',
        descripcion: `Solo el ${tasaActividad.toFixed(1)}% de los líderes están activos`,
        entidad: {
          tipo: 'sistema',
          id: 'tasa_actividad',
          nombre: 'Sistema'
        },
        fecha_deteccion: new Date(),
        estado: ALERTAS_CONFIG.ESTADOS.ACTIVA
      });
    }
    
    // Alerta por alta tasa de células vacías
    const tasaCelulasVacias = totalCelulas > 0 ? (celulasVacias / totalCelulas) * 100 : 0;
    
    if (tasaCelulasVacias > 30) {
      alertas.push({
        tipo: ALERTAS_CONFIG.TIPOS_ALERTA.METRICA_BAJA,
        prioridad: ALERTAS_CONFIG.PRIORIDADES.ALTA,
        titulo: 'Alta tasa de células vacías',
        descripcion: `El ${tasaCelulasVacias.toFixed(1)}% de las células están vacías`,
        entidad: {
          tipo: 'sistema',
          id: 'tasa_celulas_vacias',
          nombre: 'Sistema'
        },
        fecha_deteccion: new Date(),
        estado: ALERTAS_CONFIG.ESTADOS.ACTIVA
      });
    }
    
    // Alerta por alta tasa de ingresos pendientes
    const tasaIngresosPendientes = totalIngresos > 0 ? (ingresosPendientes / totalIngresos) * 100 : 0;
    
    if (tasaIngresosPendientes > 20) {
      alertas.push({
        tipo: ALERTAS_CONFIG.TIPOS_ALERTA.METRICA_BAJA,
        prioridad: ALERTAS_CONFIG.PRIORIDADES.MEDIA,
        titulo: 'Alta tasa de ingresos pendientes',
        descripcion: `El ${tasaIngresosPendientes.toFixed(1)}% de los ingresos están pendientes de asignación`,
        entidad: {
          tipo: 'sistema',
          id: 'tasa_ingresos_pendientes',
          nombre: 'Sistema'
        },
        fecha_deteccion: new Date(),
        estado: ALERTAS_CONFIG.ESTADOS.ACTIVA
      });
    }
    
    return alertas;
    
  } catch (error) {
    console.error('[AlertasModule] Error detectando alertas de métricas:', error);
    return [];
  }
}

// ==================== FUNCIONES DE GESTIÓN DE ALERTAS ====================

/**
 * Filtra alertas por prioridad
 * @param {Array} alertas - Array de alertas
 * @param {string} prioridad - Prioridad a filtrar
 * @returns {Array} Array de alertas filtradas
 */
function filtrarAlertasPorPrioridad(alertas, prioridad) {
  try {
    return alertas.filter(alerta => alerta.prioridad === prioridad);
  } catch (error) {
    console.error('[AlertasModule] Error filtrando alertas por prioridad:', error);
    return [];
  }
}

/**
 * Filtra alertas por tipo
 * @param {Array} alertas - Array de alertas
 * @param {string} tipo - Tipo de alerta a filtrar
 * @returns {Array} Array de alertas filtradas
 */
function filtrarAlertasPorTipo(alertas, tipo) {
  try {
    return alertas.filter(alerta => alerta.tipo === tipo);
  } catch (error) {
    console.error('[AlertasModule] Error filtrando alertas por tipo:', error);
    return [];
  }
}

/**
 * Filtra alertas por entidad
 * @param {Array} alertas - Array de alertas
 * @param {string} tipoEntidad - Tipo de entidad
 * @param {string} idEntidad - ID de la entidad
 * @returns {Array} Array de alertas filtradas
 */
function filtrarAlertasPorEntidad(alertas, tipoEntidad, idEntidad) {
  try {
    return alertas.filter(alerta => 
      alerta.entidad.tipo === tipoEntidad && alerta.entidad.id === idEntidad
    );
  } catch (error) {
    console.error('[AlertasModule] Error filtrando alertas por entidad:', error);
    return [];
  }
}

/**
 * Resuelve una alerta
 * @param {string} alertaId - ID de la alerta
 * @param {string} motivo - Motivo de resolución
 * @returns {boolean} True si se resolvió correctamente
 */
function resolverAlerta(alertaId, motivo) {
  try {
    console.log(`[AlertasModule] Resolviendo alerta: ${alertaId}`);
    
    // Aquí se implementaría la lógica para marcar la alerta como resuelta
    // Por ejemplo, actualizar en una base de datos o archivo
    
    console.log(`[AlertasModule] Alerta ${alertaId} resuelta: ${motivo}`);
    return true;
    
  } catch (error) {
    console.error('[AlertasModule] Error resolviendo alerta:', error);
    return false;
  }
}

/**
 * Suprime una alerta
 * @param {string} alertaId - ID de la alerta
 * @param {string} motivo - Motivo de supresión
 * @returns {boolean} True si se suprimió correctamente
 */
function suprimirAlerta(alertaId, motivo) {
  try {
    console.log(`[AlertasModule] Suprimiendo alerta: ${alertaId}`);
    
    // Aquí se implementaría la lógica para marcar la alerta como suprimida
    
    console.log(`[AlertasModule] Alerta ${alertaId} suprimida: ${motivo}`);
    return true;
    
  } catch (error) {
    console.error('[AlertasModule] Error suprimiendo alerta:', error);
    return false;
  }
}

// ==================== FUNCIONES DE REPORTES DE ALERTAS ====================

/**
 * Genera resumen de alertas
 * @param {Array} alertas - Array de alertas
 * @returns {Object} Resumen de alertas
 */
function generarResumenAlertas(alertas) {
  try {
    const resumen = {
      total_alertas: alertas.length,
      por_prioridad: {
        urgentes: 0,
        altas: 0,
        medias: 0,
        bajas: 0
      },
      por_tipo: {},
      por_estado: {
        activas: 0,
        resueltas: 0,
        suprimidas: 0
      },
      alertas_urgentes: []
    };
    
    alertas.forEach(alerta => {
      // Contar por prioridad
      switch (alerta.prioridad) {
        case ALERTAS_CONFIG.PRIORIDADES.URGENTE:
          resumen.por_prioridad.urgentes++;
          resumen.alertas_urgentes.push(alerta);
          break;
        case ALERTAS_CONFIG.PRIORIDADES.ALTA:
          resumen.por_prioridad.altas++;
          break;
        case ALERTAS_CONFIG.PRIORIDADES.MEDIA:
          resumen.por_prioridad.medias++;
          break;
        case ALERTAS_CONFIG.PRIORIDADES.BAJA:
          resumen.por_prioridad.bajas++;
          break;
      }
      
      // Contar por tipo
      resumen.por_tipo[alerta.tipo] = (resumen.por_tipo[alerta.tipo] || 0) + 1;
      
      // Contar por estado
      switch (alerta.estado) {
        case ALERTAS_CONFIG.ESTADOS.ACTIVA:
          resumen.por_estado.activas++;
          break;
        case ALERTAS_CONFIG.ESTADOS.RESUELTA:
          resumen.por_estado.resueltas++;
          break;
        case ALERTAS_CONFIG.ESTADOS.SUPRIMIDA:
          resumen.por_estado.suprimidas++;
          break;
      }
    });
    
    return resumen;
    
  } catch (error) {
    console.error('[AlertasModule] Error generando resumen de alertas:', error);
    return {
      total_alertas: 0,
      por_prioridad: { urgentes: 0, altas: 0, medias: 0, bajas: 0 },
      por_tipo: {},
      por_estado: { activas: 0, resueltas: 0, suprimidas: 0 },
      alertas_urgentes: []
    };
  }
}

// ==================== FUNCIONES DE COMPATIBILIDAD ====================

/**
 * Función de compatibilidad para obtener alertas del sistema
 * @returns {Object} Alertas del sistema
 */
function obtenerAlertasSistema() {
  try {
    console.log('[AlertasModule] Obteniendo alertas del sistema...');
    
    // Cargar datos
    const directorios = cargarDirectorioCompleto();
    const { lideres, celulas, ingresos } = directorios;
    
    // Detectar alertas
    const alertas = detectarAlertasSistema({ lideres, celulas, ingresos });
    
    // Generar resumen
    const resumen = generarResumenAlertas(alertas);
    
    return {
      success: true,
      alertas: alertas,
      resumen: resumen,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('[AlertasModule] Error obteniendo alertas del sistema:', error);
    return {
      success: false,
      error: error.toString(),
      alertas: [],
      resumen: null
    };
  }
}

/**
 * Función de compatibilidad para alertas de LCF
 * @param {string} idLCF - ID del LCF
 * @returns {Object} Alertas del LCF
 */
function obtenerAlertasLCF(idLCF) {
  try {
    console.log(`[AlertasModule] Obteniendo alertas para LCF: ${idLCF}`);
    
    // Obtener seguimiento del LCF
    const seguimiento = getSeguimientoAlmasLCF_REAL(idLCF);
    if (!seguimiento.success) {
      return seguimiento;
    }
    
    const almas = seguimiento.almas;
    const alertas = [];
    
    // Detectar alertas específicas del LCF
    almas.forEach(alma => {
      // Alerta por seguimiento atrasado
      if (alma.Dias_Sin_Seguimiento > ALERTAS_CONFIG.UMBRALES.DIAS_SIN_SEGUIMIENTO.ALERTA) {
        let prioridad = ALERTAS_CONFIG.PRIORIDADES.MEDIA;
        
        if (alma.Dias_Sin_Seguimiento >= ALERTAS_CONFIG.UMBRALES.DIAS_SIN_SEGUIMIENTO.URGENTE) {
          prioridad = ALERTAS_CONFIG.PRIORIDADES.URGENTE;
        } else if (alma.Dias_Sin_Seguimiento >= ALERTAS_CONFIG.UMBRALES.DIAS_SIN_SEGUIMIENTO.CRITICO) {
          prioridad = ALERTAS_CONFIG.PRIORIDADES.ALTA;
        }
        
        alertas.push({
          tipo: ALERTAS_CONFIG.TIPOS_ALERTA.SEGUIMIENTO_ATRASADO,
          prioridad: prioridad,
          titulo: `Seguimiento atrasado: ${alma.Nombre}`,
          descripcion: `El seguimiento de ${alma.Nombre} lleva ${alma.Dias_Sin_Seguimiento} días atrasado`,
          entidad: {
            tipo: 'alma',
            id: alma.ID_Alma,
            nombre: alma.Nombre
          },
          fecha_deteccion: new Date(),
          estado: ALERTAS_CONFIG.ESTADOS.ACTIVA
        });
      }
    });
    
    return {
      success: true,
      lcf: seguimiento.lcf,
      alertas: alertas,
      resumen: generarResumenAlertas(alertas)
    };
    
  } catch (error) {
    console.error('[AlertasModule] Error obteniendo alertas LCF:', error);
    return {
      success: false,
      error: error.toString(),
      lcf: null,
      alertas: [],
      resumen: null
    };
  }
}

console.log('🚨 AlertasModule cargado - Sistema de alertas modularizado');
