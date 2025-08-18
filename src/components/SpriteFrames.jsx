// src/components/SpriteFrames.jsx
import { useEffect, useState } from "react";

export default function SpriteFrames({
  frames, w = 64, h = 64, fps = 8, play = true, className = "",
  fallbackEmoji = "🐻"
}) {
  // Si no hay frames (aún no subes PNG), mostramos emoji animado
  if (!frames || frames.length === 0) {
    return (
      <div
        className={className}
        style={{
          width: w, height: h, display: "grid", placeItems: "center",
          fontSize: Math.min(w, h) * 0.8, filter: "drop-shadow(0 2px 4px rgba(0,0,0,.25))",
          animation: play ? "floatY 1.2s ease-in-out infinite" : "none",
        }}
      >
        <span style={{ lineHeight: 1 }}>{fallbackEmoji}</span>
      </div>
    );
  }

  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!play || frames.length <= 1) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % frames.length), 1000 / fps);
    return () => clearInterval(id);
  }, [frames, fps, play]);

  const src = frames[Math.min(idx, frames.length - 1)];
  return (
    <img
      src={src}
      width={w} height={h}
      className={className}
      alt="sprite"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
