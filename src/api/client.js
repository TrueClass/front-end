const API_BASE = import.meta.env.VITE_API_BASE || "https://api.joaobonin.com.br";

export class ApiError extends Error {
  constructor(status) {
    super(`HTTP ${status}`);
    this.status = status;
  }
}

let onUnauthorized = null;
let refreshPromise = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/authenticate`, { credentials: "include" })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

export async function request(path, { method = "GET", body, auth = true } = {}) {
  const options = { method, credentials: "include" };
  if (body !== undefined) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(body);
  }

  let res = await fetch(API_BASE + path, options);

  if (res.status === 401 && auth) {
    const refreshed = await refreshSession();
    if (refreshed.ok) res = await fetch(API_BASE + path, options);
    else onUnauthorized?.();
  }

  if (!res.ok) throw new ApiError(res.status);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
