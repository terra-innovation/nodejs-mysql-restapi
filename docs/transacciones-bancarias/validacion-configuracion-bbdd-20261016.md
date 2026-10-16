# Cierre del ajuste de configuración de BBDD

Validación del 16/10/2026 con Node portable 24.21.0. Implementación en backend y frontend; sin empaquetado de producción, reinicio de servicios remotos, credenciales nuevas ni pruebas contra el MySQL real.

## Estructura de desarrollo

Renombre y desacoplamiento aplicados sobre el destino leído explícitamente de `.env.development`. Se preservaron identificadores, secretos y referencias; la tabla bancaria de origen pasó a `factor_transaccion_bancaria_fuente`. Los comentarios genéricos se completaron en un segundo plan de metadatos. Ambas aplicaciones fueron precedidas por revisión sin cambios y seguidas por `prisma-sync` sobre el mismo destino.

- [Aplicación del ajuste](../registros/bbdd/2026-10-16T11-23-25-674Z-ddl.json).
- [Aplicación de comentarios](../registros/bbdd/2026-10-16T11-47-19-731Z-ddl.json).
- [Verificación final independiente de metadatos](verificacion-configuracion-bbdd-20261016.json): tabla anterior ausente, 24 columnas sin `tabla_origen`, cinco FKs al catálogo genérico y comentarios cotejados exactamente con el modelo vigente. No se consultaron filas de clientes ni credenciales para esta verificación.

## Comprobaciones de código

| Comprobación | Resultado |
| --- | --- |
| Backend `typecheck:all` | Aprobado: aplicación, Vitest e integración |
| Frontend `typecheck` | Aprobado: aplicación y pruebas |
| ESLint de archivos afectados | Aprobado, sin errores ni advertencias |
| Suite completa backend | 54 archivos aprobados, uno omitido; 3.689 pruebas aprobadas y tres TODO existentes |
| Suite completa frontend | 87 archivos y 3.023 pruebas aprobados |
| Cierre adicional backend | 31 pruebas aprobadas en cifrado, diagnóstico y HTTP; incluye tres casos agregados después de la suite completa |
| UI específica | 11 pruebas aprobadas, incluidas creación/edición sin guardar, diagnóstico visible, prueba fallida seguida de guardado y base manual |
| Integración MariaDB desechable | No ejecutada: doctor informa Docker no iniciado |
| MySQL real / navegador con servidor real | No verificados |

Registros completos: [backend](../registros/pruebas/test-20261016-configuracion-bbdd-backend.log), [cierre focalizado](../registros/pruebas/test-20261016-configuracion-bbdd-cierre.log), [tipos backend](../registros/pruebas/test-20261016-configuracion-bbdd-tipos.log), [frontend](../../../../10_Workspace_react/ft-app-frontend-mantis/docs/registros/pruebas/test-20261016-configuracion-bbdd-frontend.log).

Las pruebas de conexión usan transporte simulado y datos sintéticos: comprueban diagnóstico, sanitización, controles y tiempos, pero no certifican red, TLS o permisos de un servidor concreto. Las pruebas de persistencia quedaron adaptadas al modelo vigente y sus tipos aprobaron; no se sustituyó la integración real por mocks ni se escribieron datos de prueba en desarrollo. Los tres TODO no equivalen a validaciones aprobadas.

**Siguiente paso del plan:** iniciar Docker para ejecutar la integración desechable y configurar la conexión real desde **Config BBDD**, siguiendo la [guía](configuracion-bbdd.md). Antes de guardar una contraseña nueva, infraestructura debe disponer de la clave GCM; el diagnóstico informa cómo resolver su ausencia. Reiniciar API/trabajador y recargar sesión para cargar rutas, variables y menú actualizados.
