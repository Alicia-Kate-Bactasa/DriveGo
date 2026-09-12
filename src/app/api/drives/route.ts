import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { driveSchema, driveFilterSchema } from "@/lib/validators";
import { Status } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { validateSafeUrl } from "@/lib/security";

// GET /api/drives - List drives with filtering
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { searchParams } = new URL(request.url);

  // Build filter from query params
  const filter = driveFilterSchema.safeParse({
    category: searchParams.get("category") || undefined,
    status: searchParams.get("status") || "ACTIVE",
    query: searchParams.get("query") || undefined,
    lat: searchParams.get("lat") ? Number(searchParams.get("lat")) : undefined,
    lng: searchParams.get("lng") ? Number(searchParams.get("lng")) : undefined,
    radiusKm: searchParams.get("radiusKm") ? Number(searchParams.get("radiusKm")) : undefined,
    sortBy: searchParams.get("sortBy") || "createdAt",
    sortOrder: searchParams.get("sortOrder") || "desc",
    page: Number(searchParams.get("page")) || 1,
    pageSize: Number(searchParams.get("pageSize")) || 12,
  });

  if (!filter.success) {
    return NextResponse.json({ error: filter.error.flatten() }, { status: 400 });
  }

  const { category, status, query, lat, lng, radiusKm, sortBy, sortOrder, page, pageSize } = filter.data;

  let dbQuery = supabase
    .from("drives")
    .select(
      `id, title, summary, imageUrl, category, status, location, endsAt, progress, donorsCount, trueVotesCount, falseVotesCount,
       creator:profiles!drives_creatorid_fkey(displayName, avatarUrl),
       organization:organizations!drives_orgid_fkey(name, slug, verified)`
    )
    .eq("status", status || Status.ACTIVE)
    .range((page - 1) * pageSize, page * pageSize - 1);

  // Category filter
  if (category) {
    dbQuery = dbQuery.eq("category", category);
  }

  // Search filter
  if (query) {
    dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
  }

  // Location-based filtering (approximate bounding box)
  if (lat && lng && radiusKm) {
    const radiusDeg = radiusKm / 111;
    dbQuery = dbQuery
      .gte("locationLat", lat - radiusDeg)
      .lte("locationLat", lat + radiusDeg)
      .gte("locationLng", lng - radiusDeg)
      .lte("locationLng", lng + radiusDeg);
  }

  // Sorting
  const ascending = sortOrder === "asc";
  if (sortBy === "endsAt") {
    dbQuery = dbQuery.order("endsAt", { ascending });
  } else if (sortBy === "progress") {
    dbQuery = dbQuery.order("progress", { ascending });
  } else {
    dbQuery = dbQuery.order("createdAt", { ascending });
  }

  const { data: drives, error } = await dbQuery;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ drives: drives ?? [], page, pageSize });
}

// POST /api/drives - Create a new drive
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = driveSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Security Check: Validate media link against shorteners, direct IPs, and dangerous schemes
  if (parsed.data.mediaUrl) {
    const urlValidation = validateSafeUrl(parsed.data.mediaUrl);
    if (!urlValidation.isValid) {
      return NextResponse.json({ error: urlValidation.error }, { status: 400 });
    }
  }

  // Ensure creator profile exists
  let profile = await prisma.profile.findUnique({ where: { id: user.id } });
  if (!profile) {
    profile = await prisma.profile.create({
      data: {
        id: user.id,
        email: user.email || `${user.id}@drivego.local`,
        displayName: user.user_metadata?.display_name || user.email?.split("@")[0] || "Organizer",
        role: "ORGANIZER",
      },
    });
  }

  try {
    const newDrive = await prisma.drive.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description,
        summary: parsed.data.summary,
        mediaUrl: parsed.data.mediaUrl || null,
        imageUrl: parsed.data.imageUrl || null,
        category: parsed.data.category,
        location: parsed.data.location || null,
        locationLat: parsed.data.locationLat ?? null,
        locationLng: parsed.data.locationLng ?? null,
        creatorId: user.id,
        status: Status.ACTIVE,
        startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
        endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
      },
    });

    return NextResponse.json(newDrive, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to create drive" }, { status: 500 });
  }
}
