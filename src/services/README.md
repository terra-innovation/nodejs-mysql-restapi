# Services — Capa de Negocio

## Responsabilidades
✅ Contener toda la lógica de negocio pura del dominio
✅ Orquestar DAOs (`src/daos/`) e Integrations (`src/integrations/`)
✅ Delegar notificaciones a providers (`src/providers/`)
✅ Manejar la consistencia transaccional cuando una operación de negocio abarca múltiples mutaciones
✅ Ser completamente reutilizable desde controladores Express, scripts de consola o background jobs

## Restricciones estrictas
❌ NO importar `Request` ni `Response` de Express
❌ NO conocer el protocolo HTTP (códigos de estado 200, 404, headers, cookies)
❌ Los parámetros de entrada deben ser tipos primitivos o DTOs planos validados, nunca el objeto `req`
