import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";

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

  try {
    if (orgId) {
      const follow = await prisma.follow.upsert({
        where: {
          followerId_orgId: {
            followerId: user.id,
            orgId,
          },
        },
        create: {
          followerId: user.id,
          orgId,
        },
        update: {},
      });
      return NextResponse.json(follow, { status: 201 });
    }

    if (driveId) {
      const follow = await prisma.follow.upsert({
        where: {
          followerId_driveId: {
            followerId: user.id,
            driveId,
          },
        },
        create: {
          followerId: user.id,
          driveId,
        },
        update: {},
      });
      return NextResponse.json(follow, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
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

  try {
    if (orgId) {
      await prisma.follow.deleteMany({
        where: {
          followerId: user.id,
          orgId,
        },
      });
    }

    if (driveId) {
      await prisma.follow.deleteMany({
        where: {
          followerId: user.id,
          driveId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}