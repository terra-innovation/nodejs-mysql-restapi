import * as servicioService from "#root/src/services/admin/servicio.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput } from "#src/utils/validationInputs.js";

export const activateServicio = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateServicio");
  const { id } = req.params;
  const servicioSchema = objectInput(
    z.object({
      servicioid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const servicioValidated = servicioSchema.parse({ servicioid: id });
  log.debug(line(), "servicioValidated:", servicioValidated);

  await servicioService.activateServicioService({
    servicioid: servicioValidated.servicioid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, {});
};

export const deleteServicio = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteServicio");
  const { id } = req.params;
  const servicioSchema = objectInput(
    z.object({
      servicioid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );
  const servicioValidated = servicioSchema.parse({ servicioid: id });
  log.debug(line(), "servicioValidated:", servicioValidated);

  const servicioDeleted = await servicioService.deleteServicioService({
    servicioid: servicioValidated.servicioid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, servicioDeleted);
};

export const getServicioMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getServicioMaster");
  const serviciosMasterFiltered = await servicioService.getServicioMasterService();
  response(res, 201, serviciosMasterFiltered);
};

export const updateServicio = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateServicio");
  const { id } = req.params;
  const servicioUpdateSchema = objectInput(
    z.object({
      servicioid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      nombre: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 2, "Debe tener al menos 2 caracteres")
          .refine((value) => value.length <= 50, "Debe tener como máximo 50 caracteres"),
        { trim: true },
      ),
      alias: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 2, "Debe tener al menos 2 caracteres")
          .refine((value) => value.length <= 50, "Debe tener como máximo 50 caracteres"),
        { trim: true },
      ),
      descripcion: stringInput(
        z
          .string()
          .refine((value) => value.length >= 2, "Debe tener al menos 2 caracteres")
          .refine((value) => value.length <= 500, "Debe tener como máximo 500 caracteres")
          .optional(),
        { trim: true },
      ),
      urlcontrato: stringInput(
        z
          .string()
          .refine((value) => value.length >= 2, "Debe tener al menos 2 caracteres")
          .refine((value) => value.length <= 500, "Debe tener como máximo 500 caracteres")
          .optional(),
        { trim: true },
      ),
      pathroute: stringInput(
        z
          .string()
          .refine((value) => value.length >= 2, "Debe tener al menos 2 caracteres")
          .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres")
          .optional(),
        { trim: true },
      ),
    }),
  );
  const servicioValidated = servicioUpdateSchema.parse({ servicioid: id, ...req.body });
  log.debug(line(), "servicioValidated:", servicioValidated);

  const servicioUpdated = await servicioService.updateServicioService({
    servicioid: servicioValidated.servicioid,
    nombre: servicioValidated.nombre,
    alias: servicioValidated.alias,
    descripcion: servicioValidated.descripcion,
    urlcontrato: servicioValidated.urlcontrato,
    pathroute: servicioValidated.pathroute,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 200, servicioUpdated);
};

export const getServicios = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getServicios");
  const servicios = await servicioService.getServiciosService();
  response(res, 201, servicios);
};

export const createServicio = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createServicio");
  const servicioCreateSchema = objectInput(
    z.object({
      nombre: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 2, "Debe tener al menos 2 caracteres")
          .refine((value) => value.length <= 50, "Debe tener como máximo 50 caracteres"),
        { trim: true },
      ),
      alias: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 2, "Debe tener al menos 2 caracteres")
          .refine((value) => value.length <= 50, "Debe tener como máximo 50 caracteres"),
        { trim: true },
      ),
      descripcion: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 2, "Debe tener al menos 2 caracteres")
          .refine((value) => value.length <= 500, "Debe tener como máximo 500 caracteres"),
        { trim: true },
      ),
      urlcontrato: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 2, "Debe tener al menos 2 caracteres")
          .refine((value) => value.length <= 500, "Debe tener como máximo 500 caracteres"),
        { trim: true },
      ),
      pathroute: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 2, "Debe tener al menos 2 caracteres")
          .refine((value) => value.length <= 100, "Debe tener como máximo 100 caracteres"),
        { trim: true },
      ),
    }),
  );
  const servicioValidated = servicioCreateSchema.parse(req.body);
  log.debug(line(), "servicioValidated:", servicioValidated);

  const servicioCreated = await servicioService.createServicioService({
    nombre: servicioValidated.nombre,
    alias: servicioValidated.alias,
    descripcion: servicioValidated.descripcion,
    urlcontrato: servicioValidated.urlcontrato,
    pathroute: servicioValidated.pathroute,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 201, servicioCreated);
};
