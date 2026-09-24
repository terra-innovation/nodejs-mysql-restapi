import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import * as yup from "yup";
import * as facturaService from "#src/services/empresario/factura.Service.js";

export const getFacturasByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFacturasByFactoringid");
  const { id } = req.params;
  const facturaSearchSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const facturaValidated = facturaSearchSchema.validateSync(
    { factoringid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "facturaValidated:", facturaValidated);

  const facturasJson = await facturaService.getFacturasByFactoringidService({
    factoringid: facturaValidated.factoringid,
  });

  response(res, 201, facturasJson);
};

export const activateFactura = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateFactura");
  const { id } = req.params;
  const facturaSchema = yup
    .object()
    .shape({
      facturaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const facturaValidated = facturaSchema.validateSync(
    { facturaid: id },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "facturaValidated:", facturaValidated);

  const facturaActivated = await facturaService.activateFacturaService({
    facturaid: facturaValidated.facturaid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, facturaActivated);
};

export const deleteFactura = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteFactura");
  const { id } = req.params;
  const facturaSchema = yup
    .object()
    .shape({
      facturaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const facturaValidated = facturaSchema.validateSync(
    { facturaid: id },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "facturaValidated:", facturaValidated);

  const facturaDeleted = await facturaService.deleteFacturaService({
    facturaid: facturaValidated.facturaid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, facturaDeleted);
};

export const getFacturaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFacturaMaster");
  const facturasMasterFiltered = await facturaService.getFacturaMasterService();
  response(res, 201, facturasMasterFiltered);
};

export const getFacturas = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFacturas");
  const facturasJson = await facturaService.getFacturasService();
  response(res, 201, facturasJson);
};
