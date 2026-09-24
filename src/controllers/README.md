# Controllers — Capa de Transporte

## Responsabilidades
✅ Parsear y extraer datos de `req.params`, `req.body`, `req.query`, `req.session_user`
✅ Validar input con Yup o Zod
✅ Llamar al servicio de negocio correspondiente (`src/services/`)
✅ Responder con `response(res, statusCode, data)` o manejar errores de validación HTTP

## Prohibiciones estrictas
❌ NO importar DAOs directamente (`src/daos/`)
❌ NO importar `prismaFT` ni abrir transacciones Prisma
❌ NO instanciar `EmailSender` ni `TemplateManager`
❌ NO contener lógica de negocio (reglas, cálculos, orquestación)
❌ NO importar desde `src/providers/` directamente (los providers son infraestructura consumida por los servicios)
