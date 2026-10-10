import { Decimal } from "@prisma/client/runtime/client";
import { DateTime, Settings } from "luxon";
import { execFileSync } from "child_process";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

// Servicios, helpers de React y fórmulas reales; persistencia, catálogos y notificaciones sustituidos.
jest.mock("#src/config.js", () => ({ isProduction: true }));
jest.mock("#src/utils/logger.pino.js", () => ({ line: () => "trace", log: { debug: jest.fn(), warn: jest.fn(), info: jest.fn(), error: jest.fn() } }));
jest.mock("#src/utils/storageUtils.js", () => ({}));
jest.mock("#src/utils/document/PDFgenerator.js", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("#src/providers/telegram/telegram.Provider.js", () => ({ sendMessageImportant: jest.fn() }));
jest.mock("#root/src/providers/email/email.Provider.js", () => ({
  sendFactoringEmpresaServicioFactoringSolicitud: jest.fn(),
  sendFactoringEmpresaServicioFactoringPropuestaDisponible: jest.fn(),
  sendFactoringEmpresaServicioFactoringPropuestaAceptada: jest.fn(),
  sendFactoringEmpresaServicioFactoringCedenteNotificacionInicioOperacion: jest.fn(),
}));
jest.mock("#root/src/models/prisma/db-factoring.js", () => ({ prismaFT: { client: { $transaction: jest.fn(async cb => cb({})) }, transactionTimeout: 5000 } }));
jest.mock("#root/src/daos/factura.Dao.js", () => ({ getFacturaByFacturaid: jest.fn() }));
jest.mock("#root/src/daos/empresa.Dao.js", () => ({ findEmpresaPk: jest.fn(async () => ({ idempresa: 1 })) }));
jest.mock("#root/src/daos/cuentabancaria.Dao.js", () => ({ findCuentabancariaPk: jest.fn(async () => ({ idcuentabancaria: 1 })) }));
jest.mock("#root/src/daos/moneda.Dao.js", () => ({ findMonedaPk: jest.fn(async () => ({ idmoneda: 2 })) }));
jest.mock("#root/src/daos/persona.Dao.js", () => ({ getPersonaByIdusuario: jest.fn(async () => ({ idpersona: 1 })) }));
jest.mock("#root/src/daos/contacto.Dao.js", () => ({ getContactoByContactoid: jest.fn(async () => ({ idcontacto: 1 })) }));
jest.mock("#root/src/daos/colaborador.Dao.js", () => ({ getColaboradorByIdEmpresaAndIdpersona: jest.fn(async () => ({ idcolaborador: 1 })) }));
jest.mock("#root/src/daos/usuario.Dao.js", () => ({
  getUsuarioByIdusuario: jest.fn(async () => ({ email: "cedente@example.test" })),
  getUsuarioByEmail: jest.fn(async () => ({ email: "cedente@example.test" })),
}));
jest.mock("#root/src/daos/factoringfactura.Dao.js", () => ({ insertFactoringfactura: jest.fn() }));
jest.mock("#root/src/daos/factoringhistorialestado.Dao.js", () => ({ insertFactoringhistorialestado: jest.fn(async (_tx, data) => ({ idfactoringhistorialestado: 1, ...data })) }));
jest.mock("#root/src/daos/factoringpropuestahistorialestado.Dao.js", () => ({ insertFactoringpropuestahistorialestado: jest.fn() }));
jest.mock("#root/src/daos/factoringestado.Dao.js", () => ({ getFactoringestadoByFactoringestadoid: jest.fn(async () => ({ idfactoringestado: 36 })) }));
jest.mock("#root/src/daos/factoringpropuestaestado.Dao.js", () => ({ getFactoringpropuestaestadoByFactoringpropuestaestadoid: jest.fn(async (_tx, id) => ({ idfactoringpropuestaestado: id === "disponible" ? 4 : 1 })) }));
jest.mock("#root/src/daos/factoringtipo.Dao.js", () => ({ getFactoringtipoByFactoringtipoid: jest.fn(async () => ({ idfactoringtipo: 1 })) }));
jest.mock("#root/src/daos/factoringestrategia.Dao.js", () => ({ getFactoringestrategiaByFactoringestrategiaid: jest.fn(async () => ({ idfactoringestrategia: 1 })) }));
jest.mock("#root/src/daos/factoringpropuestafinanciero.Dao.js", () => ({ insertFactoringpropuestafinanciero: jest.fn() }));
jest.mock("#root/src/daos/factoring.Dao.js", () => ({
  getFactoringByFactoringid: jest.fn(), getFactoringByIdfactoring: jest.fn(),
  getFactoringByRucCedenteAndCodigoFactura: jest.fn(async () => null),
  getFactoringByIdfactoringIdempresario: jest.fn(), insertFactoring: jest.fn(), updateFactoring: jest.fn(),
  lockFactoringCedente: jest.fn(), claimFactoringApproval: jest.fn(async () => true),
}));
jest.mock("#root/src/daos/factoringpropuesta.Dao.js", () => ({
  insertFactoringpropuesta: jest.fn(), updateFactoringpropuesta: jest.fn(),
  approveFactoringpropuestaVigente: jest.fn(),
  getFactoringpropuestaByFactoringpropuestaid: jest.fn(),
  getFactoringpropuestaVigenteByIdfactoringpropuestaIdfactoring: jest.fn(),
  getFactoringpropuestaAceptadaByIdfactoringpropuesta: jest.fn(),
}));
jest.mock("#root/src/daos/factoringliquidacion.Dao.js", () => ({ insertFactoringliquidacion: jest.fn(async (_tx, data) => ({ idfactoringliquidacion: 20, ...data })) }));
jest.mock("#root/src/daos/factoringliquidacionestado.Dao.js", () => ({ getFactoringliquidacionestadoByFactoringliquidacionestadoid: jest.fn(async () => ({ idfactoringliquidacionestado: 1 })) }));
jest.mock("#root/src/daos/factoringliquidacionfinanciero.Dao.js", () => ({ insertFactoringliquidacionfinanciero: jest.fn() }));
jest.mock("#root/src/daos/configuracionapp.Dao.js", () => ({
  getIGV: jest.fn(async () => ({ valor: "0.18" })),
  getCostoCAVALIPen: jest.fn(async () => ({ valor: "10" })), getCostoCAVALIUsd: jest.fn(async () => ({ valor: "3" })),
  getComisionBCPPen: jest.fn(async () => ({ valor: "7.50" })), getComisionBCPUsd: jest.fn(async () => ({ valor: "2.50" })),
}));
jest.mock("#root/src/daos/riesgo.Dao.js", () => ({ getRiesgoByIdriesgo: jest.fn(async () => ({ idriesgo: 1 })), getRiesgoByRiesgoid: jest.fn(async () => ({ idriesgo: 1 })) }));
jest.mock("#root/src/daos/factoringconfigcomision.Dao.js", () => ({ getFactoringconfigcomisionByIdriesgo: jest.fn(async () => {
  const { Decimal } = jest.requireActual("@prisma/client/runtime/client");
  return { factor1: new Decimal("0.01"), factor2: new Decimal(100), factor3: new Decimal(1) };
}) }));
jest.mock("#root/src/daos/financierotipo.Dao.js", () => ({
  getComision: jest.fn(async () => ({ idfinancierotipo: 1 })), getCosto: jest.fn(async () => ({ idfinancierotipo: 2 })),
  getGasto: jest.fn(async () => ({ idfinancierotipo: 3 })), getGasto_excento_igv: jest.fn(async () => ({ idfinancierotipo: 4 })),
  getFinancierotipoByIdfinancierotipo: jest.fn(async (_tx, id) => ({ idfinancierotipo: id })),
}));
jest.mock("#root/src/daos/financieroconcepto.Dao.js", () => ({
  getComisionFinanzaTech: jest.fn(async () => ({ idfinancieroconcepto: 1 })), getCostoCAVALIPen: jest.fn(async () => ({ idfinancieroconcepto: 2 })),
  getCostoTransaccion: jest.fn(async () => ({ idfinancieroconcepto: 3 })), getGastoInterbancario: jest.fn(async () => ({ idfinancieroconcepto: 3 })),
  getFinancieroconceptoByIdfinancieroconcepto: jest.fn(async (_tx, id) => ({ idfinancieroconcepto: id, factor: id === 7 || id === 8 ? 1 : -1, afecto_igv: false })),
}));

import * as facturaDao from "#root/src/daos/factura.Dao.js";
import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import * as propuestaDao from "#root/src/daos/factoringpropuesta.Dao.js";
import * as facturaLinkDao from "#root/src/daos/factoringfactura.Dao.js";
import { createFactoringService } from "#root/src/services/empresario/factoring.Service.js";
import { createFactoringpropuestaService, updateFactoringpropuestaService } from "#root/src/services/admin/factoringpropuesta.Service.js";
import { acceptFactoringpropuestaService } from "#root/src/services/empresario/factoringpropuesta.Service.js";
import { createFactoringhistorialestadoService } from "#root/src/services/admin/factoringhistorialestado.Service.js";
import { createFactoringliquidacionService } from "#root/src/services/admin/factoringliquidacion.Service.js";

const records: any[] = [];
const cases = ["2026-10-30", "2026-12-31", "2028-02-29"].flatMap(invoiceDay =>
  [-5, 0, 1, 10].map(offset => ({ invoiceDay, agreedDay: invoiceDay, offset })));
cases.push({ invoiceDay: "2026-10-30", agreedDay: "2026-11-02", offset: 0 });
cases.push({ invoiceDay: "2026-10-30", agreedDay: "2026-11-02", offset: 1 });
const shift = (day: string, days: number) => DateTime.fromISO(day, { zone: "UTC" }).plus({ days }).toISODate();
const dayDiff = (first: string, last: string) => (Date.parse(`${last}T00:00:00Z`) - Date.parse(`${first}T00:00:00Z`)) / 86400000;
const frontendDate = (day: string, invoiceISO?: string) => JSON.parse(execFileSync(process.execPath,
  [join(process.cwd(), "scripts/analisis/fecha-liquidacion-frontend.cjs"), day, ...(invoiceISO ? [invoiceISO] : [])],
  { encoding: "utf8", env: { ...process.env, TZ: "America/Lima" } }));
const discount = (days: number) => new Decimal("55484.49").mul("0.98").mul(new Decimal("1.015").pow(new Decimal(days).div(30)).minus(1)).toDecimalPlaces(2);

describe("Trazabilidad factura → operación → propuesta → aceptación → inicio → liquidación", () => {
  afterEach(() => { jest.useRealTimers(); Settings.resetCaches(); });
  afterAll(() => {
    if (process.env.FACTORING_TRACE_OUTPUT_DIR) {
      mkdirSync(process.env.FACTORING_TRACE_OUTPUT_DIR, { recursive: true });
      writeFileSync(join(process.env.FACTORING_TRACE_OUTPUT_DIR, "resultados.json"), JSON.stringify(records, null, 2));
    }
  });

  it.each(cases)("factura $invoiceDay, propuesta $agreedDay, pago con diferencia $offset", async ({ invoiceDay, agreedDay, offset }) => {
    jest.clearAllMocks();
    const startDay = shift(invoiceDay, -29);
    const startISO = `${startDay}T15:00:00.000Z`;
    jest.useFakeTimers({ now: Date.parse(startISO) });
    Settings.resetCaches();
    let operation: any;
    const proposals: any[] = [];
    const invoice = { idfactura: 1, facturaid: "factura-1", serie: "F001", numero_comprobante: "239", proveedor_ruc: "20111111111",
      fecha_emision: new Date(`${shift(invoiceDay, -30)}T00:00:00Z`), fecha_pago_mayor_estimado: new Date(`${invoiceDay}T00:00:00Z`),
      importe_bruto: 57200.50, retencion_monto: 1716.01, importe_neto: 55484.49 };
    (facturaDao.getFacturaByFacturaid as jest.Mock).mockResolvedValue(invoice);
    (factoringDao.insertFactoring as jest.Mock).mockImplementation(async (_tx, data) => {
      operation = { ...data, idfactoring: 10, idmoneda: 2, monto_neto: new Decimal(data.monto_neto),
        cuenta_bancaria: { idbanco: 1 }, moneda: { idmoneda: 2 }, contacto_cedente: { email: "cedente@example.test", persona: { idusuario: 1 } } };
      return operation;
    });
    (factoringDao.getFactoringByFactoringid as jest.Mock).mockImplementation(async () => operation);
    (factoringDao.getFactoringByIdfactoring as jest.Mock).mockImplementation(async () => operation);
    (factoringDao.getFactoringByIdfactoringIdempresario as jest.Mock).mockImplementation(async () => operation);
    (factoringDao.updateFactoring as jest.Mock).mockImplementation(async (_tx, _id, data) => {
      Object.assign(operation, data);
      if (data.factoring_estado) operation.idfactoringestado = data.factoring_estado.connect.idfactoringestado;
      if (data.factoring_propuesta_aceptada) {
        operation.idfactoringpropuestaaceptada = data.factoring_propuesta_aceptada.connect.idfactoringpropuesta;
        operation.factoring_propuesta_aceptada = proposals.find(p => p.idfactoringpropuesta === operation.idfactoringpropuestaaceptada);
      }
      return operation;
    });
    (propuestaDao.insertFactoringpropuesta as jest.Mock).mockImplementation(async (_tx, data) => {
      const proposal = { ...data, idfactoringpropuesta: proposals.length + 100, idfactoring: operation.idfactoring,
        idriesgooperacion: data.riesgo_operacion.connect.idriesgo,
        idfactoringpropuestaestado: data.factoring_propuesta_estado.connect.idfactoringpropuestaestado };
      proposals.push(proposal);
      return proposal;
    });
    (propuestaDao.getFactoringpropuestaByFactoringpropuestaid as jest.Mock).mockImplementation(async (_tx, id) => proposals.find(p => p.factoringpropuestaid === id));
    (propuestaDao.updateFactoringpropuesta as jest.Mock).mockImplementation(async (_tx, id, data) => {
      const proposal = proposals.find(p => p.factoringpropuestaid === id);
      Object.assign(proposal, data);
      proposal.idfactoringpropuestaestado = data.factoring_propuesta_estado.connect.idfactoringpropuestaestado;
      return proposal;
    });
    (propuestaDao.approveFactoringpropuestaVigente as jest.Mock).mockImplementation(async (_tx, id, _factoringId, actor) => {
      const proposal = proposals.find(p => p.factoringpropuestaid === id);
      proposal.idfactoringpropuestaestado = 6;
      proposal.idusuariomod = actor;
      return proposal;
    });
    (propuestaDao.getFactoringpropuestaVigenteByIdfactoringpropuestaIdfactoring as jest.Mock).mockImplementation(async (_tx, id, factoringId) =>
      proposals.find(p => p.idfactoringpropuesta === id && p.idfactoring === factoringId && p.idfactoringpropuestaestado === 4));
    (propuestaDao.getFactoringpropuestaAceptadaByIdfactoringpropuesta as jest.Mock).mockImplementation(async (_tx, id) => proposals.find(p => p.idfactoringpropuesta === id));

    // Payload real del wizard: la fecha DATE de factura se copia sin conversión.
    await createFactoringService({ facturas: [{ facturaid: invoice.facturaid }], cedenteid: "cedente", aceptanteid: "aceptante",
      cuentabancariaid: "cuenta", monedaid: "USD", contactoaceptanteid: "contacto", monto_neto: "55484.49",
      fecha_pago_estimado: invoice.fecha_pago_mayor_estimado.toISOString(), dias_pago_estimado: "29", idusuario: 1 });
    expect(operation.fecha_pago_estimado).toEqual(invoice.fecha_pago_mayor_estimado);
    expect(facturaLinkDao.insertFactoringfactura).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ factura: { connect: { idfactura: 1 } } }));
    const boundary = frontendDate(agreedDay, operation.fecha_pago_estimado.toISOString());
    expect(boundary.invoiceInput).toBe(invoiceDay);
    expect(boundary.iso).toBe(`${agreedDay}T05:00:00.000Z`);
    expect(boundary.recoveredDate).toBe(agreedDay);

    const proposalDTO = { factoringid: operation.factoringid, factoringtipoid: "tipo", riesgooperacionid: "riesgo",
      riesgocedenteid: "riesgo", riesgoaceptanteid: "riesgo", factoringpropuestaestadoid: "borrador", factoringestrategiaid: "estrategia",
      fecha_pago_estimado: new Date(boundary.iso), tdm: 0.015, porcentaje_financiado_estimado: 0.98,
      porcentaje_comision_descuento: 0, monto_neto: 55484.49 };
    await createFactoringpropuestaService(proposalDTO, 1);
    const proposal = proposals[0];
    expect(proposal.fecha_pago_estimado).toEqual(new Date(boundary.iso));
    expect(proposal.dias_pago_estimado).toBe(dayDiff(startDay, agreedDay));
    expect(proposal.dias_antiguedad_estimado).toBe(1);
    expect(new Decimal(proposal.monto_descuento)).toEqual(discount(dayDiff(startDay, agreedDay)));
    await updateFactoringpropuestaService({ factoringpropuestaid: proposal.factoringpropuestaid, factoringpropuestaestadoid: "disponible" }, 1);
    await acceptFactoringpropuestaService({ factoringid: operation.factoringid, factoringpropuestaid: proposal.factoringpropuestaid, idusuario: 1 });
    expect(proposal.idfactoringpropuestaestado).toBe(6);
    expect(operation.idfactoringpropuestaaceptada).toBe(proposal.idfactoringpropuesta);
    expect(operation.factoring_propuesta_aceptada.fecha_pago_estimado.toISOString()).toBe(boundary.iso);
    // Otra propuesta más reciente, con fecha y tasa distintas, nunca debe sustituir la aceptada.
    await createFactoringpropuestaService({ ...proposalDTO, fecha_pago_estimado: new Date(`${shift(agreedDay, 7)}T05:00:00Z`), tdm: 0.03 }, 1);
    await expect(createFactoringliquidacionService({ factoringid: operation.factoringid, factoringliquidacionestadoid: "borrador",
      fecha_liquidacion: startISO, fecha_pago_efectivo: boundary.iso }, 1)).rejects.toThrow("La operación no tiene fecha de inicio");
    await createFactoringhistorialestadoService({ factoringid: operation.factoringid, factoringestadoid: "inicio", comentario: "Inicio de operación" }, 1);
    expect(operation.fecha_operacion.toISOString()).toBe(startISO);

    const paidDay = shift(agreedDay, offset);
    const payment = frontendDate(paidDay);
    const result: any = await createFactoringliquidacionService({ factoringid: operation.factoringid, factoringliquidacionestadoid: "borrador",
      fecha_liquidacion: startISO, fecha_pago_efectivo: payment.iso, exonerar_gasto_interbancario: true }, 1);
    expect(result.fecha_pago_efectivo.toISOString()).toBe(payment.iso);
    expect(result.dias_mora_efectivo).toBe(Math.max(offset, 0));
    expect(result.dias_pago_efectivo).toBe(dayDiff(startDay, paidDay));
    const expectedPaidDiscount = discount(dayDiff(startDay, paidDay));
    const expectedDifference = expectedPaidDiscount.minus(proposal.monto_descuento);
    expect(result.monto_descuento_a_favor.toFixed(2)).toBe(expectedDifference.lessThan(0) ? expectedDifference.neg().toFixed(2) : "0.00");
    expect(result.monto_descuento_mora.toFixed(2)).toBe(expectedDifference.greaterThan(0) ? expectedDifference.toFixed(2) : "0.00");
    expect(operation.idfactoringpropuestaaceptada).toBe(proposal.idfactoringpropuesta);
    expect(operation.fecha_pago_estimado).toEqual(invoice.fecha_pago_mayor_estimado);
    const expectedBalance = new Decimal(proposal.monto_garantia).minus(expectedDifference);
    expect(result.monto_total_a_favor.toFixed(2)).toBe(expectedBalance.toFixed(2));
    expect(result.monto_total_por_cobrar.toFixed(2)).toBe("0.00");
    records.push({ invoiceDay, agreedDay, paidDay, invoiceUTC: invoice.fecha_pago_mayor_estimado.toISOString(), operationUTC: operation.fecha_pago_estimado.toISOString(),
      startUTC: startISO, currency: "USD", net: "55484.49", monthlyRate: "0.015", financedRatio: "0.98",
      inputDay: boundary.invoiceInput, proposalUTC: boundary.iso, acceptedUTC: operation.factoring_propuesta_aceptada.fecha_pago_estimado.toISOString(), paymentUTC: payment.iso,
      acceptedProposal: proposal.idfactoringpropuesta, ignoredProposal: proposals[1].idfactoringpropuesta,
      proposalDays: proposal.dias_pago_estimado, actualDays: result.dias_pago_efectivo, delinquencyDays: result.dias_mora_efectivo,
      discount: proposal.monto_descuento.toFixed(2), refund: result.monto_descuento_a_favor.toFixed(2), lateCharge: result.monto_descuento_mora.toFixed(2),
      guarantee: proposal.monto_garantia.toFixed(2), balance: result.monto_total_a_favor.toFixed(2), status: "passed" });
  });
});
