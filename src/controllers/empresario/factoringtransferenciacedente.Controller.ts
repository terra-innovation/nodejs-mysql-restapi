import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import * as yup from "yup";
import { sendFileAsync, setDownloadHeaders } from "#src/utils/httpUtils.js";
import * as factoringtransferenciacedenteService from "#src/services/empresario/factoringtransferenciacedente.Service.js";

export const downloadConstanciaFactoringtransferenciacedente = async (req: Request, res: Response) => {
  log.debug(line(), "controller::downloadFactoringtransferenciacedentePDF");
  const { factoringtransferenciacedenteid } = req.params;
  const schema = yup
    .object()
    .shape({
      factoringtransferenciacedenteid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const validated = schema.validateSync(
    { factoringtransferenciacedenteid },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "validated:", validated);

  const { rutaAbsoluta, nombreoriginal } =
    await factoringtransferenciacedenteService.downloadConstanciaFactoringtransferenciacedenteService({
      factoringtransferenciacedenteid: validated.factoringtransferenciacedenteid,
    });

  setDownloadHeaders(res, nombreoriginal);
  await sendFileAsync(req, res, rutaAbsoluta);
};

export const getFactoringtransferenciacedentesByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringtransferenciacedentesByFactoringid");
  const { factoringid } = req.params;
  const factoringtransferenciacedenteSearchSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringtransferenciacedenteValidated = factoringtransferenciacedenteSearchSchema.validateSync(
    { factoringid: factoringid, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "factoringtransferenciacedenteValidated:", factoringtransferenciacedenteValidated);

  const factoringtransferenciacedentesJson =
    await factoringtransferenciacedenteService.getFactoringtransferenciacedentesByFactoringidService({
      factoringid: factoringtransferenciacedenteValidated.factoringid,
    });

  response(res, 201, factoringtransferenciacedentesJson);
};
