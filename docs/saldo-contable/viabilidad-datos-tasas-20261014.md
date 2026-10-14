# Viabilidad de datos y tasas: revisión estática

Fecha: 14/10/2026. Revisión de partida: `98b5a76`, rama `20261014-funcionalidades`. Se inspeccionó el árbol de trabajo actual, con cambios previos ajenos a este bloque; no equivale a una auditoría exclusiva del commit. No se modificó código funcional ni se consultaron bases de negocio, proveedores o archivos de entorno.

## 1. Resultado y alcance

La base neta, el cierre inmutable con pagos posteriores y la clasificación por instrumento están definidos en [reglas-contables.md](reglas-contables.md). El usuario confirmó que actualmente solo se registra cobro total. Esto permite un modelo inicial de neto pendiente o cero por cancelación acreditada, sin crear un subsistema de abonos parciales.

La revisión estática confirma fuentes candidatas, pero no acredita que los datos históricos estén completos. La selección automática queda condicionada a verificar reconocimiento, cobertura de facturas, estados/fechas de cobro total y procedencia del tipo contable. No declarar viable la reconstrucción histórica completa basándose únicamente en la presencia de columnas.

## 2. Diccionario de importes, fechas y significado

Todos los nombres corresponden a [prisma/ft_factoring/schema.prisma](../../prisma/ft_factoring/schema.prisma). `Decimal(p,s)` expresa capacidad y escala del almacenamiento, no política de redondeo del reporte.

| Modelo/campos | Tipo | Fuente candidata / uso | Límite confirmado en código |
| --- | --- | --- | --- |
| factoring.monto_neto | Decimal(10,2) | Base neta de operación | Se crea sumando netos de facturas; no tiene historial propio de versiones monetarias |
| factoring.monto_factura, monto_detraccion, monto_retencion | Decimal(10,2) | Controles de composición | No descontarlos otra vez del neto ni mezclar monedas de detracción |
| factoring.fecha_operacion | TIMESTAMP(0), nullable | Candidato a reconocimiento/inicio | Se asigna con new Date al pasar a estado 36; no acredita por sí sola adquisición económica histórica |
| factoring.fecha_registro, fecha_emision, fecha_pago_estimado | TIMESTAMP(0) | Contexto y diagnóstico | Registro, emisión y vencimiento estimado no son cobro ni reconocimiento equivalentes |
| factoring.idfactoringestado, estado | Enteros | Estado funcional actual y baja lógica | Estado actual no reconstruye saldo al corte ni justifica excluir todos los eliminados hoy |
| factoring.idfactoringpropuestaaceptada | FK nullable | Enlace a condiciones aceptadas | Debe comprobarse contra la operación; no sustituye fuente monetaria por nombre |
| factura.importe_neto, importe_bruto | Decimal(12,2) | Distribución por instrumento y controles | El neto viene de términos XML o cálculo alternativo; preservar valor almacenado |
| factura.detraccion_monto, retencion_monto | Decimal(12,2), nullable | Composición del neto | Detracción puede expresarse en PEN; no restar directamente a USD |
| factura.codigo_tipo_documento, codigo_tipo_moneda | Texto | Tipo tributario y moneda del instrumento | Tipo tributario no prueba instrumento SBS negociable/comercial |
| factura.fecha_emision, fecha_vencimiento | DATE, nullable | Contexto civil | No convertir a instante UTC/Lima como si fuera hora del evento |
| factoring_factura | PK operación+factura, auditoría y estado lógico | Universo de instrumentos relacionados | Enlace actual; la baja lógica puede haber cambiado después del corte |
| factoring_factura_factor.fecha_pago_factura | TIMESTAMP(0), nullable | Candidato a fecha de cobro total del instrumento | Editable; no contiene monto de abono ni historial de fechas anteriores |
| factoring_factura_factor.idfacturaestado | FK | Significado de pendiente/pagada a verificar | Catálogo real no consultado; no hardcodear IDs a partir de fixtures |
| factoring_factura_factor.fecha_pago_detraccion, iddetraccionestado | TIMESTAMP(0) nullable / FK | Seguimiento separado de detracción | No sustituye cobro del neto; el nuevo flujo de detracciones tampoco agrega importes cobrados |
| factoring_pago.fecha_pago, monto_pagado | TIMESTAMP(0) / Decimal(10,2) | Fuente potencial, no acreditada | No se encontraron escritores específicos en src/scripts inspeccionados; puede existir carga externa |
| factoring_pago.cuentas bancarias, estado | FKs / entero | Identificar dirección del flujo y vigencia | El nombre de la tabla no demuestra cobranza al pagador ni imputación a principal |
| factoring_propuesta.monto_neto, monto_garantia, monto_financiado | Decimal(10,2); últimos nullable | Condiciones y comparación | Simulación toma monto_neto del DTO; puede diferir del neto creado con facturas |
| factoring_propuesta.idfactoringtipo | FK nullable | Candidato a mapeo factoring/descuento | Confirmar catálogo y sustento de transferencia de riesgo |
| factoring_ejecutado.fecha_pago_real | DATE | Referencia de ejecución heredada | No se encontraron escritores específicos en el código revisado; no asumir cobertura actual |
| factoring_ejecutado.monto_*_real | Decimal(10,2), varios nullable | Importes heredados de ejecución | Su presencia no acredita eventos de cobranza ni reconocimiento en libros |
| factoring_liquidacion.fecha_pago_efectivo | TIMESTAMP(0) | Fecha usada para liquidar/simular | Creada desde runSimulation; no acredita pago recibido por sí sola |
| factoring_liquidacion.monto_total_por_cobrar y totales a favor | Decimal(10,2) | Resultado de liquidación | No equivalen a principal pendiente de cartera; no sustituir valor neto por estos conceptos |
| factoring_transferencia_cedente.monto, fecha | Decimal(20,2) / TIMESTAMP(0) | Transferencia hacia cedente | No restar desembolso como si fuera cobro del deudor |
| factura_termino_pago.monto, fecha_pago | Decimal(12,2), DATE; nullable | Condiciones/cuotas importadas del XML | No constituyen constancia de cobro efectivo |
| factoring_historial_estado | Estado, comentario, auditoría | Traza de transiciones | Sus registros pueden editarse, eliminarse y activarse; no es libro inmutable de eventos monetarios |
| sbs_tipo_cambio.fecha, precio_contable | DATE / Decimal(12,6), nullable | Tasa de fecha exacta | No hay metadatos de procedencia contable; puede contener venta de respaldo |
| sbs_tipo_cambio.precio_compra, precio_venta | Decimal(10,4) | Tasas de mercado almacenadas | No son reemplazos autorizados de precio contable |

## 3. Productores y mutaciones verificadas

| Hecho | Ruta y símbolo | Conclusión para Saldo Contable |
| --- | --- | --- |
| Lectura del XML y persistencia de facturas | [empresario/factura.Service.ts](../../src/services/empresario/factura.Service.ts), facturaUtils.procesarFacturaXML/getFacturaToCreate | Neto ya determinado; no reconstruirlo con otra fórmula en el reporte |
| Neto de factura | [facturaUtils.ts](../../src/utils/facturaUtils.ts), calcularImporteNeto | Prioriza crédito XML, luego cuotas y finalmente fórmula alternativa; comprobar moneda en discrepancias |
| Neto de operación | [empresario/factoring.Service.ts](../../src/services/empresario/factoring.Service.ts), factoringToCreate | Suma importe_neto con Decimal; comparación por instrumento factible estructuralmente |
| Inicio de operación | [admin/factoringhistorialestado.Service.ts](../../src/services/admin/factoringhistorialestado.Service.ts), createFactoringhistorialestadoService | Estado 36 escribe instante actual en fecha_operacion; verificar reingresos y fecha efectiva histórica |
| Historial mutable | [factoringhistorialestado.Dao.ts](../../src/daos/factoringhistorialestado.Dao.ts), update/delete/activate | No usar como única evidencia inalterable de un corte pasado |
| Pago de factura/detracción admin | [admin/factoringfacturafactor.Service.ts](../../src/services/admin/factoringfacturafactor.Service.ts), create/update | Guarda fecha/estado, no importe de cobro |
| Pago de factura/detracción financiero | [financiero/factoringfacturafactor.Service.ts](../../src/services/financiero/factoringfacturafactor.Service.ts), create/update | Mismo límite de información; la edición sustituye fechas anteriores |
| Liquidación | [admin/factoringliquidacion.Service.ts](../../src/services/admin/factoringliquidacion.Service.ts), createFactoringliquidacionService | Persiste resultados simulados y estado suministrado; no se identificó asiento de cobro total en este productor |
| Transferencia al cedente | [admin/factoringtransferenciacedente.Service.ts](../../src/services/admin/factoringtransferenciacedente.Service.ts), create/update | Flujo separado del cobro del derecho adquirido |
| Seguimiento de detracciones en trabajo | [financiero/factoringdetraccion.Service.ts](../../src/services/financiero/factoringdetraccion.Service.ts), actualizarDetraccionService | Cambia fecha/estado con control de versión; no agrega historial monetario ni pago del neto |

El módulo de detracciones estaba presente como trabajo no confirmado en Git al iniciar este bloque. Se leyó solo por afectar campos candidatos de pago y no fue modificado. La revisión no certifica su integración ni sus pruebas.

La búsqueda por modelo, relaciones y símbolos encontró lecturas de factoring_pagos/factoring_ejecutado en factoring.Dao, sin escritores específicos en los archivos fuente/scripts inspeccionados. **No implica tablas vacías ni ausencia de cargas externas o procedimientos de base**. El origen debe confirmarse antes de utilizarlas.

## 4. Auditoría estática de tipos de cambio

| Flujo actual | Comportamiento observado | Riesgo / requisito nuevo |
| --- | --- | --- |
| consultarProveedorSbs, APIs Perú | Devuelve precioContableDecimal=null | No produce por ese camino una nueva tasa contable verificable |
| consultarProveedorSbs, Decolecta | Consulta promedio y contable; usa contableData.price si existe, o promedio.sell_price | El respaldo confunde venta con contable |
| Fecha/monedas en consulta diaria Decolecta | Persistencia usa fecha y monedas de promedioData | Verificar también fecha, base y cotizada de contableData, no solo su precio |
| sincronizarSbsMesLogic, APIs Perú | Construye precio_contable=null | Crear puede quedar sin contable; actualización puede conservar un valor anterior |
| sincronizarSbsMesLogic, Decolecta | Escribe item.sell_price como precio_contable | La ruta mensual de promedio no acredita procedencia contable |
| crearSbsTipoCambioService | Si no se recibe precio_contable, copia precio_venta | Un registro manual no nulo puede no ser contable |
| upsertSbsTipoCambio | Al actualizar omite precio_contable si viene null/undefined | Preserva un valor previo sin probar su origen; no borrarlo a ciegas ni declararlo verificado |
| obtenerSbsLogic | Lee caché; si no existe sincroniza y escribe | No usar como consulta pasiva de Saldo Contable |
| getSbsTipoCambioByFecha | Filtra par, fecha exacta y estado | Reutilizable para lectura estricta; añadir validación/procedencia en el caso de uso |

Referencias: [tipocambio.Service.ts](../../src/services/admin/tipocambio.Service.ts), [sbstipocambio.Service.ts](../../src/services/financiero/sbstipocambio.Service.ts), [sbstipocambio.Dao.ts](../../src/daos/sbstipocambio.Dao.ts), [cliente de contable](../../src/integrations/decolecta/decolecta.service.ts), [tipo de respuesta contable](../../src/integrations/decolecta/decolecta.types.ts).

### Diseño propuesto de procedencia, sin saneamiento ejecutado

1. Conservar relación al registro SBS existente; no crear una segunda tabla de valores de cambio para el módulo.
2. Añadir evidencia/metadatos de verificación contable: fuente, fecha a la que corresponde, par, precio verificado, instante y responsable de verificación, y referencia al respaldo. Preferir campos/versiones que permitan distinguir valor actual de evidencia previa.
3. No marcar un registro como incorrecto solo porque contable y venta coinciden: la coincidencia no prueba ni invalida procedencia.
4. Tratar el registro histórico sin evidencia como pendiente de verificación. Consultar fuente oficial o respaldo aceptado para el corte exacto y registrar el resultado, previa autorización del flujo de actualización.
5. Si el precio actual cambia, invalidar la evidencia que no corresponde a ese precio/par/fecha; no conservar un sello de verificación antiguo sobre un nuevo valor.
6. Una consulta/sincronización de compra/venta que no trae dato contable puede preservar el contable previo junto a su procedencia válida; no atribuir al proveedor nuevo evidencia que no entregó.
7. Eliminar respaldos silenciosos en los productores que abastezcan el precio contable. Conservar compra/venta para sus consumidores actuales y añadir regresión focalizada.
8. Al cerrar, copiar valor/fecha/par/evidencia al snapshot. Cambiar o eliminar el registro original no cambia el cierre anterior.

La tabla actual tiene clave única por par de monedas y fecha. La ausencia de provenance requiere evolución de esquema o evidencia vinculada y control de concurrencia; no basta con una validación frontend. No se ejecutó ninguna consulta externa para confirmar tasas concretas en este bloque.

## 5. Verificación preparada para copia autorizada

Archivo: [verificacion-datos.sql](verificacion-datos.sql). Solo contiene consultas SELECT/CTE de diagnóstico y no está integrado en el arranque de la aplicación. **No fue ejecutado**. Leer las guardas y confirmar destino antes de utilizarlo.

| Consulta | Qué resuelve | Qué no resuelve |
| --- | --- | --- |
| Q-00 | Entorno y zona de sesión; catálogo real de estados | No modifica ni certifica el significado contable de cada estado |
| Q-01 | Fechas de reconocimiento faltantes y distribución por estado | No decide elegibilidad a partir del estado actual |
| Q-02 | Diferencias neto operación/suma de instrumentos | No repara valores ni prueba netos históricos |
| Q-03 | Cobertura/duplicados y fechas de cobro faltantes | No inventa significado de estado ni de pago total |
| Q-04 | Pagos por instrumentos a ambos lados de cortes de referencia | No convierte esos casos en parciales calculables en V1 |
| Q-05 | Presencia agregada de factoring_pago y factoring_ejecutado | No acredita quién los alimenta ni dirección del dinero |
| Q-06 | Estado y nulabilidad de tasa de fecha/par exactos | No prueba procedencia oficial, aun si el precio es positivo |

Para cerrar SC-016 se requieren resultados actuales de una copia autorizada y una muestra controlada de: pendiente acreditada, cobrada antes del corte, cobrada después y dato contradictorio si existe. Compartir únicamente conteos/diagnósticos y hechos anonimizados; no credenciales ni documentos de clientes. No abrir `.env`, ejecutar prisma-sync ni exportar desarrollo como preparación rutinaria.

## 6. Decisión de arquitectura para V1 y puertas pendientes

1. Reutilizar netos y enlaces actuales mediante un adaptador de lectura; bloquear discrepancias en lugar de reescribir operaciones.
2. Modelar reconocimiento y cobro total efectivo como entradas explícitas del dominio; no inferir cancelación de una liquidación simulada.
3. No crear tabla de abonos parciales ni ampliar el flujo operativo para casos que el usuario confirmó ausentes. SC-041 queda fuera del alcance inicial por D-04.
4. Si una muestra evidencia pagos/fechas históricos insuficientes, permitir conciliación sustentada del hecho de cobro total o del saldo de referencia; no poblar un historial ficticio. Cualquier almacenamiento adicional de esa evidencia se diseña después de medir la brecha.
5. Incorporar clasificación SBS sustentada y copia de cierre como nuevos datos del módulo. Preservar todos los pagos posteriores.
6. Añadir procedencia/verificación del contable SBS y lectura estricta antes de confiar en la tasa almacenada.

| Tarea | Estado de este bloque |
| --- | --- |
| SC-001 | Expediente y decisiones confirmadas documentados |
| SC-003 | Base y comportamiento de V1 definidos; conciliación de libros y vigencia histórica pendiente |
| SC-006 | Política por instrumento confirmada; sustento/mapeo histórico pendiente |
| SC-007 | Alcance de cobro total confirmado; mapeo de estado y dato histórico pendiente |
| SC-008 | Decisión de cierre resuelta: snapshot inmutable con actividad operativa posterior |
| SC-013 | Contexto, instrucciones y árbol actual revisados |
| SC-014 | Diccionario estructural elaborado |
| SC-015 | Productores trazados; semántica completa de fuentes heredadas pendiente |
| SC-016 | Consultas preparadas; ejecución en copia y evidencia real pendientes |
| SC-017/018 | Diseño de V1 acotado; cobertura/granularidad real pendiente |
| SC-019 | Auditoría estática de caminos de tasa completada |
| SC-020 | Diseño de verificación documentado; tasas existentes no saneadas ni verificadas |
| SC-023 | Puerta de viabilidad contable completa sigue pendiente |

**Siguiente paso del plan:** verificar Q-00 a Q-06 en una copia autorizada y resolver la correspondencia real estado/fecha de cobro total. Con esa evidencia se podrá completar SC-016/SC-018 y el contrato del evaluador sin introducir abonos parciales ni alterar las reglas existentes.
