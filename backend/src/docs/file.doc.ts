// src/docs/file.doc.ts

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: File upload and management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     FileResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *               description: Signed URL for the uploaded file
 *               example: https://storage.googleapis.com/bucket-name/folder/file-uuid.jpg?X-Goog-Algorithm=...
 *             originalName:
 *               type: string
 *               description: Original file name
 *               example: profile.jpg
 *             size:
 *               type: number
 *               description: File size in bytes
 *               example: 1048576
 *             mimetype:
 *               type: string
 *               description: File MIME type
 *               example: image/jpeg
 *
 *     MultipleFileResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 description: Whether the file upload was successful
 *                 example: true
 *               url:
 *                 type: string
 *                 description: Signed URL for the uploaded file
 *                 example: https://storage.googleapis.com/bucket-name/folder/file-uuid.jpg?X-Goog-Algorithm=...
 *               originalName:
 *                 type: string
 *                 description: Original file name
 *                 example: image1.jpg
 *               size:
 *                 type: number
 *                 description: File size in bytes
 *                 example: 1048576
 *               mimetype:
 *                 type: string
 *                 description: File MIME type
 *                 example: image/jpeg
 *               error:
 *                 type: string
 *                 description: Error message if upload failed
 *                 example: File size too large
 *
 *     FileMetadata:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: success
 *         data:
 *           type: object
 *           properties:
 *             contentType:
 *               type: string
 *               example: image/jpeg
 *             size:
 *               type: string
 *               example: 1048576
 *             timeCreated:
 *               type: string
 *               format: date-time
 *             updated:
 *               type: string
 *               format: date-time
 *             md5Hash:
 *               type: string
 *               example: d41d8cd98f00b204e9800998ecf8427e
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: error
 *         message:
 *           type: string
 *           example: File size too large. Maximum size is 10MB
 */

/**
 * @swagger
 * /api/files/upload:
 *   post:
 *     summary: Upload a single file
 *     description: |
 *       Upload a single file to cloud storage. Files are stored in folders based on type or user role.
 *       Supports images (JPG, PNG, GIF, WEBP), PDFs, and documents (DOC, DOCX).
 *       Maximum file size is 10MB.
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *               folder:
 *                 type: string
 *                 description: Optional folder name (alphanumeric, hyphens, underscores)
 *                 example: profile-pictures
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileResponse'
 *       400:
 *         description: Invalid request (file too large, wrong type, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Server error during upload
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/files/upload-multiple:
 *   post:
 *     summary: Upload multiple files
 *     description: |
 *       Upload multiple files (up to 10) to cloud storage. Files are stored in folders based on type or user role.
 *       Supports images (JPG, PNG, GIF, WEBP), PDFs, and documents (DOC, DOCX).
 *       Maximum file size is 10MB per file.
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - files
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Files to upload (maximum 10)
 *               folder:
 *                 type: string
 *                 description: Optional folder name (alphanumeric, hyphens, underscores)
 *                 example: gallery
 *     responses:
 *       200:
 *         description: All files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MultipleFileResponse'
 *       207:
 *         description: Partial success (some files failed to upload)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MultipleFileResponse'
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Server error during upload
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/files:
 *   delete:
 *     summary: Delete a file
 *     description: Delete a file from cloud storage using its URL
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileUrl
 *             properties:
 *               fileUrl:
 *                 type: string
 *                 description: Complete URL of the file to delete
 *                 example: https://storage.googleapis.com/bucket-name/folder/file-uuid.jpg
 *     responses:
 *       200:
 *         description: File deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: File deleted successfully
 *       400:
 *         description: Invalid file URL
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: File not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error during deletion
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/files/info:
 *   get:
 *     summary: Get file metadata
 *     description: Retrieve metadata for a file using its URL
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fileUrl
 *         required: true
 *         schema:
 *           type: string
 *         description: Complete URL of the file
 *         example: https://storage.googleapis.com/bucket-name/folder/file-uuid.jpg
 *     responses:
 *       200:
 *         description: File metadata retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileMetadata'
 *       400:
 *         description: Invalid file URL
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: File not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error retrieving metadata
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * components:
 *   responses:
 *     UnauthorizedError:
 *       description: Authentication token is missing or invalid
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: error
 *               message:
 *                 type: string
 *                 example: Not authorized to access this route
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
