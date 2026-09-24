# Scripts de Prueba Manual / Exploración

Esta carpeta contiene scripts de desarrollo utilitarios que NO son tests automatizados.
No se ejecutan con `npm test`. Se corren individualmente con:

```bash
npx tsx tests/manual/integrations/apisperu/connectivity.ts
npx tsx tests/manual/integrations/apisperu/fallback.ts
npx tsx tests/manual/integrations/apisperu/provider-sync.ts
npx tsx tests/manual/integrations/decolecta/connectivity.ts
```

## Subcarpetas
- `integrations/apisperu/` — Scripts de conectividad y prueba de la integración ApisPeru
- `integrations/decolecta/` — Scripts de conectividad de la integración Decolecta
