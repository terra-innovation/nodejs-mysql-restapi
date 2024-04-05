import { Router } from "express";
import { catchedAsync } from "../utils/catchedAsync.js";
import * as secureController from "../controllers/secureController.js";

const router = Router();

// Register
router.post("/register", secureController.registerUser);

// Login
router.post("/login", catchedAsync(secureController.loginUser));

// Verify Email
router.post("/verifyemail", secureController.validateEmail);

export default router;
