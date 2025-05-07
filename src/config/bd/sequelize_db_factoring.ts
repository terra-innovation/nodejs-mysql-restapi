import { Sequelize, Op } from "sequelize";
import { initModels } from "#src/models/ft_factoring/init-models.js";
import * as config from "#src/config.js";
import logger, { line, log } from "#src/utils/logger.js";

import { SequelizeError } from "#src/config/bd/sequelize_db_factoring.types.js";

export const sequelizeFT = new Sequelize(config.DB_FACTORING_DATABASE, config.DB_FACTORING_USER, config.DB_FACTORING_PASSWORD, {
  host: config.DB_FACTORING_HOST,
  port: Number(config.DB_FACTORING_PORT),
  dialect: "mariadb",
  timezone: "America/Lima",
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
    log.info(line(), "[Sequelize] Database " + config.DB_FACTORING_DATABASE + ": Successful connection.");
  } catch (error) {
    //logger.error("Unable to connect to the database:", error);
    if (error instanceof Error) {
      const sequelizeError = error as SequelizeError;
      if (sequelizeError.parent?.code === "ECONNREFUSED") {
        log.error(line(), "[Sequelize] Database " + config.DB_FACTORING_DATABASE + ": Connection unavailable.");
      } else {
        log.error(line(), "[Sequelize] Database " + config.DB_FACTORING_DATABASE + ": " + (sequelizeError.parent?.code || "Unknown error"));
      }
    } else {
      log.error(line(), "[Sequelize] Database " + config.DB_FACTORING_DATABASE + ": " + error.parent.code);
    }
  }
}

connect();
