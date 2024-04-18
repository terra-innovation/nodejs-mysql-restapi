import { Sequelize } from "sequelize";
import * as config from "../../config.js";

const sequelize = new Sequelize(config.DB_FACTORING_DATABASE, config.DB_FACTORING_USER, config.DB_FACTORING_PASSWORD, {
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

async function connect() {
  try {
    await sequelize.authenticate();
    console.info("[Sequelize] Database " + config.DB_FACTORING_DATABASE + ": Successful connection.");
  } catch (error) {
    //console.error("Unable to connect to the database:", error);
    if (error instanceof Error) {
      if (error.parent.code === "ECONNREFUSED") {
        console.error("[Sequelize] Database " + config.DB_FACTORING_DATABASE + ": Connection unavailable.");
      } else {
        console.error("[Sequelize] Database " + config.DB_FACTORING_DATABASE + ": " + error.parent.code);
      }
    } else {
      console.error("[Sequelize] Database " + config.DB_FACTORING_DATABASE + ": " + error.parent.code);
    }
  }
}

connect();

export default sequelize;
