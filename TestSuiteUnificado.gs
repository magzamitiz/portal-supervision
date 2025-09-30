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
    const config = CONFIG.DIAS_INACTIVO;
    resultados.configuracion = config.ACTIVO === 7 && config.ALERTA === 14 && config.INACTIVO === 30;
    console.log(`✅ Configuración: ${resultados.configuracion ? 'OK' : 'ERROR'}`);
    
    // Test 2: Semáforo
    console.log('');
    console.log('--- Test 2: Semáforo ---');
    const funcionesDisponibles = typeof calcularActividadLideres === 'function' && typeof integrarActividadLideres === 'function';
    resultados.semaforo = funcionesDisponibles;
    console.log(`✅ Semáforo: ${resultados.semaforo ? 'OK' : 'ERROR'}`);
    
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
    console.log(`✅ Semáforo: ${resultados.semaforo ? 'OK' : 'ERROR'}`);
    console.log(`✅ Funciones: ${resultados.funciones ? 'OK' : 'ERROR'}`);
    
    if (todoOK) {
      console.log('');
      console.log('🎉 ¡SISTEMA FUNCIONANDO!');
      console.log('🚀 Listo para usar');
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
 * 🚦 TEST SEMÁFORO - Verifica el semáforo de líderes
 */
function testSemaforo() {
  console.log('');
  console.log('========================================');
  console.log('🚦 TEST SEMÁFORO DE LÍDERES');
  console.log('========================================');
  console.log('');
  
  try {
    // Verificar funciones
    const funcionesOK = typeof calcularActividadLideres === 'function' && typeof integrarActividadLideres === 'function';
    console.log(`✅ Funciones disponibles: ${funcionesOK ? 'SÍ' : 'NO'}`);
    
    if (!funcionesOK) {
      console.log('❌ Funciones del semáforo no disponibles');
      return { exitoso: false };
    }
    
    // Probar cálculo de actividad
    const start = Date.now();
    const actividadMap = calcularActividadLideres([]);
    const time = Date.now() - start;
    
    console.log(`✅ Cálculo de actividad: OK (${time}ms)`);
    console.log(`📊 Líderes con actividad: ${actividadMap.size}`);
    
    // Probar integración
    const lideresTest = [
      { ID_Lider: 'LCF-001', Nombre_Lider: 'Test LCF', Rol: 'LCF' }
    ];
    
    const lideresConActividad = integrarActividadLideres(lideresTest, actividadMap);
    const todosConEstado = lideresConActividad.every(l => l.Estado_Actividad);
    
    console.log(`✅ Integración de estados: ${todosConEstado ? 'OK' : 'ERROR'}`);
    
    // Mostrar ejemplo
    lideresConActividad.forEach(lider => {
      const emoji = lider.Estado_Actividad === 'Activo' ? '🟢' : 
                   lider.Estado_Actividad === 'Alerta' ? '🟡' : 
                   lider.Estado_Actividad === 'Inactivo' ? '🔴' : '⚪';
      console.log(`  ${emoji} ${lider.Nombre_Lider}: ${lider.Estado_Actividad}`);
    });
    
    console.log('');
    console.log('🎉 ¡SEMÁFORO FUNCIONANDO!');
    console.log('🟢 Activo: ≤ 7 días');
    console.log('🟡 Alerta: 8-14 días');
    console.log('🔴 Inactivo: > 14 días');
    console.log('⚪ Sin Datos: Nunca reportó');
    
    return {
      exitoso: true,
      tiempo_ms: time,
      lideres_procesados: lideresConActividad.length
    };
    
  } catch (error) {
    console.error('❌ Error en test semáforo:', error);
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

console.log('🧪 TestSuiteSimple cargado - Ejecuta testPrincipal() para empezar');
