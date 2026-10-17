import { randomUUID } from "node:crypto";
import { afterAll, afterEach, beforeEach, expect, it, vi } from "vitest";
import { db, seedMasters, seedAuthorization, cleanFixtures } from "./businessSupport.js";
import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import { seedSettlement } from "./settlementSupport.js";
vi.mock("#src/config.js", () => ({ env: { TOKEN_KEY_JWT: "pagos-integration-only" }, isProduction: true }));
vi.mock("#src/utils/logger.pino.js", () => ({ line: () => "integration", log: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock("#src/models/prisma/db-factoring.js", async () => ({ prismaFT: { client: (await import("./businessSupport.js")).db, transactionTimeout: 10000 } }));
import * as payments from "#src/services/admin/factoringpago.Service.js";
import { mutarMovimiento } from "#src/services/banca/transaccionbancaria.Service.js";
import { identidad } from "#src/domain/banca/transaccionBancaria.Policy.js";
import * as pagoDao from "#src/daos/factoringpago.Dao.js";
import * as bankDao from "#src/daos/transaccionbancaria.Dao.js";
import pagoRouter from "#src/routes/admin/servicio/factoring/factoringpago.routes.js";
import { errorHandlerMiddleware } from "#src/middlewares/errorHandlerMiddleware.js";
const app = express();
app.use(express.json());
app.use("/api/v1", pagoRouter);
app.use(errorHandlerMiddleware);
let user: Awaited<ReturnType<typeof seedMasters>>;
beforeEach(async () => {
  user = await seedMasters();
});
afterEach(async () => {
  vi.restoreAllMocks();
  await db.$executeRawUnsafe("DROP TRIGGER IF EXISTS it_pago_failure");
  await cleanFixtures();
});
afterAll(async () => {
  await db.$disconnect();
});
async function arrange(monto = "15000") {
  const f = await seedSettlement(user.idusuario);
  const m = await db.$transaction((tx) => payments.asegurarMaestroPago(tx, f.factoring.idfactoring, user.idusuario));
  const b = await db.factor_transaccion_bancaria.create({ data: { idfactorcuentabancaria: 1, code: randomUUID().slice(0, 20), numero_operacion: "000001", descripcion: "Cobro sintético", fecha: new Date("2026-10-16"), signo: 1, monto, origen_alta: "MANUAL", ...identidad(1, "2026-10-16", "000001", 1, monto), idusuariocrea: user.idusuario, idusuariomod: user.idusuario } });
  return { ...f, master: m, bank: b };
}
async function second(f: Awaited<ReturnType<typeof arrange>>) {
  const { idfactoring: _pk, factoringid: _uuid, code: _code, ...data } = await db.factoring.findUniqueOrThrow({ where: { idfactoring: f.factoring.idfactoring } });
  const op = await db.factoring.create({ data: { ...data, code: randomUUID(), idfactoringpropuestaaceptada: null } });
  const p = await db.factoring_propuesta.create({ data: { code: randomUUID(), idfactoring: op.idfactoring, idfactoringpropuestaestado: 4, fecha_propuesta: new Date(), fecha_pago_estimado: new Date(), dias_pago_estimado: 1, dias_antiguedad_estimado: 0, monto_neto: 5000 } });
  await db.factoring.update({ where: { idfactoring: op.idfactoring }, data: { idfactoringpropuestaaceptada: p.idfactoringpropuesta } });
  await db.$transaction((tx) => payments.asegurarMaestroPago(tx, op.idfactoring, user.idusuario));
  return op;
}
const create = (id: string, bank: string, monto: string, version = 1) => payments.guardarDetallePago(id, { accion: "crear", transaccion: bank, monto, version, motivo: "" }, user.idusuario);
it("un abono compartido cubre dos operaciones y no duplica el movimiento", async () => {
  const f = await arrange(),
    other = await second(f);
  expect((await create(f.factoring.factoringid, f.bank.factortransaccionbancariaid, "10000")).monto_total_pagado).toBe("10000.00");
  expect((await create(other.factoringid, f.bank.factortransaccionbancariaid, "5000")).monto_total_pagado).toBe("5000.00");
  expect(await db.factor_transaccion_bancaria.count()).toBe(1);
  await expect(create(f.factoring.factoringid, f.bank.factortransaccionbancariaid, "1", 2)).rejects.toThrow();
});
it("dos asignaciones concurrentes no exceden el disponible global", async () => {
  const f = await arrange("100"),
    other = await second(f);
  const result = await Promise.allSettled([create(f.factoring.factoringid, f.bank.factortransaccionbancariaid, "70"), create(other.factoringid, f.bank.factortransaccionbancariaid, "70")]);
  expect(result.filter((r) => r.status === "fulfilled")).toHaveLength(1);
  expect((await db.factoring_pago_detalle.aggregate({ _sum: { monto_aplicado: true } }))._sum.monto_aplicado!.toFixed(2)).toBe("70.00");
});
it("relee el importe bancario actual después de esperar un lock de corrección", async () => {
  const f = await arrange("100");
  let release!: () => void, locked!: () => void, read!: () => void;
  const releasePromise = new Promise<void>((r) => {
      release = r;
    }),
    lockedPromise = new Promise<void>((r) => {
      locked = r;
    }),
    readPromise = new Promise<void>((r) => {
      read = r;
    });
  const original = pagoDao.lockMovement;
  const writer = db.$transaction(
    async (tx) => {
      await pagoDao.lockMovement(tx, f.bank.idfactortransaccionbancaria);
      await tx.factor_transaccion_bancaria.update({ where: { idfactortransaccionbancaria: f.bank.idfactortransaccionbancaria }, data: { monto: "50", version: { increment: 1 } } });
      locked();
      await releasePromise;
    },
    { timeout: 10000 },
  );
  await lockedPromise;
  vi.spyOn(pagoDao, "lockMovement").mockImplementation(async (...args) => {
    read();
    await original(...args);
  });
  const payment = create(f.factoring.factoringid, f.bank.factortransaccionbancariaid, "75");
  await readPromise;
  release();
  await writer;
  await expect(payment).rejects.toMatchObject({ statusCode: 422 });
  expect(await db.factoring_pago_detalle.count()).toBe(0);
});
it("no anula un movimiento si un pago se confirma mientras espera el lock", async () => {
  const f = await arrange("100");
  let release!: () => void, locked!: () => void, read!: () => void;
  const releasePromise = new Promise<void>((r) => {
      release = r;
    }),
    lockedPromise = new Promise<void>((r) => {
      locked = r;
    }),
    readPromise = new Promise<void>((r) => {
      read = r;
    });
  const original = bankDao.lockMovement;
  const writer = db.$transaction(
    async (tx) => {
      await pagoDao.lockMovement(tx, f.bank.idfactortransaccionbancaria);
      await tx.factoring_pago_detalle.create({ data: { code: "IT-RACE", idfactoringpago: f.master.idfactoringpago, idfactortransaccionbancaria: f.bank.idfactortransaccionbancaria, monto_aplicado: "50", idusuariocrea: user.idusuario, idusuariomod: user.idusuario } });
      locked();
      await releasePromise;
    },
    { timeout: 10000 },
  );
  await lockedPromise;
  vi.spyOn(bankDao, "lockMovement").mockImplementation(async (...args) => {
    read();
    await original(...args);
  });
  const mutation = mutarMovimiento(f.bank.factortransaccionbancariaid, { accion: "anular", version: 1, motivo: "Prueba concurrente" }, user.idusuario);
  await readPromise;
  release();
  await writer;
  await expect(mutation).rejects.toMatchObject({ statusCode: 409 });
  expect((await db.factor_transaccion_bancaria.findFirstOrThrow()).estado).toBe(1);
});
it("inicio idempotente conserva un solo maestro y no reinicia sus pagos", async () => {
  const f = await arrange();
  await create(f.factoring.factoringid, f.bank.factortransaccionbancariaid, "10");
  const ms = await Promise.all([1, 2].map(() => db.$transaction((tx) => payments.asegurarMaestroPago(tx, f.factoring.idfactoring, user.idusuario))));
  expect(ms.map((m) => m.factoringpagoid)).toEqual([f.master.factoringpagoid, f.master.factoringpagoid]);
  expect(await db.factoring_pago.count()).toBe(1);
  expect((await payments.consultarPago(f.factoring.factoringid)).monto_total_pagado).toBe("10.00");
});
it.each(["19999.98", "20000.03"])("el cierre manual permite céntimos pendientes o en exceso: %s", async (monto) => {
  const f = await arrange("30000");
  const r = await create(f.factoring.factoringid, f.bank.factortransaccionbancariaid, monto);
  const s = r.estados.find((s) => s.code === "CANCELADO")!;
  const closed = await payments.cambiarEstadoPago(f.factoring.factoringid, s.uuid, r.maestro!.version, "Cierre confirmado", user.idusuario);
  expect(closed.maestro!.estado).toBe("CANCELADO");
  expect(closed.diferencia_pago).toBe(monto === "19999.98" ? "0.02" : "-0.03");
});
it("corregir, eliminar y reactivar recalcula sin cambiar el estado manual", async () => {
  const f = await arrange(),
    id = f.factoring.factoringid;
  let r = await create(id, f.bank.factortransaccionbancariaid, "100");
  r = await payments.guardarDetallePago(id, { accion: "editar", detalle: r.detalles[0].uuid, monto: "150", version: r.maestro!.version, detalleVersion: r.detalles[0].version, motivo: "Corrección" }, user.idusuario);
  expect(r.monto_total_pagado).toBe("150.00");
  r = await payments.guardarDetallePago(id, { accion: "anular", detalle: r.detalles[0].uuid, version: r.maestro!.version, detalleVersion: r.detalles[0].version, motivo: "Anulación" }, user.idusuario);
  expect(r.monto_total_pagado).toBe("0.00");
  r = await payments.guardarDetallePago(id, { accion: "activar", detalle: r.detalles[0].uuid, version: r.maestro!.version, detalleVersion: r.detalles[0].version, motivo: "Reactivación" }, user.idusuario);
  expect(r.monto_total_pagado).toBe("150.00");
  expect(r.maestro!.estado).toBe("PENDIENTE");
  expect(r.historial).toHaveLength(5);
});
it("revierte detalle y versión si falla la escritura del historial", async () => {
  const f = await arrange();
  await db.$executeRawUnsafe("CREATE TRIGGER it_pago_failure BEFORE INSERT ON factoring_pago_historial FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Fallo sintético'");
  await expect(create(f.factoring.factoringid, f.bank.factortransaccionbancariaid, "100")).rejects.toThrow();
  expect(await db.factoring_pago_detalle.count()).toBe(0);
  expect((await db.factoring_pago.findFirstOrThrow()).version).toBe(1);
});
it("rechaza versiones antiguas y detalles ajenos", async () => {
  const f = await arrange(),
    other = await second(f);
  const r = await create(f.factoring.factoringid, f.bank.factortransaccionbancariaid, "10");
  await expect(payments.guardarDetallePago(f.factoring.factoringid, { accion: "editar", detalle: r.detalles[0].uuid, monto: "20", version: 1, detalleVersion: 1, motivo: "Corregir" }, user.idusuario)).rejects.toMatchObject({ statusCode: 409 });
  await expect(payments.guardarDetallePago(other.factoringid, { accion: "anular", detalle: r.detalles[0].uuid, version: 1, detalleVersion: 1, motivo: "Anular" }, user.idusuario)).rejects.toMatchObject({ statusCode: 404 });
});
it("no admite egresos, monedas distintas ni referencias bancarias anuladas", async () => {
  const f = await arrange();
  for (const change of [{ signo: -1 }, { estado: 2 }]) {
    await db.factor_transaccion_bancaria.update({ where: { idfactortransaccionbancaria: f.bank.idfactortransaccionbancaria }, data: { signo: 1, estado: 1, motivo_anulacion: change.estado === 2 ? "Prueba sintética de elegibilidad" : null, ...change } });
    await expect(create(f.factoring.factoringid, f.bank.factortransaccionbancariaid, "10")).rejects.toMatchObject({ statusCode: 422 });
  }
  await db.factor_transaccion_bancaria.update({ where: { idfactortransaccionbancaria: f.bank.idfactortransaccionbancaria }, data: { estado: 1, motivo_anulacion: null } });
  await db.factoring.update({ where: { idfactoring: f.factoring.idfactoring }, data: { idmoneda: 2 } });
  await expect(create(f.factoring.factoringid, f.bank.factortransaccionbancariaid, "10")).rejects.toMatchObject({ statusCode: 422 });
});
it("protege evidencia bancaria aplicada y muestra disponibilidad en el buscador", async () => {
  const f = await arrange();
  await create(f.factoring.factoringid, f.bank.factortransaccionbancariaid, "10000");
  await expect(mutarMovimiento(f.bank.factortransaccionbancariaid, { accion: "anular", version: 1, motivo: "Prueba" }, user.idusuario)).rejects.toMatchObject({ statusCode: 409 });
  const found = await payments.buscarTransaccionesPago(f.factoring.factoringid, "2026-10-16", "2026-10-16", "000001", 1);
  expect(found.total).toBe(1);
  expect(Number(found.items[0].disponible)).toBe(5000);
  expect(JSON.stringify(found)).not.toMatch(/datos_origen|identidad_sha256|password/);
  expect((await payments.buscarTransaccionesPago(f.factoring.factoringid, "2026-10-17", "2026-10-17", "", 1)).total).toBe(0);
});
it("recorre HTTP, JWT, validación, servicio y persistencia reales para alta, cierre y eliminación", async () => {
  const f = await arrange();
  await seedAuthorization(user.idusuario);
  const base = `/api/v1/admin/servicio/factoring/factoringpago/${f.factoring.factoringid}`;
  const token = `Bearer ${jwt.sign({ usuario: { idusuario: user.idusuario, usuario_roles: [{ idrol: 2 }] } }, "pagos-integration-only")}`;
  const added = await request(app)
    .post(base + "/detalles")
    .set("Authorization", token)
    .send({ accion: "crear", transaccion: f.bank.factortransaccionbancariaid, monto: "10", version: 1 })
    .expect(200);
  expect(added.body.data.monto_total_pagado).toBe("10.00");
  const r = added.body.data;
  const closed = await request(app)
    .patch(base + "/estado")
    .set("Authorization", token)
    .send({ estado: r.estados.find((s: { code: string }) => s.code === "CANCELADO").uuid, version: r.maestro.version, motivo: "Cierre manual sintético" })
    .expect(200);
  expect(closed.body.data.maestro.estado).toBe("CANCELADO");
  expect(closed.body.data.diferencia_pago).toBe("19990.00");
  const removed = await request(app)
    .post(base + "/detalles")
    .set("Authorization", token)
    .send({ accion: "anular", detalle: r.detalles[0].uuid, detalleVersion: 1, version: closed.body.data.maestro.version, motivo: "Anulación sintética" })
    .expect(200);
  expect(removed.body.data.monto_total_pagado).toBe("0.00");
  expect(removed.body.data.maestro.estado).toBe("CANCELADO");
  const read = await request(app).get(base).set("Authorization", token).expect(200);
  expect(read.body.data.detalles[0].estado).toBe(2);
  await request(app)
    .post(base + "/detalles")
    .set("Authorization", token)
    .send({ accion: "crear", transaccion: f.bank.factortransaccionbancariaid, monto: "1", version: read.body.data.maestro.version, idusuario: 999 })
    .expect(400);
  expect(await db.factoring_pago_historial.count()).toBe(4);
});
