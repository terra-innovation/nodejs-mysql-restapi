import { Request, Response } from "express";
import { unlink } from "fs/promises";
import * as yup from "yup";
import * as factoringsimulacionService from "#root/src/services/admin/factoringsimulacion.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { sendFileAsync, setDownloadHeaders } from "#src/utils/httpUtils.js";
import { line, log } from "#src/utils/logger.pino.js";

export const downloadFactoringsimulacionPDF = async (req: Request, res: Response) => {
  log.debug(line(), "controller::downloadFactoringsimulacionPDF");
  const { id } = req.params;

  const factoringsimulacionUpdateSchema = yup
    .object()
    .shape({
      factoringsimulacionid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const factoringsimulacionValidated = factoringsimulacionUpdateSchema.validateSync(
    { factoringsimulacionid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "factoringsimulacionValidated:", factoringsimulacionValidated);

  const { filePath, filenameDownload } =
    await factoringsimulacionService.generateFactoringsimulacionPDFService(
      factoringsimulacionValidated.factoringsimulacionid,
    );

  setDownloadHeaders(res, filenameDownload);
  await sendFileAsync(req, res, filePath);
  await unlink(filePath);
};

export const createFactoringsimulacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createFactoringsimulacion");
  const session_idusuario = req.session_user.usuario.idusuario;

  const factoringSimulateSchema = yup
    .object()
    .shape({
      bancoid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
      factoringtipoid: yup.string().trim().required().min(36).max(36),
      riesgooperacionid: yup.string().trim().required().min(36).max(36),
      factoringestrategiaid: yup.string().trim().required().min(36).max(36),
      tdm: yup.number().required().min(0).max(100),
      porcentaje_financiado_estimado: yup.number().required().min(0).max(1),
      porcentaje_comision_descuento: yup.number().required().min(0).max(1),
      ruc_cedente: yup
        .string()
        .trim()
        .matches(/^\d{11}$/, "RUC debe ser un número de exactamente 11 dígitos")
        .required(),
      ruc_aceptante: yup
        .string()
        .trim()
        .matches(/^\d{11}$/, "RUC debe ser un número de exactamente 11 dígitos")
        .required(),
      razon_social_cedente: yup.string().trim().required().min(2).max(200),
      razon_social_aceptante: yup.string().trim().required().min(2).max(200),
      fecha_pago_estimado: yup.date().required(),
      fecha_emision: yup.date().required(),
      cantidad_facturas: yup.number().required().min(1).max(100),
      monto_neto: yup.number().required().min(1),
    })
    .required();

  const factoringValidated = factoringSimulateSchema.validateSync(
    { ...req.body },
    { abortEarly: false, stripUnknown: true },
  );

  const simulacion = await factoringsimulacionService.createFactoringsimulacionService(
    session_idusuario,
    factoringValidated as factoringsimulacionService.CreateFactoringsimulacionPayload,
  );

  response(res, 201, { factoring: { ...factoringValidated }, ...simulacion });
};

export const simulateFactoringsimulacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::simulateFactoringsimulacion");

  const factoringSimulateSchema = yup
    .object()
    .shape({
      factoringtipoid: yup.string().trim().required().min(36).max(36),
      riesgooperacionid: yup.string().trim().required().min(36).max(36),
      factoringestrategiaid: yup.string().trim().required().min(36).max(36),
      bancoid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
      tdm: yup.number().required().min(0).max(100),
      porcentaje_financiado_estimado: yup.number().required().min(0).max(1),
      fecha_pago_estimado: yup.date().required(),
      fecha_emision: yup.date().required(),
      cantidad_facturas: yup.number().required().min(1).max(100),
      monto_neto: yup.number().required().min(1),
      porcentaje_comision_descuento: yup.number().required().min(0).max(1),
    })
    .required();

  const factoringValidated = factoringSimulateSchema.validateSync(
    { ...req.body },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "factoringValidated:", factoringValidated);

  const simulacion = await factoringsimulacionService.simulateFactoringsimulacionService(
    factoringValidated as factoringsimulacionService.SimulateFactoringsimulacionPayload,
  );

  response(res, 201, { factoring: { ...factoringValidated }, ...simulacion });
};

export const activateFactoringsimulacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateFactoringsimulacion");
  const { id } = req.params;

  const factoringsimulacionSchema = yup
    .object()
    .shape({
      factoringsimulacionid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const factoringsimulacionValidated = factoringsimulacionSchema.validateSync(
    { factoringsimulacionid: id },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "factoringsimulacionValidated:", factoringsimulacionValidated);

  const factoringsimulacionActivated =
    await factoringsimulacionService.activateFactoringsimulacionService(
      factoringsimulacionValidated.factoringsimulacionid,
      req.session_user.usuario.idusuario,
    );

  response(res, 204, factoringsimulacionActivated);
};

export const deleteFactoringsimulacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteFactoringsimulacion");
  const { id } = req.params;

  const factoringsimulacionSchema = yup
    .object()
    .shape({
      factoringsimulacionid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const factoringsimulacionValidated = factoringsimulacionSchema.validateSync(
    { factoringsimulacionid: id },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "factoringsimulacionValidated:", factoringsimulacionValidated);

  const factoringsimulacionDeleted =
    await factoringsimulacionService.deleteFactoringsimulacionService(
      factoringsimulacionValidated.factoringsimulacionid,
      req.session_user.usuario.idusuario,
    );

  response(res, 204, factoringsimulacionDeleted);
};

export const getFactoringsimulacionMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringsimulacionMaster");

  const factoringsimulacionsMaster =
    await factoringsimulacionService.getFactoringsimulacionMasterService();

  response(res, 201, factoringsimulacionsMaster);
};

export const getFactoringsimulacions = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringsimulacions");

  const factoringsimulacions =
    await factoringsimulacionService.getFactoringsimulacionsService();

  response(res, 201, factoringsimulacions);
};
