/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState } from "react";
import { getPresignedUploadUrl } from "@/actions/files";

export default function FileUpload() {
  const [isPending, setIsPending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;

    if (!file) return;

    setIsPending(true);
    setUploadProgress(0);

    try {
      // Get presigned URL
      const result = await getPresignedUploadUrl(file.name, file.type);

      if (!result.success || !result.url) {
        throw new Error(result.error || "Failed to get upload URL");
      }

      // Upload directly to MinIO with progress tracking
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      await new Promise((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status === 200) resolve(xhr.response);
          else reject(new Error(`Upload failed: ${xhr.status}`));
        });
        xhr.addEventListener("error", () => reject(new Error("Upload failed")));

        xhr.open("PUT", result.url);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.send(file);
      });

      alert("✅ File uploaded successfully!");
      formRef.current?.reset();
      setUploadProgress(0);

      // Refresh the page to show new file
      window.location.reload();
    } catch (error: any) {
      alert("❌ Upload failed: " + error.message);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="mb-8 p-6 border-2 border-dashed border-gray-300 rounded-lg shadow-sm bg-white hover:border-blue-400 transition-colors"
    >
      <div className="flex flex-col gap-4">
        <div className="flex-1">
          <label className="block mb-2 font-medium text-gray-700 text-lg">
            📁 Upload File
          </label>
          <input
            type="file"
            name="file"
            required
            disabled={isPending}
            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {isPending && uploadProgress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
        >
          {isPending ? `⏳ Uploading... ${uploadProgress}%` : "⬆️ Upload File"}
        </button>
      </div>
    </form>
  );
}
