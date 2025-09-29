/**
 * @fileoverview Módulo de protección contra timeouts.
 * Implementa el sistema de timeout exacto del código original.
 */

// ==================== CONFIGURACIÓN DEL MÓDULO ====================

const SCRIPT_START_TIME = Date.now();
const MAX_EXECUTION_TIME = 25000; // 25 segundos (dejar margen de 5s)

// ==================== FUNCIONES DE TIMEOUT ====================

/**
 * Verifica si la operación ha excedido el tiempo máximo de ejecución.
 * @throws {Error} Si se excede el tiempo máximo
 */
function checkTimeout() {
  if (Date.now() - SCRIPT_START_TIME > MAX_EXECUTION_TIME) {
    console.error('[TIMEOUT] Operación excedió tiempo máximo');
    throw new Error('Timeout: La operación tardó demasiado tiempo');
  }
}

/**
 * Obtiene el tiempo transcurrido desde el inicio del script.
 * @returns {number} Tiempo transcurrido en milisegundos
 */
function getElapsedTime() {
  return Date.now() - SCRIPT_START_TIME;
}

/**
 * Obtiene el tiempo restante antes del timeout.
 * @returns {number} Tiempo restante en milisegundos
 */
function getRemainingTime() {
  return Math.max(0, MAX_EXECUTION_TIME - getElapsedTime());
}

/**
 * Verifica si queda tiempo suficiente para completar una operación.
 * @param {number} estimatedTime - Tiempo estimado para la operación en ms
 * @returns {boolean} True si hay tiempo suficiente
 */
function hasEnoughTime(estimatedTime) {
  return getRemainingTime() > estimatedTime;
}

/**
 * Ejecuta una función con verificación de timeout.
 * @param {Function} func - Función a ejecutar
 * @param {string} operationName - Nombre de la operación para logging
 * @returns {*} Resultado de la función
 */
function executeWithTimeout(func, operationName = 'Operación') {
  try {
    checkTimeout();
    console.log(`[TIMEOUT] Ejecutando: ${operationName} (Tiempo restante: ${getRemainingTime()}ms)`);
    const result = func();
    checkTimeout();
    return result;
  } catch (error) {
    if (error.message.includes('Timeout')) {
      console.error(`[TIMEOUT] ${operationName} interrumpida por timeout`);
      throw error;
    }
    throw error;
  }
}

/**
 * Obtiene información sobre el estado del timeout.
 * @returns {Object} Información del estado del timeout
 */
function getTimeoutInfo() {
  const elapsed = getElapsedTime();
  const remaining = getRemainingTime();
  return {
    startTime: SCRIPT_START_TIME,
    elapsedTime: elapsed,
    remainingTime: remaining,
    maxExecutionTime: MAX_EXECUTION_TIME,
    isNearTimeout: remaining < 5000, // Menos de 5 segundos
    percentageUsed: (elapsed / MAX_EXECUTION_TIME) * 100
  };
}

console.log('⏱️ TimeoutModule cargado - Protección contra timeouts activa');
