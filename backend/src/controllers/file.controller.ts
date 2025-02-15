// src/controllers/file.controller.ts
import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { fileService } from "../services/file.service";
import { AppError } from "../middlewares/error.middleware";

export class FileController {
  // Upload single file
  async uploadFile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError("No file uploaded", 400);
      }

      // Get folder from request body or default to user's role
      const folder =
        req.body.folder || req.user?.role?.toLowerCase() || "general";

      const fileUrl = await fileService.uploadToCloud(req.file, folder);

      res.status(200).json({
        status: "success",
        data: {
          url: fileUrl,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
        },
      });
    } catch (error) {
      // Clean up file if upload fails
      next(error);
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw new AppError("No files uploaded", 400);
      }

      if (req.files.length > 10) {
        throw new AppError("Maximum 10 files can be uploaded at once", 400);
      }

      const folder =
        req.body.folder || req.user?.role?.toLowerCase() || "general";

      // Upload all files and collect responses
      const uploadPromises = (req.files as Express.Multer.File[]).map(
        async (file) => {
          try {
            const fileUrl = await fileService.uploadToCloud(file, folder);
            return {
              success: true,
              url: fileUrl,
              originalName: file.originalname,
              size: file.size,
              mimetype: file.mimetype,
            };
          } catch (error) {
            return {
              success: false,
              originalName: file.originalname,
              error: error instanceof Error ? error.message : "Upload failed",
            };
          }
        }
      );

      const results = await Promise.all(uploadPromises);

      // Check if any uploads failed
      const failedUploads = results.filter((result) => !result.success);
      if (failedUploads.length > 0) {
        res.status(207).json({
          status: "partial",
          message: "Some files failed to upload",
          data: results,
        });
      } else {
        res.status(200).json({
          status: "success",
          data: results,
        });
      }
    } catch (error) {
      next(error);
    }
  }

  // Delete file
  async deleteFile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { fileUrl } = req.body;

      if (!fileUrl || !fileService.isValidFileUrl(fileUrl)) {
        throw new AppError("Invalid file URL", 400);
      }

      // Get file metadata to verify ownership (optional)
      const metadata = await fileService.getFileMetadata(fileUrl);

      // You might want to add additional checks here based on your requirements
      // For example, verify that the file belongs to the user

      await fileService.deleteFromCloud(fileUrl);

      res.status(200).json({
        status: "success",
        message: "File deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  // Get file metadata
  async getFileInfo(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { fileUrl } = req.query;

      if (
        !fileUrl ||
        typeof fileUrl !== "string" ||
        !fileService.isValidFileUrl(fileUrl)
      ) {
        throw new AppError("Invalid file URL", 400);
      }

      const metadata = await fileService.getFileMetadata(fileUrl);

      res.status(200).json({
        status: "success",
        data: metadata,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const fileController = new FileController();
