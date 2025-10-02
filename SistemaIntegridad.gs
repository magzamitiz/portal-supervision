/**
 * @fileoverview Módulo de integridad del sistema
 * Contiene funciones esenciales para verificar el estado y funcionalidad del portal
 */

// ==================== VERIFICACIONES DE INTEGRIDAD ====================

/**
 * Verifica la integridad completa del sistema
 * @returns {Object} Resultado de la verificación
 */
function verificarIntegridadSistema() {
  try {
    console.log('🔍 INICIANDO VERIFICACIÓN DE INTEGRIDAD DEL SISTEMA');
    const startTime = Date.now();
    
    const resultado = {
      success: true,
      timestamp: new Date().toISOString(),
      verificaciones: {},
      errores: [],
      advertencias: []
    };
    
    // 1. Verificar configuración
    try {
      console.log('🔍 Verificando configuración...');
      const config = getConfig();
      resultado.verificaciones.configuracion = {
        success: !!config,
        sheets_id: !!config?.SHEETS?.DIRECTORIO,
        cache_duration: config?.CACHE?.DURATION || 0
      };
    } catch (error) {
      resultado.errores.push(`Configuración: ${error.toString()}`);
    }
    
    // 2. Verificar conectividad con spreadsheets
    try {
      console.log('🔍 Verificando conectividad...');
      const ss = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
      const nombreHoja = ss.getName();
      resultado.verificaciones.conectividad = {
        success: true,
        spreadsheet_name: nombreHoja,
        accessible: true
      };
    } catch (error) {
      resultado.errores.push(`Conectividad: ${error.toString()}`);
      resultado.verificaciones.conectividad = { success: false };
    }
    
    // 3. Verificar hoja _ResumenDashboard
    try {
      console.log('🔍 Verificando _ResumenDashboard...');
      const ss = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
      const resumenSheet = ss.getSheetByName('_ResumenDashboard');
      
      if (resumenSheet) {
        const valores = resumenSheet.getRange('B1:B5').getValues();
        const tieneValores = valores.some(fila => fila[0] !== null && fila[0] !== '');
        
        resultado.verificaciones.resumen_dashboard = {
          success: true,
          existe: true,
          tiene_valores: tieneValores,
          valores: valores.map(fila => fila[0])
        };
      } else {
        resultado.errores.push('Hoja _ResumenDashboard no encontrada');
        resultado.verificaciones.resumen_dashboard = { success: false, existe: false };
      }
    } catch (error) {
      resultado.errores.push(`_ResumenDashboard: ${error.toString()}`);
    }
    
    // 4. Verificar funciones críticas
    try {
      console.log('🔍 Verificando funciones críticas...');
      const funcionesCriticas = [
        'getEstadisticasRapidas',
        'cargarDirectorioCompleto', 
        'clearCache',
        'limpiarCacheManualmente'
      ];
      
      const funcionesDisponibles = funcionesCriticas.map(nombre => ({
        nombre: nombre,
        disponible: typeof eval(nombre) === 'function'
      }));
      
      resultado.verificaciones.funciones_criticas = {
        success: funcionesDisponibles.every(f => f.disponible),
        funciones: funcionesDisponibles
      };
      
      const faltantes = funcionesDisponibles.filter(f => !f.disponible);
      if (faltantes.length > 0) {
        resultado.errores.push(`Funciones faltantes: ${faltantes.map(f => f.nombre).join(', ')}`);
      }
    } catch (error) {
      resultado.errores.push(`Funciones críticas: ${error.toString()}`);
    }
    
    // 5. Verificar caché
    try {
      console.log('🔍 Verificando estado de caché...');
      const cacheInfo = getCacheInfo();
      resultado.verificaciones.cache = {
        success: true,
        info: cacheInfo
      };
    } catch (error) {
      resultado.advertencias.push(`Caché: ${error.toString()}`);
      resultado.verificaciones.cache = { success: false };
    }
    
    // 6. Test rápido de estadísticas
    try {
      console.log('🔍 Probando estadísticas rápidas...');
      const stats = getEstadisticasRapidas();
      resultado.verificaciones.estadisticas = {
        success: stats?.success === true,
        tiene_actividad: !!stats?.data?.actividad,
        tiene_metricas: !!stats?.data?.metricas
      };
      
      if (!stats?.success) {
        resultado.errores.push('getEstadisticasRapidas falló');
      }
    } catch (error) {
      resultado.errores.push(`Estadísticas: ${error.toString()}`);
    }
    
    const timeElapsed = Date.now() - startTime;
    resultado.tiempo_total_ms = timeElapsed;
    
    // Determinar resultado final
    if (resultado.errores.length === 0) {
      console.log(`✅ VERIFICACIÓN DE INTEGRIDAD COMPLETADA EN ${timeElapsed}ms`);
      resultado.mensaje = 'Sistema íntegro y funcionando correctamente';
    } else {
      console.log(`❌ VERIFICACIÓN COMPLETADA CON ${resultado.errores.length} ERRORES EN ${timeElapsed}ms`);
      resultado.success = false;
      resultado.mensaje = `Sistema con problemas: ${resultado.errores.length} errores encontrados`;
    }
    
    if (resultado.advertencias.length > 0) {
      resultado.mensaje += ` (${resultado.advertencias.length} advertencias)`;
    }
    
    return resultado;
    
  } catch (error) {
    console.error('❌ ERROR CRÍTICO EN VERIFICACIÓN:', error);
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString(),
      mensaje: 'Error crítico durante la verificación'
    };
  }
}

/**
 * Verificación rápida del sistema (solo lo esencial)
 * @returns {Object} Resultado de verificación rápida
 */
function verificacionRapida() {
  try {
    console.log('⚡ Verificación rápida del sistema...');
    
    const resultado = {
      success: true,
      timestamp: new Date().toISOString(),
      checks: {}
    };
    
    // 1. Config
    resultado.checks.config = !!CONFIG?.SHEETS?.DIRECTORIO;
    
    // 2. Conectividad básica
    try {
      SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
      resultado.checks.conectividad = true;
    } catch {
      resultado.checks.conectividad = false;
      resultado.success = false;
    }
    
    // 3. Estadísticas
    try {
      const stats = getEstadisticasRapidas();
      resultado.checks.estadisticas = stats?.success === true;
    } catch {
      resultado.checks.estadisticas = false;
      resultado.success = false;
    }
    
    // 4. Caché
    try {
      getCacheInfo();
      resultado.checks.cache = true;
    } catch {
      resultado.checks.cache = false;
    }
    
    resultado.mensaje = resultado.success ? 
      'Sistema funcionando correctamente' : 
      'Sistema con problemas detectados';
    
    console.log(`⚡ Verificación rápida: ${resultado.success ? '✅' : '❌'}`);
    return resultado;
    
  } catch (error) {
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString(),
      mensaje: 'Error en verificación rápida'
    };
  }
}

/**
 * Reparación automática de problemas comunes
 * @returns {Object} Resultado de la reparación
 */
function reparacionAutomatica() {
  try {
    console.log('🔧 INICIANDO REPARACIÓN AUTOMÁTICA');
    
    const resultado = {
      success: true,
      timestamp: new Date().toISOString(),
      reparaciones: {},
      errores: []
    };
    
    // 1. Limpiar caché si hay problemas
    try {
      console.log('🔧 Limpiando caché...');
      const limpieza = limpiarCacheRobustoCompleto();
      resultado.reparaciones.cache = limpieza.success;
    } catch (error) {
      resultado.errores.push(`Limpieza caché: ${error.toString()}`);
    }
    
    // 2. Recargar datos críticos
    try {
      console.log('🔧 Recargando datos...');
      const datos = cargarDirectorioCompleto(true);
      resultado.reparaciones.datos = !!datos?.lideres;
    } catch (error) {
      resultado.errores.push(`Recarga datos: ${error.toString()}`);
    }
    
    // 3. Verificar que todo funciona
    try {
      console.log('🔧 Verificando reparación...');
      const verificacion = verificacionRapida();
      resultado.reparaciones.verificacion_final = verificacion.success;
    } catch (error) {
      resultado.errores.push(`Verificación final: ${error.toString()}`);
    }
    
    resultado.success = resultado.errores.length === 0;
    resultado.mensaje = resultado.success ? 
      'Reparación completada exitosamente' : 
      `Reparación parcial: ${resultado.errores.length} errores`;
    
    console.log(`🔧 Reparación: ${resultado.success ? '✅' : '❌'}`);
    return resultado;
    
  } catch (error) {
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString(),
      mensaje: 'Error crítico en reparación'
    };
  }
}

console.log('🛡️ SistemaIntegridad cargado - Verificaciones y reparaciones disponibles');
