import { PageShell } from "@/components/layout/header-wrapper";
import { Hero } from "@/components/layout/hero";
import { AboutSection } from "@/components/home/about-section";
import { CategoryGrid } from "@/components/category/category-grid";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import { UserDashboard } from "@/components/dashboard/user-dashboard";

export default async function Home() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is authenticated, display the User Dashboard instead of the landing page
  if (user) {
    let profile = await prisma.profile.findUnique({
      where: { id: user.id },
      select: { id: true, displayName: true, email: true, role: true },
    });

    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          id: user.id,
          email: user.email || `${user.id}@drivego.local`,
          displayName:
            user.user_metadata?.display_name || user.email?.split("@")[0] || "Organizer",
          role: "ORGANIZER",
        },
        select: { id: true, displayName: true, email: true, role: true },
      });
    }

    const [userDrives, savedDrives, recentDrives] = await Promise.all([
      prisma.drive.findMany({
        where: { creatorId: user.id },
        include: {
          creator: { select: { displayName: true } },
          organization: { select: { name: true, verified: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.savedDrive.findMany({
        where: { userId: user.id },
        include: {
          drive: {
            include: {
              creator: { select: { displayName: true } },
              organization: { select: { name: true, verified: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.drive.findMany({
        where: { status: "ACTIVE" },
        take: 6,
        include: {
          creator: { select: { displayName: true } },
          organization: { select: { name: true, verified: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const serializedUserDrives = userDrives.map((d) => ({
      ...d,
      endsAt: d.endsAt ? d.endsAt.toISOString() : null,
    }));

    const serializedSavedDrives = savedDrives.map((s) => ({
      ...s.drive,
      endsAt: s.drive.endsAt ? s.drive.endsAt.toISOString() : null,
    }));

    const serializedRecentDrives = recentDrives.map((d) => ({
      ...d,
      endsAt: d.endsAt ? d.endsAt.toISOString() : null,
    }));

    return (
      <PageShell hideHeader={true}>
        <UserDashboard
          user={user}
          profile={profile}
          userDrives={serializedUserDrives}
          savedDrives={serializedSavedDrives}
          recentDrives={serializedRecentDrives}
        />
      </PageShell>
    );
  }

  // If visitor is unauthenticated, show the public landing page
  return (
    <PageShell>
      <Hero />
      <AboutSection />
      <CategoryGrid />
    </PageShell>
  );
}