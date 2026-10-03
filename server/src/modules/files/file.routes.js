import { Router } from "express";
import multer from "multer";
import * as fileController from "./file.controller.js";
import { authenticate } from "../../middleware/auth.middleware.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB request file limit
});

const router = Router();

// All file operations require authentication
router.use(authenticate);

router.get("/", fileController.listFiles);
router.post("/upload", upload.single("file"), fileController.uploadFile);
router.get("/:id", fileController.getFile);
router.patch("/:id", fileController.renameFile);
router.delete("/:id", fileController.deleteFile);

export default router;
