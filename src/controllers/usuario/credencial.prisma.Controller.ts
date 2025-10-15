import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as usuarioDao from "#src/daos/usuario.prisma.Dao.js";
import * as credencialDao from "#src/daos/credencial.prisma.Dao.js";

import { response } from "#src/utils/CustomResponseOk.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

import * as storageUtils from "#src/utils/storageUtils.js";
import * as validacionesYup from "#src/utils/validacionesYup.js";
import * as fs from "fs";
import path from "path";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import bcrypt from "bcryptjs";

import type { usuario } from "#root/generated/prisma/ft_factoring/client.js";

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
  const credencialValidated = credencialSchema.validateSync({ usuarioid: id, ...req.body }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "credencialValidated:", credencialValidated);

  const usuarioFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const session_idusuario = req.session_user?.usuario?.idusuario;
      const filter_estados = [1];

      var usuario = await usuarioDao.getUsuarioByUsuarioid(tx, credencialValidated.usuarioid);
      if (!usuario) {
        log.warn(line(), "Usuario no existe: [" + credencialValidated.usuarioid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      if (usuario.idusuario !== session_idusuario) {
        log.warn(line(), "Intento de suplantacion de Usuario: [" + usuario.idusuario + "; " + session_idusuario + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const credencial = await credencialDao.getCredencialByIdusuario(tx, usuario.idusuario);
      if (!credencial) {
        log.warn(line(), "Credencial no existe: [" + usuario.idusuario + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      if (!bcrypt.compareSync(credencialValidated.old, credencial.password)) {
        log.warn(line(), "La contraseña anterior no es correcta: [" + usuario.idusuario + "]");
        throw new ClientError("La contraseña anterior no es correcta", 404);
      }

      //Encrypt user password. Cumple estándares PCI-DSS o la GDPR: hashing y salting
      const salt = bcrypt.genSaltSync(12); // 12 es el costo del salting
      const encryptedPassword = bcrypt.hashSync(credencialValidated.password, salt);

      const credencialToUpdate: Prisma.credencialUpdateInput = {
        password: encryptedPassword,
        idusuariomod: req.session_user.usuario.idusuario ?? 1,
        fechamod: new Date(),
      };

      const credencialUpdated = await credencialDao.updateCredencial(tx, credencial.credencialid, credencialToUpdate);

      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 200, usuarioFiltered);
};
