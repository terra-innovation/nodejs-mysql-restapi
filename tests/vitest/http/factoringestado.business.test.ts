import { beforeEach, describe, expect, it } from "vitest";
import { boundary as b, ids, resetFactoringBoundary } from "../support/factoringBoundary.js";
import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import approvalRoutes from "#src/routes/empresario/servicio/factoring/factoringpropuesta.routes.js";
import stateRoutes from "#src/routes/admin/servicio/factoring/factoringhistorialestado.routes.js";
import { errorHandlerMiddleware } from "#src/middlewares/errorHandlerMiddleware.js";

const app = express();
app.use(express.json());
app.use("/api/v1", approvalRoutes, stateRoutes);
app.use(errorHandlerMiddleware);
const acceptPath = `/api/v1/empresario/servicio/factoring/factoringpropuesta/aceptar/${ids.factoring}`;
const stateBase = "/api/v1/admin/servicio/factoring/factoringhistorialestado";
const stateDto = () => ({ factoringid: ids.factoring, factoringestadoid: ids.estado, comentario: "  Estado confirmado  ", archivos: [ids.concepto] });
const token = (role: number) => jwt.sign({ usuario: { idusuario: 42, usuario_roles: [{ idrol: role }] } }, "vitest-factoring-key", { expiresIn: "1h" });
beforeEach(() => { resetFactoringBoundary(); });

describe("Aprobar propuesta: router, JWT, controller y servicio reales", () => {
  it("el empresario aprueba con su identidad de sesión, ignorando un actor enviado en el cuerpo", async () => {
    const response = await request(app).patch(acceptPath).set("Authorization", `Bearer ${token(3)}`).send({ factoringpropuestaid: ids.propuesta, idusuario: 999, idusuariomod: 999 }).expect(200);
    expect(response.body).toEqual({ error: false, data: {} });
    expect(b.factoring.getFactoringByIdfactoringIdempresario).toHaveBeenCalledWith(b.tx, 10, 42, [1]);
    expect(b.factoring.updateFactoring.mock.calls[0][2].idusuariomod).toBe(42);
  });
  it("sin sesión no consulta datos", async () => {
    await request(app).patch(acceptPath).send({}).expect(403);
    expect(b.transaction).not.toHaveBeenCalled();
  });
  it.each([2, 4, 5, 6])("rol %s no aprueba por el endpoint empresario", async role => {
    await request(app).patch(acceptPath).set("Authorization", `Bearer ${token(role)}`).send({ factoringpropuestaid: ids.propuesta }).expect(403);
    expect(b.transaction).not.toHaveBeenCalled();
  });
  it.each([{}, { factoringpropuestaid: "incorrecto" }, { factoringpropuestaid: null }])("propuesta inválida %j falla antes de consultar", async payload => {
    await request(app).patch(acceptPath).set("Authorization", `Bearer ${token(3)}`).send(payload).expect(400);
    expect(b.transaction).not.toHaveBeenCalled();
  });
  it("operación de path inválida no abre transacción", async () => {
    await request(app).patch(acceptPath.replace(ids.factoring, "incorrecto")).set("Authorization", `Bearer ${token(3)}`).send({ factoringpropuestaid: ids.propuesta }).expect(400);
    expect(b.transaction).not.toHaveBeenCalled();
  });
  it.each(["propietario", "vigencia"] as const)("%s inválida responde 404 sin escrituras", async lookup => {
    if (lookup === "propietario") b.factoring.getFactoringByIdfactoringIdempresario.mockResolvedValue(null);
    else b.propuesta.getFactoringpropuestaVigenteByIdfactoringpropuestaIdfactoring.mockResolvedValue(null);
    const response = await request(app).patch(acceptPath).set("Authorization", `Bearer ${token(3)}`).send({ factoringpropuestaid: ids.propuesta }).expect(404);
    expect(response.body).toEqual({ error: true, message: "Datos no válidos" });
    expect(b.propuestaHistorial.insertFactoringpropuestahistorialestado).not.toHaveBeenCalled();
    expect(b.factoring.updateFactoring).not.toHaveBeenCalled();
  });
  it("fallo de actualización responde 500 y no notifica éxito", async () => {
    b.factoring.updateFactoring.mockRejectedValueOnce(new Error("write unavailable"));
    await request(app).patch(acceptPath).set("Authorization", `Bearer ${token(3)}`).send({ factoringpropuestaid: ids.propuesta }).expect(500);
    expect(b.email.sendFactoringEmpresaServicioFactoringPropuestaAceptada).not.toHaveBeenCalled();
    expect(b.telegram.sendMessageImportant).not.toHaveBeenCalled();
  });
});

describe("Transiciones de estado: permisos, validación y auditoría", () => {
  it("crear desde admin normaliza comentario y conserva actor de sesión", async () => {
    const response = await request(app).post(`${stateBase}/crear`).set("Authorization", `Bearer ${token(2)}`).send({ ...stateDto(), idusuario: 999, idusuariocrea: 999 }).expect(201);
    expect(response.body.data).toEqual({ ...stateDto(), comentario: "Estado confirmado" });
    expect(b.historial.insertFactoringhistorialestado.mock.calls[0][1]).toMatchObject({ comentario: "Estado confirmado", idusuariocrea: 42 });
    expect(b.factoring.updateFactoring.mock.calls[0][2]).toMatchObject({ idusuariomod: 42 });
  });
  it("sin sesión no cambia el estado", async () => {
    await request(app).post(`${stateBase}/crear`).send(stateDto()).expect(403);
    expect(b.transaction).not.toHaveBeenCalled();
  });
  it.each([3, 4, 5, 6])("rol %s no cambia el estado por endpoint admin", async role => {
    await request(app).post(`${stateBase}/crear`).set("Authorization", `Bearer ${token(role)}`).send(stateDto()).expect(403);
    expect(b.transaction).not.toHaveBeenCalled();
  });
  it.each([{ factoringid: "incorrecto" }, { factoringestadoid: "incorrecto" }, { comentario: " " }, { comentario: "a" }, { archivos: ["incorrecto"] }])("entrada inválida %j no persiste", async invalid => {
    await request(app).post(`${stateBase}/crear`).set("Authorization", `Bearer ${token(2)}`).send({ ...stateDto(), ...invalid }).expect(400);
    expect(b.transaction).not.toHaveBeenCalled();
  });
  it("adjunto inexistente responde 404 sin historial parcial", async () => {
    b.archivo.getArchivoByArchivoid.mockResolvedValue(null);
    await request(app).post(`${stateBase}/crear`).set("Authorization", `Bearer ${token(2)}`).send(stateDto()).expect(404);
    expect(b.historial.insertFactoringhistorialestado).not.toHaveBeenCalled();
  });
  it("editar historial responde con el DTO y conserva actor sin cambiar el estado actual", async () => {
    const response = await request(app).patch(`${stateBase}/actualizar/${ids.liquidacion}`).set("Authorization", `Bearer ${token(2)}`).send({ factoringestadoid: ids.estado, comentario: "Comentario editado", idusuariomod: 999 }).expect(200);
    expect(response.body.data).toEqual({ factoringhistorialestadoid: ids.liquidacion, factoringestadoid: ids.estado, comentario: "Comentario editado" });
    expect(b.historial.updateFactoringhistorialestado.mock.calls[0][2].idusuariomod).toBe(42);
    expect(b.factoring.updateFactoring).not.toHaveBeenCalled();
  });
  it("activar historial responde 204 y mantiene el actor", async () => {
    await request(app).patch(`${stateBase}/activar/${ids.liquidacion}`).set("Authorization", `Bearer ${token(2)}`).expect(204);
    expect(b.historial.activateFactoringhistorialestado).toHaveBeenCalledWith(b.tx, ids.liquidacion, 42);
  });
  it("eliminar historial responde 204 y mantiene el actor", async () => {
    await request(app).delete(`${stateBase}/eliminar/${ids.liquidacion}`).set("Authorization", `Bearer ${token(2)}`).expect(204);
    expect(b.historial.deleteFactoringhistorialestado).toHaveBeenCalledWith(b.tx, ids.liquidacion, 42);
  });
  it("fallo de persistencia responde 500 sin correo de confirmación", async () => {
    b.estado.getFactoringestadoByFactoringestadoid.mockResolvedValue({ idfactoringestado: 29 });
    b.historialArchivo.insertArchivofactoringhistorialestado.mockRejectedValueOnce(new Error("attachment unavailable"));
    await request(app).post(`${stateBase}/crear`).set("Authorization", `Bearer ${token(2)}`).send(stateDto()).expect(500);
    expect(b.email.sendFactoringEmpresaServicioFactoringDeudorSolicitudConfirmacion).not.toHaveBeenCalled();
  });
});
