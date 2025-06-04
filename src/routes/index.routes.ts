import { Router } from "express";
import { index, ping } from "#root/src/controllers/indexController.js";

const router = Router();

router.get("/", index);

router.get("/ping", ping);

export default router;
