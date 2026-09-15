import { ClientError } from "#src/utils/CustomErrors.js";

import { TxClient } from "#src/types/Prisma.types.js";
import { line, log } from "#src/utils/logger.pino.js";

export const getTimezones = async (tx: TxClient) => {
  try {
    const result = await tx.$queryRaw<
      {
        global_time_zone: string;
        session_time_zone: string;
        system_time_zone: string;
        now: string;
        sys_time: string;
        current_timestamp: string;
        utc_timestamp: string;
        diferencia_horas: string;
      }[]
    >`SELECT 
      @@global.time_zone as global_time_zone, 
      @@session.time_zone as 'session_time_zone', 
      @@system_time_zone AS system_time_zone,
      DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s') AS 'now',
      DATE_FORMAT(SYSDATE(), '%Y-%m-%d %H:%i:%s') AS 'sys_time',
      DATE_FORMAT(CURRENT_TIMESTAMP, '%Y-%m-%d %H:%i:%s') AS 'current_timestamp', 
      DATE_FORMAT(UTC_TIMESTAMP(), '%Y-%m-%d %H:%i:%s') AS 'utc_timestamp',
      CAST(TIMEDIFF(NOW(), UTC_TIMESTAMP()) AS CHAR) AS diferencia_horas;`;

    return result;
  } catch (error) {
    log.error(line(), error);
    throw new ClientError("Ocurrió un error", 500);
  }
};
