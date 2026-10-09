# Revisión de DT-LIQ-04, DT-LIQ-06 y DT-LIQ-02-RANGO

**Cierre vigente del 09/10/2026:** validación conjunta aprobada (322 Vitest, 517 Jest, 82 MariaDB y 226 frontend; tipos, lint y formato aprobados). DT-LIQ-02-RANGO/04/06 quedan cerradas en su alcance implementado; DT-LIQ-07/08 conservan las reglas actuales por decisión expresa y DT-LIQ-09 permanece diferida. Las menciones posteriores a aprobaciones, migración o validación pendientes describen etapas anteriores; para desarrollo, el esquema ampliado también fue verificado. [Informe final y límites](validacion-conjunta-liquidacion-cierre-20261009.md).

**Actualización posterior:** el usuario autorizó DT-LIQ-06 y los dos decimales/capacidad técnica de DT-LIQ-02-RANGO; ya están implementados, sin validaciones ejecutadas. Confirmó el régimen de factoring fuera del ámbito de la Ley General y pidió búsqueda normativa. [Estado vigente, fuentes y pruebas preparadas](implementacion-gasto-limites-liquidacion-20261009.md). DT-LIQ-04 sigue pendiente de aprobación; las menciones siguientes reflejan la revisión previa.

Fecha: 09/10/2026. Alcance autorizado: revisar estas tres deudas y diferir validaciones hasta terminar la revisión de las deudas relacionadas con liquidación. Este documento registra lectura estática y propuestas; no prueba resultados actuales ni aprueba reglas de negocio. No se ejecutaron pruebas, comprobaciones de tipos, builds ni validaciones automáticas. No se modificaron fórmulas ni se consultaron bases compartidas.

## DT-LIQ-04: un centavo extra en capital

En `src/domain/factoring/factoring.Calculator.ts`, V2 y V3 calculan y redondean financiamiento y garantía por separado. El flujo actual V4 de `src/services/admin/factoringCalculation.Service.ts` delega en V3; lo usan propuestas, simulaciones y el recálculo de intereses de liquidación. La liquidación toma la garantía de la propuesta aceptada.

Ejemplo documental: neto 100,01 y financiamiento 50 % producen 50,01 financiados y 50,01 de garantía: suman 100,02.

Propuesta: mantener el financiamiento como `redondear(neto × porcentaje, 2)` y obtener garantía como `neto monetario − financiamiento`, a dos decimales. El ejemplo quedaría en 50,01 + 50,00 = 100,01. Se prioriza el importe que sirve de base a intereses y adelanto; el residual corresponde a garantía. No cambiar el modo de redondeo existente.

Pendiente de aprobación: dar prioridad al financiamiento y aplicar el residual a garantía en cálculos nuevos. Las propuestas aceptadas y liquidaciones guardadas conservan importes; no corregirlas durante una liquidación. Regenerar una propuesta no aceptada produciría los nuevos importes y requeriría la revisión habitual antes de aceptarla. Si el neto de entrada contiene más de dos decimales, se debe acordar su normalización/rechazo para que la conservación opere sobre un neto monetario definido. No ampliar silenciosamente el alcance a los rangos de porcentaje divergentes entre simular y crear propuesta.

Validación futura: conservación exacta de capital en V2/V3, centavos impares y porcentajes autorizados, ausencia de garantía negativa, coherencia de simulación/creación y conservación de importes aceptados. Si el recálculo de liquidación utiliza porcentajes reconstruidos desde importes aceptados, comprobar su compatibilidad sin introducir cambios históricos.

## DT-LIQ-06: gasto interbancario decidido sobre un saldo incompleto

`runSimulation` en `src/services/admin/factoringliquidacion.Service.ts` calcula garantía menos mora menos tarifa antes de añadir conceptos adicionales. Esa condición omite reintegros, el efecto de cargos/abonos adicionales y el IGV de los movimientos que lo tengan. La agregación posterior sí usa los totales y el factor de cada concepto.

Propuesta pendiente de aprobación:

- Construir garantía, reintegro o mora y conceptos adicionales, con el IGV aprobado por concepto.
- Calcular el saldo previo al gasto sumando sus totales con la dirección que determina `factor`.
- Para banco distinto del propio y sin exoneración, calcular el gasto con su concepto/configuración vigente. Aplicarlo una sola vez si el saldo previo supera el total del gasto y por tanto queda un reembolso positivo.
- Si el saldo previo es cero, negativo, igual o inferior al gasto, no añadirlo. Banco propio y exoneración mantienen ausencia de cargo automático.

Con reintegro 50,31 y gasto total 7,50, el reembolso propuesto sería 42,81. Con saldo 7,50 o 5,00 y gasto 7,50, se propone conservar 7,50 o 5,00 sin cargo automático. Esto exige confirmar la política comercial: si el banco cobra por cualquier transferencia, incluso esos saldos pequeños, habrá que elegir otra regla explícita.

Debe prevenirse la duplicación si los adicionales incluyen el concepto del gasto automático. La opción recomendada es rechazar esa combinación con un mensaje claro y usar el cargo automático/exoneración, pero requiere aprobación porque restringe una selección que hoy no tiene esa prohibición. No deduplicar silenciosamente ni eliminar movimientos ingresados por el usuario.

La corrección decidiría el gasto al calcular la liquidación; no demuestra que la transferencia bancaria se haya realizado ni debe cambiar el flujo de registro de transferencias. Mantener la tarifa configurada para PEN/USD, sin fijar nuevos importes.

Validación futura: ambos bancos/monedas, exoneración, garantía cero con reintegro, mora con IGV, cargos/abonos que cambien el saldo, fronteras del gasto y duplicación, simulación/creación y guardado real.

## DT-LIQ-02-RANGO: entradas y resultados que puedan guardarse sin cambios

El esquema vigente define cantidad, monto unitario, monto, IGV, total y acumulados de liquidación como `Decimal(10,2)`; porcentaje del detalle como `Decimal(10,5)`. El máximo positivo representable de los primeros es 99.999.999,99. Es capacidad técnica del esquema, no un límite comercial aprobado. No se consultó el catálogo ni la base operativa.

Controladores Yup de simulación/creación aceptan números no negativos sin máximos ni precisión explícita. El servicio usa Decimal y redondea producto/IGV, pero guarda los factores originales. Ejemplo aritmético: cantidad 0,004 e importe unitario 1.000,00 generan monto 4,00, aunque la cantidad no cabe exactamente en una columna con dos decimales. La revisión no reproduce ni afirma cómo respondería el servidor MariaDB a esa entrada.

Propuesta pendiente de aprobación:

- Admitir cantidades fraccionarias, preservando el contrato actual, pero con un máximo de dos decimales significativos en cantidad e importe unitario. Rechazar exceso de precisión con explicación, sin redondear entradas silenciosamente. Ceros finales no cuentan como exceso.
- Rechazar valores no finitos y valores individuales fuera de la capacidad técnica de sus campos; conservar ceros y valores predeterminados ya autorizados. No introducir un tope comercial menor sin definición de negocio.
- Comprobar con Decimal que monto, IGV, total, porcentaje relativo y todos los acumulados/saldos puedan persistirse en sus respectivos campos. Limitar solo los factores no evita que el producto o la suma desborden. Considerar el valor absoluto en acumulados con signo.
- Usar la misma regla en simular/crear y dar mensajes en los formularios de ambos roles. Rechazar antes de escribir cabecera/detalles, sin cambiar factor, fórmulas ni valores históricos. No cambiar números JSON a strings sin evaluar el contrato.

Ejemplo: cantidad 2 e importe unitario 60.000.000,00 caben individualmente, pero su producto 120.000.000,00 excede `Decimal(10,2)`. Un monto que sí cabe puede superar el máximo después del IGV; varios cargos/abonos pueden hacerlo al acumularse. El control debe abarcar el resultado completo.

Validación futura: dos/más decimales, representación equivalente con ceros finales, valores no finitos, fronteras de cada campo, producto, impuesto y acumulados, compatibilidad de entradas API/formulario, rechazo sin escrituras y persistencia exacta de entradas admitidas.

## Estado del recorrido

Estas tres deudas están revisadas, pendientes de aprobación de reglas e implementación. Ninguna se declara cerrada. DT-LIQ-07 quedó cerrada el 09/10/2026 por decisión expresa de mantener la precisión actual. DT-LIQ-08 quedó cerrada por decisión expresa de conservar el ajuste desde el desembolso efectivo representado por fecha_operacion y las reglas actuales de reintegro/cargo; ambas decisiones están documentadas en el registro original de deudas. Las validaciones conjuntas quedan diferidas por instrucción del usuario.
