# Jobs — Tareas Programadas

Esta carpeta aloja los trabajos programados (cron jobs) orquestados por un scheduler
(ej. node-cron, Bull, Agenda). Cada job importa servicios de negocio desde `src/services/`
y NO contiene lógica de negocio propia.

Convención de nombres: `[entidad].job.ts` (ej. `tipo-cambio-sync.job.ts`)
