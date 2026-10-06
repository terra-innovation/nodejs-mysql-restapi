import { Decimal } from "@prisma/client/runtime/library";
import { Settings } from "luxon";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

// Fórmulas y servicios reales; solo se sustituyen base de datos, catálogos y salida PDF.
jest.mock("#src/utils/logger.pino.js", () => ({ line: () => "simulation", log: { debug: jest.fn(), warn: jest.fn(), error: jest.fn(), info: jest.fn() } }));
jest.mock("#root/src/models/prisma/db-factoring.js", () => ({ prismaFT: { client: { $transaction: jest.fn(async cb => cb({})) }, transactionTimeout: 5000 } }));
jest.mock("#src/utils/document/PDFgenerator.js", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("#root/src/providers/email/email.Provider.js", () => ({}));
jest.mock("#root/src/daos/banco.Dao.js", () => ({ getBancoByBancoid: jest.fn() }));
jest.mock("#root/src/daos/moneda.Dao.js", () => ({ getMonedaByMonedaid: jest.fn() }));
jest.mock("#root/src/daos/factoring.Dao.js", () => ({ getFactoringByFactoringid: jest.fn() }));
jest.mock("#root/src/daos/factoringtipo.Dao.js", () => ({ getFactoringtipoByFactoringtipoid: jest.fn(async () => ({ idfactoringtipo: 1 })) }));
jest.mock("#root/src/daos/factoringestrategia.Dao.js", () => ({ getFactoringestrategiaByFactoringestrategiaid: jest.fn(async () => ({ idfactoringestrategia: 1 })) }));
jest.mock("#root/src/daos/factoringpropuestaestado.Dao.js", () => ({ getFactoringpropuestaestadoByFactoringpropuestaestadoid: jest.fn(async () => ({ idfactoringpropuestaestado: 1 })) }));
jest.mock("#root/src/daos/factoringsimulacion.Dao.js", () => ({ insertFactoringsimulacion: jest.fn(async (_tx, data) => ({ idfactoringsimulacion: 1, ...data })) }));
jest.mock("#root/src/daos/factoringsimulacionfinanciero.Dao.js", () => ({ insertFactoringsimulacionfinanciero: jest.fn() }));
jest.mock("#root/src/daos/factoringpropuesta.Dao.js", () => ({ insertFactoringpropuesta: jest.fn(async (_tx, data) => ({ idfactoringpropuesta: 2, ...data })) }));
jest.mock("#root/src/daos/factoringpropuestafinanciero.Dao.js", () => ({ insertFactoringpropuestafinanciero: jest.fn() }));
jest.mock("#root/src/daos/factoringpropuestahistorialestado.Dao.js", () => ({ insertFactoringpropuestahistorialestado: jest.fn() }));
jest.mock("#root/src/daos/configuracionapp.Dao.js", () => ({
  getIGV: jest.fn(async () => ({ valor: "0.18" })),
  getCostoCAVALIPen: jest.fn(async () => ({ valor: "10" })),
  getCostoCAVALIUsd: jest.fn(async () => ({ valor: "3" })),
  getComisionBCPPen: jest.fn(async () => ({ valor: "7.50" })),
  getComisionBCPUsd: jest.fn(async () => ({ valor: "2.50" })),
}));
jest.mock("#root/src/daos/riesgo.Dao.js", () => ({ getRiesgoByIdriesgo: jest.fn(async () => ({ idriesgo: 1 })), getRiesgoByRiesgoid: jest.fn() }));
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

import * as bancoDao from "#root/src/daos/banco.Dao.js";
import * as monedaDao from "#root/src/daos/moneda.Dao.js";
import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import * as riesgoDao from "#root/src/daos/riesgo.Dao.js";
import * as simulacionDao from "#root/src/daos/factoringsimulacion.Dao.js";
import * as simulacionFinancieroDao from "#root/src/daos/factoringsimulacionfinanciero.Dao.js";
import * as propuestaDao from "#root/src/daos/factoringpropuesta.Dao.js";
import { createFactoringsimulacionService, simulateFactoringsimulacionService } from "#root/src/services/admin/factoringsimulacion.Service.js";
import { createFactoringpropuestaService, simulateFactoringpropuestaService } from "#root/src/services/admin/factoringpropuesta.Service.js";
import { createFactoringsimulacion, simulateFactoringsimulacion } from "#root/src/controllers/admin/servicio/factoring/factoringsimulacion.Controller.js";
import { simulateFactoringLogicV4 } from "#root/src/services/admin/factoringCalculation.Service.js";
import * as dates from "#src/utils/dateUtils.js";

const uuid = "11111111-1111-1111-1111-111111111111";
const records: any[] = [];
const previousZone = Settings.defaultZone;
const previousNow = Settings.now;
const shift = (day: string, days: number) => new Date(Date.parse(`${day}T00:00:00Z`) + days * 86400000).toISOString().slice(0, 10);
const calendarDays = (first: string, last: string) => (Date.parse(`${last}T00:00:00Z`) - Date.parse(`${first}T00:00:00Z`)) / 86400000;
const limaDay = (instant: Date | string) => new Date(new Date(instant).getTime() - 5 * 3600000).toISOString().slice(0, 10);
const cases = [
  ["2026-10-01", "2026-10-30"], ["2026-12-20", "2027-01-01"],
  ["2027-02-01", "2027-03-01"], ["2028-02-01", "2028-03-01"],
  ["2028-02-28", "2028-02-29"], ["2026-11-06", "2026-11-09"],
].flatMap(([start, due]) => ["00:00:00", "04:59:59", "05:00:00", "12:00:00", "23:59:59"].flatMap(time =>
  ["UTC", "America/Lima", "America/New_York", "Europe/Madrid"].flatMap(zone =>
    [1, 2].flatMap(bank => [1, 2].map(currency => ({ start, due, time, zone, bank, currency }))))));

function configure(start: string, bank = 1, currency = 2) {
  Settings.now = () => Date.parse(`${start}T15:00:00Z`);
  (bancoDao.getBancoByBancoid as jest.Mock).mockResolvedValue({ idbanco: bank });
  (monedaDao.getMonedaByMonedaid as jest.Mock).mockResolvedValue({ idmoneda: currency });
  (riesgoDao.getRiesgoByRiesgoid as jest.Mock).mockResolvedValue({ idriesgo: 1 });
  (factoringDao.getFactoringByFactoringid as jest.Mock).mockResolvedValue({ idfactoring: 10, cantidad_facturas: 1,
    monto_neto: new Decimal("55484.49"), fecha_emision: new Date(`${shift(start, -1)}T00:00:00Z`),
    cuenta_bancaria: { idbanco: bank }, moneda: { idmoneda: currency } });
}

function payload(start: string, due: Date | string) {
  return { bancoid: uuid, monedaid: uuid, factoringtipoid: uuid, riesgooperacionid: uuid, factoringestrategiaid: uuid,
    tdm: 0.015, porcentaje_financiado_estimado: 0.98, porcentaje_comision_descuento: 0,
    fecha_emision: `${shift(start, -1)}T00:00:00Z`, fecha_pago_estimado: due, cantidad_facturas: 1, monto_neto: 55484.49,
    ruc_cedente: "20111111111", ruc_aceptante: "20222222222", razon_social_cedente: "Cedente SAC", razon_social_aceptante: "Pagador SAC" };
}

beforeEach(() => { jest.clearAllMocks(); });
afterEach(() => { Settings.defaultZone = previousZone; Settings.now = previousNow; Settings.resetCaches(); });
afterAll(() => {
  if (process.env.SIMULATION_DATES_OUTPUT_DIR) {
    mkdirSync(process.env.SIMULATION_DATES_OUTPUT_DIR, { recursive: true });
    writeFileSync(join(process.env.SIMULATION_DATES_OUTPUT_DIR, "resultados.json"), JSON.stringify(records, null, 2));
  }
});

describe("Simulación y propuesta comparten interpretación, cálculo y persistencia", () => {
  it.each(cases)("$start → $due $time UTC; zona $zone, banco $bank, moneda $currency", async ({ start, due, time, zone, bank, currency }) => {
    Settings.defaultZone = zone;
    configure(start, bank, currency);
    const iso = `${due}T${time}Z`;
    const dto = payload(start, zone === "UTC" ? iso : new Date(iso));
    // También se verifica una emisión histórica a medianoche de Lima: sigue siendo una fecha civil.
    if (bank === 2) dto.fecha_emision = `${shift(start, -1)}T05:00:00Z`;
    const simulation = await simulateFactoringsimulacionService(dto);
    const quoteDTO = { ...dto, factoringid: uuid, riesgocedenteid: uuid, riesgoaceptanteid: uuid, factoringpropuestaestadoid: uuid };
    const quote = await simulateFactoringpropuestaService(quoteDTO);
    expect(simulation).toEqual(quote);
    expect(simulation.dias_pago_estimado).toBe(calendarDays(start, limaDay(iso)));
    expect(simulation.dias_antiguedad_estimado).toBe(1);
    expect(simulation.fecha_pago_estimado).toEqual(new Date(iso));
    expect(await createFactoringsimulacionService(1, dto)).toEqual(simulation);
    expect(await createFactoringpropuestaService(quoteDTO, 1)).toEqual(simulation);
    const stored = (simulacionDao.insertFactoringsimulacion as jest.Mock).mock.calls[0][1];
    const storedQuote = (propuestaDao.insertFactoringpropuesta as jest.Mock).mock.calls[0][1];
    expect(new Date(stored.fecha_pago_estimado)).toEqual(new Date(iso));
    expect(stored.fecha_emision.toISOString()).toBe(`${shift(start, -1)}T00:00:00.000Z`);
    for (const field of ["dias_pago_estimado", "monto_descuento", "monto_financiado", "monto_garantia", "monto_total_igv", "monto_adelanto"]) {
      expect(stored[field]).toEqual(storedQuote[field]);
    }
    const financialItems = [...simulation.comisiones, ...simulation.costos, ...simulation.gastos, ...simulation.gastos_excento_igv];
    expect(simulacionFinancieroDao.insertFactoringsimulacionfinanciero).toHaveBeenCalledTimes(financialItems.length);
    for (const [index, item] of financialItems.entries()) {
      expect((simulacionFinancieroDao.insertFactoringsimulacionfinanciero as jest.Mock).mock.calls[index][1]).toEqual(expect.objectContaining({
        monto: item.monto, igv: item.igv, total: item.total, financiero_tipo: { connect: { idfinancierotipo: item.financiero_tipo.idfinancierotipo } },
      }));
    }
    // Para las entradas actuales del navegador, el resultado financiero equivale al criterio anterior.
    if (time === "05:00:00") {
      const prior = await simulateFactoringLogicV4(1, bank, 1, new Decimal(dto.monto_neto), dates.getNowLima(), dates.toLimaDate(dto.fecha_pago_estimado),
        dates.toLimaDate(dto.fecha_emision), new Decimal(dto.porcentaje_financiado_estimado), new Decimal(dto.tdm), new Decimal(0), currency);
      for (const field of Object.keys(simulation)) {
        if (Decimal.isDecimal(simulation[field]) || ["comisiones", "costos", "gastos", "gastos_excento_igv"].includes(field)) {
          expect(simulation[field]).toEqual(prior[field]);
        }
      }
    }
    records.push({ start, dueUTC: new Date(iso).toISOString(), dueLima: limaDay(iso), zone, bank, currency,
      days: stored.dias_pago_estimado, invoiceAge: stored.dias_antiguedad_estimado, storedEmission: stored.fecha_emision.toISOString(),
      discount: stored.monto_descuento.toFixed(2), igv: stored.monto_total_igv.toFixed(2), advance: stored.monto_adelanto.toFixed(2), status: "passed" });
  });
});

describe("Contrato HTTP: fecha civil de emisión e instante de vencimiento", () => {
  it.each(["2026-10-30T00:00:00Z", "2026-10-30T04:59:59Z", "2026-10-30T05:00:00Z", "2026-12-31T05:00:00Z", "2028-02-29T05:00:00Z"])(
    "valida, simula y guarda %s con el mismo día de Perú", async iso => {
      configure("2026-10-01");
      const body = { ...payload("2026-10-01", iso), fecha_emision: "2026-09-30" };
      const req: any = { body, session_user: { usuario: { idusuario: 1 } } };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await simulateFactoringsimulacion(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      const response = res.json.mock.calls[0][0];
      const simulated = response.data;
      expect(simulated.dias_pago_estimado).toBe(calendarDays("2026-10-01", limaDay(iso)));
      expect(new Date(simulated.fecha_pago_estimado)).toEqual(new Date(iso));
      expect(simulacionDao.insertFactoringsimulacion).not.toHaveBeenCalled();
      await createFactoringsimulacion(req, res);
      const { factoring: simulatedInput, ...simulatedResult } = simulated;
      const { factoring: createdInput, ...createdResult } = res.json.mock.calls[1][0].data;
      expect(createdResult).toEqual(simulatedResult);
      expect(createdInput.fecha_emision).toEqual(simulatedInput.fecha_emision);
      expect(createdInput.fecha_pago_estimado).toEqual(simulatedInput.fecha_pago_estimado);
      expect((simulacionDao.insertFactoringsimulacion as jest.Mock).mock.calls[0][1].fecha_emision.toISOString()).toBe("2026-09-30T00:00:00.000Z");
    });

  it.each(["fecha_emision", "fecha_pago_estimado"].flatMap(field => [null, "invalid", ""].map(value => ({ field, value }))))(
    "rechaza $field=$value sin cálculos ni escrituras", async ({ field, value }) => {
      configure("2026-10-01");
      const req: any = { body: { ...payload("2026-10-01", "2026-10-30T05:00:00Z"), [field]: value }, session_user: { usuario: { idusuario: 1 } } };
      const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      await expect(simulateFactoringsimulacion(req, res)).rejects.toThrow();
      await expect(createFactoringsimulacion(req, res)).rejects.toThrow();
      expect(bancoDao.getBancoByBancoid).not.toHaveBeenCalled();
      expect(simulacionDao.insertFactoringsimulacion).not.toHaveBeenCalled();
    });
});
