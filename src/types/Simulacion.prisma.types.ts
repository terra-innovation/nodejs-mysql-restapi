import type { Prisma, factoring_propuesta, financiero_tipo, financiero_concepto, factoring_propuesta_financiero } from "#src/models/prisma/ft_factoring/client";

export interface Comision extends Partial<factoring_propuesta_financiero> {
  comisionft_porcentaje?: Prisma.Decimal;
  financierotipo: Partial<financiero_tipo>;
  financieroconcepto: Partial<financiero_concepto>;
}

export interface Costo extends Partial<factoring_propuesta_financiero> {
  financierotipo: Partial<financiero_tipo>;
  financieroconcepto: Partial<financiero_concepto>;
}

export interface Gasto extends Partial<factoring_propuesta_financiero> {
  financierotipo: Partial<financiero_tipo>;
  financieroconcepto: Partial<financiero_concepto>;
}

export interface Simulacion extends Partial<factoring_propuesta> {
  comisiones?: Comision[];
  costos?: Costo[];
  gastos?: Gasto[];
}
