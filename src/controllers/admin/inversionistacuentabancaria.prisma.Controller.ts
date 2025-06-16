import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as inversionistacuentabancariaDao from "#src/daos/inversionistacuentabancaria.prisma.Dao.js";
import * as cuentabancariaDao from "#src/daos/cuentabancaria.prisma.Dao.js";
import * as empresaDao from "#src/daos/empresa.prisma.Dao.js";
import * as bancoDao from "#src/daos/banco.prisma.Dao.js";
import * as cuentatipoDao from "#src/daos/cuentatipo.prisma.Dao.js";
import * as monedaDao from "#src/daos/moneda.prisma.Dao.js";
import * as personaDao from "#src/daos/persona.prisma.Dao.js";
import * as inversionistaDao from "#src/daos/inversionista.prisma.Dao.js";
import * as cuentabancariaestadoDao from "#src/daos/cuentabancariaestado.prisma.Dao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

import type { cuenta_bancaria } from "#root/generated/prisma/ft_factoring/client.js";
import type { inversionista_cuenta_bancaria } from "#root/generated/prisma/ft_factoring/client.js";

export const updateInversionistacuentabancariaOnlyAliasAndCuentaBancariaEstado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateInversionistacuentabancariaOnlyAliasAndCuentaBancariaEstado");
  const { id } = req.params;
  const inversionistacuentabancariaUpdateSchema = yup
    .object()
    .shape({
      inversionistacuentabancariaid: yup.string().trim().required().min(36).max(36),
      cuentabancariaestadoid: yup.string().trim().required().min(36).max(36),
      alias: yup.string().required().max(50),
    })
    .required();
  const inversionistacuentabancariaValidated = inversionistacuentabancariaUpdateSchema.validateSync({ inversionistacuentabancariaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "inversionistacuentabancariaValidated:", inversionistacuentabancariaValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      var inversionistacuentabancariaestado = await cuentabancariaestadoDao.getCuentabancariaestadoByCuentabancariaestadoid(tx, inversionistacuentabancariaValidated.cuentabancariaestadoid);
      if (!inversionistacuentabancariaestado) {
        log.warn(line(), "Cuenta bancaria estado no existe: [" + inversionistacuentabancariaValidated.cuentabancariaestadoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var inversionistacuentabancaria = await inversionistacuentabancariaDao.getInversionistacuentabancariaByInversionistacuentabancariaid(tx, inversionistacuentabancariaValidated.inversionistacuentabancariaid);
      if (!inversionistacuentabancaria) {
        log.warn(line(), "Inversionista cuenta bancaria no existe: [" + inversionistacuentabancariaValidated.inversionistacuentabancariaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var cuentabancaria = await cuentabancariaDao.getCuentabancariaByIdcuentabancaria(tx, inversionistacuentabancaria.idcuentabancaria);
      if (!cuentabancaria) {
        log.warn(line(), "Cuenta bancaria no existe: [" + inversionistacuentabancaria.idcuentabancaria + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const cuentabancariaToUpdate: Prisma.cuenta_bancariaUpdateInput = {
        cuenta_bancaria_estado: { connect: { idcuentabancariaestado: inversionistacuentabancariaestado.idcuentabancariaestado } },
        alias: inversionistacuentabancariaValidated.alias,
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
      };

      const cuentabancariaUpdated = await cuentabancariaDao.updateCuentabancaria(tx, cuentabancaria.cuentabancariaid, cuentabancariaToUpdate);
      log.debug(line(), "cuentabancariaUpdated", cuentabancariaUpdated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 200, {});
};

export const getInversionistacuentabancarias = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getInversionistacuentabancarias");
  //log.info(line(),req.session_user.usuario.idusuario);
  const cuentasbancariasJson = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [1, 2];
      const cuentasbancarias = await inversionistacuentabancariaDao.getInversionistacuentabancarias(tx, filter_estado);
      var cuentasbancariasJson = jsonUtils.sequelizeToJSON(cuentasbancarias);

      return cuentasbancariasJson;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, cuentasbancariasJson);
};

export const activateInversionistacuentabancaria = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateInversionistacuentabancaria");
  const { id } = req.params;
  const inversionistacuentabancariaSchema = yup
    .object()
    .shape({
      inversionistacuentabancariaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const inversionistacuentabancariaValidated = inversionistacuentabancariaSchema.validateSync({ inversionistacuentabancariaid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "inversionistacuentabancariaValidated:", inversionistacuentabancariaValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      var inversionistacuentabancaria = await inversionistacuentabancariaDao.getInversionistacuentabancariaByInversionistacuentabancariaid(tx, inversionistacuentabancariaValidated.inversionistacuentabancariaid);
      if (!inversionistacuentabancaria) {
        log.warn(line(), "Inversionista cuenta bancaria no existe: [" + inversionistacuentabancariaValidated.inversionistacuentabancariaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var cuentabancaria = await cuentabancariaDao.getCuentabancariaByIdcuentabancaria(tx, inversionistacuentabancaria.idcuentabancaria);
      if (!cuentabancaria) {
        log.warn(line(), "Cuenta bancaria no existe: [" + inversionistacuentabancaria.idcuentabancaria + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const camposCuentaBancariaActivated = await cuentabancariaDao.activateCuentabancaria(tx, cuentabancaria.cuentabancariaid, req.session_user.usuario.idusuario);
      log.debug(line(), "camposCuentaBancariaActivated:", camposCuentaBancariaActivated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 204, {});
};

export const deleteInversionistacuentabancaria = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteInversionistacuentabancaria");
  const { id } = req.params;
  const inversionistacuentabancariaSchema = yup
    .object()
    .shape({
      inversionistacuentabancariaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const inversionistacuentabancariaValidated = inversionistacuentabancariaSchema.validateSync({ inversionistacuentabancariaid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "inversionistacuentabancariaValidated:", inversionistacuentabancariaValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      var inversionistacuentabancaria = await inversionistacuentabancariaDao.getInversionistacuentabancariaByInversionistacuentabancariaid(tx, inversionistacuentabancariaValidated.inversionistacuentabancariaid);
      if (!inversionistacuentabancaria) {
        log.warn(line(), "Inversionista cuenta bancaria no existe: [" + inversionistacuentabancariaValidated.inversionistacuentabancariaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var cuentabancaria = await cuentabancariaDao.getCuentabancariaByIdcuentabancaria(tx, inversionistacuentabancaria.idcuentabancaria);
      if (!cuentabancaria) {
        log.warn(line(), "Cuenta bancaria no existe: [" + inversionistacuentabancaria.idcuentabancaria + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const cuentabancariaDeleted = await cuentabancariaDao.deleteCuentabancaria(tx, cuentabancaria.cuentabancariaid, req.session_user.usuario.idusuario);
      log.debug(line(), "cuentabancariaDeleted:", cuentabancariaDeleted);

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 204, {});
};

export const getInversionistacuentabancariaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getInversionistacuentabancariaMaster");
  const cuentasbancariasMasterFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [1];
      const inversionistas = await inversionistaDao.getInversionistas(tx, filter_estados);

      const bancos = await bancoDao.getBancos(tx, filter_estados);
      const monedas = await monedaDao.getMonedas(tx, filter_estados);
      const cuentatipos = await cuentatipoDao.getCuentatipos(tx, filter_estados);
      const cuentabancariaestados = await cuentabancariaestadoDao.getCuentabancariaestados(tx, filter_estados);

      var cuentasbancariasMaster: Record<string, any> = {};
      cuentasbancariasMaster.inversionistas = inversionistas;
      cuentasbancariasMaster.bancos = bancos;
      cuentasbancariasMaster.monedas = monedas;
      cuentasbancariasMaster.cuentatipos = cuentatipos;
      cuentasbancariasMaster.cuentabancariaestados = cuentabancariaestados;

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

export const createInversionistacuentabancaria = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createInversionistacuentabancaria");
  const session_idusuario = req.session_user.usuario.idusuario;
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
  var inversionistacuentabancariaValidated = inversionistacuentabancariaCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "inversionistacuentabancariaValidated:", inversionistacuentabancariaValidated);

  const inversionistacuentabancariaFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      var inversionista = await inversionistaDao.getInversionistaByInversionistaid(tx, inversionistacuentabancariaValidated.inversionistaid);
      if (!inversionista) {
        log.warn(line(), "Inversionista no existe: [" + inversionistacuentabancariaValidated.inversionistaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var banco = await bancoDao.findBancoPk(tx, inversionistacuentabancariaValidated.bancoid);
      if (!banco) {
        log.warn(line(), "Banco no existe: [" + inversionistacuentabancariaValidated.bancoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var cuentatipo = await cuentatipoDao.findCuentatipoPk(tx, inversionistacuentabancariaValidated.cuentatipoid);
      if (!cuentatipo) {
        log.warn(line(), "Cuenta tipo no existe: [" + inversionistacuentabancariaValidated.cuentatipoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }
      var moneda = await monedaDao.findMonedaPk(tx, inversionistacuentabancariaValidated.monedaid);
      if (!moneda) {
        log.warn(line(), "Moneda no existe: [" + inversionistacuentabancariaValidated.monedaid + "]");
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

      const cuentabancariaToCreate: Prisma.cuenta_bancariaCreateInput = {
        banco: {
          connect: { idbanco: banco.idbanco },
        },
        cuenta_tipo: {
          connect: { idcuentatipo: cuentatipo.idcuentatipo },
        },
        moneda: {
          connect: { idmoneda: moneda.idmoneda },
        },
        cuenta_bancaria_estado: {
          connect: {
            idcuentabancariaestado: 1, // Por defecto
          },
        },
        cuentabancariaid: uuidv4(),
        code: uuidv4().split("-")[0],
        numero: inversionistacuentabancariaValidated.numero,
        cci: inversionistacuentabancariaValidated.cci,
        alias: inversionistacuentabancariaValidated.alias,
        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const cuentabancariaCreated = await cuentabancariaDao.insertCuentabancaria(tx, cuentabancariaToCreate);
      log.debug(line(), "cuentabancariaCreated:", cuentabancariaCreated);

      const inversionistacuentabancariaToCreate: Prisma.inversionista_cuenta_bancariaCreateInput = {
        inversionista: {
          connect: { idinversionista: inversionista.idinversionista },
        },
        cuenta_bancaria: {
          connect: { idcuentabancaria: cuentabancariaCreated.idcuentabancaria },
        },
        inversionistacuentabancariaid: uuidv4(),
        code: uuidv4().split("-")[0],
        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const inversionistacuentabancariaCreated = await inversionistacuentabancariaDao.insertInversionistacuentabancaria(tx, inversionistacuentabancariaToCreate);
      log.debug(line(), "inversionistacuentabancariaCreated:", inversionistacuentabancariaCreated);

      const inversionistacuentabancariaFiltered = jsonUtils.removeAttributesPrivates(inversionistacuentabancariaToCreate);

      return inversionistacuentabancariaFiltered;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, { ...inversionistacuentabancariaFiltered });
};
