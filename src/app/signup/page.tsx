"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/header-wrapper";
import { useAuthModal } from "@/components/auth/auth-modal-context";
import { useUser } from "@/hooks/use-user";

export default function SignupPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/");
      } else {
        openAuthModal("signup");
      }
    }
  }, [user, loading, openAuthModal, router]);

  return (
    <PageShell>
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-primary" />
      </div>
    </PageShell>
  );
}