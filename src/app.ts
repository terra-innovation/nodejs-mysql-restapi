import express from "express";
import { log, line } from "#src/utils/logger.pino.js";

import { loggerMiddleware } from "#src/middlewares/loggerMiddleware.js";
import { corsMiddleware } from "#src/middlewares/corsMiddleware";
import { errorHandlerMiddleware } from "#src/middlewares/errorHandlerMiddleware";
import { notFoundHandlerMiddleware } from "#src/middlewares/notFoundHandlerMiddleware";

import indexRoutes from "#src/routes/index.routes.js";
import adminRoutes from "#src/routes/admin/index.prisma.js";
import empresarioRoutes from "#src/routes/empresario/index.js";
import inversionistaRoutes from "#src/routes/empresario/index.js";
import usuarioRoutes from "#src/routes/empresario/index.js";
import secureRoutes from "#src/routes/secure/index.js";

import { sequelizeFT } from "#src/config/bd/sequelize_db_factoring.js";

//import { initModels } from "#src/models/ft_factoring/init-models.js";

const app = express();

app.use(express.json()); // Convierte los request a json
app.use(corsMiddleware); // Middleware Cors
app.use(loggerMiddleware); // Middleware Logger PINO

// Routes
app.use("/", indexRoutes);
app.use("/api/v1", adminRoutes);
app.use("/api/v1", empresarioRoutes);
app.use("/api/v1", inversionistaRoutes);
app.use("/api/v1", usuarioRoutes);
app.use("/api/v1", secureRoutes);

app.use(notFoundHandlerMiddleware); // Para cuando no existe la ruta

// Para conexión de BBDD sequelizer
app.locals.sequelize = sequelizeFT;
//app.locals.models = initModels(sequelizeFT);

app.use(errorHandlerMiddleware); // Middleware de manejo de errores global de Express

export default app;
