import express from "express";
import morgan from "morgan";
import cors from "cors";
import * as util from "util";

import employeesRoutes from "./routes/employees.routes.js";
import indexRoutes from "./routes/index.routes.js";
import sunatTrabajadoresRoutes from "./routes/sunat.trabajadores.routes.js";
import empresasRoutes from "./routes/empresasRoutes.js";

import secureRoutes from "./routes/secure.routes.js";
import { resError } from "./utils/resError.js";
import { ValidationError } from "yup";
import sequelize from "./config/bd/sequelize_db_factoring.js";
import initModels from "./models/ft_factoring/init-models.js";

const app = express();

// Configuración de CORS
app.use(
  cors({
    origin: "*",
  })
);

//throw Error("Hubo un error X");

// Define un formato personalizado (opcional)
const customFormat = ":remote-addr [:date] :method :url :status :res[content-length] - :response-time ms";

// Middleware
app.use(morgan(customFormat));
app.use(express.json()); // Convierte los request a json

// Routes
app.use("/", indexRoutes);
app.use("/api", employeesRoutes);
app.use("/api/sunat", sunatTrabajadoresRoutes);
app.use("/api/v1", empresasRoutes);
app.use("/secure", secureRoutes);

// Para cuando no existe la ruta
app.use((req, res, next) => {
  res.status(404).json({ error: true, message: "Not found" });
});

// Para conexión de BBDD sequelizer
app.locals.sequelize = sequelize;
app.locals.models = initModels(sequelize);

// Establecemos una respuesta estandar para los errores
app.use((err, req, res, next) => {
  var { statusCode, message } = err;
  if (err instanceof ValidationError) {
    statusCode = 400;
    message = "Datos no válidos";
    const mensajeError = err.inner.map((dato) => {
      return {
        message: dato.message,
        originalValue: dato.value,
        path: dato.path,
      };
    });
    console.error("ValidationError:", mensajeError);
  } else if (statusCode == undefined) {
    statusCode = 500;
    message = "Ocurrio un error";
  } else {
    console.error(util.inspect(err, { colors: true, depth: null }));
  }

  resError(res, statusCode, message);
});

export default app;
