import * as personapepindirectoDao from "../../daos/personapepindirectoDao.js";
import * as empresaDao from "../../daos/empresaDao.js";
import * as personaDao from "../../daos/personaDao.js";
import * as bancoDao from "../../daos/bancoDao.js";
import * as cuentatipoDao from "../../daos/cuentatipoDao.js";
import * as monedaDao from "../../daos/monedaDao.js";
import * as pepvinculoDao from "../../daos/pepvinculoDao.js";
import { response } from "../../utils/CustomResponseOk.js";
import { ClientError } from "../../utils/CustomErrors.js";
import * as jsonUtils from "../../utils/jsonUtils.js";
import logger, { line } from "../../utils/logger.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize } from "sequelize";

export const getPersonapepindirectoMaster = async (req, res) => {
  const filter_estados = [1];
  const session_idusuario = req.session_user.usuario._idusuario;
  //logger.info(line(),req.session_user.usuario.rol_rols);
  const roles = [2]; // Administrador
  const rolesUsuario = req.session_user.usuario.rol_rols.map((role) => role._idrol);
  const tieneRol = roles.some((rol) => rolesUsuario.includes(rol));

  const empresas = await empresaDao.getEmpresasByIdusuario(req, session_idusuario, filter_estados);

  const bancos = await bancoDao.getBancos(req, filter_estados);
  const monedas = await monedaDao.getMonedas(req, filter_estados);
  const cuentatipos = await cuentatipoDao.getCuentatipos(req, filter_estados);

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
  response(res, 201, cuentasbancariasMasterFiltered);
};

export const updatePersonapepindirectoOnlyAlias = async (req, res) => {
  const { id } = req.params;
  const personapepindirectoUpdateSchema = yup
    .object()
    .shape({
      personapepindirectoid: yup.string().trim().required().min(36).max(36),
      alias: yup.string().required().max(50),
    })
    .required();
  const personapepindirectoValidated = personapepindirectoUpdateSchema.validateSync({ personapepindirectoid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "personapepindirectoValidated:", personapepindirectoValidated);

  var camposAdicionales = {};
  camposAdicionales.personapepindirectoid = id;

  var camposAuditoria = {};
  camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
  camposAuditoria.fechamod = Sequelize.fn("now", 3);

  const result = await personapepindirectoDao.updatePersonapepindirecto(req, {
    ...camposAdicionales,
    ...personapepindirectoValidated,
    ...camposAuditoria,
  });
  if (result[0] === 0) {
    throw new ClientError("Personapepindirecto no existe", 404);
  }
  logger.info(line(), id);
  const personapepindirectoUpdated = await personapepindirectoDao.getPersonapepindirectoByPersonapepindirectoid(req, id);
  if (!personapepindirectoUpdated) {
    throw new ClientError("Personapepindirecto no existe", 404);
  }

  var personapepindirectoObfuscated = jsonUtils.ofuscarAtributos(personapepindirectoUpdated, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);
  //logger.info(line(),empresaObfuscated);

  var personapepindirectoFiltered = jsonUtils.removeAttributesPrivates(personapepindirectoObfuscated);
  response(res, 200, personapepindirectoFiltered);
};

export const getPersonapepindirectos = async (req, res) => {
  //logger.info(line(),req.session_user.usuario._idusuario);

  const session_idusuario = req.session_user.usuario._idusuario;
  const filter_estado = [1];
  const cuentasbancarias = await personapepindirectoDao.getCuentasbancariasByIdusuario(req, session_idusuario, filter_estado);
  var cuentasbancariasJson = jsonUtils.sequelizeToJSON(cuentasbancarias);
  //logger.info(line(),empresaObfuscated);

  var cuentasbancariasFiltered = jsonUtils.removeAttributes(cuentasbancariasJson, ["score"]);
  cuentasbancariasFiltered = jsonUtils.removeAttributesPrivates(cuentasbancariasFiltered);
  response(res, 201, cuentasbancariasFiltered);
};

export const createPersonapepindirecto = async (req, res) => {
  const session_idusuario = req.session_user.usuario._idusuario;
  const filter_estado = [1, 2];
  const personapepindirectoCreateSchema = yup.array().of(
    yup
      .object()
      .shape({
        pepvinculoid: yup.string().min(36).max(36).trim().required(),
        identificacionpep: yup.string().trim().required().min(8).max(8),
        nombrescompletospep: yup.string().trim().required().max(200),
        rucentidad: yup.string().trim().required().min(11).max(11),
        nombreentidad: yup.string().trim().required().max(200),
        cargoentidad: yup.string().trim().required().max(200),
        desde: yup.string().trim().required().min(10).max(10),
        hasta: yup.string().max(20),
        actualmente: yup.string().required().max(5),
      })
      .required()
  );
  let personapepindirectoValidated = personapepindirectoCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });

  let persona = await personaDao.getPersonaByIdusuario(req, session_idusuario);
  if (!persona) {
    throw new ClientError("Persona no existe", 404);
  }

  for (const [index, item] of personapepindirectoValidated.entries()) {
    let pepvinculo = await pepvinculoDao.findPepvinculoPk(req, item.pepvinculoid);
    if (!pepvinculo) {
      throw new ClientError("PEP vínculo no existe", 404);
    }
  }

  // Campos adicionales
  personapepindirectoValidated.forEach((item) => {
    item.personapepindirectoid = uuidv4();
    item._idpersona = persona._idpersona;
  });

  // Campos de auditoría
  personapepindirectoValidated.forEach((item) => {
    item.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
    item.fechacrea = Sequelize.fn("now", 3);
    item.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    item.fechamod = Sequelize.fn("now", 3);
    item.estado = 1;
  });

  for (const [index, item] of personapepindirectoValidated.entries()) {
    const personapepindirectoCreated = await personapepindirectoDao.insertPersonaPepIndirecto(req, item);
  }

  response(res, 201, {});
};
