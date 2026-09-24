import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import * as yup from "yup";
import * as pagadorlimiteService from "#src/services/pagadorlimite.Service.js";

export const getPagadorlimites = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getPagadorlimites");
  const pagadorlimites = await pagadorlimiteService.getPagadorlimitesService();
  response(res, 201, pagadorlimites);
};

export const createPagadorlimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createPagadorlimite");
  const pagadorlimiteCreateSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
      total: yup.number().required().positive(),
      usado: yup.number().min(0).default(0),
      disponible: yup.number().min(0),
    })
    .required();

  const pagadorlimiteValidated = pagadorlimiteCreateSchema.validateSync(
    req.body,
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "pagadorlimiteValidated:", pagadorlimiteValidated);

  const pagadorlimiteCreated = await pagadorlimiteService.createPagadorlimiteService({
    empresaid: pagadorlimiteValidated.empresaid,
    monedaid: pagadorlimiteValidated.monedaid,
    total: pagadorlimiteValidated.total,
    usado: pagadorlimiteValidated.usado,
    disponible: pagadorlimiteValidated.disponible,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 201, pagadorlimiteCreated);
};

export const updatePagadorlimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updatePagadorlimite");
  const { id } = req.params;
  const pagadorlimiteUpdateSchema = yup
    .object()
    .shape({
      pagadorlimiteid: yup.string().trim().required().min(36).max(36),
      total: yup.number().required().positive(),
      usado: yup.number().min(0).default(0),
      disponible: yup.number().min(0),
    })
    .required();

  const pagadorlimiteValidated = pagadorlimiteUpdateSchema.validateSync(
    { pagadorlimiteid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "pagadorlimiteValidated:", pagadorlimiteValidated);

  await pagadorlimiteService.updatePagadorlimiteService({
    pagadorlimiteid: pagadorlimiteValidated.pagadorlimiteid,
    total: pagadorlimiteValidated.total,
    usado: pagadorlimiteValidated.usado,
    disponible: pagadorlimiteValidated.disponible,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 200, {});
};

export const deletePagadorlimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deletePagadorlimite");
  const { id } = req.params;
  const pagadorlimiteSchema = yup
    .object()
    .shape({
      pagadorlimiteid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const pagadorlimiteValidated = pagadorlimiteSchema.validateSync(
    { pagadorlimiteid: id },
    { abortEarly: false, stripUnknown: true },
  );

  const result = await pagadorlimiteService.deletePagadorlimiteService({
    pagadorlimiteid: pagadorlimiteValidated.pagadorlimiteid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, result);
};

export const activatePagadorlimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activatePagadorlimite");
  const { id } = req.params;
  const pagadorlimiteSchema = yup
    .object()
    .shape({
      pagadorlimiteid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const pagadorlimiteValidated = pagadorlimiteSchema.validateSync(
    { pagadorlimiteid: id },
    { abortEarly: false, stripUnknown: true },
  );

  const result = await pagadorlimiteService.activatePagadorlimiteService({
    pagadorlimiteid: pagadorlimiteValidated.pagadorlimiteid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, result);
};

export const getPagadorlimiteMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getPagadorlimiteMaster");
  const pagadorlimiteMasterFiltered = await pagadorlimiteService.getPagadorlimiteMasterService();
  response(res, 201, pagadorlimiteMasterFiltered);
};
