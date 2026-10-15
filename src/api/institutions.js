import { request } from "./client";

export const listInstitutions = () =>
  request("/institution", { auth: false }).then(data => data.institutions || []);

export const registerStudent = (institutionId, email, password) =>
  request(`/institution/${institutionId}/student`, { method: "POST", body: { email, password }, auth: false });
