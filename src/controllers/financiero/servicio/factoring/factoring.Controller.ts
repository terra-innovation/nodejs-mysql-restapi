import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import {
  getFactoringMasterService,
  getFactoringsPendientesFacturaCedenteService,
  getFactoringsService,
  getPreFacturaCedenteService,
} from "#src/services/financiero/factoring.Service.js";

export const getFactoringMaster = async (_req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringsMaster");
  const data = await getFactoringMasterService();
  response(res, 201, data);
};

export const getFactorings = async (_req: Request, res: Response) => {
  log.debug(line(), "controller::getFactorings");
  const data = await getFactoringsService();
  response(res, 201, data);
};

export const getFactoringsPendientesFacturaCedente = async (_req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringsPendientesFacturaCedente");
  const data = await getFactoringsPendientesFacturaCedenteService();
  response(res, 200, data);
};

/**
 * Obtiene los datos calculados y formateados para la pre-factura SUNAT
 * de una operación de factoring pendiente de facturación al cedente.
 * GET /api/v1/financiero/servicio/factoring/factoring/pre-factura/:factoringid
 */
export const getPreFacturaCedente = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getPreFacturaCedente");
  const { factoringid } = req.params;
  const { fecha_emision } = req.query;

  const data = await getPreFacturaCedenteService({
    factoringid,
    fecha_emision: fecha_emision as string | undefined,
  });

  response(res, 200, data);
};
