import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, inversionista } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getInversionistaByIdusuario = async (tx: TxClient, idusuario, estados: number[]) => {
  try {
    const inversionista = await tx.inversionista.findFirst({
      include: [
        {
          model: modelsFT.Persona,
          as: "persona_persona",
          where: {
            idusuario,
          },
        },
      ],
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return inversionista;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getInversionistas = async (tx: TxClient, estados: number[]): Promise<inversionista[]> => {
  try {
    const inversionistas = await tx.inversionista.findMany({
      include: [
        {
          model: modelsFT.Persona,
          as: "persona_persona",
        },
      ],
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return inversionistas;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getInversionistaByIdinversionista = async (tx: TxClient, idinversionista: number): Promise<inversionista> => {
  try {
    const inversionista = await tx.inversionista.findUnique({ where: { idinversionista: idinversionista } });

    return inversionista;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getInversionistaByInversionistaid = async (tx: TxClient, inversionistaid: string): Promise<inversionista> => {
  try {
    const inversionista = await tx.inversionista.findFirst({
      where: {
        inversionistaid: inversionistaid,
      },
    });

    return inversionista;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findInversionistaPk = async (tx: TxClient, inversionistaid: string): Promise<{ idinversionista: number }> => {
  try {
    const inversionista = await tx.inversionista.findFirst({
      select: { idinversionista: true },
      where: {
        inversionistaid: inversionistaid,
      },
    });

    return inversionista;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertInversionista = async (tx: TxClient, inversionista: Prisma.inversionistaCreateInput): Promise<inversionista> => {
  try {
    const nuevo = await tx.inversionista.create({ data: inversionista });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateInversionista = async (tx: TxClient, inversionista: Partial<inversionista>): Promise<inversionista> => {
  try {
    const result = await tx.inversionista.update({
      data: inversionista,
      where: {
        inversionistaid: inversionista.inversionistaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteInversionista = async (tx: TxClient, inversionista: Partial<inversionista>): Promise<inversionista> => {
  try {
    const result = await tx.inversionista.update({
      data: inversionista,
      where: {
        inversionistaid: inversionista.inversionistaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateInversionista = async (tx: TxClient, inversionista: Partial<inversionista>): Promise<inversionista> => {
  try {
    const result = await tx.inversionista.update({
      data: inversionista,
      where: {
        inversionistaid: inversionista.inversionistaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
