import type { Prisma } from "#src/models/prisma/ft_factoring/client";
import { Request, Response } from "express";
import { prismaFT } from "#root/src/models/prisma/db-factoring.js";

import * as cuentabancariaDao from "#src/daos/cuentabancaria.prisma.Dao.js";
import * as empresaDao from "#src/daos/empresa.prisma.Dao.js";
import * as personaDao from "#src/daos/persona.prisma.Dao.js";
import * as factoringDao from "#src/daos/factoring.prisma.Dao.js";
import * as factoringfacturaDao from "#src/daos/factoringfactura.prisma.Dao.js";
import * as factoringhistorialestadoDao from "#src/daos/factoringhistorialestado.prisma.Dao.js";
import * as facturaDao from "#src/daos/factura.prisma.Dao.js";
import * as contactoDao from "#src/daos/contacto.prisma.Dao.js";
import * as colaboradorDao from "#src/daos/colaborador.prisma.Dao.js";
import * as monedaDao from "#src/daos/moneda.prisma.Dao.js";
import { ClientError } from "#src/utils/CustomErrors.js";
import { response } from "#src/utils/CustomResponseOk.js";
import { log, line } from "#src/utils/logger.pino.js";

import * as luxon from "luxon";

import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";
import type { factoring } from "#src/models/prisma/ft_factoring/client";
import type { factoring_factura } from "#src/models/prisma/ft_factoring/client";

export const getFactorings = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactorings");
  const factorings = await prismaFT.client.$transaction(
    async (tx) => {
      const filter_estados = [1];
      const _idusuario_session = req.session_user.usuario._idusuario;
      const empresas_cedentes = await empresaDao.getEmpresasByIdusuario(tx, _idusuario_session, filter_estados);
      const _idcedentes = empresas_cedentes.map((empresa) => empresa.idempresa);
      const factorings = await factoringDao.getFactoringsByIdcedentes(tx, _idcedentes, filter_estados);
      return factorings;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, factorings);
};

export const getFactoringMaster = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringsMaster");
  const filter_estados = [1];

  const resultado = await prismaFT.client.$transaction(
    async (tx) => {
      return {};
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, {});
};

export const createFactoring = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createFactoring");
  const factoringCreateSchema = yup
    .object()
    .shape({
      facturas: yup
        .array()
        .of(
          yup.object({
            facturaid: yup.string().required().uuid(),
          })
        )
        .min(1),
      cedenteid: yup.string().trim().required().min(36).max(36),
      aceptanteid: yup.string().trim().required().min(36).max(36),
      cuentabancariaid: yup.string().trim().required().min(36).max(36),
      monedaid: yup.string().trim().required().min(36).max(36),
      contactoaceptanteid: yup.string().trim().required().min(36).max(36),
      monto_neto: yup.string().required(),
      fecha_pago_estimado: yup.string().required(),
      dias_pago_estimado: yup.string().required(),
    })
    .required();
  var factoringValidated = factoringCreateSchema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
  //log.debug(line(),"factoringValidated:", factoringValidated);

  const factoringToCreate = await prismaFT.client.$transaction(
    async (tx) => {
      const session_idusuario = req.session_user.usuario._idusuario;
      const filter_estados = [1];
      const facturas = [];

      for (const [index, facturaid] of factoringValidated.facturas.entries()) {
        var factura = await facturaDao.getFacturaByFacturaid(tx, facturaid.facturaid);
        if (!factura) {
          log.warn(line(), "Factura no existe: [" + facturaid.facturaid + "]");
          throw new ClientError("Datos no válidos", 404);
        }

        // Validar si el factoring ya existe
        //JCHR:20250213: Habillitar para producción
        /*
      const filter_estados_factoring = [1];
      const factoring_existe = await factoringDao.getFactoringByRucCedenteAndCodigoFactura(tx, factura.proveedor_ruc, factura.serie, factura.numero_comprobante, filter_estados_factoring);
      if (factoring_existe) {
        log.warn(line(), "Factoring ya existe: [" + factura.proveedor_ruc + ", " + factura.serie + ", " + factura.numero_comprobante + ", " + filter_estados_factoring + "]");
        throw new ClientError("La factura seleccionada ya está vinculada a una operación de factoring activa. Por favor, elija otra factura para continuar con el proceso.", 404);
      }
        */

        facturas.push(factura);
      }

      var cedente = await empresaDao.findEmpresaPk(tx, factoringValidated.cedenteid);
      if (!cedente) {
        log.warn(line(), "Cedente no existe: [" + factoringValidated.cedenteid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var aceptante = await empresaDao.findEmpresaPk(tx, factoringValidated.aceptanteid);
      if (!aceptante) {
        log.warn(line(), "Aceptante no existe: [" + factoringValidated.aceptanteid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var cuentabancaria = await cuentabancariaDao.findCuentabancariaPk(tx, factoringValidated.cuentabancariaid);
      if (!cuentabancaria) {
        log.warn(line(), "Cuenta bancaria  no existe: [" + factoringValidated.cuentabancariaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var moneda = await monedaDao.findMonedaPk(tx, factoringValidated.monedaid);
      if (!moneda) {
        log.warn(line(), "Moneda no existe: [" + factoringValidated.monedaid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var persona = await personaDao.getPersonaByIdusuario(tx, session_idusuario);
      if (!persona) {
        log.warn(line(), "Persona no existe: [" + session_idusuario + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var contactoaceptante = await contactoDao.getContactoByContactoid(tx, factoringValidated.contactoaceptanteid);
      if (!contactoaceptante) {
        log.warn(line(), "Contacto aceptante no existe: [" + factoringValidated.contactoaceptanteid + "]");
        throw new ClientError("Datos no válidos", 404);
      }

      var colaborador = await colaboradorDao.getColaboradorByIdEmpresaAndIdpersona(tx, cedente.idempresa, persona.idpersona);
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

        fecha_pago_estimado: factoringValidated.fecha_pago_estimado,

        factoringid: uuidv4(),
        code: uuidv4().split("-")[0],
        fecha_registro: new Date(),
        fecha_emision: facturas.reduce((min, item) => (!min || new Date(item.fecha_emision) < new Date(min) ? item.fecha_emision : min), null),
        cantidad_facturas: factoringValidated.facturas.length,
        monto_factura: facturas.reduce((acc, item) => acc + (typeof item.importe_bruto === "number" ? item.importe_bruto : 0), 0),
        monto_detraccion: facturas.reduce((acc, item) => acc + (typeof item.detraccion_monto === "number" ? item.detraccion_monto : 0), 0),
        monto_neto: facturas.reduce((acc, item) => acc + (typeof item.importe_neto === "number" ? item.importe_neto : 0), 0),
        idusuariocrea: req.session_user.usuario._idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario._idusuario ?? 1,
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
        usuario_modifica: { connect: { idusuario: req.session_user.usuario._idusuario } },
        comentario: "",
        idusuariocrea: req.session_user.usuario._idusuario ?? 1,
        fechacrea: new Date(),
        idusuariomod: req.session_user.usuario._idusuario ?? 1,
        fechamod: new Date(),
        estado: 1,
      };
      const factoringhistorialestadoCreated = await factoringhistorialestadoDao.insertFactoringhistorialestado(tx, factoringhistorialestadoToCreate);
      log.debug(line(), "factoringhistorialestadoCreated:", factoringhistorialestadoCreated);

      for (const [index, factura] of facturas.entries()) {
        var factoringfacturaFk: Partial<factoring_factura> = {};

        const factoringfacturaToCreate: Prisma.factoring_facturaCreateInput = {
          factoring: { connect: { idfactoring: factoringCreated.idfactoring } },
          factura: { connect: { idfactura: factura.idfactura } },
          idusuariocrea: req.session_user.usuario._idusuario ?? 1,
          fechacrea: new Date(),
          idusuariomod: req.session_user.usuario._idusuario ?? 1,
          fechamod: new Date(),
          estado: 1,
        };
        const factoringfacturaCreated = await factoringfacturaDao.insertFactoringfactura(tx, factoringfacturaToCreate);
        log.debug(line(), "factoringfacturaCreated:", factoringfacturaCreated);
      }

      return factoringToCreate;
    },
    { timeout: prismaFT.transactionTimeout }
  );
  response(res, 201, factoringToCreate);
};
