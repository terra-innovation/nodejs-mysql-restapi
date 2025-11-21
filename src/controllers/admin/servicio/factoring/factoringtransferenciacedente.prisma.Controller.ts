import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as factoringtransferenciacedenteDao from "#src/daos/factoringtransferenciacedente.prisma.Dao.js";
import * as factoringtransferenciaestadoDao from "#src/daos/factoringtransferenciaestado.prisma.Dao.js";
import * as factoringtransferenciatipoDao from "#src/daos/factoringtransferenciatipo.prisma.Dao.js";
import * as factoringtipoDao from "#src/daos/factoringtipo.prisma.Dao.js";
import * as factoringestrategiaDao from "#src/daos/factoringestrategia.prisma.Dao.js";
import * as factoringDao from "#src/daos/factoring.prisma.Dao.js";
import * as empresacuentabancariaDao from "#src/daos/empresacuentabancaria.prisma.Dao.js";
import * as factorcuentabancariaDao from "#src/daos/factorcuentabancaria.prisma.Dao.js";
import * as archivofactoringtransferenciacedenteDao from "#src/daos/archivofactoringtransferenciacedente.prisma.Dao.js";
import * as monedaDao from "#src/daos/moneda.prisma.Dao.js";
import * as usuarioDao from "#src/daos/usuario.prisma.Dao.js";
import * as archivoDao from "#src/daos/archivo.prisma.Dao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";
import * as emailService from "#root/src/services/email.Service.js";

import type { factoring_propuesta } from "#root/generated/prisma/ft_factoring/client.js";
import { Simulacion } from "#src/types/Simulacion.prisma.types.js";

import * as luxon from "luxon";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

import { simulateFactoringLogicV2 } from "#src/logics/factoring.prisma.Logic.js";

import { unlink } from "fs/promises";
import path from "path"; // Para eliminar el archivo después de enviarlo
import PDFGenerator from "#src/utils/document/PDFgenerator.js";
import * as storageUtils from "#src/utils/storageUtils.js";
import { sendFileAsync, setDownloadHeaders } from "#src/utils/httpUtils.js";
import * as fs from "fs";
import { Decimal } from "@prisma/client/runtime/library";
import { connect } from "http2";

export const sendCorreoFactoringtransferenciacedente = async (req: Request, res: Response) => {
  log.debug(line(), "controller::sendCorreoFactoringtransferenciacedente");
  const session_idusuario = req.session_user.usuario.idusuario;
  const { id } = req.params;
  const factoringtransferenciacedenteUpdateSchema = yup
    .object()
    .shape({
      factoringtransferenciacedenteid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringtransferenciacedenteValidated = factoringtransferenciacedenteUpdateSchema.validateSync({ factoringtransferenciacedenteid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringtransferenciacedenteValidated:", factoringtransferenciacedenteValidated);

  const factoringtransferenciacedenteSent = await prismaFT.client.$transaction(
    async (tx) => {
      const factoringtransferenciacedenteExisted = await factoringtransferenciacedenteDao.getFactoringtransferenciacedenteByFactoringtransferenciacedenteid(tx, factoringtransferenciacedenteValidated.factoringtransferenciacedenteid);
      if (!factoringtransferenciacedenteExisted) {
        log.warn(line(), "Factoringtransferenciacedente no existe: [" + factoringtransferenciacedenteValidated.factoringtransferenciacedenteid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      // Enviamos correo electrónico
      const factoring_for_email = await factoringDao.getFactoringByIdfactoring(tx, factoringtransferenciacedenteExisted.idfactoring);
      const factoringtransferenciacedente_for_email = await factoringtransferenciacedenteDao.getFactoringtransferenciacedenteByIdfactoringtransferenciacedente(tx, factoringtransferenciacedenteExisted.idfactoringtransferenciacedente);
      const usuario_for_email = await usuarioDao.getUsuarioByEmail(tx, factoring_for_email.contacto_cedente.email);

      const factoringtransferenciacedenteObfuscated_for_email = jsonUtils.ofuscarAtributos(factoringtransferenciacedente_for_email, ["numero", "cci"], jsonUtils.PATRON_OFUSCAR_CUENTA);

      var paramsEmail = {
        factoring: factoring_for_email,
        factoringtransferenciacedente: factoringtransferenciacedenteObfuscated_for_email,
        usuario: usuario_for_email,
      };
      await emailService.sendFactoringEmpresaServicioFactoringCedenteConfirmacionTransferencia(usuario_for_email.email, paramsEmail);

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );

  response(res, 200, {});
};

export const activateFactoringtransferenciacedente = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateFactoringtransferenciacedente");
  const { id } = req.params;
  const factoringtransferenciacedenteSchema = yup
    .object()
    .shape({
      factoringtransferenciacedenteid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringtransferenciacedenteValidated = factoringtransferenciacedenteSchema.validateSync({ factoringtransferenciacedenteid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringtransferenciacedenteValidated:", factoringtransferenciacedenteValidated);

  const factoringtransferenciacedenteActivated = await prismaFT.client.$transaction(
    async (tx) => {
      const factoringtransferenciacedenteActivated = await factoringtransferenciacedenteDao.activateFactoringtransferenciacedente(tx, factoringtransferenciacedenteValidated.factoringtransferenciacedenteid, req.session_user.usuario.idusuario);
      if (factoringtransferenciacedenteActivated[0] === 0) {
        throw new ClientError("Factoringtransferenciacedente no existe", 404);
      }
      log.debug(line(), "factoringtransferenciacedenteActivated:", factoringtransferenciacedenteActivated);
      return factoringtransferenciacedenteActivated;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 204, factoringtransferenciacedenteActivated);
};

export const deleteFactoringtransferenciacedente = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteFactoringtransferenciacedente");
  const { id } = req.params;
  const factoringtransferenciacedenteSchema = yup
    .object()
    .shape({
      factoringtransferenciacedenteid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringtransferenciacedenteValidated = factoringtransferenciacedenteSchema.validateSync({ factoringtransferenciacedenteid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringtransferenciacedenteValidated:", factoringtransferenciacedenteValidated);

  const factoringtransferenciacedenteDeleted = await prismaFT.client.$transaction(
    async (tx) => {
      const factoringtransferenciacedenteDeleted = await factoringtransferenciacedenteDao.deleteFactoringtransferenciacedente(tx, factoringtransferenciacedenteValidated.factoringtransferenciacedenteid, req.session_user.usuario.idusuario);
      if (factoringtransferenciacedenteDeleted[0] === 0) {
        throw new ClientError("Factoringtransferenciacedente no existe", 404);
      }
      log.debug(line(), "factoringtransferenciacedenteDeleted:", factoringtransferenciacedenteDeleted);
      return factoringtransferenciacedenteDeleted;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 204, factoringtransferenciacedenteDeleted);
};

export const updateFactoringtransferenciacedente = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateFactoringtransferenciacedente");
  const session_idusuario = req.session_user.usuario.idusuario;
  const { id } = req.params;
  const factoringtransferenciacedenteUpdateSchema = yup
    .object()
    .shape({
      factoringtransferenciacedenteid: yup.string().trim().required().min(36).max(36),
      factoringtransferenciaestadoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringtransferenciacedenteValidated = factoringtransferenciacedenteUpdateSchema.validateSync({ factoringtransferenciacedenteid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringtransferenciacedenteValidated:", factoringtransferenciacedenteValidated);

  const factoringtransferenciacedenteUpdated = await prismaFT.client.$transaction(
    async (tx) => {
      var factoringtransferenciacedente = await factoringtransferenciacedenteDao.getFactoringtransferenciacedenteByFactoringtransferenciacedenteid(tx, factoringtransferenciacedenteValidated.factoringtransferenciacedenteid);
      if (!factoringtransferenciacedente) {
        log.warn(line(), "Factoringtransferenciacedente no existe: [" + factoringtransferenciacedenteValidated.factoringtransferenciacedenteid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var factoringtransferenciaestado = await factoringtransferenciaestadoDao.getFactoringtransferenciaestadoByFactoringtransferenciaestadoid(tx, factoringtransferenciacedenteValidated.factoringtransferenciaestadoid);
      if (!factoringtransferenciaestado) {
        log.warn(line(), "factoringtransferenciaestado no existe: [" + factoringtransferenciacedenteValidated.factoringtransferenciaestadoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringtransferenciacedenteToUpdate: Prisma.factoring_transferencia_cedenteUpdateInput = {
        factoring_transferencia_estado: { connect: { idfactoringtransferenciaestado: factoringtransferenciaestado.idfactoringtransferenciaestado } },
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
      };

      const factoringtransferenciacedenteUpdated = await factoringtransferenciacedenteDao.updateFactoringtransferenciacedente(tx, factoringtransferenciacedenteValidated.factoringtransferenciacedenteid, factoringtransferenciacedenteToUpdate);
      log.debug(line(), "factoringtransferenciacedenteUpdated:", factoringtransferenciacedenteUpdated);

      return factoringtransferenciacedenteUpdated;
    },
    { timeout: prismaFT.transactionTimeout }
  );

  response(res, 200, { ...factoringtransferenciacedenteValidated });
};

export const createFactoringtransferenciacedente = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createFactoringtransferenciacedente");
  const session_idusuario = req.session_user.usuario.idusuario;
  const filter_estado = [1, 2];
  const factoringtransferenciacedenteSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
      factoringtransferenciatipoid: yup.string().trim().required().min(36).max(36),
      factoringtransferenciaestadoid: yup.string().trim().required().min(36).max(36),
      factorcuentabancariaid: yup.string().trim().required().min(36).max(36),
      empresacuentabancariaid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
      numero_operacion: yup.string().trim().required().min(2).max(50),
      monto: yup.number().required().min(0),
      fecha: yup
        .string()
        .required()
        .matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, "Formato inválido: debe ser ISO UTC (YYYY-MM-DDTHH:mm:ssZ)")
        .test("is-valid-date", "Fecha inválida", (value) => {
          const date = new Date(value);
          return !isNaN(date.getTime());
        }),
      archivo_constancia_transferencia: yup.string().trim().required().min(36).max(36),
    })
    .required();
  var factoringtransferenciacedenteValidated = factoringtransferenciacedenteSchema.validateSync({ ...req.body }, { abortEarly: false, stripUnknown: true });
  //log.debug(line(),"factoringValidated:", factoringValidated);

  const factoringtransferenciacedenteCreated = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [1];

      var factoring = await factoringDao.getFactoringByFactoringid(tx, factoringtransferenciacedenteValidated.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + factoringtransferenciacedenteValidated.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var factoringtransferenciatipo = await factoringtransferenciatipoDao.getFactoringtransferenciatipoByFactoringtransferenciatipoid(tx, factoringtransferenciacedenteValidated.factoringtransferenciatipoid);
      if (!factoringtransferenciatipo) {
        log.warn(line(), "Factoring tranferencia tipo no existe: [" + factoringtransferenciacedenteValidated.factoringtransferenciatipoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var factoringtransferenciaestado = await factoringtransferenciaestadoDao.getFactoringtransferenciaestadoByFactoringtransferenciaestadoid(tx, factoringtransferenciacedenteValidated.factoringtransferenciaestadoid);
      if (!factoringtransferenciaestado) {
        log.warn(line(), "Factoring tranferencia tipo no existe: [" + factoringtransferenciacedenteValidated.factoringtransferenciaestadoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var factorcuentabancaria = await factorcuentabancariaDao.getFactorcuentabancariaByFactorcuentabancariaid(tx, factoringtransferenciacedenteValidated.factorcuentabancariaid);
      if (!factorcuentabancaria) {
        log.warn(line(), "factorcuentabancaria no existe: [" + factoringtransferenciacedenteValidated.factorcuentabancariaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var empresacuentabancaria = await empresacuentabancariaDao.getEmpresacuentabancariaByEmpresacuentabancariaid(tx, factoringtransferenciacedenteValidated.empresacuentabancariaid);
      if (!empresacuentabancaria) {
        log.warn(line(), "empresacuentabancaria no existe: [" + factoringtransferenciacedenteValidated.empresacuentabancariaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var moneda = await monedaDao.getMonedaByMonedaid(tx, factoringtransferenciacedenteValidated.monedaid);
      if (!moneda) {
        log.warn(line(), "Moneda no existe: [" + factoringtransferenciacedenteValidated.monedaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var archivo = await archivoDao.getArchivoByArchivoid(tx, factoringtransferenciacedenteValidated.archivo_constancia_transferencia);
      if (!archivo) {
        log.warn(line(), "Archivo no existe: [" + factoringtransferenciacedenteValidated.archivo_constancia_transferencia + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringtransferenciacedenteToCreate: Prisma.factoring_transferencia_cedenteCreateInput = {
        factoring: { connect: { idfactoring: factoring.idfactoring } },
        factoring_transferencia_tipo: { connect: { idfactoringtransferenciatipo: factoringtransferenciatipo.idfactoringtransferenciatipo } },
        factoring_transferencia_estado: { connect: { idfactoringtransferenciaestado: factoringtransferenciaestado.idfactoringtransferenciaestado } },
        factor_cuenta_bancaria: { connect: { idfactorcuentabancaria: factorcuentabancaria.idfactorcuentabancaria } },
        empresa_cuenta_bancaria: { connect: { idempresacuentabancaria: empresacuentabancaria.idempresacuentabancaria } },
        moneda: { connect: { idmoneda: moneda.idmoneda } },

        factoringtransferenciacedenteid: uuidv4(),
        code: uuidv4().split("-")[0],

        numero_operacion: factoringtransferenciacedenteValidated.numero_operacion,
        monto: factoringtransferenciacedenteValidated.monto,
        fecha: factoringtransferenciacedenteValidated.fecha,

        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const factoringtransferenciacedenteCreated = await factoringtransferenciacedenteDao.insertFactoringtransferenciacedente(tx, jsonUtils.omitNullAndUndefined(factoringtransferenciacedenteToCreate));
      log.debug(line(), "factoringtransferenciacedenteCreated:", factoringtransferenciacedenteCreated);

      const archivofactoringtransferenciacedenteToCreate: Prisma.archivo_factoring_transferencia_cedenteCreateInput = {
        archivo: { connect: { idarchivo: archivo.idarchivo } },
        factoring_transferencia_cedente: { connect: { idfactoringtransferenciacedente: factoringtransferenciacedenteCreated.idfactoringtransferenciacedente } },
        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const archivofactoringtransferenciacedenteCreated = await archivofactoringtransferenciacedenteDao.insertArchivofactoringtransferenciacedente(tx, archivofactoringtransferenciacedenteToCreate);

      log.debug(line(), "archivofactoringtransferenciacedenteCreated:", archivofactoringtransferenciacedenteCreated);

      return factoringtransferenciacedenteCreated;
    },
    { timeout: prismaFT.transactionTimeout }
  );

  response(res, 201, factoringtransferenciacedenteCreated);
};

export const getFactoringtransferenciacedentesByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringtransferenciacedentesByFactoringid");
  //log.info(line(),req.session_user.usuario.idusuario);
  const { id } = req.params;
  const factoringtransferenciacedenteSearchSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringtransferenciacedenteValidated = factoringtransferenciacedenteSearchSchema.validateSync({ factoringid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringtransferenciacedenteValidated:", factoringtransferenciacedenteValidated);

  const factoringtransferenciacedentesJson = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [1, 2];

      var factoring = await factoringDao.getFactoringByFactoringid(tx, factoringtransferenciacedenteValidated.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + factoringtransferenciacedenteValidated.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringtransferenciacedentes = await factoringtransferenciacedenteDao.getFactoringtransferenciacedentesByIdfactoring(tx, factoring.idfactoring, filter_estado);
      var factoringtransferenciacedentesJson = jsonUtils.sequelizeToJSON(factoringtransferenciacedentes);
      //log.info(line(),factoringtransferenciacedenteObfuscated);

      //var factoringtransferenciacedentesFiltered = jsonUtils.removeAttributes(factoringtransferenciacedentesJson, ["score"]);
      //factoringtransferenciacedentesFiltered = jsonUtils.removeAttributesPrivates(factoringtransferenciacedentesFiltered);
      return factoringtransferenciacedentesJson;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, factoringtransferenciacedentesJson);
};

export const getFactoringtransferenciacedenteMasterByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringtransferenciacedenteMaster");
  const { factoringid } = req.params;
  const factoringtransferenciacedenteSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringtransferenciacedenteValidated = factoringtransferenciacedenteSchema.validateSync({ factoringid: factoringid }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringtransferenciacedenteValidated:", factoringtransferenciacedenteValidated);

  const factoringtransferenciacedentesMasterFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [1];

      var factoring = await factoringDao.getFactoringByFactoringid(tx, factoringtransferenciacedenteValidated.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + factoringtransferenciacedenteValidated.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringtransferenciatipos = await factoringtransferenciatipoDao.getFactoringtransferenciatipos(tx, filter_estados);
      const factoringtransferenciaestados = await factoringtransferenciaestadoDao.getFactoringtransferenciaestados(tx, filter_estados);

      const factorcuentasbancarias = await factorcuentabancariaDao.getFactorcuentabancariasByIdfactorIdmoneda(tx, factoring.idfactor, factoring.idmoneda, filter_estados);
      const cedentecuentasbancarias = await empresacuentabancariaDao.getEmpresacuentabancariasByIdempresaIdmoneda(tx, factoring.idcedente, factoring.idmoneda, filter_estados);
      const monedas = await monedaDao.getMonedas(tx, filter_estados);

      var factoringtransferenciacedentesMaster: Record<string, any> = {};

      factoringtransferenciacedentesMaster.factoringtransferenciatipos = factoringtransferenciatipos;
      factoringtransferenciacedentesMaster.factoringtransferenciaestados = factoringtransferenciaestados;
      factoringtransferenciacedentesMaster.factorcuentasbancarias = factorcuentasbancarias;
      factoringtransferenciacedentesMaster.cedentecuentasbancarias = cedentecuentasbancarias;
      factoringtransferenciacedentesMaster.monedas = monedas;

      var factoringtransferenciacedentesMasterJSON = jsonUtils.sequelizeToJSON(factoringtransferenciacedentesMaster);
      //jsonUtils.prettyPrint(factoringtransferenciacedentesMasterJSON);
      var factoringtransferenciacedentesMasterObfuscated = factoringtransferenciacedentesMasterJSON;
      //jsonUtils.prettyPrint(factoringtransferenciacedentesMasterObfuscated);
      var factoringtransferenciacedentesMasterFiltered = jsonUtils.removeAttributesPrivates(factoringtransferenciacedentesMasterObfuscated);
      //jsonUtils.prettyPrint(factoringtransferenciacedentesMaster);
      return factoringtransferenciacedentesMasterFiltered;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, factoringtransferenciacedentesMasterFiltered);
};
