import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, persona_verificacion } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getPersonaverificacions = async (tx: TxClient, estados: number[]): Promise<persona_verificacion[]> => {
  try {
    const personaverificacions = await tx.persona_verificacion.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return personaverificacions;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaverificacionByIdpersonaverificacion = async (tx: TxClient, idpersonaverificacion: number): Promise<persona_verificacion> => {
  try {
    const personaverificacion = await tx.persona_verificacion.findUnique({ where: { idpersonaverificacion: idpersonaverificacion } });

    //const personaverificacions = await personaverificacion.getPersonaverificacions();

    return personaverificacion;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaverificacionByPersonaverificacionid = async (tx: TxClient, personaverificacionid: string): Promise<persona_verificacion> => {
  try {
    const personaverificacion = await tx.persona_verificacion.findFirst({
      where: {
        personaverificacionid: personaverificacionid,
      },
    });

    return personaverificacion;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPersonaverificacionPk = async (tx: TxClient, personaverificacionid: string): Promise<{ idpersonaverificacion: bigint }> => {
  try {
    const personaverificacion = await tx.persona_verificacion.findFirst({
      select: { idpersonaverificacion: true },
      where: {
        personaverificacionid: personaverificacionid,
      },
    });

    return personaverificacion;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPersonaverificacion = async (tx: TxClient, personaverificacion: Prisma.persona_verificacionCreateInput): Promise<persona_verificacion> => {
  try {
    const nuevo = await tx.persona_verificacion.create({ data: personaverificacion });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePersonaverificacion = async (tx: TxClient, personaverificacion: Partial<persona_verificacion>): Promise<persona_verificacion> => {
  try {
    const result = await tx.persona_verificacion.update({
      data: personaverificacion,
      where: {
        personaverificacionid: personaverificacion.personaverificacionid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePersonaverificacion = async (tx: TxClient, personaverificacion: Partial<persona_verificacion>): Promise<persona_verificacion> => {
  try {
    const result = await tx.persona_verificacion.update({
      data: personaverificacion,
      where: {
        personaverificacionid: personaverificacion.personaverificacionid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activatePersonaverificacion = async (tx: TxClient, personaverificacion: Partial<persona_verificacion>): Promise<persona_verificacion> => {
  try {
    const result = await tx.persona_verificacion.update({
      data: personaverificacion,
      where: {
        personaverificacionid: personaverificacion.personaverificacionid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
