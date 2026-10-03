import { fileService } from "./file.service.js";

/**
 * Handle List Files and Folders HTTP Request
 */
export const listFiles = async (req, res, next) => {
  try {
    const parentId = req.query.parentId || "root";
    const items = await fileService.listItems(req.user.id, parentId);

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Single File Retrieval
 */
export const getFile = async (req, res, next) => {
  try {
    const file = await fileService.getFileById(req.user.id, req.params.id);

    res.status(200).json({
      success: true,
      data: { file },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle File Upload Request
 */
export const uploadFile = async (req, res, next) => {
  try {
    const file = req.file; // Provided by multer middleware

    const name = file ? file.originalname : req.body.name || "Untitled File";
    const size = file ? file.size : parseInt(req.body.size || "0", 10);
    const mimeType = file ? file.mimetype : req.body.mimeType || "application/octet-stream";
    const parentId = req.body.parentId || "root";

    const uploadedFile = await fileService.uploadFile(req.user.id, {
      name,
      size,
      mimeType,
      parentId,
    });

    res.status(201).json({
      success: true,
      data: { file: uploadedFile },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle File Rename
 */
export const renameFile = async (req, res, next) => {
  try {
    const file = await fileService.renameFile(req.user.id, req.params.id, req.body.name);

    res.status(200).json({
      success: true,
      data: { file },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle File Deletion
 */
export const deleteFile = async (req, res, next) => {
  try {
    await fileService.deleteFile(req.user.id, req.params.id);

    res.status(200).json({
      success: true,
      data: { message: "File deleted successfully" },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle Search Query
 */
export const search = async (req, res, next) => {
  try {
    const query = req.query.q || "";
    const results = await fileService.searchItems(req.user.id, query);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};
