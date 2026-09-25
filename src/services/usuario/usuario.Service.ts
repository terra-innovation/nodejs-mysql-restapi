import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as usuarioDao from "#root/src/daos/usuario.Dao.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#src/utils/logger.pino.js";

export const getYoUsuarioService = async (idUsuarioSession: number, usuarioid: string) => {
  log.debug(line(), "service::getYoUsuarioService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const usuario = await usuarioDao.getUsuarioPerfilByUsuarioid(tx, usuarioid);
      if (!usuario) {
        log.warn(line(), "Usuario no existe: [" + usuarioid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      if (usuario.idusuario !== idUsuarioSession) {
        log.warn(line(), "Intento de suplantacion de Usuario: [" + usuario.idusuario + "; " + idUsuarioSession + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const usuarioFiltered = jsonUtils.removeAttributesPrivates(usuario);
      return usuarioFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
