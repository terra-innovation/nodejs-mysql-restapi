import express from "express";
import { log, line } from "#src/utils/logger.pino.js";

import { ipFilterMiddleware } from "#src/middlewares/ipFilterMiddleware.js";
import { loggerMiddleware } from "#src/middlewares/loggerMiddleware.js";
import { corsMiddleware } from "#src/middlewares/corsMiddleware";
import { errorHandlerMiddleware } from "#src/middlewares/errorHandlerMiddleware";
import { notFoundHandlerMiddleware } from "#src/middlewares/notFoundHandlerMiddleware";

import indexRoutes from "#src/routes/index.prisma.routes.js";
import adminRoutes from "#src/routes/admin/index.prisma.js";
import empresarioRoutes from "#src/routes/empresario/index.prisma.js";
import inversionistaRoutes from "#src/routes/inversionista/index.prisma.js";
import usuarioRoutes from "#src/routes/usuario/index.prisma.js";
import secureRoutes from "#src/routes/secure/index.prisma.js";

const app = express();

app.set("trust proxy", "::1"); // Para obtener la IP del proxy inverso local X-Real-IP
app.set("trust proxy", "127.0.0.1"); // Para obtener la IP del proxy inverso local X-Real-IP
app.use(express.json()); // Convierte los request a json
app.use(ipFilterMiddleware); // Restringue el acceso por IP
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

app.use(errorHandlerMiddleware); // Middleware de manejo de errores global de Express

export default app;
