import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, archivo_cuenta_bancaria } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getArchivocuentabancarias = async (tx: TxClient, estados: number[]) => {
  try {
    const archivocuentabancarias = await tx.archivo_cuenta_bancaria.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return archivocuentabancarias;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivoCuentaBancariaByIdarchivoIdcuentabancaria = async (tx: TxClient, idarchivo: number, idcuentabancaria: number) => {
  try {
    const archivocuentabancaria = await tx.archivo_cuenta_bancaria.findUnique({
      where: {
        idarchivo_idcuentabancaria: {
          idarchivo: idarchivo,
          idcuentabancaria: idcuentabancaria,
        },
      },
    });

    return archivocuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivoCuentaBancaria = async (tx: TxClient, archivocuentabancaria: Prisma.archivo_cuenta_bancariaCreateInput) => {
  try {
    const nuevo = await tx.archivo_cuenta_bancaria.create({ data: archivocuentabancaria });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivoCuentaBancaria = async (tx: TxClient, idarchivo: number, idcuentabancaria: number, archivocuentabancaria: Prisma.archivo_cuenta_bancariaUpdateInput) => {
  try {
    const result = await tx.archivo_cuenta_bancaria.update({
      data: archivocuentabancaria,
      where: {
        idarchivo_idcuentabancaria: {
          idarchivo: idarchivo,
          idcuentabancaria: idcuentabancaria,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivoCuentaBancaria = async (tx: TxClient, idarchivo: number, idcuentabancaria: number, idusuariomod: number) => {
  try {
    const result = await tx.archivo_cuenta_bancaria.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        idarchivo_idcuentabancaria: {
          idarchivo: idarchivo,
          idcuentabancaria: idcuentabancaria,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateArchivoCuentaBancaria = async (tx: TxClient, idarchivo: number, idcuentabancaria: number, idusuariomod: number) => {
  try {
    const result = await tx.archivo_cuenta_bancaria.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ACTIVO },
      where: {
        idarchivo_idcuentabancaria: {
          idarchivo: idarchivo,
          idcuentabancaria: idcuentabancaria,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
