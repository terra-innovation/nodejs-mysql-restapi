import { createStartupDiagnostics, startStartupDeadline, waitForListening } from "#src/utils/startupDiagnostics.js";
import metadata from "#root/package.json" with { type: "json" };
import type { Server } from "node:http";

const startup = createStartupDiagnostics(console.info, console.error);
const timeoutMs = 120_000;
let server: Server | undefined;
function failStartup(error: unknown): never {
  startup.fail(error);
  server?.close();
  process.exit(1);
}
process.on("uncaughtException", failStartup);
process.on("unhandledRejection", failStartup);
const cancelDeadline = startStartupDeadline(timeoutMs, failStartup);

async function startServer(): Promise<void> {
  try {
    startup.emit("iniciando", { version: metadata.version, node: process.version, plataforma: process.platform, arquitectura: process.arch, timeoutMs });
    const { env, environmentSource } = await startup.stage("configuracion", () => import("#src/config.js"));
    startup.emit("configuracion_validada", { entorno: env.NODE_ENV, instancia: env.APP_STAGE ?? env.NODE_ENV, archivo: environmentSource.file, origen: environmentSource.selection });
    const { app, prismaFT, shutdownHandler, log, line } = await startup.stage("dependencias", async () => {
      const { default: app } = await import("#src/app.js");
      const { prismaFT } = await import("#src/models/prisma/db-factoring.js");
      const { shutdownHandler } = await import("#src/utils/shutdownHandler.js");
      const { log, line } = await import("#src/utils/logger.pino.js");
      await import("#src/utils/ipAccessControl.js");
      return { app, prismaFT, shutdownHandler, log, line };
    });
    await startup.stage("base_de_datos", () => prismaFT.validateDatabaseConnection({ retries: 5, baseDelayMs: 500 }));
    await startup.stage("servidor_http", () => {
      server = app.listen(env.PORT);
      return waitForListening(server);
    });
    shutdownHandler.registerShutdownHooks();
    await import("#src/utils/globalErrorHandlers.js");
    process.removeListener("uncaughtException", failStartup);
    process.removeListener("unhandledRejection", failStartup);
    cancelDeadline();
    log.info(line(), `Server running at ${env.WEB_SITE}:${env.PORT}`);
    if (process.send) process.send("ready");
    startup.emit("listo", { puerto: env.PORT, mensaje: "Base validada y servidor escuchando. Listo para recibir peticiones." });
  } catch (error) {
    cancelDeadline();
    failStartup(error);
  }
}
void startServer();
