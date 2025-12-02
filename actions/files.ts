/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { minioClient, bucketName } from "@/lib/minio";
import { revalidatePath } from "next/cache";

export interface FileItem {
  name: string;
  size: number;
  lastModified: string;
  etag: string;
  contentType?: string;
  isImage?: boolean;
}

// Helper to check if file is an image
function isImageFile(fileName: string): boolean {
  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".svg",
    ".bmp",
    ".ico",
  ];
  return imageExtensions.some((ext) => fileName.toLowerCase().endsWith(ext));
}

// Helper to get content type from file extension
function getContentTypeFromFileName(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  const mimeTypes: Record<string, string> = {
    // Images
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    bmp: "image/bmp",
    ico: "image/x-icon",
    // Documents
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    txt: "text/plain",
    csv: "text/csv",
    // Archives
    zip: "application/zip",
    rar: "application/x-rar-compressed",
    "7z": "application/x-7z-compressed",
    tar: "application/x-tar",
    gz: "application/gzip",
    // Audio
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    m4a: "audio/mp4",
    // Video
    mp4: "video/mp4",
    avi: "video/x-msvideo",
    mov: "video/quicktime",
    wmv: "video/x-ms-wmv",
    mkv: "video/x-matroska",
    webm: "video/webm",
    // Code
    js: "text/javascript",
    json: "application/json",
    html: "text/html",
    css: "text/css",
    xml: "application/xml",
  };
  return mimeTypes[ext] || "application/octet-stream";
}

export async function uploadFile(formData: FormData) {
  try {
    const file = formData.get("file") as File;

    if (!file) {
      return { success: false, error: "No file provided" };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${Date.now()}-${file.name}`;

    await minioClient.putObject(bucketName, fileName, buffer, buffer.length, {
      "Content-Type": file.type || getContentTypeFromFileName(fileName),
    });

    revalidatePath("/files");

    return {
      success: true,
      fileName,
      message: "File uploaded successfully",
    };
  } catch (error: any) {
    console.error("Upload error:", error);
    return { success: false, error: error.message };
  }
}

export async function listFiles(): Promise<FileItem[]> {
  try {
    const objectsStream = minioClient.listObjects(bucketName, "", true);
    const objects: FileItem[] = [];

    for await (const obj of objectsStream) {
      const fileName = obj.name!;

      // Determine content type from file extension as fallback
      const contentType = getContentTypeFromFileName(fileName);

      objects.push({
        name: fileName,
        size: obj.size!,
        lastModified: obj.lastModified!.toISOString(),
        etag: obj.etag!,
        contentType: contentType,
        isImage: isImageFile(fileName),
      });
    }

    // Sort: images first, then by date (newest first)
    return objects.sort((a, b) => {
      if (a.isImage && !b.isImage) return -1;
      if (!a.isImage && b.isImage) return 1;
      return (
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      );
    });
  } catch (error: any) {
    console.error("List files error:", error);
    return [];
  }
}

export async function deleteFile(fileName: string) {
  try {
    await minioClient.removeObject(bucketName, fileName);

    revalidatePath("/files");

    return {
      success: true,
      message: "File deleted successfully",
    };
  } catch (error: any) {
    console.error("Delete error:", error);
    return { success: false, error: error.message };
  }
}

export async function getFileUrl(
  fileName: string,
  expirySeconds: number = 60 * 60,
  forceDownload: boolean = false
): Promise<string | null> {
  try {
    // For public buckets, return direct URL (no presigning needed)
    const endpoint = process.env.MINIO_ENDPOINT!;
    const port = process.env.MINIO_PORT || "443";
    const useSSL = process.env.MINIO_USE_SSL === "true";
    const protocol = useSSL ? "https" : "http";
    const portSuffix =
      (useSSL && port === "443") || (!useSSL && port === "80")
        ? ""
        : `:${port}`;

    // Return public URL directly for viewing
    if (!forceDownload) {
      return `${protocol}://${endpoint}${portSuffix}/${bucketName}/${fileName}`;
    }

    // Use presigned URL only for downloads with custom headers
    const url = await minioClient.presignedGetObject(
      bucketName,
      fileName,
      expirySeconds,
      {
        "response-content-disposition": `attachment; filename="${encodeURIComponent(
          fileName
        )}"`,
      }
    );
    return url;
  } catch (error: any) {
    console.error("Get file URL error:", error);
    return null;
  }
}

export async function getFileStream(fileName: string) {
  try {
    const dataStream = await minioClient.getObject(bucketName, fileName);
    const chunks: Buffer[] = [];

    for await (const chunk of dataStream) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  } catch (error: any) {
    console.error("Get file stream error:", error);
    return null;
  }
}
export async function getPresignedUploadUrl(
  fileName: string,
  contentType: string
) {
  try {
    const uniqueFileName = `${Date.now()}-${fileName}`;
    const url = await minioClient.presignedPutObject(
      bucketName,
      uniqueFileName,
      60 * 5 // 5 minutes expiry
    );

    return { success: true, url, fileName: uniqueFileName };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
