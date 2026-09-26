import { response } from "#src/utils/CustomResponseOk.js";
import { line, log } from "#src/utils/logger.pino.js";
import { Request, Response } from "express";
import * as yup from "yup";
import {
  activateFactoringfacturafactorService,
  createFactoringfacturafactorService,
  deleteFactoringfacturafactorService,
  getFactoringfacturafactorMasterByFactoringidService,
  getFactoringfacturafactoresByFactoringidService,
  updateFactoringfacturafactorService,
} from "#src/services/admin/factoringfacturafactor.Service.js";

export const activateFactoringfacturafactor = async (req: Request, res: Response) => {
  log.debug(line(), "controller::activateFactoringfacturafactor");
  const { id } = req.params;
  const factoringfacturafactorSchema = yup
    .object()
    .shape({
      factoringfacturafactorid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const validated = factoringfacturafactorSchema.validateSync(
    { factoringfacturafactorid: id },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "validated:", validated);

  const data = await activateFactoringfacturafactorService({
    factoringfacturafactorid: validated.factoringfacturafactorid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, data);
};

export const deleteFactoringfacturafactor = async (req: Request, res: Response) => {
  log.debug(line(), "controller::deleteFactoringfacturafactor");
  const { id } = req.params;
  const factoringfacturafactorSchema = yup
    .object()
    .shape({
      factoringfacturafactorid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const validated = factoringfacturafactorSchema.validateSync(
    { factoringfacturafactorid: id },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "validated:", validated);

  const data = await deleteFactoringfacturafactorService({
    factoringfacturafactorid: validated.factoringfacturafactorid,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 204, data);
};

export const updateFactoringfacturafactor = async (req: Request, res: Response) => {
  log.debug(line(), "controller::updateFactoringfacturafactor");
  const { id } = req.params;
  const factoringfacturafactorUpdateSchema = yup
    .object()
    .shape({
      factoringfacturafactorid: yup.string().trim().required().min(36).max(36),
      facturaestadoid: yup.string().trim().required().min(36).max(36),
      detraccionestadoid: yup.string().trim().required().min(36).max(36),
      detraccionarchivoid: yup.string().trim().min(36).max(36),
      fecha_pago_factura: yup
        .string()
        .nullable()
        .optional()
        .matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, "Formato inválido: debe ser ISO UTC (YYYY-MM-DDTHH:mm:ssZ)")
        .test("is-valid-date", "Fecha inválida", (value) => {
          if (!value) return true;
          const date = new Date(value);
          return !isNaN(date.getTime());
        }),
      fecha_pago_detraccion: yup
        .string()
        .nullable()
        .optional()
        .matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, "Formato inválido: debe ser ISO UTC (YYYY-MM-DDTHH:mm:ssZ)")
        .test("is-valid-date", "Fecha inválida", (value) => {
          if (!value) return true;
          const date = new Date(value);
          return !isNaN(date.getTime());
        }),
    })
    .required();

  const validated = factoringfacturafactorUpdateSchema.validateSync(
    { factoringfacturafactorid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "validated:", validated);

  const updated = await updateFactoringfacturafactorService({
    factoringfacturafactorid: validated.factoringfacturafactorid,
    facturaestadoid: validated.facturaestadoid,
    detraccionestadoid: validated.detraccionestadoid,
    detraccionarchivoid: validated.detraccionarchivoid,
    fecha_pago_factura: validated.fecha_pago_factura,
    fecha_pago_detraccion: validated.fecha_pago_detraccion,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 200, updated);
};

export const createFactoringfacturafactor = async (req: Request, res: Response) => {
  log.debug(line(), "controller::createFactoringfacturafactor");
  const factoringfacturafactorSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
      facturaid: yup.string().trim().required().min(36).max(36),
      facturaestadoid: yup.string().trim().required().min(36).max(36),
      detraccionestadoid: yup.string().trim().required().min(36).max(36),
      detraccionarchivoid: yup.string().trim().min(36).max(36),
      fecha_pago_factura: yup
        .string()
        .nullable()
        .optional()
        .matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, "Formato inválido: debe ser ISO UTC (YYYY-MM-DDTHH:mm:ssZ)")
        .test("is-valid-date", "Fecha inválida", (value) => {
          if (!value) return true;
          const date = new Date(value);
          return !isNaN(date.getTime());
        }),
      fecha_pago_detraccion: yup
        .string()
        .nullable()
        .optional()
        .matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, "Formato inválido: debe ser ISO UTC (YYYY-MM-DDTHH:mm:ssZ)")
        .test("is-valid-date", "Fecha inválida", (value) => {
          if (!value) return true;
          const date = new Date(value);
          return !isNaN(date.getTime());
        }),
    })
    .required();

  const validated = factoringfacturafactorSchema.validateSync(
    { ...req.body },
    { abortEarly: false, stripUnknown: true },
  );

  const created = await createFactoringfacturafactorService({
    factoringid: validated.factoringid,
    facturaid: validated.facturaid,
    facturaestadoid: validated.facturaestadoid,
    detraccionestadoid: validated.detraccionestadoid,
    detraccionarchivoid: validated.detraccionarchivoid,
    fecha_pago_factura: validated.fecha_pago_factura,
    fecha_pago_detraccion: validated.fecha_pago_detraccion,
    idusuario: req.session_user?.usuario?.idusuario ?? 1,
  });

  response(res, 201, created);
};

export const getFactoringfacturafactoresByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringfacturafactoresByFactoringid");
  const { id } = req.params;
  const factoringfacturafactorSearchSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const validated = factoringfacturafactorSearchSchema.validateSync(
    { factoringid: id, ...req.body },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "validated:", validated);

  const list = await getFactoringfacturafactoresByFactoringidService({
    factoringid: validated.factoringid,
  });

  response(res, 201, list);
};

export const getFactoringfacturafactorMasterByFactoringid = async (req: Request, res: Response) => {
  log.debug(line(), "controller::getFactoringfacturafactorMasterByFactoringid");
  const { factoringid } = req.params;
  const factoringfacturafactorSchema = yup
    .object()
    .shape({
      factoringid: yup.string().trim().required().min(36).max(36),
    })
    .required();

  const validated = factoringfacturafactorSchema.validateSync(
    { factoringid },
    { abortEarly: false, stripUnknown: true },
  );
  log.debug(line(), "validated:", validated);

  const master = await getFactoringfacturafactorMasterByFactoringidService({
    factoringid: validated.factoringid,
  });

  response(res, 201, master);
};
