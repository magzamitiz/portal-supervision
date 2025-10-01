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
 * 🧹 LIMPIAR CACHÉ
 */
function limpiarCache() {
  console.log('');
  console.log('========================================');
  console.log('🧹 LIMPIAR CACHÉ');
  console.log('========================================');
  console.log('');
  
  try {
    const cache = CacheService.getScriptCache();
    const keys = [
      'DASHBOARD_DATA_V2',
      'STATS_RAPIDAS_V2',
      'LIDERES_DATA',
      'CELULAS_DATA',
      'INGRESOS_DATA',
      'ESTADO_LIDERES_CACHE',
      'ACTIVIDAD_CACHE_SEGUIMIENTO'
    ];
    
    cache.removeAll(keys);
    console.log('✅ Caché limpiado');
    
    // Recargar
    console.log('');
    console.log('📊 Recargando datos...');
    const start = Date.now();
    const datos = cargarDirectorioCompleto(true);
    const time = Date.now() - start;
    
    console.log(`✅ Datos recargados en ${time}ms`);
    console.log(`📊 Líderes: ${datos.lideres.length}`);
    console.log(`📊 Células: ${datos.celulas.length}`);
    console.log(`📊 Ingresos: ${datos.ingresos.length}`);
    
    console.log('');
    console.log('🎉 ¡Caché limpiado y datos recargados!');
    console.log('💡 Ahora recarga el dashboard');
    
    return {
      exitoso: true,
      tiempo_ms: time
    };
    
  } catch (error) {
    console.error('❌ Error:', error);
    return { exitoso: false, error: error.toString() };
  }
}

/**
 * 🔍 VERIFICAR LCF ESPECÍFICO
 */
function verificarLCF(idLCF) {
  console.log('');
  console.log(`🔍 Verificando: ${idLCF}`);
  console.log('');
  
  try {
    // 1. En _EstadoLideres
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    const sheetEstado = spreadsheet.getSheetByName('_EstadoLideres');
    
    if (sheetEstado) {
      const data = sheetEstado.getRange(2, 1, sheetEstado.getLastRow() - 1, 9).getValues();
      const fila = data.find(row => String(row[0]).trim() === idLCF);
      
      if (fila) {
        console.log('✅ En _EstadoLideres:');
        console.log(`   Perfil: ${fila[8]}`);
        console.log(`   IDP: ${fila[7]}`);
        console.log(`   Días: ${fila[2]}`);
      } else {
        console.log('❌ NO en _EstadoLideres');
      }
    }
    
    // 2. En datos cargados
    const datos = cargarDirectorioCompleto();
    const lider = datos.lideres.find(l => l.ID_Lider === idLCF);
    
    if (lider) {
      console.log('');
      console.log('✅ En datos cargados:');
      console.log(`   Perfil: ${lider.Perfil_Lider || 'N/A'}`);
      console.log(`   IDP: ${lider.IDP !== null ? lider.IDP : 'N/A'}`);
      console.log(`   Días: ${lider.Dias_Inactivo !== null ? lider.Dias_Inactivo : 'N/A'}`);
    } else {
      console.log('❌ NO en datos cargados');
    }
    
    return { exitoso: true };
    
  } catch (error) {
    console.error('❌ Error:', error);
    return { exitoso: false, error: error.toString() };
  }
}

console.log('🧪 Tests disponibles: testCompleto(), limpiarCache(), verificarLCF(idLCF)');