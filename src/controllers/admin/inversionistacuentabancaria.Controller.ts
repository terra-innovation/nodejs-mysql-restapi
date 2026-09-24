import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import * as yup from "yup";
import * as inversionistacuentabancariaService from "#src/services/inversionistacuentabancaria.Service.js";

export const updateInversionistacuentabancariaOnlyAliasAndCuentaBancariaEstado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateInversionistacuentabancariaOnlyAliasAndCuentaBancariaEstado");
  const { id } = req.params;
  const inversionistacuentabancariaUpdateSchema = yup
    .object()
    .shape({
      inversionistacuentabancariaid: yup.string().trim().required().min(36).max(36),
      cuentabancariaestadoid: yup.string().trim().required().min(36).max(36),
      alias: yup.string().required().max(50),
    })
    .required();
  const inversionistacuentabancariaValidated = inversionistacuentabancariaUpdateSchema.validateSync(
    { inversionistacuentabancariaid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "inversionistacuentabancariaValidated:", inversionistacuentabancariaValidated);

  await inversionistacuentabancariaService.updateInversionistacuentabancariaOnlyAliasAndCuentaBancariaEstadoService({
    inversionistacuentabancariaid: inversionistacuentabancariaValidated.inversionistacuentabancariaid,
    cuentabancariaestadoid: inversionistacuentabancariaValidated.cuentabancariaestadoid,
    alias: inversionistacuentabancariaValidated.alias,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 200, {});
};

export const getInversionistacuentabancarias = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getInversionistacuentabancarias");
  const cuentasbancarias = await inversionistacuentabancariaService.getInversionistacuentabancariasService();
  response(res, 201, cuentasbancarias);
};

export const activateInversionistacuentabancaria = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateInversionistacuentabancaria");
  const { id } = req.params;
  const inversionistacuentabancariaSchema = yup
    .object()
    .shape({
      inversionistacuentabancariaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const inversionistacuentabancariaValidated = inversionistacuentabancariaSchema.validateSync(
    { inversionistacuentabancariaid: id },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "inversionistacuentabancariaValidated:", inversionistacuentabancariaValidated);

  await inversionistacuentabancariaService.activateInversionistacuentabancariaService({
    inversionistacuentabancariaid: inversionistacuentabancariaValidated.inversionistacuentabancariaid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, {});
};

export const deleteInversionistacuentabancaria = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteInversionistacuentabancaria");
  const { id } = req.params;
  const inversionistacuentabancariaSchema = yup
    .object()
    .shape({
      inversionistacuentabancariaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const inversionistacuentabancariaValidated = inversionistacuentabancariaSchema.validateSync(
    { inversionistacuentabancariaid: id },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "inversionistacuentabancariaValidated:", inversionistacuentabancariaValidated);

  await inversionistacuentabancariaService.deleteInversionistacuentabancariaService({
    inversionistacuentabancariaid: inversionistacuentabancariaValidated.inversionistacuentabancariaid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, {});
};

export const getInversionistacuentabancariaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getInversionistacuentabancariaMaster");
  const cuentasbancariasMaster =
    await inversionistacuentabancariaService.getInversionistacuentabancariaMasterService();
  response(res, 201, cuentasbancariasMaster);
};

export const createInversionistacuentabancaria = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createInversionistacuentabancaria");
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
    req.body,
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "inversionistacuentabancariaValidated:", inversionistacuentabancariaValidated);

  const inversionistacuentabancaria =
    await inversionistacuentabancariaService.createInversionistacuentabancariaService({
      inversionistaid: inversionistacuentabancariaValidated.inversionistaid,
      bancoid: inversionistacuentabancariaValidated.bancoid,
      cuentatipoid: inversionistacuentabancariaValidated.cuentatipoid,
      monedaid: inversionistacuentabancariaValidated.monedaid,
      numero: inversionistacuentabancariaValidated.numero,
      cci: inversionistacuentabancariaValidated.cci,
      alias: inversionistacuentabancariaValidated.alias,
      idusuario: req.session_user?.usuario?.idusuario ?? 1,
    });

  response(res, 201, { ...inversionistacuentabancaria });
};
