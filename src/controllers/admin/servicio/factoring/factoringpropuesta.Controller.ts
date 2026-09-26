import * as factoringpropuestaService from "#root/src/services/admin/factoringpropuesta.Service.js";
import type {
  CreateFactoringpropuestaDto,
  FactoringpropuestaIdDto,
  GetFactoringpropuestasByFactoringidDto,
  SimulateFactoringpropuestaDto,
  UpdateFactoringpropuestaDto,
} from "#root/src/services/admin/factoringpropuesta.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { sendFileAsync, setDownloadHeaders } from "#src/utils/httpUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import * as fs from "fs";
import { unlink } from "fs/promises";
import * as yup from "yup";

export const downloadFactoringpropuestaPDF = async (req: Request, res: Response) => {
  log.debug(line(), "controller::downloadFactoringpropuestaPDF");
  const { id } = req.params;
  const factoringpropuestaUpdateSchema = yup
    .object()
    .shape({
      factoringpropuestaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringpropuestaValidated = factoringpropuestaUpdateSchema.validateSync(
    { factoringpropuestaid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  ) as FactoringpropuestaIdDto;
  log.debug(line(), "factoringpropuestaValidated:", factoringpropuestaValidated);

  const { filePath, filenameDownload } =
    await factoringpropuestaService.generateFactoringpropuestaPDFService(
      factoringpropuestaValidated.factoringpropuestaid,
    );

  try {
    setDownloadHeaders(res, filenameDownload);
    await sendFileAsync(req, res, filePath);
  } finally {
    if (fs.existsSync(filePath)) {
      await unlink(filePath);
    }
  }
};

export const updateFactoringpropuesta = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateFactoringpropuesta");
  const { id } = req.params;
  const factoringpropuestaUpdateSchema = yup
    .object()
    .shape({
      factoringpropuestaid: yup.string().trim().required().min(36).max(36),
      factoringpropuestaestadoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringpropuestaValidated = factoringpropuestaUpdateSchema.validateSync(
    { factoringpropuestaid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  ) as UpdateFactoringpropuestaDto;
  log.debug(line(), "factoringpropuestaValidated:", factoringpropuestaValidated);

  await factoringpropuestaService.updateFactoringpropuestaService(
    factoringpropuestaValidated,
    req.session_user.usuario.idusuario,
  );

  response(res, 200, { ...factoringpropuestaValidated });
};

export const createFactoringpropuesta = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createFactoringpropuesta");
  const factoringSimulateSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
      factoringtipoid: yup.string().trim().required().min(36).max(36),
      riesgooperacionid: yup.string().trim().required().min(36).max(36),
      riesgocedenteid: yup.string().trim().required().min(36).max(36),
      riesgoaceptanteid: yup.string().trim().required().min(36).max(36),
      factoringpropuestaestadoid: yup.string().trim().required().min(36).max(36),
      factoringestrategiaid: yup.string().trim().required().min(36).max(36),
      tdm: yup.number().required().min(0).max(100),
      porcentaje_financiado_estimado: yup.number().required().min(0).max(1),
      porcentaje_comision_descuento: yup.number().required().min(0).max(1),
      fecha_pago_estimado: yup.date().required(),
      monto_neto: yup.number().required().min(1),
    })
    .required();
  const factoringValidated = factoringSimulateSchema.validateSync(
    { ...req.body },
    { abortEarly: false, stripUnknown: true },
  ) as CreateFactoringpropuestaDto;

  const simulacion = await factoringpropuestaService.createFactoringpropuestaService(
    factoringValidated,
    req.session_user.usuario.idusuario,
  );

  response(res, 201, { factoring: { ...factoringValidated }, ...simulacion });
};

export const simulateFactoringpropuesta = async (req: Request, res: Response) => {
  log.debug(line(), "controller::simulateFactoringpropuesta");
  const { id } = req.params;
  const factoringSimulateSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
      factoringtipoid: yup.string().trim().required().min(36).max(36),
      riesgooperacionid: yup.string().trim().required().min(36).max(36),
      factoringestrategiaid: yup.string().trim().required().min(36).max(36),
      tdm: yup.number().required().min(0).max(100),
      porcentaje_financiado_estimado: yup.number().required().min(0).max(100),
      porcentaje_comision_descuento: yup.number().required().min(0).max(1),
      fecha_pago_estimado: yup.date().required(),
      monto_neto: yup.number().required().min(1),
    })
    .required();
  const factoringValidated = factoringSimulateSchema.validateSync(
    { factoringid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  ) as SimulateFactoringpropuestaDto;
  log.debug(line(), "factoringValidated:", factoringValidated);

  const simulacion =
    await factoringpropuestaService.simulateFactoringpropuestaService(factoringValidated);

  response(res, 201, { factoring: { ...factoringValidated }, ...simulacion });
};

export const getFactoringpropuestasByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestasByFactoringid");
  const { id } = req.params;
  const factoringpropuestaSearchSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringpropuestaValidated = factoringpropuestaSearchSchema.validateSync(
    { factoringid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  ) as GetFactoringpropuestasByFactoringidDto;
  log.debug(line(), "factoringpropuestaValidated:", factoringpropuestaValidated);

  const factoringpropuestas =
    await factoringpropuestaService.getFactoringpropuestasByFactoringidService(
      factoringpropuestaValidated,
    );

  response(res, 201, factoringpropuestas);
};

export const activateFactoringpropuesta = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateFactoringpropuesta");
  const { id } = req.params;
  const factoringpropuestaSchema = yup
    .object()
    .shape({
      factoringpropuestaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringpropuestaValidated = factoringpropuestaSchema.validateSync(
    { factoringpropuestaid: id },
    { abortEarly: false, stripUnknown: true },
  ) as FactoringpropuestaIdDto;
  log.debug(line(), "factoringpropuestaValidated:", factoringpropuestaValidated);

  const factoringpropuestaActivated =
    await factoringpropuestaService.activateFactoringpropuestaService(
      factoringpropuestaValidated,
      req.session_user.usuario.idusuario,
    );

  response(res, 204, factoringpropuestaActivated);
};

export const deleteFactoringpropuesta = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteFactoringpropuesta");
  const { id } = req.params;
  const factoringpropuestaSchema = yup
    .object()
    .shape({
      factoringpropuestaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringpropuestaValidated = factoringpropuestaSchema.validateSync(
    { factoringpropuestaid: id },
    { abortEarly: false, stripUnknown: true },
  ) as FactoringpropuestaIdDto;
  log.debug(line(), "factoringpropuestaValidated:", factoringpropuestaValidated);

  const factoringpropuestaDeleted =
    await factoringpropuestaService.deleteFactoringpropuestaService(
      factoringpropuestaValidated,
      req.session_user.usuario.idusuario,
    );

  response(res, 204, factoringpropuestaDeleted);
};

export const getFactoringpropuestaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestaMaster");

  const masterData = await factoringpropuestaService.getFactoringpropuestaMasterService();

  response(res, 201, masterData);
};

export const getFactoringpropuestas = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestas");

  const factoringpropuestas = await factoringpropuestaService.getFactoringpropuestasService();

  response(res, 201, factoringpropuestas);
};
