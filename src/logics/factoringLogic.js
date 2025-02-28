import { sequelizeFT } from "../config/bd/sequelize_db_factoring.js";
import * as riesgoDao from "../daos/riesgoDao.js";
import logger, { line } from "../utils/logger.js";

export const simulateFactoringLogic = async (_idriesgooperacion, _idbancocedente, cantidad_facturas, monto_neto, dias_pago_estimado, porcentaje_adelanto, tnm) => {
  logger.debug(line(), "logic::simulateFactoringLogic");
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
