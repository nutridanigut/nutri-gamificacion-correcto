import Mascota from "./Mascota";

// Walker: moves the mascot along a track based on day progress percentage.
export default function Walker({ percent = 0, streak = 0, size = 64, speed = 1 }) {
  return (
    <div className="track">
      <div className="track-fill" style={{ width: `${percent}%` }} />
      <div className="walker" style={{ "--p": percent }}>
        <Mascota streak={streak} size={size} speed={speed} />
      </div>
    </div>
  );
}
