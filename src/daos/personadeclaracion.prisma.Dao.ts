import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, persona_declaracion } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getPersonadeclaracions = async (tx: TxClient, estados: number[]) => {
  try {
    const personadeclaracions = await tx.persona_declaracion.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return personadeclaracions;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonadeclaracionByIdpersonadeclaracion = async (tx: TxClient, idpersonadeclaracion: number) => {
  try {
    const personadeclaracion = await tx.persona_declaracion.findUnique({ where: { idpersonadeclaracion: idpersonadeclaracion } });

    //const personadeclaracions = await personadeclaracion.getPersonadeclaracions();

    return personadeclaracion;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonadeclaracionByPersonadeclaracionid = async (tx: TxClient, personadeclaracionid: string) => {
  try {
    const personadeclaracion = await tx.persona_declaracion.findFirst({
      where: {
        personadeclaracionid: personadeclaracionid,
      },
    });

    return personadeclaracion;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPersonadeclaracionPk = async (tx: TxClient, personadeclaracionid: string) => {
  try {
    const personadeclaracion = await tx.persona_declaracion.findFirst({
      select: { idpersonadeclaracion: true },
      where: {
        personadeclaracionid: personadeclaracionid,
      },
    });

    return personadeclaracion;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPersonadeclaracion = async (tx: TxClient, personadeclaracion: Prisma.persona_declaracionCreateInput) => {
  try {
    const nuevo = await tx.persona_declaracion.create({ data: personadeclaracion });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePersonadeclaracion = async (tx: TxClient, personadeclaracionid: string, personadeclaracion: Prisma.persona_declaracionUpdateInput) => {
  try {
    const result = await tx.persona_declaracion.update({
      data: personadeclaracion,
      where: {
        personadeclaracionid: personadeclaracionid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePersonadeclaracion = async (tx: TxClient, personadeclaracionid: string, idusuariomod: number) => {
  try {
    const result = await tx.persona_declaracion.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        personadeclaracionid: personadeclaracionid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
