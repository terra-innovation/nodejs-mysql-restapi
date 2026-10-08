import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Settings } from "luxon";
import { db, cleanFixtures, seedEntrepreneur, seedMasters } from "./businessSupport.js";
import { invoiceWorkspace, invoiceXml, paymentTerm } from "../vitest/support/invoiceFixture.js";

const boundary = vi.hoisted(() => ({ root: "", telegram: vi.fn() }));
vi.mock("#src/config.js", () => ({ env: {}, isProduction: true }));
vi.mock("#src/models/prisma/db-factoring.js", async () => ({ prismaFT: { client: (await import("./businessSupport.js")).db, transactionTimeout: 10000 } }));
vi.mock("#src/utils/storageUtils.js", () => ({ get STORAGE_PATH_SUCCESS() { return boundary.root; } }));
vi.mock("#src/utils/logger.pino.js", () => ({ line: () => "integration", log: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock("#src/providers/telegram/telegram.Provider.js", () => ({ sendMessageImportant: boundary.telegram }));
import { subirFacturaService as upload } from "#src/services/empresario/factura.Service.js";
import { insertEmpresa, getEmpresaByRuc } from "#src/daos/empresa.Dao.js";
import * as monedaDao from "#src/daos/moneda.Dao.js";

const originalNow = Settings.now;
let workspace: ReturnType<typeof invoiceWorkspace>;
let user: Awaited<ReturnType<typeof seedMasters>>;
beforeEach(async () => {
  vi.resetAllMocks();
  // Solo reloj de negocio: no fake timers en Prisma, Docker ni conexiones.
  Settings.now = () => Date.parse("2026-10-08T12:00:00Z");
  workspace = invoiceWorkspace(); boundary.root = workspace.root;
  user = await seedMasters();
});
afterEach(async () => {
  Settings.now = originalNow; vi.restoreAllMocks();
  try { await cleanFixtures(); } finally { workspace?.cleanup(); }
});
afterAll(async () => { await db.$disconnect(); });

function eligibleXml(currency = "PEN", dueDate = "2026-12-01") {
  return invoiceXml({ currency, terms: paymentTerm("FormaPago", "Credito", "1180") + paymentTerm("FormaPago", "Cuota001", "1180", dueDate) });
}
async function files(xml = eligibleXml()) {
  workspace.write(xml);
  const result = [];
  for (const [idarchivotipo, extension] of [[8, "xml"], [9, "pdf"]] as const) result.push(await db.archivo.create({ data: { idarchivotipo, idarchivoestado: 1, codigo: `IT-${extension}`, ruta: "", nombrereal: `factura.${extension}`, nombrealmacenamiento: `factura.${extension}`, mimetype: `application/${extension}`, extension, encoding: "utf8" } }));
  return { factura_xml: result[0].archivoid, factura_pdf: result[1].archivoid, idusuario: user.idusuario };
}
async function assertNoImport() {
  for (const table of ["factura", "factura_item", "factura_nota", "factura_impuesto", "factura_medio_pago", "factura_termino_pago", "archivo_factura"] as const) {
    const rows = await db.$queryRawUnsafe<Array<{ total: bigint }>>(`SELECT COUNT(*) AS total FROM \`${table}\``);
    expect(Number(rows[0].total), table).toBe(0);
  }
  expect(await db.empresa.count()).toBe(2);
}

describe("Registro XML empresario: elegibilidad y persistencia reales", () => {
  it.each(["PEN", "USD"])("acepta %s con una cuota y líneas exactamente iguales al neto; reutiliza empresas", async currency => {
    const seeded = await seedEntrepreneur(user.idusuario, currency);
    const result = await upload(await files(eligibleXml(currency)));
    expect(result).toMatchObject({ importe_neto: 1180, monedaid: seeded.moneda.monedaid, cliente: { empresaid: seeded.pagador.empresaid }, proveedor: { empresaid: seeded.cedente.empresaid } });
    expect(result).not.toHaveProperty("items");
    const saved = await db.factura.findFirstOrThrow({ include: { factura_itemes: true, factura_termino_pagos: true, archivo_facturas: true } });
    expect(saved.idusuarioupload).toBe(user.idusuario);
    expect(saved.factura_itemes[0].moneda).toBe(currency);
    expect(saved.factura_itemes[0].cantidad.toNumber()).toBe(2);
    expect(saved.factura_termino_pagos).toHaveLength(2);
    expect(saved.archivo_facturas).toHaveLength(2);
    expect(await db.empresa.count()).toBe(2);
    expect(await db.factoring.count()).toBe(0); // La carga no crea la operación.
    expect((await db.factor_limite.findFirstOrThrow()).disponible.toNumber()).toBe(1180);
    expect(boundary.telegram).toHaveBeenCalledTimes(1);
  });
  it.each(["otro usuario", "asociacion inactiva", "cedente inactivo"])("rechaza %s sin dejar factura", async scenario => {
    const seeded = await seedEntrepreneur(user.idusuario);
    const dto = await files();
    if (scenario === "otro usuario") {
      const { idusuario: _id, usuarioid: _uuid, ...data } = user;
      const other = await db.usuario.create({ data: { ...data, code: "IT-OTRO", documentonumero: "IT-0002", email: "otro@example.test", hash: "it-otro-hash" } });
      dto.idusuario = other.idusuario;
    }
    if (scenario === "asociacion inactiva") await db.usuario_servicio_empresa.updateMany({ data: { estado: 0 } });
    if (scenario === "cedente inactivo") await db.empresa.update({ where: { idempresa: seeded.cedente.idempresa }, data: { estado: 0 } });
    await expect(upload(dto)).rejects.toMatchObject({ statusCode: 404 });
    await assertNoImport();
    expect(boundary.telegram).not.toHaveBeenCalled();
  });
  it.each([
    ["contado", invoiceXml({ terms: paymentTerm("FormaPago", "Contado", "1180") })],
    ["dos cuotas", invoiceXml()],
    ["vencimiento a cinco dias", eligibleXml("PEN", "2026-10-13")],
  ])("rechaza %s y revierte todos los detalles", async (_name, xml) => {
    await seedEntrepreneur(user.idusuario);
    await expect(upload(await files(xml))).rejects.toMatchObject({ statusCode: 404 });
    await assertNoImport();
  });
  it("acepta vencimiento a seis días: frontera de la regla superior a cinco", async () => {
    await seedEntrepreneur(user.idusuario);
    await expect(upload(await files(eligibleXml("PEN", "2026-10-14")))).resolves.toMatchObject({ dias_estimados_para_pago: 6 });
  });
  for (const table of ["factor_limite", "cedente_limite", "pagador_limite"] as const) {
    it.each(["sin linea", "linea inactiva", "neto excede disponible"])(`${table}: %s devuelve 422 sin registros parciales`, async scenario => {
      await seedEntrepreneur(user.idusuario);
      if (scenario === "sin linea") await db.$executeRawUnsafe(`DELETE FROM \`${table}\``);
      if (scenario === "linea inactiva") await db.$executeRawUnsafe(`UPDATE \`${table}\` SET estado=0`);
      if (scenario === "neto excede disponible") await db.$executeRawUnsafe(`UPDATE \`${table}\` SET disponible=1179.99`);
      await expect(upload(await files())).rejects.toMatchObject({ statusCode: 422 });
      await assertNoImport();
      expect(boundary.telegram).toHaveBeenCalledTimes(1); // Aviso de límite, no de carga exitosa.
    });
  }
  it("pagador no registrado se rechaza y no se crea automáticamente", async () => {
    const seeded = await seedEntrepreneur(user.idusuario);
    await db.pagador_limite.deleteMany({});
    await db.empresa.delete({ where: { idempresa: seeded.pagador.idempresa } });
    await expect(upload(await files())).rejects.toMatchObject({ statusCode: 422 });
    expect(await db.factura.count()).toBe(0);
    expect(await db.empresa.count()).toBe(1);
    expect(await getEmpresaByRuc(db, "20600000002")).toBeNull();
  });
  it("moneda sin maestro se rechaza y revierte el guardado", async () => {
    await seedEntrepreneur(user.idusuario);
    await expect(upload(await files(eligibleXml("EUR")))).rejects.toMatchObject({ statusCode: 404 });
    await assertNoImport();
  });
  it("cedente desconocido no se crea automáticamente ni deja una factura", async () => {
    await seedEntrepreneur(user.idusuario);
    const xml = eligibleXml().replace("20100000001", "20900000007");
    await expect(upload(await files(xml))).rejects.toMatchObject({ statusCode: 404 });
    await assertNoImport();
    expect(await getEmpresaByRuc(db, "20900000007")).toBeNull();
  });
  it.each([1, 0])("factura vinculada a operación con estado lógico %s conserva el filtro de duplicados", async estado => {
    const seeded = await seedEntrepreneur(user.idusuario);
    const first = await upload(await files());
    const factura = await db.factura.findUniqueOrThrow({ where: { facturaid: first.facturaid } });
    await db.factoring_cartera.create({ data: { idfactoringcartera: 1, code: "IT-CARTERA", estado1: "Prueba" } });
    await db.factoring_estado.create({ data: { idfactoringestado: 3, code: "IT-3", estado1: "Prueba", estado2: "Prueba" } });
    const date = new Date("2026-10-08T12:00:00Z");
    const factoring = await db.factoring.create({ data: {
      code: "IT-FACTORING", idfactor: 1, idcedente: seeded.cedente.idempresa, idaceptante: seeded.pagador.idempresa,
      idmoneda: seeded.moneda.idmoneda, idfactoringestado: 3, estado, cantidad_facturas: 1,
      fecha_registro: date, fecha_emision: date, fecha_pago_estimado: date,
      monto_factura: 1180, monto_neto: 1180, monto_detraccion: 0, monto_retencion: 0,
    } });
    await db.factoring_factura.create({ data: { idfactoring: factoring.idfactoring, idfactura: factura.idfactura } });
    const dto = await files();
    if (estado === 1) {
      await expect(upload(dto)).rejects.toMatchObject({ statusCode: 404 });
      expect(await db.factura.count()).toBe(1);
      expect(await db.factura_item.count()).toBe(1);
      expect(await db.archivo_factura.count()).toBe(2);
      expect(boundary.telegram).toHaveBeenCalledTimes(1); // Solo primera carga.
    } else {
      await expect(upload(dto)).resolves.toHaveProperty("facturaid");
      expect(await db.factura.count()).toBe(2); // Comportamiento existente: solo operaciones activas bloquean.
    }
    expect(await db.empresa.count()).toBe(2);
    expect(await db.factoring_factura.count()).toBe(1);
  });
  it("fallo SQL al vincular PDF revierte la etapa de persistencia", async () => {
    await seedEntrepreneur(user.idusuario);
    const dto = await files();
    await db.$executeRawUnsafe("CREATE TRIGGER it_reject_entrepreneur_pdf BEFORE INSERT ON archivo_factura FOR EACH ROW BEGIN IF (SELECT _idarchivotipo FROM archivo WHERE _idarchivo=NEW._idarchivo)=9 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='synthetic PDF failure'; END IF; END");
    try {
      await expect(upload(dto)).rejects.toMatchObject({ statusCode: 500 });
      await assertNoImport();
      expect(boundary.telegram).not.toHaveBeenCalled();
    } finally { await db.$executeRawUnsafe("DROP TRIGGER it_reject_entrepreneur_pdf"); }
  });
  it("fallo SQL en enriquecimiento final revierte importación y conserva empresas existentes", async () => {
    await seedEntrepreneur(user.idusuario);
    const original = monedaDao.getMonedaByCodigo;
    let reads = 0;
    vi.spyOn(monedaDao, "getMonedaByCodigo").mockImplementation(async (tx, code) => {
      const moneda = await original(tx, code);
      if (++reads === 2) await tx.$queryRawUnsafe("SELECT * FROM __it_missing_table"); // Fallo SQL real en etapa final.
      return moneda;
    });
    await expect(upload(await files())).rejects.toThrow();
    expect(reads).toBe(2);
    await assertNoImport();
    expect(boundary.telegram).not.toHaveBeenCalled();
  });
});

describe("Empresa: creación mediante DAO y transacciones reales (fuera de elegibilidad XML)", () => {
  it("crea, lee por RUC y rechaza duplicado sin reemplazar la empresa", async () => {
    const created = await db.$transaction(tx => insertEmpresa(tx, { code: "IT-NUEVA", ruc: "20900000001", razon_social: "Nueva sintetica", idusuariocrea: user.idusuario }));
    expect((await getEmpresaByRuc(db, created.ruc))?.empresaid).toBe(created.empresaid);
    await expect(db.$transaction(tx => insertEmpresa(tx, { code: "IT-OTRA", ruc: created.ruc, razon_social: "Duplicada" }))).rejects.toMatchObject({ statusCode: 500 });
    expect(await db.empresa.count()).toBe(1);
  });
  it("fallo SQL al crear la segunda empresa revierte también la primera", async () => {
    await expect(db.$transaction(async tx => {
      await insertEmpresa(tx, { code: "IT-PRIMERA", ruc: "20900000001", razon_social: "Primera" });
      await insertEmpresa(tx, { code: "IT-SEGUNDA", ruc: "20900000001", razon_social: "Segunda" });
    })).rejects.toMatchObject({ statusCode: 500 });
    expect(await db.empresa.count()).toBe(0);
  });
});
