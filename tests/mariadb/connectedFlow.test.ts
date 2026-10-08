import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import { Settings } from "luxon";
import { db, cleanFixtures, seedMasters, seedOperationDependencies } from "./businessSupport.js";
import { invoiceWorkspace, invoiceXml, paymentTerm } from "../vitest/support/invoiceFixture.js";

const boundary = vi.hoisted(() => ({ root: "", requested: vi.fn(), available: vi.fn(), accepted: vi.fn(), started: vi.fn(), telegram: vi.fn() }));
vi.mock("#src/config.js", () => ({ env: {}, isProduction: true }));
vi.mock("#src/models/prisma/db-factoring.js", async () => ({ prismaFT: { client: (await import("./businessSupport.js")).db, transactionTimeout: 10000 } }));
vi.mock("#src/utils/storageUtils.js", async importOriginal => ({ ...await importOriginal<typeof import("#src/utils/storageUtils.js")>(), get STORAGE_PATH_SUCCESS() { return path.join(boundary.root, "success"); } }));
vi.mock("#src/utils/logger.pino.js", () => ({ line: () => "integration", log: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock("#src/providers/email/email.Provider.js", () => ({
  sendFactoringEmpresaServicioFactoringSolicitud: boundary.requested,
  sendFactoringEmpresaServicioFactoringPropuestaDisponible: boundary.available,
  sendFactoringEmpresaServicioFactoringPropuestaAceptada: boundary.accepted,
  sendFactoringEmpresaServicioFactoringCedenteNotificacionInicioOperacion: boundary.started,
}));
vi.mock("#src/providers/telegram/telegram.Provider.js", () => ({ sendMessageImportant: boundary.telegram }));
import { cargarArchivoService as storeFile } from "#src/services/usuario/archivo.Service.js";
import { subirFacturaService as importInvoice } from "#src/services/empresario/factura.Service.js";
import { createFactoringService as createOperation } from "#src/services/empresario/factoring.Service.js";
import { createFactoringpropuestaService as createProposal, updateFactoringpropuestaService as updateProposal } from "#src/services/admin/factoringpropuesta.Service.js";
import { acceptFactoringpropuestaService as approve } from "#src/services/empresario/factoringpropuesta.Service.js";
import { createFactoringhistorialestadoService as changeState } from "#src/services/admin/factoringhistorialestado.Service.js";
import { createFactoringliquidacionService as settle, getFactoringliquidacionDetalleService as detail } from "#src/services/admin/factoringliquidacion.Service.js";

const start = "2026-10-08T05:00:00Z";
const due = "2026-11-07T05:00:00Z";
const originalNow = Settings.now;
let workspace: ReturnType<typeof invoiceWorkspace>;
let user: Awaited<ReturnType<typeof seedMasters>>;
let pdf: Buffer;
beforeAll(async () => {
  pdf = await new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument(); const chunks: Buffer[] = [];
    doc.on("data", chunk => chunks.push(chunk)); doc.on("error", reject); doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.text("Factura sintetica del recorrido conectado"); doc.end();
  });
});
beforeEach(async () => {
  vi.clearAllMocks(); [boundary.requested, boundary.available, boundary.accepted, boundary.started, boundary.telegram].forEach(mock => mock.mockResolvedValue(undefined));
  Settings.now = () => Date.parse(start); workspace = invoiceWorkspace(); boundary.root = workspace.root;
  user = await seedMasters();
});
afterEach(async () => {
  vi.useRealTimers(); Settings.now = originalNow;
  await db.$executeRawUnsafe("DROP TRIGGER IF EXISTS it_connected_failure");
  try { await cleanFixtures(); } finally { workspace.cleanup(); }
});
afterAll(async () => { await db.$disconnect(); });

async function arrange(currency: string) {
  // Solo entradas, empresas y catálogos; nunca se insertan resultados del recorrido.
  const parties = await seedOperationDependencies(user.idusuario, currency);
  const states = new Map<number, string>();
  for (const id of [3, 4, 36]) {
    const state = await db.factoring_estado.create({ data: { idfactoringestado: id, code: `IT-${id}`, estado1: "Prueba", estado2: "Prueba" } }); states.set(id, state.factoringestadoid);
  }
  const proposalStates = new Map<number, string>();
  for (const id of [3, 4, 6]) {
    const state = await db.factoring_propuesta_estado.create({ data: { idfactoringpropuestaestado: id, code: `IT-${id}`, nombre: "Prueba", alias: "IT", color: "blue" } }); proposalStates.set(id, state.factoringpropuestaestadoid);
  }
  const risk = await db.riesgo.create({ data: { code: "IT-RISK", nombre: "Prueba", alias: "IT", score: 1, color: "blue" } });
  const type = await db.factoring_tipo.create({ data: { nombre: "Prueba", alias: "IT", color: "blue" } });
  const strategy = await db.factoring_estrategia.create({ data: { idfactoringestrategia: 1, code: "IT", nombre_estrategia: "Sintetica" } });
  await db.factoring_config_comision.create({ data: { idfactoringconfigcomision: 1, code: "IT", idriesgo: risk.idriesgo, version: 1, factor1: "0.01", factor2: 0, factor3: 1 } });
  // Tarifa interbancaria cero en este catálogo, independiente del autoincremento del banco.
  for (const [id, value] of [[1, "0.18"], [2, "15"], [3, "0"], [5, "5"], [6, "0"]] as const) await db.configuracion_app.create({ data: { idconfiguracionapp: id, code: `IT-${id}`, variable: `IT-${id}`, valor: value, unidad: "Prueba", fecha_inicio: new Date("2026-01-01") } });
  for (const id of [1, 2, 3, 4, 5]) await db.financiero_tipo.create({ data: { idfinancierotipo: id, code: `IT-${id}`, nombre: "Prueba", alias: "IT", color: "blue" } });
  for (const id of [1, 2, 3, 4, 7, 8, 9, 20]) await db.financiero_concepto.create({ data: { idfinancieroconcepto: id, code: `IT-${id}`, nombre: "Prueba", alias: "IT", color: "blue", factor: [7, 8].includes(id) ? 1 : -1, afecto_igv: [1, 2, 9, 20].includes(id) } });
  const settlementState = await db.factoring_liquidacion_estado.create({ data: { idfactoringliquidacionestado: 1, code: "IT", nombre: "Prueba", alias: "IT", color: "blue", visible_cedente: 1 } });
  for (const [id, code, extension, mime] of [[8, "ITXML001", ".xml", "application/xml"], [9, "ITPDF001", ".pdf", "application/pdf"]] as const) await db.archivo_tipo.update({ where: { idarchivotipo: id }, data: { code, extensiones_permitidas: extension, mimetypes_permitidos: mime, tamanio_maximo: 1048576 } });
  expect(await db.factoring.count()).toBe(0); expect(await db.factoring_propuesta.count()).toBe(0); expect(await db.factura.count()).toBe(0); expect(await db.archivo.count()).toBe(0);
  // Controlar solo Date para el instante de inicio; temporizadores/SQL siguen reales.
  vi.useFakeTimers({ toFake: ["Date"] }); vi.setSystemTime(new Date(start));
  return { parties, states, proposalStates, risk, type, strategy, settlementState };
}
async function uploadFiles(currency: string) {
  const xml = invoiceXml({ currency, terms: paymentTerm("FormaPago", "Credito", "1180") + paymentTerm("FormaPago", "Cuota001", "1180", "2026-11-07") }).replaceAll("2026-12-01", "2026-11-07").replaceAll('currencyID="PEN"', `currencyID="${currency}"`);
  const files = [];
  for (const [extension, bytes, code, mime] of [["xml", Buffer.from(xml), "ITXML001", "application/xml"], ["pdf", pdf, "ITPDF001", "application/pdf"]] as const) {
    const input = path.join(workspace.root, `input.${extension}`); writeFileSync(input, bytes);
    const result = await storeFile({ idusuario: user.idusuario, archivotipo_code: code, archivoRaw: { path: input, size: bytes.length, originalname: `factura.${extension}`, mimetype: mime, anio_upload: "2026", mes_upload: "10", dia_upload: "08", filename: `stored.${extension}`, encoding: "utf8", codigo_archivo: `IT-${extension}` } });
    files.push(result.archivoid);
    const row = await db.archivo.findUniqueOrThrow({ where: { archivoid: result.archivoid } });
    expect(readFileSync(path.join(workspace.root, "success", row.ruta, row.nombrealmacenamiento))).toEqual(bytes);
  }
  return { factura_xml: files[0], factura_pdf: files[1], idusuario: user.idusuario, sourceXml: Buffer.from(xml) };
}
async function throughProposal(currency: string) {
  const catalog = await arrange(currency); const files = await uploadFiles(currency);
  const invoice = await importInvoice(files);
  const storedInvoice = await db.factura.findUniqueOrThrow({ where: { facturaid: invoice.facturaid }, include: { factura_itemes: true, archivo_facturas: true } });
  expect(storedInvoice.importe_neto.toString()).toBe("1180"); expect(storedInvoice.factura_itemes[0].moneda).toBe(currency); expect(storedInvoice.archivo_facturas).toHaveLength(2);
  const op = await createOperation({ facturas: [{ facturaid: invoice.facturaid }], cedenteid: catalog.parties.cedente.empresaid, aceptanteid: catalog.parties.pagador.empresaid, cuentabancariaid: catalog.parties.cuenta.cuentabancariaid, monedaid: catalog.parties.moneda.monedaid, contactoaceptanteid: catalog.parties.contacto.contactoid, monto_neto: "1", fecha_pago_estimado: due, dias_pago_estimado: "30", idusuario: user.idusuario });
  expect(op.monto_neto.toString()).toBe("1180"); expect(op.idfactoringestado).toBe(1);
  expect(await db.factoring_factura.findFirstOrThrow()).toMatchObject({ idfactoring: op.idfactoring, idfactura: storedInvoice.idfactura });
  await changeState({ factoringid: op.factoringid, factoringestadoid: catalog.states.get(3)!, comentario: "Preparación de propuesta" }, user.idusuario);
  await createProposal({ factoringid: op.factoringid, factoringtipoid: catalog.type.factoringtipoid, factoringestrategiaid: catalog.strategy.factoringestrategiaid, riesgooperacionid: catalog.risk.riesgoid, riesgocedenteid: catalog.risk.riesgoid, riesgoaceptanteid: catalog.risk.riesgoid, factoringpropuestaestadoid: catalog.proposalStates.get(3)!, monto_neto: Number(op.monto_neto), porcentaje_financiado_estimado: 0.8, porcentaje_comision_descuento: 0, tdm: 0.02, fecha_pago_estimado: due }, user.idusuario);
  const proposal = await db.factoring_propuesta.findFirstOrThrow({ include: { factoring_propuesta_financieros: true } });
  expect([proposal.monto_financiado, proposal.monto_garantia, proposal.monto_descuento, proposal.monto_comision, proposal.monto_comision_igv, proposal.monto_adelanto].map(value => value!.toString())).toEqual(["944", "236", "18.88", "11.8", "2.12", currency === "PEN" ? "893.5" : "905.3"]);
  expect(proposal.idfactoring).toBe(op.idfactoring); expect(proposal.dias_pago_estimado).toBe(30);
  return { ...catalog, files, invoice: storedInvoice, op, proposal, approval: { factoringid: op.factoringid, factoringpropuestaid: proposal.factoringpropuestaid, idusuario: user.idusuario } };
}
async function throughStart(currency: string) {
  const f = await throughProposal(currency);
  await updateProposal({ factoringpropuestaid: f.proposal.factoringpropuestaid, factoringpropuestaestadoid: f.proposalStates.get(4)! }, user.idusuario);
  await approve(f.approval);
  expect(await db.factoring.findUniqueOrThrow({ where: { factoringid: f.op.factoringid } })).toMatchObject({ idfactoringestado: 4, idfactoringpropuestaaceptada: f.proposal.idfactoringpropuesta });
  expect((await db.factoring_propuesta.findUniqueOrThrow({ where: { factoringpropuestaid: f.proposal.factoringpropuestaid } })).idfactoringpropuestaestado).toBe(6);
  await changeState({ factoringid: f.op.factoringid, factoringestadoid: f.states.get(36)!, comentario: "Inicio del recorrido", archivos: [f.files.factura_pdf] }, user.idusuario);
  const started = await db.factoring.findUniqueOrThrow({ where: { factoringid: f.op.factoringid } });
  expect(started.fecha_operacion).toEqual(new Date(start)); expect(started.idfactoringestado).toBe(36);
  return { ...f, settlementDto: { factoringid: started.factoringid, factoringliquidacionestadoid: f.settlementState.factoringliquidacionestadoid, fecha_liquidacion: due, fecha_pago_efectivo: due } };
}
async function snapshot() {
  const tables = ["archivo", "factura", "factura_item", "archivo_factura", "factoring", "factoring_factura", "factoring_historial_estado", "archivo_factoring_historial_estado", "factoring_propuesta", "factoring_propuesta_financiero", "factoring_propuesta_historial_estado", "factoring_liquidacion", "factoring_liquidacion_financiero"];
  return Promise.all(tables.map(table => db.$queryRawUnsafe(`SELECT * FROM \`${table}\``)));
}
async function verifySettlement(f: Awaited<ReturnType<typeof throughStart>>, date: string, days: number, mora: number, discount: string, refund: string, charge: string, balance: string) {
  const before = await snapshot();
  const created = await settle({ ...f.settlementDto, fecha_pago_efectivo: date }, user.idusuario);
  const saved = await detail({ factoringliquidacionid: created.factoringliquidacionid });
  expect(saved).toMatchObject({ idfactoring: f.op.idfactoring, idusuariocrea: user.idusuario, idusuariomod: user.idusuario, dias_pago_efectivo: days, dias_mora_efectivo: mora, fecha_pago_efectivo: new Date(date) });
  expect([saved.monto_descuento_efectivo, saved.monto_descuento_a_favor, saved.monto_descuento_mora, saved.monto_total_a_favor, saved.monto_total_por_cobrar].map(value => value.toString())).toEqual([discount, refund, charge, balance, "0"]);
  const sum = saved.factoring_liquidacion_financieros.reduce((sum, item) => sum.plus(item.total.mul(item.financiero_concepto.factor)), saved.monto_total_a_favor.mul(0));
  expect(sum.toString()).toBe(balance);
  for (const item of saved.factoring_liquidacion_financieros) { expect(item.total.equals(item.monto.plus(item.igv))).toBe(true); expect(item.idusuariocrea).toBe(user.idusuario); }
  const after = await snapshot(); expect(after.slice(0, 11)).toEqual(before.slice(0, 11));
  const operationHistory = await db.factoring_historial_estado.findMany({ orderBy: { idfactoringhistorialestado: "asc" } });
  const proposalHistory = await db.factoring_propuesta_historial_estado.findMany({ orderBy: { idfactoringpropuestahistorialestado: "asc" } });
  expect(operationHistory.map(row => row.idfactoringestado)).toEqual([1, 3, 4, 36]);
  expect(proposalHistory.map(row => row.idfactoringpropuestaestado)).toEqual([3, 4, 6]);
  for (const history of [...operationHistory, ...proposalHistory]) expect(history).toMatchObject({ idusuariomodifica: user.idusuario, idusuariocrea: user.idusuario, idusuariomod: user.idusuario });
  expect(f.invoice.idusuariocrea).toBe(user.idusuario); expect(f.op.idusuariocrea).toBe(user.idusuario); expect(f.proposal.idusuariocrea).toBe(user.idusuario);
  for (const [id, bytes] of [[f.files.factura_xml, f.files.sourceXml], [f.files.factura_pdf, pdf]] as const) {
    const file = await db.archivo.findUniqueOrThrow({ where: { archivoid: id } });
    expect(readFileSync(path.join(workspace.root, "success", file.ruta, file.nombrealmacenamiento))).toEqual(bytes);
  }
  for (const line of await Promise.all([db.factor_limite.findFirstOrThrow(), db.cedente_limite.findFirstOrThrow(), db.pagador_limite.findFirstOrThrow()])) expect([line.usado.toString(), line.disponible.toString()]).toEqual(["0", "1180"]);
  for (const mock of [boundary.requested, boundary.available, boundary.accepted, boundary.started]) expect(mock).toHaveBeenCalledTimes(1);
}

describe("Recorrido conectado: XML → operación → propuesta → aprobación → inicio → liquidación", () => {
  for (const currency of ["PEN", "USD"]) it.each([
    ["anticipado", start, 0, 0, "0", "18.88", "0", "254.88"],
    ["puntual", due, 30, 0, "18.88", "0", "0", "236"],
    ["mora", "2026-12-07T05:00:00Z", 60, 30, "38.14", "0", "19.26", "213.27"],
  ] as const)(`${currency}, pago %s conserva trazabilidad e importes`, async (_label, date, days, mora, discount, refund, charge, balance) => {
    const f = await throughStart(currency); await verifySettlement(f, date, days, mora, discount, refund, charge, balance);
  });
  it.each(["PEN", "USD"])("%s: no aprueba propuesta aún no disponible; conserva etapas previas", async currency => {
    const f = await throughProposal(currency); const before = await snapshot();
    await expect(approve(f.approval)).rejects.toMatchObject({ statusCode: 404 }); expect(await snapshot()).toEqual(before);
    expect(boundary.accepted).not.toHaveBeenCalled(); expect(boundary.started).not.toHaveBeenCalled();
  });
  it.each(["PEN", "USD"])("%s: fallo tardío de liquidación conserva recorrido confirmado y permite reintentar", async currency => {
    const f = await throughStart(currency); const before = await snapshot();
    await db.$executeRawUnsafe("CREATE TRIGGER it_connected_failure BEFORE INSERT ON factoring_liquidacion_financiero FOR EACH ROW BEGIN IF NEW.orden=2 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='IT connected failure'; END IF; END");
    await expect(settle({ ...f.settlementDto, fecha_pago_efectivo: "2026-12-07T05:00:00Z" }, user.idusuario)).rejects.toMatchObject({ statusCode: 500 });
    expect(await snapshot()).toEqual(before);
    await db.$executeRawUnsafe("DROP TRIGGER it_connected_failure");
    await verifySettlement(f, "2026-12-07T05:00:00Z", 60, 30, "38.14", "0", "19.26", "213.27");
    expect(await db.factoring_liquidacion.count()).toBe(1);
  });
});
