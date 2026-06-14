import { API_BASE } from "./constants";

let onUnauthorized = null;

export function configureApiFetch(handler) {
  onUnauthorized = handler;
}

export async function apiFetch(url, options = {}) {
  const opts = { credentials: "include", ...options };
  const res = await fetch(url, opts);

  if (res.status !== 401) return res;

  const refreshRes = await fetch(`${API_BASE}/authenticate`, { credentials: "include" });

  if (refreshRes.status === 401) {
    onUnauthorized?.();
    return res;
  }

  return fetch(url, opts);
}
