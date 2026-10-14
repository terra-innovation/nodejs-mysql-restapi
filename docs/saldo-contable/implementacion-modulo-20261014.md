# Implementación Saldo Contable — 14/10/2026

## Alcance entregado

Módulo administrativo bajo Registro de operaciones: listado paginado con saldo y acciones detalle/edición/eliminación lógica/activación, creación con nombre/inicio/fin/corte y Descuento, sugerencias explicadas, selección manual, retiro justificado, clasificación por instrumento, recálculo y revisión/cierre inmutable. No se agregaron tablas ni se efectuaron escrituras directas en desarrollo en este bloque.

La arquitectura se conserva: router protegido → controlador Zod → servicio/transacciones → DAO Prisma. Las políticas de calendario, elegibilidad y Decimal viven en `src/domain/factoring/saldocontable/saldocontable.Policy.ts`; tipos de clasificación compartidos en `src/types/SaldoContable.types.ts`. La [API](contrato-api.md) transporta UUID y decimales como cadenas. El frontend usa React/MUI, Formik/Yup, SWR del proveedor actual y componentes visuales existentes; las tablas se paginan en servidor para no superponer paginación local de ReactTablePrincipal.

Fuentes: neto exclusivamente de propuesta aceptada de la operación; inicio de fecha_operacion; cobro total de fecha_pago_efectivo de liquidación vigente activa funcional4; contable SBS exacto del corte. Una operación anterior sigue sugerida mientras esté pendiente. La ayuda sobre neto confirmado por pagador es visible en detalle. Una candidatura USD sin contable se explica y no se selecciona; PEN usa1. Las operaciones sin evidencia válida muestran motivos y no se asocian.

Los cierres guardan referencias/copias en las tablas aprobadas, bloquean todas sus mutaciones y permiten cobros posteriores en las fuentes originales. Si las fuentes cambiaron antes del cierre, se exige recalcular y revisar. Las mutaciones comparten bloqueo de cabecera y versión; lote, total, auditoría y detalle se guardan atómicamente. Una clasificación puede registrarse por instrumento sin categoría inicial impuesta y sin distribuir arbitrariamente importes entre facturas.

## Instrucciones persistentes y herramientas

Actualizados ambos AGENTS.md: consultas de lectura permitidas cuando corresponda; cualquier mantenimiento directo de datos o estructura exige confirmación expresa específica. DDL utiliza el script revisado y después prisma-sync; las aprobaciones anteriores no son permisos permanentes. Pruebas solo sobre infraestructura desechable. El permiso para implementar el módulo no se convirtió en permiso para DDL adicional.

Se actualizó la copia estructural de integración mediante el exportador existente, leyendo solo metadatos, cero registros de clientes. Incluye las cuatro tablas SBS. También recoge la precisión18,10 de liquidación_financiero que ya estaba en desarrollo desde trabajos anteriores; esta actualización de snapshot no ejecutó ese ALTER.

La suite completa detectó un auxiliar de auditoría que seguía buscando dateUtils.js en frontend. Se adaptó para preferir la fuente TypeScript actual y mantener compatibilidad con JS, sin cambiar funciones financieras, fechas ni expectativas. Se conserva el registro del fallo inicial y su corrección.

## Validación

Desarrollo por bloques con pruebas focalizadas y comprobaciones de tipos; integración y suites completas ejecutadas al final. Resultados actuales de cierre sobre Node portable24.21.0, sin confundir mocks con MariaDB real:

| Comprobación final | Resultado | Registro |
| --- | --- | --- |
| Backend completo | 3609 aprobadas, 3 todo existentes; 44 archivos aprobados y uno omitido | [log final](../registros/pruebas/test-saldo-contable-backend-completo-final-20261014.log) |
| Integración completa MariaDB11.4.10 | 546 aprobadas, 18 archivos; incluye proceso compilado/HTTP real | [log final](../registros/pruebas/test-saldo-contable-integracion-completa-20261014.log), [informe conservado](../registros/pruebas/test-saldo-contable-integracion-completa-20261014.json) |
| Frontend completo | 2979 aprobadas, 80 archivos | [log final](../../../../10_Workspace_react/ft-app-frontend-mantis/docs/registros/pruebas/test-saldo-contable-frontend-completo-final-20261014.log) |
| Tipos backend, Vitest e integración | npm run typecheck:all aprobado | Salida actual del ejecutor; sin errores |
| Tipos frontend y pruebas | npm run typecheck aprobado con contrato definitivo | [registro](../../../../10_Workspace_react/ft-app-frontend-mantis/docs/registros/pruebas/test-saldo-contable-tipos-cierre-20261014.log) |
| Lint de fuentes modificadas y nuevas | Aprobado en ambas raíces, sin avisos | ESLint focalizado |
| Revisión visual local de lectura | Menú debajo de Registro de operaciones, listado vacío, formulario con nombre/Descuento/tres fechas | Navegador local, formulario abierto y cancelado sin guardar |

Contenedor final de integración `e07749a95c0fc3c7ba9e5e32`: passed, cleanup=removed. El snapshot se exportó solo una vez por el cambio estructural real y no se volvió a copiar en cada prueba.

- Políticas puras: 15 casos; calendario Lima, cobro antes/en/después, cartera antigua, neto aceptado, PEN1/USD, datos inválidos y precisión completa.
- HTTP real con transporte simulado: 13 casos; autenticación, revocación/roles, payloads estrictos, versiones, paginación y menú.
- Pantallas con API simulada: 8 casos; estados, selección, motivos, bloqueo contable, consulta sin escrituras y conflictos.
- Formularios reales MUI/Formik/Yup: 3 casos; cobertura semestral, corte independiente, fechas invertidas, errores de servidor visibles y clasificación elegida con sustento.
- Integración focalizada MariaDB11.4.10: 17 casos aprobados; transacciones, fuentes, recurrencia, cierre inmutable, cobros posteriores, recálculo, retiro/reactivación, rollback y concurrencia. Contenedor eliminado al terminar.

La primera suite completa frontend detectó una dependencia de Router introducida al añadir el enlace a operación. Se aisló el parámetro de URL en FactoringListaRuta, conservando FactoringLista independiente; las 70 pruebas afectadas y una prueba nueva del enlace aprobaron. Dos fallos por tiempo máximo no se reprodujeron al repetirlos separados; la ejecución completa definitiva pasó sin aumentar timeouts ni modificar expectativas. Los registros iniciales se conservan junto a los finales.

No se empaquetó producción ni desplegó. La revisión visual fue de lectura con sesión existente y cero períodos: no se probó el CRUD sobre registros reales de desarrollo ni se cargaron históricos. Las escrituras/recálculos/cierres se verificaron con datos sintéticos en MariaDB exclusiva. No se rectificaron importes ni clasificaciones históricas. La conciliación con libros y los sustentos concretos corresponden a la aceptación administrativa; no se infiere evidencia de CI remoto.

## Matriz de requisitos y evidencia

| Requisito | Implementación | Evidencia focalizada |
| --- | --- | --- |
| Opción bajo Registro de operaciones y acceso admin | menuAdmin, router y ruta frontend | HTTP/menú, matching de rutas y permisos revocados |
| Nombre, fechas flexibles y Descuento | controlador estricto, política, formulario | HTTP, política, integración y formularios |
| Pendiente al corte y repetición entre períodos | política + fuentes DAO | casos de cartera antigua y cobro antes/en/después, integración de dos cortes |
| Neto de propuesta aceptada | adaptador en servicio y FK/copia de detalle | neto inicial distinto en fixture real |
| Tipo contable exacto y conversión a PEN | DAO SBS estricto + Decimal local de precisión40 | USD sin corte exacto, PEN1 y producto de ocho decimales |
| Asociación/retiro manual y motivo | mutaciones transaccionales, selección de pantalla | retiro/reactivación sin duplicados y lote atómico |
| Curso/futuro bloqueados | política de acciones y guardas del servicio | política, integración y pantalla |
| Cierre y pagos posteriores | copias guardadas + bloqueo/versión + revalidación | igualdad del reporte después del cobro original, rollback y concurrencia |
| Listado, detalle, edición, eliminar/activar | API y diálogos frontend | pruebas UI y recuperación lógica en integración |
| Clasificación sustentada por instrumento | JSON serializado y formulario sin selección impuesta | conservación en cerrado e input de categoría/sustento |
| Instrucciones DB para próximos modelos | AGENTS.md de ambas raíces y script documentado | revisión de las instrucciones, sin DDL adicional |

## Recorrido de aceptación

1. Entrar como administrador validado → SPLAFT → Saldo Contable, inmediatamente debajo de Registro de operaciones.
2. Crear período anterior con fechas reales; comprobar nombre, Descuento y saldo vacío provisional.
3. Abrir edición: revisar candidatas, motivos e importes de propuesta aceptada. Comprobar PEN1 y USD con contable del corte; sin contable, ver bloqueo explícito.
4. Asociar, revisar saldo, clasificar instrumentos según sustento; retirar con motivo y volver a asociar sin duplicar.
5. Crear período en curso/futuro y verificar que puede editar cabecera pero no seleccionar operaciones ni cerrar.
6. Revisar selección y cerrar período anterior; verificar que detalle conserva importes y que no permite editar/retirar/eliminar/reabrir.
7. Registrar posteriormente el cobro original por su flujo habitual y verificar que el reporte cerrado conserva su saldo y evidencia.
8. Revisar operación pendiente en otro corte: debe volver a sugerirse. Eliminar/activar un período en elaboración conserva sus datos.

Este recorrido es validación funcional del usuario, no una instrucción para ejecutar mantenimiento directo en desarrollo.

## Ajuste posterior: candidatas y asociación individual

Petición posterior del 14/10/2026: listar únicamente operaciones con fecha_operacion existente y hasta el día completo de corte. Se aplica en la consulta DAO y en su count, antes de paginar, con límite exclusivo del día siguiente en Lima. La búsqueda conserva el mismo filtro; no se añade un mínimo basado en fecha_inicio del período, por lo que se mantiene cartera antigua.

En edición, cada fila calculable y no asociada tiene Añadir con la misma API/transacción/versión que el lote. Se conserva Asociar seleccionadas. Añadir una operación individual conserva las otras filas seleccionadas para el lote; no habilita curso, futuro, cerrados ni candidatas sin tipo contable. El detalle de consulta permanece sin acciones de escritura.

Validación focalizada del ajuste: [13 pruebas de pantalla/formularios aprobadas](../../../../10_Workspace_react/ft-app-frontend-mantis/docs/registros/pruebas/test-saldo-contable-ajuste-filtro-filas-20261014.log) y [18 de integración del módulo aprobadas](../registros/pruebas/test-saldo-contable-ajuste-filtro-integracion-20261014.log), incluidas fechas nulas/posteriores, principio/fin del día de corte, búsqueda y total paginado correcto. [Contenedor eliminado](../registros/pruebas/test-saldo-contable-ajuste-filtro-integracion-20261014.json). Tipos backend/integración y lint de ambas raíces aprobados; tipos frontend también aprobados, con [su log específico](../../../../10_Workspace_react/ft-app-frontend-mantis/docs/registros/pruebas/test-saldo-contable-ajuste-filtro-tipos-20261014.log). Las suites completas del apartado anterior corresponden a la entrega inicial; no se repitieron para este ajuste focalizado. No hubo cambios de estructura ni escrituras de mantenimiento en desarrollo.
