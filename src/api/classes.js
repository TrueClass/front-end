import { request } from "./client";

export const getClasses = (institutionId) =>
  request(`/institution/${institutionId}/classes`).then(data => data.classes || []);

export const getClassItems = (institutionId, classId) =>
  request(`/institution/${institutionId}/classes/${classId}/items`);

export const createClass = (institutionId, data) =>
  request(`/institution/${institutionId}/classes`, { method: "POST", body: data });

export const enrollInClass = (institutionId, code) =>
  request(`/institution/${institutionId}/classes/enroll`, { method: "POST", body: { code } });
