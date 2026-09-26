import * as factoringpropuestahistorialestadoService from "#root/src/services/admin/factoringpropuestahistorialestado.Service.js";
import type {
  CreateFactoringpropuestahistorialestadoDto,
  FactoringpropuestahistorialestadoIdDto,
  GetFactoringpropuestahistorialestadosByFactoringpropuestaidDto,
  UpdateFactoringpropuestahistorialestadoDto,
} from "#root/src/services/admin/factoringpropuestahistorialestado.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import * as yup from "yup";

export const updateFactoringpropuestahistorialestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateFactoringpropuestahistorialestado");
  const { id } = req.params;
  const factoringpropuestahistorialestadoUpdateSchema = yup
    .object()
    .shape({
      factoringpropuestahistorialestadoid: yup.string().trim().required().min(36).max(36),
      comentario: yup.string().trim().required().min(2).max(65535),
    })
    .required();
  const factoringpropuestahistorialestadoValidated =
    factoringpropuestahistorialestadoUpdateSchema.validateSync(
      { factoringpropuestahistorialestadoid: id, ...req.body },
      { abortEarly: false, stripUnknown: true },
    ) as UpdateFactoringpropuestahistorialestadoDto;
  log.debug(line(), "factoringpropuestahistorialestadoValidated:", factoringpropuestahistorialestadoValidated);

  await factoringpropuestahistorialestadoService.updateFactoringpropuestahistorialestadoService(
    factoringpropuestahistorialestadoValidated,
    req.session_user.usuario.idusuario,
  );

  response(res, 200, { ...factoringpropuestahistorialestadoValidated });
};

export const getFactoringpropuestahistorialestadosByFactoringpropuestaid = async (
  req: Request,
  res: Response,
) => {
  log.debug(line(), "controller::getFactoringpropuestahistorialestadosByFactoringpropuestaid");
  const { id } = req.params;
  const factoringpropuestahistorialestadoSchema = yup
    .object()
    .shape({
      factoringpropuestaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringpropuestahistorialestadoValidated =
    factoringpropuestahistorialestadoSchema.validateSync(
      { factoringpropuestaid: id, ...req.body },
      { abortEarly: false, stripUnknown: true },
    ) as GetFactoringpropuestahistorialestadosByFactoringpropuestaidDto;
  log.debug(line(), "factoringpropuestahistorialestadoValidated:", factoringpropuestahistorialestadoValidated);

  const factoringpropuestahistorialestados =
    await factoringpropuestahistorialestadoService.getFactoringpropuestahistorialestadosByFactoringpropuestaidService(
      factoringpropuestahistorialestadoValidated,
    );

  response(res, 201, factoringpropuestahistorialestados);
};

export const getFactoringpropuestahistorialestadoMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestahistorialestadoMaster");

  const masterData =
    await factoringpropuestahistorialestadoService.getFactoringpropuestahistorialestadoMasterService();

  response(res, 201, masterData);
};

export const createFactoringpropuestahistorialestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createFactoringpropuestahistorialestado");

  const factoringpropuestahistorialestadoSchema = yup
    .object()
    .shape({
      factoringpropuestaid: yup.string().trim().required().min(36).max(36),
      factoringpropuestaestadoid: yup.string().trim().required().min(36).max(36),
      comentario: yup.string().trim().required().min(2).max(65535),
    })
    .required();
  const factoringpropuestahistorialestadoValidated =
    factoringpropuestahistorialestadoSchema.validateSync(
      { ...req.body },
      { abortEarly: false, stripUnknown: true },
    ) as CreateFactoringpropuestahistorialestadoDto;
  log.debug(line(), "factoringpropuestahistorialestadoValidated:", factoringpropuestahistorialestadoValidated);

  await factoringpropuestahistorialestadoService.createFactoringpropuestahistorialestadoService(
    factoringpropuestahistorialestadoValidated,
    req.session_user.usuario.idusuario,
  );

  response(res, 201, { ...factoringpropuestahistorialestadoValidated });
};

export const activateFactoringpropuestahistorialestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateFactoringpropuestahistorialestado");
  const { id } = req.params;
  const factoringpropuestahistorialestadoSchema = yup
    .object()
    .shape({
      factoringpropuestahistorialestadoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringpropuestahistorialestadoValidated =
    factoringpropuestahistorialestadoSchema.validateSync(
      { factoringpropuestahistorialestadoid: id },
      { abortEarly: false, stripUnknown: true },
    ) as FactoringpropuestahistorialestadoIdDto;
  log.debug(line(), "factoringpropuestahistorialestadoValidated:", factoringpropuestahistorialestadoValidated);

  const factoringpropuestahistorialestadoActivated =
    await factoringpropuestahistorialestadoService.activateFactoringpropuestahistorialestadoService(
      factoringpropuestahistorialestadoValidated,
      req.session_user.usuario.idusuario,
    );

  response(res, 204, factoringpropuestahistorialestadoActivated);
};

export const deleteFactoringpropuestahistorialestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteFactoringpropuestahistorialestado");
  const { id } = req.params;
  const factoringpropuestahistorialestadoSchema = yup
    .object()
    .shape({
      factoringpropuestahistorialestadoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringpropuestahistorialestadoValidated =
    factoringpropuestahistorialestadoSchema.validateSync(
      { factoringpropuestahistorialestadoid: id },
      { abortEarly: false, stripUnknown: true },
    ) as FactoringpropuestahistorialestadoIdDto;
  log.debug(line(), "factoringpropuestahistorialestadoValidated:", factoringpropuestahistorialestadoValidated);

  const factoringpropuestahistorialestadoDeleted =
    await factoringpropuestahistorialestadoService.deleteFactoringpropuestahistorialestadoService(
      factoringpropuestahistorialestadoValidated,
      req.session_user.usuario.idusuario,
    );

  response(res, 204, factoringpropuestahistorialestadoDeleted);
};

export const getFactoringpropuestahistorialestados = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestahistorialestados");

  const factoringpropuestahistorialestados =
    await factoringpropuestahistorialestadoService.getFactoringpropuestahistorialestadosService();

  response(res, 201, factoringpropuestahistorialestados);
};
