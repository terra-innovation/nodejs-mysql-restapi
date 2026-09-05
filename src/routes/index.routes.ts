import { index, ping } from "#root/src/controllers/index.Controller.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import { Router } from "express";

const router = Router();

router.get("/", catchedAsync(index));

router.get("/ping", catchedAsync(ping));

export default router;
