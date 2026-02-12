import type { Prisma, factoring_propuesta, financiero_tipo, financiero_concepto, factoring_propuesta_financiero } from "#root/generated/prisma/ft_factoring/client.js";

export interface Comision extends Partial<factoring_propuesta_financiero> {
  //comisionft_porcentaje?: Prisma.Decimal;
  financiero_tipo: Partial<financiero_tipo>;
  financiero_concepto: Partial<financiero_concepto>;
}

export interface Costo extends Partial<factoring_propuesta_financiero> {
  financiero_tipo: Partial<financiero_tipo>;
  financiero_concepto: Partial<financiero_concepto>;
}

export interface Gasto extends Partial<factoring_propuesta_financiero> {
  financiero_tipo: Partial<financiero_tipo>;
  financiero_concepto: Partial<financiero_concepto>;
}

export interface Gasto_excento_igv extends Partial<factoring_propuesta_financiero> {
  financiero_tipo: Partial<financiero_tipo>;
  financiero_concepto: Partial<financiero_concepto>;
}

export interface Simulacion extends Partial<factoring_propuesta> {
  comisiones?: Comision[];
  costos?: Costo[];
  gastos?: Gasto[];
  gastos_excento_igv?: Gasto_excento_igv[];
}
