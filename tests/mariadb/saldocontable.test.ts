import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db, cleanFixtures, seedApproval, seedMasters } from "./businessSupport.js";
vi.mock("#src/config.js", () => ({ env: {}, isProduction: true }));
vi.mock("#src/models/prisma/db-factoring.js", async () => ({ prismaFT: { client: (await import("./businessSupport.js")).db, transactionTimeout: 10000 } }));
vi.mock("#src/utils/logger.pino.js", () => ({ line: () => "integration", log: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
import * as service from "#src/services/admin/saldocontable.Service.js";
import type { MutacionPeriodo, PeriodoInput } from "#src/services/admin/saldocontable.Service.js";

let user: Awaited<ReturnType<typeof seedMasters>>;
const input = (overrides: Partial<PeriodoInput> = {}): PeriodoInput => ({ nombre_periodo: "Segundo trimestre 2026", fecha_inicio: "2026-04-01", fecha_fin: "2026-06-30", fecha_corte: "2026-06-30", tipo_operacion: "DESCUENTO", ...overrides });
beforeEach(async () => {
  user = await seedMasters();
  await db.sbs_saldo_contable_periodo_estado.createMany({
    data: [
      { idsbssaldocontableperiodoestado: 1, code: "SCPE00001", nombre: "EN ELABORACION", alias: "En elaboración", color: "warning" },
      { idsbssaldocontableperiodoestado: 2, code: "SCPE00002", nombre: "CERRADO", alias: "Cerrado", color: "success" },
    ],
  });
  await db.sbs_saldo_contable_operacion_tipo.createMany({
    data: [
      { idsbssaldocontableoperaciontipo: 1, code: "SCOT00001", nombre: "DESCUENTO", alias: "Descuento", color: "primary" },
      { idsbssaldocontableoperaciontipo: 2, code: "SCOT00002", nombre: "FACTORING", alias: "Factoring", color: "secondary", habilitado: 0 },
    ],
  });
});
afterEach(async () => {
  await db.$executeRawUnsafe("DROP TRIGGER IF EXISTS it_saldo_failure");
  await db.sbs_saldo_contable_detalle.deleteMany({});
  await db.sbs_saldo_contable_periodo.deleteMany({});
  await db.sbs_saldo_contable_operacion_tipo.deleteMany({});
  await db.sbs_saldo_contable_periodo_estado.deleteMany({});
  await db.sbs_tipo_cambio.deleteMany({});
  await cleanFixtures();
});
afterAll(async () => {
  await db.$disconnect();
});
async function arrange(currency = "PEN") {
  const f = await seedApproval(user.idusuario);
  await db.factoring.update({ where: { idfactoring: f.factoring.idfactoring }, data: { idfactoringpropuestaaceptada: f.propuesta.idfactoringpropuesta, fecha_operacion: new Date("2026-01-15T15:00:00Z"), idmoneda: currency === "PEN" ? 1 : 2, monto_neto: 12 } });
  await db.factoring_propuesta.update({ where: { idfactoringpropuesta: f.propuesta.idfactoringpropuesta }, data: { monto_neto: "10000.25" } });
  return f;
}
const crear = (overrides: Partial<PeriodoInput> = {}) => service.crearPeriodoService(input(overrides), user.idusuario);
const mutar = (uuid: string, data: MutacionPeriodo) => service.mutarPeriodoService(uuid, data, user.idusuario);
async function cambio(fecha = "2026-06-30", precio = "3.410001") {
  return db.sbs_tipo_cambio.create({ data: { code: `TC-${fecha}`, idmonedabase: 2, idmonedacotizada: 1, fecha: new Date(fecha), precio_compra: 2, precio_venta: 4, precio_contable: precio } });
}
async function liquidacion(idfactoring: number, pago: string, estado = 10) {
  await db.factoring_liquidacion_estado.upsert({ where: { idfactoringliquidacionestado: estado }, create: { idfactoringliquidacionestado: estado, code: `E${estado}`, nombre: "Sintético", alias: "IT", color: "blue" }, update: {} });
  return db.factoring_liquidacion.create({ data: { code: `LQ-${await db.factoring_liquidacion.count()}`, idfactoring, idfactoringliquidacionestado: estado, fecha_liquidacion: new Date(pago), fecha_pago_efectivo: new Date(pago), dias_pago_efectivo: 0, dias_mora_efectivo: 0, monto_descuento_efectivo: 0, monto_descuento_a_favor: 0, monto_descuento_mora: 0, monto_total_neto_inafecto_igv_abono: 0, monto_total_neto_inafecto_igv_cargo: 0, monto_total_neto_inafecto_igv: 0, monto_total_neto_afecto_igv_abono: 0, monto_total_neto_afecto_igv_cargo: 0, monto_total_neto_afecto_igv: 0, monto_total_igv: 0, monto_total_a_favor: 0, monto_total_por_cobrar: 0 } });
}
describe("Saldo Contable: servicios, DAO y transacciones reales", () => {
  it("filtra inicio existente hasta el corte completo en Lima antes de paginar, contar y buscar", async () => {
    const f = await arrange(),
      p = await crear();
    const original = await db.factoring.findUniqueOrThrow({ where: { idfactoring: f.factoring.idfactoring } });
    const { idfactoring: _id, factoringid: _uuid, code: _code, ...data } = original;
    for (const [suffix, fecha_operacion] of [
      ["SIN_INICIO", null],
      ["POSTERIOR", new Date("2026-07-01T05:00:00Z")],
      ["FIN_CORTE", new Date("2026-07-01T04:59:59Z")],
      ["INICIO_CORTE", new Date("2026-06-30T05:00:00Z")],
      ["INACTIVA", new Date("2026-01-15T15:00:00Z")],
    ] as const)
      await db.factoring.create({ data: { ...data, idfactoringpropuestaaceptada: null, code: `IT-FECHA-${suffix}`, fecha_operacion, estado: suffix === "INACTIVA" ? 2 : 1 } });
    const first = await service.sugerenciasService(p.sbssaldocontableperiodoid, 1, 2, "");
    const second = await service.sugerenciasService(p.sbssaldocontableperiodoid, 2, 2, "");
    expect(first.total).toBe(3);
    expect(second.total).toBe(3);
    expect(first.items).toHaveLength(2);
    expect(second.items).toHaveLength(1);
    expect([...first.items, ...second.items].map((row) => row.codigo_operacion).sort()).toEqual([f.factoring.code, "IT-FECHA-FIN_CORTE", "IT-FECHA-INICIO_CORTE"].sort());
    expect((await service.sugerenciasService(p.sbssaldocontableperiodoid, 1, 25, "IT-FECHA")).total).toBe(2);
    expect((await service.sugerenciasService(p.sbssaldocontableperiodoid, 1, 25, "SIN_INICIO")).items).toEqual([]);
    expect((await service.sugerenciasService(p.sbssaldocontableperiodoid, 1, 25, "POSTERIOR")).total).toBe(0);
  });
  it("crea nombre/fechas flexibles, rechaza fechas inválidas y duplicado sin duplicar cabecera", async () => {
    const p = await crear({ fecha_inicio: "2026-01-01", fecha_fin: "2026-06-30" });
    expect(p.tipo_operacion).toBe("DESCUENTO");
    expect(p.nombre_periodo).toBe(input().nombre_periodo);
    await expect(crear({ fecha_inicio: "2026-01-01", fecha_fin: "2026-06-30" })).rejects.toMatchObject({ statusCode: 409 });
    await expect(crear({ fecha_fin: "2026-02-30" })).rejects.toMatchObject({ statusCode: 422 });
    expect(await db.sbs_saldo_contable_periodo.count()).toBe(1);
  });
  it("guarda neto aceptado distinto al inicial, multiplicador PEN=1, total y autoría", async () => {
    const f = await arrange(),
      p = await crear();
    const result = await mutar(p.sbssaldocontableperiodoid, { accion: "asociar", version: 1, operaciones: [f.factoring.factoringid] });
    expect(result.monto_saldo_contable).toBe("10000.25000000");
    expect(result.version).toBe(2);
    const d = await db.sbs_saldo_contable_detalle.findFirstOrThrow();
    expect(d.monto_neto.toString()).toBe("10000.25");
    expect(d.tipo_cambio.toString()).toBe("1");
    expect(d.idsbstipocambio).toBeNull();
    expect(d.idusuariocrea).toBe(user.idusuario);
  });
  it("USD requiere contable exacto, no compra/venta ni último disponible; conserva precisión", async () => {
    const f = await arrange("USD"),
      p = await crear();
    await cambio("2026-06-29");
    await expect(mutar(p.sbssaldocontableperiodoid, { accion: "asociar", version: 1, operaciones: [f.factoring.factoringid] })).rejects.toMatchObject({ statusCode: 409 });
    expect(await db.sbs_saldo_contable_detalle.count()).toBe(0);
    expect((await service.detallePeriodoService(p.sbssaldocontableperiodoid)).periodo.version).toBe(1);
    const tc = await cambio();
    const result = await mutar(p.sbssaldocontableperiodoid, { accion: "asociar", version: 1, operaciones: [f.factoring.factoringid] });
    expect(result.monto_saldo_contable).toBe("34100.86250025");
    expect((await db.sbs_saldo_contable_detalle.findFirstOrThrow()).idsbstipocambio).toBe(tc.idsbstipocambio);
  });
  it("operación pendiente vuelve a sugerirse y asociarse en otro corte", async () => {
    const f = await arrange(),
      marzo = await crear({ nombre_periodo: "Marzo", fecha_inicio: "2026-01-01", fecha_fin: "2026-03-31", fecha_corte: "2026-03-31" });
    await mutar(marzo.sbssaldocontableperiodoid, { accion: "asociar", version: 1, operaciones: [f.factoring.factoringid] });
    await mutar(marzo.sbssaldocontableperiodoid, { accion: "cerrar", version: 2 });
    const junio = await crear();
    expect((await service.sugerenciasService(junio.sbssaldocontableperiodoid, 1, 25, "")).items[0]).toMatchObject({ asociado: false, calculable: true });
    await mutar(junio.sbssaldocontableperiodoid, { accion: "asociar", version: 1, operaciones: [f.factoring.factoringid] });
    expect(await db.sbs_saldo_contable_detalle.count()).toBe(2);
  });
  it("retiro/reactivación reutiliza detalle, conserva identidad y evita asociación duplicada", async () => {
    const f = await arrange(),
      p = await crear(),
      uuid = p.sbssaldocontableperiodoid,
      operaciones = [f.factoring.factoringid];
    await mutar(uuid, { accion: "asociar", version: 1, operaciones });
    const before = await db.sbs_saldo_contable_detalle.findFirstOrThrow();
    await expect(mutar(uuid, { accion: "asociar", version: 2, operaciones })).rejects.toMatchObject({ statusCode: 409 });
    expect((await mutar(uuid, { accion: "retirar", version: 2, operaciones, motivo: "Revisión" })).monto_saldo_contable).toBe("0.00000000");
    await mutar(uuid, { accion: "asociar", version: 3, operaciones });
    const after = await db.sbs_saldo_contable_detalle.findFirstOrThrow();
    expect(after.sbssaldocontabledetalleid).toBe(before.sbssaldocontabledetalleid);
    expect(await db.sbs_saldo_contable_detalle.count()).toBe(1);
  });
  it.each(["2026-06-30T15:00:00Z", "2026-07-01T04:59:59Z"])("cobro real %s excluye al corte", async (pago) => {
    const f = await arrange(),
      p = await crear();
    await liquidacion(f.factoring.idfactoring, pago);
    const result = await service.sugerenciasService(p.sbssaldocontableperiodoid, 1, 25, "");
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
    await expect(mutar(p.sbssaldocontableperiodoid, { accion: "asociar", version: 1, operaciones: [f.factoring.factoringid] })).rejects.toMatchObject({ statusCode: 409 });
  });
  it("ignora cobros eliminados lógicamente y usa la fecha de cualquier cobro activo", async () => {
    const f = await arrange(),
      p = await crear();
    const descartada = await liquidacion(f.factoring.idfactoring, "2026-05-01", 11);
    await db.factoring_liquidacion.update({ where: { idfactoringliquidacion: descartada.idfactoringliquidacion }, data: { estado: 2 } });
    await liquidacion(f.factoring.idfactoring, "2026-07-01T05:00:00Z");
    expect((await service.sugerenciasService(p.sbssaldocontableperiodoid, 1, 25, "")).items[0].calculable).toBe(true);
    await liquidacion(f.factoring.idfactoring, "2026-08-01");
    expect((await service.sugerenciasService(p.sbssaldocontableperiodoid, 1, 25, "")).items[0].calculable).toBe(true);
    await liquidacion(f.factoring.idfactoring, "2026-06-30T23:00:00Z", 1);
    expect((await service.sugerenciasService(p.sbssaldocontableperiodoid, 1, 25, "")).total).toBe(0);
    await expect(mutar(p.sbssaldocontableperiodoid, { accion: "asociar", version: 1, operaciones: [f.factoring.factoringid] })).rejects.toMatchObject({ statusCode: 409 });
  });
  it.each([1, 4, 8, 10])("no utiliza estado funcional %s para omitir un cobro activo hasta el corte", async (estado) => {
    const f = await arrange(),
      p = await crear();
    await liquidacion(f.factoring.idfactoring, "2026-06-30T15:00:00Z", estado);
    const result = await service.sugerenciasService(p.sbssaldocontableperiodoid, 1, 25, "IT-FACTORING");
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
    await expect(mutar(p.sbssaldocontableperiodoid, { accion: "asociar", version: 1, operaciones: [f.factoring.factoringid] })).rejects.toMatchObject({ statusCode: 409 });
  });
  it.each([
    { fecha_inicio: "2099-01-01", fecha_fin: "2099-03-31", fecha_corte: "2099-03-31" },
    { fecha_inicio: "2000-01-01", fecha_fin: "2099-12-31", fecha_corte: "2099-12-31" },
  ])("crea futuro/curso y bloquea asociación/cierre desde servicio", async (fechas) => {
    const f = await arrange(),
      p = await crear(fechas);
    await expect(mutar(p.sbssaldocontableperiodoid, { accion: "asociar", version: 1, operaciones: [f.factoring.factoringid] })).rejects.toMatchObject({ statusCode: 409 });
    await expect(mutar(p.sbssaldocontableperiodoid, { accion: "cerrar", version: 1 })).rejects.toMatchObject({ statusCode: 409 });
    expect(await db.sbs_saldo_contable_detalle.count()).toBe(0);
  });
  it("cerrado conserva copias aunque se registren cobros y cambios de fuentes posteriores", async () => {
    const f = await arrange(),
      p = await crear(),
      uuid = p.sbssaldocontableperiodoid;
    await mutar(uuid, { accion: "asociar", version: 1, operaciones: [f.factoring.factoringid] });
    await mutar(uuid, { accion: "clasificar", version: 2, operacion: f.factoring.factoringid, instrumentos: [{ instrumento: "F001-1", categoria: "FACTURA_NEGOCIABLE", sustento: "Referencia sintética" }] });
    await mutar(uuid, { accion: "cerrar", version: 3 });
    const before = await service.detallePeriodoService(uuid);
    await liquidacion(f.factoring.idfactoring, "2026-07-15T15:00:00Z");
    await db.factoring_propuesta.update({ where: { idfactoringpropuesta: f.propuesta.idfactoringpropuesta }, data: { monto_neto: 999 } });
    expect(await service.detallePeriodoService(uuid)).toEqual(before);
    for (const accion of ["recalcular", "cerrar", "eliminar", "activar"] as const) await expect(mutar(uuid, { accion, version: 4 })).rejects.toMatchObject({ statusCode: 409 });
    await expect(mutar(uuid, { accion: "retirar", version: 4, operaciones: [f.factoring.factoringid], motivo: "Intento" })).rejects.toMatchObject({ statusCode: 409 });
  });
  it("cambio del contable antes del cierre exige recalcular; el cierre no cambia importes silenciosamente", async () => {
    const f = await arrange("USD"),
      p = await crear(),
      tc = await cambio(),
      uuid = p.sbssaldocontableperiodoid;
    await mutar(uuid, { accion: "asociar", version: 1, operaciones: [f.factoring.factoringid] });
    await db.sbs_tipo_cambio.update({ where: { idsbstipocambio: tc.idsbstipocambio }, data: { precio_contable: 4 } });
    await expect(mutar(uuid, { accion: "cerrar", version: 2 })).rejects.toMatchObject({ statusCode: 409 });
    await mutar(uuid, { accion: "recalcular", version: 2 });
    const closed = await mutar(uuid, { accion: "cerrar", version: 3 });
    expect(closed.monto_saldo_contable).toBe("40001.00000000");
    expect(closed.estado_periodo).toBe("Cerrado");
  });
  it("eliminación lógica conserva detalle, bloquea cambios y permite activar", async () => {
    const f = await arrange(),
      p = await crear(),
      uuid = p.sbssaldocontableperiodoid;
    await mutar(uuid, { accion: "asociar", version: 1, operaciones: [f.factoring.factoringid] });
    await mutar(uuid, { accion: "eliminar", version: 2 });
    await expect(mutar(uuid, { accion: "recalcular", version: 3 })).rejects.toMatchObject({ statusCode: 409 });
    expect((await mutar(uuid, { accion: "activar", version: 3 })).monto_saldo_contable).toBe("10000.25000000");
    expect(await db.sbs_saldo_contable_detalle.count()).toBe(1);
  });
  it("no cambia fechas con asociaciones; editar nombre sí conserva importe", async () => {
    const f = await arrange(),
      p = await crear(),
      uuid = p.sbssaldocontableperiodoid;
    await mutar(uuid, { accion: "asociar", version: 1, operaciones: [f.factoring.factoringid] });
    await expect(mutar(uuid, { accion: "editar", version: 2, periodo: input({ fecha_corte: "2026-07-01" }) })).rejects.toMatchObject({ statusCode: 409 });
    expect((await mutar(uuid, { accion: "editar", version: 2, periodo: input({ nombre_periodo: "Nuevo nombre" }) })).nombre_periodo).toBe("Nuevo nombre");
  });
  it("fallo SQL tras insertar detalle revierte detalle, total y versión en la misma transacción", async () => {
    const f = await arrange(),
      p = await crear();
    await db.$executeRawUnsafe("CREATE TRIGGER it_saldo_failure BEFORE UPDATE ON sbs_saldo_contable_periodo FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='synthetic saldo failure'");
    await expect(mutar(p.sbssaldocontableperiodoid, { accion: "asociar", version: 1, operaciones: [f.factoring.factoringid] })).rejects.toThrow();
    expect(await db.sbs_saldo_contable_detalle.count()).toBe(0);
    const result = await service.detallePeriodoService(p.sbssaldocontableperiodoid);
    expect(result.periodo).toMatchObject({ version: 1, monto_saldo_contable: "0.00000000" });
  });
  it("dos ediciones concurrentes de la misma versión producen una escritura y un conflicto", async () => {
    const p = await crear(),
      uuid = p.sbssaldocontableperiodoid;
    const result = await Promise.allSettled([mutar(uuid, { accion: "editar", version: 1, periodo: input({ nombre_periodo: "A" }) }), mutar(uuid, { accion: "editar", version: 1, periodo: input({ nombre_periodo: "B" }) })]);
    expect(result.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(result.find((r) => r.status === "rejected")).toMatchObject({ status: "rejected", reason: { statusCode: 409 } });
    expect((await service.detallePeriodoService(uuid)).periodo.version).toBe(2);
  });
  it("lote con operación inexistente es atómico y cerrar vacío no se permite", async () => {
    const f = await arrange(),
      p = await crear();
    await expect(mutar(p.sbssaldocontableperiodoid, { accion: "asociar", version: 1, operaciones: [f.factoring.factoringid, "00000000-0000-4000-8000-000000000999"] })).rejects.toMatchObject({ statusCode: 404 });
    await expect(mutar(p.sbssaldocontableperiodoid, { accion: "cerrar", version: 1 })).rejects.toMatchObject({ statusCode: 409 });
    expect(await db.sbs_saldo_contable_detalle.count()).toBe(0);
  });
});
