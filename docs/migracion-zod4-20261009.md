# Migración de Zod a 4.6.5

Fecha: 9 de octubre de 2026.

## Alcance y decisiones

- Actualización de Zod 3.24.4 a la versión exacta 4.6.5 en `package.json` y `package-lock.json`, mediante npm, sin scripts de instalación ni auditoría automática. Solo cambió el paquete Zod.
- El único import directo identificado en fuentes, scripts y pruebas está en `src/config.ts`, para validar variables de entorno.
- Se sustituye `error.errors` por `error.issues`: Zod 4 elimina el alias anterior. Se conserva el reporte por variable y la salida con código 1 ante configuración inválida.
- Se mantienen los esquemas declarados, los valores predeterminados y las transformaciones de booleanos. No se sustituyen por coerción booleana ni se cambia la configuración de TypeScript.

## Validación y límites

- `npm.cmd run build` finalizó correctamente antes y después de la migración, con Node 24.21.0 portable, verificando versión y ruta del ejecutable.
- El flujo existente generó el cliente Prisma 7.10.0, comprobó tipos con `tsc --noEmit` y compiló la API y los dos scripts programados mediante tsup.
- La revisión del diff confirmó cambios de dependencia limitados a Zod.
- Por instrucción del usuario, no se ejecutaron pruebas, arranque del servidor ni empaquetado de producción. La compilación no certifica la validación de variables de entorno en ejecución ni los cambios de mensajes o semántica internos de Zod 4; por ejemplo, `z.number()` deja de admitir valores infinitos.

## Reversión

Restaurar conjuntamente `package.json`, `package-lock.json` y el acceso a errores en `src/config.ts` a la revisión anterior a esta migración, y reinstalar desde ese lockfile.

Referencia: [guía oficial de migración de Zod 4](https://zod.dev/v4/changelog).
