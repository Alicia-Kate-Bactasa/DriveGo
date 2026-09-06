"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/header-wrapper";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/lib/categories";

export default function SubmitPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    summary: "",
    imageUrl: "",
    mediaUrl: "",
    category: "MONETARY",
    location: "",
    endsAt: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/drives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(JSON.stringify(data.error || data));
        setLoading(false);
        return;
      }

      const drive = await res.json();
      router.push(`/drives/${drive.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-2xl px-4 py-12 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Submit a Drive</h1>
        <p className="mt-2 text-gray-600">Share a donation drive with the DriveGo community.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title *</label>
            <Input name="title" value={form.title} onChange={handleChange} required minLength={3} maxLength={120} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Short summary</label>
            <Input name="summary" value={form.summary} onChange={handleChange} maxLength={300} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              minLength={20}
              maxLength={2000}
              rows={6}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category *</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              {CATEGORIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Image URL</label>
            <Input type="url" name="imageUrl" value={form.imageUrl} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Original source URL</label>
            <Input type="url" name="mediaUrl" value={form.mediaUrl} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <Input name="location" value={form.location} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Deadline</label>
            <Input type="datetime-local" name="endsAt" value={form.endsAt} onChange={handleChange} />
          </div>

          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Drive"}
            </Button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}