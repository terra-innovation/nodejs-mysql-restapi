export const newLoginMessage = (email: string) => {
  return {
    title: "Login",
    email: email,
  };
};

export interface UsuarioToCreateTelegram {
  code?: string | null;
  documentonumero?: string | null;
  usuarionombres?: string | null;
  apellidopaterno?: string | null;
  apellidomaterno?: string | null;
  email?: string | null;
  celular?: string | null;
}

export const newUsuarioRegistradoMessage = (usuarioToCreate: UsuarioToCreateTelegram) => {
  return {
    title: "Nuevo usuario registrado",
    code: usuarioToCreate.code,
    documentonumero: usuarioToCreate.documentonumero,
    usuarionombres: usuarioToCreate.usuarionombres,
    apellidopaterno: usuarioToCreate.apellidopaterno,
    apellidomaterno: usuarioToCreate.apellidomaterno,
    email: usuarioToCreate.email,
    celular: usuarioToCreate.celular,
  };
};
