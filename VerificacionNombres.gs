/**
 * FUNCIÓN DE VERIFICACIÓN RÁPIDA
 * Ejecuta esta función en Apps Script para verificar los nombres reales de la hoja
 */
function verificarNombresReales() {
  console.log('🔍 VERIFICACIÓN: Nombres reales en _ResumenDashboard');
  console.log('='.repeat(60));
  
  try {
    // Leer la hoja _ResumenDashboard
    const ss = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    const resumenSheet = ss.getSheetByName('_ResumenDashboard');
    
    if (!resumenSheet) {
      console.error('❌ Hoja _ResumenDashboard no encontrada');
      return;
    }
    
    // Leer un rango amplio para capturar todas las métricas
    const valores = resumenSheet.getRange('A1:B30').getValues();
    
    console.log('📊 NOMBRES REALES EN LA HOJA:');
    console.log('='.repeat(50));
    
    const metricas = {};
    valores.forEach((row, index) => {
      if (row[0] && row[0].toString().trim()) {
        const nombre = row[0].toString().trim();
        const valor = row[1] || 0;
        metricas[nombre] = valor;
        
        console.log(`${String(index + 1).padStart(2, '0')}. "${nombre}": ${valor}`);
      }
    });
    
    console.log('\n🔍 COMPARACIÓN CON EL CÓDIGO:');
    console.log('='.repeat(50));
    
    // Nombres que el código busca
    const nombresCodigo = [
      'Total Asistencia Células',
      'Activos recibiendo célula', 
      '2 a 3 semanas sin recibir celula',
      'Más de 1 mes sin recibir celula',
      'Líderes hibernando',
      'Total Líderes',
      'Total Células',
      'Total Ingresos'
    ];
    
    nombresCodigo.forEach(nombre => {
      const existe = metricas.hasOwnProperty(nombre);
      const valor = metricas[nombre] || 0;
      const status = existe ? '✅' : '❌';
      console.log(`${status} "${nombre}": ${existe ? valor : 'NO ENCONTRADO'}`);
    });
    
    console.log('\n📋 RESUMEN:');
    console.log('='.repeat(50));
    
    const coincidencias = nombresCodigo.filter(nombre => metricas.hasOwnProperty(nombre));
    const fallos = nombresCodigo.filter(nombre => !metricas.hasOwnProperty(nombre));
    
    console.log(`✅ Coincidencias: ${coincidencias.length}/${nombresCodigo.length}`);
    console.log(`❌ Fallos: ${fallos.length}/${nombresCodigo.length}`);
    
    if (fallos.length > 0) {
      console.log('\n⚠️ NOMBRES QUE FALLAN:');
      fallos.forEach(nombre => {
        console.log(`   - "${nombre}"`);
      });
      
      console.log('\n💡 NOMBRES SIMILARES ENCONTRADOS:');
      fallos.forEach(nombreBuscado => {
        const similares = Object.keys(metricas).filter(nombre => 
          nombre.toLowerCase().includes(nombreBuscado.toLowerCase().split(' ')[0])
        );
        if (similares.length > 0) {
          console.log(`   Para "${nombreBuscado}":`);
          similares.forEach(similar => {
            console.log(`     - "${similar}"`);
          });
        }
      });
    }
    
    return {
      metricas: metricas,
      coincidencias: coincidencias.length,
      fallos: fallos.length,
      nombresFallidos: fallos
    };
    
  } catch (error) {
    console.error('❌ Error en verificación:', error);
    return null;
  }
}

/**
 * FUNCIÓN DE PRUEBA RÁPIDA
 * Ejecuta esta función para probar getEstadisticasRapidas() con los nombres actuales
 */
function probarEstadisticasActuales() {
  console.log('🧪 PRUEBA: getEstadisticasRapidas() con nombres actuales');
  console.log('='.repeat(60));
  
  try {
    const stats = getEstadisticasRapidas();
    
    if (stats.success && stats.data) {
      console.log('✅ getEstadisticasRapidas() ejecutada exitosamente');
      console.log('📊 Datos obtenidos:');
      console.log('  fila1:', stats.data.fila1);
      console.log('  fila2:', stats.data.fila2);
      console.log('  calculadas:', stats.data.calculadas);
      
      // Verificar si hay valores en cero
      const valoresFila1 = Object.values(stats.data.fila1);
      const valoresFila2 = Object.values(stats.data.fila2);
      const todosValores = [...valoresFila1, ...valoresFila2];
      
      const valoresEnCero = todosValores.filter(valor => valor === 0).length;
      const totalValores = todosValores.length;
      
      console.log(`\n📈 Análisis de valores:`);
      console.log(`  Total valores: ${totalValores}`);
      console.log(`  Valores en cero: ${valoresEnCero}`);
      console.log(`  Valores no cero: ${totalValores - valoresEnCero}`);
      
      if (valoresEnCero > totalValores / 2) {
        console.log('⚠️ ADVERTENCIA: Más de la mitad de valores están en cero');
        console.log('💡 Esto sugiere que hay problemas con los nombres de las métricas');
      } else {
        console.log('✅ La mayoría de valores son no-cero, sistema funcionando');
      }
      
    } else {
      console.error('❌ Error en getEstadisticasRapidas():', stats.error);
    }
    
    return stats;
    
  } catch (error) {
    console.error('❌ Error crítico en prueba:', error);
    return null;
  }
}
