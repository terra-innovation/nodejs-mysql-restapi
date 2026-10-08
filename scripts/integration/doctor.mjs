import { dockerReady, loadBaseline, image } from "./mariadb-common.mjs";
try {
  const baseline = await loadBaseline();
  console.log(`Estructura: ${baseline.tables.length} tablas, ${baseline.sourceVersion}; destino: ${image}.`);
  await dockerReady();
  console.log("Docker Linux disponible. El diagnóstico no crea bases ni consulta desarrollo.");
} catch (error) {
  console.error(error.code === "ENOENT" ? "Falta baseline.json. Ejecuta npm run test:integration:schema." : error.message);
  process.exitCode = 1;
}
