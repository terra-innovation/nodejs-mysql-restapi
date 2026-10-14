import { ClientError } from "#src/utils/CustomErrors.js";
import { DETRACCION_CODES } from "#src/types/FactoringDetraccion.types.js";

export function validarPagoDetraccion(actual: { code: string; fecha: Date | null }, siguiente: { code: string; fecha: Date | null; constancia: boolean }) {
  const permitidos: string[] = Object.values(DETRACCION_CODES);
  if (!permitidos.includes(actual.code) || !permitidos.includes(siguiente.code)) throw new ClientError("Estado de detracción no permitido", 400);
  if (siguiente.fecha && !Number.isFinite(siguiente.fecha.getTime())) throw new ClientError("Fecha de pago inválida", 400);
  if (siguiente.code === DETRACCION_CODES.PAGADA && (!siguiente.fecha || !siguiente.constancia)) throw new ClientError("Para marcar PAGADA se requiere fecha y constancia de pago", 400);
  if (actual.code === DETRACCION_CODES.PAGADA && siguiente.code === DETRACCION_CODES.PENDIENTE && actual.fecha?.getTime() !== siguiente.fecha?.getTime()) throw new ClientError("Al reabrir debe conservar la fecha registrada", 400);
}
