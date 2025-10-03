/**
 * @fileoverview Test de métricas usando claves reales
 * Verifica que getMetricasRendimiento y obtenerMetricasProduccion usen claves reales
 */

/**
 * Test de métricas con claves reales
 * @returns {Object} Resultado del test
 */
function testMetricasReales() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST DE MÉTRICAS CON CLAVES REALES');
  console.log('='.repeat(60) + '\n');
  
  const resultados = {
    timestamp: new Date().toISOString(),
    tests: [],
    resumen: {
      total: 0,
      exitosos: 0,
      fallidos: 0
    }
  };
  
  // 1. Test de getMetricasRendimiento
  console.log('1️⃣ Probando getMetricasRendimiento...');
  try {
    const startTime = Date.now();
    const metricas = getMetricasRendimiento();
    const tiempo = Date.now() - startTime;
    
    if (metricas.success) {
      const data = metricas.data;
      
      // Verificar que usa claves reales
      const usaClavesReales = data.cache.total_keys_registered > 0 || 
                              data.keys.main_cache_keys > 0 || 
                              data.keys.leader_cache_keys > 0;
      
      resultados.tests.push({
        nombre: 'getMetricasRendimiento - Claves Reales',
        resultado: usaClavesReales ? 'PASS' : 'FAIL',
        detalles: {
          total_keys_registered: data.cache.total_keys_registered,
          main_cache_keys: data.keys.main_cache_keys,
          leader_cache_keys: data.keys.leader_cache_keys,
          usa_claves_reales: usaClavesReales
        },
        tiempo: tiempo
      });
      
      // Verificar métricas de caché
      const metricasCache = data.cache.ld_cached >= 0 && 
                           data.cache.lcf_cached >= 0 && 
                           data.cache.total_cached >= 0 &&
                           typeof data.cache.hit_rate === 'number';
      
      resultados.tests.push({
        nombre: 'getMetricasRendimiento - Métricas de Caché',
        resultado: metricasCache ? 'PASS' : 'FAIL',
        detalles: {
          ld_cached: data.cache.ld_cached,
          lcf_cached: data.cache.lcf_cached,
          total_cached: data.cache.total_cached,
          hit_rate: data.cache.hit_rate + '%',
          cache_efficiency: data.performance.cache_efficiency
        },
        tiempo: tiempo
      });
      
      if (usaClavesReales && metricasCache) {
        console.log('   ✅ getMetricasRendimiento funciona correctamente con claves reales');
        console.log(`   📊 LD: ${data.cache.ld_cached}, LCF: ${data.cache.lcf_cached}, Total: ${data.cache.total_cached}`);
        console.log(`   🎯 Tasa de acierto: ${data.cache.hit_rate}% (${data.performance.cache_efficiency})`);
      } else {
        console.log('   ❌ getMetricasRendimiento tiene problemas');
      }
    } else {
      console.log('   ❌ Error en getMetricasRendimiento:', metricas.error);
      resultados.tests.push({
        nombre: 'getMetricasRendimiento',
        resultado: 'ERROR',
        error: metricas.error
      });
    }
  } catch (error) {
    console.log('   ❌ Excepción en getMetricasRendimiento:', error);
    resultados.tests.push({
      nombre: 'getMetricasRendimiento',
      resultado: 'ERROR',
      error: error.toString()
    });
  }
  
  // 2. Test de obtenerMetricasProduccion
  console.log('\n2️⃣ Probando obtenerMetricasProduccion...');
  try {
    const startTime = Date.now();
    const metricasProd = obtenerMetricasProduccion();
    const tiempo = Date.now() - startTime;
    
    if (!metricasProd.error) {
      // Verificar que usa métricas actualizadas
      const usaMetricasActualizadas = metricasProd.cache.hit_rate !== undefined &&
                                     metricasProd.cache.total_keys_registered !== undefined &&
                                     metricasProd.keys !== undefined;
      
      resultados.tests.push({
        nombre: 'obtenerMetricasProduccion - Métricas Actualizadas',
        resultado: usaMetricasActualizadas ? 'PASS' : 'FAIL',
        detalles: {
          hit_rate: metricasProd.cache.hit_rate,
          total_keys_registered: metricasProd.cache.total_keys_registered,
          cache_efficiency: metricasProd.performance.cache_efficiency,
          usa_metricas_actualizadas: usaMetricasActualizadas
        },
        tiempo: tiempo
      });
      
      // Verificar consistencia con getMetricasRendimiento
      const metricasBase = getMetricasRendimiento();
      const esConsistente = metricasBase.success && 
                           metricasProd.cache.ld_cached_items === metricasBase.data.cache.ld_cached &&
                           metricasProd.cache.lcf_cached_items === metricasBase.data.cache.lcf_cached;
      
      resultados.tests.push({
        nombre: 'obtenerMetricasProduccion - Consistencia',
        resultado: esConsistente ? 'PASS' : 'FAIL',
        detalles: {
          ld_consistente: metricasProd.cache.ld_cached_items === (metricasBase.data?.cache?.ld_cached || 0),
          lcf_consistente: metricasProd.cache.lcf_cached_items === (metricasBase.data?.cache?.lcf_cached || 0),
          es_consistente: esConsistente
        },
        tiempo: tiempo
      });
      
      if (usaMetricasActualizadas && esConsistente) {
        console.log('   ✅ obtenerMetricasProduccion funciona correctamente');
        console.log(`   📊 LD: ${metricasProd.cache.ld_cached_items}, LCF: ${metricasProd.cache.lcf_cached_items}`);
        console.log(`   🎯 Eficiencia: ${metricasProd.performance.cache_efficiency}`);
      } else {
        console.log('   ❌ obtenerMetricasProduccion tiene problemas');
      }
    } else {
      console.log('   ❌ Error en obtenerMetricasProduccion:', metricasProd.error);
      resultados.tests.push({
        nombre: 'obtenerMetricasProduccion',
        resultado: 'ERROR',
        error: metricasProd.error
      });
    }
  } catch (error) {
    console.log('   ❌ Excepción en obtenerMetricasProduccion:', error);
    resultados.tests.push({
      nombre: 'obtenerMetricasProduccion',
      resultado: 'ERROR',
      error: error.toString()
    });
  }
  
  // 3. Test de comparación con sistema antiguo
  console.log('\n3️⃣ Comparando con sistema antiguo...');
  try {
    const metricasNuevas = getMetricasRendimiento();
    const metricasAntiguas = simularMetricasAntiguas();
    
    const esMejor = metricasNuevas.success && 
                   metricasNuevas.data.cache.total_cached >= metricasAntiguas.total_cached &&
                   metricasNuevas.data.cache.hit_rate >= 0;
    
    resultados.tests.push({
      nombre: 'Comparación Sistema Nuevo vs Antiguo',
      resultado: esMejor ? 'PASS' : 'FAIL',
      detalles: {
        nuevo_total: metricasNuevas.data?.cache?.total_cached || 0,
        antiguo_total: metricasAntiguas.total_cached,
        nuevo_hit_rate: metricasNuevas.data?.cache?.hit_rate || 0,
        es_mejor: esMejor
      },
      tiempo: 0
    });
    
    if (esMejor) {
      console.log('   ✅ Sistema nuevo es mejor que el antiguo');
      console.log(`   📈 Nuevo: ${metricasNuevas.data.cache.total_cached} elementos (${metricasNuevas.data.cache.hit_rate}% acierto)`);
      console.log(`   📉 Antiguo: ${metricasAntiguas.total_cached} elementos (estimado)`);
    } else {
      console.log('   ⚠️ Sistema nuevo necesita verificación');
    }
  } catch (error) {
    console.log('   ❌ Error en comparación:', error);
    resultados.tests.push({
      nombre: 'Comparación Sistema',
      resultado: 'ERROR',
      error: error.toString()
    });
  }
  
  // Calcular resumen
  resultados.resumen.total = resultados.tests.length;
  resultados.resumen.exitosos = resultados.tests.filter(t => t.resultado === 'PASS').length;
  resultados.resumen.fallidos = resultados.tests.filter(t => t.resultado === 'FAIL' || t.resultado === 'ERROR').length;
  
  // Mostrar resumen final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE MÉTRICAS CON CLAVES REALES');
  console.log('='.repeat(60));
  console.log(`Total de tests: ${resultados.resumen.total}`);
  console.log(`✅ Exitosos: ${resultados.resumen.exitosos}`);
  console.log(`❌ Fallidos: ${resultados.resumen.fallidos}`);
  console.log(`📈 Tasa de éxito: ${Math.round((resultados.resumen.exitosos / resultados.resumen.total) * 100)}%`);
  
  if (resultados.resumen.fallidos === 0) {
    console.log('\n🎉 ¡MÉTRICAS CON CLAVES REALES FUNCIONAN PERFECTAMENTE!');
    console.log('✅ Sistema de métricas completamente actualizado');
  } else {
    console.log('\n⚠️ ALGUNAS MÉTRICAS NECESITAN REVISIÓN');
    console.log('🔧 Revisar los errores mostrados arriba');
  }
  
  console.log('='.repeat(60));
  
  return resultados;
}

/**
 * Simula el sistema antiguo de métricas para comparación
 * @returns {Object} Métricas del sistema antiguo
 */
function simularMetricasAntiguas() {
  try {
    const cache = CacheService.getScriptCache();
    let totalCached = 0;
    
    // Simular conteo antiguo (índices numéricos)
    for (let i = 0; i < 100; i++) {
      if (cache.get(`LD_OPT_FULL_${i}`) || cache.get(`LD_OPT_BASIC_${i}`)) {
        totalCached++;
      }
      if (cache.get(`LCF_OPT_${i}`)) {
        totalCached++;
      }
    }
    
    return {
      total_cached: totalCached,
      metodo: 'indices_numericos'
    };
  } catch (error) {
    return {
      total_cached: 0,
      metodo: 'error',
      error: error.toString()
    };
  }
}

console.log('🧪 TestMetricasReales cargado - Test de métricas con claves reales disponible');
