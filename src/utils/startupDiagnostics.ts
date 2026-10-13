import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import type { Server } from "node:http";

const knownCodes: Record<string, string> = {
  CONFIG_INVALID: "configuracion_invalida",
  CONFIG_FILE: "archivo_configuracion",
  ERR_MODULE_NOT_FOUND: "dependencia_ausente",
  MODULE_NOT_FOUND: "dependencia_ausente",
  EADDRINUSE: "puerto_ocupado",
  EACCES: "permiso_denegado",
  ECONNREFUSED: "conexion_rechazada",
  ETIMEDOUT: "tiempo_agotado",
  ENOTFOUND: "destino_no_resuelto",
  P1000: "autenticacion_base",
  P1001: "conexion_base",
  ER_ACCESS_DENIED_ERROR: "autenticacion_base",
  STARTUP_TIMEOUT: "tiempo_arranque_agotado",
};

/** Only allowlisted codes leave this boundary; error messages can contain secrets. */
export function startupFailure(error: unknown): { category: string; code: string } {
  let current = error;
  for (let depth = 0; depth < 5 && current && typeof current === "object"; depth++) {
    const candidate = current as { code?: unknown; cause?: unknown };
    if (typeof candidate.code === "string" && Object.hasOwn(knownCodes, candidate.code)) {
      return { category: knownCodes[candidate.code], code: candidate.code };
    }
    current = candidate.cause;
  }
  return { category: "error_no_clasificado", code: "UNKNOWN" };
}

export function createStartupDiagnostics(report: (message: string) => void = console.info, reportError: (message: string) => void = report) {
  const bootId = randomUUID();
  const start = performance.now();
  let currentStage = "inicio";
  function emit(event: string, details: Record<string, unknown> = {}, writer = report) {
    writer(`[arranque] ${JSON.stringify({ fecha: new Date().toISOString(), bootId, pid: process.pid, etapa: currentStage, evento: event, duracionMs: Math.round(performance.now() - start), ...details })}`);
  }
  return {
    emit,
    async stage<T>(name: string, action: () => Promise<T>): Promise<T> {
      currentStage = name;
      emit("iniciando");
      const stageStart = performance.now();
      const result = await action();
      emit("completada", { duracionEtapaMs: Math.round(performance.now() - stageStart) });
      return result;
    },
    fail(error: unknown) {
      emit("fallo", startupFailure(error), reportError);
    },
  };
}

export function waitForListening(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    const failed = (error: Error) => {
      server.removeListener("listening", ready);
      reject(error);
    };
    const ready = () => {
      server.removeListener("error", failed);
      resolve();
    };
    server.once("error", failed);
    server.once("listening", ready);
  });
}

export function startStartupDeadline(timeoutMs: number, fail: (error: { code: string }) => void): () => void {
  const timer = setTimeout(() => fail({ code: "STARTUP_TIMEOUT" }), timeoutMs);
  return () => clearTimeout(timer);
}
