export function toLocalISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const todayLocal = () => toLocalISODate(new Date());

export function getClassDates(startStr, endStr, frequency) {
  const dates = new Set();
  const start = new Date(startStr + "T00:00:00");
  const end = new Date(endStr + "T00:00:00");

  let current = new Date(start);
  if (frequency === "biweekly_b") current.setDate(current.getDate() + 7);

  const step = frequency === "weekly" ? 7 : 14;
  while (current <= end) {
    dates.add(toLocalISODate(current));
    current.setDate(current.getDate() + step);
  }
  return dates;
}

export function clickable(onActivate) {
  return {
    role: "button",
    tabIndex: 0,
    onClick: onActivate,
    onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onActivate(e);
      }
    },
  };
}

export const cx = (...classes) => classes.filter(Boolean).join(" ");
