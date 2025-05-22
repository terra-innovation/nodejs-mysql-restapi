import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, documento_tipo } from "#src/models/prisma/ft_factoring/client";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getDocumentotipos = async (tx: TxClient, estados: number[]): Promise<documento_tipo[]> => {
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDocumentotipoByIddocumentotipo = async (tx: TxClient, iddocumentotipo: number): Promise<documento_tipo> => {
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getDocumentotipoByDocumentotipoid = async (tx: TxClient, documentotipoid: string): Promise<documento_tipo> => {
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
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findDocumentotipoPk = async (tx: TxClient, documentotipoid: string): Promise<{ iddocumentotipo: number }> => {
  try {
    const documentotipo = await tx.documento_tipo.findFirst({
      select: { iddocumentotipo: true },
      where: {
        documentotipoid: documentotipoid,
      },
    });

    return documentotipo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertDocumentotipo = async (tx: TxClient, documentotipo: Prisma.documento_tipoCreateInput): Promise<documento_tipo> => {
  try {
    const nuevo = await tx.documento_tipo.create({ data: documentotipo });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateDocumentotipo = async (tx: TxClient, documentotipo: Partial<documento_tipo>): Promise<documento_tipo> => {
  try {
    const result = await tx.documento_tipo.update({
      data: documentotipo,
      where: {
        documentotipoid: documentotipo.documentotipoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteDocumentotipo = async (tx: TxClient, documentotipo: Partial<documento_tipo>): Promise<documento_tipo> => {
  try {
    const result = await tx.documento_tipo.update({
      data: documentotipo,
      where: {
        documentotipoid: documentotipo.documentotipoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateDocumentotipo = async (tx: TxClient, documentotipo: Partial<documento_tipo>): Promise<documento_tipo> => {
  try {
    const result = await tx.documento_tipo.update({
      data: documentotipo,
      where: {
        documentotipoid: documentotipo.documentotipoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
