import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import * as yup from "yup";
import * as empresacuentabancariaService from "#src/services/empresacuentabancaria.Service.js";

export const activateEmpresacuentabancaria = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateEmpresacuentabancaria");
  const { id } = req.params;
  const empresacuentabancariaSchema = yup
    .object()
    .shape({
      empresacuentabancariaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const empresacuentabancariaValidated = empresacuentabancariaSchema.validateSync(
    { empresacuentabancariaid: id },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "empresacuentabancariaValidated:", empresacuentabancariaValidated);

  await empresacuentabancariaService.activateEmpresacuentabancariaService({
    empresacuentabancariaid: empresacuentabancariaValidated.empresacuentabancariaid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, {});
};

export const deleteEmpresacuentabancaria = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteEmpresacuentabancaria");
  const { id } = req.params;
  const empresacuentabancariaSchema = yup
    .object()
    .shape({
      empresacuentabancariaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const empresacuentabancariaValidated = empresacuentabancariaSchema.validateSync(
    { empresacuentabancariaid: id },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "empresacuentabancariaValidated:", empresacuentabancariaValidated);

  await empresacuentabancariaService.deleteEmpresacuentabancariaService({
    empresacuentabancariaid: empresacuentabancariaValidated.empresacuentabancariaid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, {});
};

export const getEmpresacuentabancariaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getEmpresacuentabancariaMaster");
  const cuentasbancariasMaster = await empresacuentabancariaService.getEmpresacuentabancariaMasterService();
  response(res, 201, cuentasbancariasMaster);
};

export const updateEmpresacuentabancariaOnlyAliasAndCuentaBancariaEstado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateEmpresacuentabancariaOnlyAliasAndCuentaBancariaEstado");
  const { id } = req.params;
  const empresacuentabancariaUpdateSchema = yup
    .object()
    .shape({
      empresacuentabancariaid: yup.string().trim().required().min(36).max(36),
      cuentabancariaestadoid: yup.string().trim().required().min(36).max(36),
      alias: yup.string().required().max(50),
    })
    .required();
  const empresacuentabancariaValidated = empresacuentabancariaUpdateSchema.validateSync(
    { empresacuentabancariaid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "empresacuentabancariaValidated:", empresacuentabancariaValidated);

  await empresacuentabancariaService.updateEmpresacuentabancariaOnlyAliasAndCuentaBancariaEstadoService({
    empresacuentabancariaid: empresacuentabancariaValidated.empresacuentabancariaid,
    cuentabancariaestadoid: empresacuentabancariaValidated.cuentabancariaestadoid,
    alias: empresacuentabancariaValidated.alias,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 200, {});
};

export const getEmpresacuentabancarias = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getEmpresacuentabancarias");
  const cuentasbancarias = await empresacuentabancariaService.getEmpresacuentabancariasService();
  response(res, 201, cuentasbancarias);
};

export const createEmpresacuentabancaria = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createEmpresacuentabancaria");
  const empresacuentabancariaCreateSchema = yup
    .object()
    .shape({
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
    req.body,
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "empresacuentabancariaValidated:", empresacuentabancariaValidated);

  const empresacuentabancaria = await empresacuentabancariaService.createEmpresacuentabancariaService({
    empresaid: empresacuentabancariaValidated.empresaid,
    bancoid: empresacuentabancariaValidated.bancoid,
    cuentatipoid: empresacuentabancariaValidated.cuentatipoid,
    monedaid: empresacuentabancariaValidated.monedaid,
    numero: empresacuentabancariaValidated.numero,
    cci: empresacuentabancariaValidated.cci,
    alias: empresacuentabancariaValidated.alias,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 201, { ...empresacuentabancaria });
};
