import { Request, Response } from "express";
import * as yup from "yup";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";

import {
  activateFactoringinversionistaverificacionService,
  createFactoringinversionistaverificacionService,
  deleteFactoringinversionistaverificacionService,
  getFactoringinversionistasByVerificacionService,
  getFactoringinversionistaverificacionMasterService,
  getServicioinversionistaverificacionsByServicioinversionistaidService,
  updateFactoringinversionistaverificacionService,
  type ServicioInversionistaVerificacionCreateDto,
  type ServicioInversionistaVerificacionUpdateDto,
} from "#src/services/factoringinversionistaverificacion.Service.js";

export const getServicioinversionistaverificacionsByServicioinversionistaid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getServicioinversionistaverificacionsByServicioinversionistaid");
  const { servicioinversionistaid } = req.params;
  const servicioinversionistaverificacionSchema = yup
    .object()
    .shape({
      servicioinversionistaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const validated = servicioinversionistaverificacionSchema.validateSync(
    { servicioinversionistaid, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );

  const data = await getServicioinversionistaverificacionsByServicioinversionistaidService(validated.servicioinversionistaid);
  response(res, 201, data);
};

export const updateFactoringinversionistaverificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateFactoringinversionistaverificacion");
  const { servicioinversionistaverificacionid } = req.params;
  const servicioinversionistaverificacionSchema = yup
    .object()
    .shape({
      servicioinversionistaverificacionid: yup.string().min(36).max(36).required(),
      servicioinversionistaestadoid: yup.string().min(36).max(36).required(),
      comentariousuario: yup.string().trim().max(20000),
      comentariointerno: yup.string().trim().max(20000).required(),
      archivos: yup.array().of(yup.string().min(36).max(36)),
    })
    .required();
  const validated = servicioinversionistaverificacionSchema.validateSync(
    { servicioinversionistaverificacionid, ...req.body },
    { abortEarly: false, stripUnknown: true },
  ) as unknown as ServicioInversionistaVerificacionUpdateDto;

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  const data = await updateFactoringinversionistaverificacionService(validated, idusuario);
  response(res, 200, data);
};

export const createFactoringinversionistaverificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createFactoringinversionistaverificacion");
  const servicioinversionistaverificacionCreateSchema = yup
    .object()
    .shape({
      servicioinversionistaid: yup.string().min(36).max(36).required(),
      servicioinversionistaestadoid: yup.string().min(36).max(36).required(),
      comentariousuario: yup.string().trim().max(20000),
      comentariointerno: yup.string().trim().max(20000).required(),
      archivos: yup.array().of(yup.string().min(36).max(36)),
    })
    .required();
  const validated = servicioinversionistaverificacionCreateSchema.validateSync(
    req.body,
    { abortEarly: false, stripUnknown: true },
  ) as unknown as ServicioInversionistaVerificacionCreateDto;

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  const data = await createFactoringinversionistaverificacionService(validated, idusuario);
  response(res, 201, data);
};

export const getFactoringinversionistasByVerificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringinversionistasByVerificacion");
  const data = await getFactoringinversionistasByVerificacionService();
  response(res, 201, data);
};

export const getFactoringinversionistaverificacionMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringinversionistaverificacionMaster");
  const data = await getFactoringinversionistaverificacionMasterService();
  response(res, 201, data);
};

export const activateFactoringinversionistaverificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateServicioinversionistaverificacion");
  const { servicioinversionistaverificacionid } = req.params;
  const servicioinversionistaverificacionSchema = yup
    .object()
    .shape({
      servicioinversionistaverificacionid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const validated = servicioinversionistaverificacionSchema.validateSync(
    { servicioinversionistaverificacionid },
    { abortEarly: false, stripUnknown: true },
  );

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  const data = await activateFactoringinversionistaverificacionService(validated.servicioinversionistaverificacionid, idusuario);
  response(res, 204, data);
};

export const deleteFactoringinversionistaverificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteServicioinversionistaverificacion");
  const { servicioinversionistaverificacionid } = req.params;
  const servicioinversionistaverificacionSchema = yup
    .object()
    .shape({
      servicioinversionistaverificacionid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const validated = servicioinversionistaverificacionSchema.validateSync(
    { servicioinversionistaverificacionid },
    { abortEarly: false, stripUnknown: true },
  );

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  const data = await deleteFactoringinversionistaverificacionService(validated.servicioinversionistaverificacionid, idusuario);
  response(res, 204, data);
};
