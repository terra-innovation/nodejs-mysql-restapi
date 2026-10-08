import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { db, cleanFixtures, seedMasters } from "./businessSupport.js";
import { seedSettlement } from "./settlementSupport.js";
import { invoiceWorkspace } from "../vitest/support/invoiceFixture.js";

const boundary = vi.hoisted(() => ({ confirmation: vi.fn(), transfer: vi.fn(), start: vi.fn() }));
vi.mock("#src/config.js", () => ({ env: {}, isProduction: true }));
vi.mock("#src/models/prisma/db-factoring.js", async () => ({ prismaFT: { client: (await import("./businessSupport.js")).db, transactionTimeout: 10000 } }));
vi.mock("#src/utils/logger.pino.js", () => ({ line: () => "integration", log: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock("#src/providers/email/email.Provider.js", () => ({
  sendFactoringEmpresaServicioFactoringDeudorSolicitudConfirmacion: boundary.confirmation,
  sendFactoringEmpresaServicioFactoringDeudorNotificacionTransferencia: boundary.transfer,
  sendFactoringEmpresaServicioFactoringCedenteNotificacionInicioOperacion: boundary.start,
}));
import {
  createFactoringhistorialestadoService as create,
  updateFactoringhistorialestadoService as update,
  deleteFactoringhistorialestadoService as remove,
  activateFactoringhistorialestadoService as activate,
  getFactoringhistorialestadosByFactoringidService as list,
} from "#src/services/admin/factoringhistorialestado.Service.js";

let user: Awaited<ReturnType<typeof seedMasters>>;
let workspace: ReturnType<typeof invoiceWorkspace>;
const unknown = "00000000-0000-0000-0000-000000000000";
const notifications = () => [boundary.confirmation, boundary.transfer, boundary.start];
beforeEach(async () => {
  vi.clearAllMocks(); notifications().forEach(mock => mock.mockResolvedValue(undefined));
  workspace = invoiceWorkspace(); user = await seedMasters();
});
afterEach(async () => {
  await db.$executeRawUnsafe("DROP TRIGGER IF EXISTS it_state_failure");
  try { await cleanFixtures(); } finally { workspace.cleanup(); }
});
afterAll(async () => { await db.$disconnect(); });

async function fixture(currency = "PEN") {
  const f = await seedSettlement(user.idusuario, currency);
  await db.persona_verificacion_estado.create({ data: { idpersonaverificacionestado: 1, code: "IT", nombre: "Prueba", alias: "IT", color: "blue" } });
  const persona = await db.persona.create({ data: { code: "IT-STATE-PERSON", idusuario: user.idusuario, idpersonaverificacionestado: 1, documentonumero: "IT-0001", personanombres: "Sintetico", apellidopaterno: "Prueba", apellidomaterno: "Prueba", email: "cedente@example.test", celular: "000000000" } });
  const cedente = await db.colaborador.create({ data: { code: "IT-STATE-CED", idempresa: f.factoring.idcedente, idpersona: persona.idpersona, nombrecolaborador: "Sintetico", apellidocolaborador: "Prueba", cargo: "Prueba", email: "cedente@example.test", telefono: "000", poderpartidanumero: "IT", poderpartidaciudad: "Prueba" } });
  const aceptante = await db.contacto.create({ data: { code: "IT-STATE-ACE", idempresa: f.factoring.idaceptante, nombrecontacto: "Prueba", email: "aceptante@example.test" } });
  await db.factoring.update({ where: { idfactoring: f.factoring.idfactoring }, data: { idcontactocedente: cedente.idcolaborador, idcontactoaceptante: aceptante.idcontacto } });
  await db.configuracion_app.create({ data: { idconfiguracionapp: 4, code: "IT-CC", variable: "IT-CC", valor: '["control@example.test"]', unidad: "Prueba", fecha_inicio: new Date("2026-01-01") } });
  const states = new Map<number, string>();
  for (const id of [29, 10, 36]) {
    const row = await db.factoring_estado.create({ data: { idfactoringestado: id, code: `IT-${id}`, estado1: "Prueba", estado2: "Prueba" } });
    states.set(id, row.factoringestadoid);
  }
  states.set(4, (await db.factoring_estado.findUniqueOrThrow({ where: { idfactoringestado: 4 } })).factoringestadoid);
  const second = await db.archivo.create({ data: { idarchivotipo: 9, idarchivoestado: 1, codigo: "IT-STATE-2", ruta: "", nombrereal: "segundo.pdf", nombrealmacenamiento: "segundo.pdf", mimetype: "application/pdf", extension: "pdf", encoding: "utf8" } });
  const files = [f.archivo, second];
  for (const file of files) writeFileSync(path.join(workspace.root, file.nombrealmacenamiento), `Adjunto sintetico ${file.codigo}`);
  return { ...f, files, states, dto: (state = 4) => ({ factoringid: f.factoring.factoringid, factoringestadoid: states.get(state)!, comentario: "Cambio sintetico", archivos: files.map(file => file.archivoid) }) };
}
async function snapshot() {
  return {
    factoring: await db.factoring.findMany({ orderBy: { idfactoring: "asc" } }),
    history: await db.factoring_historial_estado.findMany({ orderBy: { idfactoringhistorialestado: "asc" } }),
    links: await db.archivo_factoring_historial_estado.findMany({ orderBy: { idarchivo: "asc" } }),
    files: await db.archivo.findMany({ orderBy: { idarchivo: "asc" } }),
  };
}
function preserved(f: Awaited<ReturnType<typeof fixture>>) {
  for (const file of f.files) expect(readFileSync(path.join(workspace.root, file.nombrealmacenamiento), "utf8")).toBe(`Adjunto sintetico ${file.codigo}`);
}
async function sqlFailure(table: string, event = "INSERT", condition = "TRUE") {
  // Tablas/condiciones constantes de la suite, solo en la base desechable verificada.
  await db.$executeRawUnsafe(`CREATE TRIGGER it_state_failure BEFORE ${event} ON \`${table}\` FOR EACH ROW BEGIN IF ${condition} THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='IT state failure'; END IF; END`);
}

describe("Estados e historial: guardado, lectura y rollback reales", () => {
  for (const currency of ["PEN", "USD"]) it.each([29, 10, 36])(`${currency}, estado %s: guarda historial, adjuntos y notificación coherentes`, async state => {
    const f = await fixture(currency); const before = await snapshot(); const started = Date.now();
    await expect(create(f.dto(state), user.idusuario)).resolves.toEqual({});
    const after = await snapshot(); const op = after.factoring[0]; const history = after.history[0];
    expect(op).toEqual({ ...before.factoring[0], idfactoringestado: state, idusuariomod: user.idusuario, fechamod: op.fechamod, fecha_operacion: state === 36 ? op.fecha_operacion : before.factoring[0].fecha_operacion });
    expect(history).toMatchObject({ idfactoring: f.factoring.idfactoring, idfactoringestado: state, comentario: "Cambio sintetico", idusuariomodifica: user.idusuario, idusuariocrea: user.idusuario, idusuariomod: user.idusuario, estado: 1 });
    expect(after.history).toHaveLength(1); expect(after.links).toHaveLength(2);
    expect(after.links.map(link => link.idarchivo)).toEqual(f.files.map(file => file.idarchivo));
    for (const link of after.links) expect(link).toMatchObject({ idfactoringhistorialestado: history.idfactoringhistorialestado, idusuariocrea: user.idusuario, idusuariomod: user.idusuario, estado: 1 });
    expect(after.files).toEqual(before.files); preserved(f);
    const read = await list({ factoringid: f.factoring.factoringid });
    expect(read).toHaveLength(1); expect(read[0].archivo_factoring_historial_estados).toHaveLength(2);
    expect(read[0].usuario_modifica.idusuario).toBe(user.idusuario);
    const selected = state === 29 ? boundary.confirmation : state === 10 ? boundary.transfer : boundary.start;
    expect(selected).toHaveBeenCalledTimes(1);
    for (const mock of notifications().filter(mock => mock !== selected)) expect(mock).not.toHaveBeenCalled();
    if (state === 36) {
      // La columna Timestamp(0) conserva segundos, no milisegundos.
      expect(op.fecha_operacion!.getTime()).toBeGreaterThanOrEqual(Math.floor(started / 1000) * 1000);
      expect(op.fecha_operacion!.getTime()).toBeLessThanOrEqual(Date.now());
      expect(selected).toHaveBeenCalledWith("cedente@example.test", expect.objectContaining({ factoring: expect.objectContaining({ fecha_operacion: op.fecha_operacion }), usuario: expect.objectContaining({ idusuario: user.idusuario }), factoringpropuesta: expect.objectContaining({ idfactoringpropuesta: f.propuesta.idfactoringpropuesta }) }));
    } else {
      expect(selected).toHaveBeenCalledWith("aceptante@example.test", ["control@example.test", "cedente@example.test"], expect.objectContaining({ factoring: expect.objectContaining({ idfactoringestado: state, idmoneda: currency === "PEN" ? 1 : 2 }) }));
      if (state === 10) expect(selected.mock.calls[0][2]).toMatchObject({ factoringpropuesta: { idfactoringpropuesta: f.propuesta.idfactoringpropuesta }, factorcuentabancaria: { idfactorcuentabancaria: 1, cuenta_bancaria: { idmoneda: currency === "PEN" ? 1 : 2, idbanco: 1 } } });
    }
  });
  it("estado sin acción especial conserva fecha de inicio y no notifica", async () => {
    const f = await fixture(); const before = await snapshot(); await create(f.dto(), user.idusuario);
    expect((await snapshot()).factoring[0].fecha_operacion).toEqual(before.factoring[0].fecha_operacion);
    expect(await db.factoring_historial_estado.count()).toBe(1); notifications().forEach(mock => expect(mock).not.toHaveBeenCalled()); preserved(f);
  });
  it.each(["operación", "estado", "segundo adjunto"])("%s inexistente rechaza sin cambios", async missing => {
    const f = await fixture(); const before = await snapshot(); const dto = f.dto();
    if (missing === "operación") dto.factoringid = unknown;
    if (missing === "estado") dto.factoringestadoid = unknown;
    if (missing === "segundo adjunto") dto.archivos[1] = unknown;
    await expect(create(dto, user.idusuario)).rejects.toMatchObject({ statusCode: 404 });
    expect(await snapshot()).toEqual(before); preserved(f); notifications().forEach(mock => expect(mock).not.toHaveBeenCalled());
  });
  it.each(["historial", "operación", "segundo vínculo", "fecha de inicio"])("fallo SQL en %s revierte toda la creación", async stage => {
    const f = await fixture(); await create(f.dto(), user.idusuario); const before = await snapshot();
    if (stage === "historial") await sqlFailure("factoring_historial_estado");
    if (stage === "operación") await sqlFailure("factoring", "UPDATE");
    if (stage === "segundo vínculo") await sqlFailure("archivo_factoring_historial_estado", "INSERT", `NEW._idarchivo=${f.files[1].idarchivo}`);
    if (stage === "fecha de inicio") await sqlFailure("factoring", "UPDATE", "OLD._idfactoringestado=36");
    await expect(create(f.dto(36), user.idusuario)).rejects.toMatchObject({ statusCode: 500 });
    expect(await snapshot()).toEqual(before); preserved(f); notifications().forEach(mock => expect(mock).not.toHaveBeenCalled());
  });
  it.each([29, 10, 36])("fallo de notificación de estado %s revierte SQL y preserva adjuntos", async state => {
    const f = await fixture(); await create(f.dto(), user.idusuario); const before = await snapshot(); const error = new Error("IT notification failure");
    const selected = state === 29 ? boundary.confirmation : state === 10 ? boundary.transfer : boundary.start;
    selected.mockRejectedValueOnce(error);
    await expect(create(f.dto(state), user.idusuario)).rejects.toBe(error);
    expect(selected).toHaveBeenCalledTimes(1); expect(await snapshot()).toEqual(before); preserved(f);
  });
  it("editar historial cambia comentario/estado y añade adjunto sin cambiar la operación", async () => {
    const f = await fixture(); await create({ ...f.dto(), archivos: [f.files[0].archivoid] }, user.idusuario);
    const before = await snapshot(); const history = before.history[0];
    await update({ factoringhistorialestadoid: history.factoringhistorialestadoid, factoringestadoid: f.states.get(29)!, comentario: "Comentario editado", archivos: [f.files[1].archivoid] }, user.idusuario);
    const after = await snapshot(); expect(after.factoring).toEqual(before.factoring);
    expect(after.history[0]).toEqual({ ...history, idfactoringestado: 29, comentario: "Comentario editado", fechamod: after.history[0].fechamod });
    expect(after.links).toHaveLength(2); expect(after.links[0]).toEqual(before.links[0]); expect(after.files).toEqual(before.files);
    notifications().forEach(mock => expect(mock).not.toHaveBeenCalled()); preserved(f);
  });
  it.each(["historial", "estado", "adjunto"])("edición con %s inexistente conserva registros previos", async missing => {
    const f = await fixture(); await create({ ...f.dto(), archivos: [f.files[0].archivoid] }, user.idusuario); const before = await snapshot();
    await expect(update({ factoringhistorialestadoid: missing === "historial" ? unknown : before.history[0].factoringhistorialestadoid, factoringestadoid: missing === "estado" ? unknown : f.states.get(29)!, comentario: "Editado", archivos: [missing === "adjunto" ? unknown : f.files[1].archivoid] }, user.idusuario)).rejects.toMatchObject({ statusCode: 404 });
    expect(await snapshot()).toEqual(before); preserved(f);
  });
  it("fallo SQL al añadir adjunto en edición revierte comentario y estado del historial", async () => {
    const f = await fixture(); await create({ ...f.dto(), archivos: [f.files[0].archivoid] }, user.idusuario); const before = await snapshot();
    await sqlFailure("archivo_factoring_historial_estado");
    await expect(update({ factoringhistorialestadoid: before.history[0].factoringhistorialestadoid, factoringestadoid: f.states.get(29)!, comentario: "Editado", archivos: [f.files[1].archivoid] }, user.idusuario)).rejects.toMatchObject({ statusCode: 500 });
    expect(await snapshot()).toEqual(before); preserved(f);
  });
  it("eliminar y activar historial conserva operación, fecha, adjuntos y lectura", async () => {
    const f = await fixture(); await create(f.dto(), user.idusuario); const before = await snapshot(); const dto = { factoringhistorialestadoid: before.history[0].factoringhistorialestadoid };
    for (const [service, state] of [[remove, 2], [activate, 1]] as const) {
      await service(dto, user.idusuario); const after = await snapshot();
      expect(after.history[0]).toEqual({ ...before.history[0], estado: state, fechamod: after.history[0].fechamod });
      expect(after.factoring).toEqual(before.factoring); expect(after.links).toEqual(before.links); expect(after.files).toEqual(before.files);
      const read = await list({ factoringid: f.factoring.factoringid }); expect(read).toHaveLength(1); expect(read[0].estado).toBe(state); expect(read[0].archivo_factoring_historial_estados).toHaveLength(2); preserved(f);
    }
  });
  for (const [name, service] of [["eliminar", remove], ["activar", activate]] as const) {
    it(`${name}: fallo SQL conserva todo el historial`, async () => {
      const f = await fixture(); await create(f.dto(), user.idusuario);
      if (name === "activar") await remove({ factoringhistorialestadoid: (await snapshot()).history[0].factoringhistorialestadoid }, user.idusuario);
      const before = await snapshot(); await sqlFailure("factoring_historial_estado", "UPDATE");
      await expect(service({ factoringhistorialestadoid: before.history[0].factoringhistorialestadoid }, user.idusuario)).rejects.toMatchObject({ statusCode: 500 });
      expect(await snapshot()).toEqual(before); preserved(f);
    });
    it(`${name}: historial desconocido devuelve 404`, async () => {
      const f = await fixture(); const before = await snapshot();
      await expect(service({ factoringhistorialestadoid: unknown }, user.idusuario)).rejects.toMatchObject({ statusCode: 404 });
      expect(await snapshot()).toEqual(before); preserved(f);
    });
  }
});
