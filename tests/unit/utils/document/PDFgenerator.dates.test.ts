import { Decimal } from "@prisma/client/runtime/client";
import { mkdirSync, readFileSync } from "fs";
import { join } from "path";
import { Settings } from "luxon";
import PDFDocument from "pdfkit-table";
import PDFGenerator from "#src/utils/document/PDFgenerator.js";

// Se generan archivos reales; el espía conserva el renderizador y permite comprobar sus datos.
const output = join(process.cwd(), "temporal", "simulacion-fechas", "pdf");
const previousZone = Settings.defaultZone;
const boundaries = [
  ["2026-10-30T00:00:00Z", "29/oct/2026", 28],
  ["2026-10-30T04:59:59Z", "29/oct/2026", 28],
  ["2026-10-30T05:00:00Z", "30/oct/2026", 29],
  ["2026-10-30T23:59:59Z", "30/oct/2026", 29],
  ["2027-01-01T00:00:00Z", "31/dic/2026", 91],
  ["2027-01-01T05:00:00Z", "01/ene/2027", 92],
  ["2028-02-29T00:00:00Z", "28/feb/2028", 515],
  ["2028-02-29T05:00:00Z", "29/feb/2028", 516],
  ["2028-03-01T00:00:00Z", "29/feb/2028", 516],
  ["2028-03-01T05:00:00Z", "01/mar/2028", 517],
] as const;

beforeAll(() => mkdirSync(output, { recursive: true }));
afterEach(() => { jest.restoreAllMocks(); Settings.defaultZone = previousZone; Settings.resetCaches(); });

describe.each(["UTC", "America/Lima"])("PDF real de simulación y propuesta; zona del proceso %s", zone => {
  it.each(boundaries)("%s se imprime como %s con %s días", async (instant, label, days) => {
    Settings.defaultZone = zone;
    const table = jest.spyOn(PDFDocument.prototype, "table");
    const data: any = {
      code: "FECHA-PRUEBA", fecha_simulacion: new Date("2026-10-01T15:00:00Z"), fecha_propuesta: new Date("2026-10-01T15:00:00Z"),
      fecha_pago_estimado: new Date(instant), dias_pago_estimado: days,
      razon_social_cedente: "Cedente SAC", ruc_cedente: "20111111111", razon_social_aceptante: "Pagador SAC", ruc_aceptante: "20222222222",
      moneda: { simbolo: "$", codigo: "USD", nombre: "Dólares americanos" }, factoring_tipo: { nombre: "Con recurso" },
      tdm: new Decimal("0.015"), porcentaje_financiado_estimado: new Decimal("0.98"), porcentaje_comision_descuento: new Decimal(0),
      monto_neto: new Decimal("55484.49"), monto_garantia: new Decimal("1109.69"), monto_financiado: new Decimal("54374.80"),
      monto_descuento: new Decimal("789.12"), monto_total_igv: new Decimal("44.36"), monto_adelanto: new Decimal("53286.12"),
      comisiones: [], costos: [], gastos: [], gastos_excento_igv: [],
    };
    const factoring: any = { moneda: data.moneda, empresa_cedente: { razon_social: data.razon_social_cedente, ruc: data.ruc_cedente },
      empresa_aceptante: { razon_social: data.razon_social_aceptante, ruc: data.ruc_aceptante }, factoring_facturas: [{ factura: { serie: "F001", numero_comprobante: "239" } }] };
    const suffix = `${zone.replace("/", "-")}-${instant.replace(/[:]/g, "-")}`;
    const simulationPath = join(output, `simulacion-${suffix}.pdf`);
    const proposalPath = join(output, `propuesta-${suffix}.pdf`);
    await expect(new PDFGenerator(simulationPath).generateFactoringSimulacion(data)).resolves.toBe(simulationPath);
    await expect(new PDFGenerator(proposalPath).generateFactoringPropuesta(factoring, data)).resolves.toBe(proposalPath);
    expect(table).toHaveBeenCalledTimes(2);
    const simulationRows = table.mock.calls[0][0].datas;
    const proposalRows = table.mock.calls[1][0].datas;
    for (const rows of [simulationRows, proposalRows]) {
      expect(rows.find(row => row.concepto === "Fecha de pago (estimada)").descripcion).toBe(label);
      expect(rows.find(row => row.concepto === "Días (estimados)").descripcion).toBe(days);
      expect(rows.find(row => row.concepto === "(-) Valor descuento (1)").descripcion).toBe("$ 789.12");
      expect(rows.find(row => row.concepto === "bold:(=) Valor adelanto").descripcion).toBe("bold:$ 53286.12");
    }
    for (const file of [simulationPath, proposalPath]) {
      const bytes = readFileSync(file);
      expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
      expect(bytes.length).toBeGreaterThan(1000);
    }
  });
});
