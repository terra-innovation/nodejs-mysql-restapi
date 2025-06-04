import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, factoring_config_tasa_descuento } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getFactoringconfigtasadescuentos = async (tx: TxClient, estados: number[]) => {
  try {
    const factoringconfigtasadescuentos = await tx.factoring_config_tasa_descuento.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return factoringconfigtasadescuentos;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringconfigtasadescuentoByIdfactoringconfigtasadescuento = async (tx: TxClient, idfactoringconfigtasadescuento: number) => {
  try {
    const factoringconfigtasadescuento = await tx.factoring_config_tasa_descuento.findUnique({ where: { idfactoringconfigtasadescuento: idfactoringconfigtasadescuento } });

    //const factoringconfigtasadescuentos = await factoringconfigtasadescuento.getFactoringconfigtasadescuentos();

    return factoringconfigtasadescuento;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringconfigtasadescuentoByFactoringconfigtasadescuentoid = async (tx: TxClient, factoringconfigtasadescuentoid: string) => {
  try {
    const factoringconfigtasadescuento = await tx.factoring_config_tasa_descuento.findFirst({
      where: {
        factoringconfigtasadescuentoid: factoringconfigtasadescuentoid,
      },
    });

    return factoringconfigtasadescuento;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringconfigtasadescuentoPk = async (tx: TxClient, factoringconfigtasadescuentoid: string) => {
  try {
    const factoringconfigtasadescuento = await tx.factoring_config_tasa_descuento.findFirst({
      select: { idfactoringconfigtasadescuento: true },
      where: {
        factoringconfigtasadescuentoid: factoringconfigtasadescuentoid,
      },
    });

    return factoringconfigtasadescuento;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringconfigtasadescuento = async (tx: TxClient, factoringconfigtasadescuento: Prisma.factoring_config_tasa_descuentoCreateInput) => {
  try {
    const nuevo = await tx.factoring_config_tasa_descuento.create({ data: factoringconfigtasadescuento });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringconfigtasadescuento = async (tx: TxClient, factoringconfigtasadescuentoid: string, factoringconfigtasadescuento: Prisma.factoring_config_tasa_descuentoUpdateInput) => {
  try {
    const result = await tx.factoring_config_tasa_descuento.update({
      data: factoringconfigtasadescuento,
      where: {
        factoringconfigtasadescuentoid: factoringconfigtasadescuentoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringconfigtasadescuento = async (tx: TxClient, factoringconfigtasadescuentoid: string, idusuariomod: number) => {
  try {
    const result = await tx.factoring_config_tasa_descuento.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        factoringconfigtasadescuentoid: factoringconfigtasadescuentoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
