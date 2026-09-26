import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import * as yup from "yup";
import {
  activateFactoringService,
  deleteFactoringService,
  getFactoringMasterService,
  getFactoringsService,
  updateFactoringService,
} from "#src/services/admin/factoring.Service.js";

export const activateFactoring = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateFactoring");
  const { id } = req.params;
  const factoringSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const validated = factoringSchema.validateSync({ factoringid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringValidated:", validated);

  const data = await activateFactoringService({
    factoringid: validated.factoringid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, data);
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

  const validated = factoringSchema.validateSync({ factoringid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "factoringValidated:", validated);

  const data = await deleteFactoringService({
    factoringid: validated.factoringid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, data);
};

export const updateFactoring = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateFactoring");
  const { id } = req.params;
  const factoringUpdateSchema = yup.object().shape({
    factoringid: yup.string().trim().required().min(36).max(36),
    factoringpropuestaaceptadaid: yup.string().trim().min(36).max(36),
  });

  const validated = factoringUpdateSchema.validateSync(
    { factoringid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "factoringValidated:", validated);

  await updateFactoringService({
    factoringid: validated.factoringid,
    factoringpropuestaaceptadaid: validated.factoringpropuestaaceptadaid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 200, {});
};

export const getFactoringMaster = async (_req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringsMaster");
  const data = await getFactoringMasterService();
  response(res, 201, data);
};

export const getFactorings = async (_req: Request, res: Response) => {
  log.debug(line(), "controller::getFactorings");
  const data = await getFactoringsService();
  response(res, 201, data);
};
