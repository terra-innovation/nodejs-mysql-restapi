import { Sequelize, Op } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line, log } from "#src/utils/logger.js";

export const getPersonasByVerificacion = async (transaction, estado, idarchivotipo) => {
  try {
    const personas = await modelsFT.Persona.findAll({
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
            _idarchivotipo: {
              [Op.in]: idarchivotipo,
            },
          },
        },
      ],
      where: {
        estado: {
          [Op.in]: estado,
        },
      },
      transaction,
    });

    return personas;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaByIdusuario = async (transaction, idusuario) => {
  try {
    const persona = await modelsFT.Persona.findOne({
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
        _idusuario: idusuario,
      },
      transaction,
    });
    return persona;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaByIdpersona = async (transaction, idpersona) => {
  try {
    const persona = await modelsFT.Persona.findByPk(idpersona, {
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
      transaction,
    });

    return persona;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaByPersonaid = async (transaction, personaid) => {
  try {
    const persona = await modelsFT.Persona.findOne({
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
      transaction,
    });
    //log.debug(line(), persona);
    return persona;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPersonaPk = async (transaction, personaid) => {
  try {
    const persona = await modelsFT.Persona.findOne({
      attributes: ["_idpersona"],
      where: {
        personaid: personaid,
      },
      transaction,
    });

    return persona;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonas = async (transaction, estado) => {
  try {
    const personas = await modelsFT.Persona.findAll({
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
          [Op.in]: estado,
        },
      },
      transaction,
    });

    return personas;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPersona = async (transaction, persona) => {
  try {
    const persona_nuevo = await modelsFT.Persona.create(persona, { transaction });

    return persona_nuevo;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePersona = async (transaction, persona) => {
  try {
    const result = await modelsFT.Persona.update(persona, {
      where: {
        personaid: persona.personaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePersona = async (transaction, persona) => {
  try {
    const result = await modelsFT.Persona.update(persona, {
      where: {
        personaid: persona.personaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activatePersona = async (transaction, persona) => {
  try {
    const result = await modelsFT.Persona.update(persona, {
      where: {
        personaid: persona.personaid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    log.error(line(), "", formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
