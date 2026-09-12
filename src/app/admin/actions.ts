"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { Status, Category, Role } from "@prisma/client";

// ==========================================
// DRIVES MANAGEMENT ACTIONS
// ==========================================

export async function updateDriveStatus(driveId: string, status: Status) {
  await requireAdmin();

  const updated = await prisma.drive.update({
    where: { id: driveId },
    data: { status },
  });

  revalidatePath("/admin");
  revalidatePath("/drives/" + driveId);
  revalidatePath("/category/all");
  return { success: true, drive: updated };
}

export async function updateDriveDetails(
  driveId: string,
  data: {
    title?: string;
    description?: string;
    summary?: string;
    category?: Category;
    status?: Status;
    location?: string;
    imageUrl?: string;
    mediaUrl?: string;
    progress?: number;
    donorsCount?: number;
  }
) {
  await requireAdmin();

  const updated = await prisma.drive.update({
    where: { id: driveId },
    data: {
      ...data,
      progress: data.progress !== undefined ? Number(data.progress) : undefined,
      donorsCount: data.donorsCount !== undefined ? Number(data.donorsCount) : undefined,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/drives/" + driveId);
  return { success: true, drive: updated };
}

export async function deleteDrive(driveId: string) {
  await requireAdmin();

  await prisma.drive.delete({
    where: { id: driveId },
  });

  revalidatePath("/admin");
  revalidatePath("/category/all");
  return { success: true };
}

export async function createDriveAdmin(data: {
  title: string;
  description: string;
  category: Category;
  summary?: string;
  location?: string;
  imageUrl?: string;
  mediaUrl?: string;
  status?: Status;
}) {
  const { user } = await requireAdmin();

  const created = await prisma.drive.create({
    data: {
      title: data.title,
      description: data.description,
      summary: data.summary || null,
      category: data.category,
      location: data.location || null,
      imageUrl: data.imageUrl || null,
      mediaUrl: data.mediaUrl || null,
      status: data.status || Status.ACTIVE,
      creatorId: user.id,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/category/all");
  return { success: true, drive: created };
}

// ==========================================
// ORGANIZATIONS MANAGEMENT ACTIONS
// ==========================================

export async function toggleOrgVerification(orgId: string, verified: boolean) {
  await requireAdmin();

  const updated = await prisma.organization.update({
    where: { id: orgId },
    data: { verified },
  });

  revalidatePath("/admin");
  revalidatePath("/orgs/" + updated.slug);
  return { success: true, organization: updated };
}

export async function updateOrganization(
  orgId: string,
  data: {
    name?: string;
    description?: string;
    website?: string;
    location?: string;
    verified?: boolean;
  }
) {
  await requireAdmin();

  const updated = await prisma.organization.update({
    where: { id: orgId },
    data,
  });

  revalidatePath("/admin");
  revalidatePath("/orgs/" + updated.slug);
  return { success: true, organization: updated };
}

export async function deleteOrganization(orgId: string) {
  await requireAdmin();

  await prisma.organization.delete({
    where: { id: orgId },
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function createOrganizationAdmin(data: {
  name: string;
  slug: string;
  description?: string;
  website?: string;
  location?: string;
  verified?: boolean;
}) {
  const { user } = await requireAdmin();

  const created = await prisma.organization.create({
    data: {
      name: data.name,
      slug: data.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-"),
      description: data.description || null,
      website: data.website || null,
      location: data.location || null,
      verified: data.verified ?? false,
      ownerId: user.id,
    },
  });

  revalidatePath("/admin");
  return { success: true, organization: created };
}

// ==========================================
// USERS & ROLES MANAGEMENT ACTIONS
// ==========================================

export async function updateUserRole(userId: string, role: Role) {
  await requireAdmin();

  const updated = await prisma.profile.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/admin");
  return { success: true, profile: updated };
}

// ==========================================
// UPDATES / FEED MANAGEMENT ACTIONS
// ==========================================

export async function deleteDriveUpdate(updateId: string) {
  await requireAdmin();

  await prisma.update.delete({
    where: { id: updateId },
  });

  revalidatePath("/admin");
  return { success: true };
}
