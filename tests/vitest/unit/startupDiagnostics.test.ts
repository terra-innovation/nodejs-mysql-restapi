import { describe, expect, it, vi } from "vitest";
import { createServer } from "node:http";
import { createStartupDiagnostics, startStartupDeadline, startupFailure, waitForListening } from "../../../src/utils/startupDiagnostics.js";

describe("diagnóstico de arranque", () => {
  it("limita la espera de arranque y cancela el límite al finalizar", () => {
    vi.useFakeTimers();
    try {
      const fail = vi.fn();
      startStartupDeadline(120000, fail);
      vi.advanceTimersByTime(119999);
      expect(fail).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1);
      expect(fail).toHaveBeenCalledExactlyOnceWith({ code: "STARTUP_TIMEOUT" });
      fail.mockClear();
      const cancel = startStartupDeadline(120000, fail);
      cancel();
      vi.advanceTimersByTime(120000);
      expect(fail).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
  it("registra etapas, tiempos y un identificador común", async () => {
    const messages: string[] = [];
    const startup = createStartupDiagnostics((message) => messages.push(message));
    await startup.stage("configuracion", async () => 1);
    await startup.stage("dependencias", async () => 2);
    const events = messages.map((message) => JSON.parse(message.slice("[arranque] ".length)));
    expect(events.map((event) => [event.etapa, event.evento])).toEqual([
      ["configuracion", "iniciando"],
      ["configuracion", "completada"],
      ["dependencias", "iniciando"],
      ["dependencias", "completada"],
    ]);
    expect(new Set(events.map((event) => event.bootId)).size).toBe(1);
    expect(events.every((event) => event.duracionMs >= 0 && event.pid === process.pid && event.fecha)).toBe(true);
  });

  it("conserva la etapa fallida y no declara éxito ni divulga el error original", async () => {
    const messages: string[] = [];
    const startup = createStartupDiagnostics((message) => messages.push(message));
    const error = Object.assign(new Error("mysql://user:synthetic-password@host/db"), { code: "P1000" });
    await expect(
      startup.stage("base_de_datos", async () => {
        throw error;
      }),
    ).rejects.toBe(error);
    startup.fail(error);
    expect(messages.join("\n")).toContain('"etapa":"base_de_datos","evento":"fallo"');
    expect(messages.join("\n")).not.toMatch(/synthetic-password|completada|listo/);
    expect(startupFailure(error)).toEqual({ category: "autenticacion_base", code: "P1000" });
  });

  it("clasifica causas conocidas sin imprimir mensajes ni códigos arbitrarios", () => {
    expect(startupFailure({ cause: { code: "ECONNREFUSED" } }).category).toBe("conexion_rechazada");
    expect(startupFailure({ code: "secret-arbitrary-code", message: "secret" })).toEqual({ category: "error_no_clasificado", code: "UNKNOWN" });
    expect(startupFailure({ code: "__proto__" })).toEqual({ category: "error_no_clasificado", code: "UNKNOWN" });
    expect(startupFailure({ code: "STARTUP_TIMEOUT" }).category).toBe("tiempo_arranque_agotado");
  });

  it("espera escucha real y clasifica el puerto ocupado sin eventos pendientes", async () => {
    const first = createServer();
    const second = createServer();
    try {
      first.listen(0, "127.0.0.1");
      await waitForListening(first);
      const address = first.address();
      if (!address || typeof address === "string") throw new Error("Puerto de prueba ausente");
      second.listen(address.port, "127.0.0.1");
      const existingListeners = second.listenerCount("listening");
      const error = await waitForListening(second).then(
        () => null,
        (error) => error,
      );
      expect(startupFailure(error).category).toBe("puerto_ocupado");
      expect(second.listenerCount("listening")).toBe(existingListeners);
      expect(first.listenerCount("error")).toBe(0);
    } finally {
      if (first.listening) await new Promise<void>((resolve) => first.close(() => resolve()));
      if (second.listening) await new Promise<void>((resolve) => second.close(() => resolve()));
    }
  });
});
