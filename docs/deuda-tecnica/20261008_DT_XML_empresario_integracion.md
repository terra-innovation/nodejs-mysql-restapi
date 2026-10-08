# Registro XML del empresario: integración real y atomicidad

Fecha: 2026-10-08. Suite: `tests/mariadb/entrepreneur.test.ts`.
MariaDB 11.4.10 exclusiva, estructura de 127 tablas previamente exportada;
usuarios, empresas, archivos, catálogos y líneas completamente sintéticos.

## DT-IT-03 — Factura persistida antes de validar elegibilidad (corregido)

El servicio `subirFacturaService` confirmaba cabecera/detalles/vínculos en una
transacción y ejecutaba elegibilidad, empresas y enriquecimiento en otra.
Se reprodujo persistencia parcial ante asociación inactiva, cedente inactivo,
cuotas no elegibles, vencimiento corto, líneas ausentes/inactivas/insuficientes,
pagador no registrado, moneda sin maestro y fallo SQL final.

La corrección extiende la atomicidad anterior al empresario: todo el flujo usa
una transacción, con el timeout existente. Rechazos y errores SQL revierten
cabecera, todos los detalles y vínculos. Las empresas previamente existentes
y los archivos previamente subidos se conservan. Se mantiene el orden de las
validaciones, los mensajes, los códigos 404/422 y las fórmulas de importes.
No hay migración de esquema ni reparación de información histórica.

## Alcance de las 27 pruebas nuevas

| Área | Casos | Evidencia |
|---|---:|---|
| Éxito PEN/USD | 2 | Moneda/cantidad reales del ítem, cuotas y vínculos, actor, neto 1180, líneas exactamente iguales al neto, empresas reutilizadas |
| Asociación | 3 | Otro usuario existente sin asociación, asociación inactiva, cedente inactivo: 404 y cero importación |
| Cuotas/plazo | 4 | Contado, dos cuotas y cinco días se rechazan; seis días se acepta. Reloj Luxon fijo, sin fake timers de Prisma |
| Líneas | 9 | Factor/cedente/pagador: ausente, inactiva, disponible 1179.99 frente a neto 1180: 422, aviso de límite y rollback |
| Empresas/moneda ausentes | 3 | Pagador o cedente desconocidos no se crean automáticamente; moneda EUR sin maestro se rechaza |
| Factura ya vinculada | 2 | Operación activa bloquea por RUC/serie/número y revierte nueva importación; operación inactiva no bloquea, comportamiento existente |
| Fallos SQL | 2 | Error al vincular PDF y error SQL en consulta final de moneda revierten importación completa |
| DAO de empresa | 2 | Crear/leer por RUC, restricción única, rollback de primera creación si falla la segunda |

Los DAOs, servicios, parser, Prisma y transacciones son reales. Solo se aíslan
configuración, almacenamiento local y Telegram. El fallo PDF es un trigger
temporal, eliminado en `finally`. En el fallo de moneda se ejecuta primero el
DAO real y después una consulta SQL inválida en la transacción final; no se
fabrican resultados del DAO. Las FK permanecen activas durante los casos y limpieza.

## Creación de empresas: límite del flujo actual

La elegibilidad exige que el cedente exista y esté asociado al usuario, y que
el pagador exista y tenga una línea. Las ramas posteriores que intentan crear
esas mismas empresas no se alcanzan normalmente con estos requisitos y un
snapshot consistente. No se falsifican lecturas ni se cambian permisos/reglas
para forzarlas. Las pruebas distinguen reutilización/rechazo en el servicio
de creación y rollback directamente con el DAO real.

Si se desea permitir alta automática durante importación, hace falta definir
cómo se aprobarían asociación y líneas. Esta ampliación no adopta esa política.

## Resultado y reproducción

**46 pruebas reales aprobadas**: 27 de empresario, 15 de XML administrativo y
aprobación, 4 de entorno. **344 pruebas rápidas aprobadas**, 8 criterios de
decisión previos siguen pendientes. `tsc --noEmit` y tipos de integración aprobados.
Los reportes se guardan en `coverage/mariadb/`; contenedor eliminado al finalizar.

```powershell
npm run test:integration -- tests/mariadb/entrepreneur.test.ts
npm run test:integration
npm run test:vitest:ci
```

## Próximo paso

La ampliación de creación de factoring y actualización administrativa de líneas
ya se ejecutó: 27 casos adicionales, total 73 pruebas reales aprobadas.
Ver [DT-IT-04/05](20261008_DT_creacion_factoring_integracion.md).
Pendientes liquidaciones y transferencias con MariaDB real. La carga XML
solo verifica disponibilidad; estas pruebas no certifican reserva o consumo
concurrente de las líneas. HTTP/Multer y entrega real de Telegram siguen fuera
de esta suite. Tampoco se garantiza atomicidad entre avisos externos y commit SQL.
