const DOCUMENT_VAULT_FALLBACK_URL = "https://campusbloom-backend.onrender.com";

function sanitizeBaseUrl(value) {
  const text = String(value || "").trim().replace(/\/$/, "");
  if (!text) return "";
  return text;
}

export function getDocumentVaultBaseUrl() {
  const configured =
    sanitizeBaseUrl(import.meta.env.VITE_DOCUMENT_VAULT_URL) ||
    sanitizeBaseUrl(import.meta.env.VITE_SOCKET_URL);

  return configured || DOCUMENT_VAULT_FALLBACK_URL;
}

export const DOCUMENT_VAULT_BASE_URL = getDocumentVaultBaseUrl();
