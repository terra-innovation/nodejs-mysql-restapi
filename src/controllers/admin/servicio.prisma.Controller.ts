import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as servicioDao from "#src/daos/servicio.prisma.Dao.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

export const activateServicio = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateServicio");
  const { id } = req.params;
  const servicioSchema = yup
    .object()
    .shape({
      servicioid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const servicioValidated = servicioSchema.validateSync({ servicioid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "servicioValidated:", servicioValidated);

  const servicioActivated = await prismaFT.client.$transaction(
    async (tx) => {
      const servicioActivated = await servicioDao.activateServicio(tx, servicioValidated.servicioid, req.session_user.usuario.idusuario);

      log.debug(line(), "servicioActivated:", servicioActivated);
      return servicioActivated;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  {
    response(res, 204, {});
  }
};

export const deleteServicio = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteServicio");
  const { id } = req.params;
  const servicioSchema = yup
    .object()
    .shape({
      servicioid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const servicioValidated = servicioSchema.validateSync({ servicioid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "servicioValidated:", servicioValidated);

  const servicioDeleted = await prismaFT.client.$transaction(
    async (tx) => {
      const servicioDeleted = await servicioDao.deleteServicio(tx, servicioValidated.servicioid, req.session_user.usuario.idusuario);
      if (servicioDeleted[0] === 0) {
        throw new ClientError("Servicio no existe", 404);
      }
      log.debug(line(), "servicioDeleted:", servicioDeleted);
      return servicioDeleted;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 204, servicioDeleted);
};

export const getServicioMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getServicioMaster");
  const serviciosMasterFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [1];
      var serviciosMaster: Record<string, any> = {};
      var serviciosMasterJSON = jsonUtils.sequelizeToJSON(serviciosMaster);
      //jsonUtils.prettyPrint(serviciosMasterJSON);
      var serviciosMasterObfuscated = serviciosMasterJSON;
      //jsonUtils.prettyPrint(serviciosMasterObfuscated);
      var serviciosMasterFiltered = jsonUtils.removeAttributesPrivates(serviciosMasterObfuscated);
      //jsonUtils.prettyPrint(serviciosMaster);
      return serviciosMasterFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, serviciosMasterFiltered);
};

export const updateServicio = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateServicio");
  const { id } = req.params;
  const servicioUpdateSchema = yup
    .object()
    .shape({
      servicioid: yup.string().trim().required().min(36).max(36),
      nombre: yup.string().trim().required().min(2).max(50),
      alias: yup.string().trim().required().min(2).max(50),
      descripcion: yup.string().trim().min(2).max(500),
      urlcontrato: yup.string().trim().min(2).max(500),
      pathroute: yup.string().trim().min(2).max(100),
    })
    .required();
  const servicioValidated = servicioUpdateSchema.validateSync({ servicioid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "servicioValidated:", servicioValidated);

  const servicioUpdated = await prismaFT.client.$transaction(
    async (tx) => {
      var servicio = await servicioDao.getServicioByServicioid(tx, servicioValidated.servicioid);
      if (!servicio) {
        log.warn(line(), "Servicio no existe: [" + servicioValidated.servicioid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const servicioToUpdate: Prisma.servicioUpdateInput = {
        nombre: servicioValidated.nombre,
        alias: servicioValidated.alias,
        descripcion: servicioValidated.descripcion,
        urlcontrato: servicioValidated.urlcontrato,
        pathroute: servicioValidated.pathroute,
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
      };

      const servicioUpdated = await servicioDao.updateServicio(tx, servicioValidated.servicioid, servicioToUpdate);
      log.debug(line(), "servicioUpdated:", servicioUpdated);

      return servicioUpdated;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 200, servicioUpdated);
};

export const getServicios = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getServicios");

  const servicios = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [1, 2];
      const servicios = await servicioDao.getServicios(tx, filter_estado);
      return servicios;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, servicios);
};

export const createServicio = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createServicio");
  const session_idusuario = req.session_user.usuario.idusuario;
  const filter_estado = [1, 2];
  const servicioCreateSchema = yup
    .object()
    .shape({
      nombre: yup.string().trim().required().min(2).max(50),
      alias: yup.string().trim().required().min(2).max(50),
      descripcion: yup.string().trim().required().min(2).max(500),
      urlcontrato: yup.string().trim().required().min(2).max(500),
      pathroute: yup.string().trim().required().min(2).max(100),
    })
    .required();
  var servicioValidated = servicioCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "servicioValidated:", servicioValidated);

  const servicioCreated = await prismaFT.client.$transaction(
    async (tx) => {
      const servicioCreate = {
        servicioid: uuidv4(),
        code: uuidv4().split("-")[0],
        nombre: servicioValidated.nombre,
        alias: servicioValidated.alias,
        descripcion: servicioValidated.descripcion,
        urlcontrato: servicioValidated.urlcontrato,
        pathroute: servicioValidated.pathroute,
        idusuariocrea: req.session_user.usuario.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const servicioCreated = await servicioDao.insertServicio(tx, servicioCreate);

      return servicioCreated;
    },
    { timeout: prismaFT.transactionTimeout },
  );
  response(res, 201, servicioCreated);
};
