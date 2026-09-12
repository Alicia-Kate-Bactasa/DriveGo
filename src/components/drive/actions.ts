"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/login");
  }
  return { supabase, user };
}

export async function saveDrive(driveId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("saved_drives")
    .upsert({ userId: user.id, driveId }, { onConflict: "userId,driveId" });
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function unsaveDrive(driveId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("saved_drives")
    .delete()
    .eq("userId", user.id)
    .eq("driveId", driveId);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function followDrive(driveId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("follows")
    .upsert({ followerId: user.id, driveId }, { onConflict: "followerId,driveId" });
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function unfollowDrive(driveId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("followerId", user.id)
    .eq("driveId", driveId);
  if (error) throw new Error(error.message);
  return { ok: true };
}