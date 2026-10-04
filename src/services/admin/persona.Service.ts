import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { line, log } from "#root/src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";

import * as distritoDao from "#root/src/daos/distrito.Dao.js";
import * as documentotipoDao from "#root/src/daos/documentotipo.Dao.js";
import * as generoDao from "#root/src/daos/genero.Dao.js";
import * as paisDao from "#root/src/daos/pais.Dao.js";
import * as personaDao from "#root/src/daos/persona.Dao.js";

export interface PersonaUpdateDto {
  personaid: string;
  personanombres: string;
  apellidopaterno: string;
  apellidomaterno: string;
  paisnacionalidadid: string;
  paisnacimientoid: string;
  paisresidenciaid: string;
  distritoresidenciaid: string;
  generoid: string;
  fechanacimiento: Date;
  direccion: string;
  direccionreferencia: string;
}

/**
 * Activa una persona existente.
 */
export const activatePersonaService = async (personaid: string, idusuario: number) => {
  log.debug(line(), "service::activatePersonaService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const personaActivated = await personaDao.activatePersona(tx, personaid, idusuario);
      if (personaActivated[0] === 0) {
        throw new ClientError("Persona no existe", 404);
      }
      log.debug(line(), "personaActivated:", personaActivated);
      return personaActivated;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Elimina lógicamente una persona.
 */
export const deletePersonaService = async (personaid: string, idusuario: number) => {
  log.debug(line(), "service::deletePersonaService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const personaDeleted = await personaDao.deletePersona(tx, personaid, idusuario);
      if (personaDeleted[0] === 0) {
        throw new ClientError("Persona no existe", 404);
      }
      log.debug(line(), "personaDeleted:", personaDeleted);
      return personaDeleted;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Consulta de maestros para persona (países, distritos, tipos de documento, géneros).
 */
export const getPersonaMasterService = async () => {
  log.debug(line(), "service::getPersonaMasterService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const paises = await paisDao.getPaises(tx, filter_estados);
      const distritos = await distritoDao.getDistritos(tx, filter_estados);
      const documentotipos = await documentotipoDao.getDocumentotipos(tx, filter_estados);
      const generos = await generoDao.getGeneros(tx, filter_estados);

      return {
        paises,
        distritos,
        documentotipos,
        generos,
      };
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Actualiza los datos de una persona.
 */
export const updatePersonaService = async (dto: PersonaUpdateDto, idusuario: number) => {
  log.debug(line(), "service::updatePersonaService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const personaToUpdate: Prisma.personaUpdateInput = {
        personanombres: dto.personanombres,
        apellidopaterno: dto.apellidopaterno,
        apellidomaterno: dto.apellidomaterno,

        fechanacimiento: dto.fechanacimiento,
        direccion: dto.direccion,
        direccionreferencia: dto.direccionreferencia,
        idusuariomod: idusuario ?? 1,
        fechamod: new Date(),
      };

      const result = await personaDao.updatePersona(tx, dto.personaid, personaToUpdate);
      if (result[0] === 0) {
        throw new ClientError("Persona no existe", 404);
      }
      const personaUpdated = await personaDao.getPersonaByPersonaid(tx, dto.personaid);
      if (!personaUpdated) {
        throw new ClientError("Persona no existe", 404);
      }
      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

/**
 * Consulta la lista de personas activas o eliminadas.
 */
export const getPersonasService = async () => {
  log.debug(line(), "service::getPersonasService");

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      return await personaDao.getPersonas(tx, filter_estado);
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
