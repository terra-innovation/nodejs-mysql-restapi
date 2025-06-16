import { Prisma } from "#root/generated/prisma/ft_factoring/client.js";

const localeConfig = {
  locale: "es-PE",
  options: {
    minimumFractionDigits: 2,
    useGrouping: true,
  },
};

export const formatNumber = (number, minimumFractionDigits = 2) => {
  if (number === null || number === undefined || number === "") {
    return "";
  }

  if (number instanceof Prisma.Decimal) {
    number = number.toNumber();
  }

  if (typeof number === "string") {
    number = parseFloat(number);
  }

  if (isNaN(number)) {
    return ""; // Retorna vacío si no es un número válido
  }

  const options = {
    ...localeConfig.options,
    minimumFractionDigits,
  };
  return number.toLocaleString(localeConfig.locale, options);
};

export const formatPercentage = (number, minimumFractionDigits = 2) => {
  if (number === null || number === undefined || number === "") {
    return "";
  }

  if (number instanceof Prisma.Decimal) {
    number = number.toNumber();
  }

  if (typeof number === "string") {
    number = parseFloat(number);
  }

  if (isNaN(number)) {
    return ""; // Retorna vacío si no es un número válido
  }

  const options = {
    ...localeConfig.options,
    minimumFractionDigits,
  };
  let number_porcentaje = number * 100;
  return number_porcentaje.toLocaleString(localeConfig.locale, options) + "%";
};
