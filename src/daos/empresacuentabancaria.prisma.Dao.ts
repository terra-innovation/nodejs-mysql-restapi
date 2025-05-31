import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, empresa_cuenta_bancaria } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getEmpresacuentabancariasForFactoring = async (tx: TxClient, idempresa: number, idmoneda: number, idcuentabancariaestado: number[], estados: number[]) => {
  try {
    const empresacuentabancaria = await tx.empresa_cuenta_bancaria.findMany({
      include: {
        cuenta_bancaria: {
          include: {
            banco: true,
            moneda: true,
            cuenta_tipo: true,
            cuenta_bancaria_estado: true,
          },
        },
      },
      where: {
        idempresa: idempresa,
        estado: {
          in: estados,
        },
        cuenta_bancaria: {
          idcuentabancariaestado: {
            in: idcuentabancariaestado,
          },
          estado: {
            in: estados,
          },
        },
      },
    });

    return empresacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresacuentabancariasByIdempresaAndAlias = async (tx: TxClient, idempresa: number, alias: string, estados: number[]) => {
  try {
    const empresacuentabancaria = await tx.empresa_cuenta_bancaria.findMany({
      include: {
        empresa: true,
        cuenta_bancaria: {
          include: {
            banco: true,
            moneda: true,
            cuenta_tipo: true,
            cuenta_bancaria_estado: true,
          },
        },
      },
      where: {
        estado: {
          in: estados,
        },
        cuenta_bancaria: {
          alias: alias,
          estado: {
            in: estados,
          },
        },
      },
    });

    return empresacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresacuentabancariasByIdusuario = async (tx: TxClient, idusuario: number, estados: number[]) => {
  try {
    const empresacuentabancaria = await tx.empresa_cuenta_bancaria.findMany({
      include: {
        empresa: {
          include: {
            usuario_servicio_empresas: true,
          },
        },
        cuenta_bancaria: {
          include: {
            banco: true,
            moneda: true,
            cuenta_tipo: true,
            cuenta_bancaria_estado: true,
          },
        },
      },
      where: {
        estado: {
          in: estados,
        },
        empresa: {
          usuario_servicio_empresas: {
            some: {
              idusuario: idusuario,
            },
          },
        },
      },
    });

    return empresacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresacuentabancarias = async (tx: TxClient, estados: number[]) => {
  try {
    const empresacuentabancarias = await tx.empresa_cuenta_bancaria.findMany({
      include: {
        empresa: {
          include: {
            usuario_servicio_empresas: true,
          },
        },
        cuenta_bancaria: {
          include: {
            banco: true,
            moneda: true,
            cuenta_tipo: true,
            cuenta_bancaria_estado: true,
            archivo_cuenta_bancarias: {
              include: {
                archivo: {
                  include: {
                    archivo_tipo: true,
                  },
                },
              },
            },
          },
        },
      },
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return empresacuentabancarias;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresacuentabancariaByIdempresaAndIdusuario = async (tx: TxClient, idempresa: number, idusuario, estados: number[]) => {
  try {
    const empresacuentabancaria = await tx.empresa_cuenta_bancaria.findFirst({
      include: {
        empresa: {
          include: {
            usuario_servicio_empresas: true,
          },
        },
        cuenta_bancaria: {
          include: {
            banco: true,
            moneda: true,
            cuenta_tipo: true,
            cuenta_bancaria_estado: true,
          },
        },
      },
      where: {
        estado: {
          in: estados,
        },
        empresa: {
          usuario_servicio_empresas: {
            some: {
              idempresa: idempresa,
              idusuario: idusuario,
            },
          },
        },
      },
    });

    return empresacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresacuentabancariaByIdempresacuentabancaria = async (tx: TxClient, idempresacuentabancaria: number) => {
  try {
    const empresacuentabancaria = await tx.empresa_cuenta_bancaria.findUnique({ where: { idempresacuentabancaria: idempresacuentabancaria } });

    return empresacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresacuentabancariaByEmpresacuentabancariaid = async (tx: TxClient, empresacuentabancariaid: string) => {
  try {
    const empresacuentabancaria = await tx.empresa_cuenta_bancaria.findFirst({
      where: {
        empresacuentabancariaid: empresacuentabancariaid,
      },
    });

    return empresacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findEmpresacuentabancariaPk = async (tx: TxClient, empresacuentabancariaid: string) => {
  try {
    const empresacuentabancaria = await tx.empresa_cuenta_bancaria.findFirst({
      select: { idempresacuentabancaria: true },
      where: {
        empresacuentabancariaid: empresacuentabancariaid,
      },
    });

    return empresacuentabancaria;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertEmpresacuentabancaria = async (tx: TxClient, empresacuentabancaria: Prisma.empresa_cuenta_bancariaCreateInput) => {
  try {
    const nuevo = await tx.empresa_cuenta_bancaria.create({ data: empresacuentabancaria });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateEmpresacuentabancaria = async (tx: TxClient, empresacuentabancariaid: string, empresacuentabancaria: Prisma.empresa_cuenta_bancariaUpdateInput) => {
  try {
    const result = await tx.empresa_cuenta_bancaria.update({
      data: empresacuentabancaria,
      where: {
        empresacuentabancariaid: empresacuentabancariaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteEmpresacuentabancaria = async (tx: TxClient, empresacuentabancariaid: string, empresacuentabancaria: Prisma.empresa_cuenta_bancariaUpdateInput) => {
  try {
    const result = await tx.empresa_cuenta_bancaria.update({
      data: empresacuentabancaria,
      where: {
        empresacuentabancariaid: empresacuentabancariaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
