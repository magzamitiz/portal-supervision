/**
 * DOCUMENTACIÓN DE API - PORTAL DE SUPERVISIÓN
 * Etapa 1: Documentación completa de la API existente
 * 
 * Este archivo documenta todas las funciones públicas y su comportamiento
 * para garantizar compatibilidad durante el refactoring.
 */

// ==================== API PRINCIPAL - FUNCIONES WEB ====================

/**
 * @function doGet
 * @description Función principal de entrada para la aplicación web
 * @param {Object} e - Parámetros de la petición GET (opcional)
 * @returns {HtmlService.HtmlOutput} Página HTML del dashboard
 * @example
 * // Llamada automática por Apps Script
 * const html = doGet({});
 */
// COMPORTAMIENTO ACTUAL:
// - Crea template HTML desde 'Dashboard'
// - Establece título 'Portal de Supervisión V2.0'
// - Configura XFrameOptions para permitir iframe
// - Agrega meta tag viewport
// - En caso de error, retorna página de error HTML

// ==================== API DE DATOS PRINCIPALES ====================

/**
 * @function getEstadisticasRapidas
 * @description Obtiene estadísticas principales del dashboard de forma optimizada
 * @returns {Object} Respuesta con estadísticas principales
 * @returns {boolean} returns.success - Indica si la operación fue exitosa
 * @returns {Object} returns.data - Datos de estadísticas
 * @returns {Object} returns.data.lideres - Conteos de líderes
 * @returns {number} returns.data.lideres.total_LD - Total de Líderes de Discípulos
 * @returns {number} returns.data.lideres.total_LCF - Total de Líderes de Células y Familias
 * @returns {Object} returns.data.celulas - Conteos de células
 * @returns {number} returns.data.celulas.total_celulas - Total de células
 * @returns {Object} returns.data.ingresos - Métricas de ingresos
 * @returns {number} returns.data.ingresos.total_historico - Total histórico de ingresos
 * @returns {number} returns.data.ingresos.ingresos_mes - Ingresos del mes actual
 * @returns {string} returns.data.ingresos.tasa_integracion_celula - Tasa de integración (formato "XX.X")
 * @returns {Object} returns.data.metricas - Métricas calculadas
 * @returns {string} returns.data.metricas.promedio_lcf_por_ld - Promedio de LCF por LD
 * @returns {string} returns.data.timestamp - Timestamp ISO de la consulta
 * @returns {string} returns.error - Mensaje de error (solo si success=false)
 * 
 * @example
 * const stats = getEstadisticasRapidas();
 * if (stats.success) {
 *   console.log(`Total LD: ${stats.data.lideres.total_LD}`);
 *   console.log(`Total LCF: ${stats.data.lideres.total_LCF}`);
 * }
 */
// COMPORTAMIENTO ACTUAL:
// - Lee hoja '_ResumenDashboard' del spreadsheet principal
// - Obtiene valores de rango B1:B7
// - Calcula métricas derivadas
// - Retorna estructura estandarizada
// - Maneja errores de forma controlada

/**
 * @function getListaDeLideres
 * @description Obtiene lista de líderes LD para menús desplegables
 * @returns {Object} Respuesta con lista de líderes
 * @returns {boolean} returns.success - Indica si la operación fue exitosa
 * @returns {Array} returns.data - Array de líderes LD
 * @returns {string} returns.data[].ID_Lider - ID único del líder
 * @returns {string} returns.data[].Nombre_Lider - Nombre completo del líder
 * @returns {string} returns.error - Mensaje de error (solo si success=false)
 * 
 * @example
 * const lideres = getListaDeLideres();
 * if (lideres.success) {
 *   lideres.data.forEach(lider => {
 *     console.log(`${lider.ID_Lider}: ${lider.Nombre_Lider}`);
 *   });
 * }
 */
// COMPORTAMIENTO ACTUAL:
// - Lee hoja 'Directorio de Líderes'
// - Filtra solo líderes con Rol='LD'
// - Retorna solo ID y Nombre para optimización
// - Maneja casos de hoja no encontrada

/**
 * @function cargarDirectorioCompleto
 * @description Carga todos los datos del directorio principal
 * @param {boolean} forceReload - Si true, ignora caché y recarga desde Sheets
 * @returns {Object} Datos completos del directorio
 * @returns {Array} returns.lideres - Array de todos los líderes
 * @returns {Array} returns.celulas - Array de todas las células
 * @returns {Array} returns.ingresos - Array de todos los ingresos
 * @returns {string} returns.timestamp - Timestamp de la carga
 * 
 * @example
 * const datos = cargarDirectorioCompleto(false);
 * console.log(`${datos.lideres.length} líderes cargados`);
 */
// COMPORTAMIENTO ACTUAL:
// - Usa sistema de caché con compresión GZIP
// - Carga 3 hojas principales del directorio
// - Procesa y normaliza datos
// - Retorna estructura completa para análisis

/**
 * @function forceReloadDashboardData
 * @description Fuerza recarga completa de datos ignorando caché
 * @returns {Object} Respuesta con análisis completo
 * @returns {boolean} returns.success - Indica si la operación fue exitosa
 * @returns {Object} returns.data - Análisis completo de datos
 * @returns {Object} returns.data.lideres - Análisis de líderes
 * @returns {Object} returns.data.celulas - Análisis de células
 * @returns {Object} returns.data.ingresos - Análisis de ingresos
 * @returns {Object} returns.data.metricas - Métricas generales
 * @returns {Array} returns.data.alertas - Array de alertas
 * @returns {string} returns.error - Mensaje de error (solo si success=false)
 * 
 * @example
 * const reload = forceReloadDashboardData();
 * if (reload.success) {
 *   console.log(`${reload.data.alertas.length} alertas encontradas`);
 * }
 */
// COMPORTAMIENTO ACTUAL:
// - Ignora completamente la caché
// - Recarga desde Google Sheets
// - Ejecuta análisis completo
// - Genera métricas y alertas
// - Retorna estructura completa

// ==================== API DE DATOS ESPECÍFICOS ====================

/**
 * @function getVistaRapidaLCF
 * @description Obtiene vista rápida del seguimiento de un LCF específico
 * @param {string} idLCF - ID del Líder de Células y Familias
 * @returns {Object} Respuesta con vista rápida
 * @returns {boolean} returns.success - Indica si la operación fue exitosa
 * @returns {string} returns.lcf - Nombre del LCF
 * @returns {Array} returns.almas - Array de almas con seguimiento resumido
 * @returns {string} returns.almas[].Nombre - Nombre completo del alma
 * @returns {string} returns.almas[].Telefono - Teléfono de contacto
 * @returns {string} returns.almas[].Acepta_Visita - Si acepta visita (SI/NO)
 * @returns {string} returns.almas[].Peticion - Petición específica
 * @returns {string} returns.almas[].Bienvenida - Estado de bienvenida (símbolo)
 * @returns {string} returns.almas[].Visita - Estado de visita (símbolo)
 * @returns {string} returns.almas[].Celulas - Progreso en células (X/12)
 * @returns {string} returns.almas[].Estado - Estado actual del alma
 * @returns {number} returns.almas[].Dias_Sin_Seguimiento - Días sin seguimiento
 * @returns {string} returns.almas[].ID_Alma - ID único del alma
 * @returns {string} returns.error - Mensaje de error (solo si success=false)
 * 
 * @example
 * const vista = getVistaRapidaLCF('LCF001');
 * if (vista.success) {
 *   vista.almas.forEach(alma => {
 *     console.log(`${alma.Nombre}: ${alma.Estado} (${alma.Dias_Sin_Seguimiento} días)`);
 *   });
 * }
 */
// COMPORTAMIENTO ACTUAL:
// - Llama internamente a getSeguimientoAlmasLCF_REAL
// - Simplifica datos para vista rápida
// - Retorna solo campos esenciales
// - Maneja errores de LCF no encontrado

/**
 * @function getSeguimientoAlmasLCF
 * @description Obtiene seguimiento completo de almas de un LCF
 * @param {string} idLCF - ID del Líder de Células y Familias
 * @returns {Object} Respuesta con seguimiento completo
 * @returns {boolean} returns.success - Indica si la operación fue exitosa
 * @returns {Object} returns.lcf - Información del LCF
 * @returns {Array} returns.almas - Array de almas con seguimiento completo
 * @returns {Object} returns.almas[].Bienvenida - Objeto con detalles de bienvenida
 * @returns {Object} returns.almas[].Visita_Bendicion - Objeto con detalles de visita
 * @returns {Object} returns.almas[].Progreso_Celulas - Objeto con progreso en células
 * @returns {string} returns.error - Mensaje de error (solo si success=false)
 * 
 * @example
 * const seguimiento = getSeguimientoAlmasLCF('LCF001');
 * if (seguimiento.success) {
 *   seguimiento.almas.forEach(alma => {
 *     console.log(`Bienvenida: ${alma.Bienvenida.simbolo}`);
 *     console.log(`Visita: ${alma.Visita_Bendicion.simbolo}`);
 *   });
 * }
 */
// COMPORTAMIENTO ACTUAL:
// - Wrapper que llama a getSeguimientoAlmasLCF_REAL
// - Mantiene compatibilidad con código existente
// - Retorna estructura completa de seguimiento

/**
 * @function getResumenLCF
 * @description Obtiene resumen de métricas para un LCF específico
 * @param {string} idLCF - ID del Líder de Células y Familias
 * @returns {Object} Respuesta con resumen de métricas
 * @returns {boolean} returns.success - Indica si la operación fue exitosa
 * @returns {Object} returns.data - Métricas del LCF
 * @returns {number} returns.data.totalAlmas - Total de almas asignadas
 * @returns {number} returns.data.conBienvenida - Almas con bienvenida completada
 * @returns {number} returns.data.conVisita - Almas con visita realizada
 * @returns {number} returns.data.enCelula - Almas integradas en células
 * @returns {string} returns.error - Mensaje de error (solo si success=false)
 * 
 * @example
 * const resumen = getResumenLCF('LCF001');
 * if (resumen.success) {
 *   console.log(`Total: ${resumen.data.totalAlmas}`);
 *   console.log(`En células: ${resumen.data.enCelula}`);
 * }
 */
// COMPORTAMIENTO ACTUAL:
// - Lee hoja '_SeguimientoConsolidado'
// - Filtra datos por ID_LCF
// - Calcula métricas específicas
// - Maneja casos de hoja no encontrada

// ==================== API DE OPERACIONES ====================

/**
 * @function darDeBajaAlmasEnLote
 * @description Da de baja múltiples almas en operación optimizada
 * @param {Array} idAlmasArray - Array de IDs de almas a dar de baja
 * @returns {Object} Respuesta de la operación
 * @returns {boolean} returns.success - Indica si la operación fue exitosa
 * @returns {string} returns.message - Mensaje de confirmación
 * @returns {string} returns.error - Mensaje de error (solo si success=false)
 * 
 * @example
 * const resultado = darDeBajaAlmasEnLote(['A001', 'A002', 'A003']);
 * if (resultado.success) {
 *   console.log(resultado.message);
 * }
 */
// COMPORTAMIENTO ACTUAL:
// - Usa LockService para evitar conflictos
// - Modifica solo celdas específicas (no toda la hoja)
// - Usa getRangeList para operación batch
// - Maneja timeouts y errores de bloqueo

/**
 * @function limpiarCacheManualmente
 * @description Limpia manualmente la caché del sistema
 * @returns {void}
 * 
 * @example
 * limpiarCacheManualmente();
 * console.log('Caché limpiada');
 */
// COMPORTAMIENTO ACTUAL:
// - Remueve todas las claves de caché conocidas
// - Log de confirmación
// - Sin valor de retorno

// ==================== ESTRUCTURAS DE DATOS ====================

/**
 * @typedef {Object} Lider
 * @property {string} ID_Lider - ID único del líder
 * @property {string} Nombre_Lider - Nombre completo
 * @property {string} Rol - Rol (LD, LCF, LM, SG)
 * @property {string} ID_Lider_Directo - ID del supervisor directo
 * @property {string} Congregacion - Congregación asignada
 * @property {string} Estado_Actividad - Estado de actividad
 * @property {number} Dias_Inactivo - Días sin actividad
 * @property {string} Ultima_Actividad - Timestamp de última actividad
 */

/**
 * @typedef {Object} Celula
 * @property {string} ID_Celula - ID único de la célula
 * @property {string} Nombre_Celula - Nombre de la célula
 * @property {string} ID_LCF_Responsable - ID del LCF responsable
 * @property {Array} Miembros - Array de miembros
 * @property {string} Estado - Estado de la célula
 * @property {number} Total_Miembros - Número total de miembros
 */

/**
 * @typedef {Object} Ingreso
 * @property {string} ID_Alma - ID único del alma
 * @property {string} Nombre_Completo - Nombre completo
 * @property {string} Telefono - Teléfono de contacto
 * @property {string} ID_LCF - ID del LCF asignado
 * @property {string} Nombre_LCF - Nombre del LCF asignado
 * @property {string} Estado_Asignacion - Estado de asignación
 * @property {boolean} En_Celula - Si está integrado en célula
 * @property {number} Dias_Desde_Ingreso - Días desde el ingreso
 * @property {string} Acepto_Jesus - Si aceptó a Jesús
 * @property {string} Desea_Visita - Si desea visita
 */

/**
 * @typedef {Object} SeguimientoAlma
 * @property {Object} Bienvenida - Estado de bienvenida
 * @property {string} Bienvenida.simbolo - Símbolo visual (✓, ✗, ⭐)
 * @property {string} Bienvenida.color - Clase CSS de color
 * @property {boolean} Bienvenida.completado - Si está completado
 * @property {Object} Visita_Bendicion - Estado de visita
 * @property {string} Visita_Bendicion.simbolo - Símbolo visual
 * @property {string} Visita_Bendicion.color - Clase CSS de color
 * @property {boolean} Visita_Bendicion.completado - Si está completado
 * @property {Object} Progreso_Celulas - Progreso en células
 * @property {string} Progreso_Celulas.texto - Texto del progreso (X/12)
 * @property {number} Progreso_Celulas.completados - Número completado
 * @property {number} Progreso_Celulas.total - Total de temas
 * @property {number} Progreso_Celulas.porcentaje - Porcentaje completado
 */

// ==================== CONSTANTES DE CONFIGURACIÓN ====================

/**
 * @constant {Object} CONFIG
 * @description Configuración principal del sistema
 * @property {Object} CONFIG.SHEETS - IDs de spreadsheets
 * @property {Object} CONFIG.TABS - Nombres de pestañas
 * @property {Object} CONFIG.DIAS_INACTIVO - Configuración de inactividad
 * @property {Object} CONFIG.CELULAS - Configuración de células
 * @property {Object} CONFIG.CARGA_LCF - Configuración de carga de trabajo
 * @property {Object} CONFIG.CACHE - Configuración de caché
 * @property {string} CONFIG.TIMEZONE - Zona horaria del proyecto
 */

// ==================== CÓDIGOS DE ERROR COMUNES ====================

/**
 * Códigos de error estándar del sistema:
 * 
 * - "Hoja no encontrada": La pestaña especificada no existe
 * - "LCF no encontrado": El ID del LCF no existe en los datos
 * - "LD no encontrado": El ID del LD no existe en los datos
 * - "Timeout": La operación excedió el tiempo máximo
 * - "Datos del directorio no válidos": Error en la estructura de datos
 * - "No se proporcionaron IDs": Array vacío en operaciones de lote
 * - "Lock timed out": Sistema ocupado, reintentar
 */

// ==================== NOTAS DE COMPATIBILIDAD ====================

/**
 * IMPORTANTE PARA EL REFACTORING:
 * 
 * 1. Todas las funciones públicas DEBEN mantener su firma exacta
 * 2. Las estructuras de respuesta NO pueden cambiar
 * 3. Los nombres de campos en objetos DEBEN permanecer iguales
 * 4. Los tipos de datos DEBEN ser consistentes
 * 5. Los códigos de error DEBEN mantenerse
 * 
 * FUNCIONES CRÍTICAS QUE NO PUEDEN CAMBIAR:
 * - doGet() - Punto de entrada principal
 * - getEstadisticasRapidas() - Usado por el frontend
 * - getListaDeLideres() - Usado por selectores
 * - getVistaRapidaLCF() - Usado por modales
 * - cargarDirectorioCompleto() - Base de datos principal
 * 
 * FUNCIONES QUE PUEDEN SER REFACTORIZADAS INTERNAMENTE:
 * - getSeguimientoAlmasLCF_REAL() - Función interna
 * - cargarHojaLideres() - Función interna
 * - cargarHojaCelulas() - Función interna
 * - cargarHojaIngresos() - Función interna
 */

