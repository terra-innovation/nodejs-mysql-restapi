import express from "express";
import { line, log } from "#root/src/utils/logger.pino.js";

const app = express();
const PORT = process.env.PORT || 3000;

//log.info(line(), `Hola Mundo desde logger`);
log.info(line(), `Hola Mundo desde logger`);

app.get("/", (_req, res) => {
  res.send("¡Hola mundo desde TypeScript y Express!");
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
