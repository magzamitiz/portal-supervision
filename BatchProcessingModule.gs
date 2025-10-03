/**
 * @fileoverview Módulo de procesamiento en batch para optimización de rendimiento
 * Implementa procesamiento por lotes para reducir tiempo de ejecución
 */

// ==================== CONFIGURACIÓN DEL MÓDULO ====================

const BATCH_CONFIG = {
  // Tamaños de batch optimizados por tipo de operación
  SIZES: {
    LDS: 10,           // LDs: operaciones complejas, batch pequeño
    LCFS: 15,          // LCFs: operaciones moderadas
    CELULAS: 20,       // Células: operaciones simples
    METRICAS: 25,      // Métricas: cálculos ligeros
    INGRESOS: 30       // Ingresos: operaciones muy simples
  },
  
  // Configuración de timeout y monitoreo
  TIMEOUT: {
    MAX_BATCH_TIME: 5000,    // 5 segundos por batch
    PROGRESS_INTERVAL: 1000  // Reportar progreso cada segundo
  }
};

// ==================== FUNCIONES DE BATCH PROCESSING ====================

/**
 * Procesa elementos en lotes con monitoreo de progreso
 * @param {Array} items - Array de elementos a procesar
 * @param {Function} processor - Función que procesa cada elemento
 * @param {number} batchSize - Tamaño del lote (opcional)
 * @param {Object} options - Opciones adicionales
 * @returns {Array} Resultados del procesamiento
 */
function processBatch(items, processor, batchSize = 10, options = {}) {
  const startTime = Date.now();
  const totalItems = items.length;
  const results = [];
  
  console.log(`[BatchProcessing] 🚀 Iniciando procesamiento en batch: ${totalItems} elementos, tamaño: ${batchSize}`);
  
  try {
    // Procesar en lotes
    for (let i = 0; i < totalItems; i += batchSize) {
      const batchStartTime = Date.now();
      const batch = items.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(totalItems / batchSize);
      
      console.log(`[BatchProcessing] 📦 Procesando batch ${batchNumber}/${totalBatches} (${batch.length} elementos)`);
      
      // Procesar elementos del batch
      const batchResults = batch.map((item, index) => {
        try {
          return processor(item, i + index);
        } catch (error) {
          console.error(`[BatchProcessing] ❌ Error procesando elemento ${i + index}:`, error);
          return { error: error.toString(), item: item };
        }
      });
      
      results.push(...batchResults);
      
      // Monitoreo de progreso
      const batchTime = Date.now() - batchStartTime;
      const progress = Math.round((i + batch.length) / totalItems * 100);
      
      console.log(`[BatchProcessing] ✅ Batch ${batchNumber} completado: ${batchTime}ms (${progress}%)`);
      
      // Verificar timeout por batch
      if (batchTime > BATCH_CONFIG.TIMEOUT.MAX_BATCH_TIME) {
        console.warn(`[BatchProcessing] ⚠️ Batch ${batchNumber} tardó ${batchTime}ms (límite: ${BATCH_CONFIG.TIMEOUT.MAX_BATCH_TIME}ms)`);
      }
      
      // Pequeña pausa para evitar rate limits
      if (options.pauseBetweenBatches) {
        Utilities.sleep(100);
      }
    }
    
    const totalTime = Date.now() - startTime;
    const avgTimePerItem = totalTime / totalItems;
    
    console.log(`[BatchProcessing] ✅ Procesamiento completado: ${totalTime}ms total, ${avgTimePerItem.toFixed(2)}ms por elemento`);
    
    return results;
    
  } catch (error) {
    console.error('[BatchProcessing] ❌ Error en procesamiento batch:', error);
    throw error;
  }
}

/**
 * Procesa LDs en lotes optimizados
 * @param {Array} lideresLD - Array de LDs a procesar
 * @param {Function} processor - Función de procesamiento
 * @returns {Array} Resultados del procesamiento
 */
function processBatchLDs(lideresLD, processor) {
  console.log(`[BatchProcessing] 🏢 Procesando ${lideresLD.length} LDs en lotes de ${BATCH_CONFIG.SIZES.LDS}`);
  
  return processBatch(
    lideresLD, 
    processor, 
    BATCH_CONFIG.SIZES.LDS,
    { pauseBetweenBatches: true }
  );
}

/**
 * Procesa LCFs en lotes optimizados
 * @param {Array} lcfs - Array de LCFs a procesar
 * @param {Function} processor - Función de procesamiento
 * @returns {Array} Resultados del procesamiento
 */
function processBatchLCFs(lcfs, processor) {
  console.log(`[BatchProcessing] 🏠 Procesando ${lcfs.length} LCFs en lotes de ${BATCH_CONFIG.SIZES.LCFS}`);
  
  return processBatch(
    lcfs, 
    processor, 
    BATCH_CONFIG.SIZES.LCFS,
    { pauseBetweenBatches: true }
  );
}

/**
 * Procesa células en lotes optimizados
 * @param {Array} celulas - Array de células a procesar
 * @param {Function} processor - Función de procesamiento
 * @returns {Array} Resultados del procesamiento
 */
function processBatchCelulas(celulas, processor) {
  console.log(`[BatchProcessing] 👥 Procesando ${celulas.length} células en lotes de ${BATCH_CONFIG.SIZES.CELULAS}`);
  
  return processBatch(
    celulas, 
    processor, 
    BATCH_CONFIG.SIZES.CELULAS,
    { pauseBetweenBatches: false }
  );
}

/**
 * Procesa métricas en lotes optimizados
 * @param {Array} items - Array de elementos para métricas
 * @param {Function} processor - Función de procesamiento
 * @returns {Array} Resultados del procesamiento
 */
function processBatchMetricas(items, processor) {
  console.log(`[BatchProcessing] 📊 Procesando ${items.length} métricas en lotes de ${BATCH_CONFIG.SIZES.METRICAS}`);
  
  return processBatch(
    items, 
    processor, 
    BATCH_CONFIG.SIZES.METRICAS,
    { pauseBetweenBatches: false }
  );
}

/**
 * Procesa ingresos en lotes optimizados
 * @param {Array} ingresos - Array de ingresos a procesar
 * @param {Function} processor - Función de procesamiento
 * @returns {Array} Resultados del procesamiento
 */
function processBatchIngresos(ingresos, processor) {
  console.log(`[BatchProcessing] 💰 Procesando ${ingresos.length} ingresos en lotes de ${BATCH_CONFIG.SIZES.INGRESOS}`);
  
  return processBatch(
    ingresos, 
    processor, 
    BATCH_CONFIG.SIZES.INGRESOS,
    { pauseBetweenBatches: false }
  );
}

// ==================== FUNCIONES DE UTILIDAD ====================

/**
 * Calcula el tamaño óptimo de batch basado en el tipo de operación
 * @param {string} operationType - Tipo de operación
 * @param {number} totalItems - Total de elementos
 * @returns {number} Tamaño óptimo de batch
 */
function calculateOptimalBatchSize(operationType, totalItems) {
  const baseSize = BATCH_CONFIG.SIZES[operationType.toUpperCase()] || 10;
  
  // Ajustar según el total de elementos
  if (totalItems < 20) return Math.min(baseSize, totalItems);
  if (totalItems < 100) return baseSize;
  if (totalItems < 500) return Math.min(baseSize * 1.5, 50);
  
  return Math.min(baseSize * 2, 100);
}

/**
 * Procesa con tamaño de batch dinámico
 * @param {Array} items - Array de elementos
 * @param {Function} processor - Función de procesamiento
 * @param {string} operationType - Tipo de operación
 * @returns {Array} Resultados del procesamiento
 */
function processBatchDynamic(items, processor, operationType) {
  const optimalSize = calculateOptimalBatchSize(operationType, items.length);
  console.log(`[BatchProcessing] 🎯 Tamaño óptimo calculado: ${optimalSize} para ${operationType}`);
  
  return processBatch(items, processor, optimalSize);
}

/**
 * Obtiene estadísticas de rendimiento del batch processing
 * @param {Array} results - Resultados del procesamiento
 * @param {number} startTime - Tiempo de inicio
 * @returns {Object} Estadísticas de rendimiento
 */
function getBatchPerformanceStats(results, startTime) {
  const totalTime = Date.now() - startTime;
  const successCount = results.filter(r => !r.error).length;
  const errorCount = results.filter(r => r.error).length;
  const avgTimePerItem = totalTime / results.length;
  
  return {
    totalTime: totalTime,
    totalItems: results.length,
    successCount: successCount,
    errorCount: errorCount,
    successRate: (successCount / results.length) * 100,
    avgTimePerItem: avgTimePerItem,
    itemsPerSecond: Math.round(1000 / avgTimePerItem)
  };
}

// ==================== FUNCIONES DE TESTING ====================

/**
 * Prueba el rendimiento del batch processing
 * @param {number} itemCount - Número de elementos de prueba
 * @param {string} operationType - Tipo de operación
 * @returns {Object} Resultados de la prueba
 */
function testBatchPerformance(itemCount = 100, operationType = 'METRICAS') {
  console.log(`[BatchProcessing] 🧪 Iniciando prueba de rendimiento: ${itemCount} elementos, tipo: ${operationType}`);
  
  const startTime = Date.now();
  
  // Crear datos de prueba
  const testItems = Array.from({ length: itemCount }, (_, i) => ({
    id: `TEST_${i}`,
    data: Math.random() * 1000
  }));
  
  // Función de procesamiento de prueba
  const testProcessor = (item) => {
    // Simular procesamiento
    const result = Math.sqrt(item.data) * Math.PI;
    return {
      id: item.id,
      result: result,
      processed: true
    };
  };
  
  // Procesar con batch
  const results = processBatchDynamic(testItems, testProcessor, operationType);
  
  // Obtener estadísticas
  const stats = getBatchPerformanceStats(results, startTime);
  
  console.log(`[BatchProcessing] 📊 Prueba completada:`, stats);
  
  return {
    success: true,
    stats: stats,
    results: results.slice(0, 5) // Primeros 5 resultados como muestra
  };
}
