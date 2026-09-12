import { createSupabaseServerClient } from "./supabase-server";
import { prisma } from "./prisma";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  const user = data?.user;

  if (error || !user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  const user = data?.user;

  if (error || !user) {
    redirect("/login");
  }

  // Find or create profile
  let profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (!profile) {
    // Auto-create profile for user as ORGANIZER by default
    profile = await prisma.profile.create({
      data: {
        id: user.id,
        email: user.email || `${user.id}@drivego.local`,
        displayName: user.user_metadata?.display_name || user.email?.split("@")[0] || "User",
        role: "ORGANIZER",
      },
    });
  }

  if (profile.role !== "ADMIN") {
    redirect("/");
  }

  return { user, profile };
}

export async function requireOrganizer() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  const user = data?.user;

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