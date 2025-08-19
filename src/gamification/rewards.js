export const REWARDS = [
  { day: 3,  type: "cosmetic",  title: "Sticker “Osito fit”",           payload: "sticker_osito_fit" },
  { day: 7,  type: "cosmetic",  title: "Armadura básica",               payload: "skin_armadura_1" },
  { day: 10, type: "cosmetic",  title: "Casco + espada",                payload: "skin_armadura_2" },
  { day: 14, type: "cosmetic",  title: "Armadura completa",             payload: "skin_armadura_3" },
  { day: 15, type: "content",   title: "Taller grabado: batch cooking", payload: { kind: "video", url: "#" } },
  { day: 18, type: "content",   title: "PDF Recetas rápidas",           payload: { kind: "pdf",   url: "#" } },
  { day: 21, type: "session",   title: "Invitación a Q&A grupal",       payload: { kind: "group", url: "#" } },
];

export const MILESTONES = REWARDS.map(r => r.day);

export function isMilestoneDay(day){
  return MILESTONES.includes(day);
}

export function rewardForStreak(streak){
  return REWARDS.find(r => r.day === streak) || null;
}
