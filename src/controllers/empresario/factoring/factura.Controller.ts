import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput } from "#src/utils/validationInputs.js";
import * as facturaService from "#src/services/empresario/factura.Service.js";

export const subirFactura = async (req: Request, res: Response) => {
  log.debug(line(), "controller::subirFactura");

  const facturaVerifySchema = objectInput(
    z.object({
      factura_xml: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      factura_pdf: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const facturaValidated = facturaVerifySchema.parse({ ...req.files, ...req.body });
  log.debug(line(), "facturaValidated:", facturaValidated);

  const facturaFiltered = await facturaService.subirFacturaService({
    factura_xml: facturaValidated.factura_xml,
    factura_pdf: facturaValidated.factura_pdf,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 200, facturaFiltered);
};
