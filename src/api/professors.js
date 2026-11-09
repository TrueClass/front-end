import { request } from "./client";

export const getCoordinatedProfessors = (institutionId) =>
  request(`/institution/${institutionId}/professor_by_coordinator`).then(data => data.professors || []);

export const getProfessorClasses = (institutionId, professorId) =>
  request(`/institution/${institutionId}/professor/${professorId}/classes`);

export const getProfessorFeedbacks = (institutionId, professorId, limit = 5) =>
  request(`/institution/${institutionId}/professor/${professorId}/feedbacks?limit=${limit}`);

export const getProfessorThemes = (institutionId, professorId) =>
  request(`/institution/${institutionId}/professor/${professorId}/themes`);

export const generateProfessorThemes = (institutionId, professorId) =>
  request(`/institution/${institutionId}/professor/${professorId}/themes`, { method: "POST", body: {} });
