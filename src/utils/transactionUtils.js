import logger, { line } from "#src/utils/logger.js";

/**
 * Realiza un rollback seguro en una transacción si sigue activa.
 * @param {object} transaction - Objeto de transacción de Sequelize.
 * @returns {Promise<void>} Promesa que se resuelve cuando el rollback termina o si no es necesario.
 */
export const safeRollback = async (transaction) => {
  if (transaction && !transaction.finished) {
    try {
      await transaction.rollback();
      logger.debug(line(), "Transacción rollback exitosa");
    } catch (error) {
      logger.error(line(), "Error al intentar rollback:", error);
      throw error; // Relanzar para que el consumidor pueda manejarlo si es necesario
    }
  } else {
    logger.debug(line(), "No se requiere rollback: transacción ya finalizada o no existe");
  }
};
