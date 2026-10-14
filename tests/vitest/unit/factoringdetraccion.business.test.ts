import { beforeEach, describe, expect, it, vi } from "vitest";
import { validarPagoDetraccion } from "#src/domain/factoring/detraccion.Rules.js";
const b = vi.hoisted(() => ({
  tx: { name: "tx" },
  getDetraccion: vi.fn(),
  getDetraccionEstados: vi.fn(),
  getEstadoDetraccionPk: vi.fn(),
  getConstanciaParaVincular: vi.fn(),
  actualizarDetraccion: vi.fn(),
  vincularConstancia: vi.fn(),
  listarDetracciones: vi.fn(),
}));
vi.mock("#src/daos/factoringdetraccion.Dao.js", () => b);
vi.mock("#src/models/prisma/db-factoring.js", () => ({ prismaFT: { client: { $transaction: (fn: (tx: unknown) => unknown) => fn(b.tx) }, transactionTimeout: 5000 } }));
import { actualizarDetraccionService, getDetraccionMasterService, getDetraccionService, listarDetraccionesService } from "#src/services/financiero/factoringdetraccion.Service.js";
const date = "2026-10-13T15:00:00.000Z";
const id = "00000000-0000-4000-8000-000000000001";
const dto = { id, detraccionestadoid: id, fecha_pago_detraccion: date, version: date, idusuario: 42 };
const registro = () => ({ idfactura: 80, factoringfacturafactorid: id, fechamod: new Date(date), fecha_pago_detraccion: new Date(date), detraccion_estado: { code: "DE00001" }, factura: { archivo_facturas: [{ archivo: { idarchivotipo: 12 } }] } });
beforeEach(() => {
  vi.clearAllMocks();
  b.getDetraccionEstados.mockResolvedValue([{ code: "DE00001" }, { code: "DE00002" }]);
  b.getDetraccion.mockResolvedValue(registro());
  b.getEstadoDetraccionPk.mockResolvedValue({ iddetraccionestado: 2, code: "DE00002" });
  b.actualizarDetraccion.mockResolvedValue({ count: 1 });
  b.getConstanciaParaVincular.mockResolvedValue({ idarchivo: 51, idusuariocrea: 42, tamanio: 100, mimetype: "application/pdf", extension: "pdf", archivo_facturas: [] });
});
describe("Reglas de pago de detracción", () => {
  it.each([
    [null, true],
    [new Date(date), false],
  ] as const)("PAGADA exige fecha y constancia: %s/%s", (fecha, constancia) => {
    expect(() => validarPagoDetraccion({ code: "DE00001", fecha: null }, { code: "DE00002", fecha, constancia })).toThrow();
  });
  it("reabre conservando fecha y admite corrección posterior", () => {
    expect(() => validarPagoDetraccion({ code: "DE00002", fecha: new Date(date) }, { code: "DE00001", fecha: new Date(date), constancia: true })).not.toThrow();
    expect(() => validarPagoDetraccion({ code: "DE00001", fecha: new Date(date) }, { code: "DE00001", fecha: null, constancia: true })).not.toThrow();
  });
  it("no limpia fecha al reabrir ni admite NO APLICA", () => {
    expect(() => validarPagoDetraccion({ code: "DE00002", fecha: new Date(date) }, { code: "DE00001", fecha: null, constancia: true })).toThrow();
    expect(() => validarPagoDetraccion({ code: "DE00003", fecha: null }, { code: "DE00001", fecha: null, constancia: false })).toThrow();
  });
});
describe("Servicio restringido de detracciones", () => {
  it("solo escribe detracción y auditoría usando tx; la versión siempre avanza", async () => {
    await actualizarDetraccionService(dto);
    const [tx, resource, version, data] = b.actualizarDetraccion.mock.calls[0];
    expect(tx).toBe(b.tx);
    expect(resource).toBe(id);
    expect(version).toEqual(new Date(date));
    expect(Object.keys(data).sort()).toEqual(["fecha_pago_detraccion", "fechamod", "iddetraccionestado", "idusuariomod"]);
    expect(data.idusuariomod).toBe(42);
    expect(data.fechamod.getTime()).toBeGreaterThan(new Date(date).getTime());
    expect(b.vincularConstancia).not.toHaveBeenCalled();
  });
  it("vincula la nueva constancia a la factura vigente con el mismo tx", async () => {
    await actualizarDetraccionService({ ...dto, detraccionarchivoid: id });
    expect(b.getConstanciaParaVincular).toHaveBeenCalledWith(b.tx, id);
    expect(b.vincularConstancia).toHaveBeenCalledWith(b.tx, 51, 80, 42);
  });
  it.each(["inexistente", "ajeno", "otraFactura", "tamano", "mime", "extension"])("rechaza archivo %s antes de escribir", async (tipo) => {
    const archivo = { idarchivo: 51, idusuariocrea: tipo === "ajeno" ? 7 : 42, tamanio: tipo === "tamano" ? 6 * 1024 * 1024 : 100, mimetype: tipo === "mime" ? "text/plain" : "application/pdf", extension: tipo === "extension" ? "exe" : "pdf", archivo_facturas: tipo === "otraFactura" ? [{ idfactura: 99, estado: 1 }] : [] };
    b.getConstanciaParaVincular.mockResolvedValue(tipo === "inexistente" ? null : archivo);
    await expect(actualizarDetraccionService({ ...dto, detraccionarchivoid: id })).rejects.toHaveProperty("statusCode");
    expect(b.actualizarDetraccion).not.toHaveBeenCalled();
    expect(b.vincularConstancia).not.toHaveBeenCalled();
  });
  it("no paga sin constancia y no escribe si el estado no está permitido", async () => {
    b.getDetraccion.mockResolvedValue({ ...registro(), factura: { archivo_facturas: [] } });
    await expect(actualizarDetraccionService(dto)).rejects.toHaveProperty("statusCode", 400);
    b.getEstadoDetraccionPk.mockResolvedValue(null);
    await expect(actualizarDetraccionService(dto)).rejects.toHaveProperty("statusCode", 400);
    expect(b.actualizarDetraccion).not.toHaveBeenCalled();
  });
  it("versión obsoleta no escribe y conflicto condicional no vincula", async () => {
    await expect(actualizarDetraccionService({ ...dto, version: "2026-10-12T00:00:00.000Z" })).rejects.toHaveProperty("statusCode", 409);
    expect(b.actualizarDetraccion).not.toHaveBeenCalled();
    b.actualizarDetraccion.mockResolvedValue({ count: 0 });
    await expect(actualizarDetraccionService({ ...dto, detraccionarchivoid: id })).rejects.toHaveProperty("statusCode", 409);
    expect(b.vincularConstancia).not.toHaveBeenCalled();
  });
  it("fallo del vínculo se propaga; rollback se prueba en MariaDB", async () => {
    b.vincularConstancia.mockRejectedValueOnce(new Error("fixture failure"));
    await expect(actualizarDetraccionService({ ...dto, detraccionarchivoid: id })).rejects.toThrow("fixture failure");
  });
  it("detalle no expone idfactura/fechamod y sí versión", async () => {
    const detail = await getDetraccionService(id);
    expect(detail).not.toHaveProperty("idfactura");
    expect(detail).not.toHaveProperty("fechamod");
    expect(detail.version).toBe(date);
    b.getDetraccion.mockResolvedValue(null);
    await expect(getDetraccionService(id)).rejects.toHaveProperty("statusCode", 404);
  });
  it("catálogo incompleto falla explícitamente", async () => {
    b.getDetraccionEstados.mockResolvedValue([]);
    await expect(getDetraccionMasterService()).rejects.toHaveProperty("statusCode", 500);
  });
  it("listado conserva página y total y proyecta versión", async () => {
    b.listarDetracciones.mockResolvedValue({ registros: [registro()], total: 11 });
    const result = await listarDetraccionesService({ estado: "PENDIENTE", pagina: 2, tamanio: 10, busqueda: "IT", ordenarPor: "fechaEmision", direccion: "asc" });
    expect(result).toMatchObject({ pagina: 2, tamanio: 10, total: 11, registros: [{ version: date }] });
  });
});
