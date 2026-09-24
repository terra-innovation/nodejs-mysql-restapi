import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";
import { isProduction } from "#src/config.js";
import * as colaboradorDao from "#root/src/daos/colaborador.Dao.js";
import * as contactoDao from "#root/src/daos/contacto.Dao.js";
import * as cuentabancariaDao from "#root/src/daos/cuentabancaria.Dao.js";
import * as empresaDao from "#root/src/daos/empresa.Dao.js";
import * as factoringDao from "#root/src/daos/factoring.Dao.js";
import * as factoringfacturaDao from "#root/src/daos/factoringfactura.Dao.js";
import * as factoringhistorialestadoDao from "#root/src/daos/factoringhistorialestado.Dao.js";
import * as facturaDao from "#root/src/daos/factura.Dao.js";
import * as monedaDao from "#root/src/daos/moneda.Dao.js";
import * as personaDao from "#root/src/daos/persona.Dao.js";
import * as usuarioDao from "#root/src/daos/usuario.Dao.js";
import { ESTADO } from "#src/constants/prisma.Constant.js";
import * as telegramService from "#src/providers/telegram/telegram.Provider.js";
import * as emailService from "#root/src/providers/email/email.Provider.js";
import { newFactoringMessage } from "#src/templates/telegram/factoring.Template.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";
import { line, log } from "#src/utils/logger.pino.js";
import { v4 as uuidv4 } from "uuid";

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface FacturaItemDto {
  facturaid: string;
}

export interface CreateFactoringDto {
  facturas: FacturaItemDto[];
  cedenteid: string;
  aceptanteid: string;
  cuentabancariaid: string;
  monedaid: string;
  contactoaceptanteid: string;
  monto_neto: string;
  fecha_pago_estimado: string;
  dias_pago_estimado: string;
  idusuario: number;
}

export interface GetFactoringsDto {
  idusuario: number;
}

// ─── Services ────────────────────────────────────────────────────────────────

export const getFactoringsService = async (dto: GetFactoringsDto) => {
  log.debug(line(), "service::empresario::getFactoringsService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [ESTADO.ACTIVO];
      const empresas_cedentes = await empresaDao.getEmpresasByIdusuario(tx, dto.idusuario, filter_estados);
      const _idcedentes = empresas_cedentes.map((empresa) => empresa.idempresa);
      const factorings = await factoringDao.getFactoringsByIdcedentes(tx, _idcedentes, filter_estados);
      const factoringsFiltered = jsonUtils.removeAttributesPrivates(factorings);
      return factoringsFiltered;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const getFactoringMasterService = async () => {
  log.debug(line(), "service::empresario::getFactoringMasterService");

  return prismaFT.client.$transaction(
    async (tx) => {
      return {};
    },
    { timeout: prismaFT.transactionTimeout },
  );
};

export const createFactoringService = async (dto: CreateFactoringDto) => {
  log.debug(line(), "service::empresario::createFactoringService");

  return prismaFT.client.$transaction(
    async (tx) => {
      const facturas = [];

      for (const facturaid of dto.facturas) {
        const factura = await facturaDao.getFacturaByFacturaid(tx, facturaid.facturaid);
        if (!factura) {
          log.warn(line(), "Factura no existe: [" + facturaid.facturaid + "]");
          throw new ClientError("Datos no válidos", 404);
        }

        // Validar si el factoring ya existe en producción
        if (isProduction) {
          const filter_estados_factoring = [ESTADO.ACTIVO];
          const factoring_existe = await factoringDao.getFactoringByRucCedenteAndCodigoFactura(
            tx,
            factura.proveedor_ruc,
            factura.serie,
            factura.numero_comprobante,
            filter_estados_factoring,
          );
          if (factoring_existe) {
            log.warn(
              line(),
              "Factoring ya existe: [" +
                factura.proveedor_ruc +
                ", " +
                factura.serie +
                ", " +
                factura.numero_comprobante +
                ", " +
                filter_estados_factoring +
                "]",
            );
            throw new ClientError(
              "La factura seleccionada ya está vinculada a una operación de factoring activa. Por favor, elija otra factura para continuar con el proceso.",
              404,
            );
          }
        }

        facturas.push(factura);
      }

      const cedente = await empresaDao.findEmpresaPk(tx, dto.cedenteid);
      if (!cedente) {
        log.warn(line(), "Cedente no existe: [" + dto.cedenteid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const aceptante = await empresaDao.findEmpresaPk(tx, dto.aceptanteid);
      if (!aceptante) {
        log.warn(line(), "Aceptante no existe: [" + dto.aceptanteid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const cuentabancaria = await cuentabancariaDao.findCuentabancariaPk(tx, dto.cuentabancariaid);
      if (!cuentabancaria) {
        log.warn(line(), "Cuenta bancaria no existe: [" + dto.cuentabancariaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const moneda = await monedaDao.findMonedaPk(tx, dto.monedaid);
      if (!moneda) {
        log.warn(line(), "Moneda no existe: [" + dto.monedaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const persona = await personaDao.getPersonaByIdusuario(tx, dto.idusuario);
      if (!persona) {
        log.warn(line(), "Persona no existe: [" + dto.idusuario + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const contactoaceptante = await contactoDao.getContactoByContactoid(tx, dto.contactoaceptanteid);
      if (!contactoaceptante) {
        log.warn(line(), "Contacto aceptante no existe: [" + dto.contactoaceptanteid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const colaborador = await colaboradorDao.getColaboradorByIdEmpresaAndIdpersona(
        tx,
        cedente.idempresa,
        persona.idpersona,
      );
      if (!colaborador) {
        log.warn(line(), "Contacto cedente no existe: [" + cedente.idempresa + ", " + persona.idpersona + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      const idfactoringestado = 1; // Por defecto

      const factoringToCreate: Prisma.factoringCreateInput = {
        empresa_cedente: { connect: { idempresa: cedente.idempresa } },
        empresa_aceptante: { connect: { idempresa: aceptante.idempresa } },
        cuenta_bancaria: { connect: { idcuentabancaria: cuentabancaria.idcuentabancaria } },
        moneda: { connect: { idmoneda: moneda.idmoneda } },
        contacto_aceptante: { connect: { idcontacto: contactoaceptante.idcontacto } },
        contacto_cedente: { connect: { idcolaborador: colaborador.idcolaborador } },
        factoring_estado: { connect: { idfactoringestado: idfactoringestado } },

        fecha_pago_estimado: dto.fecha_pago_estimado ? new Date(dto.fecha_pago_estimado) : null,

        factoringid: uuidv4(),
        code: uuidv4().split("-")[0],
        fecha_registro: new Date(),
        fecha_emision: facturas.reduce(
          (min, item) => (!min || new Date(item.fecha_emision) < new Date(min) ? item.fecha_emision : min),
          null,
        ),
        cantidad_facturas: dto.facturas.length,
        monto_factura: facturas.reduce((acc, item) => acc + (item.importe_bruto ? item.importe_bruto : 0), 0),
        monto_detraccion: facturas.reduce((acc, item) => acc + (item.detraccion_monto ? item.detraccion_monto : 0), 0),
        monto_retencion: facturas.reduce((acc, item) => acc + (item.retencion_monto ? item.retencion_monto : 0), 0),
        monto_neto: facturas.reduce((acc, item) => acc + (item.importe_neto ? item.importe_neto : 0), 0),
        idusuariocrea: dto.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: dto.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };

      const factoringCreated = await factoringDao.insertFactoring(tx, factoringToCreate);
      log.debug(line(), "factoringCreated:", factoringCreated);

      const factoringhistorialestadoToCreate: Prisma.factoring_historial_estadoCreateInput = {
        factoringhistorialestadoid: uuidv4(),
        code: uuidv4().split("-")[0],
        factoring: { connect: { idfactoring: factoringCreated.idfactoring } },
        factoring_estado: { connect: { idfactoringestado: idfactoringestado } },
        usuario_modifica: { connect: { idusuario: dto.idusuario } },
        comentario: "",
        idusuariocrea: dto.idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: dto.idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };
      const factoringhistorialestadoCreated = await factoringhistorialestadoDao.insertFactoringhistorialestado(
        tx,
        factoringhistorialestadoToCreate,
      );
      log.debug(line(), "factoringhistorialestadoCreated:", factoringhistorialestadoCreated);

      for (const factura of facturas) {
        const factoringfacturaToCreate: Prisma.factoring_facturaCreateInput = {
          factoring: { connect: { idfactoring: factoringCreated.idfactoring } },
          factura: { connect: { idfactura: factura.idfactura } },
          idusuariocrea: dto.idusuario ?? 1,
          fechacrea: new Date(),
          idusuariomod: dto.idusuario ?? 1,
          fechamod: new Date(),
          estado: 1,
        };
        const factoringfacturaCreated = await factoringfacturaDao.insertFactoringfactura(
          tx,
          factoringfacturaToCreate,
        );
        log.debug(line(), "factoringfacturaCreated:", factoringfacturaCreated);
      }

      // Enviamos correo electrónico
      const factoring_for_email = await factoringDao.getFactoringByIdfactoring(tx, factoringCreated.idfactoring);
      const usuario_for_email = await usuarioDao.getUsuarioByIdusuario(tx, dto.idusuario);

      const paramsEmail = {
        factoring: factoring_for_email,
        usuario: usuario_for_email,
      };
      if (usuario_for_email?.email) {
        await emailService.sendFactoringEmpresaServicioFactoringSolicitud(usuario_for_email.email, paramsEmail);
      }

      const msnTelegram = newFactoringMessage(factoringToCreate);
      telegramService.sendMessageImportant(msnTelegram);

      return factoringCreated;
    },
    { timeout: prismaFT.transactionTimeout },
  );
};
