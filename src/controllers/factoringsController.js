import * as factoringDao from "../daos/factoringDao.js";
import * as facturaDao from "../daos/facturaDao.js";
import * as factoringfacturaDao from "../daos/factoringfacturaDao.js";
import * as factoringtipoDao from "../daos/factoringtipoDao.js";
import * as factoringestadoDao from "../daos/factoringestadoDao.js";
import * as cuentabancariaDao from "../daos/cuentabancariaDao.js";
import * as empresaDao from "../daos/empresaDao.js";
import * as riesgoDao from "../daos/riesgoDao.js";
import * as bancoDao from "../daos/bancoDao.js";
import * as cuentatipoDao from "../daos/cuentatipoDao.js";
import * as monedaDao from "../daos/monedaDao.js";
import { response } from "../utils/CustomResponseOk.js";
import { ClientError } from "../utils/CustomErrors.js";
import * as jsonUtils from "../utils/jsonUtils.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";
import * as luxon from "luxon";

export const acceptFactoringCotizacion = async (req, res) => {
  const { id } = req.params;
  const factoringUpdateSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringValidated = factoringUpdateSchema.validateSync({ factoringid: id }, { abortEarly: false, stripUnknown: true });
  console.debug("factoringValidated: ", factoringValidated);

  var factoring = await factoringDao.findFactoringPk(req, factoringValidated.factoringid);
  if (!factoring) {
    throw new ClientError("Factoring no existe", 404);
  }

  var camposFk = {};
  camposFk._idfactoring = factoring._idfactoring;
  //console.log("camposFk: ", camposFk);

  var camposAdicionales = {};
  camposAdicionales._idfactoringestado = 4;
  console.log("camposAdicionales: ", camposAdicionales);

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);

  const resultUpdate = await factoringDao.updateFactoring(req, { ...camposFk, ...camposAdicionales, ...factoringValidated, ...camposAuditoria });
  if (resultUpdate[0] === 0) {
    throw new ClientError("Factoring no existe", 404);
  }
  const factoringUpdated = await factoringDao.getFactoringByFactoringid(req, id);
  if (!factoringUpdated) {
    throw new ClientError("Factoring no existe", 404);
  }
  var factoringsJson = jsonUtils.sequelizeToJSON(factoringUpdated);
  var factoringsObfuscated = jsonUtils.ofuscarAtributosDefault(factoringsJson);
  var factoringsFiltered = jsonUtils.removeAttributesUsusarioPrivates(factoringsObfuscated);
  factoringsFiltered = jsonUtils.removeAttributesPrivates(factoringsFiltered);
  response(res, 200, factoringsFiltered);
};

export const getFactoringEmpresario = async (req, res) => {
  console.debug("getFactoringEmpresario");
  const session_idusuario = req.session_user.usuario._idusuario;
  console.debug("session_idusuario:", session_idusuario);
  const { id } = req.params;
  const factoringSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  var factoringValidated = factoringSchema.validateSync({ factoringid: id }, { abortEarly: false, stripUnknown: true });
  console.debug("factoringValidated: ", factoringValidated);
  const filter_estados = [1];
  const factoring = await factoringDao.getFactoringByFactoringidAndIdcontactocedente(req, factoringValidated.factoringid, session_idusuario, filter_estados);
  if (!factoring) {
    throw new ClientError("Factoring no existe", 404);
  }
  var factoringsJson = jsonUtils.sequelizeToJSON(factoring);
  var factoringsObfuscated = jsonUtils.ofuscarAtributosDefault(factoringsJson);
  var factoringsFiltered = jsonUtils.removeAttributesUsusarioPrivates(factoringsObfuscated);
  factoringsFiltered = jsonUtils.removeAttributesPrivates(factoringsFiltered);
  response(res, 200, factoringsFiltered);
};

export const getFactoringsCotizacionesMiosActivos = async (req, res) => {
  console.debug("getFactoringsCotizacionesMiosActivos");
  const session_idusuario = req.session_user.usuario._idusuario;
  console.debug("session_idusuario:", session_idusuario);
  const filter_estados = [1];
  const factorings = await factoringDao.getFactoringsCotizacionesByIdcontactocedente(req, session_idusuario, filter_estados);
  response(res, 201, factorings);
};

export const getFactorings = async (req, res) => {
  const factorings = await factoringDao.getFactoringsActivas(req);
  response(res, 201, factorings);
};

export const getFactoringsMaster = async (req, res) => {
  const filter_estados = [1];
  const factoringtipos = await factoringtipoDao.getFactoringtipos(req, filter_estados);
  const factoringestados = await factoringestadoDao.getFactoringestados(req, filter_estados);
  const riesgos = await riesgoDao.getRiesgos(req, filter_estados);

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
  response(res, 201, factoringsMasterFiltered);
};

export const getFactoring = async (req, res) => {
  console.debug("getFactoring");
  const { id } = req.params;
  const factoringSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  var factoringValidated = factoringSchema.validateSync({ factoringid: id }, { abortEarly: false, stripUnknown: true });
  console.debug("factoringValidated: ", factoringValidated);
  const factoring = await factoringDao.getFactoringByFactoringid(req, factoringValidated.factoringid);
  if (!factoring) {
    throw new ClientError("Factoring no existe", 404);
  }
  response(res, 200, factoring);
};

export const createFactoring = async (req, res) => {
  const factoringCreateSchema = yup
    .object()
    .shape({
      //facturaid: yup.string().trim().required().min(36).max(36),
      facturas: yup
        .array()
        .of(
          yup.object({
            facturaid: yup.string().required().uuid(),
          })
        )
        .min(1),
      cedenteid: yup.string().trim().required().min(36).max(36),
      aceptanteid: yup.string().trim().required().min(36).max(36),
      cuentabancariaid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
      monto_neto: yup.string().required(),
      fecha_pago_estimado: yup.string().required(),
      dias_pago_estimado: yup.string().required(),
    })
    .required();
  var factoringValidated = factoringCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  //console.debug("factoringValidated:", factoringValidated);

  const facturas = [];

  for (const [index, facturaid] of factoringValidated.facturas.entries()) {
    var factura = await facturaDao.findFacturaPk(req, facturaid.facturaid);
    if (!factura) {
      throw new ClientError("Factura no existe", 404);
    } else {
      facturas.push(factura);
    }
  }
  var cedente = await empresaDao.findEmpresaPk(req, factoringValidated.cedenteid);
  if (!cedente) {
    throw new ClientError("Cedente no existe", 404);
  }

  var aceptante = await empresaDao.findEmpresaPk(req, factoringValidated.aceptanteid);
  if (!aceptante) {
    throw new ClientError("Aceptante no existe", 404);
  }

  var cuentabancaria = await cuentabancariaDao.findCuentabancariaPk(req, factoringValidated.cuentabancariaid);
  if (!cuentabancaria) {
    throw new ClientError("Cuenta bancaria no existe", 404);
  }

  var moneda = await monedaDao.findMonedaPk(req, factoringValidated.monedaid);
  if (!moneda) {
    throw new ClientError("Moneda no existe", 404);
  }

  var camposFk = {};
  camposFk._idcedente = cedente._idempresa;
  camposFk._idaceptante = aceptante._idempresa;
  camposFk._idcuentabancaria = cuentabancaria._idcuentabancaria;
  camposFk._idmoneda = moneda._idmoneda;
  camposFk._idfactoringtipo = 1; // Por defecto
  camposFk._idfactoringestado = 1; // Por defecto

  //console.log(camposFk);

  var camposAdicionales = {};
  camposAdicionales.factoringid = uuidv4();
  camposAdicionales.code = uuidv4().split("-")[0];
  camposAdicionales.fecha_registro = luxon.DateTime.now().toISO();
  camposAdicionales.cantidad_facturas = factoringValidated.facturas.length;

  //console.log(camposAdicionales);

  var camposAuditoria = {};
  camposAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechacrea = Sequelize.fn("now", 3);
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 1;

  //console.log(camposAuditoria);

  /*
  // Validar si el factoring ya existe
  const factoring_existe = await factoringDao.getFactoringByRuc(req, factoringValidated.ruc);

  if (factoring_existe.length >= 1) {
    throw new ClientError("Factoring ya existe", 404);
  }
  */

  const factoringCreated = await factoringDao.insertFactoring(req, { ...camposFk, ...camposAdicionales, ...factoringValidated, ...camposAuditoria });
  //console.debug("Create factoring: ID:" + factoringCreated._idfactoring + " | " + camposAdicionales.factoringid);
  //console.debug("factoringCreated:", factoringCreated.dataValues);

  /* Insertar en la tabla intermedia */

  for (const [index, factura] of facturas.entries()) {
    //console.log(`Índice: ${index}, Objeto: ${jsonUtils.prettyPrint(factura)}`);
    var factoringfacturaFk = {};
    factoringfacturaFk._idfactoring = factoringCreated._idfactoring;
    factoringfacturaFk._idfactura = factura._idfactura;
    const factoringfacturaCreated = await factoringfacturaDao.insertFactoringfactura(req, { ...factoringfacturaFk, ...camposAuditoria });
    //console.log(jsonUtils.prettyPrint(factoringfacturaCreated));
  }

  response(res, 201, { ...camposAdicionales, ...factoringValidated });
};

export const updateFactoringCotizacion = async (req, res) => {
  const { id } = req.params;
  const factoringUpdateSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
      factoringtipoid: yup.string().trim().required().min(36).max(36),
      factoringestadoid: yup.string().trim().required().min(36).max(36),
      riesgooperacionid: yup.string().trim().required().min(36).max(36),
      riesgocedenteid: yup.string().trim().required().min(36).max(36),
      riesgoaceptanteid: yup.string().trim().required().min(36).max(36),
      tna: yup.number().required().min(1).max(100),
      porcentaje_adelanto: yup.number().required().min(0).max(100),
    })
    .required();
  const factoringValidated = factoringUpdateSchema.validateSync({ factoringid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  console.debug("factoringValidated: ", factoringValidated);

  var factoring = await factoringDao.findFactoringPk(req, factoringValidated.factoringid);
  if (!factoring) {
    throw new ClientError("Factoring no existe", 404);
  }

  var factoringtipo = await factoringtipoDao.findFactoringtipoPk(req, factoringValidated.factoringtipoid);
  if (!factoringtipo) {
    throw new ClientError("Factoring tipo no existe", 404);
  }

  var factoringestado = await factoringestadoDao.findFactoringestadoPk(req, factoringValidated.factoringestadoid);
  if (!factoringestado) {
    throw new ClientError("Factoring estado no existe", 404);
  }

  var riesgooperacion = await riesgoDao.findRiesgoPk(req, factoringValidated.riesgooperacionid);
  if (!riesgooperacion) {
    throw new ClientError("Riesgo operación no existe", 404);
  }

  var riesgocedente = await riesgoDao.findRiesgoPk(req, factoringValidated.riesgocedenteid);
  if (!riesgocedente) {
    throw new ClientError("Riesgo cedente no existe", 404);
  }

  var riesgoaceptante = await riesgoDao.findRiesgoPk(req, factoringValidated.riesgoaceptanteid);
  if (!riesgoaceptante) {
    throw new ClientError("Riesgo aceptante no existe", 404);
  }

  const factoringBefore = await factoringDao.getFactoringByFactoringid(req, id);
  if (!factoringBefore) {
    throw new ClientError("Factoring no existe", 404);
  }

  var camposFk = {};
  camposFk._idfactoring = factoring._idfactoring;
  camposFk._idfactoringtipo = factoringtipo._idfactoringtipo;
  camposFk._idfactoringestado = factoringestado._idfactoringestado;
  camposFk._idriesgooperacion = riesgooperacion._idriesgo;
  camposFk._idriesgocedente = riesgocedente._idriesgo;
  camposFk._idriesgoaceptante = riesgoaceptante._idriesgo;

  //console.log("camposFk: ", camposFk);

  var camposAdicionales = {};
  camposAdicionales.dias_pago_estimado = luxon.DateTime.fromISO(factoringBefore.fecha_pago_estimado).startOf("day").diff(luxon.DateTime.local().startOf("day"), "days").days; // Actualizamos la cantidad de dias para el pago
  camposAdicionales.montoCostoCAVALI = 4.54;
  camposAdicionales.montoComisionOperacionPorFactura = 10;
  camposAdicionales.montoCostoEstudioPorAceptante = 100;
  camposAdicionales.porcentajeComisionUsoSitio = 0.7;
  camposAdicionales.minimoComisionUsoSitio = 130;
  camposAdicionales.minimoComisionGestion = 20;
  camposAdicionales.porcentajeComisionGestion = (await riesgoDao.getRiesgoByRiesgoid(req, factoringValidated.riesgooperacionid)).porcentaje_comision_gestion;
  camposAdicionales.cantidadMeses = Math.ceil(camposAdicionales.dias_pago_estimado / 30);
  camposAdicionales.montoComisionInterbancariaInmediataBCP = 4.8;
  camposAdicionales.porcentajeIGV = 18;
  camposAdicionales.tnm = Number((factoringValidated.tna / 12).toFixed(5));
  camposAdicionales.tnd = Number((factoringValidated.tna / 360).toFixed(5));
  camposAdicionales.tea = Number(((Math.pow(1 + factoringValidated.tna / 100 / 360, 360) - 1) * 100).toFixed(5));
  camposAdicionales.tem = Number(((Math.pow(1 + factoringValidated.tna / 100, 1 / 12) - 1) * 100).toFixed(5));
  camposAdicionales.ted = Number(((Math.pow(1 + factoringValidated.tna / 100, 1 / 360) - 1) * 100).toFixed(5));
  camposAdicionales.tnm_mora = 0.5;
  camposAdicionales.tna_mora = Number((camposAdicionales.tnm_mora * 12).toFixed(5));
  camposAdicionales.tnd_mora = Number((camposAdicionales.tna_mora / 360).toFixed(5));
  camposAdicionales.monto_adelanto = Number(((factoringBefore.monto_neto * factoringValidated.porcentaje_adelanto) / 100).toFixed(2));
  camposAdicionales.monto_garantia = Number((factoringBefore.monto_neto - camposAdicionales.monto_adelanto).toFixed(2));
  camposAdicionales.monto_costo_financiamiento_estimado = Number((camposAdicionales.monto_adelanto * (camposAdicionales.tnd / 100) * camposAdicionales.dias_pago_estimado).toFixed(2));
  camposAdicionales.monto_comision_operacion = Number((camposAdicionales.montoComisionOperacionPorFactura * factoringBefore.cantidad_facturas).toFixed(2));
  camposAdicionales.monto_costo_estudio = camposAdicionales.montoCostoEstudioPorAceptante;
  camposAdicionales.monto_comision_uso_sitio_estimado = Math.max(
    camposAdicionales.monto_adelanto * camposAdicionales.cantidadMeses * (camposAdicionales.porcentajeComisionUsoSitio / 100),
    camposAdicionales.minimoComisionUsoSitio
  );

  camposAdicionales.monto_comision_gestion = camposAdicionales.monto_adelanto * (camposAdicionales.porcentajeComisionGestion / 100);
  camposAdicionales.monto_comision_interbancaria = factoringBefore.cuentabancaria_cuenta_bancarium._idbanco == 1 ? 0 : camposAdicionales.montoComisionInterbancariaInmediataBCP;
  camposAdicionales.monto_costo_cavali = camposAdicionales.montoCostoCAVALI * factoringBefore.cantidad_facturas;

  camposAdicionales.monto_comision_factor =
    camposAdicionales.monto_comision_operacion +
    camposAdicionales.monto_costo_estudio +
    camposAdicionales.monto_comision_uso_sitio_estimado +
    camposAdicionales.monto_comision_gestion +
    camposAdicionales.monto_comision_interbancaria +
    camposAdicionales.monto_costo_cavali;

  camposAdicionales.monto_igv = Number((camposAdicionales.monto_comision_factor * (camposAdicionales.porcentajeIGV / 100)).toFixed(2));

  camposAdicionales.monto_costo_factoring = camposAdicionales.monto_comision_factor + camposAdicionales.monto_costo_financiamiento_estimado;
  camposAdicionales.monto_desembolso = camposAdicionales.monto_adelanto - camposAdicionales.monto_costo_factoring - camposAdicionales.monto_igv;

  camposAdicionales.porcentaje_desembolso = (camposAdicionales.monto_desembolso / camposAdicionales.monto_adelanto) * 100;
  camposAdicionales.porcentaje_comision_factor = (camposAdicionales.monto_comision_factor / camposAdicionales.monto_adelanto) * 100;
  camposAdicionales.porcentaje_costo_factoring = (camposAdicionales.monto_costo_factoring / camposAdicionales.monto_adelanto) * 100;

  camposAdicionales.monto_dia_interes = (camposAdicionales.tnd / 100) * camposAdicionales.monto_adelanto;
  camposAdicionales.monto_dia_mora = (camposAdicionales.tnd_mora / 100) * camposAdicionales.monto_adelanto;
  camposAdicionales.dias_cobertura_garantia = camposAdicionales.monto_garantia / (camposAdicionales.monto_dia_interes + camposAdicionales.monto_dia_mora);

  camposAdicionales.tcnm = (camposAdicionales.monto_costo_factoring / camposAdicionales.monto_adelanto / camposAdicionales.dias_pago_estimado) * 30 * 100;
  camposAdicionales.tcna = camposAdicionales.tcnm * 12;
  camposAdicionales.tcnd = camposAdicionales.tcnm / 30;
  console.log("camposAdicionales: ", camposAdicionales);

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);

  const resultUpdate = await factoringDao.updateFactoring(req, { ...camposFk, ...camposAdicionales, ...factoringValidated, ...camposAuditoria });
  if (resultUpdate[0] === 0) {
    throw new ClientError("Factoring no existe", 404);
  }
  const factoringUpdated = await factoringDao.getFactoringByFactoringid(req, id);
  if (!factoringUpdated) {
    throw new ClientError("Factoring no existe", 404);
  }
  //console.debug("factoringUpdated: ", factoringUpdated.dataValues);
  response(res, 200, factoringUpdated);
};

export const deleteFactoring = async (req, res) => {
  const { id } = req.params;
  const factoringSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringValidated = factoringSchema.validateSync({ factoringid: id }, { abortEarly: false, stripUnknown: true });
  console.debug("factoringValidated:", factoringValidated);

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);
  camposAuditoria.estado = 2;

  const result = await factoringDao.deleteFactoring(req, { ...factoringValidated, ...camposAuditoria });
  if (result[0] === 0) {
    throw new ClientError("Factoring no existe", 404);
  }
  const factoring_actualizada = await factoringDao.getFactoringByFactoringid(req, id);
  if (factoring_actualizada.length === 0) {
    throw new ClientError("Factoring no existe", 404);
  }
  console.debug("factoringDeleted:", factoring_actualizada[0].dataValues);
  response(res, 204, factoring_actualizada[0]);
};

export const updateFactoring = async (req, res) => {
  response(res, 200, {});
};
