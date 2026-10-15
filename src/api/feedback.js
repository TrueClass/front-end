import { request } from "./client";

export const getRatings = (classItemId, page, limit) =>
  request(`/feedback/${classItemId}?limit=${limit}&page=${page}`);

export const postRating = (classItemId, value, content) =>
  request(`/feedback/${classItemId}`, { method: "POST", body: { value, content } });

export const setBoost = (ratingId, boosted) =>
  request(`/feedback/${ratingId}/boost`, boosted ? { method: "POST", body: {} } : { method: "DELETE" });
