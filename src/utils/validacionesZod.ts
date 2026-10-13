import { z } from "zod";

type FileInput = { size: number; mimetype: string }[];

export const fileRequeridValidation = (fieldName = "archivo") => z.custom<FileInput>((value) => Boolean(value?.[0]), `${fieldName} es un campo requerido.`);

export const fileSizeValidation = (maxSize: number, fieldName = "archivo") => z.custom<FileInput | undefined>((value) => value === undefined || Boolean(value?.[0] && value[0].size <= maxSize), `${fieldName} es demasiado grande. El tamaño máximo es ${maxSize / (1024 * 1024)} MB.`);

export const fileTypeValidation = (allowedTypes: string[], fieldName = "archivo") =>
  z.custom<FileInput | undefined>().superRefine((value, ctx) => {
    if (value !== undefined && (!value?.[0] || !allowedTypes.includes(value[0].mimetype))) {
      ctx.addIssue({ code: "custom", message: `${fieldName} tiene un tipo de archivo [${value?.[0]?.mimetype}] no permitido. Tipos permitidos: ${allowedTypes.join(", ")}` });
    }
  });
