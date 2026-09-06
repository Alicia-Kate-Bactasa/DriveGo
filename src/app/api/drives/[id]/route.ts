import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { driveUpdateSchema } from "@/lib/validators";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/drives/[id] - Get a single drive
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: drive, error } = await supabase
    .from("drives")
    .select(
      `*,
       creator:profiles!drives_creatorid_fkey(id, displayName, avatarUrl),
       organization:organizations!drives_orgid_fkey(name, slug, verified),
       items:drive_items(*),
       updates:updates(*, author:profiles!updates_authorid_fkey(displayName, avatarUrl))`
    )
    .eq("id", id)
    .single();

  if (error || !drive) {
    return NextResponse.json({ error: "Drive not found" }, { status: 404 });
  }

  return NextResponse.json(drive);
}

// PATCH /api/drives/[id] - Update a drive
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check ownership
  const { data: existing } = await supabase
    .from("drives")
    .select("creatorId, status")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Drive not found" }, { status: 404 });
  }

  if (existing.creatorId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = driveUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updateData = {
    ...parsed.data,
    startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt as any) : undefined,
    endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt as any) : undefined,
  };

  const { data: updated, error } = await supabase
    .from("drives")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(updated);
}

// DELETE /api/drives/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check ownership or admin
  const { data: existing } = await supabase
    .from("drives")
    .select("creatorId")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Drive not found" }, { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (existing.creatorId !== user.id && profile?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase.from("drives").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}