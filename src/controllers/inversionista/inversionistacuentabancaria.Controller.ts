import { Request, Response } from "express";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import * as yup from "yup";
import {
  createInversionistacuentabancariaService,
  updateInversionistacuentabancariaOnlyAliasService,
  getInversionistacuentabancariasService,
  getInversionistacuentabancariaMasterService,
  CreateInversionistacuentabancariaDto,
  UpdateInversionistacuentabancariaOnlyAliasDto,
} from "#root/src/services/inversionista/inversionistacuentabancaria.Service.js";

export const createInversionistacuentabancaria = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createInversionistacuentabancaria");
  const session_idusuario = req.session_user.usuario.idusuario;

  const inversionistacuentabancariaCreateSchema = yup
    .object()
    .shape({
      inversionistaid: yup.string().trim().required().min(36).max(36),
      bancoid: yup.string().trim().required().min(36).max(36),
      cuentatipoid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
      numero: yup.string().required().max(20),
      cci: yup.string().required().max(20),
      alias: yup.string().required().max(50),
    })
    .required();

  const inversionistacuentabancariaValidated = inversionistacuentabancariaCreateSchema.validateSync(
    { ...req.body },
    { abortEarly: false, stripUnknown: true },
  ) as CreateInversionistacuentabancariaDto;
  log.debug(line(), "inversionistacuentabancariaValidated:", inversionistacuentabancariaValidated);

  const inversionistacuentabancariaFiltered = await createInversionistacuentabancariaService(
    session_idusuario,
    inversionistacuentabancariaValidated,
  );

  response(res, 201, { ...inversionistacuentabancariaFiltered });
};

export const updateInversionistacuentabancariaOnlyAlias = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateInversionistacuentabancariaOnlyAlias");
  const { id } = req.params;
  const session_idusuario = req.session_user.usuario.idusuario;

  const inversionistacuentabancariaUpdateSchema = yup
    .object()
    .shape({
      inversionistacuentabancariaid: yup.string().trim().required().min(36).max(36),
      alias: yup.string().required().max(50),
    })
    .required();

  const inversionistacuentabancariaValidated = inversionistacuentabancariaUpdateSchema.validateSync(
    { inversionistacuentabancariaid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  ) as UpdateInversionistacuentabancariaOnlyAliasDto;
  log.debug(line(), "inversionistacuentabancariaValidated:", inversionistacuentabancariaValidated);

  const resultado = await updateInversionistacuentabancariaOnlyAliasService(
    session_idusuario,
    inversionistacuentabancariaValidated,
  );

  response(res, 200, resultado);
};

export const getInversionistacuentabancarias = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getInversionistacuentabancarias");
  const session_idusuario = req.session_user.usuario.idusuario;

  const inversionistacuentabancariasFiltered = await getInversionistacuentabancariasService(session_idusuario);
  response(res, 201, inversionistacuentabancariasFiltered);
};

export const getInversionistacuentabancariaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getInversionistacuentabancariaMaster");
  const session_idusuario = req.session_user.usuario.idusuario;

  const cuentasbancariasMasterFiltered = await getInversionistacuentabancariaMasterService(session_idusuario);
  response(res, 201, cuentasbancariasMasterFiltered);
};
