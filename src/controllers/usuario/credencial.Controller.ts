import { Request, Response } from "express";
import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import * as yup from "yup";
import {
  updateCredencialService,
  UpdateCredencialDto,
} from "#root/src/services/usuario/credencial.Service.js";

export const updateCredencial = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateCredencial");

  const { id } = req.params;
  const credencialSchema = yup
    .object()
    .shape({
      usuarioid: yup.string().trim().required().min(36).max(36),
      old: yup.string().required("La contraseña es obligatoria"),
      password: yup
        .string()
        .required("La nueva contraseña es obligatoria")
        .min(8, "La nueva contraseña debe tener al menos 8 caracteres")
        .matches(/[a-z]/, "Debe contener al menos una letra minúscula")
        .matches(/[A-Z]/, "Debe contener al menos una letra mayúscula")
        .matches(/\d/, "Debe contener al menos un número")
        .matches(/[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]/, "Debe contener al menos un carácter especial"),
      confirm: yup
        .string()
        .required("La confirmación de la contraseña es obligatoria")
        .min(8, "La cofirmación del contraseña debe tener al menos 8 caracteres")
        .oneOf([yup.ref("password"), null], "Las contraseñas no coinciden"),
    })
    .required();

  const credencialValidated = credencialSchema.validateSync(
    { usuarioid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  ) as UpdateCredencialDto;
  log.debug(line(), "credencialValidated:", credencialValidated);

  const session_idusuario = req.session_user?.usuario?.idusuario;
  const result = await updateCredencialService(session_idusuario, credencialValidated);

  response(res, 200, result);
};
