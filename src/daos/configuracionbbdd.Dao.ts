import mariadb from "mariadb";
import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import type { TxClient } from "#src/types/Prisma.types.js";
import { env } from "#src/config.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { mariaDbOptions } from "#src/models/prisma/mariadbAdapter.js";

export const connectionSelect = { configuracionbbddid: true, code: true, alias: true, motor: true, host: true, puerto: true, base_datos: true, usuario: true, tls_ca_referencia: true, tls_habilitado: true, habilitado: true, version: true, estado: true, fechamod: true } satisfies Prisma.configuracion_bbddSelect;
export const connection = (tx: TxClient, uuid: string) => tx.configuracion_bbdd.findUnique({ where: { configuracionbbddid: uuid } });
export const connections = (tx: TxClient) => tx.configuracion_bbdd.findMany({ select: connectionSelect, orderBy: { fechacrea: "desc" } });
export const connectionCreate = (tx: TxClient, data: Prisma.configuracion_bbddUncheckedCreateInput) => tx.configuracion_bbdd.create({ data, select: connectionSelect });
export const connectionUpdate = (tx: TxClient, pk: number, version: number, data: Prisma.configuracion_bbddUncheckedUpdateManyInput) => tx.configuracion_bbdd.updateMany({ where: { idconfiguracionbbdd: pk, version }, data });
export async function withConnectionLock<T>(uuid: string, work: () => Promise<T>): Promise<T> {
  const conn = await mariadb.createConnection(mariaDbOptions(env.PRISMA_DATABASE_FACTORING_URL));
  const name = `ft:bbdd:${uuid}`;
  let acquired = false;
  try {
    const [row] = await conn.query("SELECT GET_LOCK(?,0) AS adquirido", [name]);
    acquired = Number(row.adquirido) === 1;
    if (!acquired) throw new ClientError("Ya existe una sincronización o modificación de esta conexión en curso.", 409);
    return await work();
  } finally {
    if (acquired) await conn.query("SELECT RELEASE_LOCK(?)", [name]).catch(() => {});
    await conn.end().catch(() => {});
  }
}
