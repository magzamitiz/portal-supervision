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

---

**Versión:** 4.0 - Sistema simplificado con perfiles pre-calculados
**Última actualización:** Octubre 2025
