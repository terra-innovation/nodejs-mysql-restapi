import * as luxon from "luxon";

const localeConfig = {
  zone: "America/Lima",
  locale: "es",
};

export const formatDate1 = (date) => {
  if (date === null || date === undefined || date === "") {
    return "";
  }
  if (date instanceof Date) {
    return luxon.DateTime.fromJSDate(date, localeConfig).toFormat("dd/MMMM/yyyy");
  }
  return luxon.DateTime.fromISO(date, localeConfig).toFormat("dd/MMMM/yyyy");
};

export const formatDate2 = (date) => {
  if (date === null || date === undefined || date === "") {
    return "";
  }

  if (date instanceof Date) {
    return luxon.DateTime.fromJSDate(date, localeConfig).toFormat("dd/MMMM/yyyy HH:mm");
  }

  return luxon.DateTime.fromISO(date, localeConfig).toFormat("dd/MMMM/yyyy HH:mm");
};

export const formatDate3 = (date) => {
  if (date === null || date === undefined || date === "") {
    return "";
  }
  if (date instanceof Date) {
    return luxon.DateTime.fromJSDate(date, localeConfig).toFormat("yyyy-MM-dd HH:mm:ss.SSS ZZZ");
  }
  return luxon.DateTime.fromISO(date, localeConfig).toFormat("yyyy-MM-dd HH:mm:ss.SSS ZZZ");
};
