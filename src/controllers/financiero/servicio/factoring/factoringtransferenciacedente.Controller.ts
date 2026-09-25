import { Request, Response } from "express";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import * as yup from "yup";
import {
  sendCorreoFactoringtransferenciacedenteService,
  getFactoringtransferenciacedentesByFactoringidService,
  getFactoringtransferenciacedenteMasterByFactoringidService,
} from "#root/src/services/financiero/factoringtransferenciacedente.Service.js";

export const sendCorreoFactoringtransferenciacedente = async (req: Request, res: Response) => {
  log.debug(line(), "controller::sendCorreoFactoringtransferenciacedente");
  const { id } = req.params;
  const factoringtransferenciacedenteUpdateSchema = yup
    .object()
    .shape({
      factoringtransferenciacedenteid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringtransferenciacedenteValidated = factoringtransferenciacedenteUpdateSchema.validateSync(
    { factoringtransferenciacedenteid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "factoringtransferenciacedenteValidated:", factoringtransferenciacedenteValidated);

  await sendCorreoFactoringtransferenciacedenteService(
    factoringtransferenciacedenteValidated.factoringtransferenciacedenteid,
  );
  response(res, 200, {});
};

export const getFactoringtransferenciacedentesByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringtransferenciacedentesByFactoringid");
  const { id } = req.params;
  const factoringtransferenciacedenteSearchSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringtransferenciacedenteValidated = factoringtransferenciacedenteSearchSchema.validateSync(
    { factoringid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "factoringtransferenciacedenteValidated:", factoringtransferenciacedenteValidated);

  const factoringtransferenciacedentesJson = await getFactoringtransferenciacedentesByFactoringidService(
    factoringtransferenciacedenteValidated.factoringid,
  );
  response(res, 201, factoringtransferenciacedentesJson);
};

export const getFactoringtransferenciacedenteMasterByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringtransferenciacedenteMaster");
  const { factoringid } = req.params;
  const factoringtransferenciacedenteSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringtransferenciacedenteValidated = factoringtransferenciacedenteSchema.validateSync(
    { factoringid },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "factoringtransferenciacedenteValidated:", factoringtransferenciacedenteValidated);

  const factoringtransferenciacedentesMasterFiltered =
    await getFactoringtransferenciacedenteMasterByFactoringidService(
      factoringtransferenciacedenteValidated.factoringid,
    );
  response(res, 201, factoringtransferenciacedentesMasterFiltered);
};
