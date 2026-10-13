import { Request, Response } from "express";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { z } from "zod";
import { objectInput, stringInput } from "#src/utils/validationInputs.js";
import { sendFileAsync, setDownloadHeaders } from "#src/utils/httpUtils.js";
import { getFactoringfacturafactoresByFactoringidService, getDownloadArchivoInfoService } from "#root/src/services/empresario/factoringfacturafactor.Service.js";

export const getFactoringfacturafactoresByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringfacturafactoresByFactoringid");
  const { factoringid } = req.params;
  const factoringfacturafactorSearchSchema = objectInput(
    z.object({
      factoringid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const validated = factoringfacturafactorSearchSchema.parse({ factoringid, ...req.body });
  log.debug(line(), "validated:", validated);

  const list = await getFactoringfacturafactoresByFactoringidService(validated.factoringid);
  response(res, 201, list);
};

export const downloadArchivoByArchivoid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::downloadArchivoByArchivoid");
  const { archivoid } = req.params;
  const schema = objectInput(
    z.object({
      archivoid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const validated = schema.parse({ archivoid });
  log.debug(line(), "validated:", validated);

  const { rutaAbsoluta, nombreoriginal } = await getDownloadArchivoInfoService(validated.archivoid);

  setDownloadHeaders(res, nombreoriginal);
  await sendFileAsync(req, res, rutaAbsoluta);
};
