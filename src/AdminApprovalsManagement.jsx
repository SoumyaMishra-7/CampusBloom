import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  changeCertificateStatus,
  clearRowHighlight,
  fetchApprovalsSnapshot,
  selectApprovalsFilters,
  selectApprovalsMeta,
  selectApprovalsStats,
  selectPagedQueue,
  setApprovalsFilters
} from "./store/approvalsSlice.js";

function formatDateTime(value) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatSyncTime(ts) {
  if (!ts) return "Not synced yet";
  return `Synced at ${new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;
}

function StatCard({ label, value, helper, accent }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <h3 className={`mt-2 text-2xl font-semibold tracking-tight ${accent}`}>{value}</h3>
      <p className="mt-1 text-xs text-slate-500">{helper}</p>
    </article>
  );
}

export default function AdminApprovalsManagementView() {
  const dispatch = useDispatch();
  const filters = useSelector(selectApprovalsFilters);
  const stats = useSelector(selectApprovalsStats);
  const { items, total, page, totalPages, pageSize } = useSelector(selectPagedQueue);
  const { loading, error, syncedAt, newlyAddedIds } = useSelector(selectApprovalsMeta);

  const [busyId, setBusyId] = useState("");
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState("");
  const [previewRow, setPreviewRow] = useState(null);

  useEffect(() => {
    dispatch(fetchApprovalsSnapshot());
  }, [dispatch]);

  useEffect(() => {
    if (!newlyAddedIds.length) return undefined;
    const timers = newlyAddedIds.map((id) =>
      window.setTimeout(() => dispatch(clearRowHighlight(id)), 3500)
    );
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [dispatch, newlyAddedIds]);

  const categoryOptions = useMemo(() => {
    const all = ["All", ...new Set(items.map((row) => row.category))];
    return all;
  }, [items]);

  const onStatusUpdate = async (id, status, remarks = "") => {
    setBusyId(id);
    try {
      await dispatch(changeCertificateStatus({ id, status, remarks })).unwrap();
      setPreviewRow((current) => (current?.id === id ? null : current));
      if (status === "rejected") {
        setRejectModal(null);
        setRejectRemarks("");
      }
    } finally {
      setBusyId("");
    }
  };

  const startIndex = total ? (page - 1) * pageSize + 1 : 0;
  const endIndex = Math.min(page * pageSize, total);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_0%_0%,rgba(15,118,110,0.08),transparent_38%),radial-gradient(circle_at_100%_0%,rgba(245,158,11,0.10),transparent_32%),linear-gradient(180deg,#f8fafc_0%,#ffffff_35%,#f8fafc_100%)] p-4 text-slate-900 sm:p-6">
      <section className="mx-auto w-full max-w-7xl space-y-6">
        <header className="rounded-3xl border border-white/70 bg-white/80 px-5 py-5 shadow-[0_16px_52px_rgba(15,23,42,0.08)] backdrop-blur sm:px-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-semibold tracking-tight">Approvals</h1>
                <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
                  Queue Alerts {stats.pending}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">Pending certificate uploads loaded from the Spring backend snapshot.</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <span>{formatSyncTime(syncedAt)}</span>
              <button
                type="button"
                onClick={() => dispatch(fetchApprovalsSnapshot())}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-700"
              >
                Refresh Snapshot
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Pending" value={stats.pending} helper="Awaiting admin action" accent="text-amber-600" />
          <StatCard label="Approved Today" value={stats.approvedToday} helper="Processed as approved" accent="text-emerald-600" />
          <StatCard label="Rejected Today" value={stats.rejectedToday} helper="Processed as rejected" accent="text-rose-600" />
          <StatCard
            label="Avg Approval Time"
            value={`${stats.avgApprovalTimeMinutes}m`}
            helper="Average for today's decisions"
            accent="text-teal-700"
          />
        </section>

        <section className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_42px_rgba(15,23,42,0.06)] sm:p-6">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Approval Queue</h2>
              <p className="text-sm text-slate-500">Showing {startIndex}-{endIndex} of {total} pending submissions</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={filters.search}
                onChange={(event) => dispatch(setApprovalsFilters({ search: event.target.value, page: 1 }))}
                placeholder="Search by student, title, category"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100 sm:w-72"
              />
              <select
                value={filters.category}
                onChange={(event) => dispatch(setApprovalsFilters({ category: event.target.value, page: 1 }))}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs uppercase tracking-[0.14em] text-slate-500">
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Achievement Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Submission Date</th>
                  <th className="px-4 py-3">Certificate Attached</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading ? (
                  Array.from({ length: pageSize }).map((_, index) => (
                    <tr key={`sk-${index}`}>
                      <td colSpan={7} className="px-4 py-4">
                        <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
                      </td>
                    </tr>
                  ))
                ) : items.length ? (
                  items.map((row) => (
                    <tr
                      key={row.id}
                      className={`transition ${newlyAddedIds.includes(row.id) ? "bg-emerald-50/70" : "hover:bg-slate-50"}`}
                    >
                      <td className="px-4 py-3 font-medium text-slate-800">{row.studentName}</td>
                      <td className="px-4 py-3 text-slate-700">{row.achievementTitle}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                          {row.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatDateTime(row.submissionDate)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${row.hasCertificate ? "bg-emerald-100 text-emerald-800 ring-emerald-200" : "bg-slate-100 text-slate-700 ring-slate-200"}`}>
                          {row.hasCertificate ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
                          Pending
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewRow(row)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:-translate-y-0.5 hover:border-teal-300 hover:text-teal-700"
                            aria-label={`View ${row.achievementTitle}`}
                            title="Quick view"
                          >
                            <EyeIcon />
                          </button>
                          <button
                            type="button"
                            onClick={() => onStatusUpdate(row.id, "approved")}
                            disabled={busyId === row.id}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectModal(row);
                              setRejectRemarks("");
                            }}
                            disabled={busyId === row.id}
                            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                      No pending submissions match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col gap-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>
              {error ? (
                <span className="text-rose-600">{error}</span>
              ) : (
                "Snapshot loaded from the Spring backend. Refresh after new student uploads."
              )}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => dispatch(setApprovalsFilters({ page: Math.max(1, page - 1) }))}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium transition hover:border-teal-300 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span>Page {page} / {totalPages}</span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => dispatch(setApprovalsFilters({ page: Math.min(totalPages, page + 1) }))}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium transition hover:border-teal-300 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </section>

      {rejectModal ? (
        <div className="fixed inset-0 z-50 grid place-items-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
            onClick={() => {
              if (busyId === rejectModal.id) return;
              setRejectModal(null);
              setRejectRemarks("");
            }}
            aria-label="Close rejection modal"
          />
          <div className="relative z-10 w-full max-w-lg rounded-[1.75rem] border border-white/70 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-600">Reject Certificate</p>
            <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-900">{rejectModal.achievementTitle}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Add optional remarks or feedback for {rejectModal.studentName}. This note will be stored with the rejection.
            </p>
            <label className="mt-4 grid gap-2 text-sm font-medium text-slate-700">
              Feedback / Remarks
              <textarea
                value={rejectRemarks}
                onChange={(event) => setRejectRemarks(event.target.value)}
                rows={5}
                placeholder="Explain why the certificate was rejected or what should be fixed."
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
              />
            </label>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (busyId === rejectModal.id) return;
                  setRejectModal(null);
                  setRejectRemarks("");
                }}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onStatusUpdate(rejectModal.id, "rejected", rejectRemarks)}
                disabled={busyId === rejectModal.id}
                className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(239,68,68,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busyId === rejectModal.id ? "Rejecting..." : "Reject Certificate"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {previewRow ? (
        <div className="fixed inset-0 z-50 grid place-items-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
            onClick={() => setPreviewRow(null)}
            aria-label="Close certificate preview"
          />
          <div className="relative z-10 grid w-full max-w-5xl gap-0 overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.22)] lg:grid-cols-[minmax(0,1.25fr)_360px]">
            <div className="border-b border-slate-200/80 bg-slate-50 p-4 lg:border-b-0 lg:border-r">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">Quick View</p>
                  <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-900">{previewRow.achievementTitle}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewRow(null)}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                >
                  Close
                </button>
              </div>
              <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
                {previewRow.fileUrl ? (
                  resolvePreviewKind(previewRow) === "image" ? (
                    <img src={previewRow.fileUrl} alt={previewRow.achievementTitle} className="max-h-[70vh] w-full object-contain" />
                  ) : (
                    <iframe src={previewRow.fileUrl} title={`${previewRow.achievementTitle} preview`} className="h-[72vh] w-full border-0" />
                  )
                ) : (
                  <div className="flex h-[72vh] items-center justify-center bg-gradient-to-br from-teal-50 to-amber-50 p-6 text-center text-slate-600">
                    <div>
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                        <EyeIcon />
                      </div>
                      <p className="mt-4 text-sm font-semibold text-slate-900">Preview unavailable</p>
                      <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
                        The current Spring backend stores certificate metadata for approvals, but it does not persist the uploaded file itself yet.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <aside className="grid gap-5 p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">Submission Details</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
                    Pending
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{previewRow.category}</span>
                </div>
              </div>

              <div className="rounded-[1.5rem] bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Student</p>
                <h4 className="mt-2 text-base font-semibold text-slate-900">{previewRow.studentName}</h4>
                <p className="mt-1 text-sm text-slate-600">Submitted {formatDateTime(previewRow.submissionDate)}</p>
              </div>

              <div className="rounded-[1.5rem] bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Reviewer Notes</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {previewRow.raw?.remarks || "No remarks added yet."}
                </p>
              </div>

              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={() => onStatusUpdate(previewRow.id, "approved")}
                  disabled={busyId === previewRow.id}
                  className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(5,150,105,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busyId === previewRow.id ? "Updating..." : "Approve Quickly"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRejectModal(previewRow);
                    setRejectRemarks("");
                  }}
                  disabled={busyId === previewRow.id}
                  className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Add Feedback & Reject
                </button>
              </div>
            </aside>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    </svg>
  );
}

function resolvePreviewKind(row) {
  const text = String(row?.raw?.type || row?.raw?.previewKind || "").toLowerCase();
  if (text.includes("image")) return "image";
  return "pdf";
}
