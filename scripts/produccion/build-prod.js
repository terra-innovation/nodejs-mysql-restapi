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

    // 3. Crear carpeta pases_a_produccion si no existe
    const outputDir = path.join(rootDir, 'pases_a_produccion');
    if (!fs.existsSync(outputDir)) {
      console.log('Creando carpeta "pases_a_produccion"...');
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 4. Generar nombre del archivo con formato solicitado: YYYYMMDD_HHMM_PROJECTNAME.zip
    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const DD = String(now.getDate()).padStart(2, '0');
    const HH = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    
    const timestamp = `${YYYY}${MM}${DD}_${HH}${mm}`;
    const zipName = `${timestamp}_${projectName}.zip`;
    const zipPath = path.join(outputDir, zipName);

    // 5. Comprimir la carpeta dist
    const distPath = path.join(rootDir, 'dist');
    if (!fs.existsSync(distPath)) {
      throw new Error(`La carpeta "${distPath}" no existe. Asegúrate de que el comando build genere esta carpeta.`);
    }

    console.log(`--- Empaquetando en: ${zipName} ---`);

    // Usar PowerShell Compress-Archive para Windows para mayor compatibilidad
    // Nota: Se agregan las comillas simples al comando para manejar espacios en las rutas
    const command = `powershell -Command "Compress-Archive -Path '${distPath}\\*' -DestinationPath '${zipPath}' -Force"`;
    
    execSync(command, { stdio: 'inherit', cwd: rootDir });

    console.log('--- Proceso de empaquetado completado exitosamente ---');
    console.log(`Archivo generado en: ${zipPath}`);

  } catch (error) {
    console.error('Error durante el empaquetado:', error);
    process.exit(1);
  }
}

main();
