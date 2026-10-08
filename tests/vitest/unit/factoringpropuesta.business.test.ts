import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { boundary as b, ids, proposalDto, resetFactoringBoundary } from "../support/factoringBoundary.js";
import { activateFactoringpropuestaService, createFactoringpropuestaService, deleteFactoringpropuestaService, simulateFactoringpropuestaService, updateFactoringpropuestaService } from "#src/services/admin/factoringpropuesta.Service.js";

beforeEach(() => {
  resetFactoringBoundary();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-09-01T05:00:00Z"));
});
afterEach(() => { vi.useRealTimers(); });

describe("Propuestas: calcular y registrar con sus importes reales", () => {
  // Capital 16 000; 30 días al 2% = 320; comisión plana 1% = 200 + IGV 36.
  it.each([
    [1, 1, "20", "3.6", "0", "15420.4", 2],
    [1, 2, "20", "3.6", "7.5", "15412.9", 3],
    [2, 1, "6", "1.08", "0", "15436.92", 2],
    [2, 2, "6", "1.08", "2.5", "15434.42", 3],
  ] as const)("moneda %s banco %s: concilia simulación, cabecera y detalles", async (moneda, banco, costo, igv, gasto, adelanto, detalles) => {
    resetFactoringBoundary(moneda, banco);
    const sim = await simulateFactoringpropuestaService(proposalDto());
    expect(b.propuesta.insertFactoringpropuesta).not.toHaveBeenCalled();
    expect(sim.monto_descuento?.toString()).toBe("320");
    expect(sim.monto_garantia?.toString()).toBe("4000");
    expect(sim.monto_adelanto?.toString()).toBe(adelanto);

    const created = await createFactoringpropuestaService(proposalDto(), 42);
    expect(created.monto_adelanto?.toString()).toBe(adelanto);
    const [tx, header] = b.propuesta.insertFactoringpropuesta.mock.calls[0];
    expect(tx).toBe(b.tx);
    expect(header).toMatchObject({ factoring: { connect: { idfactoring: 10 } }, idusuariocrea: 42, idusuariomod: 42, estado: 1, fechacrea: new Date() });
    expect(header.monto_financiado.toString()).toBe("16000");
    expect(header.monto_comision.toString()).toBe("200");
    expect(header.monto_comision_igv.toString()).toBe("36");
    expect(header.monto_costo_estimado.toString()).toBe(costo);
    expect(header.monto_costo_estimado_igv.toString()).toBe(igv);
    expect(header.monto_gasto_excento_igv.toString()).toBe(gasto);
    expect(header.fecha_pago_estimado).toBe(proposalDto().fecha_pago_estimado);
    expect(header.factoringpropuestaid).toMatch(/^[0-9a-f-]{36}$/);
    expect(b.propuestaFinanciero.insertFactoringpropuestafinanciero).toHaveBeenCalledTimes(detalles);
    for (const [detailTx, detail] of b.propuestaFinanciero.insertFactoringpropuestafinanciero.mock.calls) {
      expect(detailTx).toBe(tx);
      expect(detail).toMatchObject({ factoring_propuesta: { connect: { idfactoringpropuesta: 100 } }, idusuariocrea: 42 });
      expect(detail.total.equals(detail.monto.add(detail.igv))).toBe(true);
    }
    expect(b.propuestaHistorial.insertFactoringpropuestahistorialestado).toHaveBeenCalledWith(tx, expect.objectContaining({ factoring_propuesta: { connect: { idfactoringpropuesta: 100 } }, usuario_modifica: { connect: { idusuario: 42 } } }));
    expect(b.transaction).toHaveBeenCalledWith(expect.any(Function), { timeout: 5000 });
    expect(b.email.sendFactoringEmpresaServicioFactoringPropuestaDisponible).not.toHaveBeenCalled();
  });

  const missing = [
    ["operación", () => b.factoring.getFactoringByFactoringid],
    ["tipo", () => b.tipo.getFactoringtipoByFactoringtipoid],
    ["riesgo", () => b.riesgo.getRiesgoByRiesgoid],
    ["estrategia", () => b.estrategia.getFactoringestrategiaByFactoringestrategiaid],
  ] as const;
  it.each(missing)("simulación: %s inexistente responde 404 sin escrituras", async (_label, mock) => {
    mock().mockResolvedValue(null);
    await expect(simulateFactoringpropuestaService(proposalDto())).rejects.toMatchObject({ statusCode: 404 });
    expect(b.propuesta.insertFactoringpropuesta).not.toHaveBeenCalled();
  });
  it.each(missing)("creación: %s inexistente detiene la persistencia", async (_label, mock) => {
    mock().mockResolvedValue(null);
    await expect(createFactoringpropuestaService(proposalDto(), 42)).rejects.toMatchObject({ statusCode: 404 });
    expect(b.propuesta.insertFactoringpropuesta).not.toHaveBeenCalled();
    expect(b.propuestaHistorial.insertFactoringpropuestahistorialestado).not.toHaveBeenCalled();
    expect(b.propuestaFinanciero.insertFactoringpropuestafinanciero).not.toHaveBeenCalled();
  });
  it.each([2, 3])("riesgo cedente/aceptante ausente en consulta %s impide guardar", async (lookup) => {
    for (let index = 1; index < lookup; index++) b.riesgo.getRiesgoByRiesgoid.mockResolvedValueOnce({ idriesgo: 1 });
    b.riesgo.getRiesgoByRiesgoid.mockResolvedValueOnce(null);
    await expect(createFactoringpropuestaService(proposalDto(), 42)).rejects.toMatchObject({ statusCode: 404 });
    expect(b.propuesta.insertFactoringpropuesta).not.toHaveBeenCalled();
  });
  it("estado inexistente impide crear", async () => {
    b.propuestaEstado.getFactoringpropuestaestadoByFactoringpropuestaestadoid.mockResolvedValue(null);
    await expect(createFactoringpropuestaService(proposalDto(), 42)).rejects.toMatchObject({ statusCode: 404 });
    expect(b.propuesta.insertFactoringpropuesta).not.toHaveBeenCalled();
  });

  it.each(["cabecera", "historial", "detalle"] as const)("propaga el error en %s y corta las escrituras siguientes", async (stage) => {
    const error = new Error(`fallo ${stage}`);
    const mock = stage === "cabecera" ? b.propuesta.insertFactoringpropuesta : stage === "historial" ? b.propuestaHistorial.insertFactoringpropuestahistorialestado : b.propuestaFinanciero.insertFactoringpropuestafinanciero;
    mock.mockRejectedValueOnce(error);
    await expect(createFactoringpropuestaService(proposalDto(), 42)).rejects.toBe(error);
    if (stage === "cabecera") expect(b.propuestaHistorial.insertFactoringpropuestahistorialestado).not.toHaveBeenCalled();
    if (stage !== "detalle") expect(b.propuestaFinanciero.insertFactoringpropuestafinanciero).not.toHaveBeenCalled();
    else expect(b.propuestaFinanciero.insertFactoringpropuestafinanciero).toHaveBeenCalledTimes(1);
  });
});

describe("Propuestas: historial, cambios de estado y notificaciones", () => {
  const dto = { factoringpropuestaid: ids.propuesta, factoringpropuestaestadoid: ids.estado };
  it.each(["propuesta", "estado"])("%s inexistente impide el cambio de estado", async (missing) => {
    (missing === "propuesta" ? b.propuesta.getFactoringpropuestaByFactoringpropuestaid : b.propuestaEstado.getFactoringpropuestaestadoByFactoringpropuestaestadoid).mockResolvedValue(null);
    await expect(updateFactoringpropuestaService(dto, 42)).rejects.toMatchObject({ statusCode: 404 });
    expect(b.propuesta.updateFactoringpropuesta).not.toHaveBeenCalled();
    expect(b.propuestaHistorial.insertFactoringpropuestahistorialestado).not.toHaveBeenCalled();
  });
  it("registra actor e historial y no notifica un estado distinto de disponible", async () => {
    await updateFactoringpropuestaService(dto, 42);
    expect(b.propuesta.updateFactoringpropuesta).toHaveBeenCalledWith(b.tx, ids.propuesta, expect.objectContaining({ idusuariomod: 42, factoring_propuesta_estado: { connect: { idfactoringpropuestaestado: 1 } } }));
    expect(b.propuestaHistorial.insertFactoringpropuestahistorialestado).toHaveBeenCalledWith(b.tx, expect.objectContaining({ usuario_modifica: { connect: { idusuario: 42 } } }));
    expect(b.email.sendFactoringEmpresaServicioFactoringPropuestaDisponible).not.toHaveBeenCalled();
  });
  it("estado disponible notifica al contacto obtenido del factoring", async () => {
    b.propuesta.updateFactoringpropuesta.mockResolvedValue({ idfactoringpropuesta: 100, idfactoring: 10, idfactoringpropuestaestado: 4 });
    b.propuesta.getFactoringpropuestaAceptadaByIdfactoringpropuesta.mockResolvedValue({ code: "propuesta-test" });
    await updateFactoringpropuestaService(dto, 42);
    expect(b.email.sendFactoringEmpresaServicioFactoringPropuestaDisponible).toHaveBeenCalledOnce();
    expect(b.email.sendFactoringEmpresaServicioFactoringPropuestaDisponible).toHaveBeenCalledWith("cedente@example.test", expect.objectContaining({ factoringpropuesta: { code: "propuesta-test" } }));
  });
  it("si falla el historial no cambia el estado ni envía correo", async () => {
    const error = new Error("historial no disponible");
    b.propuestaHistorial.insertFactoringpropuestahistorialestado.mockRejectedValueOnce(error);
    await expect(updateFactoringpropuestaService(dto, 42)).rejects.toBe(error);
    expect(b.propuesta.updateFactoringpropuesta).not.toHaveBeenCalled();
    expect(b.email.sendFactoringEmpresaServicioFactoringPropuestaDisponible).not.toHaveBeenCalled();
  });
  it.each([
    ["activar", activateFactoringpropuestaService, () => b.propuesta.activateFactoringpropuesta],
    ["eliminar", deleteFactoringpropuestaService, () => b.propuesta.deleteFactoringpropuesta],
  ] as const)("%s: registro ausente produce 404 y conserva actor", async (_label, service, mock) => {
    mock().mockResolvedValueOnce([0]);
    await expect(service({ factoringpropuestaid: ids.propuesta }, 42)).rejects.toMatchObject({ statusCode: 404 });
    expect(mock()).toHaveBeenCalledWith(b.tx, ids.propuesta, 42);
  });
});
