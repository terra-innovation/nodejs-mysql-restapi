# Propuesta actualizada: tablas SBS y catálogos

Fecha: 14/10/2026. Estado: aprobado y aplicado en desarrollo. Las cuatro tablas, relaciones, comentarios y catálogos iniciales fueron creados; después se ejecutó prisma-sync. Esta revisión reemplaza el diseño anterior de dos tablas sin catálogos. Véase [resultado y evidencia](implementacion-bbdd-20261014.md).

## 1. Cambios solicitados

- Dos tablas operativas con prefijo sbs_: sbs_saldo_contable_periodo y sbs_saldo_contable_detalle.
- Catálogo funcional sbs_saldo_contable_periodo_estado relacionado con la cabecera; reemplaza estado_elaboracion numérico aislado.
- Catálogo sbs_saldo_contable_operacion_tipo relacionado con la cabecera; reemplaza tipo_operacion de texto libre.
- Campo nombre_periodo para etiqueta visible, independiente de las tres fechas.
- Cuatro tablas nuevas en total: dos operativas y dos catálogos, según la ampliación solicitada.
- Comentarios detallados de tabla y cada columna incluidos directamente en [el DDL propuesto](esquema-propuesto.sql), no solo en este documento.

## 2. Qué se referencia y qué se copia

Las FKs apuntan a operación, propuesta aceptada, liquidación fuente, moneda y tipo contable SBS. Las copias de monto_neto, tipo_cambio, importe PEN, fechas utilizadas, código/moneda y clasificación preservan lo que se calculó y reportó. Al cerrar no se sustituyen por valores actuales de las referencias.

Precisión posterior del 14/10/2026: para el cobro se consideran registros con estado lógico 1, sin condición de estado funcional. Cualquier pago hasta el corte inclusive excluye. Con varios pagos activos, la primera fecha se usa como evidencia, con ID como desempate. Esta regla sustituye las menciones iniciales a vigente/ambigüedad del diccionario siguiente. No se ha modificado el SQL aprobado, los comentarios físicos de la base ni el schema Prisma; cualquier DDL adicional requiere autorización expresa.

Fuente única: factoring.factoring_propuesta_aceptada.monto_neto, mediante idfactoringpropuestaaceptada. Sin propuesta válida se bloquea esa operación; no usar neto inicial ni suma de facturas como respaldo. En borrador se recalcula expresamente; en cerrado se lee la copia inmutable.

Texto de interfaz:

> Monto neto pendiente de pago confirmado por el pagador, tomado de la propuesta aceptada de la operación.

Auditoría habitual: idusuariocrea, fechacrea, idusuariomod, fechamod y estado. Estado lógico mantiene 1=ACTIVO y 2=ELIMINADO; es diferente del estado funcional del período. Usuarios de auditoría conservan columnas enteras sin añadir FKs especiales, como el patrón existente.

## 3. Diccionario de las cuatro tablas

### sbs_saldo_contable_periodo_estado

Catálogo del estado funcional del período de saldo contable SBS. Distingue EN_ELABORACION y CERRADO; no representa eliminación lógica ni situación temporal de la cobertura. Cambiar nombre o alias no altera su semántica estable.

| Campo físico | Tipo / nulabilidad / default | Comentario de columna |
| --- | --- | --- |
| _idsbssaldocontableperiodoestado | INT UNSIGNED NOT NULL | Clave primaria interna de catálogo con identificadores estables sembrados por la migración. Las relaciones internas usan esta clave; no es el identificador público de la API. |
| sbssaldocontableperiodoestadoid | VARCHAR(50) NOT NULL DEFAULT (uuid()) | UUID público único, siguiendo el patrón del esquema actual. Identifica el registro en API y no cambia al editar etiquetas, desactivar o reactivar lógicamente. |
| code | VARCHAR(20) NOT NULL | Código único estable según el patrón existente. En catálogos identifica la semántica de negocio aunque cambie nombre o alias; en registros operativos lo genera la aplicación. |
| nombre | VARCHAR(50) NOT NULL | Nombre del estado funcional para presentación: EN ELABORACION o CERRADO. No se usa el texto editable para decidir permisos; se utiliza su code estable. |
| alias | VARCHAR(50) NOT NULL | Etiqueta breve para lista, chip y selector. Es presentación del mismo estado funcional y no crea una tercera condición de cierre. |
| color | VARCHAR(50) NOT NULL | Color o identificador visual del estado, siguiendo catálogos existentes. No determina permisos ni reemplaza controles de inmutabilidad del servicio. |
| orden | SMALLINT UNSIGNED NOT NULL DEFAULT 1 | Orden de presentación del catálogo en listas/controles. No indica prioridad de transacciones ni secuencia automática de aprobación. |
| idusuariocrea | INT NOT NULL DEFAULT 1 | Usuario responsable de crear el registro. La aplicación debe asignar el usuario autenticado; el valor por defecto conserva la convención técnica existente y no sustituye la autoría real. |
| fechacrea | TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) | Instante de creación con milisegundos. Se almacena bajo la convención UTC del backend; no representa el inicio, fin o corte civil del reporte. |
| idusuariomod | INT NOT NULL DEFAULT 1 | Usuario que realizó la última modificación autorizada. Lo establece la aplicación desde la sesión; no se acepta como dato libre del cliente. |
| fechamod | TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) | Instante de última modificación con milisegundos, actualizado explícitamente por la aplicación. No modifica ni sustituye las fechas civiles o fechas fuente del reporte. |
| estado | TINYINT NOT NULL DEFAULT 1 | Vigencia lógica del registro: 1=ACTIVO y 2=ELIMINADO. En detalle, activo significa asociado y eliminado significa retirado. No indica elaboración/cierre ni sustituye el catálogo de estado del período. |

### sbs_saldo_contable_operacion_tipo

Catálogo del tipo regulatorio de operación del reporte SBS: DESCUENTO y FACTORING. No representa el nombre comercial de los servicios o tablas factoring. En V1 solo DESCUENTO tiene reglas implementadas y puede seleccionarse.

| Campo físico | Tipo / nulabilidad / default | Comentario de columna |
| --- | --- | --- |
| _idsbssaldocontableoperaciontipo | INT UNSIGNED NOT NULL | Clave primaria interna de catálogo con identificadores estables sembrados por la migración. Las relaciones internas usan esta clave; no es el identificador público de la API. |
| sbssaldocontableoperaciontipoid | VARCHAR(50) NOT NULL DEFAULT (uuid()) | UUID público único, siguiendo el patrón del esquema actual. Identifica el registro en API y no cambia al editar etiquetas, desactivar o reactivar lógicamente. |
| code | VARCHAR(20) NOT NULL | Código único estable según el patrón existente. En catálogos identifica la semántica de negocio aunque cambie nombre o alias; en registros operativos lo genera la aplicación. |
| nombre | VARCHAR(50) NOT NULL | Nombre regulatorio del tipo: DESCUENTO o FACTORING. El nombre comercial factoring no determina este dato; V1 usa DESCUENTO por decisión funcional. |
| alias | VARCHAR(50) NOT NULL | Etiqueta breve del tipo para formulario y listado; no modifica su code estable ni habilita reglas contables todavía no implementadas. |
| color | VARCHAR(50) NOT NULL | Identificador visual del tipo conforme al estilo de catálogos existentes; sin efecto sobre clasificación del instrumento o elegibilidad al corte. |
| orden | SMALLINT UNSIGNED NOT NULL DEFAULT 1 | Orden de presentación de tipos. No indica elegibilidad, aprobación ni prioridad de cálculo. |
| habilitado | TINYINT NOT NULL DEFAULT 1 | Disponibilidad funcional para seleccionar el tipo en nuevos períodos: 1=habilitado y 0=no habilitado. DESCUENTO=1 y FACTORING=0 inicialmente; habilitar FACTORING requiere implementar y validar sus reglas, no solo cambiar este valor. |
| idusuariocrea | INT NOT NULL DEFAULT 1 | Usuario responsable de crear el registro. La aplicación debe asignar el usuario autenticado; el valor por defecto conserva la convención técnica existente y no sustituye la autoría real. |
| fechacrea | TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) | Instante de creación con milisegundos. Se almacena bajo la convención UTC del backend; no representa el inicio, fin o corte civil del reporte. |
| idusuariomod | INT NOT NULL DEFAULT 1 | Usuario que realizó la última modificación autorizada. Lo establece la aplicación desde la sesión; no se acepta como dato libre del cliente. |
| fechamod | TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) | Instante de última modificación con milisegundos, actualizado explícitamente por la aplicación. No modifica ni sustituye las fechas civiles o fechas fuente del reporte. |
| estado | TINYINT NOT NULL DEFAULT 1 | Vigencia lógica del registro: 1=ACTIVO y 2=ELIMINADO. En detalle, activo significa asociado y eliminado significa retirado. No indica elaboración/cierre ni sustituye el catálogo de estado del período. |

### sbs_saldo_contable_periodo

Cabecera de un reporte de saldo contable SBS con cobertura y corte explícitos, independiente de frecuencia trimestral, semestral o anual. Su total en PEN procede de detalles asociados activos. Al cerrar se congelan datos reportados sin bloquear pagos posteriores de operaciones originales.

| Campo físico | Tipo / nulabilidad / default | Comentario de columna |
| --- | --- | --- |
| _idsbssaldocontableperiodo | INT UNSIGNED NOT NULL AUTO_INCREMENT | Clave primaria interna de registro con incremento automático. Las relaciones internas usan esta clave; no es el identificador público de la API. |
| sbssaldocontableperiodoid | VARCHAR(50) NOT NULL DEFAULT (uuid()) | UUID público único, siguiendo el patrón del esquema actual. Identifica el registro en API y no cambia al editar etiquetas, desactivar o reactivar lógicamente. |
| code | VARCHAR(20) NOT NULL | Código único estable según el patrón existente. En catálogos identifica la semántica de negocio aunque cambie nombre o alias; en registros operativos lo genera la aplicación. |
| nombre_periodo | VARCHAR(150) NOT NULL | Nombre descriptivo visible del período, por ejemplo Primer trimestre 2026. No sustituye fecha_inicio, fecha_fin o fecha_corte ni restringe la frecuencia del reporte. |
| fecha_inicio | DATE NOT NULL | Inicio civil de la cobertura del reporte, sin hora. No excluye cartera iniciada antes que continúe pendiente al corte; no es una fecha UTC de evento. |
| fecha_fin | DATE NOT NULL | Fin civil de la cobertura, sin hora. Se usa con fecha_inicio para determinar período anterior, en curso o futuro; no se deriva obligatoriamente de un trimestre. |
| fecha_corte | DATE NOT NULL | Fecha civil que determina cartera pendiente y tipo de cambio contable SBS aplicable. Incluye todo el día en America/Lima. No es fecha de creación, cierre interno ni envío a SBS. |
| _idsbssaldocontableperiodoestado | INT UNSIGNED NOT NULL DEFAULT 1 | FK al estado funcional del período. Inicialmente EN_ELABORACION; el cierre transaccional cambia a CERRADO y bloquea modificaciones de lo reportado. Diferente de estado lógico y de temporalidad calculada. |
| _idsbssaldocontableoperaciontipo | INT UNSIGNED NOT NULL DEFAULT 1 | FK al tipo regulatorio del reporte. V1 permite únicamente el catálogo DESCUENTO habilitado; FACTORING permanece reservado para futuras reglas y no se infiere del nombre comercial. |
| monto_saldo_contable | DECIMAL(24,8) NOT NULL DEFAULT 0 | Total preciso en PEN: suma de monto_saldo_contable de detalles asociados activos. Se presenta con dos decimales; no mezcla monedas originales ni suma reportes de otros cortes. Cero inicial corresponde a selección vacía. |
| version | INT UNSIGNED NOT NULL DEFAULT 1 | Versión de concurrencia del período, incrementada en mutaciones autorizadas. Permite detectar una edición/revisión de cierre obsoleta; no es número de rectificación regulatoria. |
| fecha_cierre | TIMESTAMP(3) NULL | Instante UTC con milisegundos en que se confirmó el cierre interno. Nulo mientras esté en elaboración. No acredita firma, presentación o recepción por SBS. |
| idusuariocierra | INT NULL | Usuario autenticado que confirmó el cierre interno. Nulo en elaboración; usa la convención de columnas de auditoría sin nueva FK obligatoria. |
| idusuariocrea | INT NOT NULL DEFAULT 1 | Usuario responsable de crear el registro. La aplicación debe asignar el usuario autenticado; el valor por defecto conserva la convención técnica existente y no sustituye la autoría real. |
| fechacrea | TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) | Instante de creación con milisegundos. Se almacena bajo la convención UTC del backend; no representa el inicio, fin o corte civil del reporte. |
| idusuariomod | INT NOT NULL DEFAULT 1 | Usuario que realizó la última modificación autorizada. Lo establece la aplicación desde la sesión; no se acepta como dato libre del cliente. |
| fechamod | TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) | Instante de última modificación con milisegundos, actualizado explícitamente por la aplicación. No modifica ni sustituye las fechas civiles o fechas fuente del reporte. |
| estado | TINYINT NOT NULL DEFAULT 1 | Vigencia lógica del registro: 1=ACTIVO y 2=ELIMINADO. En detalle, activo significa asociado y eliminado significa retirado. No indica elaboración/cierre ni sustituye el catálogo de estado del período. |

### sbs_saldo_contable_detalle

Una operación asociada a un período SBS con referencia a propuesta aceptada y copias de importes, fechas y clasificación utilizados. El cálculo persistido es monto_neto de propuesta aceptada por tipo_cambio, en PEN. Las copias conservan lo reportado al cierre aunque cambien las fuentes. La operación puede reaparecer en distintos períodos mientras siga pendiente.

| Campo físico | Tipo / nulabilidad / default | Comentario de columna |
| --- | --- | --- |
| _idsbssaldocontabledetalle | INT UNSIGNED NOT NULL AUTO_INCREMENT | Clave primaria interna de registro con incremento automático. Las relaciones internas usan esta clave; no es el identificador público de la API. |
| sbssaldocontabledetalleid | VARCHAR(50) NOT NULL DEFAULT (uuid()) | UUID público único, siguiendo el patrón del esquema actual. Identifica el registro en API y no cambia al editar etiquetas, desactivar o reactivar lógicamente. |
| code | VARCHAR(20) NOT NULL | Código único estable según el patrón existente. En catálogos identifica la semántica de negocio aunque cambie nombre o alias; en registros operativos lo genera la aplicación. |
| _idsbssaldocontableperiodo | INT UNSIGNED NOT NULL | FK a cabecera propietaria del detalle. Con _idfactoring forma una relación única por período, sin impedir que la misma operación participe en otros cortes. |
| _idfactoring | INT UNSIGNED NOT NULL | FK a operación original. Conserva navegación y trazabilidad; el saldo cerrado se lee de las copias del detalle y no se recalcula desde datos operativos actuales. |
| _idfactoringpropuesta | INT UNSIGNED NOT NULL | FK a propuesta aceptada utilizada en el cálculo. Debe coincidir con la propuesta aceptada de la operación al asociar/recalcular; su monto_neto es la única base, sin fallback al neto inicial de operación o facturas. |
| _idfactoringliquidacion | INT UNSIGNED NULL | FK a liquidación vigente activa considerada al evaluar el corte. Nula si no existe vigente. Anuladas/reemplazadas no se usan; varias vigentes requieren revisión. No sustituye la copia de fecha_pago_efectivo. |
| _idmoneda | INT UNSIGNED NOT NULL | FK a moneda original del monto_neto de la propuesta aceptada. No indica moneda del resultado, que siempre es PEN; moneda_codigo conserva la etiqueta histórica. |
| _idsbstipocambio | INT UNSIGNED NULL | FK al registro existente del tipo contable SBS de USD/PEN para fecha_corte. Nula en PEN porque su multiplicador es 1. La FK conserva origen, pero el valor histórico aplicado se lee de tipo_cambio. |
| codigo_operacion | VARCHAR(255) NOT NULL | Copia de factoring.code utilizado en el reporte, con capacidad igual a la fuente. Preserva identificación histórica si luego cambia el código operativo. |
| moneda_codigo | VARCHAR(10) NOT NULL | Copia del código de moneda original PEN o USD al calcular. Permite interpretar el reporte cerrado aunque se modifique posteriormente el catálogo de monedas. |
| fecha_operacion | TIMESTAMP(0) NOT NULL | Copia del inicio de operación usado para elegibilidad. Se interpreta como instante bajo convención UTC y se compara contra el corte civil completo en Lima; no es fecha_inicio del período. |
| fecha_pago_efectivo | TIMESTAMP(0) NULL | Copia de fecha real de cobro total de la liquidación vigente usada. Nula si no hay vigente. Cobro hasta corte excluye del saldo; si es posterior, conserva condición pendiente al corte histórico. |
| monto_neto | DECIMAL(10,2) NOT NULL | Copia de monto_neto de la propuesta aceptada: importe pendiente confirmado por el pagador en moneda original. No es neto inicial de operación, valor nominal, financiado ni desembolso. No volver a restar garantía, detracción o retención. |
| tipo_cambio | DECIMAL(12,6) NOT NULL | Multiplicador histórico aplicado: 1 para PEN o precio_contable SBS de USD/PEN para fecha_corte. No usar compra, venta, SUNAT, fecha de desembolso ni último día disponible como sustituto. |
| monto_saldo_contable | DECIMAL(24,8) NOT NULL | Producto preciso de monto_neto por tipo_cambio, siempre en PEN. Se guarda con ocho decimales y se presenta con dos; participa en el total solo mientras el detalle esté activo/asociado. |
| clasificacion_instrumentos | JSON NULL | Copia estructurada de clasificación y referencias de sustento por instrumento para el reporte. No contiene un reparto monetario inventado desde facturas ni sustituye el neto de la propuesta aceptada. |
| motivo_retiro | VARCHAR(500) NULL | Última justificación del retiro lógico de la asociación, cuando corresponda. No elimina la operación ni sus asociaciones en otros períodos, y no permite modificar un reporte ya cerrado. |
| idusuariocrea | INT NOT NULL DEFAULT 1 | Usuario responsable de crear el registro. La aplicación debe asignar el usuario autenticado; el valor por defecto conserva la convención técnica existente y no sustituye la autoría real. |
| fechacrea | TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) | Instante de creación con milisegundos. Se almacena bajo la convención UTC del backend; no representa el inicio, fin o corte civil del reporte. |
| idusuariomod | INT NOT NULL DEFAULT 1 | Usuario que realizó la última modificación autorizada. Lo establece la aplicación desde la sesión; no se acepta como dato libre del cliente. |
| fechamod | TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) | Instante de última modificación con milisegundos, actualizado explícitamente por la aplicación. No modifica ni sustituye las fechas civiles o fechas fuente del reporte. |
| estado | TINYINT NOT NULL DEFAULT 1 | Vigencia lógica del registro: 1=ACTIVO y 2=ELIMINADO. En detalle, activo significa asociado y eliminado significa retirado. No indica elaboración/cierre ni sustituye el catálogo de estado del período. |

## 4. Valores iniciales de catálogos

| Catálogo | ID | code | Nombre | Habilitación |
| --- | --- | --- | --- | --- |
| Estado de período | 1 | SCPE00001 | EN ELABORACION | Estado inicial |
| Estado de período | 2 | SCPE00002 | CERRADO | Bloquea cambios de lo reportado |
| Tipo de operación | 1 | SCOT00001 | DESCUENTO | habilitado=1 |
| Tipo de operación | 2 | SCOT00002 | FACTORING | habilitado=0, reservado para reglas futuras |

Ambos tipos permanecen activos en catálogo; habilitado decide disponibilidad funcional y estado decide baja lógica. La API y formulario solo permiten Descuento en V1. Activar el flag de Factoring no reemplaza la implementación de sus reglas. Los codes estables, no el texto nombre/alias editable, identifican la semántica.

Los IDs internos de catálogos se siembran fijos, sin AUTO_INCREMENT, siguiendo el estilo de factoring_liquidacion_estado/factoring_tipo. Las dos tablas operativas usan AUTO_INCREMENT.

## 5. Relaciones y restricciones

| Campo origen | Destino | Cardinalidad / finalidad |
| --- | --- | --- |
| período._idsbssaldocontableperiodoestado | sbs_saldo_contable_periodo_estado._idsbssaldocontableperiodoestado | Estado 1:N períodos |
| período._idsbssaldocontableoperaciontipo | sbs_saldo_contable_operacion_tipo._idsbssaldocontableoperaciontipo | Tipo 1:N períodos |
| detalle._idsbssaldocontableperiodo | sbs_saldo_contable_periodo._idsbssaldocontableperiodo | Período 1:N detalles |
| detalle._idfactoring | factoring._idfactoring | Operación 1:N detalles de distintos cortes |
| detalle._idfactoringpropuesta | factoring_propuesta._idfactoringpropuesta | Propuesta aceptada utilizada, obligatoria |
| detalle._idfactoringliquidacion | factoring_liquidacion._idfactoringliquidacion | Vigente considerada, nullable |
| detalle._idmoneda | moneda._idmoneda | Moneda original |
| detalle._idsbstipocambio | sbs_tipo_cambio._idsbstipocambio | Contable SBS usado, nullable para PEN |

Todas las FKs propuestas son ON DELETE RESTRICT / ON UPDATE RESTRICT; no hay cascada de eliminación física. Añadir solo las relaciones inversas Prisma necesarias en modelos existentes.

- Período: UNIQUE(fecha_inicio,fecha_fin,fecha_corte,_idsbssaldocontableoperaciontipo). nombre_periodo no forma la identidad ni permite duplicar un período exacto cambiando etiqueta.
- Detalle: UNIQUE(_idsbssaldocontableperiodo,_idfactoring). La misma operación puede repetirse en otros cortes si sigue pendiente.
- UUID y code únicos por tabla. Índices para FKs y listado por estado/corte y período/estado.
- El servicio comprueba que la propuesta sea la aceptada de la operación, y que la liquidación fuente sea su vigente activa. Una FK por sí sola no comprueba pertenencia o vigencia.
- No hay tabla adicional de snapshots: el detalle conserva las copias. Los dos catálogos son las únicas tablas agregadas respecto al diseño operativo anterior.

## 6. Cálculo, estados y fechas

monto_saldo_contable del detalle = monto_neto copiado de propuesta aceptada × tipo_cambio guardado. PEN usa 1 y referencia SBS nula; USD usa precio_contable existente para USD/PEN y fecha_corte exacta. Sin contable válido, bloquear USD sin otro respaldo.

Guardar producto DECIMAL(24,8); mostrar dos decimales. El total de cabecera suma detalles activos con precisión. No sumar otros períodos. Una operación reportada antes vuelve a sugerirse mientras continúe pendiente al corte.

fecha_inicio/fin/corte son DATE flexibles, no trimestre obligatorio. Propuesta de validación: inicio<=fin, corte>=inicio, valor inicial corte=fin editable. Asociación/cierre requieren período y corte terminados en Lima. nombre_periodo es obligatorio y editable en elaboración; al cerrar forma parte de la cabecera congelada.

Cambio a CERRADO: guardar fecha_cierre/idusuariocierra y congelar cabecera/detalles en una transacción. No bloquear pagos posteriores en operación. Cambios de etiquetas de catálogos no reabren reportes ni cambian sus importes; codes/semántica de estados y tipos utilizados deben conservarse.

## 7. Comentarios en base de datos y validación prevista

El [DDL de propuesta](esquema-propuesto.sql) incluye COMMENT de tabla y COMMENT en todas las columnas, indicando semántica, unidades, fuente, nulabilidad, estados y diferencias entre fechas. Al implementar, estos comentarios deben quedar en MariaDB y conservarse en la documentación Prisma pertinente; comentarios de código no sustituyen los de base.

Se comprobó con SHOW CREATE TABLE/INFORMATION_SCHEMA en desarrollo autorizado que las cuatro tablas y sus 66 columnas conservan comentarios exactos, relaciones, índices y semillas. El informe incluye tipos, nulabilidad y defaults. Las estructuras anteriores no cambiaron. El SQL conserva su encabezado histórico; [el registro de ejecución](implementacion-bbdd-20261014.md) documenta su aplicación.

**Siguiente paso del plan:** implementar políticas de fechas, elegibilidad y cálculo; después DAOs y servicios de períodos, asociaciones y cierre. La estructura está creada, pero el cierre inmutable aún requiere controles transaccionales del backend.

