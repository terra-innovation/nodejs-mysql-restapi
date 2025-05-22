import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, inversionista_cuenta_bancaria } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getInversionistacuentabancariaByIdinversionistaAndIdusuario = async (tx: TxClient, idinversionista, idusuario, estados: number[]) => {
  try {
    const empresacuentabancaria = await tx.inversionista_cuenta_bancaria.findFirst({
      include: [
        {
          model: modelsFT.Inversionista,
          required: true,
          as: "inversionista_inversionistum",
          where: {
            idinversionista: idinversionista,
          },
          include: [
            {
              model: modelsFT.Persona,
              required: true,
              as: "persona_persona",
              where: {
                idusuario: idusuario,
              },
            },
          ],
        },
        {
          model: modelsFT.CuentaBancaria,
          required: true,
          as: "cuentabancaria_cuenta_bancarium",
          include: [
            {
              model: modelsFT.Banco,
              required: true,
              as: "banco_banco",
            },
            {
              model: modelsFT.Moneda,
              required: true,
              as: "moneda_moneda",
            },
            {
              model: modelsFT.CuentaTipo,
              required: true,
              as: "cuentatipo_cuenta_tipo",
            },
            {
              model: modelsFT.CuentaBancariaEstado,
              required: true,
              as: "cuentabancariaestado_cuenta_bancaria_estado",
            },
          ],
        },
      ],
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return empresacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getInversionistacuentabancariasByIdusuario = async (tx: TxClient, idusuario, estados: number[]) => {
  try {
    const empresacuentabancaria = await tx.inversionista_cuenta_bancaria.findMany({
      include: [
        {
          model: modelsFT.Inversionista,
          required: true,
          as: "inversionista_inversionistum",
          include: [
            {
              model: modelsFT.Persona,
              required: true,
              as: "persona_persona",
              where: {
                idusuario: idusuario,
              },
            },
          ],
        },
        {
          model: modelsFT.CuentaBancaria,
          required: true,
          as: "cuentabancaria_cuenta_bancarium",
          include: [
            {
              model: modelsFT.Banco,
              required: true,
              as: "banco_banco",
            },
            {
              model: modelsFT.Moneda,
              required: true,
              as: "moneda_moneda",
            },
            {
              model: modelsFT.CuentaTipo,
              required: true,
              as: "cuentatipo_cuenta_tipo",
            },
            {
              model: modelsFT.CuentaBancariaEstado,
              required: true,
              as: "cuentabancariaestado_cuenta_bancaria_estado",
            },
          ],
        },
      ],
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return empresacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getInversionistacuentabancariasByIdinversionistaAndAlias = async (tx: TxClient, idinversionista, alias, estados: number[]) => {
  try {
    const empresacuentabancaria = await tx.inversionista_cuenta_bancaria.findMany({
      include: [
        {
          model: modelsFT.Inversionista,
          required: true,
          as: "inversionista_inversionistum",
          where: {
            idinversionista: idinversionista,
          },
        },
        {
          model: modelsFT.CuentaBancaria,
          required: true,
          as: "cuentabancaria_cuenta_bancarium",
          include: [
            {
              model: modelsFT.Banco,
              required: true,
              as: "banco_banco",
            },
            {
              model: modelsFT.Moneda,
              required: true,
              as: "moneda_moneda",
            },
            {
              model: modelsFT.CuentaTipo,
              required: true,
              as: "cuentatipo_cuenta_tipo",
            },
            {
              model: modelsFT.CuentaBancariaEstado,
              required: true,
              as: "cuentabancariaestado_cuenta_bancaria_estado",
            },
          ],
          where: {
            alias: alias,
            estado: {
              in: estados,
            },
          },
        },
      ],
      where: {
        estado: {
          in: estados,
        },
      },
    });
    return empresacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getInversionistacuentabancarias = async (tx: TxClient, estados: number[]): Promise<inversionista_cuenta_bancaria[]> => {
  try {
    const inversionistacuentabancarias = await tx.inversionista_cuenta_bancaria.findMany({
      include: [
        {
          model: modelsFT.Inversionista,
          required: true,
          as: "inversionista_inversionistum",
          include: [
            {
              model: modelsFT.Persona,
              required: true,
              as: "persona_persona",
            },
          ],
        },
        {
          model: modelsFT.CuentaBancaria,
          required: true,
          as: "cuentabancaria_cuenta_bancarium",
          include: [
            {
              model: modelsFT.Banco,
              required: true,
              as: "banco_banco",
            },
            {
              model: modelsFT.Moneda,
              required: true,
              as: "moneda_moneda",
            },
            {
              model: modelsFT.CuentaTipo,
              required: true,
              as: "cuentatipo_cuenta_tipo",
            },
            {
              model: modelsFT.CuentaBancariaEstado,
              required: true,
              as: "cuentabancariaestado_cuenta_bancaria_estado",
            },
            {
              model: modelsFT.Archivo,
              required: false,
              as: "archivo_archivo_archivo_cuenta_bancaria",
              include: [
                {
                  model: modelsFT.ArchivoTipo,
                  required: true,
                  as: "archivotipo_archivo_tipo",
                },
              ],
            },
          ],
        },
      ],
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return inversionistacuentabancarias;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getInversionistacuentabancariaByIdinversionistacuentabancaria = async (tx: TxClient, idinversionistacuentabancaria: number): Promise<inversionista_cuenta_bancaria> => {
  try {
    const inversionistacuentabancaria = await tx.inversionista_cuenta_bancaria.findUnique({ where: { idinversionistacuentabancaria: idinversionistacuentabancaria } });

    return inversionistacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getInversionistacuentabancariaByInversionistacuentabancariaid = async (tx: TxClient, inversionistacuentabancariaid: string): Promise<inversionista_cuenta_bancaria> => {
  try {
    const inversionistacuentabancaria = await tx.inversionista_cuenta_bancaria.findFirst({
      where: {
        inversionistacuentabancariaid: inversionistacuentabancariaid,
      },
    });

    return inversionistacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findInversionistacuentabancariaPk = async (tx: TxClient, inversionistacuentabancariaid: string): Promise<{ idinversionistacuentabancaria: number }> => {
  try {
    const inversionistacuentabancaria = await tx.inversionista_cuenta_bancaria.findFirst({
      select: { idinversionistacuentabancaria: true },
      where: {
        inversionistacuentabancariaid: inversionistacuentabancariaid,
      },
    });

    return inversionistacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertInversionistacuentabancaria = async (tx: TxClient, inversionistacuentabancaria: Prisma.inversionista_cuenta_bancariaCreateInput): Promise<inversionista_cuenta_bancaria> => {
  try {
    const nuevo = await tx.inversionista_cuenta_bancaria.create({ data: inversionistacuentabancaria });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateInversionistacuentabancaria = async (tx: TxClient, inversionistacuentabancaria: Partial<inversionista_cuenta_bancaria>): Promise<inversionista_cuenta_bancaria> => {
  try {
    const result = await tx.inversionista_cuenta_bancaria.update({
      data: inversionistacuentabancaria,
      where: {
        inversionistacuentabancariaid: inversionistacuentabancaria.inversionistacuentabancariaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteInversionistacuentabancaria = async (tx: TxClient, inversionistacuentabancaria: Partial<inversionista_cuenta_bancaria>): Promise<inversionista_cuenta_bancaria> => {
  try {
    const result = await tx.inversionista_cuenta_bancaria.update({
      data: inversionistacuentabancaria,
      where: {
        inversionistacuentabancariaid: inversionistacuentabancaria.inversionistacuentabancariaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateInversionistacuentabancaria = async (tx: TxClient, inversionistacuentabancaria: Partial<inversionista_cuenta_bancaria>): Promise<inversionista_cuenta_bancaria> => {
  try {
    const result = await tx.inversionista_cuenta_bancaria.update({
      data: inversionistacuentabancaria,
      where: {
        inversionistacuentabancariaid: inversionistacuentabancaria.inversionistacuentabancariaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
