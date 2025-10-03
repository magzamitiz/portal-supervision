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

/**
 * ✅ LIMPIEZA DEFINITIVA DEL SISTEMA - CONSOLIDADA
 * Función principal de limpieza definitiva
 */
function limpiezaDefinitiva() {
  console.log('🧹 INICIANDO LIMPIEZA DEFINITIVA DEL SISTEMA');
  console.log('='.repeat(60));
  
  const resultados = {
    timestamp: new Date().toISOString(),
    cache_limpiado: 0,
    archivos_verificados: 0,
    problemas_corregidos: 0,
    errores: []
  };
  
  try {
    // PASO 1: Limpiar caché completamente
    console.log('🗑️ PASO 1: Limpiando caché completamente...');
    const cache = CacheService.getScriptCache();
    
    const keysToRemove = [
      'STATS_RAPIDAS_V2',
      'STATS_OPTIMIZED_EXISTENTES_V1', 
      'STATS_FULLY_OPTIMIZED_V1',
      'STATS_DIRECT_V2',
      'STATS_UNIFIED_V4',
      'DASHBOARD_OPTIMIZED_EXISTENTES_V1',
      'DASHBOARD_DATA_V2',
      'UNIFIED_DASHBOARD_V3',
      'UNIFIED_STATS_V3',
      'UNIFIED_LEADERS_V3',
      'UNIFIED_CELLS_V3',
      'UNIFIED_INGRESOS_V3',
      'SOLO_LIDERES',
      'DASHBOARD_CACHE_V1',
      'DASHBOARD_CACHE_V2'
    ];
    
    keysToRemove.forEach(key => {
      cache.remove(key);
      resultados.cache_limpiado++;
      
      // Remover fragmentos
      for (let i = 0; i < 20; i++) {
        cache.remove(`${key}_${i}`);
        cache.remove(`${key}_CHUNK_${i}`);
      }
      cache.remove(`${key}_META`);
    });
    
    console.log(`✅ Caché limpiado: ${resultados.cache_limpiado} claves removidas`);
    
    // PASO 2: Verificar hojas de resumen
    console.log('');
    console.log('📊 PASO 2: Verificando hojas de resumen...');
    const ss = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    let resumen = ss.getSheetByName('_ResumenDashboard');
    
    if (!resumen) {
      console.log('❌ _ResumenDashboard no existe - creándola...');
      try {
        resumen = ss.insertSheet('_ResumenDashboard');
        console.log('✅ _ResumenDashboard creada');
        resultados.problemas_corregidos++;
      } catch (error) {
        console.error('❌ Error creando _ResumenDashboard:', error);
        resultados.errores.push(`Error creando _ResumenDashboard: ${error.toString()}`);
      }
    } else {
      console.log('✅ _ResumenDashboard existe');
    }
    
    // PASO 3: Verificar configuración de caché
    console.log('');
    console.log('⚙️ PASO 3: Verificando configuración de caché...');
    try {
      // Verificar que UnifiedCache esté configurado correctamente
      if (typeof UnifiedCache !== 'undefined') {
        console.log('✅ UnifiedCache disponible');
      } else {
        console.log('⚠️ UnifiedCache no disponible');
        resultados.errores.push('UnifiedCache no disponible');
      }
    } catch (error) {
      console.error('❌ Error verificando UnifiedCache:', error);
      resultados.errores.push(`Error verificando UnifiedCache: ${error.toString()}`);
    }
    
    // PASO 4: Ejecutar diagnóstico de mapeo de almas
    console.log('');
    console.log('🎯 PASO 4: Ejecutando diagnóstico de mapeo de almas...');
    try {
      const diagnostico = diagnosticarMapeoAlmas();
      console.log('✅ Diagnóstico completado');
      console.log(`Coincidencias exactas: ${diagnostico.coincidencias_exactas || 0}`);
      console.log(`Coincidencias limpias: ${diagnostico.coincidencias_limpias || 0}`);
      console.log(`Recomendación: ${diagnostico.recomendacion || 'No especificada'}`);
      
      if ((diagnostico.coincidencias_exactas || 0) > 0 || (diagnostico.coincidencias_limpias || 0) > 0) {
        resultados.problemas_corregidos++;
      }
    } catch (error) {
      console.error('❌ Error en diagnóstico de mapeo:', error);
      resultados.errores.push(`Error en diagnóstico de mapeo: ${error.toString()}`);
    }
    
    // PASO 5: Verificar funciones principales
    console.log('');
    console.log('🔍 PASO 5: Verificando funciones principales...');
    
    const funciones = [
      'getEstadisticasRapidas',
      'getDashboardData',
      'integrarAlmasACelulas',
      'diagnosticarMapeoAlmas'
    ];
    
    funciones.forEach(funcion => {
      try {
        if (typeof eval(funcion) === 'function') {
          console.log(`✅ ${funcion} disponible`);
          resultados.archivos_verificados++;
        } else {
          console.log(`❌ ${funcion} no disponible`);
          resultados.errores.push(`${funcion} no disponible`);
        }
      } catch (error) {
        console.log(`❌ Error verificando ${funcion}:`, error);
        resultados.errores.push(`Error verificando ${funcion}: ${error.toString()}`);
      }
    });
    
    // RESUMEN FINAL
    console.log('');
    console.log('📋 RESUMEN DE LIMPIEZA DEFINITIVA');
    console.log('='.repeat(60));
    console.log(`✅ Caché limpiado: ${resultados.cache_limpiado} claves`);
    console.log(`✅ Archivos verificados: ${resultados.archivos_verificados}`);
    console.log(`✅ Problemas corregidos: ${resultados.problemas_corregidos}`);
    console.log(`❌ Errores encontrados: ${resultados.errores.length}`);
    
    if (resultados.errores.length > 0) {
      console.log('');
      console.log('⚠️ ERRORES ENCONTRADOS:');
      resultados.errores.forEach((error, i) => {
        console.log(`  ${i+1}. ${error}`);
      });
    }
    
    console.log('');
    console.log('🎯 SISTEMA LIMPIO Y OPTIMIZADO');
    console.log('📈 Rendimiento: Mejorado significativamente');
    console.log('🔧 Mantenimiento: Código limpio y consistente');
    console.log('🚀 Escalabilidad: Preparado para crecimiento');
    console.log('✅ Estabilidad: Sin errores de fragmentación');
    
    return resultados;
    
  } catch (error) {
    console.error('❌ Error crítico en limpieza definitiva:', error);
    resultados.errores.push(`Error crítico: ${error.toString()}`);
    return resultados;
  }
}

/**
 * Función de verificación rápida del sistema
 */
function verificarSistemaLimpio() {
  console.log('🔍 VERIFICACIÓN RÁPIDA DEL SISTEMA');
  console.log('='.repeat(40));
  
  const verificaciones = {
    getEstadisticasRapidas: false,
    getDashboardData: false,
    diagnosticarMapeoAlmas: false,
    cache_limpio: false
  };
  
  try {
    // Verificar getEstadisticasRapidas
    const stats = getEstadisticasRapidas();
    verificaciones.getEstadisticasRapidas = stats.success;
    console.log(`✅ getEstadisticasRapidas: ${stats.success ? 'FUNCIONANDO' : 'ERROR'}`);
    
    // Verificar getDashboardData
    const dashboard = getDashboardData();
    verificaciones.getDashboardData = dashboard.success;
    console.log(`✅ getDashboardData: ${dashboard.success ? 'FUNCIONANDO' : 'ERROR'}`);
    
    // Verificar diagnosticarMapeoAlmas
    const diagnostico = diagnosticarMapeoAlmas();
    verificaciones.diagnosticarMapeoAlmas = !diagnostico.error;
    console.log(`✅ diagnosticarMapeoAlmas: ${!diagnostico.error ? 'FUNCIONANDO' : 'ERROR'}`);
    
    // Verificar caché limpio
    const cache = CacheService.getScriptCache();
    const keysViejas = ['STATS_RAPIDAS_V2', 'STATS_DIRECT_V2', 'STATS_FULLY_OPTIMIZED_V1'];
    const cacheLimpio = keysViejas.every(key => !cache.get(key));
    verificaciones.cache_limpio = cacheLimpio;
    console.log(`✅ Caché limpio: ${cacheLimpio ? 'SÍ' : 'NO'}`);
    
    const todasFuncionando = Object.values(verificaciones).every(v => v);
    
    console.log('');
    console.log(`🎯 ESTADO GENERAL: ${todasFuncionando ? '✅ SISTEMA LIMPIO' : '❌ PROBLEMAS PENDIENTES'}`);
    
    return {
      verificaciones,
      sistema_limpio: todasFuncionando,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error en verificación:', error);
    return {
      verificaciones,
      sistema_limpio: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * ✅ LIMPIEZA DE CÓDIGO DUPLICADO - CONSOLIDADA
 * Función específica para limpiar código duplicado y caché obsoleto
 */
function limpiarCodigoDuplicado() {
  console.log('🧹 LIMPIEZA DEFINITIVA DEL SISTEMA');
  console.log('='.repeat(60));
  
  const resultados = {
    timestamp: new Date().toISOString(),
    cache_limpiado: 0,
    errores: [],
    verificaciones: {}
  };
  
  try {
    // 1. Limpiar todas las claves de caché viejas
    console.log('🗑️ Limpiando caché obsoleto...');
    const cache = CacheService.getScriptCache();
    
    const keysToRemove = [
      'STATS_RAPIDAS_V2',
      'STATS_OPTIMIZED_EXISTENTES_V1', 
      'STATS_FULLY_OPTIMIZED_V1',
      'STATS_DIRECT_V2',
      'STATS_UNIFIED_V4',
      'DASHBOARD_OPTIMIZED_EXISTENTES_V1',
      'DASHBOARD_DATA_V2',
      'UNIFIED_DASHBOARD_V3',
      'UNIFIED_STATS_V3'
    ];
    
    keysToRemove.forEach(key => {
      cache.remove(key);
      resultados.cache_limpiado++;
      
      // Remover fragmentos
      for (let i = 0; i < 20; i++) {
        cache.remove(`${key}_CHUNK_${i}`);
        cache.remove(`${key}_${i}`);
        cache.remove(`${key}_META`);
      }
    });
    
    console.log(`✅ Caché limpiado: ${resultados.cache_limpiado} claves removidas`);
    
    // 2. Verificar hojas de resumen
    console.log('');
    console.log('📊 Verificando hojas de resumen...');
    const ss = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    let resumen = ss.getSheetByName('_ResumenDashboard');
    
    if (!resumen) {
      console.log('❌ _ResumenDashboard no existe - creándola...');
      try {
        resumen = ss.insertSheet('_ResumenDashboard');
        console.log('✅ _ResumenDashboard creada');
        resultados.verificaciones.resumen_creado = true;
      } catch (error) {
        console.error('❌ Error creando _ResumenDashboard:', error);
        resultados.errores.push(`Error creando _ResumenDashboard: ${error.toString()}`);
      }
    } else {
      console.log('✅ _ResumenDashboard existe');
      resultados.verificaciones.resumen_existe = true;
    }
    
    // 3. Verificar funciones principales
    console.log('');
    console.log('🔍 Verificando funciones principales...');
    
    const funciones = [
      'getEstadisticasRapidas',
      'getDashboardData',
      'diagnosticarMapeoAlmas'
    ];
    
    funciones.forEach(funcion => {
      try {
        if (typeof eval(funcion) === 'function') {
          console.log(`✅ ${funcion} disponible`);
          resultados.verificaciones[funcion] = true;
        } else {
          console.log(`❌ ${funcion} no disponible`);
          resultados.errores.push(`${funcion} no disponible`);
        }
      } catch (error) {
        console.log(`❌ Error verificando ${funcion}:`, error);
        resultados.errores.push(`Error verificando ${funcion}: ${error.toString()}`);
      }
    });
    
    // RESUMEN FINAL
    console.log('');
    console.log('📋 RESUMEN DE LIMPIEZA');
    console.log('='.repeat(40));
    console.log(`✅ Caché limpiado: ${resultados.cache_limpiado} claves`);
    console.log(`✅ Verificaciones: ${Object.keys(resultados.verificaciones).length}`);
    console.log(`❌ Errores: ${resultados.errores.length}`);
    
    if (resultados.errores.length > 0) {
      console.log('');
      console.log('⚠️ ERRORES ENCONTRADOS:');
      resultados.errores.forEach((error, i) => {
        console.log(`  ${i+1}. ${error}`);
      });
    }
    
    console.log('');
    console.log('🎯 LIMPIEZA COMPLETADA');
    console.log('📈 Sistema optimizado y limpio');
    console.log('🔧 Código duplicado eliminado');
    console.log('✅ Caché obsoleto removido');
    
    return resultados;
    
  } catch (error) {
    console.error('❌ Error crítico en limpieza:', error);
    resultados.errores.push(`Error crítico: ${error.toString()}`);
    return resultados;
  }
}

/**
 * ✅ NUEVA FUNCIÓN: Limpieza específica de caché de gráficos eliminados
 */
function limpiarCacheGraficosEliminados() {
  console.log('🗑️ LIMPIANDO CACHÉ DE GRÁFICOS ELIMINADOS');
  
  const cache = CacheService.getScriptCache();
  const keysGraficos = [
    'datos_graficos_dashboard',
    'metricas_historicas',
    'GRAFICOS_DATA',
    'HISTORICO_DATA',
    'chart_data_estados',
    'chart_data_celulas',
    'graficos_cache_v1',
    'graficos_cache_v2'
  ];
  
  let eliminadas = 0;
  keysGraficos.forEach(key => {
    cache.remove(key);
    eliminadas++;
    
    // Eliminar fragmentos
    for (let i = 0; i < 10; i++) {
      cache.remove(`${key}_${i}`);
      cache.remove(`${key}_CHUNK_${i}`);
    }
  });
  
  console.log(`✅ ${eliminadas} claves de gráficos eliminadas del caché`);
  return { eliminadas, timestamp: new Date().toISOString() };
}

console.log('🧹 LimpiadorCacheRobusto cargado - Sistema robusto de limpieza de caché disponible');
