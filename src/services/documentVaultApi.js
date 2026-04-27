import { getAuthTokenForRole } from "./authSession.js";
import { DOCUMENT_VAULT_BASE_URL } from "./documentVaultConfig.js";

function formatApiError(responsePayload, fallbackMessage) {
  if (typeof responsePayload === "string" && responsePayload.trim()) {
    return responsePayload;
  }

  if (responsePayload && typeof responsePayload === "object") {
    if (typeof responsePayload.message === "string" && responsePayload.message.trim()) {
      return responsePayload.message;
    }

    if (Array.isArray(responsePayload.errors) && responsePayload.errors.length) {
      const first = responsePayload.errors[0];
      if (typeof first?.msg === "string" && first.msg.trim()) {
        return first.msg;
      }
    }
  }

  return fallbackMessage;
}

export async function requestDocumentVault(path, options = {}) {
  const tokenRole = options.tokenRole || "student";
  const token = options.token || getAuthTokenForRole(tokenRole);
  const requireAuth = options.requireAuth !== false;

  if (requireAuth && !token) {
    throw new Error("Authentication required. Please sign in again.");
  }

  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const isJsonBody = options.body !== undefined && options.body !== null && !isFormData && typeof options.body !== "string";

  const response = await fetch(`${DOCUMENT_VAULT_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    },
    body: isJsonBody ? JSON.stringify(options.body) : options.body
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(formatApiError(payload, "Document Vault request failed."));
  }

  return payload;
}

export function getDocumentVault(path, tokenRole) {
  return requestDocumentVault(path, { method: "GET", tokenRole });
}

export function postDocumentVault(path, body, tokenRole) {
  return requestDocumentVault(path, { method: "POST", body, tokenRole });
}

export function putDocumentVault(path, body, tokenRole) {
  return requestDocumentVault(path, { method: "PUT", body, tokenRole });
}

export function patchDocumentVault(path, body, tokenRole) {
  return requestDocumentVault(path, { method: "PATCH", body, tokenRole });
}

export function deleteDocumentVault(path, body, tokenRole) {
  return requestDocumentVault(path, { method: "DELETE", body, tokenRole });
}
