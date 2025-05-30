import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as secureController from "#src/controllers/secure/secure.prisma.Controller.js";

const router = Router();

// Register
router.post("/secure/register", catchedAsync(secureController.registerUsuario));

// Login
router.post("/secure/login", catchedAsync(secureController.loginUser));

// Verify Email
router.post("/secure/verifyemail", catchedAsync(secureController.validateEmail));

// Send OTP Email
router.post("/secure/sendotp", catchedAsync(secureController.sendVerificactionCode));

// Password - Send Token
router.post("/secure/password/sendtoken", catchedAsync(secureController.sendTokenPassword));

// Password - Validate Restore
router.post("/secure/password/verifyrestore", catchedAsync(secureController.validateRestorePassword));

// Password - Reset
router.post("/secure/password/reset", catchedAsync(secureController.resetPassword));

export default router;
