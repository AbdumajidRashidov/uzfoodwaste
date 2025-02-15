import {
  apiLimiter,
  fileUploadLimiter,
  multipleFileUploadLimiter,
} from "./../middlewares/rate-limit.middleware";
// src/routes/file.routes.ts
import { Router } from "express";
import { fileController } from "../controllers/file.controller";
import { fileService } from "../services/file.service";
import { protect } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { body, query } from "express-validator";

const router = Router();

// All routes require authentication
router.use(protect);
router.use(apiLimiter);

/**
 * @route POST /api/files/upload
 * @desc Upload a single file
 * @access Private
 */
router.post(
  "/upload",
  fileUploadLimiter,
  fileService.upload.single("file"),
  [
    body("folder")
      .optional()
      .isString()
      .matches(/^[a-zA-Z0-9-_]+$/)
      .withMessage(
        "Folder name can only contain letters, numbers, hyphens, and underscores"
      )
      .isLength({ max: 50 })
      .withMessage("Folder name cannot exceed 50 characters"),
  ],
  validate,
  fileController.uploadFile
);

/**
 * @route POST /api/files/upload-multiple
 * @desc Upload multiple files (max 10)
 * @access Private
 */
router.post(
  "/upload-multiple",
  multipleFileUploadLimiter,
  fileService.upload.array("files", 10), // Maximum 10 files
  [
    body("folder")
      .optional()
      .isString()
      .matches(/^[a-zA-Z0-9-_]+$/)
      .withMessage(
        "Folder name can only contain letters, numbers, hyphens, and underscores"
      )
      .isLength({ max: 50 })
      .withMessage("Folder name cannot exceed 50 characters"),
  ],
  validate,
  fileController.uploadMultipleFiles
);

/**
 * @route DELETE /api/files
 * @desc Delete a file by URL
 * @access Private
 */
router.delete(
  "/",
  [
    body("fileUrl")
      .isString()
      .notEmpty()
      .withMessage("File URL is required")
      .custom((value) => {
        if (!fileService.isValidFileUrl(value)) {
          throw new Error("Invalid file URL");
        }
        return true;
      }),
  ],
  validate,
  fileController.deleteFile
);

/**
 * @route GET /api/files/info
 * @desc Get file metadata
 * @access Private
 */
router.get(
  "/info",
  [
    query("fileUrl")
      .isString()
      .notEmpty()
      .withMessage("File URL is required")
      .custom((value) => {
        if (!fileService.isValidFileUrl(value)) {
          throw new Error("Invalid file URL");
        }
        return true;
      }),
  ],
  validate,
  fileController.getFileInfo
);

export default router;
