import { Decimal } from "@prisma/client/runtime/client";
import { ClientError } from "#src/utils/CustomErrors.js";

// Capacidad del esquema vigente, no un límite comercial ni normativo.
const INPUT_MAX = new Decimal("99999999.9999999999");
const CalculationDecimal = Decimal.clone({ precision: 40 });

// Dos factores de 18 dígitos necesitan hasta 36 antes del redondeo monetario.
export const calculateLiquidacionAmount = (cantidad: Decimal, unitario: Decimal): Decimal =>
  new Decimal(new CalculationDecimal(cantidad.toString()).mul(unitario.toString()).toDecimalPlaces(2).toString());

export const getLiquidacionInputError = (value: unknown, label: string): string | null => {
  if (value === undefined || value === null) return null;
  let number: Decimal;
  try {
    number = new Decimal(value as Decimal.Value);
  } catch {
    return `${label} debe ser un número válido`;
  }
  if (!number.isFinite()) return `${label} debe ser un número finito`;
  if (number.lessThan(0)) return `${label} no puede ser ${label === "La cantidad" ? "negativa" : "negativo"}`;
  if (number.decimalPlaces() > 10) return `${label} admite como máximo diez decimales`;
  if (number.greaterThan(INPUT_MAX)) return `${label} excede la capacidad de guardado (8 enteros y 10 decimales)`;
  return null;
};

export const assertLiquidacionInput = (value: unknown, label: string): void => {
  const error = getLiquidacionInputError(value, label);
  if (error) throw new ClientError(error, 400);
};

export const assertLiquidacionDecimal = (value: Decimal, label: string, precision = 10, scale = 2): void => {
  const maximum = new Decimal(10).pow(precision - scale).minus(new Decimal(10).pow(-scale));
  if (!value.isFinite() || value.abs().greaterThan(maximum) || value.decimalPlaces() > scale) {
    throw new ClientError(`${label} excede la precisión o capacidad de guardado de la liquidación`, 400);
  }
};
