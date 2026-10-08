import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Settings } from "luxon";
import { db, cleanFixtures, seedMasters, seedOperationDependencies } from "./businessSupport.js";
import { invoiceWorkspace, invoiceXml, paymentTerm } from "../vitest/support/invoiceFixture.js";

const boundary = vi.hoisted(() => ({ root: "", email: vi.fn(), telegram: vi.fn() }));
vi.mock("#src/config.js", () => ({ env: {}, isProduction: true }));
vi.mock("#src/models/prisma/db-factoring.js", async () => ({ prismaFT: { client: (await import("./businessSupport.js")).db, transactionTimeout: 10000 } }));
vi.mock("#src/utils/storageUtils.js", () => ({ get STORAGE_PATH_SUCCESS() { return boundary.root; } }));
vi.mock("#src/utils/logger.pino.js", () => ({ line: () => "integration", log: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock("#src/providers/email/email.Provider.js", () => ({ sendFactoringEmpresaServicioFactoringSolicitud: boundary.email }));
vi.mock("#src/providers/telegram/telegram.Provider.js", () => ({ sendMessageImportant: boundary.telegram }));
import { subirFacturaService as upload } from "#src/services/empresario/factura.Service.js";
import { createFactoringService as create, type CreateFactoringDto } from "#src/services/empresario/factoring.Service.js";
import { updateFactorlimiteService } from "#src/services/admin/factorlimite.Service.js";
import { updateCedentelimiteService } from "#src/services/admin/cedentelimite.Service.js";
import { updatePagadorlimiteService } from "#src/services/admin/pagadorlimite.Service.js";
import * as factoringDao from "#src/daos/factoring.Dao.js";

const originalNow = Settings.now;
let workspace: ReturnType<typeof invoiceWorkspace>;
let user: Awaited<ReturnType<typeof seedMasters>>;
beforeEach(async () => {
  vi.resetAllMocks(); boundary.email.mockResolvedValue(undefined);
  Settings.now = () => Date.parse("2026-10-08T12:00:00Z");
  workspace = invoiceWorkspace(); boundary.root = workspace.root;
  user = await seedMasters();
});
afterEach(async () => {
  Settings.now = originalNow; vi.restoreAllMocks();
  try { await cleanFixtures(); } finally { workspace?.cleanup(); }
});
afterAll(async () => { await db.$disconnect(); });

async function invoice(currency: string, number = "123") {
  const xml = invoiceXml({ currency, terms: paymentTerm("FormaPago", "Credito", "1180") + paymentTerm("FormaPago", "Cuota001", "1180", "2026-12-01") }).replace("F001-123", `F001-${number}`);
  workspace.write(xml);
  const files = [];
  for (const [idarchivotipo, extension] of [[8, "xml"], [9, "pdf"]] as const) files.push(await db.archivo.create({ data: { idarchivotipo, idarchivoestado: 1, codigo: `IT-${extension}`, ruta: "", nombrereal: `factura.${extension}`, nombrealmacenamiento: `factura.${extension}`, mimetype: `application/${extension}`, extension, encoding: "utf8" } }));
  return await upload({ factura_xml: files[0].archivoid, factura_pdf: files[1].archivoid, idusuario: user.idusuario });
}
async function arrange(currency = "PEN") {
  const seeded = await seedOperationDependencies(user.idusuario, currency);
  const factura = await invoice(currency);
  boundary.telegram.mockClear();
  const dto: CreateFactoringDto = { facturas: [{ facturaid: factura.facturaid }], cedenteid: seeded.cedente.empresaid, aceptanteid: seeded.pagador.empresaid, cuentabancariaid: seeded.cuenta.cuentabancariaid, monedaid: seeded.moneda.monedaid, contactoaceptanteid: seeded.contacto.contactoid, monto_neto: "1", fecha_pago_estimado: "2026-12-01T00:00:00Z", dias_pago_estimado: "54", idusuario: user.idusuario };
  return { seeded, factura, dto };
}
async function lines() {
  return await Promise.all([db.factor_limite.findFirstOrThrow(), db.cedente_limite.findFirstOrThrow(), db.pagador_limite.findFirstOrThrow()]);
}
async function assertRolledBack(invoices = 1) {
  expect(await db.factoring.count()).toBe(0);
  expect(await db.factoring_historial_estado.count()).toBe(0);
  expect(await db.factoring_factura.count()).toBe(0);
  expect(await db.factura.count()).toBe(invoices);
  expect((await lines()).map(row => [row.usado.toString(), row.disponible.toString()])).toEqual([["0", "1180"], ["0", "1180"], ["0", "1180"]]);
}

describe("Creación de factoring: servicios, XML y SQL reales", () => {
  it.each(["PEN", "USD"])("crea en %s con importes de factura, estado inicial, historial y asociación; no consume líneas", async currency => {
    const f = await arrange(currency);
    const result = await create(f.dto);
    expect(result.monto_neto.toString()).toBe("1180"); // Ignora monto_neto=1 enviado por cliente.
    expect(result.monto_factura.toString()).toBe("1180");
    expect(result.cantidad_facturas).toBe(1);
    expect(result.idfactoringestado).toBe(1);
    expect(result.idusuariocrea).toBe(user.idusuario);
    expect(await db.factoring_factura.count()).toBe(1);
    expect(await db.factoring_historial_estado.findFirstOrThrow()).toMatchObject({ idfactoring: result.idfactoring, idfactoringestado: 1, idusuariocrea: user.idusuario });
    expect((await lines()).map(row => row.disponible.toString())).toEqual(["1180", "1180", "1180"]);
    expect(boundary.email).toHaveBeenCalledTimes(1);
    expect(boundary.telegram).toHaveBeenCalledTimes(1);
    expect((await factoringDao.getFactoringByIdfactoring(db, result.idfactoring))?.factoring_facturas).toHaveLength(1);
  });
  it("suma dos facturas Decimal sin concatenar y usa la emisión más antigua", async () => {
    const f = await arrange();
    const second = await invoice("PEN", "124");
    await db.factura.update({ where: { facturaid: second.facturaid }, data: { fecha_emision: new Date("2026-09-01"), importe_bruto: "100.25", importe_neto: "90.15", detraccion_monto: "5.05", retencion_monto: "5.05" } });
    f.dto.facturas.push({ facturaid: second.facturaid });
    const result = await create(f.dto);
    expect([result.monto_factura.toString(), result.monto_neto.toString(), result.monto_detraccion.toString(), result.monto_retencion.toString()]).toEqual(["1280.25", "1270.15", "5.05", "5.05"]);
    expect(result.fecha_emision).toEqual(new Date("2026-09-01"));
    expect(result.cantidad_facturas).toBe(2);
    expect(await db.factoring_factura.count()).toBe(2);
  });
  it.each(["factura", "cedenteid", "aceptanteid", "cuentabancariaid", "monedaid", "contactoaceptanteid", "persona", "colaborador"])("%s inexistente rechaza sin escritura parcial", async missing => {
    const f = await arrange();
    if (missing === "factura") f.dto.facturas[0].facturaid = "inexistente";
    else if (missing === "persona") {
      await db.colaborador.deleteMany({}); await db.persona.deleteMany({});
    } else if (missing === "colaborador") await db.colaborador.deleteMany({});
    else f.dto[missing as "cedenteid" | "aceptanteid" | "cuentabancariaid" | "monedaid" | "contactoaceptanteid"] = "inexistente";
    await expect(create(f.dto)).rejects.toMatchObject({ statusCode: 404 });
    await assertRolledBack();
    expect(boundary.email).not.toHaveBeenCalled();
  });
  it("factura repetida en el mismo payload provoca rollback de operación e historial", async () => {
    const f = await arrange(); f.dto.facturas.push(f.dto.facturas[0]);
    await expect(create(f.dto)).rejects.toMatchObject({ statusCode: 500 });
    await assertRolledBack();
  });
  it("segunda creación secuencial con la misma factura se rechaza sin duplicar asociación", async () => {
    const f = await arrange(); await create(f.dto);
    await expect(create(f.dto)).rejects.toMatchObject({ statusCode: 404 });
    expect(await db.factoring.count()).toBe(1);
    expect(await db.factoring_factura.count()).toBe(1);
    expect(boundary.email).toHaveBeenCalledTimes(1);
  });
  it.each(["factoring_historial_estado", "factoring_factura"])("fallo SQL en %s revierte la operación completa", async table => {
    const f = await arrange();
    await db.$executeRawUnsafe(`CREATE TRIGGER it_reject_operation BEFORE INSERT ON \`${table}\` FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='synthetic operation failure'`);
    try {
      await expect(create(f.dto)).rejects.toMatchObject({ statusCode: 500 });
      await assertRolledBack();
      expect(boundary.email).not.toHaveBeenCalled();
    } finally { await db.$executeRawUnsafe("DROP TRIGGER it_reject_operation"); }
  });
  it("fallo de email revierte operación, historial y asociaciones, conservando la factura", async () => {
    const f = await arrange(); const failure = new Error("synthetic email failure"); boundary.email.mockRejectedValueOnce(failure);
    await expect(create(f.dto)).rejects.toBe(failure);
    await assertRolledBack(); expect(boundary.telegram).not.toHaveBeenCalled();
  });
  it.each([false, true])("dos solicitudes no crean dos operaciones con la misma factura (copias XML: %s)", async copies => {
    const f = await arrange();
    const secondDto = { ...f.dto, facturas: copies ? [{ facturaid: (await invoice("PEN")).facturaid }] : f.dto.facturas };
    boundary.telegram.mockClear();
    const original = factoringDao.getFactoringByRucCedenteAndCodigoFactura;
    let reads = 0;
    const seen = new WeakSet<object>();
    let firstRead!: () => void; const started = new Promise<void>(resolve => { firstRead = resolve; });
    let bothRead!: () => void; const ready = new Promise<void>(resolve => { bothRead = resolve; });
    let releaseSecond!: () => void; const firstCommitted = new Promise<void>(resolve => { releaseSecond = resolve; });
    vi.spyOn(factoringDao, "getFactoringByRucCedenteAndCodigoFactura").mockImplementation(async (...args) => {
      const row = await original(...args);
      if (seen.has(args[0])) return row; // Revalidación SQL real después del bloqueo.
      seen.add(args[0]);
      expect(row).toBeNull();
      const position = ++reads;
      if (position === 1) firstRead(); if (position === 2) bothRead();
      await ready; if (position === 2) await firstCommitted;
      return row;
    });
    const first = create(f.dto).finally(() => { firstRead(); releaseSecond(); });
    const firstResult = Promise.allSettled([first]);
    await started;
    const secondResult = Promise.allSettled([create(secondDto)]);
    const results = [...await firstResult, ...await secondResult];
    expect(reads).toBe(2);
    expect({ successful: results.filter(r => r.status === "fulfilled").length, operations: await db.factoring.count(), links: await db.factoring_factura.count(), histories: await db.factoring_historial_estado.count(), emails: boundary.email.mock.calls.length }).toEqual({ successful: 1, operations: 1, links: 1, histories: 1, emails: 1 });
    expect(results[1]).toMatchObject({ status: "rejected", reason: { statusCode: 404 } });
    expect((await lines()).map(row => row.disponible.toString())).toEqual(["1180", "1180", "1180"]);
  });
  it("solicitudes simultáneas sin coordinador no duplican operaciones", async () => {
    const f = await arrange();
    const results = await Promise.allSettled([create(f.dto), create(f.dto)]);
    expect(results.filter(r => r.status === "fulfilled")).toHaveLength(1);
    expect(results.find(r => r.status === "rejected")).toMatchObject({ reason: { statusCode: 404 } });
    expect(await db.factoring.count()).toBe(1);
    expect(await db.factoring_historial_estado.count()).toBe(1);
    expect(boundary.email).toHaveBeenCalledTimes(1);
  });
  it("dos facturas distintas del mismo cedente pueden crear operaciones concurrentes", async () => {
    const f = await arrange(); const second = await invoice("PEN", "124");
    const results = await Promise.allSettled([create(f.dto), create({ ...f.dto, facturas: [{ facturaid: second.facturaid }] })]);
    expect(results.map(r => r.status)).toEqual(["fulfilled", "fulfilled"]);
    expect(await db.factoring.count()).toBe(2);
    expect(await db.factoring_factura.count()).toBe(2);
    expect((await lines()).map(row => row.disponible.toString())).toEqual(["1180", "1180", "1180"]);
  });
  it("fallo en la segunda asociación revierte también la primera y conserva ambas facturas", async () => {
    const f = await arrange(); const second = await invoice("PEN", "124");
    f.dto.facturas.push({ facturaid: second.facturaid });
    const saved = await db.factura.findUniqueOrThrow({ where: { facturaid: second.facturaid } });
    await db.$executeRawUnsafe(`CREATE TRIGGER it_reject_second_link BEFORE INSERT ON factoring_factura FOR EACH ROW BEGIN IF NEW._idfactura=${saved.idfactura} THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='synthetic second link failure'; END IF; END`);
    try {
      await expect(create(f.dto)).rejects.toMatchObject({ statusCode: 500 });
      await assertRolledBack(2);
      expect(boundary.email).not.toHaveBeenCalled();
    } finally { await db.$executeRawUnsafe("DROP TRIGGER it_reject_second_link"); }
  });
});

describe("Líneas: actualización administrativa real, sin reserva implícita", () => {
  it.each(["factor", "cedente", "pagador"])("actualiza %s: disponible=total-usado y conserva actor", async kind => {
    await arrange();
    if (kind === "factor") await updateFactorlimiteService({ factorlimiteid: (await db.factor_limite.findFirstOrThrow()).factorlimiteid, total: 2000.25, usado: 1180.10, idusuario: user.idusuario });
    if (kind === "cedente") await updateCedentelimiteService({ cedentelimiteid: (await db.cedente_limite.findFirstOrThrow()).cedentelimiteid, total: 2000.25, usado: 1180.10, idusuario: user.idusuario });
    if (kind === "pagador") await updatePagadorlimiteService({ pagadorlimiteid: (await db.pagador_limite.findFirstOrThrow()).pagadorlimiteid, total: 2000.25, usado: 1180.10, idusuario: user.idusuario });
    const row = (await lines())[["factor", "cedente", "pagador"].indexOf(kind)];
    expect([row.total.toString(), row.usado.toString(), row.disponible.toString()]).toEqual(["2000.25", "1180.1", "820.15"]);
    expect(row.idusuariomod).toBe(user.idusuario);
  });
  it.each(["factor", "cedente", "pagador"])("fallo SQL al actualizar %s conserva los saldos anteriores", async kind => {
    await arrange();
    const table = `${kind}_limite`;
    await db.$executeRawUnsafe(`CREATE TRIGGER it_reject_line BEFORE UPDATE ON \`${table}\` FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='synthetic line update failure'`);
    try {
      const update = async () => {
        if (kind === "factor") return await updateFactorlimiteService({ factorlimiteid: (await db.factor_limite.findFirstOrThrow()).factorlimiteid, total: 2000.25, usado: 1180.10, idusuario: user.idusuario });
        if (kind === "cedente") return await updateCedentelimiteService({ cedentelimiteid: (await db.cedente_limite.findFirstOrThrow()).cedentelimiteid, total: 2000.25, usado: 1180.10, idusuario: user.idusuario });
        return await updatePagadorlimiteService({ pagadorlimiteid: (await db.pagador_limite.findFirstOrThrow()).pagadorlimiteid, total: 2000.25, usado: 1180.10, idusuario: user.idusuario });
      };
      await expect(update()).rejects.toMatchObject({ statusCode: 500 });
      await assertRolledBack();
    } finally { await db.$executeRawUnsafe("DROP TRIGGER it_reject_line"); }
  });
});
