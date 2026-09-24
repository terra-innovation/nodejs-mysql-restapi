# Queues — Colas de Tareas Asíncronas

Esta carpeta aloja la configuración y workers de colas de procesamiento en background
(ej. BullMQ, RabbitMQ). Ideal para: emails masivos, generación de PDFs, reportes,
webhooks de salida.

Convención: `[entidad].queue.ts` para la definición, `[entidad].worker.ts` para el worker.
