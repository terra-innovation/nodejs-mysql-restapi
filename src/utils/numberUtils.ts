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

  const options = {
    ...localeConfig.options,
    minimumFractionDigits,
  };
  let number_porcentaje = number * 100;
  return number_porcentaje.toLocaleString(localeConfig.locale, options) + "%";
};
