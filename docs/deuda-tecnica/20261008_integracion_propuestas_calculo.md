# Cálculo y creación de propuestas: integración real — 2026-10-08

## Precisión del alcance

La recomendación anterior hablaba de «recálculo de propuestas». Al revisar el
código se confirmó que no existe un servicio que sobrescriba los importes de
una propuesta existente: `updateFactoringpropuestaService` solo cambia el estado
y registra historial. Los flujos reales son simulación y creación de una nueva
propuesta calculada. Esta ampliación prueba esos flujos, sin implementar una
nueva funcionalidad de recálculo ni cambiar fórmulas o reglas comerciales.

## Cobertura añadida

`tests/mariadb/proposal.test.ts`: **19 casos reales**, con Prisma, DAOs,
calculador y transacciones originales. Solo se sustituyen configuración local,
logging y proveedores de correo/Telegram. Se usan fixtures sintéticas y reloj
Luxon fijo, sin alterar temporizadores de Prisma.

| Casos | Verificación |
| --- | --- |
| 4 | PEN/USD y banco 1/2: simulación sin escrituras; creación, lectura, cabecera, detalles, historial y actor; garantía, descuento, comisión, IGV, costo y gasto interbancario; conciliación y propuesta anterior intacta |
| 7 | Referencias inexistentes: operación, tipo, estrategia, tres riesgos y estado; rechazo 404 sin modificar datos anteriores |
| 4 | Error SQL en cabecera, historial, primer o segundo detalle: rollback completo de la nueva propuesta, incluidos sus detalles/historial, conservando la anterior y la operación |
| 1 | Falta configuración IGV: fallo en el calculador sin escrituras parciales |
| 1 | Instrumentación de consultas SQL reales: conexión exterior distinta de la del calculador y configuración posterior visible para este último |
| 1 | Dos creaciones simultáneas con importes distintos: propuestas independientes completas, sin sustituir la propuesta aceptada |
| 1 | Aprobación de una propuesta entre lectura y creación de otra: mantiene estado/vínculo e importes aprobados; la nueva propuesta se guarda completa |

Las instrumentaciones de concurrencia/islamiento ejecutan los DAOs originales;
no inventan sus resultados. El caso de aprobación fuerza una intercalación
concreta, sin demostrar todas las combinaciones posibles de carrera.
Los errores SQL se provocan con triggers temporales en la instancia desechable.

## Hallazgos y límites

### Transacciones independientes del calculador

`simulateFactoringLogicV3` abre otra `$transaction` desde el cliente global, aunque
el servicio llamador ya tenga una abierta. No es un savepoint ni comparte la
conexión o el snapshot exterior. La prueba consulta `CONNECTION_ID()` en ambas
y demuestra que una actualización de IGV de 0.18 a 0.20, confirmada después de
la lectura exterior, puede producir una nueva propuesta con IGV de comisión
40 y total 43 (en lugar de 36 y 38.70).

La transacción del calculador actualmente **solo lee**: las escrituras de
propuesta/historial/detalles sí pertenecen a la transacción exterior y los fallos
probados las revierten juntas. No se detectaron confirmaciones parciales de
esas escrituras. El límite constatado es que la lectura de configuración no
comparte el snapshot exterior y ocupa una conexión adicional.

Por decisión del usuario, este comportamiento queda documentado como **límite
conocido, sin implementación autorizada ni cambio programado**. Se conserva la
transacción independiente del calculador y su prueba de caracterización.
Una eventual evaluación de compartir transacción requerirá una solicitud
posterior y regresiones de propuestas, simulaciones y liquidaciones.

### Creación mientras existe una aprobación

El servicio de creación no bloquea nuevas propuestas por tener otra aceptada.
La prueba comprueba que la creación no cambia importes, estado ni vínculo de la
propuesta aprobada. Es una caracterización del comportamiento existente; no
adopta como regla comercial que se deban permitir nuevas propuestas después
de aprobar la operación. Si se exige impedirlas, hace falta definir esa regla
y comprobarla bajo concurrencia antes de introducir restricciones.

### Configuración ausente

La ausencia del maestro IGV provoca una excepción del calculador y no deja
datos parciales. Esta prueba no certifica una respuesta HTTP específica para
catálogos incompletos ni convierte esa excepción en una validación funcional.

## Ejecución repetible

```powershell
npm run test:integration -- tests/mariadb/proposal.test.ts
npm run test:integration:typecheck
npm run test:integration
```

La integración completa pasa de 114 a **133 casos en siete archivos**. Los
reportes de ejecución, JUnit y limpieza quedan en `coverage/mariadb/`.
Las suites rápidas y los servicios productivos no cambiaron en esta etapa.
Comprobación de tipos de integración aprobada. Ejecución completa: runId
`4df7885ce1861ff91375084b`, estado `passed`, limpieza `removed`, JUnit con
133 casos y cero fallos. Se confirmó que no quedan contenedores del runner.

Ampliación posterior completada: 12 pruebas SQL de solicitudes repetidas y
concurrentes en liquidaciones/transferencias; total 145. Ver
[resultados y límites](20261008_integracion_concurrencia_liquidaciones_transferencias.md).
No se añadieron bloqueos, unicidad ni idempotencia. La transacción independiente
del calculador sigue documentada como límite, sin cambio autorizado ni programado.
