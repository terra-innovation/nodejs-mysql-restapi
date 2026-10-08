import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "../support/factoringBoundary.js";
import { invoiceWorkspace, invoiceXml, paymentTerm } from "../support/invoiceFixture.js";
import * as utils from "#src/utils/facturaUtils.js";

let workspace: ReturnType<typeof invoiceWorkspace>;
beforeEach(() => { workspace = invoiceWorkspace(); vi.useFakeTimers({ toFake: ["Date"] }); vi.setSystemTime(new Date("2026-10-08T15:30:00Z")); });
afterEach(() => { vi.useRealTimers(); workspace.cleanup(); });
async function read(xml = invoiceXml(), encoding: BufferEncoding = "utf8") {
  return utils.procesarFacturaXML(workspace.write(xml, encoding));
}
async function build(xml = invoiceXml()) { return utils.buildFacturaJson(await read(xml), "XML-SINTETICO", 42); }

describe("Factura XML: archivo y parser reales", () => {
  it("extrae identidad, fechas, tributos, cuotas y neto sin duplicar cabecera de crédito y cuotas", async () => {
    const factura = await build();
    expect(factura).toMatchObject({
      serie: "F001", numero_comprobante: "123", fecha_emision: "2026-10-01", fecha_vencimiento: "2026-12-01", hora_emision: "10:30:00",
      codigo_tipo_documento: "01", codigo_tipo_moneda: "PEN", UBLVersionID: "2.1", CustomizationID: "2.0",
      proveedor: { ruc: "20100000001", razon_social: "PROVEEDOR ÁRBOL & ASOCIADOS" }, cliente: { ruc: "20600000002" },
      importe_bruto: 1180, importe_neto: 1180, pago_cantidad_cuotas: 2, fecha_pago_mayor_estimado: "2026-12-01",
      dias_desde_emision: 7, dias_estimados_para_pago: 54, codigo_archivo: "XML-SINTETICO",
      items: [{ cantidad: "2", moneda: "PEN", impuesto_monto: "180.00", valor_unitario: "500.00" }],
      impuesto: { monto: "180.00", impuestos: [{ codigo_sunat: "1000", porcentaje: "18" }] },
      notas: [{ id: "1000", descripcion: "Mil ciento ochenta" }, { id: null, descripcion: "Nota simple" }],
    });
    expect(factura.facturaid).toMatch(/^[a-f0-9-]{36}$/);
  });
  it.each(["cbc/cac", "n1/n2", "sin prefijo"])("admite los prefijos actuales: %s", async (prefix) => {
    let xml = invoiceXml();
    if (prefix === "n1/n2") xml = xml.replace(/cbc/g, "n1").replace(/cac/g, "n2");
    if (prefix === "sin prefijo") xml = xml.replace(/cbc:|cac:/g, "");
    expect(utils.getInvoiceTypeCode(await read(xml))).toBe("01");
    expect((await build(xml)).importe_neto).toBe(1180);
  });
  it.each([["UTF-8", "utf8"], ["ISO-8859-1", "latin1"]] as const)("respeta la codificación %s y los acentos", async (encoding, bufferEncoding) => {
    const factura = utils.buildFacturaJson(await read(invoiceXml({ encoding }), bufferEncoding), "COD", 42);
    expect(factura.proveedor.razon_social).toBe("PROVEEDOR ÁRBOL & ASOCIADOS");
  });
  it("codificación desconocida usa el fallback UTF-8", async () => {
    const factura = await build(invoiceXml({ encoding: "unknown-encoding" }));
    expect(factura.proveedor.razon_social).toContain("ÁRBOL");
  });
  it("un XML sin Invoice no representa una factura", async () => { expect(await read("<CreditNote/>")).toBeNull(); });
  it("XML mal formado propaga un error del parser", async () => { await expect(read("<Invoice><ID>F001")).rejects.toThrow(); });
  it.each(["03", "07", "08"])("tipo de documento %s no se convierte en factura", async (type) => {
    const parsed = await read(invoiceXml({ type }));
    expect(utils.getInvoiceTypeCode(parsed)).toBe(type);
    expect(() => utils.buildFacturaJson(parsed, "COD", 42)).toThrow("El archivo no es una factura");
  });
  it("campos opcionales ausentes conservan arrays vacíos, hora por defecto y vencimiento nulo", async () => {
    const xml = invoiceXml({ terms: "" }).replace(/<cbc:IssueTime>.*?<\/cbc:IssueTime>|<cbc:DueDate>.*?<\/cbc:DueDate>|<cbc:Note[\s\S]*?<\/cbc:Note>|<cac:PaymentMeans>[\s\S]*?<\/cac:PaymentMeans>/g, "");
    const factura = await build(xml);
    expect(factura).toMatchObject({ hora_emision: "00:00:00", fecha_vencimiento: null, notas: [], medios_pago: [], terminos_pago: [], pago_cantidad_cuotas: 0, fecha_pago_mayor_estimado: null, importe_neto: 1180 });
    expect(utils.getFacturaToCreate(factura, 42).fecha_vencimiento).toBeNull();
  });
  it("cuotas desordenadas mantienen la mayor fecha, sin elegir la fecha de un término ajeno", async () => {
    const factura = await build(invoiceXml({ terms: paymentTerm("FormaPago", "Cuota002", "700", "2026-12-01") + paymentTerm("FormaPago", "Cuota001", "480", "2026-11-01") + paymentTerm("Otro", "Otro", "10", "2027-01-01") }));
    expect(factura.importe_neto).toBe(1180);
    expect(factura.fecha_pago_mayor_estimado).toBe("2026-12-01");
    expect(factura.pago_cantidad_cuotas).toBe(2);
  });
  it("fecha inválida de cuota detiene la conversión", async () => {
    await expect(build(invoiceXml({ terms: paymentTerm("FormaPago", "Cuota001", "1180", "incorrecta") }))).rejects.toThrow("no es válida");
  });
  it("genera relaciones de factura y autor para notas, términos, medios, impuestos e ítems", async () => {
    const factura = await build();
    for (const builder of [utils.getNotasToCreate, utils.getTerminosdepagoToCreate, utils.getMediosdepagoToCreate, utils.getImpuestosToCreate, utils.getItemsToCreate]) {
      const rows = builder(factura, 80, 42);
      expect(rows.length).toBeGreaterThan(0);
      for (const row of rows) expect(row).toMatchObject({ factura: { connect: { idfactura: 80 } }, idusuariocrea: 42, idusuariomod: 42, estado: 1 });
    }
    expect(utils.getFacturaToCreate(factura, 42)).toMatchObject({
      serie: "F001",
      importe_neto: 1180,
      usuario_upload: { connect: { idusuario: 42 } },
      fecha_emision: new Date("2026-10-01"),
      fecha_vencimiento: new Date("2026-12-01"),
    });
  });
  it.each(["PEN", "USD"])("DT-XML-02: conserva %s en los ítems destinados a persistencia, independientemente de la cantidad", async (currency) => {
    const factura = await build(invoiceXml({ currency }));
    const items = utils.getItemsToCreate(factura, 80, 42);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ moneda: currency, cantidad: "2", factura: { connect: { idfactura: 80 } } });
  });
});

describe("Neto XML: prioridades y moneda con expectativas independientes", () => {
  it("cabecera de crédito positiva tiene prioridad frente a cuotas y descuentos", async () => {
    const factura = await build(invoiceXml({ terms: paymentTerm("FormaPago", "Credito", "1000.125") + paymentTerm("FormaPago", "Cuota001", "500") + paymentTerm("Detraccion", "Detraccion", "100") }));
    expect(factura.importe_neto).toBe(1000.13);
  });
  it("crédito cero/inválido se omite y las cuotas positivas por ID se suman", async () => {
    const factura = await build(invoiceXml({ terms: paymentTerm("Credito", "Credito", "0") + paymentTerm("Cuota001", "Otra", "700") + paymentTerm("Cuota002", "Otra", "480") + paymentTerm("Cuota003", "Otra", "-5") }));
    expect(factura.importe_neto).toBe(1180);
  });
  const retention = '<cac:AllowanceCharge><cbc:AllowanceChargeReasonCode>62</cbc:AllowanceChargeReasonCode><cbc:Amount currencyID="PEN">35.40</cbc:Amount><cbc:MultiplierFactorNumeric>0.03</cbc:MultiplierFactorNumeric><cbc:BaseAmount currencyID="PEN">1180</cbc:BaseAmount></cac:AllowanceCharge>';
  it("PEN descuenta detracción y retención cuando no hay crédito ni cuotas", async () => {
    const factura = await build(invoiceXml({ terms: paymentTerm(" DetRaccion ", "Otro", "100") + paymentTerm("Otro", "detraccion", "18"), extra: retention }));
    expect(factura).toMatchObject({ detraccion_cantidad: 2, detraccion_monto: 118, retencion_monto: 35.4, retencion_porcentaje: 0.03, retencion_base_imponible: 1180, importe_neto: 1026.6 });
  });
  it.each(["10", "0.10"])("USD convierte detracción por porcentaje %s antes que tipo de cambio", async (percentage) => {
    const factura = await build(invoiceXml({ currency: "USD", terms: paymentTerm("Detraccion", "Otro", "400", undefined, percentage), extra: '<cac:PaymentExchangeRate><cbc:CalculationRate>4</cbc:CalculationRate></cac:PaymentExchangeRate>' }));
    expect(factura.importe_neto).toBe(1062); // 1180 - 118; no resta 400 PEN.
  });
  it("USD sin porcentaje usa tipo de cambio para convertir la detracción en PEN", async () => {
    const factura = await build(invoiceXml({ currency: "USD", terms: paymentTerm("Detraccion", "Otro", "400"), extra: '<cac:PaymentExchangeRate><cbc:CalculationRate>4</cbc:CalculationRate></cac:PaymentExchangeRate>' }));
    expect(factura.importe_neto).toBe(1080);
  });
  it.each(["", '<cac:PaymentExchangeRate><cbc:CalculationRate>0</cbc:CalculationRate></cac:PaymentExchangeRate>'])("USD sin conversión válida no resta PEN directamente", async (extra) => {
    expect((await build(invoiceXml({ currency: "USD", terms: paymentTerm("Detraccion", "Otro", "400"), extra }))).importe_neto).toBe(1180);
  });
});
