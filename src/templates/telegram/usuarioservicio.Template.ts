export interface EmpresaToCreateTelegram {
  code?: string | null;
  ruc?: string | null;
  razon_social?: string | null;
  direccion_sede?: string | null;
}

export const newEmpresaVerificationMessage = (empresaToCreate: EmpresaToCreateTelegram) => {
  return {
    title: "Nueva solicitud de verificación de Empresa",
    code: empresaToCreate.code,
    ruc: empresaToCreate.ruc,
    razon_social: empresaToCreate.razon_social,
    direccion_sede: empresaToCreate.direccion_sede,
  };
};
