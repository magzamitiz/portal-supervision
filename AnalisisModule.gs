/**
 * @fileoverview Módulo para funciones de análisis de datos.
 * Centraliza las funciones para analizar líderes, células e ingresos.
 */

// ==================== FUNCIONES DE ANÁLISIS DE LÍDERES ====================

/**
 * Analiza los líderes y calcula estadísticas.
 * @param {Array<Object>} lideres - Array de líderes
 * @returns {Object} Análisis completo de líderes
 */
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

// ==================== FUNCIONES DE ANÁLISIS DE CÉLULAS ====================

/**
 * Analiza las células y calcula estadísticas.
 * @param {Array<Object>} celulas - Array de células
 * @returns {Object} Análisis completo de células
 */
function analizarCelulas(celulas) {
  const analisis = {
    total_celulas: 0, 
    celulas_activas: 0, 
    celulas_vacias: 0, 
    celulas_en_riesgo: 0,
    celulas_saludables: 0, 
    celulas_para_multiplicar: 0, 
    total_miembros: 0,
    promedio_miembros: 0, 
    celulas_por_LCF: {}
  };

  if (!celulas || !celulas.length) return analisis;

  analisis.total_celulas = celulas.length;

  celulas.forEach(celula => {
    // Contar células por estado
    if (celula.Estado !== 'Vacía') {
      analisis.celulas_activas++;
    }

    switch(celula.Estado) {
      case 'Vacía': 
        analisis.celulas_vacias++; 
        break;
      case 'En Riesgo': 
        analisis.celulas_en_riesgo++; 
        break;
      case 'Saludable': 
        analisis.celulas_saludables++; 
        break;
      case 'Lista para Multiplicar': 
        analisis.celulas_para_multiplicar++; 
        break;
    }

    // IMPORTANTE: Obtener total de miembros usando la función helper
    const totalMiembrosEnCelula = obtenerTotalMiembros(celula);
    analisis.total_miembros += totalMiembrosEnCelula;

    // Analizar por LCF
    if (celula.ID_LCF_Responsable) {
      if (!analisis.celulas_por_LCF[celula.ID_LCF_Responsable]) {
        analisis.celulas_por_LCF[celula.ID_LCF_Responsable] = {
          nombre: celula.Nombre_LCF_Responsable || '', 
          total_celulas: 0, 
          total_miembros: 0
        };
      }
      analisis.celulas_por_LCF[celula.ID_LCF_Responsable].total_celulas++;
      analisis.celulas_por_LCF[celula.ID_LCF_Responsable].total_miembros += totalMiembrosEnCelula;
    }
  });

  // Calcular promedio sobre células activas
  if (analisis.celulas_activas > 0) {
    analisis.promedio_miembros = (analisis.total_miembros / analisis.celulas_activas).toFixed(1);
  }

  return analisis;
}

// ==================== FUNCIONES DE ANÁLISIS DE INGRESOS ====================

/**
 * Analiza los ingresos y calcula estadísticas.
 * @param {Array<Object>} ingresos - Array de ingresos
 * @returns {Object} Análisis completo de ingresos
 */
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
    analisis.por_fuente[fuente] = (analisis.por_fuente[fuente] || 0) + 1;

    // Por LCF
    if (ingreso.ID_LCF) {
      if (!analisis.por_LCF[ingreso.ID_LCF]) {
        analisis.por_LCF[ingreso.ID_LCF] = { 
          nombre: ingreso.Nombre_LCF || 'Sin nombre', 
          total: 0 
        };
      }
      analisis.por_LCF[ingreso.ID_LCF].total++;
    }

    // Por LD
    if (ingreso.ID_LD) {
      if (!analisis.por_LD[ingreso.ID_LD]) {
        analisis.por_LD[ingreso.ID_LD] = { 
          nombre: ingreso.Nombre_LD || 'Sin nombre', 
          total: 0 
        };
      }
      analisis.por_LD[ingreso.ID_LD].total++;
    }
  });

  // Calcular tasas
  analisis.tasa_asignacion = analisis.total_historico > 0 ?
    ((analisis.asignados / analisis.total_historico) * 100).toFixed(1) : 0;

  analisis.tasa_integracion_celula = analisis.total_historico > 0 ?
    ((analisis.en_celula / analisis.total_historico) * 100).toFixed(1) : 0;

  return analisis;
}

// ==================== FUNCIONES DE ANÁLISIS GENERAL ====================

/**
 * Genera un análisis consolidado de todos los datos.
 * @param {Object} datos - Objeto con líderes, células e ingresos
 * @returns {Object} Análisis consolidado
 */
function generarAnalisisConsolidado(datos) {
  try {
    console.log('[AnalisisModule] Generando análisis consolidado...');

    const analisisLideres = analizarLideres(datos.lideres || []);
    const analisisCelulas = analizarCelulas(datos.celulas || []);
    const analisisIngresos = analizarIngresos(datos.ingresos || []);

    const consolidado = {
      timestamp: new Date().toISOString(),
      lideres: analisisLideres,
      celulas: analisisCelulas,
      ingresos: analisisIngresos,
      resumen: {
        total_lideres: analisisLideres.total_LD + analisisLideres.total_LCF,
        total_celulas: analisisCelulas.total_celulas,
        total_ingresos: analisisIngresos.total_historico,
        salud_general: calcularSaludGeneral(analisisLideres, analisisCelulas, analisisIngresos)
      }
    };

    console.log('[AnalisisModule] Análisis consolidado generado');
    return consolidado;

  } catch (error) {
    console.error('[AnalisisModule] Error generando análisis consolidado:', error);
    return {
      timestamp: new Date().toISOString(),
      lideres: {},
      celulas: {},
      ingresos: {},
      resumen: { salud_general: 'Error' }
    };
  }
}

/**
 * Calcula un indicador de salud general del sistema.
 * @param {Object} analisisLideres - Análisis de líderes
 * @param {Object} analisisCelulas - Análisis de células
 * @param {Object} analisisIngresos - Análisis de ingresos
 * @returns {string} Indicador de salud: 'Excelente', 'Bueno', 'Regular', 'Crítico'
 */
function calcularSaludGeneral(analisisLideres, analisisCelulas, analisisIngresos) {
  try {
    let puntuacion = 0;
    let factores = 0;

    // Factor 1: Actividad de líderes (40% del peso)
    if (analisisLideres.total_LD > 0) {
      const actividadLD = parseFloat(analisisLideres.tasa_actividad_LD);
      puntuacion += (actividadLD / 100) * 0.2;
      factores += 0.2;
    }

    if (analisisLideres.total_LCF > 0) {
      const actividadLCF = parseFloat(analisisLideres.tasa_actividad_LCF);
      puntuacion += (actividadLCF / 100) * 0.2;
      factores += 0.2;
    }

    // Factor 2: Salud de células (30% del peso)
    if (analisisCelulas.total_celulas > 0) {
      const celulasSaludables = analisisCelulas.celulas_saludables + analisisCelulas.celulas_para_multiplicar;
      const saludCelulas = (celulasSaludables / analisisCelulas.total_celulas) * 100;
      puntuacion += (saludCelulas / 100) * 0.3;
      factores += 0.3;
    }

    // Factor 3: Integración de ingresos (30% del peso)
    if (analisisIngresos.total_historico > 0) {
      const tasaIntegracion = parseFloat(analisisIngresos.tasa_integracion_celula);
      puntuacion += (tasaIntegracion / 100) * 0.3;
      factores += 0.3;
    }

    if (factores === 0) return 'Sin datos';

    const puntuacionFinal = puntuacion / factores;

    if (puntuacionFinal >= 0.8) return 'Excelente';
    if (puntuacionFinal >= 0.6) return 'Bueno';
    if (puntuacionFinal >= 0.4) return 'Regular';
    return 'Crítico';

  } catch (error) {
    console.error('[AnalisisModule] Error calculando salud general:', error);
    return 'Error';
  }
}

/**
 * Genera alertas basadas en el análisis.
 * @param {Object} analisis - Análisis consolidado
 * @returns {Array<Object>} Array de alertas generadas
 */
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
        tipo: 'warning',
        mensaje: `${pendientesUrgentesCelula.length} alma(s) sin integrar a Célula por más de 14 días.`,
        detalles: pendientesUrgentesCelula.slice(0, 5).map(i => i.Nombre_Completo)
      });
    }
  }

  // 3. Células vacías
  if (data.celulas) {
    const celulasVacias = data.celulas.filter(c => c.Total_Miembros === 0);
    if (celulasVacias.length > 0) {
      alertas.push({
        tipo: 'warning',
        mensaje: `${celulasVacias.length} célula(s) vacía(s) (sin miembros).`,
        detalles: celulasVacias.slice(0, 5).map(c => `${c.Nombre_Celula} (${c.ID_LCF_Responsable})`)
      });
    }
  }

  return alertas;
}


console.log('📊 AnalisisModule cargado - Funciones de análisis disponibles');
