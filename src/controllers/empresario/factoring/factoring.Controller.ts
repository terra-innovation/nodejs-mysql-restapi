import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import { z } from "zod";
import { objectInput, stringInput, inputUuidPattern } from "#src/utils/validationInputs.js";
import * as factoringService from "#src/services/empresario/factoring.Service.js";

export const getFactorings = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactorings");
  const factorings = await factoringService.getFactoringsService({
    idusuario: req.session_user.usuario.idusuario,
  });
  response(res, 201, factorings);
};

export const getFactoringMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringsMaster");
  const data = await factoringService.getFactoringMasterService();
  response(res, 201, data);
};

export const createFactoring = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createFactoring");
  const factoringCreateSchema = objectInput(
    z.object({
      facturas: z
        .array(
          objectInput(
            z.object({
              facturaid: stringInput(
                z
                  .string()
                  .refine((value) => value.length > 0, "Campo requerido")
                  .regex(inputUuidPattern),
              ),
            }),
          ),
        )
        .min(1)
        .optional(),
      cedenteid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      aceptanteid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      cuentabancariaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      monedaid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      contactoaceptanteid: stringInput(
        z
          .string()
          .refine((value) => value.length > 0, "Campo requerido")
          .refine((value) => value.length >= 36, "Debe tener al menos 36 caracteres")
          .refine((value) => value.length <= 36, "Debe tener como máximo 36 caracteres"),
        { trim: true },
      ),
      monto_neto: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
      fecha_pago_estimado: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
      dias_pago_estimado: stringInput(z.string().refine((value) => value.length > 0, "Campo requerido")),
    }),
  );
  const factoringValidated = factoringCreateSchema.parse(req.body);

  const factoringCreated = await factoringService.createFactoringService({
    facturas: factoringValidated.facturas as unknown as factoringService.FacturaItemDto[],
    cedenteid: factoringValidated.cedenteid,
    aceptanteid: factoringValidated.aceptanteid,
    cuentabancariaid: factoringValidated.cuentabancariaid,
    monedaid: factoringValidated.monedaid,
    contactoaceptanteid: factoringValidated.contactoaceptanteid,
    monto_neto: factoringValidated.monto_neto,
    fecha_pago_estimado: factoringValidated.fecha_pago_estimado,
    dias_pago_estimado: factoringValidated.dias_pago_estimado,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 201, factoringCreated);
};
