// Consulta compartida por la auditoría de lectura y las regresiones SQL sintéticas.
// SUM se calcula en MariaDB con DECIMAL, sin conversiones monetarias a Number.
const fields = { monto_factura: "importe_bruto", monto_neto: "importe_neto", monto_detraccion: "detraccion_monto", monto_retencion: "retencion_monto" };
export async function inspectHistoricalFactoring(query) {
  const totals = Object.entries(fields).map(([stored, invoice]) => `CAST(f.${stored} AS CHAR) AS ${stored}, CAST(COALESCE(SUM(COALESCE(i.${invoice},0)),0) AS CHAR) AS esperado_${stored}`).join(", ");
  const rows = await query(`SELECT f._idfactoring AS id, f.code, f.estado,
    f.cantidad_facturas AS declaradas, COUNT(i._idfactura) AS vinculadas,
    COUNT(DISTINCT i.codigo_tipo_moneda) AS monedas_facturas,
    SUM(CASE WHEN i.codigo_tipo_moneda <> m.codigo THEN 1 ELSE 0 END) AS monedas_incompatibles,
    ${totals}
    FROM factoring f LEFT JOIN factoring_factura ff ON ff._idfactoring=f._idfactoring
    LEFT JOIN factura i ON i._idfactura=ff._idfactura LEFT JOIN moneda m ON m._idmoneda=f._idmoneda
    GROUP BY f._idfactoring, f.code, f.estado, f.cantidad_facturas, ${Object.keys(fields).map(field => `f.${field}`).join(", ")}
    HAVING f.cantidad_facturas > 1 OR COUNT(i._idfactura) > 1 ORDER BY f._idfactoring`);
  const findings = [];
  for (const row of rows) {
    const differences = Object.keys(fields).filter(field => row[field] !== row[`esperado_${field}`])
      .map(field => ({ campo: field, guardado: row[field], suma_facturas_actuales: row[`esperado_${field}`] }));
    const incomplete = Number(row.declaradas) !== Number(row.vinculadas);
    const currencyMismatch = Number(row.monedas_incompatibles) > 0 || Number(row.monedas_facturas) > 1;
    if (differences.length || incomplete || currencyMismatch) findings.push({ id: Number(row.id), code: row.code, estado: row.estado, declaradas: Number(row.declaradas), vinculadas: Number(row.vinculadas), asociaciones_incompletas: incomplete, monedas_inconsistentes: currencyMismatch, diferencias: differences });
  }
  const [total] = await query("SELECT COUNT(*) AS total FROM factoring");
  return { totalOperations: Number(total.total), checked: rows.length, consistent: rows.length - findings.length, findings };
}
