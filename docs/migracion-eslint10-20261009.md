# Migración del backend a ESLint 10

Fecha: 9 de octubre de 2026.

## Alcance y decisiones

- ESLint 9.27.0 se sustituye por ESLint 10.12.0 y `@eslint/js` 10.0.1.
- Parser y plugin de TypeScript se actualizan juntos a 8.71.1, compatibles con ESLint 10 y el TypeScript 5.8.3 existente.
- `eslint-plugin-import` no declara compatibilidad con ESLint 10. Se sustituye por `eslint-plugin-import-x` 4.17.1 sin forzar ni ignorar peer dependencies.
- El resolver TypeScript 4.4.5 utiliza `import-x/resolver-next` y los aliases `#root` y `#src` declarados en `tsconfig.json`. Se retira el resolver adicional de aliases.
- Las reglas de imports conservan sus niveles: imports no resueltos como error y duplicados como advertencia.
- La regla retirada `no-empty-interface` se sustituye por `no-empty-object-type`, permitiendo tipos objeto vacíos para conservar el alcance sobre interfaces.
- Las seis dependencias nuevas o actualizadas se fijan a versiones exactas. Se conserva `package-lock.json` en formato 2.
- No se modifican fuentes de negocio, TypeScript, Prisma, runners ni scripts del proyecto.

La instalación requirió retirar el conjunto anterior de ESLint y reinstalar el conjunto compatible: la resolución conjunta inicial devolvió ERESOLVE. No se utilizaron `--force` ni `--legacy-peer-deps`. Se desactivaron scripts de instalación y auditoría automática.

## Validación y límites

Se ejecutó `npm.cmd run build` antes y después de la migración, con Node 24.21.0 portable y ruta del ejecutable verificadas. Ambas compilaciones finalizaron correctamente: generación local del cliente Prisma 7.10.0, comprobación TypeScript y compilación tsup de la API y los dos scripts programados.

Por instrucción del usuario no se ejecutaron pruebas, lint, autofix, auditoría de seguridad ni empaquetado de producción. La compilación no carga `eslint.config.js`: queda pendiente comprobar el funcionamiento efectivo del linter y su integración con VS Code. No se afirma que el código esté libre de advertencias o errores de lint.

## Referencias

- [Migración oficial de ESLint 10](https://eslint.org/docs/latest/use/migrate-to-10.0.0).
- [Compatibilidad y resolvers de eslint-plugin-import-x](https://github.com/un-ts/eslint-plugin-import-x).
- [Sustitución de no-empty-interface](https://typescript-eslint.io/rules/no-empty-interface/).
