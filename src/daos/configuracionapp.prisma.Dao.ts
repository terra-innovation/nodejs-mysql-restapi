import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, configuracion_app } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getIGV = async (tx: TxClient) => {
  return await getConfiguracionappByIdconfiguracionapp(tx, 1);
};

export const getCostoCAVALI = async (tx: TxClient) => {
  return await getConfiguracionappByIdconfiguracionapp(tx, 2);
};

export const getComisionBCP = async (tx: TxClient) => {
  return await getConfiguracionappByIdconfiguracionapp(tx, 3);
};

export const getConfiguracionapps = async (tx: TxClient, estados: number[]): Promise<configuracion_app[]> => {
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getConfiguracionappByIdconfiguracionapp = async (tx: TxClient, idconfiguracionapp: number): Promise<configuracion_app> => {
  try {
    const configuracionapp = await tx.configuracion_app.findUnique({
      where: { idconfiguracionapp: idconfiguracionapp },
    });

    return configuracionapp;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getConfiguracionappByConfiguracionappid = async (tx: TxClient, configuracionappid: string): Promise<configuracion_app> => {
  try {
    const configuracionapp = await tx.configuracion_app.findFirst({
      where: {
        configuracionappid: configuracionappid,
      },
    });

    return configuracionapp;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findConfiguracionappPk = async (tx: TxClient, configuracionappid: string): Promise<{ idconfiguracionapp: number }> => {
  try {
    const configuracionapp = await tx.configuracion_app.findFirst({
      select: { idconfiguracionapp: true },
      where: {
        configuracionappid: configuracionappid,
      },
    });

    return configuracionapp;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertConfiguracionapp = async (tx: TxClient, configuracionapp: Prisma.configuracion_appCreateInput): Promise<configuracion_app> => {
  try {
    const nuevo = await tx.configuracion_app.create({ data: configuracionapp });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateConfiguracionapp = async (tx: TxClient, configuracionapp: Partial<configuracion_app>): Promise<configuracion_app> => {
  try {
    const result = await tx.configuracion_app.update({
      data: configuracionapp,
      where: {
        configuracionappid: configuracionapp.configuracionappid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteConfiguracionapp = async (tx: TxClient, configuracionapp: Partial<configuracion_app>): Promise<configuracion_app> => {
  try {
    const result = await tx.configuracion_app.update({
      data: configuracionapp,
      where: {
        configuracionappid: configuracionapp.configuracionappid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
