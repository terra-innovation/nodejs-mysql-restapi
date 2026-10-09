# DT-LIQ-02-RANGO — Límites de precisión y rango de conceptos adicionales

**Cierre vigente del 09/10/2026:** validación conjunta aprobada (322 Vitest, 517 Jest, 82 MariaDB y 226 frontend; tipos, lint y formato aprobados). DT-LIQ-02-RANGO/04/06 quedan cerradas en su alcance implementado; DT-LIQ-07/08 conservan las reglas actuales por decisión expresa y DT-LIQ-09 permanece diferida. Las menciones posteriores a aprobaciones, migración o validación pendientes describen etapas anteriores; para desarrollo, el esquema ampliado también fue verificado. [Informe final y límites](../validacion-conjunta-liquidacion-cierre-20261009.md).

**Estado vigente tras la última autorización:** el usuario aprobó hasta diez decimales en cantidad y unitario, con importe/IGV a dos. Código y protección contra base antigua preparados. El usuario informó haber aplicado el ALTER: el 09/10/2026 se confirmó `Decimal(18,10)` en Prisma y en ambas columnas reales de desarrollo, con `NOT NULL` y predeterminado cero de diez decimales, mediante consulta de metadatos de solo lectura. **La validación funcional conjunta sigue pendiente.** [Implementación y orden de puesta en servicio](../ampliacion-precision-liquidacion-20261009.md). Las menciones siguientes a dos decimales de entrada y decisión pendiente conservan la trazabilidad de la fase anterior y quedan sustituidas por esta autorización.

Fecha: 09/10/2026. Estado: precisión/capacidad técnica autorizadas e implementadas, pendientes de validación conjunta. Origen: alcance residual de DT-LIQ-02, separado del rechazo de negativos autorizado e implementado. Las referencias a decisiones pendientes que siguen describen la revisión anterior.

## Implementación autorizada

**Consulta posterior SUNAT:** el usuario pidió fundamentar la precisión y, ante la alternativa de ampliar a diez decimales, solicitó explicación antes de decidir. Se mantiene la implementación técnica de dos decimales ya autorizada; **no se aprobó ni preparó una migración a diez**. La guía de factura UBL 2.1 distingue cantidades/unitarios (hasta diez) de importes/impuestos (dos); no constituye una regla única para intereses de esta liquidación interna. [Problema, alternativas, fuentes y límites](../precision-sunat-y-residual-garantia-20261009.md).

El usuario aprobó máximo dos decimales de entrada y control de capacidad de guardado de entradas/resultados. Controlador y servicio comparten la regla de entradas: signo, finitud, máximo dos decimales significativos y capacidad técnica de `Decimal(10,2)`. El servicio controla además cada detalle, proporción `Decimal(10,5)`, orden `SmallInt` y los importes de cabecera antes de escribir. Ambos formularios muestran errores y bloquean calcular/crear con entradas inválidas; cambiar cantidad/importe invalida el resultado anterior. Ceros, valores predeterminados, contratos y redondeos del cálculo se conservan.

El régimen confirmado es factoring fuera del ámbito de la Ley General. No se identificó en las fuentes consultadas un máximo universal legal para cantidad o monto unitario de liquidación. **99.999.999,99 es exclusivamente capacidad técnica del esquema**, no una norma peruana ni un máximo comercial. Los topes de tasas BCRP se registran por separado en DT-LIQ-09; no se cambiaron tasas ni contratos aceptados. [Implementación, fuentes y validación diferida](../implementacion-gasto-limites-liquidacion-20261009.md).

No se ejecutaron pruebas, tipos, lint, formato ni build en esta implementación. No se declara cerrada.

## Antecedentes

Simulación y creación rechazan cantidades e importes negativos. Se conserva el comportamiento anterior del cero y los valores predeterminados; `factor` mantiene la dirección del movimiento. Este cambio no define máximos nuevos ni una política nueva de decimales.

Pendiente: acordar cantidad máxima, importe máximo, precisión admitida y si los valores fuera de precisión se rechazan o se normalizan. Evaluar el contrato actual y sus campos de persistencia antes de fijar límites. No se presume que las restricciones de base de datos sean la regla de negocio aprobada.

Revisión estática del 09/10/2026: cantidad, monto unitario, monto, IGV y total del detalle, y los importes de cabecera, usan `Decimal(10,2)` en el esquema vigente; `porcentaje_monto` usa `Decimal(10,5)`. Controladores de simular/crear limitan el signo, sin máximos ni precisión de entrada. El servicio redondea el producto a dos decimales, pero conserva cantidad e importe unitario para guardar. Por ello, los factores originales con más de dos decimales pueden no conservarse exactamente en la persistencia. Es un riesgo identificado por lectura de código, sin nueva reproducción en base real.

La propuesta de límites técnicos, producto/IGV/acumulados y tratamiento de decimales se detalla en [revisión de pendientes](../revision-pendientes-liquidacion-20261009.md). Permanece pendiente de aprobación; no se ejecutaron validaciones ni se modificó la implementación.

Aceptación: reglas aprobadas documentadas, validación uniforme en API/formulario, pruebas de frontera y ausencia de escrituras al rechazar entradas. Mantener importes históricos, permisos, factor y fórmulas. No introducir reversos mediante números negativos.

Este pendiente no invalida la corrección del signo ni declara que todos los límites posibles estén actualmente protegidos. Referencia: [DT-LIQ-02](20261006_1451_DT_validaciones_financieras_factoring.md).
