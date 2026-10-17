# Implementación de pagos de Factoring

Fecha: 16/10/2026. Estado: backend/frontend implementados; DDL de desarrollo aplicado y verificado; comprobaciones de cierre aprobadas. Regularización histórica pendiente por decisión del usuario.

## Resultado funcional

- Administrador → Operaciones → Editar Factoring: sección «Pagos de la operación», junto a liquidación, con alta, edición, eliminación lógica y activación de abonos.
- Detalle de Factoring: misma sección en consulta, sin acciones de modificación.
- Buscador bancario paginado por rango civil, número o descripción; restringido al factor, moneda, cuentas activas y abonos activos. Muestra importe y disponible global.
- Un movimiento puede aplicarse a varias operaciones. Cada aplicación tiene importe propio y la suma global no puede exceder el movimiento. No se copia número, fecha, moneda o cuenta al detalle.
- Al marcar Inicio de operación se asegura un maestro único en la misma transacción del historial/operación, antes de notificar. Un reintento conserva maestro, estado y abonos.
- El maestro no tiene alta, edición o eliminación genéricas. «Cambiar estado de pago» es una acción específica con actor, versión, motivo e historial. No depende de saldo cero.
- Total y diferencia se calculan desde detalle activo y monto neto de la propuesta aceptada. La diferencia sigue visible tras cancelar y no equivale a un ajuste contable.

## Persistencia y concurrencia

El detalle y los cambios bancarios usan READ COMMITTED para releer después de esperar el bloqueo del movimiento. Las aplicaciones se serializan por movimiento y maestro; la versión evita escrituras de una pantalla desactualizada. La creación del maestro bloquea la operación y usa lectura actual para no depender de un snapshot previo.

Altas, correcciones, anulaciones, activaciones y cambios de estado guardan historial en la misma transacción. Un fallo de historial revierte también detalle y versión. La anulación libera disponibilidad sin borrar evidencia ni cambiar el estado manual. Las modificaciones bancarias de importe, signo, número o fecha y la anulación se bloquean mientras existan aplicaciones activas.

Los importes se validan como texto decimal; las sumas se calculan en MariaDB y la diferencia utiliza precisión local suficiente para acumulados mayores que un abono. No se alteró la configuración decimal de otras fórmulas.

En frontend, la caché comparte la clave de pagos con el gestor de detalle, evita consulta duplicada al montar y escribe la respuesta confirmada también en el proveedor actual. Una respuesta anterior no reemplaza versiones nuevas; un cambio de contexto A→B→A impide cerrar o sobrescribir el formulario nuevo.

## Base autorizada

El usuario autorizó transformar `factoring_pago`, crear catálogo/detalle/historial, configurar los tres estados con actor 105 y ejecutar prisma-sync. Se leyó exclusivamente `.env.development`, sin publicar credenciales ni datos de clientes.

- [Revisión previa sin cambios](../registros/bbdd/2026-10-16T22-16-44-641Z-ddl.json).
- [Aplicación y verificación](../registros/bbdd/2026-10-16T22-16-55-194Z-ddl.json).
- [Registro sanitizado de Prisma](../registros/bbdd/2026-10-16T22-16-55-194Z-prisma-sync.log).
- [SQL exacto aplicado](../registros/bbdd/20261016-pagos-aplicado.sql).

La guarda inicial constante fue descartada tras una prueba desechable: el ALTER intermedio podía retirarla. La versión aplicada usa `CHAR_LENGTH(code) < 0`, rechaza filas existentes y bloquea inserciones hasta terminar. Las pruebas del DDL conservaron el baseline legado como fixture sintético para reproducir la transformación.

El baseline de integración se actualizó por este cambio real de estructura, con metadatos y cero registros. Incluye las siete tablas bancarias que faltaban en el baseline anterior y las tres nuevas de pagos. También recoge diferencias preexistentes de metadatos de otras siete tablas; el runner verificó que el DDL de esta tarea no alteró ninguna estructura existente fuera de `factoring_pago`. No se regeneraron snapshots de expectativas financieras.

## Compatibilidad y límites

Los contratos antiguos conservan `factoring_pagos: []`, como antes de migrar la tabla vacía. El nuevo resumen y detalle se exponen mediante `api/v1/admin/servicio/factoring/factoringpago/:factoringid`, con autorización vigente de rol 2, UUID públicos y campos explícitos. No se amplió el acceso de empresario, inversionista o financiero al nuevo módulo.

Se actualizaron fixtures de persistencia de trazabilidad para el nuevo maestro, conservando todas las expectativas de fechas. La comprobación exacta del menú financiero se actualizó para incluir sus siete entradas bancarias preexistentes; no se cambió el menú ni sus condiciones. Las pruebas del listado ahora incluyen siete secciones y ocho lecturas con cabecera, conservando permisos, orden de commits y protección de formularios. La ficha de Empresa se aisló de la nueva sección en su prueba específica.

No se aplicó en producción, no se empaquetó producción, no se enviaron correos desde desarrollo ni se registraron abonos de prueba en bases compartidas. Las pruebas de correo y orígenes remotos usan límites sintéticos; persistencia, transacciones, locks y HTTP de pagos se comprobaron en MariaDB desechable.

## Regularización expresamente rechazada

La revisión de solo lectura identificó diez operaciones activas con fecha de inicio sin maestro. El usuario indicó **«No, dejar pendiente esa regularización»**. No se crearon esos maestros, pagos ni asociaciones; no se cambiaron sus fechas, propuestas o estados. El nuevo maestro se crea al ejecutar el flujo de Inicio de operación después de activar este código. No se debe repetir artificialmente el inicio para regularizar operaciones anteriores.

## Evidencia de comprobaciones

Comprobaciones locales con Node portable 24.21.0, sobre el cambio pendiente de ambos repositorios. Las completas se ejecutaron por el impacto transversal en operaciones, sincronización, permisos y persistencia bancaria. Se conservan registros completos:

| Selección | Resultado |
| --- | --- |
| Backend completo, Vitest | 57 suites aprobadas; 3.741 pruebas aprobadas; 1 suite omitida con 3 pendientes declaradas |
| Integración completa, MariaDB desechable y runtime | 22 suites y 575 pruebas aprobadas |
| Regresión final de pagos y runtime, tras ajuste de precisión | 2 suites y 15 pruebas aprobadas |
| Frontend completo | 91 suites y 3.049 pruebas aprobadas |
| Tipos de aplicación y pruebas, ambos proyectos | Aprobados |
| Lint de archivos frontend afectados | Aprobado, sin advertencias |

Todas las ejecuciones finales terminaron con código cero. El último contenedor desechable quedó eliminado (`runId: da58cdf064480b0e31da902a`). Las tres pruebas pendientes del backend no cuentan como comportamiento validado. La ejecución completa de integración precedió al ajuste local de precisión; la regresión final comprobó de nuevo sus consumidores de pagos y runtime. La última limpieza del DAO de operaciones se comprobó con tipos y no cambió sus resultados.

- Backend completo: [pagos-backend-cierre.log](../registros/bbdd/pagos-backend-cierre.log).
- Integración completa y runtime: `docs/registros/bbdd/pagos-integracion-completa.log`.
- Regresión final de pagos/runtime: `docs/registros/bbdd/pagos-integracion-final.log`.
- Tipos de aplicación y pruebas: `docs/registros/bbdd/pagos-typecheck.log`, `pagos-vitest-types.log`, `pagos-integracion-types.log`.
- Frontend: registros en `docs/registros/pruebas/` del proyecto frontend, con consumidores, caché, tipos, lint y ejecución completa.

La comprobación de desarrollo posterior al DDL mantiene cero maestros y cero detalles: [verificación](verificacion-desarrollo.json) y [revisión de solo lectura](../registros/bbdd/revision-pagos-factoring-2026-10-16T23-08-24-054Z.json). La regularización rechazada continúa pendiente. La activación restaura el importe anterior y vuelve a comprobar disponibilidad; si ya no alcanza, se rechaza sin cambios.

La revisión visual de escritorio y pantalla estrecha usó el tema real y transporte sintético aislado, sin credenciales ni conexión al backend. Se verificaron buscador, selección, refresco de importes, cambio manual con diferencia y consulta sin botones de edición. Es evidencia visual de componentes, separada de la integración real de backend y de una E2E autenticada.

Corrección posterior en frontend, 16/10/2026: la apertura administrativa rechazaba el resumen de pagos porque el gestor esperaba una lista. Se añadió validación específica y se corrigió el fixture del listado. Se verificaron edición y detalle en la sesión real sin guardar cambios ni crear maestros. La suite completa de frontend indicada arriba precede a esta corrección; su regresión actual se registra en el frontend, `docs/implementaciones/PAGOS_FACTORING_DIAGNOSTICO_APERTURA_20261016.md`.
