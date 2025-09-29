/**
 * @fileoverview Módulo de seguimiento seguro
 * Funciones seguras para búsqueda y matching de datos
 */

/**
 * Busca bienvenida de forma segura
 * @param {string} idAlma - ID del alma
 * @param {string} nombreCompleto - Nombre completo
 * @param {Array} interacciones - Array de interacciones
 * @returns {Object|null} Resultado de bienvenida
 */
function buscarBienvenida(idAlma, nombreCompleto, interacciones) {
  try {
    if (!idAlma || !interacciones || !Array.isArray(interacciones)) {
      return null;
    }

    // Buscar por ID exacto primero
    let bienvenida = interacciones.find(i => 
      String(i.ID_Alma) === String(idAlma) && 
      i.Tipo_Interaccion === 'Bienvenida'
    );

    // Si no se encuentra por ID, buscar por nombre
    if (!bienvenida && nombreCompleto) {
      bienvenida = interacciones.find(i => 
        sonNombresSimilares(i.Nombre_Alma, nombreCompleto) && 
        i.Tipo_Interaccion === 'Bienvenida'
      );
    }

    return bienvenida || null;
  } catch (error) {
    console.error('[SeguimientoSeguro] Error en buscarBienvenida:', error);
    return null;
  }
}

/**
 * Busca visita de bendición de forma segura
 * @param {string} idAlma - ID del alma
 * @param {string} nombreCompleto - Nombre completo
 * @param {Array} visitas - Array de visitas
 * @returns {Object|null} Resultado de visita
 */
function buscarVisitaBendicionSegura(idAlma, nombreCompleto, visitas) {
  try {
    if (!idAlma || !visitas || !Array.isArray(visitas)) {
      return null;
    }

    // Buscar por ID exacto primero
    let visita = visitas.find(v => String(v.ID_Alma) === String(idAlma));

    // Si no se encuentra por ID, buscar por nombre
    if (!visita && nombreCompleto) {
      visita = visitas.find(v => 
        sonNombresSimilaresSeguros(v.Nombre_Alma, nombreCompleto)
      );
    }

    return visita || null;
  } catch (error) {
    console.error('[SeguimientoSeguro] Error en buscarVisitaBendicionSegura:', error);
    return null;
  }
}

/**
 * Busca progreso de células de forma segura
 * @param {string} nombreCompleto - Nombre completo
 * @param {string} nombres - Nombres
 * @param {string} apellidos - Apellidos
 * @param {Array} maestroAsistentes - Array de asistentes
 * @returns {Object|null} Progreso de células
 */
function buscarProgresoCelulasSeguro(nombreCompleto, nombres, apellidos, maestroAsistentes) {
  try {
    if (!maestroAsistentes || !Array.isArray(maestroAsistentes)) {
      return null;
    }

    // Buscar por nombre completo
    if (nombreCompleto) {
      const progreso = maestroAsistentes.find(a => 
        sonNombresSimilaresSeguros(a.Nombre_Alma, nombreCompleto)
      );
      if (progreso) return progreso;
    }

    // Buscar por nombres y apellidos separados
    if (nombres && apellidos) {
      const nombreBuscado = `${nombres} ${apellidos}`.trim();
      const progreso = maestroAsistentes.find(a => 
        sonNombresSimilaresSeguros(a.Nombre_Alma, nombreBuscado)
      );
      if (progreso) return progreso;
    }

    return null;
  } catch (error) {
    console.error('[SeguimientoSeguro] Error en buscarProgresoCelulasSeguro:', error);
    return null;
  }
}

/**
 * Compara nombres de forma segura
 * @param {string} nombre1 - Primer nombre
 * @param {string} nombre2 - Segundo nombre
 * @returns {boolean} True si son similares
 */
function sonNombresSimilaresSeguros(nombre1, nombre2) {
  try {
    if (!nombre1 || !nombre2) return false;
    
    const n1 = String(nombre1).toLowerCase().trim().replace(/\s+/g, ' ');
    const n2 = String(nombre2).toLowerCase().trim().replace(/\s+/g, ' ');
    
    if (n1 === n2) return true;
    
    // Verificar si uno contiene al otro
    if (n1.includes(n2) || n2.includes(n1)) return true;
    
    // Verificar similitud por palabras
    const palabras1 = n1.split(' ');
    const palabras2 = n2.split(' ');
    
    let coincidencias = 0;
    for (const palabra1 of palabras1) {
      for (const palabra2 of palabras2) {
        if (palabra1.length > 2 && palabra2.length > 2 && palabra1 === palabra2) {
          coincidencias++;
        }
      }
    }
    
    // Si coinciden al menos 2 palabras significativas, son similares
    return coincidencias >= 2;
  } catch (error) {
    console.error('[SeguimientoSeguro] Error en sonNombresSimilaresSeguros:', error);
    return false;
  }
}

/**
 * Calcula días sin contacto de forma segura
 * @param {Date|string} fechaIngreso - Fecha de ingreso
 * @param {Date|string} fechaBienvenida - Fecha de bienvenida
 * @param {Date|string} fechaVisita - Fecha de visita
 * @returns {number} Días sin contacto
 */
function calcularDiasSinContactoSeguro(fechaIngreso, fechaBienvenida, fechaVisita) {
  try {
    const hoy = new Date();
    let ultimaActividad = null;
    
    // Procesar fecha de ingreso
    if (fechaIngreso) {
      const ingreso = new Date(fechaIngreso);
      if (!isNaN(ingreso.getTime())) {
        ultimaActividad = ingreso;
      }
    }
    
    // Procesar fecha de bienvenida
    if (fechaBienvenida) {
      const bienvenida = new Date(fechaBienvenida);
      if (!isNaN(bienvenida.getTime())) {
        if (!ultimaActividad || bienvenida > ultimaActividad) {
          ultimaActividad = bienvenida;
        }
      }
    }
    
    // Procesar fecha de visita
    if (fechaVisita) {
      const visita = new Date(fechaVisita);
      if (!isNaN(visita.getTime())) {
        if (!ultimaActividad || visita > ultimaActividad) {
          ultimaActividad = visita;
        }
      }
    }
    
    if (!ultimaActividad) return 0;
    
    const diferencia = Math.floor((hoy - ultimaActividad) / (1000 * 60 * 60 * 24));
    return Math.max(0, diferencia);
  } catch (error) {
    console.error('[SeguimientoSeguro] Error en calcularDiasSinContactoSeguro:', error);
    return 0;
  }
}

/**
 * Determina estado del alma de forma segura
 * @param {boolean} tieneBienvenida - Tiene bienvenida
 * @param {boolean} tieneVisita - Tiene visita
 * @param {number} temasCompletados - Temas completados
 * @param {boolean} estaEnCelula - Está en célula
 * @param {number} diasSinContacto - Días sin contacto
 * @returns {string} Estado del alma
 */
function determinarEstadoAlmaSeguro(tieneBienvenida, tieneVisita, temasCompletados, estaEnCelula, diasSinContacto) {
  try {
    if (estaEnCelula) return 'Integrado';
    
    if (diasSinContacto > 30) return 'Perdido';
    
    if (tieneVisita && temasCompletados >= 3) return 'Listo para Célula';
    
    if (tieneVisita) return 'En Seguimiento';
    
    if (tieneBienvenida) return 'Contactado';
    
    if (diasSinContacto > 7) return 'Sin Contacto';
    
    return 'Nuevo';
  } catch (error) {
    console.error('[SeguimientoSeguro] Error en determinarEstadoAlmaSeguro:', error);
    return 'Desconocido';
  }
}

/**
 * Calcula prioridad del alma de forma segura
 * @param {boolean} deseaVisita - Desea visita
 * @param {number} diasSinContacto - Días sin contacto
 * @param {string} estado - Estado del alma
 * @param {number} temasCompletados - Temas completados
 * @returns {string} Prioridad del alma
 */
function calcularPrioridadAlmaSegura(deseaVisita, diasSinContacto, estado, temasCompletados) {
  try {
    if (diasSinContacto > 21) return 'Alta';
    
    if (deseaVisita === true || deseaVisita === 'true' || deseaVisita === 'Sí') return 'Alta';
    
    if (estado === 'Listo para Célula' || temasCompletados >= 3) return 'Alta';
    
    if (diasSinContacto > 14) return 'Media';
    
    if (estado === 'En Seguimiento') return 'Media';
    
    if (diasSinContacto > 7) return 'Media';
    
    return 'Baja';
  } catch (error) {
    console.error('[SeguimientoSeguro] Error en calcularPrioridadAlmaSegura:', error);
    return 'Media';
  }
}

/**
 * Procesa alma de forma segura
 * @param {Object} alma - Datos del alma
 * @param {Object} data - Datos completos
 * @param {Object} lcf - Datos del LCF
 * @returns {Object} Alma procesada
 */
function procesarAlmaSegura(alma, data, lcf) {
  try {
    if (!alma || !data) return null;
    
    const bienvenida = buscarBienvenida(alma.ID_Alma, alma.Nombre_Alma, data.interacciones || []);
    const visita = buscarVisitaBendicionSegura(alma.ID_Alma, alma.Nombre_Alma, data.visitas || []);
    const progreso = buscarProgresoCelulasSeguro(alma.Nombre_Alma, alma.Nombres, alma.Apellidos, data.maestroAsistentes || []);
    
    const tieneBienvenida = !!bienvenida;
    const tieneVisita = !!visita;
    const temasCompletados = progreso ? (progreso.Temas_Completados || 0) : 0;
    const estaEnCelula = verificarEnCelula(alma.ID_Alma, data.celulas || []);
    
    const diasSinContacto = calcularDiasSinContactoSeguro(
      alma.Fecha_Ingreso,
      bienvenida ? bienvenida.Fecha_Interaccion : null,
      visita ? visita.Fecha_Visita : null
    );
    
    const estado = determinarEstadoAlmaSeguro(tieneBienvenida, tieneVisita, temasCompletados, estaEnCelula, diasSinContacto);
    const prioridad = calcularPrioridadAlmaSegura(alma.Desea_Visita, diasSinContacto, estado, temasCompletados);
    
    return {
      ...alma,
      Tiene_Bienvenida: tieneBienvenida,
      Tiene_Visita: tieneVisita,
      Temas_Completados: temasCompletados,
      Esta_En_Celula: estaEnCelula,
      Dias_Sin_Contacto: diasSinContacto,
      Estado_Seguimiento: estado,
      Prioridad: prioridad,
      Resultado_Bienvenida: bienvenida ? bienvenida.Resultado : null,
      Resultado_Visita: visita ? visita.Resultado : null
    };
  } catch (error) {
    console.error('[SeguimientoSeguro] Error en procesarAlmaSegura:', error);
    return alma;
  }
}

/**
 * Calcula resumen de seguimiento
 * @param {Array} almasConSeguimiento - Almas con seguimiento
 * @param {Object} lcf - Datos del LCF
 * @returns {Object} Resumen de seguimiento
 */
function calcularResumenSeguimiento(almasConSeguimiento, lcf) {
  try {
    if (!almasConSeguimiento || !Array.isArray(almasConSeguimiento)) {
      return {
        total_almas: 0,
        con_bienvenida: 0,
        con_visita: 0,
        en_celula: 0,
        alta_prioridad: 0,
        promedio_dias_sin_contacto: 0
      };
    }
    
    const totalAlmas = almasConSeguimiento.length;
    const conBienvenida = almasConSeguimiento.filter(a => a.Tiene_Bienvenida).length;
    const conVisita = almasConSeguimiento.filter(a => a.Tiene_Visita).length;
    const enCelula = almasConSeguimiento.filter(a => a.Esta_En_Celula).length;
    const altaPrioridad = almasConSeguimiento.filter(a => a.Prioridad === 'Alta').length;
    
    const totalDias = almasConSeguimiento.reduce((sum, a) => sum + (a.Dias_Sin_Contacto || 0), 0);
    const promedioDias = totalAlmas > 0 ? Math.round(totalDias / totalAlmas) : 0;
    
    return {
      total_almas: totalAlmas,
      con_bienvenida: conBienvenida,
      con_visita: conVisita,
      en_celula: enCelula,
      alta_prioridad: altaPrioridad,
      promedio_dias_sin_contacto: promedioDias,
      tasa_bienvenida: totalAlmas > 0 ? Math.round((conBienvenida / totalAlmas) * 100) : 0,
      tasa_visita: totalAlmas > 0 ? Math.round((conVisita / totalAlmas) * 100) : 0,
      tasa_integracion: totalAlmas > 0 ? Math.round((enCelula / totalAlmas) * 100) : 0
    };
  } catch (error) {
    console.error('[SeguimientoSeguro] Error en calcularResumenSeguimiento:', error);
    return {
      total_almas: 0,
      con_bienvenida: 0,
      con_visita: 0,
      en_celula: 0,
      alta_prioridad: 0,
      promedio_dias_sin_contacto: 0
    };
  }
}

/**
 * Busca visita de bendición (función original)
 * @param {string} idAlma - ID del alma
 * @param {string} nombreCompleto - Nombre completo
 * @param {Array} visitas - Array de visitas
 * @returns {Object|null} Resultado de visita
 */
function buscarVisitaBendicion(idAlma, nombreCompleto, visitas) {
  return buscarVisitaBendicionSegura(idAlma, nombreCompleto, visitas);
}

/**
 * Busca progreso de células (función original)
 * @param {string} nombreCompleto - Nombre completo
 * @param {string} nombres - Nombres
 * @param {string} apellidos - Apellidos
 * @param {Array} maestroAsistentes - Array de asistentes
 * @returns {Object|null} Progreso de células
 */
function buscarProgresoCelulas(nombreCompleto, nombres, apellidos, maestroAsistentes) {
  return buscarProgresoCelulasSeguro(nombreCompleto, nombres, apellidos, maestroAsistentes);
}

/**
 * Compara nombres (función original)
 * @param {string} nombre1 - Primer nombre
 * @param {string} nombre2 - Segundo nombre
 * @returns {boolean} True si son similares
 */
function sonNombresSimilares(nombre1, nombre2) {
  return sonNombresSimilaresSeguros(nombre1, nombre2);
}

/**
 * Calcula días sin contacto (función original)
 * @param {Date|string} fechaIngreso - Fecha de ingreso
 * @param {Date|string} fechaBienvenida - Fecha de bienvenida
 * @param {Date|string} fechaVisita - Fecha de visita
 * @returns {number} Días sin contacto
 */
function calcularDiasSinContacto(fechaIngreso, fechaBienvenida, fechaVisita) {
  return calcularDiasSinContactoSeguro(fechaIngreso, fechaBienvenida, fechaVisita);
}

/**
 * Determina estado del alma (función original)
 * @param {boolean} tieneBienvenida - Tiene bienvenida
 * @param {boolean} tieneVisita - Tiene visita
 * @param {number} temasCompletados - Temas completados
 * @param {boolean} estaEnCelula - Está en célula
 * @param {number} diasSinContacto - Días sin contacto
 * @returns {string} Estado del alma
 */
function determinarEstadoAlma(tieneBienvenida, tieneVisita, temasCompletados, estaEnCelula, diasSinContacto) {
  return determinarEstadoAlmaSeguro(tieneBienvenida, tieneVisita, temasCompletados, estaEnCelula, diasSinContacto);
}

/**
 * Calcula prioridad del alma (función original)
 * @param {boolean} deseaVisita - Desea visita
 * @param {number} diasSinContacto - Días sin contacto
 * @param {string} estado - Estado del alma
 * @param {number} temasCompletados - Temas completados
 * @returns {string} Prioridad del alma
 */
function calcularPrioridadAlma(deseaVisita, diasSinContacto, estado, temasCompletados) {
  return calcularPrioridadAlmaSegura(deseaVisita, diasSinContacto, estado, temasCompletados);
}

console.log('🔒 SeguimientoSeguro cargado - Funciones de seguimiento seguro disponibles');
