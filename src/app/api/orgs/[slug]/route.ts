import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

type RouteParams = { params: Promise<{ slug: string }> };

// GET /api/orgs/[slug] - Get organization by slug
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: org, error } = await supabase
    .from("organizations")
    .select(`*,
      owner:profiles!organizations_ownerid_fkey(displayName, avatarUrl),
      drives:drives(id, title, summary, imageUrl, status, progress, category, endsAt)`)
    .eq("slug", slug)
    .single();

  if (error || !org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  // Count followers
  const { count } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("orgId", org.id);

  return NextResponse.json({ ...org, followersCount: count ?? 0 });
}