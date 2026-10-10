# Punto 11: mantenimiento de dependencias y seguridad

## Política

Las actualizaciones se proponen mediante PR y se revisan antes de fusionar. No se habilita auto-merge ni `npm audit fix`. Se conservan las protecciones de `master`, las pruebas y los umbrales de cobertura.

Dependabot se configura en [`.github/dependabot.yml`](../../.github/dependabot.yml): npm los lunes a las 09:00 y GitHub Actions a las 09:30, hora de Lima. El límite es de cinco PR de versiones npm y dos de Actions simultáneos; ese límite no controla los PR de seguridad, que GitHub gestiona aparte y no esperan al calendario semanal.

Prisma se agrupa con sus paquetes `@prisma/*`; Vitest con `@vitest/*` y Vite. ESLint agrupa únicamente actualizaciones menores y parches. Los restantes paquetes se proponen por separado para facilitar el diagnóstico. Las versiones mayores requieren revisión de compatibilidad, aunque compartan un grupo. El grupo no garantiza que los proveedores publiquen versiones compatibles: revisar especialmente la alineación exacta de Prisma y Vitest/cobertura.

No se proponen nuevas versiones mayores de `@types/node`: los tipos deben seguir Node 24. `.node-version` y `packageManager` mantienen su actualización manual y coordinada. La dependencia `xlsx` desde CDN y los aliases de TypeScript requieren seguimiento manual adicional; no se asume que Dependabot los mantenga ni que npm audite contenido servido fuera del registro.

## Controles

| Control | Cuándo | Resultado |
| --- | --- | --- |
| Dependabot alerts | Actualización del grafo o de avisos de GitHub | Alertas sobre dependencias conocidas |
| Dependabot security updates | Corrección disponible según GitHub | PR de remediación, sin fusionarlo |
| Dependency review | Todo PR hacia `master` | Marca el job como fallido si introduce vulnerabilidades altas/críticas, tanto de desarrollo como de runtime, o alcance desconocido |
| npm audit | Push a `master`, ejecución manual o lunes 10:17 Lima | Audita todo el lockfile; falla por severidad alta/crítica; conserva JSON 14 días |
| Secret scanning y push protection | Según las capacidades y patrones de GitHub | Detecta secretos reconocidos y bloquea su publicación en pushes compatibles |

El [workflow de seguridad](../../.github/workflows/backend-security.yml) usa permisos de lectura, Ubuntu 24.04 y acciones oficiales fijadas por SHA. Dependency Review v5.0.0 se contrastó con el tag oficial. No publica comentarios en PR. La auditoría selecciona el Node/npm declarados, utiliza `--package-lock-only --ignore-scripts --include=dev`, no instala dependencias del proyecto ni ejecuta código del backend, Prisma o pruebas. Un error del registro también falla: no se confunde con ausencia de vulnerabilidades.

El artefacto `backend-security-<run>-<intento>` contiene `npm-audit.json`. El código de salida de npm se conserva. Los avisos bajos y moderados permanecen visibles en el reporte, aunque no hagan fallar el job.

Dependency Review verifica el cambio del PR; npm audit también detecta avisos nuevos sobre versiones ya presentes. Son controles complementarios y no certifican ausencia de vulnerabilidades, licencias aprobadas ni exposición efectiva en producción. No se añaden exclusiones de avisos ni políticas de licencias sin evaluación.

## Estado de activación y validación

El 10 de octubre de 2026 se activaron por API y verificaron: alertas de vulnerabilidades (HTTP 204), actualizaciones automáticas de seguridad de Dependabot, secret scanning y secret scanning push protection. Los ajustes se aplican a este repositorio; no cambian políticas de organización ni permisos de usuarios. No se leyeron ni copiaron valores de secretos o alertas de secretos.

Los nuevos YAML se entregan localmente. El calendario de Dependabot y el workflow programado comienzan al incorporar los archivos a la rama predeterminada `master`. Su validación actual es estática: YAML, formato, actionlint, configuración y sintaxis de scripts. No se afirma una ejecución remota aprobada del nuevo workflow ni la creación efectiva de PR de versiones. Las alertas y correcciones de seguridad nativas ya están activas, independientemente de esa incorporación.

Los únicos checks obligatorios de la protección de rama siguen siendo `Backend quality` y `Backend integration`. El nuevo job `Dependency review` todavía no es obligatorio para fusionar, aunque pueda fallar: validarlo en GitHub antes de añadirlo a la protección. El job periódico `Dependency audit` no debe exigirse como check de PR, porque no se ejecuta en ese evento. La adopción opcional de este punto no modifica silenciosamente la protección validada en el punto 10.

Se ejecutó una consulta real `npm audit` del lockfile, sin pruebas, compilación, instalación ni cambios en el lockfile. Respondió con hallazgos altos y código 1; por ello se espera que la auditoría completa falle mientras se resuelve la [deuda de remediación](../deuda-tecnica/20261010_DT_CI_02_remediacion_dependencias.md). El control se conserva estricto y no se declara verde. La evidencia local está en `coverage/ci-live/audit-step11.json`, ignorada por Git y sujeta a los avisos existentes en esa fecha.

## Atención de una actualización

Revisar el aviso y la ruta de dependencia, distinguir desarrollo de runtime y comprobar si la versión propuesta resuelve el problema sin degradar compatibilidad. Priorizar exposición real y severidad; validar con las mismas selecciones afectadas antes/después. Los PR de Dependabot pasan por los controles habituales sin secretos de aplicación; el entorno de pruebas rápido es sintético y MariaDB es desechable.

Si una propuesta no puede resolverse automáticamente, registrar responsable, decisión y revisión futura en deuda técnica. No ocultar el aviso ni ejecutar `audit fix --force` como atajo. Revisar semanalmente **Security → Dependabot** y el resultado de **Backend security**; investigar errores de resolución de lockfile o de dependencias CDN/aliases.

Referencias oficiales: [opciones de Dependabot](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference), [Dependency Review](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/manage-your-dependency-security/configure-dependency-review-action), [npm audit](https://docs.npmjs.com/cli/v11/commands/npm-audit/).

Siguiente paso del plan: punto 12, evaluar los controles opcionales de plataforma, empaquetado y PDF. Antes de exigir Dependency Review como tercer check, publicar estos archivos y verificar su ejecución en GitHub.
