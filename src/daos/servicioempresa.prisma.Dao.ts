import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, servicio_empresa } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getFactoringempresasByVerificacion = async (tx: TxClient, estadologico: number[], idservicio: number[], idarchivotipos: number[]) => {
  try {
    const personas = await tx.servicio_empresa.findMany({
      include: {
        servicio: true,
        usuario_suscriptor: true,
        servicio_empresa_estado: true,
        empresa: {
          include: {
            archivo_empresas: {
              include: {
                archivo: {
                  include: {
                    archivo_tipo: true,
                  },
                },
              },
            },
            colaboradores: {
              include: {
                colaborador_tipo: true,
                documento_tipo: true,
                archivo_colaboradores: {
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
            empresa_cuenta_bancarias: {
              include: {
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
            },
            pais_sede: true,
            distrito_sede: {
              include: {
                provincia: {
                  include: {
                    departamento: true,
                  },
                },
              },
            },
          },
        },
        servicio_empresa_verificaciones: {
          include: {
            servicio_empresa_estado: true,
            usuario_verifica: true,
          },
        },
      },
      where: {
        idservicio: {
          in: idservicio,
        },
        estado: {
          in: estadologico,
        },
        empresa: {
          archivo_empresas: {
            some: {
              archivo: {
                idarchivotipo: {
                  in: idarchivotipos,
                },
              },
            },
          },
          empresa_cuenta_bancarias: {
            some: {
              cuenta_bancaria: {
                archivo_cuenta_bancarias: {
                  some: {
                    archivo: {
                      idarchivotipo: {
                        in: idarchivotipos,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return personas;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioempresas = async (tx: TxClient, estados: number[]) => {
  try {
    const servicioempresas = await tx.servicio_empresa.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return servicioempresas;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioempresaByIdservicioempresa = async (tx: TxClient, idservicioempresa: number) => {
  try {
    const servicioempresa = await tx.servicio_empresa.findUnique({ where: { idservicioempresa: idservicioempresa } });

    //const servicioempresas = await servicioempresa.getServicioempresas();

    return servicioempresa;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioempresaByServicioempresaid = async (tx: TxClient, servicioempresaid: string) => {
  try {
    const servicioempresa = await tx.servicio_empresa.findFirst({
      where: {
        servicioempresaid: servicioempresaid,
      },
    });

    return servicioempresa;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findServicioempresaPk = async (tx: TxClient, servicioempresaid: string) => {
  try {
    const servicioempresa = await tx.servicio_empresa.findFirst({
      select: { idservicioempresa: true },
      where: {
        servicioempresaid: servicioempresaid,
      },
    });

    return servicioempresa;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertServicioempresa = async (tx: TxClient, servicioempresa: Prisma.servicio_empresaCreateInput) => {
  try {
    const nuevo = await tx.servicio_empresa.create({ data: servicioempresa });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateServicioempresa = async (tx: TxClient, servicioempresaid: string, servicioempresa: Prisma.servicio_empresaUpdateInput) => {
  try {
    const result = await tx.servicio_empresa.update({
      data: servicioempresa,
      where: {
        servicioempresaid: servicioempresaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteServicioempresa = async (tx: TxClient, servicioempresaid: string, idusuariomod: number) => {
  try {
    const result = await tx.servicio_empresa.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        servicioempresaid: servicioempresaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
