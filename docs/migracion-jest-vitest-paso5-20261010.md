# Paso 5: retirada de Jest

Jest y sus soportes exclusivos (`ts-jest`, `@types/jest`) se retiraron con npm,
conservando `package-lock.json`. No cambiaron las versiones de los paquetes
retenidos ni se añadieron paquetes. TypeScript y su compilador nativo se conservan:
siguen siendo necesarios para las herramientas y los controles de tipos.

## Cambios

- `npm test` ejecuta Vitest con la misma configuración que `test:vitest` y permite
  pasar filtros directamente. `test:all` comprueba tipos de Vitest y ejecuta la
  selección rápida una sola vez; no representa todos los controles de CI.
- `typecheck:all` conserva backend, Vitest e integración. Se retiraron los scripts
  específicos de Jest, sus dos configuraciones, el tsconfig, el transformador Prisma,
  el mock global de file-type y el setup que solo imprimía mensajes.
- CI conserva un paso de Vitest con cobertura y JUnit. El contrato de fechas del
  frontend, su variable de entorno y la verificación de integridad pasan a ese
  paso; no se modifican umbrales de cobertura ni el job de integración.
- Se actualizaron guías operativas, instrucciones locales y recomendaciones de
  VS Code. Las evidencias históricas de Jest se conservan y el título de su ejemplo
  básico permanece para mantener la correspondencia de casos.
- `tests/vitest/migrated/e2e/index.test.ts` continúa excluido. MariaDB y scripts
  manuales siguen fuera de `npm test`.

## Validación actual

Con Node portable 24.21.0 verificado y `CI=true` para las pruebas:

- `npm test -- --reporter=json --outputFile=coverage/jest-migration-step5/results.json`:
  37 archivos, 3.505 casos aprobados, tres `todo` y ningún fallo. Comparación
  exacta de archivo, nombre y estado frente al reporte completo anterior a
  desinstalar: sin diferencias. [Resultado](migracion-jest-vitest-paso5-20261010.json).
- `npm run typecheck:all`: aprobado en los tres proyectos.
- `npm ls jest ts-jest @types/jest --all`: árbol vacío. npm devuelve código 1
  ante esa selección vacía; no es un fallo de instalación.
- Formato de configuraciones, lockfile y suites migradas: aprobado.
- YAML del workflow analizado con el parser instalado de Prettier; integridad del
  contrato de fechas verificada con el script existente.

La ejecución funcional usa las simulaciones y el alcance de las suites rápidas;
no acredita persistencia MariaDB ni E2E. No se ejecutaron en este paso cobertura,
lint, compilación, integración/runtime ni GitHub Actions. La validación final del
paso 6 debe ejecutar los controles pendientes y revisar el diff completo.
