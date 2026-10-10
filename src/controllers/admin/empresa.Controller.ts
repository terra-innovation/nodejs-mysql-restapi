import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput, dateInput } from "#src/utils/validationInputs.js";

import { activateEmpresaService, createEmpresaService, deleteEmpresaService, getEmpresaMasterService, getEmpresasService, updateEmpresaService, type EmpresaCreateDto, type EmpresaUpdateDto } from "#root/src/services/admin/empresa.Service.js";

export const activateEmpresa = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateEmpresa");
  const { id } = req.params;
  const empresaSchema = objectInput(
    z.object({
      empresaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const validated = empresaSchema.parse({ empresaid: id });

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  await activateEmpresaService(validated.empresaid, idusuario);
  response(res, 204, {});
};

export const deleteEmpresa = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteEmpresa");
  const { id } = req.params;
  const empresaSchema = objectInput(
    z.object({
      empresaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const validated = empresaSchema.parse({ empresaid: id });

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
  const empresaUpdateSchema = objectInput(
    z.object({
      empresaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      riesgoid: stringInput(
        z
          .string()
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres")
          .nullable()
          .optional(),
        { trim: true, transforms: [(v) => (v === "" ? null : v)] },
      ),
      paisid: stringInput(
        z
          .string()
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres")
          .nullable()
          .optional(),
        { trim: true, transforms: [(v) => (v === "" ? null : v)] },
      ),
      distritoid: stringInput(
        z
          .string()
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres")
          .nullable()
          .optional(),
        { trim: true, transforms: [(v) => (v === "" ? null : v)] },
      ),
      ruc: stringInput(
        z
          .string()
          .regex(/^\d{11}$/, "RUC debe ser un numero de exactamente 11 digitos")
          .refine((value) => value.length > 0, "Campo requerido"),
        { trim: true },
      ),
      razon_social: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 2, "Debe tener al menos 2 caracteres")
          .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
        { trim: true },
      ),
      nombre_comercial: stringInput(
        z
          .string()
          .refine((value) => value.length >= 2, "Debe tener al menos 2 caracteres")
          .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres")
          .nullable()
          .optional(),
        { trim: true, transforms: [(v) => (v === "" ? null : v)] },
      ),
      fecha_inscripcion: dateInput(z.date({ error: "fecha_inscripcion debe ser una fecha valida (YYYY-MM-DD)" }).nullable().optional(), { transforms: [(v) => (v === "" ? null : v)] }),
      domicilio_fiscal: stringInput(
        z
          .string()
          .refine((value) => value.length >= 2, "Debe tener al menos 2 caracteres")
          .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres")
          .nullable()
          .optional(),
        { trim: true, transforms: [(v) => (v === "" ? null : v)] },
      ),
      direccion_sede: stringInput(
        z
          .string()
          .refine((value) => value.length >= 2, "Debe tener al menos 2 caracteres")
          .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres")
          .nullable()
          .optional(),
        { trim: true, transforms: [(v) => (v === "" ? null : v)] },
      ),
      direccion_sede_referencia: stringInput(
        z
          .string()
          .refine((value) => value.length >= 2, "Debe tener al menos 2 caracteres")
          .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres")
          .nullable()
          .optional(),
        { trim: true, transforms: [(v) => (v === "" ? null : v)] },
      ),
    }),
  );
  const validated = empresaUpdateSchema.parse({ empresaid: id, ...req.body }) as unknown as EmpresaUpdateDto;

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
  const empresaCreateSchema = objectInput(
    z.object({
      riesgoid: stringInput(
        z
          .string()
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres")
          .nullable()
          .optional(),
        { trim: true, transforms: [(v) => (v === "" ? null : v)] },
      ),
      paisid: stringInput(
        z
          .string()
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres")
          .nullable()
          .optional(),
        { trim: true, transforms: [(v) => (v === "" ? null : v)] },
      ),
      distritoid: stringInput(
        z
          .string()
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres")
          .nullable()
          .optional(),
        { trim: true, transforms: [(v) => (v === "" ? null : v)] },
      ),
      ruc: stringInput(
        z
          .string()
          .regex(/^\d{11}$/, "RUC debe ser un numero de exactamente 11 digitos")
          .refine((value) => value.length > 0, "Campo requerido"),
        { trim: true },
      ),
      razon_social: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 2, "Debe tener al menos 2 caracteres")
          .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres"),
        { trim: true },
      ),
      nombre_comercial: stringInput(
        z
          .string()
          .refine((value) => value.length >= 2, "Debe tener al menos 2 caracteres")
          .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres")
          .nullable()
          .optional(),
        { trim: true, transforms: [(v) => (v === "" ? null : v)] },
      ),
      fecha_inscripcion: dateInput(z.date({ error: "fecha_inscripcion debe ser una fecha valida (YYYY-MM-DD)" }).nullable().optional()),
      domicilio_fiscal: stringInput(
        z
          .string()
          .refine((value) => value.length >= 2, "Debe tener al menos 2 caracteres")
          .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres")
          .nullable()
          .optional(),
        { trim: true, transforms: [(v) => (v === "" ? null : v)] },
      ),
      direccion_sede: stringInput(
        z
          .string()
          .refine((value) => value.length >= 2, "Debe tener al menos 2 caracteres")
          .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres")
          .nullable()
          .optional(),
        { trim: true, transforms: [(v) => (v === "" ? null : v)] },
      ),
      direccion_sede_referencia: stringInput(
        z
          .string()
          .refine((value) => value.length >= 2, "Debe tener al menos 2 caracteres")
          .refine((value) => value.length <= 200, "Debe tener como máximo 200 caracteres")
          .nullable()
          .optional(),
        { trim: true, transforms: [(v) => (v === "" ? null : v)] },
      ),
    }),
  );
  const validated = empresaCreateSchema.parse(req.body) as unknown as EmpresaCreateDto;

  const data = await createEmpresaService(validated, session_idusuario);
  response(res, 201, data);
};
