const DEFAULT_API_BASE_URL = "http://localhost:8080";

function resolveApiBaseUrl() {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  if (window.location.port === "8080") {
    return "";
  }

  return DEFAULT_API_BASE_URL;
}

const API_BASE_URL = resolveApiBaseUrl();

async function request(path, options = {}) {
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const isBlob = typeof Blob !== "undefined" && options.body instanceof Blob;
  const isJsonBody = options.body !== undefined && options.body !== null && !isFormData && !isBlob && typeof options.body !== "string";

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      ...(isFormData || isBlob ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {})
    },
    ...options,
    body: isJsonBody ? JSON.stringify(options.body) : options.body
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      (typeof payload === "object" && payload?.message) ||
      (typeof payload === "string" && payload) ||
      "Request failed";
    throw new Error(message);
  }

  return payload;
}

export function apiGet(path) {
  return request(path, { method: "GET" });
}

export function apiPost(path, body) {
  return request(path, {
    method: "POST",
    body
  });
}

export function apiPut(path, body) {
  return request(path, {
    method: "PUT",
    body
  });
}

export function apiPatch(path, body) {
  return request(path, {
    method: "PATCH",
    body
  });
}

export function apiDelete(path, body) {
  return request(path, {
    method: "DELETE",
    body
  });
}
