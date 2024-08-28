import express from "express";
import morgan from "morgan";
import cors from "cors";
import * as util from "util";

import employeesRoutes from "./routes/employees.routes.js";
import indexRoutes from "./routes/index.routes.js";
import facturaRoutes from "./routes/factura.routes.js";
import empresasRoutes from "./routes/empresasRoutes.js";
import colaboradoresRoutes from "./routes/colaboradoresRoutes.js";
import cuentasbancariasRoutes from "./routes/cuentasbancarias.routes.js";
import empresario_cuentasbancariasRoutes from "./routes/empresario/cuentasbancarias.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import factoringsRoutes from "./routes/factorings.routes.js";
import factoringestadosRoutes from "./routes/factoringestados.routes.js";
import factoringtiposRoutes from "./routes/factoringtipos.routes.js";
import riesgosRoutes from "./routes/riesgos.routes.js";

import admin_cuentasbancariasRoutes from "./routes/admin/cuentasbancarias.routes.js";

import secureRoutes from "./routes/secure.routes.js";
import { customResponseError } from "./utils/CustomResponseError.js";
import { ValidationError } from "yup";
import sequelize from "./config/bd/sequelize_db_factoring.js";
import initModels from "./models/ft_factoring/init-models.js";

import usuario_menuRoutes from "./routes/usuario/menu.routes.js";

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
app.use("/api/v1", usuario_menuRoutes);
app.use("/api/v1", facturaRoutes);
app.use("/api/v1", empresasRoutes);
app.use("/api/v1", colaboradoresRoutes);
app.use("/api/v1", cuentasbancariasRoutes);
app.use("/api/v1", usuariosRoutes);
app.use("/api/v1", factoringsRoutes);
app.use("/api/v1", factoringestadosRoutes);
app.use("/api/v1", factoringtiposRoutes);
app.use("/api/v1", riesgosRoutes);
app.use("/api/v1", empresario_cuentasbancariasRoutes);
app.use("/api/v1", admin_cuentasbancariasRoutes);
app.use("/secure", secureRoutes);

// Para cuando no existe la ruta
app.use((req, res, next) => {
  res.status(404).json({ error: true, message: "Not found" });
});

// Para conexión de BBDD sequelizer
app.locals.sequelize = sequelize;
app.locals.models = initModels(sequelize);

// Middleware de manejo de errores global
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
  }
  console.error(util.inspect(err, { colors: true, depth: null }));

  customResponseError(res, statusCode, message);
});

export default app;
