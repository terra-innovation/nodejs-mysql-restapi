import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, provincia } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getProvincias = async (tx: TxClient, estados: number[]) => {
  try {
    const provincias = await tx.provincia.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return provincias;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getProvinciaByIdprovincia = async (tx: TxClient, idprovincia: number) => {
  try {
    const provincia = await tx.provincia.findUnique({ where: { idprovincia: idprovincia } });

    return provincia;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getProvinciaByProvinciaid = async (tx: TxClient, provinciaid: string) => {
  try {
    const provincia = await tx.provincia.findFirst({
      where: {
        provinciaid: provinciaid,
      },
    });

    return provincia;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findProvinciaPk = async (tx: TxClient, provinciaid: string) => {
  try {
    const provincia = await tx.provincia.findFirst({
      select: { idprovincia: true },
      where: {
        provinciaid: provinciaid,
      },
    });

    return provincia;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertProvincia = async (tx: TxClient, provincia: Prisma.provinciaCreateInput) => {
  try {
    const nuevo = await tx.provincia.create({ data: provincia });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateProvincia = async (tx: TxClient, provinciaid: string, provincia: Prisma.provinciaUpdateInput) => {
  try {
    const result = await tx.provincia.update({
      data: provincia,
      where: {
        provinciaid: provinciaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteProvincia = async (tx: TxClient, provinciaid: string, idusuariomod: number) => {
  try {
    const result = await tx.provincia.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        provinciaid: provinciaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
