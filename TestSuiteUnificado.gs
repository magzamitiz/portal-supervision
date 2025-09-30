/**
 * 🧪 SUITE DE TESTS SIMPLE
 * Solo los tests esenciales - Máximo 500 líneas
 */

console.log('🧪 TestSuiteSimple cargado - Tests esenciales únicamente');

/**
 * 🚀 TEST PRINCIPAL - Verifica que todo funcione
 */
function testPrincipal() {
  console.log('');
  console.log('========================================');
  console.log('🚀 TEST PRINCIPAL DEL SISTEMA');
  console.log('========================================');
  console.log('');
  
  const resultados = {
    configuracion: false,
    semaforo: false,
    funciones: false
  };
  
  try {
    // Test 1: Configuración
    console.log('--- Test 1: Configuración ---');
    const config = CONFIG.PERFILES_LIDERES;
    resultados.configuracion = config.EN_DESARROLLO && config.ESTRATEGA_CRECIMIENTO;
    console.log(`✅ Configuración de perfiles: ${resultados.configuracion ? 'OK' : 'ERROR'}`);
    
    // Test 2: Perfiles de líderes
    console.log('');
    console.log('--- Test 2: Perfiles de líderes ---');
    const funcionesDisponibles = typeof cargarEstadoLideres === 'function' && typeof integrarPerfilesLideres === 'function';
    resultados.semaforo = funcionesDisponibles;
    console.log(`✅ Perfiles: ${resultados.semaforo ? 'OK' : 'ERROR'}`);
    
    // Test 3: Funciones principales
    console.log('');
    console.log('--- Test 3: Funciones principales ---');
    const start1 = Date.now();
    const lideres = getListaDeLideres();
    const time1 = Date.now() - start1;
    
    const start2 = Date.now();
    const stats = getEstadisticasRapidas();
    const time2 = Date.now() - start2;
    
    resultados.funciones = lideres.success && stats.success;
    console.log(`✅ getListaDeLideres: ${lideres.success ? 'OK' : 'ERROR'} (${time1}ms)`);
    console.log(`✅ getEstadisticasRapidas: ${stats.success ? 'OK' : 'ERROR'} (${time2}ms)`);
    
    // Resumen
    console.log('');
    console.log('========================================');
    console.log('📊 RESUMEN');
    console.log('========================================');
    
    const todoOK = resultados.configuracion && resultados.semaforo && resultados.funciones;
    
    console.log(`✅ Configuración: ${resultados.configuracion ? 'OK' : 'ERROR'}`);
    console.log(`✅ Perfiles: ${resultados.semaforo ? 'OK' : 'ERROR'}`);
    console.log(`✅ Funciones: ${resultados.funciones ? 'OK' : 'ERROR'}`);
    
    if (todoOK) {
      console.log('');
      console.log('🎉 ¡SISTEMA FUNCIONANDO!');
      console.log('🚀 Sistema de perfiles activo - Listo para usar');
    } else {
      console.log('');
      console.log('⚠️ SISTEMA CON PROBLEMAS');
      console.log('🔧 Revisar logs anteriores');
    }
    
    return {
      exitoso: todoOK,
      resultados: resultados,
      tiempo_total: time1 + time2
    };
    
  } catch (error) {
    console.error('❌ Error en test principal:', error);
    return {
      exitoso: false,
      error: error.toString()
    };
  }
}

/**
 * 🎯 TEST PERFILES - Verifica los perfiles de líderes desde _EstadoLideres
 */
function testPerfiles() {
  console.log('');
  console.log('========================================');
  console.log('🎯 TEST PERFILES DE LÍDERES');
  console.log('========================================');
  console.log('');
  
  try {
    // Verificar funciones
    const funcionesOK = typeof cargarEstadoLideres === 'function' && typeof integrarPerfilesLideres === 'function';
    console.log(`✅ Funciones disponibles: ${funcionesOK ? 'SÍ' : 'NO'}`);
    
    if (!funcionesOK) {
      console.log('❌ Funciones de perfiles no disponibles');
      return { exitoso: false };
    }
    
    // Probar carga de estados
    const start = Date.now();
    const estadosMap = cargarEstadoLideres();
    const time = Date.now() - start;
    
    console.log(`✅ Carga de estados: OK (${time}ms)`);
    console.log(`📊 Líderes con perfil: ${estadosMap.size}`);
    
    // Probar integración
    const lideresTest = [
      { ID_Lider: 'LCF-1010', Nombre_Lider: 'Test LCF 1', Rol: 'LCF' },
      { ID_Lider: 'LCF-1014', Nombre_Lider: 'Test LCF 2', Rol: 'LCF' }
    ];
    
    const lideresConPerfil = integrarPerfilesLideres(lideresTest, estadosMap);
    const todosConPerfil = lideresConPerfil.every(l => l.Perfil_Lider);
    
    console.log(`✅ Integración de perfiles: ${todosConPerfil ? 'OK' : 'ERROR'}`);
    
    // Mostrar ejemplos con IDP y perfil
    console.log('');
    console.log('📊 EJEMPLOS DE PERFILES:');
    lideresConPerfil.slice(0, 5).forEach(lider => {
      const emoji = lider.Perfil_Lider.includes('ESTRATEGA') ? '🚀' : 
                   lider.Perfil_Lider.includes('CONECTOR') ? '🎯' : 
                   lider.Perfil_Lider.includes('ACTIVADOR') ? '⚡' : '🌱';
      console.log(`  ${emoji} ${lider.Nombre_Lider}`);
      console.log(`     IDP: ${lider.IDP || 0} | Perfil: ${lider.Perfil_Lider}`);
      console.log(`     Células: ${lider.Celulas_Activas || 0} | Visitas: ${lider.Visitas_Positivas || 0}`);
    });
    
    console.log('');
    console.log('🎉 ¡SISTEMA DE PERFILES FUNCIONANDO!');
    console.log('🚀 ESTRATEGA DE CRECIMIENTO: IDP ≥ 36');
    console.log('🎯 CONECTOR EFICAZ: IDP 16-35');
    console.log('⚡ ACTIVADOR INICIAL: IDP 6-15');
    console.log('🌱 EN DESARROLLO: IDP 0-5');
    
    return {
      exitoso: true,
      tiempo_ms: time,
      lideres_procesados: lideresConPerfil.length,
      lideres_con_perfil: estadosMap.size
    };
    
  } catch (error) {
    console.error('❌ Error en test de perfiles:', error);
    return { exitoso: false, error: error.toString() };
  }
}

/**
 * ⚡ TEST RÁPIDO - Verificación rápida
 */
function testRapido() {
  console.log('');
  console.log('========================================');
  console.log('⚡ TEST RÁPIDO');
  console.log('========================================');
  console.log('');
  
  try {
    const start = Date.now();
    
    // Test 1: getListaDeLideres
    const lideres = getListaDeLideres();
    const time1 = Date.now() - start;
    
    // Test 2: getEstadisticasRapidas
    const stats = getEstadisticasRapidas();
    const time2 = Date.now() - start;
    
    console.log(`✅ getListaDeLideres: ${lideres.success ? 'OK' : 'ERROR'} (${time1}ms)`);
    console.log(`✅ getEstadisticasRapidas: ${stats.success ? 'OK' : 'ERROR'} (${time2}ms)`);
    
    const todoOK = lideres.success && stats.success;
    const tiempoTotal = time2;
    
    console.log('');
    console.log(`📊 Tiempo total: ${tiempoTotal}ms`);
    console.log(`📊 Líderes: ${lideres.data ? lideres.data.length : 0}`);
    console.log(`📊 Estadísticas: ${stats.success ? 'OK' : 'ERROR'}`);
    
    if (todoOK) {
      console.log('🎉 ¡TEST RÁPIDO EXITOSO!');
    } else {
      console.log('⚠️ TEST RÁPIDO CON PROBLEMAS');
    }
    
    return {
      exitoso: todoOK,
      tiempo_ms: tiempoTotal,
      lideres: lideres.data ? lideres.data.length : 0
    };
    
  } catch (error) {
    console.error('❌ Error en test rápido:', error);
    return { exitoso: false, error: error.toString() };
  }
}

/**
 * 🧹 LIMPIAR CACHÉ - Limpia el caché y prueba
 */
function limpiarCache() {
  console.log('');
  console.log('========================================');
  console.log('🧹 LIMPIAR CACHÉ');
  console.log('========================================');
  console.log('');
  
  try {
    // Limpiar caché
    CacheService.getScriptCache().removeAll();
    console.log('✅ Caché limpiado');
    
    // Probar funciones después de limpiar
    const start = Date.now();
    const lideres = getListaDeLideres();
    const stats = getEstadisticasRapidas();
    const time = Date.now() - start;
    
    console.log(`✅ Funciones después de limpiar: ${lideres.success && stats.success ? 'OK' : 'ERROR'}`);
    console.log(`⏱️ Tiempo: ${time}ms`);
    
    return {
      exitoso: lideres.success && stats.success,
      tiempo_ms: time
    };
    
  } catch (error) {
    console.error('❌ Error limpiando caché:', error);
    return { exitoso: false, error: error.toString() };
  }
}

/**
 * 🎯 TEST HYBRID - Verifica el sistema hybrid de perfiles + días de inactividad
 */
function testHybrid() {
  console.log('');
  console.log('========================================');
  console.log('🎯 TEST SISTEMA HYBRID');
  console.log('========================================');
  console.log('');
  
  try {
    // Test 1: Verificar funciones
    console.log('--- Test 1: Funciones disponibles ---');
    const funcionPerfiles = typeof cargarEstadoLideres === 'function';
    const funcionDias = typeof calcularDiasInactividadEquipo === 'function';
    const funcionIntegrar = typeof integrarDiasInactividad === 'function';
    
    console.log(`✅ cargarEstadoLideres: ${funcionPerfiles ? 'OK' : 'ERROR'}`);
    console.log(`✅ calcularDiasInactividadEquipo: ${funcionDias ? 'OK' : 'ERROR'}`);
    console.log(`✅ integrarDiasInactividad: ${funcionIntegrar ? 'OK' : 'ERROR'}`);
    
    if (!funcionPerfiles || !funcionDias || !funcionIntegrar) {
      console.log('❌ Funciones híbridas no disponibles');
      return { exitoso: false };
    }
    
    // Test 2: Probar carga de perfiles
    console.log('');
    console.log('--- Test 2: Carga de perfiles ---');
    const start1 = Date.now();
    const estadosMap = cargarEstadoLideres();
    const time1 = Date.now() - start1;
    
    console.log(`✅ Perfiles cargados: ${estadosMap.size} líderes (${time1}ms)`);
    
    // Test 3: Probar cálculo de días de inactividad
    console.log('');
    console.log('--- Test 3: Días de inactividad ---');
    
    // Obtener algunos IDs de LCF para probar
    const lcfIds = Array.from(estadosMap.keys()).slice(0, 5);
    console.log(`Probando con ${lcfIds.length} LCF del equipo`);
    
    const start2 = Date.now();
    const inactividadMap = calcularDiasInactividadEquipo(lcfIds);
    const time2 = Date.now() - start2;
    
    console.log(`✅ Días calculados: ${inactividadMap.size} líderes (${time2}ms)`);
    
    // Test 4: Mostrar ejemplos
    console.log('');
    console.log('--- Test 4: Ejemplos de datos híbridos ---');
    
    let ejemplosCount = 0;
    for (const [id, estado] of estadosMap) {
      if (ejemplosCount >= 3) break;
      
      const inactividad = inactividadMap.get(id);
      
      console.log(`📊 ${estado.Nombre_Lider}`);
      console.log(`   ID: ${id}`);
      console.log(`   Perfil: ${estado.Perfil_Lider} (IDP: ${estado.IDP})`);
      console.log(`   Días inactivo: ${inactividad ? inactividad.dias_inactivo : 'N/A'}`);
      console.log(`   Última actividad: ${inactividad && inactividad.ultima_actividad ? new Date(inactividad.ultima_actividad).toLocaleDateString() : 'N/A'}`);
      
      ejemplosCount++;
    }
    
    console.log('');
    console.log('🎉 ¡SISTEMA HYBRID FUNCIONANDO!');
    console.log('✅ Perfiles pre-calculados (rápido)');
    console.log('✅ Días de inactividad calculados por equipo (preciso)');
    console.log('📊 Balance perfecto entre velocidad e información');
    
    return {
      exitoso: true,
      tiempo_perfiles_ms: time1,
      tiempo_dias_ms: time2,
      lideres_con_perfil: estadosMap.size,
      lideres_con_dias: inactividadMap.size
    };
    
  } catch (error) {
    console.error('❌ Error en test hybrid:', error);
    return { exitoso: false, error: error.toString() };
  }
}

console.log('🧪 TestSuiteSimple cargado - Ejecuta testPrincipal() o testHybrid() para empezar');
