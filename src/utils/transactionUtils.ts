import { log, line } from "#src/utils/logger.pino.js";

/**
 * Realiza un rollback seguro en una transacción si sigue activa.
 * @param {object} transaction - Objeto de transacción de Sequelize.
 * @returns {Promise<void>} Promesa que se resuelve cuando el rollback termina o si no es necesario.
 */
export const safeRollback = async (transaction) => {
  if (transaction && !transaction.finished) {
    try {
      await transaction.rollback();
      log.debug(line(), "Transacción rollback exitosa");
    } catch (error) {
      log.error(line(), "Error al intentar rollback:", error);
      throw error; // Relanzar para que el consumidor pueda manejarlo si es necesario
    }
  } else {
    log.debug(line(), "No se requiere rollback: transacción ya finalizada o no existe");
  }
};
