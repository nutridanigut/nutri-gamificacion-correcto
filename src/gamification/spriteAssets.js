// src/gamification/spriteAssets.js
// Imports of 4-frame horizontal sprites for each evolution stage.

import evo1 from "../assets/sprites/evolution-1.png";
import evo2 from "../assets/sprites/evolution-2.png";
import evo3 from "../assets/sprites/evolution-3.png";
import evo4 from "../assets/sprites/evolution-4.png";
import evo5 from "../assets/sprites/evolution-5.png";
import evo6 from "../assets/sprites/evolution-6.png";
import evo7 from "../assets/sprites/evolution-7.png";

// Map stage keys to sprite sheets. d15 reuses the stage of d14.
export const SPRITES = {
  base: evo1,
  d3: evo2,
  d7: evo3,
  d10: evo4,
  d14: evo5,
  d15: evo5, // no unique sprite, reuse previous
  d18: evo6,
  d21: evo7,
};
