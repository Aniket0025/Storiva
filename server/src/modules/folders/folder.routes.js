import { Router } from "express";
import * as folderController from "./folder.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.post("/", folderController.createFolder);
router.patch("/:id", folderController.renameFolder);
router.delete("/:id", folderController.deleteFolder);

export default router;
