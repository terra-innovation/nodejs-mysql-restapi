import { Request, Response } from "express";
import * as yup from "yup";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";

import {
  activateConfiguracioncorreoService,
  createConfiguracioncorreoService,
  deleteConfiguracioncorreoService,
  getConfiguracioncorreoMasterService,
  getConfiguracioncorreosService,
  testConfiguracioncorreoService,
  updateConfiguracioncorreoService,
  type ConfiguracionCorreoCreateDto,
  type ConfiguracionCorreoUpdateDto,
  type TestConfiguracionCorreoDto,
} from "#src/services/configuracioncorreo.Service.js";

export const getConfiguracioncorreos = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getConfiguracioncorreos");
  const data = await getConfiguracioncorreosService();
  response(res, 201, data);
};

export const createConfiguracioncorreo = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createConfiguracioncorreo");
  const schema = yup
    .object()
    .shape({
      alias: yup.string().trim().required().max(200),
      smtp_host: yup.string().trim().required().max(200),
      smtp_port: yup.number().required(),
      smtp_secure: yup.boolean().required(),
      smtp_user: yup.string().trim().required().max(200),
      smtp_pass: yup.string().trim().required().max(200),
      smtp_name: yup.string().trim().required().max(200),
      mail_backup: yup.string().trim().email().max(200).nullable(),
      is_enabled: yup.boolean().required(),
    })
    .required();

  const validated = schema.validateSync(
    { ...req.body },
    { abortEarly: false, stripUnknown: true },
  ) as unknown as ConfiguracionCorreoCreateDto;

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  const created = await createConfiguracioncorreoService(validated, idusuario);
  response(res, 201, created);
};

export const updateConfiguracioncorreo = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateConfiguracioncorreo");
  const { id } = req.params;
  const schema = yup
    .object()
    .shape({
      configuracioncorreoid: yup.string().trim().required().min(36).max(36),
      alias: yup.string().trim().required().max(200),
      smtp_host: yup.string().trim().required().max(200),
      smtp_port: yup.number().required(),
      smtp_secure: yup.boolean().required(),
      smtp_user: yup.string().trim().required().max(200),
      smtp_pass: yup.string().trim().max(200).nullable(),
      smtp_name: yup.string().trim().required().max(200),
      mail_backup: yup.string().trim().email().max(200).nullable(),
      is_enabled: yup.boolean().required(),
    })
    .required();

  const validated = schema.validateSync(
    { configuracioncorreoid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  ) as unknown as ConfiguracionCorreoUpdateDto;

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  await updateConfiguracioncorreoService(validated, idusuario);
  response(res, 200, {});
};

export const deleteConfiguracioncorreo = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteConfiguracioncorreo");
  const { id } = req.params;
  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  await deleteConfiguracioncorreoService(id, idusuario);
  response(res, 204, {});
};

export const activateConfiguracioncorreo = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateConfiguracioncorreo");
  const { id } = req.params;
  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  await activateConfiguracioncorreoService(id, idusuario);
  response(res, 204, {});
};

export const getConfiguracioncorreoMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getConfiguracioncorreoMaster");
  const data = await getConfiguracioncorreoMasterService();
  response(res, 201, data);
};

export const testConfiguracioncorreo = async (req: Request, res: Response) => {
  log.debug(line(), "controller::testConfiguracioncorreo");
  const { id } = req.params;
  const schema = yup
    .object()
    .shape({
      configuracioncorreoid: yup.string().trim().required().min(36).max(36),
      email_destinatario: yup.string().email().required().max(200),
    })
    .required();

  const validated = schema.validateSync(
    { configuracioncorreoid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  ) as unknown as TestConfiguracionCorreoDto;

  const result = await testConfiguracioncorreoService(validated);
  response(res, 200, result);
};
