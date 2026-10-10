# Comandos de calidad del backend

Punto 3 del plan de integración continua. Estos controles son independientes y se pueden reutilizar en desarrollo y en el futuro workflow. No ejecutan pruebas, compilaciones con emisión, introspección ni conexiones a bases de datos.

## Preparación

Seguir la [instalación reproducible](instalacion-reproducible.md): Node 24.21.0, npm 11.19.0, `npm ci` y `npm run prisma:generate:ci`. El cliente generado es necesario para comprobar los tipos. `prisma-sync` conserva su uso manual con la base de desarrollo; ningún control lo invoca.

En PowerShell, antes de ejecutar las comprobaciones:

```powershell
$env:Path = 'D:\Herramientas\node-v24.21.0-win-x64;' + $env:Path
node --version
node -p "process.execPath"
npm.cmd run typecheck:all
npm.cmd run lint
npm.cmd run format:check
```

## Controles

| Comando | Alcance | Resultado esperado |
| --- | --- | --- |
| `npm run typecheck` | Tipos del backend, sin emitir archivos | Código de salida 0 si no hay errores de tipos |
| `npm run typecheck:jest` | Tipos de las suites Jest | No ejecuta Jest |
| `npm run typecheck:vitest` | Reutiliza `test:vitest:typecheck` | No ejecuta Vitest |
| `npm run typecheck:integration` | Reutiliza `test:integration:typecheck` | No arranca MariaDB ni Docker |
| `npm run typecheck:all` | Los cuatro controles de tipos, en secuencia | Se detiene en el primero que falle |
| `npm run lint` | `src`, con la configuración ESLint existente | Falla ante errores; las advertencias siguen siendo visibles |
| `npm run lint:fix` | Mismo alcance de lint | Aplica las correcciones que ESLint considera automáticas; revisar el diff |
| `npm run format:check` | Código de `src`, `tests`, `scripts` y configuraciones JSON/JavaScript de la raíz | Falla si hay diferencias de formato; no escribe archivos |
| `npm run format:changed` | Archivos modificados, staged y nuevos no ignorados, dentro del mismo alcance de formato | Comprueba el formato sin escribir |
| `npm run format:changed:write` | Mismo alcance de archivos modificados | Aplica Prettier solo sobre estos archivos |

Los tres controles principales deben ejecutarse por separado para ver todos sus resultados aunque alguno falle. No se ha añadido un agregado que oculte los controles posteriores por detenerse en el primer fallo.

## Adopción gradual

Se incorpora Prettier 3.9.10 como dependencia de desarrollo exacta, conservando `.prettierrc` (`printWidth: 1000`). `.prettierignore` excluye clientes generados, salidas, copias, almacenamiento, temporales y el lockfile. Los patrones de entrada no incluyen archivos de entorno ni documentos de clientes. Markdown, SQL, Prisma y datos JSON de pruebas quedan fuera de este primer alcance.

El alcance de lint se mantiene igual al de la [línea base](linea-base-20261010.md); no se amplían reglas a las pruebas ni se impone todavía tolerancia cero a las advertencias. Los scripts históricos de tipos permanecen compatibles.

El punto 4 corrige los errores de lint y adopta el formato por archivos modificados. Para desarrollo, ejecutar `npm run format:changed:write` y revisar el diff antes de confirmar cambios. `lint:fix` conserva el alcance completo de `src`; no sustituye la revisión de cambios ni corrige automáticamente todos los errores.

Para comprobar cambios ya confirmados respecto de una rama base: `npm run format:changed -- --base origin/master`. El script necesita que Git disponga de la referencia y de su ancestro común con HEAD (merge base). Una referencia inválida produce un fallo; no se interpreta como ausencia de cambios. En CI deberá pasarse la base del pull request y recuperarse la historia necesaria. Sin `--base`, un checkout limpio no tiene archivos modificados que comprobar.

`format:check` conserva el diagnóstico completo del repositorio y sigue detectando formato histórico pendiente. No se han ocultado esos archivos mediante exclusiones nuevas. Antes de endurecer el control global se debe normalizar ese formato en lotes revisables; no se reformatea todo el backend en este punto. Si cambian las reglas o exclusiones de Prettier, revisar el alcance completo.

La validación de este punto se limita a ejecutar estos comandos de lectura y revisar sus códigos de salida. Los registros locales quedan en `coverage/ci-commands/` (ignorado por Git); no sustituyen las pruebas funcionales.

Validación del 10 de octubre de 2026 con Node portable 24.21.0: `typecheck:all` aprobado; `lint` conserva las incidencias de la línea base; `format:check` detecta diferencias de estilo pendientes de adopción. Ambos controles devuelven código 1 ante esas incidencias. No se ejecutaron pruebas ni correcciones automáticas, y no se modificaron fuentes, esquemas ni suites. La comparación del lockfile confirma que solo se añadió Prettier, sin actualizar otras dependencias.

La validación anterior corresponde al cierre del punto 3. Los cambios y resultados posteriores se documentan en [adopción gradual de calidad, punto 4](adopcion-calidad.md).
