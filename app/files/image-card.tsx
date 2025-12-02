"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import { deleteFile, getFileUrl } from "@/actions/files";
import type { FileItem } from "@/actions/files";

interface ImageCardProps {
  file: FileItem;
}

export default function ImageCard({ file }: ImageCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showFullImage, setShowFullImage] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get presigned URL on mount
    const fetchUrl = async () => {
      try {
        const url = await getFileUrl(file.name);
        if (url) {
          setImageUrl(url);
        } else {
          setImageError(true);
        }
      } catch (error) {
        console.error("Error fetching image URL:", error);
        setImageError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUrl();
  }, [file.name]);

  const handleDownload = async () => {
    try {
      const url = await getFileUrl(file.name, 3600, true); // Pass true for download
      if (url) {
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        link.click();
      } else {
        alert("❌ Failed to generate download link");
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("❌ Download failed");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`🗑️ Are you sure you want to delete ${file.name}?`)) return;

    startTransition(async () => {
      const result = await deleteFile(file.name);

      if (result.success) {
        alert("✅ Image deleted successfully!");
      } else {
        alert("❌ Delete failed: " + result.error);
      }
    });
  };

  return (
    <>
      <div className="border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 bg-white hover:scale-105">
        {/* Image Preview */}
        {/* Image Preview */}
        <div
          className="relative w-full h-56 bg-gray-100 cursor-pointer group"
          onClick={() => !isLoading && !imageError && setShowFullImage(true)}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin text-4xl">⏳</div>
                <p className="mt-2 text-gray-500">Loading...</p>
              </div>
            </div>
          ) : !imageError && imageUrl ? (
            <>
              <Image
                src={imageUrl}
                alt={file.name}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={false}
              />
              {/* Hover overlay - only shows on hover */}
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                <span className="text-white text-lg font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  🔍 Click to view full size
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <span className="text-4xl">🖼️</span>
                <p className="mt-2">Failed to load image</p>
              </div>
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="p-4">
          <p className="font-semibold text-gray-900 truncate" title={file.name}>
            {file.name}
          </p>
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm text-gray-600">
              📦 {(file.size / 1024).toFixed(2)} KB
            </p>
            <p className="text-xs text-gray-500">
              🕒 {new Date(file.lastModified).toLocaleDateString()}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleDownload}
              disabled={isPending}
              className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors shadow-md hover:shadow-lg"
            >
              ⬇️ Download
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors shadow-md hover:shadow-lg"
            >
              {isPending ? "⏳ Deleting..." : "🗑️ Delete"}
            </button>
          </div>
        </div>
      </div>

      {/* Full Image Modal */}
      {showFullImage && imageUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowFullImage(false)}
        >
          <div className="relative max-w-7xl max-h-full">
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute -top-12 right-0 text-white bg-red-600 hover:bg-red-700 rounded-full p-3 transition-colors shadow-lg"
              title="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <Image
              src={imageUrl}
              alt={file.name}
              width={1200}
              height={800}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="text-white text-center mt-4 font-medium">
              {file.name}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
