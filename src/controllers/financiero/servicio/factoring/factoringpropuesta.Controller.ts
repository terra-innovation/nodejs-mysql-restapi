import { Request, Response } from "express";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { sendFileAsync, setDownloadHeaders } from "#src/utils/httpUtils.js";
import { unlink } from "fs/promises";
import * as yup from "yup";
import {
  generateFactoringpropuestaPDFService,
  getFactoringpropuestasByFactoringidService,
  getFactoringpropuestaMasterService,
  getFactoringpropuestasService,
} from "#root/src/services/financiero/factoringpropuesta.Service.js";

export const downloadFactoringpropuestaPDF = async (req: Request, res: Response) => {
  log.debug(line(), "controller::downloadFactoringpropuestaPDF");
  const { id } = req.params;
  const factoringpropuestaUpdateSchema = yup
    .object()
    .shape({
      factoringpropuestaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringpropuestaValidated = factoringpropuestaUpdateSchema.validateSync(
    { factoringpropuestaid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "factoringpropuestaValidated:", factoringpropuestaValidated);

  const { filePath, filenameDownload } = await generateFactoringpropuestaPDFService(
    factoringpropuestaValidated.factoringpropuestaid,
  );

  try {
    setDownloadHeaders(res, filenameDownload);
    await sendFileAsync(req, res, filePath);
  } finally {
    await unlink(filePath);
  }
};

export const getFactoringpropuestasByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestasByFactoringid");
  const { id } = req.params;
  const factoringpropuestaSearchSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringpropuestaValidated = factoringpropuestaSearchSchema.validateSync(
    { factoringid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "factoringpropuestaValidated:", factoringpropuestaValidated);

  const factoringpropuestasJson = await getFactoringpropuestasByFactoringidService(
    factoringpropuestaValidated.factoringid,
  );
  response(res, 201, factoringpropuestasJson);
};

export const getFactoringpropuestaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestaMaster");
  const factoringpropuestasMasterFiltered = await getFactoringpropuestaMasterService();
  response(res, 201, factoringpropuestasMasterFiltered);
};

export const getFactoringpropuestas = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestas");
  const factoringpropuestasJson = await getFactoringpropuestasService();
  response(res, 201, factoringpropuestasJson);
};
