import { Router } from "express";
import { registerUser, loginUser, validateEmail } from "../controllers/secure.controller.js";

const router = Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Verify Email
router.post("/verifyemail", validateEmail);

export default router;
