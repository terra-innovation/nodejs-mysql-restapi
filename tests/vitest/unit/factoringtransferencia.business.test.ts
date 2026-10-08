import { beforeEach, describe, expect, it } from "vitest";
import { boundary as b, ids, resetFactoringBoundary } from "../support/factoringBoundary.js";
import { activateFactoringtransferenciacedenteService, createFactoringtransferenciacedenteService, deleteFactoringtransferenciacedenteService, updateFactoringtransferenciacedenteService } from "#src/services/admin/factoringtransferenciacedente.Service.js";

beforeEach(() => { resetFactoringBoundary(); });
const dto = () => ({
  factoringid: ids.factoring, factoringtransferenciatipoid: ids.tipo,
  factoringtransferenciaestadoid: ids.estado, factorcuentabancariaid: ids.propuesta,
  empresacuentabancariaid: ids.liquidacion, monedaid: ids.estrategia,
  numero_operacion: "OP-TEST-001", monto: 15420.4, fecha: "2026-09-01T05:00:00Z",
  archivo_constancia_transferencia: ids.concepto,
});

describe("Transferencia al cedente y su constancia", () => {
  it("registra monto, relaciones, actor y archivo en la misma transacción", async () => {
    const result = await createFactoringtransferenciacedenteService(dto(), 42);
    expect(result).toMatchObject({ monto: 15420.4, numero_operacion: "OP-TEST-001", idusuariocrea: 42, idusuariomod: 42, factoring: { connect: { idfactoring: 10 } }, factor_cuenta_bancaria: { connect: { idfactorcuentabancaria: 30 } }, empresa_cuenta_bancaria: { connect: { idempresacuentabancaria: 40 } }, moneda: { connect: { idmoneda: 1 } } });
    expect(b.constancia.insertArchivofactoringtransferenciacedente).toHaveBeenCalledWith(b.tx, expect.objectContaining({ archivo: { connect: { idarchivo: 50 } }, factoring_transferencia_cedente: { connect: { idfactoringtransferenciacedente: 300 } }, idusuariocrea: 42 }));
    expect(b.transferencia.insertFactoringtransferenciacedente).toHaveBeenCalledWith(b.tx, expect.any(Object));
    expect(b.email.sendFactoringEmpresaServicioFactoringCedenteConfirmacionTransferencia).not.toHaveBeenCalled();
  });
  it.each([
    ["operación", () => b.factoring.getFactoringByFactoringid],
    ["tipo", () => b.transferenciaTipo.getFactoringtransferenciatipoByFactoringtransferenciatipoid],
    ["estado", () => b.transferenciaEstado.getFactoringtransferenciaestadoByFactoringtransferenciaestadoid],
    ["cuenta factor", () => b.cuentaFactor.getFactorcuentabancariaByFactorcuentabancariaid],
    ["cuenta cedente", () => b.cuentaEmpresa.getEmpresacuentabancariaByEmpresacuentabancariaid],
    ["moneda", () => b.moneda.getMonedaByMonedaid],
    ["constancia", () => b.archivo.getArchivoByArchivoid],
  ] as const)("sin %s no registra transferencia ni vínculo de archivo", async (_label, mock) => {
    mock().mockResolvedValue(null);
    await expect(createFactoringtransferenciacedenteService(dto(), 42)).rejects.toMatchObject({ statusCode: 404 });
    expect(b.transferencia.insertFactoringtransferenciacedente).not.toHaveBeenCalled();
    expect(b.constancia.insertArchivofactoringtransferenciacedente).not.toHaveBeenCalled();
  });
  it.each(["transferencia", "constancia"])("fallo de escritura en %s se propaga al llamador", async (stage) => {
    const error = new Error(`fallo ${stage}`);
    (stage === "transferencia" ? b.transferencia.insertFactoringtransferenciacedente : b.constancia.insertArchivofactoringtransferenciacedente).mockRejectedValueOnce(error);
    await expect(createFactoringtransferenciacedenteService(dto(), 42)).rejects.toBe(error);
    if (stage === "transferencia") expect(b.constancia.insertArchivofactoringtransferenciacedente).not.toHaveBeenCalled();
  });
  it("actualización cambia el estado sin modificar monto ni cuentas", async () => {
    await updateFactoringtransferenciacedenteService({ factoringtransferenciacedenteid: ids.propuesta, factoringtransferenciaestadoid: ids.estado }, 42);
    const [, , update] = b.transferencia.updateFactoringtransferenciacedente.mock.calls[0];
    expect(update).toMatchObject({ idusuariomod: 42, factoring_transferencia_estado: { connect: { idfactoringtransferenciaestado: 1 } } });
    for (const attribute of ["monto", "moneda", "factor_cuenta_bancaria", "empresa_cuenta_bancaria"]) expect(update).not.toHaveProperty(attribute);
  });
  it.each(["transferencia", "estado"])("actualización con %s inexistente no escribe", async (missing) => {
    (missing === "transferencia" ? b.transferencia.getFactoringtransferenciacedenteByFactoringtransferenciacedenteid : b.transferenciaEstado.getFactoringtransferenciaestadoByFactoringtransferenciaestadoid).mockResolvedValue(null);
    await expect(updateFactoringtransferenciacedenteService({ factoringtransferenciacedenteid: ids.propuesta, factoringtransferenciaestadoid: ids.estado }, 42)).rejects.toMatchObject({ statusCode: 404 });
    expect(b.transferencia.updateFactoringtransferenciacedente).not.toHaveBeenCalled();
  });
  for (const [name, service, mock] of [
    ["activar", activateFactoringtransferenciacedenteService, () => b.transferencia.activateFactoringtransferenciacedente],
    ["eliminar", deleteFactoringtransferenciacedenteService, () => b.transferencia.deleteFactoringtransferenciacedente],
  ] as const) {
    it(`${name}: conserva identidad del registro y actor`, async () => {
      await expect(service({ factoringtransferenciacedenteid: ids.propuesta }, 42)).resolves.toEqual([1]);
      expect(mock()).toHaveBeenCalledWith(b.tx, ids.propuesta, 42);
    });
    it(`${name}: un registro no encontrado produce 404`, async () => {
      mock().mockResolvedValueOnce([0]);
      await expect(service({ factoringtransferenciacedenteid: ids.propuesta }, 42)).rejects.toMatchObject({ statusCode: 404 });
    });
  }
});
