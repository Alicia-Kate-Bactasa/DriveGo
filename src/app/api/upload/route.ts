import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

// Allowed mime types
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const STORAGE_BUCKET = "drive-uploads";

let bucketEnsured = false;

async function getSupabaseStorageClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  if (!bucketEnsured) {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const exists = buckets?.some((b) => b.name === STORAGE_BUCKET);
      if (!exists) {
        await supabase.storage.createBucket(STORAGE_BUCKET, {
          public: true,
          fileSizeLimit: MAX_FILE_SIZE,
          allowedMimeTypes: Array.from(ALLOWED_MIME_TYPES),
        });
      }
      bucketEnsured = true;
    } catch (err) {
      console.warn("Could not check/create storage bucket:", err);
    }
  }

  return supabase;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "No image file provided." },
        { status: 400 }
      );
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image file size exceeds the 10MB limit." },
        { status: 400 }
      );
    }

    // Validate mime type
    const mimeType = file.type.toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        { error: "Unsupported image format. Please upload a PNG, JPG/JPEG, or WebP image." },
        { status: 400 }
      );
    }

    // Determine extension
    let extension = "jpg";
    if (mimeType === "image/png") {
      extension = "png";
    } else if (mimeType === "image/webp") {
      extension = "webp";
    } else if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
      extension = "jpg";
    }

    // Read bytes
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uniqueId = crypto.randomUUID().slice(0, 8);
    const fileName = `drive-${Date.now()}-${uniqueId}.${extension}`;

    // Try uploading to Supabase Storage (cloud storage for serverless / production)
    const supabase = await getSupabaseStorageClient();
    if (supabase) {
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, buffer, {
          contentType: mimeType,
          upsert: false,
        });

      if (uploadError) {
        console.error("Supabase storage upload error:", uploadError);
        return NextResponse.json(
          { error: uploadError.message || "Failed to upload image to storage." },
          { status: 500 }
        );
      }

      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(fileName);

      return NextResponse.json({
        success: true,
        url: urlData.publicUrl,
        fileName,
        size: file.size,
      });
    }

    // Fallback: Local filesystem (for local dev without cloud storage credentials)
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });

      const filePath = path.join(uploadsDir, fileName);
      await fs.writeFile(filePath, buffer);

      const publicUrl = `/uploads/${fileName}`;

      return NextResponse.json({
        success: true,
        url: publicUrl,
        fileName,
        size: file.size,
      });
    } catch (fsError: any) {
      console.error("Local filesystem write error:", fsError);
      if (fsError?.code === "EROFS") {
        return NextResponse.json(
          {
            error:
              "Read-only file system. Cloud storage credentials (NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY) are required in serverless environments.",
          },
          { status: 500 }
        );
      }
      throw fsError;
    }
  } catch (error: any) {
    console.error("Image upload failed:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload image." },
      { status: 500 }
    );
  }
}
