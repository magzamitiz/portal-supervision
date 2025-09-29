/**
 * @fileoverview Test simple para verificar que CONFIG está funcionando correctamente
 */

/**
 * Función de prueba para verificar que CONFIG está disponible
 */
function testConfig() {
  try {
    console.log('🧪 Iniciando test de CONFIG...');
    
    // Verificar que CONFIG existe
    if (typeof CONFIG === 'undefined') {
      throw new Error('CONFIG no está definido');
    }
    
    // Verificar propiedades básicas
    if (!CONFIG.SHEETS) {
      throw new Error('CONFIG.SHEETS no está definido');
    }
    
    if (!CONFIG.TABS) {
      throw new Error('CONFIG.TABS no está definido');
    }
    
    if (!CONFIG.SHEETS.DIRECTORIO) {
      throw new Error('CONFIG.SHEETS.DIRECTORIO no está definido');
    }
    
    if (!CONFIG.TABS.LIDERES) {
      throw new Error('CONFIG.TABS.LIDERES no está definido');
    }
    
    console.log('✅ CONFIG está funcionando correctamente');
    console.log('📊 Configuración:', {
      directorio: CONFIG.SHEETS.DIRECTORIO,
      tabLideres: CONFIG.TABS.LIDERES,
      timezone: CONFIG.TIMEZONE
    });
    
    return {
      success: true,
      message: 'CONFIG funcionando correctamente',
      config: {
        directorio: CONFIG.SHEETS.DIRECTORIO,
        tabLideres: CONFIG.TABS.LIDERES,
        timezone: CONFIG.TIMEZONE
      }
    };
    
  } catch (error) {
    console.error('❌ Error en test de CONFIG:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Función de prueba para verificar que getListaDeLideres funciona
 */
function testGetListaDeLideres() {
  try {
    console.log('🧪 Iniciando test de getListaDeLideres...');
    
    const resultado = getListaDeLideres();
    
    if (!resultado) {
      throw new Error('getListaDeLideres retornó undefined');
    }
    
    if (typeof resultado.success === 'undefined') {
      throw new Error('getListaDeLideres no retornó success');
    }
    
    console.log('✅ getListaDeLideres funcionando correctamente');
    console.log('📊 Resultado:', {
      success: resultado.success,
      dataLength: resultado.data ? resultado.data.length : 0,
      error: resultado.error || 'Ninguno'
    });
    
    return {
      success: true,
      message: 'getListaDeLideres funcionando correctamente',
      resultado: resultado
    };
    
  } catch (error) {
    console.error('❌ Error en test de getListaDeLideres:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Función de prueba completa
 */
function ejecutarTestsCompletos() {
  console.log('🚀 Iniciando tests completos...');
  
  const testConfig = testConfig();
  const testLideres = testGetListaDeLideres();
  
  const resultados = {
    config: testConfig,
    lideres: testLideres,
    timestamp: new Date().toISOString()
  };
  
  console.log('📋 Resultados de tests:', resultados);
  
  return resultados;
}

console.log('🧪 TestConfig cargado - Funciones de prueba disponibles');
