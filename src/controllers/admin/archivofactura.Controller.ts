import * as archivofacturaService from "#root/src/services/admin/archivofactura.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput } from "#src/utils/validationInputs.js";

export const getArchivofacturasByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getArchivofacturasByFactoringid");
  const { id } = req.params;
  const archivofacturaSearchSchema = objectInput(
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
  const archivofacturaValidated = archivofacturaSearchSchema.parse({ factoringid: id, ...req.body });
  log.debug(line(), "archivofacturaValidated:", archivofacturaValidated);

  const archivofacturas = await archivofacturaService.getArchivofacturasByFactoringidService({
    factoringid: archivofacturaValidated.factoringid,
  });

  response(res, 201, archivofacturas);
};
