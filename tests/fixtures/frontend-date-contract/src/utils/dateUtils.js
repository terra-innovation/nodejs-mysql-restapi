// src/utils/dateUtils.js
import { DateTime } from 'luxon';

const defaultConfig = {
  zone: 'America/Lima',
  locale: 'es'
};

const utcConfig = {
  zone: 'utc',
  locale: 'es'
};

export const formatDateCustom = (isoDate, format = 'dd/LLL/yyyy HH:mm ZZZ', config = defaultConfig) => {
  if (!isoDate) return '';

  let dt;
  if (isoDate instanceof Date) {
    dt = DateTime.fromJSDate(isoDate, config);
  } else if (DateTime.isDateTime(isoDate)) {
    dt = isoDate.setZone(config.zone);
  } else if (typeof isoDate === 'string') {
    dt = DateTime.fromISO(isoDate, config);
  } else {
    dt = DateTime.fromISO(String(isoDate), config);
  }

  if (!dt.isValid) return '';

  return dt.toFormat(format);
};

export const formatDateLocale = (isoDate) => {
  return formatDateCustom(isoDate, 'dd/LLL/yyyy', defaultConfig);
};

export const formatDateTimeLocale = (isoDate) => {
  return formatDateCustom(isoDate, 'dd/LLL/yyyy HH:mm', defaultConfig);
};

export const formatDateForLogLocale = (isoDate) => {
  return formatDateCustom(isoDate, 'dd/LLL/yyyy HH:mm:ss', defaultConfig);
};

export const formatDateTimeWithZoneLocale = (isoDate) => {
  return formatDateCustom(isoDate, 'dd/LLL/yyyy HH:mm:ss ZZZ', defaultConfig);
};

export const formatDateForAuditLocale = (isoDate, format = 'dd/LLL/yyyy HH:mm:ss.SSS ZZZ') => {
  return formatDateCustom(isoDate, format, defaultConfig);
};

export const formatDateCustomLocale = (isoDate, format = 'dd/LLL/yyyy HH:mm ZZZ') => {
  return formatDateCustom(isoDate, format, defaultConfig);
};

export const formatDateUTC = (isoDate) => {
  return formatDateCustom(isoDate, 'dd/LLL/yyyy', utcConfig);
};

export const formatDateTimeUTC = (isoDate) => {
  return formatDateCustom(isoDate, 'dd/LLL/yyyy HH:mm', utcConfig);
};

export const formatDateForLogUTC = (isoDate) => {
  return formatDateCustom(isoDate, 'dd/LLL/yyyy HH:mm:ss', utcConfig);
};

export const formatDateTimeWithZoneUTC = (isoDate) => {
  return formatDateCustom(isoDate, 'dd/LLL/yyyy HH:mm ZZZ', utcConfig);
};

export const formatDateCustomUTC = (isoDate, format = 'dd/LLL/yyyy HH:mm ZZZ') => {
  return formatDateCustom(isoDate, format, utcConfig);
};

export const toIsoUtc = (localDateString) => {
  if (!localDateString) return '';
  const dt = DateTime.fromISO(localDateString, { zone: 'local' }); // interpreta la hora local del navegador
  if (!dt.isValid) return '';
  return dt.toUTC().toISO(); // convierte a UTC y devuelve en formato ISO
};

// Fechas de negocio de factoring: instantes UTC interpretados por día civil de Perú.
export const toDateInputValueLima = (date) => {
  if (!date) return '';
  const dt = date instanceof Date ? DateTime.fromJSDate(date, defaultConfig) : DateTime.fromISO(date, defaultConfig);
  return dt.isValid ? dt.toISODate() : '';
};

export const toIsoUtcFromLima = (localDateString) => {
  if (!localDateString) return '';
  const dt = DateTime.fromISO(localDateString, defaultConfig);
  return dt.isValid ? dt.toUTC().toISO() : '';
};

export const toDateInputValue = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

export const todayLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];

export const datetimeLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

export const toDatetimeLocal = (date) => {
  if (!date) return '';
  const dt = new Date(date);
  if (isNaN(dt.getTime())) return '';
  const tzOffset = dt.getTimezoneOffset() * 60000;
  return new Date(dt.getTime() - tzOffset).toISOString().slice(0, 16);
};

export const parseUTCToLocalDate = (isoDateString) => {
  if (!isoDateString) return null;
  try {
    const dateStr = typeof isoDateString === 'string' ? isoDateString : new Date(isoDateString).toISOString();
    const dateParts = dateStr.split('T')[0].split('-');
    if (dateParts.length < 3) return null;
    return new Date(parseInt(dateParts[0], 10), parseInt(dateParts[1], 10) - 1, parseInt(dateParts[2], 10));
  } catch (e) {
    return null;
  }
};

export const formatLocalDateToYYYYMMDD = (date) => {
  if (!date) return null;
  if (typeof date === 'string') {
    const match = date.trim().match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
  }
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  const month = '' + (d.getMonth() + 1);
  const day = '' + d.getDate();
  const year = d.getFullYear();
  return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
};
