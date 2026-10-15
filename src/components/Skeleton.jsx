import React from "react";

export default function Skeleton({ variant = "line", count = 3 }) {
  return Array.from({ length: count }, (_, i) => (
    <div key={i} className={`skeleton skeleton--${variant}`} aria-hidden="true" />
  ));
}
