import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as usuarioDao from "#src/daos/usuario.prisma.Dao.js";

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

import type { usuario } from "#root/generated/prisma/ft_factoring/client.js";

export const yoUsuario = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getUsuarioYo");

  const { id } = req.params;
  const usuarioSchema = yup
    .object()
    .shape({
      usuarioid: yup.string().trim().required().min(36).max(36),
    })
    .required();
  const usuarioValidated = usuarioSchema.validateSync({ usuarioid: id }, { abortEarly: false, stripUnknown: true });
  log.debug(line(), "usuarioValidated:", usuarioValidated);

  const usuarioFiltered = await prismaFT.client.$transaction(
    async (tx) => {
      const session_idusuario = req.session_user?.usuario?.idusuario;
      const filter_estados = [1];

      var usuario = await usuarioDao.getUsuarioPerfilByUsuarioid(tx, usuarioValidated.usuarioid);
      if (!usuario) {
        log.warn(line(), "Usuario no existe: [" + usuarioValidated.usuarioid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      if (usuario.idusuario !== session_idusuario) {
        log.warn(line(), "Intento de suplantacion de Usuario: [" + usuario.idusuario + "; " + session_idusuario + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      let usuarioFiltered = jsonUtils.removeAttributesPrivates(usuario);
      return usuarioFiltered;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, usuarioFiltered);
};
