import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { invoiceBoundary as b, invoiceDto, invoiceWrites, resetInvoiceBoundary, xmlId, pdfId } from "../support/invoiceBoundary.js";
import { invoiceXml } from "../support/invoiceFixture.js";
import { subirFacturaFactorService as upload } from "#src/services/admin/factura.Service.js";
import { ARCHIVO_TIPO } from "#src/daos/archivotipo.Dao.js";

let workspace: ReturnType<typeof resetInvoiceBoundary>;
beforeEach(() => { workspace = resetInvoiceBoundary(); });
afterEach(() => { workspace.cleanup(); });

describe("Registro real de factura a partir de XML y PDF", () => {
  it.each(["PEN", "USD"])("envía al DAO moneda %s y vencimiento del XML sin confundirlos con cantidad o emisión", async (currency) => {
    workspace.write(invoiceXml({ currency }));
    b.moneda.getMonedaByCodigo.mockResolvedValue({ monedaid: `${currency}-ID`, alias: currency, simbolo: currency === "PEN" ? "S/" : "$" });
    await upload(invoiceDto(), 42);
    expect(b.item.insertFacturaitem.mock.calls[0][1]).toMatchObject({ moneda: currency, cantidad: "2" });
    expect(b.factura.insertFactura.mock.calls[0][1]).toMatchObject({
      fecha_emision: new Date("2026-10-01"), fecha_vencimiento: new Date("2026-12-01"),
    });
    expect(b.moneda.getMonedaByCodigo.mock.calls[0][1]).toBe(currency);
  });
  it("exige archivos del tipo correcto y activos, registra todos los detalles y devuelve la moneda", async () => {
    const result = await upload(invoiceDto(), 42);
    expect(b.archivo.getArchivoByArchivoidAndIdarchivotipo).toHaveBeenNthCalledWith(1, expectClient(), xmlId, ARCHIVO_TIPO.FACTURA_XML, [1]);
    expect(b.archivo.getArchivoByArchivoidAndIdarchivotipo).toHaveBeenNthCalledWith(2, expectClient(), pdfId, ARCHIVO_TIPO.FACTURA_PDF, [1]);
    expect(result).toMatchObject({ serie: "F001", importe_bruto: 1180, importe_neto: 1180, monedaid: "PEN-ID", moneda_alias: "PEN", moneda_simbolo: "S/" });
    const persistenceTx = b.factura.insertFactura.mock.calls[0][0];
    expect(b.factura.insertFactura).toHaveBeenCalledWith(persistenceTx, expect.objectContaining({ codigo_archivo: "COD-XML", serie: "F001", numero_comprobante: "123", idusuariocrea: 42, importe_neto: 1180 }));
    for (const write of invoiceWrites().slice(1)) {
      expect(write).toHaveBeenCalled();
      for (const [tx, data] of write.mock.calls) {
        expect(tx).toBe(persistenceTx);
        expect(data).toMatchObject({ factura: { connect: { idfactura: 80 } }, idusuariocrea: 42, idusuariomod: 42, estado: 1 });
      }
    }
    expect(b.termino.insertFacturaterminopago).toHaveBeenCalledTimes(3);
    expect(b.nota.insertFacturanota).toHaveBeenCalledTimes(2);
    expect(b.vinculo.insertArchivoFactura.mock.calls.map(call => call[1].archivo.connect.idarchivo)).toEqual([50, 51]);
    expect(b.transaction).toHaveBeenCalledTimes(1);
    expect(b.moneda.getMonedaByCodigo).toHaveBeenCalledWith(persistenceTx, "PEN");
  });
  it.each([1, 2])("archivo requerido %s inexistente no abre transacción", async (position) => {
    if (position === 2) b.archivo.getArchivoByArchivoidAndIdarchivotipo.mockResolvedValueOnce({ idarchivo: 50 });
    b.archivo.getArchivoByArchivoidAndIdarchivotipo.mockResolvedValueOnce(null);
    await expect(upload(invoiceDto(), 42)).rejects.toMatchObject({ statusCode: 404 });
    expect(b.transaction).not.toHaveBeenCalled();
    expect(b.factura.insertFactura).not.toHaveBeenCalled();
  });
  it.each([["sin Invoice", "<CreditNote/>", 404], ["boleta", invoiceXml({ type: "03" }), 400], ["nota de crédito", invoiceXml({ type: "07" }), 400]] as const)("%s se rechaza antes de persistir", async (_label, xml, statusCode) => {
    workspace.write(xml);
    await expect(upload(invoiceDto(), 42)).rejects.toMatchObject({ statusCode });
    expect(b.transaction).not.toHaveBeenCalled();
  });
  it("XML mal formado no registra cabecera ni detalles", async () => {
    workspace.write("<Invoice><ID>");
    await expect(upload(invoiceDto(), 42)).rejects.toThrow();
    expect(b.transaction).not.toHaveBeenCalled();
  });
  it.each([0, 1, 2, 3, 4, 5, 6])("error de persistencia en etapa %s detiene etapas posteriores y consulta de moneda", async (index) => {
    const error = new Error(`invoice-write-${index}`);
    invoiceWrites()[index].mockRejectedValueOnce(error);
    await expect(upload(invoiceDto(), 42)).rejects.toBe(error);
    for (const write of invoiceWrites().slice(index + 1)) expect(write).not.toHaveBeenCalled();
    expect(b.moneda.getMonedaByCodigo).not.toHaveBeenCalled();
    expect(b.transaction).toHaveBeenCalledTimes(1);
  });
  it("fallo al vincular el segundo archivo se propaga", async () => {
    const error = new Error("pdf link unavailable");
    b.vinculo.insertArchivoFactura.mockResolvedValueOnce({}).mockRejectedValueOnce(error);
    await expect(upload(invoiceDto(), 42)).rejects.toBe(error);
    expect(b.vinculo.insertArchivoFactura).toHaveBeenCalledTimes(2);
    expect(b.moneda.getMonedaByCodigo).not.toHaveBeenCalled();
  });
  it("fallo del enriquecimiento posterior se propaga sin repetir las escrituras", async () => {
    const error = new Error("currency unavailable");
    b.moneda.getMonedaByCodigo.mockRejectedValueOnce(error);
    await expect(upload(invoiceDto(), 42)).rejects.toBe(error);
    expect(b.factura.insertFactura).toHaveBeenCalledOnce();
    expect(b.vinculo.insertArchivoFactura).toHaveBeenCalledTimes(2);
    expect(b.transaction).toHaveBeenCalledTimes(1);
    expect(b.moneda.getMonedaByCodigo.mock.calls[0][0]).toBe(b.factura.insertFactura.mock.calls[0][0]);
  });
});
function expectClient() { return { $transaction: b.transaction }; }
