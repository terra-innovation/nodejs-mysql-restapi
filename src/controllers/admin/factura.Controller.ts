import { Request, Response } from "express";
import * as yup from "yup";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";

import {
  activateFacturaService,
  deleteFacturaService,
  getFacturasByFactoringidService,
  getFacturasService,
  getFacturaMasterService,
  subirFacturaFactorService,
  type SubirFacturaFactorDto,
} from "#src/services/factura.Service.js";

export const subirFacturaFactor = async (req: Request, res: Response) => {
  log.debug(line(), "controller::subirFacturaFactor");

  const session_idusuario = req.session_user?.usuario?.idusuario ?? 1;

  const facturaVerifySchema = yup
    .object()
    .shape({
      factura_xml: yup.string().trim().required().min(36).max(36),
      factura_pdf: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const validated = facturaVerifySchema.validateSync(
    { ...req.files, ...req.body },
    { abortEarly: false, stripUnknown: true },
  ) as unknown as SubirFacturaFactorDto;

  const data = await subirFacturaFactorService(validated, session_idusuario);
  response(res, 200, data);
};

export const getFacturasByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFacturasByFactoringid");
  const { id } = req.params;
  const facturaSearchSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const validated = facturaSearchSchema.validateSync(
    { factoringid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );

  const data = await getFacturasByFactoringidService(validated.factoringid);
  response(res, 201, data);
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
  const validated = facturaSchema.validateSync(
    { facturaid: id },
    { abortEarly: false, stripUnknown: true },
  );

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  const data = await activateFacturaService(validated.facturaid, idusuario);
  response(res, 204, data);
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
  const validated = facturaSchema.validateSync(
    { facturaid: id },
    { abortEarly: false, stripUnknown: true },
  );

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  const data = await deleteFacturaService(validated.facturaid, idusuario);
  response(res, 204, data);
};

export const getFacturaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFacturaMaster");
  const data = await getFacturaMasterService();
  response(res, 201, data);
};

export const getFacturas = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFacturas");
  const data = await getFacturasService();
  response(res, 201, data);
};
