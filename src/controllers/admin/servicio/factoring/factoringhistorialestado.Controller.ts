import * as factoringhistorialestadoService from "#root/src/services/admin/factoringhistorialestado.Service.js";
import type {
  CreateFactoringhistorialestadoDto,
  FactoringhistorialestadoIdDto,
  GetFactoringhistorialestadosByFactoringidDto,
  UpdateFactoringhistorialestadoDto,
} from "#root/src/services/admin/factoringhistorialestado.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import * as yup from "yup";

export const updateFactoringhistorialestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateFactoringhistorialestado");
  const { id } = req.params;
  const factoringhistorialestadoUpdateSchema = yup
    .object()
    .shape({
      factoringhistorialestadoid: yup.string().trim().required().min(36).max(36),
      factoringestadoid: yup.string().trim().required().min(36).max(36),
      comentario: yup.string().trim().required().min(2).max(65535),
      archivos: yup.array().of(yup.string().min(36).max(36)),
    })
    .required();
  const factoringhistorialestadoValidated = factoringhistorialestadoUpdateSchema.validateSync(
    { factoringhistorialestadoid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  ) as UpdateFactoringhistorialestadoDto;
  log.debug(line(), "factoringhistorialestadoValidated:", factoringhistorialestadoValidated);

  await factoringhistorialestadoService.updateFactoringhistorialestadoService(
    factoringhistorialestadoValidated,
    req.session_user.usuario.idusuario,
  );

  response(res, 200, { ...factoringhistorialestadoValidated });
};

export const getFactoringhistorialestadosByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringhistorialestadosByFactoringid");
  const { id } = req.params;
  const factoringhistorialestadoSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringhistorialestadoValidated = factoringhistorialestadoSchema.validateSync(
    { factoringid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  ) as GetFactoringhistorialestadosByFactoringidDto;
  log.debug(line(), "factoringhistorialestadoValidated:", factoringhistorialestadoValidated);

  const factoringhistorialestados =
    await factoringhistorialestadoService.getFactoringhistorialestadosByFactoringidService(
      factoringhistorialestadoValidated,
    );

  response(res, 201, factoringhistorialestados);
};

export const getFactoringhistorialestadoMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringhistorialestadoMaster");

  const masterData =
    await factoringhistorialestadoService.getFactoringhistorialestadoMasterService();

  response(res, 201, masterData);
};

export const createFactoringhistorialestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createFactoringhistorialestado");

  const factoringhistorialestadoSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
      factoringestadoid: yup.string().trim().required().min(36).max(36),
      archivos: yup.array().of(yup.string().min(36).max(36)),
      comentario: yup.string().trim().required().min(2).max(65535),
    })
    .required();
  const factoringhistorialestadoValidated = factoringhistorialestadoSchema.validateSync(
    { ...req.body },
    { abortEarly: false, stripUnknown: true },
  ) as CreateFactoringhistorialestadoDto;
  log.debug(line(), "factoringhistorialestadoValidated:", factoringhistorialestadoValidated);

  await factoringhistorialestadoService.createFactoringhistorialestadoService(
    factoringhistorialestadoValidated,
    req.session_user.usuario.idusuario,
  );

  response(res, 201, { ...factoringhistorialestadoValidated });
};

export const activateFactoringhistorialestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateFactoringhistorialestado");
  const { id } = req.params;
  const factoringhistorialestadoSchema = yup
    .object()
    .shape({
      factoringhistorialestadoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringhistorialestadoValidated = factoringhistorialestadoSchema.validateSync(
    { factoringhistorialestadoid: id },
    { abortEarly: false, stripUnknown: true },
  ) as FactoringhistorialestadoIdDto;
  log.debug(line(), "factoringhistorialestadoValidated:", factoringhistorialestadoValidated);

  const factoringhistorialestadoActivated =
    await factoringhistorialestadoService.activateFactoringhistorialestadoService(
      factoringhistorialestadoValidated,
      req.session_user.usuario.idusuario,
    );

  response(res, 204, factoringhistorialestadoActivated);
};

export const deleteFactoringhistorialestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteFactoringhistorialestado");
  const { id } = req.params;
  const factoringhistorialestadoSchema = yup
    .object()
    .shape({
      factoringhistorialestadoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringhistorialestadoValidated = factoringhistorialestadoSchema.validateSync(
    { factoringhistorialestadoid: id },
    { abortEarly: false, stripUnknown: true },
  ) as FactoringhistorialestadoIdDto;
  log.debug(line(), "factoringhistorialestadoValidated:", factoringhistorialestadoValidated);

  const factoringhistorialestadoDeleted =
    await factoringhistorialestadoService.deleteFactoringhistorialestadoService(
      factoringhistorialestadoValidated,
      req.session_user.usuario.idusuario,
    );

  response(res, 204, factoringhistorialestadoDeleted);
};

export const getFactoringhistorialestados = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringhistorialestados");

  const factoringhistorialestados =
    await factoringhistorialestadoService.getFactoringhistorialestadosService();

  response(res, 201, factoringhistorialestados);
};
