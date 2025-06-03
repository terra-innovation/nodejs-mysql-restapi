import { FinancieroTipoCreationAttributes } from "#src/models/ft_factoring/FinancieroTipo.js";
import { FinancieroConceptoCreationAttributes } from "#src/models/ft_factoring/FinancieroConcepto.js";
import { FactoringPropuestaCreationAttributes } from "#src/models/ft_factoring/FactoringPropuesta.js";
import type { Prisma } from "#src/models/prisma/ft_factoring/client";

export interface Comision {
  comisionft_porcentaje: number;
  _idfinancierotipo: number;
  _idfinancieroconcepto: number;
  monto: number;
  igv: number;
  total: number;
  financierotipo: FinancieroTipoCreationAttributes;
  financieroconcepto: FinancieroConceptoCreationAttributes;
}

export interface Costo {
  _idfinancierotipo: number;
  _idfinancieroconcepto: number;
  monto: number;
  igv: number;
  total: number;
  financierotipo: FinancieroTipoCreationAttributes;
  financieroconcepto: FinancieroConceptoCreationAttributes;
}

export interface Gasto {
  monto?: number;
  igv?: number;
}

export interface Simulacion extends Partial<Prisma.factoring_propuestaCreateInput> {
  comisiones?: Comision[];
  costos?: Costo[];
  gastos?: Gasto[];
}
