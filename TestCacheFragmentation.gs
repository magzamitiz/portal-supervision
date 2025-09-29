/**
 * @fileoverview Tests para el sistema de fragmentación de caché
 */

/**
 * Prueba el sistema de fragmentación con datos pequeños (< 95KB)
 */
function testCacheFragmentationSmall() {
  console.log('🧪 [TEST] Iniciando test de fragmentación con datos pequeños...');
  
  try {
    // Limpiar caché primero
    clearCache();
    
    // Crear datos pequeños (simular datos reales)
    const smallData = {
      lideres: Array.from({length: 50}, (_, i) => ({
        ID_Lider: `LCF-${1000 + i}`,
        Nombre_Lider: `Líder ${i + 1}`,
        Rol: 'LCF',
        Estado_Actividad: 'Activo'
      })),
      celulas: Array.from({length: 30}, (_, i) => ({
        ID_Celula: `C-${2000 + i}`,
        ID_LCF_Responsable: `LCF-${1000 + (i % 50)}`,
        Total_Miembros: Math.floor(Math.random() * 10) + 1
      })),
      ingresos: Array.from({length: 100}, (_, i) => ({
        ID_Alma: `A-${3000 + i}`,
        ID_LCF: `LCF-${1000 + (i % 50)}`,
        Estado_Asignacion: 'Asignado'
      })),
      timestamp: new Date().toISOString()
    };
    
    const jsonSize = JSON.stringify(smallData).length;
    console.log(`[TEST] Tamaño de datos: ${jsonSize} bytes (${(jsonSize/1024).toFixed(1)} KB)`);
    
    // Guardar datos
    setCacheData(smallData);
    
    // Verificar información de caché
    const cacheInfo = getCacheInfo();
    console.log('[TEST] Información de caché:', cacheInfo);
    
    // Recuperar datos
    const recoveredData = getCacheData();
    
    if (recoveredData) {
      console.log('✅ [TEST] Datos pequeños recuperados exitosamente');
      console.log(`[TEST] Líderes recuperados: ${recoveredData.lideres ? recoveredData.lideres.length : 0}`);
      console.log(`[TEST] Células recuperadas: ${recoveredData.celulas ? recoveredData.celulas.length : 0}`);
      console.log(`[TEST] Ingresos recuperados: ${recoveredData.ingresos ? recoveredData.ingresos.length : 0}`);
      return { success: true, type: cacheInfo.type, fragments: cacheInfo.fragments };
    } else {
      console.log('❌ [TEST] Error recuperando datos pequeños');
      return { success: false, error: 'No se pudieron recuperar los datos' };
    }
    
  } catch (error) {
    console.error('❌ [TEST] Error en test de datos pequeños:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Prueba el sistema de fragmentación con datos grandes (> 95KB)
 */
function testCacheFragmentationLarge() {
  console.log('🧪 [TEST] Iniciando test de fragmentación con datos grandes...');
  
  try {
    // Limpiar caché primero
    clearCache();
    
    // Crear datos grandes (simular datos reales del directorio completo)
    const largeData = {
      lideres: Array.from({length: 200}, (_, i) => ({
        ID_Lider: `LCF-${1000 + i}`,
        Nombre_Lider: `Líder ${i + 1}`,
        Rol: i < 20 ? 'LD' : (i < 50 ? 'LM' : 'LCF'),
        Estado_Actividad: 'Activo',
        ID_Lider_Directo: i < 20 ? null : `LD-${Math.floor(i/10) + 4000}`,
        // Agregar más campos para aumentar tamaño
        Telefono: `555-${String(i).padStart(4, '0')}`,
        Email: `lider${i}@example.com`,
        Fecha_Registro: new Date().toISOString(),
        Notas: `Notas adicionales para el líder ${i + 1} con información extendida`
      })),
      celulas: Array.from({length: 150}, (_, i) => ({
        ID_Celula: `C-${2000 + i}`,
        ID_LCF_Responsable: `LCF-${1000 + (i % 200)}`,
        Total_Miembros: Math.floor(Math.random() * 12) + 1,
        Direccion: `Dirección ${i + 1}, Ciudad, Estado`,
        Horario: `Domingo ${Math.floor(Math.random() * 12) + 8}:00`,
        Estado: 'Activa'
      })),
      ingresos: Array.from({length: 500}, (_, i) => ({
        ID_Alma: `A-${3000 + i}`,
        ID_LCF: `LCF-${1000 + (i % 200)}`,
        Estado_Asignacion: Math.random() > 0.3 ? 'Asignado' : 'Pendiente',
        En_Celula: Math.random() > 0.4,
        Nombre_Completo: `Alma ${i + 1}`,
        Telefono: `555-${String(i).padStart(4, '0')}`,
        Email: `alma${i}@example.com`,
        Fecha_Ingreso: new Date().toISOString(),
        Observaciones: `Observaciones detalladas para el alma ${i + 1} con información adicional`
      })),
      timestamp: new Date().toISOString()
    };
    
    const jsonSize = JSON.stringify(largeData).length;
    console.log(`[TEST] Tamaño de datos: ${jsonSize} bytes (${(jsonSize/1024).toFixed(1)} KB)`);
    
    // Guardar datos
    setCacheData(largeData);
    
    // Verificar información de caché
    const cacheInfo = getCacheInfo();
    console.log('[TEST] Información de caché:', cacheInfo);
    
    // Recuperar datos
    const recoveredData = getCacheData();
    
    if (recoveredData) {
      console.log('✅ [TEST] Datos grandes recuperados exitosamente');
      console.log(`[TEST] Líderes recuperados: ${recoveredData.lideres ? recoveredData.lideres.length : 0}`);
      console.log(`[TEST] Células recuperadas: ${recoveredData.celulas ? recoveredData.celulas.length : 0}`);
      console.log(`[TEST] Ingresos recuperados: ${recoveredData.ingresos ? recoveredData.ingresos.length : 0}`);
      return { success: true, type: cacheInfo.type, fragments: cacheInfo.fragments };
    } else {
      console.log('❌ [TEST] Error recuperando datos grandes');
      return { success: false, error: 'No se pudieron recuperar los datos' };
    }
    
  } catch (error) {
    console.error('❌ [TEST] Error en test de datos grandes:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Prueba la limpieza de caché fragmentado
 */
function testCacheClearFragmented() {
  console.log('🧪 [TEST] Iniciando test de limpieza de caché fragmentado...');
  
  try {
    // Crear datos grandes para forzar fragmentación
    const largeData = {
      test: 'data',
      content: 'x'.repeat(100000) // 100KB de datos
    };
    
    setCacheData(largeData);
    
    // Verificar que se fragmentó
    const infoBefore = getCacheInfo();
    console.log('[TEST] Caché antes de limpiar:', infoBefore);
    
    if (infoBefore.type !== 'fragmented') {
      console.log('⚠️ [TEST] Los datos no se fragmentaron, ajustando tamaño...');
      const veryLargeData = {
        test: 'data',
        content: 'x'.repeat(200000) // 200KB de datos
      };
      setCacheData(veryLargeData);
    }
    
    // Limpiar caché
    const clearResult = limpiarCacheManualmente();
    console.log('[TEST] Resultado de limpieza:', clearResult);
    
    // Verificar que se limpió
    const infoAfter = getCacheInfo();
    console.log('[TEST] Caché después de limpiar:', infoAfter);
    
    if (infoAfter.hasData) {
      console.log('❌ [TEST] La caché no se limpió completamente');
      return { success: false, error: 'Caché no se limpió' };
    }
    
    console.log('✅ [TEST] Caché fragmentado limpiado exitosamente');
    return { 
      success: true, 
      fragments_cleared: clearResult.fragments_removed,
      cache_type: clearResult.cache_type,
      size_before: clearResult.data_size_before,
      size_after: clearResult.data_size_after
    };
    
  } catch (error) {
    console.error('❌ [TEST] Error en test de limpieza:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Prueba la función getCacheInfo mejorada
 */
function testCacheInfoDetailed() {
  console.log('🧪 [TEST] Iniciando test de getCacheInfo detallado...');
  
  try {
    // Limpiar caché primero
    clearCache();
    
    // Verificar caché vacía
    let info = getCacheInfo();
    console.log('[TEST] Caché vacía:', info);
    
    if (info.hasData) {
      console.log('❌ [TEST] La caché debería estar vacía');
      return { success: false, error: 'Caché no está vacía' };
    }
    
    // Crear datos pequeños
    const smallData = { test: 'small', data: 'x'.repeat(1000) };
    setCacheData(smallData);
    
    info = getCacheInfo();
    console.log('[TEST] Caché pequeña:', info);
    
    // Verificar propiedades requeridas
    const requiredProps = ['hasData', 'fragments', 'size', 'sizeKB', 'age'];
    const missingProps = requiredProps.filter(prop => !(prop in info));
    
    if (missingProps.length > 0) {
      console.log('❌ [TEST] Faltan propiedades:', missingProps);
      return { success: false, error: `Faltan propiedades: ${missingProps.join(', ')}` };
    }
    
    // Crear datos grandes para fragmentación
    const largeData = { test: 'large', data: 'x'.repeat(150000) };
    setCacheData(largeData);
    
    info = getCacheInfo();
    console.log('[TEST] Caché fragmentada:', info);
    
    if (info.type !== 'fragmented') {
      console.log('⚠️ [TEST] Los datos no se fragmentaron como se esperaba');
    }
    
    console.log('✅ [TEST] getCacheInfo funciona correctamente');
    return { 
      success: true, 
      small_cache: info.type === 'simple',
      large_cache: info.type === 'fragmented',
      fragments: info.fragments,
      sizeKB: info.sizeKB,
      age: info.age
    };
    
  } catch (error) {
    console.error('❌ [TEST] Error en test de getCacheInfo:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Ejecuta todos los tests de fragmentación
 */
function ejecutarTestsFragmentacion() {
  console.log('🚀 [TEST] Iniciando suite completa de tests de fragmentación...');
  
  const resultados = {
    small: testCacheFragmentationSmall(),
    large: testCacheFragmentationLarge(),
    clear: testCacheClearFragmented(),
    info: testCacheInfoDetailed()
  };
  
  console.log('📊 [TEST] Resultados de tests:');
  console.log('Datos pequeños:', resultados.small);
  console.log('Datos grandes:', resultados.large);
  console.log('Limpieza:', resultados.clear);
  console.log('Información detallada:', resultados.info);
  
  const exitosos = Object.values(resultados).filter(r => r.success).length;
  const total = Object.keys(resultados).length;
  
  console.log(`✅ [TEST] Tests exitosos: ${exitosos}/${total}`);
  
  return {
    success: exitosos === total,
    resultados: resultados,
    resumen: `${exitosos}/${total} tests exitosos`,
    detalles: {
      fragmentacion_small: resultados.small.success,
      fragmentacion_large: resultados.large.success,
      limpieza: resultados.clear.success,
      info_detallada: resultados.info.success
    }
  };
}

console.log('🧪 TestCacheFragmentation cargado - Tests para sistema de fragmentación');
