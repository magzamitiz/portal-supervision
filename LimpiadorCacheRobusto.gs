/**
 * LimpiadorCacheRobusto.gs
 * Sistema robusto de limpieza de caché para el Portal de Supervisión
 * Integra todas las funcionalidades de limpieza en un solo módulo
 */

/**
 * Limpiador de caché principal - Función unificada
 * @param {Object} opciones - Opciones de limpieza
 * @param {boolean} opciones.selectorLD - Limpiar caché del selector de LD
 * @param {boolean} opciones.dashboard - Limpiar caché del dashboard
 * @param {boolean} opciones.estadisticas - Limpiar caché de estadísticas
 * @param {boolean} opciones.legacy - Limpiar caché legacy
 * @param {boolean} opciones.todo - Limpiar todo el caché
 * @param {boolean} opciones.verificar - Solo verificar sin limpiar
 * @returns {Object} Resultado de la limpieza
 */
function limpiarCacheRobusto(opciones = {}) {
  console.log('🧹 LIMPIADOR DE CACHÉ ROBUSTO');
  console.log('='.repeat(60));
  
  const resultado = {
    success: true,
    limpiado: [],
    noEncontrado: [],
    errores: [],
    estadisticas: {
      totalLimpiado: 0,
      totalNoEncontrado: 0,
      totalErrores: 0
    }
  };
  
  try {
    const cache = CacheService.getScriptCache();
    
    // Configuración de claves de caché
    const clavesCache = {
      // Caché principal del sistema
      dashboard: 'DASHBOARD_OPTIMIZED_EXISTENTES_V1',
      estadisticas: 'STATS_OPTIMIZED_EXISTENTES_V1',
      lideres: 'LIDERES_OPTIMIZED_EXISTENTES_V1',
      
      // Caché unificado
      unified_dashboard: 'UNIFIED_DASHBOARD_V3',
      unified_stats: 'UNIFIED_STATS_V3',
      unified_lideres: 'UNIFIED_LIDERES_V3',
      
      // Caché legacy (claves antiguas)
      legacy: [
        'DASHBOARD_DATA_CACHE',
        'ESTADISTICAS_CACHE',
        'LIDERES_CACHE',
        'DASHBOARD_CONSOLIDATED',
        'STATS_RAPIDAS',
        'LIDERES_LISTA',
        'CACHE_DASHBOARD',
        'CACHE_STATS',
        'CACHE_LIDERES'
      ],
      
      // Caché de métricas y rendimiento
      metricas: [
        'PERFORMANCE_METRICS',
        'CACHE_PERFORMANCE',
        'RENDIMIENTO_DASHBOARD'
      ],
      
      // Caché de validación
      validacion: [
        'VALIDATION_CACHE',
        'TEST_RESULTS',
        'INTEGRITY_CHECK'
      ]
    };
    
    // Determinar qué limpiar
    const limpiarTodo = opciones.todo || false;
    const soloVerificar = opciones.verificar || false;
    
    console.log(`📋 Modo: ${soloVerificar ? 'VERIFICACIÓN' : 'LIMPIEZA'}`);
    console.log(`🎯 Alcance: ${limpiarTodo ? 'TODO EL CACHÉ' : 'SELECTIVO'}`);
    
    // Función para limpiar una clave específica
    function limpiarClave(clave, categoria = 'general') {
      try {
        const valor = cache.get(clave);
        if (valor) {
          if (!soloVerificar) {
            const removido = cache.remove(clave);
            if (removido) {
              resultado.limpiado.push({ clave, categoria, tamaño: valor.length });
              resultado.estadisticas.totalLimpiado++;
              console.log(`✅ ${categoria}: ${clave} (${Math.round(valor.length/1024)}KB)`);
            } else {
              resultado.errores.push({ clave, categoria, error: 'No se pudo remover' });
              resultado.estadisticas.totalErrores++;
              console.log(`❌ ${categoria}: ${clave} - Error al remover`);
            }
          } else {
            resultado.limpiado.push({ clave, categoria, tamaño: valor.length, soloVerificacion: true });
            console.log(`🔍 ${categoria}: ${clave} (${Math.round(valor.length/1024)}KB) - Solo verificación`);
          }
        } else {
          resultado.noEncontrado.push({ clave, categoria });
          resultado.estadisticas.totalNoEncontrado++;
          console.log(`⚠️ ${categoria}: ${clave} - No encontrado`);
        }
      } catch (error) {
        resultado.errores.push({ clave, categoria, error: error.toString() });
        resultado.estadisticas.totalErrores++;
        console.log(`❌ ${categoria}: ${clave} - Error: ${error.toString()}`);
      }
    }
    
    // Limpiar caché principal
    if (limpiarTodo || opciones.dashboard) {
      console.log('\n1️⃣ Limpiando caché del dashboard...');
      limpiarClave(clavesCache.dashboard, 'Dashboard');
    }
    
    if (limpiarTodo || opciones.estadisticas) {
      console.log('\n2️⃣ Limpiando caché de estadísticas...');
      limpiarClave(clavesCache.estadisticas, 'Estadísticas');
    }
    
    if (limpiarTodo || opciones.selectorLD) {
      console.log('\n3️⃣ Limpiando caché del selector LD...');
      limpiarClave(clavesCache.lideres, 'Líderes');
    }
    
    // Limpiar caché unificado
    if (limpiarTodo) {
      console.log('\n4️⃣ Limpiando caché unificado...');
      limpiarClave(clavesCache.unified_dashboard, 'Unified Dashboard');
      limpiarClave(clavesCache.unified_stats, 'Unified Stats');
      limpiarClave(clavesCache.unified_lideres, 'Unified Líderes');
    }
    
    // Limpiar caché legacy
    if (limpiarTodo || opciones.legacy) {
      console.log('\n5️⃣ Limpiando caché legacy...');
      clavesCache.legacy.forEach(clave => {
        limpiarClave(clave, 'Legacy');
      });
    }
    
    // Limpiar caché de métricas
    if (limpiarTodo) {
      console.log('\n6️⃣ Limpiando caché de métricas...');
      clavesCache.metricas.forEach(clave => {
        limpiarClave(clave, 'Métricas');
      });
    }
    
    // Limpiar caché de validación
    if (limpiarTodo) {
      console.log('\n7️⃣ Limpiando caché de validación...');
      clavesCache.validacion.forEach(clave => {
        limpiarClave(clave, 'Validación');
      });
    }
    
    // Resumen final
    console.log('\n📊 RESUMEN DE LIMPIEZA:');
    console.log('='.repeat(40));
    console.log(`✅ Limpiados: ${resultado.estadisticas.totalLimpiado}`);
    console.log(`⚠️ No encontrados: ${resultado.estadisticas.totalNoEncontrado}`);
    console.log(`❌ Errores: ${resultado.estadisticas.totalErrores}`);
    
    if (soloVerificar) {
      console.log('\n🔍 MODO VERIFICACIÓN - No se realizaron cambios');
    } else {
      console.log('\n🎉 LIMPIEZA COMPLETADA');
    }
    
    // Determinar éxito
    resultado.success = resultado.estadisticas.totalErrores === 0;
    
    return resultado;
    
  } catch (error) {
    console.error('❌ Error crítico en limpiador de caché:', error);
    resultado.success = false;
    resultado.error = error.toString();
    return resultado;
  }
}

/**
 * Limpieza rápida del selector LD (función específica)
 * @returns {Object} Resultado de la limpieza
 */
function limpiarCacheSelectorLD() {
  console.log('🎯 LIMPIEZA RÁPIDA - Selector LD');
  console.log('='.repeat(40));
  
  return limpiarCacheRobusto({
    selectorLD: true,
    verificar: false
  });
}

/**
 * Verificación completa del caché (sin limpiar)
 * @returns {Object} Estado del caché
 */
function verificarEstadoCache() {
  console.log('🔍 VERIFICACIÓN COMPLETA DEL CACHÉ');
  console.log('='.repeat(50));
  
  return limpiarCacheRobusto({
    todo: true,
    verificar: true
  });
}

/**
 * Limpieza completa del sistema
 * @returns {Object} Resultado de la limpieza
 */
function limpiarTodoElCache() {
  console.log('🧹 LIMPIEZA COMPLETA DEL SISTEMA');
  console.log('='.repeat(50));
  
  return limpiarCacheRobusto({
    todo: true,
    verificar: false
  });
}

/**
 * Limpieza selectiva del caché
 * @param {Object} opciones - Opciones específicas
 * @returns {Object} Resultado de la limpieza
 */
function limpiarCacheSelectivo(opciones) {
  console.log('🎯 LIMPIEZA SELECTIVA DEL CACHÉ');
  console.log('='.repeat(50));
  
  return limpiarCacheRobusto({
    ...opciones,
    verificar: false
  });
}

/**
 * Función de prueba para el limpiador robusto
 * @returns {Object} Resultado de la prueba
 */
function probarLimpiadorRobusto() {
  console.log('🧪 PRUEBA DEL LIMPIADOR ROBUSTO');
  console.log('='.repeat(50));
  
  try {
    // 1. Verificar estado actual
    console.log('1️⃣ Verificando estado actual del caché...');
    const estadoInicial = verificarEstadoCache();
    
    // 2. Limpieza selectiva de prueba
    console.log('\n2️⃣ Realizando limpieza selectiva de prueba...');
    const limpiezaSelectiva = limpiarCacheSelectivo({
      selectorLD: true,
      dashboard: true
    });
    
    // 3. Verificar estado después de limpieza
    console.log('\n3️⃣ Verificando estado después de limpieza...');
    const estadoFinal = verificarEstadoCache();
    
    // 4. Resumen de la prueba
    console.log('\n📊 RESUMEN DE LA PRUEBA:');
    console.log('='.repeat(40));
    console.log(`Estado inicial: ${estadoInicial.estadisticas.totalLimpiado} elementos`);
    console.log(`Limpieza selectiva: ${limpiezaSelectiva.success ? '✅' : '❌'}`);
    console.log(`Estado final: ${estadoFinal.estadisticas.totalLimpiado} elementos`);
    
    return {
      success: limpiezaSelectiva.success,
      estadoInicial: estadoInicial.estadisticas,
      limpiezaSelectiva: limpiezaSelectiva.estadisticas,
      estadoFinal: estadoFinal.estadisticas
    };
    
  } catch (error) {
    console.error('❌ Error en prueba del limpiador:', error);
    return { success: false, error: error.toString() };
  }
}

console.log('🧹 LimpiadorCacheRobusto cargado - Sistema robusto de limpieza de caché disponible');
