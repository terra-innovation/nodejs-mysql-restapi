# Cobertura de garantía con tasa cero

Fecha: 09/10/2026, America/Lima. Estado: cerrado tras validación conjunta autorizada por el usuario. Referencia: DT-LIQ-05. [Resultados actuales y límites](validacion-final-deudas-factoring-20261009.md).

## Regla elegida

Con tasa mensual cero, devolver y guardar `dias_cobertura_garantia_estimado: null` y mostrar «No calculable con tasa cero», independientemente de la garantía o financiamiento. No significa cero días ni una promesa de cobertura ilimitada. La cobertura numérica anterior se conserva cuando la tasa usada en su denominador es positiva. No se alteran importes financieros ni datos históricos.

El control en V2/V3 usa `simulacion.tdm`, ya redondeada por la lógica existente a cinco decimales. También evita dividir entre cero cuando una tasa de entrada muy pequeña se redondea a cero. El esquema de propuesta y simulación ya es nullable; no se requieren migraciones ni regeneración de Prisma. Los servicios de alta conservan explícitamente este null tras la limpieza habitual de campos vacíos.

En frontend, `src/utils/factoringCoverage.js` centraliza el texto en las pantallas y listas de propuesta, propuesta aceptada y simulación administrativa. Para cobertura ausente/no finita con tasa desconocida o positiva se muestra «No disponible». La utilidad no cambia la tasa ni calcula intereses.

Se conserva el rango de ingreso existente del formulario de alta de propuesta (0,5 % a 5 %), aunque el backend admite tasa cero. El caso de UI preparado comprueba la presentación de una respuesta sintética con tasa cero; no pretende habilitar su ingreso en ese formulario ni certificar que ese recorrido genere una propuesta de tasa cero. La modificación también presenta la tasa cero en registros leídos y en las simulaciones que la admitan.

## Validación preparada para el final

La ejecución se difirió durante la implementación y posteriormente se completó por solicitud explícita del usuario. Aprobaron cálculo, HTTP, tipos, presentación y persistencia real de propuesta/simulación; no se ejecutó navegador/E2E. Los comandos siguientes conservan el procedimiento y deben contrastarse con el informe final.

Desde la raíz del backend:

```powershell
npx --no-install tsc --noEmit
npm run test:vitest:typecheck
npm run test:integration:typecheck
npm run test:vitest -- tests/vitest/unit/factoring.Calculator.test.ts tests/vitest/unit/factoringpropuesta.business.test.ts tests/vitest/unit/factoringliquidacion.business.test.ts tests/vitest/http/factoring.business.test.ts
npm test -- --runInBand --runTestsByPath tests/unit/services/admin/factoringliquidacion.Service.test.ts tests/unit/services/admin/factoringliquidacion.audit.test.ts tests/unit/services/admin/factoringsimulacion.dates.test.ts -t 'Unit Tests|DT-LIQ-05|pago-dia-antes-inicio|pago-diez-dias-antes-inicio|cargo-negativo|cantidad-negativa' --verbose=false
```

La selección Vitest comprueba calculadores V2/V3, propuestas, liquidaciones y HTTP con infraestructura simulada; incluye regresión de los tres puntos tratados. El filtro Jest conserva las expectativas originales de los cuatro escenarios de cronología/negativos y añade la simulación con tasa cero. El resto de la auditoría queda omitido por el filtro, sin declararse aprobado. Configurar `CI=true` temporalmente en automatización según backend-validation.

Para persistencia real, usar exclusivamente el runner MariaDB desechable, con los requisitos de `tests/mariadb/README.md`:

```powershell
npm run test:integration:doctor
npm run test:integration -- tests/mariadb/proposal.test.ts
```

En la validación final se añadieron y aprobaron también casos de guardado/lectura real de simulaciones y rechazo de entradas inválidas sin registros. Se ejecutó conjuntamente `npm run test:integration -- tests/mariadb/proposal.test.ts tests/mariadb/settlement.test.ts`, con limpieza confirmada. No se exportó el esquema ni se accedió a bases compartidas.

Desde la raíz del frontend, ejecución manual conforme a su AGENTS.md y frontend-validation:

```powershell
npm --silent run test:ci -- --runTestsByPath src/utils/factoringCoverage.test.js src/test-utils/factoringPropuestaLiquidacion.business.test.js src/test-utils/factoringEdicionEstados.business.test.js src/test-utils/factoringListasIntegradas.business.test.js --verbose=false
$LASTEXITCODE
```

La utilidad cubre el texto de tasa cero, días positivos/cero y datos ausentes/no finitos. El flujo de alta prueba el resultado de tasa cero en ambos roles; las suites de edición/listas se incluyen porque también consumen la presentación modificada. No prueban servidor ni persistencia. Para detalle/resúmenes y simulaciones administrativas, revisar visualmente con datos sintéticos: tasa cero debe mostrar el texto elegido en alta y después de guardar/abrir; tasa positiva debe conservar los días. Los mensajes y límites de negativos de DT-LIQ-02 siguen documentados en `docs/pruebas/FACTORING_PROPUESTA_LIQUIDACION.md` del frontend.

Revisar resúmenes y códigos de salida. No ejecutar builds ni actualizar snapshots como sustituto de estas pruebas. DT-LIQ-05 quedó cerrada con la evidencia fechada del informe final, que distingue la primera pasada de frontend con timeouts del reintento focalizado aprobado.
