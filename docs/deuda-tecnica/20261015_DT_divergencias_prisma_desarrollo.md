# Divergencias previas reflejadas al sincronizar Prisma de desarrollo

Fecha: 15/10/2026. Estado: detectadas y documentadas; no corregidas mediante DDL ni cambios funcionales.

## Evidencia

La introspección del destino leído explícitamente de `.env.development`, después de crear las tablas bancarias y de que el usuario agregara las cuatro tablas SBS, refleja dos diferencias preexistentes respecto del schema local respaldado antes de esta ejecución:

1. `factoring_estado.factoring_cartera`: el schema previo declaraba `onDelete: Cascade`; el destino introspecta `onDelete: NoAction, onUpdate: NoAction` para `FK_factoringestado__idfactoringcartera`.
2. `inversionista_deposito`: el schema previo contenía `inversionistasdepositoid` y `inversionistadepositoid`, con unicidad en el segundo. El destino introspecta solamente `inversionistasdepositoid`, con la unicidad `UQ_bancodeposito_bancodepositoid`.

La [comparación normalizada](../transacciones-bancarias/revision-prisma-final.json) conserva las declaraciones anteriores y finales. Además de estas diferencias, solo aparecen los seis modelos nuevos y las dos relaciones inversas correspondientes en `factor_cuenta_bancaria`. No desapareció ningún modelo previo después de la sincronización definitiva.

El [informe DDL](../registros/bbdd/2026-10-16T02-34-20-432Z-ddl.json) acredita que la creación bancaria no modificó estructuras existentes. Las diferencias anteriores ya estaban presentes en la primera introspección, antes de la posterior incorporación SBS comunicada por el usuario; no se atribuyen a esta creación ni a una persona sin evidencia.

## Implicación y seguimiento

El schema y cliente finales reflejan el destino real, sin edición manual para ocultar diferencias. La comprobación de tipos del backend pasa, pero no demuestra compatibilidad de clientes externos ni comportamiento de eliminación en esos módulos.

Revisar en una tarea separada el contrato público/consumidores del identificador de depósito y la acción de eliminación de cartera. Si hace falta modificar estructura, obtener autorización expresa para ese alcance; no ampliar el manifiesto bancario. No renombrar atributos ni restaurar CASCADE por iniciativa propia.

La ausencia inicial de tablas SBS se resolvió al agregarlas el usuario y repetir prisma-sync. Las huellas de destino actuales e históricas se conservan en [el diagnóstico inicial](../transacciones-bancarias/diferencias-previas.json); ese archivo describe el estado anterior a la resolución, no una ausencia actual.
