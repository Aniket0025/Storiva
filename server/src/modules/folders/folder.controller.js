import { folderService } from "./folder.service.js";

/**
 * Create a new folder
 */
export const createFolder = async (req, res, next) => {
  try {
    const folder = await folderService.createFolder(req.user.id, req.body);

    res.status(201).json({
      success: true,
      data: { folder },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Rename a folder
 */
export const renameFolder = async (req, res, next) => {
  try {
    const folder = await folderService.renameFolder(req.user.id, req.params.id, req.body.name);

    res.status(200).json({
      success: true,
      data: { folder },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a folder
 */
export const deleteFolder = async (req, res, next) => {
  try {
    await folderService.deleteFolder(req.user.id, req.params.id);

    res.status(200).json({
      success: true,
      data: { message: "Folder deleted successfully" },
    });
  } catch (error) {
    next(error);
  }
};
