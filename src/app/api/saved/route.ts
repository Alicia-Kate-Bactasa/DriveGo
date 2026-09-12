import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

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

  const { data: saved, error } = await supabase
    .from("saved_drives")
    .upsert({ userId: user.id, driveId }, { onConflict: "userId,driveId" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(saved, { status: 201 });
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

  const { error } = await supabase
    .from("saved_drives")
    .delete()
    .eq("userId", user.id)
    .eq("driveId", driveId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}