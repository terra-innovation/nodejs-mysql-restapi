import express from "express";
import morgan from "morgan";
import cors from "cors";
import * as util from "util";
import * as luxon from "luxon";

import logger, { line, loggerMorgan } from "./utils/logger.js";

import employeesRoutes from "./routes/employees.routes.js";
import indexRoutes from "./routes/index.routes.js";
import facturaRoutes from "./routes/factura.routes.js";
import empresasRoutes from "./routes/empresasRoutes.js";
import colaboradoresRoutes from "./routes/colaboradoresRoutes.js";
import cuentasbancariasRoutes from "./routes/cuentasbancarias.routes.js";
import usuariosRoutes from "./routes/usuarios.routes.js";
import factoringsRoutes from "./routes/factorings.routes.js";
import factoringestadosRoutes from "./routes/factoringestados.routes.js";
import factoringtiposRoutes from "./routes/factoringtipos.routes.js";
import riesgosRoutes from "./routes/riesgos.routes.js";

import empresario_empresacuentabancariaRoutes from "./routes/empresario/empresacuentabancaria.routes.js";
import empresario_contactoRoutes from "./routes/empresario/contacto.routes.js";
import empresario_factoring_facturaRoutes from "./routes/empresario/factoring/factura.routes.js";
import empresario_factoring_empresacuentabancariaRoutes from "./routes/empresario/factoring/empresacuentabancaria.routes.js";
import empresario_factoring_usuarioRoutes from "./routes/empresario/factoring/usuario.routes.js";
import empresario_factoring_factoringRoutes from "./routes/empresario/factoring/factoring.routes.js";
import empresario_factoring_contactoRoutes from "./routes/empresario/factoring/contacto.routes.js";

import admin_zlaboratorioRoutes from "./routes/admin/zlaboratorio.routes.js";
import admin_empresacuentabancariaRoutes from "./routes/admin/empresacuentabancaria.routes.js";
import admin_cuentabancariaestadoRoutes from "./routes/admin/cuentabancariaestado.routes.js";
import admin_empresaRoutes from "./routes/admin/empresa.routes.js";
import admin_facturaRoutes from "./routes/admin/factura.routes.js";
import admin_archivofacturaRoutes from "./routes/admin/archivofactura.routes.js";
import admin_personaRoutes from "./routes/admin/persona.routes.js";
import admin_archivoRoutes from "./routes/admin/archivo.routes.js";
import admin_personaverificacionRoutes from "./routes/admin/personaverificacion.routes.js";
import admin_factorigempresaverificacionRoutes from "./routes/admin/factoringempresaverificacion.routes.js";
import admin_servicio_factoring_factoringRoutes from "./routes/admin/servicio/factoring/factoring.routes.js";
import admin_servicio_factoring_factoringpropuestaRoutes from "./routes/admin/servicio/factoring/factoringpropuesta.routes.js";

import usuario_personaRoutes from "./routes/usuario/persona.routes.js";
import usuario_personapepdirectoRoutes from "./routes/usuario/personapepdirecto.routes.js";
import usuario_personapepindirectoRoutes from "./routes/usuario/personapepindirecto.routes.js";
import usuario_usuarioservicioRoutes from "./routes/usuario/usuarioservicio.routes.js";

import secureRoutes from "./routes/secure/secure.routes.js";
import { customResponseError } from "./utils/CustomResponseError.js";
import { ValidationError } from "yup";
import { sequelizeFT } from "./config/bd/sequelize_db_factoring.js";
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

// Define un formato personalizado para Morgan
const customFormat = ":iduser | :remote-addr | :remote-user | :dateCustom | :method :url HTTP/:http-version | :status | :res[content-length] | :referrer | :user-agent";
// Middleware
// Configurar Morgan para usar Winston
morgan.token("iduser", (req, res) => req.session_user?.usuario?._idusuario);
morgan.token("dateCustom", () => luxon.DateTime.utc().toISO()); // Agrega un token para el código de estado
app.use(
  morgan(customFormat, {
    stream: {
      write: (message) => loggerMorgan.info(message.trim()), // Usar el logger de Winston
    },
  })
);

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

app.use("/api/v1", empresario_empresacuentabancariaRoutes);
app.use("/api/v1", empresario_contactoRoutes);
app.use("/api/v1", empresario_factoring_facturaRoutes);
app.use("/api/v1", empresario_factoring_empresacuentabancariaRoutes);
app.use("/api/v1", empresario_factoring_usuarioRoutes);
app.use("/api/v1", empresario_factoring_factoringRoutes);
app.use("/api/v1", empresario_factoring_contactoRoutes);

app.use("/api/v1", admin_zlaboratorioRoutes);
app.use("/api/v1", admin_empresacuentabancariaRoutes);
app.use("/api/v1", admin_cuentabancariaestadoRoutes);
app.use("/api/v1", admin_empresaRoutes);
app.use("/api/v1", admin_facturaRoutes);
app.use("/api/v1", admin_archivofacturaRoutes);
app.use("/api/v1", admin_personaRoutes);
app.use("/api/v1", admin_archivoRoutes);
app.use("/api/v1", admin_personaverificacionRoutes);
app.use("/api/v1", admin_factorigempresaverificacionRoutes);
app.use("/api/v1", admin_servicio_factoring_factoringRoutes);
app.use("/api/v1", admin_servicio_factoring_factoringpropuestaRoutes);

app.use("/api/v1", usuario_personaRoutes);
app.use("/api/v1", usuario_personapepdirectoRoutes);
app.use("/api/v1", usuario_personapepindirectoRoutes);
app.use("/api/v1", usuario_usuarioservicioRoutes);

app.use("/api/v1", secureRoutes);

// Para cuando no existe la ruta
app.use((req, res, next) => {
  res.status(404).json({ error: true, message: "Not found" });
});

// Para conexión de BBDD sequelizer
app.locals.sequelize = sequelizeFT;
app.locals.models = initModels(sequelizeFT);

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
    logger.error(line(), "ValidationError:", util.inspect(mensajeError, { colors: true, depth: null }));
  } else if (statusCode == undefined) {
    logger.error(line(), util.inspect(err, { colors: true, depth: null }));
    statusCode = 500;
    message = "Ocurrio un error";
  }
  //logger.error(line(),util.inspect(err, { colors: true, depth: null }));

  customResponseError(res, statusCode, message);
});

export default app;
