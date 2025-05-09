import { Sequelize, Op } from "sequelize";
import { initModels } from "#src/models/ft_factoring/init-models.js";
import { env } from "#src/config.js";
import { log, line } from "#src/utils/logger.pino.js";

import { SequelizeError } from "#src/config/bd/sequelize_db_factoring.types.js";

export const sequelizeFT = new Sequelize(env.DB_FACTORING_DATABASE, env.DB_FACTORING_USER, env.DB_FACTORING_PASSWORD, {
  host: env.DB_FACTORING_HOST,
  port: Number(env.DB_FACTORING_PORT),
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
    log.info(line(), "[Sequelize] Database " + env.DB_FACTORING_DATABASE + ": Successful connection.");
  } catch (error) {
    //logger.error("Unable to connect to the database:", error);
    if (error instanceof Error) {
      const sequelizeError = error as SequelizeError;
      if (sequelizeError.parent?.code === "ECONNREFUSED") {
        log.error(line(), "[Sequelize] Database " + env.DB_FACTORING_DATABASE + ": Connection unavailable.");
      } else {
        log.error(line(), "[Sequelize] Database " + env.DB_FACTORING_DATABASE + ": " + (sequelizeError.parent?.code || "Unknown error"));
      }
    } else {
      log.error(line(), "[Sequelize] Database " + env.DB_FACTORING_DATABASE + ": " + error.parent.code);
    }
  }
}

connect();
