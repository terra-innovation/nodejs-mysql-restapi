import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput, inputUuidPattern } from "#src/utils/validationInputs.js";
import { activateFactoringService, deleteFactoringService, getFactoringMasterService, getFactoringsService, getFactoringEmpresaDetalleService, updateFactoringService } from "#src/services/admin/factoring.Service.js";

export const activateFactoring = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateFactoring");
  const { id } = req.params;
  const factoringSchema = objectInput(
    z.object({
      factoringid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );

  const validated = factoringSchema.parse({ factoringid: id });
  log.debug(line(), "factoringValidated:", validated);

  const data = await activateFactoringService({
    factoringid: validated.factoringid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, data);
};

export const deleteFactoring = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteFactoring");
  const { id } = req.params;
  const factoringSchema = objectInput(
    z.object({
      factoringid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
    }),
  );

  const validated = factoringSchema.parse({ factoringid: id });
  log.debug(line(), "factoringValidated:", validated);

  const data = await deleteFactoringService({
    factoringid: validated.factoringid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, data);
};

export const updateFactoring = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateFactoring");
  const { id } = req.params;
  const factoringUpdateSchema = objectInput(
    z.object({
      factoringid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      factoringpropuestaaceptadaid: stringInput(
        z
          .string()
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres")
          .optional(),
        { trim: true },
      ),
    }),
  );

  const validated = factoringUpdateSchema.parse({ factoringid: id, ...req.body });
  log.debug(line(), "factoringValidated:", validated);

  await updateFactoringService({
    factoringid: validated.factoringid,
    factoringpropuestaaceptadaid: validated.factoringpropuestaaceptadaid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 200, {});
};

export const getFactoringMaster = async (_req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringsMaster");
  const data = await getFactoringMasterService();
  response(res, 201, data);
};

export const getFactorings = async (_req: Request, res: Response) => {
  log.debug(line(), "controller::getFactorings");
  const data = await getFactoringsService();
  response(res, 201, data);
};

export const getFactoringEmpresaDetalle = async (req: Request, res: Response) => {
  const { empresaid } = objectInput(
    z.object({
      empresaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .regex(inputUuidPattern),
        { trim: true },
      ),
    }),
  ).parse(req.params);
  const data = await getFactoringEmpresaDetalleService(empresaid);
  response(res, 200, data);
};
