import * as xlsx from "xlsx";
import { DateTime } from "luxon";
import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";

export type ConsolidadoRow = Record<string, string | number | bigint | Prisma.Decimal | null>;
export const consolidadoColumns = [
  {
    header: "codigo_operacion_factoring",
    kind: "text",
  },
  {
    header: "fecha_operacion",
    kind: "date",
  },
  {
    header: "factoring_estado",
    kind: "text",
  },
  {
    header: "registro_estado",
    kind: "text",
  },
  {
    header: "cedente_ruc",
    kind: "text",
  },
  {
    header: "cedente_razon_social",
    kind: "text",
  },
  {
    header: "pagador_ruc",
    kind: "text",
  },
  {
    header: "pagador_razon_social",
    kind: "text",
  },
  {
    header: "Propuesta aceptada >",
    kind: "text",
  },
  {
    header: "cedente_factura_serie",
    kind: "text",
  },
  {
    header: "cedente_factura_numero",
    kind: "text",
  },
  {
    header: "valor_neto",
    kind: "number",
  },
  {
    header: "moneda",
    kind: "text",
  },
  {
    header: "fecha_pago_estimado",
    kind: "date",
  },
  {
    header: "dias_pago_estimado",
    kind: "integer",
  },
  {
    header: "tasa_mensual",
    kind: "number",
  },
  {
    header: "porcentaje_financiado",
    kind: "number",
  },
  {
    header: "factoring_tipo",
    kind: "text",
  },
  {
    header: "valor_garantia",
    kind: "number",
  },
  {
    header: "(+) Valor financiado",
    kind: "number",
  },
  {
    header: "(-) Valor descuento",
    kind: "number",
  },
  {
    header: "(-) Comisión FT",
    kind: "number",
  },
  {
    header: "(-) CAVALI",
    kind: "number",
  },
  {
    header: "(-) IGV",
    kind: "number",
  },
  {
    header: "(-) Interbancario",
    kind: "number",
  },
  {
    header: "(=) Valor adelanto",
    kind: "number",
  },
  {
    header: "Liquidación >",
    kind: "text",
  },
  {
    header: "fecha_efectiva_de_cobro",
    kind: "date",
  },
  {
    header: "dias_pago_efectivo",
    kind: "integer",
  },
  {
    header: "valor_neto",
    kind: "number",
  },
  {
    header: "valor_financiado",
    kind: "number",
  },
  {
    header: "valor_garantia",
    kind: "number",
  },
  {
    header: "valor_descuento_propuesta",
    kind: "number",
  },
  {
    header: "valor_descuento_real",
    kind: "number",
  },
  {
    header: "Detalle Liquidación >",
    kind: "text",
  },
  {
    header: "(+) Valor garantía",
    kind: "number",
  },
  {
    header: "(+) Reintegro de descuento por pago anticipado",
    kind: "number",
  },
  {
    header: "(-) Costo interbancario",
    kind: "number",
  },
  {
    header: "(=) TOTAL A FAVOR DEL CEDENTE",
    kind: "number",
  },
  {
    header: "liquidacion_estado",
    kind: "text",
  },
  {
    header: "Factura de FT al Cedente >",
    kind: "text",
  },
  {
    header: "serie",
    kind: "text",
  },
  {
    header: "numero_comprobante",
    kind: "text",
  },
  {
    header: "codigo_tipo_moneda",
    kind: "text",
  },
  {
    header: "importe_bruto",
    kind: "number",
  },
  {
    header: "importe_neto",
    kind: "number",
  },
  {
    header: "detraccion_monto_PEN",
    kind: "number",
  },
  {
    header: "factura_estado",
    kind: "text",
  },
  {
    header: "detraccion_estado",
    kind: "text",
  },
  {
    header: "fecha_pago_factura",
    kind: "date",
  },
  {
    header: "fecha_pago_detraccion",
    kind: "date",
  },
] as const;

export function createFactoringConsolidadoXlsx(rows: ConsolidadoRow[], now = new Date()) {
  const sheet = xlsx.utils.aoa_to_sheet([
    consolidadoColumns.map((column) => column.header),
    ...rows.map((row) =>
      consolidadoColumns.map((column, index) => {
        const value = row[`c${index}`];
        if (value === null || value === undefined) return null;
        if (column.kind === "date") {
          // Fecha civil de Lima sin zona: serial Excel, independiente de la TZ del proceso.
          const day = DateTime.fromISO(String(value), { zone: "UTC" });
          if (!day.isValid) throw new Error("Fecha inválida en el consolidado de factoring");
          return { t: "n", v: day.diff(DateTime.utc(1899, 12, 30), "days").days, z: "dd/mm/yyyy" };
        }
        if (column.kind === "number" || column.kind === "integer") {
          const number = Number(value);
          if (!Number.isFinite(number)) throw new Error("Importe inválido en el consolidado de factoring");
          return { t: "n", v: number, z: column.kind === "integer" ? "0" : "#,##0.00########" };
        }
        // Texto explícito: conserva RUC/ceros iniciales y no interpreta fórmulas.
        return { t: "s", v: String(value) };
      }),
    ),
  ]);
  sheet["!cols"] = consolidadoColumns.map((column) => ({
    wch: column.header.includes("razon_social") ? 42 : Math.min(38, Math.max(18, column.header.length + 2)),
  }));
  sheet["!autofilter"] = { ref: sheet["!ref"]! };
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, sheet, "Hoja1");
  const stamp = DateTime.fromJSDate(now, { zone: "America/Lima" }).toFormat("yyyyMMdd_HHmm");
  return {
    file: xlsx.write(workbook, { type: "buffer", bookType: "xlsx", compression: true }) as Buffer,
    nameFile: `Consolidado de Operaciones de Factoring (${stamp}).xlsx`,
  };
}
