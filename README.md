# 📊 Portal de Supervisión

Sistema de gestión y supervisión de líderes, células e ingresos para organizaciones.

## 🚀 Características

- **Dashboard interactivo** con visualización de métricas en tiempo real
- **Sistema de perfiles de líderes** basado en IDP (Índice de Productividad)
- **Seguimiento de almas** con historial completo
- **Caché inteligente** para carga rápida (< 1 segundo)
- **Estructura jerárquica** LD > LM > SG > LCF

## 📋 Perfiles de Líderes

El sistema clasifica automáticamente a los líderes en 4 perfiles basados en su IDP:

- 🚀 **ESTRATEGA DE CRECIMIENTO** (IDP ≥ 36) - Alto rendimiento
- 🎯 **CONECTOR EFICAZ** (IDP 16-35) - Buen desempeño
- 🟡 **RENDIMIENTO BÁSICO** (IDP 6-15) - En desarrollo
- 🔴 **RENDIMIENTO BAJO** (IDP 1-5) - Necesita apoyo
- ❄️ **INACTIVO** (IDP 0) - Sin actividad

## 📊 Hojas de Datos

### Hoja Principal: `DIRECTORIO`
- **Directorio de Líderes** - Información de LD, LM, SG, LCF
- **Directorio de Células** - Células activas y sus miembros
- **Ingresos** - Almas registradas

### Hojas Auxiliares:
- **_EstadoLideres** - Perfiles, IDP y días de inactividad (pre-calculados)
- **_SeguimientoConsolidado** - Seguimiento detallado de almas
- **_ResumenDashboard** - Métricas rápidas para dashboard

## ⚡ Rendimiento

- **Carga inicial:** < 1 segundo (usando caché)
- **Recarga forzada:** 2-3 segundos
- **Seguimiento de LCF:** 1-2 segundos
- **Caché:** 30 minutos (configurable)

## 🧪 Tests

### Test Principal
```javascript
testCompleto()
```

### Tests Específicos
```javascript
testEstadoLideres()      // Verificar _EstadoLideres
testFuncionesPrincipales() // Verificar funciones básicas
testSeguimiento()          // Verificar seguimiento
limpiarCache()            // Limpiar y recargar
verificarLCF('LCF-1010')  // Verificar LCF específico
```

## 🛠️ Configuración

Ver `ConfigModule.gs` para ajustar:
- IDs de spreadsheets
- Nombres de pestañas
- Configuración de caché
- Perfiles de líderes

## 📖 Uso

1. Abrir la aplicación web
2. Seleccionar un LD del selector
3. Ver métricas, equipo y alertas
4. Hacer clic en LCF para ver detalles
5. Usar "Recargar Datos" si necesitas actualizar

## 🔧 Mantenimiento

- **Actualizar _EstadoLideres:** Ejecutar script de cálculo de IDP semanalmente
- **Limpiar caché:** Usar función `limpiarCache()` si hay problemas
- **Monitoreo:** Revisar logs en Google Apps Script

## 🔌 API del Sistema

### Funciones Principales

#### `doGet()`
Función principal de entrada para la aplicación web
- **Parámetros**: `{Object} e` - Parámetros de la petición GET (opcional)
- **Retorna**: `{HtmlService.HtmlOutput}` - Página HTML del dashboard
- **Uso**: Llamada automática por Apps Script

#### `getEstadisticasRapidas()`
Obtiene estadísticas principales del dashboard de forma optimizada
- **Retorna**: `{Object}` con estructura:
  ```javascript
  {
    success: boolean,
    data: {
      actividad: {
        total_recibiendo_celulas: number,
        activos_recibiendo_celula: number,
        alerta_2_3_semanas: number,
        critico_mas_1_mes: number,
        lideres_inactivos: number
      },
      metricas: {
        porcentaje_activos: string,
        porcentaje_alerta: string,
        porcentaje_critico: string,
        total_lideres: number,
        total_celulas: number,
        total_ingresos: number,
        tasa_integracion: string,
        promedio_lcf_por_ld: string
      },
      timestamp: string
    },
    error: string // solo si success=false
  }
  ```

#### `getListaDeLideres()`
Obtiene lista de líderes LD para menús desplegables
- **Retorna**: `{Object}` con estructura:
  ```javascript
  {
    success: boolean,
    data: [
      {
        ID_Lider: string,
        Nombre_Lider: string
      }
    ],
    error: string // solo si success=false
  }
  ```

#### `getDashboardData()`
Obtiene datos completos del dashboard con alertas
- **Retorna**: `{Object}` con estructura completa del dashboard
- **Incluye**: Actividad, métricas, alertas, y datos de líderes

#### `getVistaRapidaLCF(idLCF)`
Obtiene vista rápida de un LCF específico
- **Parámetros**: `{string} idLCF` - ID del LCF
- **Retorna**: `{Object}` con datos del LCF y sus células

### Funciones de Caché

#### `limpiarCacheRobusto(opciones)`
Sistema robusto de limpieza de caché
- **Parámetros**: `{Object} opciones` - Opciones de limpieza
- **Opciones**:
  - `selectorLD: boolean` - Limpiar caché del selector LD
  - `dashboard: boolean` - Limpiar caché del dashboard
  - `estadisticas: boolean` - Limpiar caché de estadísticas
  - `todo: boolean` - Limpiar todo el caché
  - `verificar: boolean` - Solo verificar sin limpiar

### Funciones de Pruebas

#### `ejecutarTodasLasPruebas()`
Ejecuta suite completa de pruebas del sistema
- **Retorna**: `{Object}` con resultados detallados de todas las pruebas

#### `pruebaRapidaSistema()`
Ejecuta prueba rápida del sistema (solo funciones críticas)
- **Retorna**: `{Object}` con resultados de pruebas básicas

---

**Versión:** 4.0 - Sistema simplificado con perfiles pre-calculados
**Última actualización:** Octubre 2025
