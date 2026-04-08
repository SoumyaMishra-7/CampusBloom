import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "../services/api.js";
import { CURRENT_STUDENT, CURRENT_STUDENT_ID, initialCertificates, makeObjectPreview } from "./certificateSeed.js";

const STORAGE_KEY = "campusbloom.documentVault.certificates";
const SYNC_EVENT = "campusbloom:certificates-sync";
const CHANNEL_NAME = "campusbloom-certificates-sync";

const CertificatesContext = createContext(null);

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

function inferFileType(value) {
  const text = String(value || "").toLowerCase();
  if (text.includes("pdf")) return "PDF";
  if (text.includes("image") || text.includes("jpg") || text.includes("jpeg") || text.includes("png") || text.includes("webp")) return "Image";
  return "PDF";
}

function normalizeStatus(value) {
  const status = String(value || "pending").toLowerCase();
  if (status === "approved" || status === "rejected") return status;
  return "pending";
}

function normalizeCertificate(certificate) {
  const fileType = inferFileType(certificate.fileType || certificate.mimeType || certificate.fileName);
  return {
    ...certificate,
    id: String(certificate.id || createCertificateId()),
    studentId: certificate.studentId || CURRENT_STUDENT_ID,
    studentName: certificate.studentName || CURRENT_STUDENT.name,
    title: certificate.title || certificate.achievement || "Untitled certificate",
    description: certificate.description || certificate.notes || "",
    status: normalizeStatus(certificate.status),
    fileType,
    fileName: certificate.fileName || `${certificate.title || "certificate"}.${fileType === "PDF" ? "pdf" : "jpg"}`,
    uploadedAt: certificate.uploadedAt || new Date().toISOString(),
    updatedAt: certificate.updatedAt || certificate.uploadedAt || new Date().toISOString(),
    previewUrl: certificate.previewUrl || certificate.fileUrl || ""
  };
}

function hydrateList(value) {
  const list = Array.isArray(value) ? value : readLocalCertificates();
  return list.map(normalizeCertificate);
}

function buildFormPayload(input, existing) {
  const payload = {
    title: input.title?.trim() || existing?.title || "Untitled certificate",
    description: input.description?.trim() || existing?.description || "",
    studentId: input.studentId || existing?.studentId || CURRENT_STUDENT_ID,
    studentName: input.studentName || existing?.studentName || CURRENT_STUDENT.name,
    status: normalizeStatus(input.status || existing?.status),
    fileType: inferFileType(input.file?.type || input.file?.name || existing?.fileType),
    fileName: input.file?.name || existing?.fileName || "certificate.pdf"
  };

  if (input.file instanceof File) {
    payload.previewUrl = makeObjectPreview(input.file);
  }

  return payload;
}

export function CertificatesProvider({ children }) {
  const [certificates, setCertificates] = useState(() => hydrateList([]));
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("student");
  const [busyIds, setBusyIds] = useState([]);
  const channelRef = useRef(null);
  const socketRef = useRef(null);

  const setBusy = useCallback((id, isBusy) => {
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (isBusy) next.add(id);
      else next.delete(id);
      return Array.from(next);
    });
  }, []);

  const persist = useCallback((nextCertificates) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCertificates));
    } catch {
      // Ignore storage failures.
    }
  }, []);

  const publishSync = useCallback((nextCertificates, action, meta = {}) => {
    const payload = { certificates: nextCertificates, action, meta, updatedAt: Date.now() };

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: payload }));
    }

    if (channelRef.current) {
      channelRef.current.postMessage(payload);
    }

    if (socketRef.current?.connected) {
      socketRef.current.emit("certificates:sync", payload);
    }
  }, []);

  const applyNext = useCallback((nextCertificates, action, meta = {}) => {
    setCertificates(nextCertificates);
    persist(nextCertificates);
    publishSync(nextCertificates, action, meta);
  }, [persist, publishSync]);

  useEffect(() => {
    let mounted = true;

    apiGet("/certificates")
      .then((response) => {
        if (!mounted) return;
        const list = hydrateList(Array.isArray(response) ? response : response?.data || []);
        setCertificates(list.length ? list : hydrateList(readLocalCertificates()));
      })
      .catch(() => {
        if (!mounted) return;
        setCertificates(hydrateList(readLocalCertificates()));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return undefined;
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;

    const onMessage = (event) => {
      const payload = event.data;
      if (!payload?.certificates || !Array.isArray(payload.certificates)) return;
      setCertificates(hydrateList(payload.certificates));
      persist(hydrateList(payload.certificates));
    };

    channel.addEventListener("message", onMessage);
    return () => {
      channel.removeEventListener("message", onMessage);
      channel.close();
      channelRef.current = null;
    };
  }, [persist]);

  useEffect(() => {
    const onWindowSync = (event) => {
      const payload = event.detail;
      if (!payload?.certificates || !Array.isArray(payload.certificates)) return;
      setCertificates(hydrateList(payload.certificates));
      persist(hydrateList(payload.certificates));
    };

    window.addEventListener(SYNC_EVENT, onWindowSync);
    return () => window.removeEventListener(SYNC_EVENT, onWindowSync);
  }, [persist]);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL?.trim() || import.meta.env.VITE_API_BASE_URL?.trim();
    if (!socketUrl) return undefined;

    let active = true;
    import("socket.io-client")
      .then(({ io }) => {
        if (!active) return;
        const socket = io(socketUrl, {
          transports: ["websocket"],
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: 2
        });
        socketRef.current = socket;

        socket.on("certificates:sync", (payload) => {
          if (!payload?.certificates || !Array.isArray(payload.certificates)) return;
          setCertificates(hydrateList(payload.certificates));
          persist(hydrateList(payload.certificates));
        });
      })
      .catch(() => {
        // Socket.IO is optional; BroadcastChannel covers same-tab sync.
      });

    return () => {
      active = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [persist]);

  const refreshCertificates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGet("/certificates");
      const list = hydrateList(Array.isArray(response) ? response : response?.data || []);
      applyNext(list.length ? list : hydrateList(readLocalCertificates()), "refresh");
    } catch {
      applyNext(hydrateList(readLocalCertificates()), "refresh-fallback");
    } finally {
      setLoading(false);
    }
  }, [applyNext]);

  const createCertificate = useCallback(async (input) => {
    const tempId = `temp-${Date.now()}`;
    setBusy(tempId, true);

    const payload = buildFormPayload(input);
    const requestBody = input.file instanceof File ? (() => {
      const formData = new FormData();
      formData.append("title", payload.title);
      formData.append("description", payload.description);
      formData.append("studentId", payload.studentId);
      formData.append("studentName", payload.studentName);
      formData.append("status", payload.status);
      formData.append("fileType", payload.fileType);
      formData.append("fileName", payload.fileName);
      formData.append("file", input.file);
      return formData;
    })() : payload;

    try {
      const response = await apiPost("/certificates", requestBody);
      const created = normalizeCertificate({ ...payload, ...(response?.data || response || {}), id: response?.id || response?.data?.id || tempId });
      const next = [created, ...certificates];
      applyNext(next, "create", { id: created.id });
      return created;
    } catch {
      const created = normalizeCertificate({ ...payload, id: tempId });
      const next = [created, ...certificates];
      applyNext(next, "create-local", { id: created.id });
      return created;
    } finally {
      setBusy(tempId, false);
    }
  }, [applyNext, certificates, setBusy]);

  const updateCertificate = useCallback(async (id, input) => {
    const existing = certificates.find((certificate) => certificate.id === id);
    if (!existing) return null;

    setBusy(id, true);
    const nextPayload = buildFormPayload(input, existing);
    const requestBody = input.file instanceof File ? (() => {
      const formData = new FormData();
      Object.entries(nextPayload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, value);
      });
      formData.append("file", input.file);
      return formData;
    })() : nextPayload;

    try {
      const response = await apiPut(`/certificates/${id}`, requestBody);
      const updated = normalizeCertificate({ ...existing, ...nextPayload, ...(response?.data || response || {}), id });
      const next = certificates.map((certificate) => (certificate.id === id ? updated : certificate));
      applyNext(next, "update", { id });
      return updated;
    } catch {
      const fallback = normalizeCertificate({ ...existing, ...nextPayload, id });
      const next = certificates.map((certificate) => (certificate.id === id ? fallback : certificate));
      applyNext(next, "update-local", { id });
      return fallback;
    } finally {
      setBusy(id, false);
    }
  }, [applyNext, certificates, setBusy]);

  const removeCertificate = useCallback(async (id) => {
    const existing = certificates.find((certificate) => certificate.id === id);
    if (!existing) return null;

    setBusy(id, true);
    try {
      await apiDelete(`/certificates/${id}`);
    } catch {
      // Keep local delete so the UI remains responsive even if the backend is unavailable.
    }

    const next = certificates.filter((certificate) => certificate.id !== id);
    applyNext(next, "delete", { id });
    setBusy(id, false);
    return existing;
  }, [applyNext, certificates, setBusy]);

  const updateCertificateStatus = useCallback(async (id, status) => {
    const existing = certificates.find((certificate) => certificate.id === id);
    if (!existing) return null;

    setBusy(id, true);
    const normalizedStatus = status === "approved" ? "approved" : status === "rejected" ? "rejected" : "pending";

    try {
      const response = await apiPatch(`/certificates/${id}/status`, { status: normalizedStatus });
      const updated = normalizeCertificate({ ...existing, status: normalizedStatus, updatedAt: new Date().toISOString(), ...(response?.data || response || {}) });
      const next = certificates.map((certificate) => (certificate.id === id ? updated : certificate));
      applyNext(next, "status", { id, status: normalizedStatus });
      return updated;
    } catch {
      const fallback = normalizeCertificate({ ...existing, status: normalizedStatus, updatedAt: new Date().toISOString() });
      const next = certificates.map((certificate) => (certificate.id === id ? fallback : certificate));
      applyNext(next, "status-local", { id, status: normalizedStatus });
      return fallback;
    } finally {
      setBusy(id, false);
    }
  }, [applyNext, certificates, setBusy]);

  const value = useMemo(() => {
    const studentCertificates = certificates.filter((certificate) => certificate.studentId === CURRENT_STUDENT_ID);
    const adminCertificates = certificates;

    return {
      loading,
      userRole,
      setUserRole,
      certificates,
      studentCertificates,
      adminCertificates,
      currentStudent: CURRENT_STUDENT,
      busyIds,
      refreshCertificates,
      createCertificate,
      updateCertificate,
      removeCertificate,
      updateCertificateStatus,
      isBusy: (id) => busyIds.includes(id)
    };
  }, [busyIds, certificates, createCertificate, loading, refreshCertificates, removeCertificate, updateCertificate, updateCertificateStatus, userRole]);

  return <CertificatesContext.Provider value={value}>{children}</CertificatesContext.Provider>;
}

export function useCertificates() {
  const context = useContext(CertificatesContext);
  if (!context) {
    throw new Error("useCertificates must be used within a CertificatesProvider");
  }
  return context;
}
