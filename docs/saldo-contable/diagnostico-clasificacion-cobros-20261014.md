# Diagnóstico: cobros omitidos en evaluación de saldo contable

14/10/2026. Alcance: investigación de la incidencia reportada durante validación manual del corte30/06/2026. Solo consultas de lectura, con entorno obtenido explícitamente de .env.development y transacción READ ONLY; sin modificaciones de código funcional, datos o estructura ni ejecución de pruebas.

## Hallazgo confirmado

Las cinco operaciones indicadas por el usuario tienen una liquidación lógicamente activa en estado funcional10 (FLE00010, Cierre - Liquidada) y fecha_pago_efectivo hasta el corte. Se verificó mediante conteos agregados, sin registrar importes, fechas individuales, identificadores ni filas de clientes en este documento.

El nuevo DAO saldocontable.Dao.ts filtra liquidaciones por estado lógico1 y estado funcional4. El catálogo real identifica4 como FLE00004, Interna - Enviado al cliente, no como liquidación cobrada. Este filtro fue tomado de las funciones getFactoringliquidacionVigenteByIdfactoring del DAO previo sin verificar su significado contra el catálogo real.

Por ello las liquidaciones en10 no llegan al evaluador: este recibe liquidaciones=[] y considera pendiente la operación iniciada con propuesta aceptada válida. La pantalla, al no recibir motivos de exclusión, imprime Pendiente de cobro al corte. El error no está en las fechas de estos cinco cobros, sino en la selección de la fuente.

Las pruebas originales construyeron estados sintéticos usando4 para la fuente vigente, por lo que reprodujeron la misma suposición y no cubrieron el catálogo real. La corrección requiere una regresión con el estado Liquidada10 y no meramente cambiar el nombre de la fixture.

## Comportamiento esperado y siguiente paso

La precisión posterior del usuario sustituye la propuesta inicial: mostrar solo operaciones con estado lógico 1, inicio acreditado hasta el corte y sin cobro total hasta ese día inclusive. Usar fecha_pago_efectivo de liquidaciones con estado lógico 1 sin filtrar por estado funcional. Cualquier cobro activo hasta el corte excluye; si todos son posteriores, conserva el saldo histórico. Las cobradas no aparecen en sugerencias, aunque las mutaciones siguen rechazándolas con PAGADA_AL_CORTE.

Corrección aplicada al módulo SBS y su ayuda de pantalla. Comprobación agregada de solo lectura con el nuevo predicado: cinco operaciones verificadas, cero candidatas. No se repararon asociaciones existentes ni se modificaron datos, esquema o DAO compartido. La evidencia de pruebas y sus límites figura en [implementación](implementacion-modulo-20261014.md).

**Siguiente paso del plan:** ejecutar la integración corregida cuando Docker esté disponible y continuar la validación manual. Los borradores existentes deben revisarse mediante el flujo de la aplicación; no se han retirado asociaciones automáticamente.
