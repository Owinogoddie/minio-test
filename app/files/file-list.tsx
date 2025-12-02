"use client";

import type { FileItem } from "@/actions/files";
import ImageCard from "./image-card";
import FileCard from "./file-card";

interface FileListProps {
  initialFiles: FileItem[];
}

export default function FileList({ initialFiles }: FileListProps) {
  const images = initialFiles.filter((file) => file.isImage);
  const otherFiles = initialFiles.filter((file) => !file.isImage);

  if (initialFiles.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        <div className="text-6xl mb-4">📭</div>
        <p className="text-2xl font-semibold text-gray-700">
          No files uploaded yet
        </p>
        <p className="text-lg mt-2">Upload your first file to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Images Section */}
      {images.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-2xl font-bold text-gray-800">🖼️ Images</h3>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              {images.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((file) => (
              <ImageCard key={file.name} file={file} />
            ))}
          </div>
        </div>
      )}

      {/* Other Files Section */}
      {otherFiles.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-2xl font-bold text-gray-800">📁 Other Files</h3>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
              {otherFiles.length}
            </span>
          </div>
          <div className="grid gap-4">
            {otherFiles.map((file) => (
              <FileCard key={file.name} file={file} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
