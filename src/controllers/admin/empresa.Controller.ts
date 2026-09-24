import { Request, Response } from "express";
import * as yup from "yup";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";

import {
  activateEmpresaService,
  createEmpresaService,
  deleteEmpresaService,
  getEmpresasService,
  getEmpresaMasterService,
  updateEmpresaService,
  type EmpresaCreateDto,
  type EmpresaUpdateDto,
} from "#src/services/empresa.Service.js";

export const activateEmpresa = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateEmpresa");
  const { id } = req.params;
  const empresaSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const validated = empresaSchema.validateSync({ empresaid: id }, { abortEarly: false, stripUnknown: true });

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  await activateEmpresaService(validated.empresaid, idusuario);
  response(res, 204, {});
};

export const deleteEmpresa = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteEmpresa");
  const { id } = req.params;
  const empresaSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const validated = empresaSchema.validateSync({ empresaid: id }, { abortEarly: false, stripUnknown: true });

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  const data = await deleteEmpresaService(validated.empresaid, idusuario);
  response(res, 204, data);
};

export const getEmpresaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getEmpresaMaster");
  const data = await getEmpresaMasterService();
  response(res, 201, data);
};

export const updateEmpresa = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateEmpresa");
  const { id } = req.params;
  const empresaUpdateSchema = yup
    .object()
    .shape({
      empresaid: yup.string().trim().required().min(36).max(36),
      riesgoid: yup
        .string()
        .trim()
        .transform((v) => (v === "" ? null : v))
        .nullable()
        .optional()
        .min(36)
        .max(36),
      paisid: yup
        .string()
        .trim()
        .transform((v) => (v === "" ? null : v))
        .nullable()
        .optional()
        .min(36)
        .max(36),
      distritoid: yup
        .string()
        .trim()
        .transform((v) => (v === "" ? null : v))
        .nullable()
        .optional()
        .min(36)
        .max(36),
      ruc: yup
        .string()
        .trim()
        .matches(/^\d{11}$/, "RUC debe ser un numero de exactamente 11 digitos")
        .required(),
      razon_social: yup.string().trim().required().min(2).max(200),
      nombre_comercial: yup
        .string()
        .trim()
        .transform((v) => (v === "" ? null : v))
        .nullable()
        .optional()
        .min(2)
        .max(200),
      fecha_inscripcion: yup
        .date()
        .transform((v) => (v === "" ? null : v))
        .nullable()
        .optional()
        .typeError("fecha_inscripcion debe ser una fecha valida (YYYY-MM-DD)"),
      domicilio_fiscal: yup
        .string()
        .trim()
        .transform((v) => (v === "" ? null : v))
        .nullable()
        .optional()
        .min(2)
        .max(200),
      direccion_sede: yup
        .string()
        .trim()
        .transform((v) => (v === "" ? null : v))
        .nullable()
        .optional()
        .min(2)
        .max(200),
      direccion_sede_referencia: yup
        .string()
        .trim()
        .transform((v) => (v === "" ? null : v))
        .nullable()
        .optional()
        .min(2)
        .max(200),
    })
    .required();
  const validated = empresaUpdateSchema.validateSync(
    { empresaid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  ) as unknown as EmpresaUpdateDto;

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  await updateEmpresaService(validated, idusuario);
  response(res, 200, { ...validated });
};

export const getEmpresas = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getEmpresas");
  const data = await getEmpresasService();
  response(res, 201, data);
};

export const createEmpresa = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createEmpresa");
  const session_idusuario = req.session_user?.usuario?.idusuario ?? 1;
  const empresaCreateSchema = yup
    .object()
    .shape({
      riesgoid: yup
        .string()
        .trim()
        .transform((v) => (v === "" ? null : v))
        .nullable()
        .optional()
        .min(36)
        .max(36),
      paisid: yup
        .string()
        .trim()
        .transform((v) => (v === "" ? null : v))
        .nullable()
        .optional()
        .min(36)
        .max(36),
      distritoid: yup
        .string()
        .trim()
        .transform((v) => (v === "" ? null : v))
        .nullable()
        .optional()
        .min(36)
        .max(36),
      ruc: yup
        .string()
        .trim()
        .matches(/^\d{11}$/, "RUC debe ser un numero de exactamente 11 digitos")
        .required(),
      razon_social: yup.string().trim().required().min(2).max(200),
      nombre_comercial: yup
        .string()
        .trim()
        .transform((v) => (v === "" ? null : v))
        .nullable()
        .optional()
        .min(2)
        .max(200),
      fecha_inscripcion: yup.date().nullable().optional().typeError("fecha_inscripcion debe ser una fecha valida (YYYY-MM-DD)"),
      domicilio_fiscal: yup
        .string()
        .trim()
        .transform((v) => (v === "" ? null : v))
        .nullable()
        .optional()
        .min(2)
        .max(200),
      direccion_sede: yup
        .string()
        .trim()
        .transform((v) => (v === "" ? null : v))
        .nullable()
        .optional()
        .min(2)
        .max(200),
      direccion_sede_referencia: yup
        .string()
        .trim()
        .transform((v) => (v === "" ? null : v))
        .nullable()
        .optional()
        .min(2)
        .max(200),
    })
    .required();
  const validated = empresaCreateSchema.validateSync(
    req.body,
    { abortEarly: false, stripUnknown: true },
  ) as unknown as EmpresaCreateDto;

  const data = await createEmpresaService(validated, session_idusuario);
  response(res, 201, data);
};
