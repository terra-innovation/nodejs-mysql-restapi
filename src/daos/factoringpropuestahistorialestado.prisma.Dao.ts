import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, factoring_propuesta_historial_estado } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getFactoringpropuestahistorialestadosByIdfactoringpropuesta = async (tx: TxClient, idfactoringpropuesta: number, estados: number[]) => {
  try {
    const factoringpropuestahistorialestados = await tx.factoring_propuesta_historial_estado.findMany({
      include: {
        factoring_propuesta: true,
        factoring_propuesta_estado: true,
        usuario_modifica: true,
      },
      where: {
        idfactoringpropuesta: idfactoringpropuesta,
        estado: {
          in: estados,
        },
      },
    });

    return factoringpropuestahistorialestados;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringpropuestahistorialestados = async (tx: TxClient, estados: number[]) => {
  try {
    const factoringpropuestahistorialestados = await tx.factoring_propuesta_historial_estado.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return factoringpropuestahistorialestados;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringpropuestahistorialestadoByIdfactoringpropuestahistorialestado = async (tx: TxClient, idfactoringpropuestahistorialestado: number) => {
  try {
    const factoringpropuestahistorialestado = await tx.factoring_propuesta_historial_estado.findUnique({ where: { idfactoringpropuestahistorialestado: idfactoringpropuestahistorialestado } });

    //const factoringpropuestahistorialestados = await factoringpropuestahistorialestado.getFactoringpropuestahistorialestados();

    return factoringpropuestahistorialestado;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getFactoringpropuestahistorialestadoByFactoringpropuestahistorialestadoid = async (tx: TxClient, factoringpropuestahistorialestadoid: string) => {
  try {
    const factoringpropuestahistorialestado = await tx.factoring_propuesta_historial_estado.findFirst({
      where: {
        factoringpropuestahistorialestadoid: factoringpropuestahistorialestadoid,
      },
    });

    return factoringpropuestahistorialestado;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findFactoringpropuestahistorialestadoPk = async (tx: TxClient, factoringpropuestahistorialestadoid: string) => {
  try {
    const factoringpropuestahistorialestado = await tx.factoring_propuesta_historial_estado.findFirst({
      select: { idfactoringpropuestahistorialestado: true },
      where: {
        factoringpropuestahistorialestadoid: factoringpropuestahistorialestadoid,
      },
    });

    return factoringpropuestahistorialestado;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertFactoringpropuestahistorialestado = async (tx: TxClient, factoringpropuestahistorialestado: Prisma.factoring_propuesta_historial_estadoCreateInput) => {
  try {
    const nuevo = await tx.factoring_propuesta_historial_estado.create({ data: factoringpropuestahistorialestado });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateFactoringpropuestahistorialestado = async (tx: TxClient, factoringpropuestahistorialestadoid: string, factoringpropuestahistorialestado: Prisma.factoring_propuesta_historial_estadoUpdateInput) => {
  try {
    const result = await tx.factoring_propuesta_historial_estado.update({
      data: factoringpropuestahistorialestado,
      where: {
        factoringpropuestahistorialestadoid: factoringpropuestahistorialestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteFactoringpropuestahistorialestado = async (tx: TxClient, factoringpropuestahistorialestadoid: string, idusuariomod: number) => {
  try {
    const result = await tx.factoring_propuesta_historial_estado.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        factoringpropuestahistorialestadoid: factoringpropuestahistorialestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateFactoringpropuestahistorialestado = async (tx: TxClient, factoringpropuestahistorialestadoid: string, idusuariomod: number) => {
  try {
    const result = await tx.factoring_propuesta_historial_estado.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ACTIVO },
      where: {
        factoringpropuestahistorialestadoid: factoringpropuestahistorialestadoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
