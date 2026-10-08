import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import PDFDocument from "pdfkit";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { Settings } from "luxon";
import { db, cleanFixtures, seedAuthorization, seedMasters, seedEntrepreneur, seedApproval } from "./businessSupport.js";
import { invoiceWorkspace, invoiceXml, paymentTerm } from "../vitest/support/invoiceFixture.js";

const boundary = vi.hoisted(() => ({ root: "", telegram: vi.fn() }));
const secret = "ft-mariadb-http-synthetic-secret";
vi.mock("#src/config.js", () => ({ env: { TOKEN_KEY_JWT: "ft-mariadb-http-synthetic-secret" }, isProduction: true }));
vi.mock("#src/models/prisma/db-factoring.js", async () => ({ prismaFT: { client: (await import("./businessSupport.js")).db, transactionTimeout: 10000 } }));
vi.mock("#src/utils/storageUtils.js", async importOriginal => ({
  ...await importOriginal<typeof import("#src/utils/storageUtils.js")>(),
  get STORAGE_PATH_PROCESAR() { return path.join(boundary.root, "procesar"); },
  get STORAGE_PATH_SUCCESS() { return path.join(boundary.root, "success"); },
  get STORAGE_PATH_FAIL() { return path.join(boundary.root, "fail"); },
  get STORAGE_PATH_INVALID() { return path.join(boundary.root, "invalid"); },
}));
vi.mock("#src/utils/logger.pino.js", () => ({ line: () => "integration", log: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock("#src/providers/telegram/telegram.Provider.js", () => ({ sendMessageException: boundary.telegram, sendMessageImportant: boundary.telegram }));
import filesRoutes from "#src/routes/usuario/archivo.routes.js";
import adminRoutes from "#src/routes/admin/factura.routes.js";
import financialRoutes from "#src/routes/financiero/factura.routes.js";
import entrepreneurRoutes from "#src/routes/empresario/servicio/factoring/factura.routes.js";
import { errorHandlerMiddleware } from "#src/middlewares/errorHandlerMiddleware.js";

const app = express(); app.use(express.json());
app.use("/api/v1", filesRoutes, adminRoutes, financialRoutes, entrepreneurRoutes);
app.use(errorHandlerMiddleware);
const uploadURL = "/api/v1/usuario/archivo/cargar";
const adminURL = "/api/v1/admin/factura/factor/subir";
const financialURL = "/api/v1/financiero/factura/factor/subir";
const entrepreneurURL = "/api/v1/empresario/servicio/factoring/factura/subir";
const xmlCode = "ITXML001"; const pdfCode = "ITPDF001";
let pdf: Buffer;
let workspace: ReturnType<typeof invoiceWorkspace>;
let user: Awaited<ReturnType<typeof seedMasters>>;
const originalNow = Settings.now;
beforeAll(async () => {
  pdf = await new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument(); const chunks: Buffer[] = [];
    doc.on("data", chunk => chunks.push(chunk)); doc.on("error", reject);
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.text("Factura sintetica de integracion"); doc.end();
  });
});
beforeEach(async () => {
  vi.clearAllMocks(); Settings.now = () => Date.parse("2026-10-08T12:00:00Z");
  workspace = invoiceWorkspace(); boundary.root = workspace.root;
  user = await seedMasters(); await seedAuthorization(user.idusuario);
  await db.archivo_tipo.update({ where: { idarchivotipo: 8 }, data: { code: xmlCode, extensiones_permitidas: ".xml", mimetypes_permitidos: "application/xml,text/xml", tamanio_maximo: 1048576 } });
  await db.archivo_tipo.update({ where: { idarchivotipo: 9 }, data: { code: pdfCode, extensiones_permitidas: ".pdf", mimetypes_permitidos: "application/pdf", tamanio_maximo: 1048576 } });
});
afterEach(async () => {
  Settings.now = originalNow;
  await db.$executeRawUnsafe("DROP TRIGGER IF EXISTS it_http_failure");
  try { await cleanFixtures(); } finally { workspace?.cleanup(); }
});
afterAll(async () => { await db.$disconnect(); });
function auth(roles = [5, 3], idusuario = user.idusuario) {
  return `Bearer ${jwt.sign({ usuario: { idusuario, usuario_roles: roles.map(idrol => ({ idrol })) } }, secret, { expiresIn: "1h" })}`;
}
function diskFiles(folder: string): string[] {
  try { return readdirSync(folder, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? diskFiles(path.join(folder, entry.name)) : [path.join(folder, entry.name)]); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return []; throw error; }
}
async function upload(content: Buffer, filename: string, code: string, contentType: string) {
  const result = await request(app).post(uploadURL).set("Authorization", auth()).field("archivotipo_code", code).attach("archivo", content, { filename, contentType }).expect(200);
  expect(result.body.error).toBe(false); return result.body.data.archivoid as string;
}
async function pair(xml = invoiceXml()) {
  return { factura_xml: await upload(Buffer.from(xml), "factura.xml", xmlCode, "application/xml"), factura_pdf: await upload(pdf, "factura.pdf", pdfCode, "application/pdf") };
}
async function noInvoice() {
  for (const table of ["factura", "factura_item", "factura_impuesto", "factura_medio_pago", "factura_nota", "factura_termino_pago", "archivo_factura"] as const) {
    const [row] = await db.$queryRawUnsafe<Array<{ total: bigint }>>(`SELECT COUNT(*) AS total FROM \`${table}\``);
    expect(Number(row.total), table).toBe(0);
  }
}

describe("HTTP, JWT, Multer, disco, parser y MariaDB reales", () => {
  for (const [url, role] of [[adminURL, 3], [financialURL, 6], [entrepreneurURL, 3]] as const) it.each(["PEN", "USD"])(`${url}, %s: carga ambos archivos, registra y lee moneda/fechas/actor`, async currency => {
    if (url === entrepreneurURL) await seedEntrepreneur(user.idusuario, currency);
    const xml = invoiceXml({ currency, terms: paymentTerm("FormaPago", "Credito", "1180") + paymentTerm("FormaPago", "Cuota001", "1180", "2026-12-01") });
    const dto = await pair(xml);
    expect(diskFiles(path.join(workspace.root, "procesar"))).toHaveLength(0);
    expect(diskFiles(path.join(workspace.root, "success"))).toHaveLength(2);
    const result = await request(app).post(url).set("Authorization", auth([role])).send({ ...dto, idusuario: 999999 }).expect(200);
    expect(result.body.error).toBe(false);
    const saved = await db.factura.findFirstOrThrow({ include: { factura_itemes: true, archivo_facturas: true, factura_termino_pagos: true } });
    expect(saved.facturaid).toBe(result.body.data.facturaid);
    expect(saved).toMatchObject({ codigo_tipo_moneda: currency, fecha_emision: new Date("2026-10-01"), fecha_vencimiento: new Date("2026-12-01"), idusuariocrea: user.idusuario, idusuarioupload: user.idusuario });
    expect(saved.importe_neto.toString()).toBe("1180");
    expect(saved.factura_itemes[0]).toMatchObject({ moneda: currency });
    expect(saved.archivo_facturas).toHaveLength(2); expect(saved.factura_termino_pagos).toHaveLength(2);
    for (const [id, bytes] of [[dto.factura_xml, Buffer.from(xml)], [dto.factura_pdf, pdf]] as const) {
      const file = await db.archivo.findUniqueOrThrow({ where: { archivoid: id } });
      expect(file.idusuariocrea).toBe(user.idusuario);
      expect(readFileSync(path.join(workspace.root, "success", file.ruta, file.nombrealmacenamiento))).toEqual(bytes);
      const download = await request(app).get(`/api/v1/usuario/archivo/descargar/${id}`).set("Authorization", auth([5])).buffer(true).parse((res, callback) => {
        const chunks: Buffer[] = []; res.on("data", chunk => chunks.push(Buffer.from(chunk))); res.on("end", () => callback(null, Buffer.concat(chunks)));
      }).expect(200);
      expect(download.body).toEqual(bytes);
    }
  });
  it("lee las facturas de una operación desde el router administrativo con rol 2", async () => {
    const dto = await pair();
    await request(app).post(adminURL).set("Authorization", auth([3])).send(dto).expect(200);
    const invoice = await db.factura.findFirstOrThrow(); const f = await seedApproval(user.idusuario);
    await db.factoring_factura.create({ data: { idfactoring: f.factoring.idfactoring, idfactura: invoice.idfactura } });
    const result = await request(app).get(`/api/v1/admin/factura/buscar/factoring/${f.factoring.factoringid}`).set("Authorization", auth([2])).expect(201);
    expect(result.body.data).toHaveLength(1); expect(result.body.data[0].facturaid).toBe(invoice.facturaid);
    await request(app).get(`/api/v1/admin/factura/buscar/factoring/${f.factoring.factoringid}`).set("Authorization", auth([3])).expect(403);
  });
});

describe("Eliminación de archivos por HTTP: contrato vigente", () => {
  const deleteURL = (id: string) => `/api/v1/usuario/archivo/eliminar/${id}`;
  async function snapshot() {
    const files = diskFiles(workspace.root);
    return { rows: await db.archivo.findMany({ orderBy: { idarchivo: "asc" } }), files, bytes: files.map(file => readFileSync(file)) };
  }
  async function download(id: string, bytes: Buffer) {
    const result = await request(app).get(`/api/v1/usuario/archivo/descargar/${id}`).set("Authorization", auth([5])).buffer(true).parse((res, callback) => {
      const chunks: Buffer[] = []; res.on("data", chunk => chunks.push(Buffer.from(chunk))); res.on("end", () => callback(null, Buffer.concat(chunks)));
    }).expect(200);
    expect(result.body).toEqual(bytes);
  }
  it.each(["sin sesión", "rol incorrecto", "JWT expirado", "sin roles", "firma inválida"])("%s rechaza eliminación sin efectos", async scenario => {
    const id = await upload(pdf, "previo.pdf", pdfCode, "application/pdf"); const before = await snapshot();
    const token = scenario === "rol incorrecto" ? auth([3]) : scenario === "JWT expirado"
      ? `Bearer ${jwt.sign({ usuario: { idusuario: user.idusuario, usuario_roles: [{ idrol: 5 }] }, exp: 1 }, secret)}`
      : scenario === "sin roles" ? auth([]) : "Bearer invalid";
    let req = request(app).delete(deleteURL(id));
    if (scenario !== "sin sesión") req = req.set("Authorization", token);
    const result = await req.expect(["JWT expirado", "firma inválida"].includes(scenario) ? 401 : 403);
    expect(result.body.error).toBe(true); expect(await snapshot()).toEqual(before);
    await noInvoice(); expect(boundary.telegram).not.toHaveBeenCalled();
  });
  it.each(["XML", "PDF"])("%s: elimina lógicamente, conserva contenido y permite descarga", async type => {
    const bytes = type === "XML" ? Buffer.from(invoiceXml()) : pdf;
    const id = await upload(bytes, type === "XML" ? "factura.xml" : "factura.pdf", type === "XML" ? xmlCode : pdfCode, type === "XML" ? "application/xml" : "application/pdf");
    const before = await snapshot(); const started = Date.now();
    const response = await request(app).delete(deleteURL(id)).set("Authorization", auth([5])).send({ idusuario: 999999 }).expect(204);
    expect(response.text).toBe("");
    const after = await snapshot(); const row = after.rows[0];
    expect(row).toEqual({ ...before.rows[0], estado: 2, idusuariomod: user.idusuario, fechamod: row.fechamod });
    expect(row.fechamod!.getTime()).toBeGreaterThanOrEqual(started);
    expect(row.fechamod!.getTime()).toBeLessThanOrEqual(Date.now());
    expect(after.files).toEqual(before.files); expect(after.bytes).toEqual(before.bytes);
    await download(id, bytes); await noInvoice();
  });
  it.each([["invalid", 400], ["00000000-0000-0000-0000-000000000000", 404]] as const)("identificador %s responde %s sin tocar otros archivos", async (id, status) => {
    await upload(pdf, "previo.pdf", pdfCode, "application/pdf"); const before = await snapshot();
    const result = await request(app).delete(deleteURL(id)).set("Authorization", auth([5])).expect(status);
    expect(result.body.error).toBe(true); expect(await snapshot()).toEqual(before); await noInvoice();
  });
  it.each(["XML", "PDF"])("%s vinculado a factura: eliminación lógica conserva factura, vínculo y descarga", async type => {
    const dto = await pair(); await request(app).post(adminURL).set("Authorization", auth([3])).send(dto).expect(200);
    const tables = ["factura", "factura_item", "factura_impuesto", "factura_medio_pago", "factura_nota", "factura_termino_pago", "archivo_factura"];
    const invoiceRows = async () => Promise.all(tables.map(table => db.$queryRawUnsafe(`SELECT * FROM \`${table}\``)));
    const invoiceBefore = await invoiceRows(); const before = await snapshot();
    const id = type === "XML" ? dto.factura_xml : dto.factura_pdf;
    await request(app).delete(deleteURL(id)).set("Authorization", auth([5])).expect(204);
    const after = await snapshot(); const target = after.rows.find(row => row.archivoid === id)!;
    expect(target.estado).toBe(2); expect(target.idusuariomod).toBe(user.idusuario);
    expect(after.rows).toEqual(before.rows.map(row => row.archivoid === id ? { ...row, estado: 2, idusuariomod: user.idusuario, fechamod: target.fechamod } : row));
    expect(after.files).toEqual(before.files); expect(after.bytes).toEqual(before.bytes);
    expect(await invoiceRows()).toEqual(invoiceBefore);
    await download(id, type === "XML" ? Buffer.from(invoiceXml()) : pdf);
  });
  it("otro usuario con rol 5 puede eliminar un archivo ajeno: limitación de pertenencia", async () => {
    const id = await upload(pdf, "ajeno.pdf", pdfCode, "application/pdf"); const before = await snapshot();
    const other = await db.usuario.create({ data: { code: "IT-OTHER", iddocumentotipo: 1, documentonumero: "IT-0002", usuarionombres: "Otro", apellidopaterno: "Prueba", apellidomaterno: "Prueba", email: "other@example.test", celular: "000000000", hash: "it-other-hash" } });
    await db.usuario_rol.create({ data: { idusuario: other.idusuario, idrol: 5 } });
    await request(app).delete(deleteURL(id)).set("Authorization", auth([5], other.idusuario)).expect(204);
    const after = await snapshot(); const row = after.rows[0];
    expect(row).toEqual({ ...before.rows[0], estado: 2, idusuariomod: other.idusuario, fechamod: row.fechamod });
    expect(after.files).toEqual(before.files); expect(after.bytes).toEqual(before.bytes); await noInvoice();
  });
  it("repetir la eliminación responde 204 y conserva una sola fila y copia", async () => {
    const id = await upload(pdf, "previo.pdf", pdfCode, "application/pdf"); const before = await snapshot();
    for (let i = 0; i < 2; i++) await request(app).delete(deleteURL(id)).set("Authorization", auth([5])).expect(204);
    const after = await snapshot(); expect(after.rows).toHaveLength(1); expect(after.rows[0].estado).toBe(2);
    expect(after.files).toEqual(before.files); expect(after.bytes).toEqual(before.bytes); await noInvoice();
  });
  it("fallo SQL durante eliminación devuelve 500 y conserva fila activa y contenido", async () => {
    const id = await upload(pdf, "previo.pdf", pdfCode, "application/pdf"); const before = await snapshot();
    await db.$executeRawUnsafe("CREATE TRIGGER it_http_failure BEFORE UPDATE ON archivo FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='IT failure'");
    const result = await request(app).delete(deleteURL(id)).set("Authorization", auth([5])).expect(500);
    expect(result.body.error).toBe(true); expect(await snapshot()).toEqual(before); await noInvoice();
    await download(id, pdf);
  });
});

describe("JWT expirados y sesiones sin roles válidos", () => {
  const cases = [
    ["expirado", 401, "Token inválido"],
    ["sin usuario", 401, "Token malformado"],
    ["sin roles", 403, "Acceso denegado"],
    ["roles nulos", 403, "Acceso denegado"],
    ["roles vacíos", 403, "Acceso denegado"],
    ["rol desconocido", 403, "Acceso denegado"],
  ] as const;
  function rejectedAuth(scenario: string) {
    const usuario: Record<string, unknown> = { idusuario: user.idusuario };
    if (scenario === "expirado") usuario.usuario_roles = [2, 3, 5, 6].map(idrol => ({ idrol }));
    if (scenario === "roles nulos") usuario.usuario_roles = null;
    if (scenario === "roles vacíos") usuario.usuario_roles = [];
    if (scenario === "rol desconocido") usuario.usuario_roles = [{ idrol: 999999 }];
    // Expiración fija en el pasado: no depende del reloj de Luxon ni de esperas.
    const payload = scenario === "sin usuario" ? {} : scenario === "expirado" ? { usuario, exp: 1 } : { usuario };
    return `Bearer ${jwt.sign(payload, secret)}`;
  }
  async function unchangedFiles(before: Awaited<ReturnType<typeof db.archivo.findMany>>, files: string[], hashes: string[]) {
    expect(await db.archivo.findMany()).toEqual(before);
    expect(diskFiles(workspace.root)).toEqual(files);
    expect(files.map(file => createHash("sha256").update(readFileSync(file)).digest("hex"))).toEqual(hashes);
  }
  it.each(cases)("carga: %s responde %s antes de Multer", async (scenario, status, message) => {
    const result = await request(app).post(uploadURL).set("Authorization", rejectedAuth(scenario))
      .field("archivotipo_code", xmlCode).attach("archivo", Buffer.from(invoiceXml()), { filename: "factura.xml", contentType: "application/xml" }).expect(status);
    expect(result.body).toMatchObject({ error: true, message });
    expect(await db.archivo.count()).toBe(0); await noInvoice();
    expect(diskFiles(workspace.root)).toHaveLength(0);
    expect(boundary.telegram).not.toHaveBeenCalled();
  });
  for (const url of [adminURL, financialURL, entrepreneurURL]) it.each(cases)(`${url}: %s responde %s y conserva las cargas previas`, async (scenario, status, message) => {
    const dto = await pair();
    const before = await db.archivo.findMany(); const files = diskFiles(workspace.root);
    const hashes = files.map(file => createHash("sha256").update(readFileSync(file)).digest("hex"));
    const result = await request(app).post(url).set("Authorization", rejectedAuth(scenario)).send(dto).expect(status);
    expect(result.body).toMatchObject({ error: true, message }); await noInvoice();
    await unchangedFiles(before, files, hashes);
    expect(boundary.telegram).not.toHaveBeenCalled();
  });
  it.each(cases)("descarga: %s responde %s sin entregar el contenido", async (scenario, status, message) => {
    const id = await upload(pdf, "privado.pdf", pdfCode, "application/pdf");
    const before = await db.archivo.findMany(); const files = diskFiles(workspace.root);
    const hashes = files.map(file => createHash("sha256").update(readFileSync(file)).digest("hex"));
    const result = await request(app).get(`/api/v1/usuario/archivo/descargar/${id}`).set("Authorization", rejectedAuth(scenario)).expect(status);
    expect(result.headers["content-type"]).toContain("application/json");
    expect(result.headers["content-disposition"]).toBeUndefined();
    expect(result.body).toMatchObject({ error: true, message });
    await noInvoice(); await unchangedFiles(before, files, hashes);
    expect(boundary.telegram).not.toHaveBeenCalled();
  });
});

describe("Rechazos de carga: middleware y catálogos reales", () => {
  // Busboy emite `limit` al alcanzar fileSize, no solamente al superarlo.
  // Catálogo sintético mayor que el límite global para aislar la frontera de Multer.
  it.each([[-1, 200], [0, 400], [1, 400]] as const)("límite global 20 MiB: desplazamiento %s byte(s) devuelve %s", async (offset, status) => {
    const limit = 20 * 1024 * 1024;
    await db.archivo_tipo.update({ where: { idarchivotipo: 8 }, data: { tamanio_maximo: 32 * 1024 * 1024 } });
    const existingId = status === 400 ? await upload(pdf, "previo.pdf", pdfCode, "application/pdf") : undefined;
    const before = await db.archivo.findMany();
    const bytes = Buffer.alloc(limit + offset, 0x20);
    Buffer.from(invoiceXml()).copy(bytes); // XML sintético con espacios finales.
    const result = await request(app).post(uploadURL).set("Authorization", auth())
      .field("archivotipo_code", xmlCode).attach("archivo", bytes, { filename: "limite.xml", contentType: "application/xml" }).expect(status);
    expect(diskFiles(path.join(workspace.root, "procesar"))).toHaveLength(0);
    expect(diskFiles(path.join(workspace.root, "success"))).toHaveLength(1);
    if (status === 200) {
      expect(result.body.error).toBe(false); expect(await db.archivo.count()).toBe(1);
      const stored = await db.archivo.findUniqueOrThrow({ where: { archivoid: result.body.data.archivoid } });
      expect(Number(stored.tamanio)).toBe(limit - 1);
      expect(stored.idusuariocrea).toBe(user.idusuario);
      const actual = readFileSync(path.join(workspace.root, "success", stored.ruta, stored.nombrealmacenamiento));
      expect(actual.length).toBe(bytes.length);
      expect(createHash("sha256").update(actual).digest("hex")).toBe(createHash("sha256").update(bytes).digest("hex"));
    } else {
      expect(result.body).toMatchObject({ error: true, message: "Archivo demasiado grande" });
      expect(await db.archivo.findMany()).toEqual(before);
      const existing = await db.archivo.findUniqueOrThrow({ where: { archivoid: existingId } });
      expect(readFileSync(path.join(workspace.root, "success", existing.ruta, existing.nombrealmacenamiento))).toEqual(pdf);
    }
  }, 30000);
  it.each([[undefined, 403], ["invalid", 401], ["Bearer invalid", 401], ["wrong-key", 401], ["wrong-role", 403]] as const)("autorización %s devuelve %s antes de guardar archivo", async (mode, status) => {
    const req = request(app).post(uploadURL);
    if (mode) req.set("Authorization", mode === "wrong-role" ? auth([3]) : mode === "wrong-key" ? `Bearer ${jwt.sign({ usuario: { idusuario: user.idusuario, usuario_roles: [{ idrol: 5 }] } }, "another-key")}` : mode);
    await req.field("archivotipo_code", xmlCode).attach("archivo", Buffer.from(invoiceXml()), { filename: "factura.xml", contentType: "application/xml" }).expect(status);
    expect(await db.archivo.count()).toBe(0); expect(diskFiles(workspace.root)).toHaveLength(0);
  });
  it.each(["sin archivo", "campo incorrecto", "dos archivos", "campos extra", "extension bloqueada", "PDF sin firma", "contenido PNG", "tipo inexistente", "tamaño de catálogo"])("rechaza %s sin registro de archivo", async scenario => {
    if (scenario === "tamaño de catálogo") await db.archivo_tipo.update({ where: { idarchivotipo: 8 }, data: { tamanio_maximo: 10 } });
    let req = request(app).post(uploadURL).set("Authorization", auth()).field("archivotipo_code", scenario === "tipo inexistente" ? "MISSING1" : scenario === "PDF sin firma" || scenario === "contenido PNG" ? pdfCode : xmlCode);
    if (scenario === "campos extra") req = req.field("extra", "1");
    if (scenario !== "sin archivo") {
      const bytes = scenario === "contenido PNG" ? Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==", "base64") : scenario === "PDF sin firma" ? Buffer.from("contenido de texto sin firma PDF") : Buffer.from(invoiceXml());
      const filename = scenario === "extension bloqueada" ? "archivo.exe" : scenario === "PDF sin firma" || scenario === "contenido PNG" ? "archivo.pdf" : "factura.xml";
      req = req.attach(scenario === "campo incorrecto" ? "otro" : "archivo", bytes, { filename, contentType: filename.endsWith("pdf") ? "application/pdf" : "application/xml" });
      if (scenario === "dos archivos") req = req.attach("archivo", Buffer.from(invoiceXml()), { filename: "segunda.xml", contentType: "application/xml" });
    }
    const result = await req.expect(scenario === "tipo inexistente" ? 404 : 400);
    expect(result.body.error).toBe(true); expect(await db.archivo.count()).toBe(0);
    expect(diskFiles(path.join(workspace.root, "success"))).toHaveLength(0);
  });
});

describe("Registro de factura: permisos, validación y rollback HTTP/SQL", () => {
  it("tipo de archivo con código inválido responde 400 antes del servicio; caracteriza temporal pendiente de limpieza", async () => {
    await request(app).post(uploadURL).set("Authorization", auth()).field("archivotipo_code", "invalid").attach("archivo", Buffer.from(invoiceXml()), { filename: "factura.xml", contentType: "application/xml" }).expect(400);
    expect(await db.archivo.count()).toBe(0);
    expect(diskFiles(path.join(workspace.root, "success"))).toHaveLength(0);
    expect(diskFiles(path.join(workspace.root, "procesar"))).toHaveLength(1);
  });
  it.each([[adminURL, 2], [financialURL, 3], [entrepreneurURL, 6]] as const)("%s rechaza rol %s aunque los archivos existan", async (url, role) => {
    const dto = await pair();
    await request(app).post(url).set("Authorization", auth([role])).send(dto).expect(403);
    await request(app).post(url).send(dto).expect(403);
    await noInvoice(); expect(await db.archivo.count()).toBe(2);
  });
  it.each(["sin identificadores", "uuid inválido", "archivo ausente", "tipos intercambiados", "XML inválido", "otra estructura", "otra clase documento", "moneda sin maestro", "fallo SQL PDF", "empresario no elegible"])("%s se rechaza y no deja una factura parcial", async scenario => {
    const xml = scenario === "XML inválido" ? "<Invoice><ID>" : scenario === "otra estructura" ? "<CreditNote/>" : invoiceXml({ type: scenario === "otra clase documento" ? "03" : "01", currency: scenario === "moneda sin maestro" ? "EUR" : "PEN" });
    const dto = await pair(xml);
    let body: Record<string, unknown> = dto;
    if (scenario === "sin identificadores") body = {};
    if (scenario === "uuid inválido") body = { ...dto, factura_xml: "invalid" };
    if (scenario === "archivo ausente") body = { ...dto, factura_xml: "00000000-0000-0000-0000-000000000000" };
    if (scenario === "tipos intercambiados") body = { factura_xml: dto.factura_pdf, factura_pdf: dto.factura_xml };
    if (scenario === "fallo SQL PDF") await db.$executeRawUnsafe("CREATE TRIGGER it_http_failure BEFORE INSERT ON archivo_factura FOR EACH ROW BEGIN IF (SELECT _idarchivotipo FROM archivo WHERE _idarchivo=NEW._idarchivo)=9 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='IT failure'; END IF; END");
    const status = ["sin identificadores", "uuid inválido", "otra clase documento"].includes(scenario) ? 400 : ["archivo ausente", "tipos intercambiados", "otra estructura", "empresario no elegible"].includes(scenario) ? 404 : scenario === "moneda sin maestro" ? 422 : 500;
    const result = await request(app).post(scenario === "empresario no elegible" ? entrepreneurURL : adminURL).set("Authorization", auth([3])).send(body).expect(status);
    expect(result.body.error).toBe(true); await noInvoice();
    expect(await db.archivo.count()).toBe(2); expect(diskFiles(path.join(workspace.root, "success"))).toHaveLength(2);
  });
  it("fallo SQL al guardar archivo revierte el registro y elimina temporal; caracteriza copia final huérfana", async () => {
    await db.$executeRawUnsafe("CREATE TRIGGER it_http_failure BEFORE INSERT ON archivo FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='IT failure'");
    await request(app).post(uploadURL).set("Authorization", auth()).field("archivotipo_code", xmlCode).attach("archivo", Buffer.from(invoiceXml()), { filename: "factura.xml", contentType: "application/xml" }).expect(500);
    expect(await db.archivo.count()).toBe(0); expect(diskFiles(path.join(workspace.root, "procesar"))).toHaveLength(0);
    expect(diskFiles(path.join(workspace.root, "success"))).toHaveLength(1);
  });
});
