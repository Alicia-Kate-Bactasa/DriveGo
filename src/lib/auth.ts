import { createSupabaseServerClient } from "./supabase-server";
import { prisma } from "./prisma";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // Find or create profile
  let profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (!profile) {
    // Auto-create profile for user; grant ADMIN if first user or in development
    const adminCount = await prisma.profile.count({ where: { role: "ADMIN" } });
    const role = adminCount === 0 || process.env.NODE_ENV === "development" ? "ADMIN" : "VOLUNTEER";

    profile = await prisma.profile.create({
      data: {
        id: user.id,
        email: user.email || `${user.id}@drivego.local`,
        displayName: user.user_metadata?.display_name || user.email?.split("@")[0] || "User",
        role,
      },
    });
  }

  if (profile.role !== "ADMIN" && process.env.NODE_ENV !== "development") {
    redirect("/");
  }

  return { user, profile };
}

export async function requireOrganizer() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "ORGANIZER" && profile.role !== "ADMIN")) {
    redirect("/");
  }

  return { user, profile };
}