import * as accionistaDao from "#root/src/daos/accionista.Dao.js";
import * as empresaDao from "#root/src/daos/empresa.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { line, log } from "#src/utils/logger.pino.js";

export const getAccionistasByEmpresaidService = async (empresaid: string) => {
  log.debug(line(), "service::getAccionistasByEmpresaidService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

      const empresa = await empresaDao.getEmpresaByEmpresaid(tx, empresaid);
      if (!empresa) {
        log.warn(line(), "Empresa no existe: [" + empresaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const accionistas = await accionistaDao.getAccionistasByIdempresa(tx, empresa.idempresa, filter_estado);
      return accionistas;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
