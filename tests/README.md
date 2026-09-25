# Estándar y Estrategia de Testing — `ft-app-backend`

Este documento describe la organización, convención de nombres y forma de ejecución de las pruebas en el proyecto.

---

## 📂 Organización de Carpetas de Pruebas

```
tests/
├── unit/                         # Pruebas unitarias automatizadas (Jest)
│   ├── services/                 # Tests de servicios de dominio (mockeando DAOs y providers)
│   └── utils/                    # Tests de utilidades puras (sin IO ni BD)
├── integration/                  # Pruebas de integración con base de datos real
├── e2e/                          # Pruebas End-to-End contra la API Express (Supertest)
│   ├── public/                   # Endpoints públicos (login, registro, health)
│   └── private/                  # Endpoints protegidos (con sesión / token JWT)
├── manual/                       # Scripts de exploración y verificación manual (NO automatizados)
│   └── integrations/             # Scripts de prueba de APIs externas (ApisPeru, Decolecta)
├── email/                        # Pruebas de envío y renderizado de templates de correo
├── telegram/                     # Pruebas del bot de notificaciones Telegram
└── assets/                       # Fixtures, archivos de prueba (PDFs, XMLs, imágenes DNI)
```

---

## 📊 Matriz de Clasificación y Ejecución

| Carpeta | Tipo de Prueba | Qué Debe Probar | Cómo Ejecutar |
|---|---|---|---|
| **`tests/unit/services/`** | Unitario Automatizado | Lógica de negocio, cálculos financieros (`tdd`, `tda`), reglas de validación. Se aíslan con mocks de Prisma/DAOs. | `npm test` |
| **`tests/unit/utils/`** | Unitario Automatizado | Funciones utilitarias puras (conversión de fechas Lima, manipulación JSON, formato de moneda). | `npm test` |
| **`tests/integration/`** | Integración | Interacción real con MySQL/Prisma usando credenciales de prueba (`.env.test`). | `npm test` |
| **`tests/e2e/`** | End-to-End HTTP | Flujos completos desde la ruta Express hasta la respuesta HTTP usando Supertest. | `npm test` |
| **`tests/manual/integrations/`** | Exploratorio Manual | Verificación en vivo de conectividad, cuotas y respuestas de APIs externas. | `npx tsx tests/manual/...` |
| **`tests/email/`** | Manual / Específico | Verificación visual de templates HTML y prueba de entrega SMTP. | `npx tsx tests/email/...` |
| **`tests/telegram/`** | Manual / Específico | Entrega de alertas y formato markdown de mensajes al bot de Telegram. | `npx tsx tests/telegram/...` |
| **`tests/assets/`** | Fixtures | Archivos estáticos de prueba (facturas XML, contratos PDF, imágenes para OCR). | — |

---

## 🚀 Comandos de Ejecución

### 1. Ejecutar Suite Automatizada (Jest)
```bash
# Ejecutar todas las pruebas unitarias y e2e configuradas en Jest
npm test

# Ejecutar tests en modo observador (watch mode)
npm test -- --watch

# Ejecutar un archivo o patrón específico
npm test -- tests/unit/services/tipocambio.Service.test.ts
```

### 2. Ejecutar Scripts de Exploración Manual (tsx)
Los scripts dentro de `tests/manual/` **nunca** son ejecutados por `npm test`. Se corren bajo demanda:
```bash
# Probar conectividad con ApisPeru
npx tsx tests/manual/integrations/apisperu/connectivity.ts

# Probar sincronización y fallback de proveedores
npx tsx tests/manual/integrations/apisperu/fallback.ts
npx tsx tests/manual/integrations/apisperu/provider-sync.ts

# Probar conectividad con Decolecta
npx tsx tests/manual/integrations/decolecta/connectivity.ts
```

---

## 📝 Buenas Prácticas de Testing

1. **Aislamiento en Tests Unitarios:**
   - En `tests/unit/services/`, **nunca** conectarse a una base de datos real.
   - Utilizar `jest.mock()` para simular las respuestas de los DAOs (`#root/src/daos/*`) y de `prismaFT`.
2. **Determinismo:**
   - Todo test automatizado debe ser idempotente y no depender del estado dejado por pruebas previas.
3. **Limpieza de Recursos:**
   - Los tests que generen archivos temporales (PDFs de liquidación o reportes) deben eliminarlos en el bloque `afterEach` o `afterAll`.
