import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";

// GET /api/saved - List user's saved drives
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: saved, error } = await supabase
    .from("saved_drives")
    .select(`id, createdAt, drive:drives!inner(*, creator:profiles!drives_creatorid_fkey(displayName))`)
    .eq("userId", user.id)
    .order("createdAt", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ saved: saved ?? [] });
}

// POST /api/saved - Save a drive
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { driveId } = await request.json();

  if (!driveId) {
    return NextResponse.json({ error: "driveId is required" }, { status: 400 });
  }

  try {
    const saved = await prisma.savedDrive.upsert({
      where: {
        userId_driveId: {
          userId: user.id,
          driveId,
        },
      },
      create: {
        userId: user.id,
        driveId,
      },
      update: {},
    });
    return NextResponse.json(saved, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/saved?driveId=xxx - Unsave a drive
export async function DELETE(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const driveId = searchParams.get("driveId");

  if (!driveId) {
    return NextResponse.json({ error: "driveId is required" }, { status: 400 });
  }

  try {
    await prisma.savedDrive.deleteMany({
      where: {
        userId: user.id,
        driveId,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}