# Cantidad y valor unitario hasta diez decimales en liquidación

**Cierre vigente del 09/10/2026:** validación conjunta aprobada (322 Vitest, 517 Jest, 82 MariaDB y 226 frontend; tipos, lint y formato aprobados). DT-LIQ-02-RANGO/04/06 quedan cerradas en su alcance implementado; DT-LIQ-07/08 conservan las reglas actuales por decisión expresa y DT-LIQ-09 permanece diferida. Las menciones posteriores a aprobaciones, migración o validación pendientes describen etapas anteriores; para desarrollo, el esquema ampliado también fue verificado. [Informe final y límites](validacion-conjunta-liquidacion-cierre-20261009.md).

Fecha: 09/10/2026. Autorización expresa del usuario: adoptar hasta diez decimales en cantidades y unitarios; mantener importes finales e IGV a dos. Estado: fuentes preparadas; el usuario informó haber aplicado el ALTER y actualizado Prisma. Se verificó el esquema fuente y, mediante consulta de metadatos de solo lectura, la base configurada en `.env.development`: ambos campos son `decimal(18,10)`, `NOT NULL`, con valor predeterminado `0.0000000000`; `monto`, `igv` y `total` siguen en `decimal(10,2)`. La verificación no consultó registros de clientes ni modificó la base, y no acredita otros entornos. La validación conjunta permanece pendiente: no se ejecutaron pruebas, tipos, lint, formato, builds ni generación Prisma en esta verificación.

## Comportamiento

- Los formularios de administrador y financiero conservan los valores como texto decimal y admiten hasta diez decimales significativos, sin contar ceros finales. El helper también admite notación exponencial válida, rechaza negativos/no finitos y controla ocho enteros. Se usa `step: any` para evitar que el control nativo de Number decida la precisión; el helper es quien limita a diez. Calcular/crear siguen bloqueados con entradas inválidas y editar factores exige recalcular.
- El controlador acepta números existentes y strings decimales, sin convertir los strings a Number. El DTO expresa ambos tipos. El frontend ya enviaba strings: no cambia el nombre ni la estructura del payload. Para conservar exactamente ocho enteros y diez decimales, los clientes deben enviar strings; no puede recuperarse precisión que un cliente haya perdido antes de serializar un número JSON.
- El servicio usa Decimal para conservar los factores. La multiplicación emplea un constructor Decimal local con precisión 40: dos entradas de hasta 18 dígitos requieren hasta 36 para multiplicarse antes de redondear. Se redondea el importe por movimiento a dos decimales; se conserva la secuencia existente de cálculo de IGV y totales. No se modifica la precisión global de Decimal ni las tasas, intereses o fórmulas de factoring.
- Esquema fuente: únicamente `cantidad` y `monto_unitario` de `factoring_liquidacion_financiero` pasan a `Decimal(18,10)`. Ocho enteros mantienen la capacidad anterior; diez decimales agregan precisión. Los campos `monto`, `igv`, `total` y cabecera permanecen `Decimal(10,2)`, y porcentaje del detalle `Decimal(10,5)`. Producto, impuesto, total, proporción, orden y acumulados mantienen sus controles de capacidad antes de escribir.
- Máximo técnico de cada factor: 99.999.999,9999999999. Máximo técnico de cada importe monetario: 99.999.999,99. No son máximos legales SUNAT ni comerciales. No se amplían todas las tablas de Factoring, los comprobantes ni la precisión de tasas.

Ejemplo aprobado: cantidad `3`, unitario `3.3333333333`, monto `10.00`; si el concepto está afecto y la configuración IGV es 18 %, IGV `1.80`, total `11.80`. Los factores se conservan; no se reduce primero el unitario a 3.33.

## Cambio de base preparado y puesta en servicio

Archivo: [20261009_liquidacion_precision_10.sql](../scripts/migrations/20261009_liquidacion_precision_10.sql). Contiene un único ALTER de los dos campos, sin actualizar importes, nombres de base, credenciales ni filas de clientes. El agente no lo ejecutó; el usuario informó su aplicación y se confirmó la estructura resultante en desarrollo el 09/10/2026. Para otros entornos, ALTER TABLE puede requerir bloqueo/reconstrucción según tamaño y versión; planificar respaldo y ventana con el responsable de la base objetivo antes de su aplicación. No efectuar un rollback que reduzca columnas después de guardar diez decimales.

Orden requerido:

1. En el cierre conjunto, probar primero el SQL y los recorridos en MariaDB desechable. El snapshot base de integración no se regeneró: `settlement.test.ts` aplica el archivo de ampliación únicamente después de que `businessSupport` haya comprobado la identidad de la base aislada.
2. Aplicar el SQL a la base de Factoring expresamente seleccionada para el despliegue, mediante el procedimiento del entorno. Este documento no supone autorización para ejecutarlo en una base concreta.
3. Generar el cliente desde el esquema actualizado como parte del procedimiento habitual de construcción/despliegue; no se editaron fuentes generadas ni se ejecutó `prisma-sync`. Los campos continúan siendo Decimal; actualizar artefactos de despliegue de forma consistente.
4. Publicar los cambios de aplicación y frontend tras la validación acordada. El código protege cualquier ejecución anticipada con entradas de precisión ampliada.

Protección de transición: si una entrada adicional requiere más de dos decimales, el servicio consulta `information_schema.COLUMNS` de la base de su propia transacción. Exige ambos campos decimales, escala al menos diez y al menos ocho enteros; sin ello devuelve 400 con mensaje de actualización de almacenamiento, antes del cálculo y cualquier escritura. Simular y crear usan la misma protección. No hay caché de esta comprobación que pueda quedar desactualizada durante un despliegue. Entradas de hasta dos decimales conservan el flujo sin esta consulta. Un fallo de consulta es un fallo de operación, nunca permiso para escribir truncando.

## Validación diferida

Se prepararon o actualizaron pruebas de helper, servicio y HTTP para precisión diez/once, ceros finales, finitud, transporte exacto en strings, producto/IGV, acumulados y protección con esquema antiguo. Las expectativas de entrada dos/once decimales cambian por la regla nueva autorizada, no por un resultado de pruebas. No se alteran expectativas monetarias para ocultar fallos.

MariaDB: `tests/mariadb/settlement.test.ts` aplica el SQL en el contenedor aislado, comprueba guardado/lectura exacta y simula las columnas antiguas para confirmar rechazo sin registros; luego restablece la ampliación. Estas pruebas no se ejecutaron; la consulta de metadatos de desarrollo descrita arriba no demuestra guardado ni cálculo correctos. No se regeneró snapshot. Selección futura: `liquidacionLimits.test.ts`, `factoringliquidacion.business.test.ts`, `factoring.business.test.ts`, tipos de backend/Vitest/integración y el runner existente para `settlement.test.ts`; incluir las regresiones DT-LIQ-04 y propuestas en el cierre global.

Frontend: utilidad y formulario de ambos roles prueban diez/once decimales y transporte exacto. Comando manual para el cierre en `docs/pruebas/FACTORING_PROPUESTA_LIQUIDACION.md` del frontend. Sin navegador/E2E ejecutados.

## Alcance normativo

La precisión adoptada es una política interna autorizada inspirada en la guía SUNAT de factura UBL 2.1, no una afirmación de que toda liquidación deba utilizar ese formato. Fuentes y límites de la consulta están en [revisión SUNAT](precision-sunat-y-residual-garantia-20261009.md). No se certifica cumplimiento integral CPE, no se convierte TIM tributaria en tasa contractual y no se implementan aquí topes de interés BCRP. DT-LIQ-07 quedó cerrada por decisión de mantener la precisión actual y DT-LIQ-08 por mantener el ajuste desde el desembolso efectivo registrado como inicio de operación; DT-LIQ-09 se mantiene sin cambios por decisión expresa, con el control normativo diferido. Las implementaciones siguen abiertas hasta la validación conjunta.
