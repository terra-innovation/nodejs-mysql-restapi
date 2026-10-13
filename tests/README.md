# Estándar y Estrategia de Testing — `ft-app-backend`

Este documento describe la organización, convención de nombres y forma de ejecución de las pruebas en el proyecto.

Vitest es el runner de `npm test`. La selección rápida incluye `tests/vitest/unit/`,
`http/`, `pending/` y las suites originales adaptadas en `migrated/`. Configuración, comandos y alcance: [Guía de Vitest](vitest/README.md).

El entorno de integración real con MariaDB tiene comandos separados y una
[guía propia](mariadb/README.md). Usa una instancia desechable y estructura
exportada de desarrollo. Docker/WSL están funcionando. La suite real ampliada
reúne 496 casos en dieciséis archivos: 494 de negocio/entorno y dos del backend
compilado, validados en ejecuciones generales y focalizadas. Se corrigieron aprobación concurrente y atomicidad
del registro administrativo/financiero y del empresario.
Para validar compilación, arranque HTTP/Prisma, cierre y conexión rechazada:
`npm run test:runtime`. Ver [alcance y límites](../docs/deuda-tecnica/20261008_regresion_backend_compilado.md).
XML PEN/USD, lectura, rollback y aprobación normal ya se comprueban en MariaDB.
La generación/descarga de propuesta y liquidación reúne 104 casos con PDFs reales,
facturas vinculadas, anticipación/mora, paginación y concurrencia. Los nombres
largos y veinte facturas añaden cobertura de contenido y diagnósticos de la
superposición nombre/RUC pendiente en propuesta (DT-PDF-05). Los casos del
mismo documento reproducen una interferencia de limpieza pendiente (DT-PDF-04):
[alcance y límites](../docs/deuda-tecnica/20261008_integracion_PDF.md).
Dieciséis cancelaciones TCP reales comprueban limpieza, ausencia de cambios SQL
y reintento completo antes del cuerpo; no cubren interrupción a mitad del PDF.
Dieciséis fallos de escritura comprueban rechazo antes de crear el PDF y
archivo parcial huérfano (DT-PDF-01), cierre del stream y reintento completo.
El montaje real de `src/app.ts` añade 29 casos de rutas, sesión/roles, CORS, IP,
Helmet, limitador global, errores y liquidación PEN/USD con rollback. Ver
[alcance y límites](../docs/deuda-tecnica/20261008_integracion_montaje_global.md).
Login y refresco reúnen 36 casos con bcrypt/JWT reales y MariaDB. Verifican
cuentas/credenciales activas, JWT de 24 horas en producción y bloqueo de roles
retirados para tokens anteriores: [correcciones y límites](../docs/deuda-tecnica/20261008_correccion_autenticacion.md).
Ver [hallazgos](../docs/deuda-tecnica/20261008_DT_integracion_MariaDB.md).
El [registro del empresario](../docs/deuda-tecnica/20261008_DT_XML_empresario_integracion.md)
cubre elegibilidad, líneas, empresas, duplicados y rollback.
La [creación de factoring](../docs/deuda-tecnica/20261008_DT_creacion_factoring_integracion.md)
cubre asociaciones, sumas Decimal, concurrencia y saldos administrativos;
crear la operación conserva el comportamiento sin consumo automático de líneas.
Liquidaciones y transferencias tienen 36 casos SQL reales; la auditoría histórica
tiene cinco regresiones sintéticas. Ver [alcance y auditoría](../docs/deuda-tecnica/20261008_integracion_liquidaciones_transferencias_auditoria.md).
El [cálculo y creación de propuestas](../docs/deuda-tecnica/20261008_integracion_propuestas_calculo.md)
añade 19 casos de persistencia, rollback, aislamiento y coincidencia con aprobación.
No existe actualización de importes de una propuesta ya creada en el flujo actual.
La [concurrencia de liquidaciones y transferencias](../docs/deuda-tecnica/20261008_integracion_concurrencia_liquidaciones_transferencias.md)
añade 12 casos de repetición, registros completos y rollback aislado; no introduce idempotencia.
El [recorrido HTTP/Multer de facturas](../docs/deuda-tecnica/20261008_integracion_HTTP_Multer_facturas.md)
reúne 83 casos con carga, registro, descarga, permisos, frontera de 20 MiB y SQL reales, incluidos
dos limitaciones conocidas de limpieza de archivos, sin corrección autorizada ni programada.

Al 2026-10-08, Vitest rápido tiene 346 casos activos y 8 criterios pendientes.
La ampliación cubre XML, asociación de facturas, aprobación y estados.
Contratos y límites: [Matriz de negocio](vitest/MATRIZ_NEGOCIO.md).

---

## 📂 Organización de Carpetas de Pruebas

```
tests/
├── vitest/migrated/              # Suites migradas con equivalencia verificada
├── vitest/unit/                  # Pruebas automatizadas nuevas (Vitest)
├── vitest/http/                  # Rutas y controladores reales con DAOs simulados
├── vitest/pending/               # Criterios pendientes de decisión (todo)
├── mariadb/                      # Integración real y runtime con MariaDB desechable
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
| **`tests/vitest/migrated/unit/services/`** | Unitario Automatizado | Lógica de negocio, cálculos financieros (`tdd`, `tda`), reglas de validación. Se aíslan con mocks de Prisma/DAOs. | `npm test` |
| **`tests/vitest/migrated/unit/utils/`** | Unitario Automatizado | Funciones utilitarias puras (conversión de fechas Lima, manipulación JSON, formato de moneda). | `npm test` |
| **`tests/vitest/unit/`** | Unitario Automatizado | Cálculos, propuestas, liquidaciones, transferencias, autenticación y archivos. | `npm run test:vitest:unit` |
| **`tests/vitest/http/`** | HTTP Automatizado | Rutas Express, autenticación, roles, validación, servicios reales y respuestas de error, con DAOs simulados. | `npm run test:vitest:http` |
| **`tests/vitest/pending/`** | Seguimiento | Criterios marcados `todo`; no son pruebas aprobadas. | Incluidos en `npm run test:vitest` |
| **`tests/mariadb/`** | Integración real | MariaDB/Prisma en una base desechable exclusiva. | `npm run test:integration`; separado de `npm test` |
| **`tests/vitest/migrated/e2e/`** | Ejemplo básico | `example.test.ts`; `index.test.ts` permanece excluido. No acredita E2E. | `npm test` |
| **`tests/manual/integrations/`** | Exploratorio Manual | Verificación en vivo de conectividad, cuotas y respuestas de APIs externas. | `npx tsx tests/manual/...` |
| **`tests/email/`** | Manual / Específico | Verificación visual de templates HTML y prueba de entrega SMTP. | `npx tsx tests/email/...` |
| **`tests/telegram/`** | Manual / Específico | Entrega de alertas y formato markdown de mensajes al bot de Telegram. | `npx tsx tests/telegram/...` |
| **`tests/assets/`** | Fixtures | Archivos estáticos de prueba (facturas XML, contratos PDF, imágenes para OCR). | — |

---

## 🚀 Comandos de Ejecución

### 1. Ejecutar Suite Automatizada (Vitest)
```bash
# Ejecutar todas las pruebas rápidas configuradas en Vitest
npm test

# Ejecutar tests en modo observador (watch mode)
npm run test:vitest:watch

# Ejecutar un archivo o patrón específico
npm test -- tests/vitest/migrated/unit/services/tipocambio.Service.test.ts
```

`vitest.config.ts` selecciona las suites rápidas en `tests/vitest/` y excluye
`tests/vitest/migrated/e2e/index.test.ts`. No ejecuta scripts manuales
ni pruebas MariaDB. Las pruebas HTTP con DAOs simulados verifican rutas y
permisos; no equivalen a un flujo completo con persistencia real.

### Ejecutar Vitest

```bash
npm run test:vitest
npm run test:vitest:watch
npm run test:vitest:coverage
npm run test:vitest:typecheck
npm run test:vitest:ci

# Tipos de Vitest y selección rápida completa una sola vez
npm run test:all
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
   - En `tests/vitest/migrated/unit/services/`, **nunca** conectarse a una base de datos real.
   - Utilizar `vi.mock()` para simular las respuestas de los DAOs (`#root/src/daos/*`) y de `prismaFT`.
2. **Determinismo:**
   - Todo test automatizado debe ser idempotente y no depender del estado dejado por pruebas previas.
3. **Limpieza de Recursos:**
   - Los tests que generen archivos temporales (PDFs de liquidación o reportes) deben eliminarlos en el bloque `afterEach` o `afterAll`.
