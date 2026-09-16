import * as sbsController from "#root/src/controllers/financiero/sbs/sbstipocambio.Controller.js";
import { isAuth, isRole } from "#root/src/middlewares/authMiddleware.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

// ==========================================
// CRUD Tipo de Cambio SBS (Estilo Admin)
// ==========================================
router.get("/financiero/sbs/tipo-cambio/listar", isAuth, isRole([6]), catchedAsync(sbsController.getSbsTipoCambios));
router.get("/financiero/sbs/tipo-cambio/paginado", isAuth, isRole([6]), catchedAsync(sbsController.getSbsTipoCambiosPaginado));
router.post("/financiero/sbs/tipo-cambio/paginado", isAuth, isRole([6]), catchedAsync(sbsController.getSbsTipoCambiosPaginado));
router.post("/financiero/sbs/tipo-cambio/crear", isAuth, isRole([6]), catchedAsync(sbsController.createSbsTipoCambio));
router.patch("/financiero/sbs/tipo-cambio/actualizar/:id", isAuth, isRole([6]), catchedAsync(sbsController.updateSbsTipoCambio));
router.get("/financiero/sbs/tipo-cambio/master", isAuth, isRole([6]), catchedAsync(sbsController.getSbsTipoCambioMaster));
router.delete("/financiero/sbs/tipo-cambio/eliminar/:id", isAuth, isRole([6]), catchedAsync(sbsController.deleteSbsTipoCambio));
router.patch("/financiero/sbs/tipo-cambio/activar/:id", isAuth, isRole([6]), catchedAsync(sbsController.activateSbsTipoCambio));

// ==========================================
// Consultas Operativas y Sincronización Decolecta
// ==========================================
// Obtener tipo de cambio SBS del día de hoy (Estrategia Fallback en cascada / Failover jerárquico)
router.get("/financiero/sbs/tipo-cambio/hoy", isAuth, isRole([6]), catchedAsync(sbsController.getSbsTipoCambioHoy));

// Obtener tipo de cambio SBS por fecha específica (YYYY-MM-DD)
router.get("/financiero/sbs/tipo-cambio/fecha/:fecha", isAuth, isRole([6]), catchedAsync(sbsController.getSbsTipoCambioPorFecha));

// Obtener historial de tipos de cambio SBS por rango de fechas
router.get("/financiero/sbs/tipo-cambio/historial", isAuth, isRole([6]), catchedAsync(sbsController.getSbsTipoCambioHistorial));

// Forzar sincronización manual con Decolecta API (fecha individual o por mes si se envía mes y año)
router.post("/financiero/sbs/tipo-cambio/sincronizar", isAuth, isRole([6]), catchedAsync(sbsController.sincronizarSbsTipoCambio));

// Sincronizar un mes completo de SBS con Decolecta API
router.post("/financiero/sbs/tipo-cambio/sincronizar-mes", isAuth, isRole([6]), catchedAsync(sbsController.sincronizarSbsMesTipoCambio));

export default router;
