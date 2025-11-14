import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";

import * as cuentabancariaDao from "#src/daos/cuentabancaria.prisma.Dao.js";
import * as empresaDao from "#src/daos/empresa.prisma.Dao.js";
import * as personaDao from "#src/daos/persona.prisma.Dao.js";
import * as factoringDao from "#src/daos/factoring.prisma.Dao.js";
import * as factoringpropuestaDao from "#src/daos/factoringpropuesta.prisma.Dao.js";
import * as factoringpropuestahistorialestadoDao from "#src/daos/factoringpropuestahistorialestado.prisma.Dao.js";
import * as factoringfacturaDao from "#src/daos/factoringfactura.prisma.Dao.js";
import * as factoringhistorialestadoDao from "#src/daos/factoringhistorialestado.prisma.Dao.js";
import * as facturaDao from "#src/daos/factura.prisma.Dao.js";
import * as usuarioDao from "#src/daos/usuario.prisma.Dao.js";

import * as emailService from "#root/src/services/email.Service.js";

import * as colaboradorDao from "#src/daos/colaborador.prisma.Dao.js";
import * as monedaDao from "#src/daos/moneda.prisma.Dao.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { log, line } from "#src/utils/logger.pino.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";

import * as luxon from "luxon";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import type { factoring } from "#root/generated/prisma/ft_factoring/client.js";
import type { factoring_factura } from "#root/generated/prisma/ft_factoring/client.js";
import { connect } from "http2";

export const acceptFactoringpropuesta = async (req: Request, res: Response) => {
  log.debug(line(), "controller::acceptFactoringpropuesta");
  const _idusuario_session = req.session_user.usuario.idusuario;
  const { factoringid } = req.params;
  const factoringpropuestaUpdateSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
      factoringpropuestaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringpropuestaValidated = factoringpropuestaUpdateSchema.validateSync({ factoringid: factoringid, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringpropuestaValidated:", factoringpropuestaValidated);

  const factoringpropuestaUpdated = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [1];

      const factoring = await factoringDao.getFactoringByFactoringid(tx, factoringpropuestaValidated.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + factoringpropuestaValidated.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoring_is_empresario = await factoringDao.getFactoringByIdfactoringIdempresario(tx, factoring.idfactoring, _idusuario_session, filter_estados);
      if (!factoring_is_empresario) {
        log.warn(line(), "Factoring [" + factoring.idfactoring + "] no pertenece al empresario [" + _idusuario_session + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringpropuesta = await factoringpropuestaDao.getFactoringpropuestaByFactoringpropuestaid(tx, factoringpropuestaValidated.factoringpropuestaid);
      if (!factoringpropuesta) {
        log.warn(line(), "Factoringpropuesta no existe: [" + factoringpropuestaValidated.factoringpropuestaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringpropuesta_is_factoring = await factoringpropuestaDao.getFactoringpropuestaVigenteByIdfactoringpropuestaIdfactoring(tx, factoringpropuesta.idfactoringpropuesta, factoring.idfactoring, filter_estados);
      if (!factoringpropuesta_is_factoring) {
        log.warn(line(), "Factoringpropuesta [" + factoringpropuesta.idfactoringpropuesta + "] no pertenece al factoring [" + factoring.idfactoring + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const idfactoringpropuestaestado = 6; // Aprobada

      const factoringpropuestahistorialestadoToCreate: Prisma.factoring_propuesta_historial_estadoCreateInput = {
        factoring_propuesta: { connect: { idfactoringpropuesta: factoringpropuesta.idfactoringpropuesta } },
        factoring_propuesta_estado: { connect: { idfactoringpropuestaestado: idfactoringpropuestaestado } },
        usuario_modifica: { connect: { idusuario: req.session_user.usuario.idusuario } },

        factoringpropuestahistorialestadoid: uuidv4(),
        code: uuidv4().split("-")[0],
        comentario: "",
        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const factoringpropuestahistorialestadoCreated = await factoringpropuestahistorialestadoDao.insertFactoringpropuestahistorialestado(tx, factoringpropuestahistorialestadoToCreate);
      log.debug(line(), "factoringpropuestahistorialestadoCreated:", factoringpropuestahistorialestadoCreated);

      const factoringpropuestaToUpdate: Prisma.factoring_propuestaUpdateInput = {
        factoring_propuesta_estado: { connect: { idfactoringpropuestaestado: idfactoringpropuestaestado } },
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
      };

      const factoringpropuestaUpdated = await factoringpropuestaDao.updateFactoringpropuesta(tx, factoringpropuesta.factoringpropuestaid, factoringpropuestaToUpdate);
      log.debug(line(), "factoringpropuestaUpdated", factoringpropuestaUpdated);

      const idfactoringestado = 4; // Propuesta aceptada

      const factoringhistorialestadoToCreate: Prisma.factoring_historial_estadoCreateInput = {
        factoring: { connect: { idfactoring: factoring.idfactoring } },
        factoring_estado: { connect: { idfactoringestado: idfactoringestado } },
        usuario_modifica: { connect: { idusuario: _idusuario_session } },

        factoringhistorialestadoid: uuidv4(),
        code: uuidv4().split("-")[0],
        comentario: "",
        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const factoringhistorialestadoCreated = await factoringhistorialestadoDao.insertFactoringhistorialestado(tx, factoringhistorialestadoToCreate);
      log.debug(line(), "factoringhistorialestadoCreated:", factoringhistorialestadoCreated);

      const factoringToUpdate: Prisma.factoringUpdateInput = {
        factoring_estado: { connect: { idfactoringestado: idfactoringestado } },
        factoring_propuesta_aceptada: { connect: { idfactoringpropuesta: factoringpropuesta.idfactoringpropuesta } },
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
      };

      const factoringUpdated = await factoringDao.updateFactoring(tx, factoring.factoringid, factoringToUpdate);
      log.debug(line(), "factoringUpdated", factoringUpdated);

      // Enviamos correo electrónico
      const factoring_for_email = await factoringDao.getFactoringByIdfactoring(tx, factoringpropuestaUpdated.idfactoring);
      const usuario_for_email = await usuarioDao.getUsuarioByIdusuario(tx, _idusuario_session);
      const factoringpropuesta_for_email = await factoringpropuestaDao.getFactoringpropuestaAceptadaByIdfactoringpropuesta(tx, factoringpropuestaUpdated.idfactoringpropuesta, [1]);

      var paramsEmail = {
        factoring: factoring_for_email,
        factoringpropuesta: factoringpropuesta_for_email,
        usuario: usuario_for_email,
      };

      await emailService.sendFactoringEmpresaServicioFactoringPropuestaAceptada(usuario_for_email.email, paramsEmail);

      return factoringpropuestaUpdated;
    },
    { timeout: prismaFT.transactionTimeout }
  );

  response(res, 200, {});
};

export const getFactoringpropuestaVigente = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestaVigente");
  const { factoringid } = req.params;
  const factoringpropuestaSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  var factoringpropuestaValidated = factoringpropuestaSchema.validateSync({ factoringid: factoringid, ...req.body }, { abortEarly: false, stripUnknown: true });
  //log.debug(line(),"factoringValidated:", factoringValidated);

  const factoringpropuesta = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [1];
      const _idusuario_session = req.session_user.usuario.idusuario;

      const factoring = await factoringDao.getFactoringByFactoringid(tx, factoringpropuestaValidated.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + factoringpropuestaValidated.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factoringpropuesta = await factoringpropuestaDao.getFactoringpropuestaVigenteByIdfactoring(tx, factoring.idfactoring, filter_estados);

      var factoringpropuestaFiltered = jsonUtils.removeAttributesPrivates(factoringpropuesta);
      return factoringpropuestaFiltered;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, factoringpropuesta);
};
