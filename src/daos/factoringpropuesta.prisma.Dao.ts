import { PrismaClient } from "#root/generated/prisma/client";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

const prisma = new PrismaClient();

export const getFactoringpropuestasByIdfactoring = async (_idfactoring, estados) => {
  try {
    const facturas = await prisma.factoring_propuesta.findMany({
      where: {
        idfactoring: _idfactoring,
        estado: {
          in: estados,
        },
      },
      include: {
        factoring_estrategia: true,
      },
    });
    return facturas;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
