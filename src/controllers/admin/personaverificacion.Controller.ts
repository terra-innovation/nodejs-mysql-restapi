import * as personaverificacionService from "#root/src/services/admin/personaverificacion.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput } from "#src/utils/validationInputs.js";

export const getPersonaverificacionsByPersonaid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getPersonaverificacionsByPersonaid");
  const { personaid } = req.params;
  const personaverificacionSchema = objectInput(
    z.object({
      personaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const personaverificacionValidated = personaverificacionSchema.parse({ personaid, ...req.body });
  log.debug(line(), "personaverificacionValidated:", personaverificacionValidated);

  const personaverificacionsJson = await personaverificacionService.getPersonaverificacionsByPersonaidService({
    personaid: personaverificacionValidated.personaid,
  });

  response(res, 201, personaverificacionsJson);
};

export const activatePersonaverificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activatePersonaverificacion");
  const { personaverificacionid } = req.params;
  const personaverificacionSchema = objectInput(
    z.object({
      personaverificacionid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const personaverificacionValidated = personaverificacionSchema.parse({ personaverificacionid });
  log.debug(line(), "personaverificacionValidated:", personaverificacionValidated);

  const personaverificacionActivated = await personaverificacionService.activatePersonaverificacionService({
    personaverificacionid: personaverificacionValidated.personaverificacionid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, personaverificacionActivated);
};

export const deletePersonaverificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deletePersonaverificacion");
  const { personaverificacionid } = req.params;
  const personaverificacionSchema = objectInput(
    z.object({
      personaverificacionid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const personaverificacionValidated = personaverificacionSchema.parse({ personaverificacionid });
  log.debug(line(), "personaverificacionValidated:", personaverificacionValidated);

  const personaverificacionDeleted = await personaverificacionService.deletePersonaverificacionService({
    personaverificacionid: personaverificacionValidated.personaverificacionid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, personaverificacionDeleted);
};

export const getPersonaverificacionMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getPersonaverificacionMaster");
  const personaverificacionMaster = await personaverificacionService.getPersonaverificacionMasterService();
  response(res, 201, personaverificacionMaster);
};

export const updatePersonaverificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updatePersonaverificacion");
  const { personaverificacionid } = req.params;
  const personaverificacionUpdateSchema = objectInput(
    z.object({
      personaverificacionid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      personaverificacionestadoid: stringInput(
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
  const personaverificacionValidated = personaverificacionUpdateSchema.parse({ personaverificacionid, ...req.body });
  log.debug(line(), "personaverificacionValidated:", personaverificacionValidated);

  const resultado = await personaverificacionService.updatePersonaverificacionService({
    personaverificacionid: personaverificacionValidated.personaverificacionid,
    personaverificacionestadoid: personaverificacionValidated.personaverificacionestadoid,
    comentariousuario: personaverificacionValidated.comentariousuario,
    comentariointerno: personaverificacionValidated.comentariointerno,
    archivos: personaverificacionValidated.archivos,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 200, resultado);
};

export const getPersonaverificacions = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getPersonaverificacions");
  const personaverificacions = await personaverificacionService.getPersonaverificacionsService();
  response(res, 201, personaverificacions);
};

export const createPersonaverificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createPersonaverificacion");
  const personaverificacionCreateSchema = objectInput(
    z.object({
      personaid: stringInput(
        z
          .string()
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres")
          .refine((value) => value.length > 0, "Campo requerido"),
      ),
      personaverificacionestadoid: stringInput(
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
  const personaverificacionValidated = personaverificacionCreateSchema.parse(req.body);

  const resultado = await personaverificacionService.createPersonaverificacionService({
    personaid: personaverificacionValidated.personaid,
    personaverificacionestadoid: personaverificacionValidated.personaverificacionestadoid,
    comentariousuario: personaverificacionValidated.comentariousuario,
    comentariointerno: personaverificacionValidated.comentariointerno,
    archivos: personaverificacionValidated.archivos,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 201, resultado);
};
