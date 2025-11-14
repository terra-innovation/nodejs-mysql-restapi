import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, configuracion_app } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getIGV = async (tx: TxClient) => {
  return await getConfiguracionappByIdconfiguracionapp(tx, 1);
};

export const getCostoCAVALI = async (tx: TxClient) => {
  return await getConfiguracionappByIdconfiguracionapp(tx, 2);
};

export const getComisionBCP = async (tx: TxClient) => {
  return await getConfiguracionappByIdconfiguracionapp(tx, 3);
};

export const getEmailsCCDeudorSolicitaConfirmacion = async (tx: TxClient) => {
  return await getConfiguracionappByIdconfiguracionapp(tx, 4);
};

export const getConfiguracionapps = async (tx: TxClient, estados: number[]) => {
  try {
    const configuracionapps = await tx.configuracion_app.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return configuracionapps;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getConfiguracionappByIdconfiguracionapp = async (tx: TxClient, idconfiguracionapp: number) => {
  try {
    const configuracionapp = await tx.configuracion_app.findUnique({
      where: { idconfiguracionapp: idconfiguracionapp },
    });

    return configuracionapp;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getConfiguracionappByConfiguracionappid = async (tx: TxClient, configuracionappid: string) => {
  try {
    const configuracionapp = await tx.configuracion_app.findFirst({
      where: {
        configuracionappid: configuracionappid,
      },
    });

    return configuracionapp;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findConfiguracionappPk = async (tx: TxClient, configuracionappid: string) => {
  try {
    const configuracionapp = await tx.configuracion_app.findFirst({
      select: { idconfiguracionapp: true },
      where: {
        configuracionappid: configuracionappid,
      },
    });

    return configuracionapp;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertConfiguracionapp = async (tx: TxClient, configuracionapp: Prisma.configuracion_appCreateInput) => {
  try {
    const nuevo = await tx.configuracion_app.create({ data: configuracionapp });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateConfiguracionapp = async (tx: TxClient, configuracionappid: string, configuracionapp: Prisma.configuracion_appUpdateInput) => {
  try {
    const result = await tx.configuracion_app.update({
      data: configuracionapp,
      where: {
        configuracionappid: configuracionappid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteConfiguracionapp = async (tx: TxClient, configuracionappid: string, idusuariomod: number) => {
  try {
    const result = await tx.configuracion_app.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        configuracionappid: configuracionappid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
