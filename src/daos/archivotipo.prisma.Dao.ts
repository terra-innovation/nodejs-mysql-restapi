import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
 
export const ARCHIVO_TIPO = {
  DNI_ANVERSO_FRONTAL: 1,
  DNI_REVERSO_DETRAS: 2,
  FOTO_JUNTO_A_DNI: 3,
  FICHA_RUC: 4,
  REPORTE_TRIBUTARIO_PARA_TERCEROS: 5,
  VIGENCIA_DE_PODER_REPRESENTANTE_LEGAL: 6,
  ENCABEZADO_DEL_EECC_DE_LA_CUENTA_BANCARIA: 7,
  FACTURA_XML: 8,
  FACTURA_PDF: 9,
  SIN_TIPO: 10,
  CONSTANCIA_DE_TRANSFERENCIA: 11,
} as const;




export const getArchivotipos = async (tx: TxClient, estados: number[]) => {
  try {
    const archivotipos = await tx.archivo_tipo.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return archivotipos;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivotipoByIdarchivotipo = async (tx: TxClient, idarchivotipo: number) => {
  try {
    const archivotipo = await tx.archivo_tipo.findUnique({ where: { idarchivotipo: idarchivotipo } });

    return archivotipo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivotipoByCode = async (tx: TxClient, code) => {
  try {
    const archivotipo = await tx.archivo_tipo.findFirst({
      where: {
        code: code,
      },
    });

    return archivotipo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getArchivotipoByArchivotipoid = async (tx: TxClient, archivotipoid: string) => {
  try {
    const archivotipo = await tx.archivo_tipo.findFirst({
      where: {
        archivotipoid: archivotipoid,
      },
    });

    return archivotipo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findArchivotipoPk = async (tx: TxClient, archivotipoid: string) => {
  try {
    const archivotipo = await tx.archivo_tipo.findFirst({
      select: { idarchivotipo: true },
      where: {
        archivotipoid: archivotipoid,
      },
    });

    return archivotipo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertArchivotipo = async (tx: TxClient, archivotipo: Prisma.archivo_tipoCreateInput) => {
  try {
    const nuevo = await tx.archivo_tipo.create({ data: archivotipo });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateArchivotipo = async (tx: TxClient, archivotipoid: string, archivotipo: Prisma.archivo_tipoUpdateInput) => {
  try {
    const result = await tx.archivo_tipo.update({
      data: archivotipo,
      where: {
        archivotipoid: archivotipoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteArchivotipo = async (tx: TxClient, archivotipoid: string, idusuariomod: number) => {
  try {
    const result = await tx.archivo_tipo.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        archivotipoid: archivotipoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
