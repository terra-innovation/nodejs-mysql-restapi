import { prismaFT } from "#src/models/prisma/db-factoring.js";
import { getEstadoPersonaPropia } from "#src/daos/personaestadoConsulta.Dao.js";
import { ClientError } from "#src/utils/CustomErrors.js";

export const getEstadoPersonaService = async (idusuario: number) => {
  const usuario = await getEstadoPersonaPropia(prismaFT.client, idusuario);
  if (!usuario) throw new ClientError("La cuenta no está disponible. Inicia sesión para continuar.", 401);
  return {
    usuarioid: usuario.usuarioid,
    ispersonavalidated: usuario.ispersonavalidated,
    estado: usuario.persona?.persona_verificacion_estado ?? null,
  };
};
