import { vi } from "vitest";
import { Decimal } from "@prisma/client/runtime/library";

// Solo sustituye infraestructura. Los servicios, calendarios y calculadores son reales.
const boundary = vi.hoisted(() => ({
  tx: { testTransaction: true },
  transaction: vi.fn(),
  factoring: { getFactoringByFactoringid: vi.fn(), getFactoringByIdfactoring: vi.fn(), getFactoringByIdfactoringIdempresario: vi.fn(), updateFactoring: vi.fn(), claimFactoringApproval: vi.fn() },
  estado: { getFactoringestadoByFactoringestadoid: vi.fn() },
  historial: { insertFactoringhistorialestado: vi.fn(), getFactoringhistorialestadoByFactoringhistorialestadoid: vi.fn(), updateFactoringhistorialestado: vi.fn(), activateFactoringhistorialestado: vi.fn(), deleteFactoringhistorialestado: vi.fn() },
  historialArchivo: { insertArchivofactoringhistorialestado: vi.fn() },
  riesgo: { getRiesgoByRiesgoid: vi.fn(), getRiesgoByIdriesgo: vi.fn() },
  tipo: { getFactoringtipoByFactoringtipoid: vi.fn() },
  estrategia: { getFactoringestrategiaByFactoringestrategiaid: vi.fn() },
  config: { getIGV: vi.fn(), getCostoCAVALIPen: vi.fn(), getCostoCAVALIUsd: vi.fn(), getComisionBCPPen: vi.fn(), getComisionBCPUsd: vi.fn(), getEmailsCCDeudorSolicitaConfirmacion: vi.fn() },
  comision: { getFactoringconfigcomisionByIdriesgo: vi.fn() },
  financieroTipo: { getComision: vi.fn(), getCosto: vi.fn(), getGasto: vi.fn(), getGasto_excento_igv: vi.fn(), getFinancierotipoByIdfinancierotipo: vi.fn(), getFinancierotipoByFinancierotipoid: vi.fn() },
  concepto: { getComisionFinanzaTech: vi.fn(), getCostoCAVALIPen: vi.fn(), getCostoTransaccion: vi.fn(), getGastoInterbancario: vi.fn(), getFinancieroconceptoByIdfinancieroconcepto: vi.fn(), getFinancieroconceptoByFinancieroconceptoid: vi.fn() },
  propuesta: { insertFactoringpropuesta: vi.fn(), getFactoringpropuestaByFactoringpropuestaid: vi.fn(), updateFactoringpropuesta: vi.fn(), approveFactoringpropuestaVigente: vi.fn(), getFactoringpropuestaAceptadaByIdfactoringpropuesta: vi.fn(), activateFactoringpropuesta: vi.fn(), deleteFactoringpropuesta: vi.fn(), getFactoringpropuestaVigenteByIdfactoringpropuestaIdfactoring: vi.fn() },
  propuestaEstado: { getFactoringpropuestaestadoByFactoringpropuestaestadoid: vi.fn() },
  propuestaHistorial: { insertFactoringpropuestahistorialestado: vi.fn() },
  propuestaFinanciero: { insertFactoringpropuestafinanciero: vi.fn() },
  liquidacion: { insertFactoringliquidacion: vi.fn(), getFactoringliquidacionByFactoringliquidacionid: vi.fn(), updateFactoringliquidacion: vi.fn() },
  liquidacionEstado: { getFactoringliquidacionestadoByFactoringliquidacionestadoid: vi.fn() },
  liquidacionFinanciero: { insertFactoringliquidacionfinanciero: vi.fn() },
  usuario: { getUsuarioByEmail: vi.fn(), getUsuarioByIdusuario: vi.fn() },
  archivo: { getArchivoByArchivoid: vi.fn(), getArchivoByArchivoidAndIdarchivotipo: vi.fn() },
  factura: { getFacturaByFacturaid: vi.fn() },
  facturaEstado: { getFacturaestadoByFacturaestadoid: vi.fn() },
  detraccionEstado: { getDetraccionestadoByDetraccionestadoid: vi.fn() },
  facturaArchivo: { insertArchivoFactura: vi.fn() },
  facturaFactor: { insertFactoringfacturafactor: vi.fn(), getFactoringfacturafactorByFactoringfacturafactorid: vi.fn(), updateFactoringfacturafactor: vi.fn(), activateFactoringfacturafactor: vi.fn(), deleteFactoringfacturafactor: vi.fn() },
  cuentaFactor: { getFactorcuentabancariaByFactorcuentabancariaid: vi.fn(), getFactorcuentabancariasByIdfactorIdmonedaIdbanco: vi.fn() },
  cuentaEmpresa: { getEmpresacuentabancariaByEmpresacuentabancariaid: vi.fn() },
  moneda: { getMonedaByMonedaid: vi.fn() },
  transferenciaTipo: { getFactoringtransferenciatipoByFactoringtransferenciatipoid: vi.fn() },
  transferenciaEstado: { getFactoringtransferenciaestadoByFactoringtransferenciaestadoid: vi.fn() },
  transferencia: { insertFactoringtransferenciacedente: vi.fn(), getFactoringtransferenciacedenteByFactoringtransferenciacedenteid: vi.fn(), updateFactoringtransferenciacedente: vi.fn(), activateFactoringtransferenciacedente: vi.fn(), deleteFactoringtransferenciacedente: vi.fn(), getFactoringtransferenciacedenteByIdfactoringtransferenciacedente: vi.fn() },
  constancia: { insertArchivofactoringtransferenciacedente: vi.fn() },
  email: { sendFactoringEmpresaServicioFactoringPropuestaDisponible: vi.fn(), sendFactoringEmpresaServicioFactoringCedenteConfirmacionTransferencia: vi.fn(), sendFactoringEmpresaServicioFactoringPropuestaAceptada: vi.fn(), sendFactoringEmpresaServicioFactoringDeudorSolicitudConfirmacion: vi.fn(), sendFactoringEmpresaServicioFactoringDeudorNotificacionTransferencia: vi.fn(), sendFactoringEmpresaServicioFactoringCedenteNotificacionInicioOperacion: vi.fn() },
  telegram: { sendMessageException: vi.fn(), sendMessageImportant: vi.fn() },
}));

export { boundary };

vi.mock("#src/config.js", () => ({ env: { TOKEN_KEY_JWT: "vitest-factoring-key" }, isProduction: true }));
vi.mock("#src/models/prisma/db-factoring.js", () => ({ prismaFT: { client: { $transaction: boundary.transaction }, transactionTimeout: 5000 } }));
vi.mock("#src/utils/logger.pino.js", () => ({ line: () => "test", log: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock("#src/providers/email/email.Provider.js", () => boundary.email);
vi.mock("#src/providers/telegram/telegram.Provider.js", () => boundary.telegram);
vi.mock("#src/utils/document/PDFgenerator.js", () => ({ default: class {} }));
vi.mock("#src/daos/factoring.Dao.js", () => boundary.factoring);
vi.mock("#src/daos/factoringestado.Dao.js", () => boundary.estado);
vi.mock("#src/daos/factoringhistorialestado.Dao.js", () => boundary.historial);
vi.mock("#src/daos/archivofactoringhistorialestado.Dao.js", () => boundary.historialArchivo);
vi.mock("#src/daos/riesgo.Dao.js", () => boundary.riesgo);
vi.mock("#src/daos/factoringtipo.Dao.js", () => boundary.tipo);
vi.mock("#src/daos/factoringestrategia.Dao.js", () => boundary.estrategia);
vi.mock("#src/daos/configuracionapp.Dao.js", () => boundary.config);
vi.mock("#src/daos/factoringconfigcomision.Dao.js", () => boundary.comision);
vi.mock("#src/daos/financierotipo.Dao.js", () => boundary.financieroTipo);
vi.mock("#src/daos/financieroconcepto.Dao.js", () => boundary.concepto);
vi.mock("#src/daos/factoringpropuesta.Dao.js", () => boundary.propuesta);
vi.mock("#src/daos/factoringpropuestaestado.Dao.js", () => boundary.propuestaEstado);
vi.mock("#src/daos/factoringpropuestahistorialestado.Dao.js", () => boundary.propuestaHistorial);
vi.mock("#src/daos/factoringpropuestafinanciero.Dao.js", () => boundary.propuestaFinanciero);
vi.mock("#src/daos/factoringliquidacion.Dao.js", () => boundary.liquidacion);
vi.mock("#src/daos/factoringliquidacionestado.Dao.js", () => boundary.liquidacionEstado);
vi.mock("#src/daos/factoringliquidacionfinanciero.Dao.js", () => boundary.liquidacionFinanciero);
vi.mock("#src/daos/usuario.Dao.js", () => boundary.usuario);
vi.mock("#src/daos/archivo.Dao.js", () => boundary.archivo);
vi.mock("#src/daos/factura.Dao.js", () => boundary.factura);
vi.mock("#src/daos/facturaestado.Dao.js", () => boundary.facturaEstado);
vi.mock("#src/daos/detraccionestado.Dao.js", () => boundary.detraccionEstado);
vi.mock("#src/daos/archivofactura.Dao.js", () => boundary.facturaArchivo);
vi.mock("#src/daos/factoringfacturafactor.Dao.js", () => boundary.facturaFactor);
vi.mock("#src/daos/factorcuentabancaria.Dao.js", () => boundary.cuentaFactor);
vi.mock("#src/daos/empresacuentabancaria.Dao.js", () => boundary.cuentaEmpresa);
vi.mock("#src/daos/moneda.Dao.js", () => boundary.moneda);
vi.mock("#src/daos/factoringtransferenciatipo.Dao.js", () => boundary.transferenciaTipo);
vi.mock("#src/daos/factoringtransferenciaestado.Dao.js", () => boundary.transferenciaEstado);
vi.mock("#src/daos/factoringtransferenciacedente.Dao.js", () => boundary.transferencia);
vi.mock("#src/daos/archivofactoringtransferenciacedente.Dao.js", () => boundary.constancia);

export const ids = {
  factoring: "11111111-1111-4111-8111-111111111111",
  tipo: "22222222-2222-4222-8222-222222222222",
  riesgo: "33333333-3333-4333-8333-333333333333",
  estrategia: "44444444-4444-4444-8444-444444444444",
  estado: "55555555-5555-4555-8555-555555555555",
  propuesta: "66666666-6666-4666-8666-666666666666",
  liquidacion: "77777777-7777-4777-8777-777777777777",
  concepto: "88888888-8888-4888-8888-888888888888",
};

export const proposalDto = () => ({
  factoringid: ids.factoring, factoringtipoid: ids.tipo, riesgooperacionid: ids.riesgo,
  riesgocedenteid: ids.riesgo, riesgoaceptanteid: ids.riesgo,
  factoringpropuestaestadoid: ids.estado, factoringestrategiaid: ids.estrategia,
  monto_neto: 20000, porcentaje_financiado_estimado: 0.8, tdm: 0.02,
  porcentaje_comision_descuento: 0, fecha_pago_estimado: "2026-10-01T05:00:00.000Z",
});

export const liquidationDto = () => ({
  factoringid: ids.factoring, factoringliquidacionestadoid: ids.estado,
  fecha_liquidacion: "2026-10-01T05:00:00.000Z",
  fecha_pago_efectivo: "2026-10-01T05:00:00.000Z",
});

export const createFactoringFixture = (moneda = 1, banco = 1) => ({
  idfactoring: 10, factoringid: ids.factoring, idfactor: 1, idmoneda: moneda,
  cantidad_facturas: 2, monto_neto: new Decimal(20000),
  fecha_emision: new Date("2026-08-01T00:00:00Z"),
  fecha_operacion: new Date("2026-09-01T05:00:00Z"),
  cuenta_bancaria: { idbanco: banco }, moneda: { idmoneda: moneda },
  idfactoringpropuestaaceptada: 100,
  contacto_cedente: { email: "cedente@example.test", persona: { idusuario: 42 } },
  contacto_aceptante: { email: "aceptante@example.test" },
  factoring_propuesta_aceptada: {
    idriesgooperacion: 1, tdm: new Decimal("0.02"),
    porcentaje_financiado_estimado: new Decimal("0.8"), porcentaje_comision_descuento: new Decimal(0),
    monto_descuento: new Decimal(320), monto_garantia: new Decimal(4000),
    fecha_pago_estimado: new Date("2026-10-01T05:00:00Z"),
  },
});

// Catálogos sintéticos coherentes: tipo 2 afecto / tipo 4 inafecto en adicionales.
const conceptos = {
  3: { idfinancieroconcepto: 3, factor: -1, afecto_igv: false },
  7: { idfinancieroconcepto: 7, factor: 1, afecto_igv: false },
  8: { idfinancieroconcepto: 8, factor: 1, afecto_igv: false },
  9: { idfinancieroconcepto: 9, factor: -1, afecto_igv: true },
};

export function resetFactoringBoundary(moneda = 1, banco = 1) {
  vi.resetAllMocks();
  const factoring = createFactoringFixture(moneda, banco);
  boundary.transaction.mockImplementation(async (callback) => callback(boundary.tx));
  boundary.factoring.getFactoringByFactoringid.mockResolvedValue(factoring);
  boundary.factoring.getFactoringByIdfactoring.mockResolvedValue(factoring);
  boundary.factoring.getFactoringByIdfactoringIdempresario.mockResolvedValue(factoring);
  boundary.factoring.claimFactoringApproval.mockResolvedValue(true);
  boundary.factoring.updateFactoring.mockImplementation(async (_tx, _id, data) => ({ ...factoring, idfactoringestado: data.factoring_estado?.connect.idfactoringestado }));
  boundary.estado.getFactoringestadoByFactoringestadoid.mockResolvedValue({ idfactoringestado: 4 });
  boundary.historial.insertFactoringhistorialestado.mockResolvedValue({ idfactoringhistorialestado: 400 });
  boundary.historial.getFactoringhistorialestadoByFactoringhistorialestadoid.mockResolvedValue({ idfactoringhistorialestado: 400 });
  boundary.historial.updateFactoringhistorialestado.mockResolvedValue({ idfactoringhistorialestado: 400 });
  boundary.historial.activateFactoringhistorialestado.mockResolvedValue([1]);
  boundary.historial.deleteFactoringhistorialestado.mockResolvedValue([1]);
  boundary.historialArchivo.insertArchivofactoringhistorialestado.mockResolvedValue({});
  boundary.config.getEmailsCCDeudorSolicitaConfirmacion.mockResolvedValue({ valor: '["control@example.test"]' });
  boundary.riesgo.getRiesgoByRiesgoid.mockResolvedValue({ idriesgo: 1 });
  boundary.riesgo.getRiesgoByIdriesgo.mockResolvedValue({ idriesgo: 1 });
  boundary.tipo.getFactoringtipoByFactoringtipoid.mockResolvedValue({ idfactoringtipo: 1 });
  boundary.estrategia.getFactoringestrategiaByFactoringestrategiaid.mockResolvedValue({ idfactoringestrategia: 1 });
  boundary.config.getIGV.mockResolvedValue({ valor: "0.18" });
  boundary.config.getCostoCAVALIPen.mockResolvedValue({ valor: "10" });
  boundary.config.getCostoCAVALIUsd.mockResolvedValue({ valor: "3" });
  boundary.config.getComisionBCPPen.mockResolvedValue({ valor: "7.50" });
  boundary.config.getComisionBCPUsd.mockResolvedValue({ valor: "2.50" });
  boundary.comision.getFactoringconfigcomisionByIdriesgo.mockResolvedValue({ factor1: new Decimal("0.01"), factor2: new Decimal(0), factor3: new Decimal(1) });
  boundary.financieroTipo.getComision.mockResolvedValue({ idfinancierotipo: 1 });
  boundary.financieroTipo.getCosto.mockResolvedValue({ idfinancierotipo: 2 });
  boundary.financieroTipo.getGasto.mockResolvedValue({ idfinancierotipo: 3 });
  boundary.financieroTipo.getGasto_excento_igv.mockResolvedValue({ idfinancierotipo: 4 });
  boundary.financieroTipo.getFinancierotipoByIdfinancierotipo.mockImplementation(async (_tx, id) => ({ idfinancierotipo: id }));
  boundary.financieroTipo.getFinancierotipoByFinancierotipoid.mockResolvedValue({ idfinancierotipo: 2 });
  boundary.concepto.getComisionFinanzaTech.mockResolvedValue({ idfinancieroconcepto: 1 });
  boundary.concepto.getCostoCAVALIPen.mockResolvedValue({ idfinancieroconcepto: 2 });
  boundary.concepto.getCostoTransaccion.mockResolvedValue({ idfinancieroconcepto: 6 });
  boundary.concepto.getGastoInterbancario.mockResolvedValue(conceptos[3]);
  boundary.concepto.getFinancieroconceptoByIdfinancieroconcepto.mockImplementation(async (_tx, id) => conceptos[id]);
  boundary.concepto.getFinancieroconceptoByFinancieroconceptoid.mockResolvedValue({ idfinancieroconcepto: 20, factor: -1, afecto_igv: true });
  boundary.propuestaEstado.getFactoringpropuestaestadoByFactoringpropuestaestadoid.mockResolvedValue({ idfactoringpropuestaestado: 1 });
  boundary.propuesta.insertFactoringpropuesta.mockImplementation(async (_tx, data) => ({ ...data, idfactoringpropuesta: 100 }));
  boundary.propuesta.getFactoringpropuestaByFactoringpropuestaid.mockResolvedValue({ idfactoringpropuesta: 100, idfactoring: 10, factoringpropuestaid: ids.propuesta });
  boundary.propuesta.getFactoringpropuestaVigenteByIdfactoringpropuestaIdfactoring.mockResolvedValue({ idfactoringpropuesta: 100 });
  boundary.propuesta.getFactoringpropuestaAceptadaByIdfactoringpropuesta.mockResolvedValue(factoring.factoring_propuesta_aceptada);
  boundary.propuesta.updateFactoringpropuesta.mockResolvedValue({ idfactoringpropuesta: 100, idfactoring: 10, idfactoringpropuestaestado: 1 });
  boundary.propuesta.approveFactoringpropuestaVigente.mockResolvedValue({ idfactoringpropuesta: 100, idfactoring: 10, idfactoringpropuestaestado: 6 });
  boundary.propuesta.activateFactoringpropuesta.mockResolvedValue([1]);
  boundary.propuesta.deleteFactoringpropuesta.mockResolvedValue([1]);
  boundary.propuestaHistorial.insertFactoringpropuestahistorialestado.mockResolvedValue({});
  boundary.propuestaFinanciero.insertFactoringpropuestafinanciero.mockResolvedValue({});
  boundary.liquidacionEstado.getFactoringliquidacionestadoByFactoringliquidacionestadoid.mockResolvedValue({ idfactoringliquidacionestado: 1 });
  boundary.liquidacion.insertFactoringliquidacion.mockImplementation(async (_tx, data) => ({ ...data, idfactoringliquidacion: 200 }));
  boundary.liquidacion.getFactoringliquidacionByFactoringliquidacionid.mockResolvedValue({ idfactoringliquidacion: 200 });
  boundary.liquidacion.updateFactoringliquidacion.mockResolvedValue({ idfactoringliquidacion: 200 });
  boundary.liquidacionFinanciero.insertFactoringliquidacionfinanciero.mockResolvedValue({});
  boundary.usuario.getUsuarioByEmail.mockResolvedValue({ email: "cedente@example.test" });
  boundary.usuario.getUsuarioByIdusuario.mockResolvedValue({ idusuario: 42, email: "cedente@example.test" });
  boundary.archivo.getArchivoByArchivoid.mockResolvedValue({ idarchivo: 50 });
  boundary.archivo.getArchivoByArchivoidAndIdarchivotipo.mockResolvedValue({ idarchivo: 51 });
  boundary.factura.getFacturaByFacturaid.mockResolvedValue({ idfactura: 80 });
  boundary.facturaEstado.getFacturaestadoByFacturaestadoid.mockResolvedValue({ idfacturaestado: 2 });
  boundary.detraccionEstado.getDetraccionestadoByDetraccionestadoid.mockResolvedValue({ iddetraccionestado: 3 });
  boundary.facturaArchivo.insertArchivoFactura.mockResolvedValue({});
  boundary.facturaFactor.insertFactoringfacturafactor.mockResolvedValue({ idfactoringfacturafactor: 500 });
  boundary.facturaFactor.getFactoringfacturafactorByFactoringfacturafactorid.mockResolvedValue({ idfactoringfacturafactor: 500, idfactura: 80 });
  boundary.facturaFactor.updateFactoringfacturafactor.mockResolvedValue({ idfactoringfacturafactor: 500 });
  boundary.facturaFactor.activateFactoringfacturafactor.mockResolvedValue([1]);
  boundary.facturaFactor.deleteFactoringfacturafactor.mockResolvedValue([1]);
  boundary.cuentaFactor.getFactorcuentabancariaByFactorcuentabancariaid.mockResolvedValue({ idfactorcuentabancaria: 30 });
  boundary.cuentaFactor.getFactorcuentabancariasByIdfactorIdmonedaIdbanco.mockResolvedValue([{ idfactorcuentabancaria: 30 }]);
  boundary.cuentaEmpresa.getEmpresacuentabancariaByEmpresacuentabancariaid.mockResolvedValue({ idempresacuentabancaria: 40 });
  boundary.moneda.getMonedaByMonedaid.mockResolvedValue({ idmoneda: moneda });
  boundary.transferenciaTipo.getFactoringtransferenciatipoByFactoringtransferenciatipoid.mockResolvedValue({ idfactoringtransferenciatipo: 1 });
  boundary.transferenciaEstado.getFactoringtransferenciaestadoByFactoringtransferenciaestadoid.mockResolvedValue({ idfactoringtransferenciaestado: 1 });
  boundary.transferencia.insertFactoringtransferenciacedente.mockImplementation(async (_tx, data) => ({ ...data, idfactoringtransferenciacedente: 300 }));
  boundary.transferencia.getFactoringtransferenciacedenteByFactoringtransferenciacedenteid.mockResolvedValue({ idfactoringtransferenciacedente: 300, idfactoring: 10 });
  boundary.transferencia.updateFactoringtransferenciacedente.mockResolvedValue({ idfactoringtransferenciacedente: 300 });
  boundary.transferencia.activateFactoringtransferenciacedente.mockResolvedValue([1]);
  boundary.transferencia.deleteFactoringtransferenciacedente.mockResolvedValue([1]);
  boundary.constancia.insertArchivofactoringtransferenciacedente.mockResolvedValue({});
  return factoring;
}
