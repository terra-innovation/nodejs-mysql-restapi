import express from "express";

import { blockSuspiciousUAMiddleware } from "#src/middlewares/blockSuspiciousUAMiddleware";
import { corsMiddleware } from "#src/middlewares/corsMiddleware";
import { errorHandlerMiddleware } from "#src/middlewares/errorHandlerMiddleware";
import { helmetMiddleware } from "#src/middlewares/helmetMiddleware";
import { ipFilterMiddleware } from "#src/middlewares/ipFilterMiddleware.js";
import { loggerMiddleware } from "#src/middlewares/loggerMiddleware.js";
import { notFoundHandlerMiddleware } from "#src/middlewares/notFoundHandlerMiddleware";
import { rateLimiterGlobalMiddleware } from "#src/middlewares/ratelimiterMiddleware";

import adminRoutes from "#root/src/routes/admin/index.js";
import empresarioRoutes from "#root/src/routes/empresario/index.js";
import indexRoutes from "#root/src/routes/index.routes.js";
import inversionistaRoutes from "#root/src/routes/inversionista/index.js";
import secureRoutes from "#root/src/routes/secure/index.js";
import usuarioRoutes from "#root/src/routes/usuario/index.js";

const app = express();

app.set("trust proxy", "::1"); // Para obtener la IP del proxy inverso local X-Real-IP
app.set("trust proxy", "127.0.0.1"); // Para obtener la IP del proxy inverso local X-Real-IP
app.use(express.json()); // Convierte los request a json
app.use(ipFilterMiddleware); // Restringue el acceso por IP
app.use(rateLimiterGlobalMiddleware); // Limita la cantidad de solicitudes global en un tiempo establecido
app.use(blockSuspiciousUAMiddleware); //Bloquea User-Agents sospechosos
app.use(corsMiddleware); // Middleware Cors
app.use(loggerMiddleware); // Middleware Logger PINO
app.use(helmetMiddleware); // Middleware Helmet. Seguridad para Express que configura encabezados HTTP

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
