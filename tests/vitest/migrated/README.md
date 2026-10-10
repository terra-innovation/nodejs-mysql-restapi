# Suites migradas desde Jest

Esta carpeta recibe únicamente suites ya adaptadas a Vitest. Conservar la ruta
relativa original: `tests/unit/utils/dateUtils.test.ts` pasa a
`tests/vitest/migrated/unit/utils/dateUtils.test.ts`. No fusionar todavía con las
suites de negocio existentes: comparar primero cada caso con la
[línea base de Jest](../../../../docs/migracion-jest-vitest-linea-base-20261010.json).

Todas las suites seleccionadas en la línea base de Jest están migradas y sus
originales se retiraron después de verificar equivalencia. `e2e/index.test.ts`
también está adaptada, pero permanece excluida y sin ejecución. Jest, su configuración y sus soportes exclusivos ya se retiraron.
La configuración principal descubre aquí `.test.ts`, `.spec.ts` y
archivos `.ts` dentro de `__tests__`. `tests/vitest/tsconfig.json` ya incluye
recursivamente los archivos de esta carpeta, sin tipos globales de Jest.

## Incorporar un grupo (pasos 3 y 4)

1. Adaptar solo el grupo seleccionado; importar hooks, aserciones y `vi` desde
   `vitest`, y tipos `Mock`/`Mocked` con `import type`. No habilitar globals ni
   crear un alias global `jest = vi`.
2. Usar factories de `vi.mock` con exports ESM (incluido `default` cuando
   corresponda). Revisar hoisting; los objetos compartidos que deban existir
   antes de los imports requieren `vi.hoisted`. `jest.requireActual` requiere
   una adaptación asíncrona con `vi.importActual` o `importOriginal`.
3. El mock de `file-type` debe declararse en la suite que lo necesita, por
   ejemplo `vi.mock("file-type", () => ({ fileTypeFromFile: vi.fn() }))`.
   No añadir alias global al mock Jest: otras suites prueban MIME real.
4. Mantener limpieza explícita de temporizadores, `Settings.defaultZone`,
   `Settings.now`, cachés Luxon y archivos locales. `clearMocks`/`restoreMocks`
   no restauran todo ese estado. No convertir casos a ejecución concurrente.
5. Mantener mocks de DAOs, Prisma, configuración y proveedores; no cargar
   conexiones reales como consecuencia de una factory que dejó de aplicarse.
   Prisma ESM se transforma con Vite; no trasladar el transformador ts-jest.
6. Ejecutar tipos y el grupo migrado, y comparar nombres, parámetros, estados
   y expectativas con su origen antes de retirar el archivo de Jest.

Comandos desde la raíz, con Node portable y `CI=true` según `AGENTS.md`:

```powershell
npm.cmd run test:vitest:typecheck
npm.cmd run test:vitest -- tests/vitest/migrated/unit/utils/dateUtils.test.ts
npm.cmd run test:vitest -- tests/vitest/migrated
```

El último comando ejecuta todos los grupos migrados. No usar `passWithNoTests`
para ocultar una selección vacía. La selección completa actual continúa con
`npm.cmd test` (equivalente a `npm.cmd run test:vitest`).

## Exclusiones y setup

`e2e/index.test.ts` permanece excluida en esta carpeta: no forma parte de
la selección ejecutada de Jest. Activarla requiere una decisión explícita.
Pruebas manuales y MariaDB se mantienen fuera de esta selección.

Se retiró el setup antiguo, que solo imprimía mensajes. Las suites migradas
mantienen sus propios hooks funcionales. Se conservan aislamiento por archivo, limpieza de mocks,
restauración de stubs y cuatro workers de la configuración actual de Vitest.
El aislamiento no sustituye restaurar estado entre casos.

Referencia: [guía oficial de migración](https://main.vitest.dev/guide/migration/).
