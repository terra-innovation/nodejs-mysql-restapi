import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, persona_verificacion_estado } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getPersonaverificacionestados = async (tx: TxClient, estados: number[]) => {
  try {
    const personaverificacionestados = await tx.persona_verificacion_estado.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return personaverificacionestados;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaverificacionestadoByIdpersonaverificacionestado = async (tx: TxClient, idpersonaverificacionestado: number) => {
  try {
    const personaverificacionestado = await tx.persona_verificacion_estado.findUnique({ where: { idpersonaverificacionestado: idpersonaverificacionestado } });

    //const personaverificacionestados = await personaverificacionestado.getPersonaverificacionestados();

    return personaverificacionestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaverificacionestadoByPersonaverificacionestadoid = async (tx: TxClient, personaverificacionestadoid: string) => {
  try {
    const personaverificacionestado = await tx.persona_verificacion_estado.findFirst({
      where: {
        personaverificacionestadoid: personaverificacionestadoid,
      },
    });

    return personaverificacionestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPersonaverificacionestadoPk = async (tx: TxClient, personaverificacionestadoid: string) => {
  try {
    const personaverificacionestado = await tx.persona_verificacion_estado.findFirst({
      select: { idpersonaverificacionestado: true },
      where: {
        personaverificacionestadoid: personaverificacionestadoid,
      },
    });

    return personaverificacionestado;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPersonaverificacionestado = async (tx: TxClient, personaverificacionestado: Prisma.persona_verificacion_estadoCreateInput) => {
  try {
    const nuevo = await tx.persona_verificacion_estado.create({ data: personaverificacionestado });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePersonaverificacionestado = async (tx: TxClient, personaverificacionestadoid: string, personaverificacionestado: Prisma.persona_verificacion_estadoUpdateInput) => {
  try {
    const result = await tx.persona_verificacion_estado.update({
      data: personaverificacionestado,
      where: {
        personaverificacionestadoid: personaverificacionestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePersonaverificacionestado = async (tx: TxClient, personaverificacionestadoid: string, personaverificacionestado: Prisma.persona_verificacion_estadoUpdateInput) => {
  try {
    const result = await tx.persona_verificacion_estado.update({
      data: personaverificacionestado,
      where: {
        personaverificacionestadoid: personaverificacionestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
