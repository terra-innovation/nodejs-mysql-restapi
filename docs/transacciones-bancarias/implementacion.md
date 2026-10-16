> Ajuste vigente 16/10/2026: la configuración pasó a configuracion_bbdd. Consulte [diseño actualizado](configuracion-bbdd.md) y [validación del ajuste](validacion-configuracion-bbdd-20261016.md). Los resultados siguientes corresponden a la implementación inicial.

# Implementación backend y frontend de transacciones bancarias

Fecha de referencia: 15/10/2026, Lima. Alcance autorizado: implementación del módulo completo y ejecución de pruebas sintéticas; sin nuevas modificaciones de estructura, carga real ni despliegue de producción.

Resultado final: backend/frontend implementados, suites completas de Vitest aprobadas en ambos proyectos, tipos de aplicación/pruebas aprobados y lint sin errores. El lint de archivos compartidos conserva una advertencia previa por `logLevel` sin uso; el módulo nuevo no presenta advertencias. La [evidencia final con huellas de registros](validacion-final.json) distingue esos resultados de la integración real pendiente por Docker.

## Entrega

- Backend por capas: rutas y validación Zod en controladores, orquestación y transacciones en servicio compartido de banca, persistencia en DAO, normalización/identidad en dominio, cifrado en proveedor e integración MySQL separada.
- Configuración administrable exclusiva de rol administrador 2, debajo de correo. AES-256-GCM con clave externa, AAD ligado a conexión, nonce/tag y rotación mediante reemplazo de secreto. Respuestas e historial sin materiales criptográficos; logs de parámetros/errores bancarios sanitizados.
- Financiero rol 6: grupo independiente de menú, consultas y CRUD de movimientos, mapeos, sincronización manual, ejecuciones/log, incidencias e historial. La conexión se presenta solo como UUID/alias; no se entregan host/usuario/credenciales al financiero.
- Magnitud positiva y signo ±1, aritmética Decimal, identidad inicial estable, no duplicación por relectura, enlace de alta manual observada después, conservación de enriquecimientos, carga histórica solo de movimientos nuevos y manejo explícito de resultados parciales.
- Bloqueo asesor compartido entre API y CLI, reintentos idempotentes, interrupciones recuperables, lectura remota SELECT/TLS con límites y sin transacción local abierta durante la red. Sin eliminaciones por ausencia en origen ni cambios automáticos en pagos/factoring.
- Pantallas React/MUI con Formik/Yup, SWR, errores/estados de carga, edición por versión, sustento de cambios y detalle legible. Rutas y visibilidad por perfil; el servidor vuelve a comprobar roles vigentes.
- CLI de desarrollo/producción y plantillas systemd revisables. No se activó un servicio en Ubuntu ni se empaquetó producción.

La [guía de operación](operacion.md) detalla configuración externa, flujo de perfiles, contratos y programación.

## Evidencia y alcance de pruebas

Los registros se mantienen como evidencia de la ejecución actual, sin trasladar resultados históricos a esta implementación:

| Comprobación | Registro |
| --- | --- |
| Tipos backend, Vitest e integración | [typecheck-completo.log](typecheck-completo.log) |
| Suite backend completa | [test-backend-completo.log](test-backend-completo.log) |
| Tipos frontend de aplicación y pruebas | [registro frontend](../../../../10_Workspace_react/ft-app-frontend-mantis/docs/registros/pruebas/test-banca-typecheck.log) |
| Pantallas con datos sintéticos | [registro UI](../../../../10_Workspace_react/ft-app-frontend-mantis/docs/registros/pruebas/test-banca-ui.log) |
| Regresión frontend completa | [registro frontend completo](../../../../10_Workspace_react/ft-app-frontend-mantis/docs/registros/pruebas/test-banca-regresion-completa.log) |
| Lint del backend nuevo | [lint.log](lint.log) |
| Lint frontend afectado | [registro lint frontend](../../../../10_Workspace_react/ft-app-frontend-mantis/docs/registros/pruebas/test-banca-lint.log) |
| Intento de integración desechable | [test-integracion.log](test-integracion.log) |

Los tests del módulo cubren precisión/fechas/signo, deduplicación, cargas históricas, preservación local, concurrencia simulada y versiones, reapertura auditada, cifrado real y alteración de ciphertext/nonce/tag/AAD, política de destinos/TLS, permisos de lectura, consultas parametrizadas, límites, cierre de conexiones, errores sanitizados, roles HTTP y uso de actor autenticado. Las pantallas prueban separación de perfiles, secreto opcional al editar, validaciones, guardado con versión, invalidación SWR y sincronización manual con resultado parcial.

Se comprueba también que editar host/base/usuario sin reemplazar contraseña valida la configuración nueva, conservando únicamente el sobre criptográfico previo. El menú bancario es un grupo independiente del financiero y conserva las expectativas anteriores de agrupación de Factoring; no se debilitaron pruebas existentes.

La suite preparada `tests/mariadb/transaccionbancaria.test.ts` usa el runner existente y crea exclusivamente las seis tablas nuevas dentro de MariaDB desechable, a partir del SQL versionado. No regenera snapshots ni consulta desarrollo. Prueba GCM persistido, enlaces/idempotencia, CHECK reales, rollback ante fallo de historial, unicidad concurrente y bloqueo asesor real. La fuente remota se sustituye por filas sintéticas; aun cuando se ejecute, no certificará un servidor MySQL real.

## Límites y pendientes externos

El motor Docker Linux no estaba activo al intentar integración: el runner falló en preparación, sin crear contenedor ni base. La suite de persistencia quedó preparada y comprobada por tipos, pendiente de ejecución. Al disponer de Docker:

```powershell
$env:Path = 'D:\Herramientas\node-v24.21.0-win-x64;' + $env:Path
npm.cmd run test:integration -- tests/mariadb/transaccionbancaria.test.ts
```

Las primeras ejecuciones de Vitest dentro del aislamiento de Windows encontraron ENOENT en temporales. Se repitió la selección fuera del aislamiento, sin debilitar aserciones ni sustituir suites. El registro frontend de ese intento se conserva como `test-banca-regresion-aislamiento.log`; no representa fallos funcionales confirmados del módulo.

Falta configurar clave externa, destinos permitidos, CA si corresponde, credenciales SELECT y mapeos reales; después ejecutar desde financiero y cotejar el primer alcance con el estado de cuenta. No se conectó al origen MySQL real ni se cargaron datos bancarios reales. No se hicieron pruebas E2E en navegador ni activación remota; las pruebas de componentes usan transporte simulado. La validación por tipos, las pruebas sintéticas y la integración de persistencia son evidencias diferentes.

El diseño y los límites de identidad sin ID bancario siguen vigentes. Resolver una incidencia registra la revisión; no aplica automáticamente correcciones de origen, comisiones ni relaciones financieras. Los conflictos que continúen apareciendo en nuevas lecturas se reabren con su resolución previa conservada en historial.
