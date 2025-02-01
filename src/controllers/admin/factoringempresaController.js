import * as empresaDao from "../../daos/empresaDao.js";
import * as documentotipoDao from "../../daos/documentotipoDao.js";
import * as paisDao from "../../daos/paisDao.js";
import * as provinciaDao from "../../daos/provinciaDao.js";
import * as distritoDao from "../../daos/distritoDao.js";
import * as generoDao from "../../daos/generoDao.js";
import * as servicioempresaDao from "../../daos/servicioempresaDao.js";
import * as usuarioDao from "../../daos/usuarioDao.js";
import * as archivoDao from "../../daos/archivoDao.js";

import { response } from "../../utils/CustomResponseOk.js";
import { ClientError } from "../../utils/CustomErrors.js";
import * as jsonUtils from "../../utils/jsonUtils.js";
import logger, { line } from "../../utils/logger.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";

export const getFactoringempresasByVerificacion = async (req, res) => {
  //logger.info(line(),req.session_user.usuario._idusuario);

  const filter_estadologico = [1, 2];
  const filter_idservicio = [1];
  const filter_idarchivotipos = [4, 5, 6, 7];
  const factoringempresas = await servicioempresaDao.getFactoringempresasByVerificacion(req, filter_estadologico, filter_idservicio, filter_idarchivotipos);
  var factoringempresasJson = jsonUtils.sequelizeToJSON(factoringempresas);
  //logger.info(line(),factoringempresaObfuscated);

  //var factoringempresasFiltered = jsonUtils.removeAttributes(factoringempresasJson, ["score"]);
  //factoringempresasFiltered = jsonUtils.removeAttributesPrivates(factoringempresasFiltered);
  response(res, 201, factoringempresasJson);
};

export const getFactoringempresaMaster = async (req, res) => {
  const session_idusuario = req.session_user?.usuario?._idusuario;
  const filter_estados = [1];
  const paises = await paisDao.getPaises(req, filter_estados);
  const distritos = await distritoDao.getDistritos(req, filter_estados);
  const documentotipos = await documentotipoDao.getDocumentotipos(req, filter_estados);
  const generos = await generoDao.getGeneros(req, filter_estados);

  let factoringempresaMaster = {};
  factoringempresaMaster.paises = paises;
  factoringempresaMaster.distritos = distritos;
  factoringempresaMaster.documentotipos = documentotipos;
  factoringempresaMaster.generos = generos;

  let factoringempresaMasterJSON = jsonUtils.sequelizeToJSON(factoringempresaMaster);
  //jsonUtils.prettyPrint(factoringempresaMasterJSON);
  let factoringempresaMasterObfuscated = jsonUtils.ofuscarAtributosDefault(factoringempresaMasterJSON);
  //jsonUtils.prettyPrint(factoringempresaMasterObfuscated);
  let factoringempresaMasterFiltered = jsonUtils.removeAttributesPrivates(factoringempresaMasterObfuscated);
  //jsonUtils.prettyPrint(factoringempresaMaster);
  response(res, 201, factoringempresaMasterFiltered);
};
