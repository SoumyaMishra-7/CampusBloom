const DOCUMENT_VAULT_FALLBACK_URL = "http://127.0.0.1:4000";

function sanitizeBaseUrl(value) {
  const text = String(value || "").trim().replace(/\/$/, "");
  if (!text) return "";
  return text.replace("http://localhost:4000", "http://127.0.0.1:4000");
}

export function getDocumentVaultBaseUrl() {
  const configured =
    sanitizeBaseUrl(import.meta.env.VITE_DOCUMENT_VAULT_URL) ||
    sanitizeBaseUrl(import.meta.env.VITE_SOCKET_URL);

  return configured || DOCUMENT_VAULT_FALLBACK_URL;
}

export const DOCUMENT_VAULT_BASE_URL = getDocumentVaultBaseUrl();
