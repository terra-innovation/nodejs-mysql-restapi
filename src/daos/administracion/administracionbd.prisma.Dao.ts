import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import type { Prisma, zlaboratorio_usuario } from "#src/models/prisma/ft_factoring/client";
import { TxClient } from "#src/types/Prisma.types.js";

export const getTimezones = async (tx: TxClient) => {
  try {
    const result = await tx.$queryRaw<
      {
        global_time_zone: string;
        session_time_zone: string;
        now: Date;
        sys_time: Date;
        current_timestamp: Date;
        utc_timestamp: Date;
      }[]
    >`SELECT @@global.time_zone as global_time_zone, @@session.time_zone as 'session_time_zone', 
      NOW() AS 'now', SYSDATE() AS 'sys_time'
    , CURRENT_TIMESTAMP AS 'current_timestamp', UTC_TIMESTAMP() AS 'utc_timestamp';`;

    return result;
  } catch (error) {
    log.error(line(), error);
    throw new ClientError("Ocurrió un error", 500);
  }
};
