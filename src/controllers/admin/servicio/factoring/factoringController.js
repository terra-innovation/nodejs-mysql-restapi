import { sequelizeFT } from "../../../../config/bd/sequelize_db_factoring.js";
import * as cuentabancariaDao from "../../../../daos/cuentabancariaDao.js";
import * as empresaDao from "../../../../daos/empresaDao.js";
import * as personaDao from "../../../../daos/personaDao.js";
import * as factoringDao from "../../../../daos/factoringDao.js";
import * as factoringtipoDao from "../../../../daos/factoringtipoDao.js";
import * as factoringestadoDao from "../../../../daos/factoringestadoDao.js";
import * as riesgoDao from "../../../../daos/riesgoDao.js";
import * as colaboradorDao from "../../../../daos/colaboradorDao.js";
import * as monedaDao from "../../../../daos/monedaDao.js";
import { ClientError } from "../../../../utils/CustomErrors.js";
import * as jsonUtils from "../../../../utils/jsonUtils.js";
import { response } from "../../../../utils/CustomResponseOk.js";
import logger, { line } from "../../../../utils/logger.js";

import * as luxon from "luxon";
import { Sequelize } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

export const simulateFactoring = async (req, res) => {
  logger.debug(line(), "controller::createFactoring");
  const { id } = req.params;
  const factoringCreateSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
      riesgooperacionid: yup.string().trim().required().min(36).max(36),
      factoringtipoid: yup.string().trim().required().min(36).max(36),
      dias_pago_estimado: yup.string().required(),
      tnm: yup.number().required().min(1).max(100),
      porcentaje_adelanto: yup.number().required().min(0).max(100),
    })
    .required();
  var factoringValidated = factoringCreateSchema.validateSync({ factoringid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  //logger.debug(line(),"factoringValidated:", factoringValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    const session_idusuario = req.session_user.usuario._idusuario;
    const filter_estados = [1];

    var factoring = await factoringDao.getFactoringByFactoringid(transaction, factoringValidated.factoringid);
    if (!factoring) {
      throw new ClientError("Factoring no existe", 404);
    }

    var factoringtipo = await factoringtipoDao.getFactoringtipoByFactoringtipoid(transaction, factoringValidated.factoringtipoid);
    if (!factoringtipo) {
      throw new ClientError("Factoring tipo no existe", 404);
    }

    var riesgooperacion = await riesgoDao.getRiesgoByRiesgoid(transaction, factoringValidated.riesgooperacionid);
    if (!riesgooperacion) {
      throw new ClientError("Riesgo operación no existe", 404);
    }

    var simulacion = {};
    simulacion.dias_pago_estimado = luxon.DateTime.fromISO(factoring.fecha_pago_estimado).startOf("day").diff(luxon.DateTime.local().startOf("day"), "days").days; // Actualizamos la cantidad de dias para el pago
    simulacion.montoCostoCAVALI = 4.54;
    simulacion.montoComisionOperacionPorFactura = 10;
    simulacion.montoCostoEstudioPorAceptante = 100;
    simulacion.porcentajeComisionUsoSitio = 0.7;
    simulacion.minimoComisionUsoSitio = 130;
    simulacion.minimoComisionGestion = 20;
    simulacion.porcentajeComisionGestion = (await riesgoDao.getRiesgoByRiesgoid(transaction, factoringValidated.riesgooperacionid)).porcentaje_comision_gestion;
    simulacion.cantidadMeses = Math.ceil(simulacion.dias_pago_estimado / 30);
    simulacion.montoComisionInterbancariaInmediataBCP = 4.8;
    simulacion.porcentajeIGV = 18;
    simulacion.tna = Number((factoringValidated.tnm * 12).toFixed(5));
    simulacion.tnd = Number((factoringValidated.tnm / 30).toFixed(5));
    simulacion.tea = Number(((Math.pow(1 + simulacion.tna / 100 / 360, 360) - 1) * 100).toFixed(5));
    simulacion.tem = Number(((Math.pow(1 + simulacion.tna / 100, 1 / 12) - 1) * 100).toFixed(5));
    simulacion.ted = Number(((Math.pow(1 + simulacion.tna / 100, 1 / 360) - 1) * 100).toFixed(5));
    simulacion.tnm_mora = 0.5;
    simulacion.tna_mora = Number((simulacion.tnm_mora * 12).toFixed(5));
    simulacion.tnd_mora = Number((simulacion.tna_mora / 360).toFixed(5));
    simulacion.monto_adelanto = Number(((factoring.monto_neto * factoringValidated.porcentaje_adelanto) / 100).toFixed(2));
    simulacion.monto_garantia = Number((factoring.monto_neto - simulacion.monto_adelanto).toFixed(2));
    simulacion.monto_costo_financiamiento_estimado = Number((simulacion.monto_adelanto * (simulacion.tnd / 100) * simulacion.dias_pago_estimado).toFixed(2));
    simulacion.monto_comision_operacion = Number((simulacion.montoComisionOperacionPorFactura * factoring.cantidad_facturas).toFixed(2));
    simulacion.monto_costo_estudio = simulacion.montoCostoEstudioPorAceptante;
    simulacion.monto_comision_uso_sitio_estimado = Math.max(simulacion.monto_adelanto * simulacion.cantidadMeses * (simulacion.porcentajeComisionUsoSitio / 100), simulacion.minimoComisionUsoSitio);

    simulacion.monto_comision_gestion = simulacion.monto_adelanto * (simulacion.porcentajeComisionGestion / 100);
    simulacion.monto_comision_interbancaria = factoring.cuentabancaria_cuenta_bancarium._idbanco == 1 ? 0 : simulacion.montoComisionInterbancariaInmediataBCP;
    simulacion.monto_costo_cavali = simulacion.montoCostoCAVALI * factoring.cantidad_facturas;

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
    logger.info(line(), "simulacion: ", simulacion);

    await transaction.commit();

    response(res, 201, { factoring: { ...factoringValidated }, ...simulacion });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getFactoringMaster = async (req, res) => {
  logger.debug(line(), "controller::getFactoringsMaster");
  const filter_estados = [1];

  const transaction = await sequelizeFT.transaction();
  try {
    const factoringtipos = await factoringtipoDao.getFactoringtipos(transaction, filter_estados);
    const factoringestados = await factoringestadoDao.getFactoringestados(transaction, filter_estados);
    const riesgos = await riesgoDao.getRiesgos(transaction, filter_estados);

    var factoringsMaster = {};
    factoringsMaster.factoringtipos = factoringtipos;
    factoringsMaster.factoringestados = factoringestados;
    factoringsMaster.riesgos = riesgos;

    var factoringsMasterJSON = jsonUtils.sequelizeToJSON(factoringsMaster);
    //jsonUtils.prettyPrint(factoringsMasterJSON);
    var factoringsMasterObfuscated = factoringsMasterJSON;
    //jsonUtils.prettyPrint(factoringsMasterObfuscated);
    var factoringsMasterFiltered = jsonUtils.removeAttributesPrivates(factoringsMasterObfuscated);
    //jsonUtils.prettyPrint(factoringsMasterFiltered);
    await transaction.commit();
    response(res, 201, factoringsMasterFiltered);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getFactorings = async (req, res) => {
  logger.debug(line(), "controller::getFactorings");
  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estados = [1, 2];
    const factorings = await factoringDao.getFactoringsByEstados(transaction, filter_estados);
    await transaction.commit();
    response(res, 201, factorings);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
