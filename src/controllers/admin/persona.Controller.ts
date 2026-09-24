import { Request, Response } from "express";
import * as yup from "yup";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";

import {
  activatePersonaService,
  deletePersonaService,
  getPersonaMasterService,
  getPersonasService,
  updatePersonaService,
  type PersonaUpdateDto,
} from "#src/services/persona.Service.js";

export const activatePersona = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activatePersona");
  const { id } = req.params;
  const personaSchema = yup
    .object()
    .shape({
      personaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const validated = personaSchema.validateSync({ personaid: id }, { abortEarly: false, stripUnknown: true });

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  const data = await activatePersonaService(validated.personaid, idusuario);
  response(res, 204, data);
};

export const deletePersona = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deletePersona");
  const { id } = req.params;
  const personaSchema = yup
    .object()
    .shape({
      personaid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const validated = personaSchema.validateSync({ personaid: id }, { abortEarly: false, stripUnknown: true });

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  const data = await deletePersonaService(validated.personaid, idusuario);
  response(res, 204, data);
};

export const getPersonaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getPersonaMaster");
  const data = await getPersonaMasterService();
  response(res, 201, data);
};

export const updatePersona = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updatePersona");
  const { id } = req.params;
  const NAME_REGX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;
  const personaUpdateSchema = yup
    .object()
    .shape({
      personaid: yup.string().trim().required().min(36).max(36),
      personanombres: yup.string().trim().required().matches(NAME_REGX, "Debe ser un nombre válido").min(2).max(100),
      apellidopaterno: yup.string().trim().required().matches(NAME_REGX, "Debe ser un apellido válido").min(2).max(50),
      apellidomaterno: yup.string().trim().required().matches(NAME_REGX, "Debe ser un apellido válido").min(2).max(50),
      paisnacionalidadid: yup.string().trim().required().min(36).max(36),
      paisnacimientoid: yup.string().trim().required().min(36).max(36),
      paisresidenciaid: yup.string().trim().required().min(36).max(36),
      distritoresidenciaid: yup.string().trim().required().min(36).max(36),
      generoid: yup.string().trim().required().min(36).max(36),
      fechanacimiento: yup.date().required(),
      direccion: yup.string().trim().required().max(200),
      direccionreferencia: yup.string().trim().required().max(200),
    })
    .required();
  const validated = personaUpdateSchema.validateSync(
    { personaid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  ) as unknown as PersonaUpdateDto;

  const idusuario = req.session_user?.usuario?.idusuario ?? 1;
  await updatePersonaService(validated, idusuario);
  response(res, 200, {});
};

export const getPersonas = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getPersonas");
  const data = await getPersonasService();
  response(res, 201, data);
};
