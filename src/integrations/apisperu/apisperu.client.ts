/**
 * apisperu.client.ts
 * Configuración del cliente HTTP para comunicarse con la API de Apis Perú (Tipo de Cambio).
 */
import axios, { type AxiosInstance, isAxiosError } from "axios";
import { env } from "#src/config.js";
import type { ApisPeruApiErrorResponse } from "./apisperu.types.js";

/**
 * Error personalizado para peticiones hacia la API de Apis Perú
 */
export class ApisPeruError extends Error {
  public readonly status?: number;
  public readonly data?: ApisPeruApiErrorResponse | unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = "ApisPeruError";
    this.status = status;
    this.data = data;
    Object.setPrototypeOf(this, ApisPeruError.prototype);
  }
}

/**
 * Instancia de Axios preconfigurada para la API de Apis Perú
 */
export const apisPeruClient: AxiosInstance = axios.create({
  baseURL: env.APISPERU_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor de Solicitud: Inyecta el token Bearer dinámicamente desde env
apisPeruClient.interceptors.request.use((config) => {
  const token = env.APISPERU_API_TOKEN;
  if (!token) {
    throw new ApisPeruError("APISPERU_API_TOKEN no está configurado en las variables de entorno.");
  }

  if (!config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Interceptor de Respuesta: Transforma fallos HTTP en instancias de ApisPeruError
apisPeruClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data as ApisPeruApiErrorResponse | undefined;
      const message =
        data?.message ||
        error.message ||
        "Error al comunicarse con la API de Apis Perú";

      return Promise.reject(new ApisPeruError(message, status, data));
    }

    return Promise.reject(new ApisPeruError(error?.message || "Error inesperado en Apis Perú"));
  }
);
