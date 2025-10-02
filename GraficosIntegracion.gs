/**
 * @fileoverview Integración de gráficos optimizados con el dashboard existente
 * Proporciona funciones para actualizar los gráficos con datos pre-calculados
 */

// ==================== FUNCIONES DE INTEGRACIÓN CON DASHBOARD ====================

/**
 * Obtiene toda la cadena jerárquica de un LD (todos los LCF bajo su supervisión)
 * @param {string} idLD - ID del LD para obtener su cadena completa
 * @param {Array} lcfData - Datos de LCF precargados (opcional, evita I/O duplicado)
 * @returns {Set} Set de IDs de LCF en toda la cadena jerárquica
 */
function obtenerCadenaJerarquicaCompleta(idLD, lcfData = null) {
  try {
    console.log(`🔍 Obteniendo cadena jerárquica completa para LD: ${idLD}`);
    const startTime = Date.now();
    
    // Usar datos precargados o cargar si no se proporcionan
    let todosLosLCF;
    if (lcfData) {
      todosLosLCF = lcfData;
      console.log(`📊 Usando datos precargados: ${todosLosLCF.length} LCF`);
    } else {
      const datosGraficos = obtenerDatosGraficos();
      if (!datosGraficos.success) {
        throw new Error('No se pudieron obtener los datos de gráficos');
      }
      todosLosLCF = datosGraficos.data;
      console.log(`📊 Datos cargados desde Sheets: ${todosLosLCF.length} LCF`);
    }
    
    // Crear mapa de supervisores en una sola pasada O(n)
    const supervisores = todosLosLCF.reduce((map, lcf) => {
      const supervisor = lcf.LD_ID;
      if (!map[supervisor]) map[supervisor] = [];
      map[supervisor].push({
        id: lcf.LCF_ID,
        nombre: lcf.LCF_Nombre
      });
      return map;
    }, {});
    
    console.log(`🗺️ Mapa de supervisores creado: ${Object.keys(supervisores).length} supervisores`);
    
    // BFS iterativo optimizado para evitar límite de recursión y reindexación
    const lcfEnCadena = new Set();
    const lcfProcesados = new Set();
    const cola = [{ id: idLD, nivel: 0, ruta: [idLD] }];
    let nivelesProcesados = 0;
    let idx = 0; // Índice incremental para evitar shift() costoso
    
    while (idx < cola.length) {
      const { id: supervisorActual, nivel, ruta } = cola[idx++];
      
      if (lcfProcesados.has(supervisorActual)) {
        console.log(`${'  '.repeat(nivel)}⚠️ Ciclo detectado en ${supervisorActual}, saltando...`);
        continue;
      }
      
      lcfProcesados.add(supervisorActual);
      nivelesProcesados = Math.max(nivelesProcesados, nivel);
      
      const hijos = supervisores[supervisorActual] || [];
      console.log(`${'  '.repeat(nivel)}🔍 Nivel ${nivel}: ${hijos.length} LCF bajo ${supervisorActual}`);
      console.log(`${'  '.repeat(nivel)}📊 Ruta: ${ruta.join(' → ')}`);
      
      hijos.forEach(hijo => {
        lcfEnCadena.add(hijo.id);
        console.log(`${'  '.repeat(nivel)}  ✅ LCF: ${hijo.nombre} (${hijo.id})`);
        
        // Agregar a la cola para el siguiente nivel
        cola.push({
          id: hijo.id,
          nivel: nivel + 1,
          ruta: [...ruta, hijo.id]
        });
      });
    }
    
    const timeElapsed = Date.now() - startTime;
    console.log(`✅ Cadena jerárquica completa: ${lcfEnCadena.size} LCF encontrados`);
    console.log(`📊 Niveles procesados: ${nivelesProcesados}`);
    console.log(`⏱️ Tiempo de procesamiento: ${timeElapsed}ms`);
    console.log(`📋 LCF en cadena: ${Array.from(lcfEnCadena).join(', ')}`);
    
    return lcfEnCadena;
    
  } catch (error) {
    console.error('❌ Error obteniendo cadena jerárquica:', error);
    return new Set();
  }
}

/**
 * Genera la Matriz de Efectividad del Liderazgo (Bubble Chart)
 * @param {string} idLD - ID del LD para filtrar datos
 * @returns {Object} Datos para gráfico de burbujas
 */
function actualizarGraficoActividadEquipo(idLD = null) {
  try {
    console.log('🔄 Generando Matriz de Efectividad del Liderazgo...');
    
    // Obtener datos de gráficos
    const datosGraficos = obtenerDatosGraficos();
    if (!datosGraficos.success) {
      throw new Error('No se pudieron obtener los datos de gráficos');
    }
    
    // Filtrar por LD si se especifica
    let lcfData = datosGraficos.data;
    console.log(`📊 Datos originales: ${lcfData.length} LCF`);
    if (idLD) {
      // Obtener toda la cadena jerárquica del LD usando datos precargados
      const cadenaJerarquica = obtenerCadenaJerarquicaCompleta(idLD, lcfData);
      lcfData = lcfData.filter(lcf => cadenaJerarquica.has(lcf.LCF_ID));
      console.log(`🔍 Filtrado por cadena jerárquica completa del LD ${idLD}: ${lcfData.length} LCF`);
    } else {
      console.log('📊 Mostrando todos los LCF (sin filtro)');
    }
    
    // Preparar datos para Bubble Chart
    const bubbleData = lcfData.map(lcf => {
      const numCelulas = parseInt(lcf.Num_Celulas) || 0;
      const efectividad = parseFloat(lcf.Porcentaje_Efectividad) || 0;
      const totalPersonas = parseInt(lcf.Total_Personas) || 0;
      
      // Determinar color basado en estado
      let color = '#9ca3af'; // Gris por defecto
      switch(lcf.Estado_LCF) {
        case 'Activo':
          color = '#10b981'; // Verde
          break;
        case 'Alerta':
          color = '#f59e0b'; // Amarillo
          break;
        case 'Inactivo':
          color = '#ef4444'; // Rojo
          break;
      }
      
      return {
        x: numCelulas,
        y: efectividad,
        r: Math.max(8, Math.sqrt(totalPersonas) * 2.5), // Radio mínimo de 8
        lcfName: lcf.LCF_Nombre,
        lcfId: lcf.LCF_ID,
        estado: lcf.Estado_LCF,
        totalPersonas: totalPersonas,
        ldName: lcf.LD_Nombre,
        color: color
      };
    });
    
    // Preparar configuración del gráfico
    const chartData = {
      type: 'bubble',
      data: {
        datasets: [{
          label: 'LCF por Efectividad',
          data: bubbleData,
          backgroundColor: bubbleData.map(b => b.color + '80'), // 50% transparencia
          borderColor: bubbleData.map(b => b.color),
          borderWidth: 2,
          hoverBackgroundColor: bubbleData.map(b => b.color),
          hoverBorderColor: '#ffffff',
          hoverBorderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Matriz de Efectividad del Liderazgo',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            display: false
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#ffffff',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Número de Células bajo Supervisión',
              font: { size: 12, weight: 'bold' }
            },
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Efectividad (%) - Células Saludables + Listas para Multiplicar',
              font: { size: 12, weight: 'bold' }
            },
            beginAtZero: true,
            max: 100,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'point'
        }
      }
    };
    
    console.log(`✅ Matriz de efectividad generada: ${bubbleData.length} LCF procesados`);
    
    return {
      success: true,
      chartData: chartData,
      bubbleData: bubbleData,
      totalLCF: lcfData.length,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error generando matriz de efectividad:', error);
    return {
      success: false,
      error: error.toString(),
      chartData: null,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Genera el Flujo de Transición de Estados de Células (Área Apilada Temporal)
 * @param {string} idLD - ID del LD para filtrar datos (opcional, no aplica para histórico)
 * @returns {Object} Datos para gráfico de área apilada
 */
function actualizarGraficoSaludCelulas(idLD = null) {
  try {
    console.log('🔄 Generando Flujo de Transición de Estados de Células...');
    
    // Obtener datos históricos (últimos 6 meses)
    const datosHistoricos = obtenerDatosHistoricos(6);
    if (!datosHistoricos.success) {
      throw new Error('No se pudieron obtener los datos históricos');
    }
    
    console.log(`📈 Datos históricos: ${datosHistoricos.data.length} períodos`);
    if (idLD) {
      console.log(`🔍 NOTA: Gráfico de salud no filtra por LD (${idLD}) - muestra datos globales`);
    } else {
      console.log('📈 Mostrando datos históricos globales');
    }
    
    // Ordenar por fecha (más antiguo primero para el gráfico)
    const datosOrdenados = datosHistoricos.data.sort((a, b) => new Date(a.Fecha) - new Date(b.Fecha));
    
    // Extraer datos para el gráfico
    const labels = datosOrdenados.map(d => {
      const fecha = new Date(d.Fecha);
      return `${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
    });
    
    // Preparar datos para Chart.js (gráfico de área apilada)
    const chartData = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Listas para Multiplicar',
            data: datosOrdenados.map(d => parseInt(d.Listas_Multiplicar) || 0),
            backgroundColor: 'rgba(16, 185, 129, 0.3)',
            borderColor: '#10b981',
            borderWidth: 3,
            fill: '+1',
            tension: 0.4,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8
          },
          {
            label: 'Saludables',
            data: datosOrdenados.map(d => parseInt(d.Saludables) || 0),
            backgroundColor: 'rgba(59, 130, 246, 0.3)',
            borderColor: '#3b82f6',
            borderWidth: 3,
            fill: '+1',
            tension: 0.4,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8
          },
          {
            label: 'En Crecimiento',
            data: datosOrdenados.map(d => parseInt(d.En_Crecimiento) || 0),
            backgroundColor: 'rgba(139, 92, 246, 0.3)',
            borderColor: '#8b5cf6',
            borderWidth: 3,
            fill: '+1',
            tension: 0.4,
            pointBackgroundColor: '#8b5cf6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8
          },
          {
            label: 'En Riesgo',
            data: datosOrdenados.map(d => parseInt(d.En_Riesgo) || 0),
            backgroundColor: 'rgba(245, 158, 11, 0.3)',
            borderColor: '#f59e0b',
            borderWidth: 3,
            fill: '+1',
            tension: 0.4,
            pointBackgroundColor: '#f59e0b',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8
          },
          {
            label: 'Vacías',
            data: datosOrdenados.map(d => parseInt(d.Vacias) || 0),
            backgroundColor: 'rgba(239, 68, 68, 0.3)',
            borderColor: '#ef4444',
            borderWidth: 3,
            fill: 'origin',
            tension: 0.4,
            pointBackgroundColor: '#ef4444',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          title: {
            display: true,
            text: 'Flujo de Transición de Estados de Células',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#ffffff',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Período',
              font: { size: 12, weight: 'bold' }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Número de Células',
              font: { size: 12, weight: 'bold' }
            },
            beginAtZero: true,
            stacked: false,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        },
        elements: {
          line: {
            borderJoinStyle: 'round'
          }
        }
      }
    };
    
    console.log(`✅ Flujo de transición generado: ${datosOrdenados.length} períodos procesados`);
    
    return {
      success: true,
      chartData: chartData,
      totalPeriodos: datosOrdenados.length,
      datosHistoricos: datosOrdenados,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error generando flujo de transición:', error);
    return {
      success: false,
      error: error.toString(),
      chartData: null,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Obtiene datos para el gráfico de Matriz de Efectividad del Liderazgo (Bubble Chart)
 * @param {string} idLD - ID del LD para filtrar datos (usa cadena jerárquica completa)
 * @returns {Object} Datos para gráfico de burbujas con TODA la cadena jerárquica del LD
 */
function obtenerDatosMatrizEfectividad(idLD = null) {
  try {
    console.log('🔄 Generando datos para matriz de efectividad...');
    
    // Obtener datos de gráficos
    const datosGraficos = obtenerDatosGraficos();
    if (!datosGraficos.success) {
      throw new Error('No se pudieron obtener los datos de gráficos');
    }
    
    // Filtrar por LD si se especifica - USAR CADENA JERÁRQUICA COMPLETA
    let lcfData = datosGraficos.data;
    if (idLD) {
      const cadenaJerarquica = obtenerCadenaJerarquicaCompleta(idLD, datosGraficos.data);
      lcfData = lcfData.filter(lcf => cadenaJerarquica.has(lcf.LCF_ID));
      console.log(`🔍 Filtrado por cadena jerárquica completa del LD ${idLD}: ${lcfData.length} LCF`);
    } else {
      console.log('📊 Mostrando todos los LCF (sin filtro)');
    }
    
    // Preparar datos para gráfico de burbujas
    const bubbleData = lcfData.map(lcf => {
      const numCelulas = parseInt(lcf.Num_Celulas) || 0;
      const efectividad = parseFloat(lcf.Porcentaje_Efectividad) || 0;
      const totalPersonas = parseInt(lcf.Total_Personas) || 0;
      
      // Determinar color basado en estado
      let color = '#9ca3af'; // Gris por defecto
      switch(lcf.Estado_LCF) {
        case 'Activo':
          color = '#10b981'; // Verde
          break;
        case 'Alerta':
          color = '#f59e0b'; // Amarillo
          break;
        case 'Inactivo':
          color = '#ef4444'; // Rojo
          break;
      }
      
      return {
        x: numCelulas,
        y: efectividad,
        r: Math.max(5, Math.sqrt(totalPersonas) * 2), // Radio mínimo de 5
        lcfName: lcf.LCF_Nombre,
        lcfId: lcf.LCF_ID,
        estado: lcf.Estado_LCF,
        totalPersonas: totalPersonas,
        color: color
      };
    });
    
    // Preparar configuración del gráfico
    const chartConfig = {
      type: 'bubble',
      data: {
        datasets: [{
          label: 'LCF por Efectividad',
          data: bubbleData,
          backgroundColor: bubbleData.map(b => b.color),
          borderColor: bubbleData.map(b => b.color),
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Matriz de Efectividad del Liderazgo'
          },
          tooltip: {
            callbacks: {
              title: function(context) {
                return context[0].raw.lcfName;
              },
              label: function(context) {
                const data = context.raw;
                return [
                  `Células: ${data.x}`,
                  `Efectividad: ${data.y.toFixed(1)}%`,
                  `Personas: ${data.totalPersonas}`,
                  `Estado: ${data.estado}`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Número de Células'
            },
            beginAtZero: true
          },
          y: {
            title: {
              display: true,
              text: 'Efectividad (%)'
            },
            beginAtZero: true,
            max: 100
          }
        }
      }
    };
    
    console.log(`✅ Matriz de efectividad generada: ${bubbleData.length} LCF procesados`);
    
    return {
      success: true,
      chartConfig: chartConfig,
      bubbleData: bubbleData,
      totalLCF: lcfData.length,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error generando matriz de efectividad:', error);
    return {
      success: false,
      error: error.toString(),
      chartConfig: null,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Obtiene datos para el gráfico de Flujo de Transición de Estados (Tendencias)
 * @param {number} meses - Número de meses a mostrar (default: 6)
 * @returns {Object} Datos para gráfico de tendencias
 */
function obtenerDatosFlujoTransicion(meses = 6) {
  try {
    console.log(`🔄 Generando datos de flujo de transición (últimos ${meses} meses)...`);
    
    // Obtener datos históricos
    const datosHistoricos = obtenerDatosHistoricos(meses);
    if (!datosHistoricos.success) {
      throw new Error('No se pudieron obtener los datos históricos');
    }
    
    // Ordenar por fecha (más antiguo primero para el gráfico)
    const datosOrdenados = datosHistoricos.data.sort((a, b) => new Date(a.Fecha) - new Date(b.Fecha));
    
    // Extraer datos para el gráfico
    const labels = datosOrdenados.map(d => {
      const fecha = new Date(d.Fecha);
      return `${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
    });
    
    const chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Listas para Multiplicar',
          data: datosOrdenados.map(d => parseInt(d.Listas_Multiplicar) || 0),
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: '#10b981',
          borderWidth: 2,
          fill: '+1'
        },
        {
          label: 'Saludables',
          data: datosOrdenados.map(d => parseInt(d.Saludables) || 0),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: '#3b82f6',
          borderWidth: 2,
          fill: '+1'
        },
        {
          label: 'En Crecimiento',
          data: datosOrdenados.map(d => parseInt(d.En_Crecimiento) || 0),
          backgroundColor: 'rgba(139, 92, 246, 0.8)',
          borderColor: '#8b5cf6',
          borderWidth: 2,
          fill: '+1'
        },
        {
          label: 'En Riesgo',
          data: datosOrdenados.map(d => parseInt(d.En_Riesgo) || 0),
          backgroundColor: 'rgba(245, 158, 11, 0.8)',
          borderColor: '#f59e0b',
          borderWidth: 2,
          fill: '+1'
        },
        {
          label: 'Vacías',
          data: datosOrdenados.map(d => parseInt(d.Vacias) || 0),
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: '#ef4444',
          borderWidth: 2,
          fill: 'origin'
        }
      ]
    };
    
    // Configuración del gráfico
    const chartConfig = {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          title: {
            display: true,
            text: 'Flujo de Transición de Estados de Células'
          },
          legend: {
            position: 'top'
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Período'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Número de Células'
            },
            beginAtZero: true,
            stacked: false
          }
        }
      }
    };
    
    console.log(`✅ Flujo de transición generado: ${datosOrdenados.length} períodos procesados`);
    
    return {
      success: true,
      chartConfig: chartConfig,
      chartData: chartData,
      totalPeriodos: datosOrdenados.length,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error generando flujo de transición:', error);
    return {
      success: false,
      error: error.toString(),
      chartConfig: null,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Función unificada para actualizar todos los gráficos del dashboard
 * @param {string} idLD - ID del LD para filtrar datos (opcional)
 * @returns {Object} Datos de todos los gráficos
 */
function actualizarTodosLosGraficos(idLD = null) {
  try {
    console.log('🔄 Actualizando todos los gráficos del dashboard...');
    
    // Actualizar gráficos principales
    const actividadEquipo = actualizarGraficoActividadEquipo(idLD);
    const saludCelulas = actualizarGraficoSaludCelulas(idLD);
    
    // Optimizar datos para reducir tamaño
    const resultado = {
      success: true,
      graficos: {
        actividadEquipo: {
          success: actividadEquipo.success,
          chartData: actividadEquipo.chartData,
          totalLCF: actividadEquipo.totalLCF
        },
        saludCelulas: {
          success: saludCelulas.success,
          chartData: saludCelulas.chartData,
          totalPeriodos: saludCelulas.totalPeriodos
        }
      },
      timestamp: new Date().toISOString()
    };
    
    // Verificar si los gráficos se generaron correctamente
    const errores = Object.values(resultado.graficos).filter(g => !g.success);
    if (errores.length > 0) {
      console.warn(`⚠️ ${errores.length} gráficos tuvieron errores`);
    }
    
    console.log('✅ Todos los gráficos actualizados');
    return resultado;
    
  } catch (error) {
    console.error('❌ Error actualizando todos los gráficos:', error);
    return {
      success: false,
      error: error.toString(),
      graficos: null,
      timestamp: new Date().toISOString()
    };
  }
}

// ==================== FUNCIONES ALTERNATIVAS PARA PRUEBAS ====================

/**
 * Función simplificada para probar la comunicación frontend-backend
 * @param {string} idLD - ID del LD para filtrar datos
 * @returns {Object} Datos simplificados
 */
function probarGraficos(idLD = null) {
  try {
    console.log('🧪 Probando comunicación de gráficos...');
    
    return {
      success: true,
      mensaje: 'Comunicación funcionando',
      idLD: idLD,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error en prueba:', error);
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().toISOString()
    };
  }
}

// ==================== FUNCIONES DE UTILIDAD PARA EL FRONTEND ====================

/**
 * Genera el código JavaScript para actualizar los gráficos en el frontend
 * @param {string} idLD - ID del LD para filtrar datos
 * @returns {string} Código JavaScript para el frontend
 */
function generarCodigoJavaScriptGraficos(idLD = null) {
  try {
    const datosGraficos = actualizarTodosLosGraficos(idLD);
    
    if (!datosGraficos.success) {
      return `console.error('Error generando gráficos:', ${JSON.stringify(datosGraficos.error)});`;
    }
    
    let codigoJS = `
// ==================== CÓDIGO GENERADO AUTOMÁTICAMENTE ====================
// Generado el: ${new Date().toISOString()}

function actualizarGraficosOptimizados() {
  try {
    // 1. Actualizar gráfico de Actividad del Equipo (LCF)
    if (window.chartEstados instanceof Chart) {
      window.chartEstados.destroy();
    }
    
    const ctxEstados = document.getElementById('chartEstados').getContext('2d');
    window.chartEstados = new Chart(ctxEstados, ${JSON.stringify(datosGraficos.graficos.actividadEquipo.chartData, null, 2)});
    
    // 2. Actualizar gráfico de Salud de Células
    if (window.chartCelulas instanceof Chart) {
      window.chartCelulas.destroy();
    }
    
    const ctxCelulas = document.getElementById('chartCelulas').getContext('2d');
    window.chartCelulas = new Chart(ctxCelulas, {
      type: 'bar',
      data: ${JSON.stringify(datosGraficos.graficos.saludCelulas.chartData, null, 2)},
      options: {
        responsive: true,
        indexAxis: 'y',
        scales: { 
          x: { beginAtZero: true, ticks: { stepSize: 1 } },
          y: { beginAtZero: true }
        },
        plugins: { legend: { display: false } }
      }
    });
    
    console.log('✅ Gráficos optimizados actualizados exitosamente');
    
  } catch (error) {
    console.error('❌ Error actualizando gráficos:', error);
  }
}

// Ejecutar actualización
actualizarGraficosOptimizados();
`;
    
    return codigoJS;
    
  } catch (error) {
    console.error('❌ Error generando código JavaScript:', error);
    return `console.error('Error generando código JavaScript:', ${JSON.stringify(error.toString())});`;
  }
}
