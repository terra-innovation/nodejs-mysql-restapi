# Referencia del contrato de fechas del frontend

`src/utils/dateUtils.js` es una copia exacta del helper de `ft-app-frontend-mantis`, capturada el 10 de octubre de 2026. Revisión, tamaño y SHA-256 están en `provenance.json`. El archivo estaba sin modificaciones locales al capturarlo.

CI establece `LIQUIDACION_FRONTEND_ROOT` a esta carpeta para que `scripts/analisis/fecha-liquidacion-frontend.cjs` ejecute la referencia con las mismas suites y expectativas. El ayudante no cambia: localmente conserva su ruta predeterminada al frontend real y admite esa variable para seleccionar explícitamente la copia.

No editar ni reformatear el helper. `.gitattributes` preserva sus bytes y `.prettierignore` lo excluye. `node scripts/quality/verify-frontend-date-contract.mjs` comprueba hash y tamaño sin ejecutar el código. La integridad acredita correspondencia con la captura, no sincronización con el frontend actual.

Actualizarlo requiere revisar el diff de fechas del frontend, copiar de nuevo el archivo completo, registrar la revisión y SHA-256 nuevos y validar ambos lados sin debilitar expectativas. No actualizarlo automáticamente para hacer pasar CI.

Deuda abierta: [DT-CI-01: sincronización del contrato de fechas](../../../docs/deuda-tecnica/20261010_DT_CI_01_contrato_fechas_frontend.md).
