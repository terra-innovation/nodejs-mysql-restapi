# Gasto interbancario y precisión de entradas de liquidación

**Cierre vigente del 09/10/2026:** validación conjunta aprobada (322 Vitest, 517 Jest, 82 MariaDB y 226 frontend; tipos, lint y formato aprobados). DT-LIQ-02-RANGO/04/06 quedan cerradas en su alcance implementado; DT-LIQ-07/08 conservan las reglas actuales por decisión expresa y DT-LIQ-09 permanece diferida. Las menciones posteriores a aprobaciones, migración o validación pendientes describen etapas anteriores; para desarrollo, el esquema ampliado también fue verificado. [Informe final y límites](validacion-conjunta-liquidacion-cierre-20261009.md).

**Actualización de precisión:** la autorización posterior amplía cantidad/unitario de dos a diez decimales. Importes/IGV y el cambio de gasto conservan lo descrito. [Estado vigente, SQL y puesta en servicio](ampliacion-precision-liquidacion-20261009.md). Las referencias siguientes a entrada de dos decimales corresponden a la primera implementación.

Fecha: 09/10/2026. Regla aprobada por el usuario para DT-LIQ-06 y DT-LIQ-02-RANGO. Implementado, pendiente de validación al terminar la revisión de deudas de liquidación. No se ejecutaron pruebas, tipos, lint, comprobación de formato, build ni validaciones automáticas; tampoco se consultaron bases compartidas.

## Comportamiento implementado

DT-LIQ-06: construir primero garantía, reintegro/mora y adicionales. El saldo previo incluye sus totales e IGV, con dirección por concepto. Añadir gasto automático una sola vez, en otro banco y sin exoneración, cuando su total sea un cargo positivo y el saldo previo sea estrictamente superior. Con saldo igual o inferior no se añade. Se usa la tarifa PEN/USD configurada y su afectación IGV por concepto. El gasto automático se ordena después de los adicionales sin duplicar su orden. Se conserva el concepto ID 3 que ya utilizaba esta liquidación; no se remapean catálogos.

Un gasto explícito evita añadir otro automático; más de una fila con ese concepto se rechaza con mensaje. Se preservan los importes del movimiento explícito, incluso con banco propio/exoneración: estos controles gobiernan la incorporación automática. No se impone silenciosamente la tarifa configurada a un importe manual. No se cambia el registro de transferencias ni se afirma que la transferencia se haya realizado.

DT-LIQ-02-RANGO: máximo dos decimales significativos en cantidad e importe unitario, con ceros finales admitidos; rechazo de negativos, no finitos y valores fuera de capacidad técnica. El helper `src/domain/factoring/liquidacionLimits.ts` se comparte entre controlador y servicio. El controlador considera el valor original para no ocultar exceso de precisión de un string al convertirlo a Number. El servicio comprueba cantidad, unitario, monto, IGV, total, proporción, orden y acumulados/saldos antes de guardar. Detalles e importes de cabecera usan `Decimal(10,2)`; proporción `Decimal(10,5)`; orden `SmallInt`. No se migra esquema ni se modifica el contrato HTTP.

Los formularios de nueva liquidación de administrador y financiero comparten `src/utils/liquidacionInput.js`: mensajes de entrada, bloqueo de cálculo/guardado, paso 0.01 y admisión de cero. Cambiar cantidad o unitario elimina el resultado previo, también al corregirlo; es necesario recalcular. Los resultados derivados se controlan en el servidor con Decimal, sin replicar las fórmulas financieras en el navegador.

## Normativa: régimen confirmado por el usuario

Empresa de factoring fuera del ámbito de la Ley General. Fuentes oficiales consultadas el 09/10/2026:

- [Ley 30308, artículo 2](https://www.leyes.congreso.gob.pe/Documentos/Leyes/Textos/30308.pdf): crea el registro para empresas fuera de la Ley 26702.
- [Reglamento SBS 4358-2015](https://www.sbs.gob.pe/Portals/0/jer/Auto_Nuevas_Empresas/Sistema_Financiero/13.%20Reg.%20de%20Factoring_Res.%20SBS%20N%C2%B0%204358-2015.pdf): capítulo VI regula ese registro. El artículo 13 trata condiciones para entrar al ámbito de la Ley General; el artículo 24 está dentro del capítulo aplicable a empresas comprendidas. Estos umbrales no son un máximo por campo de liquidación.
- [Circular BCRP 0008-2021](https://www.bcrp.gob.pe/docs/Transparencia/Normas-Legales/Circulares/2021/circular-0008-2021-bcrp.pdf): topes de interés para operaciones entre personas ajenas al sistema financiero. [Consulta oficial de tasas](https://tasamaxima.bcrp.gob.pe/tasa-max-interes/web/public/index.php?accion=consultaPASF). No se extrajo ni fijó un porcentaje vigente como constante.
- [Reporte BCRP de marzo de 2026, nota 40](https://www.bcrp.gob.pe/docs/Publicaciones/reporte-del-sistema-nacional-de-pagos/2026/marzo/rspf-marzo-2026.pdf): señala sujeción del factoring a topes de interés compensatorio y moratorio.

**Conclusión acotada:** las fuentes revisadas no proporcionan un máximo universal para cantidad, monto unitario o saldo de esta pantalla. No se implementó un máximo monetario presentado como legal. El valor 99.999.999,99 protege el esquema actual; no acredita cumplimiento normativo. Tampoco los dos decimales se presentan como obligación legal: son la política aprobada y compatible con la persistencia. Los topes de tasas requieren un control distinto por fecha/moneda y naturaleza contractual, pendiente en DT-LIQ-09. No se aplicaron límites de entidades supervisadas ni de programas específicos a esta empresa sin justificar su alcance.

## Pruebas preparadas para el cierre, no ejecutadas

- `tests/vitest/unit/liquidacionLimits.test.ts`: precisión, ceros finales, notación exponencial, finitud y capacidades distintas de importe/proporción.
- `tests/vitest/unit/factoringliquidacion.business.test.ts`: simular/crear, banco/moneda/exoneración, reintegro sin garantía, fronteras de tarifa, IGV y adicionales, gasto explícito/repetido, producto/IGV/acumulados fuera de capacidad sin escrituras.
- `tests/vitest/http/factoring.business.test.ts`: entradas inválidas rechazadas antes de abrir transacción.
- `tests/mariadb/settlement.test.ts`: escenarios de gasto, precisión admitida exacta y rechazos sin registros parciales, con Prisma y MariaDB desechable cuando se autorice su ejecución.
- Frontend: `src/utils/liquidacionInput.test.js` y `src/test-utils/factoringPropuestaLiquidacion.business.test.js`, mensajes y bloqueo/recálculo para ambos roles con API simulada.

Para el cierre posterior, desde backend: pruebas focalizadas de los tres archivos Vitest, tipos de backend/Vitest/integración y `npm run test:integration -- tests/mariadb/settlement.test.ts` con el runner aislado. Conservar regresiones actuales y no actualizar expectativas ajenas para lograr aprobaciones. Frontend dispone de comando manual en su guía `docs/pruebas/FACTORING_PROPUESTA_LIQUIDACION.md`. Estos comandos no se ejecutaron en este cambio.

## Pendientes

DT-LIQ-04 explicado, sin autorización para cambiar su redondeo: 100,01 al 50 % produce dos mitades exactas de 50,005; redondear ambas a 50,01 suma 100,02. Propuesta: financiamiento 50,01 y garantía por diferencia 50,00. DT-LIQ-07/08 siguen pendientes de revisión detallada. DT-LIQ-09 registra el alcance normativo de tasas descubierto durante esta búsqueda. Las dos implementaciones de este documento siguen abiertas hasta la validación conjunta.
