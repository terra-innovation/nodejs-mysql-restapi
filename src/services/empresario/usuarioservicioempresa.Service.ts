import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as usuarioservicioempresaDao from "#root/src/daos/usuarioservicioempresa.Dao.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#src/utils/logger.pino.js";

export const getUsuarioservicioempresasService = async (session_idusuario: number) => {
  log.debug(line(), "service::getUsuarioservicioempresasService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const idservicio = 1;

      const usuarioservicioempresas =
        await usuarioservicioempresaDao.getUsuarioservicioempresaByIdusuarioIdServicio(
          tx,
          session_idusuario,
          idservicio,
          filter_estados,
        );
      const empresasFiltered = jsonUtils.removeAttributesPrivates(usuarioservicioempresas);
      return empresasFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getUsuarioservicioempresaMasterService = async () => {
  log.debug(line(), "service::getUsuarioservicioempresaMasterService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
