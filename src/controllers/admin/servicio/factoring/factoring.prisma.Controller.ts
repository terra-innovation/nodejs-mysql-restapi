import type { Prisma } from "#src/models/prisma/ft_factoring/client";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";

import * as factoringDao from "#src/daos/factoring.prisma.Dao.js";
import * as factoringestadoDao from "#src/daos/factoringestado.prisma.Dao.js";
import * as factoringpropuestaDao from "#src/daos/factoringpropuesta.prisma.Dao.js";
import * as factoringtipoDao from "#src/daos/factoringtipo.prisma.Dao.js";
import * as riesgoDao from "#src/daos/riesgo.prisma.Dao.js";
import { simulateFactoringLogicV1 } from "#src/logics/factoringLogic.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

import type { factoring } from "#src/models/prisma/ft_factoring/client";

import * as luxon from "luxon";

import * as yup from "yup";

export const activateFactoring = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateFactoring");
  const { id } = req.params;
  const factoringSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringValidated = factoringSchema.validateSync({ factoringid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringValidated:", factoringValidated);

  const factoringActivated = await prismaFT.client.$transaction(
    async (tx) => {
      const factoringActivated = await factoringDao.activateFactoring(tx, factoringValidated.factoringid, req.session_user.usuario.idusuario);
      if (factoringActivated[0] === 0) {
        throw new ClientError("Factoring no existe", 404);
      }
      log.debug(line(), "factoringActivated:", factoringActivated);
      return factoringActivated;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 204, factoringActivated);
};

export const deleteFactoring = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteFactoring");
  const { id } = req.params;
  const factoringSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringValidated = factoringSchema.validateSync({ factoringid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringValidated:", factoringValidated);

  const factoringDeleted = await prismaFT.client.$transaction(
    async (tx) => {
      const factoringDeleted = await factoringDao.deleteFactoring(tx, factoringValidated.factoringid, req.session_user.usuario.idusuario);
      if (factoringDeleted[0] === 0) {
        throw new ClientError("Factoringpropuesta no existe", 404);
      }
      log.debug(line(), "factoringDeleted:", factoringDeleted);
      return factoringDeleted;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 204, factoringDeleted);
};

export const updateFactoring = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateFactoring");
  const { id } = req.params;
  const factoringUpdateSchema = yup.object().shape({
    factoringid: yup.string().trim().required().min(36).max(36),
    factoringestadoid: yup.string().trim().required().min(36).max(36),
    factoringpropuestaaceptadaid: yup.string().trim().min(36).max(36),
  });
  const factoringValidated = factoringUpdateSchema.validateSync({ factoringid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringValidated:", factoringValidated);

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      const session_idusuario = req.session_user.usuario.idusuario;
      const filter_estados = [1];

      var factoring = await factoringDao.getFactoringByFactoringid(tx, factoringValidated.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + factoringValidated.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var factoringestado = await factoringestadoDao.getFactoringestadoByFactoringestadoid(tx, factoringValidated.factoringestadoid);
      if (!factoringestado) {
        log.warn(line(), "Factoring estado no existe: [" + factoringValidated.factoringestadoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      if (factoringValidated.factoringpropuestaaceptadaid) {
        var factoringpropuesta = await factoringpropuestaDao.getFactoringpropuestaByFactoringpropuestaid(tx, factoringValidated.factoringpropuestaaceptadaid);
        if (!factoringpropuesta) {
          log.warn(line(), "factoring propuesta no existe: [" + factoringValidated.factoringpropuestaaceptadaid + "]");
          throw new ClientError("Datos no válidos", 404);
        }
      }

      const factoringToUpdate: Prisma.factoringUpdateInput = {
        factoring_estado: { connect: { idfactoringestado: factoringestado.idfactoringestado } },
        factoring_propuesta_aceptada: factoringValidated.factoringpropuestaaceptadaid
          ? {
              connect: { idfactoringpropuesta: factoringpropuesta.idfactoringpropuesta },
            }
          : { disconnect: true },
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
      };

      const factoringUpdated = await factoringDao.updateFactoring(tx, factoring.factoringid, factoringToUpdate);
      log.debug(line(), "factoringUpdated", factoringUpdated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 200, {});
};

export const simulateFactoring = async (req: Request, res: Response) => {
  log.debug(line(), "controller::simulateFactoring");
  const { id } = req.params;
  const factoringSimulateSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
      riesgooperacionid: yup.string().trim().required().min(36).max(36),
      factoringtipoid: yup.string().trim().required().min(36).max(36),
      tnm: yup.number().required().min(1).max(100),
      porcentaje_adelanto: yup.number().required().min(0).max(100),
    })
    .required();
  var factoringValidated = factoringSimulateSchema.validateSync({ factoringid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  //log.debug(line(),"factoringValidated:", factoringValidated);

  const simulacion = await prismaFT.client.$transaction(
    async (tx) => {
      const session_idusuario = req.session_user.usuario.idusuario;
      const filter_estados = [1];

      var factoring = await factoringDao.getFactoringByFactoringid(tx, factoringValidated.factoringid);
      if (!factoring) {
        log.warn(line(), "Factoring no existe: [" + factoringValidated.factoringid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var factoringtipo = await factoringtipoDao.getFactoringtipoByFactoringtipoid(tx, factoringValidated.factoringtipoid);
      if (!factoringtipo) {
        log.warn(line(), "Factoring tipo no existe: [" + factoringValidated.factoringtipoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var riesgooperacion = await riesgoDao.getRiesgoByRiesgoid(tx, factoringValidated.riesgooperacionid);
      if (!riesgooperacion) {
        log.warn(line(), "Riesgo operación no existe: [" + factoringValidated.riesgooperacionid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var dias_pago_estimado = luxon.DateTime.fromISO(factoring.fecha_pago_estimado).startOf("day").diff(luxon.DateTime.local().startOf("day"), "days").days; // Actualizamos la cantidad de dias para el pago
      var simulacion = {};
      simulacion = await simulateFactoringLogicV1(riesgooperacion.idriesgo, factoring.cuenta_bancaria.idbanco, factoring.cantidad_facturas, factoring.monto_neto, dias_pago_estimado, factoringValidated.porcentaje_adelanto, factoringValidated.tnm);

      log.info(line(), "simulacion: ", simulacion);

      return simulacion;
    },
    { timeout: prismaFT.transactionTimeout }
  );

  response(res, 201, { factoring: { ...factoringValidated }, ...simulacion });
};

export const getFactoringMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringsMaster");
  const filter_estados = [1];

  const factoringsMasterFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const factoringtipos = await factoringtipoDao.getFactoringtipos(tx, filter_estados);
      const factoringestados = await factoringestadoDao.getFactoringestados(tx, filter_estados);
      const riesgos = await riesgoDao.getRiesgos(tx, filter_estados);

      var factoringsMaster: Record<string, any> = {};
      factoringsMaster.factoringtipos = factoringtipos;
      factoringsMaster.factoringestados = factoringestados;
      factoringsMaster.riesgos = riesgos;

      var factoringsMasterJSON = jsonUtils.sequelizeToJSON(factoringsMaster);
      //jsonUtils.prettyPrint(factoringsMasterJSON);
      var factoringsMasterObfuscated = factoringsMasterJSON;
      //jsonUtils.prettyPrint(factoringsMasterObfuscated);
      var factoringsMasterFiltered = jsonUtils.removeAttributesPrivates(factoringsMasterObfuscated);
      //jsonUtils.prettyPrint(factoringsMasterFiltered);
      return factoringsMasterFiltered;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, factoringsMasterFiltered);
};

export const getFactorings = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactorings");
  const factorings = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [1, 2];
      const factorings = await factoringDao.getFactoringsByEstados(tx, filter_estados);
      return factorings;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, factorings);
};
