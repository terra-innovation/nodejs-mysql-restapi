import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput } from "#src/utils/validationInputs.js";

import { activateFactoringinversionistaverificacionService, createFactoringinversionistaverificacionService, deleteFactoringinversionistaverificacionService, getFactoringinversionistasByVerificacionService, getFactoringinversionistaverificacionMasterService, getServicioinversionistaverificacionsByServicioinversionistaidService, updateFactoringinversionistaverificacionService, type ServicioInversionistaVerificacionCreateDto, type ServicioInversionistaVerificacionUpdateDto } from "#root/src/services/admin/factoringinversionistaverificacion.Service.js";

export const getServicioinversionistaverificacionsByServicioinversionistaid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getServicioinversionistaverificacionsByServicioinversionistaid");
  const { servicioinversionistaid } = req.params;
  const servicioinversionistaverificacionSchema = objectInput(
    z.object({
      servicioinversionistaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const validated = servicioinversionistaverificacionSchema.parse({ servicioinversionistaid, ...req.body });

  const data = await getServicioinversionistaverificacionsByServicioinversionistaidService(validated.servicioinversionistaid);
  response(res, 201, data);
};

export const updateFactoringinversionistaverificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateFactoringinversionistaverificacion");
  const { servicioinversionistaverificacionid } = req.params;
  const servicioinversionistaverificacionSchema = objectInput(
    z.object({
      servicioinversionistaverificacionid: stringInput(
        z
          .string()
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres")
          .refine((value) => value.length > 0, "Campo requerido"),
      ),
      servicioinversionistaestadoid: stringInput(
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
  const validated = servicioinversionistaverificacionSchema.parse({ servicioinversionistaverificacionid, ...req.body }) as unknown as ServicioInversionistaVerificacionUpdateDto;

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  const data = await updateFactoringinversionistaverificacionService(validated, idusuario);
  response(res, 200, data);
};

export const createFactoringinversionistaverificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createFactoringinversionistaverificacion");
  const servicioinversionistaverificacionCreateSchema = objectInput(
    z.object({
      servicioinversionistaid: stringInput(
        z
          .string()
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres")
          .refine((value) => value.length > 0, "Campo requerido"),
      ),
      servicioinversionistaestadoid: stringInput(
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
  const validated = servicioinversionistaverificacionCreateSchema.parse(req.body) as unknown as ServicioInversionistaVerificacionCreateDto;

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  const data = await createFactoringinversionistaverificacionService(validated, idusuario);
  response(res, 201, data);
};

export const getFactoringinversionistasByVerificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringinversionistasByVerificacion");
  const data = await getFactoringinversionistasByVerificacionService();
  response(res, 201, data);
};

export const getFactoringinversionistaverificacionMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringinversionistaverificacionMaster");
  const data = await getFactoringinversionistaverificacionMasterService();
  response(res, 201, data);
};

export const activateFactoringinversionistaverificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateServicioinversionistaverificacion");
  const { servicioinversionistaverificacionid } = req.params;
  const servicioinversionistaverificacionSchema = objectInput(
    z.object({
      servicioinversionistaverificacionid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const validated = servicioinversionistaverificacionSchema.parse({ servicioinversionistaverificacionid });

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  const data = await activateFactoringinversionistaverificacionService(validated.servicioinversionistaverificacionid, idusuario);
  response(res, 204, data);
};

export const deleteFactoringinversionistaverificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteServicioinversionistaverificacion");
  const { servicioinversionistaverificacionid } = req.params;
  const servicioinversionistaverificacionSchema = objectInput(
    z.object({
      servicioinversionistaverificacionid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const validated = servicioinversionistaverificacionSchema.parse({ servicioinversionistaverificacionid });

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  const data = await deleteFactoringinversionistaverificacionService(validated.servicioinversionistaverificacionid, idusuario);
  response(res, 204, data);
};
