export interface PersonaToCreateTelegram {
  code?: string | null;
  documentonumero?: string | null;
  personanombres?: string | null;
  apellidopaterno?: string | null;
  apellidomaterno?: string | null;
  email?: string | null;
  celular?: string | null;
}

export const newPersonaVerificationMessage = (personaToCreate: PersonaToCreateTelegram) => {
  return {
    title: "Nueva solicitud de verificación de Persona",
    code: personaToCreate.code,
    documentonumero: personaToCreate.documentonumero,
    personanombres: personaToCreate.personanombres,
    apellidopaterno: personaToCreate.apellidopaterno,
    apellidomaterno: personaToCreate.apellidomaterno,
    email: personaToCreate.email,
    celular: personaToCreate.celular,
  };
};
