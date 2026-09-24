import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import * as yup from "yup";
import * as facturaService from "#src/services/empresario/factura.Service.js";

export const subirFactura = async (req: Request, res: Response) => {
  log.debug(line(), "controller::subirFactura");

  const facturaVerifySchema = yup
    .object()
    .shape({
      factura_xml: yup.string().trim().required().min(36).max(36),
      factura_pdf: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const facturaValidated = facturaVerifySchema.validateSync(
    { ...req.files, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "facturaValidated:", facturaValidated);

  const facturaFiltered = await facturaService.subirFacturaService({
    factura_xml: facturaValidated.factura_xml,
    factura_pdf: facturaValidated.factura_pdf,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 200, facturaFiltered);
};
