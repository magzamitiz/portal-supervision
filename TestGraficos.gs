/**
 * @fileoverview Función de prueba para diagnosticar problemas con gráficos
 */

function testGraficos() {
  try {
    console.log('🧪 Iniciando prueba de gráficos...');
    
    // 1. Verificar si las hojas existen
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    const hojaGraficos = spreadsheet.getSheetByName('_GraficosDashboard');
    const hojaHistorico = spreadsheet.getSheetByName('_MetricasHistoricas');
    
    console.log('Hoja _GraficosDashboard existe:', !!hojaGraficos);
    console.log('Hoja _MetricasHistoricas existe:', !!hojaHistorico);
    
    if (hojaGraficos) {
      const lastRow = hojaGraficos.getLastRow();
      console.log('Filas en _GraficosDashboard:', lastRow);
      
      if (lastRow > 1) {
        const sampleData = hojaGraficos.getRange(2, 1, 1, 14).getValues()[0];
        console.log('Datos de muestra:', sampleData);
      }
    }
    
    // 2. Probar función obtenerDatosGraficos
    console.log('Probando obtenerDatosGraficos...');
    const datosGraficos = obtenerDatosGraficos();
    console.log('Resultado obtenerDatosGraficos:', datosGraficos);
    
    // 3. Probar función actualizarGraficoActividadEquipo
    console.log('Probando actualizarGraficoActividadEquipo...');
    const actividadEquipo = actualizarGraficoActividadEquipo();
    console.log('Resultado actividadEquipo:', actividadEquipo);
    
    // 4. Probar función actualizarGraficoSaludCelulas
    console.log('Probando actualizarGraficoSaludCelulas...');
    const saludCelulas = actualizarGraficoSaludCelulas();
    console.log('Resultado saludCelulas:', saludCelulas);
    
    // 5. Probar función actualizarTodosLosGraficos
    console.log('Probando actualizarTodosLosGraficos...');
    const todosLosGraficos = actualizarTodosLosGraficos();
    console.log('Resultado actualizarTodosLosGraficos:', todosLosGraficos);
    
    return {
      success: true,
      mensaje: 'Prueba completada - revisar logs',
      datos: {
        hojaGraficosExiste: !!hojaGraficos,
        hojaHistoricoExiste: !!hojaHistorico,
        filasGraficos: hojaGraficos ? hojaGraficos.getLastRow() : 0,
        datosGraficos: datosGraficos,
        actividadEquipo: actividadEquipo,
        saludCelulas: saludCelulas,
        todosLosGraficos: todosLosGraficos
      }
    };
    
  } catch (error) {
    console.error('❌ Error en prueba de gráficos:', error);
    return {
      success: false,
      error: error.toString(),
      stack: error.stack
    };
  }
}
