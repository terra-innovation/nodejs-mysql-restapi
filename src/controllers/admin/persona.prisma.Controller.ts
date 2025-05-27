import type { Prisma } from "#src/models/prisma/ft_factoring/client";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as personaDao from "#src/daos/persona.prisma.Dao.js";
import * as documentotipoDao from "#src/daos/documentotipo.prisma.Dao.js";
import * as paisDao from "#src/daos/pais.prisma.Dao.js";
import * as provinciaDao from "#src/daos/provincia.prisma.Dao.js";
import * as distritoDao from "#src/daos/distrito.prisma.Dao.js";
import * as generoDao from "#src/daos/genero.prisma.Dao.js";
import * as personadeclaracionDao from "#src/daos/personadeclaracion.prisma.Dao.js";
import * as usuarioDao from "#src/daos/usuario.prisma.Dao.js";
import * as archivoDao from "#src/daos/archivo.prisma.Dao.js";
import * as archivopersonaDao from "#src/daos/archivopersona.prisma.Dao.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import { Sequelize, Op } from "sequelize";
import { persona } from "#root/src/models/ft_factoring/Persona";

export const activatePersona = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activatePersona");
  const { id } = req.params;
  const personaSchema = yup
    .object()
    .shape({
      personaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const personaValidated = personaSchema.validateSync({ personaid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "personaValidated:", personaValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      var camposAuditoria: Partial<persona> = {};
      camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
      camposAuditoria.fechamod = new Date();
      camposAuditoria.estado = 1;

      const personaDeleted = await personaDao.activatePersona(tx, { ...personaValidated, ...camposAuditoria });
      if (personaDeleted[0] === 0) {
        throw new ClientError("Persona no existe", 404);
      }
      log.debug(line(), "personaActivated:", personaDeleted);
      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 204, personaDeleted);
};

export const deletePersona = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deletePersona");
  const { id } = req.params;
  const personaSchema = yup
    .object()
    .shape({
      personaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const personaValidated = personaSchema.validateSync({ personaid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "personaValidated:", personaValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      var camposAuditoria: Partial<persona> = {};
      camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
      camposAuditoria.fechamod = new Date();
      camposAuditoria.estado = 2;

      const personaDeleted = await personaDao.deletePersona(tx, { ...personaValidated, ...camposAuditoria });
      if (personaDeleted[0] === 0) {
        throw new ClientError("Persona no existe", 404);
      }
      log.debug(line(), "personaDeleted:", personaDeleted);
      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 204, personaDeleted);
};

export const getPersonaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getPersonaMaster");
  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      const session_idusuario = req.session_user?.usuario?._idusuario;
      const filter_estados = [1];
      const paises = await paisDao.getPaises(tx, filter_estados);
      const distritos = await distritoDao.getDistritos(tx, filter_estados);
      const documentotipos = await documentotipoDao.getDocumentotipos(tx, filter_estados);
      const generos = await generoDao.getGeneros(tx, filter_estados);

      let personaMaster: Record<string, any> = {};
      personaMaster.paises = paises;
      personaMaster.distritos = distritos;
      personaMaster.documentotipos = documentotipos;
      personaMaster.generos = generos;

      let personaMasterJSON = jsonUtils.sequelizeToJSON(personaMaster);
      //jsonUtils.prettyPrint(personaMasterJSON);
      let personaMasterObfuscated = jsonUtils.ofuscarAtributosDefault(personaMasterJSON);
      //jsonUtils.prettyPrint(personaMasterObfuscated);
      let personaMasterFiltered = jsonUtils.removeAttributesPrivates(personaMasterObfuscated);
      //jsonUtils.prettyPrint(personaMaster);
      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, personaMasterFiltered);
};

export const updatePersona = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updatePersona");
  const { id } = req.params;
  let NAME_REGX = /^[a-zA-Z ]+$/;
  const personaUpdateSchema = yup
    .object()
    .shape({
      personaid: yup.string().trim().required().min(36).max(36),
      personanombres: yup.string().trim().required().matches(NAME_REGX, "Debe ser un nombre válido").min(2).max(100),
      apellidopaterno: yup.string().trim().required().matches(NAME_REGX, "Debe ser un apellido válido").min(2).max(50),
      apellidomaterno: yup.string().trim().required().matches(NAME_REGX, "Debe ser un apellido válido").min(2).max(50),
      paisnacionalidadid: yup.string().trim().required().min(36).max(36),
      paisnacimientoid: yup.string().trim().required().min(36).max(36),
      paisresidenciaid: yup.string().trim().required().min(36).max(36),
      distritoresidenciaid: yup.string().trim().required().min(36).max(36),
      generoid: yup.string().trim().required().min(36).max(36),
      fechanacimiento: yup.date().required(),
      direccion: yup.string().trim().required().max(200),
      direccionreferencia: yup.string().trim().required().max(200),
    })
    .required();
  const personaValidated = personaUpdateSchema.validateSync({ personaid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "personaValidated:", personaValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      var camposFk = {};

      var camposAdicionales: Partial<persona> = {};
      camposAdicionales.personaid = personaValidated.personaid;

      var camposAuditoria: Partial<persona> = {};
      camposAuditoria.idusuariomod = req.session_user.usuario._idusuario ?? 1;
      camposAuditoria.fechamod = new Date();

      const result = await personaDao.updatePersona(tx, {
        ...camposFk,
        ...camposAdicionales,
        ...personaValidated,
        ...camposAuditoria,
      });
      if (result[0] === 0) {
        throw new ClientError("Persona no existe", 404);
      }
      const personaUpdated = await personaDao.getPersonaByPersonaid(tx, id);
      if (!personaUpdated) {
        throw new ClientError("Persona no existe", 404);
      }
      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 200, {});
};

export const getPersonas = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getPersonas");
  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      //log.info(line(),req.session_user.usuario._idusuario);

      const filter_estado = [1, 2];
      const personas = await personaDao.getPersonas(tx, filter_estado);
      var personasJson = jsonUtils.sequelizeToJSON(personas);
      //log.info(line(),personaObfuscated);

      //var personasFiltered = jsonUtils.removeAttributes(personasJson, ["score"]);
      //personasFiltered = jsonUtils.removeAttributesPrivates(personasFiltered);
      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, personasJson);
};
