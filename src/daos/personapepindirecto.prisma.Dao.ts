import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, persona_pep_indirecto } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getPersonapepindirectos = async (tx: TxClient, estados: number[]) => {
  try {
    const personapepindirectos = await tx.persona_pep_indirecto.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return personapepindirectos;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaPepIndirectoByIdpersonapepindirecto = async (tx: TxClient, idpersonapepindirecto: number) => {
  try {
    const personapepindirecto = await tx.persona_pep_indirecto.findUnique({ where: { idpersonapepindirecto: idpersonapepindirecto } });

    //const personapepindirectos = await personapepindirecto.getPersonapepindirectos();

    return personapepindirecto;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaPepIndirectoByPersonaPepIndirectoid = async (tx: TxClient, personapepindirectoid: string) => {
  try {
    const personapepindirecto = await tx.persona_pep_indirecto.findFirst({
      where: {
        personapepindirectoid: personapepindirectoid,
      },
    });

    return personapepindirecto;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPersonaPepIndirectoPk = async (tx: TxClient, personapepindirectoid: string) => {
  try {
    const personapepindirecto = await tx.persona_pep_indirecto.findFirst({
      select: { idpersonapepindirecto: true },
      where: {
        personapepindirectoid: personapepindirectoid,
      },
    });

    return personapepindirecto;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPersonaPepIndirecto = async (tx: TxClient, personapepindirecto: Prisma.persona_pep_indirectoCreateInput) => {
  try {
    const nuevo = await tx.persona_pep_indirecto.create({ data: personapepindirecto });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePersonaPepIndirecto = async (tx: TxClient, personapepindirectoid: string, personapepindirecto: Prisma.persona_pep_indirectoUpdateInput) => {
  try {
    const result = await tx.persona_pep_indirecto.update({
      data: personapepindirecto,
      where: {
        personapepindirectoid: personapepindirectoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePersonaPepIndirecto = async (tx: TxClient, personapepindirectoid: string, idusuariomod: number) => {
  try {
    const result = await tx.persona_pep_indirecto.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        personapepindirectoid: personapepindirectoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
