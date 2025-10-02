/**
 * @fileoverview Módulo para gestión de datos de gráficos del dashboard
 * Optimizado para rendimiento y precisión en Google Apps Script
 */

// ==================== CONFIGURACIÓN DE GRÁFICOS ====================

const GRAFICOS_CONFIG = {
  SHEET_GRAFICOS: '_GraficosDashboard',
  SHEET_HISTORICO: '_MetricasHistoricas',
  
  // Configuración de actualización
  UPDATE_INTERVAL: 1800, // 30 minutos en segundos
  
  // Configuración de estados de células
  ESTADOS_CELULAS: {
    VACIA: 'Vacía',
    EN_RIESGO: 'En Riesgo', 
    EN_CRECIMIENTO: 'En Crecimiento',
    SALUDABLE: 'Saludable',
    LISTA_MULTIPLICAR: 'Lista para Multiplicar'
  },
  
  // Configuración de estados de LCF
  ESTADOS_LCF: {
    ACTIVO: 'Activo',
    ALERTA: 'Alerta',
    INACTIVO: 'Inactivo',
    SIN_DATOS: 'Sin Datos'
  }
};

// ==================== FUNCIONES PRINCIPALES ====================

/**
 * Crea la hoja _GraficosDashboard con estructura optimizada
 * @returns {boolean} True si se creó exitosamente
 */
function crearHojaGraficosDashboard() {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    
    // Verificar si la hoja ya existe
    let sheet = spreadsheet.getSheetByName(GRAFICOS_CONFIG.SHEET_GRAFICOS);
    if (sheet) {
      console.log(`✅ Hoja ${GRAFICOS_CONFIG.SHEET_GRAFICOS} ya existe`);
      return true;
    }
    
    // Crear nueva hoja
    sheet = spreadsheet.insertSheet(GRAFICOS_CONFIG.SHEET_GRAFICOS);
    
    // Definir encabezados
    const headers = [
      'LCF_ID', 'LCF_Nombre', 'LD_ID', 'LD_Nombre', 'Estado_LCF',
      'Num_Celulas', 'Celulas_Saludables', 'Celulas_Listas_Multiplicar', 
      'Celulas_En_Riesgo', 'Celulas_Vacias', 'Celulas_En_Crecimiento',
      'Total_Personas', 'Porcentaje_Efectividad', 'Fecha_Ultima_Actualizacion'
    ];
    
    // Escribir encabezados
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Aplicar formato
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#f0f0f0');
    headerRange.setBorder(true, true, true, true, true, true);
    
    // Ajustar ancho de columnas
    sheet.autoResizeColumns(1, headers.length);
    
    // Congelar primera fila
    sheet.setFrozenRows(1);
    
    console.log(`✅ Hoja ${GRAFICOS_CONFIG.SHEET_GRAFICOS} creada exitosamente`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error creando hoja ${GRAFICOS_CONFIG.SHEET_GRAFICOS}:`, error);
    return false;
  }
}

/**
 * Crea la hoja _MetricasHistoricas para datos de tendencias
 * @returns {boolean} True si se creó exitosamente
 */
function crearHojaMetricasHistoricas() {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    
    // Verificar si la hoja ya existe
    let sheet = spreadsheet.getSheetByName(GRAFICOS_CONFIG.SHEET_HISTORICO);
    if (sheet) {
      console.log(`✅ Hoja ${GRAFICOS_CONFIG.SHEET_HISTORICO} ya existe`);
      return true;
    }
    
    // Crear nueva hoja
    sheet = spreadsheet.insertSheet(GRAFICOS_CONFIG.SHEET_HISTORICO);
    
    // Definir encabezados
    const headers = [
      'Fecha', 'Mes_Ano', 'Total_Celulas', 'Saludables', 
      'Listas_Multiplicar', 'En_Riesgo', 'Vacias', 'En_Crecimiento',
      'Nuevas_Celulas', 'Celulas_Multiplicadas', 'Total_LCF', 'LCF_Activos'
    ];
    
    // Escribir encabezados
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Aplicar formato
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#e8f4fd');
    headerRange.setBorder(true, true, true, true, true, true);
    
    // Ajustar ancho de columnas
    sheet.autoResizeColumns(1, headers.length);
    
    // Congelar primera fila
    sheet.setFrozenRows(1);
    
    console.log(`✅ Hoja ${GRAFICOS_CONFIG.SHEET_HISTORICO} creada exitosamente`);
    return true;
    
  } catch (error) {
    console.error(`❌ Error creando hoja ${GRAFICOS_CONFIG.SHEET_HISTORICO}:`, error);
    return false;
  }
}

/**
 * Poblar datos de gráficos para LCF (función principal)
 * @param {boolean} forceReload - Forzar recarga de datos
 * @returns {Object} Resultado de la operación
 */
function poblarDatosGraficos(forceReload = false) {
  try {
    console.log('🔄 Iniciando poblamiento de datos de gráficos...');
    
    // Verificar/crear hojas necesarias
    if (!crearHojaGraficosDashboard()) {
      throw new Error('No se pudo crear la hoja de gráficos');
    }
    
    // Cargar datos del sistema
    const data = cargarDirectorioCompleto(forceReload);
    if (!data || !data.lideres || !data.celulas) {
      throw new Error('No se pudieron cargar los datos del sistema');
    }
    
    // Filtrar solo LCF
    const lcfList = data.lideres.filter(l => l.Rol === 'LCF');
    console.log(`📊 Procesando ${lcfList.length} LCF...`);
    
    // Procesar cada LCF
    const datosGraficos = lcfList.map(lcf => {
      return procesarDatosLCF(lcf, data);
    });
    
    // Escribir datos en la hoja
    const sheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO)
                                .getSheetByName(GRAFICOS_CONFIG.SHEET_GRAFICOS);
    
    if (datosGraficos.length > 0) {
      // Limpiar datos existentes (excepto encabezados)
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, datosGraficos[0].length).clear();
      }
      
      // Escribir nuevos datos
      sheet.getRange(2, 1, datosGraficos.length, datosGraficos[0].length)
           .setValues(datosGraficos);
      
      // Aplicar formato de fecha a la columna 13 (Fecha_Ultima_Actualizacion)
      sheet.getRange(2, 13, datosGraficos.length, 1).setNumberFormat('yyyy-MM-dd HH:mm:ss');
    }
    
    console.log(`✅ Datos de gráficos actualizados: ${datosGraficos.length} LCF procesados`);
    
    return {
      success: true,
      lcfProcesados: datosGraficos.length,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error poblando datos de gráficos:', error);
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Procesa datos específicos de un LCF
 * @param {Object} lcf - Datos del LCF
 * @param {Object} data - Datos completos del sistema
 * @returns {Array} Array con datos procesados del LCF
 */
function procesarDatosLCF(lcf, data) {
  try {
    // Encontrar LD supervisor
    const ldSupervisor = data.lideres.find(l => l.ID_Lider === lcf.ID_Lider_Directo);
    
    // Filtrar células bajo este LCF
    const celulasDelLCF = data.celulas.filter(c => c.ID_LCF_Responsable === lcf.ID_Lider);
    
    // Debug temporal para LCFs específicos del LD-4003
    if (['LCF-1028', 'LCF-1029', 'LCF-1079'].includes(lcf.ID_Lider)) {
      console.log(`\n=== DEBUG ${lcf.ID_Lider} - ${lcf.Nombre_Lider} ===`);
      console.log(`Células encontradas: ${celulasDelLCF.length}`);
      let totalDebug = 0;
      celulasDelLCF.forEach(cel => {
        const miembros = obtenerTotalMiembros(cel);
        totalDebug += miembros;
        console.log(`  - ${cel.ID_Celula}: ${miembros} miembros (Total_Miembros: ${cel.Total_Miembros}, Miembros.length: ${cel.Miembros ? cel.Miembros.length : 0})`);
      });
      console.log(`Total personas calculado: ${totalDebug}`);
      console.log(`Estado del LCF: ${lcf.Estado_Actividad}`);
    }
    
    // Contar células por estado
    const conteos = {
      saludables: 0,
      listasMultiplicar: 0,
      enRiesgo: 0,
      vacias: 0,
      enCrecimiento: 0,
      totalPersonas: 0
    };
    
    celulasDelLCF.forEach(celula => {
      switch(celula.Estado) {
        case GRAFICOS_CONFIG.ESTADOS_CELULAS.SALUDABLE:
          conteos.saludables++;
          break;
        case GRAFICOS_CONFIG.ESTADOS_CELULAS.LISTA_MULTIPLICAR:
          conteos.listasMultiplicar++;
          break;
        case GRAFICOS_CONFIG.ESTADOS_CELULAS.EN_RIESGO:
          conteos.enRiesgo++;
          break;
        case GRAFICOS_CONFIG.ESTADOS_CELULAS.VACIA:
          conteos.vacias++;
          break;
        case GRAFICOS_CONFIG.ESTADOS_CELULAS.EN_CRECIMIENTO:
          conteos.enCrecimiento++;
          break;
      }
      conteos.totalPersonas += obtenerTotalMiembros(celula);
    });
    
    // Calcular efectividad (Saludables + Listas para Multiplicar) / Total
    const totalCelulas = celulasDelLCF.length;
    const efectividad = totalCelulas > 0 ? 
      ((conteos.saludables + conteos.listasMultiplicar) / totalCelulas) * 100 : 0;
    
    // Retornar array de datos para la hoja
    return [
      lcf.ID_Lider,                           // LCF_ID
      lcf.Nombre_Lider || 'Sin Nombre',       // LCF_Nombre
      ldSupervisor?.ID_Lider || '',           // LD_ID
      ldSupervisor?.Nombre_Lider || '',       // LD_Nombre
      lcf.Estado_Actividad || 'Sin Datos',    // Estado_LCF
      totalCelulas,                           // Num_Celulas
      conteos.saludables,                     // Celulas_Saludables
      conteos.listasMultiplicar,              // Celulas_Listas_Multiplicar
      conteos.enRiesgo,                       // Celulas_En_Riesgo
      conteos.vacias,                         // Celulas_Vacias
      conteos.enCrecimiento,                  // Celulas_En_Crecimiento
      conteos.totalPersonas,                  // Total_Personas
      Math.round(efectividad * 100) / 100,    // Porcentaje_Efectividad
      new Date()                              // Fecha_Ultima_Actualizacion
    ];
    
  } catch (error) {
    console.error(`❌ Error procesando LCF ${lcf.ID_Lider}:`, error);
    // Retornar datos básicos en caso de error
    return [
      lcf.ID_Lider,
      lcf.Nombre_Lider || 'Sin Nombre',
      lcf.ID_Lider_Directo || '',
      '',
      lcf.Estado_Actividad || 'Sin Datos',
      0, 0, 0, 0, 0, 0, 0, 0,
      new Date().toISOString()
    ];
  }
}

/**
 * Poblar datos históricos para gráficos de tendencias
 * @returns {Object} Resultado de la operación
 */
function poblarDatosHistoricos() {
  try {
    console.log('🔄 Actualizando datos históricos...');
    
    // Verificar/crear hoja de histórico
    if (!crearHojaMetricasHistoricas()) {
      throw new Error('No se pudo crear la hoja de métricas históricas');
    }
    
    // Cargar datos actuales
    const data = cargarDirectorioCompleto();
    if (!data || !data.lideres || !data.celulas) {
      throw new Error('No se pudieron cargar los datos del sistema');
    }
    
    const hoy = new Date();
    const mesActual = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
    
    // Contar células por estado
    const conteosCelulas = {
      total: data.celulas.length,
      saludables: data.celulas.filter(c => c.Estado === GRAFICOS_CONFIG.ESTADOS_CELULAS.SALUDABLE).length,
      listasMultiplicar: data.celulas.filter(c => c.Estado === GRAFICOS_CONFIG.ESTADOS_CELULAS.LISTA_MULTIPLICAR).length,
      enRiesgo: data.celulas.filter(c => c.Estado === GRAFICOS_CONFIG.ESTADOS_CELULAS.EN_RIESGO).length,
      vacias: data.celulas.filter(c => c.Estado === GRAFICOS_CONFIG.ESTADOS_CELULAS.VACIA).length,
      enCrecimiento: data.celulas.filter(c => c.Estado === GRAFICOS_CONFIG.ESTADOS_CELULAS.EN_CRECIMIENTO).length
    };
    
    // Contar LCF
    const lcfList = data.lideres.filter(l => l.Rol === 'LCF');
    const lcfActivos = lcfList.filter(l => l.Estado_Actividad === GRAFICOS_CONFIG.ESTADOS_LCF.ACTIVO).length;
    
    // Verificar si ya existe registro para este mes
    const sheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO)
                                .getSheetByName(GRAFICOS_CONFIG.SHEET_HISTORICO);
    
    const dataRange = sheet.getDataRange();
    const existingData = dataRange.getValues();
    
    // Buscar si ya existe registro para este mes
    let existingRowIndex = -1;
    for (let i = 1; i < existingData.length; i++) {
      if (existingData[i][1] === mesActual) { // Columna Mes_Ano
        existingRowIndex = i + 1; // +1 porque es índice de fila en Sheets
        break;
      }
    }
    
    // Preparar datos para insertar/actualizar
    const rowData = [
      hoy,
      mesActual,
      conteosCelulas.total,
      conteosCelulas.saludables,
      conteosCelulas.listasMultiplicar,
      conteosCelulas.enRiesgo,
      conteosCelulas.vacias,
      conteosCelulas.enCrecimiento,
      0, // Nuevas_Celulas (se calcularía comparando con mes anterior)
      0, // Celulas_Multiplicadas (se calcularía comparando con mes anterior)
      lcfList.length,
      lcfActivos
    ];
    
    if (existingRowIndex > 0) {
      // Actualizar fila existente
      sheet.getRange(existingRowIndex, 1, 1, rowData.length).setValues([rowData]);
      console.log(`✅ Datos históricos actualizados para ${mesActual}`);
    } else {
      // Insertar nueva fila
      sheet.appendRow(rowData);
      console.log(`✅ Nuevos datos históricos agregados para ${mesActual}`);
    }
    
    return {
      success: true,
      mesActual: mesActual,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error actualizando datos históricos:', error);
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Configurar triggers automáticos para actualización de datos
 * @returns {boolean} True si se configuraron exitosamente
 */
function configurarTriggersGraficos() {
  try {
    // Eliminar triggers existentes para evitar duplicados
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === 'poblarDatosGraficos' || 
          trigger.getHandlerFunction() === 'poblarDatosHistoricos') {
        ScriptApp.deleteTrigger(trigger);
      }
    });
    
    // Crear trigger para datos de gráficos (cada 30 minutos)
    ScriptApp.newTrigger('poblarDatosGraficos')
             .timeBased()
             .everyMinutes(30)
             .create();
    
    // Crear trigger para datos históricos (diario a las 6 AM)
    ScriptApp.newTrigger('poblarDatosHistoricos')
             .timeBased()
             .everyDays(1)
             .atHour(6)
             .create();
    
    console.log('✅ Triggers automáticos configurados exitosamente');
    return true;
    
  } catch (error) {
    console.error('❌ Error configurando triggers:', error);
    return false;
  }
}

/**
 * Función de inicialización completa del sistema de gráficos
 * @returns {Object} Resultado de la inicialización
 */
function inicializarSistemaGraficos() {
  try {
    console.log('🚀 Inicializando sistema de gráficos...');
    
    // Crear hojas necesarias
    const hojasCreadas = crearHojaGraficosDashboard() && crearHojaMetricasHistoricas();
    if (!hojasCreadas) {
      throw new Error('No se pudieron crear las hojas necesarias');
    }
    
    // Poblar datos iniciales
    const resultadoGraficos = poblarDatosGraficos(true);
    const resultadoHistoricos = poblarDatosHistoricos();
    
    // Configurar triggers
    const triggersConfigurados = configurarTriggersGraficos();
    
    return {
      success: true,
      hojasCreadas: hojasCreadas,
      datosGraficos: resultadoGraficos,
      datosHistoricos: resultadoHistoricos,
      triggersConfigurados: triggersConfigurados,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error inicializando sistema de gráficos:', error);
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

// ==================== FUNCIONES DE UTILIDAD ====================

/**
 * Obtener datos de gráficos para el dashboard
 * @returns {Object} Datos optimizados para gráficos
 */
function obtenerDatosGraficos() {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO)
                                .getSheetByName(GRAFICOS_CONFIG.SHEET_GRAFICOS);
    
    if (!sheet || sheet.getLastRow() < 2) {
      return { success: false, error: 'No hay datos de gráficos disponibles' };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    // Convertir a objetos para facilitar el uso
    const lcfData = rows.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
    
    return {
      success: true,
      data: lcfData,
      total: lcfData.length,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error obteniendo datos de gráficos:', error);
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Obtener datos históricos para gráficos de tendencias
 * @param {number} meses - Número de meses a obtener (default: 6)
 * @returns {Object} Datos históricos
 */
function obtenerDatosHistoricos(meses = 6) {
  try {
    const sheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO)
                                .getSheetByName(GRAFICOS_CONFIG.SHEET_HISTORICO);
    
    if (!sheet || sheet.getLastRow() < 2) {
      return { success: false, error: 'No hay datos históricos disponibles' };
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    
    // Ordenar por fecha (más reciente primero)
    rows.sort((a, b) => new Date(b[0]) - new Date(a[0]));
    
    // Tomar solo los últimos N meses
    const datosLimitados = rows.slice(0, meses);
    
    // Convertir a objetos
    const historicoData = datosLimitados.map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
    
    return {
      success: true,
      data: historicoData,
      total: historicoData.length,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error obteniendo datos históricos:', error);
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}
