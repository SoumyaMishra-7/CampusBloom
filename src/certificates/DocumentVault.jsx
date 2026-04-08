import { useEffect, useMemo, useRef, useState } from "react";
import { CURRENT_STUDENT } from "./certificateSeed.js";
import { useCertificates } from "./CertificatesContext.jsx";

const STATUS_META = {
  pending: { label: "Pending", className: "bg-amber-100 text-amber-800 ring-amber-200", dot: "bg-amber-500" },
  approved: { label: "Approved", className: "bg-emerald-100 text-emerald-800 ring-emerald-200", dot: "bg-emerald-500" },
  rejected: { label: "Rejected", className: "bg-rose-100 text-rose-800 ring-rose-200", dot: "bg-rose-500" }
};

function fileTypeLabel(value) {
  const type = String(value || "").toLowerCase();
  if (type.includes("pdf")) return "PDF";
  if (type.includes("image") || type.includes("jpg") || type.includes("jpeg") || type.includes("png") || type.includes("webp")) return "Image";
  return "Document";
}

function prettyDate(value) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function getFileKind(file) {
  if (!file) return "PDF";
  const text = `${file.type || ""} ${file.name || ""}`.toLowerCase();
  return text.includes("pdf") ? "PDF" : "Image";
}

function certificateFileUrl(certificate) {
  return certificate.previewUrl || certificate.fileUrl || "";
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${meta.className}`}>
      <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 16V6" />
      <path d="m8.5 9.5 3.5-3.5 3.5 3.5" />
      <path d="M20 17v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M6 6l1 14h10l1-14" />
      <path d="M10 11v5M14 11v5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 shadow-sm">
      <div className="h-40 animate-pulse bg-slate-100" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-24 animate-pulse rounded-full bg-slate-100" />
        <div className="h-5 w-4/5 animate-pulse rounded-full bg-slate-100" />
        <div className="h-4 w-full animate-pulse rounded-full bg-slate-100" />
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="h-10 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-10 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

export default function DocumentVault({ role = "student" }) {
  const {
    loading,
    userRole,
    setUserRole,
    studentCertificates,
    adminCertificates,
    currentStudent,
    busyIds,
    createCertificate,
    updateCertificate,
    removeCertificate,
    updateCertificateStatus,
    refreshCertificates,
    isBusy
  } = useCertificates();

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [form, setForm] = useState({ title: "", description: "", file: null });
  const [editingId, setEditingId] = useState("");
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setUserRole(role);
  }, [role, setUserRole]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const certificates = role === "admin" ? adminCertificates : studentCertificates;

  const filteredCertificates = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = certificates.filter((certificate) => {
      const matchesQuery = !q || [certificate.title, certificate.description, certificate.studentName, certificate.fileName].join(" ").toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || certificate.status === statusFilter;
      return matchesQuery && matchesStatus;
    });

    filtered.sort((a, b) => {
      if (sortOrder === "oldest") return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return filtered;
  }, [certificates, query, sortOrder, statusFilter]);

  const statusCounts = useMemo(() => {
    const list = certificates;
    return {
      total: list.length,
      pending: list.filter((c) => c.status === "pending").length,
      approved: list.filter((c) => c.status === "approved").length,
      rejected: list.filter((c) => c.status === "rejected").length
    };
  }, [certificates]);

  const resetForm = () => {
    setForm({ title: "", description: "", file: null });
    setEditingId("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openCreateForm = () => {
    resetForm();
    setToast({ type: "info", title: "New certificate", text: "Add a title, description, and certificate file." });
  };

  const populateForm = (certificate) => {
    setEditingId(certificate.id);
    setForm({ title: certificate.title, description: certificate.description || "", file: null });
    setToast({ type: "info", title: "Edit mode", text: `${certificate.title} is ready for editing.` });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const notify = (title, text, type = "success") => setToast({ title, text, type });

  const submitForm = async (event) => {
    event.preventDefault();
    if (saving) return;

    const title = form.title.trim();
    const description = form.description.trim();
    if (!title) {
      notify("Title required", "Please add a certificate title.", "danger");
      return;
    }
    if (!editingId && !form.file) {
      notify("File required", "Upload a PDF or image certificate before saving.", "danger");
      return;
    }

    const existing = certificates.find((certificate) => certificate.id === editingId);
    const nextStatus = existing?.status === "rejected" ? "pending" : existing?.status || "pending";
    const payload = {
      title,
      description,
      file: form.file || undefined,
      status: nextStatus,
      studentId: currentStudent.id,
      studentName: currentStudent.name
    };

    setSaving(true);
    try {
      if (editingId) {
        await updateCertificate(editingId, payload);
        notify("Certificate updated", `${title} was updated successfully.`);
      } else {
        await createCertificate(payload);
        notify("Certificate uploaded", `${title} is now in your vault.`);
      }
      resetForm();
    } catch (error) {
      notify("Save failed", error.message || "Something went wrong.", "danger");
    } finally {
      setSaving(false);
    }
  };

  const onPickFile = (file) => {
    if (!file) return;
    setForm((prev) => ({
      ...prev,
      file,
      title: prev.title || file.name.replace(/\.[^.]+$/, ""),
      description: prev.description || "Uploaded certificate document"
    }));
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    onPickFile(file);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,rgba(79,70,229,0.08),transparent_28%),radial-gradient(circle_at_90%_0%,rgba(16,185,129,0.08),transparent_24%),linear-gradient(180deg,#f8fafc_0%,#ffffff_45%,#f8fafc_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-12 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <section className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur lg:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl text-center lg:text-left">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Document Vault</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-900 sm:text-4xl">Certificates Management</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                Securely upload, preview, edit, and manage certificates with role-based actions for students and admins.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[420px]">
              {[
                ["Total", statusCounts.total],
                ["Pending", statusCounts.pending],
                ["Approved", statusCounts.approved],
                ["Rejected", statusCounts.rejected]
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-200/80 bg-slate-50/90 px-4 py-3 text-center shadow-sm">
                  <div className="text-lg font-semibold text-slate-900">{value}</div>
                  <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <div className="grid gap-6">
            {role === "student" ? (
              <form
                onSubmit={submitForm}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                className={`rounded-[2rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)] backdrop-blur transition ${dragging ? "ring-4 ring-indigo-200" : ""}`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Student View</p>
                    <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">Upload or edit your certificate</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Drag and drop a PDF or image, then add the title and description. Approved items are locked from editing.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={openCreateForm}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-700"
                  >
                    <UploadIcon />
                    New Upload
                  </button>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Title
                    <input
                      value={form.title}
                      onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                      className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                      placeholder="Certificate title"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    File
                    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3">
                      <UploadIcon />
                      <div className="min-w-0 flex-1 text-sm text-slate-600">
                        <p className="truncate font-medium text-slate-900">{form.file ? form.file.name : "PDF or image file"}</p>
                        <p className="text-xs">Max 5MB recommended</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                      >
                        Choose
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,image/*"
                        hidden
                        onChange={(event) => onPickFile(event.target.files?.[0])}
                      />
                    </div>
                  </label>
                  <label className="md:col-span-2 grid gap-2 text-sm font-medium text-slate-700">
                    Description
                    <textarea
                      value={form.description}
                      onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                      rows={4}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                      placeholder="Add supporting details about the achievement"
                    />
                  </label>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    {editingId ? `Editing ${certificates.find((item) => item.id === editingId)?.title || "certificate"}` : "Ready to upload a new certificate"}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {editingId ? (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5"
                      >
                        Cancel
                      </button>
                    ) : null}
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(79,70,229,0.24)] transition hover:-translate-y-0.5 hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {saving ? "Saving..." : editingId ? "Save Changes" : "Upload Certificate"}
                    </button>
                  </div>
                </div>
              </form>
            ) : null}

            <div className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)] backdrop-blur">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Certificates</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">{role === "admin" ? "All student submissions" : `${currentStudent.name}'s documents`}</h2>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <span className="font-semibold text-slate-900">Search</span>
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Title, description, student"
                      className="w-44 bg-transparent text-sm outline-none placeholder:text-slate-400"
                    />
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  >
                    <option value="all">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <select
                    value={sortOrder}
                    onChange={(event) => setSortOrder(event.target.value)}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                  </select>
                  <button
                    type="button"
                    onClick={refreshCertificates}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-700"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)}
                </div>
              ) : (
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-2">
                  {filteredCertificates.map((certificate) => {
                    const meta = STATUS_META[certificate.status] || STATUS_META.pending;
                    const locked = role === "student" && certificate.status === "approved";
                    const fileUrl = certificateFileUrl(certificate);
                    const busy = isBusy(certificate.id);
                    const canEdit = role === "student" && certificate.status !== "approved";
                    const canDelete = role === "student" || role === "admin";

                    return (
                      <article key={certificate.id} className="group overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_54px_rgba(15,23,42,0.08)]">
                        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                          {fileUrl ? (
                            certificate.fileType === "Image" ? (
                              <img src={fileUrl} alt={certificate.title} className="h-full w-full object-cover" />
                            ) : (
                              <iframe src={fileUrl} title={`${certificate.title} preview`} className="h-full w-full border-0" />
                            )
                          ) : (
                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-50 to-emerald-50 px-6 text-center">
                              <div>
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200">
                                  <EyeIcon />
                                </div>
                                <p className="mt-4 text-sm font-semibold text-slate-900">{fileTypeLabel(certificate.fileType)} Preview</p>
                                <p className="mt-1 text-xs text-slate-500">{certificate.fileName}</p>
                              </div>
                            </div>
                          )}
                          <div className="absolute left-4 top-4 flex gap-2">
                            <StatusBadge status={certificate.status} />
                            {locked ? <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-white">Locked</span> : null}
                          </div>
                        </div>

                        <div className="space-y-4 p-5">
                          {role === "admin" ? (
                            <div>
                              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{certificate.studentName}</p>
                              <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-slate-900">{certificate.title}</h3>
                            </div>
                          ) : (
                            <div>
                              <h3 className="text-lg font-semibold tracking-[-0.03em] text-slate-900">{certificate.title}</h3>
                            </div>
                          )}

                          <p className="text-sm leading-6 text-slate-600">{certificate.description}</p>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">{fileTypeLabel(certificate.fileType)}</span>
                            <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">Updated {prettyDate(certificate.updatedAt)}</span>
                            {role === "admin" ? <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">{certificate.studentName}</span> : null}
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setPreview(certificate)}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-700"
                            >
                              <EyeIcon />
                              Preview
                            </button>

                            {role === "student" ? (
                              <>
                                <button
                                  type="button"
                                  disabled={!canEdit || busy}
                                  onClick={() => canEdit && populateForm(certificate)}
                                  className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${canEdit ? "border border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-700" : "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"}`}
                                >
                                  <PencilIcon />
                                  {certificate.status === "rejected" ? "Edit & Resubmit" : "Edit"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    populateForm(certificate);
                                    window.requestAnimationFrame(() => fileInputRef.current?.click());
                                  }}
                                  disabled={busy || certificate.status === "approved"}
                                  className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${certificate.status === "approved" ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400" : "border border-indigo-200 bg-indigo-50 text-indigo-700 hover:-translate-y-0.5 hover:bg-indigo-100"}`}
                                >
                                  <UploadIcon />
                                  {certificate.status === "rejected" ? "Resubmit" : "Replace File"}
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => updateCertificateStatus(certificate.id, "approved")}
                                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:-translate-y-0.5 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <CheckIcon />
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => updateCertificateStatus(certificate.id, "rejected")}
                                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:-translate-y-0.5 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <XIcon />
                                  Reject
                                </button>
                              </>
                            )}

                            {canDelete ? (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => setConfirmDelete(certificate)}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-rose-200 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <TrashIcon />
                                Delete
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    );
                  })}

                  {!filteredCertificates.length ? (
                    <div className="col-span-full rounded-[1.75rem] border border-dashed border-slate-300 bg-white/70 p-10 text-center text-slate-500">
                      No certificates match the current filters.
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          <aside className="grid gap-6 self-start lg:sticky lg:top-28">
            <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)] backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Realtime Sync</p>
                  <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em]">Instant updates across views</h3>
                </div>
                <button
                  type="button"
                  onClick={refreshCertificates}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-700"
                >
                  Sync Now
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p>Student uploads, edits, deletes, and admin approvals are mirrored through shared state and realtime listeners.</p>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-900">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span className="font-semibold">Connected</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Socket.IO connects automatically when <span className="font-semibold">VITE_SOCKET_URL</span> is configured; BroadcastChannel keeps the UI in sync in the browser.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)] backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Status Guide</p>
              <div className="mt-4 space-y-3">
                {Object.entries(STATUS_META).map(([status, meta]) => (
                  <div key={status} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                    <span className={`mt-1 h-2.5 w-2.5 rounded-full ${meta.dot}`} />
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{meta.label}</div>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {status === "pending" ? "Student can edit, replace the file, or delete it." : status === "approved" ? "Student can only delete; editing stays locked." : "Student can edit and resubmit after rejection."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {role === "admin" ? (
              <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)] backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Admin View</p>
                <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em]">Moderator actions</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Review every student submission, inspect previews, and approve or reject certificates in one place.
                </p>
              </section>
            ) : (
              <section className="rounded-[2rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)] backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Student View</p>
                <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em]">{CURRENT_STUDENT.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{CURRENT_STUDENT.department} portfolio documents.</p>
              </section>
            )}
          </aside>
        </section>
      </div>

      {preview ? (
        <div className="fixed inset-0 z-50 grid place-items-center px-4">
          <button type="button" className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={() => setPreview(null)} aria-label="Close preview" />
          <div className="relative z-10 grid w-full max-w-5xl gap-0 overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.22)] lg:grid-cols-[minmax(0,1.25fr)_360px]">
            <div className="border-b border-slate-200/80 bg-slate-50 p-4 lg:border-b-0 lg:border-r">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Preview</p>
                  <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-900">{preview.title}</h3>
                </div>
                <button type="button" onClick={() => setPreview(null)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                  Close
                </button>
              </div>
              <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
                {certificateFileUrl(preview) ? (
                  preview.fileType === "Image" ? (
                    <img src={certificateFileUrl(preview)} alt={preview.title} className="max-h-[70vh] w-full object-contain" />
                  ) : (
                    <iframe src={certificateFileUrl(preview)} title={`${preview.title} preview`} className="h-[72vh] w-full border-0" />
                  )
                ) : (
                  <div className="flex h-[72vh] items-center justify-center bg-gradient-to-br from-indigo-50 to-emerald-50 p-6 text-center text-slate-600">
                    <div>
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                        <EyeIcon />
                      </div>
                      <p className="mt-4 text-sm font-semibold text-slate-900">Preview unavailable</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <aside className="grid gap-5 p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Details</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge status={preview.status} />
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{prettyDate(preview.updatedAt)}</span>
                </div>
              </div>

              <div className="rounded-[1.5rem] bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Student</p>
                <h4 className="mt-2 text-base font-semibold text-slate-900">{preview.studentName}</h4>
                <p className="mt-1 text-sm text-slate-600">{preview.studentId}</p>
              </div>

              <div className="rounded-[1.5rem] bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Description</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{preview.description}</p>
              </div>

              <div className="rounded-[1.5rem] bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">File</p>
                <p className="mt-2 text-sm font-medium text-slate-900">{preview.fileName}</p>
                <p className="mt-1 text-xs text-slate-500">{fileTypeLabel(preview.fileType)}</p>
              </div>
            </aside>
          </div>
        </div>
      ) : null}

      {confirmDelete ? (
        <div className="fixed inset-0 z-50 grid place-items-center px-4">
          <button type="button" className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} aria-label="Close delete confirmation" />
          <div className="relative z-10 w-full max-w-md rounded-[1.75rem] border border-white/70 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-600">Delete Certificate</p>
            <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-900">Remove {confirmDelete.title}?</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This will permanently remove the certificate from the vault and sync the change instantly.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button type="button" onClick={() => setConfirmDelete(null)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await removeCertificate(confirmDelete.id);
                  setConfirmDelete(null);
                  notify("Certificate deleted", `${confirmDelete.title} was removed from the vault.`);
                }}
                className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(239,68,68,0.22)]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className={`fixed bottom-4 right-4 z-50 w-full max-w-sm rounded-2xl border px-4 py-3 shadow-[0_18px_48px_rgba(15,23,42,0.18)] ${toast.type === "danger" ? "border-rose-200 bg-rose-50 text-rose-700" : toast.type === "info" ? "border-slate-200 bg-white text-slate-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
          <p className="font-semibold">{toast.title}</p>
          <p className="mt-1 text-sm">{toast.text}</p>
        </div>
      ) : null}
    </div>
  );
}
