import { sequelizeFT } from "../../../../config/bd/sequelize_db_factoring.js";
import * as cuentabancariaDao from "../../../../daos/cuentabancariaDao.js";
import * as empresaDao from "../../../../daos/empresaDao.js";
import * as personaDao from "../../../../daos/personaDao.js";
import * as factoringDao from "../../../../daos/factoringDao.js";
import * as factoringfacturaDao from "../../../../daos/factoringfacturaDao.js";
import * as facturaDao from "../../../../daos/facturaDao.js";
import * as contactoDao from "../../../../daos/contactoDao.js";
import * as colaboradorDao from "../../../../daos/colaboradorDao.js";
import * as monedaDao from "../../../../daos/monedaDao.js";
import { ClientError } from "../../../../utils/CustomErrors.js";
import { response } from "../../../../utils/CustomResponseOk.js";
import logger, { line } from "../../../../utils/logger.js";

import * as luxon from "luxon";
import { Sequelize } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

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
