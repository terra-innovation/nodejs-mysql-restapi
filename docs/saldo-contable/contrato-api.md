# Contrato V1 — Saldo Contable

Base: `/api/v1/admin/splaft/saldocontable`. Todas las rutas exigen sesión y rol administrador (2), incluyendo comprobación de acceso vigente. Respuesta habitual `{ error: false, data: ... }`. Los errores utilizan el manejador existente y su mensaje; conflictos de versión, cierre, temporalidad o fuentes devuelven 409.

## Lecturas

| Método/ruta | Parámetros | Contenido de data |
| --- | --- | --- |
| GET `/listar` | page=1, limit=25 (máximo100) | items, total, page, limit; incluye eliminados para permitir activar |
| GET `/master` | ninguno | estados y tipos, con habilitado |
| GET `/:id` | UUID público de período | periodo, detalles activos, tipo_cambio; cerrado lee copias y no consulta tipo actual |
| GET `/:id/sugerencias` | page, limit, search (código, máximo100 caracteres) | operaciones evaluadas, total, paginación, tipo_cambio y acciones |

El período devuelve nombre, fechas civiles `YYYY-MM-DD`, UUID/code, tipo, estado lógico, etiqueta de estado funcional, `cerrado` calculado desde código estable, versión, fecha_cierre, saldo y acciones permitidas/motivo. Las etiquetas de catálogo no determinan permisos.

Las sugerencias solo consultan operaciones con estado lógico 1, fecha_operacion existente y anterior al inicio del día siguiente al corte en America/Lima, sin ninguna liquidación con estado lógico 1 y fecha_pago_efectivo anterior a ese mismo límite. Incluye íntegramente el día del corte; no usa estados funcionales de operación o liquidación. El mismo filtro y la búsqueda se aplican antes de paginar y contar. No se impone fecha mínima igual al inicio del período: la cartera antigua continúa evaluándose. Las mutaciones revalidan el cobro aunque se envíe una operación directamente o ya esté asociada a un borrador.

Cada candidata devuelve UUID/code, fechas fuente, instrumentos de referencia, `asociado`, `elegible`, `calculable`, `motivos[{codigo,mensaje}]`, neto, multiplicador y saldo PEN. La consulta evalúa las operaciones de la página, incluyendo cartera antigua; no excluye asociaciones de períodos anteriores. Consultar no guarda asociaciones. Los importes no calculables son null, nunca ceros inventados. Elegible puede ser true y calculable false por falta de cambio contable USD.

Todos los importes se transportan como cadenas decimales. Neto tiene dos decimales, tipo de cambio seis y saldo ocho. La interfaz presenta el agregado en dos decimales sin redondear previamente las filas guardadas. La clasificación no reparte automáticamente el neto entre instrumentos.

## Crear

POST base con únicamente:

```json
{
  "nombre_periodo": "Segundo trimestre 2026",
  "fecha_inicio": "2026-04-01",
  "fecha_fin": "2026-06-30",
  "fecha_corte": "2026-06-30",
  "tipo_operacion": "DESCUENTO"
}
```

Nombre requerido, máximo150. Fechas reales, inicio<=fin y corte>=inicio; no se exige trimestre ni corte=fin. Admite futuro/curso. Crea vacío en elaboración; la ausencia de tipo de cambio no impide registrar el período. Campos extras, Factoring o importes impuestos son rechazados. El usuario de auditoría procede de sesión.

## Mutaciones

PATCH `/:id` utiliza unión discriminada por `accion`, `version` numérica requerida y únicamente los campos de su variante:

| accion | Campos adicionales | Regla |
| --- | --- | --- |
| editar | periodo: objeto de creación | Elaboración activa; cambiar fechas exige retirar asociaciones previamente |
| asociar | operaciones: UUID[] único, 1..100 | Anterior, activo, elaboración; elegibilidad y conversión recalculadas en servidor |
| retirar | operaciones: UUID[] único, motivo: texto1..500 | Mismas restricciones; baja lógica de detalle |
| clasificar | operacion: UUID, instrumentos: array1..100 | Detalle asociado, elaboración anterior; cada elemento tiene instrumento, categoria y sustento |
| recalcular | ninguno | Actualiza copias desde fuentes actuales y conserva selección/clasificación; falla atómicamente si una seleccionada dejó de aplicar |
| cerrar | ninguno | Selección no vacía, fuentes revalidadas y sin diferencias; congela reporte, registra usuario/instante |
| eliminar | ninguno | Elaboración activa; conserva datos/asociaciones y permite reactivar |
| activar | ninguno | Elaboración eliminada; conserva asociaciones |

Categorías de instrumento: FACTURA_COMERCIAL, FACTURA_NEGOCIABLE, FACTURA_CONFORMADA, LETRA_CAMBIO y OTROS. Instrumento1..255, sustento1..1000; clasificación manual sin categoría predeterminada en interfaz y sin inferir negociabilidad por XML. Las evidencias se conservan como JSON serializado en la columna LONGTEXT validada de MariaDB.

Cada escritura bloquea cabecera antes de leerla y verifica versión; transacción Serializable conserva coherencia de fuentes y datos. Incrementa versión una vez y actualiza total desde detalles activos. Restricciones SQL evitan duplicado período+operación; retirada/reactivación reutiliza su detalle. Cierre compara referencias, fechas, código, moneda, neto, tipo e importe con la revisión guardada. Si cambiaron, devuelve conflicto y exige recalcular/revisar; no actualiza importes silenciosamente durante cierre. Las escrituras posteriores en operaciones originales no consultan ni recalculan reportes cerrados.

No hay reapertura, eliminación de cerrado, importación de reportes históricos, presentación a SBS, firma ni generación de PDF/Excel en V1. No se usa el endpoint cache-aside que puede sincronizar el tipo de cambio: solo lectura del registro contable exacto USD/PEN activo. PEN usa1 con referencia SBS nula.
