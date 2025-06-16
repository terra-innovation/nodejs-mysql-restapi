import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, documento_tipo } from "#root/generated/prisma/ft_factoring/client.js";
import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getDocumentotipos = async (tx: TxClient, estados: number[]) => {
  try {
    const documentotipos = await tx.documento_tipo.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return documentotipos;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDocumentotipoByIddocumentotipo = async (tx: TxClient, iddocumentotipo: number) => {
  try {
    const documentotipo = await tx.documento_tipo.findUnique({
      include: {
        colaboradores: true,
      },
      where: {
        iddocumentotipo: iddocumentotipo,
      },
    });

    //const colaboradores = await documentotipo.getColaboradors();

    return documentotipo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDocumentotipoByDocumentotipoid = async (tx: TxClient, documentotipoid: string) => {
  try {
    const documentotipo = await tx.documento_tipo.findFirst({
      include: {
        colaboradores: true,
      },
      where: {
        documentotipoid: documentotipoid,
      },
    });

    return documentotipo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findDocumentotipoPk = async (tx: TxClient, documentotipoid: string) => {
  try {
    const documentotipo = await tx.documento_tipo.findFirst({
      select: { iddocumentotipo: true },
      where: {
        documentotipoid: documentotipoid,
      },
    });

    return documentotipo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertDocumentotipo = async (tx: TxClient, documentotipo: Prisma.documento_tipoCreateInput) => {
  try {
    const nuevo = await tx.documento_tipo.create({ data: documentotipo });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateDocumentotipo = async (tx: TxClient, documentotipoid: string, documentotipo: Prisma.documento_tipoUpdateInput) => {
  try {
    const result = await tx.documento_tipo.update({
      data: documentotipo,
      where: {
        documentotipoid: documentotipoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteDocumentotipo = async (tx: TxClient, documentotipoid: string, idusuariomod: number) => {
  try {
    const result = await tx.documento_tipo.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        documentotipoid: documentotipoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateDocumentotipo = async (tx: TxClient, documentotipoid: string, idusuariomod: number) => {
  try {
    const result = await tx.documento_tipo.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ACTIVO },
      where: {
        documentotipoid: documentotipoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
