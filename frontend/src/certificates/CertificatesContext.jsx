import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiGet, apiPatch, apiPost } from "../api.js";
import { CURRENT_STUDENT, CURRENT_STUDENT_ID, initialCertificates } from "./certificateSeed.js";

const STORAGE_KEY = "campusbloom.documentVault.certificates";

const CertificatesContext = createContext(null);

const capabilities = {
  canCreate: true,
  canEdit: false,
  canDelete: false,
  canModerate: true,
  hasRealtimeSync: false
};

function createCertificateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `cert-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readLocalCertificates() {
  if (typeof window === "undefined") return initialCertificates;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialCertificates;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length ? parsed : initialCertificates;
  } catch {
    return initialCertificates;
  }
}

function persistCertificates(nextCertificates) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCertificates));
  } catch {
    // Ignore storage failures.
  }
}

function inferFileType(value) {
  const text = String(value || "").toLowerCase();
  if (text.includes("pdf")) return "PDF";
  if (text.includes("image") || text.includes("jpg") || text.includes("jpeg") || text.includes("png") || text.includes("webp")) return "Image";
  return "PDF";
}

function normalizeStatus(value) {
  const status = String(value || "pending").toLowerCase();
  if (status === "verified" || status === "approved") return "approved";
  if (status === "rejected") return "rejected";
  return "pending";
}

function normalizeCertificate(certificate) {
  const normalizedId = String(certificate._id || certificate.id || createCertificateId());
  const fileType = inferFileType(certificate.fileType || certificate.type || certificate.mimeType || certificate.fileName);
  const title = certificate.title || certificate.achievement || "Untitled certificate";
  const uploadedAt = certificate.uploadedAt || certificate.createdAt || new Date().toISOString();

  return {
    ...certificate,
    _id: normalizedId,
    id: normalizedId,
    studentId: String(certificate.studentId || CURRENT_STUDENT_ID),
    studentName: certificate.studentName || CURRENT_STUDENT.name,
    title,
    description: certificate.description || certificate.remarks || "Uploaded certificate document",
    category: certificate.category || "General",
    fileUrl: certificate.fileUrl || certificate.previewUrl || "",
    status: normalizeStatus(certificate.status),
    fileType,
    fileName: certificate.fileName || `${title}.${fileType === "PDF" ? "pdf" : "jpg"}`,
    uploadedAt,
    createdAt: certificate.createdAt || uploadedAt,
    updatedAt: certificate.updatedAt || uploadedAt,
    approvedAt: certificate.approvedAt || null,
    rejectedAt: certificate.rejectedAt || null,
    previewUrl: certificate.previewUrl || certificate.fileUrl || ""
  };
}

function hydrateList(value) {
  const list = Array.isArray(value) ? value : readLocalCertificates();
  return list.map(normalizeCertificate);
}

function mapSpringCertificate(record) {
  return normalizeCertificate({
    id: record.id,
    title: record.title,
    description: record.remarks,
    category: record.category,
    fileType: record.type,
    fileName: `${record.title || "certificate"}.${String(record.type || "").toLowerCase() === "pdf" ? "pdf" : "jpg"}`,
    uploadedAt: record.uploadedAt,
    createdAt: record.uploadedAt,
    updatedAt: record.uploadedAt,
    status: record.status,
    achievementLink: record.achievementLink,
    previewKind: record.previewKind,
    fileUrl: record.fileUrl,
    previewUrl: record.fileUrl,
    studentId: CURRENT_STUDENT_ID,
    studentName: CURRENT_STUDENT.name
  });
}

async function fetchCertificatesFromSpring() {
  const response = await apiGet("/api/student/certificates");
  const list = Array.isArray(response) ? response : [];
  return list.map(mapSpringCertificate);
}

async function uploadCertificateToSpring(input) {
  const file = input.file instanceof File ? input.file : null;
  if (!file) {
    throw new Error("Certificate file is required");
  }

  const formData = new FormData();
  formData.append("title", (input.title || file.name || "Uploaded certificate").trim());
  formData.append("category", input.category?.trim() || "General");
  formData.append("description", input.description?.trim() || "Uploaded certificate document");
  formData.append("file", file);

  const response = await apiPost("/api/student/certificates/upload", formData);
  const created = mapSpringCertificate(response || {});

  created.fileName = file.name;
  created.fileType = inferFileType(file.type || file.name);

  if (input.description?.trim()) {
    created.description = input.description.trim();
  }

  if (input.category?.trim()) {
    created.category = input.category.trim();
  }

  return normalizeCertificate(created);
}

async function updateCertificateStatusInSpring(id, status, remarks = "") {
  const response = await apiPatch(`/api/student/certificates/${id}/status`, { status, remarks });
  return mapSpringCertificate(response || {});
}

export function CertificatesProvider({ children }) {
  const [certificates, setCertificates] = useState(() => hydrateList([]));
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("student");
  const [apiError, setApiError] = useState("");
  const [busyIds, setBusyIds] = useState([]);

  useEffect(() => {
    let mounted = true;

    fetchCertificatesFromSpring()
      .then((list) => {
        if (!mounted) return;
        const next = hydrateList(list);
        setApiError("");
        setCertificates(next.length ? next : hydrateList(readLocalCertificates()));
        persistCertificates(next.length ? next : hydrateList(readLocalCertificates()));
      })
      .catch((error) => {
        if (!mounted) return;
        setApiError(error.message || "Failed to load certificates.");
        setCertificates(hydrateList(readLocalCertificates()));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const setBusy = (id, isBusy) => {
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (isBusy) next.add(id);
      else next.delete(id);
      return Array.from(next);
    });
  };

  const refreshCertificates = async () => {
    setLoading(true);
    try {
      const list = hydrateList(await fetchCertificatesFromSpring());
      setApiError("");
      setCertificates(list.length ? list : hydrateList(readLocalCertificates()));
      persistCertificates(list.length ? list : hydrateList(readLocalCertificates()));
    } catch (error) {
      setApiError(error.message || "Failed to refresh certificates.");
      setCertificates(hydrateList(readLocalCertificates()));
    } finally {
      setLoading(false);
    }
  };

  const createCertificate = async (input) => {
    const tempId = `temp-${Date.now()}`;
    setBusy(tempId, true);

    try {
      const created = await uploadCertificateToSpring(input);
      const next = [created, ...certificates.filter((certificate) => certificate.id !== created.id)];
      setApiError("");
      setCertificates(next);
      persistCertificates(next);
      return created;
    } catch (error) {
      setApiError(error.message || "Upload failed.");
      throw error;
    } finally {
      setBusy(tempId, false);
    }
  };

  const updateCertificateStatus = async (id, status, remarks = "") => {
    setBusy(id, true);
    try {
      const updated = normalizeCertificate(await updateCertificateStatusInSpring(id, status, remarks));
      const next = certificates.map((certificate) => (certificate.id === id ? updated : certificate));
      setApiError("");
      setCertificates(next);
      persistCertificates(next);
      return updated;
    } catch (error) {
      setApiError(error.message || "Status update failed.");
      throw error;
    } finally {
      setBusy(id, false);
    }
  };

  const unsupportedMutation = () => {
    throw new Error("This action is not available on the Spring backend yet.");
  };

  const value = useMemo(() => {
    const studentCertificates = certificates.filter((certificate) => String(certificate.studentId) === String(CURRENT_STUDENT_ID));
    const adminCertificates = certificates;

    return {
      loading,
      apiError,
      userRole,
      setUserRole,
      certificates,
      studentCertificates,
      adminCertificates,
      currentStudent: CURRENT_STUDENT,
      busyIds,
      refreshCertificates,
      createCertificate,
      updateCertificate: unsupportedMutation,
      removeCertificate: unsupportedMutation,
      updateCertificateStatus,
      isBusy: (id) => busyIds.includes(id),
      capabilities
    };
  }, [apiError, busyIds, certificates, loading, userRole]);

  return <CertificatesContext.Provider value={value}>{children}</CertificatesContext.Provider>;
}

export function useCertificates() {
  const context = useContext(CertificatesContext);
  if (!context) {
    throw new Error("useCertificates must be used within a CertificatesProvider");
  }
  return context;
}
