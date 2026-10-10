# Tipos globales de Jest tras la migración de TypeScript

Fecha: 9 de octubre de 2026.

## Causa y corrección

El usuario reportó 15 suites detenidas antes de ejecutar casos por TS2304 en
`tests/e2e/setup.ts`: `beforeAll` no estaba disponible para el comprobador de tipos.
La API TypeScript 6.0.3 utilizada por ts-jest también reportaba `afterAll`.
Desde TypeScript 6, los paquetes de tipos globales no se incluyen automáticamente.

Se añade `tests/tsconfig.jest.json` con `types: ["node", "jest"]` y se configura
el transformador ts-jest para utilizarlo. El alcance incluye las suites y archivos
auxiliares de Jest; no añade globales de Jest al backend ni a Vitest.
No se desactivan diagnósticos ni se modifican expectativas.

## Verificación y límites

Con Node 24.21.0 portable, la comprobación de tipos aislada de `tests/e2e/setup.ts`
con la API TypeScript utilizada por ts-jest reprodujo TS2304 para ambos hooks antes
del ajuste. Con la nueva configuración, esa misma comprobación finalizó sin
diagnósticos. No se ejecutaron suites, compilaciones de producción ni conexiones
a bases de datos. Esta comprobación no certifica el resto de las pruebas.

Siguiente comprobación sugerida al usuario:
`npm.cmd test -- --runInBand --runTestsByPath tests/unit/utils/dateUtils.test.ts`.
Si pasa, ejecutar `npm.cmd run test:all` conservando el resultado completo.

Referencia: [TypeScript 6: cambios de configuración](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-6-0.html).
