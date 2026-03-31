import { DateTime } from "luxon";
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

  const jsDate = date instanceof Date ? date : new Date(date);
  return DateTime.fromJSDate(jsDate, { zone: "utc" }).setZone(defaultConfig.zone, { keepLocalTime: true });
};
