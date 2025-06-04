import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, colaborador } from "#src/models/prisma/ft_factoring/client";

import { Empresa } from "#src/models/ft_factoring/Empresa.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getColaboradorByIdEmpresaAndIdpersona = async (tx: TxClient, idempresa: number, idpersona: number) => {
  try {
    const colaborador = await tx.colaborador.findFirst({
      where: {
        idempresa: idempresa,
        idpersona: idpersona,
      },
    });
    return colaborador;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getColaboradoresActivas = async (tx: TxClient) => {
  try {
    const colaboradores = await tx.colaborador.findMany({
      select: {
        colaboradorid: true,
        idpersona: true,
        idcolaboradortipo: true,
        iddocumentotipo: true,
        documentonumero: true,
        nombrecolaborador: true,
        apellidocolaborador: true,
        cargo: true,
        email: true,
        telefono: true,
        poderpartidanumero: true,
        poderpartidaciudad: true,
        empresa: {
          select: {
            empresaid: true,
            code: true,
            idpaissede: true,
            iddepartamentosede: true,
            idprovinciasede: true,
            iddistritosede: true,
            idriesgo: true,
            ruc: true,
            razon_social: true,
            nombre_comercial: true,
            fecha_inscripcion: true,
            domicilio_fiscal: true,
            direccion_sede: true,
            direccion_sede_referencia: true,
          },
        },
      },
      where: {
        estado: 1,
      },
    });

    return colaboradores;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getColaboradorByIdcolaborador = async (tx: TxClient, idcolaborador: number) => {
  try {
    const colaborador = await tx.colaborador.findUnique({ where: { idcolaborador: idcolaborador } });

    //const colaboradores = await colaborador.getColaboradors();

    return colaborador;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getColaboradorByColaboradorid = async (tx: TxClient, colaboradorid: string) => {
  try {
    const colaborador = await tx.colaborador.findFirst({
      include: { empresa: true },
      where: {
        colaboradorid: colaboradorid,
      },
    });

    return colaborador;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findColaboradorPk = async (tx: TxClient, colaboradorid: string) => {
  try {
    const colaborador = await tx.colaborador.findFirst({
      select: { idcolaborador: true },
      where: {
        colaboradorid: colaboradorid,
      },
    });

    return colaborador;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertColaborador = async (tx: TxClient, colaborador: Prisma.colaboradorCreateInput) => {
  try {
    const nuevo = await tx.colaborador.create({ data: colaborador });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateColaborador = async (tx: TxClient, colaboradorid: string, colaborador: Prisma.colaboradorUpdateInput) => {
  try {
    const result = await tx.colaborador.update({
      data: colaborador,
      where: {
        colaboradorid: colaboradorid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteColaborador = async (tx: TxClient, colaboradorid: string, idusuariomod: number) => {
  try {
    const result = await tx.colaborador.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        colaboradorid: colaboradorid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
