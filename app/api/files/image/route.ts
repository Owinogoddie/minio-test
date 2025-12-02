/* eslint-disable @typescript-eslint/no-explicit-any */
import { getFileStream } from "@/actions/files";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const fileName = searchParams.get("fileName");

    if (!fileName) {
      return NextResponse.json({ error: "fileName required" }, { status: 400 });
    }

    const buffer = await getFileStream(fileName);

    if (!buffer) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Determine content type from file extension
    const ext = fileName.split(".").pop()?.toLowerCase();
    const contentTypeMap: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      svg: "image/svg+xml",
      bmp: "image/bmp",
      ico: "image/x-icon",
    };

    const contentType = contentTypeMap[ext || ""] || "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
