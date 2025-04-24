import express from "express";
import morgan from "morgan";
import cors from "cors";
import * as util from "util";
import * as luxon from "luxon";

import logger, { line, loggerMorgan } from "#src/utils/logger.js";

import employeesRoutes from "#src/routes/employees.routes.js";
import indexRoutes from "#src/routes/index.routes.js";
import facturaRoutes from "#src/routes/factura.routes.js";
import empresasRoutes from "#src/routes/empresasRoutes.js";
import colaboradoresRoutes from "#src/routes/colaboradoresRoutes.js";
import cuentasbancariasRoutes from "#src/routes/cuentasbancarias.routes.js";
import usuariosRoutes from "#src/routes/usuarios.routes.js";
import factoringsRoutes from "#src/routes/factorings.routes.js";
import factoringestadosRoutes from "#src/routes/factoringestados.routes.js";
import factoringtiposRoutes from "#src/routes/factoringtipos.routes.js";
import riesgosRoutes from "#src/routes/riesgos.routes.js";

import empresario_empresacuentabancariaRoutes from "#src/routes/empresario/empresacuentabancaria.routes.js";
import empresario_contactoRoutes from "#src/routes/empresario/contacto.routes.js";
import empresario_factoring_facturaRoutes from "#src/routes/empresario/factoring/factura.routes.js";
import empresario_factoring_empresacuentabancariaRoutes from "#src/routes/empresario/factoring/empresacuentabancaria.routes.js";
import empresario_factoring_usuarioRoutes from "#src/routes/empresario/factoring/usuario.routes.js";
import empresario_factoring_factoringRoutes from "#src/routes/empresario/factoring/factoring.routes.js";
import empresario_factoring_contactoRoutes from "#src/routes/empresario/factoring/contacto.routes.js";

import admin_zlaboratorioRoutes from "#src/routes/admin/zlaboratorio.routes.js";
import admin_empresacuentabancariaRoutes from "#src/routes/admin/empresacuentabancaria.routes.js";
import admin_inversionistacuentabancariaRoutes from "#src/routes/admin/inversionistacuentabancaria.routes.js";
import admin_cuentabancariaestadoRoutes from "#src/routes/admin/cuentabancariaestado.routes.js";
import admin_empresaRoutes from "#src/routes/admin/empresa.routes.js";
import admin_facturaRoutes from "#src/routes/admin/factura.routes.js";
import admin_archivofacturaRoutes from "#src/routes/admin/archivofactura.routes.js";
import admin_personaRoutes from "#src/routes/admin/persona.routes.js";
import admin_archivoRoutes from "#src/routes/admin/archivo.routes.js";
import admin_personaverificacionRoutes from "#src/routes/admin/personaverificacion.routes.js";
import admin_factorigempresaverificacionRoutes from "#src/routes/admin/factoringempresaverificacion.routes.js";
import admin_servicio_factoring_factoringRoutes from "#src/routes/admin/servicio/factoring/factoring.routes.js";
import admin_servicio_factoring_factoringpropuestaRoutes from "#src/routes/admin/servicio/factoring/factoringpropuesta.routes.js";
import admin_servicio_factoring_factoringhistorialestadoRoutes from "#src/routes/admin/servicio/factoring/factoringhistorialestado.routes.js";

import usuario_personaRoutes from "#src/routes/usuario/persona.routes.js";
import usuario_personapepdirectoRoutes from "#src/routes/usuario/personapepdirecto.routes.js";
import usuario_personapepindirectoRoutes from "#src/routes/usuario/personapepindirecto.routes.js";
import usuario_usuarioservicioRoutes from "#src/routes/usuario/usuarioservicio.routes.js";

import secureRoutes from "#src/routes/secure/secure.routes.js";
import { customResponseError } from "#src/utils/CustomResponseError.js";
import { ValidationError } from "yup";
import { sequelizeFT } from "#src/config/bd/sequelize_db_factoring.js";
import initModels from "#src/models/ft_factoring/init-models.js";

import usuario_menuRoutes from "#src/routes/usuario/menu.routes.js";

const app = express();

// Configuración de CORS
app.use(
  cors({
    origin: "*",
    exposedHeaders: ["Content-Disposition"],
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
app.use("/api/v1", admin_inversionistacuentabancariaRoutes);
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
app.use("/api/v1", admin_servicio_factoring_factoringhistorialestadoRoutes);

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
