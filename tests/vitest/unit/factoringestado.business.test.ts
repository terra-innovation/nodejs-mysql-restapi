import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { boundary as b, ids, resetFactoringBoundary } from "../support/factoringBoundary.js";
import { createFactoringhistorialestadoService as create, updateFactoringhistorialestadoService as update, activateFactoringhistorialestadoService as activate, deleteFactoringhistorialestadoService as remove } from "#src/services/admin/factoringhistorialestado.Service.js";

const dto = () => ({ factoringid: ids.factoring, factoringestadoid: ids.estado, comentario: "Estado confirmado", archivos: [ids.concepto] });
const updateDto = () => ({ ...dto(), factoringhistorialestadoid: ids.liquidacion });
const notifications = () => [b.email.sendFactoringEmpresaServicioFactoringDeudorSolicitudConfirmacion, b.email.sendFactoringEmpresaServicioFactoringDeudorNotificacionTransferencia, b.email.sendFactoringEmpresaServicioFactoringCedenteNotificacionInicioOperacion];
beforeEach(() => { resetFactoringBoundary(); vi.useFakeTimers({ toFake: ["Date"] }); vi.setSystemTime(new Date("2026-10-08T15:30:00Z")); });
afterEach(() => { vi.useRealTimers(); });

describe("Cambios de estado e historial: servicio real", () => {
  it("registra el estado de la operación y sus adjuntos con el actor correcto", async () => {
    await expect(create(dto(), 42)).resolves.toEqual({});
    expect(b.historial.insertFactoringhistorialestado).toHaveBeenCalledWith(b.tx, expect.objectContaining({
      factoring: { connect: { idfactoring: 10 } }, factoring_estado: { connect: { idfactoringestado: 4 } },
      comentario: "Estado confirmado", usuario_modifica: { connect: { idusuario: 42 } }, idusuariocrea: 42,
    }));
    expect(b.factoring.updateFactoring).toHaveBeenCalledWith(b.tx, ids.factoring, {
      factoring_estado: { connect: { idfactoringestado: 4 } }, idusuariomod: 42, fechamod: new Date(),
    });
    expect(b.historialArchivo.insertArchivofactoringhistorialestado).toHaveBeenCalledWith(b.tx, expect.objectContaining({
      archivo: { connect: { idarchivo: 50 } }, factoring_historial_estado: { connect: { idfactoringhistorialestado: 400 } }, idusuariocrea: 42,
    }));
    for (const notify of notifications()) expect(notify).not.toHaveBeenCalled();
  });
  it("sin adjuntos solo escribe historial y estado", async () => {
    await create({ ...dto(), archivos: undefined }, 42);
    expect(b.archivo.getArchivoByArchivoid).not.toHaveBeenCalled();
    expect(b.historialArchivo.insertArchivofactoringhistorialestado).not.toHaveBeenCalled();
  });
  it.each([
    ["operación", () => b.factoring.getFactoringByFactoringid],
    ["estado", () => b.estado.getFactoringestadoByFactoringestadoid],
    ["adjunto", () => b.archivo.getArchivoByArchivoid],
  ] as const)("%s inexistente impide toda escritura", async (_name, lookup) => {
    lookup().mockResolvedValue(null);
    await expect(create(dto(), 42)).rejects.toMatchObject({ statusCode: 404 });
    expect(b.historial.insertFactoringhistorialestado).not.toHaveBeenCalled();
    expect(b.factoring.updateFactoring).not.toHaveBeenCalled();
    expect(b.historialArchivo.insertArchivofactoringhistorialestado).not.toHaveBeenCalled();
  });
  it("verifica todos los adjuntos antes de registrar el cambio", async () => {
    b.archivo.getArchivoByArchivoid.mockResolvedValueOnce({ idarchivo: 50 }).mockResolvedValueOnce(null);
    await expect(create({ ...dto(), archivos: [ids.concepto, ids.tipo] }, 42)).rejects.toMatchObject({ statusCode: 404 });
    expect(b.historial.insertFactoringhistorialestado).not.toHaveBeenCalled();
  });
  it.each([0, 1, 2])("fallo de escritura %s impide notificaciones y escrituras posteriores", async (index) => {
    b.estado.getFactoringestadoByFactoringestadoid.mockResolvedValue({ idfactoringestado: 29 });
    const writes = [b.historial.insertFactoringhistorialestado, b.factoring.updateFactoring, b.historialArchivo.insertArchivofactoringhistorialestado];
    const error = new Error(`state-write-${index}`);
    writes[index].mockRejectedValueOnce(error);
    await expect(create(dto(), 42)).rejects.toBe(error);
    for (const write of writes.slice(index + 1)) expect(write).not.toHaveBeenCalled();
    for (const notify of notifications()) expect(notify).not.toHaveBeenCalled();
  });

  it("estado 29 solicita confirmación al deudor y copia al cedente", async () => {
    b.estado.getFactoringestadoByFactoringestadoid.mockResolvedValue({ idfactoringestado: 29 });
    await create(dto(), 42);
    expect(notifications()[0]).toHaveBeenCalledWith("aceptante@example.test", ["control@example.test", "cedente@example.test"], expect.objectContaining({ factoring: expect.objectContaining({ idfactoring: 10 }) }));
    expect(notifications()[1]).not.toHaveBeenCalled();
    expect(notifications()[2]).not.toHaveBeenCalled();
  });
  it("estado 29 sin configuración de copias conserva la copia al cedente", async () => {
    b.estado.getFactoringestadoByFactoringestadoid.mockResolvedValue({ idfactoringestado: 29 });
    b.config.getEmailsCCDeudorSolicitaConfirmacion.mockResolvedValue(null);
    await create(dto(), 42);
    expect(notifications()[0]).toHaveBeenCalledWith("aceptante@example.test", ["cedente@example.test"], expect.any(Object));
  });
  it("estado 10 notifica transferencia usando propuesta aceptada y cuenta en la moneda de la operación", async () => {
    resetFactoringBoundary(2);
    b.estado.getFactoringestadoByFactoringestadoid.mockResolvedValue({ idfactoringestado: 10 });
    await create(dto(), 42);
    expect(b.propuesta.getFactoringpropuestaAceptadaByIdfactoringpropuesta).toHaveBeenCalledWith(b.tx, 100, [1]);
    expect(b.cuentaFactor.getFactorcuentabancariasByIdfactorIdmonedaIdbanco).toHaveBeenCalledWith(b.tx, 1, 2, 1, [1]);
    expect(notifications()[1]).toHaveBeenCalledWith("aceptante@example.test", ["control@example.test", "cedente@example.test"], expect.objectContaining({ factorcuentabancaria: [{ idfactorcuentabancaria: 30 }], factoringpropuesta: expect.any(Object) }));
    expect(notifications()[0]).not.toHaveBeenCalled();
    expect(notifications()[2]).not.toHaveBeenCalled();
  });
  it("estado 36 fija la fecha de inicio y notifica al cedente con su usuario", async () => {
    b.estado.getFactoringestadoByFactoringestadoid.mockResolvedValue({ idfactoringestado: 36 });
    await create(dto(), 42);
    expect(b.factoring.updateFactoring).toHaveBeenCalledTimes(2);
    expect(b.factoring.updateFactoring).toHaveBeenNthCalledWith(2, b.tx, ids.factoring, { fecha_operacion: new Date(), idusuariomod: 42, fechamod: new Date() });
    expect(b.usuario.getUsuarioByIdusuario).toHaveBeenCalledWith(b.tx, 42);
    expect(notifications()[2]).toHaveBeenCalledWith("cedente@example.test", expect.objectContaining({ usuario: { idusuario: 42, email: "cedente@example.test" } }));
    expect(notifications()[0]).not.toHaveBeenCalled();
    expect(notifications()[1]).not.toHaveBeenCalled();
  });
  it("fallo al fijar el inicio no envía la confirmación de inicio", async () => {
    b.estado.getFactoringestadoByFactoringestadoid.mockResolvedValue({ idfactoringestado: 36 });
    const error = new Error("start unavailable");
    b.factoring.updateFactoring.mockResolvedValueOnce({ idfactoring: 10, idfactoringestado: 36 }).mockRejectedValueOnce(error);
    await expect(create(dto(), 42)).rejects.toBe(error);
    expect(notifications()[2]).not.toHaveBeenCalled();
  });
  it.each([29, 10, 36])("fallo del correo del estado %s se propaga al llamador", async (state) => {
    b.estado.getFactoringestadoByFactoringestadoid.mockResolvedValue({ idfactoringestado: state });
    const error = new Error("email unavailable");
    notifications()[[29, 10, 36].indexOf(state)].mockRejectedValueOnce(error);
    await expect(create(dto(), 42)).rejects.toBe(error);
  });
});

describe("Edición y baja lógica de historial", () => {
  it("editar historial cambia comentario/estado y adjuntos sin cambiar el estado de la operación", async () => {
    await update(updateDto(), 42);
    expect(b.historial.updateFactoringhistorialestado).toHaveBeenCalledWith(b.tx, ids.liquidacion, expect.objectContaining({ comentario: "Estado confirmado", idusuariomod: 42 }));
    expect(b.historialArchivo.insertArchivofactoringhistorialestado).toHaveBeenCalledOnce();
    expect(b.factoring.updateFactoring).not.toHaveBeenCalled();
    for (const notify of notifications()) expect(notify).not.toHaveBeenCalled();
  });
  it.each([
    ["historial", () => b.historial.getFactoringhistorialestadoByFactoringhistorialestadoid],
    ["estado", () => b.estado.getFactoringestadoByFactoringestadoid],
    ["archivo", () => b.archivo.getArchivoByArchivoid],
  ] as const)("editar con %s inexistente no escribe", async (_name, lookup) => {
    lookup().mockResolvedValue(null);
    await expect(update(updateDto(), 42)).rejects.toMatchObject({ statusCode: 404 });
    expect(b.historial.updateFactoringhistorialestado).not.toHaveBeenCalled();
    expect(b.historialArchivo.insertArchivofactoringhistorialestado).not.toHaveBeenCalled();
  });
  it("fallo al editar no vincula adjuntos", async () => {
    const error = new Error("history unavailable");
    b.historial.updateFactoringhistorialestado.mockRejectedValueOnce(error);
    await expect(update(updateDto(), 42)).rejects.toBe(error);
    expect(b.historialArchivo.insertArchivofactoringhistorialestado).not.toHaveBeenCalled();
  });
  for (const [name, service, dao] of [["activar", activate, b.historial.activateFactoringhistorialestado], ["eliminar", remove, b.historial.deleteFactoringhistorialestado]] as const) {
    it(`${name} conserva actor y no modifica el estado actual de la operación`, async () => {
      await expect(service({ factoringhistorialestadoid: ids.liquidacion }, 42)).resolves.toEqual([1]);
      expect(dao).toHaveBeenCalledWith(b.tx, ids.liquidacion, 42);
      expect(b.factoring.updateFactoring).not.toHaveBeenCalled();
    });
    it(`${name} historial inexistente devuelve 404`, async () => {
      b.historial.getFactoringhistorialestadoByFactoringhistorialestadoid.mockResolvedValue(null);
      await expect(service({ factoringhistorialestadoid: ids.liquidacion }, 42)).rejects.toMatchObject({ statusCode: 404 });
      expect(dao).not.toHaveBeenCalled();
    });
  }
});
