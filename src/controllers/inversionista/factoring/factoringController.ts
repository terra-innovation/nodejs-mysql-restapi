import { sequelizeFT } from "#src/config/bd/sequelize_db_factoring.js";
import * as cuentabancariaDao from "#src/daos/cuentabancariaDao.js";
import * as empresaDao from "#src/daos/empresaDao.js";
import * as personaDao from "#src/daos/personaDao.js";
import * as factoringDao from "#src/daos/factoringDao.js";
import * as factoringfacturaDao from "#src/daos/factoringfacturaDao.js";
import * as factoringhistorialestadoDao from "#src/daos/factoringhistorialestadoDao.js";
import * as facturaDao from "#src/daos/facturaDao.js";
import * as contactoDao from "#src/daos/contactoDao.js";
import * as colaboradorDao from "#src/daos/colaboradorDao.js";
import * as monedaDao from "#src/daos/monedaDao.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import logger, { line, log } from "#src/utils/logger.js";
import { safeRollback } from "#src/utils/transactionUtils.js";

import * as luxon from "luxon";
import { Sequelize, Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

export const getFactorings = async (req, res) => {
  log.debug(line(), "controller::getFactorings");
  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estados = [1];
    const _idusuario_session = req.session_user.usuario._idusuario;
    const _idfactoringestados = [5];
    const factorings = await factoringDao.getFactoringsOportunidades(transaction, _idfactoringestados, filter_estados);
    await transaction.commit();
    response(res, 201, factorings);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getFactoringMaster = async (req, res) => {
  log.debug(line(), "controller::getFactoringsMaster");
  const filter_estados = [1];

  const transaction = await sequelizeFT.transaction();
  try {
    await transaction.commit();
    response(res, 201, {});
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};
