import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getMAIL_CONTACTO_FINANZATECH = async (tx: TxClient) => {
  return await getConfiguracioncorreoByIdconfiguracioncorreo(tx, 1);
};

export const getConfiguracioncorreos = async (tx: TxClient, estados: number[]) => {
  try {
    const configuracioncorreos = await tx.configuracion_correo.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return configuracioncorreos;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getConfiguracioncorreoByIdconfiguracioncorreo = async (tx: TxClient, idconfiguracioncorreo: number) => {
  try {
    const configuracioncorreo = await tx.configuracion_correo.findUnique({
      where: { idconfiguracioncorreo: idconfiguracioncorreo },
    });

    return configuracioncorreo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getConfiguracioncorreoByConfiguracioncorreoid = async (tx: TxClient, configuracioncorreoid: string) => {
  try {
    const configuracioncorreo = await tx.configuracion_correo.findFirst({
      where: {
        configuracioncorreoid: configuracioncorreoid,
      },
    });

    return configuracioncorreo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findConfiguracioncorreoPk = async (tx: TxClient, configuracioncorreoid: string) => {
  try {
    const configuracioncorreo = await tx.configuracion_correo.findFirst({
      select: { idconfiguracioncorreo: true },
      where: {
        configuracioncorreoid: configuracioncorreoid,
      },
    });

    return configuracioncorreo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertConfiguracioncorreo = async (tx: TxClient, configuracioncorreo: Prisma.configuracion_correoCreateInput) => {
  try {
    const nuevo = await tx.configuracion_correo.create({ data: configuracioncorreo });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateConfiguracioncorreo = async (tx: TxClient, configuracioncorreoid: string, configuracioncorreo: Prisma.configuracion_correoUpdateInput) => {
  try {
    const result = await tx.configuracion_correo.update({
      data: configuracioncorreo,
      where: {
        configuracioncorreoid: configuracioncorreoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteConfiguracioncorreo = async (tx: TxClient, configuracioncorreoid: string, idusuariomod: number) => {
  try {
    const result = await tx.configuracion_correo.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        configuracioncorreoid: configuracioncorreoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateConfiguracioncorreo = async (tx: TxClient, configuracioncorreoid: string, idusuariomod: number) => {
  try {
    const result = await tx.configuracion_correo.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ACTIVO },
      where: {
        configuracioncorreoid: configuracioncorreoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
