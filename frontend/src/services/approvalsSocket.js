import { io } from "socket.io-client";
import { getAuthTokenForRole } from "./authSession.js";
import { DOCUMENT_VAULT_BASE_URL } from "./documentVaultConfig.js";

export function connectApprovalsSocket(handlers) {
  const token = getAuthTokenForRole("admin");
  if (!token) {
    handlers?.onAuthMissing?.();
    return null;
  }

  const socket = io(DOCUMENT_VAULT_BASE_URL, {
    transports: ["websocket"],
    autoConnect: true,
    reconnection: true,
    auth: token ? { token } : undefined,
    extraHeaders: token ? { Authorization: `Bearer ${token}` } : undefined
  });

  socket.on("connect_error", (error) => {
    handlers?.onConnectError?.(error);
  });
  socket.on("connect", () => {
    handlers?.onConnect?.();
  });
  socket.on("disconnect", () => {
    handlers?.onDisconnect?.();
  });

  if (handlers?.onCreated) socket.on("certificate_created", handlers.onCreated);
  if (handlers?.onUpdated) socket.on("certificate_updated", handlers.onUpdated);
  if (handlers?.onDeleted) socket.on("certificate_deleted", handlers.onDeleted);
  if (handlers?.onStatusChanged) socket.on("certificate_status_changed", handlers.onStatusChanged);

  return socket;
}