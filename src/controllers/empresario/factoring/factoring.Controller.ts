import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import * as yup from "yup";
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
  const factoringCreateSchema = yup
    .object()
    .shape({
      facturas: yup
        .array()
        .of(
          yup.object({
            facturaid: yup.string().required().uuid(),
          }),
        )
        .min(1),
      cedenteid: yup.string().trim().required().min(36).max(36),
      aceptanteid: yup.string().trim().required().min(36).max(36),
      cuentabancariaid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
      contactoaceptanteid: yup.string().trim().required().min(36).max(36),
      monto_neto: yup.string().required(),
      fecha_pago_estimado: yup.string().required(),
      dias_pago_estimado: yup.string().required(),
    })
    .required();
  const factoringValidated = factoringCreateSchema.validateSync(
    req.body,
    { abortEarly: false, stripUnknown: true },
  );

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
