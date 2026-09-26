# Scripts de Prueba Manual / Exploración

Esta carpeta contiene scripts de desarrollo utilitarios que NO son tests automatizados.
No se ejecutan con `npm test`. Se corren individualmente con `npx tsx`:

```bash
# Integraciones
npx tsx tests/manual/integrations/apisperu/connectivity.ts
npx tsx tests/manual/integrations/apisperu/fallback.ts
npx tsx tests/manual/integrations/apisperu/provider-sync.ts
npx tsx tests/manual/integrations/decolecta/connectivity.ts

# Notificaciones (requieren variables de entorno SMTP / Telegram configuradas)
npx tsx tests/manual/email/sendemail.manual.ts
npx tsx tests/manual/telegram/telegram.manual.ts
```

## Subcarpetas
- `integrations/apisperu/` — Scripts de conectividad y prueba de la integración ApisPeru.
- `integrations/decolecta/` — Scripts de conectividad de la integración Decolecta.
- `email/` — Scripts de prueba manual de envío de correo y renderizado de templates HTML.
- `telegram/` — Scripts de prueba manual de emisión de alertas por bot de Telegram.
