import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import * as yup from "yup";
import * as servicioService from "#src/services/servicio.Service.js";

export const activateServicio = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateServicio");
  const { id } = req.params;
  const servicioSchema = yup
    .object()
    .shape({
      servicioid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const servicioValidated = servicioSchema.validateSync(
    { servicioid: id },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "servicioValidated:", servicioValidated);

  await servicioService.activateServicioService({
    servicioid: servicioValidated.servicioid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, {});
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
  const servicioValidated = servicioSchema.validateSync(
    { servicioid: id },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "servicioValidated:", servicioValidated);

  const servicioDeleted = await servicioService.deleteServicioService({
    servicioid: servicioValidated.servicioid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, servicioDeleted);
};

export const getServicioMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getServicioMaster");
  const serviciosMasterFiltered = await servicioService.getServicioMasterService();
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
  const servicioValidated = servicioUpdateSchema.validateSync(
    { servicioid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "servicioValidated:", servicioValidated);

  const servicioUpdated = await servicioService.updateServicioService({
    servicioid: servicioValidated.servicioid,
    nombre: servicioValidated.nombre,
    alias: servicioValidated.alias,
    descripcion: servicioValidated.descripcion,
    urlcontrato: servicioValidated.urlcontrato,
    pathroute: servicioValidated.pathroute,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 200, servicioUpdated);
};

export const getServicios = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getServicios");
  const servicios = await servicioService.getServiciosService();
  response(res, 201, servicios);
};

export const createServicio = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createServicio");
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
  const servicioValidated = servicioCreateSchema.validateSync(
    req.body,
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "servicioValidated:", servicioValidated);

  const servicioCreated = await servicioService.createServicioService({
    nombre: servicioValidated.nombre,
    alias: servicioValidated.alias,
    descripcion: servicioValidated.descripcion,
    urlcontrato: servicioValidated.urlcontrato,
    pathroute: servicioValidated.pathroute,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 201, servicioCreated);
};
