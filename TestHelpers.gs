/**
 * TestHelpers.gs - Funciones auxiliares para pruebas
 * Obtiene IDs válidos del sistema en lugar de usar hardcodeados
 */

/**
 * Obtiene un ID de LCF válido del sistema para pruebas
 * @returns {string|null} ID del primer LCF encontrado o null si no hay
 */
function obtenerLCFValidoParaPruebas() {
  try {
    const directorio = cargarDirectorioCompleto();
    const lcf = (directorio.lideres || []).find(lider => lider.Rol === 'LCF');
    
    if (!lcf) {
      console.error('❌ No se encontró ningún LCF en el directorio');
      throw new Error('No se encontró un LCF válido en el directorio para pruebas');
    }
    
    console.log(`✅ LCF válido encontrado para pruebas: ${lcf.ID_Lider} (${lcf.Nombre_Lider})`);
    return lcf.ID_Lider;
    
  } catch (error) {
    console.error('❌ Error obteniendo LCF válido:', error);
    return null;
  }
}

/**
 * Obtiene múltiples LCFs válidos para pruebas exhaustivas
 * @param {number} cantidad - Número de LCFs a obtener
 * @returns {Array} Array de IDs de LCF
 */
function obtenerVariosLCFsParaPruebas(cantidad = 3) {
  try {
    const directorio = cargarDirectorioCompleto();
    const lcfs = (directorio.lideres || [])
      .filter(lider => lider.Rol === 'LCF')
      .slice(0, cantidad)
      .map(lcf => ({
        id: lcf.ID_Lider,
        nombre: lcf.Nombre_Lider
      }));
    
    if (lcfs.length === 0) {
      throw new Error('No se encontraron LCFs en el directorio');
    }
    
    console.log(`✅ ${lcfs.length} LCFs encontrados para pruebas`);
    return lcfs;
    
  } catch (error) {
    console.error('❌ Error obteniendo LCFs:', error);
    return [];
  }
}

/**
 * Diagnostica y lista todos los LCFs disponibles
 * @returns {Object} Información completa de LCFs
 */
function diagnosticarLCFsDisponibles() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 DIAGNÓSTICO DE LCFs DISPONIBLES');
  console.log('='.repeat(60) + '\n');
  
  try {
    const directorio = cargarDirectorioCompleto();
    const todosLCFs = (directorio.lideres || []).filter(l => l.Rol === 'LCF');
    
    console.log(`📊 Total de LCFs en el sistema: ${todosLCFs.length}`);
    
    if (todosLCFs.length === 0) {
      console.error('❌ No hay LCFs en el sistema');
      return { success: false, total: 0, lcfs: [] };
    }
    
    console.log('\n📋 Primeros 5 LCFs disponibles:');
    console.log('-'.repeat(40));
    
    todosLCFs.slice(0, 5).forEach((lcf, index) => {
      console.log(`${index + 1}. ${lcf.ID_Lider} - ${lcf.Nombre_Lider}`);
    });
    
    const primerLCF = todosLCFs[0];
    console.log('\n✅ Recomendación para pruebas:');
    console.log(`   Usar ID: "${primerLCF.ID_Lider}"`);
    console.log(`   Nombre: ${primerLCF.Nombre_Lider}`);
    
    return {
      success: true,
      total: todosLCFs.length,
      primerLCF: {
        id: primerLCF.ID_Lider,
        nombre: primerLCF.Nombre_Lider
      },
      lcfs: todosLCFs.slice(0, 5)
    };
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    return { success: false, error: error.toString() };
  }
}
