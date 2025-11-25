import { Router } from "express";
import { catchedAsync } from "#src/utils/catchedAsync.js";
import * as secureController from "#src/controllers/secure/secure.prisma.Controller.js";
import { rateLimiterLoginMiddleware } from "#src/middlewares/ratelimiterMiddleware";

const router = Router();

// Register
router.post("/secure/register", rateLimiterLoginMiddleware, catchedAsync(secureController.registerUsuario));

// Login
router.post("/secure/login", rateLimiterLoginMiddleware, catchedAsync(secureController.loginUser));

// Verify Email
router.post("/secure/verifyemail", rateLimiterLoginMiddleware, catchedAsync(secureController.validateEmail));

// Send OTP Email
router.post("/secure/sendotp", rateLimiterLoginMiddleware, catchedAsync(secureController.sendVerificactionCode));

// Password - Send Token
router.post("/secure/password/sendtoken", rateLimiterLoginMiddleware, catchedAsync(secureController.sendTokenPassword));

// Password - Validate Restore
router.post("/secure/password/verifyrestore", rateLimiterLoginMiddleware, catchedAsync(secureController.validateRestorePassword));

// Password - Reset
router.post("/secure/password/reset", rateLimiterLoginMiddleware, catchedAsync(secureController.resetPassword));

export default router;
