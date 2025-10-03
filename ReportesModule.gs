/**
 * @fileoverview Módulo de generación de reportes
 * Funciones para generar reportes de LCF y equipos LD
 */

/**
 * Función de prueba para verificar la generación de PDF
 * @returns {Object} Resultado de la prueba
 */
function probarGeneracionPDF() {
  const idLCF = obtenerLCFValidoParaPruebas();
  if (!idLCF) {
    console.error('❌ No hay LCFs disponibles para pruebas');
    return { success: false, error: 'Sin LCFs en el sistema' };
  }
  try {
    console.log(`🧪 Probando generación de PDF para: ${idLCF}`);
    
    const resultado = generarReporteLCF(idLCF);
    
    if (resultado.success) {
      console.log(`✅ PDF generado exitosamente:`);
      console.log(`   - Archivo: ${resultado.fileName}`);
      console.log(`   - LCF: ${resultado.lcf}`);
      console.log(`   - Total almas: ${resultado.total_almas}`);
      console.log(`   - Tamaño base64: ${resultado.content ? resultado.content.length : 0} caracteres`);
      
      return {
        success: true,
        mensaje: 'PDF generado correctamente',
        detalles: {
          fileName: resultado.fileName,
          lcf: resultado.lcf,
          total_almas: resultado.total_almas,
          base64_size: resultado.content ? resultado.content.length : 0
        }
      };
    } else {
      console.error(`❌ Error generando PDF: ${resultado.error}`);
      return {
        success: false,
        error: resultado.error
      };
    }
    
  } catch (error) {
    console.error(`❌ Error en prueba: ${error}`);
    return {
      success: false,
      error: error.toString()
    };
  }
}

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
      if (fila[2] === idLCF) { // Columna C = ID_LCF
        almasLCF.push({
          Nombre_Completo: fila[1], // Columna B = Nombre
          Telefono: fila[4], // Columna E = Telefono
          Acepta_Visita: String(fila[5] || 'No').trim().toUpperCase(), // Columna F = Acepta_Visita
          B: getBienvenidaIcon(fila[6]), // Columna G = Resultado_Bienvenida
          V: getVisitaIcon(fila[7]), // Columna H = Resultado_Visita
          C: fila[8] || '0/12', // Columna I = Progreso_Celulas
          Dias: fila[9] || 0 // Columna J = Dias_Sin_Seguimiento
        });
      }
    }

    // Ordenar por días (más urgentes primero)
    const almasOrdenadas = almasLCF.sort((a, b) => b.Dias - a.Dias);
    
    const metricas = {
      total_almas: almasLCF.length,
      desean_visita: almasLCF.filter(a => a.Acepta_Visita === 'SI' || a.Acepta_Visita === 'SÍ').length,
      urgentes: almasLCF.filter(a => a.Dias > 30).length
    };

    // Generar HTML del reporte
    const html = generarHTMLReporteLCF(lcf, ldSupervisor, almasOrdenadas, metricas);
    
    // Convertir HTML a PDF
    const blob = Utilities.newBlob(html, 'text/html', 'report.html');
    const pdf = blob.getAs('application/pdf');
    
    // Generar nombre de archivo
    const fecha = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const fileName = `Reporte_${lcf.Nombre_Lider.replace(/\s+/g, '_')}_${fecha}.pdf`;
    
    return {
      success: true,
      fileName: fileName,
      content: Utilities.base64Encode(pdf.getBytes()),
      lcf: lcf.Nombre_Lider,
      total_almas: almasOrdenadas.length,
      metricas: metricas
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
 * Genera el HTML del reporte para un LCF con un diseño (UI/UX) mejorado.
 * @param {Object} lcf - Datos del LCF
 * @param {Object} ldSupervisor - Datos del LD supervisor
 * @param {Array} almas - Array de almas
 * @param {Object} metricas - Métricas del LCF
 * @returns {string} HTML del reporte
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
 * @param {Object} lider - Datos del líder
 * @param {Array} todosLideres - Array de todos los líderes
 * @returns {Object|null} LD supervisor o null si no se encuentra
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

/**
 * Genera un reporte PDF completo de un LD (Líder de Discípulos)
 * @param {string} idLD - ID del LD
 * @returns {Object} Respuesta con PDF en base64 y nombre de archivo
 */
function generarReporteLD(idLD) {
  try {
    console.log('[ReportesModule] Generando reporte LD:', idLD);
    
    if (!idLD) {
      return { success: false, error: 'ID de LD no proporcionado' };
    }
    
    // Cargar datos completos del directorio
    const data = cargarDirectorioCompleto();
    if (!data || !data.lideres) {
      return { success: false, error: 'No se pudieron cargar los datos del directorio' };
    }
    
    // Buscar el LD específico
    const ld = data.lideres.find(l => l.ID_Lider === idLD && l.Rol === 'LD');
    if (!ld) {
      return { success: false, error: `LD ${idLD} no encontrado` };
    }
    
    // Obtener todos los LCF bajo este LD
    const todosLCF = obtenerTodosLCFDelLD(idLD, data.lideres);
    console.log(`[ReportesModule] Encontrados ${todosLCF.length} LCF bajo LD ${idLD}`);
    
    // Generar HTML del reporte
    const html = generarHTMLReporteLD(ld, todosLCF, data.ingresos);
    
    // Convertir a PDF
    const blob = Utilities.newBlob(html, 'text/html', 'report.html');
    const pdf = blob.getAs('application/pdf');
    
    // Generar nombre de archivo
    const fecha = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const fileName = `Reporte_LD_${ld.Nombre_Lider.replace(/\s+/g, '_')}_${fecha}.pdf`;
    
    console.log(`[ReportesModule] ✅ Reporte LD generado: ${fileName}`);
    
    return {
      success: true,
      fileName: fileName,
      content: Utilities.base64Encode(pdf.getBytes()),
      ld: ld.Nombre_Lider,
      total_lcfs: todosLCF.length
    };
    
  } catch (error) {
    console.error('[ReportesModule] Error generando reporte LD:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Genera el HTML del reporte de LD
 * @param {Object} ld - Datos del LD
 * @param {Array} lcfs - Array de LCF bajo el LD
 * @param {Array} ingresos - Array de todos los ingresos
 * @returns {string} HTML del reporte
 */
function generarHTMLReporteLD(ld, lcfs, ingresos) {
  const fechaHoy = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy');
  
  // Calcular métricas del LD
  const totalAlmas = lcfs.reduce((sum, lcf) => {
    const almasLCF = ingresos.filter(i => i.ID_LCF === lcf.ID_Lider);
    return sum + almasLCF.length;
  }, 0);
  
  const lcfsActivos = lcfs.filter(lcf => {
    const almasLCF = ingresos.filter(i => i.ID_LCF === lcf.ID_Lider);
    return almasLCF.length > 0;
  }).length;
  
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
        .metrics-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; text-align: center; margin-bottom: 25px; }
        .metric-box { padding: 15px; border-radius: 8px; background-color: #f7f7f7; }
        .metric-box .value { font-size: 24pt; font-weight: bold; color: #005A9C; }
        .metric-box .label { font-size: 9pt; color: #666; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; font-size: 9pt; }
        th { background-color: #005A9C; color: white; padding: 10px; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #ddd; }
        tr:nth-child(even) { background-color: #f7f7f7; }
        .footer { text-align: center; font-size: 8pt; color: #888; margin-top: 30px; border-top: 1px solid #ccc; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Reporte de Líder de Discípulos (LD)</h1>
        <p>Generado el ${fechaHoy}</p>
      </div>
      
      <div class="info-grid">
        <div><strong>Líder de Discípulos:</strong> <span>${ld.Nombre_Lider}</span></div>
        <div><strong>ID:</strong> <span>${ld.ID_Lider}</span></div>
        <div><strong>Congregación:</strong> <span>${ld.Congregacion || 'No especificada'}</span></div>
        <div><strong>Total LCF:</strong> <span>${lcfs.length}</span></div>
      </div>
      
      <div class="metrics-grid">
        <div class="metric-box">
          <div class="value">${lcfs.length}</div>
          <div class="label">Total LCF</div>
        </div>
        <div class="metric-box">
          <div class="value">${lcfsActivos}</div>
          <div class="label">LCF Activos</div>
        </div>
        <div class="metric-box">
          <div class="value">${totalAlmas}</div>
          <div class="label">Total Almas</div>
        </div>
      </div>
      
      <h3>Lista de LCF bajo supervisión</h3>
      <table>
        <thead>
          <tr>
            <th>ID LCF</th>
            <th>Nombre</th>
            <th>Congregación</th>
            <th>Almas</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${lcfs.map(lcf => {
            const almasLCF = ingresos.filter(i => i.ID_LCF === lcf.ID_Lider);
            return `
              <tr>
                <td>${lcf.ID_Lider}</td>
                <td>${lcf.Nombre_Lider}</td>
                <td>${lcf.Congregacion || '-'}</td>
                <td>${almasLCF.length}</td>
                <td>${almasLCF.length > 0 ? 'Activo' : 'Sin almas'}</td>
              </tr>
            `;
          }).join('')}
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
 * Función de prueba para verificar la generación de reporte LD
 * @param {string} idLD - ID del LD para probar (opcional)
 * @returns {Object} Resultado de la prueba
 */
function testGenerarReporteLD(idLD = 'LD-4001') {
  try {
    console.log(`🧪 TEST: Probando generarReporteLD(${idLD})`);
    
    const resultado = generarReporteLD(idLD);
    
    if (resultado.success) {
      console.log(`✅ Test exitoso: ${resultado.fileName}`);
      console.log(`📊 LCF encontrados: ${resultado.total_lcfs}`);
      console.log(`📄 Tamaño del PDF: ${resultado.content.length} caracteres base64`);
    } else {
      console.log(`❌ Test falló: ${resultado.error}`);
    }
    
    return resultado;
    
  } catch (error) {
    console.error('❌ Error en test:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

console.log('📊 ReportesModule cargado - Funciones de reportes disponibles');
