import * as archivofacturaService from "#root/src/services/admin/archivofactura.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import * as yup from "yup";

export const getArchivofacturasByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getArchivofacturasByFactoringid");
  const { id } = req.params;
  const archivofacturaSearchSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const archivofacturaValidated = archivofacturaSearchSchema.validateSync({ factoringid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "archivofacturaValidated:", archivofacturaValidated);

  const archivofacturas = await archivofacturaService.getArchivofacturasByFactoringidService({
    factoringid: archivofacturaValidated.factoringid,
  });

  response(res, 201, archivofacturas);
};
