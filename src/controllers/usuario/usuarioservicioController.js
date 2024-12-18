import * as usuarioservicioDao from "../../daos/usuarioservicioDao.js";
import * as documentotipoDao from "../../daos/documentotipoDao.js";
import * as paisDao from "../../daos/paisDao.js";
import * as provinciaDao from "../../daos/provinciaDao.js";
import * as distritoDao from "../../daos/distritoDao.js";
import * as generoDao from "../../daos/generoDao.js";
import * as usuarioDao from "../../daos/usuarioDao.js";
import * as archivoDao from "../../daos/archivoDao.js";
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
