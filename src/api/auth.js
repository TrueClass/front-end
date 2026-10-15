import { request } from "./client";

export const login = (email, password) =>
  request("/login", { method: "POST", body: { email, password }, auth: false });

export const logout = () => request("/authenticate", { method: "DELETE", auth: false });

export const getMe = () => request("/me");
