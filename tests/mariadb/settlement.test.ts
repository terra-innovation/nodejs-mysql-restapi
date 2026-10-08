import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db, cleanFixtures, seedMasters } from "./businessSupport.js";
import { seedSettlement } from "./settlementSupport.js";

vi.mock("#src/config.js", () => ({ env: {}, isProduction: true }));
vi.mock("#src/models/prisma/db-factoring.js", async () => ({ prismaFT: { client: (await import("./businessSupport.js")).db, transactionTimeout: 10000 } }));
vi.mock("#src/utils/logger.pino.js", () => ({ line: () => "integration", log: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock("#src/providers/email/email.Provider.js", () => ({ sendFactoringEmpresaServicioFactoringLiquidacion: vi.fn(), sendFactoringEmpresaServicioFactoringTransferencia: vi.fn() }));
import * as liquidation from "#src/services/admin/factoringliquidacion.Service.js";
import * as transfer from "#src/services/admin/factoringtransferenciacedente.Service.js";
import * as liquidationDao from "#src/daos/factoringliquidacion.Dao.js";

let user: Awaited<ReturnType<typeof seedMasters>>;
beforeEach(async () => { user = await seedMasters(); });
afterEach(async () => { await db.$executeRawUnsafe("DROP TRIGGER IF EXISTS it_settlement_failure"); await cleanFixtures(); });
afterAll(async () => { await db.$disconnect(); });

describe("Liquidaciones: cálculos y persistencia en MariaDB", () => {
  for (const currency of ["PEN", "USD"]) it.each([
    ["anticipado", "2026-09-01T05:00:00Z", 0, 0, "0", "320", "0", "4320"],
    ["puntual", "2026-10-01T05:00:00Z", 30, 0, "320", "0", "0", "4000"],
    ["mora", "2026-10-31T05:00:00Z", 60, 30, "646.4", "0", "326.4", "3614.85"],
  ] as const)(`${currency}, pago %s guarda y lee cabecera y detalles`, async (_label, date, days, overdue, discount, refund, charge, balance) => {
    const f = await seedSettlement(user.idusuario, currency);
    const dto = { ...f.liquidacionDto, fecha_pago_efectivo: date };
    const simulation = await liquidation.simulateFactoringliquidacionService(dto);
    expect(await db.factoring_liquidacion.count()).toBe(0);
    const created = await liquidation.createFactoringliquidacionService(dto, user.idusuario);
    const stored = await liquidationDao.getFactoringliquidacionByFactoringliquidacionid(db, created.factoringliquidacionid);
    expect(stored).toMatchObject({ idfactoring: f.factoring.idfactoring, idusuariocrea: user.idusuario, idusuariomod: user.idusuario, dias_pago_efectivo: days, dias_mora_efectivo: overdue });
    expect([stored!.monto_descuento_efectivo, stored!.monto_descuento_a_favor, stored!.monto_descuento_mora, stored!.monto_total_a_favor, stored!.monto_total_por_cobrar].map(value => value.toString())).toEqual([discount, refund, charge, balance, "0"]);
    expect(stored!.fecha_pago_efectivo).toEqual(new Date(date));
    const details = stored!.factoring_liquidacion_financieros;
    expect(details).toHaveLength(simulation.factoring_liquidacion_financieros.length);
    for (const item of details) {
      const simulated = simulation.factoring_liquidacion_financieros.find(value => value.financiero_concepto.idfinancieroconcepto === item.idfinancieroconcepto);
      expect(item.total.equals(simulated.total)).toBe(true);
      expect(item.total.equals(item.monto.plus(item.igv))).toBe(true);
      expect(item.idusuariocrea).toBe(user.idusuario);
    }
    const signed = details.reduce((sum, item) => sum.plus(item.total.mul(item.financiero_concepto.factor)), stored!.monto_total_a_favor.mul(0));
    expect(signed.equals(stored!.monto_total_a_favor.minus(stored!.monto_total_por_cobrar))).toBe(true);
    expect(await liquidation.getFactoringliquidacionByFactoringidService({ factoringid: f.factoring.factoringid })).toHaveLength(1);
  });

  it.each(["PEN", "USD"])("gasto interbancario en %s y exoneración se conservan al leer", async currency => {
    const f = await seedSettlement(user.idusuario, currency, 2);
    const charged = await liquidation.createFactoringliquidacionService(f.liquidacionDto, user.idusuario);
    expect(charged.monto_total_a_favor.toString()).toBe(currency === "PEN" ? "3992.5" : "3997.5");
    const waived = await liquidation.createFactoringliquidacionService({ ...f.liquidacionDto, exonerar_gasto_interbancario: true }, user.idusuario);
    expect((await db.factoring_liquidacion.findUniqueOrThrow({ where: { idfactoringliquidacion: waived.idfactoringliquidacion } })).monto_total_a_favor.toString()).toBe("4000");
  });
  it.each([[2, 100, "18", "3882", "0"], [4, 100, "0", "3900", "0"], [2, 5000, "900", "0", "1900"]] as const)("cargo adicional tipo %s, monto %s persiste IGV y saldo", async (type, amount, igv, favor, payable) => {
    const f = await seedSettlement(user.idusuario);
    if (type === 4) await db.financiero_concepto.update({ where: { idfinancieroconcepto: 20 }, data: { afecto_igv: false } });
    const tipo = await db.financiero_tipo.findUniqueOrThrow({ where: { idfinancierotipo: type } });
    const concepto = await db.financiero_concepto.findUniqueOrThrow({ where: { idfinancieroconcepto: 20 } });
    const created = await liquidation.createFactoringliquidacionService({ ...f.liquidacionDto, factoring_liquidacion_financieros: [{ financierotipoid: tipo.financierotipoid, financieroconceptoid: concepto.financieroconceptoid, cantidad: 2, monto_unitario: amount / 2 }] }, user.idusuario);
    const detail = await db.factoring_liquidacion_financiero.findFirstOrThrow({ where: { idfinancieroconcepto: 20 } });
    expect(detail.igv.toString()).toBe(igv); expect(detail.monto.toString()).toBe(String(amount));
    expect([created.monto_total_a_favor.toString(), created.monto_total_por_cobrar.toString()]).toEqual([favor, payable]);
  });
  it.each(["operacion", "propuesta", "inicio", "estado", "tipo", "concepto"])("falta %s: rechaza y no persiste una liquidación", async missing => {
    const f = await seedSettlement(user.idusuario);
    const dto: liquidation.CreateFactoringliquidacionDto = { ...f.liquidacionDto };
    if (missing === "operacion") dto.factoringid = "inexistente";
    if (missing === "estado") dto.factoringliquidacionestadoid = "inexistente";
    if (missing === "propuesta") await db.factoring.update({ where: { idfactoring: f.factoring.idfactoring }, data: { idfactoringpropuestaaceptada: null } });
    if (missing === "inicio") await db.factoring.update({ where: { idfactoring: f.factoring.idfactoring }, data: { fecha_operacion: null } });
    if (missing === "tipo" || missing === "concepto") {
      const tipo = await db.financiero_tipo.findUniqueOrThrow({ where: { idfinancierotipo: 2 } });
      const concepto = await db.financiero_concepto.findUniqueOrThrow({ where: { idfinancieroconcepto: 20 } });
      dto.factoring_liquidacion_financieros = [{ financierotipoid: missing === "tipo" ? "inexistente" : tipo.financierotipoid, financieroconceptoid: missing === "concepto" ? "inexistente" : concepto.financieroconceptoid, monto_unitario: 100 }];
    }
    await expect(liquidation.createFactoringliquidacionService(dto, user.idusuario)).rejects.toMatchObject({ statusCode: ["propuesta", "inicio"].includes(missing) ? 400 : 404 });
    expect(await db.factoring_liquidacion.count()).toBe(0); expect(await db.factoring_liquidacion_financiero.count()).toBe(0);
  });
  it.each(["cabecera", "segundo detalle"])("fallo SQL en %s revierte cabecera y todos los detalles", async stage => {
    const f = await seedSettlement(user.idusuario);
    const table = stage === "cabecera" ? "factoring_liquidacion" : "factoring_liquidacion_financiero";
    const statement = stage === "cabecera" ? "SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='IT failure';" : "IF NEW.orden=2 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='IT failure'; END IF;";
    await db.$executeRawUnsafe(`CREATE TRIGGER it_settlement_failure BEFORE INSERT ON ${table} FOR EACH ROW BEGIN ${statement} END`);
    await expect(liquidation.createFactoringliquidacionService({ ...f.liquidacionDto, fecha_pago_efectivo: "2026-10-31T05:00:00Z" }, user.idusuario)).rejects.toMatchObject({ statusCode: 500 });
    expect(await db.factoring_liquidacion.count()).toBe(0); expect(await db.factoring_liquidacion_financiero.count()).toBe(0);
    expect(await db.factoring_propuesta.count()).toBe(1); expect(await db.factoring.count()).toBe(1);
  });
  it("cambia estado y fecha; elimina y reactiva conservando importes y detalles", async () => {
    const f = await seedSettlement(user.idusuario);
    const created = await liquidation.createFactoringliquidacionService(f.liquidacionDto, user.idusuario);
    const id = { factoringliquidacionid: created.factoringliquidacionid };
    await liquidation.updateFactoringliquidacionService({ ...id, factoringliquidacionestadoid: f.liquidacionEstados[1].factoringliquidacionestadoid, fecha_liquidacion: "2026-10-02T05:00:00Z" }, user.idusuario);
    const updated = await db.factoring_liquidacion.findUniqueOrThrow({ where: id });
    expect(updated).toMatchObject({ idfactoringliquidacionestado: 4, fecha_liquidacion: new Date("2026-10-02T05:00:00Z"), idusuariomod: user.idusuario });
    expect(updated.monto_total_a_favor.equals(created.monto_total_a_favor)).toBe(true);
    await liquidation.deleteFactoringliquidacionService(id, user.idusuario);
    expect((await db.factoring_liquidacion.findUniqueOrThrow({ where: id })).estado).toBe(2);
    expect(await db.factoring_liquidacion_financiero.count()).toBe(1);
    await liquidation.activateFactoringliquidacionService(id, user.idusuario);
    expect((await db.factoring_liquidacion.findUniqueOrThrow({ where: id })).estado).toBe(1);
  });
  it("fallo SQL al cambiar estado conserva estado, fecha y actor anteriores", async () => {
    const f = await seedSettlement(user.idusuario);
    const created = await liquidation.createFactoringliquidacionService(f.liquidacionDto, user.idusuario);
    await db.$executeRawUnsafe("CREATE TRIGGER it_settlement_failure BEFORE UPDATE ON factoring_liquidacion FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='IT failure'");
    await expect(liquidation.updateFactoringliquidacionService({ factoringliquidacionid: created.factoringliquidacionid, factoringliquidacionestadoid: f.liquidacionEstados[1].factoringliquidacionestadoid, fecha_liquidacion: "2026-10-02T05:00:00Z" }, user.idusuario)).rejects.toMatchObject({ statusCode: 500 });
    expect(await db.factoring_liquidacion.findUniqueOrThrow({ where: { idfactoringliquidacion: created.idfactoringliquidacion } })).toEqual(created);
  });
});

describe("Transferencias al cedente: servicio y SQL reales", () => {
  it.each(["PEN", "USD"])("guarda y lee transferencia %s con constancia y cuenta bancaria", async currency => {
    const f = await seedSettlement(user.idusuario, currency);
    const created = await transfer.createFactoringtransferenciacedenteService(f.transferenciaDto, user.idusuario);
    const stored = await db.factoring_transferencia_cedente.findUniqueOrThrow({ where: { idfactoringtransferenciacedente: created.idfactoringtransferenciacedente } });
    expect(stored).toMatchObject({ numero_operacion: "IT-OPERACION", fecha: new Date(f.transferenciaDto.fecha), idmoneda: currency === "PEN" ? 1 : 2, idusuariocrea: user.idusuario, idusuariomod: user.idusuario });
    expect(stored.monto.toString()).toBe("4000.15");
    expect(await db.archivo_factoring_transferencia_cedente.findFirstOrThrow()).toMatchObject({ idarchivo: f.archivo.idarchivo, idfactoringtransferenciacedente: created.idfactoringtransferenciacedente, idusuariocrea: user.idusuario });
    const rows = await transfer.getFactoringtransferenciacedentesByFactoringidService({ factoringid: f.factoring.factoringid });
    expect(rows).toHaveLength(1); expect(rows[0].monto.toString()).toBe("4000.15");
    expect((await db.factoring.findUniqueOrThrow({ where: { idfactoring: f.factoring.idfactoring } })).idfactoringestado).toBe(3);
  });
  it.each(["factoringid", "factoringtransferenciatipoid", "factoringtransferenciaestadoid", "factorcuentabancariaid", "empresacuentabancariaid", "monedaid", "archivo_constancia_transferencia"] as const)("referencia %s desconocida no guarda registros parciales", async field => {
    const f = await seedSettlement(user.idusuario);
    await expect(transfer.createFactoringtransferenciacedenteService({ ...f.transferenciaDto, [field]: "inexistente" }, user.idusuario)).rejects.toMatchObject({ statusCode: 404 });
    expect(await db.factoring_transferencia_cedente.count()).toBe(0); expect(await db.archivo_factoring_transferencia_cedente.count()).toBe(0);
    expect(await db.archivo.count()).toBe(1);
  });
  it.each(["transferencia", "constancia"])("fallo SQL en %s revierte transferencia y vínculo de archivo", async stage => {
    const f = await seedSettlement(user.idusuario);
    const table = stage === "transferencia" ? "factoring_transferencia_cedente" : "archivo_factoring_transferencia_cedente";
    await db.$executeRawUnsafe(`CREATE TRIGGER it_settlement_failure BEFORE INSERT ON ${table} FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='IT failure'`);
    await expect(transfer.createFactoringtransferenciacedenteService(f.transferenciaDto, user.idusuario)).rejects.toMatchObject({ statusCode: 500 });
    expect(await db.factoring_transferencia_cedente.count()).toBe(0); expect(await db.archivo_factoring_transferencia_cedente.count()).toBe(0);
    expect(await db.archivo.count()).toBe(1); expect(await db.factoring.count()).toBe(1);
  });
  it("cambia estado; elimina y reactiva conservando monto y constancia", async () => {
    const f = await seedSettlement(user.idusuario);
    const created = await transfer.createFactoringtransferenciacedenteService(f.transferenciaDto, user.idusuario);
    const id = { factoringtransferenciacedenteid: created.factoringtransferenciacedenteid };
    await transfer.updateFactoringtransferenciacedenteService({ ...id, factoringtransferenciaestadoid: f.transferenciaEstados[1].factoringtransferenciaestadoid }, user.idusuario);
    const updated = await db.factoring_transferencia_cedente.findUniqueOrThrow({ where: id });
    expect(updated.idfactoringtransferenciaestado).toBe(4); expect(updated.idusuariomod).toBe(user.idusuario); expect(updated.monto.equals(created.monto)).toBe(true);
    await transfer.deleteFactoringtransferenciacedenteService(id, user.idusuario);
    expect((await db.factoring_transferencia_cedente.findUniqueOrThrow({ where: id })).estado).toBe(2);
    await transfer.activateFactoringtransferenciacedenteService(id, user.idusuario);
    expect((await db.factoring_transferencia_cedente.findUniqueOrThrow({ where: id })).estado).toBe(1);
    expect(await db.archivo_factoring_transferencia_cedente.count()).toBe(1);
  });
  it("fallo SQL al actualizar conserva transferencia y constancia", async () => {
    const f = await seedSettlement(user.idusuario);
    const created = await transfer.createFactoringtransferenciacedenteService(f.transferenciaDto, user.idusuario);
    await db.$executeRawUnsafe("CREATE TRIGGER it_settlement_failure BEFORE UPDATE ON factoring_transferencia_cedente FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='IT failure'");
    await expect(transfer.updateFactoringtransferenciacedenteService({ factoringtransferenciacedenteid: created.factoringtransferenciacedenteid, factoringtransferenciaestadoid: f.transferenciaEstados[1].factoringtransferenciaestadoid }, user.idusuario)).rejects.toMatchObject({ statusCode: 500 });
    expect(await db.factoring_transferencia_cedente.findUniqueOrThrow({ where: { idfactoringtransferenciacedente: created.idfactoringtransferenciacedente } })).toEqual(created);
    expect(await db.archivo_factoring_transferencia_cedente.count()).toBe(1);
  });
  it.each(["transferencia", "estado"])("actualización con %s desconocido conserva el registro existente", async missing => {
    const f = await seedSettlement(user.idusuario);
    const created = await transfer.createFactoringtransferenciacedenteService(f.transferenciaDto, user.idusuario);
    await expect(transfer.updateFactoringtransferenciacedenteService({ factoringtransferenciacedenteid: missing === "transferencia" ? "inexistente" : created.factoringtransferenciacedenteid, factoringtransferenciaestadoid: missing === "estado" ? "inexistente" : f.transferenciaEstados[1].factoringtransferenciaestadoid }, user.idusuario)).rejects.toMatchObject({ statusCode: 404 });
    expect(await db.factoring_transferencia_cedente.findUniqueOrThrow({ where: { idfactoringtransferenciacedente: created.idfactoringtransferenciacedente } })).toEqual(created);
  });
});
