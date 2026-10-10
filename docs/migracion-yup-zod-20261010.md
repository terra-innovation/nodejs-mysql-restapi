# Migración de validaciones a Zod

Fecha: 10 de octubre de 2026.

## Decisión y alcance

Zod es la única dependencia de validación de esquemas del backend. Se retiran Yup y sus dependencias exclusivas mediante npm, conservando `package-lock.json` y la versión existente de Zod. La migración comprende controladores, parámetros de plantillas de correo, utilidades de archivos y el manejador global de errores.

Los esquemas usan `parse()` y eliminan propiedades desconocidas mediante objetos Zod. El manejador reconoce `ZodError` como error conocido y conserva la respuesta HTTP 400 con «Datos no válidos». Registra mensajes y rutas de los errores sin incluir los valores recibidos. Los mensajes personalizados se mantienen; los mensajes internos predeterminados pasan a ser los de los esquemas Zod migrados.

## Criterios de implementación

- `src/utils/validationInputs.ts` concentra las conversiones de entrada, separadas de las reglas Zod. Conserva las conversiones de cadenas, números, booleanos y fechas; evita convertir `"false"` en verdadero, una cadena vacía en cero o `null` en una fecha epoch.
- La interpretación de fechas sin zona sigue siendo local; las fechas con `Z` o desplazamiento conservan su instante UTC. Se mantienen los patrones ISO UTC explícitos de pagos y transferencias.
- Los límites de longitud de cadenas usan `value.length` para conservar unidades UTF-16. Zod 4.6 mide sus límites nativos en puntos de código Unicode; sustituirlos directamente cambiaría la aceptación de algunos caracteres.
- Los números usan comprobaciones Zod personalizadas para conservar la aceptación numérica previa y sus límites, sin introducir nuevas restricciones de rango seguro mediante `int()`. La validación de liquidación sigue preservando cadenas decimales y reutilizando `getLiquidacionInputError`.
- Las contraseñas se comparan mediante refinamientos de objeto. Los accionistas usan una unión discriminada por `PN`/`PJ`, con recursión y eliminación de campos del otro tipo antes de validarlos.
- Las utilidades de archivos se trasladan a `src/utils/validacionesZod.ts`. No tenían consumidores dentro del repositorio; admiten un nombre de campo opcional para sus mensajes.
- No se modifican permisos, servicios, DAOs, fórmulas financieras ni contratos de respuesta.

## Validación y límites

Comprobaciones realizadas con Node portable 24.21.0, verificando versión y ruta del ejecutable:

- Línea base: `npm.cmd run typecheck`, aprobada antes de modificar los esquemas.
- `npm.cmd run typecheck:all`: compilación de tipos del backend y las suites rápidas y de MariaDB; no ejecuta pruebas.
- `npm.cmd run build`: aprobada; genera el cliente Prisma, comprueba tipos y compila mediante tsdown. Se corrigieron los errores de tipos encontrados durante la migración.

Por instrucción del usuario, no se ejecutan pruebas unitarias, HTTP, integración, runtime ni E2E. Tampoco se accede a bases de datos ni se ejecuta `build-prod`. La compilación no demuestra equivalencia funcional de validaciones, persistencia o envío de correos. Una futura validación funcional debe comprobar las mismas expectativas existentes, especialmente conversiones, campos opcionales/nulos, accionistas y contraseñas, sin debilitarlas.

Referencia de implementación: [API de esquemas Zod](https://zod.dev/api).
