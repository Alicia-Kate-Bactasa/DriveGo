import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

// POST /api/follows - Follow an org or drive
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orgId, driveId } = await request.json();

  if (!orgId && !driveId) {
    return NextResponse.json({ error: "orgId or driveId is required" }, { status: 400 });
  }

  const followData: Record<string, string> = { followerId: user.id };
  if (orgId) followData.orgId = orgId;
  if (driveId) followData.driveId = driveId;

  const { data: follow, error } = await supabase
    .from("follows")
    .upsert(followData, { onConflict: "followerId,orgId" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(follow, { status: 201 });
}

// DELETE /api/follows?orgId=xxx or ?driveId=xxx - Unfollow
export async function DELETE(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get("orgId");
  const driveId = searchParams.get("driveId");

  let query = supabase.from("follows").delete().eq("followerId", user.id);
  if (orgId) query = query.eq("orgId", orgId);
  if (driveId) query = query.eq("driveId", driveId);

  const { error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}