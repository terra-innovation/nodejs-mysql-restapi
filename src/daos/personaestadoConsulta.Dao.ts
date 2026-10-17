import type { TxClient } from "#src/types/Prisma.types.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getEstadoPersonaPropia = (tx: TxClient, idusuario: number) =>
  tx.usuario.findFirst({
    where: { idusuario, estado: ESTADO.ACTIVO },
    select: {
      usuarioid: true,
      ispersonavalidated: true,
      persona: {
        select: {
          persona_verificacion_estado: {
            select: { code: true, alias: true, color: true, isusuarioedit: true, ispersonavalidated: true },
          },
        },
      },
    },
  });
