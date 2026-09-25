import { Request, Response } from "express";
import * as yup from "yup";
import * as personaService from "#root/src/services/usuario/persona.Service.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";

export const verifyPersona = async (req: Request, res: Response) => {
  log.debug(line(), "controller::verifyPersona");
  const idusuario = req.session_user?.usuario?.idusuario;
  const NAME_REGX = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;

  const personaVerifySchema = yup
    .object()
    .shape({
      idusuario: yup.number().required(),
      identificacion_anverso: yup.string().trim().required().min(36).max(36),
      identificacion_reverso: yup.string().trim().required().min(36).max(36),
      identificacion_selfi: yup.string().trim().required().min(36).max(36),
      documentotipoid: yup.string().trim().required().min(36).max(36),
      documentonumero: yup
        .string()
        .trim()
        .required()
        .matches(/^[0-9]*$/, "Ingrese solo números")
        .length(8),
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
      tienevinculopep: yup.number().required().integer().max(1),
      espep: yup.number().required().integer().max(1),
      isdatacorrect: yup.boolean().required(),
    })
    .required();

  const personaValidated = personaVerifySchema.validateSync(
    { ...req.files, ...req.body, idusuario },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "personaValidated:", personaValidated);

  await personaService.verifyPersonaService(idusuario, personaValidated as personaService.VerifyPersonaPayload);

  response(res, 200, {});
};

export const getPersonaMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getPersonaMaster");
  const session_idusuario = req.session_user?.usuario?.idusuario;

  const personaMasterFiltered = await personaService.getPersonaMasterService(session_idusuario);

  response(res, 201, personaMasterFiltered);
};
