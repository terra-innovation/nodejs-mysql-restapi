import * as usuarioservicioDao from "../../daos/usuarioservicioDao.js";
import * as documentotipoDao from "../../daos/documentotipoDao.js";
import * as paisDao from "../../daos/paisDao.js";
import * as provinciaDao from "../../daos/provinciaDao.js";
import * as distritoDao from "../../daos/distritoDao.js";
import * as bancoDao from "../../daos/bancoDao.js";
import * as cuentatipoDao from "../../daos/cuentatipoDao.js";
import * as monedaDao from "../../daos/monedaDao.js";
import * as generoDao from "../../daos/generoDao.js";
import * as usuarioDao from "../../daos/usuarioDao.js";
import { response } from "../../utils/CustomResponseOk.js";
import { ClientError } from "../../utils/CustomErrors.js";
import * as jsonUtils from "../../utils/jsonUtils.js";
import logger, { line } from "../../utils/logger.js";
import * as storageUtils from "../../utils/storageUtils.js";
import * as validacionesYup from "../../utils/validacionesYup.js";
import * as fs from "fs";
import path from "path";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";

export const getUsuarioservicioMaster = async (req, res) => {
  const session_idusuario = req.session_user?.usuario?._idusuario;
  const { id } = req.params;
  const usuarioservicioSchema = yup
    .object()
    .shape({
      usuarioservicioid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const usuarioservicioValidated = usuarioservicioSchema.validateSync({ usuarioservicioid: id }, { abortEarly: false, stripUnknown: true });

  const filter_estados = [1];

  const usuarioservicio = await usuarioservicioDao.getUsuarioservicioByUsuarioservicioid(req, usuarioservicioValidated.usuarioservicioid);
  const paises = await paisDao.getPaises(req, filter_estados);
  const distritos = await distritoDao.getDistritos(req, filter_estados);
  const bancos = await bancoDao.getBancos(req, filter_estados);
  const monedas = await monedaDao.getMonedas(req, filter_estados);
  const cuentatipos = await cuentatipoDao.getCuentatipos(req, filter_estados);

  let usuarioservicioMaster = {};
  usuarioservicioMaster.usuarioservicio = usuarioservicio;
  usuarioservicioMaster.paises = paises;
  usuarioservicioMaster.distritos = distritos;
  usuarioservicioMaster.bancos = bancos;
  usuarioservicioMaster.monedas = monedas;
  usuarioservicioMaster.cuentatipos = cuentatipos;

  let usuarioservicioMasterJSON = jsonUtils.sequelizeToJSON(usuarioservicioMaster);
  //jsonUtils.prettyPrint(usuarioservicioMasterJSON);
  let usuarioservicioMasterObfuscated = jsonUtils.ofuscarAtributosDefault(usuarioservicioMasterJSON);
  //jsonUtils.prettyPrint(usuarioservicioMasterObfuscated);
  let usuarioservicioMasterFiltered = jsonUtils.removeAttributesPrivates(usuarioservicioMasterObfuscated);
  //jsonUtils.prettyPrint(usuarioservicioMaster);
  response(res, 201, usuarioservicioMasterFiltered);
};

export const getUsuarioservicios = async (req, res) => {
  //logger.info(line(),req.session_user.usuario._idusuario);

  const session_idusuario = req.session_user.usuario._idusuario;
  const filter_estado = [1];
  const usuarioservicios = await usuarioservicioDao.getUsuarioserviciosByIdusuario(req, session_idusuario, filter_estado);
  var usuarioserviciosJson = jsonUtils.sequelizeToJSON(usuarioservicios);
  //logger.info(line(),empresaObfuscated);

  var usuarioserviciosFiltered = jsonUtils.removeAttributes(usuarioserviciosJson, ["score"]);
  usuarioserviciosFiltered = jsonUtils.removeAttributesPrivates(usuarioserviciosFiltered);
  response(res, 201, usuarioserviciosFiltered);
};
