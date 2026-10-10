import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Igual que el backend: respetar variables existentes y no cargar archivos en producción.
if (process.env.NODE_ENV !== "production") {
  config({ path: `.env.${process.env.NODE_ENV || "development"}` });
}

export default defineConfig({
  schema: "prisma/ft_factoring/schema.prisma",
  datasource: {
    // La generación no necesita una conexión ni credenciales de base de datos.
    url: process.env.PRISMA_DATABASE_FACTORING_URL,
  },
});
