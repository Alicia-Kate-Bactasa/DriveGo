"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Package,
  Building2,
  Users,
  MessageSquare,
  Search,
  Plus,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Edit3,
  BadgeCheck,
  MapPin,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Category, Status, Role } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Tag } from "@/components/ui/tag";
import { CATEGORIES, getCategoryLabel } from "@/lib/categories";
import {
  updateDriveStatus,
  updateDriveDetails,
  deleteDrive,
  createDriveAdmin,
  toggleOrgVerification,
  updateOrganization,
  deleteOrganization,
  createOrganizationAdmin,
  updateUserRole,
  deleteDriveUpdate,
} from "@/app/admin/actions";

type DriveItem = {
  id: string;
  title: string;
  summary: string | null;
  description: string;
  category: Category;
  status: Status;
  location: string | null;
  imageUrl: string | null;
  mediaUrl: string | null;
  endsAt: Date | string | null;
  createdAt: Date | string;
  progress: number;
  donorsCount: number;
  creator: { id: string; displayName: string | null; email: string };
  organization: { id: string; name: string; slug: string; verified: boolean } | null;
};

type OrgItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  website: string | null;
  location: string | null;
  verified: boolean;
  createdAt: Date | string;
  owner: { id: string; displayName: string | null; email: string };
  _count: { drives: number };
};

type UserItem = {
  id: string;
  email: string;
  displayName: string | null;
  role: Role;
  createdAt: Date | string;
  _count: { createdDrives: number };
};

type UpdateItem = {
  id: string;
  title: string;
  body: string;
  createdAt: Date | string;
  drive: { id: string; title: string };
  author: { displayName: string | null; email: string };
};

type AdminDashboardProps = {
  initialDrives: DriveItem[];
  initialOrgs: OrgItem[];
  initialUsers: UserItem[];
  initialUpdates: UpdateItem[];
  currentUser: { email?: string; role?: string };
};

type Tab = "overview" | "drives" | "orgs" | "users" | "updates";

export function AdminDashboard({
  initialDrives,
  initialOrgs,
  initialUsers,
  initialUpdates,
  currentUser,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [busyId, setBusyId] = useState<string | null>(null);

  // Lists state
  const [drives, setDrives] = useState<DriveItem[]>(initialDrives);
  const [orgs, setOrgs] = useState<OrgItem[]>(initialOrgs);
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [updates, setUpdates] = useState<UpdateItem[]>(initialUpdates);

  // Search & Filter states
  const [driveSearch, setDriveSearch] = useState("");
  const [driveStatusFilter, setDriveStatusFilter] = useState<string>("ALL");
  const [driveCatFilter, setDriveCatFilter] = useState<string>("ALL");

  const [orgSearch, setOrgSearch] = useState("");
  const [orgVerifiedFilter, setOrgVerifiedFilter] = useState<string>("ALL");

  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("ALL");

  // Edit Drive Modal state
  const [editingDrive, setEditingDrive] = useState<DriveItem | null>(null);
  const [driveEditForm, setDriveEditForm] = useState<any>({});
  const [isNewDriveModalOpen, setIsNewDriveModalOpen] = useState(false);
  const [newDriveForm, setNewDriveForm] = useState({
    title: "",
    category: "MONETARY" as Category,
    description: "",
    summary: "",
    location: "",
    imageUrl: "",
    mediaUrl: "",
    status: Status.ACTIVE as Status,
  });

  // Edit Org Modal state
  const [editingOrg, setEditingOrg] = useState<OrgItem | null>(null);
  const [orgEditForm, setOrgEditForm] = useState<any>({});
  const [isNewOrgModalOpen, setIsNewOrgModalOpen] = useState(false);
  const [newOrgForm, setNewOrgForm] = useState({
    name: "",
    slug: "",
    description: "",
    website: "",
    location: "",
    verified: true,
  });

  // ==========================================
  // METRICS COMPUTATIONS
  // ==========================================
  const stats = useMemo(() => {
    return {
      totalDrives: drives.length,
      activeDrives: drives.filter((d) => d.status === "ACTIVE").length,
      pendingDrives: drives.filter((d) => d.status === "DRAFT").length,
      flaggedDrives: drives.filter((d) => d.status === "REJECTED").length,
      fundedDrives: drives.filter((d) => d.status === "FUNDED").length,
      totalOrgs: orgs.length,
      verifiedOrgs: orgs.filter((o) => o.verified).length,
      totalUsers: users.length,
      adminUsers: users.filter((u) => u.role === "ADMIN").length,
      organizerUsers: users.filter((u) => u.role === "ORGANIZER").length,
      totalDonors: drives.reduce((acc, d) => acc + (d.donorsCount || 0), 0),
    };
  }, [drives, orgs, users]);

  // ==========================================
  // FILTERED LISTS
  // ==========================================
  const filteredDrives = useMemo(() => {
    return drives.filter((d) => {
      const matchesSearch =
        d.title.toLowerCase().includes(driveSearch.toLowerCase()) ||
        (d.location && d.location.toLowerCase().includes(driveSearch.toLowerCase())) ||
        (d.creator.displayName && d.creator.displayName.toLowerCase().includes(driveSearch.toLowerCase())) ||
        d.creator.email.toLowerCase().includes(driveSearch.toLowerCase());

      const matchesStatus = driveStatusFilter === "ALL" || d.status === driveStatusFilter;
      const matchesCat = driveCatFilter === "ALL" || d.category === driveCatFilter;

      return matchesSearch && matchesStatus && matchesCat;
    });
  }, [drives, driveSearch, driveStatusFilter, driveCatFilter]);

  const filteredOrgs = useMemo(() => {
    return orgs.filter((o) => {
      const matchesSearch =
        o.name.toLowerCase().includes(orgSearch.toLowerCase()) ||
        o.slug.toLowerCase().includes(orgSearch.toLowerCase()) ||
        (o.location && o.location.toLowerCase().includes(orgSearch.toLowerCase()));

      const matchesVerified =
        orgVerifiedFilter === "ALL" ||
        (orgVerifiedFilter === "VERIFIED" && o.verified) ||
        (orgVerifiedFilter === "UNVERIFIED" && !o.verified);

      return matchesSearch && matchesVerified;
    });
  }, [orgs, orgSearch, orgVerifiedFilter]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.displayName && u.displayName.toLowerCase().includes(userSearch.toLowerCase()));

      const matchesRole = userRoleFilter === "ALL" || u.role === userRoleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, userSearch, userRoleFilter]);

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleStatusChange = async (driveId: string, newStatus: Status) => {
    setBusyId(driveId);
    try {
      await updateDriveStatus(driveId, newStatus);
      setDrives((prev) =>
        prev.map((d) => (d.id === driveId ? { ...d, status: newStatus } : d))
      );
    } catch (err: any) {
      alert("Error updating status: " + err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteDrive = async (driveId: string) => {
    if (!confirm("Are you sure you want to permanently delete this drive?")) return;
    setBusyId(driveId);
    try {
      await deleteDrive(driveId);
      setDrives((prev) => prev.filter((d) => d.id !== driveId));
    } catch (err: any) {
      alert("Error deleting drive: " + err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleOpenEditDrive = (drive: DriveItem) => {
    setEditingDrive(drive);
    setDriveEditForm({
      title: drive.title,
      category: drive.category,
      status: drive.status,
      description: drive.description,
      summary: drive.summary || "",
      location: drive.location || "",
      imageUrl: drive.imageUrl || "",
      mediaUrl: drive.mediaUrl || "",
      progress: drive.progress || 0,
      donorsCount: drive.donorsCount || 0,
    });
  };

  const handleSaveDriveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDrive) return;
    setBusyId(editingDrive.id);
    try {
      const res = await updateDriveDetails(editingDrive.id, driveEditForm);
      if (res.drive) {
        setDrives((prev) =>
          prev.map((d) => (d.id === editingDrive.id ? { ...d, ...res.drive } : d))
        );
      }
      setEditingDrive(null);
    } catch (err: any) {
      alert("Error saving drive: " + err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleCreateDriveAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusyId("new-drive");
    try {
      const res = await createDriveAdmin(newDriveForm);
      if (res.drive) {
        setDrives((prev) => [
          {
            ...res.drive,
            creator: { id: "admin", displayName: "Admin", email: currentUser.email || "admin" },
            organization: null,
          } as DriveItem,
          ...prev,
        ]);
      }
      setIsNewDriveModalOpen(false);
      setNewDriveForm({
        title: "",
        category: "MONETARY",
        description: "",
        summary: "",
        location: "",
        imageUrl: "",
        mediaUrl: "",
        status: Status.ACTIVE,
      });
    } catch (err: any) {
      alert("Error creating drive: " + err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleOrgVerified = async (orgId: string, current: boolean) => {
    setBusyId(orgId);
    try {
      await toggleOrgVerification(orgId, !current);
      setOrgs((prev) =>
        prev.map((o) => (o.id === orgId ? { ...o, verified: !current } : o))
      );
    } catch (err: any) {
      alert("Error toggling verification: " + err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteOrg = async (orgId: string) => {
    if (!confirm("Are you sure you want to delete this organization?")) return;
    setBusyId(orgId);
    try {
      await deleteOrganization(orgId);
      setOrgs((prev) => prev.filter((o) => o.id !== orgId));
    } catch (err: any) {
      alert("Error deleting organization: " + err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleOpenEditOrg = (org: OrgItem) => {
    setEditingOrg(org);
    setOrgEditForm({
      name: org.name,
      description: org.description || "",
      website: org.website || "",
      location: org.location || "",
      verified: org.verified,
    });
  };

  const handleSaveOrgEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;
    setBusyId(editingOrg.id);
    try {
      const res = await updateOrganization(editingOrg.id, orgEditForm);
      if (res.organization) {
        setOrgs((prev) =>
          prev.map((o) => (o.id === editingOrg.id ? { ...o, ...res.organization } : o))
        );
      }
      setEditingOrg(null);
    } catch (err: any) {
      alert("Error updating org: " + err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleCreateOrgAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusyId("new-org");
    try {
      const res = await createOrganizationAdmin(newOrgForm);
      if (res.organization) {
        setOrgs((prev) => [
          {
            ...res.organization,
            owner: { id: "admin", displayName: "Admin", email: currentUser.email || "admin" },
            _count: { drives: 0 },
          } as OrgItem,
          ...prev,
        ]);
      }
      setIsNewOrgModalOpen(false);
      setNewOrgForm({
        name: "",
        slug: "",
        description: "",
        website: "",
        location: "",
        verified: true,
      });
    } catch (err: any) {
      alert("Error creating organization: " + err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: Role) => {
    setBusyId(userId);
    try {
      await updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err: any) {
      alert("Error updating role: " + err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteUpdate = async (updateId: string) => {
    if (!confirm("Are you sure you want to delete this campaign update?")) return;
    setBusyId(updateId);
    try {
      await deleteDriveUpdate(updateId);
      setUpdates((prev) => prev.filter((u) => u.id !== updateId));
    } catch (err: any) {
      alert("Error deleting update: " + err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-12 sm:pt-32 lg:px-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-800">
            <ShieldCheck size={14} />
            <span>Admin Control Center</span>
          </div>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Platform Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage drives, organizations, user roles, and moderate community content.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsNewDriveModalOpen(true)}
          >
            <Plus size={14} className="mr-1.5" />
            New Drive
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsNewOrgModalOpen(true)}
          >
            <Plus size={14} className="mr-1.5" />
            New Organization
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div
          onClick={() => setActiveTab("drives")}
          className="cursor-pointer rounded-2xl border border-gray-100 bg-white p-5 shadow-xs transition hover:border-primary/40 hover:shadow-md"
        >
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Drives</span>
            <Package size={18} className="text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{stats.totalDrives}</p>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="text-emerald-600 font-semibold">{stats.activeDrives} Active</span>
            <span className="text-gray-300">•</span>
            <span className="text-amber-600 font-semibold">{stats.pendingDrives} Pending</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab("orgs")}
          className="cursor-pointer rounded-2xl border border-gray-100 bg-white p-5 shadow-xs transition hover:border-primary/40 hover:shadow-md"
        >
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Organizations</span>
            <Building2 size={18} className="text-purple-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{stats.totalOrgs}</p>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="text-purple-600 font-semibold">{stats.verifiedOrgs} Verified</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab("users")}
          className="cursor-pointer rounded-2xl border border-gray-100 bg-white p-5 shadow-xs transition hover:border-primary/40 hover:shadow-md"
        >
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Users</span>
            <Users size={18} className="text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
          <div className="mt-2 flex items-center gap-2 text-xs">
            <span className="text-blue-600 font-semibold">{stats.adminUsers} Admins</span>
            <span className="text-gray-300">•</span>
            <span className="text-gray-600">{stats.organizerUsers} Organizers</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab("drives")}
          className="cursor-pointer rounded-2xl border border-gray-100 bg-white p-5 shadow-xs transition hover:border-primary/40 hover:shadow-md"
        >
          <div className="flex items-center justify-between text-gray-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Community Impact</span>
            <Sparkles size={18} className="text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-gray-900">{stats.totalDonors}</p>
          <p className="mt-2 text-xs text-gray-500">Total recorded donors</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mt-8 flex flex-wrap gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            activeTab === "overview"
              ? "bg-primary text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Dashboard Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("drives")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            activeTab === "drives"
              ? "bg-primary text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Drives ({drives.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("orgs")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            activeTab === "orgs"
              ? "bg-primary text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Organizations ({orgs.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            activeTab === "users"
              ? "bg-primary text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Users ({users.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("updates")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            activeTab === "updates"
              ? "bg-primary text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Updates & Activity ({updates.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="mt-6 space-y-8">
          {/* Pending Drives moderation spotlight */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Drives Awaiting Review</h2>
                <p className="text-xs text-gray-500">
                  Drives in Draft status awaiting admin approval before being promoted to Active.
                </p>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                {stats.pendingDrives} Pending
              </span>
            </div>

            <div className="mt-4 divide-y divide-gray-100">
              {drives.filter((d) => d.status === "DRAFT").length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-400">
                  ✓ No drives currently awaiting moderation. All campaigns are reviewed!
                </p>
              ) : (
                drives
                  .filter((d) => d.status === "DRAFT")
                  .map((drive) => (
                    <div
                      key={drive.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900">{drive.title}</h3>
                          <Tag>{getCategoryLabel(drive.category)}</Tag>
                        </div>
                        <p className="mt-1 line-clamp-1 text-xs text-gray-600">
                          {drive.description}
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          Submitted by {drive.creator.displayName || drive.creator.email}
                          {drive.location && ` • ${drive.location}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(drive.id, Status.ACTIVE)}
                          disabled={busyId === drive.id}
                          className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                        >
                          <CheckCircle size={14} className="mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(drive.id, Status.REJECTED)}
                          disabled={busyId === drive.id}
                          className="text-red-600 hover:bg-red-50 text-xs"
                        >
                          <XCircle size={14} className="mr-1" />
                          Reject
                        </Button>
                        <Link
                          href={`/drives/${drive.id}`}
                          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          title="View public page"
                        >
                          <ExternalLink size={16} />
                        </Link>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Quick Management Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
              <h2 className="text-lg font-bold text-gray-900">Recent Drives</h2>
              <div className="mt-4 divide-y divide-gray-100">
                {drives.slice(0, 5).map((d) => (
                  <div key={d.id} className="flex items-center justify-between py-2.5 text-xs">
                    <div>
                      <p className="font-semibold text-gray-800 line-clamp-1">{d.title}</p>
                      <p className="text-gray-400">{getCategoryLabel(d.category)}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 font-semibold ${
                        d.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800"
                          : d.status === "DRAFT"
                          ? "bg-amber-100 text-amber-800"
                          : d.status === "FUNDED"
                          ? "bg-blue-100 text-primary"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {d.status}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full text-xs"
                onClick={() => setActiveTab("drives")}
              >
                View & Manage All Drives →
              </Button>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xs">
              <h2 className="text-lg font-bold text-gray-900">Registered Organizations</h2>
              <div className="mt-4 divide-y divide-gray-100">
                {orgs.length === 0 ? (
                  <p className="py-6 text-center text-xs text-gray-400">
                    No organizations created yet.
                  </p>
                ) : (
                  orgs.slice(0, 5).map((o) => (
                    <div key={o.id} className="flex items-center justify-between py-2.5 text-xs">
                      <div>
                        <p className="font-semibold text-gray-800 flex items-center gap-1">
                          {o.name}
                          {o.verified && <BadgeCheck size={14} className="text-primary" />}
                        </p>
                        <p className="text-gray-400">/{o.slug}</p>
                      </div>
                      <span className="text-gray-500 font-medium">
                        {o._count?.drives || 0} drives
                      </span>
                    </div>
                  ))
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 w-full text-xs"
                onClick={() => setActiveTab("orgs")}
              >
                View & Manage All Organizations →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DRIVES MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === "drives" && (
        <div className="mt-6 space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={driveSearch}
                onChange={(e) => setDriveSearch(e.target.value)}
                placeholder="Search drives by title, organizer, location..."
                className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={driveStatusFilter}
                onChange={(e) => setDriveStatusFilter(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 focus:border-primary focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft / Pending</option>
                <option value="FUNDED">Funded</option>
                <option value="EXPIRED">Expired</option>
                <option value="REJECTED">Rejected</option>
                <option value="ARCHIVED">Archived</option>
              </select>

              <select
                value={driveCatFilter}
                onChange={(e) => setDriveCatFilter(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 focus:border-primary focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.label}
                  </option>
                ))}
              </select>

              <Button size="sm" onClick={() => setIsNewDriveModalOpen(true)}>
                <Plus size={14} className="mr-1" />
                Add Drive
              </Button>
            </div>
          </div>

          {/* Drives Table */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="border-b border-gray-100 bg-gray-50/70 font-semibold text-gray-700 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Drive</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Organizer</th>
                    <th className="px-4 py-3">Progress</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDrives.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        No drives found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredDrives.map((drive) => (
                      <tr key={drive.id} className="hover:bg-gray-50/60 transition">
                        <td className="px-4 py-3 font-medium text-gray-900 max-w-xs">
                          <p className="line-clamp-1 font-semibold">{drive.title}</p>
                          {drive.location && (
                            <p className="text-[11px] text-gray-400 flex items-center gap-1">
                              <MapPin size={10} /> {drive.location}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Tag>{getCategoryLabel(drive.category)}</Tag>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <select
                            value={drive.status}
                            disabled={busyId === drive.id}
                            onChange={(e) =>
                              handleStatusChange(drive.id, e.target.value as Status)
                            }
                            className={`rounded-lg border px-2 py-1 text-xs font-semibold focus:outline-none ${
                              drive.status === "ACTIVE"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                : drive.status === "DRAFT"
                                ? "border-amber-200 bg-amber-50 text-amber-800"
                                : drive.status === "FUNDED"
                                ? "border-blue-200 bg-blue-50 text-primary"
                                : drive.status === "REJECTED"
                                ? "border-red-200 bg-red-50 text-red-800"
                                : "border-gray-200 bg-gray-50 text-gray-700"
                            }`}
                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="DRAFT">DRAFT</option>
                            <option value="FUNDED">FUNDED</option>
                            <option value="EXPIRED">EXPIRED</option>
                            <option value="REJECTED">REJECTED</option>
                            <option value="ARCHIVED">ARCHIVED</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="text-gray-900 font-medium">
                            {drive.creator?.displayName || "Organizer"}
                          </p>
                          <p className="text-[11px] text-gray-400">{drive.creator?.email}</p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span>{Math.round(drive.progress || 0)}%</span>
                          <span className="text-gray-400 ml-1">({drive.donorsCount} donors)</span>
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <Link
                              href={`/drives/${drive.id}`}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                              title="View public page"
                            >
                              <ExternalLink size={14} />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleOpenEditDrive(drive)}
                              className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"
                              title="Edit drive"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDrive(drive.id)}
                              disabled={busyId === drive.id}
                              className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                              title="Delete drive"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ORGANIZATIONS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === "orgs" && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={orgSearch}
                onChange={(e) => setOrgSearch(e.target.value)}
                placeholder="Search organizations by name, slug, location..."
                className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={orgVerifiedFilter}
                onChange={(e) => setOrgVerifiedFilter(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 focus:border-primary focus:outline-none"
              >
                <option value="ALL">All Orgs</option>
                <option value="VERIFIED">Verified Only</option>
                <option value="UNVERIFIED">Unverified Only</option>
              </select>

              <Button size="sm" onClick={() => setIsNewOrgModalOpen(true)}>
                <Plus size={14} className="mr-1" />
                Register Organization
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="border-b border-gray-100 bg-gray-50/70 font-semibold text-gray-700 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Organization</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Owner</th>
                    <th className="px-4 py-3">Drives</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrgs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        No organizations found.
                      </td>
                    </tr>
                  ) : (
                    filteredOrgs.map((org) => (
                      <tr key={org.id} className="hover:bg-gray-50/60 transition">
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          <div className="flex items-center gap-1.5">
                            <span>{org.name}</span>
                            {org.verified && <BadgeCheck size={14} className="text-primary" />}
                          </div>
                          {org.location && (
                            <span className="text-[11px] text-gray-400 font-normal">
                              📍 {org.location}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-500">/{org.slug}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleOrgVerified(org.id, org.verified)}
                            disabled={busyId === org.id}
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold transition ${
                              org.verified
                                ? "bg-blue-100 text-primary hover:bg-blue-200"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {org.verified ? "✓ Verified" : "Unverified (Click to Verify)"}
                          </button>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="text-gray-900">{org.owner?.displayName || "Owner"}</p>
                          <p className="text-[11px] text-gray-400">{org.owner?.email}</p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {org._count?.drives || 0} drives
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <Link
                              href={`/orgs/${org.slug}`}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                              title="View org page"
                            >
                              <ExternalLink size={14} />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleOpenEditOrg(org)}
                              className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"
                              title="Edit organization"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteOrg(org.id)}
                              disabled={busyId === org.id}
                              className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                              title="Delete organization"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: USERS & PERMISSIONS */}
      {/* ========================================================================= */}
      {activeTab === "users" && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search users by name or email..."
                className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 focus:border-primary focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="ORGANIZER">Organizer</option>
              <option value="VOLUNTEER">Volunteer</option>
            </select>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="border-b border-gray-100 bg-gray-50/70 font-semibold text-gray-700 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Drives Created</th>
                    <th className="px-4 py-3">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-400">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/60 transition">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="font-semibold text-gray-900">
                            {u.displayName || "User"}
                          </p>
                          <p className="text-[11px] text-gray-400">{u.email}</p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <select
                            value={u.role}
                            disabled={busyId === u.id}
                            onChange={(e) =>
                              handleRoleChange(u.id, e.target.value as Role)
                            }
                            className={`rounded-lg border px-2 py-1 text-xs font-semibold focus:outline-none ${
                              u.role === "ADMIN"
                                ? "border-purple-200 bg-purple-50 text-purple-800"
                                : u.role === "ORGANIZER"
                                ? "border-blue-200 bg-blue-50 text-primary"
                                : "border-gray-200 bg-gray-50 text-gray-700"
                            }`}
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="ORGANIZER">ORGANIZER</option>
                            <option value="VOLUNTEER">VOLUNTEER</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {u._count?.createdDrives || 0} campaigns
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-400">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: UPDATES & ACTIVITY MODERATION */}
      {/* ========================================================================= */}
      {activeTab === "updates" && (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-xs">
            <h2 className="text-base font-bold text-gray-900">Campaign Updates Moderation</h2>
            <p className="text-xs text-gray-500">
              Review and moderate updates posted by campaign organizers across all drives.
            </p>
          </div>

          <div className="space-y-3">
            {updates.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-sm text-gray-400">
                No campaign updates posted yet.
              </div>
            ) : (
              updates.map((up) => (
                <div
                  key={up.id}
                  className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs transition hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{up.title}</h3>
                      <p className="mt-1 text-xs text-gray-600 line-clamp-2">{up.body}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-gray-400">
                        <span>
                          Drive:{" "}
                          <Link
                            href={`/drives/${up.drive.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {up.drive.title}
                          </Link>
                        </span>
                        <span>•</span>
                        <span>Author: {up.author.displayName || up.author.email}</span>
                        <span>•</span>
                        <span>{new Date(up.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteUpdate(up.id)}
                      disabled={busyId === up.id}
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50 text-xs font-semibold"
                      title="Delete inappropriate update"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT DRIVE */}
      {/* ========================================================================= */}
      <Modal
        open={!!editingDrive}
        onClose={() => setEditingDrive(null)}
        title="Edit Campaign Details"
        maxWidth="max-w-2xl"
      >
        {editingDrive && (
          <form onSubmit={handleSaveDriveEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Title</label>
              <Input
                value={driveEditForm.title}
                onChange={(e) =>
                  setDriveEditForm((p: any) => ({ ...p, title: e.target.value }))
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                <select
                  value={driveEditForm.category}
                  onChange={(e) =>
                    setDriveEditForm((p: any) => ({ ...p, category: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={driveEditForm.status}
                  onChange={(e) =>
                    setDriveEditForm((p: any) => ({ ...p, status: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="FUNDED">FUNDED</option>
                  <option value="EXPIRED">EXPIRED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Location</label>
              <Input
                value={driveEditForm.location}
                onChange={(e) =>
                  setDriveEditForm((p: any) => ({ ...p, location: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Summary</label>
              <Input
                value={driveEditForm.summary}
                onChange={(e) =>
                  setDriveEditForm((p: any) => ({ ...p, summary: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                value={driveEditForm.description}
                onChange={(e) =>
                  setDriveEditForm((p: any) => ({ ...p, description: e.target.value }))
                }
                rows={4}
                className="w-full rounded-lg border border-gray-200 p-3 text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Progress (%)</label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={driveEditForm.progress}
                  onChange={(e) =>
                    setDriveEditForm((p: any) => ({ ...p, progress: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Donors Count</label>
                <Input
                  type="number"
                  min={0}
                  value={driveEditForm.donorsCount}
                  onChange={(e) =>
                    setDriveEditForm((p: any) => ({ ...p, donorsCount: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingDrive(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busyId === editingDrive.id}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: CREATE DRIVE (ADMIN) */}
      {/* ========================================================================= */}
      <Modal
        open={isNewDriveModalOpen}
        onClose={() => setIsNewDriveModalOpen(false)}
        title="Create Drive (Admin Mode)"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateDriveAdmin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Title *</label>
            <Input
              value={newDriveForm.title}
              onChange={(e) => setNewDriveForm((p) => ({ ...p, title: e.target.value }))}
              required
              minLength={3}
              placeholder="Campaign Title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Category *</label>
              <select
                value={newDriveForm.category}
                onChange={(e) =>
                  setNewDriveForm((p) => ({ ...p, category: e.target.value as Category }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
              <select
                value={newDriveForm.status}
                onChange={(e) =>
                  setNewDriveForm((p) => ({ ...p, status: e.target.value as Status }))
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="ACTIVE">ACTIVE (Published)</option>
                <option value="DRAFT">DRAFT (Pending)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Location</label>
            <Input
              value={newDriveForm.location}
              onChange={(e) => setNewDriveForm((p) => ({ ...p, location: e.target.value }))}
              placeholder="e.g., Cebu City or Online"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Short Summary</label>
            <Input
              value={newDriveForm.summary}
              onChange={(e) => setNewDriveForm((p) => ({ ...p, summary: e.target.value }))}
              placeholder="Brief summary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description *</label>
            <textarea
              value={newDriveForm.description}
              onChange={(e) =>
                setNewDriveForm((p) => ({ ...p, description: e.target.value }))
              }
              rows={4}
              className="w-full rounded-lg border border-gray-200 p-3 text-sm"
              required
              minLength={20}
              placeholder="Detailed explanation of the campaign..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Image URL</label>
            <Input
              type="url"
              value={newDriveForm.imageUrl}
              onChange={(e) => setNewDriveForm((p) => ({ ...p, imageUrl: e.target.value }))}
              placeholder="https://example.com/banner.jpg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNewDriveModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busyId === "new-drive"}>
              Create Drive
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: EDIT ORGANIZATION */}
      {/* ========================================================================= */}
      <Modal
        open={!!editingOrg}
        onClose={() => setEditingOrg(null)}
        title="Edit Organization Details"
        maxWidth="max-w-md"
      >
        {editingOrg && (
          <form onSubmit={handleSaveOrgEdit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Name</label>
              <Input
                value={orgEditForm.name}
                onChange={(e) =>
                  setOrgEditForm((p: any) => ({ ...p, name: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Website</label>
              <Input
                type="url"
                value={orgEditForm.website}
                onChange={(e) =>
                  setOrgEditForm((p: any) => ({ ...p, website: e.target.value }))
                }
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Location</label>
              <Input
                value={orgEditForm.location}
                onChange={(e) =>
                  setOrgEditForm((p: any) => ({ ...p, location: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                value={orgEditForm.description}
                onChange={(e) =>
                  setOrgEditForm((p: any) => ({ ...p, description: e.target.value }))
                }
                rows={3}
                className="w-full rounded-lg border border-gray-200 p-2.5 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="verifiedCheckbox"
                checked={orgEditForm.verified}
                onChange={(e) =>
                  setOrgEditForm((p: any) => ({ ...p, verified: e.target.checked }))
                }
                className="h-4 w-4 rounded border-gray-300 text-primary"
              />
              <label htmlFor="verifiedCheckbox" className="text-xs font-medium text-gray-700">
                Verified Organization badge
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingOrg(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busyId === editingOrg.id}>
                Save Organization
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: CREATE ORGANIZATION (ADMIN) */}
      {/* ========================================================================= */}
      <Modal
        open={isNewOrgModalOpen}
        onClose={() => setIsNewOrgModalOpen(false)}
        title="Register Organization"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateOrgAdmin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Organization Name *
            </label>
            <Input
              value={newOrgForm.name}
              onChange={(e) => {
                const name = e.target.value;
                setNewOrgForm((p) => ({
                  ...p,
                  name,
                  slug: p.slug ? p.slug : name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                }));
              }}
              required
              placeholder="e.g., Red Cross Cebu Chapter"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              URL Slug *
            </label>
            <Input
              value={newOrgForm.slug}
              onChange={(e) => setNewOrgForm((p) => ({ ...p, slug: e.target.value }))}
              required
              placeholder="red-cross-cebu"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Location</label>
            <Input
              value={newOrgForm.location}
              onChange={(e) => setNewOrgForm((p) => ({ ...p, location: e.target.value }))}
              placeholder="Cebu City, Philippines"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Website</label>
            <Input
              type="url"
              value={newOrgForm.website}
              onChange={(e) => setNewOrgForm((p) => ({ ...p, website: e.target.value }))}
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="newOrgVerifiedCheckbox"
              checked={newOrgForm.verified}
              onChange={(e) =>
                setNewOrgForm((p) => ({ ...p, verified: e.target.checked }))
              }
              className="h-4 w-4 rounded border-gray-300 text-primary"
            />
            <label htmlFor="newOrgVerifiedCheckbox" className="text-xs font-medium text-gray-700">
              Grant Verified status immediately
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNewOrgModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busyId === "new-org"}>
              Register Organization
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
