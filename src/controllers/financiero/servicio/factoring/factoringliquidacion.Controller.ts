import { Request, Response } from "express";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { sendFileAsync, setDownloadHeaders } from "#src/utils/httpUtils.js";
import { unlink } from "fs/promises";
import * as yup from "yup";
import {
  sendCorreoFactoringliquidacionService,
  getFactoringliquidacionMasterByFactoringidService,
  getFactoringliquidacionDetalleService,
  getFactoringliquidacionByFactoringidService,
  generateFactoringliquidacionPDFService,
} from "#root/src/services/financiero/factoringliquidacion.Service.js";

export const sendCorreoFactoringliquidacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::sendCorreoFactoringliquidacion");
  const { id } = req.params;
  const factoringliquidacionUpdateSchema = yup
    .object()
    .shape({
      factoringliquidacionid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringliquidacionValidated = factoringliquidacionUpdateSchema.validateSync(
    { factoringliquidacionid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "factoringliquidacionValidated:", factoringliquidacionValidated);

  await sendCorreoFactoringliquidacionService(factoringliquidacionValidated.factoringliquidacionid);
  response(res, 200, {});
};

export const getFactoringliquidacionMasterByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringliquidacionMasterByFactoringid");
  const { factoringid } = req.params;
  const usuarioservicioSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringliquidacionValidated = usuarioservicioSchema.validateSync(
    { factoringid },
    { abortEarly: false, stripUnknown: true },
  );

  const result = await getFactoringliquidacionMasterByFactoringidService(factoringliquidacionValidated.factoringid);
  response(res, 200, result);
};

export const getFactoringliquidacionDetalle = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringliquidacionDetalle");
  const { factoringliquidacionid } = req.params;
  const schema = yup
    .object()
    .shape({
      factoringliquidacionid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const validated = schema.validateSync({ factoringliquidacionid }, { abortEarly: false, stripUnknown: true });

  const result = await getFactoringliquidacionDetalleService(validated.factoringliquidacionid);
  response(res, 200, result);
};

export const getFactoringliquidacionByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringliquidacionByFactoringid");
  const { factoringid } = req.params;
  const factoringliquidacionSearchSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringliquidacionValidated = factoringliquidacionSearchSchema.validateSync(
    { factoringid, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "factoringliquidacionValidated:", factoringliquidacionValidated);

  const factoringliquidacionesJson = await getFactoringliquidacionByFactoringidService(
    factoringliquidacionValidated.factoringid,
  );
  response(res, 200, factoringliquidacionesJson);
};

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

  const { filePath, filenameDownload } = await generateFactoringliquidacionPDFService(validated.factoringliquidacionid);

  try {
    setDownloadHeaders(res, filenameDownload);
    await sendFileAsync(req, res, filePath);
  } finally {
    await unlink(filePath);
  }
};
