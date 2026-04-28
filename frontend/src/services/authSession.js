const TOKEN_KEYS = {
  admin: "cb.admin.authToken",
  student: "cb.authToken",
  fallback: "authToken",
  legacy: "token"
};

function parseJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;

  try {
    const normalized = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    const payload = JSON.parse(atob(padded));
    return payload && typeof payload === "object" ? payload : null;
  } catch {
    return null;
  }
}

function getRoleTokenKey(role) {
  return role === "admin" ? TOKEN_KEYS.admin : TOKEN_KEYS.student;
}

export function getAuthTokenForRole(role) {
  if (typeof window === "undefined") return "";

  const local = window.localStorage;
  if (role === "admin") {
    return (
      local.getItem(TOKEN_KEYS.admin) ||
      local.getItem(TOKEN_KEYS.fallback) ||
      local.getItem(TOKEN_KEYS.legacy) ||
      ""
    );
  }
  if (role === "student") {
    return (
      local.getItem(TOKEN_KEYS.student) ||
      local.getItem(TOKEN_KEYS.fallback) ||
      local.getItem(TOKEN_KEYS.legacy) ||
      ""
    );
  }

  return (
    local.getItem(TOKEN_KEYS.fallback) ||
    local.getItem(TOKEN_KEYS.admin) ||
    local.getItem(TOKEN_KEYS.student) ||
    local.getItem(TOKEN_KEYS.legacy) ||
    ""
  );
}

export function getAnyAuthToken() {
  return getAuthTokenForRole("");
}

export function getAuthUserFromToken(role) {
  const token = getAuthTokenForRole(role);
  const payload = parseJwtPayload(token);
  if (!payload) return null;

  return {
    id: String(payload.sub || payload.userId || payload.id || ""),
    role: String(payload.role || role || "").toLowerCase(),
    name: payload.name || payload.fullName || payload.username || "",
    email: payload.email || "",
    raw: payload
  };
}

function extractTokenCandidate(response) {
  if (!response || typeof response !== "object") return "";

  const tokenCandidates = [
    response.token,
    response.accessToken,
    response.jwtToken,
    response.jwt,
    response.authToken,
    response.access_token,
    response.id_token,
    response?.data?.data?.token,
    response?.data?.data?.accessToken,
    response?.data?.data?.jwtToken,
    response?.data?.token,
    response?.data?.accessToken,
    response?.data?.jwtToken,
    response?.data?.jwt,
    response?.data?.authToken,
    response?.result?.token,
    response?.result?.accessToken,
    response?.result?.jwtToken
  ];

  return tokenCandidates.find((candidate) => typeof candidate === "string" && candidate.trim()) || "";
}

export function persistAuthTokenFromResponse(response, role) {
  if (typeof window === "undefined") return "";
  const token = extractTokenCandidate(response).trim();
  const roleKey = getRoleTokenKey(role);
  if (token) {
    window.localStorage.setItem(roleKey, token);
    window.localStorage.setItem(TOKEN_KEYS.fallback, token);
    window.localStorage.setItem(TOKEN_KEYS.legacy, token);
    return token;
  }

  window.localStorage.setItem(TOKEN_KEYS.legacy, "true");
  return token;
}
