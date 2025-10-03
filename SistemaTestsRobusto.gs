/**
 * SistemaTestsRobusto.gs
 * Sistema consolidado de pruebas robustas para el Portal de Supervisión
 * Reemplaza múltiples archivos de test con un sistema unificado y eficiente
 */

/**
 * Configuración centralizada de pruebas
 */
const TEST_CONFIG = {
  // Configuración de rendimiento
  PERFORMANCE: {
    TIMEOUT_LIMITS: {
      EXCELLENT: 1000,    // < 1s
      GOOD: 3000,         // < 3s
      ACCEPTABLE: 5000,   // < 5s
      SLOW: 10000,        // < 10s
      CRITICAL: 15000     // < 15s
    },
    BATCH_SIZES: [5, 10, 15, 20, 25, 30],
    ITEM_COUNTS: [10, 25, 50, 100]
  },
  
  // Configuración de datos de prueba
  DATA: {
    LCF_SAMPLE_SIZE: 3,
    LD_SAMPLE_SIZE: 2,
    CACHE_TTL: 300
  },
  
  // Configuración general
  GENERAL: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    LOG_LEVEL: 'INFO' // DEBUG, INFO, WARN, ERROR
  }
};

/**
 * Clase principal para manejo de pruebas
 */
class TestManager {
  constructor() {
    this.resultados = {
      inicio: new Date().toISOString(),
      pruebas: [],
      exitoso: true,
      tiempoTotal: 0,
      estadisticas: {
        total: 0,
        exitosas: 0,
        fallidas: 0,
        errores: 0
      }
    };
  }
  
  /**
   * Ejecuta una prueba individual
   */
  async ejecutarPrueba(nombre, funcion, categoria = 'general') {
    const inicio = Date.now();
    console.log(`\n🧪 [${categoria.toUpperCase()}] ${nombre}`);
    console.log('-'.repeat(50));
    
    try {
      const resultado = await funcion();
      const duracion = Date.now() - inicio;
      
      const prueba = {
        nombre,
        categoria,
        exitosa: resultado.success || false,
        duracion,
        detalles: resultado.details || resultado,
        timestamp: new Date().toISOString()
      };
      
      this.resultados.pruebas.push(prueba);
      this.resultados.estadisticas.total++;
      
      if (prueba.exitosa) {
        this.resultados.estadisticas.exitosas++;
        console.log(`✅ ${nombre} - ${duracion}ms`);
      } else {
        this.resultados.estadisticas.fallidas++;
        console.log(`❌ ${nombre} - ${duracion}ms`);
        console.log(`   Error: ${resultado.error || 'Prueba falló'}`);
      }
      
      return prueba;
      
    } catch (error) {
      const duracion = Date.now() - inicio;
      this.resultados.estadisticas.errores++;
      
      const prueba = {
        nombre,
        categoria,
        exitosa: false,
        duracion,
        error: error.toString(),
        timestamp: new Date().toISOString()
      };
      
      this.resultados.pruebas.push(prueba);
      console.log(`💥 ${nombre} - ERROR: ${error.toString()}`);
      
      return prueba;
    }
  }
  
  /**
   * Genera resumen final
   */
  generarResumen() {
    this.resultados.tiempoTotal = Date.now() - new Date(this.resultados.inicio).getTime();
    this.resultados.exitoso = this.resultados.estadisticas.errores === 0 && 
                              this.resultados.estadisticas.fallidas === 0;
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN FINAL DE PRUEBAS');
    console.log('='.repeat(60));
    console.log(`⏱️  Tiempo total: ${this.resultados.tiempoTotal}ms`);
    console.log(`📈 Total de pruebas: ${this.resultados.estadisticas.total}`);
    console.log(`✅ Exitosas: ${this.resultados.estadisticas.exitosas}`);
    console.log(`❌ Fallidas: ${this.resultados.estadisticas.fallidas}`);
    console.log(`💥 Errores: ${this.resultados.estadisticas.errores}`);
    console.log(`📊 Tasa de éxito: ${((this.resultados.estadisticas.exitosas / this.resultados.estadisticas.total) * 100).toFixed(1)}%`);
    
    if (this.resultados.exitoso) {
      console.log('\n🎉 TODAS LAS PRUEBAS EXITOSAS');
    } else {
      console.log('\n⚠️ ALGUNAS PRUEBAS FALLARON');
    }
    
    return this.resultados;
  }
}

/**
 * Pruebas de funcionalidad básica
 */
class PruebasFuncionalidad {
  /**
   * Prueba getDashboardData
   */
  static async probarDashboardData() {
    try {
      const startTime = Date.now();
      const dashboard = getDashboardData();
      const duracion = Date.now() - startTime;
      
      const exito = dashboard.success && 
                   dashboard.data && 
                   dashboard.data.actividad &&
                   dashboard.data.metricas;
      
      return {
        success: exito,
        details: {
          duracion,
          tieneActividad: !!dashboard.data?.actividad,
          tieneMetricas: !!dashboard.data?.metricas,
          modoCarga: dashboard.data?.modo_carga || 'N/A'
        }
      };
    } catch (error) {
      return { success: false, error: error.toString() };
    }
  }
  
  /**
   * Prueba getEstadisticasRapidas
   */
  static async probarEstadisticasRapidas() {
    try {
      const startTime = Date.now();
      const stats = getEstadisticasRapidas();
      const duracion = Date.now() - startTime;
      
      const exito = stats.success && 
                   stats.data && 
                   stats.data.actividad &&
                   stats.data.metricas;
      
      return {
        success: exito,
        details: {
          duracion,
          tieneActividad: !!stats.data?.actividad,
          tieneMetricas: !!stats.data?.metricas,
          totalLideres: stats.data?.metricas?.total_lideres || 0
        }
      };
    } catch (error) {
      return { success: false, error: error.toString() };
    }
  }
  
  /**
   * Prueba getListaDeLideres
   */
  static async probarListaDeLideres() {
    try {
      const startTime = Date.now();
      const lideres = getListaDeLideres();
      const duracion = Date.now() - startTime;
      
      const exito = lideres.success && 
                   lideres.data && 
                   Array.isArray(lideres.data) &&
                   lideres.data.length > 0;
      
      return {
        success: exito,
        details: {
          duracion,
          totalLideres: lideres.data?.length || 0,
          estructuraCorrecta: lideres.data?.[0]?.ID_Lider ? true : false
        }
      };
    } catch (error) {
      return { success: false, error: error.toString() };
    }
  }
  
  /**
   * Prueba de modales
   */
  static async probarModales() {
    try {
      // Obtener un LCF válido
      const lcfId = obtenerLCFValidoParaPruebas();
      if (!lcfId) {
        return { success: false, error: 'No hay LCFs disponibles para prueba' };
      }
      
      // Probar getResumenLCF
      const resumen = getResumenLCF(lcfId);
      const resumenOk = resumen.success && resumen.data;
      
      // Probar cargarDatosLCF
      const datos = cargarDatosLCF(lcfId);
      const datosOk = datos.success && datos.celulas && datos.almas;
      
      return {
        success: resumenOk && datosOk,
        details: {
          lcfId,
          resumenOk,
          datosOk,
          totalCelulas: datos.celulas?.length || 0,
          totalAlmas: datos.almas?.length || 0
        }
      };
    } catch (error) {
      return { success: false, error: error.toString() };
    }
  }
}

/**
 * Pruebas de rendimiento
 */
class PruebasRendimiento {
  /**
   * Prueba de rendimiento general
   */
  static async probarRendimientoGeneral() {
    try {
      const pruebas = [
        { nombre: 'Dashboard', funcion: getDashboardData },
        { nombre: 'Estadísticas', funcion: getEstadisticasRapidas },
        { nombre: 'Líderes', funcion: getListaDeLideres }
      ];
      
      const resultados = [];
      
      for (const prueba of pruebas) {
        const startTime = Date.now();
        const resultado = prueba.funcion();
        const duracion = Date.now() - startTime;
        
        resultados.push({
          nombre: prueba.nombre,
          duracion,
          exitosa: resultado.success || false,
          categoria: this.categorizarRendimiento(duracion)
        });
      }
      
      const promedio = resultados.reduce((sum, r) => sum + r.duracion, 0) / resultados.length;
      const maximo = Math.max(...resultados.map(r => r.duracion));
      
      return {
        success: true,
        details: {
          resultados,
          promedio,
          maximo,
          categoriaGeneral: this.categorizarRendimiento(promedio)
        }
      };
    } catch (error) {
      return { success: false, error: error.toString() };
    }
  }
  
  /**
   * Categoriza el rendimiento basado en duración
   */
  static categorizarRendimiento(duracion) {
    if (duracion < TEST_CONFIG.PERFORMANCE.TIMEOUT_LIMITS.EXCELLENT) return 'EXCELENTE';
    if (duracion < TEST_CONFIG.PERFORMANCE.TIMEOUT_LIMITS.GOOD) return 'BUENO';
    if (duracion < TEST_CONFIG.PERFORMANCE.TIMEOUT_LIMITS.ACCEPTABLE) return 'ACEPTABLE';
    if (duracion < TEST_CONFIG.PERFORMANCE.TIMEOUT_LIMITS.SLOW) return 'LENTO';
    return 'CRÍTICO';
  }
}

/**
 * Pruebas de integración
 */
class PruebasIntegracion {
  /**
   * Prueba de integración completa del sistema
   */
  static async probarIntegracionCompleta() {
    try {
      console.log('🔄 Iniciando prueba de integración completa...');
      
      // 1. Cargar datos principales
      const dashboard = getDashboardData();
      const stats = getEstadisticasRapidas();
      const lideres = getListaDeLideres();
      
      // 2. Verificar consistencia de datos
      const consistencia = this.verificarConsistencia(dashboard, stats, lideres);
      
      // 3. Probar flujo completo de modales
      const modales = await PruebasFuncionalidad.probarModales();
      
      return {
        success: dashboard.success && stats.success && lideres.success && consistencia && modales.success,
        details: {
          dashboard: dashboard.success,
          stats: stats.success,
          lideres: lideres.success,
          consistencia,
          modales: modales.success,
          totalLideres: lideres.data?.length || 0
        }
      };
    } catch (error) {
      return { success: false, error: error.toString() };
    }
  }
  
  /**
   * Verifica consistencia entre diferentes fuentes de datos
   */
  static verificarConsistencia(dashboard, stats, lideres) {
    try {
      // Verificar que todos tienen datos
      const todosTienenDatos = dashboard.data && stats.data && lideres.data;
      
      // Verificar que las estructuras son consistentes
      const estructuraConsistente = 
        dashboard.data?.actividad && 
        stats.data?.actividad && 
        Array.isArray(lideres.data);
      
      return todosTienenDatos && estructuraConsistente;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Función principal de pruebas - Ejecuta todas las pruebas
 */
async function ejecutarTodasLasPruebas() {
  console.log('🚀 SISTEMA DE PRUEBAS ROBUSTO');
  console.log('='.repeat(60));
  
  const testManager = new TestManager();
  
  try {
    // Pruebas de funcionalidad básica
    console.log('\n📋 EJECUTANDO PRUEBAS DE FUNCIONALIDAD...');
    await testManager.ejecutarPrueba('Dashboard Data', PruebasFuncionalidad.probarDashboardData, 'funcionalidad');
    await testManager.ejecutarPrueba('Estadísticas Rápidas', PruebasFuncionalidad.probarEstadisticasRapidas, 'funcionalidad');
    await testManager.ejecutarPrueba('Lista de Líderes', PruebasFuncionalidad.probarListaDeLideres, 'funcionalidad');
    await testManager.ejecutarPrueba('Modales', PruebasFuncionalidad.probarModales, 'funcionalidad');
    
    // Pruebas de rendimiento
    console.log('\n⚡ EJECUTANDO PRUEBAS DE RENDIMIENTO...');
    await testManager.ejecutarPrueba('Rendimiento General', PruebasRendimiento.probarRendimientoGeneral, 'rendimiento');
    
    // Pruebas de integración
    console.log('\n🔗 EJECUTANDO PRUEBAS DE INTEGRACIÓN...');
    await testManager.ejecutarPrueba('Integración Completa', PruebasIntegracion.probarIntegracionCompleta, 'integracion');
    
    // Generar resumen final
    return testManager.generarResumen();
    
  } catch (error) {
    console.error('💥 Error crítico en sistema de pruebas:', error);
    return {
      success: false,
      error: error.toString(),
      resultados: testManager.resultados
    };
  }
}

/**
 * Prueba rápida del sistema (versión simplificada)
 */
async function pruebaRapidaSistema() {
  console.log('⚡ PRUEBA RÁPIDA DEL SISTEMA');
  console.log('='.repeat(40));
  
  const testManager = new TestManager();
  
  try {
    // Solo las pruebas más críticas
    await testManager.ejecutarPrueba('Dashboard Data', PruebasFuncionalidad.probarDashboardData, 'rapida');
    await testManager.ejecutarPrueba('Lista de Líderes', PruebasFuncionalidad.probarListaDeLideres, 'rapida');
    
    return testManager.generarResumen();
    
  } catch (error) {
    console.error('💥 Error en prueba rápida:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Función auxiliar para obtener LCF válido (si existe)
 */
function obtenerLCFValidoParaPruebas() {
  try {
    const directorio = cargarDirectorioCompleto();
    const lcf = (directorio.lideres || []).find(lider => lider.Rol === 'LCF');
    return lcf ? lcf.ID_Lider : null;
  } catch (error) {
    return null;
  }
}

console.log('🧪 SistemaTestsRobusto cargado - Sistema consolidado de pruebas disponible');
