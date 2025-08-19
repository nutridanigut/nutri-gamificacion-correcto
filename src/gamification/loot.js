export const LOOT_POOL = [
  { id: "sticker_cafe", label: "Sticker: osito con café", type: "sticker" },
  { id: "sticker_run", label: "Sticker: osito corriendo", type: "sticker" },
  { id: "tip_hidratacion", label: "Tip: regla del 2-2-2", type: "tip" },
  { id: "tip_color", label: "Tip: arcoíris de verduras", type: "tip" },
  { id: "cos_hat", label: "Sombrero divertido", type: "cosmetic" },
  { id: "cos_glasses", label: "Gafas cool", type: "cosmetic" },
  { id: "badge_21", label: "Insignia 21", type: "badge" },
  { id: "tip_protein", label: "Tip: proteína en cada comida", type: "tip" },
];

export function shouldDropLoot(streak){
  return streak > 0 && streak % 3 === 0;
}

export function randomLoot(){
  return LOOT_POOL[Math.floor(Math.random() * LOOT_POOL.length)];
}
