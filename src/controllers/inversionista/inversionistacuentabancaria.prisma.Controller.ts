import type { Prisma } from "#src/models/prisma/ft_factoring/client";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";

import * as archivocuentabancariaDao from "#src/daos/archivocuentabancaria.prisma.Dao.js";
import * as archivoDao from "#src/daos/archivo.prisma.Dao.js";
import * as bancoDao from "#src/daos/banco.prisma.Dao.js";
import * as cuentabancariaDao from "#src/daos/cuentabancaria.prisma.Dao.js";
import * as cuentatipoDao from "#src/daos/cuentatipo.prisma.Dao.js";
import * as inversionistacuentabancariaDao from "#src/daos/inversionistacuentabancaria.prisma.Dao.js";
import * as inversionistaDao from "#src/daos/inversionista.prisma.Dao.js";
import * as personaDao from "#src/daos/persona.prisma.Dao.js";
import * as empresaDao from "#src/daos/empresa.prisma.Dao.js";
import * as monedaDao from "#src/daos/moneda.prisma.Dao.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

import * as validacionesYup from "#src/utils/validacionesYup.js";

import * as fs from "fs";
import path from "path";
import { Sequelize, Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import * as storageUtils from "#src/utils/storageUtils.js";

export const createInversionistacuentabancaria = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createInversionistacuentabancaria");
  const _idusuario_session = req.session_user.usuario._idusuario;
  const filter_estado = [1, 2];
  const inversionistacuentabancariaCreateSchema = yup
    .object()
    .shape({
      inversionistaid: yup.string().trim().required().min(36).max(36),
      bancoid: yup.string().trim().required().min(36).max(36),
      cuentatipoid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
      numero: yup.string().required().max(20),
      cci: yup.string().required().max(20),
      alias: yup.string().required().max(50),
    })
    .required();
  var inversionistacuentabancariaValidated = inversionistacuentabancariaCreateSchema.validateSync({ ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "inversionistacuentabancariaValidated:", inversionistacuentabancariaValidated);

  const inversionistacuentabancariaFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      var inversionista = await inversionistaDao.getInversionistaByInversionistaid(tx, inversionistacuentabancariaValidated.inversionistaid);
      if (!inversionista) {
        log.warn(line(), "Inversionista no existe: [" + inversionistacuentabancariaValidated.inversionistaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var banco = await bancoDao.getBancoByBancoid(tx, inversionistacuentabancariaValidated.bancoid);
      if (!banco) {
        log.warn(line(), "Banco no existe: [" + inversionistacuentabancariaValidated.bancoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var cuentatipo = await cuentatipoDao.getCuentatipoByCuentatipoid(tx, inversionistacuentabancariaValidated.cuentatipoid);
      if (!cuentatipo) {
        log.warn(line(), "Cuenta tipo no existe: [" + inversionistacuentabancariaValidated.cuentatipoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var moneda = await monedaDao.getMonedaByMonedaid(tx, inversionistacuentabancariaValidated.monedaid);
      if (!moneda) {
        log.warn(line(), "Moneda no existe: [" + inversionistacuentabancariaValidated.monedaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const inversionistacuentabancariaAllowed = await inversionistacuentabancariaDao.getInversionistacuentabancariaByIdinversionistaAndIdusuario(tx, inversionista.idinversionista, _idusuario_session, filter_estado);
      if (!inversionistacuentabancariaAllowed) {
        log.warn(line(), "Inversionista no asociado al usuario: [" + inversionista.idinversionista + ", " + _idusuario_session + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var cuentasbancarias_por_numero = await cuentabancariaDao.getCuentasbancariasByIdbancoAndNumero(tx, banco.idbanco, inversionistacuentabancariaValidated.numero, filter_estado);
      if (cuentasbancarias_por_numero && cuentasbancarias_por_numero.length > 0) {
        log.warn(line(), "El número de cuenta [" + inversionistacuentabancariaValidated.numero + "] se encuentra registrado. Ingrese un número de cuenta diferente.");
        throw new ClientError("El número de cuenta [" + inversionistacuentabancariaValidated.numero + "] se encuentra registrado. Ingrese un número de cuenta diferente.", 404);
      }

      var cuentasbancarias_por_alias = await inversionistacuentabancariaDao.getInversionistacuentabancariasByIdinversionistaAndAlias(tx, inversionista.idinversionista, inversionistacuentabancariaValidated.alias, filter_estado);
      if (cuentasbancarias_por_alias && cuentasbancarias_por_alias.length > 0) {
        log.warn(line(), "El alias [" + inversionistacuentabancariaValidated.alias + "] se encuentra registrado. Ingrese un alias diferente.");
        throw new ClientError("El alias [" + inversionistacuentabancariaValidated.alias + "] se encuentra registrado. Ingrese un alias diferente.", 404);
      }

      var camposCuentaBancariaFk = {
        _idinversionista: inversionista.idinversionista,
        _idbanco: banco.idbanco,
        _idcuentatipo: cuentatipo.idcuentatipo,
        _idmoneda: moneda.idmoneda,
        _idcuentabancariaestado: 1, // Por defecto
      };

      var camposCuentaBancariaAdicionales = {
        cuentabancariaid: uuidv4(),
        code: uuidv4().split("-")[0],
      };

      var camposCuentaBancariaAuditoria = {
        idusuariocrea: req.session_user.usuario._idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario._idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const cuentabancariaCreated = await cuentabancariaDao.insertCuentabancaria(tx, {
        ...camposCuentaBancariaFk,
        ...camposCuentaBancariaAdicionales,
        ...inversionistacuentabancariaValidated,
        ...camposCuentaBancariaAuditoria,
      });
      log.debug(line(), "cuentabancariaCreated:", cuentabancariaCreated);

      var camposEmpresaCuentaBancariaCreate = {
        _idinversionista: inversionista.idinversionista,
        _idcuentabancaria: cuentabancariaCreated.idcuentabancaria,
        inversionistacuentabancariaid: uuidv4(),
        code: uuidv4().split("-")[0],
        idusuariocrea: req.session_user.usuario._idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario._idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const inversionistacuentabancariaCreated = await inversionistacuentabancariaDao.insertInversionistacuentabancaria(tx, camposEmpresaCuentaBancariaCreate);
      log.debug(line(), "inversionistacuentabancariaCreated:", inversionistacuentabancariaCreated);

      const inversionistacuentabancariaFiltered = jsonUtils.removeAttributesPrivates(camposEmpresaCuentaBancariaCreate);

      return inversionistacuentabancariaFiltered;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, { ...inversionistacuentabancariaFiltered });
};

export const updateInversionistacuentabancariaOnlyAlias = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateInversionistacuentabancariaOnlyAlias");
  const { id } = req.params;
  const inversionistacuentabancariaUpdateSchema = yup
    .object()
    .shape({
      inversionistacuentabancariaid: yup.string().trim().required().min(36).max(36),
      alias: yup.string().required().max(50),
    })
    .required();
  const inversionistacuentabancariaValidated = inversionistacuentabancariaUpdateSchema.validateSync({ inversionistacuentabancariaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "inversionistacuentabancariaValidated:", inversionistacuentabancariaValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [1, 2];
      const _idusuario_session = req.session_user.usuario._idusuario;
      const inversionistacuentabancaria = await inversionistacuentabancariaDao.getInversionistacuentabancariaByInversionistacuentabancariaid(tx, inversionistacuentabancariaValidated.inversionistacuentabancariaid);
      if (!inversionistacuentabancaria) {
        log.warn(line(), "Inversionista cuenta bancaria no existe: [" + inversionistacuentabancariaValidated.inversionistacuentabancariaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const inversionistacuentabancariaAllowed = await inversionistacuentabancariaDao.getInversionistacuentabancariaByIdinversionistaAndIdusuario(tx, inversionistacuentabancaria.idinversionista, _idusuario_session, filter_estado);
      if (!inversionistacuentabancariaAllowed) {
        log.warn(line(), "Inversionista no asociado al usuario: [" + inversionistacuentabancaria.idinversionista + ", " + _idusuario_session + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const cuentabancaria = await cuentabancariaDao.getCuentabancariaByIdcuentabancaria(tx, inversionistacuentabancaria.idcuentabancaria);

      var camposCuentaBancariaAdicionales = {
        cuentabancariaid: cuentabancaria.cuentabancariaid,
      };

      var camposCuentaBancariaAuditoria = {
        idusuariomod: req.session_user.usuario._idusuario ?? 1,
        fechamod: new Date(),
      };

      const cuentabancariaUpdated = await cuentabancariaDao.updateCuentabancaria(tx, {
        ...camposCuentaBancariaAdicionales,
        ...inversionistacuentabancariaValidated,
        ...camposCuentaBancariaAuditoria,
      });
      log.debug(line(), "cuentabancariaUpdated", cuentabancariaUpdated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 200, {});
};

export const getInversionistacuentabancarias = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getInversionistacuentabancarias");
  const inversionistacuentabancariasFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      //log.info(line(),req.session_user.usuario._idusuario);

      const session_idusuario = req.session_user.usuario._idusuario;
      const filter_estado = [1];
      const inversionistacuentabancarias = await inversionistacuentabancariaDao.getInversionistacuentabancariasByIdusuario(tx, session_idusuario, filter_estado);
      var inversionistacuentabancariasJson = jsonUtils.sequelizeToJSON(inversionistacuentabancarias);
      //log.info(line(),empresaObfuscated);

      var inversionistacuentabancariasFiltered = jsonUtils.removeAttributes(inversionistacuentabancariasJson, ["score"]);
      inversionistacuentabancariasFiltered = jsonUtils.removeAttributesPrivates(inversionistacuentabancariasFiltered);
      return inversionistacuentabancariasFiltered;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, inversionistacuentabancariasFiltered);
};

export const getInversionistacuentabancariaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getInversionistacuentabancariaMaster");
  const cuentasbancariasMasterFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [1];
      const session_idusuario = req.session_user.usuario._idusuario;
      //log.info(line(),req.session_user.usuario.rol_rols);
      //const roles = [2]; // Administrador
      //const rolesUsuario = req.session_user.usuario.rol_rols.map((role) => role.idrol);
      // const tieneRol = roles.some((rol) => rolesUsuario.includes(rol));

      const inversionista = await inversionistaDao.getInversionistaByIdusuario(tx, session_idusuario, filter_estados);

      const bancos = await bancoDao.getBancos(tx, filter_estados);
      const monedas = await monedaDao.getMonedas(tx, filter_estados);
      const cuentatipos = await cuentatipoDao.getCuentatipos(tx, filter_estados);

      var cuentasbancariasMaster = {
        inversionista: inversionista,
        bancos: bancos,
        monedas: monedas,
        cuentatipos: cuentatipos,
      };

      var cuentasbancariasMasterJSON = jsonUtils.sequelizeToJSON(cuentasbancariasMaster);
      //jsonUtils.prettyPrint(cuentasbancariasMasterJSON);
      var cuentasbancariasMasterObfuscated = cuentasbancariasMasterJSON;
      //jsonUtils.prettyPrint(cuentasbancariasMasterObfuscated);
      var cuentasbancariasMasterFiltered = jsonUtils.removeAttributesPrivates(cuentasbancariasMasterObfuscated);
      //jsonUtils.prettyPrint(cuentasbancariasMaster);
      return cuentasbancariasMasterFiltered;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, cuentasbancariasMasterFiltered);
};
