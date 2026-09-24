# Webhooks — Receptores de Eventos Externos

Esta carpeta aloja los controladores de webhooks entrantes de terceros (Culqi, SUNAT,
pasarelas de pago, etc.). Cada webhook tiene su propio subdirectorio con:
- `[proveedor].webhook.ts` — controlador Express del endpoint
- `[proveedor].validator.ts` — validación de firma/autenticidad del webhook
- `[proveedor].types.ts` — tipos del payload
