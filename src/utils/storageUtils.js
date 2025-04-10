import path from "path";

export const STORAGE_PATH_PROCESAR = path.join("storage", "procesar");
export const STORAGE_PATH_FAIL = path.join("storage", "fail");
export const STORAGE_PATH_INVALID = path.join("storage", "invalid");
export const STORAGE_PATH_SUCCESS = path.join("storage", "success");

export const pathApp = () => {
  return process.cwd();
};

export const pathDate = (date) => {
  // Crear una instancia de Date si no se pasa una fecha específica
  const currentDate = date || new Date();

  // Obtener las partes de la fecha
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Los meses van de 0 a 11, por eso sumamos 1
  const day = String(currentDate.getDate()).padStart(2, "0");

  // Crear el path en el formato /yyyy/MM/dd
  const datePath = path.join(year.toString(), month, day);

  return datePath;
};
