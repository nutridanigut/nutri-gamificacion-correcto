import evo1 from "../assets/sprites/evolution-1.png";
import evo2 from "../assets/sprites/evolution-2.png";
import evo3 from "../assets/sprites/evolution-3.png";
import evo4 from "../assets/sprites/evolution-4.png";
import evo5 from "../assets/sprites/evolution-5.png";
import evo6 from "../assets/sprites/evolution-6.png";
import evo7 from "../assets/sprites/evolution-7.png";

export const SPRITES = {
  "evolution-1": evo1,
  "evolution-2": evo2,
  "evolution-3": evo3,
  "evolution-4": evo4,
  "evolution-5": evo5,
  "evolution-6": evo6,
  "evolution-7": evo7,
};

// umbrales de racha → sprite
export const STAGE_THRESHOLDS = [3,7,10,14,15,18,21];

export function streakToStageKey(streak){
  if(streak >= 18) return "evolution-7";
  if(streak >= 15) return "evolution-6";
  if(streak >= 14) return "evolution-5";
  if(streak >= 10) return "evolution-4";
  if(streak >= 7) return "evolution-3";
  if(streak >= 3) return "evolution-2";
  return "evolution-1";
}
