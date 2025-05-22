import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, archivo_cuenta_bancaria } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getArchivocuentabancarias = async (tx: TxClient, estados: number[]): Promise<archivo_cuenta_bancaria[]> => {
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

export const getArchivoCuentaBancariaByIdarchivoIdcuentabancaria = async (tx: TxClient, idarchivo: number, idcuentabancaria: number): Promise<archivo_cuenta_bancaria> => {
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

export const insertArchivoCuentaBancaria = async (tx: TxClient, archivocuentabancaria: Prisma.archivo_cuenta_bancariaCreateInput): Promise<archivo_cuenta_bancaria> => {
  try {
    const nuevo = await tx.archivo_cuenta_bancaria.create({ data: archivocuentabancaria });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivoCuentaBancaria = async (tx: TxClient, archivocuentabancaria: Partial<archivo_cuenta_bancaria>): Promise<archivo_cuenta_bancaria> => {
  try {
    const result = await tx.archivo_cuenta_bancaria.update({
      data: archivocuentabancaria,
      where: {
        idarchivo_idcuentabancaria: {
          idarchivo: archivocuentabancaria.idarchivo,
          idcuentabancaria: archivocuentabancaria.idcuentabancaria,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivoCuentaBancaria = async (tx: TxClient, archivocuentabancaria: Partial<archivo_cuenta_bancaria>): Promise<archivo_cuenta_bancaria> => {
  try {
    const result = await tx.archivo_cuenta_bancaria.update({
      data: archivocuentabancaria,
      where: {
        idarchivo_idcuentabancaria: {
          idarchivo: archivocuentabancaria.idarchivo,
          idcuentabancaria: archivocuentabancaria.idcuentabancaria,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateArchivoCuentaBancaria = async (tx: TxClient, archivocuentabancaria: Partial<archivo_cuenta_bancaria>): Promise<archivo_cuenta_bancaria> => {
  try {
    const result = await tx.archivo_cuenta_bancaria.update({
      data: archivocuentabancaria,
      where: {
        idarchivo_idcuentabancaria: {
          idarchivo: archivocuentabancaria.idarchivo,
          idcuentabancaria: archivocuentabancaria.idcuentabancaria,
        },
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
