# Node 24 portable para desarrollo en Windows

El backend usa Node 24.21.0 portable ubicado en `D:\Herramientas\node-v24.21.0-win-x64`. Node 20 permanece instalado en Windows. No se modifica el PATH global ni las dependencias del proyecto.

## Uso cotidiano

- En VS Code, abrir la carpeta del backend y seleccionar **Launch via NPM - Node 24** en Ejecutar y depurar. Iniciar con F5. Esta configuración ejecuta el npm incluido en el portable mediante su `node.exe` y conserva `npm run dev`, `NODE_ENV=development` y `TZ=UTC`.
- La tarea previa `tsc-watch` ejecuta TypeScript con el mismo Node 24 en Windows.
- Cerrar las terminales integradas antiguas y crear una nueva. `node --version` debe mostrar `v24.21.0`; `node -p "process.execPath"` debe apuntar al portable. Luego usar `npm.cmd run dev`, `npm.cmd run test:all` o `npm.cmd run test:runtime` sin activación manual.
- Se conserva **Launch via NPM** como configuración original. Esa opción resuelve npm según el entorno disponible; no es una opción explícita para Node 20.

## Alcance y mantenimiento

La configuración de terminal corresponde al workspace de VS Code. Para mantenerla acotada al backend, abrir este repositorio en su propia ventana. No configura PowerShell externo, las herramientas del agente ni producción. Las herramientas del agente siguen la instrucción de `AGENTS.md` de activar y verificar Node 24 en cada sesión de comandos.

La ruta es local a este equipo. Si se mueve la carpeta o se actualiza Node 24, actualizar las referencias en `.vscode/launch.json`, `.vscode/settings.json`, `.vscode/tasks.json` y `AGENTS.md`. Conservar juntos todos los archivos del ZIP, incluido npm.

El usuario compartió ejecuciones equivalentes aprobadas bajo Node 20 y Node 24 de TypeScript, Jest, Vitest y runtime compilado con MariaDB desechable. Esa evidencia corresponde a Windows y a la selección ejecutada; no certifica producción ni otras plataformas. La comprobación interactiva de F5 y de una terminal nueva debe realizarse en VS Code.
