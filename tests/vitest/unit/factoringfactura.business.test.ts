import { beforeEach, describe, expect, it } from "vitest";
import { boundary as b, ids, resetFactoringBoundary } from "../support/factoringBoundary.js";
import { createFactoringfacturafactorService as create, updateFactoringfacturafactorService as update, activateFactoringfacturafactorService as activate, deleteFactoringfacturafactorService as remove } from "#src/services/admin/factoringfacturafactor.Service.js";
import { ARCHIVO_TIPO } from "#src/daos/archivotipo.Dao.js";

const dto = () => ({
  factoringid: ids.factoring, facturaid: ids.propuesta, facturaestadoid: ids.estado, detraccionestadoid: ids.tipo,
  detraccionarchivoid: ids.concepto, fecha_pago_factura: "2026-12-01T05:00:00Z", fecha_pago_detraccion: "2026-11-01T05:00:00Z", idusuario: 42,
});
const updateDto = () => ({ ...dto(), factoringfacturafactorid: ids.liquidacion });
beforeEach(() => { resetFactoringBoundary(); });

describe("Asociación de factura al factoring y estados de pago/detracción", () => {
  it("asocia la factura y la constancia correcta sin alterar fechas UTC", async () => {
    await expect(create(dto())).resolves.toEqual({ idfactoringfacturafactor: 500 });
    expect(b.archivo.getArchivoByArchivoidAndIdarchivotipo).toHaveBeenCalledWith({ $transaction: b.transaction }, ids.concepto, ARCHIVO_TIPO.CONSTANCIA_PAGO_DETRACCION, [1]);
    expect(b.facturaArchivo.insertArchivoFactura).toHaveBeenCalledWith(b.tx, expect.objectContaining({
      factura: { connect: { idfactura: 80 } }, archivo: { connect: { idarchivo: 51 } }, idusuariocrea: 42,
    }));
    expect(b.facturaFactor.insertFactoringfacturafactor).toHaveBeenCalledWith(b.tx, expect.objectContaining({
      factoring: { connect: { idfactoring: 10 } }, factura: { connect: { idfactura: 80 } },
      factura_estado: { connect: { idfacturaestado: 2 } }, detraccion_estado: { connect: { iddetraccionestado: 3 } },
      fecha_pago_factura: new Date("2026-12-01T05:00:00Z"), fecha_pago_detraccion: new Date("2026-11-01T05:00:00Z"), idusuariocrea: 42, idusuariomod: 42,
    }));
    expect(b.facturaArchivo.insertArchivoFactura.mock.invocationCallOrder[0]).toBeLessThan(b.facturaFactor.insertFactoringfacturafactor.mock.invocationCallOrder[0]);
  });
  it("sin constancia ni fechas conserva relaciones y fechas nulas", async () => {
    await create({ ...dto(), detraccionarchivoid: undefined, fecha_pago_factura: null, fecha_pago_detraccion: undefined });
    expect(b.archivo.getArchivoByArchivoidAndIdarchivotipo).not.toHaveBeenCalled();
    expect(b.facturaArchivo.insertArchivoFactura).not.toHaveBeenCalled();
    expect(b.facturaFactor.insertFactoringfacturafactor.mock.calls[0][1]).toMatchObject({ fecha_pago_factura: null, fecha_pago_detraccion: null });
  });
  it.each([
    ["operación", () => b.factoring.getFactoringByFactoringid],
    ["factura", () => b.factura.getFacturaByFacturaid],
    ["estado de factura", () => b.facturaEstado.getFacturaestadoByFacturaestadoid],
    ["estado de detracción", () => b.detraccionEstado.getDetraccionestadoByDetraccionestadoid],
    ["constancia requerida", () => b.archivo.getArchivoByArchivoidAndIdarchivotipo],
  ] as const)("%s inexistente no crea vínculo ni asignación", async (_label, lookup) => {
    lookup().mockResolvedValue(null);
    await expect(create(dto())).rejects.toMatchObject({ statusCode: 404 });
    expect(b.facturaArchivo.insertArchivoFactura).not.toHaveBeenCalled();
    expect(b.facturaFactor.insertFactoringfacturafactor).not.toHaveBeenCalled();
  });
  it("fallo de vínculo de constancia detiene la asignación", async () => {
    const error = new Error("receipt unavailable");
    b.facturaArchivo.insertArchivoFactura.mockRejectedValueOnce(error);
    await expect(create(dto())).rejects.toBe(error);
    expect(b.facturaFactor.insertFactoringfacturafactor).not.toHaveBeenCalled();
  });
  it("fallo de asignación no devuelve éxito tras vincular constancia", async () => {
    const error = new Error("assignment unavailable");
    b.facturaFactor.insertFactoringfacturafactor.mockRejectedValueOnce(error);
    await expect(create(dto())).rejects.toBe(error);
    expect(b.facturaArchivo.insertArchivoFactura).toHaveBeenCalledOnce();
    // El callback simulado no demuestra rollback del vínculo en MariaDB.
  });
  it("actualiza estados y fechas, vinculando la constancia a la factura existente", async () => {
    await update(updateDto());
    expect(b.facturaArchivo.insertArchivoFactura.mock.calls[0][1].factura).toEqual({ connect: { idfactura: 80 } });
    expect(b.facturaFactor.updateFactoringfacturafactor).toHaveBeenCalledWith(b.tx, ids.liquidacion, expect.objectContaining({
      factura_estado: { connect: { idfacturaestado: 2 } }, detraccion_estado: { connect: { iddetraccionestado: 3 } },
      fecha_pago_factura: new Date("2026-12-01T05:00:00Z"), idusuariomod: 42,
    }));
    expect(b.facturaFactor.insertFactoringfacturafactor).not.toHaveBeenCalled();
  });
  it("actualizar sin fechas ni constancia limpia fechas y no crea vínculo", async () => {
    await update({ ...updateDto(), detraccionarchivoid: undefined, fecha_pago_factura: null, fecha_pago_detraccion: null });
    expect(b.facturaFactor.updateFactoringfacturafactor.mock.calls[0][2]).toMatchObject({ fecha_pago_factura: null, fecha_pago_detraccion: null });
    expect(b.facturaArchivo.insertArchivoFactura).not.toHaveBeenCalled();
  });
  it.each([
    ["asignación", () => b.facturaFactor.getFactoringfacturafactorByFactoringfacturafactorid],
    ["estado de factura", () => b.facturaEstado.getFacturaestadoByFacturaestadoid],
    ["estado de detracción", () => b.detraccionEstado.getDetraccionestadoByDetraccionestadoid],
    ["constancia", () => b.archivo.getArchivoByArchivoidAndIdarchivotipo],
  ] as const)("actualización con %s inexistente no escribe", async (_label, lookup) => {
    lookup().mockResolvedValue(null);
    await expect(update(updateDto())).rejects.toMatchObject({ statusCode: 404 });
    expect(b.facturaArchivo.insertArchivoFactura).not.toHaveBeenCalled();
    expect(b.facturaFactor.updateFactoringfacturafactor).not.toHaveBeenCalled();
  });
  it("fallo al vincular constancia de actualización detiene el cambio de estados", async () => {
    const error = new Error("receipt unavailable");
    b.facturaArchivo.insertArchivoFactura.mockRejectedValueOnce(error);
    await expect(update(updateDto())).rejects.toBe(error);
    expect(b.facturaFactor.updateFactoringfacturafactor).not.toHaveBeenCalled();
  });
  it("error al actualizar se propaga", async () => {
    const error = new Error("update unavailable");
    b.facturaFactor.updateFactoringfacturafactor.mockRejectedValueOnce(error);
    await expect(update(updateDto())).rejects.toBe(error);
  });
  for (const [name, service, dao] of [["activar", activate, b.facturaFactor.activateFactoringfacturafactor], ["eliminar", remove, b.facturaFactor.deleteFactoringfacturafactor]] as const) {
    it(`${name} asignación conserva actor`, async () => {
      await expect(service({ factoringfacturafactorid: ids.liquidacion, idusuario: 42 })).resolves.toEqual([1]);
      expect(dao).toHaveBeenCalledWith(b.tx, ids.liquidacion, 42);
    });
    it(`${name} asignación inexistente no escribe`, async () => {
      b.facturaFactor.getFactoringfacturafactorByFactoringfacturafactorid.mockResolvedValue(null);
      await expect(service({ factoringfacturafactorid: ids.liquidacion, idusuario: 42 })).rejects.toMatchObject({ statusCode: 404 });
      expect(dao).not.toHaveBeenCalled();
    });
  }
});
