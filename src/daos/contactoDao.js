import { Sequelize } from "sequelize";
import { modelsFT } from "#src/config/bd/sequelize_db_factoring.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { formatError } from "#src/utils/errorUtils.js";
import logger, { line } from "#src/utils/logger.js";

export const getContactosByIdempresaAndEmail = async (transaction, _idempresa, email, estados) => {
  try {
    const contactos = await modelsFT.Contacto.findAll({
      include: [
        {
          model: modelsFT.Empresa,
          as: "empresa_empresa",
          estado: {
            [Sequelize.Op.in]: estados,
          },
        },
      ],
      where: {
        _idempresa: _idempresa,
        email: email,
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),contactos);
    return contactos;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getContactosByIdempresas = async (transaction, _idempresas, estados) => {
  try {
    const contactos = await modelsFT.Contacto.findAll({
      include: [
        {
          model: modelsFT.Empresa,
          as: "empresa_empresa",
          estado: {
            [Sequelize.Op.in]: estados,
          },
        },
      ],
      where: {
        _idempresa: {
          [Sequelize.Op.in]: _idempresas,
        },
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),contactos);
    return contactos;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getContactos = async (transaction, estados) => {
  try {
    const contactos = await modelsFT.Contacto.findAll({
      where: {
        estado: {
          [Sequelize.Op.in]: estados,
        },
      },
      transaction,
    });
    //logger.info(line(),contactos);
    return contactos;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getContactoByIdcontacto = async (transaction, idcontacto) => {
  try {
    const contacto = await modelsFT.Contacto.findByPk(idcontacto, { transaction });
    logger.info(line(), contacto);

    //const contactos = await contacto.getContactos();
    //logger.info(line(),contactos);

    return contacto;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const getContactoByContactoid = async (transaction, contactoid) => {
  try {
    const contacto = await modelsFT.Contacto.findOne({
      where: {
        contactoid: contactoid,
      },
      transaction,
    });
    //logger.info(line(),contacto);
    return contacto;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const findContactoPk = async (transaction, contactoid) => {
  try {
    const contacto = await modelsFT.Contacto.findOne({
      attributes: ["_idcontacto"],
      where: {
        contactoid: contactoid,
      },
      transaction,
    });
    //logger.info(line(),contacto);
    return contacto;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const insertContacto = async (transaction, contacto) => {
  try {
    const contacto_nuevo = await modelsFT.Contacto.create(contacto, { transaction });
    // logger.info(line(),contacto_nuevo);
    return contacto_nuevo;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const updateContacto = async (transaction, contacto) => {
  try {
    const result = await modelsFT.Contacto.update(contacto, {
      where: {
        contactoid: contacto.contactoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};

export const deleteContacto = async (transaction, contacto) => {
  try {
    const result = await modelsFT.Contacto.update(contacto, {
      where: {
        contactoid: contacto.contactoid,
      },
      transaction,
    });
    return result;
  } catch (error) {
    logger.error(line(), formatError(error));
    throw new ClientError("Ocurrio un error", 500);
  }
};
