/**
 * decolecta.client.ts
 * Configuración del cliente HTTP para comunicarse con la API de Decolecta.
 */
import axios, { type AxiosInstance, isAxiosError } from "axios";
import { env } from "#src/config.js";
import type { DecolectaApiErrorResponse } from "./decolecta.types.js";


/**
 * Error personalizado para peticiones hacia la API de Decolecta
 */
export class DecolectaError extends Error {
  public readonly status?: number;
  public readonly data?: DecolectaApiErrorResponse | unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = "DecolectaError";
    this.status = status;
    this.data = data;
    Object.setPrototypeOf(this, DecolectaError.prototype);
  }
}

/**
 * Instancia de Axios preconfigurada para la API de Decolecta
 */
export const decolectaClient: AxiosInstance = axios.create({
  baseURL: env.DECOLECTA_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor de Solicitud: Inyecta el token Bearer dinámicamente desde env
decolectaClient.interceptors.request.use((config) => {
  const token = env.DECOLECTA_API_TOKEN;
  if (!token) {
    throw new DecolectaError("DECOLECTA_API_TOKEN no está configurado en las variables de entorno.");
  }

  if (!config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Interceptor de Respuesta: Transforma fallos HTTP en instancias de DecolectaError
decolectaClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data as DecolectaApiErrorResponse | undefined;
      const message =
        data?.message ||
        data?.error ||
        error.message ||
        "Error al comunicarse con la API de Decolecta";

      return Promise.reject(new DecolectaError(message, status, data));
    }

    return Promise.reject(new DecolectaError(error?.message || "Error inesperado en Decolecta"));
  }
);
