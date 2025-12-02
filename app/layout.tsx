import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ensureBucket } from "@/lib/minio";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MinIO File Manager",
  description: "Upload and manage files with MinIO",
};

// Initialize bucket when app starts
ensureBucket().catch(console.error);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
