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
