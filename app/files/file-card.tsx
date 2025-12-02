"use client";

import { useTransition } from "react";
import { deleteFile, getFileUrl } from "@/actions/files";
import type { FileItem } from "@/actions/files";

interface FileCardProps {
  file: FileItem;
}

export default function FileCard({ file }: FileCardProps) {
  const [isPending, startTransition] = useTransition();

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
        alert("✅ File deleted successfully!");
      } else {
        alert("❌ Delete failed: " + result.error);
      }
    });
  };

  // Get file icon based on extension
  const getFileIcon = () => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return "📄";
      case "doc":
      case "docx":
        return "📝";
      case "xls":
      case "xlsx":
        return "📊";
      case "ppt":
      case "pptx":
        return "📽️";
      case "zip":
      case "rar":
      case "7z":
        return "🗜️";
      case "mp4":
      case "avi":
      case "mov":
      case "mkv":
        return "🎥";
      case "mp3":
      case "wav":
      case "flac":
        return "🎵";
      case "txt":
        return "📃";
      case "json":
      case "xml":
        return "📋";
      case "html":
      case "css":
      case "js":
      case "ts":
        return "💻";
      default:
        return "📎";
    }
  };

  return (
    <div className="p-4 border-2 border-gray-200 rounded-xl flex justify-between items-center hover:shadow-lg transition-all duration-300 bg-white hover:border-blue-300">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="text-5xl shrink-0">{getFileIcon()}</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate" title={file.name}>
            {file.name}
          </p>
          <div className="flex gap-4 mt-1">
            <p className="text-sm text-gray-600">
              📦 {(file.size / 1024).toFixed(2)} KB
            </p>
            <p className="text-sm text-gray-500">
              🕒 {new Date(file.lastModified).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={handleDownload}
          disabled={isPending}
          className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors shadow-md hover:shadow-lg"
        >
          ⬇️ Download
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors shadow-md hover:shadow-lg"
        >
          {isPending ? "⏳ Deleting..." : "🗑️ Delete"}
        </button>
      </div>
    </div>
  );
}
