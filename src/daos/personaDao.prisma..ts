import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import { log, line } from "#src/utils/logger.pino.js";

export const getPersonasByVerificacion = async (tx: TxClient, estado, idarchivotipo) => {
  try {
    const personas = await tx.Persona.findMany({
      include: [
        {
          model: modelsFT.Usuario,
          required: true,
          as: "usuario_usuario",
        },
        {
          model: modelsFT.PersonaVerificacionEstado,
          required: true,
          as: "personaverificacionestado_persona_verificacion_estado",
        },
        {
          model: modelsFT.DocumentoTipo,
          required: true,
          as: "documentotipo_documento_tipo",
        },
        {
          model: modelsFT.Pais,
          required: true,
          as: "paisnacionalidad_pai",
        },
        {
          model: modelsFT.Pais,
          required: true,
          as: "paisnacimiento_pai",
        },
        {
          model: modelsFT.Pais,
          required: true,
          as: "paisresidencia_pai",
        },
        {
          model: modelsFT.Distrito,
          required: true,
          as: "distritoresidencia_distrito",
          include: [
            {
              model: modelsFT.Provincia,
              required: true,
              as: "provincia_provincium",
              include: [
                {
                  model: modelsFT.Departamento,
                  required: true,
                  as: "departamento_departamento",
                },
              ],
            },
          ],
        },
        {
          model: modelsFT.Genero,
          required: true,
          as: "genero_genero",
        },
        {
          model: modelsFT.PersonaVerificacion,
          required: true,
          as: "persona_verificacions",
          include: [
            {
              model: modelsFT.PersonaVerificacionEstado,
              required: true,
              as: "personaverificacionestado_persona_verificacion_estado",
            },
            {
              model: modelsFT.Usuario,
              required: true,
              as: "usuarioverifica_usuario",
            },
          ],
        },
        {
          model: modelsFT.Archivo,
          required: true,
          as: "archivo_archivo_archivo_personas",
          include: [
            {
              model: modelsFT.ArchivoTipo,
              required: true,
              as: "archivotipo_archivo_tipo",
            },
          ],
          where: {
            idarchivotipo: {
              in: idarchivotipo,
            },
          },
        },
      ],
      where: {
        estado: {
          in: estado,
        },
      },
    });

    return personas;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaByIdusuario = async (tx: TxClient, idusuario) => {
  try {
    const persona = await tx.Persona.findFirst({
      include: [
        {
          model: modelsFT.Usuario,
          required: true,
          as: "usuario_usuario",
        },
        {
          model: modelsFT.DocumentoTipo,
          required: true,
          as: "documentotipo_documento_tipo",
        },
        {
          model: modelsFT.Pais,
          required: true,
          as: "paisnacionalidad_pai",
        },
        {
          model: modelsFT.Pais,
          required: true,
          as: "paisnacimiento_pai",
        },
        {
          model: modelsFT.Pais,
          required: true,
          as: "paisresidencia_pai",
        },
        {
          model: modelsFT.Distrito,
          required: true,
          as: "distritoresidencia_distrito",
          include: [
            {
              model: modelsFT.Provincia,
              required: true,
              as: "provincia_provincium",
              include: [
                {
                  model: modelsFT.Departamento,
                  required: true,
                  as: "departamento_departamento",
                },
              ],
            },
          ],
        },
        {
          model: modelsFT.Genero,
          required: true,
          as: "genero_genero",
        },
      ],
      where: {
        idusuario: idusuario,
      },
    });
    return persona;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaByIdpersona = async (tx: TxClient, idpersona) => {
  try {
    const persona = await tx.Persona.findByPk(idpersona, {
      include: [
        {
          model: modelsFT.Usuario,
          required: true,
          as: "usuario_usuario",
        },
        {
          model: modelsFT.DocumentoTipo,
          required: true,
          as: "documentotipo_documento_tipo",
        },
        {
          model: modelsFT.Pais,
          required: true,
          as: "paisnacionalidad_pai",
        },
        {
          model: modelsFT.Pais,
          required: true,
          as: "paisnacimiento_pai",
        },
        {
          model: modelsFT.Pais,
          required: true,
          as: "paisresidencia_pai",
        },
        {
          model: modelsFT.Distrito,
          required: true,
          as: "distritoresidencia_distrito",
          include: [
            {
              model: modelsFT.Provincia,
              required: true,
              as: "provincia_provincium",
              include: [
                {
                  model: modelsFT.Departamento,
                  required: true,
                  as: "departamento_departamento",
                },
              ],
            },
          ],
        },
        {
          model: modelsFT.Genero,
          required: true,
          as: "genero_genero",
        },
      ],
    });

    return persona;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaByPersonaid = async (tx: TxClient, personaid: string) => {
  try {
    const persona = await tx.Persona.findFirst({
      include: [
        {
          model: modelsFT.Usuario,
          required: true,
          as: "usuario_usuario",
        },
        {
          model: modelsFT.DocumentoTipo,
          required: true,
          as: "documentotipo_documento_tipo",
        },
        {
          model: modelsFT.Pais,
          required: true,
          as: "paisnacionalidad_pai",
        },
        {
          model: modelsFT.Pais,
          required: true,
          as: "paisnacimiento_pai",
        },
        {
          model: modelsFT.Pais,
          required: true,
          as: "paisresidencia_pai",
        },
        {
          model: modelsFT.Distrito,
          required: true,
          as: "distritoresidencia_distrito",
          include: [
            {
              model: modelsFT.Provincia,
              required: true,
              as: "provincia_provincium",
              include: [
                {
                  model: modelsFT.Departamento,
                  required: true,
                  as: "departamento_departamento",
                },
              ],
            },
          ],
        },
        {
          model: modelsFT.Genero,
          required: true,
          as: "genero_genero",
        },
      ],
      where: {
        personaid: personaid,
      },
    });
    //log.debug(line(), persona);
    return persona;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPersonaPk = async (tx: TxClient, personaid: string) => {
  try {
    const persona = await tx.Persona.findFirst({
      attributes: ["idpersona"],
      where: {
        personaid: personaid,
      },
    });

    return persona;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonas = async (tx: TxClient, estado) => {
  try {
    const personas = await tx.Persona.findMany({
      include: [
        {
          model: modelsFT.Usuario,
          required: true,
          as: "usuario_usuario",
        },
        {
          model: modelsFT.DocumentoTipo,
          required: true,
          as: "documentotipo_documento_tipo",
        },
        {
          model: modelsFT.Pais,
          required: true,
          as: "paisnacionalidad_pai",
        },
        {
          model: modelsFT.Pais,
          required: true,
          as: "paisnacimiento_pai",
        },
        {
          model: modelsFT.Pais,
          required: true,
          as: "paisresidencia_pai",
        },
        {
          model: modelsFT.Distrito,
          required: true,
          as: "distritoresidencia_distrito",
          include: [
            {
              model: modelsFT.Provincia,
              required: true,
              as: "provincia_provincium",
              include: [
                {
                  model: modelsFT.Departamento,
                  required: true,
                  as: "departamento_departamento",
                },
              ],
            },
          ],
        },
        {
          model: modelsFT.Genero,
          required: true,
          as: "genero_genero",
        },
        {
          model: modelsFT.PersonaVerificacionEstado,
          required: true,
          as: "personaverificacionestado_persona_verificacion_estado",
        },
      ],
      where: {
        estado: {
          in: estado,
        },
      },
    });

    return personas;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPersona = async (tx: TxClient, persona) => {
  try {
    const persona_nuevo = await tx.Persona.create(persona);

    return persona_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePersona = async (tx: TxClient, persona) => {
  try {
    const result = await tx.Persona.update(persona, {
      where: {
        personaid: persona.personaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePersona = async (tx: TxClient, persona) => {
  try {
    const result = await tx.Persona.update(persona, {
      where: {
        personaid: persona.personaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activatePersona = async (tx: TxClient, persona) => {
  try {
    const result = await tx.Persona.update(persona, {
      where: {
        personaid: persona.personaid,
      },
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
