# Migración gradual a TypeScript 7.0.2

Fecha: 9 de octubre de 2026.

## Alcance y decisión

El compilador habitual (`tsc`) pasa de TypeScript 5.8.3 a 7.0.2. Se conserva tsup como empaquetador y no se modifican contratos HTTP, reglas financieras ni código de negocio.

TypeScript 7.0 no ofrece la API programática que utilizan typescript-eslint, ts-jest y otras herramientas. Se adopta la coexistencia oficial mediante aliases npm, con versiones directas exactas:

- `@typescript/native`: `npm:typescript@7.0.2`, que proporciona el comando `tsc`.
- `typescript`: `npm:@typescript/typescript6@6.0.2`, paquete oficial de compatibilidad que proporciona la API clásica y `tsc6`. El lockfile resuelve su dependencia `@typescript/old` a TypeScript 6.0.3; por eso `require('typescript').version` devuelve 6.0.3. Eso no identifica la versión del compilador habitual.
- `ts-jest`: 29.4.14, cuyo rango declarado admite TypeScript 6. La versión anterior 29.4.6 exigía TypeScript menor que 6.

Se conserva `package-lock.json` en formato 2. La instalación se hizo con npm, sin scripts de instalación, auditoría automática ni opciones para ignorar conflictos de peers. No se actualizan otros paquetes directos. La actualización de ts-jest también resuelve las dependencias transitivas Handlebars 4.7.10 y semver 7.8.5; el lockfile incluye los paquetes nativos de plataforma del compilador 7.0.2.

## Ajustes necesarios

- Se elimina `baseUrl`, opción retirada en TypeScript 7, y se convierte el destino de `#src/*` a `./src/*`. El destino de `#root/*` ya era relativo. No se amplían rutas de resolución ni se relajan comprobaciones.
- La tarea `tsc-watch` de VS Code y la compilación previa de la prueba de runtime apuntan a `node_modules/@typescript/native/bin/tsc`. Los scripts que usan `tsc` conservan sus comandos porque npm lo resuelve al compilador 7.0.2.
- Se mantienen `strict`, el objetivo de compilación, los puntos de entrada, la configuración de Jest y las expectativas de las pruebas.

## Validación actual

Todas las comprobaciones se ejecutaron con Node 24.21.0 portable, verificando versión y ruta del ejecutable:

1. Línea base: TypeScript 5.8.3 completó `tsc --noEmit` sin errores.
2. TypeScript 7.0.2: `tsc --noEmit` completó sin errores después de los ajustes de configuración.
3. `npm.cmd run build`: finalizó correctamente el prebuild de generación del cliente Prisma 7.10.0, la comprobación de tipos con TypeScript 7.0.2 y la compilación ESM con tsup 8.5.0. Se generaron `dist/index.js`, `dist/scripts/email_venta_frio.js` y `dist/scripts/sync_tipo_cambio.js`, con sus mapas.
4. La inspección de dependencias mediante `npm ls` no reportó conflictos en las relaciones seleccionadas de TypeScript, Prisma, typescript-eslint, ts-jest y tsup.

Por instrucción del usuario, no se ejecutaron pruebas, servidores, conexiones a bases de datos ni empaquetado de producción. Generar el cliente Prisma no aplica migraciones a una base de datos. La compilación principal excluye las pruebas: no certifica su compilación, transformación ni ejecución con la API de compatibilidad.

La tarea de VS Code se actualizó, pero no se inició una sesión interactiva de depuración ni se instaló una extensión. El compilador de terminal y el servicio de lenguaje del editor se configuran por separado; Microsoft recomienda su extensión específica para usar el servicio de lenguaje de TypeScript 7.

## Continuación

Cuando se autorice una validación funcional, comprobar las mismas selecciones de regresión con los runners existentes, sin cambiar expectativas. Revisar la eliminación de la API de compatibilidad cuando las herramientas consumidoras admitan la API de una versión posterior de TypeScript; no basta con cambiar el número de la dependencia.

## Referencia

- [Microsoft: TypeScript 7.0 y coexistencia con TypeScript 6](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6-0).
