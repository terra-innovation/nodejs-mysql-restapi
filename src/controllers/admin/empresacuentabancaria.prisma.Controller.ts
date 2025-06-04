import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as empresacuentabancariaDao from "#src/daos/empresacuentabancaria.prisma.Dao.js";
import * as cuentabancariaDao from "#src/daos/cuentabancaria.prisma.Dao.js";
import * as empresaDao from "#src/daos/empresa.prisma.Dao.js";
import * as bancoDao from "#src/daos/banco.prisma.Dao.js";
import * as cuentatipoDao from "#src/daos/cuentatipo.prisma.Dao.js";
import * as monedaDao from "#src/daos/moneda.prisma.Dao.js";
import * as cuentabancariaestadoDao from "#src/daos/cuentabancariaestado.prisma.Dao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";
import type { Prisma } from "#src/models/prisma/ft_factoring/client";
import type { cuenta_bancaria } from "#src/models/prisma/ft_factoring/client";
import type { empresa_cuenta_bancaria } from "#src/models/prisma/ft_factoring/client";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

export const activateEmpresacuentabancaria = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateEmpresacuentabancaria");
  const { id } = req.params;
  const empresacuentabancariaSchema = yup
    .object()
    .shape({
      empresacuentabancariaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const empresacuentabancariaValidated = empresacuentabancariaSchema.validateSync({ empresacuentabancariaid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "empresacuentabancariaValidated:", empresacuentabancariaValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      var empresacuentabancaria = await empresacuentabancariaDao.getEmpresacuentabancariaByEmpresacuentabancariaid(tx, empresacuentabancariaValidated.empresacuentabancariaid);
      if (!empresacuentabancaria) {
        log.warn(line(), "Empresa cuenta bancaria no existe: [" + empresacuentabancariaValidated.empresacuentabancariaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var cuentabancaria = await cuentabancariaDao.getCuentabancariaByIdcuentabancaria(tx, empresacuentabancaria.idcuentabancaria);
      if (!cuentabancaria) {
        log.warn(line(), "Cuenta bancaria no existe: [" + empresacuentabancaria.idcuentabancaria + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const cuentabancariaActivated = await cuentabancariaDao.activateCuentabancaria(tx, cuentabancaria.cuentabancariaid, req.session_user.usuario.idusuario);
      log.debug(line(), "cuentabancariaActivated:", cuentabancariaActivated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 204, {});
};

export const deleteEmpresacuentabancaria = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteEmpresacuentabancaria");
  const { id } = req.params;
  const empresacuentabancariaSchema = yup
    .object()
    .shape({
      empresacuentabancariaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const empresacuentabancariaValidated = empresacuentabancariaSchema.validateSync({ empresacuentabancariaid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "empresacuentabancariaValidated:", empresacuentabancariaValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      var empresacuentabancaria = await empresacuentabancariaDao.getEmpresacuentabancariaByEmpresacuentabancariaid(tx, empresacuentabancariaValidated.empresacuentabancariaid);
      if (!empresacuentabancaria) {
        log.warn(line(), "Empresa cuenta bancaria no existe: [" + empresacuentabancariaValidated.empresacuentabancariaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var cuentabancaria = await cuentabancariaDao.getCuentabancariaByIdcuentabancaria(tx, empresacuentabancaria.idcuentabancaria);
      if (!cuentabancaria) {
        log.warn(line(), "Cuenta bancaria no existe: [" + empresacuentabancaria.idcuentabancaria + "]");
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

export const getEmpresacuentabancariaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getEmpresacuentabancariaMaster");
  const cuentasbancariasMasterFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [1];
      const empresas = await empresaDao.getEmpresas(tx, filter_estados);

      const bancos = await bancoDao.getBancos(tx, filter_estados);
      const monedas = await monedaDao.getMonedas(tx, filter_estados);
      const cuentatipos = await cuentatipoDao.getCuentatipos(tx, filter_estados);
      const cuentabancariaestados = await cuentabancariaestadoDao.getCuentabancariaestados(tx, filter_estados);

      var cuentasbancariasMaster: Record<string, any> = {};
      cuentasbancariasMaster.empresas = empresas;
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

export const updateEmpresacuentabancariaOnlyAliasAndCuentaBancariaEstado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateEmpresacuentabancariaOnlyAliasAndCuentaBancariaEstado");
  const { id } = req.params;
  const empresacuentabancariaUpdateSchema = yup
    .object()
    .shape({
      empresacuentabancariaid: yup.string().trim().required().min(36).max(36),
      cuentabancariaestadoid: yup.string().trim().required().min(36).max(36),
      alias: yup.string().required().max(50),
    })
    .required();
  const empresacuentabancariaValidated = empresacuentabancariaUpdateSchema.validateSync({ empresacuentabancariaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "empresacuentabancariaValidated:", empresacuentabancariaValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      var empresacuentabancariaestado = await cuentabancariaestadoDao.getCuentabancariaestadoByCuentabancariaestadoid(tx, empresacuentabancariaValidated.cuentabancariaestadoid);
      if (!empresacuentabancariaestado) {
        log.warn(line(), "Cuenta bancaria estado no existe: [" + empresacuentabancariaValidated.cuentabancariaestadoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var empresacuentabancaria = await empresacuentabancariaDao.getEmpresacuentabancariaByEmpresacuentabancariaid(tx, empresacuentabancariaValidated.empresacuentabancariaid);
      if (!empresacuentabancaria) {
        log.warn(line(), "Empresa cuenta bancaria no existe: [" + empresacuentabancariaValidated.empresacuentabancariaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var cuentabancaria = await cuentabancariaDao.getCuentabancariaByIdcuentabancaria(tx, empresacuentabancaria.idcuentabancaria);
      if (!cuentabancaria) {
        log.warn(line(), "Cuenta bancaria no existe: [" + empresacuentabancaria.idcuentabancaria + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const cuentabancariaToUpdate: Prisma.cuenta_bancariaUpdateInput = {
        cuenta_bancaria_estado: { connect: { idcuentabancariaestado: empresacuentabancariaestado.idcuentabancariaestado } },
        alias: empresacuentabancariaValidated.alias,
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

export const getEmpresacuentabancarias = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getEmpresacuentabancarias");

  const cuentasbancariasJson = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [1, 2];
      const cuentasbancarias = await empresacuentabancariaDao.getEmpresacuentabancarias(tx, filter_estado);
      var cuentasbancariasJson = jsonUtils.sequelizeToJSON(cuentasbancarias);

      return cuentasbancariasJson;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, cuentasbancariasJson);
};

export const createEmpresacuentabancaria = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createEmpresacuentabancaria");
  const session_idusuario = req.session_user.usuario.idusuario;
  const filter_estado = [1, 2];
  const empresacuentabancariaCreateSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
      bancoid: yup.string().trim().required().min(36).max(36),
      cuentatipoid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
      numero: yup.string().required().max(20),
      cci: yup.string().required().max(20),
      alias: yup.string().required().max(50),
    })
    .required();
  var empresacuentabancariaValidated = empresacuentabancariaCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "empresacuentabancariaValidated:", empresacuentabancariaValidated);

  const empresacuentabancariaFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      var empresa = await empresaDao.findEmpresaPk(tx, empresacuentabancariaValidated.empresaid);
      if (!empresa) {
        log.warn(line(), "Empresa no existe: [" + empresacuentabancariaValidated.empresaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var banco = await bancoDao.findBancoPk(tx, empresacuentabancariaValidated.bancoid);
      if (!banco) {
        log.warn(line(), "Banco no existe: [" + empresacuentabancariaValidated.bancoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var cuentatipo = await cuentatipoDao.findCuentatipoPk(tx, empresacuentabancariaValidated.cuentatipoid);
      if (!cuentatipo) {
        log.warn(line(), "Cuenta tipo no existe: [" + empresacuentabancariaValidated.cuentatipoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }
      var moneda = await monedaDao.findMonedaPk(tx, empresacuentabancariaValidated.monedaid);
      if (!moneda) {
        log.warn(line(), "Moneda no existe: [" + empresacuentabancariaValidated.monedaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var cuentasbancarias_por_numero = await cuentabancariaDao.getCuentasbancariasByIdbancoAndNumero(tx, banco.idbanco, empresacuentabancariaValidated.numero, filter_estado);
      if (cuentasbancarias_por_numero && cuentasbancarias_por_numero.length > 0) {
        log.warn(line(), "El número de cuenta [" + empresacuentabancariaValidated.numero + "] se encuentra registrado. Ingrese un número de cuenta diferente.");
        throw new ClientError("El número de cuenta [" + empresacuentabancariaValidated.numero + "] se encuentra registrado. Ingrese un número de cuenta diferente.", 404);
      }

      var cuentasbancarias_por_alias = await empresacuentabancariaDao.getEmpresacuentabancariasByIdempresaAndAlias(tx, empresa.idempresa, empresacuentabancariaValidated.alias, filter_estado);
      if (cuentasbancarias_por_alias && cuentasbancarias_por_alias.length > 0) {
        log.warn(line(), "El alias [" + empresacuentabancariaValidated.alias + "] se encuentra registrado. Ingrese un alias diferente.");
        throw new ClientError("El alias [" + empresacuentabancariaValidated.alias + "] se encuentra registrado. Ingrese un alias diferente.", 404);
      }

      const idcuentabancariaestado = 1; // Por defecto

      const cuentabancariaToCreate: Prisma.cuenta_bancariaCreateInput = {
        banco: { connect: { idbanco: banco.idbanco } },
        cuenta_tipo: { connect: { idcuentatipo: cuentatipo.idcuentatipo } },
        moneda: { connect: { idmoneda: moneda.idmoneda } },
        cuenta_bancaria_estado: { connect: { idcuentabancariaestado: idcuentabancariaestado } },
        cuentabancariaid: uuidv4(),
        code: uuidv4().split("-")[0],
        numero: empresacuentabancariaValidated.numero,
        cci: empresacuentabancariaValidated.cci,
        alias: empresacuentabancariaValidated.alias,
        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const cuentabancariaCreated = await cuentabancariaDao.insertCuentabancaria(tx, cuentabancariaToCreate);
      log.debug(line(), "cuentabancariaCreated:", cuentabancariaCreated);

      const empresacuentabancariaToCreate: Prisma.empresa_cuenta_bancariaCreateInput = {
        empresa: { connect: { idempresa: empresa.idempresa } },
        cuenta_bancaria: { connect: { idcuentabancaria: cuentabancariaCreated.idcuentabancaria } },
        empresacuentabancariaid: uuidv4(),
        code: uuidv4().split("-")[0],
        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const empresacuentabancariaCreated = await empresacuentabancariaDao.insertEmpresacuentabancaria(tx, empresacuentabancariaToCreate);
      log.debug(line(), "empresacuentabancariaCreated:", empresacuentabancariaCreated);

      const empresacuentabancariaFiltered = jsonUtils.removeAttributesPrivates(empresacuentabancariaToCreate);

      return empresacuentabancariaFiltered;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, { ...empresacuentabancariaFiltered });
};
