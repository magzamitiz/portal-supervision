/**
 * Función para analizar la estructura real de la hoja de líderes
 * y entender la jerarquía completa del sistema
 */
function analizarEstructuraLideres() {
  console.log("=== ANÁLISIS DE ESTRUCTURA DE LÍDERES ===");
  
  try {
    // Abrir la hoja de líderes
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    const sheet = spreadsheet.getSheetByName(CONFIG.TABS.LIDERES);
    
    if (!sheet) {
      console.log("❌ Hoja 'Directorio de Líderes' no encontrada");
      return;
    }
    
    console.log("✅ Hoja encontrada:", sheet.getName());
    console.log("📊 Dimensiones:", sheet.getLastRow(), "filas x", sheet.getLastColumn(), "columnas");
    
    // Obtener headers
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    console.log("\n📋 HEADERS DE COLUMNAS:");
    headers.forEach((header, index) => {
      console.log(`  ${index + 1}. ${header}`);
    });
    
    // Obtener datos de muestra (primeras 10 filas)
    const data = sheet.getRange(1, 1, Math.min(11, sheet.getLastRow()), sheet.getLastColumn()).getValues();
    
    console.log("\n📊 MUESTRA DE DATOS (primeras 10 filas):");
    data.forEach((row, index) => {
      if (index === 0) {
        console.log("HEADERS:", row);
      } else {
        console.log(`Fila ${index}:`, row);
      }
    });
    
    // Analizar jerarquía por roles
    console.log("\n🏢 ANÁLISIS DE JERARQUÍA:");
    const allData = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
    
    const roles = {};
    const jerarquia = {};
    
    allData.forEach((row, index) => {
      const rol = row[2]; // Columna C (Rol)
      const idLider = row[0]; // Columna A (ID)
      const nombreLider = row[1]; // Columna B (Nombre)
      const idSuperior = row[3]; // Columna D (ID_Lider_Directo)
      const estado = row[4]; // Columna E (Estado)
      
      if (!roles[rol]) {
        roles[rol] = [];
      }
      
      roles[rol].push({
        id: idLider,
        nombre: nombreLider,
        superior: idSuperior,
        estado: estado,
        fila: index + 2
      });
      
      // Mapear jerarquía
      if (idSuperior) {
        if (!jerarquia[idSuperior]) {
          jerarquia[idSuperior] = [];
        }
        jerarquia[idSuperior].push(idLider);
      }
    });
    
    console.log("\n📈 DISTRIBUCIÓN POR ROLES:");
    Object.keys(roles).forEach(rol => {
      console.log(`  ${rol}: ${roles[rol].length} líderes`);
      if (roles[rol].length <= 5) {
        roles[rol].forEach(lider => {
          console.log(`    - ${lider.id}: ${lider.nombre} (Superior: ${lider.superior || 'N/A'}, Estado: ${lider.estado || 'N/A'})`);
        });
      } else {
        console.log(`    (Mostrando solo los primeros 3)`);
        roles[rol].slice(0, 3).forEach(lider => {
          console.log(`    - ${lider.id}: ${lider.nombre} (Superior: ${lider.superior || 'N/A'}, Estado: ${lider.estado || 'N/A'})`);
        });
      }
    });
    
    // Analizar jerarquía específica
    console.log("\n🔗 ANÁLISIS DE JERARQUÍA:");
    const lds = roles['LD'] || [];
    lds.forEach(ld => {
      const subordinados = jerarquia[ld.id] || [];
      console.log(`  ${ld.id} (${ld.nombre}):`);
      console.log(`    - Estado: ${ld.estado || 'N/A'}`);
      console.log(`    - Subordinados directos: ${subordinados.length}`);
      if (subordinados.length > 0) {
        subordinados.forEach(subId => {
          const sub = allData.find(row => row[0] === subId);
          if (sub) {
            console.log(`      * ${subId}: ${sub[1]} (${sub[2]})`);
          }
        });
      }
    });
    
    // Analizar estados
    console.log("\n📊 ANÁLISIS DE ESTADOS:");
    const estados = {};
    allData.forEach(row => {
      const estado = row[4] || 'Sin Estado';
      if (!estados[estado]) {
        estados[estado] = 0;
      }
      estados[estado]++;
    });
    
    Object.keys(estados).forEach(estado => {
      console.log(`  ${estado}: ${estados[estado]} líderes`);
    });
    
    console.log("\n=== FIN DEL ANÁLISIS ===");
    
    return {
      headers: headers,
      totalFilas: sheet.getLastRow() - 1,
      roles: roles,
      jerarquia: jerarquia,
      estados: estados
    };
    
  } catch (error) {
    console.error("❌ Error analizando estructura:", error);
    return null;
  }
}

/**
 * Función para analizar la estructura de células
 */
function analizarEstructuraCelulas() {
  console.log("=== ANÁLISIS DE ESTRUCTURA DE CÉLULAS ===");
  
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    const sheet = spreadsheet.getSheetByName(CONFIG.TABS.CELULAS);
    
    if (!sheet) {
      console.log("❌ Hoja 'Directorio de Células' no encontrada");
      return;
    }
    
    console.log("✅ Hoja encontrada:", sheet.getName());
    console.log("📊 Dimensiones:", sheet.getLastRow(), "filas x", sheet.getLastColumn(), "columnas");
    
    // Headers
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    console.log("\n📋 HEADERS DE COLUMNAS:");
    headers.forEach((header, index) => {
      console.log(`  ${index + 1}. ${header}`);
    });
    
    // Muestra de datos
    const data = sheet.getRange(1, 1, Math.min(6, sheet.getLastRow()), sheet.getLastColumn()).getValues();
    console.log("\n📊 MUESTRA DE DATOS:");
    data.forEach((row, index) => {
      if (index === 0) {
        console.log("HEADERS:", row);
      } else {
        console.log(`Fila ${index}:`, row);
      }
    });
    
    return {
      headers: headers,
      totalFilas: sheet.getLastRow() - 1
    };
    
  } catch (error) {
    console.error("❌ Error analizando células:", error);
    return null;
  }
}

/**
 * Función para analizar la estructura de ingresos
 */
function analizarEstructuraIngresos() {
  console.log("=== ANÁLISIS DE ESTRUCTURA DE INGRESOS ===");
  
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    const sheet = spreadsheet.getSheetByName(CONFIG.TABS.INGRESOS);
    
    if (!sheet) {
      console.log("❌ Hoja 'Ingresos' no encontrada");
      return;
    }
    
    console.log("✅ Hoja encontrada:", sheet.getName());
    console.log("📊 Dimensiones:", sheet.getLastRow(), "filas x", sheet.getLastColumn(), "columnas");
    
    // Headers
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    console.log("\n📋 HEADERS DE COLUMNAS:");
    headers.forEach((header, index) => {
      console.log(`  ${index + 1}. ${header}`);
    });
    
    // Muestra de datos
    const data = sheet.getRange(1, 1, Math.min(6, sheet.getLastRow()), sheet.getLastColumn()).getValues();
    console.log("\n📊 MUESTRA DE DATOS:");
    data.forEach((row, index) => {
      if (index === 0) {
        console.log("HEADERS:", row);
      } else {
        console.log(`Fila ${index}:`, row);
      }
    });
    
    return {
      headers: headers,
      totalFilas: sheet.getLastRow() - 1
    };
    
  } catch (error) {
    console.error("❌ Error analizando ingresos:", error);
    return null;
  }
}

/**
 * Función para analizar la estructura de seguimiento consolidado
 * Esta es la hoja principal para el avance de cada alma
 */
function analizarEstructuraSeguimiento() {
  console.log("=== ANÁLISIS DE ESTRUCTURA DE SEGUIMIENTO CONSOLIDADO ===");
  
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    const sheet = spreadsheet.getSheetByName('_SeguimientoConsolidado');
    
    if (!sheet) {
      console.log("❌ Hoja '_SeguimientoConsolidado' no encontrada");
      return;
    }
    
    console.log("✅ Hoja encontrada:", sheet.getName());
    console.log("📊 Dimensiones:", sheet.getLastRow(), "filas x", sheet.getLastColumn(), "columnas");
    console.log("📊 Propósito: Lectura principal para el avance de cada alma");
    
    // Headers
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    console.log("\n📋 HEADERS DE COLUMNAS:");
    headers.forEach((header, index) => {
      console.log(`  ${index + 1}. ${header}`);
    });
    
    // Muestra de datos
    const data = sheet.getRange(1, 1, Math.min(6, sheet.getLastRow()), sheet.getLastColumn()).getValues();
    console.log("\n📊 MUESTRA DE DATOS:");
    data.forEach((row, index) => {
      if (index === 0) {
        console.log("HEADERS:", row);
      } else {
        console.log(`Fila ${index}:`, row);
      }
    });
    
    // Analizar columnas clave para el seguimiento
    console.log("\n🔍 ANÁLISIS DE COLUMNAS CLAVE:");
    const columnasClave = ['ID_Alma', 'Nombre', 'ID_LCF', 'Estado', 'Fecha_Ultima_Actividad'];
    columnasClave.forEach(columna => {
      const indice = headers.findIndex(h => h && h.toString().toLowerCase().includes(columna.toLowerCase()));
      if (indice !== -1) {
        console.log(`  ✅ ${columna}: Columna ${indice + 1} - "${headers[indice]}"`);
      } else {
        console.log(`  ❌ ${columna}: No encontrada`);
      }
    });
    
    return {
      headers: headers,
      totalFilas: sheet.getLastRow() - 1,
      columnasClave: columnasClave.map(col => {
        const indice = headers.findIndex(h => h && h.toString().toLowerCase().includes(col.toLowerCase()));
        return {
          nombre: col,
          indice: indice,
          header: indice !== -1 ? headers[indice] : null
        };
      })
    };
    
  } catch (error) {
    console.error("❌ Error analizando seguimiento:", error);
    return null;
  }
}

/**
 * Función para analizar la estructura del resumen del dashboard
 */
function analizarEstructuraResumen() {
  console.log("=== ANÁLISIS DE ESTRUCTURA DE RESUMEN DASHBOARD ===");
  
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    const sheet = spreadsheet.getSheetByName('_ResumenDashboard');
    
    if (!sheet) {
      console.log("❌ Hoja '_ResumenDashboard' no encontrada");
      return;
    }
    
    console.log("✅ Hoja encontrada:", sheet.getName());
    console.log("📊 Dimensiones:", sheet.getLastRow(), "filas x", sheet.getLastColumn(), "columnas");
    console.log("📊 Propósito: Resumen del dashboard principal");
    
    // Headers
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    console.log("\n📋 HEADERS DE COLUMNAS:");
    headers.forEach((header, index) => {
      console.log(`  ${index + 1}. ${header}`);
    });
    
    // Muestra de datos
    const data = sheet.getRange(1, 1, Math.min(6, sheet.getLastRow()), sheet.getLastColumn()).getValues();
    console.log("\n📊 MUESTRA DE DATOS:");
    data.forEach((row, index) => {
      if (index === 0) {
        console.log("HEADERS:", row);
      } else {
        console.log(`Fila ${index}:`, row);
      }
    });
    
    return {
      headers: headers,
      totalFilas: sheet.getLastRow() - 1
    };
    
  } catch (error) {
    console.error("❌ Error analizando resumen:", error);
    return null;
  }
}

/**
 * Función para analizar la ubicación y estructura de todas las hojas
 * ESTRUCTURA REAL DEL SISTEMA:
 * 1. _ResumenDashboard: Resumen del dashboard principal
 * 2. _SeguimientoConsolidado: Lectura principal para el avance de cada alma
 * 3. Directorio de Líderes: Jerarquía y mapeo completo de liderazgo
 * 4. Directorio de Células: Altas de células (Anfitriones y oyentes) - NO seguimiento
 * 5. Ingresos: Hoja de nuevos ingresos principal
 */
function analizarUbicacionHojas() {
  console.log("=== ANÁLISIS DE UBICACIÓN DE HOJAS ===");
  console.log("📊 ID del Spreadsheet: 1dwuqpyMXWHJvnJHwDHCqFMvgdYhypE2W1giH6bRZMKc");
  
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    const nombreSpreadsheet = spreadsheet.getName();
    const urlSpreadsheet = spreadsheet.getUrl();
    
    console.log("\n📊 INFORMACIÓN DEL SPREADSHEET PRINCIPAL:");
    console.log("  Nombre:", nombreSpreadsheet);
    console.log("  ID:", CONFIG.SHEETS.DIRECTORIO);
    console.log("  URL:", urlSpreadsheet);
    
    // Obtener todas las hojas del spreadsheet
    const hojas = spreadsheet.getSheets();
    console.log("\n📋 TODAS LAS HOJAS DISPONIBLES:");
    hojas.forEach((hoja, index) => {
      console.log(`  ${index + 1}. "${hoja.getName()}" (${hoja.getLastRow()} filas x ${hoja.getLastColumn()} columnas)`);
    });
    
    // Analizar hojas específicas del sistema
    console.log("\n🏢 ANÁLISIS DE HOJAS DEL SISTEMA:");
    
    // 1. _ResumenDashboard
    const resumenDashboard = spreadsheet.getSheetByName('_ResumenDashboard');
    if (resumenDashboard) {
      console.log(`  ✅ _ResumenDashboard: ENCONTRADA (${resumenDashboard.getLastRow()} filas x ${resumenDashboard.getLastColumn()} columnas)`);
      console.log("     📊 Propósito: Resumen del dashboard principal");
    } else {
      console.log(`  ❌ _ResumenDashboard: NO ENCONTRADA`);
    }
    
    // 2. _SeguimientoConsolidado
    const seguimientoConsolidado = spreadsheet.getSheetByName('_SeguimientoConsolidado');
    if (seguimientoConsolidado) {
      console.log(`  ✅ _SeguimientoConsolidado: ENCONTRADA (${seguimientoConsolidado.getLastRow()} filas x ${seguimientoConsolidado.getLastColumn()} columnas)`);
      console.log("     📊 Propósito: Lectura principal para el avance de cada alma");
    } else {
      console.log(`  ❌ _SeguimientoConsolidado: NO ENCONTRADA`);
    }
    
    // 3. Directorio de Líderes
    const directorioLideres = spreadsheet.getSheetByName('Directorio de Líderes');
    if (directorioLideres) {
      console.log(`  ✅ Directorio de Líderes: ENCONTRADA (${directorioLideres.getLastRow()} filas x ${directorioLideres.getLastColumn()} columnas)`);
      console.log("     📊 Propósito: Jerarquía y mapeo completo de liderazgo");
    } else {
      console.log(`  ❌ Directorio de Líderes: NO ENCONTRADA`);
    }
    
    // 4. Directorio de Células
    const directorioCelulas = spreadsheet.getSheetByName('Directorio de Células');
    if (directorioCelulas) {
      console.log(`  ✅ Directorio de Células: ENCONTRADA (${directorioCelulas.getLastRow()} filas x ${directorioCelulas.getLastColumn()} columnas)`);
      console.log("     📊 Propósito: Altas de células (Anfitriones y oyentes) - NO seguimiento");
    } else {
      console.log(`  ❌ Directorio de Células: NO ENCONTRADA`);
    }
    
    // 5. Ingresos
    const ingresos = spreadsheet.getSheetByName('Ingresos');
    if (ingresos) {
      console.log(`  ✅ Ingresos: ENCONTRADA (${ingresos.getLastRow()} filas x ${ingresos.getLastColumn()} columnas)`);
      console.log("     📊 Propósito: Hoja de nuevos ingresos principal");
    } else {
      console.log(`  ❌ Ingresos: NO ENCONTRADA`);
    }
    
    // Verificar hojas configuradas en CONFIG
    console.log("\n🔍 VERIFICACIÓN DE CONFIGURACIÓN:");
    Object.keys(CONFIG.TABS).forEach(tabKey => {
      const nombreTab = CONFIG.TABS[tabKey];
      const hoja = spreadsheet.getSheetByName(nombreTab);
      if (hoja) {
        console.log(`  ✅ ${tabKey}: "${nombreTab}" - CONFIGURADA Y ENCONTRADA`);
      } else {
        console.log(`  ❌ ${tabKey}: "${nombreTab}" - CONFIGURADA PERO NO ENCONTRADA`);
      }
    });
    
    return {
      spreadsheet: {
        nombre: nombreSpreadsheet,
        id: CONFIG.SHEETS.DIRECTORIO,
        url: urlSpreadsheet,
        hojas: hojas.map(h => ({
          nombre: h.getName(),
          filas: h.getLastRow(),
          columnas: h.getLastColumn()
        }))
      },
      sistema: {
        resumenDashboard: resumenDashboard ? { filas: resumenDashboard.getLastRow(), columnas: resumenDashboard.getLastColumn() } : null,
        seguimientoConsolidado: seguimientoConsolidado ? { filas: seguimientoConsolidado.getLastRow(), columnas: seguimientoConsolidado.getLastColumn() } : null,
        directorioLideres: directorioLideres ? { filas: directorioLideres.getLastRow(), columnas: directorioLideres.getLastColumn() } : null,
        directorioCelulas: directorioCelulas ? { filas: directorioCelulas.getLastRow(), columnas: directorioCelulas.getLastColumn() } : null,
        ingresos: ingresos ? { filas: ingresos.getLastRow(), columnas: ingresos.getLastColumn() } : null
      },
      configuradas: Object.keys(CONFIG.TABS).map(key => ({
        clave: key,
        nombre: CONFIG.TABS[key],
        encontrada: !!spreadsheet.getSheetByName(CONFIG.TABS[key])
      }))
    };
    
  } catch (error) {
    console.error("❌ Error analizando ubicación de hojas:", error);
    return null;
  }
}

/**
 * Función para mapear la jerarquía completa del sistema
 */
function mapearJerarquiaCompleta() {
  console.log("=== MAPEO DE JERARQUÍA COMPLETA ===");
  
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    const sheetLideres = spreadsheet.getSheetByName(CONFIG.TABS.LIDERES);
    
    if (!sheetLideres) {
      console.log("❌ Hoja de líderes no encontrada");
      return;
    }
    
    const data = sheetLideres.getRange(2, 1, sheetLideres.getLastRow() - 1, 5).getValues();
    
    // Mapear todos los líderes
    const lideres = {};
    const jerarquia = {};
    
    data.forEach((row, index) => {
      const [id, nombre, rol, superior, estado] = row;
      if (id) {
        lideres[id] = {
          nombre: nombre || 'Sin Nombre',
          rol: rol || 'Sin Rol',
          superior: superior || null,
          estado: estado || 'Sin Estado',
          fila: index + 2
        };
        
        if (superior) {
          if (!jerarquia[superior]) {
            jerarquia[superior] = [];
          }
          jerarquia[superior].push(id);
        }
      }
    });
    
    // Encontrar LDs (líderes sin superior)
    const lds = Object.keys(lideres).filter(id => !lideres[id].superior && lideres[id].rol === 'LD');
    
    console.log("🏢 ESTRUCTURA JERÁRQUICA COMPLETA:");
    console.log(`📊 Total de líderes: ${Object.keys(lideres).length}`);
    console.log(`👑 LDs (Líderes de Discipulado): ${lds.length}`);
    
    lds.forEach(ldId => {
      const ld = lideres[ldId];
      console.log(`\n👑 ${ldId} - ${ld.nombre} (${ld.estado})`);
      
      const subordinados = jerarquia[ldId] || [];
      console.log(`   📊 Subordinados directos: ${subordinados.length}`);
      
      subordinados.forEach(lcfId => {
        const lcf = lideres[lcfId];
        if (lcf) {
          console.log(`   👥 ${lcfId} - ${lcf.nombre} (${lcf.rol}, ${lcf.estado})`);
          
          // Buscar células de este LCF
          const celulasLcf = buscarCelulasDeLCF(lcfId);
          console.log(`      🏠 Células: ${celulasLcf.length}`);
        }
      });
    });
    
    // Estadísticas por rol
    console.log("\n📈 ESTADÍSTICAS POR ROL:");
    const roles = {};
    Object.values(lideres).forEach(lider => {
      const rol = lider.rol;
      if (!roles[rol]) {
        roles[rol] = { total: 0, activos: 0, inactivos: 0 };
      }
      roles[rol].total++;
      if (lider.estado === 'Activo' || lider.estado === 'Activa') {
        roles[rol].activos++;
      } else {
        roles[rol].inactivos++;
      }
    });
    
    Object.keys(roles).forEach(rol => {
      const stats = roles[rol];
      console.log(`  ${rol}: ${stats.total} total (${stats.activos} activos, ${stats.inactivos} inactivos)`);
    });
    
    return {
      lideres: lideres,
      jerarquia: jerarquia,
      lds: lds,
      roles: roles
    };
    
  } catch (error) {
    console.error("❌ Error mapeando jerarquía:", error);
    return null;
  }
}

/**
 * Función auxiliar para buscar células de un LCF
 */
function buscarCelulasDeLCF(lcfId) {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    const sheetCelulas = spreadsheet.getSheetByName(CONFIG.TABS.CELULAS);
    
    if (!sheetCelulas) return [];
    
    const data = sheetCelulas.getRange(2, 1, sheetCelulas.getLastRow() - 1, 10).getValues();
    return data.filter(row => row[2] === lcfId); // Columna C = ID_LCF_Responsable
  } catch (error) {
    return [];
  }
}

/**
 * Función principal para analizar toda la estructura
 */
function analizarEstructuraCompleta() {
  console.log("🔍 INICIANDO ANÁLISIS COMPLETO DE ESTRUCTURA");
  console.log("📊 ID de Spreadsheet:", CONFIG.SHEETS.DIRECTORIO);
  console.log("📋 Pestañas configuradas:", CONFIG.TABS);
  
  const resultado = {
    ubicacion: analizarUbicacionHojas(),
    jerarquia: mapearJerarquiaCompleta(),
    lideres: analizarEstructuraLideres(),
    celulas: analizarEstructuraCelulas(),
    ingresos: analizarEstructuraIngresos(),
    seguimiento: analizarEstructuraSeguimiento(),
    resumen: analizarEstructuraResumen()
  };
  
  console.log("\n🎯 RESUMEN DEL ANÁLISIS:");
  console.log("✅ Análisis completado");
  
  return resultado;
}

console.log('🔍 AnalizarEstructuraLideres cargado - Ejecuta analizarEstructuraCompleta() para ver toda la estructura');
