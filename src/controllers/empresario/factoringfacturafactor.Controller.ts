import { Request, Response } from "express";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import * as yup from "yup";
import { sendFileAsync, setDownloadHeaders } from "#src/utils/httpUtils.js";
import {
  getFactoringfacturafactoresByFactoringidService,
  getDownloadArchivoInfoService,
} from "#root/src/services/empresario/factoringfacturafactor.Service.js";

export const getFactoringfacturafactoresByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringfacturafactoresByFactoringid");
  const { factoringid } = req.params;
  const factoringfacturafactorSearchSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const validated = factoringfacturafactorSearchSchema.validateSync(
    { factoringid, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "validated:", validated);

  const list = await getFactoringfacturafactoresByFactoringidService(validated.factoringid);
  response(res, 201, list);
};

export const downloadArchivoByArchivoid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::downloadArchivoByArchivoid");
  const { archivoid } = req.params;
  const schema = yup
    .object()
    .shape({
      archivoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const validated = schema.validateSync({ archivoid }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "validated:", validated);

  const { rutaAbsoluta, nombreoriginal } = await getDownloadArchivoInfoService(validated.archivoid);

  setDownloadHeaders(res, nombreoriginal);
  await sendFileAsync(req, res, rutaAbsoluta);
};
