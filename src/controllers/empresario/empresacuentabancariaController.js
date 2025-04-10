import { sequelizeFT } from "#src/config/bd/sequelize_db_factoring.js";
import * as archivocuentabancariaDao from "#src/daos/archivocuentabancariaDao.js";
import * as archivoDao from "#src/daos/archivoDao.js";
import * as bancoDao from "#src/daos/bancoDao.js";
import * as cuentabancariaDao from "#src/daos/cuentabancariaDao.js";
import * as cuentatipoDao from "#src/daos/cuentatipoDao.js";
import * as empresacuentabancariaDao from "#src/daos/empresacuentabancariaDao.js";
import * as empresaDao from "#src/daos/empresaDao.js";
import * as monedaDao from "#src/daos/monedaDao.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import logger, { line } from "#src/utils/logger.js";
import { safeRollback } from "#src/utils/transactionUtils.js";
import * as validacionesYup from "#src/utils/validacionesYup.js";

import * as fs from "fs";
import path from "path";
import { Sequelize } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import * as storageUtils from "#src/utils/storageUtils.js";

export const createEmpresacuentabancaria = async (req, res) => {
  logger.debug(line(), "controller::createEmpresacuentabancaria");
  const session_idusuario = req.session_user.usuario._idusuario;
  const filter_estado = [1, 2];
  const empresacuentabancariaCreateSchema = yup
    .object()
    .shape({
      encabezado_cuenta_bancaria: yup
        .mixed()
        .concat(validacionesYup.fileRequeridValidation())
        .concat(validacionesYup.fileSizeValidation(5 * 1024 * 1024))
        .concat(validacionesYup.fileTypeValidation(["image/png", "image/jpeg", "image/jpg", "application/pdf"])),
      empresaid: yup.string().trim().required().min(36).max(36),
      bancoid: yup.string().trim().required().min(36).max(36),
      cuentatipoid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
      numero: yup.string().required().max(20),
      cci: yup.string().required().max(20),
      alias: yup.string().required().max(50),
    })
    .required();
  var empresacuentabancariaValidated = empresacuentabancariaCreateSchema.validateSync({ ...req.files, ...req.body }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "empresacuentabancariaValidated:", empresacuentabancariaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    var empresa = await empresaDao.getEmpresaByEmpresaid(transaction, empresacuentabancariaValidated.empresaid);
    if (!empresa) {
      logger.warn(line(), "Empresa no existe: [" + empresacuentabancariaValidated.empresaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var banco = await bancoDao.getBancoByBancoid(transaction, empresacuentabancariaValidated.bancoid);
    if (!banco) {
      logger.warn(line(), "Banco no existe: [" + empresacuentabancariaValidated.bancoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var cuentatipo = await cuentatipoDao.getCuentatipoByCuentatipoid(transaction, empresacuentabancariaValidated.cuentatipoid);
    if (!cuentatipo) {
      logger.warn(line(), "Cuenta tipo no existe: [" + empresacuentabancariaValidated.cuentatipoid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var moneda = await monedaDao.getMonedaByMonedaid(transaction, empresacuentabancariaValidated.monedaid);
    if (!moneda) {
      logger.warn(line(), "Moneda no existe: [" + empresacuentabancariaValidated.monedaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var empresa_por_idusuario = await empresaDao.getEmpresaByIdusuarioAndEmpresaid(transaction, session_idusuario, empresacuentabancariaValidated.empresaid, filter_estado);
    if (!empresa_por_idusuario) {
      logger.warn(line(), "Empresa no asociada al usuario: [" + session_idusuario + ", " + empresacuentabancariaValidated.monedaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    var cuentasbancarias_por_numero = await cuentabancariaDao.getCuentasbancariasByIdbancoAndNumero(transaction, banco._idbanco, empresacuentabancariaValidated.numero, filter_estado);
    if (cuentasbancarias_por_numero && cuentasbancarias_por_numero.length > 0) {
      logger.warn(line(), "El número de cuenta [" + empresacuentabancariaValidated.numero + "] se encuentra registrado. Ingrese un número de cuenta diferente.");
      throw new ClientError("El número de cuenta [" + empresacuentabancariaValidated.numero + "] se encuentra registrado. Ingrese un número de cuenta diferente.", 404);
    }

    var cuentasbancarias_por_alias = await empresacuentabancariaDao.getEmpresacuentabancariasByIdempresaAndAlias(transaction, empresa_por_idusuario._idempresa, empresacuentabancariaValidated.alias, filter_estado);
    if (cuentasbancarias_por_alias && cuentasbancarias_por_alias.length > 0) {
      logger.warn(line(), "El alias [" + empresacuentabancariaValidated.alias + "] se encuentra registrado. Ingrese un alias diferente.");
      throw new ClientError("El alias [" + empresacuentabancariaValidated.alias + "] se encuentra registrado. Ingrese un alias diferente.", 404);
    }

    var camposCuentaBancariaFk = {};
    camposCuentaBancariaFk._idempresa = empresa._idempresa;
    camposCuentaBancariaFk._idbanco = banco._idbanco;
    camposCuentaBancariaFk._idcuentatipo = cuentatipo._idcuentatipo;
    camposCuentaBancariaFk._idmoneda = moneda._idmoneda;
    camposCuentaBancariaFk._idcuentabancariaestado = 1; // Por defecto

    var camposCuentaBancariaAdicionales = {};
    camposCuentaBancariaAdicionales.cuentabancariaid = uuidv4();
    camposCuentaBancariaAdicionales.code = uuidv4().split("-")[0];

    var camposCuentaBancariaAuditoria = {};
    camposCuentaBancariaAuditoria.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
    camposCuentaBancariaAuditoria.fechacrea = Sequelize.fn("now", 3);
    camposCuentaBancariaAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposCuentaBancariaAuditoria.fechamod = Sequelize.fn("now", 3);
    camposCuentaBancariaAuditoria.estado = 1;

    const cuentabancariaCreated = await cuentabancariaDao.insertCuentabancaria(transaction, {
      ...camposCuentaBancariaFk,
      ...camposCuentaBancariaAdicionales,
      ...empresacuentabancariaValidated,
      ...camposCuentaBancariaAuditoria,
    });
    logger.debug(line(), "cuentabancariaCreated:", cuentabancariaCreated);

    const encabezadocuentabancariaCreated = await crearArchivoEncabezadoCuentaBancaria(req, transaction, empresacuentabancariaValidated, cuentabancariaCreated);
    logger.debug(line(), "encabezadocuentabancariaCreated:", encabezadocuentabancariaCreated);

    var camposEmpresaCuentaBancariaCreate = {};
    camposEmpresaCuentaBancariaCreate._idempresa = empresa_por_idusuario._idempresa;
    camposEmpresaCuentaBancariaCreate._idcuentabancaria = cuentabancariaCreated._idcuentabancaria;
    camposEmpresaCuentaBancariaCreate.empresacuentabancariaid = uuidv4();
    camposEmpresaCuentaBancariaCreate.code = uuidv4().split("-")[0];
    camposEmpresaCuentaBancariaCreate.idusuariocrea = req.session_user.usuario._idusuario ?? 1;
    camposEmpresaCuentaBancariaCreate.fechacrea = Sequelize.fn("now", 3);
    camposEmpresaCuentaBancariaCreate.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposEmpresaCuentaBancariaCreate.fechamod = Sequelize.fn("now", 3);
    camposEmpresaCuentaBancariaCreate.estado = 1;

    const empresacuentabancariaCreated = await empresacuentabancariaDao.insertEmpresacuentabancaria(transaction, camposEmpresaCuentaBancariaCreate);
    logger.debug(line(), "empresacuentabancariaCreated:", empresacuentabancariaCreated);

    const empresacuentabancariaFiltered = jsonUtils.removeAttributesPrivates(camposEmpresaCuentaBancariaCreate);

    await transaction.commit();
    response(res, 201, { ...empresacuentabancariaFiltered });
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getEmpresacuentabancariaMaster = async (req, res) => {
  logger.debug(line(), "controller::getEmpresacuentabancariaMaster");
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

export const updateEmpresacuentabancariaOnlyAlias = async (req, res) => {
  logger.debug(line(), "controller::updateEmpresacuentabancariaOnlyAlias");
  const { id } = req.params;
  const empresacuentabancariaUpdateSchema = yup
    .object()
    .shape({
      empresacuentabancariaid: yup.string().trim().required().min(36).max(36),
      alias: yup.string().required().max(50),
    })
    .required();
  const empresacuentabancariaValidated = empresacuentabancariaUpdateSchema.validateSync({ empresacuentabancariaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  logger.debug(line(), "empresacuentabancariaValidated:", empresacuentabancariaValidated);

  const transaction = await sequelizeFT.transaction();
  try {
    const filter_estado = [1, 2];
    const _idusuario_session = req.session_user.usuario._idusuario;
    const empresacuentabancaria = await empresacuentabancariaDao.getEmpresacuentabancariaByEmpresacuentabancariaid(transaction, empresacuentabancariaValidated.empresacuentabancariaid);
    if (!empresacuentabancaria) {
      logger.warn(line(), "Empresa cuenta bancaria no existe: [" + empresacuentabancariaValidated.empresacuentabancariaid + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    const empresacuentabancariaAllowed = await empresacuentabancariaDao.getEmpresacuentabancariaByIdempresaAndIdusuario(transaction, empresacuentabancaria._idempresa, _idusuario_session, filter_estado);
    if (!empresacuentabancariaAllowed) {
      logger.warn(line(), "Empresa no asociada al usuario: [" + empresacuentabancaria._idempresa + ", " + _idusuario_session + "]");
      throw new ClientError("Datos no válidos", 404);
    }

    const cuentabancaria = await cuentabancariaDao.getCuentabancariaByIdcuentabancaria(transaction, empresacuentabancaria._idcuentabancaria);

    var camposCuentaBancariaAdicionales = {};
    camposCuentaBancariaAdicionales.cuentabancariaid = cuentabancaria.cuentabancariaid;

    var camposCuentaBancariaAuditoria = {};
    camposCuentaBancariaAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
    camposCuentaBancariaAuditoria.fechamod = Sequelize.fn("now", 3);

    const cuentabancariaUpdated = await cuentabancariaDao.updateCuentabancaria(transaction, {
      ...camposCuentaBancariaAdicionales,
      ...empresacuentabancariaValidated,
      ...camposCuentaBancariaAuditoria,
    });
    logger.debug(line(), "cuentabancariaUpdated", cuentabancariaUpdated);

    await transaction.commit();
    response(res, 200, {});
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

export const getEmpresacuentabancarias = async (req, res) => {
  logger.debug(line(), "controller::getEmpresacuentabancarias");
  const transaction = await sequelizeFT.transaction();
  try {
    //logger.info(line(),req.session_user.usuario._idusuario);

    const session_idusuario = req.session_user.usuario._idusuario;
    const filter_estado = [1];
    const empresacuentabancarias = await empresacuentabancariaDao.getEmpresacuentabancariasByIdusuario(transaction, session_idusuario, filter_estado);
    var empresacuentabancariasJson = jsonUtils.sequelizeToJSON(empresacuentabancarias);
    //logger.info(line(),empresaObfuscated);

    var empresacuentabancariasFiltered = jsonUtils.removeAttributes(empresacuentabancariasJson, ["score"]);
    empresacuentabancariasFiltered = jsonUtils.removeAttributesPrivates(empresacuentabancariasFiltered);
    await transaction.commit();
    response(res, 201, empresacuentabancariasFiltered);
  } catch (error) {
    await safeRollback(transaction);
    throw error;
  }
};

const crearArchivoEncabezadoCuentaBancaria = async (req, transaction, usuarioservicioValidated, cuentabancariaCreated) => {
  //Copiamos el archivo
  const { encabezado_cuenta_bancaria } = usuarioservicioValidated;
  const { anio_upload, mes_upload, dia_upload, filename, path: archivoOrigen } = encabezado_cuenta_bancaria[0];
  const carpetaDestino = path.join(anio_upload, mes_upload, dia_upload);
  const rutaDestino = path.join(storageUtils.STORAGE_PATH_SUCCESS, anio_upload, mes_upload, dia_upload, filename); // Crear la ruta completa del archivo de destino
  fs.mkdirSync(path.dirname(rutaDestino), { recursive: true }); // Crear directorio si no existe
  fs.copyFileSync(archivoOrigen, rutaDestino); // Copia el archivo

  const { codigo_archivo, originalname, size, mimetype, encoding, extension } = encabezado_cuenta_bancaria[0];

  let camposArchivoNuevo = {
    archivoid: uuidv4(),
    _idarchivotipo: 7,
    _idarchivoestado: 1,
    codigo: codigo_archivo,
    nombrereal: originalname,
    nombrealmacenamiento: filename,
    ruta: carpetaDestino,
    tamanio: size,
    mimetype: mimetype,
    encoding: encoding,
    extension: extension,
    observacion: "",
    fechavencimiento: null,
    idusuariocrea: req.session_user?.usuario?._idusuario ?? 1,
    fechacrea: Sequelize.fn("now", 3),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: Sequelize.fn("now", 3),
    estado: 1,
  };
  const archivoCreated = await archivoDao.insertArchivo(transaction, camposArchivoNuevo);

  await archivocuentabancariaDao.insertArchivoCuentaBancaria(transaction, {
    _idarchivo: archivoCreated._idarchivo,
    _idcuentabancaria: cuentabancariaCreated._idcuentabancaria,
    idusuariocrea: req.session_user?.usuario?._idusuario ?? 1,
    fechacrea: Sequelize.fn("now", 3),
    idusuariomod: req.session_user?.usuario?._idusuario ?? 1,
    fechamod: Sequelize.fn("now", 3),
    estado: 1,
  });

  fs.unlinkSync(archivoOrigen);

  return archivoCreated;
};
