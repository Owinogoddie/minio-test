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

    return new NextResponse(buffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
