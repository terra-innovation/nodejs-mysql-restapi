import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, rol } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getRoles = async (tx: TxClient, estados: number[]) => {
  try {
    const roles = await tx.rol.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return roles;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
