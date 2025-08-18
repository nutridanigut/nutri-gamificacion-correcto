// src/gamification/spriteAssets.js

/**
 * Cuando tengas tus PNG de 64x64 por etapa (4 frames c/u),
 * descomenta e importa así:
 *
 * import base0 from "../assets/mascota/base_0.png";
 * import base1 from "../assets/mascota/base_1.png";
 * import base2 from "../assets/mascota/base_2.png";
 * import base3 from "../assets/mascota/base_3.png";
 *
 * export const FRAMES = {
 *   base: [base0, base1, base2, base3],
 *   d3:   [...],
 *   d7:   [...],
 *   d10:  [...],
 *   d14:  [...],
 *   d15:  [...],
 *   d18:  [...],
 *   d21:  [...],
 * };
 */

// Por ahora no usamos imágenes; devolvemos vacío y App
// caerá al "emoji sprite" como fallback.
export const FRAMES = {
  base: [],
  d3:   [],
  d7:   [],
  d10:  [],
  d14:  [],
  d15:  [],
  d18:  [],
  d21:  [],
};
