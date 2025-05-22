import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, empresa } from "#src/models/prisma/ft_factoring/client";

import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getEmpresasByIdempresas = async (tx: TxClient, idempresas: number[], estados: number[]) => {
  try {
    const empresas = await tx.empresa.findMany({
      where: {
        idempresa: {
          in: idempresas,
        },
        estado: {
          in: estados,
        },
      },
    });

    return empresas;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresasByIdusuario = async (tx: TxClient, idusuario: bigint, estados: number[]) => {
  try {
    const empresas = await tx.empresa.findMany({
      include: {
        usuario_servicio_empresas: true,
      },
      where: {
        estado: {
          in: estados,
        },
        usuario_servicio_empresas: {
          some: {
            idusuario: idusuario,
            estado: {
              in: estados,
            },
          },
        },
      },
    });

    return empresas;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresaByIdusuarioAndRuc = async (tx: TxClient, idusuario: bigint, ruc: string, estados: number[]) => {
  try {
    const empresas = await tx.empresa.findFirst({
      include: {
        usuario_servicio_empresas: true,
      },
      where: {
        ruc: ruc,
        estado: {
          in: estados,
        },
        usuario_servicio_empresas: {
          some: {
            idusuario: idusuario,
            estado: {
              in: estados,
            },
          },
        },
      },
    });

    return empresas;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresaByIdusuarioAndEmpresaid = async (tx: TxClient, idusuario: bigint, empresaid: string, estado: number) => {
  try {
    const empresas = await tx.empresa.findFirst({
      include: {
        usuario_servicio_empresas: true,
      },
      where: {
        empresaid: empresaid,
        estado: estado,
        usuario_servicio_empresas: {
          some: {
            idusuario: idusuario,
            estado: estado,
          },
        },
      },
    });

    return empresas;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresas = async (tx: TxClient, estados: number[]): Promise<empresa[]> => {
  try {
    const empresas = await tx.empresa.findMany({
      include: {
        archivo_empresas: true,
        colaboradores: true,
        contactos: true,
        departamento: true,
        distrito: true,
        empresa_cuenta_bancarias: true,
        pais: true,
        provincia: true,
        riesgo: true,
        servicio_empresas: true,
        usuario_servicio_empresas: true,
      },
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return empresas;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresaByIdempresa = async (tx: TxClient, idempresa: number): Promise<empresa> => {
  try {
    const empresa = await tx.empresa.findUnique({
      include: {
        colaboradores: true,
      },
      where: {
        idempresa: idempresa,
      },
    });

    //const colaboradores = await empresa.getColaboradors();

    return empresa;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresaByEmpresaid = async (tx: TxClient, empresaid: string): Promise<empresa> => {
  try {
    const empresa = await tx.empresa.findFirst({
      include: {
        colaboradores: true,
      },
      where: {
        empresaid: empresaid,
      },
    });

    return empresa;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresaByRuc = async (tx: TxClient, ruc) => {
  try {
    const empresa = await tx.empresa.findFirst({
      where: {
        ruc: ruc,
      },
    });

    return empresa;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findEmpresaPk = async (tx: TxClient, empresaid: string): Promise<{ idempresa: number }> => {
  try {
    const empresa = await tx.empresa.findFirst({
      select: { idempresa: true },
      where: {
        empresaid: empresaid,
      },
    });

    return empresa;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertEmpresa = async (tx: TxClient, empresa: Prisma.empresaCreateInput): Promise<empresa> => {
  try {
    const nuevo = await tx.empresa.create({ data: empresa });

    return nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateEmpresa = async (tx: TxClient, empresa: Partial<empresa>): Promise<empresa> => {
  try {
    const result = await tx.empresa.update({
      data: empresa,
      where: {
        empresaid: empresa.empresaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteEmpresa = async (tx: TxClient, empresa: Partial<empresa>): Promise<empresa> => {
  try {
    const result = await tx.empresa.update({
      data: empresa,
      where: {
        empresaid: empresa.empresaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateEmpresa = async (tx: TxClient, empresa: Partial<empresa>): Promise<empresa> => {
  try {
    const result = await tx.empresa.update({
      data: empresa,
      where: {
        empresaid: empresa.empresaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
