import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import * as yup from "yup";
import * as factorlimiteService from "#src/services/factorlimite.Service.js";

export const getFactorlimites = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactorlimites");
  const factorlimites = await factorlimiteService.getFactorlimitesService();
  response(res, 201, factorlimites);
};

export const createFactorlimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createFactorlimite");
  const factorlimiteCreateSchema = yup
    .object()
    .shape({
      factorid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
      total: yup.number().required().positive(),
      usado: yup.number().min(0).default(0),
      disponible: yup.number().min(0),
    })
    .required();

  const factorlimiteValidated = factorlimiteCreateSchema.validateSync(
    req.body,
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "factorlimiteValidated:", factorlimiteValidated);

  const factorlimiteCreated = await factorlimiteService.createFactorlimiteService({
    factorid: factorlimiteValidated.factorid,
    monedaid: factorlimiteValidated.monedaid,
    total: factorlimiteValidated.total,
    usado: factorlimiteValidated.usado,
    disponible: factorlimiteValidated.disponible,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 201, factorlimiteCreated);
};

export const updateFactorlimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateFactorlimite");
  const { id } = req.params;
  const factorlimiteUpdateSchema = yup
    .object()
    .shape({
      factorlimiteid: yup.string().trim().required().min(36).max(36),
      total: yup.number().required().positive(),
      usado: yup.number().min(0).default(0),
      disponible: yup.number().min(0),
    })
    .required();

  const factorlimiteValidated = factorlimiteUpdateSchema.validateSync(
    { factorlimiteid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "factorlimiteValidated:", factorlimiteValidated);

  await factorlimiteService.updateFactorlimiteService({
    factorlimiteid: factorlimiteValidated.factorlimiteid,
    total: factorlimiteValidated.total,
    usado: factorlimiteValidated.usado,
    disponible: factorlimiteValidated.disponible,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 200, {});
};

export const deleteFactorlimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteFactorlimite");
  const { id } = req.params;
  const factorlimiteSchema = yup
    .object()
    .shape({
      factorlimiteid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const factorlimiteValidated = factorlimiteSchema.validateSync(
    { factorlimiteid: id },
    { abortEarly: false, stripUnknown: true },
  );

  const result = await factorlimiteService.deleteFactorlimiteService({
    factorlimiteid: factorlimiteValidated.factorlimiteid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, result);
};

export const activateFactorlimite = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateFactorlimite");
  const { id } = req.params;
  const factorlimiteSchema = yup
    .object()
    .shape({
      factorlimiteid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const factorlimiteValidated = factorlimiteSchema.validateSync(
    { factorlimiteid: id },
    { abortEarly: false, stripUnknown: true },
  );

  const result = await factorlimiteService.activateFactorlimiteService({
    factorlimiteid: factorlimiteValidated.factorlimiteid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, result);
};

export const getFactorlimiteMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactorlimiteMaster");
  const factorlimiteMasterFiltered = await factorlimiteService.getFactorlimiteMasterService();
  response(res, 201, factorlimiteMasterFiltered);
};
