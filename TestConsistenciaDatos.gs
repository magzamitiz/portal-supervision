/**
 * @fileoverview Función de test para verificar consistencia de datos después de correcciones
 * @description Verifica que los datos entre diferentes fuentes sean consistentes
 */

/**
 * Test completo de consistencia de datos para LD-4003
 * Verifica que los cambios en DataModule y GraficosDashboardModule funcionen correctamente
 * @returns {Object} Resultado del test con estadísticas
 */
function testConsistenciaDatos() {
  console.log('=== TEST DE CONSISTENCIA DE DATOS ===\n');
  
  // 1. Limpiar caché
  clearCache();
  console.log('✅ Caché limpiado');
  
  // 2. Cargar datos frescos
  const data = cargarDirectorioCompleto(true);
  console.log(`✅ Datos cargados: ${data.lideres.length} líderes, ${data.celulas.length} células, ${data.ingresos.length} ingresos`);
  
  // 3. Verificar LD-4003
  const testLD = 'LD-4003';
  const resultado = getDatosLD(testLD, true);
  
  if (!resultado.success) {
    console.error('❌ Error obteniendo datos del LD:', resultado.error);
    return {
      exito: false,
      error: resultado.error
    };
  }
  
  // 4. Verificar totales
  console.log(`\n=== RESULTADOS PARA ${testLD} ===`);
  console.log(`LCF directos: ${resultado.lcf_directos ? resultado.lcf_directos.length : 0}`);
  console.log(`Total personas (equipo): ${resultado.equipo ? resultado.equipo.length : 0}`);
  
  // Contar personas en célula
  let personasEnCelula = 0;
  if (resultado.equipo) {
    personasEnCelula = resultado.equipo.filter(p => p.En_Celula).length;
  }
  console.log(`Personas en célula: ${personasEnCelula}`);
  
  // 5. Verificar cada LCF
  if (resultado.lcf_directos) {
    console.log('\n=== LCF DIRECTOS ===');
    resultado.lcf_directos.forEach(lcf => {
      console.log(`\n  ${lcf.ID_Lider} - ${lcf.Nombre_Lider}:`);
      console.log(`    - Estado: ${lcf.Estado_Actividad}`);
      
      // Contar células de este LCF
      const celulasLCF = data.celulas.filter(c => c.ID_LCF_Responsable === lcf.ID_Lider);
      console.log(`    - Células: ${celulasLCF.length}`);
      
      // Contar miembros de las células
      let miembrosLCF = 0;
      celulasLCF.forEach(cel => {
        miembrosLCF += obtenerTotalMiembros(cel);
      });
      console.log(`    - Miembros en células: ${miembrosLCF}`);
    });
  }
  
  // 6. Actualizar gráficos
  console.log('\n=== ACTUALIZANDO GRÁFICOS ===');
  const resultadoGraficos = poblarDatosGraficos(true);
  console.log(`Resultado: ${resultadoGraficos.success ? '✅ Exitoso' : '❌ Falló'}`);
  if (resultadoGraficos.lcfProcesados) {
    console.log(`LCF procesados: ${resultadoGraficos.lcfProcesados}`);
  }
  
  // 7. Verificar hoja de gráficos
  console.log('\n=== VERIFICANDO HOJA DE GRÁFICOS ===');
  const sheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO).getSheetByName('_GraficosDashboard');
  const datos = sheet.getDataRange().getValues();
  
  let totalPersonasGraficos = 0;
  let lcfEncontrados = 0;
  
  for (let i = 1; i < datos.length; i++) {
    // Buscar LCF de LD-4003 (columna 2 es LD_ID)
    if (datos[i][2] === testLD) {
      lcfEncontrados++;
      const personas = datos[i][10] || 0; // Columna Total_Personas
      totalPersonasGraficos += personas;
      console.log(`  ${datos[i][1]}: ${personas} personas, ${datos[i][5]} células`);
    }
  }
  
  console.log(`\n=== RESUMEN FINAL ===`);
  console.log(`LCF encontrados en gráficos: ${lcfEncontrados}`);
  console.log(`Total personas en gráficos: ${totalPersonasGraficos}`);
  console.log(`Total personas en equipo: ${resultado.equipo ? resultado.equipo.length : 0}`);
  console.log(`Personas en célula (equipo): ${personasEnCelula}`);
  
  // Verificar consistencia
  const consistente = lcfEncontrados === 3; // Esperamos 3 LCF del LD-4003
  
  console.log(`\n=== RESULTADO DEL TEST ===`);
  if (consistente && totalPersonasGraficos > 0) {
    console.log(`✅ TEST EXITOSO`);
    console.log(`   - 3 LCF encontrados: ${lcfEncontrados === 3 ? '✅' : '❌'}`);
    console.log(`   - Datos en gráficos: ${totalPersonasGraficos > 0 ? '✅' : '❌'}`);
  } else {
    console.log(`❌ TEST FALLÓ`);
    console.log(`   - LCF esperados: 3, encontrados: ${lcfEncontrados}`);
    console.log(`   - Personas en gráficos: ${totalPersonasGraficos}`);
  }
  
  return {
    exito: consistente && totalPersonasGraficos > 0,
    lcfEncontrados: lcfEncontrados,
    graficos: totalPersonasGraficos,
    equipo: resultado.equipo ? resultado.equipo.length : 0,
    enCelula: personasEnCelula,
    timestamp: new Date().toISOString()
  };
}

/**
 * Test rápido para verificar solo la carga de células
 * @returns {Object} Resultado del test
 */
function testCargaCelulas() {
  console.log('=== TEST DE CARGA DE CÉLULAS ===\n');
  
  clearCache();
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
  const celulas = cargarCelulasOptimizado(spreadsheet);
  
  console.log(`Células cargadas: ${celulas.length}`);
  
  // Verificar células de LD-4003
  const celulasLD4003 = celulas.filter(c => {
    // Buscar células de LCF-1028, LCF-1029, LCF-1079
    return ['LCF-1028', 'LCF-1029', 'LCF-1079'].includes(c.ID_LCF_Responsable);
  });
  
  console.log(`\nCélulas de LD-4003: ${celulasLD4003.length}`);
  
  let totalMiembros = 0;
  celulasLD4003.forEach(cel => {
    const miembros = obtenerTotalMiembros(cel);
    totalMiembros += miembros;
    console.log(`  ${cel.ID_Celula}: ${miembros} miembros (Total_Miembros: ${cel.Total_Miembros}, Miembros.length: ${cel.Miembros ? cel.Miembros.length : 0})`);
    
    // Mostrar primeros 3 miembros
    if (cel.Miembros && cel.Miembros.length > 0) {
      cel.Miembros.slice(0, 3).forEach(m => {
        console.log(`    - ${m.Nombre_Miembro} (${m.ID_Miembro})`);
      });
      if (cel.Miembros.length > 3) {
        console.log(`    ... y ${cel.Miembros.length - 3} más`);
      }
    }
  });
  
  console.log(`\nTotal miembros: ${totalMiembros}`);
  
  return {
    exito: totalMiembros > 0,
    celulas: celulasLD4003.length,
    miembros: totalMiembros
  };
}

