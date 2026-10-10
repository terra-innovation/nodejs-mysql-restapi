# Migración de Prisma 6 a 7

Fecha: 9 de octubre de 2026.

## Alcance implementado

- `prisma`, `@prisma/client` y `@prisma/adapter-mariadb` fijados en `7.10.0`.
- El adaptador requiere `mariadb@3.4.5`; npm actualizó el conector bloqueado de `3.4.0` a `3.4.5`, dentro del rango declarado existente.
- El esquema conserva todos sus modelos y relaciones. Se utiliza el generador `prisma-client` en ESM, sin motores Rust ni `binaryTargets`.
- `prisma.config.ts` selecciona el esquema y obtiene `PRISMA_DATABASE_FACTORING_URL`. Respeta variables del proceso; fuera de producción carga `.env.${NODE_ENV || 'development'}` sin sobrescribirlas, igual que el backend. En producción no carga archivos de entorno.
- `npm run prisma:generate` genera el cliente sin consultar ni modificar la base. `npm run build` lo ejecuta automáticamente mediante `prebuild`.
- El cliente generado en TypeScript se incorpora a los bundles mediante tsup. Los imports internos existentes con `.js` se conservan; el compilador resuelve sus fuentes TypeScript.
- Se sustituyeron imports de `@prisma/client/runtime/library` por `@prisma/client/runtime/client`, conservando `Decimal` y los cálculos existentes.
- Se adaptaron los constructores de clientes de integración y los imports de pruebas existentes; no se alteraron sus expectativas ni se ejecutaron pruebas.

## Conexión y fechas

`src/models/prisma/mariadbAdapter.ts` convierte la URL existente en opciones para el adaptador oficial:

| URL Prisma | Driver MariaDB |
| --- | --- |
| `connection_limit` | `connectionLimit` |
| `connect_timeout` | `connectTimeout`, segundos a milisegundos |
| `pool_timeout` | `acquireTimeout`, segundos a milisegundos |
| `socket_timeout` | `socketTimeout`, segundos a milisegundos |
| `timezone` | `timezone` |
| `socket` | `socketPath` |
| `sslcert`, `sslidentity`, `sslpassword`, `sslaccept` | Opciones TLS explícitas |

Sin opciones explícitas, el pool admite 10 conexiones, espera 5 segundos para conectar y 10 segundos para adquirir una conexión, sin timeout de socket. El límite de 10 es el predeterminado del driver MariaDB; difiere del cálculo automático según CPU que utilizaba Prisma 6. Una URL con `connection_limit` conserva su límite explícito.

La zona del driver predeterminada y la sesión SQL se establecen en UTC. La configuración `timezone` explícita se conserva. Los tiempos de transacción existentes permanecen en sus puntos de uso. Opciones desconocidas de URL se rechazan para evitar ignorarlas silenciosamente. TLS valida certificados salvo que la URL solicite expresamente `sslaccept=accept_invalid_certs`.

## Compilación realizada

Entorno: Windows x64, Node portable `24.21.0`, verificado con `node --version` y `node -p "process.execPath"`.

Comando: `npm.cmd run build`.

Resultado final: generación de cliente `7.10.0`, TypeScript (`tsc --noEmit`) y tsup aprobados. Se generaron `dist/index.js`, `dist/scripts/email_venta_frio.js` y `dist/scripts/sync_tipo_cambio.js`, con sus mapas.

La primera generación coexistió con archivos JavaScript y declaraciones del cliente antiguo, que tsup podía seleccionar antes que las fuentes nuevas. Se eliminó exclusivamente la carpeta local de salida generada, se regeneró desde el esquema y se repitió la compilación completa. El resultado final incluye el cliente 7, sin utilizar los restos de Prisma 6.

## Límites y uso posterior

- En la compilación inicial no se ejecutaron pruebas, servidor, consultas, introspección, migraciones SQL, `db push`, auditoría npm ni empaquetado de producción. La ejecución posterior de introspección se registra abajo.
- La compilación no confirma conexión, transacciones, serialización, compatibilidad de runners de pruebas ni operación en el servidor Linux/ARM64. Estas verificaciones siguen pendientes por el alcance solicitado.
- Para desarrollo en una instalación limpia, ejecutar `npm.cmd ci` y `npm.cmd run prisma:generate` antes de arrancar. `npm.cmd run build` ya incluye la generación.
- No ejecutar el cliente TypeScript generado directamente desde Node ni copiarlo como sustituto del bundle. Los bundles contienen ese cliente y requieren las dependencias de producción de este lockfile.
- La reversión exige recuperar conjuntamente fuentes, esquema, configuración, `package.json` y `package-lock.json` de la revisión anterior, reinstalar y regenerar limpiando la salida del generador. No requiere reversión SQL porque no se cambió la base.

## Flujo conservado: `prisma-sync`

Después de modificar la estructura de la base, se mantiene `npm.cmd run prisma-sync`. Su secuencia es:

1. Respaldar el esquema local antes de `db pull` (`antes-db-pull`). Si el respaldo falla, no se inicia la introspección.
2. Leer la estructura de la base y actualizar exclusivamente `prisma/ft_factoring/schema.prisma`.
3. Respaldar el resultado de la introspección (`antes-pluralizar`) y aplicar las reglas de pluralización existentes.
4. Respaldar el resultado pluralizado (`antes-renombrar`) y aplicar los nombres especiales y excepciones existentes.
5. Generar el cliente de Factoring con Prisma 7.

Las reglas de nombres no se modificaron. Cada respaldo se guarda en `prisma/ft_factoring/backup/`, con fecha UTC de precisión de milisegundos, etapa y UUID. La copia utiliza `COPYFILE_EXCL`: nunca sobrescribe un archivo existente. Los respaldos anteriores no se borran.

El orquestador pasa explícitamente `--config` y `--schema` a Prisma, fija la raíz del repositorio como directorio de trabajo y ejecuta tanto Prisma como los transformadores mediante `process.execPath`. Así conserva el Node que ejecutó el comando inicial y no depende de otro `node` o `npx` disponible en el sistema.

Para este flujo se establece `NODE_ENV=development` en los procesos hijos. `prisma.config.ts` carga `.env.development` y conserva la precedencia de las variables ya definidas en el entorno. La selección explícita corresponde al esquema y la configuración de Factoring; la conexión efectiva sigue siendo `PRISMA_DATABASE_FACTORING_URL`. No se fuerza otra conexión ni se muestran credenciales.

Ante un error se detienen los pasos posteriores. No se restaura automáticamente el esquema: los respaldos permiten revisar y recuperar la etapa necesaria. El comando no modifica tablas ni datos, pero sí consulta la estructura de la base y escribe archivos locales.

`npm.cmd run prisma:generate` y el `prebuild` solo regeneran el cliente desde el esquema local; no ejecutan `prisma-sync` ni sus transformaciones. Para futuras bases se mantendrán esquemas, configuraciones y salidas independientes; este cambio no añade sincronización de otras bases.

Validación inicial de estos ajustes: comprobación de sintaxis con `node --check` de los cuatro scripts y `npm.cmd run build` aprobados con Node 24.21.0, sin ejecutar todavía la sincronización ni pruebas.

### Ejecución real de `prisma-sync`

El 9 de octubre de 2026, aproximadamente a las 20:20 de Lima, se ejecutó `npm.cmd run prisma-sync` con Node 24.21.0 y Prisma 7.10.0, por solicitud del usuario.

- El primer intento, dentro del entorno restringido, terminó con P1001 al conectar con MariaDB local. Creó el respaldo previo y no alcanzó la actualización del esquema.
- El segundo intento, con acceso fuera del entorno restringido, terminó con código 0 y completó introspección, pluralización, nombres especiales y generación del cliente.
- Se crearon los tres respaldos de la ejecución exitosa con nombres distintos. Se verificó mediante SHA-256 que el respaldo `antes-db-pull` coincide con el esquema existente antes de ejecutar el comando. Se conservó también el respaldo del intento inicial.
- Comparando el esquema anterior y el final sin comentarios ni diferencias de espacio, el contenido coincide y conserva sus 127 modelos. Las diferencias locales de esta ejecución corresponden al formato y los registros de ejecución de los transformadores.
- Se evaluaron 191 relaciones de colección y 235 relaciones en el transformador de nombres especiales; no fue necesario renombrar ninguna. Esta ejecución verifica el encadenamiento sobre el esquema actual, pero no demuestra cómo se comportarán todas las reglas ante futuras relaciones nuevas.
- `npm.cmd run build` posterior completó generación, TypeScript y compilación del servidor y los dos scripts programados.

Las fechas de los nombres de respaldo están en UTC; por eso muestran 10 de octubre, correspondiente a la noche del 9 de octubre en Lima. No se ejecutaron pruebas, servidor ni escrituras de tablas o datos. La introspección realizó únicamente lectura de estructura; modificó el esquema local, sus registros, los respaldos y el cliente generado.

## Referencias

- [Guía oficial de migración a Prisma 7](https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7).
- [Adaptador oficial MySQL/MariaDB](https://www.prisma.io/docs/orm/v7/overview/databases/mysql).
- [Configuración de Prisma 7](https://www.prisma.io/docs/orm/v7/reference/prisma-config-reference).
