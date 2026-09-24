import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import * as yup from "yup";
import { sendFileAsync, setDownloadHeaders } from "#src/utils/httpUtils.js";
import { unlink } from "fs/promises";
import * as factoringliquidacionService from "#src/services/empresario/factoringliquidacion.Service.js";

export const downloadFactoringliquidacionPDF = async (req: Request, res: Response) => {
  log.debug(line(), "controller::downloadFactoringliquidacionPDF");
  const { factoringliquidacionid } = req.params;
  const schema = yup
    .object()
    .shape({
      factoringliquidacionid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const validated = schema.validateSync({ factoringliquidacionid }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "validated:", validated);

  const { filePath, filenameDownload } =
    await factoringliquidacionService.generateFactoringliquidacionPDFService({
      factoringliquidacionid: validated.factoringliquidacionid,
    });

  setDownloadHeaders(res, filenameDownload);
  await sendFileAsync(req, res, filePath);
  await unlink(filePath);
};

export const getFactoringliquidacionsByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringliquidacionsByFactoringid");
  const { factoringid } = req.params;
  const factoringliquidacionSearchSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringliquidacionValidated = factoringliquidacionSearchSchema.validateSync(
    { factoringid: factoringid, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "factoringliquidacionValidated:", factoringliquidacionValidated);

  const factoringliquidacionsJson =
    await factoringliquidacionService.getFactoringliquidacionsByFactoringidService({
      factoringid: factoringliquidacionValidated.factoringid,
    });

  response(res, 201, factoringliquidacionsJson);
};
