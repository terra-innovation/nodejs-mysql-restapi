import { config } from "dotenv";
import { basename, resolve } from "node:path";

export type EnvironmentSource = {
  selection: "explicit" | "default" | "process.env";
  file: string | null;
  loaded: boolean;
  fileVariables: number;
  retainedVariables: number;
  conflictingKeys: string[];
};

/** Loads configuration without logging values or replacing injected variables. */
export function loadEnvironment({
  processEnv = process.env,
  cwd = process.cwd(),
  report = (message: string) => console.info(message),
}: {
  processEnv?: NodeJS.ProcessEnv;
  cwd?: string;
  report?: (message: string) => void;
} = {}): EnvironmentSource {
  const explicitFile = processEnv.APP_ENV_FILE;
  if (!processEnv.NODE_ENV) {
    report(explicitFile ? "[config] No se encontró NODE_ENV en el proceso. APP_ENV_FILE selecciona el archivo; este deberá definir un NODE_ENV válido." : "[config] No se encontró NODE_ENV en el proceso. Por defecto se usa development para seleccionar .env.development; el archivo deberá definir un NODE_ENV válido.");
  }
  const filename = explicitFile || (processEnv.NODE_ENV === "production" ? null : `.env.${processEnv.NODE_ENV || "development"}`);
  const source: EnvironmentSource = {
    selection: explicitFile ? "explicit" : filename ? "default" : "process.env",
    file: filename ? basename(filename) : null,
    loaded: false,
    fileVariables: 0,
    retainedVariables: 0,
    conflictingKeys: [],
  };

  if (filename) {
    const inherited = { ...processEnv };
    const result = config({ path: resolve(cwd, filename), processEnv, override: false, quiet: true });
    if (result.error && explicitFile) {
      report(`[config] ${JSON.stringify(source)}`);
      // The error only identifies the selected filename, never its contents.
      throw Object.assign(new Error("No se pudo leer el archivo de configuración seleccionado."), { code: "CONFIG_FILE" });
    }
    source.loaded = !result.error;
    if (result.error) report("[config] No se pudo cargar el archivo predeterminado. Se validarán exclusivamente las variables disponibles en el proceso; no se cargará .env.example.");
    const entries = Object.entries(result.parsed || {});
    source.fileVariables = entries.length;
    source.retainedVariables = entries.filter(([key]) => inherited[key] !== undefined).length;
    source.conflictingKeys = entries
      .filter(([key, value]) => inherited[key] !== undefined && inherited[key] !== value)
      .map(([key]) => key)
      .sort();
  }

  report(`[config] ${JSON.stringify(source)} precedence=process.env`);
  if (source.conflictingKeys.length) report("[config] Las claves en conflictingKeys tienen valores diferentes en el proceso y en el archivo. Prevalece el proceso (incluido el entorno heredado de PM2). Solo se muestran los nombres.");
  return source;
}
