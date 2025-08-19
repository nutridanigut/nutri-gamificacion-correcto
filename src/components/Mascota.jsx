import { useEffect, useMemo, useState } from "react";
import { streakToStageKey } from "../gamification/rewards";

const useBadges = import.meta.env.VITE_USE_BADGES_INSTEAD_OF_SPRITES === "true";

/**
 * Mascota animada mediante spritesheet de 4 frames horizontales.
 * Props:
 *  - streak: número de días de racha
 *  - size: tamaño del sprite (px)
 *  - speed: duración de la animación en segundos
 */
export default function Mascota({ streak = 0, size = 128, speed = 1, className = "" }) {
  const [sprites, setSprites] = useState(null);

  useEffect(() => {
    if (!useBadges) {
      import("../gamification/spriteAssets").then((m) => setSprites(m.SPRITES));
    }
  }, []);

  const sheet = useMemo(() => {
    if (useBadges || !sprites) return null;
    const key = streakToStageKey(streak);
    return sprites[key] || sprites.base;
  }, [streak, sprites]);

  if (useBadges) {
    return <div className={`mascota-badge ${className}`} aria-label="mascota">🐻</div>;
  }

  if (!sheet) return null;

  const style = {
    "--size": `${size}px`,
    "--speed": `${speed}s`,
    backgroundImage: `url(${sheet})`,
  };

  return <div className={`mascota-sprite ${className}`} style={style} aria-label="mascota" />;
}
