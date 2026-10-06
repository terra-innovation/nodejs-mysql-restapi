import { prismaFT } from "#src/models/prisma/db-factoring.js";
import { getEstadoUsuarioservicioPropio } from "#src/daos/usuarioservicio.Dao.js";
import { ClientError } from "#src/utils/CustomErrors.js";

const accesosPorServicio: Record<number, { idrol: number; url: string }> = {
  1: { idrol: 3, url: "/empresario/factoring/nuevo" },
  2: { idrol: 4, url: "/inversionista/factoring/oportunidades" },
};

export const getEstadoSuscripcionService = async (idusuario: number, usuarioservicioid: string) => {
  const suscripcion = await getEstadoUsuarioservicioPropio(prismaFT.client, idusuario, usuarioservicioid);
  if (!suscripcion) throw new ClientError("Suscripción no disponible.", 404);
  return {
    usuarioservicioid: suscripcion.usuarioservicioid,
    estado: suscripcion.usuario_servicio_estado,
    suscrito: suscripcion.idusuarioservicioestado === 2,
    acceso: accesosPorServicio[suscripcion.idservicio] ?? null,
  };
};
