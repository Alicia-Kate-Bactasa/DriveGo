import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { driveStatusSchema } from "@/lib/validators";

// Admin-only: moderate drives
export async function PATCH(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
  }

  const { driveId, status } = await request.json();
  const parsedStatus = driveStatusSchema.safeParse(status);

  if (!parsedStatus.success || !driveId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { data: updated, error } = await supabase
    .from("drives")
    .update({ status: parsedStatus.data })
    .eq("id", driveId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(updated);
}

// GET /api/admin/pending - List pending drives for moderation
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden - Admin only" }, { status: 403 });
  }

  const { data: drives, error } = await supabase
    .from("drives")
    .select(`*,
      creator:profiles!drives_creatorid_fkey(displayName, email),
      organization:organizations!drives_orgid_fkey(name)`)
    .in("status", ["DRAFT", "REJECTED"])
    .order("createdAt", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ drives: drives ?? [] });
}