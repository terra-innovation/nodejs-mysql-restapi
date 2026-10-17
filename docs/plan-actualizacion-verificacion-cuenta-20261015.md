# Plan: actualizar la verificación de cuenta sin cerrar sesión

Fecha: 2026-10-15, America/Lima. Estado: implementación y pruebas automatizadas enfocadas completadas; comprobación real entre sesiones pendiente.
Alcance: backend y frontend. El análisis inicial fue estático; el registro al final distingue las comprobaciones posteriores autorizadas. No se consultó ni modificó la base de desarrollo.

## Diagnóstico confirmado en las fuentes actuales

- `src/pages/usuario/persona/PersonaVerificacionWizard/index.tsx` del frontend lee el estado desde `useGetPersonaMaster`. La rama de cuenta validada aún indica cerrar y volver a iniciar sesión.
- `src/api/finanzatech/usuario/persona.ts` desactiva revalidación por foco, reconexión y datos obsoletos. No hay acción de consulta de estado en el panel de revisión.
- `getPersonaMasterService` consulta el estado real, pero devuelve además países, distritos y otros catálogos. No conviene repetir esa descarga para detectar una aprobación.
- `createPersonaverificacionService` en `src/services/admin/personaverificacion.Service.ts` actualiza el estado de persona y, al aprobar, `usuario.ispersonavalidated`; para el estado 4 habilita los servicios.
- `src/menu/menuUsuario.ts` decide entre Verificación de cuenta y las opciones Inicio/Servicios usando `ispersonavalidated` del usuario de sesión. Consultar nuevamente el formulario no renueva ese token.
- `POST /api/v1/secure/actualizar-accesos` ya lee el usuario actual de la base y devuelve token, perfil y menú conservando el vencimiento original. El DAO incluye los campos escalares del usuario, por lo que el indicador de verificación también se actualiza.
- El frontend ya dispone de `actualizarAccesos`, deduplicación, timeout, protección ante cambio de sesión, sincronización entre pestañas y acción de perfil «Actualizar mis accesos».

Conclusión: reutilizar la sincronización existente. `hasServiceAccess` verifica roles de suscripciones; la verificación personal necesita un criterio distinto basado en el indicador y las rutas de usuario. No copiar el flujo de suscripción completo ni conceder roles de Factoring por verificar la cuenta.

## Experiencia propuesta

1. En revisión: mostrar estado, explicación y botón «Consultar estado».
2. Consultar automáticamente al entrar, recuperar foco/visibilidad o conexión, con deduplicación y una ventana corta entre eventos, como en suscripciones.
3. Cuando la respuesta actual confirme la aprobación, sincronizar mediante `actualizarAccesos` si la sesión aún no está lista.
4. Mostrar «Cuenta verificada. Actualizando tus accesos…» mientras se sincroniza.
5. Mostrar éxito y «Ir a servicios» únicamente cuando token, perfil y menú sean coherentes. Mantener la navegación voluntaria.
6. Distinguir error de consulta de error de sincronización; ofrecer consulta o reintento manual. Respetar la sesión vencida y los límites existentes.

Sin consultas periódicas: una aprobación externa con la pestaña permanentemente activa se detectará en la próxima consulta manual o evento descrito. La entrega instantánea requeriría otro alcance.

## Fases, dependencias y cierre

| Fase | Trabajo y entregable | Dependencia y criterio de cierre |
| --- | --- | --- |
| 1. Estado mínimo | Añadir `GET /api/v1/usuario/persona/estado`, autenticado con rol 5; consultar únicamente el usuario de sesión y su estado de persona. Respuesta con identidad pública, indicador de validación y campos de estado necesarios para la UI, sin catálogos ni datos personales. `Cache-Control: no-store`. | Conservar `/master` y `/verificar`. Cubrir cuenta sin solicitud y discrepancias entre estado e indicador sin inferir permisos ni reparar datos. |
| 2. Coordinación de sesión | Crear un hook de verificación que consulte estado y reutilice `actualizarAccesos`. Añadir un criterio de disponibilidad: misma identidad, indicador validado en token y perfil, rutas Inicio/Servicios presentes en menú. Dar a los intentos automáticos un ámbito propio, compatible con suscripciones. | Fase 1. Una actualización compartida, respuestas antiguas descartadas, sin bucles automáticos tras fallo y sin extender la sesión. |
| 3. Pantalla | Integrar panel con estado, progreso, errores, reintento y enlace a Servicios. Retirar instrucción de cerrar sesión. Coordinar el estado consultado con la caché del formulario; después del envío reconsultar estado sin reenviar la solicitud. | Fase 2. El formulario conserva pasos y borradores durante eventos de foco; se mantiene la editabilidad definida por el estado del servidor. La caché vieja no vuelve a imponer «En revisión». |
| 4. Verificación y documentación | Añadir casos nuevos y ejecutar únicamente las comprobaciones autorizadas; actualizar la guía existente de refresco de accesos con esta extensión. | Fases 1–3. Aprobar desde otra sesión administrativa y comprobar el flujo completo sin logout, además de las regresiones de suscripciones. |

## Riesgos y límites

- El refresco de sesión es compartido: conservar timeout, deduplicación, expiración, rate limit y comportamiento entre pestañas; no cambiar el contrato del endpoint existente.
- Separar la verdad del estado consultado de la disponibilidad efectiva de accesos. Si el servidor no entrega un conjunto coherente, mostrar error recuperable y no anunciar acceso listo.
- No cambiar las reglas administrativas de aprobación/rechazo ni la semántica actual de revocación. El servicio administrativo actual solo actualiza el indicador de usuario cuando el estado valida la persona; esa regla queda fuera del arreglo de UX.
- No agregar DDL, migraciones, dependencias, escrituras directas de mantenimiento ni mecanismos de notificación nuevos.
- El análisis explica el comportamiento de las fuentes; no reproduce ni confirma la aprobación de la cuenta concreta de la imagen.

## Validación prevista

Aplicar las skills locales `backend-validation` y `frontend-validation`. Todas las ejecuciones quedan pendientes. Usar Node portable 24.21.0 y verificar versión/ruta antes de validar.

- Backend: casos del nuevo endpoint (identidad derivada de sesión, sin solicitud, pendiente, aprobado, no autenticado y rol no autorizado); extender `tests/vitest/migrated/unit/services/secure/accesos.Service.test.ts` con indicador de verificación y menú. Comprobar tipos de aplicación y pruebas. Los mocks no demuestran persistencia.
- Frontend: nuevas pruebas de pantalla/hook para pendiente → aprobado, datos antiguos, errores, reintento, eventos simultáneos, logout/cambio de cuenta, pestañas y conservación del formulario. Reutilizar como regresión las suites existentes siguientes:

```powershell
& .\scripts\npm-node24.ps1 --silent run test:ci -- src/contexts/JWTContext.accesses.test.tsx src/utils/accessSession.test.ts src/utils/axiosFinanzatech.test.ts
```

Ejecutar desde la raíz del frontend y añadir los archivos nuevos una vez creados. Revisar resumen sin fallos y código de salida 0. No ejecutado por el modelo; pendiente de ejecución manual o autorización explícita.

- Comprobación real: usuario en revisión y administrador en otra sesión; aprobación mediante la aplicación, consulta automática al recuperar foco y consulta manual permaneciendo en la pestaña. Confirmar menú Inicio/Servicios, navegación autorizada, segunda pestaña y conservación del vencimiento. No basta con una prueba con transporte simulado.

## Implementación y evidencia del 2026-10-15

- El usuario autorizó continuar hasta la solución. Se implementó el endpoint mínimo, manteniendo las capas ruta/controlador/servicio/DAO, autenticación, rol 5 y selección explícita de campos.
- Se añadieron `useAccountVerification`, el cliente de estado, el panel y la comprobación de disponibilidad personal. Se reutilizó el contexto de sesión sin cambiar el contrato de actualización de accesos. El formulario dejó de decidir desde el master cacheado y reconsulta después de enviar.
- Se añadieron casos de aprobación, discrepancia, HTTP, identidad, estado sin solicitud y expiración/revocación al backend; casos de pantalla, reintento, deduplicación, borradores, envío y recepción de sincronización desde otra pestaña al frontend.
- Backend: 18 pruebas enfocadas aprobadas; tipos de aplicación y de Vitest aprobados. ESLint de las fuentes afectadas aprobado sin avisos. La primera ejecución HTTP quedó bloqueada por `EACCES` en conexiones locales dentro del aislamiento; la ejecución final fuera del aislamiento aprobó la selección completa.
- Frontend: comprobación final de tipos de aplicación y pruebas aprobada; ESLint de los archivos afectados aprobado sin avisos. El usuario autorizó posteriormente ejecutar las pruebas del frontend: las cuatro suites enfocadas aprobaron 31 casos y el filtro `Asistente persona` aprobó otros 3, con 31 casos ajenos excluidos por ese filtro. Se usaron Node 24.21.0 y los scripts actuales, sin alterar expectativas. `.env.test` está disponible; solo se comprobó su existencia, sin leer ni modificar su contenido.
- La primera ejecución frontend falló antes de cargar dos suites por `ENOENT` al acceder a temporales del aislamiento. La repetición fuera del aislamiento aprobó las cuatro suites. Se conservaron dos avisos `TimeoutNaNWarning` en las suites de contexto y pantalla; no causaron fallos y no se modificaron dependencias ni configuración para ocultarlos. La causa del aviso no se investigó en esta validación enfocada.
- No se ejecutó build de producción, no hubo DDL ni escrituras directas de mantenimiento. Los casos HTTP usan Express real y Prisma simulado; no acreditan persistencia real ni navegador.
- Guía y comandos vigentes: [actualización de accesos](actualizacion-accesos-suscripciones.md). Los comandos históricos del apartado de planificación son propuestas, no evidencia de ejecución.
- Logs backend: `docs/registros/pruebas/test-verificacion-cuenta-20261015.log`, `docs/registros/pruebas/lint-verificacion-cuenta-20261015.log`, `docs/registros/compilaciones/typecheck-verificacion-cuenta-20261015.log` y `docs/registros/compilaciones/typecheck-vitest-verificacion-cuenta-20261015.log`. Logs frontend: mismas rutas relativas para typecheck y lint. No contienen consultas a datos de clientes.
- Logs de pruebas frontend: `docs/registros/pruebas/test-verificacion-cuenta-frontend-20261015.log` y `docs/registros/pruebas/test-verificacion-asistente-frontend-20261015.log` dentro del repositorio frontend. Ambas ejecuciones finales devolvieron código de salida 0.

## Siguiente paso del plan

Verificar una aprobación desde otra sesión administrativa mediante la aplicación: usuario en revisión, aprobación, recuperación de foco o consulta manual, menú actualizado y acceso a Servicios sin logout. Las pruebas automatizadas enfocadas están aprobadas; todavía no se ha validado este escenario con persistencia y navegador reales.
