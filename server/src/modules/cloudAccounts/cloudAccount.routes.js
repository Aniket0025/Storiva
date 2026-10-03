import { Router } from "express";
import * as cloudAccountController from "./cloudAccount.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

// All cloud account operations require user authentication
router.use(authenticate);

router.get("/", cloudAccountController.getAccounts);
router.post("/google/connect", cloudAccountController.initiateGoogleConnect);
router.get("/google/callback", cloudAccountController.handleGoogleCallback);
router.delete("/:id", cloudAccountController.disconnectAccount);

export default router;
