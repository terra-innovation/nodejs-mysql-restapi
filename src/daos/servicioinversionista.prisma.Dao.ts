import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, servicio_inversionista } from "#root/generated/prisma/ft_factoring/client.js";

import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getFactoringinversionistasByVerificacion = async (tx: TxClient, estadologico: number[], idservicio: number[], idarchivotipos: number[]) => {
  try {
    const personas = await tx.servicio_inversionista.findMany({
      include: {
        servicio: true,
        usuario_suscriptor: true,
        servicio_inversionista_estado: true,
        inversionista: {
          include: {
            persona: {
              include: {
                usuario: true,
                persona_verificacion_estado: true,
                documento_tipo: true,
                pais_nacimiento: true,
                pais_nacionalidad: true,
                pais_residencia: true,
                distrito_residencia: {
                  include: {
                    provincia: {
                      include: {
                        departamento: true,
                      },
                    },
                  },
                },
                genero: true,
                persona_verificaciones: {
                  include: {
                    persona_verificacion_estado: true,
                    usuario_verifica: true,
                  },
                },
                archivo_personas: {
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
            inversionista_cuenta_bancarias: {
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
          },
        },
        servicio_inversionista_verificaciones: {
          include: {
            servicio_inversionista_estado: true,
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
        inversionista: {
          persona: {
            archivo_personas: {
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
    });

    return personas;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioinversionistas = async (tx: TxClient, estados: number[]) => {
  try {
    const servicioinversionistas = await tx.servicio_inversionista.findMany({
      where: {
        estado: {
          in: estados,
        },
      },
    });

    return servicioinversionistas;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioinversionistaByIdservicioinversionista = async (tx: TxClient, idservicioinversionista: number) => {
  try {
    const servicioinversionista = await tx.servicio_inversionista.findUnique({ where: { idservicioinversionista: idservicioinversionista } });

    //const servicioinversionistas = await servicioinversionista.getServicioinversionistas();

    return servicioinversionista;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getServicioinversionistaByServicioinversionistaid = async (tx: TxClient, servicioinversionistaid: string) => {
  try {
    const servicioinversionista = await tx.servicio_inversionista.findFirst({
      where: {
        servicioinversionistaid: servicioinversionistaid,
      },
    });

    return servicioinversionista;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findServicioinversionistaPk = async (tx: TxClient, servicioinversionistaid: string) => {
  try {
    const servicioinversionista = await tx.servicio_inversionista.findFirst({
      select: { idservicioinversionista: true },
      where: {
        servicioinversionistaid: servicioinversionistaid,
      },
    });

    return servicioinversionista;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertServicioinversionista = async (tx: TxClient, servicioinversionista: Prisma.servicio_inversionistaCreateInput) => {
  try {
    const nuevo = await tx.servicio_inversionista.create({ data: servicioinversionista });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateServicioinversionista = async (tx: TxClient, servicioinversionistaid: string, servicioinversionista: Prisma.servicio_inversionistaUpdateInput) => {
  try {
    const result = await tx.servicio_inversionista.update({
      data: servicioinversionista,
      where: {
        servicioinversionistaid: servicioinversionistaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteServicioinversionista = async (tx: TxClient, servicioinversionistaid: string, idusuariomod: number) => {
  try {
    const result = await tx.servicio_inversionista.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        servicioinversionistaid: servicioinversionistaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
