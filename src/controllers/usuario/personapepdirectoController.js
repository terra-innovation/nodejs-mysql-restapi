import * as personapepdirectoDao from "../../daos/personapepdirectoDao.js";
import * as empresaDao from "../../daos/empresaDao.js";
import * as personaDao from "../../daos/personaDao.js";
import * as bancoDao from "../../daos/bancoDao.js";
import * as cuentatipoDao from "../../daos/cuentatipoDao.js";
import * as monedaDao from "../../daos/monedaDao.js";
import { response } from "../../utils/CustomResponseOk.js";
import { ClientError } from "../../utils/CustomErrors.js";
import * as jsonUtils from "../../utils/jsonUtils.js";
import logger, { line } from "../../utils/logger.js";
import { safeRollback } from "../../utils/transactionUtils.js";
import { sequelizeFT } from "../../config/bd/sequelize_db_factoring.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";

export const getPersonapepdirectoMaster = async (req, res) => {
  logger.debug(line(), "controller::getPersonapepdirectoMaster");
  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estados = [1];
    const session_idusuario = req.session_user.usuario._idusuario;
    //logger.info(line(),req.session_user.usuario.rol_rols);
    const roles = [2]; // Administrador
    const rolesUsuario = req.session_user.usuario.rol_rols.map((role) => role._idrol);
    const tieneRol = roles.some((rol) => rolesUsuario.includes(rol));

    const empresas = await empresaDao.getEmpresasByIdusuario(transaction, session_idusuario, filter_estados);

    const bancos = await bancoDao.getBancos(transaction, filter_estados);
    const monedas = await monedaDao.getMonedas(transaction, filter_estados);
    const cuentatipos = await cuentatipoDao.getCuentatipos(transaction, filter_estados);

    var cuentasbancariasMaster = {};
    cuentasbancariasMaster.empresas = empresas;
    cuentasbancariasMaster.bancos = bancos;
    cuentasbancariasMaster.monedas = monedas;
    cuentasbancariasMaster.cuentatipos = cuentatipos;

    var cuentasbancariasMasterJSON = jsonUtils.sequelizeToJSON(cuentasbancariasMaster);
    //jsonUtils.prettyPrint(cuentasbancariasMasterJSON);
    var cuentasbancariasMasterObfuscated = cuentasbancariasMasterJSON;
    //jsonUtils.prettyPrint(cuentasbancariasMasterObfuscated);
    var cuentasbancariasMasterFiltered = jsonUtils.removeAttributesPrivates(cuentasbancariasMasterObfuscated);
    //jsonUtils.prettyPrint(cuentasbancariasMaster);
    await transaction.commit();
    response(res, 201, cuentasbancariasMasterFiltered);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const updatePersonapepdirectoOnlyAlias = async (req, res) => {
  logger.debug(line(), "controller::updatePersonapepdirectoOnlyAlias");
  const transaction = await sequelizeFT.transaction();
  try {
    const { id } = req.params;
    const personapepdirectoUpdateSchema = yup
      .object()
      .shape({
        personapepdirectoid: yup.string().trim().required().min(36).max(36),
        alias: yup.string().required().max(50),
      })
      .required();
    const personapepdirectoValidated = personapepdirectoUpdateSchema.validateSync({ personapepdirectoid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
    logger.debug(line(), "personapepdirectoValidated:", personapepdirectoValidated);

    var camposAdicionales = {};
    camposAdicionales.personapepdirectoid = id;

    var camposAuditoria = {};
    camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposAuditoria.fechamod = Sequelize.fn("now", 3);

    const result = await personapepdirectoDao.updatePersonapepdirecto(transaction, {
      ...camposAdicionales,
      ...personapepdirectoValidated,
      ...camposAuditoria,
    });
    if (result[0] === 0) {
      throw new ClientError("Personapepdirecto no existe", 404);
    }
    logger.info(line(), id);
    const personapepdirectoUpdated = await personapepdirectoDao.getPersonapepdirectoByPersonapepdirectoid(transaction, id);
    if (!personapepdirectoUpdated) {
      throw new ClientError("Personapepdirecto no existe", 404);
    }

    var personapepdirectoObfuscated = jsonUtils.ofuscarAtributos(personapepdirectoUpdated, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
    //logger.info(line(),empresaObfuscated);

    var personapepdirectoFiltered = jsonUtils.removeAttributesPrivates(personapepdirectoObfuscated);
    await transaction.commit();
    response(res, 200, personapepdirectoFiltered);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getPersonapepdirectos = async (req, res) => {
  logger.debug(line(), "controller::getPersonapepdirectos");
  const transaction = await sequelizeFT.transaction();
  try {
    //logger.info(line(),req.session_user.usuario._idusuario);

    const session_idusuario = req.session_user.usuario._idusuario;
    const filter_estado = [1];
    const cuentasbancarias = await personapepdirectoDao.getCuentasbancariasByIdusuario(transaction, session_idusuario, filter_estado);
    var cuentasbancariasJson = jsonUtils.sequelizeToJSON(cuentasbancarias);
    //logger.info(line(),empresaObfuscated);

    var cuentasbancariasFiltered = jsonUtils.removeAttributes(cuentasbancariasJson, ["score"]);
    cuentasbancariasFiltered = jsonUtils.removeAttributesPrivates(cuentasbancariasFiltered);
    await transaction.commit();
    response(res, 201, cuentasbancariasFiltered);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const createPersonapepdirecto = async (req, res) => {
  logger.debug(line(), "controller::createPersonapepdirecto");
  const transaction = await sequelizeFT.transaction();
  try {
    const session_idusuario = req.session_user.usuario._idusuario;
    const filter_estado = [1, 2];
    const personapepdirectoCreateSchema = yup.array().of(
      yup
        .object()
        .shape({
          rucentidad: yup.string().trim().required().min(11).max(11),
          nombreentidad: yup.string().trim().required().max(200),
          cargoentidad: yup.string().trim().required().max(200),
          desde: yup.string().trim().required().min(10).max(10),
          hasta: yup.string().max(20),
          actualmente: yup.string().required().max(5),
        })
        .required()
    );
    let personapepdirectoValidated = personapepdirectoCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });

    let persona = await personaDao.getPersonaByIdusuario(transaction, session_idusuario);
    if (!persona) {
      throw new ClientError("Persona no existe", 404);
    }

    // Campos adicionales
    personapepdirectoValidated.forEach((item) => {
      item.personapepdirectoid = uuidv4();
      item._idpersona = persona._idpersona;
    });

    // Campos de auditoría
    personapepdirectoValidated.forEach((item) => {
      item.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
      item.fechacrea = Sequelize.fn("now", 3);
      item.idusuariomod = req.session_user.usuario._idusuario ?? 1;
      item.fechamod = Sequelize.fn("now", 3);
      item.estado = 1;
    });

    personapepdirectoValidated.forEach(async (item) => {
      const personapepdirectoCreated = await personapepdirectoDao.insertPersonaPepDirecto(transaction, item);
    });

    await transaction.commit();
    response(res, 201, {});
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};
