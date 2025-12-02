import { Router } from "express";
import { index, ping } from "#root/src/controllers/index.prisma.Controller.js";
import { catchedAsync } from "#src/utils/catchedAsync.js";

const router = Router();

router.get("/", catchedAsync(index));

router.get("/ping", catchedAsync(ping));

export default router;
