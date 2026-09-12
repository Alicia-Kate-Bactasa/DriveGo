import { PageShell } from "@/components/layout/header-wrapper";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const metadata = {
  title: "Admin Dashboard — DriveGo",
  description: "Moderation and tracking dashboard for community donation drives.",
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { user, profile } = await requireAdmin();

  // Load all drives with creator and organization details
  const drives = await prisma.drive.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      creator: { select: { id: true, displayName: true, email: true } },
      organization: { select: { id: true, name: true, slug: true, verified: true } },
    },
  });

  return (
    <PageShell>
      <AdminDashboard
        initialDrives={drives as any}
        currentUser={{
          email: user.email,
          role: profile.role,
        }}
      />
    </PageShell>
  );
}
