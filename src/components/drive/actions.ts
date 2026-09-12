"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/login");
  }

  // Ensure profile exists in prisma so foreign key references succeed
  let profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });
  if (!profile) {
    profile = await prisma.profile.create({
      data: {
        id: user.id,
        email: user.email || `${user.id}@drivego.local`,
        displayName:
          user.user_metadata?.display_name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "User",
        role: "VOLUNTEER",
      },
    });
  }

  return { supabase, user, profile };
}

export async function saveDrive(driveId: string) {
  const { user } = await requireUser();
  await prisma.savedDrive.upsert({
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
  return { ok: true };
}

export async function unsaveDrive(driveId: string) {
  const { user } = await requireUser();
  await prisma.savedDrive.deleteMany({
    where: {
      userId: user.id,
      driveId,
    },
  });
  return { ok: true };
}

export async function followDrive(driveId: string) {
  const { user } = await requireUser();
  await prisma.follow.upsert({
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
  return { ok: true };
}

export async function unfollowDrive(driveId: string) {
  const { user } = await requireUser();
  await prisma.follow.deleteMany({
    where: {
      followerId: user.id,
      driveId,
    },
  });
  return { ok: true };
}

export async function voteDrive(driveId: string, type: "TRUE_INFO" | "FALSE_INFO") {
  const { user } = await requireUser();

  // Check if existing vote exists
  const existingVote = await prisma.driveVote.findUnique({
    where: {
      userId_driveId: {
        userId: user.id,
        driveId,
      },
    },
  });

  let newVoteType: "TRUE_INFO" | "FALSE_INFO" | null = type;

  if (existingVote) {
    if (existingVote.type === type) {
      // Toggle off / remove vote
      await prisma.driveVote.delete({
        where: { id: existingVote.id },
      });
      newVoteType = null;
    } else {
      // Switch vote type
      await prisma.driveVote.update({
        where: { id: existingVote.id },
        data: { type },
      });
      newVoteType = type;
    }
  } else {
    // Create new vote
    await prisma.driveVote.create({
      data: {
        userId: user.id,
        driveId,
        type,
      },
    });
    newVoteType = type;
  }

  // Recalculate vote counts
  const [trueVotesCount, falseVotesCount] = await Promise.all([
    prisma.driveVote.count({
      where: { driveId, type: "TRUE_INFO" },
    }),
    prisma.driveVote.count({
      where: { driveId, type: "FALSE_INFO" },
    }),
  ]);

  // Check if threshold of 8 false reports is reached
  const isAutoRejected = falseVotesCount >= 8;

  const updateData: any = {
    trueVotesCount,
    falseVotesCount,
  };

  if (isAutoRejected) {
    updateData.status = "REJECTED";
    updateData.adminReviewed = false;
  }

  await prisma.drive.update({
    where: { id: driveId },
    data: updateData,
  });

  return {
    ok: true,
    userVote: newVoteType,
    trueVotesCount,
    falseVotesCount,
    isAutoRejected,
  };
}

export async function getDriveVoteInfo(driveId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const drive = await prisma.drive.findUnique({
    where: { id: driveId },
    select: {
      trueVotesCount: true,
      falseVotesCount: true,
      status: true,
      adminReviewed: true,
    },
  });

  let userVote: "TRUE_INFO" | "FALSE_INFO" | null = null;
  if (user) {
    const existing = await prisma.driveVote.findUnique({
      where: {
        userId_driveId: {
          userId: user.id,
          driveId,
        },
      },
      select: { type: true },
    });
    if (existing) {
      userVote = existing.type;
    }
  }

  return {
    trueVotesCount: drive?.trueVotesCount ?? 0,
    falseVotesCount: drive?.falseVotesCount ?? 0,
    status: drive?.status ?? "ACTIVE",
    adminReviewed: drive?.adminReviewed ?? false,
    userVote,
    isAuthenticated: !!user,
  };
}

export async function deleteDrive(driveId: string) {
  const { user, profile } = await requireUser();

  const drive = await prisma.drive.findUnique({
    where: { id: driveId },
    select: { id: true, creatorId: true, title: true },
  });

  if (!drive) {
    throw new Error("Drive not found");
  }

  // Only the creator or an admin can delete the drive
  if (drive.creatorId !== user.id && profile.role !== "ADMIN") {
    throw new Error("You are not authorized to delete this drive");
  }

  await prisma.drive.delete({
    where: { id: driveId },
  });

  revalidatePath("/");
  revalidatePath("/saved");
  revalidatePath("/category/all");

  return { ok: true, deletedId: driveId };
}