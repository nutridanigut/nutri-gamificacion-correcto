import { useMemo } from "react";
import { streakToStageKey } from "../gamification/rewards";
import { SPRITES } from "../gamification/spriteAssets";

/**
 * Mascota animada mediante spritesheet de 4 frames horizontales.
 * Props:
 *  - streak: número de días de racha
 *  - size: tamaño del sprite (px)
 *  - speed: duración de la animación en segundos
 */
export default function Mascota({ streak = 0, size = 128, speed = 1, className = "" }) {
  const sheet = useMemo(() => {
    const key = streakToStageKey(streak);
    return SPRITES[key] || SPRITES.base;
  }, [streak]);

  const style = {
    "--size": `${size}px`,
    "--speed": `${speed}s`,
    backgroundImage: `url(${sheet})`,
  };

  return <div className={`mascota-sprite ${className}`} style={style} aria-label="mascota" />;
}
