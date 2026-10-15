import { prismaFT } from "#src/models/prisma/db-factoring.js";
import { getFactoringConsolidado } from "#src/daos/factoringConsolidado.Dao.js";
import { createFactoringConsolidadoXlsx } from "#src/utils/factoringConsolidadoXlsx.js";

export async function downloadFactoringConsolidadoService() {
  const rows = await getFactoringConsolidado(prismaFT.client);
  return createFactoringConsolidadoXlsx(rows);
}
