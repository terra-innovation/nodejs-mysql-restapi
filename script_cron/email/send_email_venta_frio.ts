// scripts/test-send-codigo-verificacion.ts

import dotenv from "dotenv";
dotenv.config(); // Carga tu archivo .env
import { DateTime } from "luxon";

import * as df from "#src/utils/dateUtils.js";
import * as nf from "#src/utils/numberUtils.js";
import * as jsonUtils from "#src/utils/jsonUtils.js";

import * as emailService from "#src/services/email.Service.js";

import fs from "fs";

interface VentaFrioRecord {
  ruc: string;
  razon_social: string;
  correo: string;
  estado1: string;
  fecha1: string; // ISO o yyyy-mm-dd
  resultado1: string;
  estado2?: string | null;
  fecha2?: string;
  resultado2?: string;
}

export const sendEmailingVentaEnFrio = async (filePath: string, startTime: number) => {
  // 1. Leer archivo
  const raw = fs.readFileSync(filePath, "utf-8");
  const data: VentaFrioRecord[] = JSON.parse(raw);

  console.log(`📊 Registros totales  : ${data.length}`);

  // 2. Filtrar
  const pendientes = data.filter((r) => r.resultado1 === "Recibido" && (r.estado2 === "" || r.estado2 === null)).sort((a, b) => new Date(a.fecha1 || "9999-12-31").getTime() - new Date(b.fecha1 || "9999-12-31").getTime());

  console.log(`📌 Pendientes        : ${pendientes.length}`);

  if (pendientes.length === 0) {
    console.log("📭 No hay registros para procesar");
    return;
  }

  // 3. Seleccionar registro
  const r = pendientes[0];

  console.log("📨 Registro seleccionado");
  console.log(`   • RUC             : ${r.ruc}`);
  console.log(`   • Empresa         : ${r.razon_social}`);
  console.log(`   • Correo          : ${r.correo}`);
  console.log(`   • Fecha envío 1   : ${r.fecha1}`);

  const now = DateTime.now().setZone("America/Lima").toISO();
  const started = Date.now();

  try {
    console.log("🚧 Enviando correo...");
    await emailService.sendEmailingVentaEnFrio(r.correo, {});

    r.estado2 = "Enviado";
    r.resultado2 = "OK";
    r.fecha2 = now;

    console.log("✅ Resultado         : OK");
  } catch (error) {
    r.estado2 = "Enviado";
    r.resultado2 = "ERROR";
    r.fecha2 = now;

    console.error("❌ Resultado         : ERROR");
    console.error(error);
  }

  // 4. Guardar
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  console.log("💾 Registro guardado");

  console.log(`⏱️ Duración         : ${Date.now() - started} ms`);
};
