/**
 * @fileoverview Módulo unificado de gestión de datos.
 * Combina HojaFunctions y DataQueries en un solo módulo optimizado.
 */

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Encuentra el índice de una columna por nombre
 * @param {Array} headers - Array de headers
 * @param {Array} names - Array de nombres posibles
 * @returns {number} Índice de la columna o -1 si no se encuentra
 */
const findCol = (headers, names) => headers.findIndex(h => names.some(name => h.includes(name)));

// ==================== FUNCIONES DE CARGA DE HOJAS ESPECÍFICAS ====================

/**
 * Carga datos de la hoja de líderes (implementación exacta del original).
 * @param {Object} spreadsheet - Objeto spreadsheet de Google Apps Script
 * @returns {Array<Object>} Array de líderes
 */
function cargarHojaLideres(spreadsheet) {
  try {
    console.log('[DataModule] Debug - Iniciando cargarHojaLideres');
    const sheet = spreadsheet.getSheetByName(CONFIG.TABS.LIDERES);
    if (!sheet) {
      console.log('[DataModule] Debug - Hoja no encontrada:', CONFIG.TABS.LIDERES);
      return [];
    }

    console.log('[DataModule] Debug - Hoja encontrada, obteniendo datos...');
    const data = sheet.getDataRange().getValues();
    console.log(`[DataModule] Debug - Datos obtenidos: ${data.length} filas`);
    if (data.length < 2) {
      console.log('[DataModule] Debug - Datos insuficientes');
      return [];
    }

    const headers = data[0].map(h => h.toString().trim());
    const lideres = [];

    const columnas = {
      idLider: findCol(headers, ['ID_Lider', 'ID Líder', 'ID']),
      nombreLider: findCol(headers, ['Nombre_Lider', 'Nombre Líder', 'Nombre']),
      rol: findCol(headers, ['Rol', 'Tipo']),
      idLiderDirecto: findCol(headers, ['ID_Lider_Directo', 'Supervisor', 'ID LD']),
      congregacion: findCol(headers, ['Congregación', 'Congregacion'])
    };

    if (columnas.idLider === -1 || columnas.rol === -1) {
      console.error('Faltan columnas críticas (ID o Rol) en la hoja de Líderes.');
      return [];
    }

    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      const idLider = String(row[columnas.idLider] || '').trim();

      if (!idLider) continue;

      const lider = {
        ID_Lider: idLider,
        Nombre_Lider: String(row[columnas.nombreLider] || '').trim(),
        Rol: String(row[columnas.rol] || '').trim().toUpperCase(),
        ID_Lider_Directo: String(row[columnas.idLiderDirecto] || '').trim(),
        Congregacion: String(row[columnas.congregacion] || '').trim(),
        Estado_Actividad: 'Desconocido',
        Dias_Inactivo: null,
        Ultima_Actividad: null
      };

      lideres.push(lider);
    }

    return lideres;
  } catch (error) {
    console.error('Error cargando líderes:', error);
    return [];
  }
}

/**
 * Carga datos de la hoja de células (implementación exacta del original).
 * @param {Object} spreadsheet - Objeto spreadsheet de Google Apps Script
 * @returns {Array<Object>} Array de células
 */
function cargarHojaCelulas(spreadsheet) {
  try {
    const sheetName = (typeof CONFIG !== 'undefined' && CONFIG.TABS && CONFIG.TABS.CELULAS) ? CONFIG.TABS.CELULAS : 'Células';
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet) return [];

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];

    const headers = data[0].map(h => h.toString().trim());
    const celulasMap = new Map();

    const columnas = {
      idCelula: findCol(headers, ['ID Célula', 'ID_Celula', 'ID']),
      nombreCelula: findCol(headers, ['Nombre Célula']),
      idMiembro: findCol(headers, ['ID Miembro', 'ID_Miembro', 'ID Alma']),
      nombreMiembro: findCol(headers, ['Nombre Miembro']),
      idLCF: findCol(headers, ['ID LCF', 'ID_LCF']),
      nombreLCF: findCol(headers, ['Nombre LCF'])
    };

    if (columnas.idCelula === -1) {
      console.error('Falta columna crítica ID Célula.');
      return [];
    }

    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      const idCelula = String(row[columnas.idCelula] || '').trim();

      if (!idCelula) continue;

      if (!celulasMap.has(idCelula)) {
        celulasMap.set(idCelula, {
          ID_Celula: idCelula,
          Nombre_Celula: String(row[columnas.nombreCelula] || '').trim(),
          ID_LCF_Responsable: String(row[columnas.idLCF] || '').trim(),
          Nombre_LCF_Responsable: String(row[columnas.nombreLCF] || '').trim(),
          Miembros: [],
          Total_Miembros: 0,
          Estado: 'Activa'
        });
      }

      const celula = celulasMap.get(idCelula);

      const idMiembro = columnas.idMiembro !== -1 ? String(row[columnas.idMiembro] || '').trim() : null;
      const nombreMiembro = columnas.nombreMiembro !== -1 ? String(row[columnas.nombreMiembro] || '').trim() : null;

      if (idMiembro || nombreMiembro) {
        celula.Miembros.push({
          ID_Miembro: idMiembro,
          Nombre_Miembro: nombreMiembro
        });
        celula.Total_Miembros++;
      }
    }

    // Determinar estado de cada célula
    const celulas = [];
    celulasMap.forEach(celula => {
      // Usar valores por defecto si CONFIG no está disponible
      const minMiembros = (typeof CONFIG !== 'undefined' && CONFIG.CELULAS && CONFIG.CELULAS.MIN_MIEMBROS) ? CONFIG.CELULAS.MIN_MIEMBROS : 3;
      const maxMiembros = (typeof CONFIG !== 'undefined' && CONFIG.CELULAS && CONFIG.CELULAS.MAX_MIEMBROS) ? CONFIG.CELULAS.MAX_MIEMBROS : 12;
      const idealMiembros = (typeof CONFIG !== 'undefined' && CONFIG.CELULAS && CONFIG.CELULAS.IDEAL_MIEMBROS) ? CONFIG.CELULAS.IDEAL_MIEMBROS : 6;

      if (celula.Total_Miembros === 0) {
        celula.Estado = 'Vacía';
      } else if (celula.Total_Miembros < minMiembros) {
        celula.Estado = 'En Riesgo';
      } else if (celula.Total_Miembros > maxMiembros) {
        celula.Estado = 'Lista para Multiplicar';
      } else if (celula.Total_Miembros >= idealMiembros) {
        celula.Estado = 'Saludable';
      } else {
        celula.Estado = 'En Crecimiento';
      }
      celulas.push(celula);
    });

    return celulas;
  } catch (error) {
    console.error('Error cargando células:', error);
    return [];
  }
}

/**
 * Carga datos de la hoja de ingresos (implementación exacta del original).
 * @param {Object} spreadsheet - Objeto spreadsheet de Google Apps Script
 * @returns {Array<Object>} Array de ingresos
 */
function cargarHojaIngresos(spreadsheet) {
  try {
    const sheetName = (typeof CONFIG !== 'undefined' && CONFIG.TABS && CONFIG.TABS.INGRESOS) ? CONFIG.TABS.INGRESOS : 'Ingresos';
    const sheet = spreadsheet.getSheetByName(sheetName);
    if (!sheet || sheet.getLastRow() < 2) return [];

    const todosLosDatos = sheet.getDataRange().getValues();
    const headers = todosLosDatos.shift();

    // Filtrar por estado "Baja"
    const estadoColIndex = headers.indexOf('Estado');
    let datosActivos = [];

    if (estadoColIndex !== -1) {
      datosActivos = todosLosDatos.filter(row => row[estadoColIndex] !== 'Baja');
      console.log(`Ingresos: Se encontraron ${todosLosDatos.length} registros, se procesarán ${datosActivos.length} activos.`);
    } else {
      datosActivos = todosLosDatos;
      console.warn("Advertencia: No se encontró la columna 'Estado' en la hoja Ingresos. No se pudieron filtrar las bajas.");
    }

    if (datosActivos.length === 0) return [];

    const ingresos = [];
    const hoy = new Date();
    
    const columnas = {
      idAlma: headers.indexOf('ID_Alma'),
      timestamp: headers.indexOf('Timestamp'),
      idLCF: headers.indexOf('ID LCF'),
      nombreLCF: headers.indexOf('Nombre LCF'),
      idLD: headers.indexOf('ID LD'),
      nombreLD: headers.indexOf('Nombre LD'),
      nombresAlma: headers.indexOf('Nombres del Alma'),
      apellidosAlma: headers.indexOf('Apellidos del Alma'),
      telefono: headers.indexOf('Teléfono'),
      aceptoJesus: headers.indexOf('Aceptó a Jesús'),
      deseaVisita: headers.indexOf('Desea Visita'),
      fuenteContacto: headers.indexOf('Fuente')
    };

    for (const row of datosActivos) {
      const idAlma = String(row[columnas.idAlma] || '').trim();
      if (!idAlma) continue;

      const rawTimestamp = columnas.timestamp !== -1 ? row[columnas.timestamp] : null;
      let fechaIngreso = null;
      let diasDesdeIngreso = null;

      if (rawTimestamp instanceof Date && !isNaN(rawTimestamp.getTime())) {
        fechaIngreso = rawTimestamp;
        diasDesdeIngreso = Math.floor((hoy - fechaIngreso) / (1000 * 60 * 60 * 24));
      }

      const nombres = String(row[columnas.nombresAlma] || '').trim();
      const apellidos = String(row[columnas.apellidosAlma] || '').trim();
      const idLCF = String(row[columnas.idLCF] || '').trim();
      const aceptoJesus = normalizeYesNo(row[columnas.aceptoJesus]);
      const deseaVisita = normalizeYesNo(row[columnas.deseaVisita]);

      const ingreso = {
        ID_Alma: idAlma,
        Timestamp: fechaIngreso ? fechaIngreso.toISOString() : null,
        ID_LCF: idLCF,
        Nombre_LCF: String(row[columnas.nombreLCF] || '').trim(),
        ID_LD: String(row[columnas.idLD] || '').trim(),
        Nombre_LD: String(row[columnas.nombreLD] || '').trim(),
        Nombres: nombres,
        Apellidos: apellidos,
        Nombre_Completo: `${nombres} ${apellidos}`.trim(),
        Telefono: String(row[columnas.telefono] || '').trim(),
        Acepto_Jesus: aceptoJesus,
        Desea_Visita: deseaVisita,
        Fuente_Contacto: String(row[columnas.fuenteContacto] || '').trim(),
        Dias_Desde_Ingreso: diasDesdeIngreso,
        Estado_Asignacion: idLCF ? 'Asignado' : 'Pendiente',
        Prioridad: determinarPrioridad(deseaVisita, aceptoJesus),
        ID_Celula: null,
        En_Celula: false
      };
      ingresos.push(ingreso);
    }
    return ingresos;

  } catch (error) {
    console.error('Error cargando ingresos:', error);
    return [];
  }
}

// ==================== CONSULTAS OPTIMIZADAS ====================

/**
 * Carga optimizada de líderes usando rangos específicos
 */
function cargarLideresOptimizado() {
  console.log('[DataModule] Cargando líderes OPTIMIZADO...');
  const startTime = Date.now();
  
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    const sheet = spreadsheet.getSheetByName(CONFIG.TABS.LIDERES);
    
    if (!sheet) {
      console.error('[DataModule] Hoja de líderes no encontrada');
      return [];
    }
    
    // Obtener solo las columnas necesarias (A-E)
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];
    
    const data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
    const lideres = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue; // Saltar filas vacías
      
      // Debug para LCF bajo LD-4003
      if (String(row[0]).trim().startsWith('LCF-') && String(row[3]).trim() === 'LD-4003') {
        console.log(`[DataModule] Debug LCF: ${String(row[0]).trim()}, Estado original: "${row[4]}", Tipo: ${typeof row[4]}`);
      }
      
      lideres.push({
        ID_Lider: String(row[0] || '').trim(),
        Nombre_Lider: String(row[1] || 'Sin Nombre').trim(),
        Rol: String(row[2] || '').trim(),
        ID_Lider_Directo: String(row[3] || '').trim(),
        Estado_Actividad: 'Activo'  // No hay columna de estado, usar valor por defecto
      });
    }
    
    console.log(`[DataModule] ✅ ${lideres.length} líderes cargados en ${Date.now() - startTime}ms`);
    return lideres;
    
  } catch (error) {
    console.error('[DataModule] Error cargando líderes:', error);
    return [];
  }
}

/**
 * Carga optimizada de células usando rangos específicos
 * VERSIÓN CORREGIDA - Compatible con mapearAlmasACelulas
 */
function cargarCelulasOptimizado() {
  console.log('[DataModule] Cargando células OPTIMIZADO...');
  const startTime = Date.now();
  
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    const sheet = spreadsheet.getSheetByName(CONFIG.TABS.CELULAS);
    
    if (!sheet) {
      console.error('[DataModule] Hoja de células no encontrada');
      return [];
    }
    
    // Obtener todos los datos para procesar correctamente
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return [];
    
    const headers = data[0].map(h => h.toString().trim());
    const celulasMap = new Map();
    
    // Mapear columnas
    const columnas = {
      idCelula: findCol(headers, ['ID Célula', 'ID_Celula', 'ID']),
      nombreCelula: findCol(headers, ['Nombre Célula']),
      idMiembro: findCol(headers, ['ID Miembro', 'ID_Miembro', 'ID Alma']),
      nombreMiembro: findCol(headers, ['Nombre Miembro']),
      idLCF: findCol(headers, ['ID LCF', 'ID_LCF']),
      nombreLCF: findCol(headers, ['Nombre LCF'])
    };
    
    if (columnas.idCelula === -1) {
      console.error('[DataModule] Falta columna crítica ID Célula');
      return [];
    }
    
    // Procesar filas
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const idCelula = String(row[columnas.idCelula] || '').trim();
      
      if (!idCelula) continue;
      
      // Crear célula si no existe
      if (!celulasMap.has(idCelula)) {
        celulasMap.set(idCelula, {
          ID_Celula: idCelula,
          Nombre_Celula: String(row[columnas.nombreCelula] || '').trim(),
          ID_LCF_Responsable: String(row[columnas.idLCF] || '').trim(),
          Nombre_LCF_Responsable: String(row[columnas.nombreLCF] || '').trim(),
          Miembros: [],  // IMPORTANTE: Array de objetos, no un número
          Total_Miembros: 0,
          Estado: 'Activa'
        });
      }
      
      const celula = celulasMap.get(idCelula);
      
      // Agregar miembro si existe
      const idMiembro = columnas.idMiembro !== -1 ? String(row[columnas.idMiembro] || '').trim() : null;
      const nombreMiembro = columnas.nombreMiembro !== -1 ? String(row[columnas.nombreMiembro] || '').trim() : null;
      
      if (idMiembro || nombreMiembro) {
        // Evitar duplicados
        const miembroExiste = celula.Miembros.some(m => m.ID_Miembro === idMiembro);
        if (!miembroExiste) {
          celula.Miembros.push({
            ID_Miembro: idMiembro,
            Nombre_Miembro: nombreMiembro
          });
          celula.Total_Miembros++;
        }
      }
    }
    
    // Convertir Map a Array y determinar estados
    const celulas = Array.from(celulasMap.values());
    
    // Determinar estado de cada célula
    celulas.forEach(celula => {
      const minMiembros = (typeof CONFIG !== 'undefined' && CONFIG.CELULAS && CONFIG.CELULAS.MIN_MIEMBROS) ? CONFIG.CELULAS.MIN_MIEMBROS : 3;
      const maxMiembros = (typeof CONFIG !== 'undefined' && CONFIG.CELULAS && CONFIG.CELULAS.MAX_MIEMBROS) ? CONFIG.CELULAS.MAX_MIEMBROS : 12;
      const idealMiembros = (typeof CONFIG !== 'undefined' && CONFIG.CELULAS && CONFIG.CELULAS.IDEAL_MIEMBROS) ? CONFIG.CELULAS.IDEAL_MIEMBROS : 8;
      
      if (celula.Total_Miembros === 0) {
        celula.Estado = 'Vacía';
      } else if (celula.Total_Miembros < minMiembros) {
        celula.Estado = 'En Riesgo';
      } else if (celula.Total_Miembros <= idealMiembros) {
        celula.Estado = 'En Crecimiento';
      } else if (celula.Total_Miembros <= maxMiembros) {
        celula.Estado = 'Saludable';
      } else {
        celula.Estado = 'Lista para Multiplicar';
      }
    });
    
    console.log(`[DataModule] ✅ ${celulas.length} células cargadas en ${Date.now() - startTime}ms`);
    return celulas;
    
  } catch (error) {
    console.error('[DataModule] Error cargando células:', error);
    return [];
  }
}

/**
 * Carga optimizada de ingresos usando rangos específicos
 */
function cargarIngresosOptimizado() {
  console.log('[DataModule] Cargando ingresos OPTIMIZADO...');
  const startTime = Date.now();
  
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEETS.DIRECTORIO);
    const sheet = spreadsheet.getSheetByName(CONFIG.TABS.INGRESOS);
    
    if (!sheet) {
      console.warn('[DataModule] Hoja de ingresos no encontrada');
      return [];
    }
    
    // Obtener solo las columnas necesarias
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      console.log('[DataModule] No hay datos de ingresos');
      return [];
    }
    
    const data = sheet.getRange(2, 1, lastRow - 1, 20).getValues();
    const ingresos = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row[1]) continue; // Saltar si no hay nombre
      
      ingresos.push({
        Timestamp: row[0],
        Nombre: String(row[1] || '').trim(),
        ID_Alma: String(row[2] || '').trim(),
        Fecha_Ingreso: row[3],
        ID_LCF: String(row[4] || '').trim(),
        Desea_Visita: String(row[5] || 'NO').trim().toUpperCase(),
        Acepto_Jesus: String(row[6] || 'NO').trim().toUpperCase(),
        Estado_Asignacion: String(row[10] || 'Por Asignar').trim(),
        En_Celula: String(row[19] || 'NO').trim().toUpperCase() === 'SI'
      });
    }
    
    console.log(`[DataModule] ✅ ${ingresos.length} ingresos cargados en ${Date.now() - startTime}ms`);
    return ingresos;
    
  } catch (error) {
    console.error('[DataModule] Error cargando ingresos:', error);
    return [];
  }
}

// ==================== FUNCIONES DE CARGA POR FILTROS ====================

/**
 * Carga líderes por rol específico
 * @param {Object} spreadsheet - Objeto spreadsheet
 * @param {string} rol - Rol a filtrar ('LD', 'LCF', etc.)
 * @returns {Array} Array de líderes del rol especificado
 */
function cargarLideresPorRol(spreadsheet, rol) {
  const todosLosLideres = cargarHojaLideres(spreadsheet);
  return todosLosLideres.filter(lider => lider.Rol === rol.toUpperCase());
}

/**
 * Carga células por LCF responsable
 * @param {Object} spreadsheet - Objeto spreadsheet
 * @param {string} idLCF - ID del LCF
 * @returns {Array} Array de células del LCF
 */
function cargarCelulasPorLCF(spreadsheet, idLCF) {
  const todasLasCelulas = cargarHojaCelulas(spreadsheet);
  return todasLasCelulas.filter(celula => celula.ID_LCF_Responsable === idLCF);
}

/**
 * Carga ingresos por LCF
 * @param {Object} spreadsheet - Objeto spreadsheet
 * @param {string} idLCF - ID del LCF
 * @returns {Array} Array de ingresos del LCF
 */
function cargarIngresosPorLCF(spreadsheet, idLCF) {
  const todosLosIngresos = cargarHojaIngresos(spreadsheet);
  return todosLosIngresos.filter(ingreso => ingreso.ID_LCF === idLCF);
}

console.log('📊 DataModule cargado - Gestión de datos unificada');
