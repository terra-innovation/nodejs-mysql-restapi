import { Sequelize } from "sequelize";
import initModels from "../../models/ft_factoring/init-models.js";
import * as config from "../../config.js";
import logger, { line } from "../../utils/logger.js";

export const sequelizeFT = new Sequelize(config.DB_FACTORING_DATABASE, config.DB_FACTORING_USER, config.DB_FACTORING_PASSWORD, {
  host: config.DB_FACTORING_HOST,
  port: config.DB_FACTORING_PORT,
  dialect: "mysql",
  dialectOptions: {
    supportBigNumbers: true,
    decimalNumbers: true,
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  logging: false,
});

export const modelsFT = initModels(sequelizeFT);

async function connect() {
  try {
    await sequelizeFT.authenticate();
    logger.info(line(), "[Sequelize] Database " + config.DB_FACTORING_DATABASE + ": Successful connection.");
  } catch (error) {
    //logger.error("Unable to connect to the database:", error);
    if (error instanceof Error) {
      if (error.parent.code === "ECONNREFUSED") {
        logger.error(line(), "[Sequelize] Database " + config.DB_FACTORING_DATABASE + ": Connection unavailable.");
      } else {
        logger.error(line(), "[Sequelize] Database " + config.DB_FACTORING_DATABASE + ": " + error.parent.code);
      }
    } else {
      logger.error(line(), "[Sequelize] Database " + config.DB_FACTORING_DATABASE + ": " + error.parent.code);
    }
  }
}

connect();
