# Deuda técnica: autorización y ciclo de vida de archivos

Fecha: 2026-10-08. Estado: **documentada, pendiente de definición funcional**.
Por solicitud del usuario no se implementan correcciones. No hay cambio de
permisos, borrado físico, restricciones de descarga ni bloqueo de vínculos
autorizado o programado. Las pruebas caracterizan el comportamiento vigente;
no lo convierten en una política de negocio aprobada.

## Evidencia y alcance

La suite `tests/mariadb/invoiceHttp.test.ts` contiene 14 casos de eliminación
real por HTTP, JWT, servicio, DAO, Prisma, MariaDB y filesystem. Son parte de
83 casos HTTP y 228 de integración. Ejecución registrada en
`coverage/mariadb/last-run.json`: `5ffb60e53f4c0f1d44ccb063`, `passed`,
limpieza `removed`. Son datos sintéticos en MariaDB 11.4.10 desechable.

DELETE `/api/v1/usuario/archivo/eliminar/:id` exige sesión válida y rol 5;
responde 204 y actualiza `estado = 2`, modificador y fecha. No borra la fila
ni el contenido. El body no sustituye al actor de sesión. La repetición
responde 204. Un fallo SQL conserva la fila activa y el contenido previo.

Fuentes: `src/routes/usuario/archivo.routes.ts`,
`src/controllers/usuario/archivo.Controller.ts`,
`src/services/usuario/archivo.Service.ts` y `src/daos/archivo.Dao.ts`.
La consulta por UUID usada para descargar y eliminar no filtra el estado.

## Decisiones pendientes

Se conservan los identificadores DT-HTTP-03/04/05 ya documentados, sin crear
hallazgos duplicados.

| Deuda | Comportamiento actual | Decisión necesaria | Impacto potencial |
| --- | --- | --- | --- |
| DT-HTTP-03 — Descarga y conservación tras eliminación | Baja lógica, bytes conservados y descarga disponible para rol 5 | Definir si la baja debe retirar la descarga, qué actores pueden seguir accediendo y qué conservación documental se requiere | La baja no retira el acceso al contenido ni libera espacio; cambiarlo puede afectar consultas o documentos históricos |
| DT-HTTP-04 — Pertenencia | Otro usuario con rol 5 puede eliminar por UUID un archivo ajeno; se registra como modificador | Definir acceso por creador, empresa, servicio o función administrativa, y sus excepciones | Modificación por un actor distinto al creador; restringir solo por creador podría impedir flujos compartidos válidos |
| DT-HTTP-05 — Archivos vinculados | XML/PDF asociados a factura admiten baja lógica; factura, vínculos y contenido permanecen | Definir cuándo bloquear la baja, qué relaciones proteger y si existe reemplazo documental autorizado | Estado del archivo y uso por la factura pueden divergir; borrar físicamente podría romper documentos vinculados |

> **Advertencia:** conocer un UUID no sustituye una comprobación de autorización.
> Los casos observados requieren JWT válido y rol 5; no demuestran acceso anónimo,
> un incidente en producción ni qué usuarios disponen de ese rol.

Antes de una corrección se necesita una matriz aprobada de actores, pertenencia,
estado del archivo y vínculos. Después deben añadirse regresiones de permisos,
lectura y descarga, conservación de documentos vinculados y errores SQL/disco.
No se fija aquí un plazo de retención, política legal, migración histórica,
borrado masivo ni respuesta HTTP nueva. Cualquier cambio requiere autorización
posterior sobre un contrato concreto.

DT-HTTP-01/02, relativos a temporales/copias sin registro, conservan su estado
de límites conocidos sin corrección programada. Son problemas distintos.

## Repetir la evidencia

```powershell
npm run test:integration -- tests/mariadb/invoiceHttp.test.ts -t "Eliminación de archivos por HTTP"
```

Ver [pruebas, resultados y límites HTTP](20261008_integracion_HTTP_Multer_facturas.md).
