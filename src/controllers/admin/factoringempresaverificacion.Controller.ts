import { Request, Response } from "express";
import * as yup from "yup";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";

import {
  activateFactoringempresaverificacionService,
  createFactoringempresaverificacionService,
  deleteFactoringempresaverificacionService,
  getFactoringempresasByVerificacionService,
  getFactoringempresaverificacionMasterService,
  getServicioempresaverificacionsByServicioempresaidService,
  updateFactoringempresaverificacionService,
  type ServicioEmpresaVerificacionCreateDto,
  type ServicioEmpresaVerificacionUpdateDto,
} from "#src/services/factoringempresaverificacion.Service.js";

export const getServicioempresaverificacionsByServicioempresaid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getServicioempresaverificacionsByServicioempresaid");
  const { servicioempresaid } = req.params;
  const servicioempresaverificacionSchema = yup
    .object()
    .shape({
      servicioempresaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const validated = servicioempresaverificacionSchema.validateSync(
    { servicioempresaid, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );

  const data = await getServicioempresaverificacionsByServicioempresaidService(validated.servicioempresaid);
  response(res, 201, data);
};

export const updateFactoringempresaverificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateFactoringempresaverificacion");
  const { servicioempresaverificacionid } = req.params;
  const servicioempresaverificacionSchema = yup
    .object()
    .shape({
      servicioempresaverificacionid: yup.string().min(36).max(36).required(),
      servicioempresaestadoid: yup.string().min(36).max(36).required(),
      comentariousuario: yup.string().trim().max(20000),
      comentariointerno: yup.string().trim().max(20000).required(),
      archivos: yup.array().of(yup.string().min(36).max(36)),
    })
    .required();
  const validated = servicioempresaverificacionSchema.validateSync(
    { servicioempresaverificacionid, ...req.body },
    { abortEarly: false, stripUnknown: true },
  ) as unknown as ServicioEmpresaVerificacionUpdateDto;

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  const data = await updateFactoringempresaverificacionService(validated, idusuario);
  response(res, 200, data);
};

export const createFactoringempresaverificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createFactoringempresaverificacion");
  const servicioempresaverificacionCreateSchema = yup
    .object()
    .shape({
      servicioempresaid: yup.string().min(36).max(36).required(),
      servicioempresaestadoid: yup.string().min(36).max(36).required(),
      comentariousuario: yup.string().trim().max(20000),
      comentariointerno: yup.string().trim().max(20000).required(),
      archivos: yup.array().of(yup.string().min(36).max(36)),
    })
    .required();
  const validated = servicioempresaverificacionCreateSchema.validateSync(
    req.body,
    { abortEarly: false, stripUnknown: true },
  ) as unknown as ServicioEmpresaVerificacionCreateDto;

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  const data = await createFactoringempresaverificacionService(validated, idusuario);
  response(res, 201, data);
};

export const getFactoringempresasByVerificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringempresasByVerificacion");
  const data = await getFactoringempresasByVerificacionService();
  response(res, 201, data);
};

export const getFactoringempresaverificacionMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringempresaverificacionMaster");
  const data = await getFactoringempresaverificacionMasterService();
  response(res, 201, data);
};

export const activateFactoringempresaverificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateServicioempresaverificacion");
  const { servicioempresaverificacionid } = req.params;
  const servicioempresaverificacionSchema = yup
    .object()
    .shape({
      servicioempresaverificacionid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const validated = servicioempresaverificacionSchema.validateSync(
    { servicioempresaverificacionid },
    { abortEarly: false, stripUnknown: true },
  );

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  const data = await activateFactoringempresaverificacionService(validated.servicioempresaverificacionid, idusuario);
  response(res, 204, data);
};

export const deleteFactoringempresaverificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteServicioempresaverificacion");
  const { servicioempresaverificacionid } = req.params;
  const servicioempresaverificacionSchema = yup
    .object()
    .shape({
      servicioempresaverificacionid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const validated = servicioempresaverificacionSchema.validateSync(
    { servicioempresaverificacionid },
    { abortEarly: false, stripUnknown: true },
  );

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  const data = await deleteFactoringempresaverificacionService(validated.servicioempresaverificacionid, idusuario);
  response(res, 204, data);
};
