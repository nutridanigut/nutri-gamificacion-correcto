import Mascota from "./Mascota";
import { clamp } from "../utils/numbers";

export default function Walker({ percent = 0, streak = 0 }) {
  const p = clamp(percent, 0, 100);
  return (
    <div className="track" aria-label="progreso diario">
      <div className="track-fill" style={{ width: `${p}%` }} />
      <div className="walker" style={{ "--p": p }}>
        <Mascota streak={streak} size={64} />
      </div>
    </div>
  );
}
