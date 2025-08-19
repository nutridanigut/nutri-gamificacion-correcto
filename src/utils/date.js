// src/utils/date.js
export const todayKey  = () => new Date().toDateString();
export const todayIdx  = () => new Date().getDay();
export const WEEK_LABELS = ["D", "L", "M", "M", "J", "V", "S"];

export const hhmmToMin = (t) => {
  const [h, m] = String(t).split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
};
