/**
 * @fileoverview Módulo de generación de reportes
 * Funciones para generar reportes de LCF y equipos LD
 */

/**
 * Genera reporte completo de un LCF
 * @param {string} idLCF - ID del LCF
 * @returns {Object} Reporte completo del LCF
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
      if (fila[1] === idLCF) { // Columna B = ID_LCF
        const alma = {
          id: fila[0], // Columna A = ID_Alma
          nombre: fila[2], // Columna C = Nombre_Alma
          telefono: fila[3], // Columna D = Telefono
          fechaIngreso: fila[4], // Columna E = Fecha_Ingreso
          bienvenida: fila[5], // Columna F = Resultado_Bienvenida
          visita: fila[6], // Columna G = Resultado_Visita
          progresoCelulas: fila[7], // Columna H = Progreso_Celulas
          estado: fila[8], // Columna I = Estado
          prioridad: fila[9], // Columna J = Prioridad
          bienvenidaIcon: getBienvenidaIcon(fila[5]),
          visitaIcon: getVisitaIcon(fila[6])
        };
        almasLCF.push(alma);
      }
    }

    const metricas = {
      total_almas: almasLCF.length,
      con_bienvenida: almasLCF.filter(a => a.bienvenidaIcon !== '✗').length,
      con_visita: almasLCF.filter(a => a.visitaIcon !== '✗').length,
      en_celula: almasLCF.filter(a => a.progresoCelulas && a.progresoCelulas.includes('Integrado')).length,
      alta_prioridad: almasLCF.filter(a => a.prioridad === 'Alta').length
    };

    return {
      success: true,
      data: {
        lcf: lcf,
        ldSupervisor: ldSupervisor,
        almas: almasLCF,
        metricas: metricas,
        html: generarHTMLReporteLCF(lcf, ldSupervisor, almasLCF, metricas)
      }
    };

  } catch (error) {
    console.error('[ReportesModule] Error generando reporte LCF:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Genera reportes de todo el equipo de un LD
 * @param {string} idLD - ID del LD
 * @returns {Object} Reportes del equipo LD
 */
function generarReportesEquipoLD(idLD) {
  try {
    const data = cargarDirectorioCompleto();
    const ld = data.lideres.find(l => l.ID_Lider === idLD);
    if (!ld) return { success: false, error: 'LD no encontrado' };
    
    const todosLCF = obtenerTodosLCFDelLD(idLD, data.lideres);
    const reportes = [];
    
    for (const lcf of todosLCF) {
      const reporte = generarReporteLCF(lcf.ID_Lider);
      if (reporte.success) {
        reportes.push(reporte.data);
      }
    }
    
    return {
      success: true,
      data: {
        ld: ld,
        lcfs: todosLCF,
        reportes: reportes,
        total_lcfs: todosLCF.length,
        total_almas: reportes.reduce((sum, r) => sum + r.metricas.total_almas, 0)
      }
    };

  } catch (error) {
    console.error('[ReportesModule] Error generando reportes equipo LD:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Genera HTML del reporte LCF
 * @param {Object} lcf - Datos del LCF
 * @param {Object} ldSupervisor - Datos del LD supervisor
 * @param {Array} almas - Array de almas
 * @param {Object} metricas - Métricas del LCF
 * @returns {string} HTML del reporte
 */
function generarHTMLReporteLCF(lcf, ldSupervisor, almas, metricas) {
  let html = `
    <div class="reporte-lcf">
      <h2>Reporte de LCF: ${lcf.Nombre_Lider}</h2>
      <p><strong>Supervisor LD:</strong> ${ldSupervisor ? ldSupervisor.Nombre_Lider : 'No asignado'}</p>
      
      <div class="metricas">
        <h3>Métricas</h3>
        <ul>
          <li>Total de almas: ${metricas.total_almas}</li>
          <li>Con bienvenida: ${metricas.con_bienvenida}</li>
          <li>Con visita: ${metricas.con_visita}</li>
          <li>En célula: ${metricas.en_celula}</li>
          <li>Alta prioridad: ${metricas.alta_prioridad}</li>
        </ul>
      </div>
      
      <div class="almas">
        <h3>Almas</h3>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Bienvenida</th>
              <th>Visita</th>
              <th>Estado</th>
              <th>Prioridad</th>
            </tr>
          </thead>
          <tbody>
  `;
  
  almas.forEach(alma => {
    html += `
      <tr>
        <td>${alma.nombre}</td>
        <td>${alma.telefono}</td>
        <td>${alma.bienvenidaIcon}</td>
        <td>${alma.visitaIcon}</td>
        <td>${alma.estado}</td>
        <td>${alma.prioridad}</td>
      </tr>
    `;
  });
  
  html += `
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  return html;
}

/**
 * Obtiene el LD supervisor de un líder
 * @param {Object} lider - Datos del líder
 * @param {Array} todosLideres - Array de todos los líderes
 * @returns {Object|null} LD supervisor o null
 */
function obtenerLDSupervisor(lider, todosLideres) {
  if (!lider.ID_Lider_Directo) return null;
  
  const supervisor = todosLideres.find(l => 
    l.ID_Lider === lider.ID_Lider_Directo && l.Rol === 'LD'
  );
  
  return supervisor || null;
}

/**
 * Obtiene todos los LCF de un LD
 * @param {string} idLD - ID del LD
 * @param {Array} todosLideres - Array de todos los líderes
 * @returns {Array} Array de LCFs
 */
function obtenerTodosLCFDelLD(idLD, todosLideres) {
  return todosLideres.filter(l => 
    l.ID_Lider_Directo === idLD && l.Rol === 'LCF'
  );
}

/**
 * Obtiene lista de LDs
 * @returns {Object} Lista de LDs
 */
function getListaLDs() {
  try {
    const data = cargarDirectorioCompleto();
    const lds = data.lideres.filter(l => l.Rol === 'LD');
    
    return {
      success: true,
      data: lds.map(ld => ({
        id: ld.ID_Lider,
        nombre: ld.Nombre_Lider,
        congregacion: ld.Congregacion
      }))
    };
  } catch (error) {
    console.error('[ReportesModule] Error obteniendo lista LDs:', error);
    return { success: false, error: error.toString() };
  }
}

console.log('📊 ReportesModule cargado - Funciones de reportes disponibles');
