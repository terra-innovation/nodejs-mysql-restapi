import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import * as contactoDao from "#root/src/daos/contacto.Dao.js";
import * as empresaDao from "#root/src/daos/empresa.Dao.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { line, log } from "#root/src/utils/logger.pino.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { v4 as uuidv4 } from "uuid";

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface CreateContactoDto {
  empresaid: string;
  nombrecontacto: string;
  apellidocontacto: string;
  cargo: string;
  email: string;
  celular: string;
  telefono: string;
  idusuario: number;
}

export interface UpdateContactoDto {
  contactoid: string;
  empresaid?: string;
  nombrecontacto: string;
  apellidocontacto: string;
  cargo: string;
  email: string;
  celular: string;
  telefono: string;
  idusuario: number;
}

export interface DeleteContactoDto {
  contactoid: string;
  idusuario: number;
}

export interface ActivateContactoDto {
  contactoid: string;
  idusuario: number;
}

// ─── Services ────────────────────────────────────────────────────────────────

export const getContactosService = async () => {
  log.debug(line(), "service::getContactosService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const contactos = await contactoDao.getContactos(tx, filter_estado);
      return contactos;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const createContactoService = async (dto: CreateContactoDto) => {
  log.debug(line(), "service::createContactoService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const empresa = await empresaDao.getEmpresaByEmpresaid(tx, dto.empresaid);
      if (!empresa) {
        log.warn(line(), "Empresa no existe: [" + dto.empresaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];
      const contacto_por_email = await contactoDao.getContactosByIdempresaAndEmail(
        tx,
        empresa.idempresa,
        dto.email,
        filter_estado,
      );
      if (contacto_por_email && contacto_por_email.length > 0) {
        log.warn(line(), "El email [" + dto.email + "] se encuentra registrado para esta empresa.");
        throw new ClientError("El email [" + dto.email + "] se encuentra registrado para esta empresa.", 400);
      }

      const contactoToCreate: Prisma.contactoCreateInput = {
        empresa: { connect: { idempresa: empresa.idempresa } },
        contactoid: uuidv4(),
        code: uuidv4().split("-")[0],
        nombrecontacto: dto.nombrecontacto,
        apellidocontacto: dto.apellidocontacto,
        cargo: dto.cargo,
        email: dto.email,
        celular: dto.celular,
        telefono: dto.telefono,
        idusuariocrea: dto.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: dto.idusuario ?? 1,
        fechamod: new Date(),
        estado: ESTADO.ACTIVO,
      };

      const result = await contactoDao.insertContacto(tx, contactoToCreate);
      log.debug(line(), "contactoCreated:", result);

      return jsonUtils.removeAttributesPrivates(result);
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const updateContactoService = async (dto: UpdateContactoDto) => {
  log.debug(line(), "service::updateContactoService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const contacto = await contactoDao.getContactoByContactoid(tx, dto.contactoid);
      if (!contacto) {
        log.warn(line(), "Contacto no existe: [" + dto.contactoid + "]");
        throw new ClientError("Contacto no encontrado", 404);
      }

      const contactoToUpdate: Prisma.contactoUpdateInput = {
        nombrecontacto: dto.nombrecontacto,
        apellidocontacto: dto.apellidocontacto,
        cargo: dto.cargo,
        email: dto.email,
        celular: dto.celular,
        telefono: dto.telefono,
        idusuariomod: dto.idusuario ?? 1,
        fechamod: new Date(),
      };

      if (dto.empresaid) {
        const empresa = await empresaDao.getEmpresaByEmpresaid(tx, dto.empresaid);
        if (!empresa) {
          log.warn(line(), "Empresa no existe: [" + dto.empresaid + "]");
          throw new ClientError("Empresa no válida", 404);
        }
        contactoToUpdate.empresa = { connect: { idempresa: empresa.idempresa } };
      }

      const contactoUpdated = await contactoDao.updateContacto(tx, contacto.contactoid, contactoToUpdate);
      log.debug(line(), "contactoUpdated", contactoUpdated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const deleteContactoService = async (dto: DeleteContactoDto) => {
  log.debug(line(), "service::deleteContactoService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const contacto = await contactoDao.getContactoByContactoid(tx, dto.contactoid);
      if (!contacto) {
        log.warn(line(), "Contacto no existe: [" + dto.contactoid + "]");
        throw new ClientError("Contacto no encontrado", 404);
      }

      const result = await contactoDao.deleteContacto(tx, contacto.contactoid, dto.idusuario);
      log.debug(line(), "contactoDeleted:", result);
      return result;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const activateContactoService = async (dto: ActivateContactoDto) => {
  log.debug(line(), "service::activateContactoService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const contacto = await contactoDao.getContactoByContactoid(tx, dto.contactoid);
      if (!contacto) {
        log.warn(line(), "Contacto no existe: [" + dto.contactoid + "]");
        throw new ClientError("Contacto no encontrado", 404);
      }

      const result = await contactoDao.activateContacto(tx, contacto.contactoid, dto.idusuario);
      log.debug(line(), "contactoActivated:", result);
      return result;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getContactoMasterService = async () => {
  log.debug(line(), "service::getContactoMasterService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const empresas = await empresaDao.getEmpresas(tx, filter_estados);

      const contactoMaster: Record<string, any> = {
        empresas,
      };

      return contactoMaster;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
