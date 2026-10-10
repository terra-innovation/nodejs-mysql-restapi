import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const createSchemaBackup = (filePath, stage) => {
  const backupDir = path.join(path.dirname(filePath), "backup");
  fs.mkdirSync(backupDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/[.]/g, "_");
  const backupFile = path.join(backupDir, `schema.${timestamp}.${stage}.${randomUUID()}.prisma.bak`);
  fs.copyFileSync(filePath, backupFile, fs.constants.COPYFILE_EXCL);
  console.log(`✅ Copia de seguridad creada: ${backupFile}`);
  return backupFile;
};
