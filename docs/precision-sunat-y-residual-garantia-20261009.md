# Precisión SUNAT y garantía por diferencia

**Cierre vigente del 09/10/2026:** validación conjunta aprobada (322 Vitest, 517 Jest, 82 MariaDB y 226 frontend; tipos, lint y formato aprobados). DT-LIQ-02-RANGO/04/06 quedan cerradas en su alcance implementado; DT-LIQ-07/08 conservan las reglas actuales por decisión expresa y DT-LIQ-09 permanece diferida. Las menciones posteriores a aprobaciones, migración o validación pendientes describen etapas anteriores; para desarrollo, el esquema ampliado también fue verificado. [Informe final y límites](validacion-conjunta-liquidacion-cierre-20261009.md).

**Actualización posterior:** el usuario aprobó ampliar cantidades y unitarios hasta diez decimales. Ya se prepararon código, esquema y SQL; falta aplicar el cambio de almacenamiento y validar al cierre conjunto. [Estado vigente](ampliacion-precision-liquidacion-20261009.md). La decisión pendiente al final de esta revisión refleja el momento anterior a la aprobación.

Fecha: 09/10/2026. No se ejecutaron pruebas, tipos, lint, formato, builds, migraciones ni consultas a bases compartidas. Las pruebas nuevas están preparadas para el cierre conjunto.

## DT-LIQ-04 implementada

Autorización expresa del usuario: garantía = neto − financiamiento. V2/V3 ahora calculan el financiamiento redondeado a dos decimales y obtienen la garantía por diferencia, también a dos decimales. Así se conserva el neto monetario de dos decimales: 100,01 al 50 % produce 50,01 financiados + 50,00 de garantía. Antes, redondear ambas mitades de 50,005 producía 100,02.

Se mantiene el redondeo Decimal vigente. El financiamiento que sirve de base a intereses no cambia por esta corrección; tampoco se cambian tasas, comisiones, contratos HTTP ni permisos. V4 delega en V3. Las propuestas/simulaciones nuevas usan el cálculo nuevo; las liquidaciones mantienen la garantía aceptada y no ajustan importes históricos. Regenerar una propuesta no aceptada usa el nuevo cálculo. No se amplió ni normalizó el rango/precisión del neto de entrada; la igualdad de capital aquí descrita tiene como precondición un neto monetario de dos decimales.

Pruebas preparadas: `tests/vitest/unit/factoring.Calculator.test.ts` (V2/V3, netos impares, 0/50/80/100 %), `tests/vitest/unit/factoringliquidacion.business.test.ts` (garantía histórica 50,01 conservada al simular/crear) y `tests/mariadb/proposal.test.ts` (guardado y lectura del capital conservado). Se retiró el `todo` de decisión de negocio; no significa que las pruebas hayan aprobado ni que la deuda esté cerrada.

## Qué encontró la consulta SUNAT

La [guía oficial de factura electrónica UBL 2.1](https://cpe.sunat.gob.pe/sites/default/files/inline-files/guia%2Bxml%2Bfactura%2Bversion%202-1%2B1%2B0%20%282%29_0%20%282%29.pdf), tablas de páginas 13–17, distingue cantidad y valor/precio unitario con hasta diez decimales, frente a importes por ítem, impuestos y totales con dos. Son formatos de comprobantes: no obligan a ingresar diez decimales ni fijan por sí mismos la fórmula del interés de factoring.

La [RS 025-2000/SUNAT](https://www.sunat.gob.pe/legislacion/superin/2000/025.htm) trata obligaciones tributarias: artículos 2–3 distinguen deuda expresada en enteros, porcentajes a dos decimales, factores de actualización a tres, coeficientes a cuatro y TIM diaria a cinco. Su disposición final excluye del artículo 2 el registro de operaciones en libros contables. No aplicar esas reglas de deuda tributaria a una liquidación comercial ni sustituir la tasa diaria compuesta contractual por TIM tributaria.

El [portal oficial de guías](https://cpe.sunat.gob.pe/guias-y-manuales) publica reglas CPE actualizadas al 26/08/2026. La guía XML consultada es versión 1.0 de mayo de 2017, aún enlazada por el portal. No fue posible inspeccionar el archivo de reglas 2026: el acceso de herramienta falló y el acceso directo recibió bloqueo del sitio. Por tanto, esta consulta no certifica una implementación CPE completa conforme a todas las validaciones actuales. No se eludió el bloqueo ni se aplicaron formatos de libros de inventario o aduanas a esta pantalla.

## Problema concreto de la decisión sobre DT-LIQ-02-RANGO

Ejemplo aritmético: cantidad 3 y unitario 3,3333333333. El producto es 9,9999999999, que se redondea a 10,00. Reducir primero el unitario a 3,33 produce 9,99. Ambos números finales tienen dos decimales, pero el momento del redondeo cambia el resultado.

La implementación actual rechaza unitarios/cantidades con más de dos decimales; no los redondea silenciosamente. El esquema también guarda esos factores con dos. Si se permitiesen diez en el cálculo sin ampliar la persistencia, el factor guardado podría dejar de explicar el importe: riesgo por lectura de esquema, no reproducido en base real en esta revisión.

| Alternativa | Qué implica |
|---|---|
| Mantener dos en los conceptos de liquidación | Seguir ingresando cargos y abonos monetarios ya definidos, con precisión de centavos. No cambiar esquema. No significa que SUNAT prohíba valores unitarios con mayor precisión. |
| Adoptar hasta diez como política interna inspirada en CPE | Admitir fracciones más precisas, conservarlas exactamente en API y almacenamiento, multiplicar con Decimal y redondear importes monetarios/IGV a dos. Preparar ampliación de columnas y compatibilidad del cliente Prisma/contrato de transporte; desplegar esquema antes de habilitar entradas nuevas. |

La segunda alternativa no debe limitarse a cambiar el atributo `step` del formulario: requiere extremo a extremo, pruebas de persistencia y evaluación de transporte como string decimal para evitar pérdida al convertir JSON a Number. Los importes derivados siguen sujetos a capacidad técnica y los máximos de formato CPE no se convierten en límites legales de esta liquidación.

## Decisión pendiente

El usuario pidió mayor detalle antes de decidir. No se modificó DT-LIQ-02-RANGO para permitir diez decimales ni se cambió esquema/cliente generado. La necesidad comercial que decide entre alternativas es si se ingresan valores unitarios/fracciones precisos (prorrateos, tarifas por unidad) o cargos/abonos monetarios ya expresados en centavos. Las tasas y fórmulas de intereses mantienen su precisión actual; DT-LIQ-07 y DT-LIQ-09 continúan como revisiones separadas. DT-LIQ-04 queda implementada pero pendiente de validación conjunta.
