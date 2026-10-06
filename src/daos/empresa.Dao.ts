import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, empresa } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

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
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresasByIdusuario = async (tx: TxClient, idusuario: number, estados: number[]) => {
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
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresaByIdusuarioAndRuc = async (tx: TxClient, idusuario: number, ruc: string, estados: number[]) => {
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
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresaByIdusuarioAndEmpresaid = async (tx: TxClient, idusuario: number, empresaid: string, estado: number[]) => {
  try {
    const empresas = await tx.empresa.findFirst({
      include: {
        usuario_servicio_empresas: true,
      },
      where: {
        empresaid: empresaid,
        estado: { in: estado },
        usuario_servicio_empresas: {
          some: {
            idusuario: idusuario,
            estado: { in: estado },
          },
        },
      },
    });

    return empresas;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresas = async (tx: TxClient, estados: number[]) => {
  try {
    const empresas = await tx.empresa.findMany({
      include: {
        archivo_empresas: true,
        colaboradores: true,
        contactos: true,
        departamento_sede: true,
        distrito_sede: true,
        empresa_cuenta_bancarias: true,
        pais_sede: true,
        provincia_sede: true,
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
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

/** Ficha de lectura de una empresa vinculada a las operaciones visibles del rol. */
export const getEmpresaDetalleEnFactoring = async (tx: TxClient, empresaid: string, estados: number[]) => {
  try {
    return await tx.empresa.findFirst({
      where: {
        empresaid,
        OR: [
          { factoring_cedentes: { some: { estado: { in: estados } } } },
          { factoring_aceptantes: { some: { estado: { in: estados } } } },
        ],
      },
      select: {
        idempresa: true,
        empresaid: true,
        code: true,
        ruc: true,
        razon_social: true,
        nombre_comercial: true,
        domicilio_fiscal: true,
        fecha_inscripcion: true,
        direccion_sede: true,
        direccion_sede_referencia: true,
        riesgo: { select: { alias: true } },
        pais_sede: { select: { nombrepais: true } },
        distrito_sede: { select: { nombredistrito: true } },
        provincia_sede: { select: { nombreprovincia: true } },
        departamento_sede: { select: { nombredepartamento: true } },
        idusuariocrea: true,
        fechacrea: true,
        idusuariomod: true,
        fechamod: true,
        estado: true,
      },
    });
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresaByIdempresa = async (tx: TxClient, idempresa: number) => {
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
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresaByEmpresaid = async (tx: TxClient, empresaid: string) => {
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
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getEmpresaByRuc = async (tx: TxClient, ruc: string) => {
  try {
    const empresa = await tx.empresa.findFirst({
      where: {
        ruc: ruc,
      },
    });

    return empresa;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findEmpresaPk = async (tx: TxClient, empresaid: string) => {
  try {
    const empresa = await tx.empresa.findFirst({
      select: { idempresa: true },
      where: {
        empresaid: empresaid,
      },
    });

    return empresa;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertEmpresa = async (tx: TxClient, empresa: Prisma.empresaCreateInput) => {
  try {
    const nuevo = await tx.empresa.create({ data: empresa });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateEmpresa = async (tx: TxClient, empresaid: string, empresa: Prisma.empresaUpdateInput) => {
  try {
    const result = await tx.empresa.update({
      data: empresa,
      where: {
        empresaid: empresaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteEmpresa = async (tx: TxClient, empresaid: string, idusuariomod: number) => {
  try {
    const result = await tx.empresa.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        empresaid: empresaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activateEmpresa = async (tx: TxClient, empresaid: string, idusuariomod: number) => {
  try {
    const result = await tx.empresa.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ACTIVO },
      where: {
        empresaid: empresaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
