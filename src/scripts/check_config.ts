import { startupFailure } from "#src/utils/startupDiagnostics.js";
// A configuration preflight must not import app, Prisma, services or providers.
const requestedProfile = process.argv[2];
if (requestedProfile && !["development", "production", "test"].includes(requestedProfile)) {
  console.error("Usage: check_config [development|production|test]");
  process.exit(1);
}
if (requestedProfile) {
  process.env.NODE_ENV = requestedProfile;
  process.env.APP_ENV_FILE ||= requestedProfile === "production" ? ".env" : `.env.${requestedProfile}`;
}

try {
  const { env, environmentSource } = await import("#src/config.js");
  console.info(`[config] validation=passed environment=${env.NODE_ENV} file=${JSON.stringify(environmentSource.file)} database=not-connected`);
  console.info(`[config] Instancia: ${env.APP_STAGE ?? env.NODE_ENV}. APP_STAGE es una etiqueta de diagnóstico; no cambia NODE_ENV.`);
  console.info("[config] Configuración válida. No se inició la API ni se abrió conexión a la base de datos.");
} catch (error) {
  console.error(`[config] ${JSON.stringify(startupFailure(error))}`);
  console.error("[config] Comprobación fallida. Revise los nombres de variables y el archivo seleccionado en los mensajes anteriores.");
  process.exitCode = 1;
}

export {};
