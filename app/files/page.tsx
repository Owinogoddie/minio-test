import { listFiles } from "@/actions/files";
import FileUpload from "./file-upload";
import FileList from "./file-list";

export const dynamic = "force-dynamic";

export default async function FilesPage() {
  const files = await listFiles();
  console.log({ files });

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto p-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-2">
            ☁️ MinIO File Manager
          </h1>
          <p className="text-gray-600 text-lg">
            Upload, manage, and download your files with ease
          </p>
        </div>

        <FileUpload />

        <div className="mt-8">
          <FileList initialFiles={files} />
        </div>
      </div>
    </div>
  );
}
