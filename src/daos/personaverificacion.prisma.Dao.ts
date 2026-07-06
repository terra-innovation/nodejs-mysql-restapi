import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { TxClient } from "#src/types/Prisma.types.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { ESTADO } from "#src/constants/prisma.Constant.js";
import { line, log } from "#src/utils/logger.pino.js";

export const getPersonaverificacionsByIdpersona = async (tx: TxClient, idpersona: number, estados: number[]) => {
  try {
    const personaverificacions = await tx.persona_verificacion.findMany({
      include: {
        persona_verificacion_estado: true,
        usuario_verifica: true,
        archivo_persona_verificaciones: {
          include: {
            archivo: {
              include: {
                archivo_estado: true,
                archivo_tipo: true,
              },
            },
          },
        },
      },
      where: {
        idpersona: idpersona,
        estado: {
          in: estados,
        },
      },
    });

    return personaverificacions;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaverificacions = async (tx: TxClient, estados: number[]) => {
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
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaverificacionByIdpersonaverificacion = async (tx: TxClient, idpersonaverificacion: number) => {
  try {
    const personaverificacion = await tx.persona_verificacion.findUnique({ where: { idpersonaverificacion: idpersonaverificacion } });

    //const personaverificacions = await personaverificacion.getPersonaverificacions();

    return personaverificacion;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaverificacionByPersonaverificacionid = async (tx: TxClient, personaverificacionid: string) => {
  try {
    const personaverificacion = await tx.persona_verificacion.findFirst({
      where: {
        personaverificacionid: personaverificacionid,
      },
    });

    return personaverificacion;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPersonaverificacionPk = async (tx: TxClient, personaverificacionid: string) => {
  try {
    const personaverificacion = await tx.persona_verificacion.findFirst({
      select: { idpersonaverificacion: true },
      where: {
        personaverificacionid: personaverificacionid,
      },
    });

    return personaverificacion;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPersonaverificacion = async (tx: TxClient, personaverificacion: Prisma.persona_verificacionCreateInput) => {
  try {
    const nuevo = await tx.persona_verificacion.create({ data: personaverificacion });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePersonaverificacion = async (tx: TxClient, personaverificacionid: string, personaverificacion: Prisma.persona_verificacionUpdateInput) => {
  try {
    const result = await tx.persona_verificacion.update({
      data: personaverificacion,
      where: {
        personaverificacionid: personaverificacionid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePersonaverificacion = async (tx: TxClient, personaverificacionid: string, idusuariomod: number) => {
  try {
    const result = await tx.persona_verificacion.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        personaverificacionid: personaverificacionid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activatePersonaverificacion = async (tx: TxClient, personaverificacionid: string, idusuariomod: number) => {
  try {
    const result = await tx.persona_verificacion.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ACTIVO },
      where: {
        personaverificacionid: personaverificacionid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
