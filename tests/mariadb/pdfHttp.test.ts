import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, rmdirSync } from "node:fs";
import path from "node:path";
import { createServer, request as httpRequest } from "node:http";
import { Settings } from "luxon";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { db, cleanFixtures, seedAuthorization, seedMasters } from "./businessSupport.js";
import { seedSettlement } from "./settlementSupport.js";
import { invoiceWorkspace } from "../vitest/support/invoiceFixture.js";

const boundary = vi.hoisted(() => ({ root: "", telegram: vi.fn(), writeFailure: "" as "" | "open" | "partial", writePath: "", written: 0, writeCode: "", writeClosed: () => {} }));
vi.mock("fs", async original => {
  const fs = await original<typeof import("fs")>();
  return { ...fs, createWriteStream: (filePath: Parameters<typeof fs.createWriteStream>[0], options?: Parameters<typeof fs.createWriteStream>[1]) => {
    if (!boundary.writeFailure) return fs.createWriteStream(filePath, options);
    const mode = boundary.writeFailure; boundary.writeFailure = "";
    boundary.writePath = String(filePath);
    // El bloqueo es exclusivo del fixture: el sistema operativo rechaza abrir un directorio como archivo.
    if (mode === "open") fs.mkdirSync(filePath, { recursive: true });
    const stream = fs.createWriteStream(filePath, mode === "open" ? options : {
      ...(typeof options === "object" ? options : {}),
      fs: { open: fs.open, close: fs.close, write: (fd, buffer, offset, length, position, callback) => {
        const remaining = 64 - boundary.written;
        if (remaining <= 0) { const error = Object.assign(new Error("IT controlled disk-full after real partial write"), { code: "ENOSPC" }); callback(error, 0, buffer); return; }
        fs.write(fd, buffer, offset, Math.min(length, remaining), position, (error, bytes, data) => {
          boundary.written += bytes; callback(error, bytes, data);
        });
      } },
    });
    stream.once("error", error => { boundary.writeCode = (error as NodeJS.ErrnoException).code ?? ""; });
    stream.once("close", () => boundary.writeClosed());
    return stream;
  } };
});
const secret = "ft-pdf-http-synthetic-secret";
vi.mock("#src/config.js", () => ({ env: { TOKEN_KEY_JWT: "ft-pdf-http-synthetic-secret" }, isProduction: true }));
vi.mock("#src/models/prisma/db-factoring.js", async () => ({ prismaFT: { client: (await import("./businessSupport.js")).db, transactionTimeout: 10000 } }));
vi.mock("#src/utils/storageUtils.js", async original => ({ ...await original<typeof import("#src/utils/storageUtils.js")>(), pathApp: () => boundary.root, STORAGE_PATH_PROCESAR: "procesar" }));
vi.mock("#src/utils/logger.pino.js", () => ({ line: () => "integration", log: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock("#src/providers/telegram/telegram.Provider.js", () => ({ sendMessageException: boundary.telegram }));
import adminProposal from "#src/routes/admin/servicio/factoring/factoringpropuesta.routes.js";
import financialProposal from "#src/routes/financiero/servicio/factoring/factoringpropuesta.routes.js";
import adminLiquidation from "#src/routes/admin/servicio/factoring/factoringliquidacion.routes.js";
import financialLiquidation from "#src/routes/financiero/servicio/factoring/factoringliquidacion.routes.js";
import { errorHandlerMiddleware } from "#src/middlewares/errorHandlerMiddleware.js";
import { createFactoringpropuestaService } from "#src/services/admin/factoringpropuesta.Service.js";
import { createFactoringliquidacionService } from "#src/services/admin/factoringliquidacion.Service.js";
import * as httpUtils from "#src/utils/httpUtils.js";
import PDFGenerator from "#src/utils/document/PDFgenerator.js";

const app = express(); app.use(express.json());
app.use("/api/v1", adminProposal, financialProposal, adminLiquidation, financialLiquidation); app.use(errorHandlerMiddleware);
const kinds = ["propuesta", "liquidacion"] as const;
type Kind = typeof kinds[number];
const profiles = [["admin", 2], ["financiero", 6]] as const;
const url = (kind: Kind, profile: string, id: string) => `/api/v1/${profile}/servicio/factoring/factoring${kind}/descargar/${id}`;
const originalNow = Settings.now;
let workspace: ReturnType<typeof invoiceWorkspace>;
let user: Awaited<ReturnType<typeof seedMasters>>;
beforeEach(async () => {
  boundary.writeFailure = ""; boundary.writePath = ""; boundary.written = 0; boundary.writeCode = ""; boundary.writeClosed = () => {};
  vi.clearAllMocks(); Settings.now = () => Date.parse("2026-09-01T05:00:00Z"); workspace = invoiceWorkspace(); boundary.root = workspace.root;
  const logo = path.join("assets", "images", "cotizacion", "LogoFinanzaTech.png");
  mkdirSync(path.dirname(path.join(workspace.root, logo)), { recursive: true });
  copyFileSync(path.resolve(logo), path.join(workspace.root, logo));
  user = await seedMasters(); await seedAuthorization(user.idusuario);
});
afterEach(async () => { vi.restoreAllMocks(); Settings.now = originalNow; try { await cleanFixtures(); } finally { workspace.cleanup(); } });
afterAll(async () => { await db.$disconnect(); });
function auth(role: number, expired = false) { return `Bearer ${jwt.sign({ usuario: { idusuario: user.idusuario, usuario_roles: [{ idrol: role }] }, ...(expired ? { exp: 1 } : {}) }, secret)}`; }
function files(folder = path.join(workspace.root, "procesar")): string[] {
  if (!existsSync(folder)) return [];
  return readdirSync(folder, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(path.join(folder, entry.name)) : [path.join(folder, entry.name)]);
}
async function snapshot() {
  return Promise.all(["factura", "factoring_factura", "factoring", "factoring_propuesta", "factoring_propuesta_historial_estado", "factoring_propuesta_financiero", "factoring_liquidacion", "factoring_liquidacion_financiero", "archivo"].map(table => db.$queryRawUnsafe(`SELECT * FROM \`${table}\``)));
}
async function arrange(currency = "PEN", payable = false, options: { paymentDate?: string; manyRows?: boolean; longText?: boolean } = {}) {
  const f = await seedSettlement(user.idusuario, currency);
  const parties = await Promise.all([f.factoring.idcedente, f.factoring.idaceptante].map(idempresa => db.empresa.findUniqueOrThrow({ where: { idempresa } })));
  if (options.longText) {
    for (let i = 0; i < parties.length; i++) {
      const name = `${i === 0 ? "CEDENTE" : "PAGADOR"} ÁRBOL COMERCIALIZADORA DE SUMINISTROS INDUSTRIALES Y SERVICIOS TECNOLÓGICOS PARA EMPRESAS NACIONALES E INTERNACIONALES SOCIEDAD ANÓNIMA CERRADA CON OPERACIONES REGIONALES FIN DEL NOMBRE`;
      expect(name.length).toBeLessThanOrEqual(200);
      parties[i] = await db.empresa.update({ where: { idempresa: parties[i].idempresa }, data: { razon_social: name } });
    }
  }
  const invoices = [];
  // Entradas SQL para documentos; la suma neta conserva los 20 000 de la operación.
  const count = options.longText ? 20 : 2;
  for (let index = 1; index <= count; index++) {
    const serie = options.longText ? `F${String(index).padStart(3, "0")}` : index === 1 ? "F001" : "F002";
    const numero = options.longText ? `1234567890${String(index).padStart(4, "0")}` : index === 1 ? "123" : "987";
    const invoice = await db.factura.create({ data: {
      code: `IT-PDF-${index}`, idusuarioupload: user.idusuario, serie, numero_comprobante: numero,
      codigo_tipo_moneda: currency, importe_bruto: 20000 / count, importe_neto: 20000 / count,
      proveedor_ruc: parties[0].ruc, proveedor_razon_social: parties[0].razon_social,
      cliente_ruc: parties[1].ruc, cliente_razon_social: parties[1].razon_social,
      fecha_emision: new Date("2026-09-01"), fecha_vencimiento: new Date("2026-10-01"),
    } });
    await db.factoring_factura.create({ data: { idfactoring: f.factoring.idfactoring, idfactura: invoice.idfactura, idusuariocrea: user.idusuario } });
    invoices.push(invoice);
  }
  await db.factoring.update({ where: { idfactoring: f.factoring.idfactoring }, data: { cantidad_facturas: invoices.length } });
  const type = await db.factoring_tipo.create({ data: { nombre: "Tipo sintetico", alias: "IT", color: "blue" } });
  const strategy = await db.factoring_estrategia.create({ data: { idfactoringestrategia: 1, code: "IT", nombre_estrategia: "Sintetica" } });
  const risk = await db.riesgo.findFirstOrThrow(); const state = await db.factoring_propuesta_estado.findFirstOrThrow({ where: { idfactoringpropuestaestado: 4 } });
  await createFactoringpropuestaService({ factoringid: f.factoring.factoringid, factoringtipoid: type.factoringtipoid, factoringestrategiaid: strategy.factoringestrategiaid, riesgooperacionid: risk.riesgoid, riesgocedenteid: risk.riesgoid, riesgoaceptanteid: risk.riesgoid, factoringpropuestaestadoid: state.factoringpropuestaestadoid, monto_neto: 20000, porcentaje_financiado_estimado: 0.8, porcentaje_comision_descuento: 0, tdm: 0.02, fecha_pago_estimado: "2026-10-01T05:00:00Z" }, user.idusuario);
  const proposal = await db.factoring_propuesta.findFirstOrThrow({ orderBy: { idfactoringpropuesta: "desc" } });
  // Entrada aceptada para probar documentos, no un recorrido de aprobación.
  await db.factoring.update({ where: { idfactoring: f.factoring.idfactoring }, data: { idfactoringpropuestaaceptada: proposal.idfactoringpropuesta } });
  const extra = payable ? [{ financierotipoid: (await db.financiero_tipo.findUniqueOrThrow({ where: { idfinancierotipo: 2 } })).financierotipoid, financieroconceptoid: (await db.financiero_concepto.findUniqueOrThrow({ where: { idfinancieroconcepto: 20 } })).financieroconceptoid, monto_unitario: 5000 }] : [];
  const concepts = [];
  if (options.manyRows) {
    const exemptType = await db.financiero_tipo.findUniqueOrThrow({ where: { idfinancierotipo: 4 } });
    for (let index = 1; index <= 60; index++) {
      const label = `Concepto PDF ${String(index).padStart(3, "0")}`;
      const concept = await db.financiero_concepto.create({ data: { idfinancieroconcepto: 100 + index, code: `IT-PDF-C-${index}`, nombre: label, alias: label, color: "blue", factor: -1, afecto_igv: false } });
      // La API de propuesta no admite conceptos libres: fixture de lectura SQL.
      await db.factoring_propuesta_financiero.create({ data: { code: `IT-PDF-D-${index}`, idfactoringpropuesta: proposal.idfactoringpropuesta, idfinancierotipo: 4, idfinancieroconcepto: concept.idfinancieroconcepto, cantidad: 1, monto_unitario: 10, monto: 10, igv: 0, total: 10 } });
      extra.push({ financierotipoid: exemptType.financierotipoid, financieroconceptoid: concept.financieroconceptoid, monto_unitario: 10 });
      concepts.push(concept);
    }
    await db.factoring_propuesta.update({ where: { idfactoringpropuesta: proposal.idfactoringpropuesta }, data: { monto_gasto_excento_igv: { increment: 600 }, monto_adelanto: { decrement: 600 } } });
  }
  const liquidation = await createFactoringliquidacionService({ ...f.liquidacionDto, fecha_pago_efectivo: options.paymentDate ?? f.liquidacionDto.fecha_pago_efectivo, factoring_liquidacion_financieros: extra }, user.idusuario);
  const storedProposal = await db.factoring_propuesta.findUniqueOrThrow({ where: { idfactoringpropuesta: proposal.idfactoringpropuesta } });
  return { ...f, proposal: storedProposal, liquidation, invoices, concepts, parties, id: (kind: Kind) => kind === "propuesta" ? proposal.factoringpropuestaid : liquidation.factoringliquidacionid };
}
function downloadRequest(kind: Kind, profile: string, role: number, id: string) {
  return request(app).get(url(kind, profile, id)).set("Authorization", auth(role)).buffer(true).parse((res, callback) => {
    const chunks: Buffer[] = []; res.on("data", chunk => chunks.push(Buffer.from(chunk))); res.on("end", () => callback(null, Buffer.concat(chunks)));
  });
}
async function download(kind: Kind, profile: string, role: number, id: string) { return downloadRequest(kind, profile, role, id).expect(200); }
function signal() {
  let release!: () => void;
  const promise = new Promise<void>(resolve => { release = resolve; });
  return { promise, release };
}
async function bounded(promise: Promise<void>) {
  let timer: ReturnType<typeof setTimeout>;
  try { await Promise.race([promise, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("IT concurrency gate timeout")), 5000); })]); }
  finally { clearTimeout(timer!); }
}
async function inspectPdf(bytes: Buffer) {
  expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
  const task = getDocument({ data: new Uint8Array(bytes), useSystemFonts: true, isEvalSupported: false });
  const doc = await task.promise;
  try {
    const pages: { text: string; items: { str: string; x: number; y: number; width: number; height: number }[] }[] = [];
    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n); const content = await page.getTextContent();
      const items = content.items.flatMap(item => "str" in item && item.str.trim() ? [{ str: item.str, x: item.transform[4], y: page.view[3] - item.transform[5] - item.height, width: item.width, height: item.height }] : []);
      pages.push({ text: items.map(item => item.str).join(" ").replace(/\s+/g, " ").trim(), items });
    }
    expect(doc.numPages).toBeGreaterThan(0); return { pages, text: pages.map(page => page.text).join(" ") };
  } finally { await task.destroy(); }
}
async function text(bytes: Buffer) { return (await inspectPdf(bytes)).text; }
function companyRucOverlap(pdf: Awaited<ReturnType<typeof inspectPdf>>) {
  return pdf.pages.some(page => {
    const rucs = page.items.filter(item => item.str.startsWith("RUC:"));
    const nameLines = page.items.filter(item => /COMERCIALIZADORA|EMPRESAS NACIONALES|FIN DEL NOMBRE/.test(item.str));
    return rucs.some(ruc => nameLines.some(name => name.x < ruc.x + ruc.width && ruc.x < name.x + name.width && name.y < ruc.y + ruc.height && ruc.y < name.y + name.height));
  });
}
function saveSample(name: string, bytes: Buffer) {
  const output = path.resolve("coverage/mariadb/pdf-samples"); mkdirSync(output, { recursive: true }); writeFileSync(path.join(output, `${name}.pdf`), bytes);
}
const money = (value: { toString(): string }) => Number(value.toString()).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
describe("PDF reales: contenido, descarga y limpieza", () => {
  for (const kind of kinds) for (const [profile, role] of profiles) it.each(["PEN", "USD"])(`${profile}/${kind}, %s: PDF contiene moneda, fechas e importes SQL y elimina temporal`, async currency => {
    const f = await arrange(currency); const before = await snapshot();
    const result = await download(kind, profile, role, f.id(kind));
    expect(result.headers["content-type"]).toContain("application/pdf");
    expect(result.headers["content-disposition"]).toContain(`attachment; filename="Factoring_${kind === "propuesta" ? "Propuesta" : "Liquidacion"}_`);
    const content = await text(result.body); const symbol = currency === "PEN" ? "S/" : "$";
    expect(content).toContain(currency); expect(content).toContain("01/oct/2026");
    for (const invoice of f.invoices) expect(content).toContain(`${invoice.serie}-${invoice.numero_comprobante}`);
    expect(content.match(/F001-123/g)).toHaveLength(1); expect(content.match(/F002-987/g)).toHaveLength(1);
    expect(content).toContain(`Valor neto ${symbol} ${money(f.proposal.monto_neto!)}`);
    expect(content).toContain(`Valor garantía ${symbol} ${money(f.proposal.monto_garantia!)}`);
    expect(content).toContain(`Valor financiado ${symbol} ${money(f.proposal.monto_financiado!)}`);
    if (kind === "propuesta") {
      expect(content).toContain("Propuesta de Factoring"); expect(content).toContain(f.proposal.code);
      expect(content).toContain(`Valor adelanto ${symbol} ${money(f.proposal.monto_adelanto!)}`);
      expect(content).toContain(`Valor descuento (1) ${symbol} ${money(f.proposal.monto_descuento!)}`);
      expect(content).toContain(`IGV ${symbol} ${money(f.proposal.monto_total_igv!)}`);
      expect(content).toContain("Fecha: 01/sept/2026 00:00");
    } else {
      expect(content).toContain("Liquidación de Operación de Factoring"); expect(content).toContain(f.liquidation.code);
      expect(content).toContain(`TOTAL A FAVOR DEL CEDENTE ${symbol} ${money(f.liquidation.monto_total_a_favor)}`);
      expect(content).toContain(`Valor descuento (real) ${symbol} ${money(f.liquidation.monto_descuento_efectivo!)}`);
      expect(content).toContain("Fecha operación (inicio) 01/sept/2026");
      expect(content).toContain("Fecha efectiva de cobro (fin) 01/oct/2026");
    }
    expect(files()).toHaveLength(0); expect(await snapshot()).toEqual(before);
    if (profile === "admin") saveSample(`${kind}-${currency}`, result.body);
  });
  it.each(["PEN", "USD"])("liquidación %s por cobrar contiene total y cuentas de pago SQL", async currency => {
    const f = await arrange(currency, true); const result = await download("liquidacion", "admin", 2, f.id("liquidacion")); const content = await text(result.body);
    expect(f.liquidation.monto_total_por_cobrar.toString()).toBe("1900"); expect(content).toContain("TOTAL A CARGO DEL CEDENTE"); expect(content).toContain(money(f.liquidation.monto_total_por_cobrar));
    expect(content).toContain("000000001"); expect(content).toContain("00000000000000000001"); expect(files()).toHaveLength(0);
  });
  for (const currency of ["PEN", "USD"]) for (const [profile, role] of profiles) it.each([
    ["anticipado", "2026-09-01T05:00:00Z", "01/sept/2026", 0, 0, "0", "320", "0", "4320"],
    ["mora", "2026-10-31T05:00:00Z", "31/oct/2026", 60, 30, "646.4", "0", "326.4", "3614.85"],
  ] as const)(`${profile}/liquidacion ${currency}, %s: fechas, reintegro/interés y saldo SQL en PDF`, async (label, paymentDate, formattedDate, days, overdue, discount, refund, charge, balance) => {
    const f = await arrange(currency, false, { paymentDate }); const before = await snapshot();
    const stored = await db.factoring_liquidacion.findUniqueOrThrow({ where: { idfactoringliquidacion: f.liquidation.idfactoringliquidacion } });
    // Oráculo independiente del generador y del calculador, además de lectura SQL.
    expect([stored.monto_descuento_efectivo, stored.monto_descuento_a_favor, stored.monto_descuento_mora, stored.monto_total_a_favor].map(value => value.toString())).toEqual([discount, refund, charge, balance]);
    expect(stored.dias_pago_efectivo).toBe(days); expect(stored.dias_mora_efectivo).toBe(overdue);
    const result = await download("liquidacion", profile, role, f.id("liquidacion"));
    const content = await text(result.body); const symbol = currency === "PEN" ? "S/" : "$";
    expect(content).toContain(`Fecha efectiva de cobro (fin) ${formattedDate}`);
    expect(content).toContain(`Días reales ${days}`);
    expect(content).toContain(`Valor descuento (real) ${symbol} ${money(stored.monto_descuento_efectivo)}`);
    expect(content).toContain(`TOTAL A FAVOR DEL CEDENTE ${symbol} ${money(stored.monto_total_a_favor)}`);
    if (label === "anticipado") {
      expect(content).toContain(`Reintegro de descuento por pago anticipado ${symbol} ${money(stored.monto_descuento_a_favor)}`);
      expect(content).not.toContain("Días adicionales (mora)"); expect(content).not.toContain("Interés por días adicionales");
    } else {
      expect(content).toContain(`Días adicionales (mora) ${overdue}`);
      expect(content).toContain(`Interés por días adicionales de financiamiento ${symbol} ${money(stored.monto_descuento_mora)}`);
      expect(content).not.toContain("Reintegro de descuento por pago anticipado");
    }
    for (const invoice of f.invoices) expect(content).toContain(`${invoice.serie}-${invoice.numero_comprobante}`);
    expect(files()).toHaveLength(0); expect(await snapshot()).toEqual(before);
    if (profile === "admin") saveSample(`liquidacion-${label}-${currency}`, result.body);
  });
  for (const kind of kinds) it.each(["PEN", "USD"])(`${kind} %s: 60 conceptos completos entre páginas, total y pie presentes`, async currency => {
    const f = await arrange(currency, kind === "liquidacion", { manyRows: true }); const before = await snapshot();
    const result = await download(kind, "admin", 2, f.id(kind));
    saveSample(`${kind}-multipagina-${currency}`, result.body);
    const pdf = await inspectPdf(result.body); const symbol = currency === "PEN" ? "S/" : "$";
    expect(pdf.pages.length).toBeGreaterThan(1);
    for (const concept of f.concepts) {
      const label = kind === "propuesta" ? concept.alias : concept.nombre;
      expect(pdf.text.split(label)).toHaveLength(2);
      expect(pdf.text).toContain(`${label} ${symbol} 10.00`);
    }
    const details = kind === "propuesta"
      ? await db.factoring_propuesta_financiero.findMany({ where: { idfactoringpropuesta: f.proposal.idfactoringpropuesta, idfinancierotipo: 4 } })
      : await db.factoring_liquidacion_financiero.findMany({ where: { idfactoringliquidacion: f.liquidation.idfactoringliquidacion, idfinancierotipo: 4 } });
    expect(details).toHaveLength(60); expect(details.every(item => item.monto.equals(10) && item.total.equals(10) && item.igv.equals(0))).toBe(true);
    const last = pdf.pages.at(-1)!;
    expect(last.text).toContain("Concepto PDF 060");
    if (kind === "propuesta") {
      expect(last.text).toContain(`Valor adelanto ${symbol} ${money(f.proposal.monto_adelanto!)}`);
      expect(last.text).toContain("Los intereses aplicados");
      const note = last.items.find(item => item.str === "Nota:")!;
      const total = last.items.find(item => item.str.includes("Valor adelanto"))!;
      expect(note.y).toBeGreaterThan(total.y + total.height);
    } else {
      expect(f.liquidation.monto_total_por_cobrar.toString()).toBe("2500");
      expect(last.text).toContain(`TOTAL A CARGO DEL CEDENTE ${symbol} ${money(f.liquidation.monto_total_por_cobrar)}`);
      expect(last.text).toContain("000000001"); expect(last.text).toContain("00000000000000000001");
      const footer = last.items.find(item => item.str.includes("Agradeceremos cancelar"))!;
      const total = last.items.find(item => item.str.includes("TOTAL A CARGO"))!;
      expect(footer.y).toBeGreaterThan(total.y + total.height);
    }
    for (const page of pdf.pages) for (const item of page.items) {
      expect(item.x).toBeGreaterThanOrEqual(0); expect(item.y).toBeGreaterThanOrEqual(0);
      expect(item.x + item.width).toBeLessThanOrEqual(596); expect(item.y + item.height).toBeLessThanOrEqual(843);
    }
    expect(files()).toHaveLength(0); expect(await snapshot()).toEqual(before);
  });
  for (const kind of kinds) for (const [profile, role] of profiles) it.each(["PEN", "USD"])(`${profile}/${kind} %s: nombres largos y veinte facturas conservan texto e importes; caracteriza DT-PDF-05`, async currency => {
    const f = await arrange(currency, false, { longText: true }); const before = await snapshot();
    const result = await download(kind, profile, role, f.id(kind));
    if (profile === "admin") saveSample(`${kind}-texto-largo-${currency}`, result.body);
    const pdf = await inspectPdf(result.body); const symbol = currency === "PEN" ? "S/" : "$";
    for (const party of f.parties) expect(pdf.text).toContain(party.razon_social);
    expect(f.invoices).toHaveLength(20);
    for (const invoice of f.invoices) expect(pdf.text.split(`${invoice.serie}-${invoice.numero_comprobante}`)).toHaveLength(2);
    const sum = f.invoices.reduce((value, invoice) => value.plus(invoice.importe_neto), f.proposal.monto_neto!.mul(0));
    expect(sum.equals(f.proposal.monto_neto!)).toBe(true);
    expect(pdf.text).toContain(`Valor neto ${symbol} ${money(sum)}`);
    expect(pdf.text).toContain(kind === "propuesta" ? `Valor adelanto ${symbol} ${money(f.proposal.monto_adelanto!)}` : `TOTAL A FAVOR DEL CEDENTE ${symbol} ${money(f.liquidation.monto_total_a_favor)}`);
    // La propuesta reproduce un defecto conocido; no se declara presentación correcta.
    expect(companyRucOverlap(pdf)).toBe(kind === "propuesta");
    expect(files()).toHaveLength(0); expect(await snapshot()).toEqual(before);
  });
  for (const [profile, role] of profiles) it.each(["PEN", "USD"])(`${profile}/propuesta %s: diagnóstico DT-PDF-05 pendiente, criterio sin superposición incumplido`, async currency => {
    const f = await arrange(currency, false, { longText: true });
    const result = await download("propuesta", profile, role, f.id("propuesta"));
    const pdf = await inspectPdf(result.body);
    // Se evalúa el criterio pendiente dentro de una aserción específica. Los
    // errores de preparación/generación/HTTP/lectura siguen fallando normalmente.
    expect(companyRucOverlap(pdf)).toBe(true);
    expect(() => expect(companyRucOverlap(pdf)).toBe(false)).toThrowError();
  });
  for (const kind of kinds) for (const [profile, role] of profiles) it.each(["sin sesión", "rol ajeno", "expirado"])(`${profile}/${kind}: rechaza %s sin generar PDF`, async scenario => {
    const before = await snapshot(); let req = request(app).get(url(kind, profile, "00000000-0000-0000-0000-000000000000"));
    if (scenario !== "sin sesión") req = req.set("Authorization", auth(scenario === "rol ajeno" ? (role === 2 ? 6 : 2) : role, scenario === "expirado"));
    await req.expect(scenario === "expirado" ? 401 : 403); expect(files()).toHaveLength(0); expect(await snapshot()).toEqual(before);
  });
  for (const kind of kinds) for (const [profile, role] of profiles) it(`${profile}/${kind}: registro inexistente sin archivo; propuesta caracteriza 500 actual`, async () => {
    const before = await snapshot();
    await request(app).get(url(kind, profile, "00000000-0000-0000-0000-000000000000")).set("Authorization", auth(role)).expect(kind === "propuesta" ? 500 : 404);
    expect(files()).toHaveLength(0); expect(await snapshot()).toEqual(before);
  });
  for (const kind of kinds) for (const [profile, role] of profiles) it(`${profile}/${kind}: fallo de entrega después de generar limpia el PDF`, async () => {
    const f = await arrange(); const before = await snapshot();
    vi.spyOn(httpUtils, "sendFileAsync").mockImplementationOnce(async () => { expect(files()).toHaveLength(1); throw new Error("IT send failure"); });
    await request(app).get(url(kind, profile, f.id(kind))).set("Authorization", auth(role)).expect(500);
    expect(files()).toHaveLength(0); expect(await snapshot()).toEqual(before);
  });
  for (const kind of kinds) it(`${kind}: fallo posterior a generación deja archivo; caracteriza límite anterior al finally`, async () => {
    const f = await arrange(); const before = await snapshot();
    const method = kind === "propuesta" ? "generateFactoringPropuesta" : "generateFactoringliquidacion";
    const original = PDFGenerator.prototype[method];
    vi.spyOn(PDFGenerator.prototype, method).mockImplementationOnce(async function (this: PDFGenerator, ...args: Parameters<typeof original>) { await (original as (...args: Parameters<typeof original>) => Promise<unknown>).apply(this, args); throw new Error("IT post-generation failure"); });
    await request(app).get(url(kind, "admin", f.id(kind))).set("Authorization", auth(2)).expect(500);
    expect(files()).toHaveLength(1); expect(await snapshot()).toEqual(before);
  });
  for (const kind of kinds) for (const [profile, role] of profiles) for (const stage of ["antes de cabeceras", "tras cabeceras antes del cuerpo"] as const) it.each(["PEN", "USD"])(`${profile}/${kind} %s: cancelación TCP ${stage} limpia temporal y permite reintentar`, async currency => {
    const f = await arrange(currency); const before = await snapshot();
    const ready = signal(); const proceed = signal(); const closed = signal(); const delivered = signal();
    const originalSend = httpUtils.sendFileAsync;
    let deliveryCode: string | undefined; let completed = false; let clientStatus: number | undefined;
    const server = createServer(app);
    await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("IT HTTP listener missing");
    vi.spyOn(httpUtils, "sendFileAsync").mockImplementationOnce(async (req, res, filePath) => {
      expect(existsSync(filePath)).toBe(true);
      expect((await text(readFileSync(filePath)))).toContain(kind === "propuesta" ? f.proposal.code : f.liquidation.code);
      res.once("close", closed.release);
      if (stage === "tras cabeceras antes del cuerpo") { res.type("application/pdf"); res.flushHeaders(); }
      ready.release(); await bounded(proceed.promise);
      try { await originalSend(req, res, filePath); completed = true; }
      catch (error) { deliveryCode = (error as NodeJS.ErrnoException).code; throw error; }
      finally { delivered.release(); }
    });
    const responseReady = signal(); const clientClosed = signal();
    const client = httpRequest({ hostname: "127.0.0.1", port: address.port, path: url(kind, profile, f.id(kind)), headers: { Authorization: auth(role) } }, res => {
      clientStatus = res.statusCode; res.on("error", () => {}); responseReady.release();
    });
    client.on("error", () => {}); client.once("close", clientClosed.release); client.end();
    try {
      await bounded(ready.promise);
      if (stage === "tras cabeceras antes del cuerpo") { await bounded(responseReady.promise); expect(clientStatus).toBe(200); }
      else expect(clientStatus).toBeUndefined();
      client.destroy(); await bounded(clientClosed.promise); await bounded(closed.promise);
      proceed.release(); await bounded(delivered.promise);
      expect(completed).toBe(false); expect(deliveryCode).toBe("ECONNABORTED");
      await vi.waitFor(() => expect(files()).toHaveLength(0), { timeout: 2000, interval: 20 });
      expect(await snapshot()).toEqual(before);
      // Reintento normal con el mismo documento y reloj: no reutiliza un huérfano.
      const retry = await download(kind, profile, role, f.id(kind));
      expect(await text(retry.body)).toContain(kind === "propuesta" ? f.proposal.code : f.liquidation.code);
      expect(files()).toHaveLength(0); expect(await snapshot()).toEqual(before);
    } finally {
      client.destroy(); proceed.release(); server.closeAllConnections();
      await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    }
  });
  for (const kind of kinds) for (const [profile, role] of profiles) for (const failure of ["open", "partial"] as const) it.each(["PEN", "USD"])(`${profile}/${kind} %s: fallo de escritura ${failure}, conserva SQL y caracteriza DT-PDF-01`, async currency => {
    const f = await arrange(currency); const before = await snapshot(); const closed = signal();
    boundary.writeClosed = closed.release; boundary.writeFailure = failure;
    const send = vi.spyOn(httpUtils, "sendFileAsync");
    const failed = await downloadRequest(kind, profile, role, f.id(kind));
    expect(failed.status).toBe(500); expect(failed.headers["content-type"]).toContain("application/json");
    await bounded(closed.promise); expect(send).not.toHaveBeenCalled();
    expect(path.relative(workspace.root, boundary.writePath)).not.toMatch(/^\.\.|^[A-Za-z]:/);
    expect(await snapshot()).toEqual(before);
    if (failure === "open") {
      expect(boundary.writeCode).toBe("EISDIR"); expect(boundary.written).toBe(0); expect(files()).toHaveLength(0);
      // Retirar únicamente el directorio bloqueador creado por la prueba.
      rmdirSync(boundary.writePath);
    } else {
      expect(boundary.writeCode).toBe("ENOSPC"); expect(boundary.written).toBe(64);
      expect(files()).toEqual([boundary.writePath]);
      const partial = readFileSync(boundary.writePath);
      expect(partial.length).toBe(64); expect(partial.subarray(0, 5).toString()).toBe("%PDF-");
      expect(partial.toString()).not.toContain("%%EOF");
      // La aplicación deja el archivo parcial: caracterización, no limpieza aprobada.
    }
    const retry = await download(kind, profile, role, f.id(kind));
    expect(await text(retry.body)).toContain(kind === "propuesta" ? f.proposal.code : f.liquidation.code);
    expect(files()).toHaveLength(0); expect(await snapshot()).toEqual(before);
  });
  const pairs = [["admin", 2, "admin", 2], ["financiero", 6, "financiero", 6], ["admin", 2, "financiero", 6]] as const;
  for (const kind of kinds) for (const [firstProfile, firstRole, secondProfile, secondRole] of pairs) it.each(["PEN", "USD"])(`${kind} %s, ${firstProfile}/${secondProfile}: caracteriza colisión del mismo temporal y limpieza concurrente`, async currency => {
    const f = await arrange(currency); const before = await snapshot();
    const entered = [signal(), signal()]; const proceed = [signal(), signal()];
    const paths: string[] = []; const originalSend = httpUtils.sendFileAsync;
    let bytes: Buffer | undefined; let missingCode: string | undefined;
    // Solo se controla el orden en la frontera HTTP; generación y envío reales.
    vi.spyOn(httpUtils, "sendFileAsync").mockImplementation(async (req, res, filePath) => {
      const index = paths.push(filePath) - 1; entered[index].release();
      await bounded(proceed[index].promise);
      if (index === 0) bytes = readFileSync(filePath);
      try { return await originalSend(req, res, filePath); }
      catch (error) { missingCode = (error as NodeJS.ErrnoException).code; throw error; }
    });
    const requests: Promise<request.Response>[] = [];
    try {
      requests.push(downloadRequest(kind, firstProfile, firstRole, f.id(kind)).then(response => response));
      await bounded(entered[0].promise);
      requests.push(downloadRequest(kind, secondProfile, secondRole, f.id(kind)).then(response => response));
      await bounded(entered[1].promise);
      expect(paths).toHaveLength(2); expect(paths[0]).toBe(paths[1]); expect(files()).toHaveLength(1);
      proceed[0].release(); const first = await requests[0];
      expect(first.status).toBe(200); expect(first.body).toEqual(bytes);
      const content = await text(first.body); expect(content).toContain(kind === "propuesta" ? f.proposal.code : f.liquidation.code);
      await vi.waitFor(() => expect(files()).toHaveLength(0), { timeout: 2000, interval: 20 });
      // La primera solicitud ha borrado el archivo que aún necesita la segunda.
      proceed[1].release(); const second = await requests[1];
      // Financiero intenta unlink sin comprobar existencia y reemplaza el 404 por 500.
      expect(second.status).toBe(secondProfile === "admin" ? 404 : 500); expect(second.headers["content-type"]).toContain("application/json");
      expect(missingCode).toBe("ENOENT"); expect(files()).toHaveLength(0); expect(await snapshot()).toEqual(before);
    } finally {
      proceed.forEach(gate => gate.release()); await Promise.allSettled(requests);
    }
  });
  for (const kind of kinds) it.each(["PEN", "USD"])(`${kind} %s: documentos distintos descargan completos sin interferencia`, async currency => {
    const f = await arrange(currency);
    // Segundo documento como entrada SQL de lectura; no prueba su creación de negocio.
    let secondId: string; let secondCode: string;
    if (kind === "propuesta") {
      const { idfactoringpropuesta: _id, factoringpropuestaid: _uuid, code: _code, ...data } = f.proposal;
      const second = await db.factoring_propuesta.create({ data: { ...data, code: "IT-PDF-SECOND" } });
      secondId = second.factoringpropuestaid; secondCode = second.code;
    } else {
      const second = await createFactoringliquidacionService(f.liquidacionDto, user.idusuario);
      secondId = second.factoringliquidacionid; secondCode = second.code;
    }
    const before = await snapshot(); const ready = signal(); const paths: string[] = []; const sent: Buffer[] = [];
    const originalSend = httpUtils.sendFileAsync;
    vi.spyOn(httpUtils, "sendFileAsync").mockImplementation(async (req, res, filePath) => {
      const index = paths.push(filePath) - 1; sent[index] = readFileSync(filePath);
      if (paths.length === 2) ready.release();
      await bounded(ready.promise); return originalSend(req, res, filePath);
    });
    const requests = [download(kind, "admin", 2, f.id(kind)), download(kind, "financiero", 6, secondId)];
    try {
      const results = await Promise.all(requests);
      expect(new Set(paths).size).toBe(2);
      for (const result of results) { expect(result.headers["content-type"]).toContain("application/pdf"); expect(sent.some(bytes => bytes.equals(result.body))).toBe(true); }
      expect(await text(results[0].body)).toContain(kind === "propuesta" ? f.proposal.code : f.liquidation.code);
      expect(await text(results[1].body)).toContain(secondCode);
      await vi.waitFor(() => expect(files()).toHaveLength(0), { timeout: 2000, interval: 20 });
      expect(await snapshot()).toEqual(before);
    } finally { ready.release(); await Promise.allSettled(requests); }
  });
});
