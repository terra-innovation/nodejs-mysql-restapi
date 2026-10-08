import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const b = vi.hoisted(() => ({
  root: "", transaction: vi.fn(), usuario: vi.fn(), propuesta: vi.fn(), owned: vi.fn(), factoring: vi.fn(), telegram: vi.fn(),
}));
vi.mock("#src/config.js", () => ({ env: { TOKEN_KEY_JWT: "empresario-pdf-test" }, isProduction: true }));
vi.mock("#src/models/prisma/db-factoring.js", () => ({ prismaFT: { client: { $transaction: b.transaction }, transactionTimeout: 5000 } }));
vi.mock("#src/daos/usuario.Dao.js", () => ({ getUsuarioAccesosByIdusuario: b.usuario }));
vi.mock("#src/providers/email/email.Provider.js", () => ({}));
vi.mock("#src/providers/telegram/telegram.Provider.js", () => ({ sendMessageException: b.telegram }));
vi.mock("#src/utils/logger.pino.js", () => ({ line: () => "test", log: { debug: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock("#src/utils/storageUtils.js", async original => ({ ...await original<typeof import("#src/utils/storageUtils.js")>(), pathApp: () => b.root }));

// Rutas, middleware, controladores, servicios, DAOs, PDF y envío HTTP reales.
// Solo se sustituye la conexión a datos y los proveedores externos.
import routes from "#src/routes/empresario/servicio/factoring/factoringpropuesta.routes.js";
import adminRoutes from "#src/routes/admin/servicio/factoring/factoringpropuesta.routes.js";
import { errorHandlerMiddleware } from "#src/middlewares/errorHandlerMiddleware.js";
import { generateFactoringpropuestaPDFService } from "#src/services/empresario/factoringpropuesta.Service.js";
import PDFGenerator from "#src/utils/document/PDFgenerator.js";
import * as httpUtils from "#src/utils/httpUtils.js";

const app = express();
app.use(express.json()); app.use("/api/v1", routes, adminRoutes); app.use(errorHandlerMiddleware);
const id = "66666666-6666-4666-8666-666666666666";
const url = `/api/v1/empresario/servicio/factoring/factoringpropuesta/descargar/${id}`;
const tx = { factoring_propuesta: { findUnique: b.propuesta }, factoring: { findFirst: b.owned, findUnique: b.factoring } };
const auth = (role = 3, user = 42) => `Bearer ${jwt.sign({ usuario: { idusuario: user, usuario_roles: [{ idrol: role }] } }, "empresario-pdf-test", { expiresIn: "1h" })}`;
const proposal = () => ({
  idfactoringpropuesta: 100, idfactoring: 10, factoringpropuestaid: id, estado: 1, code: "PROP-001",
  fecha_propuesta: new Date("2026-10-08T17:00:00Z"), fecha_pago_estimado: new Date("2026-11-07T05:00:00Z"),
  dias_pago_estimado: 30, tdm: new Prisma.Decimal("0.015"), porcentaje_financiado_estimado: new Prisma.Decimal("0.98"),
  porcentaje_comision_descuento: new Prisma.Decimal(0), monto_neto: new Prisma.Decimal(10000), monto_financiado: new Prisma.Decimal(9800),
  monto_garantia: new Prisma.Decimal(200), monto_descuento: new Prisma.Decimal(147), monto_total_igv: new Prisma.Decimal(18), monto_adelanto: new Prisma.Decimal(9635),
  factoring_tipo: { nombre: "Con recurso" }, factoring_propuesta_financieros: [],
});
const factoring = (currency = "PEN") => ({
  idfactoring: 10, idfactoringestado: 4, idfactoringpropuestaaceptada: 100, estado: 1,
  empresa_cedente: { ruc: "20111111111", razon_social: "Cedente SAC" }, empresa_aceptante: { ruc: "20222222222", razon_social: "Pagador SAC" },
  moneda: { codigo: currency, simbolo: currency === "PEN" ? "S/" : "$", nombre: currency === "PEN" ? "Soles" : "Dólares" },
  factoring_facturas: [{ factura: { serie: "F001", numero_comprobante: "205" } }],
});
function files(folder = path.join(b.root, "storage", "procesar")): string[] {
  if (!existsSync(folder)) return [];
  return readdirSync(folder, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(path.join(folder, entry.name)) : [path.join(folder, entry.name)]);
}
async function pdfText(data: Buffer) {
  const task = getDocument({ data: new Uint8Array(data), useSystemFonts: true, isEvalSupported: false });
  const doc = await task.promise;
  try {
    const pages: string[] = [];
    for (let n = 1; n <= doc.numPages; n++) {
      const content = await (await doc.getPage(n)).getTextContent();
      pages.push(content.items.flatMap(item => "str" in item ? [item.str] : []).join(" "));
    }
    return pages.join(" ");
  } finally { await task.destroy(); }
}
const download = () => request(app).get(url).set("Authorization", auth()).buffer(true).parse((res, callback) => {
  const chunks: Buffer[] = []; res.on("data", chunk => chunks.push(Buffer.from(chunk))); res.on("end", () => callback(null, Buffer.concat(chunks)));
});

beforeEach(() => {
  vi.resetAllMocks();
  const parent = path.resolve("temporal", "tests"); mkdirSync(parent, { recursive: true });
  b.root = mkdtempSync(path.join(parent, "empresario-pdf-"));
  const logo = path.join("assets", "images", "cotizacion", "LogoFinanzaTech.png");
  mkdirSync(path.dirname(path.join(b.root, logo)), { recursive: true }); copyFileSync(path.resolve(logo), path.join(b.root, logo));
  b.transaction.mockImplementation(async callback => callback(tx));
  b.usuario.mockResolvedValue({ idusuario: 42, usuario_roles: [{ idrol: 3 }] });
  b.propuesta.mockResolvedValue(proposal()); b.owned.mockResolvedValue(factoring()); b.factoring.mockResolvedValue(factoring());
});
afterEach(() => {
  vi.restoreAllMocks();
  // Solo elimina la carpeta creada por este test dentro del workspace.
  if (b.root.startsWith(path.resolve("temporal", "tests") + path.sep)) rmSync(b.root, { recursive: true, force: true });
});

describe("PDF de propuesta aceptada del empresario", () => {
  it.each(["PEN", "USD"])("descarga PDF real en %s y elimina el temporal", async currency => {
    b.factoring.mockResolvedValue(factoring(currency));
    const response = await download().expect(200);
    expect(response.headers["content-type"]).toContain("application/pdf");
    expect(response.headers["content-disposition"]).toMatch(/^attachment; filename="Factoring_Propuesta_20111111111_PROP-001_.*\.pdf"$/);
    expect(response.body.subarray(0, 5).toString()).toBe("%PDF-");
    const text = await pdfText(response.body);
    for (const expected of ["Propuesta de Factoring", "PROP-001", "Cedente SAC", "Pagador SAC", "F001-205", currency, "10,000.00", "9,635.00"]) expect(text).toContain(expected);
    expect(b.owned.mock.calls[0][0].where).toMatchObject({ idfactoring: 10, empresa_cedente: { usuario_servicio_empresas: { some: { idusuario: 42 } } }, estado: { in: [1] } });
    expect(files()).toEqual([]);
  });
  it("sin sesión no consulta ni genera", async () => {
    await request(app).get(url).expect(403); expect(b.transaction).not.toHaveBeenCalled();
  });
  it.each([2, 4, 5, 6])("rol %s no tiene acceso", async role => {
    await request(app).get(url).set("Authorization", auth(role)).expect(403); expect(b.transaction).not.toHaveBeenCalled();
  });
  it("token inválido no consulta datos", async () => {
    await request(app).get(url).set("Authorization", "Bearer invalid").expect(401); expect(b.transaction).not.toHaveBeenCalled();
  });
  it("rol revocado no tiene acceso", async () => {
    b.usuario.mockResolvedValue({ idusuario: 42, usuario_roles: [] });
    await request(app).get(url).set("Authorization", auth()).expect(403); expect(b.transaction).not.toHaveBeenCalled();
  });
  it("ID inválido no abre transacción", async () => {
    await request(app).get(url.replace(id, "invalid")).set("Authorization", auth()).expect(400); expect(b.transaction).not.toHaveBeenCalled();
  });
  it("propuesta inexistente devuelve 404 con DAO real", async () => {
    b.propuesta.mockResolvedValue(null);
    await request(app).get(url).set("Authorization", auth()).expect(404); expect(b.owned).not.toHaveBeenCalled(); expect(files()).toEqual([]);
  });
  it.each([0, 2])("propuesta con estado %s no genera PDF", async estado => {
    b.propuesta.mockResolvedValue({ ...proposal(), estado });
    await request(app).get(url).set("Authorization", auth()).expect(404); expect(b.owned).not.toHaveBeenCalled(); expect(files()).toEqual([]);
  });
  it("operación ajena o inactiva devuelve 404 y usa la identidad de sesión", async () => {
    b.owned.mockResolvedValue(null);
    await request(app).get(url).set("Authorization", auth()).send({ idusuario: 999, factoringpropuestaid: "otra-propuesta" }).expect(404);
    expect(b.propuesta.mock.calls[0][0].where).toEqual({ factoringpropuestaid: id });
    expect(b.owned.mock.calls[0][0].where.empresa_cedente.usuario_servicio_empresas.some.idusuario).toBe(42);
    expect(b.factoring).not.toHaveBeenCalled(); expect(files()).toEqual([]);
  });
  it.each([null, 101])("propuesta no aceptada en la operación (%s) no descarga", async accepted => {
    b.owned.mockResolvedValue({ ...factoring(), idfactoringpropuestaaceptada: accepted });
    await request(app).get(url).set("Authorization", auth()).expect(404); expect(b.factoring).not.toHaveBeenCalled(); expect(files()).toEqual([]);
  });
  it("factoring inexistente no genera PDF", async () => {
    b.factoring.mockResolvedValue(null);
    await request(app).get(url).set("Authorization", auth()).expect(404); expect(files()).toEqual([]);
  });
  it("permite descargar cuando la operación avanza de estado", async () => {
    b.owned.mockResolvedValue({ ...factoring(), idfactoringestado: 9 });
    await download().expect(200); expect(files()).toEqual([]);
  });
  it("descargas simultáneas usan temporales independientes", async () => {
    const generatedPaths: string[] = [];
    const generate = PDFGenerator.prototype.generateFactoringPropuesta;
    vi.spyOn(PDFGenerator.prototype, "generateFactoringPropuesta").mockImplementation(function (...args) {
      generatedPaths.push((this as unknown as { filePath: string }).filePath);
      return generate.apply(this, args);
    });
    const results = await Promise.all([download(), download()]);
    for (const result of results) { expect(result.status).toBe(200); expect(result.body.subarray(0, 5).toString()).toBe("%PDF-"); }
    expect(new Set(generatedPaths).size).toBe(2);
    expect(files()).toEqual([]);
  });
  it("el contenido del PDF coincide con la descarga existente del administrador", async () => {
    b.usuario.mockResolvedValue({ idusuario: 42, usuario_roles: [{ idrol: 2 }, { idrol: 3 }] });
    const entrepreneur = await download().expect(200);
    const admin = await request(app).get(`/api/v1/admin/servicio/factoring/factoringpropuesta/descargar/${id}`)
      .set("Authorization", auth(2)).buffer(true).parse((res, callback) => {
        const chunks: Buffer[] = []; res.on("data", chunk => chunks.push(Buffer.from(chunk))); res.on("end", () => callback(null, Buffer.concat(chunks)));
      }).expect(200);
    expect(await pdfText(entrepreneur.body)).toBe(await pdfText(admin.body));
    expect(files()).toEqual([]);
  });
  it("fallo al enviar elimina el PDF y permite reintentar", async () => {
    vi.spyOn(httpUtils, "sendFileAsync").mockRejectedValueOnce(new Error("fallo de envío"));
    await request(app).get(url).set("Authorization", auth()).expect(500); expect(files()).toEqual([]);
    await download().expect(200); expect(files()).toEqual([]);
  });
  it("fallo al generar elimina archivo parcial y conserva el error", async () => {
    const error = new Error("fallo de PDF");
    vi.spyOn(PDFGenerator.prototype, "generateFactoringPropuesta").mockImplementationOnce(function () {
      writeFileSync((this as unknown as { filePath: string }).filePath, "partial"); return Promise.reject(error);
    });
    await expect(generateFactoringpropuestaPDFService({ factoringpropuestaid: id, idusuario: 42 })).rejects.toBe(error);
    expect(files()).toEqual([]);
  });
});
