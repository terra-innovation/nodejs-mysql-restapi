import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Script para empaquetar el código de producción en un archivo ZIP.
 * El archivo resultante se guarda en la carpeta 'pases_a_produccion'.
 * Nombre del archivo: YYYYMMDD_HHMM_PROJECTNAME.zip
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

/**
 * Copia recursivamente solo la estructura de carpetas, sin archivos.
 */
function copyStructure(src, dest) {
  if (!fs.existsSync(src)) return;
  const items = fs.readdirSync(src, { withFileTypes: true });
  for (const item of items) {
    if (item.isDirectory()) {
      const srcPath = path.join(src, item.name);
      const destPath = path.join(dest, item.name);
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyStructure(srcPath, destPath);
    }
  }
}

/**
 * Copia recursivamente con un filtro para archivos.
 */
function copyWithFilter(src, dest, filterFn) {
  let skipped = [];
  if (!fs.existsSync(src)) return skipped;
  const items = fs.readdirSync(src, { withFileTypes: true });
  for (const item of items) {
    const srcPath = path.join(src, item.name);
    const destPath = path.join(dest, item.name);
    if (item.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      const subSkipped = copyWithFilter(srcPath, destPath, filterFn);
      skipped = skipped.concat(subSkipped);
    } else {
      if (filterFn(item.name)) {
        fs.copyFileSync(srcPath, destPath);
      } else {
        skipped.push(srcPath);
      }
    }
  }
  return skipped;
}

async function main() {
  try {
    // 1. Obtener información del proyecto
    const packageJsonPath = path.join(rootDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const projectName = packageJson.name || 'project';

    // 2. Ejecutar el build
    console.log('--- Iniciando build... ---');
    execSync('npm run build', { stdio: 'inherit', cwd: rootDir });
    console.log('--- Build finalizado con éxito ---');

    // 3. Validar carpetas requeridas
    console.log('--- Validando existencia de carpetas requeridas ---');
    const requiredFolders = ["assets", "dist", "security", "static", "temporal", "generated", "logs", "storage"];
    const missingFolders = requiredFolders.filter(folder => !fs.existsSync(path.join(rootDir, folder)));

    if (missingFolders.length > 0) {
      console.error('\n❌ ERROR: El proceso ha sido cancelado porque faltan las siguientes carpetas requeridas:');
      missingFolders.forEach(folder => console.error(`   - ${folder}`));
      console.error('\nPor favor, asegúrate de que todas estas carpetas existan en la raíz antes de volver a intentar.\n');
      process.exit(1);
    }

    // 4. Crear carpeta pases_a_produccion si no existe
    const outputDir = path.join(rootDir, 'pases_a_produccion');
    if (!fs.existsSync(outputDir)) {
      console.log('Creando carpeta "pases_a_produccion"...');
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 5. Generar nombre del archivo con formato solicitado: YYYYMMDD_HHMM_PROJECTNAME.zip
    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const DD = String(now.getDate()).padStart(2, '0');
    const HH = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    
    const timestamp = `${YYYY}${MM}${DD}_${HH}${mm}`;
    const zipName = `${timestamp}_${projectName}.zip`;
    const zipPath = path.join(outputDir, zipName);

    // 6. Preparar carpeta temporal para empaquetado
    const tempZipDir = path.join(outputDir, 'temp_zip_content');
    if (fs.existsSync(tempZipDir)) {
      fs.rmSync(tempZipDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tempZipDir, { recursive: true });

    console.log('--- Preparando contenido para el ZIP ---');

    // a. Copiar carpetas completas
    const foldersToCopy = ["assets", "dist", "security", "static", "temporal"];
    foldersToCopy.forEach(folder => {
      const src = path.join(rootDir, folder);
      console.log(`Copiando carpeta: "${folder}"...`);
      fs.cpSync(src, path.join(tempZipDir, folder), { recursive: true });
    });

    // b. Copiar 'generated' filtrando extensiones que empiecen con .tmp
    const generatedSrc = path.join(rootDir, 'generated');
    if (fs.existsSync(generatedSrc)) {
      console.log('Copiando carpeta "generated" (filtrando archivos con extensión .tmp*)...');
      const skipped = copyWithFilter(generatedSrc, path.join(tempZipDir, 'generated'), (name) => {
        const ext = path.extname(name).toLowerCase();
        return !ext.startsWith('.tmp');
      });
      if (skipped.length > 0) {
        console.log('Archivos omitidos en "generated":');
        skipped.forEach(file => console.log(`  - ${path.relative(generatedSrc, file)}`));
      }
    }

    // c. Copiar estructura de 'logs' y 'storage'
    ['logs', 'storage'].forEach(folder => {
      const src = path.join(rootDir, folder);
      if (fs.existsSync(src)) {
        console.log(`Copiando SOLO la estructura de carpetas de: "${folder}" (sin archivos)...`);
        const dest = path.join(tempZipDir, folder);
        fs.mkdirSync(dest, { recursive: true });
        copyStructure(src, dest);
      }
    });

    // d. Copiar todos los archivos de la raíz
    console.log('Copiando todos los archivos de la raíz...');
    const rootItems = fs.readdirSync(rootDir, { withFileTypes: true });
    rootItems.forEach(item => {
      if (item.isFile()) {
        fs.copyFileSync(path.join(rootDir, item.name), path.join(tempZipDir, item.name));
      }
    });

    console.log(`--- Iniciando compresión en: ${zipName} ---`);

    // 6. Comprimir la carpeta temporal usando PowerShell
    const command = `powershell -Command "Compress-Archive -Path '${tempZipDir}\\*' -DestinationPath '${zipPath}' -Force"`;
    execSync(command, { stdio: 'inherit', cwd: rootDir });

    // 7. Limpiar carpeta temporal
    console.log('Limpiando archivos temporales...');
    fs.rmSync(tempZipDir, { recursive: true, force: true });

    console.log('--- Proceso de empaquetado completado exitosamente ---');
    console.log(`Archivo generado en: ${zipPath}`);

  } catch (error) {
    console.error('Error durante el empaquetado:', error);
    process.exit(1);
  }
}

main();
