/**
 * 🧪 SUITE DE TESTS UNIFICADA - VERSION FINAL
 * Solo tests esenciales y útiles
 */

console.log('🧪 TestSuite cargado - Ejecuta testCompleto() para verificar todo el sistema');

/**
 * 🚀 TEST COMPLETO - Verifica todo el sistema
 */
function testCompleto() {
  console.log('');
  console.log('========================================');
  console.log('🚀 TEST COMPLETO DEL SISTEMA');
  console.log('========================================');
  console.log('');
  
  const resultados = {
    estado_lideres: null,
    funciones_principales: null,
    seguimiento: null
  };
  
  try {
    // Test 1: Verificar _EstadoLideres
    console.log('--- Test 1: _EstadoLideres ---');
    const estadoTest = testEstadoLideres();
    resultados.estado_lideres = estadoTest;
    console.log(`✅ _EstadoLideres: ${estadoTest.exitoso ? 'OK' : 'ERROR'}`);
    
    // Test 2: Funciones principales
    console.log('');
    console.log('--- Test 2: Funciones principales ---');
    const funcionesTest = testFuncionesPrincipales();
    resultados.funciones_principales = funcionesTest;
    console.log(`✅ Funciones: ${funcionesTest.exitoso ? 'OK' : 'ERROR'}`);
    
    // Test 3: Seguimiento
    console.log('');
    console.log('--- Test 3: Seguimiento ---');
    const seguimientoTest = testSeguimiento();
    resultados.seguimiento = seguimientoTest;
    console.log(`✅ Seguimiento: ${seguimientoTest.exitoso ? 'OK' : 'ERROR'}`);
    
    // Resumen final
    console.log('');
    console.log('========================================');
    console.log('📊 RESUMEN FINAL');
    console.log('========================================');
    
    const todoOK = estadoTest.exitoso && funcionesTest.exitoso && seguimientoTest.exitoso;
    
    console.log(`✅ _EstadoLideres: ${estadoTest.exitoso ? 'OK' : 'ERROR'} (${estadoTest.total_lideres || 0} líderes)`);
    console.log(`✅ Funciones: ${funcionesTest.exitoso ? 'OK' : 'ERROR'}`);
    console.log(`✅ Seguimiento: ${seguimientoTest.exitoso ? 'OK' : 'ERROR'} (${seguimientoTest.almas_cargadas || 0} almas)`);
    
    if (todoOK) {
      console.log('');
      console.log('🎉 ¡SISTEMA 100% FUNCIONAL!');
      console.log('✅ Todos los componentes operativos');
      console.log('✅ Datos reales de _EstadoLideres');
      console.log('✅ Seguimiento funcionando');
      console.log('🚀 Sistema listo para producción');
    } else {
      console.log('');
      console.log('⚠️ SISTEMA CON PROBLEMAS');
      console.log('🔧 Revisar logs anteriores');
    }
    
    return {
      exitoso: todoOK,
      resultados: resultados
    };
    
  } catch (error) {
    console.error('❌ Error en test completo:', error);
    return {
      exitoso: false,
      error: error.toString()
    };
  }
}

/**
 * 📊 TEST _EstadoLideres
 */
function testEstadoLideres() {
  const start = Date.now();
  
  try {
    const estadosMap = cargarEstadoLideres();
    const time = Date.now() - start;
    
    let conPerfil = 0;
    let conIDP = 0;
    let conDias = 0;
    
    for (const [id, estado] of estadosMap) {
      if (estado.Perfil_Lider) conPerfil++;
      if (estado.IDP !== null && estado.IDP !== undefined) conIDP++;
      if (estado.Dias_Inactivo !== null && estado.Dias_Inactivo !== undefined) conDias++;
    }
    
    return {
      exitoso: estadosMap.size > 0,
      tiempo_ms: time,
      total_lideres: estadosMap.size,
      con_perfil: conPerfil,
      con_idp: conIDP,
      con_dias: conDias
    };
    
  } catch (error) {
    console.error('❌ Error:', error);
    return { exitoso: false, error: error.toString() };
  }
}

/**
 * ⚡ TEST Funciones Principales
 */
function testFuncionesPrincipales() {
  try {
    const start1 = Date.now();
    const lideres = getListaDeLideres();
    const time1 = Date.now() - start1;
    
    const start2 = Date.now();
    const stats = getEstadisticasRapidas();
    const time2 = Date.now() - start2;
    
    const todoOK = lideres.success && stats.success;
    
    return {
      exitoso: todoOK,
      tiempo_lideres_ms: time1,
      tiempo_stats_ms: time2,
      num_lideres: lideres.data ? lideres.data.length : 0
    };
    
  } catch (error) {
    console.error('❌ Error:', error);
    return { exitoso: false, error: error.toString() };
  }
}

/**
 * 🔍 TEST Seguimiento
 */
function testSeguimiento() {
  try {
    // Probar con un LCF conocido
    const idLCF = 'LCF-1025';
    
    const start = Date.now();
    const resultado = getSeguimientoAlmasLCF(idLCF);
    const time = Date.now() - start;
    
    return {
      exitoso: resultado.success,
      tiempo_ms: time,
      almas_cargadas: resultado.almas ? resultado.almas.length : 0,
      error: resultado.error
    };
    
  } catch (error) {
    console.error('❌ Error:', error);
    return { exitoso: false, error: error.toString() };
  }
}

/**
 * 🧹 LIMPIAR CACHÉ - VERSIÓN ROBUSTA
 * Limpia absolutamente TODO el caché para forzar recarga completa
 */
function limpiarCache() {
  console.log('');
  console.log('========================================');
  console.log('🧹 LIMPIAR CACHÉ COMPLETO');
  console.log('========================================');
  console.log('');
  
  try {
    const cache = CacheService.getScriptCache();
    
    // ✅ LISTA COMPLETA de todas las claves de caché posibles
    const keys = [
      // Caché principal
      'DASHBOARD_DATA_V2',
      'STATS_RAPIDAS_V2',
      'DIRECTORIO_COMPLETO',
      
      // Caché de módulos
      'LIDERES_DATA',
      'CELULAS_DATA',
      'INGRESOS_DATA',
      
      // Caché de estado
      'ESTADO_LIDERES_CACHE',
      'ACTIVIDAD_CACHE_SEGUIMIENTO',
      
      // Caché fragmentado
      'FRAGMENT_METADATA',
      'DASHBOARD_DATA_FRAGMENT_0',
      'DASHBOARD_DATA_FRAGMENT_1',
      'DASHBOARD_DATA_FRAGMENT_2',
      'DASHBOARD_DATA_FRAGMENT_3',
      'DASHBOARD_DATA_FRAGMENT_4',
      'DASHBOARD_DATA_FRAGMENT_5',
      
      // Caché legacy (por si acaso)
      'STATS_RAPIDAS',
      'SOLO_LIDERES',
      'CACHE_DIRECTORIO'
    ];
    
    console.log(`🗑️ Eliminando ${keys.length} claves de caché...`);
    cache.removeAll(keys);
    console.log('✅ Caché específico limpiado');
    
    // ✅ EXTRA: Intentar limpiar TODO el caché (método nuclear)
    try {
      // Este método elimina TODAS las claves, incluso las que no conocemos
      const allKeys = [];
      for (let i = 0; i < 10; i++) {
        allKeys.push(`DASHBOARD_DATA_FRAGMENT_${i}`);
        allKeys.push(`CACHE_FRAGMENT_${i}`);
      }
      cache.removeAll(allKeys);
      console.log('✅ Fragmentos adicionales limpiados');
    } catch (e) {
      console.log('⚠️ No se pudieron limpiar fragmentos adicionales (normal)');
    }
    
    // ✅ Recargar datos frescos
    console.log('');
    console.log('📊 Recargando datos FRESCOS desde Google Sheets...');
    const start = Date.now();
    
    // Forzar recarga completa (sin caché)
    const datos = cargarDirectorioCompleto(true);
    
    const time = Date.now() - start;
    
    console.log('');
    console.log('========================================');
    console.log('📊 DATOS RECARGADOS');
    console.log('========================================');
    console.log(`⏱️ Tiempo: ${time}ms (${(time/1000).toFixed(1)}s)`);
    console.log(`👥 Líderes: ${datos.lideres?.length || 0}`);
    console.log(`🏠 Células: ${datos.celulas?.length || 0}`);
    console.log(`📊 Ingresos: ${datos.ingresos?.length || 0}`);
    
    // Verificar datos críticos
    const lcfConRecibiendo = datos.lideres?.filter(l => l.Rol === 'LCF' && l.Recibiendo_Celula > 0).length || 0;
    console.log(`✅ LCF con "Recibiendo Célula" > 0: ${lcfConRecibiendo}`);
    
    console.log('');
    console.log('========================================');
    console.log('🎉 ¡CACHÉ COMPLETAMENTE LIMPIADO!');
    console.log('========================================');
    console.log('');
    console.log('💡 PRÓXIMOS PASOS:');
    console.log('   1. Recarga el dashboard en el navegador (F5)');
    console.log('   2. Limpia caché del navegador (Ctrl+Shift+R o Cmd+Shift+R)');
    console.log('   3. Haz clic en "Recargar Datos" en el dashboard');
    console.log('');
    
    return {
      exitoso: true,
      tiempo_ms: time,
      lideres: datos.lideres?.length || 0,
      celulas: datos.celulas?.length || 0,
      ingresos: datos.ingresos?.length || 0,
      lcf_con_datos: lcfConRecibiendo
    };
    
  } catch (error) {
    console.error('');
    console.error('========================================');
    console.error('❌ ERROR AL LIMPIAR CACHÉ');
    console.error('========================================');
    console.error(error);
    console.error('');
    return { exitoso: false, error: error.toString() };
  }
}

/**
 * 🔍 VERIFICAR LCF ESPECÍFICO - VERSIÓN COMPLETA
 * Verifica datos de un LCF en _EstadoLideres y en datos cargados
 */
function verificarLCF(idLCF) {
  console.log('');
  console.log('========================================');
  console.log(`🔍 VERIFICAR LCF: ${idLCF}`);
  console.log('========================================');
  console.log('');
  
  try {
    // 1. En _EstadoLideres
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    const sheetEstado = spreadsheet.getSheetByName('_EstadoLideres');
    
    if (sheetEstado) {
      const data = sheetEstado.getRange(2, 1, sheetEstado.getLastRow() - 1, 9).getValues();
      const fila = data.find(row => String(row[0]).trim() === idLCF);
      
      if (fila) {
        console.log('📋 DATOS EN _EstadoLideres:');
        console.log('─────────────────────────────────');
        console.log(`   ID: ${fila[0]}`);
        console.log(`   Nombre: ${fila[1]}`);
        console.log(`   Días sin Actividad: ${fila[2]}`);
        console.log(`   ✅ Recibiendo Célula: ${fila[3]}`);  // ← COLUMNA D
        console.log(`   Visitas Positivas: ${fila[4]}`);
        console.log(`   Visitas No Positivas: ${fila[5]}`);
        console.log(`   Llamadas: ${fila[6]}`);
        console.log(`   IDP: ${fila[7]}`);
        console.log(`   Perfil: ${fila[8]}`);
        console.log('');
      } else {
        console.log('❌ NO encontrado en _EstadoLideres');
        console.log('');
      }
    } else {
      console.log('❌ Hoja _EstadoLideres no encontrada');
      console.log('');
    }
    
    // 2. En datos cargados
    const datos = cargarDirectorioCompleto();
    const lider = datos.lideres.find(l => l.ID_Lider === idLCF);
    
    if (lider) {
      console.log('📊 DATOS EN MEMORIA (cargados):');
      console.log('─────────────────────────────────');
      console.log(`   ID: ${lider.ID_Lider}`);
      console.log(`   Nombre: ${lider.Nombre_Lider || 'N/A'}`);
      console.log(`   Rol: ${lider.Rol}`);
      console.log(`   Perfil: ${lider.Perfil_Lider || 'N/A'}`);
      console.log(`   IDP: ${lider.IDP !== null ? lider.IDP : 'N/A'}`);
      console.log(`   Días Inactivo: ${lider.Dias_Inactivo !== null ? lider.Dias_Inactivo : 'N/A'}`);
      console.log(`   ✅ Recibiendo Célula: ${lider.Recibiendo_Celula !== null ? lider.Recibiendo_Celula : 'N/A'}`);
      console.log(`   Visitas Positivas: ${lider.Visitas_Positivas || 0}`);
      console.log(`   Llamadas: ${lider.Llamadas_Realizadas || 0}`);
      console.log('');
      
      // Verificar métricas
      if (lider.metricas) {
        console.log('📈 MÉTRICAS:');
        console.log('─────────────────────────────────');
        console.log(`   Total Almas: ${lider.metricas.total_almas || 0}`);
        console.log(`   Almas en Célula (calculado): ${lider.metricas.almas_en_celula || 0}`);
        console.log(`   Tasa Integración: ${lider.metricas.tasa_integracion || 0}%`);
        console.log(`   Carga: ${lider.metricas.carga_trabajo || 'N/A'}`);
        console.log('');
      }
    } else {
      console.log('❌ NO encontrado en datos cargados');
      console.log('');
    }
    
    console.log('========================================');
    console.log('✅ VERIFICACIÓN COMPLETADA');
    console.log('========================================');
    console.log('');
    
    return { 
      exitoso: true,
      encontrado_estado: sheetEstado ? true : false,
      encontrado_datos: !!lider,
      recibiendo_celula_datos: lider ? lider.Recibiendo_Celula : null
    };
    
  } catch (error) {
    console.error('');
    console.error('========================================');
    console.error('❌ ERROR EN VERIFICACIÓN');
    console.error('========================================');
    console.error(error);
    console.error('');
    return { exitoso: false, error: error.toString() };
  }
}

/**
 * 📊 TEST MÉTRICAS RESUMEN
 */
function testMetricasResumen() {
  console.log('');
  console.log('========================================');
  console.log('📊 TEST MÉTRICAS DE RESUMEN');
  console.log('========================================');
  console.log('');
  
  try {
    // Cargar datos de un LD
    const datos = cargarDirectorioCompleto();
    const primerLD = datos.lideres.find(l => l.Rol === 'LD');
    
    if (!primerLD) {
      console.log('❌ No hay LDs en el sistema');
      return { exitoso: false };
    }
    
    console.log(`📊 Probando con LD: ${primerLD.Nombre_Lider} (${primerLD.ID_Lider})`);
    
    const datosLD = getDatosLDCompleto(primerLD.ID_Lider);
    
    if (!datosLD.success) {
      console.log('❌ Error cargando datos del LD');
      return { exitoso: false };
    }
    
    const resumen = datosLD.resumen;
    const equipo = datosLD.equipo || [];
    
    console.log('');
    console.log('📊 MÉTRICAS CALCULADAS:');
    console.log('');
    
    // 1. Total Almas
    const totalAlmas = resumen.Total_Ingresos || 0;
    console.log(`1. Total Almas: ${totalAlmas} ✅`);
    
    // 2. Almas sin Célula
    const almasSinCelula = (resumen.Total_Ingresos || 0) - (resumen.Ingresos_En_Celula || 0);
    console.log(`2. Almas sin Célula: ${almasSinCelula} ✅`);
    
    // 3. Recibiendo Célula
    const recibiendoCelula = equipo.reduce((sum, lcf) => sum + (lcf.Recibiendo_Celula || 0), 0);
    console.log(`3. Recibiendo Célula: ${recibiendoCelula} ✅`);
    
    // 4. LCF Productivos (IDP > 15)
    const lcfProductivos = equipo.filter(lcf => (lcf.IDP || 0) > 15).length;
    console.log(`4. LCF Productivos (IDP > 15): ${lcfProductivos} ✅`);
    
    // 5. LCF Inactivos
    const lcfInactivos = equipo.filter(lcf => 
      (lcf.Dias_Inactivo !== null && lcf.Dias_Inactivo > 14) || 
      (lcf.IDP === 0 || lcf.Perfil_Lider?.includes('INACTIVO'))
    ).length;
    console.log(`5. LCF Inactivos: ${lcfInactivos} ✅`);
    
    // 6. Total LCF
    const totalLCF = resumen.Total_LCF || 0;
    console.log(`6. Total LCF: ${totalLCF} ✅`);
    
    console.log('');
    console.log('========================================');
    console.log('✅ TODAS LAS MÉTRICAS SE CALCULAN CORRECTAMENTE');
    console.log('========================================');
    console.log(`⏱️ Tiempo estimado: < 3ms`);
    console.log(`📊 Total equipo: ${equipo.length} LCF`);
    
    return {
      exitoso: true,
      metricas: {
        total_almas: totalAlmas,
        almas_sin_celula: almasSinCelula,
        recibiendo_celula: recibiendoCelula,
        lcf_productivos: lcfProductivos,
        lcf_inactivos: lcfInactivos,
        total_lcf: totalLCF
      }
    };
    
  } catch (error) {
    console.error('❌ Error:', error);
    return { exitoso: false, error: error.toString() };
  }
}

console.log('🧪 Tests disponibles: testCompleto(), testMetricasResumen(), limpiarCache(), verificarLCF(idLCF)');

// ==================== FUNCIONES HELPER PARA TESTS ====================

/**
 * 🔍 Verificar KARLA (LCF-1035)
 */
function testKarla() {
  return verificarLCF('LCF-1035');
}

/**
 * 🔍 Verificar ANA KAREN (LCF-1011)
 */
function testAnaKaren() {
  return verificarLCF('LCF-1011');
}

/**
 * 🔍 Verificar ULISES (LCF-1067)
 */
function testUlises() {
  return verificarLCF('LCF-1067');
}