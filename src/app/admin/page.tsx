import { PageShell } from "@/components/layout/header-wrapper";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const metadata = {
  title: "Admin Dashboard — DriveGo",
  description: "Platform management for drives, organizations, users, and community moderation.",
};

export default async function AdminPage() {
  const { user, profile } = await requireAdmin();

  // Load all drives
  const drives = await prisma.drive.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      creator: { select: { id: true, displayName: true, email: true } },
      organization: { select: { id: true, name: true, slug: true, verified: true } },
    },
  });

  // Load all organizations
  const organizations = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      owner: { select: { id: true, displayName: true, email: true } },
      _count: { select: { drives: true } },
    },
  });

  // Load all users
  const users = await prisma.profile.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { createdDrives: true } },
    },
  });

  // Load recent updates
  const updates = await prisma.update.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      drive: { select: { id: true, title: true } },
      author: { select: { displayName: true, email: true } },
    },
  });

  return (
    <PageShell>
      <AdminDashboard
        initialDrives={drives as any}
        initialOrgs={organizations as any}
        initialUsers={users as any}
        initialUpdates={updates as any}
        currentUser={{
          email: user.email,
          role: profile.role,
        }}
      />
    </PageShell>
  );
}
