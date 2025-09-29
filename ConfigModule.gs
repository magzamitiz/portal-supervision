/**
 * @fileoverview Módulo de configuración central del sistema.
 * Contiene todas las constantes y configuraciones necesarias para el funcionamiento del portal.
 */

// ==================== CONFIGURACIÓN PRINCIPAL ====================

/**
 * Configuración principal del sistema Portal de Supervisión
 * @constant {Object} CONFIG
 */
const CONFIG = {
  SHEETS: {
    DIRECTORIO: '1dwuqpyMXWHJvnJHwDHCqFMvgdYhypE2W1giH6bRZMKc',
    REPORTE_CELULAS: '18wOkxTauLETdpkEy5qsd0shlZUf8FsfQg9oCN8-pCxI',
    VISITAS_BENDICION: '1md72JN8LOJCpBLrPIGP9HQG8GQ1RzFFE-hAOlawQ2eg',
    REGISTRO_INTERACCIONES: '1Rzx4k6ipkFvVpTYdisjAYSwGuIgyWiYFBsYu4RHFWPs'
  },

  // VERIFICA QUE ESTOS NOMBRES COINCIDAN EXACTAMENTE CON TUS PESTAÑAS
  TABS: {
    LIDERES: 'Directorio de Líderes',
    CELULAS: 'Directorio de Células',
    INGRESOS: 'Ingresos',
    // Nombres de las pestañas en los archivos de actividad. Si es NULL, se usa la primera hoja (ideal para formularios).
    ACTIVIDAD_CELULAS: 'Reportes_Celulas',
    ACTIVIDAD_VISITAS: 'Registro de Visitas',
  },

  // Configuración de actividad
  DIAS_INACTIVO: {
    ACTIVO: 7,
    ALERTA: 14,
    INACTIVO: 30
  },

  // Configuración de células y carga
  CELULAS: { 
    MIN_MIEMBROS: 3, 
    IDEAL_MIEMBROS: 8, 
    MAX_MIEMBROS: 12 
  },
  
  CARGA_LCF: { 
    OPTIMA: 10, 
    MODERADA: 20, 
    ALTA: 30 
  },

  // Configuración de Caché (Importante para rendimiento)
  CACHE: {
    DURATION: 1800 // 30 minutos (en segundos)
  },

  // Zona Horaria del Proyecto (Importante para calcular "Hoy")
  TIMEZONE: Session.getScriptTimeZone()
};

// ==================== FUNCIONES DE UTILIDAD ====================

/**
 * Obtiene la configuración del sistema
 * @returns {Object} Objeto de configuración
 */
function getConfig() {
  return CONFIG;
}

/**
 * Obtiene la configuración de hojas de cálculo
 * @returns {Object} Configuración de hojas
 */
function getSheetsConfig() {
  return CONFIG.SHEETS;
}

/**
 * Obtiene la configuración de pestañas
 * @returns {Object} Configuración de pestañas
 */
function getTabsConfig() {
  return CONFIG.TABS;
}

/**
 * Obtiene la configuración de días de inactividad
 * @returns {Object} Configuración de días de inactividad
 */
function getDiasInactivoConfig() {
  return CONFIG.DIAS_INACTIVO;
}

/**
 * Obtiene la configuración de células
 * @returns {Object} Configuración de células
 */
function getCelulasConfig() {
  return CONFIG.CELULAS;
}

/**
 * Obtiene la configuración de carga de LCF
 * @returns {Object} Configuración de carga de LCF
 */
function getCargaLCFConfig() {
  return CONFIG.CARGA_LCF;
}

/**
 * Obtiene la configuración de caché
 * @returns {Object} Configuración de caché
 */
function getCacheConfig() {
  return CONFIG.CACHE;
}

/**
 * Obtiene la zona horaria del proyecto
 * @returns {string} Zona horaria
 */
function getTimezone() {
  return CONFIG.TIMEZONE;
}

console.log('⚙️ ConfigModule cargado - Configuración central del sistema disponible');
