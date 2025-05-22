import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, cuenta_bancaria } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getCuentasbancariasByIdempresaAndAlias = async (tx: TxClient, idempresa: number, alias: string, estado: number[]) => {
  try {
    const cuentasbancarias = await tx.cuenta_bancaria.findMany({
      include: {
        empresa_cuenta_bancaria: {
          where: { idempresa },
        },
        banco: true,
        moneda: true,
        cuenta_tipo: true,
        cuenta_bancaria_estado: true,
      },

      where: {
        AND: [
          { alias: alias },
          { estado: { in: estado } },
          {
            empresa_cuenta_bancaria: { some: { idempresa: idempresa } },
          },
        ],
      },
    });

    return cuentasbancarias;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentasbancariasByIdbancoAndNumero = async (tx: TxClient, idbanco: number, numero: string, estado: number[]) => {
  try {
    const cuentasbancarias = await tx.cuenta_bancaria.findMany({
      include: {
        banco: true,
        moneda: true,
        cuenta_tipo: true,
        cuenta_bancaria_estado: true,
      },
      where: {
        idbanco: idbanco,
        numero: numero,
        estado: {
          in: estado,
        },
      },
    });

    return cuentasbancarias;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentasbancariasByIdusuarioAndAlias = async (tx: TxClient, idusuario: bigint, alias: string, estado: number[]) => {
  try {
    const cuentasbancarias = await tx.cuenta_bancaria.findMany({
      include: {
        empresa_cuenta_bancaria: {
          include: {
            empresa: {
              include: {
                usuario_servicio_empresa: true,
              },
            },
          },
        },
        banco: true,
        moneda: true,
        cuenta_tipo: true,
        cuenta_bancaria_estado: true,
      },
      where: {
        alias: alias,
        estado: {
          in: estado,
        },
        empresa_cuenta_bancaria: {
          some: {
            empresa: {
              usuario_servicio_empresa: {
                some: {
                  idusuario: idusuario,
                },
              },
            },
          },
        },
      },
    });

    return cuentasbancarias;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentasbancariasByIdusuario = async (tx: TxClient, idusuario: bigint, estado: number[]) => {
  try {
    const cuentasbancarias = await tx.cuenta_bancaria.findMany({
      include: {
        empresa_cuenta_bancaria: {
          include: {
            empresa: {
              include: {
                usuario_servicio_empresa: true,
              },
            },
          },
        },
        banco: true,
        moneda: true,
        cuenta_tipo: true,
        cuenta_bancaria_estado: true,
      },
      where: {
        estado: {
          in: estado,
        },
        empresa_cuenta_bancaria: {
          some: {
            empresa: {
              usuario_servicio_empresa: {
                some: {
                  idusuario: idusuario,
                },
              },
            },
          },
        },
      },
    });

    return cuentasbancarias;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentabancariaByIdcuentabancaria = async (tx: TxClient, idcuentabancaria: number): Promise<cuenta_bancaria> => {
  try {
    const cuentabancaria = await tx.cuenta_bancaria.findUnique({ where: { idcuentabancaria: idcuentabancaria } });

    return cuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentasbancariasByEmpresaidAndMoneda = async (tx: TxClient, empresaid: string, monedaid: string, idcuentabancariaestado: number[], estado: number[]) => {
  try {
    const cuentasbancarias = await tx.cuenta_bancaria.findMany({
      include: {
        banco: true,
        cuenta_tipo: true,
        moneda: true,
        cuenta_bancaria_estado: true,
        empresa_cuenta_bancaria: {
          include: {
            empresa: true,
          },
        },
      },
      where: {
        idcuentabancariaestado: {
          in: idcuentabancariaestado,
        },
        estado: {
          in: estado,
        },
        empresa_cuenta_bancaria: {
          some: {
            empresa: {
              empresaid: empresaid,
            },
          },
        },
        moneda: {
          monedaid: monedaid,
        },
      },
    });

    return cuentasbancarias;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentabancariaByIdcuentabancariaIdempresaIdusuario = async (tx: TxClient, idcuentabancaria: number, idempresa: number, idusuario: number) => {
  try {
    const cuentabancaria = await tx.cuenta_bancaria.findFirst({
      include: {
        banco: true,
        moneda: true,
        cuenta_tipo: true,
        cuenta_bancaria_estado: true,
        empresa_cuenta_bancaria: {
          include: {
            empresa: {
              include: {
                usuario_servicio_empresa: true,
              },
            },
          },
        },
      },
      where: {
        idcuentabancaria: idcuentabancaria,
        AND: {
          empresa_cuenta_bancaria: {
            some: {
              idempresa,
              idusuariocrea: idusuario,
            },
          },
        },
      },
    });
    //log.debug(line(), cuentabancaria);
    return cuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentabancariaByCuentabancariaid = async (tx: TxClient, cuentabancariaid: string): Promise<cuenta_bancaria> => {
  try {
    const cuentabancaria = await tx.cuenta_bancaria.findFirst({
      include: {
        empresa_cuenta_bancaria: {
          include: {
            empresa: true,
          },
        },
        banco: true,
        moneda: true,
        cuenta_tipo: true,
        cuenta_bancaria_estado: true,
      },
      where: {
        cuentabancariaid: cuentabancariaid,
      },
    });
    return cuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findCuentabancariaPk = async (tx: TxClient, cuentabancariaid: string): Promise<{ idcuentabancaria: number }> => {
  try {
    const cuentabancaria = await tx.cuenta_bancaria.findFirst({
      select: { idcuentabancaria: true },
      where: {
        cuentabancariaid: cuentabancariaid,
      },
    });

    return cuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getCuentasbancarias = async (tx: TxClient, estado) => {
  try {
    const cuentasbancarias = await tx.cuenta_bancaria.findMany({
      include: {
        banco: true,
        moneda: true,
        cuenta_tipo: true,
        cuenta_bancaria_estado: true,
        empresa_cuenta_bancaria: {
          include: {
            empresa: true,
          },
        },
      },
      where: {
        estado: {
          in: estado,
        },
      },
    });

    return cuentasbancarias;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertCuentabancaria = async (tx: TxClient, cuentabancaria: Prisma.cuenta_bancariaCreateInput): Promise<cuenta_bancaria> => {
  try {
    const nuevo = await tx.cuenta_bancaria.create({ data: cuentabancaria });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateCuentabancariaOnlyAliasByCuentabancariaid = async (tx: TxClient, cuentabancaria: Partial<cuenta_bancaria>): Promise<cuenta_bancaria> => {
  try {
    const result = await tx.cuenta_bancaria.update({
      data: {
        alias: cuentabancaria.alias,
        idusuariomod: cuentabancaria.idusuariomod,
        fechamod: cuentabancaria.fechamod,
      },
      where: {
        cuentabancariaid: cuentabancaria.cuentabancariaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateCuentabancaria = async (tx: TxClient, cuentabancaria: Partial<cuenta_bancaria>): Promise<cuenta_bancaria> => {
  try {
    const result = await tx.cuenta_bancaria.update({
      data: cuentabancaria,
      where: {
        cuentabancariaid: cuentabancaria.cuentabancariaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteCuentabancaria = async (tx: TxClient, cuentabancaria: Partial<cuenta_bancaria>): Promise<cuenta_bancaria> => {
  try {
    const result = await tx.cuenta_bancaria.update({
      data: cuentabancaria,
      where: {
        cuentabancariaid: cuentabancaria.cuentabancariaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateCuentabancaria = async (tx: TxClient, cuentabancaria: Partial<cuenta_bancaria>): Promise<cuenta_bancaria> => {
  try {
    const result = await tx.cuenta_bancaria.update({
      data: cuentabancaria,
      where: {
        cuentabancariaid: cuentabancaria.cuentabancariaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
