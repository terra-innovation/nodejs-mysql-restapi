# Consolidado de Operaciones de Factoring

## Comportamiento

En Menú Financiero → Factoring empresa → Operaciones, el botón **Descargar XLSX** aparece en la barra superior de la tabla, junto al selector de columnas. Durante la generación se deshabilita; ante errores muestra el mensaje y permite reintentar.

El backend genera el archivo en memoria mediante SheetJS ya instalado y devuelve el binario en `GET /api/v1/financiero/servicio/factoring/factoring/consolidado.xlsx`. Requiere sesión y rol financiero 6 vigente, igual que la lista. No conserva archivos en disco; la respuesta usa `Cache-Control: no-store`.

Nombre: `Consolidado de Operaciones de Factoring (YYYYMMDD_HHmm).xlsx`, con fecha y hora de `America/Lima`. Se usa guion bajo según el ejemplo adjunto: el asterisco no es válido en nombres de archivo Windows.

## Datos y fechas

- Conserva las 51 columnas y su orden, incluidos encabezados duplicados y separadores. Los alias SQL internos son únicos para evitar perder columnas repetidas.
- La consulta corresponde a la proporcionada, reparando caracteres dañados del texto en los JOIN finales. No añade filtros de estado, búsqueda, columnas visibles ni paginación.
- Incluye registros eliminados. Conserva los INNER/LEFT JOIN y la multiplicidad por facturas, liquidaciones y comprobantes del factor. No agrega ni deduplica filas.
- Conserva las subconsultas por concepto con `LIMIT 1` y los importes almacenados; no recalcula fórmulas, redondeos, porcentajes ni tipos de cambio.
- En la conexión UTC existente, `CONVERT_TZ(campo, @@session.time_zone, '-05:00')` seguido de `DATE_FORMAT` equivale a seleccionar `DATE(campo)` en sesión Perú, sin ejecutar `SET time_zone` sobre conexiones compartidas del pool.
- Las fechas se exportan como fechas Excel `dd/mm/yyyy` sin desplazamiento posterior por la zona del servidor o navegador. Los valores ausentes quedan en blanco. Importes y tasas son números; códigos, comprobantes y RUC se conservan como texto. El texto recibido no se convierte en fórmulas Excel.

## Validación actual

- Node portable 24.21.0 verificado.
- Tipos de aplicación aprobados en backend y frontend.
- Tipos de pruebas Vitest/backend, integración y frontend aprobados.
- ESLint de los archivos de aplicación modificados aprobado en ambos proyectos.
- Backend: 11 pruebas unitarias/HTTP aprobadas; transporte/controlador/servicio/DAO reales con acceso a datos simulado. Se abre el binario resultante con SheetJS. Log: `docs/registros/pruebas/test-consolidado-factoring-20261014.log`.
- El primer intento encontró EPERM del aislamiento; la ejecución fuera del aislamiento permitió completar las pruebas.
- Integración real aprobada posteriormente con Docker Linux disponible: 19 suites y 554 pruebas, incluido consolidado y runtime compilado; limpieza verificada. Se corrigió un campo inexistente en los datos sintéticos del test nuevo, sin modificar aplicación ni expectativas. No se consultaron ni modificaron registros de desarrollo.
- Posteriormente el usuario confirmó la descarga manual en Excel y autorizó CI completa: backend aprobado en repetición; frontend aprobado con 85 suites y 3.000 pruebas tras confirmar las reglas de detracciones y actualizar sus expectativas. Ver [resultado CI local](ci-consolidado-factoring-20261014.md).
- No se ejecutó empaquetado de producción. La validación manual de navegador y Excel fue realizada por el usuario.

## Comandos de regresión

Para repetir la prueba del consolidado con Docker Linux disponible, desde la raíz del backend:

```powershell
$env:Path = 'D:\Herramientas\node-v24.21.0-win-x64;' + $env:Path
node --version
node -p "process.execPath"
npm.cmd run test:integration -- tests/mariadb/factoringConsolidado.test.ts
```

Desde la raíz del frontend, pruebas enfocadas de transporte, descarga y controles de la tabla compartida, más la lista financiera existente para comprobar regresiones:

```powershell
& .\scripts\npm-node24.ps1 --silent run test:ci -- src/api/finanzatech/financiero/servicio/factoring/factoring.consolidado.test.ts src/pages/financiero/servicio/factoring/factoring/FactoringLista.consolidado.test.tsx src/components/finanzatech/table/ReactTablePrincipal.test.tsx src/pages/financiero/servicio/factoring/factoring/FactoringLista.test.tsx
```

Revisar resumen sin fallos y salida 0. Los mocks no certifican descarga real ni SQL. En navegador, entrar con rol financiero, descargar el consolidado y abrirlo en Excel: comprobar nombre Lima, columnas, importes, fechas y respuesta ante fallo de red. Verificar que filtrar la lista no limita el consolidado completo.

