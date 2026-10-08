# Hallazgos pendientes al ampliar las pruebas de negocio

Registro: 2026-10-07, America/Lima. Estado: pendientes; no se modificó la lógica
del backend. La ampliación de Vitest mantiene los flujos válidos existentes y
no convierte las deudas conocidas en nuevas políticas aprobadas.

## DT-TEST-01 — Copia final de archivo tras fallo de registro

Fuente: [cargarArchivoService](../../src/services/usuario/archivo.Service.ts).

El servicio copia el archivo a `STORAGE_PATH_SUCCESS` antes de llamar a
`archivoDao.insertArchivo`. Ante un error, el bloque `catch` elimina solamente
el temporal de origen. No elimina la copia del destino. La transacción de
Prisma no revierte operaciones del filesystem.

La nueva prueba `archivo.business.test.ts` comprueba propagación del fallo de
registro y limpieza del origen con archivos reales en una carpeta desechable.
La ausencia de compensación de la copia final se confirmó por revisión de la
secuencia y el `catch`; no se probó contra una BD real ni datos de producción.

Impacto: pueden quedar archivos sin un registro válido tras errores de escritura
o de confirmación de transacción. No se afirma que haya archivos reales afectados.

Decisión pendiente: definir compensación de almacenamiento y tratamiento de
un fallo posterior al callback de la transacción, sin borrar archivos previamente
existentes o compartidos. El filesystem requiere su propio mecanismo de limpieza.

Criterios futuros:

- Con registro fallido, no queda un nuevo archivo huérfano ni el temporal.
- La compensación no elimina archivos de otra carga.
- El error original se conserva si la limpieza también falla.
- Probar tanto el error del DAO como el error al confirmar una transacción real.

Seguimiento ejecutable: `DT-TEST-01` en
`tests/vitest/pending/business-decisions.test.ts`, marcado `todo`.

## DT-TEST-02 — Rango diferente de financiamiento en simulación y creación

Fuente: [controlador de propuestas](../../src/controllers/admin/servicio/factoring/factoringpropuesta.Controller.ts).

`createFactoringpropuesta` valida `porcentaje_financiado_estimado` entre 0 y 1;
`simulateFactoringpropuesta` lo valida entre 0 y 100. Ambas rutas pasan el valor
al mismo servicio/calculador como fracción, sin conversión de escala. El cálculo
V3 multiplica el monto neto por ese valor.

Evidencia: diferencia de esquemas y ausencia de conversión confirmadas en código.
La suite nueva verifica que creación rechace 1.01 con HTTP 400 y sin abrir una
transacción. No fija la aceptación de valores mayores a 1 en simulación como un
contrato correcto. No se afirma que existan propuestas reales con esos valores.

Impacto: simular y crear pueden dar resultados o validaciones diferentes para
la misma entrada. Una fracción mayor a 1 produce financiamiento superior al neto
y garantía negativa en el calculador actual.

Decisión pendiente: confirmar el contrato de simulación y los límites del producto,
incluyendo 0% y 100%, antes de unificar la validación. Revisar además los demás
controladores que expongan simulación y los clientes que los consuman.

Criterios futuros:

- Simular y crear interpretan la misma escala y aplican los mismos límites aprobados.
- Los valores fuera del rango producen un error de validación antes del cálculo.
- Cubrir ambos extremos y valores inmediatamente fuera de los límites.
- Conservar importes históricos y comprobar el payload del frontend.

Seguimiento ejecutable: `DT-TEST-02` en
`tests/vitest/pending/business-decisions.test.ts`, marcado `todo`.

## Deudas financieras previamente documentadas

DT-LIQ-01 a DT-LIQ-06 tienen seguimiento `todo` en la nueva suite. Sus decisiones
y criterios completos siguen en el
[registro original](20261006_1451_DT_validaciones_financieras_factoring.md).
DT-LIQ-07 y DT-LIQ-08 también siguen pendientes en ese documento y no quedan
cerradas por las pruebas nuevas.

Los `todo` no ejecutan una prueba, no suman casos aprobados y no prueban que
esas políticas estén implementadas. Los tests de conciliación usan catálogos
sintéticos coherentes; no certifican las combinaciones existentes en producción.
