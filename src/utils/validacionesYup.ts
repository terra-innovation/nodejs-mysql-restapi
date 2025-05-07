import * as yup from "yup";

// Función de validación para archivo requerido
export const fileRequeridValidation = () => {
  return yup.mixed().test(
    "fileRequerid",
    (contexto) => {
      const fieldName = contexto.label ? contexto.label : contexto.path;
      return `${fieldName} es un campo requerido.`; // Mensaje de error
    },
    (value) => {
      if (value) {
        if (value[0]) return true;
      }
      return false;
    }
  );
};

// Función de validación para el tamaño del archivo
export const fileSizeValidation = (maxSize) => {
  return yup.mixed().test(
    "fileSize",
    (contexto) => {
      const fieldName = contexto.label ? contexto.label : contexto.path;
      return `${fieldName} es demasiado grande. El tamaño máximo es ${maxSize / (1024 * 1024)} MB.`; // Mensaje de error
    },
    (value) => {
      if (!value) return true; // Si no hay archivo, no se aplica la validación
      return value[0].size <= maxSize;
    }
  );
};

// Función de validación para el tipo de archivo
export const fileTypeValidation = (allowedTypes) => {
  return yup.mixed().test(
    "fileType",
    (contexto) => {
      const fieldName = contexto.label ? contexto.label : contexto.path;
      return `${fieldName} tiene un tipo de archivo [${contexto.value[0].mimetype}] no permitido. Tipos permitidos: ${allowedTypes.join(", ")}`;
    },
    (value) => {
      if (!value) return true; // Si no hay archivo, no se aplica la validación
      return allowedTypes.includes(value[0].mimetype);
    }
  );
};
