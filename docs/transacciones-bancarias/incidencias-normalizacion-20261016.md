# Motivos de incidencia y normalización histórica

El usuario solicitó explicar por registro las seis incidencias de una carga histórica, revisar si las validaciones eran correctas y probar desde el navegador. La lectura de evidencia en desarrollo identificó cinco filas con horas AM/PM no admitidas por el validador de 24 horas y una fila con ambas comisiones negativas. Fueron siete campos observados en seis movimientos; los 123 movimientos se habían importado y solamente se omitieron los auxiliares observados.

El usuario confirmó expresamente normalizar las comisiones a magnitud positiva y las horas a 24 horas. Se conserva la regla de signo del monto neto y no se cambian identidad, monto bancario, moneda, fechas civiles ni fórmulas de Factoring. Se aceptan horas AM/PM válidas de 1 a 12, minutos/segundos de 0 a 59, convirtiendo correctamente medianoche y mediodía. Las comisiones usan Decimal y valor absoluto, conservando precisión y cero. Formatos inválidos, importes fuera de precisión y textos demasiado extensos continúan observados.

La lista de Incidencias agrega operación, tipo legible y motivo. El detalle explica el efecto de la observación, el motivo por campo y cómo continuar. Los registros antiguos se interpretan con la validación original, por lo que el cambio de regla no borra el motivo histórico. Las nuevas incidencias de auxiliares incluyen `_version_validacion=2` y `_campos_observados` en su evidencia JSON para que la presentación no atribuya observaciones a campos normalizados correctamente. La huella sigue calculándose sobre la fila original, evitando duplicados causados por metadatos de diagnóstico. No se alteró la estructura de la base ni se recalcularon ejecuciones históricas.

También se corrigió Resolver: propone RESUELTA en lugar de reutilizar PENDIENTE y exige un sustento nuevo, sin copiar el motivo calculado de la incidencia como decisión del usuario. Se mantiene la versión optimista y la auditoría.

## Prueba real en navegador

Se abrió el navegador integrado en `http://localhost:3000`; la sesión del usuario ya estaba activa. Se comprobaron la lista y el detalle de las seis incidencias. Las correcciones se hicieron mediante los formularios y endpoints de la aplicación, conservando todos los demás campos y verificando los valores al volver a abrir cada movimiento. Se corrigieron cinco horas y dos comisiones en los seis movimientos. Las incidencias se marcaron RESUELTA después de la comprobación, con sustento y eventos de historial. No hubo escrituras SQL directas de mantenimiento ni cambios en el origen remoto.

En el control nativo de hora, la primera entrada automatizada no quedó retenida. La verificación posterior lo detectó y se completó con teclado nativo antes de declarar el dato corregido. El historial conserva el intento de edición y la corrección efectiva; no se borraron eventos. Las fechas del alcance de sincronización se verificaron con sus controles accesibles antes de ejecutar.

Se verificó en modo lectura el alcance original: las mismas dos cuentas, del 01/01/2020 al 31/12/2024. Se repitió CARGA_LEGADO desde la interfaz con ese alcance. Resultado comprobado en el detalle de la nueva ejecución **BS3E692A2801054C56**: EXITOSA, lectura completa, 123 filas leídas, 123 existentes, cero movimientos nuevos y cero incidencias. No se duplicaron movimientos ni se reemplazaron los enriquecimientos corregidos. La ejecución inicial conserva PARCIAL y seis observaciones como evidencia histórica.

## Validación de código

- Backend: 47 pruebas aprobadas de normalización, explicación histórica, metadatos por campo, sincronización/idempotencia y permisos HTTP. Tipos de aplicación, Vitest e integración aprobados; ESLint focalizado aprobado.
- Frontend: 14 pruebas aprobadas de pantallas, diagnósticos por campo y resolución con sustento; tipos y lint aprobados.
- [Registro backend](../registros/pruebas/test-20261016-banca-incidencias-backend.log).
- [Registro frontend](../../../../10_Workspace_react/ft-app-frontend-mantis/docs/registros/pruebas/test-20261016-banca-incidencias-frontend.log).

Las pruebas sintéticas se distinguen de la comprobación real de navegador descrita arriba. No se ejecutaron suites completas ni integración MariaDB desechable en este ajuste. No se guardaron credenciales ni filas bancarias reales en los registros de pruebas o en este documento. El script temporal para agrupar los motivos fue retirado.

**Siguiente paso del plan:** continuar las sincronizaciones operativas con el alcance que el financiero seleccione y revisar cualquier nueva observación desde la lista y detalle de Incidencias. Las relecturas preservan los enriquecimientos locales; normalizar nuevos datos no autoriza sobrescribir correcciones previas.
