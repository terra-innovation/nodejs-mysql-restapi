import { Decimal } from "@prisma/client/runtime/library";
import { DateTime, Settings } from "luxon";
import { execFileSync } from "child_process";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

// Solo se sustituyen infraestructura y catálogos. Servicio, fechas y fórmulas V4/V3 son reales.
jest.mock("#root/src/utils/logger.pino.js", () => ({ line: () => "audit", log: { debug: jest.fn(), warn: jest.fn(), error: jest.fn(), info: jest.fn() } }));
jest.mock("#root/src/providers/email/email.Provider.js", () => ({}));
jest.mock("#src/utils/storageUtils.js", () => ({}));
jest.mock("#src/utils/document/PDFgenerator.js", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("#root/src/models/prisma/db-factoring.js", () => ({
  prismaFT: { client: { $transaction: jest.fn(async (callback) => callback({})) }, transactionTimeout: 5000 },
}));
jest.mock("#root/src/daos/factoring.Dao.js", () => ({ getFactoringByFactoringid: jest.fn() }));
jest.mock("#root/src/daos/factoringliquidacion.Dao.js", () => ({
  insertFactoringliquidacion: jest.fn(async (_tx, input) => ({ idfactoringliquidacion: 20, ...input })),
}));
jest.mock("#root/src/daos/factoringliquidacionestado.Dao.js", () => ({
  getFactoringliquidacionestadoByFactoringliquidacionestadoid: jest.fn(async () => ({ idfactoringliquidacionestado: 1 })),
}));
jest.mock("#root/src/daos/factoringliquidacionfinanciero.Dao.js", () => ({ insertFactoringliquidacionfinanciero: jest.fn() }));
jest.mock("#root/src/daos/configuracionapp.Dao.js", () => ({
  getIGV: jest.fn(async () => ({ valor: "0.18" })),
  getCostoCAVALIPen: jest.fn(async () => ({ valor: "10" })),
  getCostoCAVALIUsd: jest.fn(async () => ({ valor: "3" })),
  getComisionBCPPen: jest.fn(async () => ({ valor: "7.50" })),
  getComisionBCPUsd: jest.fn(async () => ({ valor: "2.50" })),
}));
jest.mock("#root/src/daos/riesgo.Dao.js", () => ({ getRiesgoByIdriesgo: jest.fn(async () => ({ idriesgo: 1 })) }));
jest.mock("#root/src/daos/factoringconfigcomision.Dao.js", () => ({
  getFactoringconfigcomisionByIdriesgo: jest.fn(async () => {
    const { Decimal } = jest.requireActual("@prisma/client/runtime/library");
    return { factor1: new Decimal("0.01"), factor2: new Decimal(100), factor3: new Decimal(1) };
  }),
}));
jest.mock("#root/src/daos/financierotipo.Dao.js", () => ({
  getComision: jest.fn(async () => ({ idfinancierotipo: 1 })),
  getCosto: jest.fn(async () => ({ idfinancierotipo: 2 })),
  getGasto: jest.fn(async () => ({ idfinancierotipo: 3 })),
  getGasto_excento_igv: jest.fn(async () => ({ idfinancierotipo: 4 })),
  getFinancierotipoByIdfinancierotipo: jest.fn(async (_tx, id) => ({ idfinancierotipo: id })),
  getFinancierotipoByFinancierotipoid: jest.fn(),
}));
jest.mock("#root/src/daos/financieroconcepto.Dao.js", () => ({
  getComisionFinanzaTech: jest.fn(async () => ({ idfinancieroconcepto: 1 })),
  getCostoCAVALIPen: jest.fn(async () => ({ idfinancieroconcepto: 2 })),
  getCostoTransaccion: jest.fn(async () => ({ idfinancieroconcepto: 3 })),
  getGastoInterbancario: jest.fn(async () => ({ idfinancieroconcepto: 3 })),
  getFinancieroconceptoByIdfinancieroconcepto: jest.fn(async (_tx, id) => ({
    idfinancieroconcepto: id, factor: id === 7 || id === 8 ? 1 : -1, afecto_igv: false,
  })),
  getFinancieroconceptoByFinancieroconceptoid: jest.fn(),
}));

import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import * as financieroTipoDao from "#root/src/daos/financierotipo.Dao.js";
import * as financieroConceptoDao from "#root/src/daos/financieroconcepto.Dao.js";
import { simulateFactoringLogicV4 } from "#root/src/services/admin/factoringCalculation.Service.js";
import { simulateFactoringliquidacion } from "#root/src/controllers/admin/servicio/factoring/factoringliquidacion.Controller.js";
import { createFactoringliquidacionService } from "#root/src/services/admin/factoringliquidacion.Service.js";
import * as dateUtils from "#src/utils/dateUtils.js";

interface Case {
  id: string;
  group: string;
  due: string;
  offset: number;
  start?: string;
  proposalStart?: string;
  dueISO?: string;
  paymentISO?: string;
  serverZone?: string;
  net?: string;
  financed?: string;
  rate?: string;
  bank?: number;
  currency?: number;
  exempt?: boolean;
  reject?: boolean;
  additional?: { type: number; affected: boolean; factor: number; amount: string; quantity?: string };
  browserRecoveredDate?: string;
  note?: string;
  persist?: boolean;
}

const records: any[] = [];
const civilDays = (first: string, last: string) => Math.round((Date.parse(`${last}T00:00:00Z`) - Date.parse(`${first}T00:00:00Z`)) / 86400000);
const shift = (date: string, days: number) => DateTime.fromISO(date, { zone: "UTC" }).plus({ days }).toISODate();
const peruISO = (date: string, time = "00:00:00") => `${date}T${time}-05:00`;
const independentDiscount = (principal: Decimal, rate: string, days: number) => principal.mul(new Decimal(1).add(rate).pow(new Decimal(days).div(30)).minus(1)).toDecimalPlaces(2);
const fixedDue = "2026-10-01";
const cases: Case[] = [];

// Calendario: 480 casos. Todos empiezan 30 días antes de la fecha pactada.
for (const due of [fixedDue, "2026-02-01", "2027-03-01", "2028-03-01", "2027-01-01", "2026-11-08"]) {
  for (const offset of [-30, -10, -5, -1, 0, 1, 5, 10, 30, 90]) {
    for (const bank of [1, 2]) for (const currency of [1, 2]) for (const exempt of [false, true]) {
      cases.push({ id: `cal-${due}-${offset}-${bank}-${currency}-${exempt}`, group: "calendario", due, offset, bank, currency, exempt });
    }
  }
}

// Sensibilidad financiera: 1.440 casos; no se sustituye el resultado del calculador.
for (const net of ["100.01", "20000", "99999999.99"]) for (const rate of ["0", "0.015", "0.02", "0.10"]) {
  for (const financed of ["0.5", "0.8", "1"]) for (const offset of [-5, -1, 0, 1, 10]) {
    for (const bank of [1, 2]) for (const currency of [1, 2]) for (const exempt of [false, true]) {
      cases.push({ id: `fin-${net}-${rate}-${financed}-${offset}-${bank}-${currency}-${exempt}`, group: "finanzas", due: fixedDue, offset, net, rate, financed, bank, currency, exempt });
    }
  }
}

// Misma fecha visible, distintas horas almacenadas y zona predeterminada del servidor: 320 casos.
for (const serverZone of ["UTC", "America/Lima", "America/New_York", "Europe/Madrid"]) {
  for (const storedTime of ["00:00:00", "04:59:00", "05:00:00", "12:00:00", "23:59:00"]) {
    for (const paymentTime of ["00:00:00", "04:59:00", "12:00:00", "23:59:00"]) for (const offset of [-1, 0, 1, 10]) {
      cases.push({
        id: `tz-${serverZone}-${storedTime}-${paymentTime}-${offset}`, group: "zonas_servidor", due: fixedDue, offset, serverZone,
        dueISO: `${fixedDue}T${storedTime}Z`, paymentISO: peruISO(shift(fixedDue, offset), paymentTime),
      });
    }
  }
}

// Diferencia entre fecha de propuesta y comienzo real de la operación.
for (const lag of [-2, -1, 0, 1, 5]) {
  cases.push({ id: `inicio-vs-propuesta-${lag}`, group: "inicio_vs_propuesta", due: fixedDue, offset: 0, proposalStart: shift(fixedDue, -30 - lag) });
}

cases.push(
  { id: "fixture-original-UTC", group: "fixture_previo", due: fixedDue, offset: 10, start: "2026-09-01T00:00:00Z", dueISO: `${fixedDue}T00:00:00Z`, paymentISO: "2026-10-11T00:00:00Z", note: "En Lima el pago es el 10/oct, aunque el literal UTC dice 11/oct." },
  { id: "fixture-corregido-instantes-Peru", group: "fixture_previo", due: fixedDue, offset: 10 },
  { id: "pago-dia-antes-inicio", group: "validacion_cronologica", due: fixedDue, offset: -31, reject: true },
  { id: "pago-diez-dias-antes-inicio", group: "validacion_cronologica", due: fixedDue, offset: -40, reject: true },
  { id: "pago-invalido", group: "validacion_entrada", due: fixedDue, offset: 0, paymentISO: "fecha-no-valida", reject: true },
  { id: "pago-vacio", group: "validacion_entrada", due: fixedDue, offset: 0, paymentISO: "", reject: true },
  { id: "cargo-afecto-tipo2", group: "conceptos_adicionales", due: fixedDue, offset: 0, additional: { type: 2, affected: true, factor: -1, amount: "100" } },
  { id: "cargo-inafecto-tipo2", group: "conceptos_adicionales", due: fixedDue, offset: 0, additional: { type: 2, affected: false, factor: -1, amount: "100" } },
  { id: "cargo-inafecto-tipo4", group: "conceptos_adicionales", due: fixedDue, offset: 0, additional: { type: 4, affected: false, factor: -1, amount: "100" } },
  { id: "cargo-afecto-tipo4", group: "conceptos_adicionales", due: fixedDue, offset: 0, additional: { type: 4, affected: true, factor: -1, amount: "100" } },
  { id: "abono-inafecto-tipo2", group: "conceptos_adicionales", due: fixedDue, offset: 0, additional: { type: 2, affected: false, factor: 1, amount: "100" } },
  { id: "cargo-negativo", group: "validacion_entrada", due: fixedDue, offset: 0, additional: { type: 2, affected: true, factor: -1, amount: "-100" }, reject: true },
  { id: "cantidad-negativa", group: "validacion_entrada", due: fixedDue, offset: 0, additional: { type: 2, affected: true, factor: -1, amount: "100", quantity: "-1" }, reject: true },
  { id: "persistir-anticipado", group: "persistencia_simulada", due: fixedDue, offset: -5, persist: true },
  { id: "persistir-puntual", group: "persistencia_simulada", due: fixedDue, offset: 0, persist: true },
  { id: "persistir-tardio", group: "persistencia_simulada", due: fixedDue, offset: 10, persist: true },
);

const browserCases: Case[] = [];
beforeAll(() => {
  for (const zone of ["America/Lima", "UTC", "Europe/Madrid", "America/Bogota", "Asia/Tokyo"]) for (const offset of [-1, 0, 1, 10]) {
    const inspect = (date: string) => JSON.parse(execFileSync(process.execPath, [join(process.cwd(), "scripts/analisis/fecha-liquidacion-frontend.cjs"), date], { env: { ...process.env, TZ: zone }, encoding: "utf8" }));
    const due = inspect(fixedDue);
    const paid = inspect(shift(fixedDue, offset));
    browserCases.push({ id: `browser-${zone}-${offset}`, group: "navegador", due: fixedDue, offset, dueISO: due.iso, paymentISO: paid.iso, browserRecoveredDate: due.recoveredDate, note: `Navegador ${zone}; fechas elegidas ${fixedDue} / ${paid.selectedDate}` });
  }
}, 60000);

async function execute(input: Case) {
  const savedZone = Settings.defaultZone;
  Settings.defaultZone = input.serverZone || "UTC";
  const issues: string[] = [];
  const observations: string[] = [];
  try {
    const startISO = input.start || peruISO(shift(input.due, -30), "10:00:00");
    const startDate = dateUtils.toLimaDateTime(new Date(startISO));
    const dueISO = input.dueISO || peruISO(input.due);
    const paymentISO = input.paymentISO ?? peruISO(shift(input.due, input.offset));
    const principal = new Decimal(input.net || "20000");
    const financed = new Decimal(input.financed || "0.8");
    const rate = input.rate || "0.02";
    const acceptedStart = input.proposalStart ? dateUtils.toLimaDateTime(peruISO(input.proposalStart, "10:00:00")) : startDate;
    const emission = dateUtils.toLimaDate("2026-01-01");
    const quote = await simulateFactoringLogicV4(1, input.bank || 1, 2, principal, acceptedStart, dateUtils.toLimaDate(new Date(dueISO)), emission, financed, new Decimal(rate), new Decimal(0), input.currency || 1);
    const factoring = {
      idfactoring: 10, factoringid: "11111111-1111-1111-1111-111111111111", cantidad_facturas: 2,
      monto_neto: principal, fecha_operacion: new Date(startISO), fecha_emision: new Date("2026-01-01T00:00:00Z"),
      cuenta_bancaria: { idbanco: input.bank || 1 }, idmoneda: input.currency || 1, moneda: { idmoneda: input.currency || 1 },
      factoring_propuesta_aceptada: { ...quote, idriesgooperacion: 1, porcentaje_financiado_estimado: financed, tdm: new Decimal(rate), porcentaje_comision_descuento: new Decimal(0), fecha_pago_estimado: new Date(dueISO) },
    };
    (factoringDao.getFactoringByFactoringid as jest.Mock).mockResolvedValue(factoring);
    const additional = input.additional;
    (financieroTipoDao.getFinancierotipoByFinancierotipoid as jest.Mock).mockResolvedValue({ idfinancierotipo: additional?.type || 2 });
    (financieroConceptoDao.getFinancieroconceptoByFinancieroconceptoid as jest.Mock).mockResolvedValue({ idfinancieroconcepto: 99, factor: additional?.factor || -1, afecto_igv: additional?.affected || false });
    const body = {
      fecha_liquidacion: "2026-10-06T12:00:00Z", fecha_pago_efectivo: paymentISO, exonerar_gasto_interbancario: input.exempt || false,
      factoring_liquidacion_financieros: additional ? [{ financierotipoid: "33333333-3333-3333-3333-333333333333", financieroconceptoid: "44444444-4444-4444-4444-444444444444", cantidad: Number(additional.quantity || "1"), monto_unitario: Number(additional.amount) }] : [],
    };
    const record: any = {
      ...input, serverZone: input.serverZone || "UTC", net: principal.toString(), financed: financed.toString(), rate,
      bank: input.bank || 1, currency: input.currency || 1, exempt: input.exempt || false,
      startISO, dueISO, paymentISO, startCivil: startDate.toISODate(), dueDisplayed: new Date(dueISO).toISOString().slice(0, 10),
      originalDiscount: quote.monto_descuento.toString(), guarantee: quote.monto_garantia.toString(), financedAmount: quote.monto_financiado.toString(),
      quoteDays: quote.dias_pago_estimado, quoteCoverage: Number.isFinite(quote.dias_cobertura_garantia_estimado) ? quote.dias_cobertura_garantia_estimado : String(quote.dias_cobertura_garantia_estimado),
      issues, observations,
    };
    try {
      let result: any;
      const response: any = { status: jest.fn().mockReturnThis(), json: jest.fn((value) => { result = value.data; }) };
      await simulateFactoringliquidacion({ params: { factoringid: factoring.factoringid }, body } as any, response);
      record.httpStatus = response.status.mock.calls[0][0];
      const paymentCivil = dateUtils.toLimaDateTime(result.fecha_pago_efectivo).toISODate();
      const expectedPeriod = civilDays(record.startCivil, paymentCivil);
      // Regla indicada por el usuario: ambos instantes se interpretan por día civil de Perú.
      // Se conserva una segunda referencia para la fecha que actualmente muestra React.
      record.dueCivilPeru = dateUtils.toLimaDateTime(new Date(dueISO)).toISODate();
      const expectedDelinquency = Math.max(0, civilDays(record.dueCivilPeru, paymentCivil));
      record.expectedDelinquencyDisplayed = Math.max(0, civilDays(record.dueDisplayed, paymentCivil));
      record.paymentCivil = paymentCivil;
      record.expectedPeriod = expectedPeriod;
      record.expectedDelinquency = expectedDelinquency;
      record.actual = JSON.parse(JSON.stringify(result));
      record.displayIssues = [];
      if (result.dias_mora_efectivo !== record.expectedDelinquencyDisplayed) record.displayIssues.push("DIAS_MORA_VS_FECHA_VISIBLE");
      if (record.dueDisplayed !== record.dueCivilPeru) observations.push("FECHA_PACTADA_VISIBLE_DIFIERE_DE_PERU");
      if (!Number.isFinite(result.dias_pago_efectivo) || !Number.isFinite(result.dias_mora_efectivo) ||
          !result.monto_descuento_efectivo.isFinite() || !result.monto_total_a_favor.isFinite() || !result.monto_total_por_cobrar.isFinite()) {
        issues.push("RESULTADO_NO_FINITO");
      }
      if (input.reject) issues.push("ENTRADA_ACEPTADA_SIN_VALIDACION");
      if (result.dias_pago_efectivo !== expectedPeriod) issues.push("DIAS_FINANCIAMIENTO");
      if (result.dias_mora_efectivo !== expectedDelinquency) issues.push("DIAS_MORA");
      if (result.monto_descuento_efectivo.lessThan(0)) issues.push("DESCUENTO_NEGATIVO");
      if (result.monto_descuento_a_favor.greaterThan(0) && result.monto_descuento_mora.greaterThan(0)) issues.push("ABONO_Y_MORA_SIMULTANEOS");
      const oracleDiscount = independentDiscount(new Decimal(record.financedAmount), rate, expectedPeriod);
      record.independentDiscount = oracleDiscount.toString();
      record.roundingDifference = result.monto_descuento_efectivo.minus(oracleDiscount).toString();
      if (result.monto_descuento_efectivo.minus(oracleDiscount).abs().greaterThan("0.01")) observations.push("REDONDEO_DIARIO");
      record.capitalDifference = new Decimal(record.financedAmount).add(record.guarantee).minus(principal).toString();
      if (record.capitalDifference !== "0") observations.push("CAPITAL_REDONDEADO_NO_CUADRA");
      if (record.quoteCoverage === "Infinity" || record.quoteCoverage === "NaN") observations.push("COBERTURA_PROPUESTA_NO_FINITA");
      if (expectedDelinquency === 0 && result.monto_descuento_mora.greaterThan(0)) issues.push("MORA_EN_PAGO_NO_TARDIO");
      if (input.offset === 0 && result.monto_descuento_a_favor.greaterThan(0) && input.proposalStart) observations.push("ABONO_PUNTUAL_POR_INICIO_DISTINTO");
      if (input.offset === 0 && result.monto_descuento_efectivo.greaterThan(quote.monto_descuento) && input.proposalStart) observations.push("DESCUENTO_MAYOR_SIN_CARGO_POR_INICIO_DISTINTO");
      const expectedRefund = expectedDelinquency === 0 ? Decimal.max(new Decimal(record.originalDiscount).minus(result.monto_descuento_efectivo), 0) : new Decimal(0);
      const expectedLateCharge = expectedDelinquency > 0 ? Decimal.max(result.monto_descuento_efectivo.minus(record.originalDiscount), 0) : new Decimal(0);
      record.expectedRefund = expectedRefund.toString();
      record.expectedLateCharge = expectedLateCharge.toString();
      const expectedDisplayedLateCharge = record.expectedDelinquencyDisplayed > 0 ? Decimal.max(result.monto_descuento_efectivo.minus(record.originalDiscount), 0) : new Decimal(0);
      record.expectedDisplayedLateCharge = expectedDisplayedLateCharge.toString();
      if (!result.monto_descuento_mora.equals(expectedDisplayedLateCharge)) record.displayIssues.push("CARGO_MORA_VS_FECHA_VISIBLE");
      if (!result.monto_descuento_a_favor.equals(expectedRefund)) issues.push("REINTEGRO_DIFIERE_DEL_CALENDARIO");
      if (!result.monto_descuento_mora.equals(expectedLateCharge)) issues.push("CARGO_MORA_DIFIERE_DEL_CALENDARIO");
      let expectedNet = new Decimal(record.guarantee).add(expectedRefund).minus(expectedLateCharge);
      const feeAmount = new Decimal(record.currency === 1 ? "7.50" : "2.50");
      const fee = result.factoring_liquidacion_financieros.find((item) => item.financiero_concepto.idfinancieroconcepto === 3);
      if (fee) expectedNet = expectedNet.minus(feeAmount);
      if (record.bank !== 1 && !record.exempt && !fee && expectedNet.greaterThan(feeAmount)) observations.push("SIN_GASTO_INTERBANCARIO_CON_REINTEGRO");
      if (additional) {
        const amount = new Decimal(additional.amount).mul(additional.quantity || 1).toDecimalPlaces(2);
        const expectedTax = additional.affected ? amount.mul("0.18").toDecimalPlaces(2) : new Decimal(0);
        const item = result.factoring_liquidacion_financieros.find((value) => value.financiero_concepto.idfinancieroconcepto === 99);
        record.expectedAdditionalTax = expectedTax.toString();
        record.actualAdditionalTax = item.igv.toString();
        if (!item.igv.equals(expectedTax)) issues.push("IGV_DIFIERE_DE_BANDERA_CONCEPTO");
        expectedNet = expectedNet.add(amount.add(expectedTax).mul(additional.factor));
      }
      record.expectedNet = expectedNet.toString();
      const actualNet = result.monto_total_a_favor.minus(result.monto_total_por_cobrar);
      record.actualNet = actualNet.toString();
      if (!actualNet.equals(expectedNet)) issues.push("SALDO_DIFIERE_DE_DESGLOSE_ESPERADO");
      if (input.browserRecoveredDate && input.browserRecoveredDate !== input.due) observations.push("FECHA_NAVEGADOR_NO_CONSERVADA");
      if (input.persist) {
        const created = await createFactoringliquidacionService({ ...body, factoringid: factoring.factoringid, factoringliquidacionestadoid: "22222222-2222-2222-2222-222222222222" }, 1);
        for (const field of ["dias_pago_efectivo", "dias_mora_efectivo", "monto_descuento_efectivo", "monto_descuento_a_favor", "monto_descuento_mora", "monto_total_a_favor", "monto_total_por_cobrar"]) {
          if (String(created[field]) !== String(result[field])) issues.push(`PERSISTENCIA_DIFIERE_${field}`);
        }
      }
    } catch (error) {
      record.error = { type: error.name, message: error.message, status: error.statusCode || (error.name === "ValidationError" ? 400 : 500) };
      if (!input.reject) issues.push("ERROR_EN_ENTRADA_VALIDA");
    }
    records.push(record);
    return record;
  } finally {
    Settings.defaultZone = savedZone;
  }
}

// Los fallos del contrato de auditoría quedan visibles; no se cambian expectativas para hacerlos pasar.
describe("Auditoría real de liquidación: fechas e importes", () => {
  it.each(cases)("$id", async (input) => {
    const record = await execute(input);
    expect(record.issues).toEqual([]);
  });
  it("fechas del frontend en cinco zonas de navegador", async () => {
    const discrepancies = [];
    for (const input of browserCases) {
      const record = await execute(input);
      if (record.issues.length) discrepancies.push({ id: record.id, issues: record.issues });
    }
    expect(discrepancies).toEqual([]);
  });
});

afterAll(() => {
  const countCodes = (key: string) => records.reduce((total, record) => {
    for (const code of record[key]) total[code] = (total[code] || 0) + 1;
    return total;
  }, {});
  const groups = records.reduce((total, row) => {
    const group = total[row.group] || { total: 0, conforming: 0, discrepancies: 0, observations: 0 };
    group.total++;
    if (row.issues.length) group.discrepancies++; else group.conforming++;
    if (row.observations.length) group.observations++;
    total[row.group] = group;
    return total;
  }, {});
  const folder = join(process.cwd(), "temporal/liquidacion-audit");
  mkdirSync(folder, { recursive: true });
  const report = {
    date: "2026-10-06", assumptions: ["Regla principal: días calendario; inicio, fecha pactada y cobro interpretados por fecha civil de Lima.", "Referencia adicional: fecha pactada que actualmente muestra React (UTC yyyy-MM-dd); no se presume que sustituya la fecha contractual.", "Solo infraestructura y catálogos sustituidos; no base de datos ni servicios externos.", "Redondeos, cobro interbancario y diferencias entre inicio/propuesta se registran como observaciones, no como conclusiones contractuales."],
    summary: { total: records.length, groups, issueCounts: countCodes("issues"), observationCounts: countCodes("observations"), displayedDateDiscrepancies: records.filter((row) => row.displayIssues?.length).length }, records,
  };
  writeFileSync(join(folder, "resultados.json"), JSON.stringify(report, null, 2) + "\n", "utf8");
  console.log("AUDIT_SUMMARY", JSON.stringify(report.summary));
});
