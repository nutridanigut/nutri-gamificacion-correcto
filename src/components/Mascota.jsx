import { useMemo } from "react";
import { SPRITES, streakToStageKey } from "../gamification/spriteAssets";

export default function Mascota({
  streak = 0,
  size = 128,
  speed = 8,
  stageKey,
  className = "",
}) {
  const key = stageKey || streakToStageKey(streak);
  const sheet = useMemo(() => SPRITES[key], [key]);
  const style = {
    "--size": `${size}px`,
    "--speed": `${speed}s`,
    backgroundImage: `url(${sheet})`,
  };
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div className={`mascota-sprite ${className}`} style={style} aria-label="mascota" />
      {streak >= 21 && (
        <div
          className="chip"
          style={{ position: "absolute", top: -8, right: -8 }}
        >
          21
        </div>
      )}
    </div>
  );
}
