// src/services/file.service.ts
import multer from "multer";
import { Request } from "express";
import { Storage } from "@google-cloud/storage";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { AppError } from "../middlewares/error.middleware";
import { config } from "../config/environment";

export class FileService {
  private storage: Storage;
  private bucket: string;

  constructor() {
    this.storage = new Storage({
      projectId: config.gcp.projectId,
      credentials: {
        client_email: config.gcp.clientEmail,
        private_key: config.gcp.privateKey.replace(/\\n/g, "\n"),
      },
    });
    this.bucket = config.gcp.bucketName || "";
  }

  // Configure multer for file uploads
  private multerStorage = multer.memoryStorage();

  private fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {
    // Validate file type
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      cb(
        new AppError(
          "Invalid file type. Allowed types: JPG, PNG, GIF, WEBP, PDF, DOC, DOCX",
          400
        )
      );
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      cb(new AppError("File size too large. Maximum size is 10MB", 400));
      return;
    }

    cb(null, true);
  };

  public upload = multer({
    storage: this.multerStorage,
    fileFilter: this.fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  });

  // Upload file to cloud storage and get signed URL
  public async uploadToCloud(
    file: Express.Multer.File,
    folder: string = "general"
  ): Promise<string> {
    try {
      const fileName = `${folder}/${uuidv4()}${path.extname(
        file.originalname
      )}`;
      const bucket = this.storage.bucket(this.bucket);
      const blob = bucket.file(fileName);

      // Create write stream for upload
      const blobStream = blob.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
        resumable: false,
      });

      // Handle upload stream
      return new Promise((resolve, reject) => {
        blobStream.on("error", (error) => {
          reject(
            new AppError(
              `Unable to upload image, something went wrong: ${error.message}`,
              500
            )
          );
        });

        blobStream.on("finish", async () => {
          try {
            // Generate signed URL with 7 days expiration
            const [signedUrl] = await blob.getSignedUrl({
              version: "v4",
              action: "read",
              expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
            });

            resolve(signedUrl);
          } catch (error) {
            reject(new AppError("Error generating signed URL", 500));
          }
        });

        blobStream.end(file.buffer);
      });
    } catch (error) {
      throw new AppError("Error uploading file to cloud storage", 500);
    }
  }

  // Delete file from cloud storage
  public async deleteFromCloud(fileUrl: string): Promise<void> {
    try {
      // Extract file path from signed URL
      const urlObj = new URL(fileUrl);
      const pathname = urlObj.pathname;
      const fileName = pathname.split("/").slice(2).join("/"); // Remove /storage.googleapis.com/bucket-name/

      const file = this.storage.bucket(this.bucket).file(fileName);

      const exists = await file.exists();
      if (!exists[0]) {
        throw new AppError("File not found", 404);
      }

      await file.delete();
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("Error deleting file from cloud storage", 500);
    }
  }

  // Helper function to validate file URL
  public isValidFileUrl(url: string): boolean {
    try {
      const fileUrl = new URL(url);
      return (
        fileUrl.hostname === "storage.googleapis.com" &&
        fileUrl.pathname.includes(this.bucket)
      );
    } catch {
      return false;
    }
  }

  // Helper function to get file metadata
  public async getFileMetadata(fileUrl: string) {
    try {
      const urlObj = new URL(fileUrl);
      const pathname = urlObj.pathname;
      const fileName = pathname.split("/").slice(2).join("/");

      const file = this.storage.bucket(this.bucket).file(fileName);
      const [metadata] = await file.getMetadata();

      return metadata;
    } catch (error) {
      throw new AppError("Error getting file metadata", 500);
    }
  }
}

export const fileService = new FileService();
