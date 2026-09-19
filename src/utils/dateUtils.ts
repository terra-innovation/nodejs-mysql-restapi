import { DateTime } from "luxon";
import { ClientError } from "./CustomErrors.js";
const defaultConfig = {
  zone: "America/Lima",
  locale: "es",
};

const utcConfig = {
  zone: "utc",
  locale: "es",
};

export const formatDateCustom = (isoDate, format = "dd/LLL/yyyy HH:mm ZZZ", config = defaultConfig) => {
  if (!isoDate) return "";

  if (DateTime.isDateTime(isoDate)) {
    return isoDate.setZone(config.zone).toFormat(format);
  }

  if (isoDate instanceof Date) {
    return DateTime.fromJSDate(isoDate, config).toFormat(format);
  }

  return DateTime.fromISO(isoDate, config).toFormat(format);
};

export const formatDateLocale = (isoDate) => {
  return formatDateCustom(isoDate, "dd/LLL/yyyy", defaultConfig);
};

export const formatDateTimeLocale = (isoDate) => {
  return formatDateCustom(isoDate, "dd/LLL/yyyy HH:mm", defaultConfig);
};

export const formatDateForLogLocale = (isoDate) => {
  return formatDateCustom(isoDate, "dd/LLL/yyyy HH:mm:ss", defaultConfig);
};

export const formatDateTimeWithZoneLocale = (isoDate) => {
  return formatDateCustom(isoDate, "dd/LLL/yyyy HH:mm:ss ZZZ", defaultConfig);
};

export const formatDateWithZoneLocale = (isoDate, format = "yyyy-MM-dd (ZZ)") => {
  if (!isoDate) return "";
  const lima = toLimaDate(isoDate);
  return lima ? lima.toFormat(format) : "";
};

export const formatDateForAuditLocale = (isoDate, format = "dd/LLL/yyyy HH:mm:ss.SSS ZZZ") => {
  return formatDateCustom(isoDate, format, defaultConfig);
};

export const formatDateForEmailLocale = (isoDate, format = "d LLLL yyyy") => {
  return formatDateCustom(isoDate, format, defaultConfig);
};

export const formatDateCustomLocale = (isoDate, format = "dd/LLL/yyyy HH:mm ZZZ") => {
  return formatDateCustom(isoDate, format, defaultConfig);
};

export const formatDateUTC = (isoDate) => {
  return formatDateCustom(isoDate, "dd/LLL/yyyy", utcConfig);
};

export const formatDateTimeUTC = (isoDate) => {
  return formatDateCustom(isoDate, "dd/LLL/yyyy HH:mm", utcConfig);
};

export const formatDateForLogUTC = (isoDate) => {
  return formatDateCustom(isoDate, "dd/LLL/yyyy HH:mm:ss", utcConfig);
};

export const formatDateTimeWithZoneUTC = (isoDate) => {
  return formatDateCustom(isoDate, "dd/LLL/yyyy HH:mm ZZZ", utcConfig);
};

export const formatDateCustomUTC = (isoDate, format = "dd/LLL/yyyy HH:mm ZZZ", config = utcConfig) => {
  return formatDateCustom(isoDate, format, config);
};

/**
 * Retorna la fecha/hora actual en la zona horaria predeterminada (America/Lima).
 */
export const getNowLima = () => {
  return DateTime.now().setZone(defaultConfig.zone);
};

/**
 * Convierte una fecha (Date, ISO string o DateTime) a la zona horaria de Lima,
 * manteniendo el tiempo local si viene de la DB (UTC 00:00).
 */
export const toLimaDate = (date) => {
  if (!date) return null;
  if (DateTime.isDateTime(date)) return date.setZone(defaultConfig.zone);

  if (typeof date === "string") {
    const match = date.trim().match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) {
      return DateTime.fromISO(match[1], { zone: defaultConfig.zone });
    }
  }

  const jsDate = date instanceof Date ? date : new Date(date);
  return DateTime.fromJSDate(jsDate, { zone: "utc" }).setZone(defaultConfig.zone, { keepLocalTime: true });
};

/**
 * Convierte una fecha/hora (Date, ISO string o DateTime) a la zona horaria de Lima,
 * ajustando la hora según la diferencia de zona (sin keepLocalTime).
 */
export const toLimaDateTime = (date) => {
  if (!date) return null;
  if (DateTime.isDateTime(date)) return date.setZone(defaultConfig.zone);

  if (date instanceof Date) {
    return DateTime.fromJSDate(date).setZone(defaultConfig.zone);
  }

  return DateTime.fromISO(date).setZone(defaultConfig.zone);
};

/**
 * Convierte un valor de fecha (string YYYY-MM-DD, ISO string en UTC, objeto Date o DateTime)
 * a un objeto Date de JavaScript anclado a medianoche UTC (00:00:00.000Z).
 *
 * Es la función estándar para trabajar con campos MySQL DATE (@db.Date) en Prisma,
 * garantizando que no existan desfases de días provocados por la zona horaria del servidor
 * o la conversión a hora local cuando el frontend envía en UTC o formato ISO.
 *
 * Si no se pasa fecha, toma la fecha actual de Perú (America/Lima) a las 00:00:00.000 UTC.
 *
 * @param dateInput - Fecha en string (YYYY-MM-DD o ISO UTC), Date, DateTime o undefined (para hoy)
 * @returns Date configurado a las 00:00:00.000 UTC
 */
export const parseDateUtcMidnight = (dateInput?: string | Date | DateTime | null): Date => {
  let ymd: string;

  if (!dateInput) {
    ymd = DateTime.now().setZone(defaultConfig.zone).toISODate()!;
  } else if (dateInput instanceof Date) {
    ymd = dateInput.toISOString().slice(0, 10);
  } else if (DateTime.isDateTime(dateInput)) {
    ymd = dateInput.toISODate()!;
  } else if (typeof dateInput === "string") {
    const trimmed = dateInput.trim();
    const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
    if (!match) {
      throw new ClientError(`La fecha proporcionada '${dateInput}' no es válida. Formato requerido: YYYY-MM-DD`, 400);
    }
    ymd = match[1];
    const dt = DateTime.fromISO(ymd, { zone: "utc" });
    if (!dt.isValid) {
      throw new ClientError(`La fecha proporcionada '${dateInput}' no es válida. Formato requerido: YYYY-MM-DD`, 400);
    }
  } else {
    throw new ClientError("El formato de fecha proporcionado no es válido", 400);
  }

  return new Date(`${ymd}T00:00:00.000Z`);
};

/**
 * Formatea una fecha a string YYYY-MM-DD en UTC.
 */
export const formatDateToYMD = (date?: string | Date | DateTime | null): string => {
  if (!date) return "";
  if (typeof date === "string") {
    const match = date.trim().match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }
  if (date instanceof Date) {
    return date.toISOString().slice(0, 10);
  }
  if (DateTime.isDateTime(date)) {
    return date.toISODate() || "";
  }
  return "";
};


