import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, contacto } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getContactosByIdempresaAndEmail = async (tx: TxClient, idempresa, email, estados: number[]) => {
  try {
    const contactos = await tx.contacto.findMany({
      include: { empresa: true },
      where: {
        idempresa: idempresa,
        email: email,
        estado: {
          in: estados,
        },
        empresa: {
          estado: {
            in: estados,
          },
        },
      },
    });

    return contactos;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getContactosByIdempresas = async (tx: TxClient, idempresas: number[], estados: number[]) => {
  try {
    const contactos = await tx.contacto.findMany({
      include: {
        empresa: true,
      },
      where: {
        idempresa: {
          in: idempresas,
        },
        estado: {
          in: estados,
        },
        empresa: {
          estado: {
            in: estados,
          },
        },
      },
    });

    return contactos;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getContactos = async (tx: TxClient, estados: number[]) => {
  try {
    const contactos = await tx.contacto.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return contactos;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getContactoByIdcontacto = async (tx: TxClient, idcontacto: number) => {
  try {
    const contacto = await tx.contacto.findUnique({ where: { idcontacto: idcontacto } });

    return contacto;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getContactoByContactoid = async (tx: TxClient, contactoid: string) => {
  try {
    const contacto = await tx.contacto.findFirst({
      where: {
        contactoid: contactoid,
      },
    });

    return contacto;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findContactoPk = async (tx: TxClient, contactoid: string) => {
  try {
    const contacto = await tx.contacto.findFirst({
      select: { idcontacto: true },
      where: {
        contactoid: contactoid,
      },
    });

    return contacto;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertContacto = async (tx: TxClient, contacto: Prisma.contactoCreateInput) => {
  try {
    const nuevo = await tx.contacto.create({ data: contacto });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateContacto = async (tx: TxClient, contactoid: string, contacto: Prisma.contactoUpdateInput) => {
  try {
    const result = await tx.contacto.update({
      data: contacto,
      where: {
        contactoid: contactoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteContacto = async (tx: TxClient, contactoid: string, idusuariomod: number) => {
  try {
    const result = await tx.contacto.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        contactoid: contactoid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
