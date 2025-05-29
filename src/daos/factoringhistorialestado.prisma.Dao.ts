import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, factoring_historial_estado } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getFactoringhistorialestadosByIdfactoring = async (tx: TxClient, idfactoring: bigint, estados: number[]) => {
  try {
    const factoringhistorialestados = await tx.factoring_historial_estado.findMany({
      include: {
        archivo_factoring_historial_estados: {
          include: {
            archivo: {
              include: {
                archivo_estado: true,
                archivo_tipo: true,
              },
            },
          },
        },
        factoring: true,
        factoring_estado: true,
        usuario: true,
      },
      where: {
        idfactoring: idfactoring,
        estado: {
          in: estados,
        },
      },
    });

    return factoringhistorialestados;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringhistorialestados = async (tx: TxClient, estados: number[]) => {
  try {
    const factoringhistorialestados = await tx.factoring_historial_estado.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return factoringhistorialestados;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringhistorialestadoByIdfactoringhistorialestado = async (tx: TxClient, idfactoringhistorialestado: number) => {
  try {
    const factoringhistorialestado = await tx.factoring_historial_estado.findUnique({ where: { idfactoringhistorialestado: idfactoringhistorialestado } });

    //const factoringhistorialestados = await factoringhistorialestado.getFactoringhistorialestados();

    return factoringhistorialestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringhistorialestadoByFactoringhistorialestadoid = async (tx: TxClient, factoringhistorialestadoid: string) => {
  try {
    const factoringhistorialestado = await tx.factoring_historial_estado.findFirst({
      where: {
        factoringhistorialestadoid: factoringhistorialestadoid,
      },
    });

    return factoringhistorialestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringhistorialestadoPk = async (tx: TxClient, factoringhistorialestadoid: string) => {
  try {
    const factoringhistorialestado = await tx.factoring_historial_estado.findFirst({
      select: { idfactoringhistorialestado: true },
      where: {
        factoringhistorialestadoid: factoringhistorialestadoid,
      },
    });

    return factoringhistorialestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringhistorialestado = async (tx: TxClient, factoringhistorialestado: Prisma.factoring_historial_estadoCreateInput) => {
  try {
    const nuevo = await tx.factoring_historial_estado.create({ data: factoringhistorialestado });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringhistorialestado = async (tx: TxClient, factoringhistorialestado: Partial<factoring_historial_estado>) => {
  try {
    const result = await tx.factoring_historial_estado.update({
      data: factoringhistorialestado,
      where: {
        factoringhistorialestadoid: factoringhistorialestado.factoringhistorialestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringhistorialestado = async (tx: TxClient, factoringhistorialestado: Partial<factoring_historial_estado>) => {
  try {
    const result = await tx.factoring_historial_estado.update({
      data: factoringhistorialestado,
      where: {
        factoringhistorialestadoid: factoringhistorialestado.factoringhistorialestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateFactoringhistorialestado = async (tx: TxClient, factoringhistorialestado: Partial<factoring_historial_estado>) => {
  try {
    const result = await tx.factoring_historial_estado.update({
      data: factoringhistorialestado,
      where: {
        factoringhistorialestadoid: factoringhistorialestado.factoringhistorialestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
