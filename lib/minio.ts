import * as Minio from "minio";

export const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT!,
  port: parseInt(process.env.MINIO_PORT || "443"),
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ACCESS_KEY!,
  secretKey: process.env.MINIO_SECRET_KEY!,
});

export const bucketName = process.env.MINIO_BUCKET_NAME!;

// Ensure bucket exists
export async function ensureBucket() {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
      await minioClient.makeBucket(bucketName, "us-east-1");
      console.log(`✅ Bucket ${bucketName} created successfully`);
    } else {
      console.log(`✅ Bucket ${bucketName} already exists`);
    }
  } catch (err) {
    console.error("❌ Error ensuring bucket exists:", err);
  }
}
