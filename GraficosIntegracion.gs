/**
 * @fileoverview Integración de gráficos optimizados con el dashboard existente
 * Proporciona funciones para actualizar los gráficos con datos pre-calculados
 */

// ==================== FUNCIONES DE INTEGRACIÓN CON DASHBOARD ====================

/**
 * Actualiza el gráfico de "Actividad del Equipo (LCF)" con datos optimizados
 * @param {string} idLD - ID del LD para filtrar datos
 * @returns {Object} Datos optimizados para el gráfico
 */
function actualizarGraficoActividadEquipo(idLD = null) {
  try {
    console.log('🔄 Actualizando gráfico de actividad del equipo...');
    
    // Obtener datos de gráficos
    const datosGraficos = obtenerDatosGraficos();
    if (!datosGraficos.success) {
      throw new Error('No se pudieron obtener los datos de gráficos');
    }
    
    // Filtrar por LD si se especifica
    let lcfData = datosGraficos.data;
    if (idLD) {
      lcfData = lcfData.filter(lcf => lcf.LD_ID === idLD);
    }
    
    // Contar estados de LCF
    const conteos = {
      activos: 0,
      alerta: 0,
      inactivos: 0,
      sinDatos: 0
    };
    
    lcfData.forEach(lcf => {
      switch(lcf.Estado_LCF) {
        case 'Activo':
          conteos.activos++;
          break;
        case 'Alerta':
          conteos.alerta++;
          break;
        case 'Inactivo':
          conteos.inactivos++;
          break;
        default:
          conteos.sinDatos++;
          break;
      }
    });
    
    // Preparar datos para Chart.js
    const chartData = {
      labels: ['Activos', 'En Alerta', 'Inactivos', 'Sin Datos'],
      datasets: [{
        data: [conteos.activos, conteos.alerta, conteos.inactivos, conteos.sinDatos],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#9ca3af'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
    
    console.log(`✅ Gráfico de actividad actualizado: ${lcfData.length} LCF procesados`);
    
    return {
      success: true,
      chartData: chartData,
      totalLCF: lcfData.length,
      conteos: conteos,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error actualizando gráfico de actividad:', error);
    return {
      success: false,
      error: error.toString(),
      chartData: null,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Actualiza el gráfico de "Salud de las Células del Equipo" con datos optimizados
 * @param {string} idLD - ID del LD para filtrar datos
 * @returns {Object} Datos optimizados para el gráfico
 */
function actualizarGraficoSaludCelulas(idLD = null) {
  try {
    console.log('🔄 Actualizando gráfico de salud de células...');
    
    // Obtener datos de gráficos
    const datosGraficos = obtenerDatosGraficos();
    if (!datosGraficos.success) {
      throw new Error('No se pudieron obtener los datos de gráficos');
    }
    
    // Filtrar por LD si se especifica
    let lcfData = datosGraficos.data;
    if (idLD) {
      lcfData = lcfData.filter(lcf => lcf.LD_ID === idLD);
    }
    
    // Sumar células por estado de todos los LCF
    const conteos = {
      saludables: 0,
      listasMultiplicar: 0,
      enRiesgo: 0,
      vacias: 0,
      enCrecimiento: 0
    };
    
    lcfData.forEach(lcf => {
      conteos.saludables += parseInt(lcf.Celulas_Saludables) || 0;
      conteos.listasMultiplicar += parseInt(lcf.Celulas_Listas_Multiplicar) || 0;
      conteos.enRiesgo += parseInt(lcf.Celulas_En_Riesgo) || 0;
      conteos.vacias += parseInt(lcf.Celulas_Vacias) || 0;
      conteos.enCrecimiento += parseInt(lcf.Celulas_En_Crecimiento) || 0;
    });
    
    // Preparar datos para Chart.js (gráfico de barras horizontales)
    const chartData = {
      labels: ['Saludables', 'Listas para Multiplicar', 'En Crecimiento', 'En Riesgo', 'Vacías'],
      datasets: [{
        label: 'Células del Equipo',
        data: [
          conteos.saludables,
          conteos.listasMultiplicar,
          conteos.enCrecimiento,
          conteos.enRiesgo,
          conteos.vacias
        ],
        backgroundColor: ['#10b981', '#8b5cf6', '#3b82f6', '#f59e0b', '#ef4444'],
        borderWidth: 1,
        borderColor: '#ffffff'
      }]
    };
    
    console.log(`✅ Gráfico de salud de células actualizado: ${lcfData.length} LCF procesados`);
    
    return {
      success: true,
      chartData: chartData,
      totalLCF: lcfData.length,
      conteos: conteos,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error actualizando gráfico de salud de células:', error);
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
 * @param {string} idLD - ID del LD para filtrar datos
 * @returns {Object} Datos para gráfico de burbujas
 */
function obtenerDatosMatrizEfectividad(idLD = null) {
  try {
    console.log('🔄 Generando datos para matriz de efectividad...');
    
    // Obtener datos de gráficos
    const datosGraficos = obtenerDatosGraficos();
    if (!datosGraficos.success) {
      throw new Error('No se pudieron obtener los datos de gráficos');
    }
    
    // Filtrar por LD si se especifica
    let lcfData = datosGraficos.data;
    if (idLD) {
      lcfData = lcfData.filter(lcf => lcf.LD_ID === idLD);
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
    
    // Actualizar gráficos existentes
    const actividadEquipo = actualizarGraficoActividadEquipo(idLD);
    const saludCelulas = actualizarGraficoSaludCelulas(idLD);
    
    // Generar nuevos gráficos optimizados
    const matrizEfectividad = obtenerDatosMatrizEfectividad(idLD);
    const flujoTransicion = obtenerDatosFlujoTransicion(6);
    
    const resultado = {
      success: true,
      graficos: {
        actividadEquipo: actividadEquipo,
        saludCelulas: saludCelulas,
        matrizEfectividad: matrizEfectividad,
        flujoTransicion: flujoTransicion
      },
      timestamp: new Date().toISOString()
    };
    
    // Verificar si todos los gráficos se generaron correctamente
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
