/**
 * @fileoverview Script temporal para limpiar caché y probar carga de datos
 */

/**
 * Limpia el caché y fuerza recarga de datos
 */
function testLimpiarCacheYRecargar() {
  console.log('🧹 Limpiando caché...');
  
  // Limpiar caché
  clearCache();
  console.log('✅ Caché limpiado');
  
  // Forzar recarga
  console.log('🔄 Forzando recarga de datos...');
  const datos = cargarDirectorioCompleto(true);
  
  console.log('📊 Resultado de recarga:');
  console.log(`  - Líderes: ${datos.lideres ? datos.lideres.length : 0}`);
  console.log(`  - Células: ${datos.celulas ? datos.celulas.length : 0}`);
  console.log(`  - Ingresos: ${datos.ingresos ? datos.ingresos.length : 0}`);
  console.log(`  - Error: ${datos.error || 'Ninguno'}`);
  
  return datos;
}

/**
 * Limpia todo el caché del script (incluyendo caché de LDs individuales)
 */
function limpiarTodoElCache() {
  console.log('🧹 Limpiando TODO el caché...');
  
  try {
    const cache = CacheService.getScriptCache();
    
    // Limpiar keys específicos conocidos
    cache.removeAll([
      'DASHBOARD_DATA_V2',
      'LD_FULL_LD-4003',
      'LD_FULL_LD-4001',
      'LD_BASIC_LD-4003',
      'LD_BASIC_LD-4001'
    ]);
    
    console.log('✅ Caché de LDs limpiado');
    
    // También limpiar el caché de cargarDirectorioCompleto
    clearCache();
    
    console.log('✅ TODO el caché ha sido limpiado');
    
    return { success: true, message: 'Caché limpiado completamente' };
    
  } catch (error) {
    console.error('❌ Error limpiando caché:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Test para verificar que LD-4003 se puede encontrar después de limpiar caché
 */
function testBuscarLD4003() {
  console.log('🔍 Test: Buscando LD-4003...');
  
  // Limpiar TODO el caché primero
  limpiarTodoElCache();
  
  // Intentar obtener datos del LD
  const resultado = getDatosLD('LD-4003', true);
  
  console.log('📊 Resultado:');
  console.log(`  - Success: ${resultado.success}`);
  console.log(`  - Tiene resumen: ${!!resultado.resumen}`);
  console.log(`  - Error: ${resultado.error || 'Ninguno'}`);
  
  if (resultado.success && resultado.resumen) {
    console.log('✅ LD-4003 encontrado con estructura correcta');
    console.log(`  - Nombre: ${resultado.resumen.ld?.Nombre_Lider || 'N/A'}`);
    console.log(`  - Total LCF: ${resultado.resumen.Total_LCF || 0}`);
    console.log(`  - Total Células: ${resultado.resumen.Total_Celulas || 0}`);
    console.log(`  - Total Miembros: ${resultado.resumen.Total_Miembros || 0}`);
    console.log(`  - Total Ingresos: ${resultado.resumen.Total_Ingresos || 0}`);
  } else {
    console.log('❌ LD-4003 NO encontrado o estructura incorrecta');
  }
  
  return resultado;
}

console.log('🧪 TestCacheClear cargado - Ejecuta testLimpiarCacheYRecargar() o testBuscarLD4003()');
