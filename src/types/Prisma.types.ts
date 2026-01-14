import type { Prisma } from "#root/generated/prisma/ft_factoring/client.js";

export type TxClient = Prisma.TransactionClient;

// Tipo exacto del usuario con roles incluidos
export type UsuarioConRoles = Prisma.usuarioGetPayload<{
  include: {
    usuario_roles: {
      include: {
        rol: true;
      };
    };
  };
}>;

export type FactoringPDF = Prisma.factoringGetPayload<{
  include: {
    contacto_aceptante: true;
    contacto_cedente: true;
    cuenta_bancaria: {
      include: {
        banco: true;
        cuenta_bancaria_estado: true;
        cuenta_tipo: true;
        moneda: true;
      };
    };
    empresa_aceptante: true;
    empresa_cedente: true;
    factoring_ejecutado: true;
    factoring_ejecutado_factoringes: true;
    factoring_estado: true;
    factoring_facturas: { include: { factura: true } };
    factoring_historial_estados: true;
    factoring_pagos: true;
    factoring_propuesta_aceptada: true;
    factoring_propuesta_factoringes: {
      include: {
        factoring_propuesta_estado: true;
      };
    };
    moneda: true;
  };
}>;

export type FactoringpropuestaPDF = Prisma.factoring_propuestaGetPayload<{
  include: {
    factoring: true;
    factoring_estrategia: true;
    factoring_factoringpropuestaaceptadas: true;
    factoring_propuesta_estado: true;
    factoring_propuesta_financieros: {
      include: {
        financiero_concepto: true;
        financiero_tipo: true;
      };
    };
    factoring_tipo: true;
    riesgo_aceptante: true;
    riesgo_cedente: true;
    riesgo_operacion: true;
  };
}>;

export type FactoringsimulacionPDF = Prisma.factoring_simulacionGetPayload<{
  include: {
    banco: true;
    factoring_estrategia: true;
    factoring_simulacion_financieros: {
      include: {
        financiero_concepto: true;
        financiero_tipo: true;
      };
    };
    factoring_tipo: true;
    riesgo_operacion: true;
    moneda: true;
  };
}>;
