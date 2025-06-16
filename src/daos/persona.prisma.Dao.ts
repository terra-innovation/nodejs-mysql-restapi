import { TxClient } from "#src/types/Prisma.types.js";
import type { Prisma, persona } from "#root/generated/prisma/ft_factoring/client.js";
import { ClientError } from "#src/utils/CustomErrors.js";

import { log, line } from "#src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";

export const getPersonasByVerificacion = async (tx: TxClient, estado: number[], idarchivotipo: number[]) => {
  try {
    const personas = await tx.persona.findMany({
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
      where: {
        estado: {
          in: estado,
        },
        archivo_personas: {
          some: {
            archivo: {
              idarchivotipo: {
                in: idarchivotipo,
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

export const getPersonaByIdusuario = async (tx: TxClient, idusuario: number) => {
  try {
    const persona = await tx.persona.findUnique({
      include: {
        usuario: true,
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
      },
      where: {
        idusuario: idusuario,
      },
    });
    return persona;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaByIdpersona = async (tx: TxClient, idpersona: number) => {
  try {
    const persona = await tx.persona.findUnique({
      include: {
        usuario: true,
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
      },
      where: {
        idpersona: idpersona,
      },
    });

    return persona;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaByPersonaid = async (tx: TxClient, personaid: string) => {
  try {
    const persona = await tx.persona.findUnique({
      include: {
        usuario: true,
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
      },
      where: {
        personaid: personaid,
      },
    });
    return persona;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPersonaPk = async (tx: TxClient, personaid: string) => {
  try {
    const persona = await tx.persona.findUnique({
      select: {
        idpersona: true,
      },
      where: {
        personaid: personaid,
      },
    });

    return persona;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonas = async (tx: TxClient, estado: number[]) => {
  try {
    const personas = await tx.persona.findMany({
      include: {
        usuario: true,
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
        persona_verificacion_estado: true,
      },
      where: {
        estado: {
          in: estado,
        },
      },
    });

    return personas;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPersona = async (tx: TxClient, persona: Prisma.personaCreateInput) => {
  try {
    const nuevo = await tx.persona.create({ data: persona });

    return nuevo;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePersona = async (tx: TxClient, personaid: string, persona: Prisma.personaUpdateInput) => {
  try {
    const result = await tx.persona.update({
      data: persona,
      where: {
        personaid: personaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePersona = async (tx: TxClient, personaid: string, idusuariomod: number) => {
  try {
    const result = await tx.persona.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ELIMINADO },
      where: {
        personaid: personaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activatePersona = async (tx: TxClient, personaid: string, idusuariomod: number) => {
  try {
    const result = await tx.persona.update({
      data: { idusuariomod: idusuariomod, fechamod: new Date(), estado: ESTADO.ACTIVO },
      where: {
        personaid: personaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
