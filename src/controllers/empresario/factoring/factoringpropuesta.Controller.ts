import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import * as yup from "yup";
import * as factoringpropuestaService from "#src/services/empresario/factoringpropuesta.Service.js";

export const acceptFactoringpropuesta = async (req: Request, res: Response) => {
  log.debug(line(), "controller::acceptFactoringpropuesta");
  const { factoringid } = req.params;
  const factoringpropuestaUpdateSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
      factoringpropuestaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringpropuestaValidated = factoringpropuestaUpdateSchema.validateSync(
    { factoringid, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "factoringpropuestaValidated:", factoringpropuestaValidated);

  await factoringpropuestaService.acceptFactoringpropuestaService({
    factoringid: factoringpropuestaValidated.factoringid,
    factoringpropuestaid: factoringpropuestaValidated.factoringpropuestaid,
    idusuario: req.session_user.usuario.idusuario ?? 1,
  });

  response(res, 200, {});
};

export const getFactoringpropuestaVigente = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringpropuestaVigente");
  const { factoringid } = req.params;
  const factoringpropuestaSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const factoringpropuestaValidated = factoringpropuestaSchema.validateSync(
    { factoringid, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );

  const factoringpropuesta = await factoringpropuestaService.getFactoringpropuestaVigenteService({
    factoringid: factoringpropuestaValidated.factoringid,
    idusuario: req.session_user.usuario.idusuario ?? 1,
  });

  response(res, 201, factoringpropuesta);
};
