import { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { ClientError } from "#src/utils/CustomErrors.js";
// SUM(DECIMAL(20,2)) puede tener más dígitos que un abono individual.
const PagoDecimal = Prisma.Decimal.clone({ precision: 40 });

export function importePago(value: string) {
  if (!/^\d{1,18}(?:\.\d{1,2})?$/.test(value)) throw new ClientError("Use un importe positivo con hasta dos decimales.", 422);
  const amount = new Prisma.Decimal(value);
  if (amount.lte(0)) throw new ClientError("El importe debe ser mayor que cero.", 422);
  return amount;
}
type DecimalInput = string | number | Prisma.Decimal;
export function disponiblePago(monto: DecimalInput, aplicado: DecimalInput, solicitado: DecimalInput) {
  const available = new PagoDecimal(monto).minus(aplicado);
  if (new PagoDecimal(solicitado).gt(available)) throw new ClientError("El importe supera el disponible de la transacción bancaria.", 422);
  return available;
}
export function resumenPago(referencia: DecimalInput | null, total: DecimalInput) {
  const paid = new PagoDecimal(total);
  return { monto_referencia: referencia == null ? null : new PagoDecimal(referencia).toFixed(2), monto_total_pagado: paid.toFixed(2), diferencia_pago: referencia == null ? null : new PagoDecimal(referencia).minus(paid).toFixed(2) };
}
