import { AsyncLocalStorage } from "node:async_hooks";

// Definir un tipo para el contexto (puedes expandirlo según tus necesidades)
interface LoggerContext {
  correlationId?: string;
  userId?: string;
  [key: string]: any;
}

// Crear única instancia de AsyncLocalStorage
const loggerStorage = new AsyncLocalStorage<LoggerContext>();

// Función para inicializar el contexto
const initContext = (context: LoggerContext, callback: () => void) => {
  loggerStorage.run(context, callback);
};

// Función para obtener el contexto actual
const getContext = (): LoggerContext => loggerStorage.getStore() || {};

// Función para actualizar el contexto
const updateContext = (newContext: LoggerContext) => {
  const currentContext = loggerStorage.getStore() || {};
  loggerStorage.enterWith({ ...currentContext, ...newContext });
};

// Exportar la instancia y funciones utilitarias
export { loggerStorage, initContext, getContext, updateContext };
