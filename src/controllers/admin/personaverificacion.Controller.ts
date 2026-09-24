import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import * as yup from "yup";
import * as personaverificacionService from "#src/services/personaverificacion.Service.js";

export const getPersonaverificacionsByPersonaid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getPersonaverificacionsByPersonaid");
  const { personaid } = req.params;
  const personaverificacionSchema = yup
    .object()
    .shape({
      personaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const personaverificacionValidated = personaverificacionSchema.validateSync(
    { personaid, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "personaverificacionValidated:", personaverificacionValidated);

  const personaverificacionsJson = await personaverificacionService.getPersonaverificacionsByPersonaidService({
    personaid: personaverificacionValidated.personaid,
  });

  response(res, 201, personaverificacionsJson);
};

export const activatePersonaverificacion = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activatePersonaverificacion");
  const { personaverificacionid } = req.params;
  const personaverificacionSchema = yup
    .object()
    .shape({
      personaverificacionid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const personaverificacionValidated = personaverificacionSchema.validateSync(
    { personaverificacionid },
    { abortEarly: false, stripUnknown: true },
  );
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
  const personaverificacionSchema = yup
    .object()
    .shape({
      personaverificacionid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const personaverificacionValidated = personaverificacionSchema.validateSync(
    { personaverificacionid },
    { abortEarly: false, stripUnknown: true },
  );
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
  const personaverificacionUpdateSchema = yup
    .object()
    .shape({
      personaverificacionid: yup.string().trim().required().min(36).max(36),
      personaverificacionestadoid: yup.string().min(36).max(36).required(),
      comentariousuario: yup.string().trim().max(20000),
      comentariointerno: yup.string().trim().max(20000).required(),
      archivos: yup.array().of(yup.string().min(36).max(36)),
    })
    .required();
  const personaverificacionValidated = personaverificacionUpdateSchema.validateSync(
    { personaverificacionid, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );
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
  const personaverificacionCreateSchema = yup
    .object()
    .shape({
      personaid: yup.string().min(36).max(36).required(),
      personaverificacionestadoid: yup.string().min(36).max(36).required(),
      comentariousuario: yup.string().trim().max(20000),
      comentariointerno: yup.string().trim().max(20000).required(),
      archivos: yup.array().of(yup.string().min(36).max(36)),
    })
    .required();
  const personaverificacionValidated = personaverificacionCreateSchema.validateSync(
    req.body,
    { abortEarly: false, stripUnknown: true },
  );

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
