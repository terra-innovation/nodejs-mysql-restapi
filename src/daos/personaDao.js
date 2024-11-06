import { Sequelize } from "sequelize";
import { ClientError } from "../utils/CustomErrors.js";

export const getPersonaByIdusuario = async (req, idusuario) => {
  try {
    const { models } = req.app.locals;
    const persona = await models.Persona.findOne({
      include: [],
      where: {
        _idusuario: idusuario,
      },
    });
    return persona;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaByIdpersona = async (req, idpersona) => {
  try {
    const { models } = req.app.locals;

    const persona = await models.Persona.findByPk(idpersona, {});
    console.log(persona);

    //const personas = await persona.getPersonas();
    //console.log(personas);

    return persona;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonaByPersonaid = async (req, personaid) => {
  try {
    const { models } = req.app.locals;
    const persona = await models.Persona.findOne({
      include: [],
      where: {
        personaid: personaid,
      },
    });
    console.log(persona);
    return persona;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findPersonaPk = async (req, personaid) => {
  try {
    const { models } = req.app.locals;
    const persona = await models.Persona.findOne({
      attributes: ["_idpersona"],
      where: {
        personaid: personaid,
      },
    });
    //console.log(persona);
    return persona;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getPersonas = async (req, estado) => {
  try {
    const { models } = req.app.locals;
    const personas = await models.Persona.findAll({
      include: [
        {
          model: models.Empresa,
          required: true,
          as: "empresa_empresa",
        },
        {
          model: models.Banco,
          required: true,
          as: "banco_banco",
        },
        {
          model: models.Moneda,
          required: true,
          as: "moneda_moneda",
        },
        {
          model: models.CuentaTipo,
          required: true,
          as: "cuentatipo_cuenta_tipo",
        },
        {
          model: models.PersonaEstado,
          required: true,
          as: "personaestado_cuenta_bancaria_estado",
        },
      ],
      where: {
        estado: {
          [Sequelize.Op.in]: estado,
        },
      },
    });
    //console.log(personas);
    return personas;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertPersona = async (req, persona) => {
  try {
    const { models } = req.app.locals;
    const persona_nuevo = await models.Persona.create(persona);
    // console.log(persona_nuevo);
    return persona_nuevo;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updatePersona = async (req, persona) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Persona.update(persona, {
      where: {
        personaid: persona.personaid,
      },
    });
    return result;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deletePersona = async (req, persona) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Persona.update(persona, {
      where: {
        personaid: persona.personaid,
      },
    });
    return result;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const activatePersona = async (req, persona) => {
  try {
    const { models } = req.app.locals;
    const result = await models.Persona.update(persona, {
      where: {
        personaid: persona.personaid,
      },
    });
    return result;
  } catch (error) {
    console.error(error);
    throw new ClientError("Ocurrio un error", 500);
  }
};
