import express from "express";
import morgan from "morgan";
import cors from "cors";

import employeesRoutes from "./routes/employees.routes.js";
import indexRoutes from "./routes/index.routes.js";
import sunatTrabajadoresRoutes from "./routes/sunat.trabajadores.routes.js";

import secureRoutes from "./routes/secure.routes.js";

const app = express();

// Configuración de CORS
app.use(
  cors({
    origin: "*",
  })
);

// Middlewares
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/", indexRoutes);
app.use("/api", employeesRoutes);
app.use("/api/sunat", sunatTrabajadoresRoutes);
app.use("/secure", secureRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: "Not found" });
});

export default app;
