import * as sunatController from "#root/src/controllers/financiero/sunat/sunattipocambio.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

// ==========================================
// CRUD Tipo de Cambio SUNAT (Estilo Admin)
// ==========================================
router.get("/financiero/sunat/tipo-cambio/listar", isAuth, isRole([6]), catchedAsync(sunatController.getSunatTipoCambios));
router.get("/financiero/sunat/tipo-cambio/paginado", isAuth, isRole([6]), catchedAsync(sunatController.getSunatTipoCambiosPaginado));
router.post("/financiero/sunat/tipo-cambio/paginado", isAuth, isRole([6]), catchedAsync(sunatController.getSunatTipoCambiosPaginado));
router.post("/financiero/sunat/tipo-cambio/crear", isAuth, isRole([6]), catchedAsync(sunatController.createSunatTipoCambio));
router.patch("/financiero/sunat/tipo-cambio/actualizar/:id", isAuth, isRole([6]), catchedAsync(sunatController.updateSunatTipoCambio));
router.get("/financiero/sunat/tipo-cambio/master", isAuth, isRole([6]), catchedAsync(sunatController.getSunatTipoCambioMaster));
router.delete("/financiero/sunat/tipo-cambio/eliminar/:id", isAuth, isRole([6]), catchedAsync(sunatController.deleteSunatTipoCambio));
router.patch("/financiero/sunat/tipo-cambio/activar/:id", isAuth, isRole([6]), catchedAsync(sunatController.activateSunatTipoCambio));

// ==========================================
// Consultas Operativas y Sincronización Decolecta
// ==========================================
// Obtener tipo de cambio SUNAT del día de hoy (Estrategia Fallback en cascada / Failover jerárquico)
router.get("/financiero/sunat/tipo-cambio/hoy", isAuth, isRole([6]), catchedAsync(sunatController.getSunatTipoCambioHoy));

// Obtener tipo de cambio SUNAT por fecha específica (YYYY-MM-DD)
router.get("/financiero/sunat/tipo-cambio/fecha/:fecha", isAuth, isRole([6]), catchedAsync(sunatController.getSunatTipoCambioPorFecha));

// Obtener historial de tipos de cambio SUNAT por rango de fechas
router.get("/financiero/sunat/tipo-cambio/historial", isAuth, isRole([6]), catchedAsync(sunatController.getSunatTipoCambioHistorial));

// Forzar sincronización manual con Decolecta API (fecha individual o por mes si se envía mes y año)
router.post("/financiero/sunat/tipo-cambio/sincronizar", isAuth, isRole([6]), catchedAsync(sunatController.sincronizarSunatTipoCambio));

// Sincronizar un mes completo de SUNAT con Decolecta API
router.post("/financiero/sunat/tipo-cambio/sincronizar-mes", isAuth, isRole([6]), catchedAsync(sunatController.sincronizarSunatMesTipoCambio));

export default router;
