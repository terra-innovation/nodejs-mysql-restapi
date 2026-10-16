import { randomUUID } from "node:crypto";
import { prismaFT } from "#src/models/prisma/db-factoring.js";
import * as dao from "#src/daos/configuracionbbdd.Dao.js";
import { cifrarPassword } from "#src/providers/bbdd/bbddCrypto.js";
import { diagnoseConnection } from "#src/integrations/bbdd/mysqlConnection.js";
import { pruebaBbdd } from "#src/types/ConfiguracionBbdd.schemas.js";
import type { ConfiguracionBbddInput } from "#src/types/ConfiguracionBbdd.schemas.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import type { TxClient } from "#src/types/Prisma.types.js";
const db = prismaFT.client;
const tx = <T>(work: (value: TxClient) => Promise<T>) => db.$transaction(work, { timeout: prismaFT.transactionTimeout || 10000 });
const ids = (prefix: string) => ({ code: prefix + randomUUID().replaceAll("-", "").slice(0, 16).toUpperCase() });
const audit = (user: number) => ({ idusuariocrea: user, idusuariomod: user });
const changed = (user: number) => ({ idusuariomod: user, fechamod: new Date(), version: { increment: 1 } });
const required = <T>(value: T | null): T => {
  if (!value) throw new ClientError("Configuración no encontrada.", 404);
  return value;
};
const checkVersion = (result: { count: number }) => {
  if (result.count !== 1) throw new ClientError("La configuración cambió; actualice la pantalla antes de continuar.", 409);
};
export const listarConexiones = () => dao.connections(db);
export async function guardarConexion(uuid: string | null, input: ConfiguracionBbddInput, user: number, version?: number) {
  const work = async () => {
    const old = uuid ? required(await dao.connection(db, uuid)) : null;
    const publicId = old?.configuracionbbddid || randomUUID();
    if (!old && !input.password) throw new ClientError("La contraseña es obligatoria al crear la conexión.", 422);
    // Reutilizar solo el sobre criptográfico: no sobrescribir la nueva configuración
    // con metadatos del registro anterior al validar un cambio sin contraseña nueva.
    const secret = input.password ? cifrarPassword(input.password, publicId) : { password_cifrado: old.password_cifrado, password_nonce: old.password_nonce, password_tag: old.password_tag, clave_version: old.clave_version, cifrado_version: old.cifrado_version };
    const normalized = { alias: input.alias, motor: input.motor, host: input.host, puerto: input.puerto, base_datos: input.base_datos, usuario: input.usuario, tls_ca_referencia: input.tls_ca_referencia || null, habilitado: Number(input.habilitado), tls_habilitado: Number(input.tls_habilitado ?? true) };
    return tx(async (t) => {
      if (old) {
        checkVersion(await dao.connectionUpdate(t, old.idconfiguracionbbdd, version, { ...normalized, ...(input.password ? { password_cifrado: secret.password_cifrado, password_nonce: secret.password_nonce, password_tag: secret.password_tag, clave_version: secret.clave_version, cifrado_version: secret.cifrado_version } : {}), ...changed(user) }));
      } else {
        await dao.connectionCreate(t, { ...ids("BC"), ...audit(user), ...normalized, password_cifrado: secret.password_cifrado, password_nonce: secret.password_nonce, password_tag: secret.password_tag, clave_version: secret.clave_version, cifrado_version: secret.cifrado_version, configuracionbbddid: publicId });
      }
      return required(await dao.connections(t)).find((row) => row.configuracionbbddid === publicId);
    });
  };
  return uuid ? dao.withConnectionLock(uuid, work) : work();
}
export async function estadoConexion(uuid: string, version: number, state: number, user: number) {
  return dao.withConnectionLock(uuid, () =>
    tx(async (t) => {
      const row = required(await dao.connection(t, uuid));
      checkVersion(await dao.connectionUpdate(t, row.idconfiguracionbbdd, version, { estado: state, habilitado: 0, ...changed(user) }));
      return { correcto: true };
    }),
  );
}

export const validarConexion = (uuid: string | null, draft?: unknown) =>
  diagnoseConnection(async () => {
    const stored = uuid ? required(await dao.connection(db, uuid)) : undefined;
    if (draft === undefined && stored) return { config: stored, stored };
    const parsed = pruebaBbdd.safeParse(draft);
    if (!parsed.success) throw new ClientError("Revise los campos: " + [...new Set(parsed.error.issues.map((i) => i.path.join(".")))].join(", ") + ".", 422);
    return { config: { ...parsed.data, tls_ca_referencia: parsed.data.tls_ca_referencia || null }, stored };
  });
