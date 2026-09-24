import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import * as yup from "yup";
import * as cedentelimiteService from "#src/services/cedentelimite.Service.js";

export const getCedentelimites = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getCedentelimites");
  const cedentelimites = await cedentelimiteService.getCedentelimitesService();
  response(res, 201, cedentelimites);
};

export const createCedentelimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createCedentelimite");
  const cedentelimiteCreateSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
      total: yup.number().required().positive(),
      usado: yup.number().min(0).default(0),
      disponible: yup.number().min(0),
    })
    .required();

  const cedentelimiteValidated = cedentelimiteCreateSchema.validateSync(
    req.body,
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "cedentelimiteValidated:", cedentelimiteValidated);

  const cedentelimiteCreated = await cedentelimiteService.createCedentelimiteService({
    empresaid: cedentelimiteValidated.empresaid,
    monedaid: cedentelimiteValidated.monedaid,
    total: cedentelimiteValidated.total,
    usado: cedentelimiteValidated.usado,
    disponible: cedentelimiteValidated.disponible,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 201, cedentelimiteCreated);
};

export const updateCedentelimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateCedentelimite");
  const { id } = req.params;
  const cedentelimiteUpdateSchema = yup
    .object()
    .shape({
      cedentelimiteid: yup.string().trim().required().min(36).max(36),
      total: yup.number().required().positive(),
      usado: yup.number().min(0).default(0),
      disponible: yup.number().min(0),
    })
    .required();

  const cedentelimiteValidated = cedentelimiteUpdateSchema.validateSync(
    { cedentelimiteid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "cedentelimiteValidated:", cedentelimiteValidated);

  await cedentelimiteService.updateCedentelimiteService({
    cedentelimiteid: cedentelimiteValidated.cedentelimiteid,
    total: cedentelimiteValidated.total,
    usado: cedentelimiteValidated.usado,
    disponible: cedentelimiteValidated.disponible,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 200, {});
};

export const deleteCedentelimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteCedentelimite");
  const { id } = req.params;
  const cedentelimiteSchema = yup
    .object()
    .shape({
      cedentelimiteid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const cedentelimiteValidated = cedentelimiteSchema.validateSync(
    { cedentelimiteid: id },
    { abortEarly: false, stripUnknown: true },
  );

  const result = await cedentelimiteService.deleteCedentelimiteService({
    cedentelimiteid: cedentelimiteValidated.cedentelimiteid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, result);
};

export const activateCedentelimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateCedentelimite");
  const { id } = req.params;
  const cedentelimiteSchema = yup
    .object()
    .shape({
      cedentelimiteid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const cedentelimiteValidated = cedentelimiteSchema.validateSync(
    { cedentelimiteid: id },
    { abortEarly: false, stripUnknown: true },
  );

  const result = await cedentelimiteService.activateCedentelimiteService({
    cedentelimiteid: cedentelimiteValidated.cedentelimiteid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, result);
};

export const getCedentelimiteMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getCedentelimiteMaster");
  const cedentelimiteMasterFiltered = await cedentelimiteService.getCedentelimiteMasterService();
  response(res, 201, cedentelimiteMasterFiltered);
};
