/**
 * @fileoverview Test para generar datos de caché y probar métricas
 * Genera datos de caché reales para probar el sistema de métricas
 */

/**
 * Genera datos de caché para probar métricas
 * @returns {Object} Resultado de la generación de caché
 */
function testGenerarCache() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST: Generando Datos de Caché para Métricas');
  console.log('='.repeat(60) + '\n');
  
  const resultados = {
    timestamp: new Date().toISOString(),
    clavesGeneradas: [],
    errores: []
  };
  
  try {
    // 1. Generar caché del dashboard
    console.log('1️⃣ Generando caché del dashboard...');
    try {
      const dashboardData = {
        lideres: [
          { ID_Lider: 'LD-001', Nombre_Lider: 'Test LD 1', Rol: 'LD' },
          { ID_Lider: 'LD-002', Nombre_Lider: 'Test LD 2', Rol: 'LD' }
        ],
        celulas: [
          { ID_Celula: 'C-001', ID_Lider: 'LD-001', Estado: 'Activa' },
          { ID_Celula: 'C-002', ID_Lider: 'LD-002', Estado: 'Activa' }
        ],
        ingresos: [
          { ID_Alma: 'A-001', Nombre_Alma: 'Test Alma 1' },
          { ID_Alma: 'A-002', Nombre_Alma: 'Test Alma 2' }
        ],
        timestamp: new Date().toISOString()
      };
      
      const cache = CacheService.getScriptCache();
      cache.put('DASHBOARD_DATA_V2', JSON.stringify(dashboardData), 1800);
      registrarClaveCache('DASHBOARD_DATA_V2');
      resultados.clavesGeneradas.push('DASHBOARD_DATA_V2');
      console.log('   ✅ Caché del dashboard generada');
    } catch (error) {
      console.log('   ❌ Error generando caché del dashboard:', error);
      resultados.errores.push('Dashboard: ' + error.toString());
    }
    
    // 2. Generar caché de estadísticas
    console.log('\n2️⃣ Generando caché de estadísticas...');
    try {
      const statsData = {
        actividad: {
          totalRecibiendoCelulas: 100,
          activosRecibiendoCelula: 80,
          alerta: 15,
          critico: 5,
          lideresInactivos: 3
        },
        metricas: {
          tasaIntegracion: 80,
          tasaActividad: 75
        },
        timestamp: new Date().toISOString()
      };
      
      const cache = CacheService.getScriptCache();
      cache.put('STATS_RAPIDAS_V2', JSON.stringify(statsData), 1800);
      registrarClaveCache('STATS_RAPIDAS_V2');
      resultados.clavesGeneradas.push('STATS_RAPIDAS_V2');
      console.log('   ✅ Caché de estadísticas generada');
    } catch (error) {
      console.log('   ❌ Error generando caché de estadísticas:', error);
      resultados.errores.push('Stats: ' + error.toString());
    }
    
    // 3. Generar caché de líderes
    console.log('\n3️⃣ Generando caché de líderes...');
    try {
      const cache = CacheService.getScriptCache();
      
      // Generar varios LDs
      for (let i = 1; i <= 5; i++) {
        const ldData = {
          success: true,
          data: {
            lider: { ID_Lider: `LD-00${i}`, Nombre_Lider: `Test LD ${i}` },
            lcfs: [],
            metricas: { totalLCFs: 0, lcfsActivos: 0 }
          },
          loadTime: 100 + i * 10
        };
        
        const cacheKey = `LD_OPT_FULL_LD-00${i}`;
        cache.put(cacheKey, JSON.stringify(ldData), 900);
        registrarClaveCache(cacheKey, 'LEADER_CACHE_KEYS');
        resultados.clavesGeneradas.push(cacheKey);
      }
      
      // Generar varios LCFs
      for (let i = 1; i <= 3; i++) {
        const lcfData = {
          success: true,
          data: {
            lcf: { ID_Lider: `LCF-00${i}`, Nombre_Lider: `Test LCF ${i}` },
            almas: [],
            metricas: { totalAlmas: 0 }
          },
          loadTime: 50 + i * 5
        };
        
        const cacheKey = `LCF_OPT_LCF-00${i}`;
        cache.put(cacheKey, JSON.stringify(lcfData), 600);
        registrarClaveCache(cacheKey, 'LEADER_CACHE_KEYS');
        resultados.clavesGeneradas.push(cacheKey);
      }
      
      console.log('   ✅ Caché de líderes generada (5 LDs + 3 LCFs)');
    } catch (error) {
      console.log('   ❌ Error generando caché de líderes:', error);
      resultados.errores.push('Líderes: ' + error.toString());
    }
    
    // 4. Verificar estado de caché
    console.log('\n4️⃣ Verificando estado de caché...');
    try {
      const estado = getEstadoCacheDetallado();
      if (estado.success) {
        console.log('   ✅ Estado de caché obtenido correctamente');
        console.log(`   📊 Total claves registradas: ${estado.data.totalKeys}`);
        console.log(`   🎯 Tasa de acierto: ${estado.data.hitRate}%`);
        console.log(`   📈 Claves principales: ${estado.data.mainCacheKeys}`);
        console.log(`   👥 Claves de líderes: ${estado.data.leaderCacheKeys}`);
        
        resultados.estadoCache = estado.data;
      } else {
        console.log('   ❌ Error obteniendo estado de caché:', estado.error);
        resultados.errores.push('Estado: ' + estado.error);
      }
    } catch (error) {
      console.log('   ❌ Error verificando estado:', error);
      resultados.errores.push('Verificación: ' + error.toString());
    }
    
    // 5. Probar métricas
    console.log('\n5️⃣ Probando métricas con datos generados...');
    try {
      const metricas = getMetricasRendimiento();
      if (metricas.success) {
        console.log('   ✅ Métricas obtenidas correctamente');
        console.log(`   📊 LD en caché: ${metricas.data.cache.ld_cached}`);
        console.log(`   📊 LCF en caché: ${metricas.data.cache.lcf_cached}`);
        console.log(`   📊 Total en caché: ${metricas.data.cache.total_cached}`);
        console.log(`   🎯 Tasa de acierto: ${metricas.data.cache.hit_rate}%`);
        console.log(`   ⚡ Eficiencia: ${metricas.data.performance.cache_efficiency}`);
        
        resultados.metricas = metricas.data;
      } else {
        console.log('   ❌ Error obteniendo métricas:', metricas.error);
        resultados.errores.push('Métricas: ' + metricas.error);
      }
    } catch (error) {
      console.log('   ❌ Error probando métricas:', error);
      resultados.errores.push('Métricas: ' + error.toString());
    }
    
    // Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE GENERACIÓN DE CACHÉ');
    console.log('='.repeat(60));
    console.log(`Claves generadas: ${resultados.clavesGeneradas.length}`);
    console.log(`Errores: ${resultados.errores.length}`);
    
    if (resultados.errores.length === 0) {
      console.log('\n🎉 ¡CACHÉ GENERADA EXITOSAMENTE!');
      console.log('✅ Sistema de métricas ahora tiene datos para probar');
    } else {
      console.log('\n⚠️ ALGUNOS ERRORES ENCONTRADOS');
      resultados.errores.forEach(error => console.log(`   - ${error}`));
    }
    
    console.log('='.repeat(60));
    
    return resultados;
    
  } catch (error) {
    console.error('❌ Error crítico en testGenerarCache:', error);
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Limpia la caché generada para pruebas
 * @returns {Object} Resultado de la limpieza
 */
function limpiarCachePruebas() {
  console.log('\n🧹 Limpiando caché de pruebas...');
  
  try {
    const resultado = limpiarCacheInteligente();
    
    if (resultado.success) {
      console.log(`✅ Caché limpiada: ${resultado.cleanedCount} elementos eliminados`);
    } else {
      console.log('❌ Error limpiando caché:', resultado.error);
    }
    
    return resultado;
  } catch (error) {
    console.error('❌ Error en limpieza:', error);
    return { success: false, error: error.toString() };
  }
}

console.log('🧪 TestGenerarCache cargado - Generación de caché para pruebas disponible');
