import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db, cleanFixtures, seedApproval, seedMasters } from "./businessSupport.js";
import { invoiceWorkspace, invoiceXml } from "../vitest/support/invoiceFixture.js";

// Se sustituyen solo configuración local, almacenamiento y envío externo.
// Prisma, transacciones, parser, servicios y todos los DAOs siguen siendo reales.
const boundary = vi.hoisted(() => ({ root: "", email: vi.fn(), telegram: vi.fn() }));
vi.mock("#src/config.js", () => ({ env: {}, isProduction: true }));
vi.mock("#src/models/prisma/db-factoring.js", async () => ({ prismaFT: { client: (await import("./businessSupport.js")).db, transactionTimeout: 10000 } }));
vi.mock("#src/utils/storageUtils.js", () => ({ get STORAGE_PATH_SUCCESS() { return boundary.root; } }));
vi.mock("#src/utils/logger.pino.js", () => ({ line: () => "integration", log: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock("#src/providers/email/email.Provider.js", () => ({ sendFactoringEmpresaServicioFactoringPropuestaAceptada: boundary.email }));
vi.mock("#src/providers/telegram/telegram.Provider.js", () => ({ sendMessageImportant: boundary.telegram }));
import { subirFacturaFactorService as upload } from "#src/services/admin/factura.Service.js";
import { acceptFactoringpropuestaService as accept } from "#src/services/empresario/factoringpropuesta.Service.js";
import * as propuestaDao from "#src/daos/factoringpropuesta.Dao.js";
import { getFacturaByIdarchivo } from "#src/daos/factura.Dao.js";

let workspace: ReturnType<typeof invoiceWorkspace>;
let user: Awaited<ReturnType<typeof seedMasters>>;
beforeEach(async () => {
  vi.clearAllMocks();
  boundary.email.mockResolvedValue(undefined);
  workspace = invoiceWorkspace(); boundary.root = workspace.root;
  user = await seedMasters();
});
afterEach(async () => { vi.restoreAllMocks(); await cleanFixtures(); workspace?.cleanup(); });
afterAll(async () => { await db.$disconnect(); });

async function files(xml: string) {
  workspace.write(xml);
  const result = [];
  for (const [idarchivotipo, extension] of [[8, "xml"], [9, "pdf"]] as const) result.push(await db.archivo.create({ data: { idarchivotipo, idarchivoestado: 1, codigo: `IT-${extension}`, ruta: "", nombrereal: `factura.${extension}`, nombrealmacenamiento: `factura.${extension}`, mimetype: `application/${extension}`, extension, encoding: "utf8" } }));
  return { xml: result[0], dto: { factura_xml: result[0].archivoid, factura_pdf: result[1].archivoid } };
}

describe("XML: guardado, lectura y rollback reales", () => {
  it.each(["PEN", "USD"])("persiste moneda %s, fechas y todos los detalles; vuelve a leer por Prisma y DAO", async currency => {
    const f = await files(invoiceXml({ currency }));
    const result = await upload(f.dto, user.idusuario);
    const saved = await db.factura.findUniqueOrThrow({ where: { facturaid: result.facturaid }, include: { factura_itemes: true, factura_notas: true, factura_termino_pagos: true, factura_impuestos: true, factura_medio_pagos: true, archivo_facturas: true } });
    expect(saved.fecha_emision).toEqual(new Date("2026-10-01"));
    expect(saved.fecha_vencimiento).toEqual(new Date("2026-12-01"));
    expect(saved.codigo_tipo_moneda).toBe(currency);
    expect(saved.factura_itemes).toHaveLength(1);
    expect(saved.factura_itemes[0]).toMatchObject({ moneda: currency, descripcion: "Servicio de prueba" });
    expect(saved.factura_itemes[0].cantidad.toNumber()).toBe(2);
    expect(saved.factura_notas).toHaveLength(2);
    expect(saved.factura_termino_pagos).toHaveLength(3);
    expect(saved.factura_impuestos).toHaveLength(1);
    expect(saved.factura_medio_pagos).toHaveLength(1);
    expect(saved.archivo_facturas).toHaveLength(2);
    expect((await getFacturaByIdarchivo(db, f.xml.idarchivo, [1]))?.facturaid).toBe(saved.facturaid);
    expect(Number(saved.importe_neto)).toBe(1180);
  });
  it("vencimiento ausente permanece NULL al leer desde MariaDB", async () => {
    const f = await files(invoiceXml().replace("<cbc:DueDate>2026-12-01</cbc:DueDate>", ""));
    const result = await upload(f.dto, user.idusuario);
    expect((await db.factura.findUniqueOrThrow({ where: { facturaid: result.facturaid } })).fecha_vencimiento).toBeNull();
  });
  it("fallo SQL tardío al vincular el PDF revierte cabecera, detalles y primer vínculo", async () => {
    const f = await files(invoiceXml());
    // Fallo real del motor, después de insertar detalles y vínculo XML; sin fingir DAOs.
    await db.$executeRawUnsafe("CREATE TRIGGER it_reject_pdf BEFORE INSERT ON archivo_factura FOR EACH ROW BEGIN IF (SELECT _idarchivotipo FROM archivo WHERE _idarchivo=NEW._idarchivo)=9 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='synthetic PDF link failure'; END IF; END");
    try {
      await expect(upload(f.dto, user.idusuario)).rejects.toMatchObject({ statusCode: 500 });
      for (const table of ["factura", "factura_item", "factura_nota", "factura_impuesto", "factura_medio_pago", "factura_termino_pago", "archivo_factura"] as const) {
        const rows = await db.$queryRawUnsafe<Array<{ total: bigint }>>(`SELECT COUNT(*) AS total FROM \`${table}\``);
        expect(Number(rows[0].total), table).toBe(0);
      }
      expect(await db.archivo.count()).toBe(2);
    } finally { await db.$executeRawUnsafe("DROP TRIGGER it_reject_pdf"); }
  });
  it.each(["<Invoice><ID>", invoiceXml({ type: "03" })])("XML inválido se rechaza sin registros parciales", async xml => {
    const f = await files(xml);
    await expect(upload(f.dto, user.idusuario)).rejects.toThrow();
    expect(await db.factura.count()).toBe(0);
    expect(await db.factura_item.count()).toBe(0);
    expect(await db.archivo_factura.count()).toBe(0);
  });
  it("moneda sin maestro revierte toda la importación", async () => {
    const f = await files(invoiceXml({ currency: "EUR" })); // Sin maestro EUR sintético.
    await expect(upload(f.dto, user.idusuario)).rejects.toMatchObject({ statusCode: 422 });
    expect(await db.factura.count()).toBe(0);
    expect(await db.factura_item.count()).toBe(0);
    expect(await db.archivo_factura.count()).toBe(0);
    expect(await db.archivo.count()).toBe(2);
  });
});

describe("Aprobación: estados, rollback y concurrencia reales", () => {
  it("aprueba, vincula la propuesta, registra ambos historiales y rechaza la repetición", async () => {
    const f = await seedApproval(user.idusuario);
    await accept(f.dto);
    expect(await db.factoring.findUniqueOrThrow({ where: { idfactoring: f.factoring.idfactoring } })).toMatchObject({ idfactoringestado: 4, idfactoringpropuestaaceptada: f.propuesta.idfactoringpropuesta });
    expect(await db.factoring_propuesta.findUniqueOrThrow({ where: { idfactoringpropuesta: f.propuesta.idfactoringpropuesta } })).toMatchObject({ idfactoringpropuestaestado: 6 });
    expect(await db.factoring_historial_estado.count()).toBe(1);
    expect(await db.factoring_propuesta_historial_estado.count()).toBe(1);
    await expect(accept(f.dto)).rejects.toMatchObject({ statusCode: 404 });
    expect(await db.factoring_historial_estado.count()).toBe(1);
    expect(boundary.email).toHaveBeenCalledTimes(1);
  });
  it("otro usuario no puede aprobar y no deja escrituras", async () => {
    const f = await seedApproval(user.idusuario);
    await expect(accept({ ...f.dto, idusuario: user.idusuario + 1000 })).rejects.toMatchObject({ statusCode: 404 });
    expect(await db.factoring_historial_estado.count()).toBe(0);
    expect(await db.factoring_propuesta_historial_estado.count()).toBe(0);
  });
  it("si la propuesta pierde vigencia después de leerla, revierte la reserva y el historial", async () => {
    const f = await seedApproval(user.idusuario);
    const original = propuestaDao.getFactoringpropuestaVigenteByIdfactoringpropuestaIdfactoring;
    vi.spyOn(propuestaDao, "getFactoringpropuestaVigenteByIdfactoringpropuestaIdfactoring").mockImplementationOnce(async (...args) => {
      const row = await original(...args);
      expect(row).not.toBeNull();
      await db.factoring_propuesta.update({ where: { idfactoringpropuesta: f.propuesta.idfactoringpropuesta }, data: { estado: 0 } });
      return row;
    });
    await expect(accept(f.dto)).rejects.toMatchObject({ statusCode: 409 });
    expect(await db.factoring.findUniqueOrThrow({ where: { idfactoring: f.factoring.idfactoring } })).toMatchObject({ idfactoringestado: 3, idfactoringpropuestaaceptada: null });
    expect(await db.factoring_historial_estado.count()).toBe(0);
    expect(await db.factoring_propuesta_historial_estado.count()).toBe(0);
    expect(boundary.email).not.toHaveBeenCalled();
    expect(boundary.telegram).not.toHaveBeenCalled();
  });
  it("solicitudes simultáneas sin coordinador dejan una sola aprobación", async () => {
    const f = await seedApproval(user.idusuario);
    const results = await Promise.allSettled([accept(f.dto), accept(f.dto)]);
    expect(results.filter(result => result.status === "fulfilled")).toHaveLength(1);
    const rejected = results.find(result => result.status === "rejected") as PromiseRejectedResult;
    expect([404, 409]).toContain(rejected.reason.statusCode);
    expect(await db.factoring_historial_estado.count()).toBe(1);
    expect(await db.factoring_propuesta_historial_estado.count()).toBe(1);
    expect(boundary.email).toHaveBeenCalledTimes(1);
    expect(boundary.telegram).toHaveBeenCalledTimes(1);
  });
  it("error de proveedor de email revierte estados, vínculo y ambos historiales", async () => {
    const f = await seedApproval(user.idusuario);
    const failure = new Error("synthetic email failure"); boundary.email.mockRejectedValueOnce(failure);
    await expect(accept(f.dto)).rejects.toBe(failure);
    expect(await db.factoring.findUniqueOrThrow({ where: { idfactoring: f.factoring.idfactoring } })).toMatchObject({ idfactoringestado: 3, idfactoringpropuestaaceptada: null });
    expect(await db.factoring_propuesta.findUniqueOrThrow({ where: { idfactoringpropuesta: f.propuesta.idfactoringpropuesta } })).toMatchObject({ idfactoringpropuestaestado: 4 });
    expect(await db.factoring_historial_estado.count()).toBe(0);
    expect(await db.factoring_propuesta_historial_estado.count()).toBe(0);
    expect(boundary.telegram).not.toHaveBeenCalled();
  });
  it("fallo SQL al actualizar factoring revierte el cambio de propuesta y ambos historiales", async () => {
    const f = await seedApproval(user.idusuario);
    await db.$executeRawUnsafe("CREATE TRIGGER it_reject_approval BEFORE UPDATE ON factoring FOR EACH ROW BEGIN IF NEW._idfactoringestado=4 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='synthetic approval failure'; END IF; END");
    try {
      await expect(accept(f.dto)).rejects.toMatchObject({ statusCode: 500 });
      expect(await db.factoring.findUniqueOrThrow({ where: { idfactoring: f.factoring.idfactoring } })).toMatchObject({ idfactoringestado: 3, idfactoringpropuestaaceptada: null });
      expect(await db.factoring_propuesta.findUniqueOrThrow({ where: { idfactoringpropuesta: f.propuesta.idfactoringpropuesta } })).toMatchObject({ idfactoringpropuestaestado: 4 });
      expect(await db.factoring_historial_estado.count()).toBe(0);
      expect(await db.factoring_propuesta_historial_estado.count()).toBe(0);
      expect(boundary.email).not.toHaveBeenCalled();
    } finally { await db.$executeRawUnsafe("DROP TRIGGER it_reject_approval"); }
  });
  it.each([false, true])("dos solicitudes concurrentes aprueban una sola vez (propuestas distintas: %s)", async differentProposal => {
    const f = await seedApproval(user.idusuario);
    const competing = differentProposal ? await db.factoring_propuesta.create({ data: {
      code: "IT-PROPUESTA-2", idfactoring: f.factoring.idfactoring, idfactoringpropuestaestado: 4,
      fecha_propuesta: f.propuesta.fecha_propuesta, fecha_pago_estimado: f.propuesta.fecha_pago_estimado,
      dias_pago_estimado: 30, dias_antiguedad_estimado: 0, monto_neto: 1180,
    } }) : f.propuesta;
    const original = propuestaDao.getFactoringpropuestaVigenteByIdfactoringpropuestaIdfactoring;
    let readCount = 0;
    let firstRead!: () => void; const started = new Promise<void>(resolve => { firstRead = resolve; });
    let bothRead!: () => void; const ready = new Promise<void>(resolve => { bothRead = resolve; });
    let releaseSecond!: () => void; const firstCommitted = new Promise<void>(resolve => { releaseSecond = resolve; });
    vi.spyOn(propuestaDao, "getFactoringpropuestaVigenteByIdfactoringpropuestaIdfactoring").mockImplementation(async (...args) => {
      const row = await original(...args); // Lectura SQL real en cada transacción.
      expect(row).not.toBeNull();
      const position = ++readCount;
      if (position === 1) firstRead();
      if (position === 2) bothRead();
      await ready;
      if (position === 2) await firstCommitted;
      return row;
    });
    const first = accept(f.dto).finally(() => { firstRead(); releaseSecond(); });
    // Registrar inmediatamente el resultado para evitar rechazos sin consumidor si cambia el flujo.
    const firstResult = Promise.allSettled([first]);
    await started;
    const second = accept({ ...f.dto, factoringpropuestaid: competing.factoringpropuestaid });
    const secondResult = Promise.allSettled([second]);
    const results = [...await firstResult, ...await secondResult];
    expect(readCount).toBe(2);
    const observed = {
      aprobaciones: results.filter(result => result.status === "fulfilled").length,
      historialFactoring: await db.factoring_historial_estado.count(),
      historialPropuesta: await db.factoring_propuesta_historial_estado.count(),
      emails: boundary.email.mock.calls.length,
      telegram: boundary.telegram.mock.calls.length,
    };
    expect(observed).toEqual({ aprobaciones: 1, historialFactoring: 1, historialPropuesta: 1, emails: 1, telegram: 1 });
    expect(results[0].status).toBe("fulfilled");
    expect(results[1]).toMatchObject({ status: "rejected", reason: { statusCode: 409 } });
    expect(await db.factoring.findUniqueOrThrow({ where: { idfactoring: f.factoring.idfactoring } })).toMatchObject({ idfactoringestado: 4, idfactoringpropuestaaceptada: f.propuesta.idfactoringpropuesta });
    if (differentProposal) expect(await db.factoring_propuesta.findUniqueOrThrow({ where: { idfactoringpropuesta: competing.idfactoringpropuesta } })).toMatchObject({ idfactoringpropuestaestado: 4 });
  });
});
