import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, persona_pep_directo } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getPersonapepdirectos = async (tx: TxClient, estados: number[]) => {
  try {
    const personapepdirectos = await tx.persona_pep_directo.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return personapepdirectos;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaPepDirectoByIdpersonapepdirecto = async (tx: TxClient, idpersonapepdirecto: number) => {
  try {
    const personapepdirecto = await tx.persona_pep_directo.findUnique({ where: { idpersonapepdirecto: idpersonapepdirecto } });

    //const personapepdirectos = await personapepdirecto.getPersonapepdirectos();

    return personapepdirecto;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaPepDirectoByPersonaPepDirectoid = async (tx: TxClient, personapepdirectoid: string) => {
  try {
    const personapepdirecto = await tx.persona_pep_directo.findFirst({
      where: {
        personapepdirectoid: personapepdirectoid,
      },
    });

    return personapepdirecto;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPersonaPepDirectoPk = async (tx: TxClient, personapepdirectoid: string) => {
  try {
    const personapepdirecto = await tx.persona_pep_directo.findFirst({
      select: { idpersonapepdirecto: true },
      where: {
        personapepdirectoid: personapepdirectoid,
      },
    });

    return personapepdirecto;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPersonaPepDirecto = async (tx: TxClient, personapepdirecto: Prisma.persona_pep_directoCreateInput) => {
  try {
    const nuevo = await tx.persona_pep_directo.create({ data: personapepdirecto });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePersonaPepDirecto = async (tx: TxClient, personapepdirectoid: string, personapepdirecto: Prisma.persona_pep_directoUpdateInput) => {
  try {
    const result = await tx.persona_pep_directo.update({
      data: personapepdirecto,
      where: {
        personapepdirectoid: personapepdirectoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePersonaPepDirecto = async (tx: TxClient, personapepdirectoid: string, personapepdirecto: Prisma.persona_pep_directoUpdateInput) => {
  try {
    const result = await tx.persona_pep_directo.update({
      data: personapepdirecto,
      where: {
        personapepdirectoid: personapepdirectoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
