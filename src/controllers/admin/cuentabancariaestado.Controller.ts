import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import * as yup from "yup";
import * as cuentabancariaestadoService from "#src/services/cuentabancariaestado.Service.js";

export const activateCuentabancariaestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateCuentabancariaestado");
  const { id } = req.params;
  const cuentabancariaestadoSchema = yup
    .object()
    .shape({
      cuentabancariaestadoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const cuentabancariaestadoValidated = cuentabancariaestadoSchema.validateSync(
    { cuentabancariaestadoid: id },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "cuentabancariaestadoValidated:", cuentabancariaestadoValidated);

  const cuentabancariaestadoActivated = await cuentabancariaestadoService.activateCuentabancariaestadoService({
    cuentabancariaestadoid: cuentabancariaestadoValidated.cuentabancariaestadoid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, cuentabancariaestadoActivated);
};

export const deleteCuentabancariaestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteCuentabancariaestado");
  const { id } = req.params;
  const cuentabancariaestadoSchema = yup
    .object()
    .shape({
      cuentabancariaestadoid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const cuentabancariaestadoValidated = cuentabancariaestadoSchema.validateSync(
    { cuentabancariaestadoid: id },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "cuentabancariaestadoValidated:", cuentabancariaestadoValidated);

  const cuentabancariaestadoDeleted = await cuentabancariaestadoService.deleteCuentabancariaestadoService({
    cuentabancariaestadoid: cuentabancariaestadoValidated.cuentabancariaestadoid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, cuentabancariaestadoDeleted);
};

export const updateCuentabancariaestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateCuentabancariaestado");
  const { id } = req.params;
  const cuentabancariaestadoUpdateSchema = yup
    .object()
    .shape({
      cuentabancariaestadoid: yup.string().trim().required().min(36).max(36),
      nombre: yup.string().trim().required().max(50),
      alias: yup.string().trim().required().max(50),
      color: yup.string().trim().required().max(50),
    })
    .required();
  const cuentabancariaestadoValidated = cuentabancariaestadoUpdateSchema.validateSync(
    { cuentabancariaestadoid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "cuentabancariaestadoValidated:", cuentabancariaestadoValidated);

  const cuentabancariaestadoFiltered = await cuentabancariaestadoService.updateCuentabancariaestadoService({
    cuentabancariaestadoid: cuentabancariaestadoValidated.cuentabancariaestadoid,
    nombre: cuentabancariaestadoValidated.nombre,
    alias: cuentabancariaestadoValidated.alias,
    color: cuentabancariaestadoValidated.color,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 200, cuentabancariaestadoFiltered);
};

export const getCuentasbancarias = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getCuentasbancarias");
  const cuentabancariaestados = await cuentabancariaestadoService.getCuentabancariaestadosService();
  response(res, 201, cuentabancariaestados);
};

export const createCuentabancariaestado = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createCuentabancariaestado");
  const cuentabancariaestadoCreateSchema = yup
    .object()
    .shape({
      nombre: yup.string().trim().required().max(50),
      alias: yup.string().trim().required().max(50),
      color: yup.string().trim().required().max(50),
    })
    .required();
  const cuentabancariaestadoValidated = cuentabancariaestadoCreateSchema.validateSync(
    req.body,
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "cuentabancariaestadoValidated:", cuentabancariaestadoValidated);

  const cuentabancariaestadoCreated = await cuentabancariaestadoService.createCuentabancariaestadoService({
    nombre: cuentabancariaestadoValidated.nombre,
    alias: cuentabancariaestadoValidated.alias,
    color: cuentabancariaestadoValidated.color,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 201, cuentabancariaestadoCreated);
};
