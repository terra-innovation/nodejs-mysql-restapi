import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import * as contactoDao from "#root/src/daos/contacto.Dao.js";
import * as empresaDao from "#root/src/daos/empresa.Dao.js";
import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import * as facturaDao from "#root/src/daos/factura.Dao.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import { v4 as uuidv4 } from "uuid";

export interface UpdateContactoDto {
  contactoid: string;
  nombrecontacto: string;
  apellidocontacto: string;
  cargo: string;
  email: string;
  celular: string;
  telefono: string;
}

export interface CreateContactoDto {
  empresaid: string;
  nombrecontacto: string;
  apellidocontacto: string;
  cargo: string;
  email: string;
  celular: string;
  telefono: string;
}

export interface ContactoFactoringFilterDto {
  facturaid: string;
  empresaid: string;
}

export interface CreateContactoForFactoringDto {
  facturaid: string;
  empresaid: string;
  nombrecontacto: string;
  apellidocontacto: string;
  cargo: string;
  email: string;
  celular: string;
  telefono: string;
}

export const updateContactoService = async (
  session_idusuario: number,
  payload: UpdateContactoDto,
) => {
  log.debug(line(), "service::updateContactoService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [1, 2];
      const contacto = await contactoDao.getContactoByContactoid(tx, payload.contactoid);
      if (!contacto) {
        log.warn(line(), "Contacto no existe: [" + payload.contactoid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const empresas_cedentes = await empresaDao.getEmpresasByIdusuario(tx, session_idusuario, filter_estados);
      const _idcedentes = empresas_cedentes.map((empresa) => empresa.idempresa);
      const factorings = await factoringDao.getFactoringsByIdcedentes(tx, _idcedentes, filter_estados);
      const contactoAllowed = factorings.find((factoring) => factoring.idaceptante === contacto.idempresa);

      if (!contactoAllowed) {
        log.warn(line(), "Empresa aceptante no asociada al usuario: [" + contacto.idempresa + ", " + session_idusuario + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const contactoToUpdate: Prisma.contactoUpdateInput = {
        nombrecontacto: payload.nombrecontacto,
        apellidocontacto: payload.apellidocontacto,
        cargo: payload.cargo,
        email: payload.email,
        celular: payload.celular,
        telefono: payload.telefono,
        idusuariomod: session_idusuario ?? 1,
        fechamod: new Date(),
      };

      const contactoUpdated = await contactoDao.updateContacto(tx, contacto.contactoid, contactoToUpdate);
      log.debug(line(), "contactoUpdated", contactoUpdated);

      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const createContactoService = async (
  session_idusuario: number,
  payload: CreateContactoDto,
) => {
  log.debug(line(), "service::createContactoService");
  const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const empresa = await empresaDao.getEmpresaByEmpresaid(tx, payload.empresaid);
      if (!empresa) {
        log.warn(line(), "Empresa no existe: [" + payload.empresaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const empresas_cedentes = await empresaDao.getEmpresasByIdusuario(tx, session_idusuario, filter_estados);
      const _idcedentes = empresas_cedentes.map((empresa) => empresa.idempresa);
      const factorings = await factoringDao.getFactoringsByIdcedentes(tx, _idcedentes, filter_estados);
      const empresa_aceptante_por_idusuario = factorings.find((factoring) => factoring.idaceptante === empresa.idempresa);

      if (!empresa_aceptante_por_idusuario) {
        log.warn(line(), "Empresa aceptante no asociada al usuario: [" + payload.empresaid + ", " + session_idusuario + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const contacto_por_email = await contactoDao.getContactosByIdempresaAndEmail(
        tx,
        empresa_aceptante_por_idusuario.idaceptante,
        payload.email,
        filter_estado,
      );
      if (contacto_por_email && contacto_por_email.length > 0) {
        log.warn(line(), "El email [" + payload.email + "] se encuentra registrado. Ingrese un contacto diferente.");
        throw new ClientError("El email [" + payload.email + "] se encuentra registrado. Ingrese un contacto diferente.", 404);
      }

      const contactoToCreate: Prisma.contactoCreateInput = {
        empresa: { connect: { idempresa: empresa.idempresa } },
        contactoid: uuidv4(),
        code: uuidv4().split("-")[0],
        nombrecontacto: payload.nombrecontacto,
        apellidocontacto: payload.apellidocontacto,
        cargo: payload.cargo,
        email: payload.email,
        celular: payload.celular,
        telefono: payload.telefono,
        idusuariocrea: session_idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: session_idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const contactoCreated = await contactoDao.insertContacto(tx, contactoToCreate);
      log.debug(line(), "contactoCreated:", contactoCreated);

      const contactoFiltered = jsonUtils.removeAttributesPrivates(contactoCreated);
      return contactoFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getContactosService = async (session_idusuario: number) => {
  log.debug(line(), "service::getContactosService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const empresas_cedentes = await empresaDao.getEmpresasByIdusuario(tx, session_idusuario, filter_estados);
      const _idcedentes = empresas_cedentes.map((empresa) => empresa.idempresa);
      const factorings = await factoringDao.getFactoringsByIdcedentes(tx, _idcedentes, filter_estados);
      const _idaceptantes = factorings.map((factoring) => factoring.idaceptante);
      const contactos = await contactoDao.getContactosByIdempresas(tx, _idaceptantes, filter_estados);

      let contactosFiltered = jsonUtils.removeAttributes(contactos, ["score"]);
      contactosFiltered = jsonUtils.removeAttributesPrivates(contactosFiltered);
      return contactosFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getContactoMasterService = async (session_idusuario: number) => {
  log.debug(line(), "service::getContactoMasterService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const empresas_cedentes = await empresaDao.getEmpresasByIdusuario(tx, session_idusuario, filter_estados);
      const _idcedentes = empresas_cedentes.map((empresa) => empresa.idempresa);
      const factorings = await factoringDao.getFactoringsByIdcedentes(tx, _idcedentes, filter_estados);
      const _idaceptantes = factorings.map((factoring) => factoring.idaceptante);
      const aceptantes = await empresaDao.getEmpresasByIdempresas(tx, _idaceptantes, filter_estados);

      const contactoMaster: Record<string, any> = {
        aceptantes,
      };

      const contactoMasterFiltered = jsonUtils.removeAttributesPrivates(contactoMaster);
      return contactoMasterFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getContactosForFactoringService = async (
  session_idusuario: number,
  payload: ContactoFactoringFilterDto,
) => {
  log.debug(line(), "service::getContactosForFactoringService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const empresa = await empresaDao.getEmpresaByEmpresaid(tx, payload.empresaid);
      if (!empresa) {
        log.warn(line(), "Empresa no existe: [" + payload.empresaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factura = await facturaDao.getFacturaByFacturaid(tx, payload.facturaid);
      if (!factura) {
        log.warn(line(), "Factura no existe: [" + payload.facturaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factura_upload = await facturaDao.getFacturaByIdfacturaAndIdusuarioupload(tx, factura.idfactura, session_idusuario);
      if (!factura_upload) {
        log.warn(line(), "Factura no asociada al usuario: ", { factura, session_idusuario });
        throw new ClientError("Datos no válidos", 404);
      }

      const isEmpresaAllowed = empresa.ruc === factura_upload.cliente_ruc;
      if (!isEmpresaAllowed) {
        log.warn(line(), "Empresa aceptante no asociada a la factura: ", { empresa, factura_upload });
        throw new ClientError("Datos no válidos", 404);
      }

      const contactos = await contactoDao.getContactosByIdempresas(tx, [empresa.idempresa], filter_estados);

      let contactosFiltered = jsonUtils.removeAttributes(contactos, ["score"]);
      contactosFiltered = jsonUtils.removeAttributesPrivates(contactosFiltered);
      return contactosFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const createContactoForFactoringService = async (
  session_idusuario: number,
  payload: CreateContactoForFactoringDto,
) => {
  log.debug(line(), "service::createContactoForFactoringService");
  const filter_estado = [ESTADO.ACTIVO, ESTADO.ELIMINADO];

  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const empresa = await empresaDao.getEmpresaByEmpresaid(tx, payload.empresaid);
      if (!empresa) {
        log.warn(line(), "Empresa no existe: [" + payload.empresaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factura = await facturaDao.getFacturaByFacturaid(tx, payload.facturaid);
      if (!factura) {
        log.warn(line(), "Factura no existe: [" + payload.facturaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factura_upload = await facturaDao.getFacturaByIdfacturaAndIdusuarioupload(tx, factura.idfactura, session_idusuario);
      if (!factura_upload) {
        log.warn(line(), "Factura no asociada al usuario: ", { factura, session_idusuario });
        throw new ClientError("Datos no válidos", 404);
      }

      const isEmpresaAllowed = empresa.ruc === factura_upload.cliente_ruc;
      if (!isEmpresaAllowed) {
        log.warn(line(), "Empresa aceptante no asociada a la factura: ", { empresa, factura_upload });
        throw new ClientError("Datos no válidos", 404);
      }

      const contacto_por_email = await contactoDao.getContactosByIdempresaAndEmail(tx, empresa.idempresa, payload.email, filter_estado);
      if (contacto_por_email && contacto_por_email.length > 0) {
        log.warn(line(), "El email [" + payload.email + "] se encuentra registrado. Ingrese un contacto diferente.");
        throw new ClientError("El email [" + payload.email + "] se encuentra registrado. Ingrese un contacto diferente.", 404);
      }

      const contactoToCreate: Prisma.contactoCreateInput = {
        empresa: { connect: { idempresa: empresa.idempresa } },
        contactoid: uuidv4(),
        code: uuidv4().split("-")[0],
        nombrecontacto: payload.nombrecontacto,
        apellidocontacto: payload.apellidocontacto,
        cargo: payload.cargo,
        email: payload.email,
        celular: payload.celular,
        telefono: payload.telefono,
        idusuariocrea: session_idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: session_idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const contactoCreated = await contactoDao.insertContacto(tx, contactoToCreate);
      log.debug(line(), "contactoCreated:", contactoCreated);

      const contactoFiltered = jsonUtils.removeAttributesPrivates(contactoCreated);
      return contactoFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getContactoMasterForFactoringService = async (
  session_idusuario: number,
  payload: ContactoFactoringFilterDto,
) => {
  log.debug(line(), "service::getContactoMasterForFactoringService");
  return await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const empresa = await empresaDao.getEmpresaByEmpresaid(tx, payload.empresaid);
      if (!empresa) {
        log.warn(line(), "Empresa no existe: [" + payload.empresaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factura = await facturaDao.getFacturaByFacturaid(tx, payload.facturaid);
      if (!factura) {
        log.warn(line(), "Factura no existe: [" + payload.facturaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const factura_upload = await facturaDao.getFacturaByIdfacturaAndIdusuarioupload(tx, factura.idfactura, session_idusuario);
      if (!factura_upload) {
        log.warn(line(), "Factura no asociada al usuario: ", { factura, session_idusuario });
        throw new ClientError("Datos no válidos", 404);
      }

      const isEmpresaAllowed = empresa.ruc === factura_upload.cliente_ruc;
      if (!isEmpresaAllowed) {
        log.warn(line(), "Empresa aceptante no asociada a la factura: ", { empresa, factura_upload });
        throw new ClientError("Datos no válidos", 404);
      }

      const contactoMaster: Record<string, any> = {
        aceptantes: [empresa],
      };

      const contactoMasterFiltered = jsonUtils.removeAttributesPrivates(contactoMaster);
      return contactoMasterFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
