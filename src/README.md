# Arquitectura por Capas — `ft-app-backend`

Este documento describe la arquitectura modular y por capas implementada en el backend de Factoring, asegurando estricta separación de responsabilidades, alta cohesión, bajo acoplamiento y desacoplamiento total de los controladores HTTP respecto a la persistencia e infraestructura.

---

## 🏛️ Mapa de Capas y Flujo de Información

```mermaid
flowchart TD
    Client(["Cliente / Frontend (Web/Mobile)"]) --> Routes["routes/\n(Transporte: Endpoints, Middlewares & Seguridad)"]
    Routes --> Controllers["controllers/\n(Transporte: Parseo, Validación Yup & DTOs)"]
    Controllers --> Services["services/\n(Dominio/Aplicación: Reglas de Negocio, Orquestación & Transacciones)"]
    
    subgraph Data & External Layer
        Services --> DAOs["daos/\n(Acceso a Datos: Consultas Prisma)"]
        Services --> Integrations["integrations/\n(Clientes APIs Externas: Decolecta, APIsPerú, SUNAT)"]
        Services --> Providers["providers/\n(Infraestructura: Email SMTP, Bot Telegram)"]
    end

    DAOs --> DB[(Base de Datos MySQL / Prisma)]
    Integrations --> ExternalAPIs(["APIs Externas"])
    Providers --> NotificationGateways(["Servicios de Notificación"])
```

---

## 📋 Matriz de Responsabilidades y Reglas de Importación

| Capa / Directorio | Tipo de Capa | Responsabilidad Principal | Puede Importar de | NO Puede Importar de |
|---|---|---|---|---|
| **`routes/`** | Transporte | Define rutas HTTP, asocia middlewares de autenticación (`isAuth`), autorización por rol (`isRole`) y envuelve handlers con `catchedAsync`. | `controllers/`, `middlewares/` | `services/`, `daos/`, `models/`, `providers/` |
| **`controllers/`** | Transporte | **Capa delgada**: Extrae parámetros (`params`, `body`, `query`, `session_user`), valida esquemas Yup/DTOs, delega al servicio correspondiente y devuelve respuesta con `response(res, status, data)`. | `services/`, `utils/`, DTOs/esquemas | `daos/`, `models/prisma`, `providers/`, `integrations/`, llamadas a transacciones Prisma |
| **`services/`** | Negocio / Aplicación | Contiene reglas de negocio puras, orquestación de casos de uso, transacciones (`$transaction`), llamadas a DAOs, providers e integraciones. Agnóstico al transporte HTTP. | `daos/`, `integrations/`, `providers/`, `models/`, `utils/`, `constants/` | `express` (`Request`, `Response`), `controllers/`, `routes/` |
| **`daos/`** | Acceso a Datos | Consultas y mutaciones directas a Prisma (`prismaFT` o cliente transaccional `tx`). No contiene reglas de negocio. | `models/`, `types/`, Prisma Client | `controllers/`, `services/`, `integrations/`, `providers/` |
| **`integrations/`** | Servicios Externos | Adaptadores para APIs de terceros que alimentan el dominio (Decolecta, APIsPerú, SUNAT, SBS). | `utils/`, `config/`, `types/` | `controllers/`, `services/`, `daos/` |
| **`providers/`** | Infraestructura | Clientes técnicos para canales de notificación (Email SMTP, Telegram). Efectos secundarios de entrega. | `utils/`, `config/`, `templates/` | `controllers/`, `routes/`, `daos/` |
| **`utils/`** | Utilidades | Funciones puras y reutilizables (formato de números, fechas, crypto, logs Pino). | Librerías estándar | `controllers/`, `services/`, `daos/` |
| **`scripts/`** | CLI / Crons | Tareas ejecutables (sincronización de tipo de cambio, envío de emails programados). | `services/`, `utils/`, `config/` | `controllers/`, `routes/` |

---

## 🗂️ Mapa y Organización de `services/`

El directorio `src/services/` se divide entre servicios **Core transversales** y servicios **Especializados por Rol/Actor**:

### 1. Servicios Core Transversales (`src/services/`)
- `factoring.Service.ts`: Lógica matemática central de factoring (simulación v3/v4, tasas tda/tdd, cálculo de comisiones e importes).
- `tipocambio.Service.ts`: Sincronización y consulta del tipo de cambio SBS y SUNAT.
- `archivo.Service.ts` / `archivofactura.Service.ts`: Gestión base de almacenamiento físico y metadatos de archivos.
- `empresa.Service.ts` / `persona.Service.ts` / `contacto.Service.ts`: Mantenimiento y validación de entidades principales.
- `cedentelimite.Service.ts` / `factorlimite.Service.ts` / `pagadorlimite.Service.ts`: Gestión de límites y aforos crediticios.
- `cuentabancariaestado.Service.ts`: Validación y transiciones de cuentas bancarias.
- `emailVentaFrio.Service.ts`: Servicio para campañas de prospección automatizada.
- `health.Service.ts`: Chequeo de salud del servicio y conectividad a base de datos.

### 2. Servicios por Rol (`src/services/[rol]/`)

#### `src/services/admin/` (Panel Administrativo y Backoffice)
- `factoring.Service.ts`: Auditoría, control de operaciones de factoring y autorizaciones generales.
- `factoringpropuesta.Service.ts`: Simulación, creación, activación y aprobación de propuestas administrativas.
- `factoringliquidacion.Service.ts`: Simulación, generación de liquidaciones financieras, cálculo de mora/pronto pago y emisión de liquidación en PDF.
- `factoringfacturafactor.Service.ts`: Asociación y desasociación de facturas asignadas al factor.
- `factoringhistorialestado.Service.ts`: Trazabilidad y auditoría de cambios de estado en operaciones.
- `factoringpropuestahistorialestado.Service.ts`: Historial de estados y revisiones de propuestas.
- `factoringtransferenciacedente.Service.ts`: Control de transferencias y pagos directos a cedentes.
- `factoringsimulacion.Service.ts`: Simulaciones exploratorias de riesgo y escenarios de tasa.
- `accionista.Service.ts`, `funcionario.Service.ts`, `registrooperacion.Service.ts`, `zlaboratorio.Service.ts`.

#### `src/services/financiero/` (Módulo Financiero / Operaciones)
- `factura.Service.ts`: Carga de comprobantes XML/PDF, activación, inactivación y consulta de facturas.
- `factoring.Service.ts`: Gestión financiera de operaciones y solicitudes.
- `factoringpropuesta.Service.ts`: Generación y revisión de propuestas comerciales.
- `factoringliquidacion.Service.ts`: Procesamiento y aprobación de liquidaciones para factoring.
- `factoringfacturafactor.Service.ts`: Validación de facturas y vinculación de factores.
- `factoringhistorialestado.Service.ts` / `factoringpropuestahistorialestado.Service.ts`: Control de flujo de estados.
- `factoringtransferenciacedente.Service.ts`: Registro y validación de transferencias bancarias a cedentes.
- `sbstipocambio.Service.ts` / `sunattipocambio.Service.ts`: Integración con fuentes oficiales de tipo de cambio.

#### `src/services/empresario/` (Portal del Cedente)
- `factura.Service.ts`, `factoring.Service.ts`, `factoringpropuesta.Service.ts`, `factoringliquidacion.Service.ts`, `factoringtransferenciacedente.Service.ts`, `factoringfacturafactor.Service.ts`, `contacto.Service.ts`, `empresacuentabancaria.Service.ts`, `usuarioservicioempresa.Service.ts`.

#### `src/services/inversionista/` (Portal del Inversionista)
- `factoring.Service.ts`: Oportunidades de inversión en operaciones activas.
- `inversionistacuentabancaria.Service.ts`: Cuentas bancarias de abono y rescate.

#### `src/services/usuario/` (Gestión de Usuario y Cuenta)
- `archivo.Service.ts`: Carga segura con verificación de MIME types reales (`file-type`), tamaños y eliminación.
- `persona.Service.ts`, `usuario.Service.ts`, `credencial.Service.ts`, `menu.Service.ts`, `usuarioservicio.Service.ts`.

#### `src/services/secure/` (Autenticación y Seguridad)
- `secure.Service.ts`: Inicio de sesión, generación y verificación de JWT, recuperación de contraseñas y códigos OTP.

---

## 🛡️ Auditoría Arquitectónica y Estado de Desacoplamiento

El sistema cuenta con una verificación estricta de separación de capas:

- **100% de controladores desacoplados**: Ningún controlador en `src/controllers/` realiza importaciones de DAOs (`from.*daos/`), llamadas directas a Prisma Client / `$transaction`, ni invoca clientes de infraestructura (`providers/`).
- **Controladores delgados**: Los controladores únicamente actúan como adaptadores de entrada HTTP que parsean parámetros, validan tipos/esquemas, delegan la lógica a los servicios y retornan las respuestas HTTP estandarizadas.
- **Transaccionalidad en Servicios**: La orquestación de transacciones atómicas (`prismaFT.client.$transaction`) reside íntegramente dentro de los servicios de aplicación.

---

## 🧪 Pruebas Unitarias Automatizadas (`tests/unit/`)

La arquitectura está respaldada por una suite de pruebas automatizadas con Jest y TypeScript (`ts-jest`), libre de dependencias de bases de datos vivas mediante mocking de DAOs y Prisma:

- **`tests/unit/services/usuario/archivo.Service.test.ts`**: Pruebas de validación de extensiones, límites de peso, detección MIME real y borrado seguro.
- **`tests/unit/services/financiero/factura.Service.test.ts`**: Verificación de delegación correcta de consultas, altas y bajas de facturas.
- **`tests/unit/services/admin/factoringpropuesta.Service.test.ts`**: Verificación de cálculos de propuesta y simulación financiera.
- **`tests/unit/services/admin/factoringliquidacion.Service.test.ts`**: Precisión de fórmulas financieras para pronto pago y mora.
- **`tests/unit/services/factoring.Service.test.ts`**: Simulación de tasas efectivas y condiciones contractuales.
- **`tests/unit/services/tipocambio.Service.test.ts`**: Normalización de fechas Lima UTC y generadores de código.

---

## ⛔ Reglas de Oro para Mantener la Arquitectura

1. **El Controlador es delgado y pasivo:**
   - Su única misión es recibir la petición HTTP, validar la estructura con Yup, llamar al servicio y responder al cliente con `response(res, status, data)`.
   - **NUNCA** debe importar de `src/daos/` ni de `src/models/prisma/`.
   - **NUNCA** debe abrir transacciones de base de datos (`$transaction`).

2. **El Servicio es agnóstico del protocolo:**
   - **NUNCA** recibe `req` ni `res` de Express.
   - Recibe tipos primitivos o DTOs tipados.
   - Lanza excepciones de dominio (`ClientError`) cuando una regla de negocio o existencia falla.

3. **Capa de Notificaciones en Providers:**
   - Ningún controlador invoca directamente proveedores de mensajería (Telegram, SendGrid, SMTP). La notificación es parte de la orquestación del caso de uso en el servicio.
