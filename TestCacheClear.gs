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
 * Test para verificar que LD-4003 se puede encontrar después de limpiar caché
 */
function testBuscarLD4003() {
  console.log('🔍 Test: Buscando LD-4003...');
  
  // Limpiar caché primero
  clearCache();
  
  // Intentar obtener datos del LD
  const resultado = getDatosLD('LD-4003', true);
  
  console.log('📊 Resultado:');
  console.log(`  - Success: ${resultado.success}`);
  console.log(`  - Error: ${resultado.error || 'Ninguno'}`);
  
  if (resultado.success) {
    console.log('✅ LD-4003 encontrado correctamente');
    console.log(`  - Nombre: ${resultado.resumen?.Nombre_LD || 'N/A'}`);
    console.log(`  - Total LCF: ${resultado.resumen?.Total_LCF || 0}`);
  } else {
    console.log('❌ LD-4003 NO encontrado');
  }
  
  return resultado;
}

console.log('🧪 TestCacheClear cargado - Ejecuta testLimpiarCacheYRecargar() o testBuscarLD4003()');
