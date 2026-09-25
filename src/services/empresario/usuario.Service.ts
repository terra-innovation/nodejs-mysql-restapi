import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as usuarioDao from "#root/src/daos/usuario.Dao.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#src/utils/logger.pino.js";

export const getUsuarioService = async (session_idusuario: number) => {
  log.debug(line(), "service::getUsuarioService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const usuario = await usuarioDao.getUsuarioDatosContactoByIdusuario(tx, session_idusuario, filter_estado);
      const usuarioFiltered = jsonUtils.removeAttributesPrivates(usuario);
      return usuarioFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
