import { useMemo } from "react";
import evo1 from "../assets/sprites/evolution-1.png";
import evo2 from "../assets/sprites/evolution-2.png";
import evo3 from "../assets/sprites/evolution-3.png";
import evo4 from "../assets/sprites/evolution-4.png";
import evo5 from "../assets/sprites/evolution-5.png";
import evo6 from "../assets/sprites/evolution-6.png";
import evo7 from "../assets/sprites/evolution-7.png";

/** Mapea racha → spritesheet */
function spriteForStreak(streak) {
  if (streak >= 21) return evo7;
  if (streak >= 18) return evo6;
  if (streak >= 14) return evo5;
  if (streak >= 10) return evo4;
  if (streak >= 7)  return evo3;
  if (streak >= 3)  return evo2;
  return evo1;
}

/**
 * Mascota animada con spritesheet 4x (256x64, frames 64x64)
 * Props:
 *  - streak: número de días de racha
 *  - size: tamaño de render (por defecto 128px)
 *  - speed: velocidad de animación (frames/seg, default 8)
 */
export default function Mascota({ streak = 0, size = 128, speed = 8, className = "" }) {
  const sheet = useMemo(() => spriteForStreak(streak), [streak]);

  // CSS variables para controlar animación y tamaño
  const style = {
    "--size": `${size}px`,
    "--speed": `${speed}s`, // 4 frames en bucle: 4/ fps ≈ duración; usamos segundos totales
    backgroundImage: `url(${sheet})`,
  };

  return <div className={`mascota-sprite ${className}`} style={style} aria-label="mascota" />;
}
