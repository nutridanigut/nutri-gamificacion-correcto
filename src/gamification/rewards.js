// src/gamification/rewards.js

export const STAGE_THRESHOLDS = [3, 7, 10, 14, 15, 18, 21];

export function streakToStageKey(streak) {
  if (streak >= 21) return "d21";
  if (streak >= 18) return "d18";
  if (streak >= 15) return "d15";
  if (streak >= 14) return "d14";
  if (streak >= 10) return "d10";
  if (streak >= 7)  return "d7";
  if (streak >= 3)  return "d3";
  return "base";
}

// Recompensas por hitos (puedes editar los links más adelante)
export const REWARDS = [
  { day: 3,  type: "cosmetic",  title: "Sticker “Osito fit”",           payload: "sticker_osito_fit" },
  { day: 7,  type: "cosmetic",  title: "Armadura básica",               payload: "skin_armadura_1" },
  { day: 10, type: "cosmetic",  title: "Casco + espada",                payload: "skin_armadura_2" },
  { day: 14, type: "cosmetic",  title: "Armadura completa",             payload: "skin_armadura_3" },
  { day: 15, type: "content",   title: "Taller grabado: batch cooking", payload: { kind: "video", url: "#" } },
  { day: 18, type: "content",   title: "PDF Recetas rápidas",           payload: { kind: "pdf",   url: "#" } },
  { day: 21, type: "session",   title: "Invitación a Q&A grupal",       payload: { kind: "group", url: "#" } },
];

// Cofre sorpresa (pool simple)
export const LOOT_POOL = [
  { id: "tip_hidratacion", label: "Tip: regla del 2-2-2 (agua)", type: "tip" },
  { id: "sticker_cafe",    label: "Sticker: osito con café",     type: "sticker" },
  { id: "sticker_run",     label: "Sticker: osito corriendo",    type: "sticker" },
  { id: "tip_color",       label: "Tip: arcoíris de verduras",   type: "tip" },
];

export function randomLoot() {
  return LOOT_POOL[Math.floor(Math.random() * LOOT_POOL.length)];
}
