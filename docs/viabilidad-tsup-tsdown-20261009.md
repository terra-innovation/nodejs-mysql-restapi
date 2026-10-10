# Viabilidad de migrar tsup 8.5.0 a tsdown

## Migración aplicada: 2026-10-09

Se sustituyó tsup por `tsdown@0.23.0` exacto en devDependencies y se actualizó
`package-lock.json`, conservando su formato versión 2. Las versiones de los
paquetes preexistentes que permanecen en el lockfile no cambiaron.

El estado actual ya incluye Prisma 7.10.0 y generación del cliente TypeScript
mediante `prebuild`; las observaciones sobre Prisma 6 y Node 20 de las secciones
posteriores corresponden al análisis histórico, no al estado de esta migración.

`npm run build` conserva `tsc --noEmit` y utiliza `tsdown.config.ts`. Se mantienen
las entradas automáticas `src/index.ts` y `src/scripts/*.ts`, ESM con extensión
`.js`, target `node18`, sourcemaps, shims, limpieza y tree shaking. El cliente
Prisma local se compila con las fuentes; las dependencias de runtime permanecen
externas. Se actualizó la invocación del compilador en la prueba runtime existente
sin modificar sus expectativas ni ejecutarla.

**Entrega:** tsdown genera archivos compartidos entre las entradas. Transferir
siempre todo `dist` de una misma compilación, incluidos los archivos con hash;
no copiar únicamente `index.js` o un cron. El empaquetador existente ya copia
recursivamente `dist`, por lo que no se modificó ni se ejecutó.

**Validación realizada:** `npm run build` antes y después de la migración,
ambos aprobados en Windows x64 con Node portable 24.21.0. El build posterior
generó `dist/index.js`, `dist/scripts/sync_tipo_cambio.js` y
`dist/scripts/email_venta_frio.js`, sus mapas y archivos compartidos, sin errores
ni advertencias del compilador. `prebuild` regeneró el cliente Prisma sin
operaciones sobre la base de datos.

La instalación se ejecutó con scripts y auditoría desactivados. npm emitió avisos
de obsolescencia de las dependencias transitivas
`@yuku-codegen/binding-win32-x64@0.10.2` y
`@yuku-parser/binding-win32-x64@0.10.2`; no impidieron la compilación y no se
forzaron overrides ajenos al compilador publicado.

**Límites:** por solicitud del usuario no se ejecutaron pruebas, servidor, cron,
conexiones de base de datos, empaquetado de producción ni despliegue. El target
se conserva para acotar el cambio; no certifica soporte de toda la aplicación en
Node 18 ni funcionamiento en Linux o producción. No se afirma una mejora de
rendimiento en ejecución.

## Análisis histórico previo

Fecha de revisión: 2026-10-09. Alcance: análisis estático del backend y consulta de fuentes oficiales; no constituye una migración ni una validación de ejecución.

## Dictamen

Viable con cambios acotados de herramientas y riesgo moderado de compilación/despliegue. No es una sustitución directa: la versión documentada de tsdown exige un Node más reciente para compilar y no admite `splitting: false`. Recomendada una comparación aislada antes de retirar tsup.

El proyecto tsup informa que ya no tiene mantenimiento activo y recomienda considerar tsdown. Este es el beneficio principal comprobable; las mejoras de velocidad y tamaño en este backend todavía deben medirse. [Aviso oficial de tsup](https://github.com/egoist/tsup#readme).

## Estado observado

- `package-lock.json` fija tsup 8.5.0 y TypeScript 5.8.3; `package.json` declara tsup `^8.5.0`.
- Entorno consultado: Node 20.20.2 y npm 10.8.2. El proyecto no declara `engines.node` ni `packageManager`.
- `build` ejecuta `tsc --noEmit && tsup`; desarrollo usa `tsx` y no necesita cambiar para esta migración.
- `tsup.config.ts` compila `src/index.ts` y `src/scripts/*.ts` en ESM, target node18, sourcemaps, limpieza, shims y tree shaking; no genera declaraciones y desactiva splitting.
- Los comandos públicos esperan `dist/index.js`, `dist/scripts/sync_tipo_cambio.js` y `dist/scripts/email_venta_frio.js`.
- El cliente Prisma se importa realmente desde `#root/generated/prisma/ft_factoring/client.js`. Su generador declara `native` y `linux-arm64-openssl-1.1.x`; esto no confirma por sí mismo la plataforma actual de producción.
- `scripts/produccion/build-prod.js` llama a `npm run build` y copia recursivamente todo `dist` y el cliente generado. No se ejecutó este script.
- `tests/mariadb/runtime.test.ts:106` invoca la CLI interna de tsup y registra su configuración. Deberá migrarse junto con el compilador para que siga validando el artefacto utilizado.

## Requisitos y dependencias

La documentación estable consultada corresponde a tsdown 0.23.0; se contrastó con el manifiesto oficial etiquetado. La consulta al registro npm desde este entorno no concluyó y fue cancelada: no se certifica aquí el dist-tag `latest` ni las versiones transitivas publicadas. Antes del piloto se debe verificar el registro y fijar la versión elegida.

| Elemento | Requisito o impacto |
| --- | --- |
| Node para ejecutar tsdown | `^22.18.0 || ^24.11.0 || >=26.0.0`. Node 20.20.2 no cumple. |
| Node del servidor compilado | Puede ser anterior al Node de compilación si se configura `target` y se valida el resultado en esa versión. Las dependencias externas mantienen sus propios requisitos. |
| npm | Se puede conservar npm y `package-lock.json`; no es necesario adoptar el gestor que usa el repositorio de tsdown para su propio desarrollo. La instalación real sigue pendiente. |
| TypeScript | El manifiesto acepta `^5.0.0 || ^6.0.0 || ^7.0.0` como peer opcional. El 5.8.3 actual satisface el rango; conservar la comprobación independiente con tsc. |
| Dependencia directa nueva | tsdown en `devDependencies`; retirar tsup únicamente después de validar la comparación. |
| Motor y transitivas | tsdown incorpora Rolldown, rolldown-plugin-dts y utilidades de configuración/resolución. No es necesario declararlas todas como dependencias directas. El lockfile recogerá el árbol efectivo. |
| Binarios de compilación | Rolldown distribuye binarios para Windows x64 y Linux ARM64 glibc, entre otras plataformas. Instalar dependencias en cada entorno; no reutilizar node_modules de Windows en Linux. |
| Funciones opcionales | CSS, ejecutables SEA, DevTools y validadores de paquetes tienen peers opcionales. Este backend no requiere habilitarlos para sustituir el build actual. |
| Dependencias del backend | No se identifica una necesidad de cambiar Express, Prisma o MariaDB por el bundler. Su compatibilidad con un Node nuevo debe verificarse por separado. |

Fuentes: [instalación y Node](https://tsdown.dev/guide/getting-started), [manifiesto 0.23.0](https://github.com/rolldown/tsdown/blob/v0.23.0/package.json), [plataformas de Rolldown](https://rolldown.rs/guide/getting-started).

## Cambios de configuración necesarios

| Configuración actual | Tratamiento propuesto |
| --- | --- |
| `defineConfig` desde tsup | Crear `tsdown.config.ts` con el import desde tsdown. |
| Entradas y `dist` | Conservar servidor y descubrimiento de cron. Usar `root: 'src'` o nombres de entrada explícitos y verificar la estructura resultante. |
| ESM y `.js` | Conservar ESM y garantizar las tres rutas actuales; configurar `outExtensions` si hace falta. No aceptar un cambio accidental a `.mjs`. |
| `target: 'node18'` | Mantenerlo explícito en la comparación inicial. No certifica Node 18 para toda la aplicación ni aporta polyfills de APIs. |
| Sourcemaps, clean, dts, shims, treeshake | Conservar valores explícitos compatibles; usar `platform: 'node'`. |
| `external` | Preferir `deps.neverBundle`. Proteger el cliente Prisma y sus subrutas, por ejemplo con `/^#root\/generated\/prisma\/ft_factoring(?:\/|$)/`, y comprobar los imports emitidos. |
| `splitting: false` | No tiene equivalente directo en el build de varias entradas de tsdown. Evaluar aceptación de archivos compartidos. |
| `build` | Conservar `tsc --noEmit` y sustituir únicamente el segundo comando al adoptar tsdown. |
| Prueba runtime | Cambiar invocación, nombre de configuración y evidencia al compilador seleccionado; mantener expectativas y salida aislada. |

La documentación permite entradas con glob, configuración del directorio raíz y extensión de salida. Estas posibilidades no son una configuración ya probada en este proyecto. [Entradas](https://tsdown.dev/options/entry), [API de configuración](https://tsdown.dev/reference/api/Interface.UserConfig), [target](https://tsdown.dev/options/target), [shims](https://tsdown.dev/options/shims).

Por defecto, tsdown deja externas las dependencies, peerDependencies y optionalDependencies; puede incorporar devDependencies importadas. Conservar las dependencias de runtime instaladas y revisar el resultado, especialmente el cliente generado local. `pino-roll` se carga por nombre mediante un transporte y debe seguir disponible; no asumir que el bundler lo incluye. [Dependencias](https://tsdown.dev/options/dependencies).

## Riesgos que deciden la viabilidad

1. **Archivos compartidos:** tsdown no permite desactivar splitting en la configuración equivalente. El empaquetador actual copia todo dist y el usuario confirma que genera el paquete en Windows para transferirlo por SFTP. Este flujo parece compatible si se transfiere íntegramente la salida, incluidos los nuevos archivos compartidos. Si cada cron debe distribuirse como un único archivo independiente, habría que evaluar compilaciones separadas y coordinar la limpieza; no dar por resuelto ese requisito con una opción inexistente.
2. **Prisma y aliases:** conservar imports ESM, resolución de `#src` y externalización de `#root/generated`. Revisar salida y conexión real; una compilación aprobada no prueba disponibilidad del motor Prisma en Linux.
3. **Transporte Pino:** la prueba runtime actual silencia logs de archivo. Puede comprobar arranque sin ejercitar el transporte `pino-roll`; incluir una comprobación aislada específica con logging de archivo habilitado en el piloto.
4. **Servidor frente a cron:** el runtime existente comprueba el servidor, no la ejecución de los dos cron. Revisar sus imports, inicialización y salidas con proveedores aislados, evitando envíos o sincronizaciones reales.
5. **Node de compilación frente a ejecución:** la prueba runtime usa `process.execPath` para compilar y arrancar. Ejecutarla bajo Node 22 no certifica el artefacto en Node 20. Si se mantienen versiones distintas, separar compilación y ejecución en la validación.
6. **Tree shaking y efectos de inicialización:** conservar comportamiento de configuración, conexiones y logger. Los tests de fuentes no cubren por sí solos las decisiones del bundler.

La guía oficial también advierte que el migrador automático instala primero tsdown 0.22.14 para resolver opciones antiguas antes de avanzar a 0.23+. Para esta configuración pequeña resulta razonable preparar manualmente una configuración actual y revisarla; no ejecutar el migrador a ciegas ni tratar una migración automática como validación. [Guía de migración](https://tsdown.dev/guide/migrate-from-tsup).

## Flujo comunicado por el usuario y estrategia ajustada

El usuario indica que compila en su PC Windows 11 mediante `npm run build-prod` y transfiere el resultado por SFTP al servidor. Se interpreta el sistema del servidor como Ubuntu a partir de su respuesta dictada; falta confirmar versión y arquitectura. Indica que producción usa probablemente Node 20.20.2, igual que desarrollo, sin haberlo verificado en el servidor durante este análisis.

La estrategia de menor alcance es usar un Node compatible con tsdown solo para compilar en Windows, conservando inicialmente Node 20.20.2 como runtime a validar. No es necesario instalar tsdown en el servidor si este únicamente ejecuta el resultado compilado. Conservar el target actual en la primera comparación y probar los artefactos con Node 20.20.2; ese target no rebaja los requisitos de las dependencias externas.

La actualización global de Node en desarrollo no es necesaria para el piloto: se puede evaluar un runtime de compilación separado. Si se decide actualizar el runtime de toda la aplicación, tratarlo como otra migración con su propia validación. El uso habitual de `build-prod` comunicado por el usuario describe el flujo; no se ejecutó ni se interpretó como una solicitud de generar un paquete ahora.

El empaquetado actual ya incluye todo dist y generated. Para adoptar tsdown, el despliegue por SFTP debe conservar todas las entradas y archivos compartidos de la misma compilación. El cliente Prisma y sus motores para Linux siguen requiriendo validación en el destino, independientemente del bundler.

## Comprobaciones propuestas para un piloto posterior

### Alternativa consultada: adoptar Node 24 antes de tsdown

Es viable mantener Node 20 y Node 24 en Windows 11 mediante instalaciones portables en carpetas separadas o un gestor de versiones. Para un primer piloto, una distribución ZIP oficial de Node 24 y selección del PATH solo en la terminal permite conservar la instalación global de Node 20. Un gestor como nvm-windows facilita el uso habitual de varias versiones, pero su instalación debe considerar conflictos con el Node ya instalado. No asumir que dos instaladores MSI mantienen instalaciones independientes. [Microsoft: Node en Windows](https://learn.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-windows).

Node 24 está en LTS y Node 20 está EOL según la fuente oficial consultada el 2026-10-09. No es necesario pasar primero por Node 22 para adoptar Node 24. [Estado oficial de versiones](https://nodejs.org/en/about/previous-releases).

Se compararon los rangos `engines.node` del lockfile de las 56 dependencias directas con Node 24.11.0: ninguna de las que declara ese requisito lo excluye. Es evidencia estática de ausencia de un bloqueo declarado; no verifica transitivas, scripts de instalación, binarios ni funcionamiento de Prisma 6.7.0, servidor, cron o tests. No se ejecutó Node 24.

La secuencia recomendada para esta alternativa es: capturar línea base con Node 20 y tsup; arrancar y validar el backend con Node 24 manteniendo tsup y las mismas versiones de dependencias; resolver incompatibilidades demostradas; validar en Ubuntu equivalente al destino; migrar después el bundler. No actualizar todas las dependencias a la vez. Para comparar instalaciones limpias, utilizar checkouts separados: cambiar Node no separa node_modules. La migración de Node del servidor requiere su propia comprobación antes del despliegue.

Estas acciones son recomendaciones; no se ejecutaron en este análisis.

1. Verificar Node en el servidor, confirmar versión/arquitectura de Ubuntu y si se transfiere todo dist. El lugar de compilación ya está comunicado: Windows 11 con build-prod. Elegir un Node de compilación admitido por tsdown y verificar la versión publicada que se instalará.
2. Capturar línea base con tsup sobre el mismo commit y Node de compilación que usará la comparación: tipos, build en directorio aislado, inventario de entradas, duración/tamaño y selección fija de regresiones.
3. Preparar tsdown en una rama, conservar el lockfile y comparar en condiciones equivalentes. Revisar warnings, rutas `.js`, imports externos, archivos compartidos y sourcemaps.
4. Repetir exactamente los mismos tipos y regresiones de negocio; ejecutar `npm run test:runtime` con el compilador elegido y MariaDB desechable. Añadir verificación aislada del transporte de archivo y de las entradas cron.
5. Validar el artefacto con la versión de Node del servidor y en la plataforma objetivo. Si se confirma Linux ARM64, repetir allí; no equiparar Windows con ese despliegue.
6. Retirar tsup tras superar los criterios y actualizar las referencias de pruebas/documentación. No generar ZIP ni desplegar como parte implícita del piloto.

## Límites del análisis

Solo se revisaron configuración, lockfile, scripts, fuentes relacionadas, prueba runtime y documentación oficial. No se instalaron dependencias, no se modificaron fuentes/configuración/lockfile, no se compiló, no se ejecutaron tests y no se accedió a bases de datos. No se afirma una mejora medida de rendimiento, compatibilidad final ni una reducción de vulnerabilidades. La evidencia histórica del runtime queda en su documento existente y no se presenta como resultado actual.

Pendientes de información: verificación de Node 20.20.2 en producción, confirmación de Ubuntu y su versión/arquitectura, y si la transferencia incluye íntegramente dist. El lugar y comando de compilación ya fueron comunicados por el usuario.
