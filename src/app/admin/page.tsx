import { ShieldCheck, Inbox } from "lucide-react";
import { PageShell } from "@/components/layout/header-wrapper";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Tag } from "@/components/ui/tag";
import { getCategoryLabel } from "@/lib/categories";

export default async function AdminPage() {
  await requireAdmin();

  const pending = await prisma.drive.findMany({
    where: { status: "DRAFT" },
    orderBy: { createdAt: "desc" },
    include: { creator: { select: { displayName: true, email: true } } },
  });

  const stats = {
    total: await prisma.drive.count(),
    active: await prisma.drive.count({ where: { status: "ACTIVE" } }),
    pending: await prisma.drive.count({ where: { status: "DRAFT" } }),
    flagged: await prisma.drive.count({ where: { status: "REJECTED" } }),
  };

  return (
    <PageShell>
      <section className="border-b border-gray-100 bg-gradient-to-br from-blue-50 to-white py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-gray-900">
            <ShieldCheck size={28} className="text-primary" /> Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Moderate drives and verify transparency.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
            <p className="text-sm text-gray-500">Total Drives</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
            <p className="text-sm text-gray-500">Active</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
            <p className="text-sm text-gray-500">Pending Review</p>
            <p className="mt-1 text-2xl font-bold text-yellow-600">
              {stats.pending}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
            <p className="text-sm text-gray-500">Flagged</p>
            <p className="mt-1 text-2xl font-bold text-red-600">{stats.flagged}</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900">Pending Drives</h2>
        <div className="mt-4 space-y-4">
          {pending.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
              <Inbox size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No drives awaiting moderation.</p>
            </div>
          ) : (
            pending.map((d: typeof pending[number]) => (
              <div
                key={d.id}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{d.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {getCategoryLabel(d.category)} · by{" "}
                      {d.creator?.displayName || "anonymous"}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-gray-700">
                      {d.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Tag>Status: {d.status}</Tag>
                      {d.location && <Tag>📍 {d.location}</Tag>}
                    </div>
                  </div>
                  <a
                    href={`/drives/${d.id}`}
                    className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-primary hover:text-primary"
                  >
                    Review
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PageShell>
  );
}
