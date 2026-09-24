import { Request, Response } from "express";
import { line, log } from "#root/src/utils/logger.pino.js";
import { response } from "#src/utils/CustomResponseOk.js";
import * as yup from "yup";
import {
  getEmpresacuentabancariasForFactoringService,
  getEmpresacuentabancariaMasterService,
  createEmpresacuentabancariaService,
  GetEmpresacuentabancariasForFactoringDto,
  CreateEmpresacuentabancariaDto,
} from "#root/src/services/empresario/empresacuentabancaria.Service.js";

export const getEmpresacuentabancarias = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getEmpresacuentabancarias");

  const empresacuentabancariaUpdateSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const empresacuentabancariaValidated = empresacuentabancariaUpdateSchema.validateSync(
    { ...req.body },
    { abortEarly: false, stripUnknown: true },
  ) as GetEmpresacuentabancariasForFactoringDto;
  log.debug(line(), "empresacuentabancariaValidated:", empresacuentabancariaValidated);

  const empresacuentabancariasFiltered = await getEmpresacuentabancariasForFactoringService(
    req.session_user.usuario.idusuario,
    empresacuentabancariaValidated,
  );

  response(res, 201, empresacuentabancariasFiltered);
};

export const getEmpresacuentabancariaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getEmpresacuentabancariaMaster");
  const session_idusuario = req.session_user.usuario.idusuario;

  const cuentasbancariasMasterFiltered = await getEmpresacuentabancariaMasterService(session_idusuario);

  response(res, 201, cuentasbancariasMasterFiltered);
};

export const createEmpresacuentabancaria = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createEmpresacuentabancaria");
  const session_idusuario = req.session_user.usuario.idusuario;

  const empresacuentabancariaCreateSchema = yup
    .object()
    .shape({
      encabezado_cuenta_bancaria: yup.string().trim().required().min(36).max(36),
      empresaid: yup.string().trim().required().min(36).max(36),
      bancoid: yup.string().trim().required().min(36).max(36),
      cuentatipoid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
      numero: yup.string().required().max(20),
      cci: yup.string().required().max(20),
      alias: yup.string().required().max(50),
    })
    .required();

  const empresacuentabancariaValidated = empresacuentabancariaCreateSchema.validateSync(
    { ...req.body },
    { abortEarly: false, stripUnknown: true },
  ) as CreateEmpresacuentabancariaDto;
  log.debug(line(), "empresacuentabancariaValidated:", empresacuentabancariaValidated);

  const empresacuentabancariaFiltered = await createEmpresacuentabancariaService(
    session_idusuario,
    empresacuentabancariaValidated,
  );

  response(res, 201, { ...empresacuentabancariaFiltered });
};
