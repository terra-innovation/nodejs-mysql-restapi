-- Aplicar exclusivamente en la base de Factoring seleccionada para el despliegue.
-- No ejecutado por Codex. Respaldo y ventana de cambio según el entorno.
-- Ampliación: conserva los ocho enteros existentes y agrega ocho decimales.
-- No modificar monto, IGV, total ni importes históricos; no reducir la escala al revertir código.
ALTER TABLE factoring_liquidacion_financiero
  MODIFY COLUMN cantidad DECIMAL(18,10) NOT NULL DEFAULT 0.0000000000,
  MODIFY COLUMN monto_unitario DECIMAL(18,10) NOT NULL DEFAULT 0.0000000000;
