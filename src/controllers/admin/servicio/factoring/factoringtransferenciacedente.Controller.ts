import * as factoringtransferenciacedenteService from "#root/src/services/admin/factoringtransferenciacedente.Service.js";
import type {
  CreateFactoringtransferenciacedenteDto,
  FactoringtransferenciacedenteIdDto,
  GetFactoringtransferenciacedenteMasterByFactoringidDto,
  GetFactoringtransferenciacedentesByFactoringidDto,
  UpdateFactoringtransferenciacedenteDto,
} from "#root/src/services/admin/factoringtransferenciacedente.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import * as yup from "yup";

export const sendCorreoFactoringtransferenciacedente = async (req: Request, res: Response) => {
  log.debug(line(), "controller::sendCorreoFactoringtransferenciacedente");
  const { id } = req.params;
  const factoringtransferenciacedenteUpdateSchema = yup
    .object()
    .shape({
      factoringtransferenciacedenteid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringtransferenciacedenteValidated =
    factoringtransferenciacedenteUpdateSchema.validateSync(
      { factoringtransferenciacedenteid: id, ...req.body },
      { abortEarly: false, stripUnknown: true },
    ) as FactoringtransferenciacedenteIdDto;
  log.debug(line(), "factoringtransferenciacedenteValidated:", factoringtransferenciacedenteValidated);

  await factoringtransferenciacedenteService.sendCorreoFactoringtransferenciacedenteService(
    factoringtransferenciacedenteValidated.factoringtransferenciacedenteid,
  );

  response(res, 200, {});
};

export const activateFactoringtransferenciacedente = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateFactoringtransferenciacedente");
  const { id } = req.params;
  const factoringtransferenciacedenteSchema = yup
    .object()
    .shape({
      factoringtransferenciacedenteid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringtransferenciacedenteValidated =
    factoringtransferenciacedenteSchema.validateSync(
      { factoringtransferenciacedenteid: id },
      { abortEarly: false, stripUnknown: true },
    ) as FactoringtransferenciacedenteIdDto;
  log.debug(line(), "factoringtransferenciacedenteValidated:", factoringtransferenciacedenteValidated);

  const factoringtransferenciacedenteActivated =
    await factoringtransferenciacedenteService.activateFactoringtransferenciacedenteService(
      factoringtransferenciacedenteValidated,
      req.session_user.usuario.idusuario,
    );

  response(res, 204, factoringtransferenciacedenteActivated);
};

export const deleteFactoringtransferenciacedente = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteFactoringtransferenciacedente");
  const { id } = req.params;
  const factoringtransferenciacedenteSchema = yup
    .object()
    .shape({
      factoringtransferenciacedenteid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringtransferenciacedenteValidated =
    factoringtransferenciacedenteSchema.validateSync(
      { factoringtransferenciacedenteid: id },
      { abortEarly: false, stripUnknown: true },
    ) as FactoringtransferenciacedenteIdDto;
  log.debug(line(), "factoringtransferenciacedenteValidated:", factoringtransferenciacedenteValidated);

  const factoringtransferenciacedenteDeleted =
    await factoringtransferenciacedenteService.deleteFactoringtransferenciacedenteService(
      factoringtransferenciacedenteValidated,
      req.session_user.usuario.idusuario,
    );

  response(res, 204, factoringtransferenciacedenteDeleted);
};

export const updateFactoringtransferenciacedente = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateFactoringtransferenciacedente");
  const { id } = req.params;
  const factoringtransferenciacedenteUpdateSchema = yup
    .object()
    .shape({
      factoringtransferenciacedenteid: yup.string().trim().required().min(36).max(36),
      factoringtransferenciaestadoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringtransferenciacedenteValidated =
    factoringtransferenciacedenteUpdateSchema.validateSync(
      { factoringtransferenciacedenteid: id, ...req.body },
      { abortEarly: false, stripUnknown: true },
    ) as UpdateFactoringtransferenciacedenteDto;
  log.debug(line(), "factoringtransferenciacedenteValidated:", factoringtransferenciacedenteValidated);

  await factoringtransferenciacedenteService.updateFactoringtransferenciacedenteService(
    factoringtransferenciacedenteValidated,
    req.session_user.usuario.idusuario,
  );

  response(res, 200, { ...factoringtransferenciacedenteValidated });
};

export const createFactoringtransferenciacedente = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createFactoringtransferenciacedente");
  const factoringtransferenciacedenteSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
      factoringtransferenciatipoid: yup.string().trim().required().min(36).max(36),
      factoringtransferenciaestadoid: yup.string().trim().required().min(36).max(36),
      factorcuentabancariaid: yup.string().trim().required().min(36).max(36),
      empresacuentabancariaid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
      numero_operacion: yup.string().trim().required().min(2).max(50),
      monto: yup.number().required().min(0),
      fecha: yup
        .string()
        .required()
        .matches(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/,
          "Formato inválido: debe ser ISO UTC (YYYY-MM-DDTHH:mm:ssZ)",
        )
        .test("is-valid-date", "Fecha inválida", (value) => {
          const date = new Date(value);
          return !isNaN(date.getTime());
        }),
      archivo_constancia_transferencia: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringtransferenciacedenteValidated =
    factoringtransferenciacedenteSchema.validateSync(
      { ...req.body },
      { abortEarly: false, stripUnknown: true },
    ) as CreateFactoringtransferenciacedenteDto;

  const factoringtransferenciacedenteCreated =
    await factoringtransferenciacedenteService.createFactoringtransferenciacedenteService(
      factoringtransferenciacedenteValidated,
      req.session_user.usuario.idusuario,
    );

  response(res, 201, factoringtransferenciacedenteCreated);
};

export const getFactoringtransferenciacedentesByFactoringid = async (
  req: Request,
  res: Response,
) => {
  log.debug(line(), "controller::getFactoringtransferenciacedentesByFactoringid");
  const { id } = req.params;
  const factoringtransferenciacedenteSearchSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringtransferenciacedenteValidated =
    factoringtransferenciacedenteSearchSchema.validateSync(
      { factoringid: id, ...req.body },
      { abortEarly: false, stripUnknown: true },
    ) as GetFactoringtransferenciacedentesByFactoringidDto;
  log.debug(line(), "factoringtransferenciacedenteValidated:", factoringtransferenciacedenteValidated);

  const factoringtransferenciacedentes =
    await factoringtransferenciacedenteService.getFactoringtransferenciacedentesByFactoringidService(
      factoringtransferenciacedenteValidated,
    );

  response(res, 201, factoringtransferenciacedentes);
};

export const getFactoringtransferenciacedenteMasterByFactoringid = async (
  req: Request,
  res: Response,
) => {
  log.debug(line(), "controller::getFactoringtransferenciacedenteMaster");
  const { factoringid } = req.params;
  const factoringtransferenciacedenteSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringtransferenciacedenteValidated =
    factoringtransferenciacedenteSchema.validateSync(
      { factoringid: factoringid },
      { abortEarly: false, stripUnknown: true },
    ) as GetFactoringtransferenciacedenteMasterByFactoringidDto;
  log.debug(line(), "factoringtransferenciacedenteValidated:", factoringtransferenciacedenteValidated);

  const masterData =
    await factoringtransferenciacedenteService.getFactoringtransferenciacedenteMasterByFactoringidService(
      factoringtransferenciacedenteValidated,
    );

  response(res, 201, masterData);
};
