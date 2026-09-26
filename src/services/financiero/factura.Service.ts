import {
  subirFacturaFactorService as subirFacturaFactorCore,
  getFacturasByFactoringidService as getFacturasByFactoringidCore,
  activateFacturaService as activateFacturaCore,
  deleteFacturaService as deleteFacturaCore,
  getFacturaMasterService as getFacturaMasterCore,
  getFacturasService as getFacturasCore,
  type SubirFacturaFactorDto as CoreSubirFacturaFactorDto,
} from "#src/services/factura.Service.js";
import { line, log } from "#src/utils/logger.pino.js";

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface SubirFacturaFactorDto {
  factura_xml: string;
  factura_pdf: string;
}

export interface GetFacturasByFactoringidDto {
  factoringid: string;
}

export interface OperacionFacturaDto {
  facturaid: string;
  idusuario: number;
}

// ─── Services ────────────────────────────────────────────────────────────────

/**
 * Carga y procesamiento de factura del factor para el perfil financiero.
 */
export const subirFacturaFactorService = async (dto: SubirFacturaFactorDto, idusuario: number) => {
  log.debug(line(), "service::financiero::subirFacturaFactorService");
  return await subirFacturaFactorCore(dto, idusuario);
};

/**
 * Consulta de facturas por identificador de operación de factoring.
 */
export const getFacturasByFactoringidService = async (dto: GetFacturasByFactoringidDto) => {
  log.debug(line(), "service::financiero::getFacturasByFactoringidService");
  return await getFacturasByFactoringidCore(dto.factoringid);
};

/**
 * Activación lógica de factura.
 */
export const activateFacturaService = async (dto: OperacionFacturaDto) => {
  log.debug(line(), "service::financiero::activateFacturaService");
  return await activateFacturaCore(dto.facturaid, dto.idusuario);
};

/**
 * Eliminación lógica de factura con auditoría.
 */
export const deleteFacturaService = async (dto: OperacionFacturaDto) => {
  log.debug(line(), "service::financiero::deleteFacturaService");
  return await deleteFacturaCore(dto.facturaid, dto.idusuario);
};

/**
 * Consulta del catálogo maestro de riesgos para facturación.
 */
export const getFacturaMasterService = async () => {
  log.debug(line(), "service::financiero::getFacturaMasterService");
  return await getFacturaMasterCore();
};

/**
 * Consulta del listado general de facturas.
 */
export const getFacturasService = async () => {
  log.debug(line(), "service::financiero::getFacturasService");
  return await getFacturasCore();
};
