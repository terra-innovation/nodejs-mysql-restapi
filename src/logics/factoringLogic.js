import { sequelizeFT } from "../config/bd/sequelize_db_factoring.js";
import * as riesgoDao from "../daos/riesgoDao.js";
import * as financierotipoDao from "../daos/financierotipoDao.js";
import * as financieroconceptoDao from "../daos/financieroconceptoDao.js";
import * as configuracionappDao from "../daos/configuracionappDao.js";
import * as factoringconfigcomisionDao from "../daos/factoringconfigcomisionDao.js";
import * as factoringconfiggarantiaDao from "../daos/factoringconfiggarantiaDao.js";
import * as factoringconfigtasadescuentoDao from "../daos/factoringconfigtasadescuentoDao.js";

import logger, { line } from "../utils/logger.js";

export const simulateFactoringLogicV2 = async (_idriesgooperacion, _idbancocedente, cantidad_facturas, monto_neto, dias_pago_estimado, porcentaje_financiado, tdm) => {
  logger.debug(line(), "logic::simulateFactoringLogicV2");
  var simulacion = {};
  const transaction = await sequelizeFT.transaction();
  try {
    var constante_igv = await configuracionappDao.getIGV(transaction);
    var constante_costo_cavali = await configuracionappDao.getCostoCAVALI(transaction);
    var constante_comison_bcp = await configuracionappDao.getComisionBCP(transaction);

    var riesgooperacion = await riesgoDao.getRiesgoByIdriesgo(transaction, _idriesgooperacion);
    var cofigcomision = await factoringconfigcomisionDao.getFactoringconfigcomisionByIdriesgo(transaction, riesgooperacion._idriesgo, [1]);
    var financiero_tipo_comision = await financierotipoDao.getComision(transaction);
    var financiero_tipo_costo = await financierotipoDao.getCosto(transaction);
    var financiero_tipo_gasto = await financierotipoDao.getGasto(transaction);

    var financiero_concepto_comisionft = await financieroconceptoDao.getComisionFinanzaTech();
    var financiero_concepto_cavali = await financieroconceptoDao.getCostoCAVALI();
    var financiero_concepto_transaccion = await financieroconceptoDao.getCostoTransaccion();

    simulacion.dias_pago_estimado = dias_pago_estimado;
    simulacion.tda = Number((Math.pow(1 + tdm, 12) - 1).toFixed(10));
    simulacion.tdm = Number(tdm.toFixed(5));
    simulacion.tdd = Number((Math.pow(1 + tdm, 1 / 30) - 1).toFixed(10));
    simulacion.tdm_mora = 0;
    simulacion.tda_mora = 0;
    simulacion.tdd_mora = 0;
    simulacion.monto_neto = monto_neto;
    simulacion.monto_garantia = Number((monto_neto * (1 - porcentaje_financiado)).toFixed(2));
    simulacion.monto_efectivo = Number((monto_neto * porcentaje_financiado).toFixed(2));
    simulacion.monto_financiado = simulacion.monto_efectivo;
    simulacion.monto_descuento = Number((simulacion.monto_financiado * (Math.pow(1 + simulacion.tdd, simulacion.dias_pago_estimado) - 1)).toFixed(2));

    var comisiones = [];

    let comisionft_porcentaje = Number((cofigcomision.factor1 * Math.exp(cofigcomision.factor2 / simulacion.monto_neto) * cofigcomision.factor3).toFixed(5));
    let comisionft_monto = Number((comisionft_porcentaje * simulacion.monto_neto).toFixed(2));
    comisionft_monto = comisionft_monto + Number(_idbancocedente == 1 ? 0 : constante_comison_bcp.valor);
    let comisionft_igv = Number((comisionft_monto * constante_igv.valor).toFixed(3));
    let comision_ft = {
      comisionft_porcentaje: comisionft_porcentaje,
      _idfinancierotipo: financiero_tipo_comision._idfinancierotipo,
      _idfinancieroconcepto: financiero_concepto_comisionft._idfinancieroconcepto,
      monto: comisionft_monto,
      igv: comisionft_igv,
      financierotipo: financiero_tipo_comision,
      financieroconcepto: financiero_concepto_comisionft,
    };
    comision_ft.total = Number((comision_ft.monto + comision_ft.igv).toFixed(2));
    comisiones.push(comision_ft);

    simulacion.comisiones = comisiones;

    var costos = [];
    let costo_cavali = {
      _idfinancierotipo: financiero_tipo_costo._idfinancierotipo,
      _idfinancieroconcepto: financiero_concepto_cavali._idfinancieroconcepto,
      monto: Number(constante_costo_cavali.valor),
      igv: Number((constante_costo_cavali.valor * constante_igv.valor).toFixed(3)),
      financierotipo: financiero_tipo_costo,
      financieroconcepto: financiero_concepto_cavali,
    };
    costo_cavali.total = Number((costo_cavali.monto * 1 + costo_cavali.igv * 1).toFixed(2));
    costos.push(costo_cavali);

    simulacion.costos = costos;

    var gastos = [];

    simulacion.gastos = gastos;

    simulacion.monto_comision = comisiones.reduce((acumulador, item) => {
      return acumulador + item.monto;
    }, 0);

    simulacion.monto_comision_igv = comisiones.reduce((acumulador, item) => {
      return acumulador + item.igv;
    }, 0);

    simulacion.monto_costo_estimado = costos.reduce((acumulador, item) => {
      return acumulador + item.monto;
    }, 0);

    simulacion.monto_costo_estimado_igv = costos.reduce((acumulador, item) => {
      return acumulador + item.igv;
    }, 0);

    simulacion.monto_gasto_estimado = gastos.reduce((acumulador, item) => {
      return acumulador + item.monto;
    }, 0);

    simulacion.monto_gasto_estimado_igv = gastos.reduce((acumulador, item) => {
      return acumulador + item.igv;
    }, 0);

    simulacion.monto_total_igv = Number((simulacion.monto_comision_igv + simulacion.monto_costo_estimado_igv + simulacion.monto_gasto_estimado_igv).toFixed(2));

    simulacion.monto_adelanto = Number((simulacion.monto_financiado - simulacion.monto_descuento - simulacion.monto_comision - simulacion.monto_costo_estimado - simulacion.monto_gasto_estimado - simulacion.monto_total_igv).toFixed(2));

    simulacion.monto_dia_mora_estimado = 0;
    simulacion.monto_dia_interes_estimado = Number((simulacion.monto_financiado * (Math.pow(1 + simulacion.tdd, 1) - 1)).toFixed(2));

    simulacion.porcentaje_garantia_estimado = Number((simulacion.monto_garantia / simulacion.monto_neto).toFixed(5));
    simulacion.porcentaje_efectivo_estimado = Number((simulacion.monto_efectivo / simulacion.monto_neto).toFixed(5));
    simulacion.porcentaje_financiado_estimado = Number((simulacion.monto_financiado / simulacion.monto_neto).toFixed(5));
    simulacion.porcentaje_descuento_estimado = Number((simulacion.monto_descuento / simulacion.monto_neto).toFixed(5));
    simulacion.porcentaje_adelanto_estimado = Number((simulacion.monto_adelanto / simulacion.monto_neto).toFixed(5));
    simulacion.porcentaje_comision_estimado = Number((simulacion.monto_comision / simulacion.monto_neto).toFixed(5));

    simulacion.dias_cobertura_garantia_estimado = Math.floor((Math.log((simulacion.monto_financiado + simulacion.monto_garantia) / simulacion.monto_financiado) / Math.log(1 + simulacion.tdm)) * 30);

    //logger.debug(line(), "simulacion: ", simulacion);

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
  return simulacion;
};

export const simulateFactoringLogicV1 = async (_idriesgooperacion, _idbancocedente, cantidad_facturas, monto_neto, dias_pago_estimado, porcentaje_adelanto, tnm) => {
  logger.debug(line(), "logic::simulateFactoringLogicV1");
  var simulacion = {};
  const transaction = await sequelizeFT.transaction();
  try {
    simulacion.dias_pago_estimado = dias_pago_estimado;
    simulacion.montoCostoCAVALI = 4.54;
    simulacion.montoComisionOperacionPorFactura = 10;
    simulacion.montoCostoEstudioPorAceptante = 100;
    simulacion.porcentajeComisionUsoSitio = 0.7;
    simulacion.minimoComisionUsoSitio = 130;
    simulacion.minimoComisionGestion = 20;
    simulacion.porcentajeComisionGestion = (await riesgoDao.getRiesgoByIdriesgo(transaction, _idriesgooperacion)).porcentaje_comision_gestion;
    simulacion.cantidadMeses = Math.ceil(simulacion.dias_pago_estimado / 30);
    simulacion.montoComisionInterbancariaInmediataBCP = 4.8;
    simulacion.porcentajeIGV = 18;
    simulacion.tna = Number((tnm * 12).toFixed(5));
    simulacion.tnd = Number((tnm / 30).toFixed(5));
    simulacion.tea = Number(((Math.pow(1 + simulacion.tna / 100 / 360, 360) - 1) * 100).toFixed(5));
    simulacion.tem = Number(((Math.pow(1 + simulacion.tna / 100, 1 / 12) - 1) * 100).toFixed(5));
    simulacion.ted = Number(((Math.pow(1 + simulacion.tna / 100, 1 / 360) - 1) * 100).toFixed(5));
    simulacion.tnm_mora = 0.5;
    simulacion.tna_mora = Number((simulacion.tnm_mora * 12).toFixed(5));
    simulacion.tnd_mora = Number((simulacion.tna_mora / 360).toFixed(5));
    simulacion.monto_adelanto = Number(((monto_neto * porcentaje_adelanto) / 100).toFixed(2));
    simulacion.monto_garantia = Number((monto_neto - simulacion.monto_adelanto).toFixed(2));
    simulacion.monto_costo_financiamiento_estimado = Number((simulacion.monto_adelanto * (simulacion.tnd / 100) * simulacion.dias_pago_estimado).toFixed(2));
    simulacion.monto_comision_operacion = Number((simulacion.montoComisionOperacionPorFactura * cantidad_facturas).toFixed(2));
    simulacion.monto_costo_estudio = simulacion.montoCostoEstudioPorAceptante;
    simulacion.monto_comision_uso_sitio_estimado = Math.max(simulacion.monto_adelanto * simulacion.cantidadMeses * (simulacion.porcentajeComisionUsoSitio / 100), simulacion.minimoComisionUsoSitio);

    simulacion.monto_comision_gestion = simulacion.monto_adelanto * (simulacion.porcentajeComisionGestion / 100);
    simulacion.monto_comision_interbancaria = _idbancocedente == 1 ? 0 : simulacion.montoComisionInterbancariaInmediataBCP;
    simulacion.monto_costo_cavali = simulacion.montoCostoCAVALI * cantidad_facturas;

    simulacion.monto_comision_factor = simulacion.monto_comision_operacion + simulacion.monto_costo_estudio + simulacion.monto_comision_uso_sitio_estimado + simulacion.monto_comision_gestion + simulacion.monto_comision_interbancaria + simulacion.monto_costo_cavali;

    simulacion.monto_igv = Number((simulacion.monto_comision_factor * (simulacion.porcentajeIGV / 100)).toFixed(2));

    simulacion.monto_costo_factoring = simulacion.monto_comision_factor + simulacion.monto_costo_financiamiento_estimado;
    simulacion.monto_desembolso = simulacion.monto_adelanto - simulacion.monto_costo_factoring - simulacion.monto_igv;

    simulacion.porcentaje_desembolso = (simulacion.monto_desembolso / simulacion.monto_adelanto) * 100;
    simulacion.porcentaje_comision_factor = (simulacion.monto_comision_factor / simulacion.monto_adelanto) * 100;
    simulacion.porcentaje_costo_factoring = (simulacion.monto_costo_factoring / simulacion.monto_adelanto) * 100;

    simulacion.monto_dia_interes = (simulacion.tnd / 100) * simulacion.monto_adelanto;
    simulacion.monto_dia_mora = (simulacion.tnd_mora / 100) * simulacion.monto_adelanto;
    simulacion.dias_cobertura_garantia = simulacion.monto_garantia / (simulacion.monto_dia_interes + simulacion.monto_dia_mora);

    simulacion.tcnm = (simulacion.monto_costo_factoring / simulacion.monto_adelanto / simulacion.dias_pago_estimado) * 30 * 100;
    simulacion.tcna = simulacion.tcnm * 12;
    simulacion.tcnd = simulacion.tcnm / 30;

    //logger.debug(line(), "simulacion: ", simulacion);

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
  return simulacion;
};
