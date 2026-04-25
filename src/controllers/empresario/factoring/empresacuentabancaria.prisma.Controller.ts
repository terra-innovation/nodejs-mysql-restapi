import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";

import * as archivocuentabancariaDao from "#src/daos/archivocuentabancaria.prisma.Dao.js";
import * as archivoDao from "#src/daos/archivo.prisma.Dao.js";
import * as bancoDao from "#src/daos/banco.prisma.Dao.js";
import * as cuentabancariaDao from "#src/daos/cuentabancaria.prisma.Dao.js";
import * as cuentatipoDao from "#src/daos/cuentatipo.prisma.Dao.js";
import * as empresacuentabancariaDao from "#src/daos/empresacuentabancaria.prisma.Dao.js";
import * as empresaDao from "#src/daos/empresa.prisma.Dao.js";
import * as monedaDao from "#src/daos/moneda.prisma.Dao.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#root/src/utils/logger.pino.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { ARCHIVO_TIPO } from "#src/daos/archivotipo.prisma.Dao.js";
import { isProduction } from "#src/config.js";

export const getEmpresacuentabancarias = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getEmpresacuentabancarias");

  const empresacuentabancariaUpdateSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const empresacuentabancariaValidated = empresacuentabancariaUpdateSchema.validateSync({ ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "empresacuentabancariaValidated:", empresacuentabancariaValidated);
  const empresacuentabancariasFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const session_idusuario = req.session_user.usuario.idusuario;
      const filter_estado = [ESTADO.ACTIVO];
      var empresa_por_idusuario = await empresaDao.getEmpresaByIdusuarioAndEmpresaid(tx, session_idusuario, empresacuentabancariaValidated.empresaid, filter_estado);
      if (!empresa_por_idusuario) {
        log.warn(line(), "Empresa no asociada al usuario: [" + session_idusuario + ", " + empresacuentabancariaValidated.monedaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var moneda = await monedaDao.getMonedaByMonedaid(tx, empresacuentabancariaValidated.monedaid);
      if (!moneda) {
        log.warn(line(), "Moneda no existe: [" + empresacuentabancariaValidated.monedaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var _idcuentabancariaestado = [2, 1]; // Verificado y Pendiente

      const empresacuentabancarias = await empresacuentabancariaDao.getEmpresacuentabancariasForFactoring(tx, empresa_por_idusuario.idempresa, moneda.idmoneda, _idcuentabancariaestado, filter_estado);
      var empresacuentabancariasJson = jsonUtils.sequelizeToJSON(empresacuentabancarias);
      //log.info(line(),empresaObfuscated);

      var empresacuentabancariasFiltered = jsonUtils.removeAttributes(empresacuentabancariasJson, ["score"]);
      empresacuentabancariasFiltered = jsonUtils.ofuscarAtributosDefault(empresacuentabancariasFiltered);
      empresacuentabancariasFiltered = jsonUtils.removeAttributesPrivates(empresacuentabancariasFiltered);
      return empresacuentabancariasFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, empresacuentabancariasFiltered);
};

export const getEmpresacuentabancariaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getEmpresacuentabancariaMaster");
  const cuentasbancariasMasterFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const session_idusuario = req.session_user.usuario.idusuario;

      const empresas = await empresaDao.getEmpresasByIdusuario(tx, session_idusuario, filter_estados);

      const bancos = await bancoDao.getBancos(tx, filter_estados);
      const monedas = await monedaDao.getMonedas(tx, filter_estados);
      const cuentatipos = await cuentatipoDao.getCuentatipos(tx, filter_estados);

      var cuentasbancariasMaster: Record<string, any> = {};
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
      return cuentasbancariasMasterFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, cuentasbancariasMasterFiltered);
};

export const createEmpresacuentabancaria = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createEmpresacuentabancaria");
  const session_idusuario = req.session_user.usuario.idusuario;
  const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
  const empresacuentabancariaCreateSchema = yup
    .object()
    .shape({
      encabezado_cuenta_bancaria: yup.string().trim().required().min(36).max(36),
      empresaid: yup.string().trim().required().min(36).max(36),
      bancoid: yup.string().trim().required().min(36).max(36),
      cuentatipoid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
      numero: yup.string().required().max(20),
      cci: yup.string().required().max(20),
      alias: yup.string().required().max(50),
    })
    .required();
  var empresacuentabancariaValidated = empresacuentabancariaCreateSchema.validateSync({ ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "empresacuentabancariaValidated:", empresacuentabancariaValidated);

  const empresacuentabancariaFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      var empresa = await empresaDao.getEmpresaByEmpresaid(tx, empresacuentabancariaValidated.empresaid);
      if (!empresa) {
        log.warn(line(), "Empresa no existe: [" + empresacuentabancariaValidated.empresaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var banco = await bancoDao.getBancoByBancoid(tx, empresacuentabancariaValidated.bancoid);
      if (!banco) {
        log.warn(line(), "Banco no existe: [" + empresacuentabancariaValidated.bancoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var cuentatipo = await cuentatipoDao.getCuentatipoByCuentatipoid(tx, empresacuentabancariaValidated.cuentatipoid);
      if (!cuentatipo) {
        log.warn(line(), "Cuenta tipo no existe: [" + empresacuentabancariaValidated.cuentatipoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var moneda = await monedaDao.getMonedaByMonedaid(tx, empresacuentabancariaValidated.monedaid);
      if (!moneda) {
        log.warn(line(), "Moneda no existe: [" + empresacuentabancariaValidated.monedaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var empresa_por_idusuario = await empresaDao.getEmpresaByIdusuarioAndEmpresaid(tx, session_idusuario, empresacuentabancariaValidated.empresaid, filter_estado);
      if (!empresa_por_idusuario) {
        log.warn(line(), "Empresa no asociada al usuario: [" + session_idusuario + ", " + empresacuentabancariaValidated.monedaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var cuentasbancarias_por_numero = await cuentabancariaDao.getCuentasbancariasByIdbancoAndNumero(tx, banco.idbanco, empresacuentabancariaValidated.numero, filter_estado);
      if (cuentasbancarias_por_numero && cuentasbancarias_por_numero.length > 0) {
        log.warn(line(), "El número de cuenta [" + empresacuentabancariaValidated.numero + "] se encuentra registrado. Ingrese un número de cuenta diferente.");
        throw new ClientError("El número de cuenta [" + empresacuentabancariaValidated.numero + "] se encuentra registrado. Ingrese un número de cuenta diferente.", 404);
      }

      var cuentasbancarias_por_alias = await empresacuentabancariaDao.getEmpresacuentabancariasByIdempresaAndAlias(tx, empresa_por_idusuario.idempresa, empresacuentabancariaValidated.alias, filter_estado);
      if (cuentasbancarias_por_alias && cuentasbancarias_por_alias.length > 0) {
        log.warn(line(), "El alias [" + empresacuentabancariaValidated.alias + "] se encuentra registrado. Ingrese un alias diferente.");
        throw new ClientError("El alias [" + empresacuentabancariaValidated.alias + "] se encuentra registrado. Ingrese un alias diferente.", 404);
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

      const filter_estado_archivo = isProduction ? [ESTADO.ACTIVO] : [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const encabezadocuentabancaria = await archivoDao.getArchivoByArchivoidAndIdarchivotipo(tx, empresacuentabancariaValidated.encabezado_cuenta_bancaria, ARCHIVO_TIPO.ENCABEZADO_DEL_EECC_DE_LA_CUENTA_BANCARIA, filter_estado_archivo);
      if (!encabezadocuentabancaria) {
        log.warn(line(), "Encabezado de cuenta bancaria no existe o tipo no coincide: [" + empresacuentabancariaValidated.encabezado_cuenta_bancaria + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const encabezadocuentabancariaCreated = await vincularArchivoEncabezadoCuentaBancaria(req, tx, encabezadocuentabancaria, cuentabancariaCreated);
      log.debug(line(), "encabezadocuentabancariaCreated:", encabezadocuentabancariaCreated);

      const empresacuentabancariaToCreate: Prisma.empresa_cuenta_bancariaCreateInput = {
        empresa: {
          connect: { idempresa: empresa.idempresa },
        },
        cuenta_bancaria: {
          connect: { idcuentabancaria: cuentabancariaCreated.idcuentabancaria },
        },
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
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, { ...empresacuentabancariaFiltered });
};

const vincularArchivoEncabezadoCuentaBancaria = async (req, tx, archivo, cuentabancariaCreated) => {
  const idusuario = req.session_user?.usuario?.idusuario ?? 1;

  const archivocuentabancariaToCreate: Prisma.archivo_cuenta_bancariaCreateInput = {
    archivo: { connect: { idarchivo: archivo.idarchivo } },
    cuenta_bancaria: { connect: { idcuentabancaria: cuentabancariaCreated.idcuentabancaria } },
    idusuariocrea: idusuario,
    fechacrea: new Date(),
    idusuariomod: idusuario,
    fechamod: new Date(),
    estado: 1,
  };

  await archivocuentabancariaDao.insertArchivoCuentaBancaria(tx, archivocuentabancariaToCreate);
  return archivo;
};
