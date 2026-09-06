import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { z } from "zod";

const updateSchema = z.object({
  driveId: z.string().cuid(),
  title: z.string().min(3).max(120),
  body: z.string().min(10).max(5000),
});

// POST /api/updates - Post a drive update
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: update, error } = await supabase
    .from("updates")
    .insert({ ...parsed.data, authorId: user.id })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(update, { status: 201 });
}

// GET /api/updates?driveId=xxx - Get updates for a drive
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(request.url);
  const driveId = searchParams.get("driveId");

  if (!driveId) {
    return NextResponse.json({ error: "driveId is required" }, { status: 400 });
  }

  const { data: updates, error } = await supabase
    .from("updates")
    .select(`*, author:profiles!updates_authorid_fkey(displayName, avatarUrl)`)
    .eq("driveId", driveId)
    .order("createdAt", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ updates: updates ?? [] });
}