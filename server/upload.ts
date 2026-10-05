import fs from "fs";
import path from "path";
import express from "express";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

// Ensure public/uploads exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export function handleFileUpload(req: express.Request, res: express.Response) {
  try {
    const { filename, base64Data, mimeType } = req.body;

    if (!base64Data || !mimeType) {
      return res.status(400).json({
        success: false,
        message: "Missing base64Data or mimeType in request body.",
      });
    }

    if (!ALLOWED_MIME_TYPES.has(mimeType.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `File type '${mimeType}' is not permitted. Allowed types: JPG, PNG, WEBP, GIF, SVG, PDF.`,
      });
    }

    // Strip header prefix if present (e.g. data:image/png;base64,...)
    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, "");
    const fileBuffer = Buffer.from(cleanBase64, "base64");

    if (fileBuffer.length > MAX_FILE_SIZE_BYTES) {
      return res.status(400).json({
        success: false,
        message: `File exceeds maximum allowed size of 10MB (actual: ${(fileBuffer.length / (1024 * 1024)).toFixed(2)} MB).`,
      });
    }

    // Sanitize base name
    const rawName = (filename || "uploaded-file").replace(/[^a-zA-Z0-9._-]/g, "_");
    const ext = path.extname(rawName) || (mimeType === "application/pdf" ? ".pdf" : ".png");
    const baseWithoutExt = path.basename(rawName, ext);
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${baseWithoutExt}${ext}`;

    const targetPath = path.join(UPLOADS_DIR, uniqueName);
    fs.writeFileSync(targetPath, fileBuffer);

    const publicUrl = `/uploads/${uniqueName}`;

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      url: publicUrl,
      filename: uniqueName,
      size: fileBuffer.length,
      mimeType,
    });
  } catch (err: any) {
    console.error("Error processing file upload:", err);
    return res.status(500).json({
      success: false,
      message: "Server failed to process uploaded file",
      error: err?.message,
    });
  }
}

export function handleFileDelete(req: express.Request, res: express.Response) {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ success: false, message: "Missing file url to delete" });
    }

    if (!url.startsWith("/uploads/")) {
      return res.status(400).json({ success: false, message: "Invalid uploads path" });
    }

    const filename = path.basename(url);
    const targetPath = path.join(UPLOADS_DIR, filename);

    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
      return res.json({ success: true, message: `File ${filename} deleted successfully.` });
    } else {
      return res.json({ success: true, message: "File already removed or not found." });
    }
  } catch (err: any) {
    console.error("Error deleting file:", err);
    return res.status(500).json({ success: false, message: "Failed to delete file", error: err?.message });
  }
}
