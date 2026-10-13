import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput } from "#src/utils/validationInputs.js";

import { activateFactoringempresaverificacionService, createFactoringempresaverificacionService, deleteFactoringempresaverificacionService, getFactoringempresasByVerificacionService, getFactoringempresaverificacionMasterService, getServicioempresaverificacionsByServicioempresaidService, updateFactoringempresaverificacionService, type ServicioEmpresaVerificacionCreateDto, type ServicioEmpresaVerificacionUpdateDto } from "#root/src/services/admin/factoringempresaverificacion.Service.js";

export const getServicioempresaverificacionsByServicioempresaid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getServicioempresaverificacionsByServicioempresaid");
  const { servicioempresaid } = req.params;
  const servicioempresaverificacionSchema = objectInput(
    z.object({
      servicioempresaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const validated = servicioempresaverificacionSchema.parse({ servicioempresaid, ...req.body });

  const data = await getServicioempresaverificacionsByServicioempresaidService(validated.servicioempresaid);
  response(res, 201, data);
};

export const updateFactoringempresaverificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateFactoringempresaverificacion");
  const { servicioempresaverificacionid } = req.params;
  const servicioempresaverificacionSchema = objectInput(
    z.object({
      servicioempresaverificacionid: stringInput(
        z
          .string()
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres")
          .refine((value) => value.length > 0, "Campo requerido"),
      ),
      servicioempresaestadoid: stringInput(
        z
          .string()
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres")
          .refine((value) => value.length > 0, "Campo requerido"),
      ),
      comentariousuario: stringInput(
        z
          .string()
          .refine((value) => value.length <= 20000, "Debe tener como máximo 20000 caracteres")
          .optional(),
        { trim: true },
      ),
      comentariointerno: stringInput(
        z
          .string()
          .refine((value) => value.length <= 20000, "Debe tener como máximo 20000 caracteres")
          .refine((value) => value.length > 0, "Campo requerido"),
        { trim: true },
      ),
      archivos: z
        .array(
          stringInput(
            z
              .string()
              .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
              .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres")
              .optional(),
          ),
        )
        .optional(),
    }),
  );
  const validated = servicioempresaverificacionSchema.parse({ servicioempresaverificacionid, ...req.body }) as unknown as ServicioEmpresaVerificacionUpdateDto;

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  const data = await updateFactoringempresaverificacionService(validated, idusuario);
  response(res, 200, data);
};

export const createFactoringempresaverificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createFactoringempresaverificacion");
  const servicioempresaverificacionCreateSchema = objectInput(
    z.object({
      servicioempresaid: stringInput(
        z
          .string()
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres")
          .refine((value) => value.length > 0, "Campo requerido"),
      ),
      servicioempresaestadoid: stringInput(
        z
          .string()
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres")
          .refine((value) => value.length > 0, "Campo requerido"),
      ),
      comentariousuario: stringInput(
        z
          .string()
          .refine((value) => value.length <= 20000, "Debe tener como máximo 20000 caracteres")
          .optional(),
        { trim: true },
      ),
      comentariointerno: stringInput(
        z
          .string()
          .refine((value) => value.length <= 20000, "Debe tener como máximo 20000 caracteres")
          .refine((value) => value.length > 0, "Campo requerido"),
        { trim: true },
      ),
      archivos: z
        .array(
          stringInput(
            z
              .string()
              .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
              .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres")
              .optional(),
          ),
        )
        .optional(),
    }),
  );
  const validated = servicioempresaverificacionCreateSchema.parse(req.body) as unknown as ServicioEmpresaVerificacionCreateDto;

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  const data = await createFactoringempresaverificacionService(validated, idusuario);
  response(res, 201, data);
};

export const getFactoringempresasByVerificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringempresasByVerificacion");
  const data = await getFactoringempresasByVerificacionService();
  response(res, 201, data);
};

export const getFactoringempresaverificacionMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringempresaverificacionMaster");
  const data = await getFactoringempresaverificacionMasterService();
  response(res, 201, data);
};

export const activateFactoringempresaverificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateServicioempresaverificacion");
  const { servicioempresaverificacionid } = req.params;
  const servicioempresaverificacionSchema = objectInput(
    z.object({
      servicioempresaverificacionid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const validated = servicioempresaverificacionSchema.parse({ servicioempresaverificacionid });

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  const data = await activateFactoringempresaverificacionService(validated.servicioempresaverificacionid, idusuario);
  response(res, 204, data);
};

export const deleteFactoringempresaverificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteServicioempresaverificacion");
  const { servicioempresaverificacionid } = req.params;
  const servicioempresaverificacionSchema = objectInput(
    z.object({
      servicioempresaverificacionid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const validated = servicioempresaverificacionSchema.parse({ servicioempresaverificacionid });

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  const data = await deleteFactoringempresaverificacionService(validated.servicioempresaverificacionid, idusuario);
  response(res, 204, data);
};
