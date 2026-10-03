import { Router } from "express";
import * as authController from "./auth.controller.js";
import { validateBody, registerSchema, loginSchema } from "../../validators/auth.validator.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

// Public Authentication Endpoints
router.post("/register", validateBody(registerSchema), authController.register);
router.post("/login", validateBody(loginSchema), authController.login);
router.post("/logout", authController.logout);

// Protected Authentication Endpoints
router.get("/me", authenticate, authController.getMe);

export default router;
