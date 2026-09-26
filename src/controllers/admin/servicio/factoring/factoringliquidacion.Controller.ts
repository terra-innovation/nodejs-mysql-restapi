import * as factoringliquidacionService from "#root/src/services/admin/factoringliquidacion.Service.js";
import type {
  CreateFactoringliquidacionDto,
  FactoringliquidacionIdDto,
  GetFactoringliquidacionByFactoringidDto,
  GetFactoringliquidacionMasterByFactoringidDto,
  SimulateFactoringliquidacionDto,
  UpdateFactoringliquidacionDto,
} from "#root/src/services/admin/factoringliquidacion.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { sendFileAsync, setDownloadHeaders } from "#src/utils/httpUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import * as fs from "fs";
import { unlink } from "fs/promises";
import * as yup from "yup";

export const sendCorreoFactoringliquidacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::sendCorreoFactoringliquidacion");
  const { id } = req.params;
  const factoringliquidacionUpdateSchema = yup
    .object()
    .shape({
      factoringliquidacionid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringliquidacionValidated = factoringliquidacionUpdateSchema.validateSync(
    { factoringliquidacionid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  ) as FactoringliquidacionIdDto;
  log.debug(line(), "factoringliquidacionValidated:", factoringliquidacionValidated);

  await factoringliquidacionService.sendCorreoFactoringliquidacionService(
    factoringliquidacionValidated.factoringliquidacionid,
  );

  response(res, 200, {});
};

export const simulateFactoringliquidacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::simulateFactoringliquidacion");
  const { factoringid } = req.params;
  const schema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
      fecha_liquidacion: yup.date().required(),
      fecha_pago_efectivo: yup.date().required(),
      exonerar_gasto_interbancario: yup.boolean(),
      factoring_liquidacion_financieros: yup
        .array()
        .of(
          yup.object().shape({
            financierotipoid: yup.string().trim().required().min(36).max(36),
            financieroconceptoid: yup.string().trim().required().min(36).max(36),
            cantidad: yup.number().optional().default(1),
            monto_unitario: yup.number().optional().default(0),
            descripcion: yup.string().optional(),
          }),
        )
        .optional(),
    })
    .required();

  const validated = schema.validateSync(
    { factoringid, ...req.body },
    { abortEarly: false, stripUnknown: true },
  ) as SimulateFactoringliquidacionDto;

  const result = await factoringliquidacionService.simulateFactoringliquidacionService(validated);

  response(res, 201, result);
};

export const createFactoringliquidacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createFactoringliquidacion");
  const schema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
      factoringliquidacionestadoid: yup.string().trim().required().min(36).max(36),
      fecha_liquidacion: yup.date().required(),
      fecha_pago_efectivo: yup.date().required(),
      exonerar_gasto_interbancario: yup.boolean(),
      factoring_liquidacion_financieros: yup
        .array()
        .of(
          yup.object().shape({
            financierotipoid: yup.string().trim().required().min(36).max(36),
            financieroconceptoid: yup.string().trim().required().min(36).max(36),
            cantidad: yup.number().optional().default(1),
            monto_unitario: yup.number().optional().default(0),
            descripcion: yup.string().optional(),
          }),
        )
        .optional(),
    })
    .required();

  const validated = schema.validateSync(
    { ...req.body },
    { abortEarly: false, stripUnknown: true },
  ) as CreateFactoringliquidacionDto;

  const result = await factoringliquidacionService.createFactoringliquidacionService(
    validated,
    req.session_user.usuario.idusuario,
  );

  response(res, 201, result);
};

export const updateFactoringliquidacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateFactoringliquidacion");
  const { factoringliquidacionid } = req.params;
  const schema = yup
    .object()
    .shape({
      factoringliquidacionid: yup.string().trim().required().min(36).max(36),
      factoringliquidacionestadoid: yup.string().trim().required().min(36).max(36),
      fecha_liquidacion: yup.date().required(),
    })
    .required();

  const validated = schema.validateSync(
    { factoringliquidacionid, ...req.body },
    { abortEarly: false, stripUnknown: true },
  ) as UpdateFactoringliquidacionDto;

  const result = await factoringliquidacionService.updateFactoringliquidacionService(
    validated,
    req.session_user.usuario.idusuario,
  );

  response(res, 200, result);
};

export const deleteFactoringliquidacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteFactoringliquidacion");
  const { factoringliquidacionid } = req.params;
  const schema = yup
    .object()
    .shape({
      factoringliquidacionid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const validated = schema.validateSync(
    { factoringliquidacionid },
    { abortEarly: false, stripUnknown: true },
  ) as FactoringliquidacionIdDto;

  const result = await factoringliquidacionService.deleteFactoringliquidacionService(
    validated,
    req.session_user.usuario.idusuario,
  );

  response(res, 204, result);
};

export const activateFactoringliquidacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateFactoringliquidacion");
  const { factoringliquidacionid } = req.params;
  const schema = yup
    .object()
    .shape({
      factoringliquidacionid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const validated = schema.validateSync(
    { factoringliquidacionid },
    { abortEarly: false, stripUnknown: true },
  ) as FactoringliquidacionIdDto;

  const result = await factoringliquidacionService.activateFactoringliquidacionService(
    validated,
    req.session_user.usuario.idusuario,
  );

  response(res, 204, result);
};

export const getFactoringliquidacionMasterByFactoringid = async (
  req: Request,
  res: Response,
) => {
  log.debug(line(), "controller::getFactoringliquidacionMasterByFactoringid");

  const { factoringid } = req.params;
  const usuarioservicioSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringliquidacionValidated = usuarioservicioSchema.validateSync(
    { factoringid },
    { abortEarly: false, stripUnknown: true },
  ) as GetFactoringliquidacionMasterByFactoringidDto;

  const result =
    await factoringliquidacionService.getFactoringliquidacionMasterByFactoringidService(
      factoringliquidacionValidated,
    );

  response(res, 200, result);
};

export const getFactoringliquidacionDetalle = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringliquidacionDetalle");
  const { factoringliquidacionid } = req.params;
  const schema = yup
    .object()
    .shape({
      factoringliquidacionid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const validated = schema.validateSync(
    { factoringliquidacionid },
    { abortEarly: false, stripUnknown: true },
  ) as FactoringliquidacionIdDto;

  const result =
    await factoringliquidacionService.getFactoringliquidacionDetalleService(validated);

  response(res, 200, result);
};

export const getFactoringliquidacionByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringliquidacionByFactoringid");
  const { factoringid } = req.params;
  const factoringliquidacionSearchSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringliquidacionValidated = factoringliquidacionSearchSchema.validateSync(
    { factoringid, ...req.body },
    { abortEarly: false, stripUnknown: true },
  ) as GetFactoringliquidacionByFactoringidDto;
  log.debug(line(), "factoringliquidacionValidated:", factoringliquidacionValidated);

  const factoringliquidaciones =
    await factoringliquidacionService.getFactoringliquidacionByFactoringidService(
      factoringliquidacionValidated,
    );

  response(res, 200, factoringliquidaciones);
};

export const downloadFactoringliquidacionPDF = async (req: Request, res: Response) => {
  log.debug(line(), "controller::downloadFactoringliquidacionPDF");
  const { factoringliquidacionid } = req.params;
  const schema = yup
    .object()
    .shape({
      factoringliquidacionid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const validated = schema.validateSync(
    { factoringliquidacionid },
    { abortEarly: false, stripUnknown: true },
  ) as FactoringliquidacionIdDto;
  log.debug(line(), "validated:", validated);

  const { filePath, filenameDownload } =
    await factoringliquidacionService.generateFactoringliquidacionPDFService(
      validated.factoringliquidacionid,
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
