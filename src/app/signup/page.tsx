"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/layout/header-wrapper";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Create an account</h1>
          <p className="mt-2 text-sm text-gray-600">Join DriveGo to save drives and follow organizations.</p>

          <form onSubmit={handleSignup} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Display name</label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required minLength={2} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="At least 8 characters"
              />
            </div>

            {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </PageShell>
  );
}