import { beforeEach, describe, expect, it, vi } from "vitest";
import { boundary as b, ids, resetFactoringBoundary } from "../support/factoringBoundary.js";
import { acceptFactoringpropuestaService as accept } from "#src/services/empresario/factoringpropuesta.Service.js";

const dto = () => ({ factoringid: ids.factoring, factoringpropuestaid: ids.propuesta, idusuario: 42 });
const writes = () => [b.factoring.claimFactoringApproval, b.propuestaHistorial.insertFactoringpropuestahistorialestado, b.propuesta.approveFactoringpropuestaVigente, b.historial.insertFactoringhistorialestado, b.factoring.updateFactoring];
beforeEach(() => { resetFactoringBoundary(); });

describe("Aprobación real de propuesta por su empresario", () => {
  it("aprueba la propuesta, registra ambos historiales y vincula la propuesta aceptada", async () => {
    const result = await accept(dto());
    expect(result.idfactoringpropuesta).toBe(100);
    expect(b.factoring.getFactoringByIdfactoringIdempresario).toHaveBeenCalledWith(b.tx, 10, 42, [1]);
    expect(b.propuesta.getFactoringpropuestaVigenteByIdfactoringpropuestaIdfactoring).toHaveBeenCalledWith(b.tx, 100, 10, [1]);
    expect(b.propuestaHistorial.insertFactoringpropuestahistorialestado).toHaveBeenCalledWith(b.tx, expect.objectContaining({
      factoring_propuesta: { connect: { idfactoringpropuesta: 100 } },
      factoring_propuesta_estado: { connect: { idfactoringpropuestaestado: 6 } },
      usuario_modifica: { connect: { idusuario: 42 } }, idusuariocrea: 42, estado: 1,
    }));
    expect(b.factoring.claimFactoringApproval).toHaveBeenCalledWith(b.tx, 10, 100);
    expect(b.propuesta.approveFactoringpropuestaVigente).toHaveBeenCalledWith(b.tx, ids.propuesta, 10, 42);
    expect(b.historial.insertFactoringhistorialestado).toHaveBeenCalledWith(b.tx, expect.objectContaining({
      factoring: { connect: { idfactoring: 10 } }, factoring_estado: { connect: { idfactoringestado: 4 } },
      usuario_modifica: { connect: { idusuario: 42 } },
    }));
    expect(b.factoring.updateFactoring).toHaveBeenCalledWith(b.tx, ids.factoring, expect.objectContaining({
      factoring_estado: { connect: { idfactoringestado: 4 } },
      factoring_propuesta_aceptada: { connect: { idfactoringpropuesta: 100 } }, idusuariomod: 42,
    }));
    expect(b.transaction).toHaveBeenCalledTimes(1);
    expect(b.transaction).toHaveBeenCalledWith(expect.any(Function), { timeout: 5000 });
    expect(writes().map(fn => fn.mock.invocationCallOrder[0])).toEqual([...writes().map(fn => fn.mock.invocationCallOrder[0])].sort((a, c) => a - c));
    expect(b.email.sendFactoringEmpresaServicioFactoringPropuestaAceptada).toHaveBeenCalledWith("cedente@example.test", expect.objectContaining({ usuario: { idusuario: 42, email: "cedente@example.test" } }));
    expect(b.telegram.sendMessageImportant).toHaveBeenCalledWith(expect.objectContaining({ title: "Factoring Electrónico: propuesta aceptada" }));
  });

  it.each([
    ["operación inexistente", () => b.factoring.getFactoringByFactoringid],
    ["operación de otro empresario o inactiva", () => b.factoring.getFactoringByIdfactoringIdempresario],
    ["propuesta inexistente", () => b.propuesta.getFactoringpropuestaByFactoringpropuestaid],
    ["propuesta de otra operación, inactiva o no vigente", () => b.propuesta.getFactoringpropuestaVigenteByIdfactoringpropuestaIdfactoring],
  ] as const)("%s devuelve 404 sin escrituras ni notificaciones", async (_label, lookup) => {
    lookup().mockResolvedValue(null);
    await expect(accept(dto())).rejects.toMatchObject({ statusCode: 404 });
    for (const write of writes()) expect(write).not.toHaveBeenCalled();
    expect(b.email.sendFactoringEmpresaServicioFactoringPropuestaAceptada).not.toHaveBeenCalled();
    expect(b.telegram.sendMessageImportant).not.toHaveBeenCalled();
  });

  it.each([0, 1, 2, 3, 4])("error en escritura %s detiene el flujo y propaga el error", async (index) => {
    const error = new Error(`write-${index}`);
    writes()[index].mockRejectedValueOnce(error);
    await expect(accept(dto())).rejects.toBe(error);
    for (const write of writes().slice(index + 1)) expect(write).not.toHaveBeenCalled();
    expect(b.email.sendFactoringEmpresaServicioFactoringPropuestaAceptada).not.toHaveBeenCalled();
    expect(b.telegram.sendMessageImportant).not.toHaveBeenCalled();
  });

  it("reserva perdida devuelve 409 sin historiales ni notificaciones", async () => {
    b.factoring.claimFactoringApproval.mockResolvedValueOnce(false);
    await expect(accept(dto())).rejects.toMatchObject({ statusCode: 409 });
    for (const write of writes().slice(1)) expect(write).not.toHaveBeenCalled();
    expect(b.email.sendFactoringEmpresaServicioFactoringPropuestaAceptada).not.toHaveBeenCalled();
    expect(b.telegram.sendMessageImportant).not.toHaveBeenCalled();
  });

  it("sin email de usuario mantiene la aprobación y emite la notificación interna", async () => {
    b.usuario.getUsuarioByIdusuario.mockResolvedValue(null);
    await accept(dto());
    expect(b.factoring.updateFactoring).toHaveBeenCalledOnce();
    expect(b.email.sendFactoringEmpresaServicioFactoringPropuestaAceptada).not.toHaveBeenCalled();
    expect(b.telegram.sendMessageImportant).toHaveBeenCalledOnce();
  });

  it("fallo del correo se propaga y no dispara Telegram después", async () => {
    const error = new Error("email unavailable");
    b.email.sendFactoringEmpresaServicioFactoringPropuestaAceptada.mockRejectedValueOnce(error);
    await expect(accept(dto())).rejects.toBe(error);
    expect(b.telegram.sendMessageImportant).not.toHaveBeenCalled();
  });

  it("el DAO real restringe la vigencia por propuesta, operación, estado 4 y registro activo", async () => {
    const dao = await vi.importActual<typeof import("#src/daos/factoringpropuesta.Dao.js")>("#src/daos/factoringpropuesta.Dao.js");
    const findFirst = vi.fn().mockResolvedValue(null);
    // Cliente mínimo: se ejecuta el DAO real, sin conexión a una base de datos.
    await dao.getFactoringpropuestaVigenteByIdfactoringpropuestaIdfactoring({ factoring_propuesta: { findFirst } } as never, 100, 10, [1]);
    expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: {
      idfactoring: 10, idfactoringpropuesta: 100, idfactoringpropuestaestado: 4, estado: { in: [1] },
    } }));
  });
  it("el DAO real restringe la operación al empresario mediante la empresa cedente", async () => {
    const dao = await vi.importActual<typeof import("#src/daos/factoring.Dao.js")>("#src/daos/factoring.Dao.js");
    const findFirst = vi.fn().mockResolvedValue(null);
    await dao.getFactoringByIdfactoringIdempresario({ factoring: { findFirst } } as never, 10, 42, [1]);
    expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: {
      idfactoring: 10, estado: { in: [1] },
      empresa_cedente: { usuario_servicio_empresas: { some: { idusuario: 42 } } },
    } }));
  });
});
